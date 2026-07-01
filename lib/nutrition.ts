export type NutritionInput = { sex?: string; age?: number | string; heightCm?: number | string; weightKg?: number | string; targetWeightKg?: number | string; goal?: string; activityLevel?: string };
export type NutritionTargets = { dailyCalorieTarget: number; proteinTargetG: number; carbsTargetG: number; fatTargetG: number; waterTargetL: number };

const ACTIVITY_FACTORS: Record<string, number> = { sedentario: 1.2, leggero: 1.375, moderato: 1.55, attivo: 1.725, 'molto attivo': 1.9 };
const GOAL_CALORIE_ADJUST: Record<string, number> = { definizione: -0.2, ricomposizione: -0.1, mantenimento: 0, massa: 0.12, forza: 0.05 };
const GOAL_PROTEIN_PER_KG: Record<string, number> = { definizione: 2.2, ricomposizione: 2, mantenimento: 1.8, massa: 1.9, forza: 2 };

// Stima locale (sempre disponibile, nessuna AI richiesta) basata sulla formula
// di Mifflin-St Jeor per il metabolismo basale + fattore di attività + aggiustamento per obiettivo.
export function estimateNutritionTargets(input: NutritionInput): NutritionTargets {
  const weight = Number(input.weightKg) || 70;
  const height = Number(input.heightCm) || 170;
  const age = Number(input.age) || 30;
  const female = String(input.sex || '').trim().toLowerCase().startsWith('f');
  const goal = String(input.goal || 'mantenimento').trim().toLowerCase();
  const activity = String(input.activityLevel || 'moderato').trim().toLowerCase();

  const bmr = 10 * weight + 6.25 * height - 5 * age + (female ? -161 : 5);
  const tdee = bmr * (ACTIVITY_FACTORS[activity] ?? 1.55);
  const adjust = GOAL_CALORIE_ADJUST[goal] ?? 0;
  const calories = Math.max(1200, Math.round((tdee * (1 + adjust)) / 10) * 10);

  const protein = Math.round(weight * (GOAL_PROTEIN_PER_KG[goal] ?? 2));
  const fat = Math.round((calories * 0.27) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  const water = Math.round(weight * 0.035 * 10) / 10;

  return { dailyCalorieTarget: calories, proteinTargetG: protein, carbsTargetG: carbs, fatTargetG: fat, waterTargetL: water };
}
