// Seeds 10 demo exercises with locally-generated SVG placeholder images.
// Safe to re-run: skips exercises that already exist (matched by name).
// No scraping, no copyrighted images — placeholders are generated here.
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const root = process.cwd();
const dbPath = process.env.FITCONTROL_DB_PATH || path.join(root, 'data', 'fitcontrol.sqlite');
if (!fs.existsSync(dbPath)) { console.error('Database non trovato. Esegui npm run setup:db'); process.exit(1); }
const imgDir = path.join(root, 'public', 'exercises');
fs.mkdirSync(imgDir, { recursive: true });

const COLORS = {
  Petto: ['#0ea5e9', '#0369a1'], Dorso: ['#10b981', '#047857'], Quadricipiti: ['#f59e0b', '#b45309'],
  Femorali: ['#f97316', '#c2410c'], Spalle: ['#8b5cf6', '#6d28d9'], Bicipiti: ['#ec4899', '#be185d'],
  Tricipiti: ['#ef4444', '#b91c1c'], Glutei: ['#14b8a6', '#0f766e'], Core: ['#64748b', '#334155'],
};

function slug(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

function svg(name, muscle) {
  const [c1, c2] = COLORS[muscle] || ['#475569', '#1e293b'];
  const id = slug(name);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <defs><linearGradient id="g-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
  <rect width="640" height="360" fill="url(#g-${id})"/>
  <circle cx="540" cy="60" r="120" fill="#ffffff" opacity="0.08"/>
  <circle cx="90" cy="320" r="90" fill="#ffffff" opacity="0.08"/>
  <text x="40" y="300" font-family="system-ui,Arial,sans-serif" font-size="34" font-weight="800" fill="#ffffff">${name}</text>
  <text x="40" y="60" font-family="system-ui,Arial,sans-serif" font-size="20" font-weight="700" fill="#ffffff" opacity="0.85">${muscle.toUpperCase()}</text>
</svg>`;
}

const DEMO = [
  ['Panca piana bilanciere', 'Petto', 'spinta', 'bilanciere', 'intermedio', 'Scapole addotte, discesa controllata, spinta esplosiva.'],
  ['Rematore bilanciere', 'Dorso', 'tirata', 'bilanciere', 'intermedio', 'Busto a 45°, tira verso l\'ombelico, schiena neutra.'],
  ['Trazioni alla sbarra', 'Dorso', 'tirata', 'corpo libero', 'avanzato', 'Presa prona, porta il mento sopra la sbarra.'],
  ['Squat bilanciere', 'Quadricipiti', 'gambe', 'bilanciere', 'intermedio', 'Scendi sotto il parallelo mantenendo il tronco saldo.'],
  ['Stacco rumeno', 'Femorali', 'gambe', 'bilanciere', 'avanzato', 'Anche indietro, bilanciere vicino alle gambe, schiena neutra.'],
  ['Military press', 'Spalle', 'spinta', 'bilanciere', 'intermedio', 'Core attivo, spingi sopra la testa senza inarcare.'],
  ['Curl bicipiti manubri', 'Bicipiti', 'isolamento', 'manubri', 'principiante', 'Gomiti fermi, supinazione completa in alto.'],
  ['French press', 'Tricipiti', 'isolamento', 'bilanciere', 'intermedio', 'Gomiti stretti, estensione controllata.'],
  ['Affondi camminati', 'Glutei', 'gambe', 'manubri', 'principiante', 'Passo lungo, ginocchio non oltre la punta del piede.'],
  ['Plank', 'Core', 'core', 'corpo libero', 'principiante', 'Bacino neutro, addome e glutei contratti, respira.'],
];

const db = new Database(dbPath);
let created = 0, images = 0;
for (const [name, muscle, category, equipment, difficulty, notes] of DEMO) {
  const file = path.join(imgDir, slug(name) + '.svg');
  fs.writeFileSync(file, svg(name, muscle)); images++;
  const imageUrl = '/exercises/' + slug(name) + '.svg';
  const existing = db.prepare('select id from exercises where lower(name)=lower(?)').get(name);
  if (existing) {
    db.prepare('update exercises set image_url=?, image_source=?, license=? where id=?').run(imageUrl, 'placeholder locale', 'CC0 (generato)', existing.id);
    continue;
  }
  db.prepare('insert into exercises (id,name,category,primary_muscle,equipment,difficulty,technical_notes,image_url,image_source,license) values (?,?,?,?,?,?,?,?,?,?)')
    .run(randomUUID(), name, category, muscle, equipment, difficulty, notes, imageUrl, 'placeholder locale', 'CC0 (generato)');
  created++;
}
console.log(`Esercizi demo: ${created} creati, ${images} immagini in public/exercises/.`);
