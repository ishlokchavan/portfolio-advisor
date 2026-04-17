'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Shell from '@/components/Shell';

export default function Account() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''));
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  

  return (
    <Shell title="Account">
      <div className="bg-white rounded-2xl p-4 space-y-3">
        <div>
          <div className="text-xs text-slate-500">Signed in as</div>
          <div className="font-medium">{email || '—'}</div>
        </div>
        <button onClick={signOut} className="w-full border border-slate-200 rounded-xl py-2 text-sm">
          Sign Out
        </button>
      </div>
    </Shell>
  );
}
