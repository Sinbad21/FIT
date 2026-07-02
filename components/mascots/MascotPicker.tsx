'use client';

import { MASCOTS } from '@/lib/mascots';
import { useMascot } from '@/hooks/useMascot';
import { MascotAvatar } from './MascotAvatar';

/** Griglia di selezione della mascotte che accompagna l'utente nell'app. */
export function MascotPicker() {
  const { mascot, setMascotId } = useMascot();
  return (
    <section className="glass-card rounded-3xl p-4 shadow-sm">
      <h2 className="text-sm font-black text-gray-900">La tua mascotte</h2>
      <p className="mt-0.5 text-xs font-bold text-gray-500">Scegli chi ti accompagna nell&apos;app. Toccala per farla reagire!</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {MASCOTS.map((m) => {
          const active = m.id === mascot.id;
          return (
            <div
              key={m.id}
              role="radio"
              aria-checked={active}
              tabIndex={0}
              onClick={() => setMascotId(m.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMascotId(m.id); } }}
              className={`flex cursor-pointer flex-col items-center rounded-2xl border-2 bg-white/70 p-3 text-center transition-shadow ${active ? 'shadow-md' : 'border-transparent shadow-sm'}`}
              style={active ? { borderColor: m.accent, boxShadow: `0 8px 20px -10px ${m.accent}` } : undefined}
            >
              <MascotAvatar id={m.id} size={72} />
              <span className="mt-1 text-sm font-black text-gray-900">{m.name}</span>
              <span className="text-[11px] font-bold leading-4 text-gray-500">{m.description}</span>
              {active ? (
                <span className="mt-1 rounded-full px-2 py-0.5 text-[10px] font-black text-white" style={{ backgroundColor: m.accent }}>Selezionata</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
