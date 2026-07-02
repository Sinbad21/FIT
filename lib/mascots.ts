// Registry delle mascotte selezionabili. Ogni mascotte è un'animazione Lottie
// professionale (Noto Animated Emoji di Google, licenza Apache 2.0) servita da
// /public/mascots/<id>.json; se è presente anche /public/mascots/<id>.riv
// (creato con l'editor Rive) viene usato quello.
export type MascotId = 'black-cat' | 'stickman' | 'fox' | 'anime' | 'anime-m';

export type MascotDef = {
  id: MascotId;
  name: string;
  description: string;
  /** Animazione Lottie principale (loop). */
  lottieSrc: string;
  /** Animazione Lottie opzionale riprodotta una volta al tap. */
  tapLottieSrc?: string;
  /** Percorso del file Rive (opzionale, caricato solo se esiste). */
  rivSrc: string;
  /** Nome della state machine attesa nel file Rive. */
  stateMachine: string;
  /** Colore d'accento usato nel picker. */
  accent: string;
};

export const MASCOTS: MascotDef[] = [
  { id: 'black-cat', name: 'Kira', description: 'Gattina, pigra ma sveglia', lottieSrc: '/mascots/black-cat.json', tapLottieSrc: '/mascots/black-cat-tap.json', rivSrc: '/mascots/black-cat.riv', stateMachine: 'Mascot', accent: '#22c55e' },
  { id: 'stickman', name: 'Boo', description: 'Fantasmino, pura energia', lottieSrc: '/mascots/stickman.json', rivSrc: '/mascots/stickman.riv', stateMachine: 'Mascot', accent: '#2563eb' },
  { id: 'fox', name: 'Kitsune', description: 'Volpe furba e scattante', lottieSrc: '/mascots/fox.json', rivSrc: '/mascots/fox.riv', stateMachine: 'Mascot', accent: '#f97316' },
  { id: 'anime', name: 'Yui', description: 'Coach scatenata, balla sempre', lottieSrc: '/mascots/anime.json', rivSrc: '/mascots/anime.riv', stateMachine: 'Mascot', accent: '#ec4899' },
  { id: 'anime-m', name: 'Hiro', description: 'Muscoli d’acciaio', lottieSrc: '/mascots/anime-m.json', rivSrc: '/mascots/anime-m.riv', stateMachine: 'Mascot', accent: '#6366f1' },
];

export const DEFAULT_MASCOT: MascotId = 'black-cat';

export function getMascot(id: string | null | undefined): MascotDef {
  return MASCOTS.find((m) => m.id === id) ?? MASCOTS[0];
}
