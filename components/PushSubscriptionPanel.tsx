'use client';

import { useEffect, useState } from 'react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type State = 'loading' | 'unsupported' | 'not-configured' | 'off' | 'on';

export function PushSubscriptionPanel() {
  const [state, setState] = useState<State>('loading');
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const supported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

  async function refresh() {
    if (!supported) { setState('unsupported'); return; }
    const r = await fetch('/api/push/vapid').then((x) => x.json()).catch(() => null);
    if (!r || !r.configured || !r.publicKey) { setState('not-configured'); return; }
    setPublicKey(r.publicKey);
    setCount(r.subscriptions || 0);
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = reg ? await reg.pushManager.getSubscription() : null;
    setState(sub ? 'on' : 'off');
  }

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function enable() {
    if (!publicKey) return;
    setBusy(true); setMsg('');
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setMsg('Permesso negato dal sistema.'); return; }
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
      const json = sub.toJSON();
      await fetch('/api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys, userAgent: navigator.userAgent }) });
      setMsg('Notifiche push attivate.');
      await refresh();
    } catch (e: any) {
      setMsg('Errore: ' + (e?.message || 'attivazione fallita'));
    } finally { setBusy(false); }
  }

  async function disable() {
    setBusy(true); setMsg('');
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub) {
        await fetch('/api/push/subscribe', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) });
        await sub.unsubscribe();
      }
      setMsg('Notifiche push disattivate.');
      await refresh();
    } finally { setBusy(false); }
  }

  async function test() {
    setBusy(true); setMsg('');
    try {
      const r = await fetch('/api/push/test', { method: 'POST' }).then((x) => x.json());
      setMsg(r.ok ? `Inviata a ${r.sent} dispositivi.` : ('Errore: ' + (r.error || '')));
    } finally { setBusy(false); }
  }

  const label = state === 'loading' ? '…' : state === 'unsupported' ? 'non supportate su questo dispositivo' : state === 'not-configured' ? 'non configurate (manca VAPID)' : state === 'on' ? 'attive' : 'non attive';

  return (
    <section className="glass-card rounded-[1.6rem] p-4">
      <p className="font-black">Notifiche push: <span className={state === 'on' ? 'text-green-600' : 'text-gray-600'}>{label}</span></p>
      {state === 'on' ? <p className="text-xs text-gray-500">{count} dispositivo/i registrati.</p> : null}

      {state === 'off' ? <button disabled={busy} onClick={enable} className="mt-3 min-h-11 w-full rounded-2xl bg-green-600 font-black text-white">Attiva notifiche push</button> : null}
      {state === 'on' ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button disabled={busy} onClick={test} className="min-h-11 rounded-2xl bg-blue-600 font-black text-white">Invia prova</button>
          <button disabled={busy} onClick={disable} className="min-h-11 rounded-2xl bg-gray-200 font-black text-gray-700">Disattiva</button>
        </div>
      ) : null}

      {state === 'not-configured' ? <p className="mt-2 text-xs text-gray-500">Genera le chiavi con <code>npm run vapid:generate</code> e aggiungile a <code>.env.local</code>.</p> : null}
      {state === 'unsupported' ? <p className="mt-2 text-xs text-gray-500">Su iPhone serve iOS 16.4+ e l&apos;app aggiunta alla schermata Home (PWA).</p> : null}
      {msg ? <p className="mt-2 text-sm font-bold text-gray-700">{msg}</p> : null}
      <p className="mt-2 text-xs text-gray-400">I promemoria programmati vengono inviati dallo scheduler server: <code>npm run push:run</code> (via cron).</p>
    </section>
  );
}
