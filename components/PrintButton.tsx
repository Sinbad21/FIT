'use client';

export function PrintButton({ label = 'Scarica / Stampa PDF' }: { label?: string }) {
  return (
    <button onClick={() => window.print()} className="no-print min-h-11 rounded-2xl bg-slate-950 px-4 font-black text-white">
      {label}
    </button>
  );
}
