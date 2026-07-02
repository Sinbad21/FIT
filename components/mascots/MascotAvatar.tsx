'use client';

import { useEffect, useRef, useState } from 'react';
import type { AnimationItem } from 'lottie-web';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { getMascot, tapImgSrc, type MascotDef, type MascotId } from '@/lib/mascots';
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

function RiveMascot({ def, size }: { def: MascotDef; size: number }) {
  const { rive, RiveComponent } = useRive({ src: def.rivSrc, stateMachines: def.stateMachine, autoplay: true });
  const tap = useStateMachineInput(rive, def.stateMachine, 'tap');
  return (
    <button type="button" aria-label={`Mascotte ${def.name}`} onClick={() => tap?.fire()} className="block bg-transparent p-0" style={{ width: size, height: size }}>
      <RiveComponent style={{ width: size, height: size }} />
    </button>
  );
}

/** Illustrazione (es. render 3D) animata via CSS: fluttua, e al tap saltella con squash. */
function ImgMascot({ def, size }: { def: MascotDef; size: number }) {
  const [reacting, setReacting] = useState(false);
  const [hasTapImg, setHasTapImg] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapSrc = tapImgSrc(def.imgSrc);

  useEffect(() => {
    let alive = true;
    setHasTapImg(false);
    probeAsset(tapSrc).then((ok) => { if (alive) setHasTapImg(ok); });
    return () => { alive = false; if (timer.current) clearTimeout(timer.current); };
  }, [tapSrc]);

  const react = () => {
    if (timer.current) clearTimeout(timer.current);
    setReacting(true);
    timer.current = setTimeout(() => setReacting(false), 900);
  };

  return (
    <button type="button" aria-label={`Mascotte ${def.name}`} onClick={react} className={`block bg-transparent p-0 ${reacting ? 'mascot-jump' : 'mascot-float'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={reacting && hasTapImg ? tapSrc : def.imgSrc}
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
  const [renderer, setRenderer] = useState<'rive' | 'img' | 'lottie'>('lottie');

  useEffect(() => {
    let alive = true;
    setRenderer('lottie');
    (async () => {
      if (await probeAsset(def.rivSrc)) { if (alive) setRenderer('rive'); return; }
      if (await probeAsset(def.imgSrc)) { if (alive) setRenderer('img'); }
    })();
    return () => { alive = false; };
  }, [def.rivSrc, def.imgSrc]);

  return (
    <span className={className} style={{ display: 'inline-block', width: size, height: size }}>
      {renderer === 'rive' ? <RiveMascot def={def} size={size} /> : renderer === 'img' ? <ImgMascot def={def} size={size} /> : <LottieMascot def={def} size={size} />}
    </span>
  );
}
