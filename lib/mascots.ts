// Registry delle mascotte selezionabili. Ogni mascotte ha un fallback SVG animato
// integrato; se in /public/mascots/<id>.riv è presente un file Rive, viene usato quello.
export type MascotId = 'black-cat' | 'stickman' | 'fox' | 'anime' | 'anime-m';

export type MascotDef = {
  id: MascotId;
  name: string;
  description: string;
  /** Percorso del file Rive (opzionale, caricato solo se esiste). */
  rivSrc: string;
  /** Nome della state machine attesa nel file Rive. */
  stateMachine: string;
  /** Colore d'accento usato nel picker. */
  accent: string;
};

export const MASCOTS: MascotDef[] = [
  { id: 'black-cat', name: 'Kira', description: 'Gatta nera, pigra ma sveglia', rivSrc: '/mascots/black-cat.riv', stateMachine: 'Mascot', accent: '#22c55e' },
  { id: 'stickman', name: 'Stick', description: 'Stickman, pura energia', rivSrc: '/mascots/stickman.riv', stateMachine: 'Mascot', accent: '#2563eb' },
  { id: 'fox', name: 'Kitsune', description: 'Volpe furba e scattante', rivSrc: '/mascots/fox.riv', stateMachine: 'Mascot', accent: '#f97316' },
  { id: 'anime', name: 'Yui', description: 'Coach anime, atletica e tonica', rivSrc: '/mascots/anime.riv', stateMachine: 'Mascot', accent: '#ec4899' },
  { id: 'anime-m', name: 'Hiro', description: 'Coach anime, muscoli d’acciaio', rivSrc: '/mascots/anime-m.riv', stateMachine: 'Mascot', accent: '#6366f1' },
];

export const DEFAULT_MASCOT: MascotId = 'black-cat';

export function getMascot(id: string | null | undefined): MascotDef {
  return MASCOTS.find((m) => m.id === id) ?? MASCOTS[0];
}
