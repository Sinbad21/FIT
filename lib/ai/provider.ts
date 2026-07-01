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

export async function testAIConnection(): Promise<{ ok: boolean; message: string }> {
  if (!aiAvailable()) return { ok: false, message: 'Provider non configurato o chiave API mancante.' };
  const raw = await aiJson('Rispondi SOLO con questo JSON esatto, senza altro testo: {"pong":true}', 'ping');
  if (raw && raw.pong === true) return { ok: true, message: 'Connessione riuscita: il provider AI risponde correttamente.' };
  return { ok: false, message: 'Nessuna risposta valida dal provider. Controlla chiave, modello e URL.' };
}

/**
 * Ask the model for a JSON object. Returns the parsed JSON or null on any
 * failure (network, parse, provider off) so callers can fall back gracefully.
 */
export async function aiJson(system: string, user: string): Promise<any | null> {
  if (!aiAvailable()) return null;
  const { apiKey, model, baseUrl } = getProviderConfig();
  try {
    const res = await fetch(baseUrl.replace(/\/$/, '') + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(apiKey ? { Authorization: 'Bearer ' + apiKey } : {}) },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content);
  } catch {
    return null;
  }
}
