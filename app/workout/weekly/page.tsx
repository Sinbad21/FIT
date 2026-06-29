import { PageHeader } from '@/components/PageHeader';
import { WorkoutEditor } from '@/components/WorkoutEditor';
import { getPlanWithDays, listExercises } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export default function WeeklyWorkoutPage() {
  const { plan, days } = getPlanWithDays();
  const exercises = listExercises();
  return (
    <div>
      <PageHeader eyebrow="Scheda" title={plan ? plan.name : 'Scheda settimanale'} description="Crea giorni, aggiungi esercizi, modifica serie/reps/recupero e duplica la scheda." />
      <WorkoutEditor initialDays={days} exercises={exercises} />
    </div>
  );
}
