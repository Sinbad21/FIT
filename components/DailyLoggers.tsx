'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postWithOffline } from '@/lib/offline/sync';

export function WaterTracker({ current, target }: { current: number; target: number }) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  async function add(delta: number) {
    const next = Math.max(0, Number((value + delta).toFixed(2)));
    setValue(next);
    const r = await postWithOffline('/api/water', { delta }, `Acqua ${delta > 0 ? '+' : ''}${delta} L`);
    if (!r.queued) router.refresh();
  }
  return (
    <article className="glass-card rounded-[1.6rem] p-4">
      <h3 className="font-black">Acqua</h3>
      <p className="mt-1 text-2xl font-black">{value}<span className="text-gray-400">/{target}</span> <span className="text-sm text-gray-500">L</span></p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button onClick={() => add(0.25)} className="min-h-11 rounded-2xl bg-blue-600 font-black text-white">+250 ml</button>
        <button onClick={() => add(0.5)} className="min-h-11 rounded-2xl bg-blue-700 font-black text-white">+500 ml</button>
        <button onClick={() => add(-0.25)} className="min-h-11 rounded-2xl bg-gray-200 font-black text-gray-700">-250</button>
      </div>
    </article>
  );
}

export function MetricLogger() {
  const router = useRouter();
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [sleep, setSleep] = useState('');
  const [steps, setSteps] = useState('');
  const [msg, setMsg] = useState('');

  // Reject obviously wrong numbers before sending.
  function valid() {
    const checks: [string, number, number][] = [['Peso', Number(weight || 0), 400], ['Vita', Number(waist || 0), 300], ['Sonno', Number(sleep || 0), 24], ['Passi', Number(steps || 0), 100000]];
    for (const [label, v, max] of checks) { if (v < 0 || v > max) { setMsg(`${label}: valore non valido`); return false; } }
    return true;
  }

  async function save() {
    if (!valid()) { setTimeout(() => setMsg(''), 1800); return; }
    const r = await postWithOffline('/api/body-metrics', { weightKg: weight, waistCm: waist, sleepHours: sleep, steps }, 'Misure corporee');
    setMsg(r.queued ? 'Salvato offline (in coda)' : 'Salvato'); setWeight(''); setWaist(''); setSleep(''); setSteps('');
    if (!r.queued) router.refresh();
    setTimeout(() => setMsg(''), 1800);
  }
  return (
    <article className="glass-card rounded-[1.6rem] p-4">
      <h3 className="font-black">Registra misure di oggi</h3>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="text-xs font-bold text-gray-500">Peso kg<input value={weight} onChange={(e) => setWeight(e.target.value)} inputMode="decimal" className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3" /></label>
        <label className="text-xs font-bold text-gray-500">Vita cm<input value={waist} onChange={(e) => setWaist(e.target.value)} inputMode="decimal" className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3" /></label>
        <label className="text-xs font-bold text-gray-500">Sonno h<input value={sleep} onChange={(e) => setSleep(e.target.value)} inputMode="decimal" className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3" /></label>
        <label className="text-xs font-bold text-gray-500">Passi<input value={steps} onChange={(e) => setSteps(e.target.value)} inputMode="numeric" className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3" /></label>
      </div>
      <button onClick={save} className="mt-3 min-h-11 w-full rounded-2xl bg-green-600 font-black text-white">Salva</button>
      {msg ? <p className="mt-2 text-sm font-bold text-green-600">{msg}</p> : null}
    </article>
  );
}
