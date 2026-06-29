import webpush from 'web-push';
import { getDb, dbReady } from '@/lib/db';

let configured = false;

export function pushConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

function ensureConfigured() {
  if (configured) return;
  if (!pushConfigured()) throw new Error('VAPID non configurato. Esegui npm run vapid:generate');
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:fitcontrol@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string
  );
  configured = true;
}

export type PushPayload = { title: string; body: string; url?: string; tag?: string };

// Sends a payload to every enabled subscription. Dead subscriptions (404/410)
// are pruned automatically. Returns counts so callers can report status.
export async function sendToAll(payload: PushPayload): Promise<{ sent: number; removed: number; total: number }> {
  if (!dbReady()) return { sent: 0, removed: 0, total: 0 };
  ensureConfigured();
  const db = getDb();
  const subs: any[] = db.prepare('select * from push_subscriptions where enabled=1').all();
  let sent = 0;
  let removed = 0;
  for (const s of subs) {
    const subscription = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } };
    try {
      await webpush.sendNotification(subscription as any, JSON.stringify(payload));
      sent++;
    } catch (e: any) {
      const code = e?.statusCode;
      if (code === 404 || code === 410) { db.prepare('delete from push_subscriptions where id=?').run(s.id); removed++; }
    }
  }
  return { sent, removed, total: subs.length };
}
