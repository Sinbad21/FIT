import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { WorkoutEditor } from '@/components/WorkoutEditor';
import { PlanSelector } from '@/components/PlanSelector';
import { getPlanWithDays, listExercises } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export default function WeeklyWorkoutPage() {
  const { plan, days } = getPlanWithDays();
  const exercises = listExercises();
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Scheda" title={plan ? plan.name : 'Scheda settimanale'} description="Scegli la scheda attiva, crea giorni, aggiungi esercizi, modifica serie/reps/recupero e duplica la scheda." />
      <PlanSelector />
      {plan ? <Link href="/workout/print" className="inline-block min-h-11 rounded-2xl bg-blue-600 px-4 font-black leading-[2.75rem] text-white">Scarica / Stampa scheda (PDF)</Link> : null}
      <WorkoutEditor initialDays={days} exercises={exercises} />
    </div>
  );
}
