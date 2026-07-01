'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PushSubscriptionPanel } from '@/components/PushSubscriptionPanel';

export function NotificationsManager({ notifications }: { notifications: any[] }) {
  const router = useRouter();
  const [perm, setPerm] = useState(typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported');
  const [list, setList] = useState(notifications);

  async function ask() {
    if (!('Notification' in window)) return setPerm('unsupported');
    const res = await Notification.requestPermission();
    setPerm(res);
    if (res === 'granted') new Notification('FitControl', { body: 'Notifiche attive su questo dispositivo.' });
  }
  async function patch(n: any, patch: any) {
    setList((l) => l.map((x) => x.id === n.id ? { ...x, ...patch } : x));
    await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: n.id, ...patch }) });
    router.refresh();
  }
  async function add() {
    await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'custom', title: 'Nuovo promemoria', body: '', timeOfDay: '12:00' }) });
    router.refresh();
  }
  async function remove(id: string) {
    setList((l) => l.filter((x) => x.id !== id));
    await fetch('/api/notifications', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <section className="glass-card rounded-[1.6rem] p-4">
        <p className="font-black">Permesso browser: {perm}</p>
        <button onClick={ask} className="mt-3 min-h-11 w-full rounded-2xl bg-gray-950 font-black text-white">Abilita notifiche</button>
      </section>
      <PushSubscriptionPanel />
      <button onClick={add} className="min-h-11 w-full rounded-2xl bg-green-600 font-black text-white">+ Promemoria</button>
      {list.map((n) => (
        <article key={n.id} className="glass-card rounded-[1.5rem] p-4">
          <div className="flex items-center justify-between gap-2">
            <input defaultValue={n.title} onBlur={(e) => patch(n, { title: e.target.value })} className="min-h-10 flex-1 rounded-lg border border-gray-200 px-2 font-black" />
            <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={!!n.enabled} onChange={(e) => patch(n, { enabled: e.target.checked })} /> attivo</label>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <label>Orario<input type="time" defaultValue={n.timeOfDay} onBlur={(e) => patch(n, { timeOfDay: e.target.value })} className="mt-1 min-h-10 w-full rounded-lg border border-gray-200 px-2" /></label>
            <label>Frequenza<input defaultValue={n.frequency} onBlur={(e) => patch(n, { frequency: e.target.value })} className="mt-1 min-h-10 w-full rounded-lg border border-gray-200 px-2" /></label>
          </div>
          <input defaultValue={n.body} placeholder="Testo" onBlur={(e) => patch(n, { body: e.target.value })} className="mt-2 min-h-10 w-full rounded-lg border border-gray-200 px-2 text-sm" />
          <button onClick={() => remove(n.id)} className="mt-2 rounded-lg bg-red-50 px-3 py-1 text-xs font-black text-red-500">Elimina</button>
        </article>
      ))}
    </div>
  );
}
