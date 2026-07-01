import { z } from 'zod';
import { aiJson, aiAvailable } from './provider';
import { NUTRITION_SYSTEM, nutritionUser } from './prompts';
import { estimateNutritionTargets, type NutritionInput } from '@/lib/nutrition';

const responseSchema = z.object({
  dailyCalorieTarget: z.coerce.number().positive(),
  proteinTargetG: z.coerce.number().positive(),
  carbsTargetG: z.coerce.number().nonnegative(),
  fatTargetG: z.coerce.number().nonnegative(),
  waterTargetL: z.coerce.number().positive(),
  note: z.string().default(''),
});

export type NutritionSuggestion = z.infer<typeof responseSchema> & { provider: 'ai' | 'local-heuristic' };

// Prova il provider AI configurato (se presente) per target personalizzati con una nota
// discorsiva; altrimenti calcola comunque una stima sensata in locale (Mifflin-St Jeor),
// così il questionario guidato funziona anche senza chiave AI configurata.
export async function suggestNutritionTargets(input: NutritionInput): Promise<NutritionSuggestion> {
  if (aiAvailable()) {
    const raw = await aiJson(NUTRITION_SYSTEM, nutritionUser(input));
    const parsed = responseSchema.safeParse(raw);
    if (parsed.success) return { ...parsed.data, provider: 'ai' };
  }
  return { ...estimateNutritionTargets(input), note: 'Stima calcolata in locale con la formula di Mifflin-St Jeor.', provider: 'local-heuristic' };
}
