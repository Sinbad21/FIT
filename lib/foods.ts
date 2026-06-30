// Database nutrizionale di base (valori per 100 g salvo defaultGrams).
// Usato per STIMARE kcal e macro quando il PDF/AI non li riporta.
// I valori sono indicativi e sempre revisionabili dall'utente.

export type FoodInfo = { kcal: number; prot: number; carb: number; fat: number; defaultGrams?: number };

// chiave = parola da cercare nel nome alimento (lowercase, senza accenti).
// Le chiavi più specifiche ("yogurt greco") vincono su quelle generiche ("yogurt").
export const FOODS: Record<string, FoodInfo> = {
  // Proteine in polvere / integratori
  'whey': { kcal: 380, prot: 80, carb: 8, fat: 6, defaultGrams: 30 },
  'proteine in polvere': { kcal: 380, prot: 80, carb: 8, fat: 6, defaultGrams: 30 },
  // Carne / pesce
  'petto di pollo': { kcal: 165, prot: 31, carb: 0, fat: 3.6 },
  'pollo': { kcal: 165, prot: 31, carb: 0, fat: 3.6 },
  'tacchino': { kcal: 160, prot: 29, carb: 0, fat: 4 },
  'manzo': { kcal: 250, prot: 26, carb: 0, fat: 15 },
  'vitello': { kcal: 172, prot: 24, carb: 0, fat: 8 },
  'bresaola': { kcal: 150, prot: 32, carb: 0, fat: 2 },
  'prosciutto crudo': { kcal: 270, prot: 26, carb: 0, fat: 18 },
  'prosciutto cotto': { kcal: 145, prot: 20, carb: 1, fat: 7 },
  'tonno': { kcal: 116, prot: 26, carb: 0, fat: 1 },
  'salmone': { kcal: 208, prot: 20, carb: 0, fat: 13 },
  'merluzzo': { kcal: 82, prot: 18, carb: 0, fat: 0.7 },
  'uova': { kcal: 155, prot: 13, carb: 1.1, fat: 11, defaultGrams: 120 },
  'uovo': { kcal: 155, prot: 13, carb: 1.1, fat: 11, defaultGrams: 60 },
  // Cereali / carboidrati (peso a crudo, come tipico nelle diete)
  'riso basmati': { kcal: 350, prot: 7.5, carb: 78, fat: 0.6 },
  'riso': { kcal: 350, prot: 7, carb: 78, fat: 0.5 },
  'pasta': { kcal: 360, prot: 12, carb: 72, fat: 1.5 },
  'pane integrale': { kcal: 250, prot: 9, carb: 47, fat: 3 },
  'pane': { kcal: 270, prot: 9, carb: 49, fat: 3 },
  'avena': { kcal: 370, prot: 13, carb: 60, fat: 7 },
  'fiocchi davena': { kcal: 370, prot: 13, carb: 60, fat: 7 },
  'patate': { kcal: 77, prot: 2, carb: 17, fat: 0.1 },
  'gallette': { kcal: 387, prot: 8, carb: 80, fat: 3, defaultGrams: 20 },
  'fette biscottate': { kcal: 410, prot: 11, carb: 73, fat: 8, defaultGrams: 20 },
  'cous cous': { kcal: 376, prot: 13, carb: 77, fat: 0.6 },
  // Latticini
  'yogurt greco': { kcal: 59, prot: 10, carb: 3.6, fat: 0.4, defaultGrams: 170 },
  'yogurt': { kcal: 61, prot: 3.5, carb: 4.7, fat: 3.3, defaultGrams: 125 },
  'fiocchi di latte': { kcal: 98, prot: 11, carb: 3.4, fat: 4.3 },
  'latte': { kcal: 64, prot: 3.4, carb: 4.8, fat: 3.6, defaultGrams: 200 },
  'mozzarella': { kcal: 250, prot: 18, carb: 1, fat: 19 },
  'parmigiano': { kcal: 392, prot: 36, carb: 0, fat: 29, defaultGrams: 30 },
  'ricotta': { kcal: 146, prot: 11, carb: 3, fat: 10 },
  // Frutta / verdura
  'banana': { kcal: 89, prot: 1.1, carb: 23, fat: 0.3, defaultGrams: 120 },
  'mela': { kcal: 52, prot: 0.3, carb: 14, fat: 0.2, defaultGrams: 150 },
  'frutti di bosco': { kcal: 43, prot: 1, carb: 10, fat: 0.3, defaultGrams: 100 },
  'frutta': { kcal: 60, prot: 0.8, carb: 14, fat: 0.3, defaultGrams: 150 },
  'verdure': { kcal: 25, prot: 1.5, carb: 4, fat: 0.2, defaultGrams: 200 },
  'insalata': { kcal: 20, prot: 1.5, carb: 3, fat: 0.2, defaultGrams: 100 },
  'broccoli': { kcal: 34, prot: 2.8, carb: 7, fat: 0.4, defaultGrams: 200 },
  'zucchine': { kcal: 17, prot: 1.2, carb: 3.1, fat: 0.3, defaultGrams: 200 },
  'spinaci': { kcal: 23, prot: 2.9, carb: 3.6, fat: 0.4, defaultGrams: 150 },
  // Legumi (cotti)
  'lenticchie': { kcal: 116, prot: 9, carb: 20, fat: 0.4 },
  'ceci': { kcal: 164, prot: 9, carb: 27, fat: 2.6 },
  'fagioli': { kcal: 127, prot: 9, carb: 22, fat: 0.5 },
  // Grassi / frutta secca
  'olio evo': { kcal: 884, prot: 0, carb: 0, fat: 100, defaultGrams: 10 },
  'olio': { kcal: 884, prot: 0, carb: 0, fat: 100, defaultGrams: 10 },
  'mandorle': { kcal: 579, prot: 21, carb: 22, fat: 50, defaultGrams: 30 },
  'noci': { kcal: 654, prot: 15, carb: 14, fat: 65, defaultGrams: 30 },
  'burro darachidi': { kcal: 588, prot: 25, carb: 20, fat: 50, defaultGrams: 20 },
  'avocado': { kcal: 160, prot: 2, carb: 9, fat: 15, defaultGrams: 100 },
  // Dolci / vari
  'miele': { kcal: 304, prot: 0.3, carb: 82, fat: 0, defaultGrams: 15 },
  'marmellata': { kcal: 250, prot: 0.5, carb: 60, fat: 0, defaultGrams: 20 },
  'cioccolato fondente': { kcal: 546, prot: 8, carb: 46, fat: 31, defaultGrams: 20 },
};

