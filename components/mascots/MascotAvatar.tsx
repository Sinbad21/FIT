'use client';

import { useEffect, useRef, useState } from 'react';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { getMascot, type MascotDef, type MascotId } from '@/lib/mascots';
import { useMascot } from '@/hooks/useMascot';
import { MASCOT_SVGS } from './MascotSvgs';

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

function SvgMascot({ def, size }: { def: MascotDef; size: number }) {
  const [reacting, setReacting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const react = () => {
    if (timer.current) clearTimeout(timer.current);
    setReacting(true);
    timer.current = setTimeout(() => setReacting(false), 900);
  };
  const Svg = MASCOT_SVGS[def.id];
  return (
    <button type="button" aria-label={`Mascotte ${def.name}`} onClick={react} className="block bg-transparent p-0">
      <Svg size={size} reacting={reacting} />
    </button>
  );
}

/**
 * Mascotte animata e interagibile (tap = reazione). Usa il file Rive se presente
 * in /public/mascots, altrimenti il fallback SVG animato. Senza `id` mostra la
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
      {riveOk ? <RiveMascot def={def} size={size} /> : <SvgMascot def={def} size={size} />}
    </span>
  );
}
