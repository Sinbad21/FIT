'use client';

// Minimal IndexedDB wrapper for the offline write queue.
// One database, one object store ("queue") keyed by an auto-increment id.

const DB_NAME = 'fitcontrol-offline';
const DB_VERSION = 1;
const STORE = 'queue';

export type QueuedAction = {
  id?: number;
  url: string;
  method: string;
  body: any;
  label: string; // human-readable description for the UI
  createdAt: number;
  retries: number;
  lastError?: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('IndexedDB non disponibile')); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const store = t.objectStore(STORE);
        const req = fn(store);
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      })
  );
}

export async function dbAdd(action: QueuedAction): Promise<number> {
  return tx<number>('readwrite', (s) => s.add(action));
}

export async function dbGetAll(): Promise<QueuedAction[]> {
  const all = await tx<QueuedAction[]>('readonly', (s) => s.getAll());
  return (all || []).sort((a, b) => a.createdAt - b.createdAt);
}

export async function dbDelete(id: number): Promise<void> {
  await tx<void>('readwrite', (s) => s.delete(id));
}

export async function dbPut(action: QueuedAction): Promise<void> {
  await tx<void>('readwrite', (s) => s.put(action));
}

export async function dbCount(): Promise<number> {
  try { return await tx<number>('readonly', (s) => s.count()); } catch { return 0; }
}
