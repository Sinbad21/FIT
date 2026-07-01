// Funzioni che l'assistente della chat può eseguire concretamente sui dati
// dell'utente (function/tool calling OpenAI-compatible). Riusano le stesse
// repository già usate dai bottoni dell'interfaccia, cosi le due strade
// restano coerenti.
import { getTodayMeals, editPlannedMeal, markMeal, getProfileRaw, updateProfile, addWater, setWater, addBodyMetric } from '@/lib/repositories';
import { enrichRow, gramsFromText } from '@/lib/foods';

function normalize(s: string) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function findTodayMeal(mealType: string) {
  const target = normalize(mealType);
  if (!target) return null;
  const meals = getTodayMeals();
  return meals.find((m) => normalize(m.mealType).includes(target) || target.includes(normalize(m.mealType))) || null;
}

function toolReplaceTodayMeal(args: any) {
  const meal = findTodayMeal(args.mealType);
  if (!meal) return { ok: false, error: `Nessun pasto "${args.mealType}" trovato tra quelli previsti oggi.` };
  if (!args.newName) return { ok: false, error: 'Manca il nome del nuovo alimento.' };
  // enrichRow riempie SOLO i valori che l'AI non ha già fornito, usando il
  // piccolo dizionario nutrizionale locale come rete di sicurezza.
  const enriched: any = enrichRow({
    name: args.newName,
    quantity: args.quantity ? `${args.quantity} ${args.unit || 'g'}` : '',
    calories: args.calories, proteinG: args.proteinG, carbsG: args.carbsG, fatG: args.fatG,
  });
  const grams = Number(args.quantity) || gramsFromText(enriched.quantity || '') || 100;
  editPlannedMeal({
    plannedMealId: meal.id, replace: true, name: args.newName,
    quantity: grams, unit: args.unit || 'g',
    calories: enriched.calories, proteinG: enriched.proteinG, carbsG: enriched.carbsG, fatG: enriched.fatG,
  });
  return { ok: true, summary: `${meal.mealType}: "${meal.name}" sostituito con "${args.newName}" (${Math.round(enriched.calories || 0)} kcal, ${grams} ${args.unit || 'g'}).` };
}

function toolSetMealStatus(args: any) {
  const meal = findTodayMeal(args.mealType);
  if (!meal) return { ok: false, error: `Nessun pasto "${args.mealType}" trovato tra quelli previsti oggi.` };
  if (args.status !== 'mangiato' && args.status !== 'saltato') return { ok: false, error: 'Status non valido: usa "mangiato" o "saltato".' };
  markMeal({ plannedMealId: meal.id, status: args.status });
  return { ok: true, summary: `${meal.mealType} ("${meal.name}") segnato come ${args.status}.` };
}

const PROFILE_FIELDS = ['weightKg', 'heightCm', 'age', 'goal', 'targetWeightKg', 'activityLevel', 'trainingDaysPerWeek', 'trainingLevel', 'dailyCalorieTarget', 'proteinTargetG', 'carbsTargetG', 'fatTargetG', 'waterTargetL', 'foodPreferences', 'foodsToAvoid', 'allergies', 'availableEquipment'];

function toolUpdateProfile(args: any) {
  const patch: Record<string, any> = {};
  for (const k of PROFILE_FIELDS) if (args[k] !== undefined && args[k] !== null && args[k] !== '') patch[k] = args[k];
  if (Object.keys(patch).length === 0) return { ok: false, error: 'Nessun campo valido da aggiornare.' };
  const current: any = getProfileRaw();
  const merged = {
    name: current.name, age: current.age, heightCm: current.height_cm, weightKg: current.weight_kg, sex: current.sex,
    goal: current.goal, targetWeightKg: current.target_weight_kg, activityLevel: current.activity_level, trainingDaysPerWeek: current.training_days_per_week,
    dailyCalorieTarget: current.daily_calorie_target, proteinTargetG: current.protein_target_g, carbsTargetG: current.carbs_target_g, fatTargetG: current.fat_target_g, waterTargetL: current.water_target_l,
    foodPreferences: current.food_preferences, foodsToAvoid: current.foods_to_avoid, allergies: current.allergies, availableEquipment: current.available_equipment, trainingLevel: current.training_level,
    ...patch,
  };
  updateProfile(merged);
  return { ok: true, summary: `Profilo aggiornato (${Object.entries(patch).map(([k, v]) => `${k}: ${v}`).join(', ')}).` };
}

function toolLogWater(args: any) {
  if (args.setL !== undefined) {
    const r = setWater(Number(args.setL));
    return { ok: true, summary: `Acqua di oggi impostata a ${r.waterL} L.` };
  }
  if (args.deltaL !== undefined) {
    const r = addWater(Number(args.deltaL));
    return { ok: true, summary: `Acqua aggiornata (${args.deltaL >= 0 ? '+' : ''}${args.deltaL} L): totale oggi ${r.waterL} L.` };
  }
  return { ok: false, error: 'Specifica deltaL (quanto aggiungere) o setL (totale assoluto).' };
}

