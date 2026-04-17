'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Shell from '@/components/Shell';
import CashflowChart from '@/components/CashflowChart';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatAED, monthKey, monthLabel } from '@/lib/currency';

export default function Cashflow() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [chart, setChart] = useState<{ month: string; amount: number }[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('payment_schedules')
        .select('amount,due_date,status').neq('status', 'paid').order('due_date');
      const byMonth: Record<string, number> = {};
      let t = 0;
      (data ?? []).forEach(p => {
        const k = monthKey(p.due_date);
        byMonth[k] = (byMonth[k] ?? 0) + Number(p.amount);
        t += Number(p.amount);
      });
      setChart(Object.keys(byMonth).sort().map(k => ({ month: monthLabel(k), amount: byMonth[k] })));
      setTotal(t);
      setLoading(false);
    })();
  }, []);

  return (
    <Shell title="Cashflow">
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4">
            <div className="text-xs text-slate-500">Total Outstanding</div>
            <div className="font-bold text-xl">{formatAED(total)}</div>
          </div>
          <CashflowChart data={chart} />
          {chart.length > 0 && (
            <div className="bg-white rounded-2xl p-4 space-y-2">
              {chart.map(c => (
                <div key={c.month} className="flex justify-between text-sm">
                  <span>{c.month}</span>
                  <span className="font-medium">{formatAED(c.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}
