'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Shell from '@/components/Shell';
import CashflowChart from '@/components/CashflowChart';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatAED, monthKey, monthLabel } from '@/lib/currency';

export default function Dashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [upcoming, setUpcoming] = useState(0);
  const [next6, setNext6] = useState(0);
  const [next12, setNext12] = useState(0);
  const [chart, setChart] = useState<{ month: string; amount: number }[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data: props, error: e1 } = await supabase.from('properties').select('purchase_price');
        if (e1) throw e1;
        setTotalValue((props ?? []).reduce((s, p) => s + Number(p.purchase_price), 0));

        const { data: pays, error: e2 } = await supabase.from('payment_schedules')
          .select('amount,due_date,status').order('due_date');
        if (e2) throw e2;

        const now = new Date();
        const in6 = new Date(); in6.setMonth(now.getMonth() + 6);
        const in12 = new Date(); in12.setMonth(now.getMonth() + 12);

        let up = 0, s6 = 0, s12 = 0;
        const byMonth: Record<string, number> = {};
        (pays ?? []).forEach(p => {
          const d = new Date(p.due_date);
          const amt = Number(p.amount);
          if (p.status !== 'paid' && d >= now) up += amt;
          if (d >= now && d <= in6 && p.status !== 'paid') s6 += amt;
          if (d >= now && d <= in12 && p.status !== 'paid') s12 += amt;
          if (p.status !== 'paid') {
            const k = monthKey(p.due_date);
            byMonth[k] = (byMonth[k] ?? 0) + amt;
          }
        });
        setUpcoming(up); setNext6(s6); setNext12(s12);
        setChart(Object.keys(byMonth).sort().slice(0, 12).map(k => ({ month: monthLabel(k), amount: byMonth[k] })));
      } catch (e: any) {
        setErr(e.message ?? 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Shell title="Dashboard">
      {loading ? <LoadingSpinner /> : err ? (
        <div className="bg-red-50 text-red-700 rounded-2xl p-4 text-sm">{err}</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card label="Portfolio Value" value={formatAED(totalValue)} />
            <Card label="Upcoming Payments" value={formatAED(upcoming)} />
            <Card label="Next 6 Months" value={formatAED(next6)} />
            <Card label="Next 12 Months" value={formatAED(next12)} />
          </div>
          <div>
            <h2 className="font-semibold mb-2">Cashflow</h2>
            <CashflowChart data={chart} />
          </div>
        </div>
      )}
    </Shell>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-bold text-lg mt-1">{value}</div>
    </div>
  );
}
