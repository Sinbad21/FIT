'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function SyncStatusBadge() {
  const { online, pending, syncing, retry } = useOnlineStatus();

  // Nothing interesting to show: online and fully synced.
  if (online && pending === 0 && !syncing) return null;

  const base = 'fixed left-1/2 top-2 z-[60] -translate-x-1/2 rounded-full px-4 py-1.5 text-xs font-black shadow-lg backdrop-blur';
  if (!online) {
    return <div className={base + ' bg-amber-600/95 text-white'}>Offline · {pending} in coda</div>;
  }
  if (syncing) {
    return <div className={base + ' bg-blue-600/95 text-white'}>Sincronizzo…</div>;
  }
  return (
    <button onClick={() => retry()} className={base + ' bg-red-600/95 text-white'}>
      {pending} da sincronizzare · Riprova
    </button>
  );
}
