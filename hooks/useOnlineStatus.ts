'use client';

import { useEffect, useState } from 'react';
import { queueCount } from '@/lib/offline/queue';
import { QUEUE_EVENT } from '@/lib/offline/queue';
import { SYNC_EVENT, syncQueue } from '@/lib/offline/sync';

export function useOnlineStatus() {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setOnline(typeof navigator === 'undefined' ? true : navigator.onLine);
    const refresh = () => queueCount().then(setPending).catch(() => {});
    refresh();

    const goOnline = () => { setOnline(true); syncQueue().finally(refresh); };
    const goOffline = () => setOnline(false);
    const onQueue = () => refresh();
    const onSync = (e: any) => {
      setSyncing(e?.detail?.state === 'start');
      if (e?.detail?.state !== 'start') refresh();
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    window.addEventListener(QUEUE_EVENT, onQueue);
    window.addEventListener(SYNC_EVENT, onSync);

    // Attempt a sync on mount in case there are leftovers from a previous session.
    if (navigator.onLine) syncQueue().finally(refresh);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener(QUEUE_EVENT, onQueue);
      window.removeEventListener(SYNC_EVENT, onSync);
    };
  }, []);

  return { online, pending, syncing, retry: () => syncQueue() };
}
