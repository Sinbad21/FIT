'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ProfileForm({ profile }: { profile: any }) {
  const router = useRouter();
  const [f, setF] = useState({
    name: profile.name || '', age: profile.age || '', heightCm: profile.height_cm || '', weightKg: profile.weight_kg || '', sex: profile.sex || '',
    goal: profile.goal || '', targetWeightKg: profile.target_weight_kg || '', activityLevel: profile.activity_level || '', trainingDaysPerWeek: profile.training_days_per_week || '',
    dailyCalorieTarget: profile.daily_calorie_target || '', proteinTargetG: profile.protein_target_g || '', carbsTargetG: profile.carbs_target_g || '', fatTargetG: profile.fat_target_g || '', waterTargetL: profile.water_target_l || '',
    foodPreferences: profile.food_preferences || '', foodsToAvoid: profile.foods_to_avoid || '', allergies: profile.allergies || '', availableEquipment: profile.available_equipment || '', trainingLevel: profile.training_level || ''
  });
  const [msg, setMsg] = useState('');
  const set = (k: string, v: any) => setF((s) => ({ ...s, [k]: v }));
  async function save() {
    const r = await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const d = await r.json();
    if (d.ok) { setMsg('Profilo salvato'); router.refresh(); setTimeout(() => setMsg(''), 1500); }
  }
  const Field = (key: string, label: string, type = 'text') => (
    <label className="block"><span className="text-xs font-bold text-slate-500">{label}</span><input type={type} value={(f as any)[key]} onChange={(e) => set(key, e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
  );
  return (
    <div className="space-y-4">
      <section className="glass-card grid grid-cols-2 gap-3 rounded-[1.6rem] p-4">
        {Field('name', 'Nome')}{Field('age', 'Eta', 'number')}{Field('heightCm', 'Altezza cm', 'number')}{Field('weightKg', 'Peso kg', 'number')}{Field('sex', 'Sesso')}{Field('goal', 'Obiettivo')}{Field('targetWeightKg', 'Peso target', 'number')}{Field('activityLevel', 'Attivita')}{Field('trainingDaysPerWeek', 'Giorni allenamento', 'number')}{Field('trainingLevel', 'Livello')}
      </section>
      <section className="glass-card grid grid-cols-2 gap-3 rounded-[1.6rem] p-4">
        <h3 className="col-span-2 font-black">Target nutrizionali</h3>
        {Field('dailyCalorieTarget', 'Calorie', 'number')}{Field('proteinTargetG', 'Proteine g', 'number')}{Field('carbsTargetG', 'Carbo g', 'number')}{Field('fatTargetG', 'Grassi g', 'number')}{Field('waterTargetL', 'Acqua L', 'number')}
      </section>
      <section className="glass-card grid grid-cols-1 gap-3 rounded-[1.6rem] p-4">
        <h3 className="font-black">Preferenze</h3>
        {Field('foodPreferences', 'Preferenze alimentari')}{Field('foodsToAvoid', 'Alimenti da evitare')}{Field('allergies', 'Allergie/intolleranze')}{Field('availableEquipment', 'Attrezzatura disponibile')}
      </section>
      <button onClick={save} className="min-h-12 w-full rounded-2xl bg-emerald-500 font-black text-white">Salva profilo</button>
      {msg ? <p className="text-center text-sm font-bold text-emerald-600">{msg}</p> : null}
    </div>
  );
}
