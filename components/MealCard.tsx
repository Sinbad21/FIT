'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Meal } from '@/lib/types';

type Mode = null | 'edit' | 'replace';

export function MealCard({ meal }: { meal: Meal }) {
  const router = useRouter();
  const [status, setStatus] = useState(meal.status || 'previsto');
  const [mode, setMode] = useState<Mode>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: meal.name,
    quantity: String(meal.quantity ?? ''),
    unit: meal.unit || 'porzione',
    calories: String(meal.calories ?? ''),
    proteinG: String(meal.proteinG ?? ''),
    carbsG: String(meal.carbsG ?? ''),
    fatG: String(meal.fatG ?? ''),
    notes: meal.notes || '',
  });

  async function update(next: 'mangiato' | 'saltato') {
    setStatus(next);
    await fetch('/api/diet/meal-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plannedMealId: meal.id, status: next }) });
    router.refresh();
  }

  function openReplace() {
    // Replace = swap the food but keep the same meal slot: clear macros for the new food.
    setForm({ name: '', quantity: '1', unit: 'porzione', calories: '', proteinG: '', carbsG: '', fatG: '', notes: '' });
    setMode('replace');
  }

  function set(k: keyof typeof form, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function save() {
    setBusy(true);
    try {
      const res = await fetch('/api/diet/meal-edit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plannedMealId: meal.id, replace: mode === 'replace',
          name: form.name, quantity: form.quantity, unit: form.unit,
          calories: form.calories, proteinG: form.proteinG, carbsG: form.carbsG, fatG: form.fatG, notes: form.notes,
        }),
      });
      const d = await res.json();
      if (d.ok) { setStatus(d.status || 'modificato'); setMode(null); router.refresh(); }
      else alert(d.error || 'Errore salvataggio');
    } finally { setBusy(false); }
  }

  const changed = status === 'modificato' || status === 'sostituito';

  return (
    <article className="glass-card rounded-[1.6rem] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-600">{meal.mealType}</p>
          <h3 className="mt-1 text-lg font-black">{meal.name}</h3>
          <p className="text-sm text-slate-600">{meal.quantity} {meal.unit}</p>
          {changed && meal.plannedName && meal.plannedName !== meal.name ? <p className="text-xs text-amber-600">era: {meal.plannedName}</p> : null}
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${status === 'mangiato' ? 'bg-emerald-100 text-emerald-700' : status === 'saltato' ? 'bg-rose-100 text-rose-700' : changed ? 'bg-amber-100 text-amber-700' : 'bg-slate-100'}`}>{status}</span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
        <div className="rounded-2xl bg-slate-100 p-2"><b>{Math.round(meal.calories)}</b><br />kcal</div>
        <div className="rounded-2xl bg-slate-100 p-2"><b>{Math.round(meal.proteinG)}</b><br />pro</div>
        <div className="rounded-2xl bg-slate-100 p-2"><b>{Math.round(meal.carbsG)}</b><br />carb</div>
        <div className="rounded-2xl bg-slate-100 p-2"><b>{Math.round(meal.fatG)}</b><br />fat</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={() => update('mangiato')} className="min-h-11 rounded-2xl bg-emerald-500 font-black text-white">Mangiato</button>
        <button onClick={() => update('saltato')} className="min-h-11 rounded-2xl bg-slate-950 font-black text-white">Saltato</button>
        <button onClick={() => setMode('edit')} className="min-h-11 rounded-2xl bg-cyan-100 font-black text-cyan-700">Modifica</button>
        <button onClick={openReplace} className="min-h-11 rounded-2xl bg-amber-100 font-black text-amber-700">Sostituisci</button>
      </div>

      {mode ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center" onClick={() => setMode(null)}>
          <div className="w-full max-w-md rounded-[1.6rem] bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-lg font-black">{mode === 'replace' ? 'Sostituisci alimento' : 'Modifica pasto'}</h4>
            <p className="text-xs text-slate-500">Tipo pasto: {meal.mealType} (invariato)</p>
            <div className="mt-3 space-y-2 text-sm">
              <label className="block">Alimento<input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Es. Petto di pollo" className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-bold" /></label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">Quantità<input inputMode="decimal" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
                <label className="block">Unità<input value={form.unit} onChange={(e) => set('unit', e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <label className="block text-xs">kcal<input inputMode="decimal" value={form.calories} onChange={(e) => set('calories', e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-2" /></label>
                <label className="block text-xs">pro<input inputMode="decimal" value={form.proteinG} onChange={(e) => set('proteinG', e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-2" /></label>
                <label className="block text-xs">carb<input inputMode="decimal" value={form.carbsG} onChange={(e) => set('carbsG', e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-2" /></label>
                <label className="block text-xs">fat<input inputMode="decimal" value={form.fatG} onChange={(e) => set('fatG', e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-2" /></label>
              </div>
              <label className="block">Note<input value={form.notes} onChange={(e) => set('notes', e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setMode(null)} className="min-h-11 rounded-2xl bg-slate-100 font-black">Annulla</button>
              <button disabled={busy} onClick={save} className="min-h-11 rounded-2xl bg-emerald-500 font-black text-white">{busy ? '...' : 'Salva'}</button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
