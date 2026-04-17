'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Login() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const google = async () => {
    setErr('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${origin}/auth/callback` }
    });
    if (error) setErr(error.message);
  };

  const magic = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback` }
    });
    if (error) setErr(error.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Portfolio Advisor</h1>
          <p className="text-sm text-slate-500 mt-1">Track your Dubai property portfolio</p>
        </div>

        <button
          onClick={google}
          className="w-full border border-slate-200 rounded-xl py-3 font-medium hover:bg-slate-50"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex-1 h-px bg-slate-200" /> OR <div className="flex-1 h-px bg-slate-200" />
        </div>

        {sent ? (
          <div className="text-sm text-center text-slate-600 p-4 bg-slate-50 rounded-xl">
            Check your email for the login link.
          </div>
        ) : (
          <form onSubmit={magic} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-3"
            />
            <button
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-xl py-3 font-medium disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        )}
        {err && <div className="text-red-600 text-sm text-center">{err}</div>}
      </div>
    </div>
  );
}
