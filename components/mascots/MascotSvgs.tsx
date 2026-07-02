import type { MascotId } from '@/lib/mascots';

// Fallback SVG animati delle mascotte (usati quando manca il file .riv).
// Le animazioni (respiro, blink, coda, salto...) sono definite in globals.css.
export type SvgMascotProps = {
  size: number;
  /** true per ~1s dopo un tap: espressione felice + saltello. */
  reacting: boolean;
};

function frame(size: number, reacting: boolean, children: React.ReactNode) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="mascot-idle" aria-hidden="true">
      <g className={reacting ? 'mascot-jump' : undefined}>{children}</g>
    </svg>
  );
}

/** Gatta nera "Notte": occhi verdi, coda che ondeggia. */
function BlackCat({ size, reacting }: SvgMascotProps) {
  return frame(size, reacting, (
    <>
      <path d="M43 51 Q57 49 54 35" stroke="#1f2937" strokeWidth="5" fill="none" strokeLinecap="round" className="mascot-sway" style={{ transformOrigin: '43px 51px' }} />
      <ellipse cx="31" cy="47" rx="13" ry="11" fill="#1f2937" />
      <ellipse cx="31" cy="51" rx="6" ry="5" fill="#374151" />
      <path d="M19 16 L22 4 L30 12 Z" fill="#1f2937" />
      <path d="M21.5 13 L22.8 7.5 L26.5 11.2 Z" fill="#f9a8d4" />
      <path d="M43 16 L40 4 L32 12 Z" fill="#1f2937" />
      <path d="M40.5 13 L39.2 7.5 L35.5 11.2 Z" fill="#f9a8d4" />
      <circle cx="31" cy="24" r="13" fill="#1f2937" />
      {reacting ? (
        <g stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d="M22.5 23.5 Q25.5 20.5 28.5 23.5" />
          <path d="M33.5 23.5 Q36.5 20.5 39.5 23.5" />
        </g>
      ) : (
        <g className="mascot-blink">
          <ellipse cx="25.5" cy="23" rx="3" ry="3.6" fill="#4ade80" />
          <ellipse cx="25.5" cy="23" rx="1.1" ry="3" fill="#111827" />
          <ellipse cx="36.5" cy="23" rx="3" ry="3.6" fill="#4ade80" />
          <ellipse cx="36.5" cy="23" rx="1.1" ry="3" fill="#111827" />
        </g>
      )}
      <path d="M29.6 27.5 L32.4 27.5 L31 29.5 Z" fill="#f9a8d4" />
      {reacting ? (
        <path d="M28 31 Q31 34.5 34 31 Z" fill="#f9a8d4" />
      ) : (
        <path d="M28.5 31 Q31 33 33.5 31" stroke="#f9a8d4" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      )}
      <g stroke="#6b7280" strokeWidth="1" strokeLinecap="round">
        <path d="M17.5 25 L10 23.5" /><path d="M17.5 28 L10.5 28.5" />
        <path d="M44.5 25 L52 23.5" /><path d="M44.5 28 L51.5 28.5" />
      </g>
    </>
  ));
}

/** Stickman "Stick": neutro, saluta con un braccio. */
function Stickman({ size, reacting }: SvgMascotProps) {
  const stroke = { stroke: '#334155', strokeWidth: 3.5, strokeLinecap: 'round' as const, fill: 'none' };
  return frame(size, reacting, (
    <>
      <circle cx="32" cy="16" r="9" fill="#f8fafc" stroke="#334155" strokeWidth="3" />
      {reacting ? (
        <g stroke="#334155" strokeWidth="1.8" strokeLinecap="round" fill="none">
          <path d="M26.5 15 Q28.5 13 30.5 15" />
          <path d="M33.5 15 Q35.5 13 37.5 15" />
        </g>
      ) : (
        <g className="mascot-blink">
          <circle cx="28.5" cy="15" r="1.4" fill="#334155" />
          <circle cx="35.5" cy="15" r="1.4" fill="#334155" />
        </g>
      )}
      {reacting ? (
        <ellipse cx="32" cy="19.8" rx="2.2" ry="1.6" fill="#334155" />
      ) : (
        <path d="M28.5 19 Q32 21.8 35.5 19" stroke="#334155" strokeWidth="2" strokeLinecap="round" fill="none" />
      )}
      <path d="M32 25 L32 44" {...stroke} />
      {reacting ? (
        <>
          <path d="M32 30 L22 20.5" {...stroke} />
          <path d="M32 30 L42 20.5" {...stroke} />
        </>
      ) : (
        <>
          <path d="M32 30 L22 38" {...stroke} />
          <path d="M32 30 L42 23" {...stroke} className="mascot-wave" style={{ transformOrigin: '32px 30px' }} />
        </>
      )}
      <path d="M32 44 L24.5 56" {...stroke} />
      <path d="M32 44 L39.5 56" {...stroke} />
    </>
  ));
}

