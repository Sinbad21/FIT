'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Exercise = {
  id: string; name: string; category?: string; primaryMuscle: string; secondaryMuscles?: string;
  equipment?: string; difficulty?: string; technicalNotes?: string; imageUrl?: string;
  imageSource?: string; imageLicense?: string; imagePrompt?: string;
};

const empty: Partial<Exercise> = { name: '', primaryMuscle: '', equipment: '', difficulty: 'intermedio', technicalNotes: '', imageUrl: '', imageSource: '', imageLicense: '', imagePrompt: '' };

export function ExerciseLibrary({ initial }: { initial: Exercise[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Exercise[]>(initial);
  const [q, setQ] = useState('');
  const [muscle, setMuscle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [editing, setEditing] = useState<Partial<Exercise> | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const muscles = useMemo(() => Array.from(new Set(items.map((e) => e.primaryMuscle).filter(Boolean))).sort(), [items]);
  const equipments = useMemo(() => Array.from(new Set(items.map((e) => e.equipment || '').filter(Boolean))).sort(), [items]);
  const difficulties = useMemo(() => Array.from(new Set(items.map((e) => e.difficulty || '').filter(Boolean))).sort(), [items]);

  const filtered = items.filter((e) =>
    (!q || e.name.toLowerCase().includes(q.toLowerCase())) &&
    (!muscle || e.primaryMuscle === muscle) &&
    (!equipment || e.equipment === equipment) &&
    (!difficulty || e.difficulty === difficulty)
  );

  async function reload() {
    const d = await fetch('/api/exercises').then((r) => r.json());
    setItems(d.exercises || []);
    router.refresh();
  }

  async function save() {
    if (!editing?.name?.trim()) { setErr('Il nome è obbligatorio'); return; }
    setBusy(true); setErr('');
    try {
      const method = editing.id ? 'PUT' : 'POST';
      const r = await fetch('/api/exercises', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) }).then((x) => x.json());
      if (r.ok) { setEditing(null); await reload(); } else setErr(r.error || 'Errore');
    } finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!confirm('Eliminare questo esercizio?')) return;
    const r = await fetch('/api/exercises', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).then((x) => x.json());
    if (r.ok) await reload(); else alert(r.error || 'Errore');
  }

  function set(k: keyof Exercise, v: string) { setEditing((e) => ({ ...(e || {}), [k]: v })); }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca esercizio…" className="min-h-11 flex-1 rounded-2xl border border-gray-200 px-4 font-bold" />
        <button onClick={() => { setEditing({ ...empty }); setErr(''); }} className="min-h-11 rounded-2xl bg-green-600 px-4 font-black text-white">+ Nuovo</button>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <select value={muscle} onChange={(e) => setMuscle(e.target.value)} className="min-h-11 rounded-xl border border-gray-200 px-2"><option value="">Muscolo</option>{muscles.map((m) => <option key={m} value={m}>{m}</option>)}</select>
        <select value={equipment} onChange={(e) => setEquipment(e.target.value)} className="min-h-11 rounded-xl border border-gray-200 px-2"><option value="">Attrezzo</option>{equipments.map((m) => <option key={m} value={m}>{m}</option>)}</select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="min-h-11 rounded-xl border border-gray-200 px-2"><option value="">Difficoltà</option>{difficulties.map((m) => <option key={m} value={m}>{m}</option>)}</select>
      </div>

      <p className="text-xs text-gray-500">{filtered.length} esercizi · gli esercizi qui disponibili compaiono nel menu &quot;Aggiungi esercizio&quot; della scheda settimanale.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((e) => (
          <article key={e.id} className="glass-card overflow-hidden rounded-[1.6rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.imageUrl || '/exercise-placeholder.svg'} alt={e.name} className="aspect-video w-full object-cover" onError={(ev) => { (ev.target as HTMLImageElement).src = '/exercise-placeholder.svg'; }} />
            <div className="p-4">
              <h3 className="font-black">{e.name}</h3>
              <p className="text-sm text-gray-600">{e.primaryMuscle}{e.equipment ? ' · ' + e.equipment : ''}{e.difficulty ? ' · ' + e.difficulty : ''}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => { setEditing(e); setErr(''); }} className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">Modifica</button>
                <button onClick={() => remove(e.id)} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-500">Elimina</button>
              </div>
            </div>
          </article>
        ))}
        {filtered.length === 0 ? <p className="glass-card rounded-[1.5rem] p-4 text-gray-600">Nessun esercizio trovato.</p> : null}
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center" onClick={() => setEditing(null)}>
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[1.6rem] bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-lg font-black">{editing.id ? 'Modifica esercizio' : 'Nuovo esercizio'}</h4>
            <div className="mt-3 space-y-2 text-sm">
              <label className="block">Nome*<input value={editing.name || ''} onChange={(e) => set('name', e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3 font-bold" /></label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">Muscolo<input value={editing.primaryMuscle || ''} onChange={(e) => set('primaryMuscle', e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3" /></label>
                <label className="block">Attrezzo<input value={editing.equipment || ''} onChange={(e) => set('equipment', e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3" /></label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">Difficoltà
                  <select value={editing.difficulty || 'intermedio'} onChange={(e) => set('difficulty', e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-2">
                    {['principiante', 'intermedio', 'avanzato'].map((d) => <option key={d} value={d}>{d}</option>)}
                  </select></label>
                <label className="block">Muscoli sec.<input value={editing.secondaryMuscles || ''} onChange={(e) => set('secondaryMuscles', e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3" /></label>
              </div>
              <label className="block">Note tecniche<textarea value={editing.technicalNotes || ''} onChange={(e) => set('technicalNotes', e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2" rows={2} /></label>
              <label className="block">URL immagine<input value={editing.imageUrl || ''} onChange={(e) => set('imageUrl', e.target.value)} placeholder="/exercises/nome.svg o https://…" className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3" /></label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">Fonte img<input value={editing.imageSource || ''} onChange={(e) => set('imageSource', e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3" /></label>
                <label className="block">Licenza img<input value={editing.imageLicense || ''} onChange={(e) => set('imageLicense', e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3" /></label>
              </div>
              <label className="block">Prompt AI immagine (futuro)<input value={editing.imagePrompt || ''} onChange={(e) => set('imagePrompt', e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3" /></label>
            </div>
            {err ? <p className="mt-2 text-sm font-bold text-red-500">{err}</p> : null}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setEditing(null)} className="min-h-11 rounded-2xl bg-gray-100 font-black">Annulla</button>
              <button disabled={busy} onClick={save} className="min-h-11 rounded-2xl bg-green-600 font-black text-white">{busy ? '…' : 'Salva'}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
