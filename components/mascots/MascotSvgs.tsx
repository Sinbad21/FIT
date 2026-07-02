import type { MascotId } from '@/lib/mascots';

// Mascotte SVG in stile kawaii (usate quando manca il file .riv in /public/mascots).
// Gradienti, occhioni con riflessi, guance e dettagli; le animazioni (respiro,
// blink, coda, saluto, salto) sono definite in globals.css.
export type SvgMascotProps = {
  size: number;
  /** true per ~1s dopo un tap: espressione felice + saltello. */
  reacting: boolean;
};

function frame(size: number, reacting: boolean, children: React.ReactNode) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" className="mascot-idle" aria-hidden="true">
      <g className={reacting ? 'mascot-jump' : undefined}>{children}</g>
    </svg>
  );
}

/** Gatta nera "Notte": kawaii, occhioni verdi, coda che ondeggia, zampette. */
function BlackCat({ size, reacting }: SvgMascotProps) {
  return frame(size, reacting, (
    <>
      <defs>
        <linearGradient id="nc-fur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#52525b" /><stop offset="1" stopColor="#18181b" />
        </linearGradient>
        <radialGradient id="nc-iris" cx="0.35" cy="0.3" r="1">
          <stop offset="0" stopColor="#bbf7d0" /><stop offset="0.55" stopColor="#4ade80" /><stop offset="1" stopColor="#15803d" />
        </radialGradient>
        <linearGradient id="nc-ear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbcfe8" /><stop offset="1" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      {/* coda */}
      <g className="mascot-sway" style={{ transformOrigin: '92px 102px' }}>
        <path d="M92 102 Q118 96 111 64" stroke="#27272a" strokeWidth="13" fill="none" strokeLinecap="round" />
        <path d="M92 100 Q114 95 109 70" stroke="#52525b" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.5" />
      </g>
      {/* corpo + petto + quattro zampe (posteriori ai lati, anteriori al centro) */}
      <ellipse cx="62" cy="96" rx="29" ry="24" fill="url(#nc-fur)" />
      <path d="M62 82 Q74 92 70 112 Q62 118 54 112 Q50 92 62 82 Z" fill="#3f3f46" />
      <ellipse cx="37" cy="113.5" rx="11" ry="6.8" fill="#27272a" transform="rotate(-8 37 113.5)" />
      <ellipse cx="87" cy="113.5" rx="11" ry="6.8" fill="#27272a" transform="rotate(8 87 113.5)" />
      <ellipse cx="52" cy="116" rx="8.5" ry="6" fill="#3f3f46" />
      <ellipse cx="72" cy="116" rx="8.5" ry="6" fill="#3f3f46" />
      <g stroke="#18181b" strokeWidth="1.6" strokeLinecap="round">
        <path d="M33 111 L34 115.5" /><path d="M39 110.5 L39.5 115.5" />
        <path d="M85 110.5 L84.5 115.5" /><path d="M91 111 L90 115.5" />
        <path d="M49 113 L49 117.5" /><path d="M54.5 113 L54.5 117.5" />
        <path d="M69.5 113 L69.5 117.5" /><path d="M75 113 L75 117.5" />
      </g>
      {/* orecchie */}
      <path d="M36 32 L39 5 L59 21 Z" fill="url(#nc-fur)" />
      <path d="M41 26 L43 12.5 L53 20.5 Z" fill="url(#nc-ear)" />
      <path d="M88 32 L85 5 L65 21 Z" fill="url(#nc-fur)" />
      <path d="M83 26 L81 12.5 L71 20.5 Z" fill="url(#nc-ear)" />
      {/* testa con ciuffi sulle guance */}
      <circle cx="62" cy="48" r="30" fill="url(#nc-fur)" />
      <path d="M33 54 L25.5 51 L33 61 Z" fill="#3f3f46" />
      <path d="M91 54 L98.5 51 L91 61 Z" fill="#3f3f46" />
      <path d="M50 22 Q56 17 62 21 Q68 17 74 22 L70 27 Q62 23 54 27 Z" fill="#52525b" opacity="0.55" />
      {/* occhi */}
      {reacting ? (
        <g stroke="#4ade80" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M41 47 Q49 39 57 47" />
          <path d="M67 47 Q75 39 83 47" />
        </g>
      ) : (
        <g className="mascot-blink">
          <ellipse cx="49" cy="46" rx="8" ry="9.5" fill="url(#nc-iris)" />
          <ellipse cx="49" cy="46.5" rx="4" ry="7" fill="#111827" />
          <circle cx="46.2" cy="42.5" r="2.8" fill="#fff" />
          <circle cx="52" cy="50" r="1.2" fill="#fff" opacity="0.85" />
          <ellipse cx="75" cy="46" rx="8" ry="9.5" fill="url(#nc-iris)" />
          <ellipse cx="75" cy="46.5" rx="4" ry="7" fill="#111827" />
          <circle cx="72.2" cy="42.5" r="2.8" fill="#fff" />
          <circle cx="78" cy="50" r="1.2" fill="#fff" opacity="0.85" />
        </g>
      )}
      {/* naso, bocca :3, guance, baffi */}
      <path d="M58.5 57.5 Q62 55.8 65.5 57.5 Q65.2 61.5 62 62.6 Q58.8 61.5 58.5 57.5 Z" fill="#f472b6" />
      {reacting ? (
        <path d="M55 64 Q62 71 69 64 Q66 69.5 62 69.5 Q58 69.5 55 64 Z" fill="#f9a8d4" />
      ) : (
        <g stroke="#f9a8d4" strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d="M62 62.6 Q58.5 66.5 54.5 63.8" />
          <path d="M62 62.6 Q65.5 66.5 69.5 63.8" />
        </g>
      )}
      <ellipse cx="38" cy="57" rx="4.5" ry="2.8" fill="#f472b6" opacity="0.45" />
      <ellipse cx="86" cy="57" rx="4.5" ry="2.8" fill="#f472b6" opacity="0.45" />
      <g stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round">
        <path d="M30 50 L16 47" /><path d="M31 56 L17 56" /><path d="M32 62 L19 65" />
        <path d="M94 50 L108 47" /><path d="M93 56 L107 56" /><path d="M92 62 L105 65" />
      </g>
      {/* scintille */}
      <g className="mascot-sparkle" fill="#facc15">
        <path d="M104 22 L106 27 L111 29 L106 31 L104 36 L102 31 L97 29 L102 27 Z" />
        <path d="M18 30 L19.3 33.2 L22.5 34.5 L19.3 35.8 L18 39 L16.7 35.8 L13.5 34.5 L16.7 33.2 Z" opacity="0.8" />
      </g>
    </>
  ));
}

