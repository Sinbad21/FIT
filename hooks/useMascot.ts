'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_MASCOT, getMascot, type MascotDef, type MascotId } from '@/lib/mascots';

const STORAGE_KEY = 'fit.mascot';
const CHANGE_EVENT = 'fit:mascot-change';

function readStored(): MascotId {
  if (typeof window === 'undefined') return DEFAULT_MASCOT;
  return getMascot(window.localStorage.getItem(STORAGE_KEY)).id;
}

/** Mascotte selezionata dall'utente, condivisa tra tutti i componenti (localStorage + evento). */
export function useMascot(): { mascot: MascotDef; setMascotId: (id: MascotId) => void } {
  const [id, setId] = useState<MascotId>(DEFAULT_MASCOT);

  useEffect(() => {
    setId(readStored());
    const sync = () => setId(readStored());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const setMascotId = (next: MascotId) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return { mascot: getMascot(id), setMascotId };
}
