'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Shell from '@/components/Shell';
import PaymentTable from '@/components/PaymentTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatAED } from '@/lib/currency';
import type { Property, PaymentSchedule, PaymentStatus, PropertyOwner } from '@/types';

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const router = useRouter();
  const [prop, setProp] = useState<Property | null>(null);
  const [owners, setOwners] = useState<PropertyOwner[]>([]);
  const [pays, setPays] = useState<PaymentSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMs, setNewMs] = useState({ milestone: '', due_date: '', amount: '' });
  const [err, setErr] = useState('');

  const load = async () => {
    const [{ data: p }, { data: o }, { data: ps }] = await Promise.all([
      supabase.from('properties').select('*').eq('id', id).single(),
      supabase.from('property_owners').select('*').eq('property_id', id),
      supabase.from('payment_schedules').select('*').eq('property_id', id).order('due_date')
    ]);
    setProp(p); setOwners(o ?? []); setPays(ps ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const addMs = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    const { error } = await supabase.from('payment_schedules').insert({
      property_id: id,
      milestone: newMs.milestone,
      due_date: newMs.due_date,
      amount: Number(newMs.amount),
      status: 'upcoming'
    });
    if (error) { setErr(error.message); return; }
    setNewMs({ milestone: '', due_date: '', amount: '' });
    load();
  };

  const updateStatus = async (pid: string, status: PaymentStatus) => {
    await supabase.from('payment_schedules').update({ status }).eq('id', pid);
    load();
  };

  const deleteMs = async (pid: string) => {
    await supabase.from('payment_schedules').delete().eq('id', pid);
    load();
  };

  const del = async () => {
    if (!confirm('Delete this property?')) return;
    await supabase.from('properties').delete().eq('id', id);
    router.push('/properties');
  };

  if (loading) return <Shell title="Property"><LoadingSpinner /></Shell>;
  if (!prop) return <Shell title="Property"><div className="bg-white p-6 rounded-2xl">Not found.</div></Shell>;

  const input = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm';

  return (
    <Shell title={prop.project_name}>
      <div className="space-y-5">
        <section className="bg-white rounded-2xl p-4 space-y-2">
          <Row label="Developer" value={prop.developer ?? '—'} />
          <Row label="Unit" value={prop.unit_number ?? '—'} />
          <Row label="Purchase Price" value={formatAED(prop.purchase_price)} />
          <Row label="Payment Plan" value={prop.payment_plan_type ?? '—'} />
          <Row label="Handover" value={prop.expected_handover ? new Date(prop.expected_handover).toLocaleDateString() : '—'} />
        </section>

        <section>
          <h2 className="font-semibold mb-2">Owners</h2>
          <div className="bg-white rounded-2xl p-4 space-y-1 text-sm">
            {owners.length === 0 ? <div className="text-slate-500">No owners.</div> :
              owners.map(o => (
                <div key={o.id} className="flex justify-between">
                  <span>{o.role ?? 'owner'}</span><span>{o.ownership_percentage}%</span>
                </div>
              ))}
          </div>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Payment Schedule</h2>
          <PaymentTable rows={pays} onStatusChange={updateStatus} onDelete={deleteMs} />
          <form onSubmit={addMs} className="bg-white rounded-2xl p-3 mt-3 space-y-2">
            <input required className={input} placeholder="Milestone"
              value={newMs.milestone} onChange={e => setNewMs({ ...newMs, milestone: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input required type="date" className={input}
                value={newMs.due_date} onChange={e => setNewMs({ ...newMs, due_date: e.target.value })} />
              <input required type="number" min="0" step="any" className={input} placeholder="Amount"
                value={newMs.amount} onChange={e => setNewMs({ ...newMs, amount: e.target.value })} />
            </div>
            {err && <div className="text-red-600 text-xs">{err}</div>}
            <button className="w-full bg-slate-900 text-white py-2 rounded-xl text-sm">Add Milestone</button>
          </form>
        </section>

        <button onClick={del} className="w-full text-red-600 text-sm py-2">Delete Property</button>
      </div>
    </Shell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
