import { PageHeader } from '@/components/PageHeader';
import { ProfileForm } from '@/components/ProfileForm';
import { BackupPanel } from '@/components/BackupPanel';
import { getProfileRaw } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const p = getProfileRaw();
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Profilo" title="Dati personali e target" description="Modifica profilo fisico, obiettivi e target nutrizionali." />
      <ProfileForm profile={p} />
      <BackupPanel />
    </div>
  );
}
