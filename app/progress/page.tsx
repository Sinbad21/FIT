import { PageHeader } from '@/components/PageHeader';
import { ProgressCharts } from '@/components/ProgressCharts';
import { MetricLogger } from '@/components/DailyLoggers';
import { getProgress } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export default function ProgressPage() {
  const progress = getProgress();
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Progressi" title="Metriche e trend" description="Peso, calorie, proteine e allenamenti nel tempo." />
      <MetricLogger />
      <ProgressCharts progress={progress} />
    </div>
  );
}