/** Stickman "Stick": doodle tondo con fascia FIT, manubrio e braccio che saluta. */
function Stickman({ size, reacting }: SvgMascotProps) {
  const limb = { stroke: '#334155', strokeWidth: 7, strokeLinecap: 'round' as const, fill: 'none' };
  return frame(size, reacting, (
    <>
      <defs>
        <linearGradient id="st-head" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#dbe3ee" />
        </linearGradient>
        <linearGradient id="st-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4ade80" /><stop offset="1" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      {/* gambe + scarpe */}
      <path d="M64 92 L50 114" {...limb} />
      <path d="M64 92 L78 114" {...limb} />
      <ellipse cx="47" cy="117.5" rx="8.5" ry="4.5" fill="url(#st-band)" />
      <ellipse cx="81" cy="117.5" rx="8.5" ry="4.5" fill="url(#st-band)" />
      {/* busto */}
      <path d="M64 62 L64 92" {...limb} />
      {/* braccia: uno con manubrio, uno che saluta (o entrambe su se reagisce) */}
      {reacting ? (
        <>
          <g>
            <path d="M64 70 L42 50" {...limb} />
            <path d="M32 52 L52 40" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="33" cy="51.5" r="6" fill="#334155" />
            <circle cx="51" cy="40.5" r="6" fill="#334155" />
          </g>
          <path d="M64 70 L88 52" {...limb} />
        </>
      ) : (
        <>
          <g>
            <path d="M64 70 L42 84" {...limb} />
            <path d="M32 77 L52 91" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="33" cy="77.5" r="6" fill="#334155" />
            <circle cx="51" cy="90.5" r="6" fill="#334155" />
          </g>
          <path d="M64 70 L86 58" {...limb} className="mascot-wave" style={{ transformOrigin: '64px 70px' }} />
        </>
      )}
      {/* testa */}
      <circle cx="64" cy="38" r="24" fill="url(#st-head)" stroke="#334155" strokeWidth="4" />
      <path d="M42.5 33 Q64 21 85.5 33 L85.5 40 Q64 29 42.5 40 Z" fill="url(#st-band)" />
      {reacting ? (
        <g stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M49 41 Q54 36.5 59 41" />
          <path d="M69 41 Q74 36.5 79 41" />
        </g>
      ) : (
        <g className="mascot-blink">
          <ellipse cx="55" cy="42" rx="4.6" ry="6" fill="#1e293b" />
          <circle cx="56.6" cy="40" r="1.8" fill="#fff" />
          <ellipse cx="73" cy="42" rx="4.6" ry="6" fill="#1e293b" />
          <circle cx="74.6" cy="40" r="1.8" fill="#fff" />
        </g>
      )}
      <ellipse cx="48" cy="49" rx="4" ry="2.4" fill="#fda4af" opacity="0.8" />
      <ellipse cx="80" cy="49" rx="4" ry="2.4" fill="#fda4af" opacity="0.8" />
      {reacting ? (
        <path d="M56 51 Q64 60 72 51 Q68 57.5 64 57.5 Q60 57.5 56 51 Z" fill="#334155" />
      ) : (
        <path d="M56 50.5 Q64 58 72 50.5" stroke="#334155" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      )}
      {/* goccia di sudore da allenamento */}
      <path d="M92 24 Q95 29 92 31.5 Q89 29 92 24 Z" fill="#7dd3fc" className="mascot-sparkle" />
    </>
  ));
}

