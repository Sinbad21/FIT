'use client';

import { useEffect, useRef, useState } from 'react';
import type { AnimationItem } from 'lottie-web';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { getMascot, MASCOT_IMG_EXTS, type MascotDef, type MascotId } from '@/lib/mascots';
import { useMascot } from '@/hooks/useMascot';

// Verifica una sola volta per sessione se un asset opzionale esiste in /public/mascots.
const probes = new Map<string, Promise<boolean>>();
function probeAsset(src: string): Promise<boolean> {
  let p = probes.get(src);
  if (!p) {
    p = fetch(src, { method: 'HEAD' })
      .then((r) => r.ok && !(r.headers.get('content-type') ?? '').includes('text/html'))
      .catch(() => false);
    probes.set(src, p);
  }
  return p;
}

/** Prima variante esistente di `<base>.<ext>` tra le estensioni supportate. */
async function findImg(base: string): Promise<string | null> {
  for (const ext of MASCOT_IMG_EXTS) {
    const src = `${base}.${ext}`;
    if (await probeAsset(src)) return src;
  }
  return null;
}

function RiveMascot({ def, size }: { def: MascotDef; size: number }) {
  const { rive, RiveComponent } = useRive({ src: def.rivSrc, stateMachines: def.stateMachine, autoplay: true });
  const tap = useStateMachineInput(rive, def.stateMachine, 'tap');
  return (
    <button type="button" aria-label={`Mascotte ${def.name}`} onClick={() => tap?.fire()} className="block bg-transparent p-0" style={{ width: size, height: size }}>
      <RiveComponent style={{ width: size, height: size }} />
    </button>
  );
}

/**
 * Illustrazione o animazione (WebP/GIF animati riprodotti nativamente dal
 * browser, PNG statico): al tap saltella con squash e, se esiste la variante
 * `-tap`, mostra quella per un attimo. I file statici fluttuano anche in idle.
 */
function ImgMascot({ def, src, size }: { def: MascotDef; src: string; size: number }) {
  const [reacting, setReacting] = useState(false);
  const [tapSrc, setTapSrc] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animated = !src.endsWith('.png');

  useEffect(() => {
    let alive = true;
    setTapSrc(null);
    findImg(`${def.imgBase}-tap`).then((s) => { if (alive) setTapSrc(s); });
    return () => { alive = false; if (timer.current) clearTimeout(timer.current); };
  }, [def.imgBase]);

  const react = () => {
    if (timer.current) clearTimeout(timer.current);
    setReacting(true);
    timer.current = setTimeout(() => setReacting(false), tapSrc ? 1500 : 900);
  };

  return (
    <button type="button" aria-label={`Mascotte ${def.name}`} onClick={react} className={`block bg-transparent p-0 ${reacting ? 'mascot-jump' : animated ? '' : 'mascot-float'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={reacting && tapSrc ? tapSrc : src}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: 'contain' }}
        draggable={false}
      />
    </button>
  );
}

function LottieMascot({ def, size }: { def: MascotDef; size: number }) {
  const box = useRef<HTMLDivElement>(null);
  const anim = useRef<AnimationItem | null>(null);
  const busy = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [bouncing, setBouncing] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const lottie = (await import('lottie-web')).default;
      if (!alive || !box.current) return;
      anim.current = lottie.loadAnimation({ container: box.current, renderer: 'svg', loop: true, autoplay: true, path: def.lottieSrc });
    })();
    return () => {
      alive = false;
      busy.current = false;
      timers.current.forEach(clearTimeout);
      timers.current = [];
      anim.current?.destroy();
      anim.current = null;
    };
  }, [def.lottieSrc]);

  const react = async () => {
    setBouncing(true);
    timers.current.push(setTimeout(() => setBouncing(false), 850));
    const a = anim.current;
    if (!a) return;
    if (def.tapLottieSrc && box.current && !busy.current) {
      // Reazione speciale: riproduce una volta l'animazione "tap" e torna all'idle.
      busy.current = true;
      const lottie = (await import('lottie-web')).default;
      a.destroy();
      const tapAnim = lottie.loadAnimation({ container: box.current, renderer: 'svg', loop: false, autoplay: true, path: def.tapLottieSrc });
      anim.current = tapAnim;
      tapAnim.addEventListener('complete', () => {
        tapAnim.destroy();
        if (box.current) {
          anim.current = lottie.loadAnimation({ container: box.current, renderer: 'svg', loop: true, autoplay: true, path: def.lottieSrc });
        }
        busy.current = false;
      });
    } else {
      a.setSpeed(1.6);
      a.goToAndPlay(0, true);
      timers.current.push(setTimeout(() => anim.current?.setSpeed(1), 1600));
    }
  };

  return (
    <button type="button" aria-label={`Mascotte ${def.name}`} onClick={react} className={`block bg-transparent p-0 ${bouncing ? 'mascot-jump' : ''}`}>
      <div ref={box} style={{ width: size, height: size }} />
    </button>
  );
}

/**
 * Mascotte animata e interagibile (tap = reazione). Priorità degli asset in
 * /public/mascots: file Rive > illustrazione PNG (render 3D) > animazione
 * Lottie. Senza `id` mostra la mascotte selezionata dall'utente.
 */
export function MascotAvatar({ id, size = 56, className }: { id?: MascotId; size?: number; className?: string }) {
  const { mascot: selected } = useMascot();
  const def = id ? getMascot(id) : selected;
  const [renderer, setRenderer] = useState<{ kind: 'rive' | 'lottie' } | { kind: 'img'; src: string }>({ kind: 'lottie' });

  useEffect(() => {
    let alive = true;
    setRenderer({ kind: 'lottie' });
    (async () => {
      if (await probeAsset(def.rivSrc)) { if (alive) setRenderer({ kind: 'rive' }); return; }
      const img = await findImg(def.imgBase);
      if (img && alive) setRenderer({ kind: 'img', src: img });
    })();
    return () => { alive = false; };
  }, [def.rivSrc, def.imgBase]);

  return (
    <span className={className} style={{ display: 'inline-block', width: size, height: size }}>
      {renderer.kind === 'rive' ? <RiveMascot def={def} size={size} /> : renderer.kind === 'img' ? <ImgMascot def={def} src={renderer.src} size={size} /> : <LottieMascot def={def} size={size} />}
    </span>
  );
}
