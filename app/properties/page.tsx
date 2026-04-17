'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Shell from '@/components/Shell';
import PropertyCard from '@/components/PropertyCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { toCSV, downloadCSV } from '@/lib/csv';
import type { Property } from '@/types';

export default function PropertiesPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Property[] | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
      if (error) setErr(error.message);
      setItems(data ?? []);
    })();
  }, []);

  const exportCSV = async () => {
    const { data: props } = await supabase.from('properties').select('*');
    const { data: pays } = await supabase.from('payment_schedules').select('*');
    if (props?.length) downloadCSV('properties.csv', toCSV(props));
    if (pays?.length) downloadCSV('payments.csv', toCSV(pays));
  };

  return (
    <Shell title="Properties">
      <div className="flex justify-between items-center mb-4">
        <button onClick={exportCSV} className="text-sm text-slate-600 underline">Export CSV</button>
        <Link href="/properties/new" className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm">
          + Add Property
        </Link>
      </div>
      {err && <div className="bg-red-50 text-red-700 rounded-2xl p-3 text-sm mb-3">{err}</div>}
      {items === null ? <LoadingSpinner /> :
       items.length === 0 ? (
         <EmptyState title="No properties yet"
           cta={<Link href="/properties/new" className="underline">Add your first property</Link>} />
       ) : (
         <div className="space-y-3">
           {items.map(p => <PropertyCard key={p.id} p={p} />)}
         </div>
       )}
    </Shell>
  );
}
