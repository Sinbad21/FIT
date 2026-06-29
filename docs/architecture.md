# FitControl - Analisi, architettura e piano tecnico

## 1. Analisi del progetto
FitControl è una PWA personale local-first per allenamento, dieta, progressi e promemoria. È single-user, mobile-first, usabile da iPhone e PC, con SQLite locale e possibilità futura di sync cloud.

### Funzioni principali
- Dashboard: data, allenamento, esercizi completati, pasti confermati, calorie, macro, acqua, peso e stato giornata.
- Allenamento: generazione futura AI, editor manuale, libreria esercizi, immagini realistiche via imageUrl, completamento, carichi, reps effettive, RPE.
- Dieta: upload PDF, tabella modificabile, pasti previsti/reali, conferma, inserimento manuale, interpretazione frasi libere.
- Storico/progressi: peso, calorie, proteine, acqua, allenamenti, carichi, note e misure.
- Notifiche: allenamento, pasti, acqua, peso e riepilogo serale.

### Vincoli e limiti
- Uso locale: il database SQLite resta sul PC/server che esegue Next.js.
- Offline base: service worker cachea shell e schermate principali; scritture offline robuste richiedono IndexedDB + sync queue in V2.
- AI e PDF: MVP con stub/euristiche; salvataggio finale sempre dopo conferma utente.
- iPhone/PWA: per service worker, offline e push reali serve HTTPS/secure context; HTTP via IP LAN serve per test UI ma non per PWA completa.

## 2. Architettura
- Frontend: Next.js App Router, TypeScript, Tailwind, mobile-first, componenti client per azioni.
- Backend: API routes Node.js nello stesso progetto.
- Database: SQLite data/fitcontrol.sqlite, schema in db/schema.sql, repository in lib/repositories.ts.
- AI: modulo lib/ai.ts, futuro provider con salvataggio in ai_extractions.
- PDF: endpoint /api/diet/pdf/import, parsing testo, revisione in tabella.
- PWA: manifest.webmanifest, sw.js, icone PNG, registrazione solo su secure context.
- Notifiche: tabella notifications, UI permesso; V2 con Web Push/VAPID e scheduler.

## 3. Schema database
Schema completo in db/schema.sql con tabelle: user_profile, workout_plans, workout_days, exercises, workout_exercises, workout_logs, exercise_logs, diet_plans, diet_days, planned_meals, eaten_meals, food_items, nutrition_logs, body_metrics, notifications, app_settings, ai_extractions, pdf_imports.

## 4. Wireframe testuale
1. Dashboard: hero oggi + metriche + CTA.
2. Allenamento oggi: esercizi con immagine, serie/reps/recupero, checkbox.
3. Scheda settimanale: giorni/focus/esercizi.
4. Generatore AI: form obiettivo, giorni, livello, attrezzatura, priorità, limiti.
5. Libreria esercizi: filtri e card.
6. Dettaglio esercizio: tecnica, muscoli, immagine, storico carichi.
7. Dieta oggi: pasti e azioni Mangiato/Saltato/Modifica.
8. Upload PDF dieta: file, stato parsing.
9. Tabella importata: revisione giorno/pasto/alimento/quantità/macro.
10. Pasto manuale: form alimento e macro.
11. Pasto AI: textarea, tabella provvisoria, conferma.
12. Storico: timeline.
13. Progressi: grafici e trend.
14. Profilo: dati fisici, target e preferenze.
15. Notifiche: regole configurabili.

## 5. Componenti
AppShell, BottomNav, PageHeader, MetricCard, ActionGrid, ExerciseCard, MealCard. Futuri: editor scheda, exercise picker, tabella PDF, AI review, progress chart, notification rule editor.

## 6. API
GET /api/dashboard, GET /api/workouts/today, GET/POST /api/workouts/plans, POST /api/workouts/complete, GET /api/diet/today, POST /api/diet/meal-status, POST /api/diet/manual, POST /api/diet/ai/parse, POST /api/diet/pdf/import, GET /api/profile, GET /api/progress, GET/POST /api/notifications.

## 7. Flusso PDF dieta
Upload -> parsing testo -> estrazione righe -> tabella provvisoria -> correzione utente -> salvataggio diet_plans/diet_days/planned_meals -> uso giornaliero.

## 8. Flusso AI pasti
Testo libero -> interpretazione alimenti/quantità -> macro stimate e confidence -> conferma/correzione -> salvataggio eaten_meals -> dashboard aggiornata.

## 9. Flusso allenamento
Input obiettivo -> bozza generata -> modifica manuale -> attivazione scheda -> completamento giornaliero -> log e progressione carichi.

## 10. Roadmap
MVP: dashboard, workout oggi, dieta oggi, SQLite, PWA base, pasti manuali/AI euristica.
V2: editor completo, import PDF con revisione, IndexedDB offline queue, grafici, Web Push.
V3: sync cloud opzionale, OCR, immagini AI/licenziate, progressione automatica, export/backup.

## 11. Codice iniziale
Lo scaffold contiene setup, pagine, database, modelli, componenti, dashboard/dieta/workout e PWA.

## 12. Avvio
```powershell
npm install
npm run setup:db
npm run dev
```
Da iPhone sulla stessa Wi-Fi apri http://IP_DEL_PC:3000. Per installazione PWA completa e push usa HTTPS trusted, tunnel HTTPS o deploy privato.