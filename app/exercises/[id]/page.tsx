import { PageHeader } from '@/components/PageHeader';
import { getExercise } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exercise: any = getExercise(id);

  return (
    <div>
      <PageHeader eyebrow="Dettaglio esercizio" title={exercise?.name || 'Esercizio'} description="Scheda tecnica e immagine." />
      {exercise ? (
        <article className="glass-card overflow-hidden rounded-[1.8rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={exercise.imageUrl || '/exercise-placeholder.svg'} alt={exercise.name} className="aspect-video w-full object-cover" />
          <div className="space-y-3 p-5">
            <p><b>Muscolo:</b> {exercise.primaryMuscle}</p>
            {exercise.secondaryMuscles ? <p><b>Secondari:</b> {exercise.secondaryMuscles}</p> : null}
            <p><b>Attrezzatura:</b> {exercise.equipment || '—'}</p>
            <p><b>Difficoltà:</b> {exercise.difficulty || '—'}</p>
            {exercise.technicalNotes ? <p className="leading-6 text-gray-600">{exercise.technicalNotes}</p> : null}
            {exercise.imageSource ? <p className="text-xs text-gray-400">Fonte: {exercise.imageSource}{exercise.imageLicense ? ' · ' + exercise.imageLicense : ''}</p> : null}
          </div>
        </article>
      ) : <p className="glass-card rounded-[1.5rem] p-4 text-gray-600">Esercizio non trovato.</p>}
    </div>
  );
}
