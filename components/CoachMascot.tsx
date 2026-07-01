// Mascotte dell'app: un piccolo coach muscoloso in stile flat, brand-colored.
// Riutilizzabile ovunque serva un tocco "guidato" (onboarding, suggerimenti AI...).
export function CoachMascot({ message, size = 56 }: { message?: React.ReactNode; size?: number }) {
  return (
    <div className="flex items-start gap-3">
      <svg width={size} height={size} viewBox="0 0 64 64" className="shrink-0" aria-hidden="true">
        <circle cx="9" cy="37" r="9" fill="#16a34a" />
        <circle cx="55" cy="37" r="9" fill="#16a34a" />
        <circle cx="6" cy="21" r="6.5" fill="#16a34a" />
        <circle cx="58" cy="21" r="6.5" fill="#16a34a" />
        <path d="M17 31 Q32 24 47 31 L45 57 Q32 62 19 57 Z" fill="#22c55e" />
        <path d="M20 51 L44 51 L42 60 Q32 64 22 60 Z" fill="#2563eb" />
        <circle cx="32" cy="14" r="11" fill="#22c55e" />
        <circle cx="27.5" cy="13" r="1.7" fill="#111827" />
        <circle cx="36.5" cy="13" r="1.7" fill="#111827" />
        <path d="M26 19 Q32 23 38 19" stroke="#111827" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
      {message ? (
        <div className="min-h-11 flex-1 rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm font-bold leading-5 text-gray-700 shadow-sm">
          {message}
        </div>
      ) : null}
    </div>
  );
}
