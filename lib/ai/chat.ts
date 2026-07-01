import { getProviderConfig, aiAvailable, isReasoningModel } from './provider';
import { TOOL_DEFINITIONS, executeTool } from './chatTools';
import { getProfile, getTodayMeals } from '@/lib/repositories';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };
export type ChatAction = { name: string; ok: boolean; summary: string };
export type ChatResult = { reply: string; actions: ChatAction[] };

function systemPrompt(): string {
  const p = getProfile();
  const meals = getTodayMeals();
  const mealsList = meals.length ? meals.map((m) => `${m.mealType}: ${m.name} (${Math.round(m.calories)} kcal)${m.status && m.status !== 'previsto' ? ` [${m.status}]` : ''}`).join('; ') : 'nessun pasto pianificato per oggi';
  return `Sei il coach personale dentro l'app FitControl (fitness, dieta, progressi). Rispondi in italiano, in tono amichevole e diretto, come un personal trainer.

Profilo utente: ${p.name}, obiettivo ${p.goal || 'non impostato'}, target ${p.dailyCalorieTarget} kcal / ${p.proteinTargetG}p / ${p.carbsTargetG}c / ${p.fatTargetG}f, acqua target ${p.waterTargetL} L.
Pasti di oggi: ${mealsList}.

Hai a disposizione delle funzioni per eseguire azioni concrete quando l'utente te lo chiede esplicitamente: sostituire un pasto di oggi, segnarlo mangiato/saltato, aggiornare dati/obiettivi del profilo, registrare acqua bevuta o una misura corporea (peso sulla bilancia, ecc.).
Regole:
- Esegui l'azione richiesta chiamando la funzione giusta, non limitarti a descriverla.
- Se manca un'informazione indispensabile (es. quale pasto, quale valore) chiedila prima di agire, non inventarla.
- update_profile serve per target/obiettivi del profilo; log_body_metric serve per un valore misurato oggi (es. il peso sulla bilancia). Non confonderli.
- Dopo aver eseguito una funzione conferma brevemente in una frase cosa hai fatto, senza tecnicismi.
- Se la richiesta non richiede nessuna azione, rispondi semplicemente alla domanda.`;
}

export async function runChat(history: ChatMessage[]): Promise<ChatResult> {
  if (!aiAvailable()) {
    return { reply: 'Per usare la chat devi prima configurare un provider AI in Profilo → Assistente AI (serve per capire ed eseguire le richieste in linguaggio naturale).', actions: [] };
  }
  const { apiKey, model, baseUrl } = getProviderConfig();
  const reasoning = isReasoningModel(model);
  const messages: any[] = [{ role: 'system', content: systemPrompt() }, ...history];
  const actions: ChatAction[] = [];

  for (let round = 0; round < 4; round++) {
    const body: Record<string, unknown> = { model, messages, tools: TOOL_DEFINITIONS, tool_choice: 'auto' };
    if (!reasoning) body.temperature = 0.3;
    let res: Response;
    try {
      res = await fetch(baseUrl.replace(/\/$/, '') + '/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(apiKey ? { Authorization: 'Bearer ' + apiKey } : {}) },
        body: JSON.stringify(body),
      });
    } catch (e: any) {
      return { reply: `Errore di rete verso il provider AI: ${e?.message || 'sconosciuto'}.`, actions };
    }
    if (!res.ok) {
      const errorText = (await res.text().catch(() => '')).slice(0, 300);
      return { reply: `Errore ${res.status} dal provider AI${errorText ? ': ' + errorText : '.'}`, actions };
    }
    const data = await res.json();
    const msg = data?.choices?.[0]?.message;
    if (!msg) return { reply: 'Nessuna risposta dal provider AI.', actions };

    const toolCalls = msg.tool_calls as Array<{ id: string; function: { name: string; arguments: string } }> | undefined;
    if (!toolCalls || toolCalls.length === 0) {
      return { reply: msg.content || 'Fatto.', actions };
    }

    messages.push({ role: 'assistant', content: msg.content || null, tool_calls: toolCalls });
    for (const call of toolCalls) {
      let args: any = {};
      try { args = JSON.parse(call.function.arguments || '{}'); } catch { /* args resta {} */ }
      const result = await executeTool(call.function.name, args);
      actions.push({ name: call.function.name, ok: !!result?.ok, summary: result?.summary || result?.error || '' });
      messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) });
    }
  }
  return { reply: 'Ho eseguito le azioni richieste.', actions };
}
