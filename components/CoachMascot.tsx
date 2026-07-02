'use client';

// Mascotte dell'app con fumetto. Mostra la mascotte scelta dall'utente
// (selezionabile dal profilo) — animata e interagibile al tocco.
// Riutilizzabile ovunque serva un tocco "guidato" (onboarding, suggerimenti AI...).
import { MascotAvatar } from './mascots/MascotAvatar';

export function CoachMascot({ message, size = 56 }: { message?: React.ReactNode; size?: number }) {
  return (
    <div className="flex items-start gap-3">
      <MascotAvatar size={size} className="shrink-0" />
      {message ? (
        <div className="min-h-11 flex-1 rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm font-bold leading-5 text-gray-700 shadow-sm">
          {message}
        </div>
      ) : null}
    </div>
  );
}
