'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';

export default function WorkoutGeneratorPage() {
  const router = useRouter();
  const [form, setForm] = useState({ goal: 'ricomposizione', daysPerWeek: 4, level: 'intermedio', equipment: 'palestra completa', priorityMuscles: '', limitations: '', durationMinutes: 60 });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  function set(k: string, v: any) { setForm((f) => ({ ...f, [k]: v })); }
  async function generate() {
    setBusy(true); setMsg('');
    try {
      const r = await fetch('/api/workouts/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const d = await r.json();
      if (d.ok) { setMsg('Scheda generata con ' + (d.days || '') + ' giorni. Aprila in Scheda settimanale.'); setTimeout(() => router.push('/workout/weekly'), 1200); }
      else setMsg('Errore generazione');
    } finally { setBusy(false); }
  }
  return (
    <div>
      <PageHeader eyebrow="AI Planner" title="Generatore scheda" description="Genera una scheda completa con AI (se configurata) o rule-based, poi modificala manualmente." />
      <div className="glass-card space-y-4 rounded-[1.6rem] p-5">
        <label className="block"><span className="text-sm font-black">Obiettivo</span>
          <select value={form.goal} onChange={(e) => set('goal', e.target.value)} className="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 px-4">
            {['massa','definizione','forza','mantenimento','ricomposizione'].map((g) => <option key={g} value={g}>{g}</option>)}
          </select></label>
        <label className="block"><span className="text-sm font-black">Giorni a settimana: {form.daysPerWeek}</span>
          <input type="range" min={1} max={6} value={form.daysPerWeek} onChange={(e) => set('daysPerWeek', Number(e.target.value))} className="mt-2 w-full" /></label>
        <label className="block"><span className="text-sm font-black">Livello</span>
          <select value={form.level} onChange={(e) => set('level', e.target.value)} className="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 px-4">
            {['principiante','intermedio','avanzato'].map((g) => <option key={g} value={g}>{g}</option>)}
          </select></label>
        <label className="block"><span className="text-sm font-black">Attrezzatura</span>
          <select value={form.equipment} onChange={(e) => set('equipment', e.target.value)} className="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 px-4">
            {['palestra completa','manubri','corpo libero','elastici','casa'].map((g) => <option key={g} value={g}>{g}</option>)}
          </select></label>
        <label className="block"><span className="text-sm font-black">Muscoli prioritari</span>
          <input value={form.priorityMuscles} onChange={(e) => set('priorityMuscles', e.target.value)} placeholder="es. petto, dorso" className="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 px-4" /></label>
        <label className="block"><span className="text-sm font-black">Limitazioni / infortuni</span>
          <input value={form.limitations} onChange={(e) => set('limitations', e.target.value)} placeholder="es. evita stacchi, spalla dx" className="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 px-4" /></label>
        <button onClick={generate} disabled={busy} className="min-h-12 w-full rounded-2xl bg-gray-950 font-black text-white">{busy ? 'Genero...' : 'Genera scheda'}</button>
        {msg ? <p className="text-sm font-bold text-green-600">{msg}</p> : null}
      </div>
    </div>
  );
}
