import { PageHeader } from '@/components/PageHeader';
import { AiChatPanel } from '@/components/AiChatPanel';

export const dynamic = 'force-dynamic';

export default function ChatPage() {
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Assistente" title="Chat con il coach" description="Chiedi di sostituire un pasto, segnare cosa hai mangiato, registrare acqua/peso o aggiornare un obiettivo: eseguo l'azione per te." />
      <AiChatPanel />
    </div>
  );
}
