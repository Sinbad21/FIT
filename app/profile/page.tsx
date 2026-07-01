import Link from 'next/link';
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
      <section className="grid grid-cols-2 gap-2">
        <Link href="/settings/ai" className="min-h-11 rounded-2xl bg-slate-950 px-3 text-center font-black leading-[2.75rem] text-white">Assistente AI</Link>
        <Link href="/settings/notifications" className="min-h-11 rounded-2xl bg-blue-50 px-3 text-center font-black leading-[2.75rem] text-blue-700">Notifiche</Link>
      </section>
      <BackupPanel />
    </div>
  );
}
