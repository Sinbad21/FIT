import { PageHeader } from '@/components/PageHeader';
import { getProgress } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export default function HistoryPage() {
  const { workouts, nutrition } = getProgress();
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Storico" title="Storico giornaliero" description="Allenamenti completati e riepilogo nutrizionale per data." />
      <article className="glass-card rounded-[1.6rem] p-4">
        <h3 className="mb-3 font-black">Allenamenti</h3>
        {(workouts || []).length === 0 ? <p className="text-sm text-gray-500">Nessun dato.</p> : (workouts as any[]).map((w, i) => (
          <div key={i} className="flex justify-between border-b border-gray-100 py-2 text-sm last:border-0"><span className="font-bold">{w.date}</span><span>{w.pct}% · {w.status}</span></div>
        ))}
      </article>
      <article className="glass-card rounded-[1.6rem] p-4">
        <h3 className="mb-3 font-black">Nutrizione</h3>
        {(nutrition || []).length === 0 ? <p className="text-sm text-gray-500">Nessun dato.</p> : (nutrition as any[]).slice().reverse().map((n, i) => (
          <div key={i} className="flex justify-between border-b border-gray-100 py-2 text-sm last:border-0"><span className="font-bold">{n.date}</span><span>{Math.round(n.calories)} kcal · P {Math.round(n.proteinG)}g · {n.waterL}L</span></div>
        ))}
      </article>
    </div>
  );
}
