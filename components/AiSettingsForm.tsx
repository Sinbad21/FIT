'use client';

import { useState } from 'react';

type Initial = { provider: string; model: string; baseUrl: string; hasKey: boolean; keyPreview: string };

export function AiSettingsForm({ initial }: { initial: Initial }) {
  const [provider, setProvider] = useState(initial.provider || 'none');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(initial.model || 'gpt-4o-mini');
  const [baseUrl, setBaseUrl] = useState(initial.baseUrl || '');
  const [hasKey, setHasKey] = useState(initial.hasKey);
  const [keyPreview, setKeyPreview] = useState(initial.keyPreview);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [test, setTest] = useState<{ ok: boolean; message: string } | null>(null);

  async function save() {
    setBusy(true); setMsg(''); setTest(null);
    const body: any = { provider, model, baseUrl };
    if (apiKey) body.apiKey = apiKey; // invia la chiave solo se l'utente l'ha effettivamente cambiata
    const r = await fetch('/api/settings/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json();
    setBusy(false);
    setHasKey(d.hasKey); setKeyPreview(d.keyPreview); setApiKey('');
    setMsg('Impostazioni salvate'); setTimeout(() => setMsg(''), 1500);
  }

  async function testConnection() {
    setBusy(true); setTest(null);
    const r = await fetch('/api/settings/ai/test', { method: 'POST' });
    setTest(await r.json());
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <section className="glass-card space-y-3 rounded-[1.6rem] p-4">
        <label className="block">
          <span className="text-xs font-bold text-gray-500">Provider</span>
          <select value={provider} onChange={(e) => setProvider(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3">
            <option value="none">Nessuno (solo regole locali)</option>
            <option value="openai">OpenAI (o compatibile)</option>
            <option value="local">Server locale (es. Ollama, LM Studio)</option>
          </select>
        </label>
        {provider !== 'none' ? (
          <>
            <label className="block">
              <span className="text-xs font-bold text-gray-500">Chiave API{hasKey ? ` (attuale: ${keyPreview})` : ''}</span>
              <input type="password" autoComplete="off" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={hasKey ? 'Lascia vuoto per non modificarla' : 'sk-...'} className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3" />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-gray-500">Modello</span>
              <input value={model} onChange={(e) => setModel(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3" />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-gray-500">Base URL (opzionale, per provider compatibili OpenAI)</span>
              <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.openai.com/v1" className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3" />
            </label>
          </>
        ) : (
          <p className="text-sm text-gray-500">Senza provider l'app usa comunque le stime locali (regole euristiche), senza inviare nulla a servizi esterni.</p>
        )}
      </section>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={save} disabled={busy} className="min-h-12 rounded-2xl bg-green-600 font-black text-white">{busy ? '…' : 'Salva'}</button>
        <button onClick={testConnection} disabled={busy || provider === 'none'} className="min-h-12 rounded-2xl bg-gray-950 font-black text-white disabled:opacity-40">Testa connessione</button>
      </div>
      {msg ? <p className="text-center text-sm font-bold text-green-600">{msg}</p> : null}
      {test ? <p className={`rounded-2xl px-4 py-3 text-sm font-bold ${test.ok ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-700'}`}>{test.message}</p> : null}
    </div>
  );
}
