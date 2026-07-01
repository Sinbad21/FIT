'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const DAYS = ['Domenica', 'Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato'];

export function WorkoutEditor({ initialDays, exercises }: { initialDays: any[]; exercises: any[] }) {
  const router = useRouter();
  const [days, setDays] = useState(initialDays);
  const [busy, setBusy] = useState(false);

  async function api(url: string, method: string, body: any) {
    setBusy(true);
    try { await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); router.refresh(); }
    finally { setBusy(false); }
  }

  async function reload() { const r = await fetch('/api/workouts/plan'); const d = await r.json(); setDays(d.days || []); }
  useEffect(() => { setDays(initialDays); }, [initialDays]);

  async function addDay() { await api('/api/workouts/day', 'POST', { title: 'Nuovo giorno', dayOfWeek: 1, focus: '' }); await reload(); }
  async function removeDay(id: string) { await api('/api/workouts/day', 'DELETE', { id }); await reload(); }
  async function patchDay(id: string, patch: any) { await api('/api/workouts/day', 'PATCH', { id, ...patch }); await reload(); }
  async function addEx(dayId: string, exerciseId: string) { if (!exerciseId) return; await api('/api/workouts/exercise', 'POST', { dayId, exerciseId }); await reload(); }
  async function patchEx(id: string, patch: any) { await api('/api/workouts/exercise', 'PATCH', { id, ...patch }); await reload(); }
  async function removeEx(id: string) { await api('/api/workouts/exercise', 'DELETE', { id }); await reload(); }
  async function duplicate() { await api('/api/workouts/plan', 'POST', {}); await reload(); }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={addDay} disabled={busy} className="min-h-11 rounded-2xl bg-gray-950 px-4 font-black text-white">+ Giorno</button>
        <button onClick={duplicate} disabled={busy} className="min-h-11 rounded-2xl bg-green-600 px-4 font-black text-white">Duplica scheda</button>
      </div>
      {days.length === 0 ? <p className="glass-card rounded-[1.5rem] p-4 text-gray-600">Nessun giorno. Aggiungine uno o genera una scheda.</p> : null}
      {days.map((day) => (
        <article key={day.id} className="glass-card rounded-[1.6rem] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <input defaultValue={day.title} onBlur={(e) => patchDay(day.id, { title: e.target.value })} className="min-h-11 flex-1 rounded-xl border border-gray-200 px-3 font-black" />
            <select defaultValue={day.day_of_week} onChange={(e) => patchDay(day.id, { dayOfWeek: Number(e.target.value) })} className="min-h-11 rounded-xl border border-gray-200 px-2">
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
            <button onClick={() => removeDay(day.id)} className="min-h-11 rounded-xl bg-red-50 px-3 font-black text-red-500">Elimina</button>
          </div>
          <input defaultValue={day.focus || ''} placeholder="Focus (es. Spinta)" onBlur={(e) => patchDay(day.id, { focus: e.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-gray-200 px-3 text-sm" />
          <div className="mt-3 space-y-2">
            {(day.exercises || []).map((ex: any) => (
              <div key={ex.workoutExerciseId} className="rounded-2xl bg-gray-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-black">{ex.name} <span className="text-xs font-bold text-gray-500">{ex.primaryMuscle}</span></p>
                  <button onClick={() => removeEx(ex.workoutExerciseId)} className="rounded-lg bg-red-50 px-2 py-1 text-xs font-black text-red-500">x</button>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <label>Serie<input type="number" defaultValue={ex.sets} onBlur={(e) => patchEx(ex.workoutExerciseId, { sets: Number(e.target.value) })} className="mt-1 min-h-10 w-full rounded-lg border border-gray-200 px-2" /></label>
                  <label>Reps<input defaultValue={ex.reps} onBlur={(e) => patchEx(ex.workoutExerciseId, { reps: e.target.value })} className="mt-1 min-h-10 w-full rounded-lg border border-gray-200 px-2" /></label>
                  <label>Rec. s<input type="number" defaultValue={ex.restSeconds} onBlur={(e) => patchEx(ex.workoutExerciseId, { restSeconds: Number(e.target.value) })} className="mt-1 min-h-10 w-full rounded-lg border border-gray-200 px-2" /></label>
                </div>
              </div>
            ))}
          </div>
          <select onChange={(e) => { addEx(day.id, e.target.value); e.target.value = ''; }} defaultValue="" className="mt-3 min-h-11 w-full rounded-xl border border-dashed border-gray-300 px-3 text-sm">
            <option value="">+ Aggiungi esercizio...</option>
            {exercises.map((e: any) => <option key={e.id} value={e.id}>{e.name} ({e.primaryMuscle})</option>)}
          </select>
        </article>
      ))}
    </div>
  );
}
