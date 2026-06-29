'use client';

import { dbAdd, dbGetAll, dbDelete, dbPut, dbCount, type QueuedAction } from './db';

export const QUEUE_EVENT = 'fitcontrol-queue-changed';

function notify() {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(QUEUE_EVENT));
}

export async function enqueue(url: string, body: any, label: string): Promise<void> {
  await dbAdd({ url, method: 'POST', body, label, createdAt: Date.now(), retries: 0 });
  notify();
}

export async function listQueue(): Promise<QueuedAction[]> {
  return dbGetAll();
}

export async function removeFromQueue(id: number): Promise<void> {
  await dbDelete(id);
  notify();
}

export async function markFailure(action: QueuedAction, error: string): Promise<void> {
  await dbPut({ ...action, retries: action.retries + 1, lastError: error });
  notify();
}

export async function queueCount(): Promise<number> {
  return dbCount();
}

export type { QueuedAction };