/** Volpe "Kira": kawaii, occhioni ambra, muso crema, codona con punta bianca. */
function Fox({ size, reacting }: SvgMascotProps) {
  return frame(size, reacting, (
    <>
      <defs>
        <linearGradient id="fx-fur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdba74" /><stop offset="1" stopColor="#ea580c" />
        </linearGradient>
        <radialGradient id="fx-iris" cx="0.35" cy="0.3" r="1">
          <stop offset="0" stopColor="#fcd34d" /><stop offset="0.55" stopColor="#d97706" /><stop offset="1" stopColor="#78350f" />
        </radialGradient>
      </defs>
      {/* codona */}
      <g className="mascot-sway" style={{ transformOrigin: '88px 104px' }}>
        <path d="M86 106 Q126 102 118 54 Q112 68 100 74 Q110 90 84 100 Z" fill="url(#fx-fur)" />
        <path d="M118 54 Q121 74 106 86 Q101 78 108 68 Z" fill="#fff7ed" />
      </g>
      {/* corpo + pancia + quattro zampe (posteriori ai lati, anteriori al centro) */}
      <ellipse cx="60" cy="96" rx="28" ry="23" fill="url(#fx-fur)" />
      <ellipse cx="60" cy="100" rx="14" ry="14" fill="#fff7ed" />
      <ellipse cx="35" cy="113.5" rx="10.5" ry="6.8" fill="#c2410c" transform="rotate(-8 35 113.5)" />
      <ellipse cx="85" cy="113.5" rx="10.5" ry="6.8" fill="#c2410c" transform="rotate(8 85 113.5)" />
      <ellipse cx="50" cy="116" rx="8.5" ry="6" fill="#ea580c" />
      <ellipse cx="70" cy="116" rx="8.5" ry="6" fill="#ea580c" />
      <g stroke="#7c2d12" strokeWidth="1.6" strokeLinecap="round">
        <path d="M31 111 L32 115.5" /><path d="M37 110.5 L37.5 115.5" />
        <path d="M83 110.5 L82.5 115.5" /><path d="M89 111 L88 115.5" />
        <path d="M47 113 L47 117.5" /><path d="M52.5 113 L52.5 117.5" />
        <path d="M67.5 113 L67.5 117.5" /><path d="M73 113 L73 117.5" />
      </g>
      {/* orecchie */}
      <path d="M34 32 L36 4 L58 20 Z" fill="url(#fx-fur)" />
      <path d="M38.5 26 L40 11 L51 19 Z" fill="#7c2d12" />
      <path d="M86 32 L84 4 L62 20 Z" fill="url(#fx-fur)" />
      <path d="M81.5 26 L80 11 L69 19 Z" fill="#7c2d12" />
      {/* testa + ciuffi guance + muso */}
      <circle cx="60" cy="48" r="30" fill="url(#fx-fur)" />
      <path d="M31 52 L22 49 L30 60 L23.5 60 L32 66 Z" fill="#fb923c" />
      <path d="M89 52 L98 49 L90 60 L96.5 60 L88 66 Z" fill="#fb923c" />
      <path d="M60 50 Q76 50 74 64 Q70 72 60 72 Q50 72 46 64 Q44 50 60 50 Z" fill="#fff7ed" />
      {/* occhi */}
      {reacting ? (
        <g stroke="#92400e" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M39 45 Q47 37 55 45" />
          <path d="M65 45 Q73 37 81 45" />
        </g>
      ) : (
        <g className="mascot-blink">
          <ellipse cx="47" cy="44" rx="7.5" ry="9" fill="url(#fx-iris)" />
          <ellipse cx="47" cy="44.5" rx="3.8" ry="6.5" fill="#451a03" />
          <circle cx="44.4" cy="40.8" r="2.6" fill="#fff" />
          <circle cx="49.8" cy="48" r="1.1" fill="#fff" opacity="0.85" />
          <ellipse cx="73" cy="44" rx="7.5" ry="9" fill="url(#fx-iris)" />
          <ellipse cx="73" cy="44.5" rx="3.8" ry="6.5" fill="#451a03" />
          <circle cx="70.4" cy="40.8" r="2.6" fill="#fff" />
          <circle cx="75.8" cy="48" r="1.1" fill="#fff" opacity="0.85" />
        </g>
      )}
      {/* naso e bocca */}
      <path d="M56.5 56.5 Q60 54.8 63.5 56.5 Q63.2 60.5 60 61.6 Q56.8 60.5 56.5 56.5 Z" fill="#451a03" />
      {reacting ? (
        <path d="M53 64 Q60 71 67 64 Q64 69.5 60 69.5 Q56 69.5 53 64 Z" fill="#b45309" />
      ) : (
        <g stroke="#b45309" strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d="M60 61.6 Q56.5 65.5 52.5 62.8" />
          <path d="M60 61.6 Q63.5 65.5 67.5 62.8" />
        </g>
      )}
      <ellipse cx="36" cy="56" rx="4.5" ry="2.8" fill="#fb7185" opacity="0.5" />
      <ellipse cx="84" cy="56" rx="4.5" ry="2.8" fill="#fb7185" opacity="0.5" />
      <g className="mascot-sparkle" fill="#facc15">
        <path d="M103 24 L105 29 L110 31 L105 33 L103 38 L101 33 L96 31 L101 29 Z" />
        <path d="M16 34 L17.3 37.2 L20.5 38.5 L17.3 39.8 L16 43 L14.7 39.8 L11.5 38.5 L14.7 37.2 Z" opacity="0.8" />
      </g>
    </>
  ));
}