function toolLogBodyMetric(args: any) {
  const fields = ['weightKg', 'waistCm', 'chestCm', 'armCm', 'thighCm', 'bodyFatPercent', 'sleepHours', 'steps'];
  const provided = fields.filter((k) => args[k] !== undefined && args[k] !== null && args[k] !== '');
  if (provided.length === 0) return { ok: false, error: 'Nessuna misura fornita.' };
  addBodyMetric(args);
  return { ok: true, summary: `Misura di oggi registrata (${provided.map((k) => `${k}: ${args[k]}`).join(', ')}).` };
}

export async function executeTool(name: string, args: any): Promise<any> {
  try {
    switch (name) {
      case 'replace_today_meal': return toolReplaceTodayMeal(args || {});
      case 'set_meal_status': return toolSetMealStatus(args || {});
      case 'update_profile': return toolUpdateProfile(args || {});
      case 'log_water': return toolLogWater(args || {});
      case 'log_body_metric': return toolLogBodyMetric(args || {});
      default: return { ok: false, error: `Funzione sconosciuta: ${name}` };
    }
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Errore durante l\'esecuzione.' };
  }
}

export const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'replace_today_meal',
      description: "Sostituisce un pasto previsto oggi con un alimento diverso. Se calorie/macro non sono forniti, vengono stimati automaticamente.",
      parameters: {
        type: 'object',
        properties: {
          mealType: { type: 'string', description: 'Tipo di pasto da sostituire, come appare nella dieta di oggi (es. colazione, pranzo, cena, spuntino).' },
          newName: { type: 'string', description: 'Nome del nuovo alimento o piatto.' },
          quantity: { type: 'number', description: 'Quantità in grammi o millilitri. Se omessa viene usata una porzione standard.' },
          unit: { type: 'string', description: 'Unità di misura ("g" o "ml"). Default "g".' },
          calories: { type: 'number', description: 'Calorie totali per la quantità indicata, se le conosci.' },
          proteinG: { type: 'number' },
          carbsG: { type: 'number' },
          fatG: { type: 'number' },
        },
        required: ['mealType', 'newName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_meal_status',
      description: 'Segna un pasto previsto oggi come mangiato o saltato (senza cambiarne il contenuto).',
      parameters: {
        type: 'object',
        properties: {
          mealType: { type: 'string', description: 'Tipo di pasto, come appare nella dieta di oggi.' },
          status: { type: 'string', enum: ['mangiato', 'saltato'] },
        },
        required: ['mealType', 'status'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_profile',
      description: "Aggiorna i dati e gli obiettivi del profilo (peso di riferimento, altezza, età, obiettivo, livello attività, giorni/livello di allenamento, target nutrizionali, preferenze o allergie alimentari). NON usarla per registrare il peso corporeo di oggi: per quello usa log_body_metric.",
      parameters: {
        type: 'object',
        properties: {
          weightKg: { type: 'number', description: 'Peso di riferimento nel profilo (non il log giornaliero).' },
          heightCm: { type: 'number' },
          age: { type: 'number' },
          goal: { type: 'string', enum: ['massa', 'definizione', 'forza', 'mantenimento', 'ricomposizione'] },
          targetWeightKg: { type: 'number' },
          activityLevel: { type: 'string', enum: ['sedentario', 'leggero', 'moderato', 'attivo', 'molto attivo'] },
          trainingDaysPerWeek: { type: 'number' },
          trainingLevel: { type: 'string', enum: ['principiante', 'intermedio', 'avanzato'] },
          dailyCalorieTarget: { type: 'number' },
          proteinTargetG: { type: 'number' },
          carbsTargetG: { type: 'number' },
          fatTargetG: { type: 'number' },
          waterTargetL: { type: 'number' },
          foodPreferences: { type: 'string' },
          foodsToAvoid: { type: 'string' },
          allergies: { type: 'string' },
          availableEquipment: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_water',
      description: "Registra l'acqua bevuta oggi: aggiungi una quantità (deltaL) o imposta il totale del giorno (setL).",
      parameters: {
        type: 'object',
        properties: {
          deltaL: { type: 'number', description: 'Litri da aggiungere (es. 0.5 per 500 ml). Può essere negativo per correggere.' },
          setL: { type: 'number', description: 'Imposta il totale assoluto di oggi in litri.' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_body_metric',
      description: "Registra una misura corporea REALE di oggi (peso sulla bilancia, vita, petto, braccio, coscia, % grasso, ore di sonno, passi). Usa questa per 'ho pesato 85kg oggi', non update_profile.",
      parameters: {
        type: 'object',
        properties: {
          weightKg: { type: 'number' },
          waistCm: { type: 'number' },
          chestCm: { type: 'number' },
          armCm: { type: 'number' },
          thighCm: { type: 'number' },
          bodyFatPercent: { type: 'number' },
          sleepHours: { type: 'number' },
          steps: { type: 'number' },
          notes: { type: 'string' },
        },
      },
    },
  },
] as const;
