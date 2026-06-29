import { PageHeader } from '@/components/PageHeader';
import { ExerciseLibrary } from '@/components/ExerciseLibrary';
import { listExercises } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export default function Page() {
  const exercises = listExercises();
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Libreria" title="Esercizi" description="Cerca, filtra, crea e modifica gli esercizi. Immagini locali o URL, con fonte e licenza." />
      <ExerciseLibrary initial={exercises as any} />
    </div>
  );
}
