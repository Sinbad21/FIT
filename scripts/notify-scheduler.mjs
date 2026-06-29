// FitControl notification scheduler.
// Reads enabled notification rules and sends Web Push reminders whose
// time_of_day is due (within a window) and not already sent today.
//
// Run periodically, e.g. every 5 minutes via cron:
//   */5 * * * * cd /path/to/FIT && node scripts/notify-scheduler.mjs >> /tmp/fitcontrol-notify.log 2>&1
//
// Honors a one-shot mode: `node scripts/notify-scheduler.mjs --once` (default).
import Database from 'better-sqlite3';
import webpush from 'web-push';
import path from 'node:path';
import fs from 'node:fs';

// Load .env.local manually (no dependency on dotenv).
function loadEnv() {
  const f = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const priv = process.env.VAPID_PRIVATE_KEY;
if (!pub || !priv) { console.error('VAPID non configurato. Esegui npm run vapid:generate'); process.exit(1); }
webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:fitcontrol@example.com', pub, priv);

const dbPath = process.env.FITCONTROL_DB_PATH || path.join(process.cwd(), 'data', 'fitcontrol.sqlite');
if (!fs.existsSync(dbPath)) { console.error('Database non trovato. Esegui npm run setup:db'); process.exit(1); }
const db = new Database(dbPath);

const WINDOW_MIN = Number(process.env.NOTIFY_WINDOW_MIN || 10);
const now = new Date();
const today = now.toISOString().slice(0, 10);
const minutesNow = now.getHours() * 60 + now.getMinutes();

function dueAt(timeOfDay) {
  const m = (timeOfDay || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return false;
  const target = Number(m[1]) * 60 + Number(m[2]);
  const diff = minutesNow - target;
  return diff >= 0 && diff < WINDOW_MIN;
}

const subs = db.prepare('select * from push_subscriptions where enabled=1').all();
if (subs.length === 0) { console.log('Nessuna subscription push.'); process.exit(0); }

const rules = db.prepare('select * from notifications where enabled=1').all();
let sentRules = 0;

for (const rule of rules) {
  if (!dueAt(rule.time_of_day)) continue;
  if (rule.last_sent_at === today) continue;
  const payload = JSON.stringify({ title: rule.title, body: rule.body, url: '/', tag: rule.type });
  let ok = false;
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
      ok = true;
    } catch (e) {
      if (e?.statusCode === 404 || e?.statusCode === 410) db.prepare('delete from push_subscriptions where id=?').run(s.id);
    }
  }
  if (ok) { db.prepare('update notifications set last_sent_at=? where id=?').run(today, rule.id); sentRules++; console.log(`Inviata: ${rule.title} (${rule.time_of_day})`); }
}

console.log(`Scheduler completato: ${sentRules} promemoria inviati.`);
