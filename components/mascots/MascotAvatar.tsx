'use client';

import { useEffect, useRef, useState } from 'react';
import type { AnimationItem } from 'lottie-web';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { getMascot, type MascotDef, type MascotId } from '@/lib/mascots';
import { useMascot } from '@/hooks/useMascot';

// Verifica una sola volta per sessione se il file .riv esiste in /public/mascots.
const rivProbes = new Map<string, Promise<boolean>>();
function probeRiv(src: string): Promise<boolean> {
  let p = rivProbes.get(src);
  if (!p) {
    p = fetch(src, { method: 'HEAD' })
      .then((r) => r.ok && !(r.headers.get('content-type') ?? '').includes('text/html'))
      .catch(() => false);
    rivProbes.set(src, p);
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
 * Mascotte animata e interagibile (tap = reazione). Usa il file Rive se presente
 * in /public/mascots, altrimenti l'animazione Lottie. Senza `id` mostra la
 * mascotte selezionata dall'utente.
 */
export function MascotAvatar({ id, size = 56, className }: { id?: MascotId; size?: number; className?: string }) {
  const { mascot: selected } = useMascot();
  const def = id ? getMascot(id) : selected;
  const [riveOk, setRiveOk] = useState(false);

  useEffect(() => {
    let alive = true;
    setRiveOk(false);
    probeRiv(def.rivSrc).then((ok) => { if (alive) setRiveOk(ok); });
    return () => { alive = false; };
  }, [def.rivSrc]);

  return (
    <span className={className} style={{ display: 'inline-block', width: size, height: size }}>
      {riveOk ? <RiveMascot def={def} size={size} /> : <LottieMascot def={def} size={size} />}
    </span>
  );
}
