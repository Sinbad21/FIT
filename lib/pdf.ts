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
        rows.push(...buildRows(currentDay, mealHit, after));
      }
      continue;
    }
    if (currentMeal && line.length > 1) {
      rows.push(...buildRows(currentDay, currentMeal, line));
    }
  }
  return rows;
}

// Quantity (number + unit) for a food segment.
function parseQty(s: string): { text: string; grams: number } {
  const m = s.match(/(\d+[.,]?\d*)\s*(g|gr|grammi|ml|porzion\w*|pz|fette?|cucchiai?)/i);
  if (!m) return { text: '', grams: 0 };
  const n = Number(m[1].replace(',', '.')) || 0;
  const unit = m[2].toLowerCase();
  const grams = unit.startsWith('g') || unit.startsWith('ml') ? n : 0; // peso reale solo se g/ml
  return { text: m[0], grams };
}

// Rimuove dal nome i token di macro/kcal per lasciare solo l'alimento.
function cleanName(s: string): string {
  return s
    .replace(/(\d+[.,]?\d*)\s*kcal/ig, '')
    .replace(/(\d+[.,]?\d*)\s*g?\s*(?:di\s*)?(prot\w*|carb\w*|grass\w*|cho|fat)/ig, '')
    .replace(/[;|]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,\-]+|[\s,\-]+$/g, '')
    .trim();
}

// Costruisce una o più righe: se la riga contiene "riso + pollo" (o "e"/"con"),
// riconosce alimenti distinti, li separa e ripartisce le macro del pasto in
// proporzione ai grammi (la somma resta uguale al totale del pasto).
function buildRows(day: string, mealType: string, content: string): ExtractedDietMeal[] {
  const calories = num(/(\d+[.,]?\d*)\s*kcal/i, content);
  const proteinG = num(/(\d+[.,]?\d*)\s*g?\s*(?:di\s*)?prot/i, content);
  const carbsG = num(/(\d+[.,]?\d*)\s*g?\s*(?:di\s*)?carb/i, content);
  const fatG = num(/(\d+[.,]?\d*)\s*g?\s*(?:di\s*)?grass/i, content);
  const Meal = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  // Divide gli alimenti su + / e / con (mantenendo numeri e virgole delle macro).
  const segments = content
    .split(/\s*\+\s*|\s+e\s+|\s+con\s+/i)
    .map((s) => s.trim())
    .filter((s) => cleanName(s).length > 1);

  if (segments.length <= 1) {
    const q = parseQty(content);
    let confidence = 0.4;
    if (q.text) confidence += 0.2;
    if (calories) confidence += 0.2;
    if (proteinG || carbsG || fatG) confidence += 0.1;
    return [{ day: day || 'tutti', mealType: Meal, food: cleanName(content) || content, quantity: q.text, calories, proteinG, carbsG, fatG, notes: '', confidence: Math.min(confidence, 0.95) }];
  }

  // Pesi per la ripartizione proporzionale; fallback a parti uguali.
  const parsed = segments.map((s) => ({ name: cleanName(s), q: parseQty(s) }));
  const totalGrams = parsed.reduce((a, p) => a + p.q.grams, 0);
  const share = (p: { q: { grams: number } }) => (totalGrams > 0 ? p.q.grams / totalGrams : 1 / parsed.length);
  const r2 = (n: number) => Math.round(n * 10) / 10;

  return parsed.map((p) => {
    const f = share(p);
    return {
      day: day || 'tutti',
      mealType: Meal,
      food: p.name,
      quantity: p.q.text,
      calories: Math.round(calories * f),
      proteinG: r2(proteinG * f),
      carbsG: r2(carbsG * f),
      fatG: r2(fatG * f),
      notes: segments.length > 1 ? 'da pasto combinato' : '',
      confidence: Math.min(0.4 + (p.q.text ? 0.2 : 0) + (calories ? 0.15 : 0), 0.9),
    };
  });
}

// backward-compat
export const fallbackExtractDietRows = extractDietRows;
