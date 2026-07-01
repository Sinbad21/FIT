'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export function BackupPanel() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function importFile(file: File, mode: 'merge' | 'replace') {
    setBusy(true); setMsg('');
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const r = await fetch('/api/backup/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data, mode }) }).then((x) => x.json());
      if (r.ok) { setMsg('Backup importato.'); router.refresh(); } else setMsg('Errore: ' + (r.error || ''));
    } catch (e: any) {
      setMsg('File non valido: ' + (e?.message || ''));
    } finally { setBusy(false); }
  }

  function onPick(mode: 'merge' | 'replace') {
    const f = fileRef.current?.files?.[0];
    if (!f) { setMsg('Seleziona prima un file JSON.'); return; }
    if (mode === 'replace' && !confirm('La modalità "sostituisci" cancella i dati attuali. Continuare?')) return;
    importFile(f, mode);
  }

  return (
    <section className="glass-card rounded-[1.6rem] p-4">
      <h3 className="font-black">Backup &amp; export</h3>
      <p className="text-xs text-gray-500">Esporta tutti i dati o singole tabelle. L&apos;import unisce o sostituisce.</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <a href="/api/backup/export" className="min-h-11 rounded-2xl bg-gray-950 px-3 text-center font-black leading-[2.75rem] text-white">Export JSON</a>
        <a href="/api/backup/export?csv=meals" className="min-h-11 rounded-2xl bg-blue-50 px-3 text-center font-black leading-[2.75rem] text-blue-700">CSV pasti</a>
        <a href="/api/backup/export?csv=weight" className="min-h-11 rounded-2xl bg-blue-50 px-3 text-center font-black leading-[2.75rem] text-blue-700">CSV peso</a>
        <a href="/api/backup/export?csv=workouts" className="min-h-11 rounded-2xl bg-blue-50 px-3 text-center font-black leading-[2.75rem] text-blue-700">CSV allenamenti</a>
        <a href="/api/backup/export?csv=exercises" className="min-h-11 rounded-2xl bg-blue-50 px-3 text-center font-black leading-[2.75rem] text-blue-700 col-span-2">CSV esercizi</a>
      </div>

      <div className="mt-4 space-y-2">
        <input ref={fileRef} type="file" accept="application/json" className="w-full text-sm" />
        <div className="grid grid-cols-2 gap-2">
          <button disabled={busy} onClick={() => onPick('merge')} className="min-h-11 rounded-2xl bg-green-600 font-black text-white">Importa (unisci)</button>
          <button disabled={busy} onClick={() => onPick('replace')} className="min-h-11 rounded-2xl bg-red-500 font-black text-white">Importa (sostituisci)</button>
        </div>
      </div>
      {msg ? <p className="mt-2 text-sm font-bold text-gray-700">{msg}</p> : null}
    </section>
  );
}
