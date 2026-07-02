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
   * Illustrazione PNG/WebP (es. render 3D) usata al posto della Lottie se il
   * file esiste; animata via CSS (fluttuazione + saltello al tap). Con un
   * file gemello `-tap` accanto, al tap viene mostrato quello per un attimo.
   */
  imgSrc: string;
  /** Percorso del file Rive (opzionale, caricato solo se esiste). */
  rivSrc: string;
  /** Nome della state machine attesa nel file Rive. */
  stateMachine: string;
  /** Colore d'accento usato nel picker. */
  accent: string;
};

/** Percorso del PNG di reazione mostrato al tap (se esiste). */
export function tapImgSrc(imgSrc: string): string {
  return imgSrc.replace(/\.(png|webp)$/, '-tap.$1');
}

export const MASCOTS: MascotDef[] = [
  { id: 'black-cat', name: 'Kira', description: 'Gatta nera, grinta felina', lottieSrc: '/mascots/black-cat.json', tapLottieSrc: '/mascots/black-cat-tap.json', imgSrc: '/mascots/img/black-cat.png', rivSrc: '/mascots/black-cat.riv', stateMachine: 'Mascot', accent: '#22c55e' },
  { id: 'stickman', name: 'Boo', description: 'Fantasmino, pura energia', lottieSrc: '/mascots/stickman.json', imgSrc: '/mascots/img/stickman.png', rivSrc: '/mascots/stickman.riv', stateMachine: 'Mascot', accent: '#2563eb' },
  { id: 'fox', name: 'Kitsune', description: 'Volpe furba e scattante', lottieSrc: '/mascots/fox.json', imgSrc: '/mascots/img/fox.png', rivSrc: '/mascots/fox.riv', stateMachine: 'Mascot', accent: '#f97316' },
  { id: 'anime', name: 'Yui', description: 'Coach anime, atletica e tonica', lottieSrc: '/mascots/anime.json', imgSrc: '/mascots/img/anime.png', rivSrc: '/mascots/anime.riv', stateMachine: 'Mascot', accent: '#ec4899' },
  { id: 'anime-m', name: 'Hiro', description: 'Coach anime, muscoli d’acciaio', lottieSrc: '/mascots/anime-m.json', imgSrc: '/mascots/img/anime-m.png', rivSrc: '/mascots/anime-m.riv', stateMachine: 'Mascot', accent: '#6366f1' },
];

export const DEFAULT_MASCOT: MascotId = 'black-cat';

export function getMascot(id: string | null | undefined): MascotDef {
  return MASCOTS.find((m) => m.id === id) ?? MASCOTS[0];
}
