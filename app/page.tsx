import Link from 'next/link';
import { Dumbbell, Salad, Droplets, Scale } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { PageHeader } from '@/components/PageHeader';
import { WaterTracker } from '@/components/DailyLoggers';
import { getDashboard } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const d = getDashboard();
  return (
    <div className="space-y-5">
      <PageHeader eyebrow={d.todayLabel} title="Dashboard giornaliera" description="Allenamento, dieta, acqua e stato generale in una vista rapida ottimizzata per iPhone." />
      <section className="dark-card rounded-[2rem] p-5 text-white shadow-soft">
        <p className="text-sm font-bold text-emerald-300">Oggi</p>
        <h3 className="mt-1 text-2xl font-black">{d.workoutTitle}</h3>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-2xl bg-white/10 p-3"><Dumbbell className="mb-2 h-5 w-5 text-emerald-300" />{d.exercisesCompleted}/{d.exercisesTotal}<br />esercizi</div>
          <div className="rounded-2xl bg-white/10 p-3"><Salad className="mb-2 h-5 w-5 text-blue-300" />{d.mealsConfirmed}/{d.mealsTotal}<br />pasti</div>
          <div className="rounded-2xl bg-white/10 p-3"><Droplets className="mb-2 h-5 w-5 text-blue-300" />{d.waterL}/{d.waterTargetL} L<br />acqua</div>
          <div className="rounded-2xl bg-white/10 p-3"><Scale className="mb-2 h-5 w-5 text-orange-300" />{d.bodyWeightKg ?? '-'} kg<br />peso</div>
        </div>
        <p className="mt-4 rounded-2xl bg-emerald-400/15 px-4 py-3 text-sm font-bold text-emerald-100">{d.status}</p>
      </section>
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Calorie" value={d.calories} target={d.calorieTarget} unit="kcal" tone="orange" />
        <MetricCard label="Proteine" value={d.proteinG} target={d.proteinTargetG} unit="g" />
        <MetricCard label="Carbo" value={d.carbsG} target={d.carbsTargetG} unit="g" tone="cyan" />
        <MetricCard label="Grassi" value={d.fatG} target={d.fatTargetG} unit="g" tone="slate" />
      </section>
      <WaterTracker current={d.waterL} target={d.waterTargetL} />
      <section className="grid gap-3 sm:grid-cols-2">
        <Link href="/workout" className="rounded-[1.6rem] bg-slate-950 p-5 font-black text-white shadow-soft">Vai all'allenamento di oggi</Link>
        <Link href="/diet" className="rounded-[1.6rem] bg-emerald-600 p-5 font-black text-white shadow-soft">Conferma i pasti di oggi</Link>
      </section>
    </div>
  );
}
