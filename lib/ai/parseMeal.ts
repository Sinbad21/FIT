import { z } from 'zod';
import { aiJson, aiAvailable } from './provider';
import { MEAL_SYSTEM, mealUser } from './prompts';
import { parseMealHeuristically, type ParsedFood } from '@/lib/ai';

const itemSchema = z.object({
  name: z.string().min(1),
  quantity: z.coerce.number().nonnegative(),
  unit: z.string().default('g'),
  calories: z.coerce.number().nonnegative(),
  proteinG: z.coerce.number().nonnegative(),
  carbsG: z.coerce.number().nonnegative(),
  fatG: z.coerce.number().nonnegative(),
  confidence: z.coerce.number().min(0).max(1).default(0.6),
});
const responseSchema = z.object({ items: z.array(itemSchema) });

export type MealParseResult = { items: ParsedFood[]; provider: string; needsConfirmation: boolean };

export async function parseMeal(text: string): Promise<MealParseResult> {
  const clean = String(text || '').trim();
  if (!clean) return { items: [], provider: 'none', needsConfirmation: true };

  if (aiAvailable()) {
    const raw = await aiJson(MEAL_SYSTEM, mealUser(clean));
    const parsed = responseSchema.safeParse(raw);
    if (parsed.success && parsed.data.items.length > 0) {
      const items: ParsedFood[] = parsed.data.items.map((i) => ({
        name: i.name, quantity: i.quantity, unit: i.unit,
        calories: Math.round(i.calories), proteinG: +i.proteinG.toFixed(1), carbsG: +i.carbsG.toFixed(1), fatG: +i.fatG.toFixed(1),
        confidence: i.confidence, needsConfirmation: i.confidence < 0.8,
      }));
      return { items, provider: 'ai', needsConfirmation: true };
    }
  }

  // Fallback rule-based: always requires user confirmation.
  return { items: parseMealHeuristically(clean), provider: 'local-heuristic', needsConfirmation: true };
}
