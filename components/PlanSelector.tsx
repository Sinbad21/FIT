'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Plan = { id: string; name: string; goal?: string; level?: string; daysPerWeek?: number; dayCount: number; active: number };

export function PlanSelector() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  async function load() {
    const r = await fetch('/api/workouts/plans');
    const d = await r.json();
    setPlans(d.plans || []);
  }
  useEffect(() => { load(); }, []);

  async function activate(planId: string) {
    setBusy(true);
    try {
      await fetch('/api/workouts/plans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId }) });
      await load();
      router.refresh();
    } finally { setBusy(false); }
  }

  async function remove(planId: string) {
    if (!confirm('Eliminare definitivamente questa scheda?')) return;
    setBusy(true);
    try {
      await fetch('/api/workouts/plans', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId }) });
      await load();
      router.refresh();
    } finally { setBusy(false); }
  }

  const active = plans.find((p) => p.active);

  return (
    <div className="glass-card rounded-[1.6rem] p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-600">Scheda attiva</p>
          <h3 className="mt-1 text-lg font-black">{active ? active.name : 'Nessuna scheda attiva'}</h3>
          {active ? <p className="text-sm text-slate-600">{active.dayCount} giorni · {active.goal || 'obiettivo libero'}</p> : <p className="text-sm text-rose-600">Seleziona una scheda per vedere l&apos;allenamento di oggi.</p>}
        </div>
        <button onClick={() => setOpen((v) => !v)} className="min-h-11 rounded-2xl bg-slate-950 px-4 font-black text-white">{open ? 'Chiudi' : 'Cambia'}</button>
      </div>
      {open ? (
        <ul className="mt-4 space-y-2">
          {plans.length === 0 ? <li className="text-sm text-slate-500">Nessuna scheda. Genera o crea una scheda.</li> : null}
          {plans.map((p) => (
            <li key={p.id} className={`flex items-center justify-between gap-2 rounded-2xl border p-3 ${p.active ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
              <div className="min-w-0">
                <p className="truncate font-black">{p.name}</p>
                <p className="text-xs text-slate-500">{p.dayCount} giorni · {p.level || '—'}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {p.active ? (
                  <span className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-black text-white">Attiva</span>
                ) : (
                  <button disabled={busy} onClick={() => activate(p.id)} className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-black text-white">Attiva</button>
                )}
                <button disabled={busy} onClick={() => remove(p.id)} className="rounded-xl bg-rose-100 px-3 py-2 text-xs font-black text-rose-600">Elimina</button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
