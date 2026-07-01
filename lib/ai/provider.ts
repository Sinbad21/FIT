// AI provider abstraction.
// Settings can come from the app_settings table (configured in-app under
// Profilo → Assistente AI) or from env vars as a fallback. AI_PROVIDER=none
// or an unreachable provider always falls back to the rule-based heuristics,
// so nothing ever breaks.
import { getAppSetting, setAppSetting } from '@/lib/repositories';

export type AIProvider = 'none' | 'openai' | 'local';

export function getProviderConfig() {
  const provider = (getAppSetting('ai_provider') || process.env.AI_PROVIDER || 'none') as AIProvider;
  const dbKey = getAppSetting('ai_api_key');
  const apiKey = dbKey !== null ? dbKey : (process.env.AI_API_KEY || '');
  const model = getAppSetting('ai_model') || process.env.AI_MODEL || 'gpt-4o-mini';
  // OpenAI-compatible base URL (also works for local servers like Ollama/LM Studio).
  const baseUrl = getAppSetting('ai_base_url') || process.env.AI_BASE_URL || (provider === 'openai' ? 'https://api.openai.com/v1' : 'http://localhost:11434/v1');
  return { provider, apiKey, model, baseUrl };
}

export function aiAvailable(): boolean {
  const { provider, apiKey } = getProviderConfig();
  if (provider === 'none') return false;
  if (provider === 'openai') return Boolean(apiKey);
  return true; // local: assume reachable
}

export function updateAISettings(input: { provider?: string; apiKey?: string; model?: string; baseUrl?: string }) {
  if (typeof input.provider === 'string') setAppSetting('ai_provider', input.provider);
  if (typeof input.apiKey === 'string') setAppSetting('ai_api_key', input.apiKey);
  if (typeof input.model === 'string') setAppSetting('ai_model', input.model);
  if (typeof input.baseUrl === 'string') setAppSetting('ai_base_url', input.baseUrl);
  return getAISettingsForClient();
}

// Never send the raw key to the client: only whether one is set and a masked preview.
export function getAISettingsForClient() {
  const { provider, apiKey, model, baseUrl } = getProviderConfig();
  return { provider, model, baseUrl, hasKey: Boolean(apiKey), keyPreview: apiKey ? '••••' + apiKey.slice(-4) : '' };
}

// I modelli "reasoning" (o1/o3/o4-mini, gpt-5 e varianti come gpt-5.5, gpt-5-mini...)
// rifiutano con un 400 qualunque temperature diversa dal default: la omettiamo.
// Prefix match (non ancorato a "-"/fine stringa) per coprire anche i numeri di
// versione puntati (es. gpt-5.5, gpt-5.5-mini) che le versioni precedenti non intercettavano.
const REASONING_MODEL_RE = /^(o1|o3|o4|gpt-5)/i;
export function isReasoningModel(model: string): boolean {
  return REASONING_MODEL_RE.test(String(model || '').trim());
}

async function chatCompletion(system: string, user: string): Promise<{ ok: boolean; content?: string; status?: number; errorText?: string }> {
  const { apiKey, model, baseUrl } = getProviderConfig();
  const body: Record<string, unknown> = {
    model,
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    response_format: { type: 'json_object' },
  };
  if (!REASONING_MODEL_RE.test(model.trim())) body.temperature = 0.2;
  try {
    const res = await fetch(baseUrl.replace(/\/$/, '') + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(apiKey ? { Authorization: 'Bearer ' + apiKey } : {}) },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { ok: false, status: res.status, errorText: (await res.text().catch(() => '')).slice(0, 300) };
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    return content ? { ok: true, content } : { ok: false, errorText: 'Risposta del provider senza contenuto.' };
  } catch (e: any) {
    return { ok: false, errorText: e?.message || 'Errore di rete.' };
  }
}

export async function testAIConnection(): Promise<{ ok: boolean; message: string }> {
  if (!aiAvailable()) return { ok: false, message: 'Provider non configurato o chiave API mancante.' };
  const r = await chatCompletion('Rispondi SOLO con questo JSON esatto, senza altro testo: {"pong":true}', 'ping');
  if (r.ok && r.content) {
    try {
      if (JSON.parse(r.content)?.pong === true) return { ok: true, message: 'Connessione riuscita: il provider AI risponde correttamente.' };
    } catch {}
    return { ok: false, message: 'Il modello ha risposto ma non nel formato JSON atteso. Prova un altro modello.' };
  }
  if (r.status) return { ok: false, message: `Errore ${r.status} dal provider${r.errorText ? ': ' + r.errorText : '.'}` };
  return { ok: false, message: r.errorText || 'Nessuna risposta dal provider. Controlla chiave, modello e URL.' };
}

/**
 * Ask the model for a JSON object. Returns the parsed JSON or null on any
 * failure (network, parse, provider off) so callers can fall back gracefully.
 */
export async function aiJson(system: string, user: string): Promise<any | null> {
  if (!aiAvailable()) return null;
  const r = await chatCompletion(system, user);
  if (!r.ok || !r.content) return null;
  try {
    return JSON.parse(r.content);
  } catch {
    return null;
  }
}
