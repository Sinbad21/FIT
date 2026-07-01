'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STEPS = [
  { title: 'Chi sei', fields: ['name', 'age', 'sex', 'heightCm', 'weightKg'] },
  { title: 'Obiettivo e allenamento', fields: ['goal', 'targetWeightKg', 'activityLevel', 'trainingDaysPerWeek', 'trainingLevel'] },
  { title: 'Target nutrizionali', fields: ['dailyCalorieTarget', 'proteinTargetG', 'carbsTargetG', 'fatTargetG', 'waterTargetL'] },
] as const;

const LABELS: Record<string, string> = {
  name: 'Nome', age: 'Età', sex: 'Sesso', heightCm: 'Altezza cm', weightKg: 'Peso kg',
  goal: 'Obiettivo', targetWeightKg: 'Peso target kg', activityLevel: 'Livello attività', trainingDaysPerWeek: 'Giorni allenamento/sett.', trainingLevel: 'Livello allenamento',
  dailyCalorieTarget: 'Calorie', proteinTargetG: 'Proteine g', carbsTargetG: 'Carboidrati g', fatTargetG: 'Grassi g', waterTargetL: 'Acqua L',
};
const NUMBER_FIELDS = new Set(['age', 'heightCm', 'weightKg', 'targetWeightKg', 'trainingDaysPerWeek', 'dailyCalorieTarget', 'proteinTargetG', 'carbsTargetG', 'fatTargetG', 'waterTargetL']);

export function OnboardingWizard({ profile }: { profile: any }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    name: profile.name || '', age: profile.age || '', sex: profile.sex || '', heightCm: profile.height_cm || '', weightKg: profile.weight_kg || '',
    goal: profile.goal || '', targetWeightKg: profile.target_weight_kg || '', activityLevel: profile.activity_level || '', trainingDaysPerWeek: profile.training_days_per_week || '', trainingLevel: profile.training_level || '',
    dailyCalorieTarget: profile.daily_calorie_target || '', proteinTargetG: profile.protein_target_g || '', carbsTargetG: profile.carbs_target_g || '', fatTargetG: profile.fat_target_g || '', waterTargetL: profile.water_target_l || '',
  });
  const set = (k: string, v: any) => setF((s) => ({ ...s, [k]: v }));
  const last = step === STEPS.length - 1;

  async function skip() {
    setBusy(true);
    await fetch('/api/onboarding/skip', { method: 'POST' });
    router.push('/'); router.refresh();
  }

  async function finish() {
    setBusy(true);
    const r = await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const d = await r.json();
    setBusy(false);
    if (d.ok) { router.push('/'); router.refresh(); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => <span key={i} className={`h-1.5 w-8 rounded-full ${i <= step ? 'bg-emerald-600' : 'bg-slate-200'}`} />)}
        </div>
        <button onClick={skip} disabled={busy} className="text-xs font-bold text-slate-500 underline underline-offset-2">Salta per ora</button>
      </div>
      <section className="glass-card rounded-[1.6rem] p-4">
        <h3 className="mb-3 font-black">{STEPS[step].title}</h3>
        <div className="grid grid-cols-2 gap-3">
          {STEPS[step].fields.map((k) => (
            <label key={k} className="block">
              <span className="text-xs font-bold text-slate-500">{LABELS[k]}</span>
              <input type={NUMBER_FIELDS.has(k) ? 'number' : 'text'} value={(f as any)[k]} onChange={(e) => set(k, e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3" />
            </label>
          ))}
        </div>
      </section>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || busy} className="min-h-12 rounded-2xl bg-slate-100 font-black disabled:opacity-40">Indietro</button>
        {last ? (
          <button onClick={finish} disabled={busy} className="min-h-12 rounded-2xl bg-emerald-600 font-black text-white">{busy ? '…' : 'Inizia'}</button>
        ) : (
          <button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={busy} className="min-h-12 rounded-2xl bg-slate-950 font-black text-white">Avanti</button>
        )}
      </div>
    </div>
  );
}
