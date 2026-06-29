'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';

export default function AiMealPage() {
  const router = useRouter();
  const [text, setText] = useState('oggi ho mangiato 100 g di pasta, 150 g di pollo e una mela');
  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function parse() {
    setBusy(true); setMsg('');
    const r = await fetch('/api/diet/ai/parse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
    const d = await r.json();
    setRows(d.items || []);
    setBusy(false);
    if ((d.items || []).length === 0) setMsg('Nessun alimento riconosciuto. Riformula o aggiungi manualmente.');
  }
  function update(i: number, key: string, value: any) { setRows((rs) => rs.map((r, idx) => idx === i ? { ...r, [key]: value } : r)); }
  function removeRow(i: number) { setRows((rs) => rs.filter((_, idx) => idx !== i)); }
  async function save() {
    setBusy(true);
    const r = await fetch('/api/diet/ai/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: rows }) });
    const d = await r.json();
    setBusy(false);
    if (d.ok) { setMsg('Salvati ' + d.count + ' alimenti.'); setTimeout(() => router.push('/diet'), 1000); }
  }

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="AI food log" title="Inserimento con frase libera" description="Scrivi cosa hai mangiato. L'app propone una tabella con macro e confidenza: confermi o correggi prima di salvare." />
      <section className="glass-card space-y-4 rounded-[1.6rem] p-5">
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-32 w-full rounded-2xl border border-slate-200 p-4" />
        <button onClick={parse} disabled={busy} className="min-h-12 w-full rounded-2xl bg-slate-950 font-black text-white">Interpreta frase</button>
      </section>
      {msg ? <p className="rounded-2xl bg-amber-100 px-4 py-3 text-sm font-bold text-amber-700">{msg}</p> : null}
      {rows.length > 0 ? (
        <div className="space-y-3">
          {rows.map((row, i) => (
            <article key={i} className="glass-card rounded-[1.4rem] p-3">
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                <label className="col-span-2 sm:col-span-1">Alimento<input value={row.name} onChange={(e) => update(i, 'name', e.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 px-2" /></label>
                <label>Qta<input value={row.quantity} onChange={(e) => update(i, 'quantity', Number(e.target.value))} className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 px-2" /></label>
                <label>Unita<input value={row.unit} onChange={(e) => update(i, 'unit', e.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 px-2" /></label>
                <label>Kcal<input type="number" value={row.calories} onChange={(e) => update(i, 'calories', Number(e.target.value))} className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 px-2" /></label>
                <label>Pro<input type="number" value={row.proteinG} onChange={(e) => update(i, 'proteinG', Number(e.target.value))} className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 px-2" /></label>
                <label>Carb<input type="number" value={row.carbsG} onChange={(e) => update(i, 'carbsG', Number(e.target.value))} className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 px-2" /></label>
                <label>Fat<input type="number" value={row.fatG} onChange={(e) => update(i, 'fatG', Number(e.target.value))} className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 px-2" /></label>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className={'text-xs font-bold ' + (row.needsConfirmation ? 'text-orange-600' : 'text-emerald-600')}>Conf. {Math.round((row.confidence || 0) * 100)}% {row.needsConfirmation ? '· verifica' : ''}</span>
                <button onClick={() => removeRow(i)} className="rounded-lg bg-rose-100 px-2 py-1 text-xs font-black text-rose-600">Rimuovi</button>
              </div>
            </article>
          ))}
          <button onClick={save} disabled={busy} className="min-h-12 w-full rounded-2xl bg-emerald-500 font-black text-white">Conferma e salva</button>
        </div>
      ) : null}
    </div>
  );
}
