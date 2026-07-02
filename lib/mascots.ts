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
  /**
   * Base (senza estensione) dell'illustrazione o animazione in
   * /public/mascots/img: l'app prova `<base>.webp` (anche animato), `.gif`,
   * `.png` e usa il primo che esiste al posto della Lottie. Con un file
   * gemello `<base>-tap.<ext>`, al tap viene riprodotto quello per un attimo.
   */
  imgBase: string;
  /** Percorso del file Rive (opzionale, caricato solo se esiste). */
  rivSrc: string;
  /** Nome della state machine attesa nel file Rive. */
  stateMachine: string;
  /** Colore d'accento usato nel picker. */
  accent: string;
};

/** Estensioni supportate per le illustrazioni/animazioni, in ordine di priorità. */
export const MASCOT_IMG_EXTS = ['webp', 'gif', 'png'] as const;

export const MASCOTS: MascotDef[] = [
  { id: 'black-cat', name: 'Kira', description: 'Gatta nera, grinta felina', lottieSrc: '/mascots/black-cat.json', tapLottieSrc: '/mascots/black-cat-tap.json', imgBase: '/mascots/img/black-cat', rivSrc: '/mascots/black-cat.riv', stateMachine: 'Mascot', accent: '#22c55e' },
  { id: 'stickman', name: 'Boo', description: 'Fantasmino, pura energia', lottieSrc: '/mascots/stickman.json', imgBase: '/mascots/img/stickman', rivSrc: '/mascots/stickman.riv', stateMachine: 'Mascot', accent: '#2563eb' },
  { id: 'fox', name: 'Kitsune', description: 'Volpe furba e scattante', lottieSrc: '/mascots/fox.json', imgBase: '/mascots/img/fox', rivSrc: '/mascots/fox.riv', stateMachine: 'Mascot', accent: '#f97316' },
  { id: 'anime', name: 'Yui', description: 'Coach anime, atletica e tonica', lottieSrc: '/mascots/anime.json', imgBase: '/mascots/img/anime', rivSrc: '/mascots/anime.riv', stateMachine: 'Mascot', accent: '#ec4899' },
  { id: 'anime-m', name: 'Hiro', description: 'Coach anime, muscoli d’acciaio', lottieSrc: '/mascots/anime-m.json', imgBase: '/mascots/img/anime-m', rivSrc: '/mascots/anime-m.riv', stateMachine: 'Mascot', accent: '#6366f1' },
];

export const DEFAULT_MASCOT: MascotId = 'black-cat';

export function getMascot(id: string | null | undefined): MascotDef {
  return MASCOTS.find((m) => m.id === id) ?? MASCOTS[0];
}
