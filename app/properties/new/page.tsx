'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Shell from '@/components/Shell';
import { generateMilestones } from '@/lib/templates';
import type { PaymentPlanTemplate } from '@/types';

type Milestone = { milestone: string; due_date: string; amount: number };

export default function NewProperty() {
  const supabase = createClient();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [err, setErr] = useState('');
  const [extractedMilestones, setExtractedMilestones] = useState<Milestone[] | null>(null);
  const [form, setForm] = useState({
    project_name: '', developer: '', unit_number: '',
    purchase_price: '', payment_plan_type: '80/20' as PaymentPlanTemplate,
    expected_handover: ''
  });

  const handleFile = async (file: File) => {
    setExtracting(true); setErr('');
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve((r.result as string).split(',')[1]);
        r.onerror = () => reject(new Error('Read failed'));
        r.readAsDataURL(file);
      });

      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_type: file.type, data })
      });

      if (!res.ok) throw new Error((await res.json()).error ?? 'Extraction failed');
      const d = await res.json();

      setForm(f => ({
        ...f,
        project_name: d.project_name ?? f.project_name,
        developer: d.developer ?? f.developer,
        unit_number: d.unit_number ?? f.unit_number,
        purchase_price: d.purchase_price ? String(d.purchase_price) : f.purchase_price,
        payment_plan_type: (d.payment_plan_type as PaymentPlanTemplate) ?? f.payment_plan_type,
        expected_handover: d.expected_handover ?? f.expected_handover
      }));

      if (Array.isArray(d.milestones) && d.milestones.length > 0) {
        setExtractedMilestones(d.milestones);
      }
    } catch (e: any) {
      setErr(e.message ?? 'Could not read file');
    } finally {
      setExtracting(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr('');

    const price = Number(form.purchase_price);
    const { data: prop, error } = await supabase.from('properties').insert({
      project_name: form.project_name,
      developer: form.developer || null,
      unit_number: form.unit_number || null,
      purchase_price: price,
      payment_plan_type: form.payment_plan_type,
      expected_handover: form.expected_handover || null
    }).select().single();

    if (error || !prop) { setErr(error?.message ?? 'Error'); setSaving(false); return; }

    const milestones = extractedMilestones && extractedMilestones.length > 0
      ? extractedMilestones
      : (form.expected_handover && price > 0
        ? generateMilestones(form.payment_plan_type, price, form.expected_handover)
        : []);

    if (milestones.length > 0) {
      await supabase.from('payment_schedules').insert(
        milestones.map(m => ({ ...m, property_id: prop.id, status: 'upcoming' }))
      );
    }

    router.push(`/properties/${prop.id}`);
  };

  const input = 'w-full border border-slate-200 rounded-xl px-4 py-3';

  return (
    <Shell title="New Property">
      <div className="space-y-4">
        <label className="block bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-2xl p-5 cursor-pointer">
          <input
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            disabled={extracting}
          />
          <div className="flex items-center gap-3">
            <div className="text-3xl">✨</div>
            <div className="flex-1">
              <div className="font-semibold">
                {extracting ? 'Reading your offer...' : 'Upload Sales Offer'}
              </div>
              <div className="text-xs opacity-80 mt-0.5">
                {extracting
                  ? 'Extracting property details and payment plan'
                  : 'PDF or image · we\'ll auto-fill everything'}
              </div>
            </div>
            {extracting && (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
          </div>
        </label>

        {extractedMilestones && (
          <div className="bg-green-50 text-green-800 rounded-xl p-3 text-sm">
            ✓ Extracted {extractedMilestones.length} payment milestone{extractedMilestones.length > 1 ? 's' : ''} from your document
          </div>
        )}

        <form onSubmit={submit} className="space-y-3 bg-white rounded-2xl p-4">
          <input required className={input} placeholder="Project Name"
            value={form.project_name} onChange={e => setForm({ ...form, project_name: e.target.value })} />
          <input className={input} placeholder="Developer"
            value={form.developer} onChange={e => setForm({ ...form, developer: e.target.value })} />
          <input className={input} placeholder="Unit Number"
            value={form.unit_number} onChange={e => setForm({ ...form, unit_number: e.target.value })} />
          <input required type="number" min="0" step="any" className={input} placeholder="Purchase Price (AED)"
            value={form.purchase_price} onChange={e => setForm({ ...form, purchase_price: e.target.value })} />
          <div>
            <label className="block text-xs text-slate-500 mb-1">Payment Plan Template</label>
            <select className={input} value={form.payment_plan_type}
              onChange={e => setForm({ ...form, payment_plan_type: e.target.value as PaymentPlanTemplate })}>
              <option value="80/20">80/20</option>
              <option value="70/30">70/30</option>
              <option value="60/40">60/40</option>
              <option value="Post Handover">Post Handover</option>
            </select>
            {extractedMilestones && (
              <div className="text-xs text-slate-500 mt-1">
                Template is ignored — using extracted milestones
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Expected Handover</label>
            <input type="date" className={input}
              value={form.expected_handover} onChange={e => setForm({ ...form, expected_handover: e.target.value })} />
          </div>
          {err && <div className="text-red-600 text-sm">{err}</div>}
          <button disabled={saving} className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Property'}
          </button>
        </form>
      </div>
    </Shell>
  );
}