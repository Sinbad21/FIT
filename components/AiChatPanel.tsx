'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CoachMascot } from './CoachMascot';

type Action = { name: string; ok: boolean; summary: string };
type Msg = { role: 'user' | 'assistant'; content: string; actions?: Action[] };

const WELCOME = 'Ciao, sono il tuo coach! Chiedimi ad esempio di sostituire un pasto di oggi, segnarlo mangiato o saltato, registrare l\'acqua bevuta o il peso, oppure aggiornare un obiettivo del profilo.';

export function AiChatPanel() {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: WELCOME }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const payload = next.slice(1).map((m) => ({ role: m.role, content: m.content })); // esclude il messaggio di benvenuto locale
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: payload }) });
      const d = await r.json();
      setMessages((s) => [...s, { role: 'assistant', content: d.reply || '...', actions: d.actions?.length ? d.actions : undefined }]);
      if (d.actions?.some((a: Action) => a.ok)) router.refresh();
    } catch {
      setMessages((s) => [...s, { role: 'assistant', content: 'Errore di connessione. Riprova.' }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-15rem)] flex-col gap-3">
      <div className="flex-1 space-y-3 overflow-y-auto pb-2">
        {messages.map((m, i) => m.role === 'assistant' ? (
          <CoachMascot
            key={i}
            message={
              <div>
                {m.content}
                {m.actions ? (
                  <ul className="mt-2 space-y-1">
                    {m.actions.map((a, j) => (
                      <li key={j} className={`text-xs font-bold ${a.ok ? 'text-green-600' : 'text-red-600'}`}>{a.ok ? '✓' : '✗'} {a.summary}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            }
          />
        ) : (
          <div key={i} className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-green-600 px-3 py-2 text-sm font-bold text-white">{m.content}</div>
          </div>
        ))}
        {busy ? <CoachMascot message="Sto pensando…" /> : null}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          placeholder="Es. sostituisci il pranzo con petto di pollo e riso"
          className="min-h-12 flex-1 rounded-2xl border border-gray-200 px-4"
        />
        <button onClick={send} disabled={busy || !input.trim()} className="min-h-12 rounded-2xl bg-green-600 px-5 font-black text-white disabled:opacity-40">Invia</button>
      </div>
    </div>
  );
}
