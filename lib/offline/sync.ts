'use client';

import { enqueue, listQueue, removeFromQueue, markFailure, queueCount } from './queue';

export const SYNC_EVENT = 'fitcontrol-sync-state';

let syncing = false;

function emitSync(state: 'start' | 'done' | 'error', detail?: any) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { state, ...detail } }));
}

/**
 * Send a write to the backend. If we're offline or the request fails,
 * the action is stored in IndexedDB and replayed later.
 * Returns { ok, queued } so callers can update their optimistic UI.
 */
export async function postWithOffline(url: string, body: any, label: string): Promise<{ ok: boolean; queued: boolean; data?: any }> {
  const online = typeof navigator === 'undefined' ? true : navigator.onLine;
  if (online) {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json().catch(() => ({}));
      return { ok: true, queued: false, data };
    } catch {
      await enqueue(url, body, label);
      return { ok: true, queued: true };
    }
  }
  await enqueue(url, body, label);
  return { ok: true, queued: true };
}

/**
 * Replay every queued action in order. Last-write-wins: we simply POST each
 * action; the server upserts. Failures keep the item in the queue with an
 * incremented retry counter so the user can retry manually.
 */
export async function syncQueue(): Promise<{ synced: number; failed: number }> {
  if (syncing) return { synced: 0, failed: 0 };
  syncing = true;
  emitSync('start');
  let synced = 0;
  let failed = 0;
  try {
    const items = await listQueue();
    for (const item of items) {
      try {
        const res = await fetch(item.url, { method: item.method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item.body) });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        if (item.id != null) await removeFromQueue(item.id);
        synced++;
      } catch (e: any) {
        await markFailure(item, e?.message || 'errore di rete');
        failed++;
      }
    }
    emitSync('done', { synced, failed });
  } catch (e: any) {
    emitSync('error', { error: e?.message });
  } finally {
    syncing = false;
  }
  return { synced, failed };
}

export { queueCount, listQueue };
