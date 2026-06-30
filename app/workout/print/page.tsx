import Link from 'next/link';
import { PrintButton } from '@/components/PrintButton';
import { getPlanWithDays, getProfile } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

const DAYS = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

export default function PrintPlanPage() {
  const { plan, days } = getPlanWithDays();
  const profile = getProfile();

  if (!plan) {
    return (
      <div className="space-y-3">
        <p className="glass-card rounded-[1.5rem] p-4 text-slate-600">Nessuna scheda attiva da esportare. Attivane una in Scheda settimanale.</p>
        <Link href="/workout/weekly" className="text-sm font-black text-emerald-600">← Torna alla scheda</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="no-print flex items-center justify-between gap-2">
        <Link href="/workout/weekly" className="text-sm font-black text-emerald-600">← Indietro</Link>
        <PrintButton />
      </div>

      <article className="glass-card rounded-[1.6rem] p-6">
        <header className="mb-4 border-b border-slate-200 pb-3">
          <h1 className="text-2xl font-black">{plan.name}</h1>
          <p className="text-sm text-slate-600">
            {profile.name} · {plan.goal || 'obiettivo libero'}{plan.level ? ' · ' + plan.level : ''}{plan.days_per_week ? ' · ' + plan.days_per_week + ' giorni/sett.' : ''}
          </p>
        </header>

        {days.length === 0 ? <p className="text-slate-600">La scheda non ha giorni.</p> : null}

        <div className="space-y-5">
          {days.map((day: any) => (
            <section key={day.id} className="break-inside-avoid">
              <h2 className="text-lg font-black">{DAYS[day.day_of_week] ?? ''} · {day.title}{day.focus ? <span className="font-bold text-slate-500"> — {day.focus}</span> : null}</h2>
              <table className="mt-2 w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-300 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-1 pr-2">Esercizio</th>
                    <th className="py-1 pr-2">Muscolo</th>
                    <th className="py-1 pr-2">Serie</th>
                    <th className="py-1 pr-2">Reps</th>
                    <th className="py-1 pr-2">Rec.</th>
                  </tr>
                </thead>
                <tbody>
                  {(day.exercises || []).map((ex: any) => (
                    <tr key={ex.workoutExerciseId} className="border-b border-slate-100">
                      <td className="py-1.5 pr-2 font-bold">{ex.name}</td>
                      <td className="py-1.5 pr-2 text-slate-600">{ex.primaryMuscle}</td>
                      <td className="py-1.5 pr-2">{ex.sets}</td>
                      <td className="py-1.5 pr-2">{ex.reps}</td>
                      <td className="py-1.5 pr-2">{ex.restSeconds}s</td>
                    </tr>
                  ))}
                  {(day.exercises || []).length === 0 ? <tr><td colSpan={5} className="py-1.5 text-slate-400">Nessun esercizio.</td></tr> : null}
                </tbody>
              </table>
            </section>
          ))}
        </div>

        <footer className="mt-6 border-t border-slate-200 pt-3 text-xs text-slate-400">
          FitControl · esportata il {new Date().toLocaleDateString('it-IT')}
        </footer>
      </article>
    </div>
  );
}
