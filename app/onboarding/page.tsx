import { PageHeader } from '@/components/PageHeader';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { getProfileRaw } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export default function OnboardingPage() {
  const p = getProfileRaw();
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Benvenuto" title="Configuriamo il tuo profilo" description="Rispondi a poche domande per personalizzare allenamento, dieta e obiettivi. Puoi modificare tutto in seguito dal Profilo." />
      <OnboardingWizard profile={p} />
    </div>
  );
}
