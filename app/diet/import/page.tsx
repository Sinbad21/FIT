'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';

export default function DietImportPage() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = (e.currentTarget.elements.namedItem('pdf') as HTMLInputElement);
    if (!input.files || !input.files[0]) return;
    setBusy(true); setMsg('');
    const fd = new FormData(); fd.append('pdf', input.files[0]);
    const r = await fetch('/api/diet/pdf/import', { method: 'POST', body: fd });
    const d = await r.json();
    setBusy(false);
    if (d.error) { setMsg(d.error); return; }
    setFileName(d.fileName); setRows(d.rows || []);
    if ((d.rows || []).length === 0) setMsg('Nessun pasto riconosciuto automaticamente: puoi aggiungere righe manualmente.');
  }

  function update(i: number, key: string, value: any) { setRows((rs) => rs.map((r, idx) => idx === i ? { ...r, [key]: value } : r)); }
  function addRow() { setRows((rs) => [...rs, { day: 'tutti', mealType: 'Pasto', food: '', quantity: '', calories: 0, proteinG: 0, carbsG: 0, fatG: 0, confidence: 1 }]); }
  function removeRow(i: number) { setRows((rs) => rs.filter((_, idx) => idx !== i)); }

  async function save() {
    setBusy(true);
    const r = await fetch('/api/diet/pdf/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName, name: 'Dieta importata', rows }) });
    const d = await r.json();
    setBusy(false);
    if (d.ok) { setMsg('Dieta salvata e attivata.'); setTimeout(() => router.push('/diet'), 1000); }
  }

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="PDF dieta" title="Importa e revisiona" description="Carica il PDF, controlla la tabella estratta, correggi e salva. La parte AI/OCR avanzata e collegabile in seguito." />
      <form onSubmit={upload} className="glass-card space-y-3 rounded-[1.6rem] p-5">
        <input name="pdf" type="file" accept="application/pdf" className="w-full rounded-2xl border border-dashed border-slate-300 bg-white p-5" />
        <button disabled={busy} className="min-h-12 w-full rounded-2xl bg-slate-950 font-black text-white">{busy ? 'Analizzo...' : 'Analizza PDF'}</button>
      </form>
      {msg ? <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">{msg}</p> : null}
      {rows.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black">Righe estratte: {rows.length}</h3>
            <button onClick={addRow} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-black">+ riga</button>
          </div>
          {rows.map((row, i) => (
            <article key={i} className="glass-card rounded-[1.4rem] p-3">
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <label>Giorno<input value={row.day || ''} onChange={(e) => update(i, 'day', e.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 px-2" /></label>
                <label>Pasto<input value={row.mealType || ''} onChange={(e) => update(i, 'mealType', e.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 px-2" /></label>
                <label className="col-span-2">Alimento<input value={row.food || ''} onChange={(e) => update(i, 'food', e.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 px-2" /></label>
                <label>Qta<input value={row.quantity || ''} onChange={(e) => update(i, 'quantity', e.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 px-2" /></label>
                <label>Kcal<input type="number" value={row.calories || 0} onChange={(e) => update(i, 'calories', Number(e.target.value))} className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 px-2" /></label>
                <label>Pro<input type="number" value={row.proteinG || 0} onChange={(e) => update(i, 'proteinG', Number(e.target.value))} className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 px-2" /></label>
                <label>Carb<input type="number" value={row.carbsG || 0} onChange={(e) => update(i, 'carbsG', Number(e.target.value))} className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 px-2" /></label>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-orange-600">Conf. {Math.round((row.confidence || 0) * 100)}%</span>
                <button onClick={() => removeRow(i)} className="rounded-lg bg-red-50 px-2 py-1 text-xs font-black text-red-600">Rimuovi</button>
              </div>
            </article>
          ))}
          <button onClick={save} disabled={busy} className="min-h-12 w-full rounded-2xl bg-emerald-600 font-black text-white">Salva dieta</button>
        </div>
      ) : null}
    </div>
  );
}
