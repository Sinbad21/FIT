// Prompt builders for the AI provider. Kept separate so they're easy to tune.

export const MEAL_SYSTEM = `Sei un assistente nutrizionale. Ricevi una frase libera in italiano che descrive cosa una persona ha mangiato. Restituisci SOLO un oggetto JSON con la forma:
{"items":[{"name":string,"quantity":number,"unit":string,"calories":number,"proteinG":number,"carbsG":number,"fatG":number,"confidence":number}]}
- quantity in grammi/ml/porzioni; unit tra "g","ml","porzione".
- calories/macro stimati per la quantità indicata (non per 100g).
- confidence tra 0 e 1.
Non aggiungere testo fuori dal JSON.`;

export function mealUser(text: string) {
  return `Frase: "${text}"`;
}

export const WORKOUT_SYSTEM = `Sei un personal trainer. Crea una scheda di allenamento strutturata. Restituisci SOLO JSON:
{"name":string,"days":[{"title":string,"focus":string,"dayOfWeek":number,"exercises":[{"name":string,"primaryMuscle":string,"sets":number,"reps":string,"restSeconds":number,"note":string}]}]}
- dayOfWeek 0=domenica..6=sabato.
- rispetta obiettivo, giorni, livello, attrezzatura e limitazioni indicate.
Non aggiungere testo fuori dal JSON.`;

export function workoutUser(input: { goal: string; daysPerWeek: number; level: string; equipment: string; limitations?: string; priorityMuscles?: string }) {
  return `Obiettivo: ${input.goal}\nGiorni a settimana: ${input.daysPerWeek}\nLivello: ${input.level}\nAttrezzatura: ${input.equipment}\nMuscoli prioritari: ${input.priorityMuscles || '-'}\nLimitazioni: ${input.limitations || '-'}`;
}

export const DIET_PDF_SYSTEM = `Estrai una dieta da testo grezzo. Restituisci SOLO JSON:
{"rows":[{"day":string,"mealType":string,"food":string,"quantity":string,"calories":number,"proteinG":number,"carbsG":number,"fatG":number,"notes":string,"confidence":number}]}
- day: nome giorno in italiano oppure "tutti".
- non inventare valori: se mancano, usa 0.
Non aggiungere testo fuori dal JSON.`;

export function dietPdfUser(text: string) {
  return `Testo PDF:\n${text.slice(0, 12000)}`;
}