/** Coach anime "Yui": chibi, codini rosa, occhioni viola, completo sportivo FIT. */
function Anime({ size, reacting }: SvgMascotProps) {
  return frame(size, reacting, (
    <>
      <defs>
        <linearGradient id="yu-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbcfe8" /><stop offset="0.45" stopColor="#f472b6" /><stop offset="1" stopColor="#db2777" />
        </linearGradient>
        <radialGradient id="yu-iris" cx="0.35" cy="0.25" r="1">
          <stop offset="0" stopColor="#c4b5fd" /><stop offset="0.55" stopColor="#8b5cf6" /><stop offset="1" stopColor="#4c1d95" />
        </radialGradient>
        <linearGradient id="yu-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4ade80" /><stop offset="1" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      {/* codini */}
      <g className="mascot-sway" style={{ transformOrigin: '34px 42px' }}>
        <path d="M36 36 Q18 52 26 88 Q31 93 36 87 Q30 62 42 44 Z" fill="url(#yu-hair)" />
        <path d="M32 52 Q28 68 32 82" stroke="#fbcfe8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
      </g>
      <g className="mascot-sway" style={{ transformOrigin: '94px 42px', animationDelay: '-1.5s' }}>
        <path d="M92 36 Q110 52 102 88 Q97 93 92 87 Q98 62 86 44 Z" fill="url(#yu-hair)" />
        <path d="M96 52 Q100 68 96 82" stroke="#fbcfe8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
      </g>
      {/* corpo atletico: crop top, addominali scolpiti, un braccio che flette il bicipite */}
      <path d="M48 74 Q64 68 80 74 L79 87 Q64 91.5 49 87 Z" fill="url(#yu-top)" />
      <path d="M49.5 86 Q64 90.5 78.5 86 L78 97 L50 97 Z" fill="#ffe8d6" />
      <g stroke="#eab89a" strokeWidth="1.6" strokeLinecap="round">
        <path d="M64 88.5 L64 95" />
        <path d="M58.5 89 L58 94" /><path d="M69.5 89 L70 94" />
      </g>
      <path d="M48 74 Q44 82 46 90" stroke="#ffe8d6" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M80 75 Q90 79 89 87" stroke="#ffe8d6" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M89 87 Q93.5 78 87.5 73.5" stroke="#ffe8d6" strokeWidth="6" strokeLinecap="round" fill="none" />
      <circle cx="87" cy="72.5" r="4.5" fill="#ffe8d6" />
      <path d="M50 96 L78 96 L76 107 L67 107 L64 99.5 L61 107 L52 107 Z" fill="#1f2937" />
      <path d="M58 107 L57.5 115" stroke="#ffe8d6" strokeWidth="6.5" strokeLinecap="round" />
      <path d="M70 107 L70.5 115" stroke="#ffe8d6" strokeWidth="6.5" strokeLinecap="round" />
      <ellipse cx="57" cy="119" rx="7" ry="4" fill="#fff" stroke="#16a34a" strokeWidth="1.6" />
      <ellipse cx="71" cy="119" rx="7" ry="4" fill="#fff" stroke="#16a34a" strokeWidth="1.6" />
      {/* elastici dei codini */}
      <circle cx="36" cy="41" r="4.5" fill="#22c55e" />
      <circle cx="92" cy="41" r="4.5" fill="#22c55e" />
      {/* testa: retro capelli, viso, frangia */}
      <circle cx="64" cy="40" r="32" fill="url(#yu-hair)" />
      <circle cx="64" cy="44" r="25" fill="#ffe8d6" />
      <path d="M39.5 46 Q42 40 45 29 Q51 39 55 26 Q61 38 64 25 Q67 38 73 26 Q77 39 83 29 Q86 40 88.5 46 Q92 12 64 10 Q36 12 39.5 46 Z" fill="url(#yu-hair)" />
      <path d="M46 17.5 Q64 11 82 17.5" stroke="#fce7f3" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.85" />
      {/* sopracciglia */}
      <path d="M46 38.5 Q51 36 56 38" stroke="#be185d" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M72 38 Q77 36 82 38.5" stroke="#be185d" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* occhioni */}
      {reacting ? (
        <g stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M44 49 Q51 42 58 49" />
          <path d="M70 49 Q77 42 84 49" />
        </g>
      ) : (
        <g className="mascot-blink">
          <path d="M43 44.5 Q51 40 59 44.5" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M69 44.5 Q77 40 85 44.5" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <ellipse cx="51" cy="50" rx="6.5" ry="8" fill="url(#yu-iris)" />
          <ellipse cx="51" cy="51" rx="3.2" ry="5" fill="#2e1065" />
          <ellipse cx="77" cy="50" rx="6.5" ry="8" fill="url(#yu-iris)" />
          <ellipse cx="77" cy="51" rx="3.2" ry="5" fill="#2e1065" />
          <g className="mascot-sparkle" fill="#fff">
            <circle cx="48.8" cy="46.8" r="2.4" />
            <circle cx="53.6" cy="53" r="1" />
            <circle cx="74.8" cy="46.8" r="2.4" />
            <circle cx="79.6" cy="53" r="1" />
          </g>
          <path d="M46 59 L49 57.5" stroke="#1f2937" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M82 59 L79 57.5" stroke="#1f2937" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )}
      {/* guance con trattini kawaii */}
      <ellipse cx="42.5" cy="57" rx="4.5" ry="2.6" fill="#fda4af" opacity="0.75" />
      <ellipse cx="85.5" cy="57" rx="4.5" ry="2.6" fill="#fda4af" opacity="0.75" />
      {/* bocca */}
      {reacting ? (
        <path d="M57 61 Q64 69 71 61 Q68 66.5 64 66.5 Q60 66.5 57 61 Z" fill="#be185d" />
      ) : (
        <path d="M59.5 62 Q64 65.5 68.5 62" stroke="#be185d" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      )}
      <g className="mascot-sparkle" fill="#facc15">
        <path d="M106 60 L108 65 L113 67 L108 69 L106 74 L104 69 L99 67 L104 65 Z" />
        <path d="M20 62 L21.3 65.2 L24.5 66.5 L21.3 67.8 L20 71 L18.7 67.8 L15.5 66.5 L18.7 65.2 Z" opacity="0.8" />
      </g>
    </>
  ));
}

/** Coach anime "Hiro": chibi muscoloso, capelli a punte, doppio bicipite flesso. */
function AnimeM({ size, reacting }: SvgMascotProps) {
  return frame(size, reacting, (
    <>
      <defs>
        <linearGradient id="hi-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#818cf8" /><stop offset="1" stopColor="#312e81" />
        </linearGradient>
        <radialGradient id="hi-iris" cx="0.35" cy="0.25" r="1">
          <stop offset="0" stopColor="#7dd3fc" /><stop offset="0.55" stopColor="#0284c7" /><stop offset="1" stopColor="#0c4a6e" />
        </radialGradient>
        <linearGradient id="hi-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4ade80" /><stop offset="1" stopColor="#15803d" />
        </linearGradient>
      </defs>
      {/* braccia in doppia posa da bicipite (dietro il busto) */}
      <path d="M48 78 Q34 82 33 90" stroke="#ffe8d6" strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="39" cy="80.5" r="6" fill="#ffe8d6" />
      <path d="M33 90 Q28 78 36 72" stroke="#ffe8d6" strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="37" cy="71" r="5.5" fill="#ffe8d6" />
      <path d="M80 78 Q94 82 95 90" stroke="#ffe8d6" strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="89" cy="80.5" r="6" fill="#ffe8d6" />
      <path d="M95 90 Q100 78 92 72" stroke="#ffe8d6" strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="91" cy="71" r="5.5" fill="#ffe8d6" />
      {/* busto largo con canotta e pettorali */}
      <path d="M46 72 Q64 65 82 72 L80 99 Q64 104 48 99 Z" fill="url(#hi-top)" />
      <path d="M55 80 Q64 85 73 80" stroke="#15803d" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M64 86 L64 96" stroke="#15803d" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      {/* pantaloncini, gambe, scarpe */}
      <path d="M49 99 L79 99 L77 111 L67.5 111 L64 103 L60.5 111 L51 111 Z" fill="#1f2937" />
      <path d="M57.5 111 L57 118.5" stroke="#ffe8d6" strokeWidth="7" strokeLinecap="round" />
      <path d="M70.5 111 L71 118.5" stroke="#ffe8d6" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="56.5" cy="121.5" rx="7.5" ry="4" fill="#fff" stroke="#4f46e5" strokeWidth="1.6" />
      <ellipse cx="71.5" cy="121.5" rx="7.5" ry="4" fill="#fff" stroke="#4f46e5" strokeWidth="1.6" />
      {/* testa: punte dietro, viso, frangia a punte */}
      <path d="M64 4 L72 16 L82 8 L84 22 L96 18 L92 32 L100 34 L92 44 Q64 30 36 44 L28 34 L36 32 L32 18 L44 22 L46 8 L56 16 Z" fill="url(#hi-hair)" />
      <circle cx="64" cy="42" r="24" fill="#ffe8d6" />
      <path d="M40 44 L45 28 L52 39 L57 25 L64 37 L71 25 L76 39 L83 28 L88 44 Q89 16 64 14 Q39 16 40 44 Z" fill="url(#hi-hair)" />
      {/* sopracciglia decise */}
      <path d="M45.5 39 L57 42" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
      <path d="M82.5 39 L71 42" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
      {/* occhi */}
      {reacting ? (
        <g stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M46 50 Q52 44 58 50" />
          <path d="M70 50 Q76 44 82 50" />
        </g>
      ) : (
        <g className="mascot-blink">
          <ellipse cx="52" cy="48.5" rx="5" ry="6.5" fill="url(#hi-iris)" />
          <ellipse cx="52" cy="49.5" rx="2.5" ry="4" fill="#082f49" />
          <circle cx="50.2" cy="46" r="1.9" fill="#fff" />
          <ellipse cx="76" cy="48.5" rx="5" ry="6.5" fill="url(#hi-iris)" />
          <ellipse cx="76" cy="49.5" rx="2.5" ry="4" fill="#082f49" />
          <circle cx="74.2" cy="46" r="1.9" fill="#fff" />
        </g>
      )}
      {/* naso e bocca */}
      <path d="M64 52.5 L63.2 56" stroke="#eab89a" strokeWidth="1.6" strokeLinecap="round" />
      {reacting ? (
        <path d="M56 60 Q64 68 72 60 Q68.5 65.5 64 65.5 Q59.5 65.5 56 60 Z" fill="#9a3412" />
      ) : (
        <path d="M58 60.5 Q64 64.5 70 60.5" stroke="#9a3412" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      )}
      <g className="mascot-sparkle" fill="#facc15">
        <path d="M108 58 L110 63 L115 65 L110 67 L108 72 L106 67 L101 65 L106 63 Z" />
        <path d="M18 60 L19.3 63.2 L22.5 64.5 L19.3 65.8 L18 69 L16.7 65.8 L13.5 64.5 L16.7 63.2 Z" opacity="0.8" />
      </g>
    </>
  ));
}

export const MASCOT_SVGS: Record<MascotId, (p: SvgMascotProps) => React.ReactNode> = {
  'black-cat': BlackCat,
  stickman: Stickman,
  fox: Fox,
  anime: Anime,
  'anime-m': AnimeM,
};
