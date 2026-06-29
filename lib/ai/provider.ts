// AI provider abstraction.
// AI_PROVIDER=none|openai|local. Without a key/provider the app falls back
// to the rule-based heuristics, so nothing ever breaks.

export type AIProvider = 'none' | 'openai' | 'local';

export function getProviderConfig() {
  const provider = (process.env.AI_PROVIDER || 'none') as AIProvider;
  const apiKey = process.env.AI_API_KEY || '';
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  // OpenAI-compatible base URL (also works for local servers like Ollama/LM Studio).
  const baseUrl = process.env.AI_BASE_URL || (provider === 'openai' ? 'https://api.openai.com/v1' : 'http://localhost:11434/v1');
  return { provider, apiKey, model, baseUrl };
}

export function aiAvailable(): boolean {
  const { provider, apiKey } = getProviderConfig();
  if (provider === 'none') return false;
  if (provider === 'openai') return Boolean(apiKey);
  return true; // local: assume reachable
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