const KEYS = Object.keys(FOODS).sort((a, b) => b.length - a.length); // più specifiche prima

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function matchFood(name: string): FoodInfo | null {
  const n = normalize(name);
  for (const k of KEYS) if (n.includes(k)) return FOODS[k];
  return null;
}

// Estrae i grammi da una stringa quantità tipo "100 g" / "30g" / "180 ml".
export function gramsFromText(qty: string): number {
  const m = (qty || '').match(/(\d+[.,]?\d*)\s*(g|gr|grammi|ml)?/i);
  if (!m) return 0;
  const n = Number(m[1].replace(',', '.')) || 0;
  const unit = (m[2] || '').toLowerCase();
  return unit === '' || unit.startsWith('g') || unit.startsWith('ml') ? n : 0;
}

export type EnrichableRow = { food?: string; name?: string; quantity?: string; calories?: number; proteinG?: number; carbsG?: number; fatG?: number; notes?: string };

// Riempie SOLO i valori mancanti (0/vuoti), lasciando intatto ciò che il PDF/AI ha già fornito.
export function enrichRow<T extends EnrichableRow>(row: T): T {
  const label = String(row.food || row.name || '');
  const info = matchFood(label);
  if (!info) return row;
  let grams = gramsFromText(row.quantity || '') || gramsFromText(label);
  if (!grams) grams = info.defaultGrams || 100;
  const factor = grams / 100;
  const est = { calories: Math.round(info.kcal * factor), proteinG: +(info.prot * factor).toFixed(1), carbsG: +(info.carb * factor).toFixed(1), fatG: +(info.fat * factor).toFixed(1) };

  const out: any = { ...row };
  let estimated = false;
  if (!out.calories) { out.calories = est.calories; estimated = true; }
  if (!out.proteinG) { out.proteinG = est.proteinG; estimated = true; }
  if (!out.carbsG) { out.carbsG = est.carbsG; estimated = true; }
  if (!out.fatG) { out.fatG = est.fatG; estimated = true; }
  if (!out.quantity && grams) out.quantity = grams + ' g';
  if (estimated) out.notes = (out.notes ? out.notes + ' · ' : '') + 'valori stimati';
  return out;
}

export function enrichRows<T extends EnrichableRow>(rows: T[]): T[] {
  return (rows || []).map(enrichRow);
}