/** Volpe "Kira": coda folta con punta bianca. */
function Fox({ size, reacting }: SvgMascotProps) {
  return frame(size, reacting, (
    <>
      <g className="mascot-sway" style={{ transformOrigin: '43px 52px' }}>
        <path d="M43 52 Q60 50 55 33" stroke="#f97316" strokeWidth="8" fill="none" strokeLinecap="round" />
        <circle cx="55" cy="34" r="4" fill="#fff7ed" />
      </g>
      <ellipse cx="30" cy="47" rx="13" ry="11" fill="#f97316" />
      <ellipse cx="30" cy="50" rx="6.5" ry="6" fill="#fff7ed" />
      <path d="M18 15 L21 3 L29 11 Z" fill="#f97316" />
      <path d="M20.2 10.5 L21.6 5.2 L25.2 8.8 Z" fill="#7c2d12" />
      <path d="M42 15 L39 3 L31 11 Z" fill="#f97316" />
      <path d="M39.8 10.5 L38.4 5.2 L34.8 8.8 Z" fill="#7c2d12" />
      <circle cx="30" cy="23" r="13" fill="#f97316" />
      <circle cx="25" cy="28.5" r="5.2" fill="#fff7ed" />
      <circle cx="35" cy="28.5" r="5.2" fill="#fff7ed" />
      {reacting ? (
        <g stroke="#431407" strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d="M21.5 21.5 Q24.5 18.5 27.5 21.5" />
          <path d="M32.5 21.5 Q35.5 18.5 38.5 21.5" />
        </g>
      ) : (
        <g className="mascot-blink">
          <ellipse cx="24.5" cy="21" rx="2.2" ry="3" fill="#431407" />
          <circle cx="25.2" cy="20" r="0.8" fill="#fff" />
          <ellipse cx="35.5" cy="21" rx="2.2" ry="3" fill="#431407" />
          <circle cx="36.2" cy="20" r="0.8" fill="#fff" />
        </g>
      )}
      <circle cx="30" cy="26.5" r="2" fill="#431407" />
      {reacting ? (
        <path d="M27.5 29.5 Q30 32.5 32.5 29.5 Z" fill="#431407" />
      ) : (
        <path d="M27.5 29.5 Q30 31.5 32.5 29.5" stroke="#431407" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      )}
      <ellipse cx="19.5" cy="26" rx="2.4" ry="1.5" fill="#fdba74" />
      <ellipse cx="40.5" cy="26" rx="2.4" ry="1.5" fill="#fdba74" />
    </>
  ));
}

/** Coach anime "Yui": occhioni con riflessi, capelli rosa, top verde FIT. */
function Anime({ size, reacting }: SvgMascotProps) {
  return frame(size, reacting, (
    <>
      <circle cx="32" cy="20" r="15.5" fill="#f472b6" />
      <path d="M17.5 22 Q12.5 33 17 42" stroke="#f472b6" strokeWidth="6" fill="none" strokeLinecap="round" className="mascot-sway" style={{ transformOrigin: '17.5px 22px' }} />
      <path d="M46.5 22 Q51.5 33 47 42" stroke="#f472b6" strokeWidth="6" fill="none" strokeLinecap="round" className="mascot-sway" style={{ transformOrigin: '46.5px 22px', animationDelay: '-1.5s' }} />
      <path d="M25 34 Q32 31 39 34 L38 46 Q32 49 26 46 Z" fill="#22c55e" />
      <circle cx="32" cy="22" r="12" fill="#ffe4cf" />
      <path d="M20.5 22 Q23.5 20 25.5 15 Q28.5 19 32 14 Q35.5 19 38.5 15 Q40.5 20 43.5 22 Q44.5 9 32 8.5 Q19.5 9 20.5 22 Z" fill="#f472b6" />
      {reacting ? (
        <g stroke="#6d28d9" strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d="M23.5 24.5 Q26.5 21.5 29.5 24.5" />
          <path d="M34.5 24.5 Q37.5 21.5 40.5 24.5" />
        </g>
      ) : (
        <g className="mascot-blink">
          <path d="M23.5 21.5 Q26.5 19.5 29.5 21.5" stroke="#1f2937" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <path d="M34.5 21.5 Q37.5 19.5 40.5 21.5" stroke="#1f2937" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <ellipse cx="26.5" cy="24" rx="2.8" ry="3.8" fill="#6d28d9" />
          <ellipse cx="37.5" cy="24" rx="2.8" ry="3.8" fill="#6d28d9" />
          <g className="mascot-sparkle" fill="#fff">
            <circle cx="25.5" cy="22.8" r="1.1" />
            <circle cx="27.5" cy="25.5" r="0.55" />
            <circle cx="36.5" cy="22.8" r="1.1" />
            <circle cx="38.5" cy="25.5" r="0.55" />
          </g>
        </g>
      )}
      <ellipse cx="22.5" cy="27.5" rx="2.2" ry="1.3" fill="#fda4af" />
      <ellipse cx="41.5" cy="27.5" rx="2.2" ry="1.3" fill="#fda4af" />
      {reacting ? (
        <path d="M29.5 29.5 Q32 32.8 34.5 29.5 Z" fill="#be185d" />
      ) : (
        <path d="M30 30 Q32 31.6 34 30" stroke="#be185d" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      )}
    </>
  ));
}

export const MASCOT_SVGS: Record<MascotId, (p: SvgMascotProps) => React.ReactNode> = {
  'black-cat': BlackCat,
  stickman: Stickman,
  fox: Fox,
  anime: Anime,
};
