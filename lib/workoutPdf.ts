// Parser rule-based per schede di allenamento in PDF (testo digitale).
// Riconosce intestazioni dei giorni ed esercizi nel formato "Nome  4x8  rec 90".
// Output sempre revisionabile dall'utente prima del salvataggio.

export type ExtractedWorkoutRow = {
  day: string;
  exercise: string;
  sets: number;
  reps: string;
  rest: number;
  primaryMuscle: string;
  notes: string;
  confidence: number;
};

const DAY_RE = /^\s*(lunedì|lunedi|martedì|martedi|mercoledì|mercoledi|giovedì|giovedi|venerdì|venerdi|sabato|domenica|giorno\s*\d+|day\s*[a-z0-9]+|allenamento\s*[a-z0-9]+|scheda\s*[a-z0-9]+|seduta\s*\d+|sessione\s*\d+|workout\s*[a-z0-9]+)\b/i;
const SETS_REPS = /(\d{1,2})\s*(?:serie|set|sets|x|×|\*)?\s*[x×*]\s*(\d{1,2}\s*-\s*\d{1,2}|\d{1,2}|max|cedimento|amrap)/i;
const REST_LABEL = /(?:rec(?:upero)?|rest|riposo|pausa)\s*[:\-]?\s*(\d{1,3})\s*(?:s|sec|secondi|''|"|min)?/i;
const REST_BARE = /\b(\d{2,3})\s*(?:s|sec|secondi|''|")\b/i;

const MUSCLES: [RegExp, string][] = [
  [/panca|spinte|chest|croci|push[- ]?up|piegament/i, 'Petto'],
  [/trazion|rematore|lat |pulley|pull[- ]?up|stacc|dorso|rowing|pulldown/i, 'Dorso'],
  [/squat|affond|leg press|leg extension|leg curl|pressa|gambe|polpacc|calf|stacco rumeno|hip thrust|glute/i, 'Gambe'],
  [/curl|bicip/i, 'Bicipiti'],
  [/french|push[- ]?down|dip|tricip|estension/i, 'Tricipiti'],
  [/military|lento|alzate|spalle|shoulder|arnold|tirate al mento/i, 'Spalle'],
  [/plank|crunch|addome|core|russian|sit[- ]?up|abs/i, 'Core'],
];

function guessMuscle(name: string): string {
  for (const [re, m] of MUSCLES) if (re.test(name)) return m;
  return 'Generico';
}

function cleanExerciseName(s: string): string {
  return s
    .replace(SETS_REPS, ' ')
    .replace(REST_LABEL, ' ')
    .replace(REST_BARE, ' ')
    .replace(/\b(serie|reps?|ripetizioni|recupero|riposo|tempo|carico|kg|rpe\s*\d+)\b/ig, ' ')
    .replace(/[:•·\-–—|]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s.\d)]+|[\s.]+$/g, '')
    .trim();
}

export function extractWorkoutRows(text: string): ExtractedWorkoutRow[] {
  const rows: ExtractedWorkoutRow[] = [];
  let currentDay = '';
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    const dayHit = line.match(DAY_RE);
    const sr = line.match(SETS_REPS);

    // Intestazione giorno: riga che matcha una parola chiave e NON contiene serie×reps.
    if (dayHit && !sr) {
      currentDay = line.replace(/[:•·\-–—]+\s*$/, '').trim();
      continue;
    }

    if (sr) {
      const sets = Math.min(Math.max(Number(sr[1]) || 3, 1), 12);
      const reps = sr[2].replace(/\s+/g, '');
      const restM = line.match(REST_LABEL) || line.match(REST_BARE);
      const rest = restM ? Math.min(Number(restM[1]) || 60, 600) : 60;
      const name = cleanExerciseName(line);
      if (name.length < 2) continue;
      let confidence = 0.6;
      if (restM) confidence += 0.15;
      if (reps.includes('-')) confidence += 0.05;
      rows.push({
        day: currentDay || 'Giorno 1',
        exercise: name,
        sets,
        reps: reps || '8-12',
        rest,
        primaryMuscle: guessMuscle(name),
        notes: '',
        confidence: Math.min(confidence, 0.95),
      });
    }
  }
  return rows;
}

const DAY_TO_DOW: Record<string, number> = { domenica: 0, lunedi: 1, 'lunedì': 1, martedi: 2, 'martedì': 2, mercoledi: 3, 'mercoledì': 3, giovedi: 4, 'giovedì': 4, venerdi: 5, 'venerdì': 5, sabato: 6 };

// Raggruppa le righe per giorno in una struttura compatibile con saveGeneratedPlan.
export function groupWorkoutRows(rows: ExtractedWorkoutRow[]) {
  const days: { title: string; focus: string; dayOfWeek: number; key: string; exercises: any[] }[] = [];
  const byKey: Record<string, any> = {};
  let seq = 1;
  for (const r of rows) {
    const key = (r.day || 'Giorno 1').toLowerCase();
    if (!byKey[key]) {
      const named = DAY_TO_DOW[key.replace(/[^a-zàèéìòù]/g, '')];
      const dow = named !== undefined ? named : ((seq % 7) || 1);
      const d = { title: r.day || ('Giorno ' + seq), focus: '', dayOfWeek: dow, key, exercises: [] as any[] };
      byKey[key] = d;
      days.push(d);
      seq++;
    }
    byKey[key].exercises.push({ name: r.exercise, primaryMuscle: r.primaryMuscle, sets: r.sets, reps: r.reps, restSeconds: r.rest, note: r.notes });
  }
  return days.map(({ key, ...d }) => d);
}
