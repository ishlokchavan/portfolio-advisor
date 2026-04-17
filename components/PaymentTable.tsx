'use client';
import { formatAED } from '@/lib/currency';
import type { PaymentSchedule, PaymentStatus } from '@/types';

const statusColor: Record<PaymentStatus, string> = {
  paid: 'bg-green-100 text-green-700',
  upcoming: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700'
};

export default function PaymentTable({
  rows,
  onStatusChange,
  onDelete
}: {
  rows: PaymentSchedule[];
  onStatusChange?: (id: string, status: PaymentStatus) => void;
  onDelete?: (id: string) => void;
}) {
  if (!rows.length) return <div className="text-sm text-slate-500">No payments yet.</div>;

  return (
    <div className="space-y-2">
      {rows.map(r => (
        <div key={r.id} className="bg-white rounded-xl p-3 flex justify-between items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">{r.milestone}</div>
            <div className="text-xs text-slate-500">{new Date(r.due_date).toLocaleDateString()}</div>
          </div>
          <div className="text-right">
            <div className="font-semibold">{formatAED(r.amount)}</div>
            {onStatusChange ? (
              <select
                value={r.status}
                onChange={(e) => onStatusChange(r.id, e.target.value as PaymentStatus)}
                className={`text-xs mt-1 rounded-full px-2 py-0.5 ${statusColor[r.status]}`}
              >
                <option value="upcoming">upcoming</option>
                <option value="paid">paid</option>
                <option value="overdue">overdue</option>
              </select>
            ) : (
              <span className={`text-xs rounded-full px-2 py-0.5 ${statusColor[r.status]}`}>{r.status}</span>
            )}
          </div>
          {onDelete && (
            <button onClick={() => onDelete(r.id)} className="text-xs text-red-500 px-1">✕</button>
          )}
        </div>
      ))}
    </div>
  );
}
