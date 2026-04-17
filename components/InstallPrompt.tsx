'use client';
import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:max-w-sm bg-slate-900 text-white rounded-2xl p-4 shadow-lg z-50 flex items-center gap-3">
      <div className="flex-1 text-sm">Install Portfolio Advisor for quick access.</div>
      <button onClick={() => setShow(false)} className="text-xs opacity-70">Later</button>
      <button
        onClick={async () => { if (prompt) await prompt.prompt(); setShow(false); }}
        className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-sm font-medium"
      >
        Install
      </button>
    </div>
  );
}
