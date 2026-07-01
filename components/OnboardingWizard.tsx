'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CoachMascot } from './CoachMascot';

type Option = { value: string; label: string; desc?: string };

const SEX_OPTIONS: Option[] = [
  { value: 'M', label: 'Uomo' },
  { value: 'F', label: 'Donna' },
  { value: 'Altro', label: 'Altro' },
];
const GOAL_OPTIONS: Option[] = [
  { value: 'ricomposizione', label: 'Ricomposizione', desc: 'Muscolo su, grasso giù' },
  { value: 'definizione', label: 'Definizione', desc: 'Perdere grasso, mantenere muscolo' },
  { value: 'massa', label: 'Massa', desc: 'Aumentare la muscolatura' },
  { value: 'forza', label: 'Forza', desc: 'Aumentare i massimali' },
  { value: 'mantenimento', label: 'Mantenimento', desc: 'Restare in forma attuale' },
];
const ACTIVITY_OPTIONS: Option[] = [
  { value: 'sedentario', label: 'Sedentario', desc: 'Lavoro da seduto, poco sport' },
  { value: 'leggero', label: 'Leggero', desc: 'Sport 1-3 giorni/sett.' },
  { value: 'moderato', label: 'Moderato', desc: 'Sport 3-5 giorni/sett.' },
  { value: 'attivo', label: 'Attivo', desc: 'Sport intenso 6-7 giorni/sett.' },
  { value: 'molto attivo', label: 'Molto attivo', desc: 'Lavoro fisico + sport intenso' },
];
const LEVEL_OPTIONS: Option[] = [
  { value: 'principiante', label: 'Principiante', desc: '< 1 anno di allenamento' },
  { value: 'intermedio', label: 'Intermedio', desc: '1-3 anni di allenamento' },
  { value: 'avanzato', label: 'Avanzato', desc: '3+ anni di allenamento' },
];
const DAYS_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
const NUTRITION_FIELDS = ['dailyCalorieTarget', 'proteinTargetG', 'carbsTargetG', 'fatTargetG', 'waterTargetL'] as const;

const STEPS = [
  { title: 'Chi sei', fields: ['name', 'age', 'sex', 'heightCm', 'weightKg'], columns: 2 as const },
  { title: 'Obiettivo e allenamento', fields: ['goal', 'targetWeightKg', 'activityLevel', 'trainingDaysPerWeek', 'trainingLevel'], columns: 1 as const },
  { title: 'Target nutrizionali', fields: [] as string[], columns: 1 as const },
];
const CHOICE_FIELDS = new Set(['sex', 'goal', 'activityLevel', 'trainingLevel', 'trainingDaysPerWeek']);

const LABELS: Record<string, string> = {
  name: 'Nome', age: 'Età', heightCm: 'Altezza cm', weightKg: 'Peso kg', targetWeightKg: 'Peso target kg',
  dailyCalorieTarget: 'Calorie', proteinTargetG: 'Proteine g', carbsTargetG: 'Carboidrati g', fatTargetG: 'Grassi g', waterTargetL: 'Acqua L',
};
const NUMBER_FIELDS = new Set(['age', 'heightCm', 'weightKg', 'targetWeightKg']);

const STEP_TIPS = [
  'Ciao, sono il tuo coach! Iniziamo con qualche dato su di te.',
  'Adesso scegli obiettivo e allenamento: tocca l\'opzione che ti rappresenta di più.',
  'A questo punto lascia fare a me: calcolo i tuoi target nutrizionali su misura.',
];

