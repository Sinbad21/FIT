'use client';

import { useState } from 'react';
import type { WorkoutExercise } from '@/lib/types';

export function ExerciseCard({ exercise }: { exercise: WorkoutExercise }) {
  const [done, setDone] = useState(Boolean(exercise.completed));
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState(exercise.weightKg != null ? String(exercise.weightKg) : '');
  const [reps, setReps] = useState(exercise.repsDone || '');
  const [rpe, setRpe] = useState(exercise.rpe != null ? String(exercise.rpe) : '');
  const [saving, setSaving] = useState(false);

  async function send(payload: any) {
    setSaving(true);
    try {
      await fetch('/api/workouts/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workoutExerciseId: exercise.workoutExerciseId, exerciseId: exercise.exerciseId, ...payload }) });
    } finally { setSaving(false); }
  }

  async function toggle() { const next = !done; setDone(next); await send({ completed: next }); }
  async function saveLog() {
    await send({ weightKg: weight ? Number(weight) : undefined, repsDone: reps || undefined, rpe: rpe ? Number(rpe) : undefined });
    setOpen(false);
  }

  return (
    <article className={'glass-card overflow-hidden rounded-[1.6rem] shadow-sm ' + (done ? 'ring-2 ring-emerald-400' : '')}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={exercise.imageUrl || '/exercise-placeholder.svg'} alt={exercise.name} className="aspect-video w-full object-cover" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-emerald-600">{exercise.primaryMuscle}</p>
            <h3 className="mt-1 text-lg font-black">{exercise.name}</h3>
          </div>
          <button onClick={toggle} disabled={saving} className={'min-h-11 rounded-2xl px-4 text-sm font-black text-white ' + (done ? 'bg-emerald-500' : 'bg-slate-950')}>{done ? 'Fatto' : 'Completa'}</button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-2xl bg-slate-100 p-2"><b>{exercise.sets}</b><br />serie</div>
          <div className="rounded-2xl bg-slate-100 p-2"><b>{exercise.reps}</b><br />reps</div>
          <div className="rounded-2xl bg-slate-100 p-2"><b>{Math.round(exercise.restSeconds / 60)}'</b><br />rec.</div>
        </div>
        {exercise.technicalNotes ? <p className="mt-3 text-sm leading-6 text-slate-600">{exercise.technicalNotes}</p> : null}
        <button onClick={() => setOpen((v) => !v)} className="mt-3 w-full rounded-2xl bg-slate-100 py-2 text-sm font-black text-slate-700">{open ? 'Chiudi' : 'Registra carico / reps / RPE'}</button>
        {open ? (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs font-bold text-slate-500">Peso kg<input value={weight} onChange={(e) => setWeight(e.target.value)} inputMode="decimal" className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
              <label className="text-xs font-bold text-slate-500">Reps<input value={reps} onChange={(e) => setReps(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
              <label className="text-xs font-bold text-slate-500">RPE<input value={rpe} onChange={(e) => setRpe(e.target.value)} inputMode="decimal" className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
            </div>
            <button onClick={saveLog} disabled={saving} className="min-h-11 w-full rounded-2xl bg-emerald-500 font-black text-white">Salva log</button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
