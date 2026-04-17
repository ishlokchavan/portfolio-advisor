import Link from 'next/link';
import { formatAED } from '@/lib/currency';
import type { Property } from '@/types';

export default function PropertyCard({ p }: { p: Property }) {
  return (
    <Link href={`/properties/${p.id}`}
      className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold">{p.project_name}</div>
          <div className="text-sm text-slate-500">
            {p.developer ?? '—'}{p.unit_number ? ` · Unit ${p.unit_number}` : ''}
          </div>
        </div>
        {p.payment_plan_type && (
          <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{p.payment_plan_type}</span>
        )}
      </div>
      <div className="mt-3 flex justify-between text-sm">
        <span className="text-slate-500">Price</span>
        <span className="font-semibold">{formatAED(p.purchase_price)}</span>
      </div>
      {p.expected_handover && (
        <div className="flex justify-between text-sm mt-1">
          <span className="text-slate-500">Handover</span>
          <span>{new Date(p.expected_handover).toLocaleDateString()}</span>
        </div>
      )}
    </Link>
  );
}
