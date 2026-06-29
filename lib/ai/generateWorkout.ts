import { z } from 'zod';
import { aiJson, aiAvailable } from './provider';
import { WORKOUT_SYSTEM, workoutUser } from './prompts';

const exerciseSchema = z.object({
  name: z.string().min(1),
  primaryMuscle: z.string().default('Generico'),
  sets: z.coerce.number().int().positive().default(3),
  reps: z.string().default('8-12'),
  restSeconds: z.coerce.number().int().nonnegative().default(75),
  note: z.string().default(''),
});
const daySchema = z.object({
  title: z.string().min(1),
  focus: z.string().default(''),
  dayOfWeek: z.coerce.number().int().min(0).max(6).default(1),
  exercises: z.array(exerciseSchema),
});
const planSchema = z.object({ name: z.string().default('Scheda AI'), days: z.array(daySchema) });

export type GeneratedPlan = z.infer<typeof planSchema>;
export type GenerateWorkoutResult = { plan: GeneratedPlan | null; provider: string };

export type GenerateWorkoutInput = { goal: string; daysPerWeek: number; level: string; equipment: string; limitations?: string; priorityMuscles?: string };

// Returns a structured, editable plan. When AI is unavailable returns null so
// the caller falls back to the existing rule-based generatePlan (DB-backed).
export async function generateWorkout(input: GenerateWorkoutInput): Promise<GenerateWorkoutResult> {
  if (!aiAvailable()) return { plan: null, provider: 'none' };
  const raw = await aiJson(WORKOUT_SYSTEM, workoutUser(input));
  const parsed = planSchema.safeParse(raw);
  if (parsed.success && parsed.data.days.length > 0) return { plan: parsed.data, provider: 'ai' };
  return { plan: null, provider: 'none' };
}
