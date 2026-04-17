'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatAED } from '@/lib/currency';

export default function CashflowChart({ data }: { data: { month: string; amount: number }[] }) {
  if (!data.length) return <div className="text-sm text-slate-500 bg-white rounded-2xl p-6 text-center">No cashflow data yet.</div>;
  return (
    <div className="w-full h-64 bg-white rounded-2xl p-3">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="month" fontSize={11} />
          <YAxis fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
          <Tooltip formatter={(v: number) => formatAED(v)} />
          <Bar dataKey="amount" fill="#0f172a" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
