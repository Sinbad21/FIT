'use client';

import { useEffect, useState } from 'react';

// Optional local lock. Enabled only when NEXT_PUBLIC_APP_PIN is set.
// This is a light deterrent for a personal device, not real security.
const PIN = process.env.NEXT_PUBLIC_APP_PIN || '';
const KEY = 'fitcontrol-unlocked';

export function AppLock() {
  const [locked, setLocked] = useState(false);
  const [value, setValue] = useState('');
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!PIN) return;
    if (sessionStorage.getItem(KEY) !== '1') setLocked(true);
  }, []);

  if (!PIN || !locked) return null;

  function submit() {
    if (value === PIN) { sessionStorage.setItem(KEY, '1'); setLocked(false); }
    else { setErr(true); setValue(''); }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-xs text-center">
        <h2 className="text-2xl font-black text-white">FitControl</h2>
        <p className="mt-1 text-sm text-slate-400">Inserisci il PIN per sbloccare</p>
        <input autoFocus value={value} onChange={(e) => { setValue(e.target.value); setErr(false); }} onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          type="password" inputMode="numeric" className="mt-4 min-h-12 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-center text-xl font-black text-white" />
        {err ? <p className="mt-2 text-sm font-bold text-red-400">PIN errato</p> : null}
        <button onClick={submit} className="mt-4 min-h-12 w-full rounded-2xl bg-emerald-600 font-black text-white">Sblocca</button>
      </div>
    </div>
  );
}
