import { PageHeader } from '@/components/PageHeader';
import { NotificationsManager } from '@/components/NotificationsManager';
import { getNotifications } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export default function NotificationSettingsPage() {
  const notifications = getNotifications();
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Notifiche" title="Promemoria" description="Configura orari e testo. Su iPhone le push reali richiedono PWA installata da iOS 16.4+ e HTTPS." />
      <NotificationsManager notifications={notifications} />
    </div>
  );
}
