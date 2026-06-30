import { z } from 'zod';
import { aiJson, aiAvailable } from './provider';
import { DIET_PDF_SYSTEM, dietPdfUser } from './prompts';
import { extractDietRows, type ExtractedDietMeal } from '@/lib/pdf';
import { enrichRows } from '@/lib/foods';

const rowSchema = z.object({
  day: z.string().default('tutti'),
  mealType: z.string().default('Pasto'),
  food: z.string().min(1),
  quantity: z.coerce.string().default(''),
  calories: z.coerce.number().nonnegative().default(0),
  proteinG: z.coerce.number().nonnegative().default(0),
  carbsG: z.coerce.number().nonnegative().default(0),
  fatG: z.coerce.number().nonnegative().default(0),
  notes: z.string().default(''),
  confidence: z.coerce.number().min(0).max(1).default(0.6),
});
const responseSchema = z.object({ rows: z.array(rowSchema) });

export type DietExtractResult = { rows: ExtractedDietMeal[]; provider: string };

// Extract diet rows from raw PDF text. The result is ALWAYS returned to the
// user for review before saving — never persisted directly.
export async function extractDietFromPdf(text: string): Promise<DietExtractResult> {
  const clean = String(text || '').trim();
  if (!clean) return { rows: [], provider: 'none' };

  if (aiAvailable()) {
    const raw = await aiJson(DIET_PDF_SYSTEM, dietPdfUser(clean));
    const parsed = responseSchema.safeParse(raw);
    if (parsed.success && parsed.data.rows.length > 0) {
      // Riempie eventuali macro/kcal mancanti anche sull'output AI.
      return { rows: enrichRows(parsed.data.rows) as ExtractedDietMeal[], provider: 'ai' };
    }
  }

  // Rule-based + stima nutrizionale dei valori mancanti.
  return { rows: enrichRows(extractDietRows(clean)), provider: 'local-heuristic' };
}
