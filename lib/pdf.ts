export type ExtractedDietMeal = {
  day: string;
  mealType: string;
  food: string;
  quantity: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  notes: string;
  confidence: number;
};

const MEAL_TYPES = ['colazione', 'spuntino', 'pranzo', 'merenda', 'cena', 'pre-nanna', 'pre nanna', 'spuntino pomeridiano'];
const DAYS = ['lunedi', 'lunedì', 'martedi', 'martedì', 'mercoledi', 'mercoledì', 'giovedi', 'giovedì', 'venerdi', 'venerdì', 'sabato', 'domenica'];

function num(re: RegExp, line: string): number {
  const m = line.match(re);
  return m ? Number(m[1].replace(',', '.')) : 0;
}

export function extractDietRows(text: string): ExtractedDietMeal[] {
  const rows: ExtractedDietMeal[] = [];
  let currentDay = '';
  let currentMeal = '';
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const lower = line.toLowerCase();
    const dayHit = DAYS.find((d) => lower === d || lower.startsWith(d + ' ') || lower.startsWith(d + ':'));
    if (dayHit) { currentDay = dayHit; continue; }
    const mealHit = MEAL_TYPES.find((m) => lower.startsWith(m));
    if (mealHit) {
      currentMeal = mealHit;
      const after = line.slice(mealHit.length).replace(/^[:\-\s]+/, '').trim();
      if (after) {
        rows.push(buildRow(currentDay, mealHit, after));
      }
      continue;
    }
    if (currentMeal && line.length > 1) {
      rows.push(buildRow(currentDay, currentMeal, line));
    }
  }
  return rows;
}

function buildRow(day: string, mealType: string, content: string): ExtractedDietMeal {
  const qty = content.match(/(\d+[.,]?\d*)\s*(g|gr|grammi|ml|kcal|porzion\w*|pz|fette?|cucchiai?)/i);
  const calories = num(/(\d+[.,]?\d*)\s*kcal/i, content);
  const proteinG = num(/(\d+[.,]?\d*)\s*g?\s*(?:di\s*)?prot/i, content);
  const carbsG = num(/(\d+[.,]?\d*)\s*g?\s*(?:di\s*)?carb/i, content);
  const fatG = num(/(\d+[.,]?\d*)\s*g?\s*(?:di\s*)?grass/i, content);
  let confidence = 0.4;
  if (qty) confidence += 0.2;
  if (calories) confidence += 0.2;
  if (proteinG || carbsG || fatG) confidence += 0.1;
  return {
    day: day || 'tutti',
    mealType: mealType.charAt(0).toUpperCase() + mealType.slice(1),
    food: content,
    quantity: qty ? qty[0] : '',
    calories,
    proteinG,
    carbsG,
    fatG,
    notes: '',
    confidence: Math.min(confidence, 0.95)
  };
}

// backward-compat
export const fallbackExtractDietRows = extractDietRows;
