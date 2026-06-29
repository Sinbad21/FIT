import { PageHeader } from '@/components/PageHeader';
import { getTodayWorkout } from '@/lib/repositories';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workout = getTodayWorkout();
  const exercise = workout.exercises.find((item: any) => item.exerciseId === id) || workout.exercises[0];

  return (
    <div>
      <PageHeader eyebrow="Dettaglio esercizio" title={exercise?.name || 'Esercizio'} description="Scheda tecnica, immagini e storico carichi." />
      {exercise ? (
        <article className="glass-card overflow-hidden rounded-[1.8rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={exercise.imageUrl || '/exercise-placeholder.svg'} alt={exercise.name} className="aspect-video w-full object-cover" />
          <div className="space-y-3 p-5">
            <p><b>Muscolo:</b> {exercise.primaryMuscle}</p>
            <p><b>Attrezzatura:</b> {exercise.equipment}</p>
            <p><b>Difficoltà:</b> {exercise.difficulty}</p>
            <p className="leading-6 text-slate-600">{exercise.technicalNotes}</p>
          </div>
        </article>
      ) : null}
    </div>
  );
}
