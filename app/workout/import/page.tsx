'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';

const DAY_OPTS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

export default function WorkoutImportPage() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [planName, setPlanName] = useState('Scheda importata');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('pdf') as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    setBusy(true); setMsg('');
    const fd = new FormData(); fd.append('pdf', input.files[0]);
    const r = await fetch('/api/workouts/pdf/import', { method: 'POST', body: fd });
    const d = await r.json();
    setBusy(false);
    if (d.error) { setMsg(d.error); return; }
    if (d.warning) setMsg(d.warning);
    setFileName(d.fileName);
    setRows(d.rows || []);
    if (d.fileName) setPlanName(d.fileName.replace(/\.pdf$/i, '') || 'Scheda importata');
    if ((d.rows || []).length === 0 && !d.warning) setMsg('Nessun esercizio riconosciuto: aggiungi le righe manualmente.');
  }

  function update(i: number, key: string, value: any) { setRows((rs) => rs.map((r, idx) => idx === i ? { ...r, [key]: value } : r)); }
  function addRow() { setRows((rs) => [...rs, { day: 'Giorno 1', exercise: '', sets: 3, reps: '8-12', rest: 75, primaryMuscle: 'Generico', confidence: 1 }]); }
  function removeRow(i: number) { setRows((rs) => rs.filter((_, idx) => idx !== i)); }

  async function save() {
    if (rows.length === 0) return;
    setBusy(true);
    const r = await fetch('/api/workouts/pdf/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: planName, rows }) });
    const d = await r.json();
    setBusy(false);
    if (d.ok) { setMsg('Scheda salvata e attivata.'); setTimeout(() => router.push('/workout/weekly'), 1000); }
    else setMsg(d.error || 'Errore salvataggio');
  }

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="PDF scheda" title="Importa la tua scheda" description="Carica il PDF della tua scheda, controlla giorni ed esercizi estratti, correggi e salva. Diventerà la scheda attiva." />

      <form onSubmit={upload} className="glass-card space-y-3 rounded-[1.6rem] p-5">
        <input name="pdf" type="file" accept="application/pdf" className="w-full rounded-2xl border border-dashed border-slate-300 bg-white p-5" />
        <button disabled={busy} className="min-h-12 w-full rounded-2xl bg-slate-950 font-black text-white">{busy ? 'Analizzo…' : 'Analizza PDF'}</button>
      </form>

      {msg ? <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">{msg}</p> : null}

      {rows.length > 0 ? (
        <div className="space-y-3">
          <label className="block"><span className="text-sm font-black">Nome scheda</span>
            <input value={planName} onChange={(e) => setPlanName(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-bold" /></label>

          <div className="flex items-center justify-between">
            <h3 className="font-black">Esercizi estratti: {rows.length}</h3>
            <button onClick={addRow} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-black">+ riga</button>
          </div>

          {rows.map((row, i) => (
            <article key={i} className="glass-card rounded-[1.4rem] p-3">
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <label>Giorno
                  <input list="day-opts" value={row.day || ''} onChange={(e) => update(i, 'day', e.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 px-2" />
                </label>
                <label className="col-span-2 sm:col-span-2">Esercizio<input value={row.exercise || ''} onChange={(e) => update(i, 'exercise', e.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 px-2" /></label>
                <label>Muscolo<input value={row.primaryMuscle || ''} onChange={(e) => update(i, 'primaryMuscle', e.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 px-2" /></label>
                <label>Serie<input type="number" value={row.sets || 0} onChange={(e) => update(i, 'sets', Number(e.target.value))} className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 px-2" /></label>
                <label>Reps<input value={row.reps || ''} onChange={(e) => update(i, 'reps', e.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 px-2" /></label>
                <label>Rec. s<input type="number" value={row.rest || 0} onChange={(e) => update(i, 'rest', Number(e.target.value))} className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 px-2" /></label>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-orange-600">Conf. {Math.round((row.confidence || 0) * 100)}%</span>
                <button onClick={() => removeRow(i)} className="rounded-lg bg-red-50 px-2 py-1 text-xs font-black text-red-600">Rimuovi</button>
              </div>
            </article>
          ))}
          <datalist id="day-opts">{DAY_OPTS.map((d) => <option key={d} value={d} />)}</datalist>

          <button onClick={save} disabled={busy} className="min-h-12 w-full rounded-2xl bg-emerald-600 font-black text-white">Salva scheda</button>
        </div>
      ) : null}
    </div>
  );
}
