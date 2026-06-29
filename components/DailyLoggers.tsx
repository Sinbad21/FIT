'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function WaterTracker({ current, target }: { current: number; target: number }) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  async function add(delta: number) {
    const next = Math.max(0, Number((value + delta).toFixed(2)));
    setValue(next);
    await fetch('/api/water', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delta }) });
    router.refresh();
  }
  return (
    <article className="glass-card rounded-[1.6rem] p-4">
      <h3 className="font-black">Acqua</h3>
      <p className="mt-1 text-2xl font-black">{value}<span className="text-slate-400">/{target}</span> <span className="text-sm text-slate-500">L</span></p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button onClick={() => add(0.25)} className="min-h-11 rounded-2xl bg-cyan-500 font-black text-white">+250 ml</button>
        <button onClick={() => add(0.5)} className="min-h-11 rounded-2xl bg-cyan-600 font-black text-white">+500 ml</button>
        <button onClick={() => add(-0.25)} className="min-h-11 rounded-2xl bg-slate-200 font-black text-slate-700">-250</button>
      </div>
    </article>
  );
}

export function MetricLogger() {
  const router = useRouter();
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [msg, setMsg] = useState('');
  async function save() {
    await fetch('/api/body-metrics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ weightKg: weight, waistCm: waist }) });
    setMsg('Salvato'); setWeight(''); setWaist(''); router.refresh();
    setTimeout(() => setMsg(''), 1500);
  }
  return (
    <article className="glass-card rounded-[1.6rem] p-4">
      <h3 className="font-black">Registra misure di oggi</h3>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="text-xs font-bold text-slate-500">Peso kg<input value={weight} onChange={(e) => setWeight(e.target.value)} inputMode="decimal" className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
        <label className="text-xs font-bold text-slate-500">Vita cm<input value={waist} onChange={(e) => setWaist(e.target.value)} inputMode="decimal" className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
      </div>
      <button onClick={save} className="mt-3 min-h-11 w-full rounded-2xl bg-emerald-500 font-black text-white">Salva</button>
      {msg ? <p className="mt-2 text-sm font-bold text-emerald-600">{msg}</p> : null}
    </article>
  );
}
