import { PageHeader } from '@/components/PageHeader';
import { AiSettingsForm } from '@/components/AiSettingsForm';
import { getAISettingsForClient } from '@/lib/ai/provider';

export const dynamic = 'force-dynamic';

export default function AiSettingsPage() {
  const initial = getAISettingsForClient();
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Impostazioni" title="Assistente AI" description="Collega un provider AI (es. OpenAI) per interpretare pasti scritti a testo libero, generare schede e leggere i PDF in modo più preciso. Senza chiave l'app continua a funzionare con le stime locali." />
      <AiSettingsForm initial={initial} />
    </div>
  );
}