function ChoiceGroup({ label, options, value, onChange, columns = 1 }: { label: string; options: Option[]; value: string; onChange: (v: string) => void; columns?: 1 | 2 | 3 }) {
  return (
    <div>
      <span className="text-xs font-bold text-gray-500">{label}</span>
      <div className={`mt-1 grid gap-2 ${columns === 3 ? 'grid-cols-3' : columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {options.map((o) => (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
            className={`rounded-xl border px-3 py-2 text-left transition ${value === o.value ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
            <span className="block text-sm font-black">{o.label}</span>
            {o.desc ? <span className="block text-xs text-gray-500">{o.desc}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

export function OnboardingWizard({ profile }: { profile: any }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<{ note: string; provider: string } | null>(null);
  const [f, setF] = useState({
    name: profile.name || '', age: profile.age || '', sex: profile.sex || '', heightCm: profile.height_cm || '', weightKg: profile.weight_kg || '',
    goal: profile.goal || '', targetWeightKg: profile.target_weight_kg || '', activityLevel: profile.activity_level || '', trainingDaysPerWeek: profile.training_days_per_week || '', trainingLevel: profile.training_level || '',
    dailyCalorieTarget: profile.daily_calorie_target || '', proteinTargetG: profile.protein_target_g || '', carbsTargetG: profile.carbs_target_g || '', fatTargetG: profile.fat_target_g || '', waterTargetL: profile.water_target_l || '',
  });
  const set = (k: string, v: any) => setF((s) => ({ ...s, [k]: v }));
  const last = step === STEPS.length - 1;

  async function fetchSuggestion() {
    setSuggesting(true);
    try {
      const r = await fetch('/api/nutrition/suggest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sex: f.sex, age: f.age, heightCm: f.heightCm, weightKg: f.weightKg, targetWeightKg: f.targetWeightKg, goal: f.goal, activityLevel: f.activityLevel }),
      });
      const d = await r.json();
      setF((s) => ({ ...s, dailyCalorieTarget: d.dailyCalorieTarget, proteinTargetG: d.proteinTargetG, carbsTargetG: d.carbsTargetG, fatTargetG: d.fatTargetG, waterTargetL: d.waterTargetL }));
      setSuggestion({ note: d.note, provider: d.provider });
    } finally {
      setSuggesting(false);
    }
  }

  useEffect(() => {
    if (step === 2 && !suggestion) fetchSuggestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

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

  function renderField(key: string) {
    switch (key) {
      case 'sex': return <ChoiceGroup label="Sesso" options={SEX_OPTIONS} value={f.sex} onChange={(v) => set('sex', v)} columns={3} />;
      case 'goal': return <ChoiceGroup label="Obiettivo" options={GOAL_OPTIONS} value={f.goal} onChange={(v) => set('goal', v)} />;
      case 'activityLevel': return <ChoiceGroup label="Livello attività" options={ACTIVITY_OPTIONS} value={f.activityLevel} onChange={(v) => set('activityLevel', v)} />;
      case 'trainingLevel': return <ChoiceGroup label="Livello allenamento" options={LEVEL_OPTIONS} value={f.trainingLevel} onChange={(v) => set('trainingLevel', v)} columns={2} />;
      case 'trainingDaysPerWeek': return (
        <div>
          <span className="text-xs font-bold text-gray-500">Giorni allenamento/sett.</span>
          <div className="mt-1 grid grid-cols-7 gap-1.5">
            {DAYS_OPTIONS.map((d) => (
              <button key={d} type="button" onClick={() => set('trainingDaysPerWeek', d)}
                className={`min-h-11 rounded-xl border font-black ${Number(f.trainingDaysPerWeek) === d ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600'}`}>{d}</button>
            ))}
          </div>
        </div>
      );
      default: return (
        <label className="block">
          <span className="text-xs font-bold text-gray-500">{LABELS[key]}</span>
          <input type={NUMBER_FIELDS.has(key) ? 'number' : 'text'} value={(f as any)[key]} onChange={(e) => set(key, e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3" />
        </label>
      );
    }
  }

  const mascotMessage = last
    ? (suggesting ? 'Sto calcolando i tuoi target ideali…' : suggestion ? `${suggestion.note}${suggestion.provider === 'ai' ? ' (calcolato dall\'assistente AI)' : ' (stima locale)'}` : STEP_TIPS[step])
    : STEP_TIPS[step];

  return (
    <div className="space-y-4">
      <CoachMascot message={mascotMessage} />
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => <span key={i} className={`h-1.5 w-8 rounded-full ${i <= step ? 'bg-green-600' : 'bg-gray-200'}`} />)}
        </div>
        <button onClick={skip} disabled={busy} className="text-xs font-bold text-gray-500 underline underline-offset-2">Salta per ora</button>
      </div>
      <section className="glass-card rounded-[1.6rem] p-4">
        <h3 className="mb-3 font-black">{STEPS[step].title}</h3>
        {last ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {NUTRITION_FIELDS.map((k) => (
                <label key={k} className="block">
                  <span className="text-xs font-bold text-gray-500">{LABELS[k]}</span>
                  <input type="number" value={(f as any)[k]} onChange={(e) => set(k, e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3" />
                </label>
              ))}
            </div>
            <button type="button" onClick={fetchSuggestion} disabled={suggesting} className="min-h-11 w-full rounded-2xl bg-blue-50 font-black text-blue-700 disabled:opacity-50">{suggesting ? 'Calcolo…' : 'Ricalcola con l\'assistente'}</button>
          </div>
        ) : (
          <div className={`grid gap-3 ${STEPS[step].columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {STEPS[step].fields.map((k) => (
              <div key={k} className={STEPS[step].columns === 2 && CHOICE_FIELDS.has(k) ? 'col-span-2' : ''}>{renderField(k)}</div>
            ))}
          </div>
        )}
      </section>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || busy} className="min-h-12 rounded-2xl bg-gray-100 font-black disabled:opacity-40">Indietro</button>
        {last ? (
          <button onClick={finish} disabled={busy} className="min-h-12 rounded-2xl bg-green-600 font-black text-white">{busy ? '…' : 'Inizia'}</button>
        ) : (
          <button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={busy} className="min-h-12 rounded-2xl bg-gray-950 font-black text-white">Avanti</button>
        )}
      </div>
    </div>
  );
}
