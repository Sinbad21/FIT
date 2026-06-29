import { randomUUID } from 'node:crypto';
import { getDb, dbReady } from '@/lib/db';
import { italianDate, isoToday } from '@/lib/dates';
import type { DashboardData, Meal, Profile, WorkoutExercise } from '@/lib/types';

const dow = () => new Date().getDay();
const SQL = String.raw;

const fallbackProfile: Profile = { id: 'demo', name: 'Gabriele', age: 30, heightCm: 178, weightKg: 78, sex: 'M', goal: 'ricomposizione', dailyCalorieTarget: 2500, proteinTargetG: 170, carbsTargetG: 280, fatTargetG: 70, waterTargetL: 3 };

// ---------------- Profile ----------------
export function getProfile(): Profile {
  if (!dbReady()) return fallbackProfile;
  const r: any = getDb().prepare('select * from user_profile order by created_at limit 1').get();
  if (!r) return fallbackProfile;
  return { id: r.id, name: r.name, age: r.age, heightCm: r.height_cm, weightKg: r.weight_kg, sex: r.sex, goal: r.goal, dailyCalorieTarget: r.daily_calorie_target, proteinTargetG: r.protein_target_g, carbsTargetG: r.carbs_target_g, fatTargetG: r.fat_target_g, waterTargetL: r.water_target_l };
}

export function getProfileRaw(): any {
  if (!dbReady()) return fallbackProfile;
  return getDb().prepare('select * from user_profile order by created_at limit 1').get() || fallbackProfile;
}

export function updateProfile(input: any) {
  if (!dbReady()) return { ok: true, demo: true };
  const db = getDb();
  const current: any = db.prepare('select id from user_profile order by created_at limit 1').get();
  const num = (v: any) => (v === '' || v === undefined || v === null ? null : Number(v));
  const fields = ['name','age','height_cm','weight_kg','sex','goal','target_weight_kg','activity_level','training_days_per_week','daily_calorie_target','protein_target_g','carbs_target_g','fat_target_g','water_target_l','food_preferences','foods_to_avoid','allergies','available_equipment','training_level'];
  const values: any = { name: input.name, age: num(input.age), height_cm: num(input.heightCm), weight_kg: num(input.weightKg), sex: input.sex, goal: input.goal, target_weight_kg: num(input.targetWeightKg), activity_level: input.activityLevel, training_days_per_week: num(input.trainingDaysPerWeek), daily_calorie_target: num(input.dailyCalorieTarget) ?? 0, protein_target_g: num(input.proteinTargetG) ?? 0, carbs_target_g: num(input.carbsTargetG) ?? 0, fat_target_g: num(input.fatTargetG) ?? 0, water_target_l: num(input.waterTargetL) ?? 0, food_preferences: input.foodPreferences, foods_to_avoid: input.foodsToAvoid, allergies: input.allergies, available_equipment: input.availableEquipment, training_level: input.trainingLevel };
  if (current) {
    const setSql = fields.map((f) => f + '=@' + f).join(', ');
    db.prepare('update user_profile set ' + setSql + ', updated_at=current_timestamp where id=@id').run({ ...values, id: current.id });
    return { ok: true, id: current.id };
  }
  const id = randomUUID();
  db.prepare('insert into user_profile (id,' + fields.join(',') + ') values (@id,' + fields.map((f) => '@' + f).join(',') + ')').run({ ...values, id });
  return { ok: true, id };
}

// ---------------- Workout (read) ----------------
export function getActivePlanId(): string | null {
  if (!dbReady()) return null;
  const r: any = getDb().prepare('select id from workout_plans where active=1 order by updated_at desc limit 1').get() || getDb().prepare('select id from workout_plans order by updated_at desc limit 1').get();
  return r ? r.id : null;
}

export function getActiveDietPlanId(): string | null {
  if (!dbReady()) return null;
  const r: any = getDb().prepare('select id from diet_plans where active=1 order by updated_at desc limit 1').get() || getDb().prepare('select id from diet_plans order by updated_at desc limit 1').get();
  return r ? r.id : null;
}

export function getTodayWorkout() {
  if (!dbReady()) return { id: null, title: 'Petto e Tricipiti', focus: 'Spinta ipertrofia', exercises: [] as WorkoutExercise[] };
  const db = getDb();
  const planId = getActivePlanId();
  if (!planId) return { id: null, title: 'Nessuna scheda attiva', focus: 'Seleziona o genera una scheda attiva', exercises: [] as WorkoutExercise[], noActivePlan: true };
  const day: any = db.prepare('select * from workout_days where workout_plan_id=? and day_of_week=? order by order_index limit 1').get(planId, dow());
  if (!day) return { id: null, title: 'Riposo attivo', focus: 'Mobilita e passi', exercises: [] as WorkoutExercise[] };
  const ex: any[] = db.prepare('select we.id workoutExerciseId, e.id exerciseId, e.name, e.category, e.primary_muscle primaryMuscle, e.secondary_muscles secondaryMuscles, e.equipment, we.sets, we.reps, we.rest_seconds restSeconds, e.difficulty, coalesce(we.notes, e.technical_notes) technicalNotes, e.image_url imageUrl, coalesce(el.completed,0) completed, el.weight_kg weightKg, el.reps_done repsDone, el.rpe rpe from workout_exercises we join exercises e on e.id=we.exercise_id left join workout_logs wl on wl.workout_day_id=we.workout_day_id and wl.workout_date=? left join exercise_logs el on el.workout_log_id=wl.id and el.workout_exercise_id=we.id where we.workout_day_id=? order by we.order_index').all(isoToday(), day.id);
  return { id: day.id, title: day.title, focus: day.focus, exercises: ex as WorkoutExercise[] };
}

export function listPlans() {
  if (!dbReady()) return [] as any[];
  return getDb().prepare('select p.id, p.name, p.goal, p.level, p.days_per_week daysPerWeek, p.ai_generated aiGenerated, p.active, (select count(*) from workout_days d where d.workout_plan_id=p.id) dayCount from workout_plans p order by p.active desc, p.updated_at desc').all();
}

export function setActivePlan(planId: string) {
  if (!dbReady()) return { ok: true, demo: true };
  const db = getDb();
  const plan: any = db.prepare('select id from workout_plans where id=?').get(planId);
  if (!plan) throw new Error('Scheda non trovata');
  const tx = db.transaction(() => {
    db.prepare('update workout_plans set active=0').run();
    db.prepare('update workout_plans set active=1, updated_at=current_timestamp where id=?').run(planId);
  });
  tx();
  return { ok: true, id: planId };
}

export function deletePlan(planId: string) {
  if (!dbReady()) return { ok: true, demo: true };
  const db = getDb();
  const wasActive: any = db.prepare('select active from workout_plans where id=?').get(planId);
  db.prepare('delete from workout_plans where id=?').run(planId);
  if (wasActive && wasActive.active) {
    const next: any = db.prepare('select id from workout_plans order by updated_at desc limit 1').get();
    if (next) db.prepare('update workout_plans set active=1 where id=?').run(next.id);
  }
  return { ok: true };
}

export function getWeeklyWorkout() {
  if (!dbReady()) return [] as any[];
  const planId = getActivePlanId();
  if (!planId) return [] as any[];
  return getDb().prepare('select wd.id, wd.title, wd.day_of_week dayOfWeek, wd.focus, count(we.id) exerciseCount from workout_days wd left join workout_exercises we on we.workout_day_id=wd.id where wd.workout_plan_id=? group by wd.id order by wd.day_of_week, wd.order_index').all(planId);
}

export function getPlanWithDays() {
  if (!dbReady()) return { plan: null, days: [] as any[] };
  const db = getDb();
  const planId = getActivePlanId();
  const plan: any = planId ? db.prepare('select * from workout_plans where id=?').get(planId) : null;
  const days: any[] = planId ? db.prepare('select * from workout_days where workout_plan_id=? order by day_of_week, order_index').all(planId) : [];
  for (const d of days) {
    d.exercises = db.prepare('select we.id workoutExerciseId, we.exercise_id exerciseId, e.name, e.primary_muscle primaryMuscle, e.equipment, we.sets, we.reps, we.rest_seconds restSeconds, we.order_index orderIndex from workout_exercises we join exercises e on e.id=we.exercise_id where we.workout_day_id=? order by we.order_index').all(d.id);
  }
  return { plan, days };
}

export function listExercises() {
  if (!dbReady()) return [] as any[];
  return getDb().prepare('select id, name, category, primary_muscle primaryMuscle, secondary_muscles secondaryMuscles, equipment, difficulty, technical_notes technicalNotes, image_url imageUrl from exercises order by name').all();
}

// ---------------- Workout (write) ----------------
export function logExercise(input: { workoutExerciseId: string; exerciseId: string; completed?: boolean; weightKg?: number; repsDone?: string; rpe?: number }) {
  if (!dbReady()) return { ok: true, demo: true };
  const db = getDb();
  const we: any = db.prepare('select workout_day_id, (select workout_plan_id from workout_days wd where wd.id=workout_exercises.workout_day_id) plan_id from workout_exercises where id=?').get(input.workoutExerciseId);
  if (!we) throw new Error('Esercizio non trovato');
  let log: any = db.prepare('select id from workout_logs where workout_day_id=? and workout_date=?').get(we.workout_day_id, isoToday());
  if (!log) { log = { id: randomUUID() }; db.prepare('insert into workout_logs (id, workout_plan_id, workout_day_id, workout_date, status) values (?,?,?,?,?)').run(log.id, we.plan_id, we.workout_day_id, isoToday(), 'in_corso'); }
  db.prepare('insert into exercise_logs (id, workout_log_id, workout_exercise_id, exercise_id, completed, weight_kg, reps_done, rpe) values (@id, @log, @we, @ex, @insCompleted, @weight, @reps, @rpe) on conflict(workout_log_id, workout_exercise_id) do update set completed=coalesce(@completed, exercise_logs.completed), weight_kg=coalesce(@weight, exercise_logs.weight_kg), reps_done=coalesce(@reps, exercise_logs.reps_done), rpe=coalesce(@rpe, exercise_logs.rpe), updated_at=current_timestamp')
    .run({ id: randomUUID(), log: log.id, we: input.workoutExerciseId, ex: input.exerciseId, insCompleted: input.completed ? 1 : 0, weight: input.weightKg ?? null, reps: input.repsDone ?? null, rpe: input.rpe ?? null, completed: input.completed === undefined ? null : (input.completed ? 1 : 0) });
  // recompute completion percent
  const total: any = db.prepare('select count(*) c from workout_exercises where workout_day_id=?').get(we.workout_day_id);
  const done: any = db.prepare('select count(*) c from exercise_logs where workout_log_id=? and completed=1').get(log.id);
  const pct = total.c ? Math.round((done.c / total.c) * 100) : 0;
  db.prepare('update workout_logs set completion_percent=?, status=?, updated_at=current_timestamp where id=?').run(pct, pct >= 100 ? 'completato' : 'in_corso', log.id);
  return { ok: true, completionPercent: pct };
}

// kept for backwards compatibility with existing client
export function completeExercise(input: any) { return logExercise({ ...input, completed: input.completed }); }

export function createDay(input: { title: string; dayOfWeek: number; focus?: string }) {
  if (!dbReady()) return { ok: true, demo: true };
  const db = getDb();
  let planId = getActivePlanId();
  if (!planId) { planId = randomUUID(); const prof: any = db.prepare('select id from user_profile limit 1').get(); db.prepare('insert into workout_plans (id, user_profile_id, name, active) values (?,?,?,1)').run(planId, prof ? prof.id : null, 'Scheda personale'); }
  const id = randomUUID();
  const max: any = db.prepare('select coalesce(max(order_index),-1) m from workout_days where workout_plan_id=?').get(planId);
  db.prepare('insert into workout_days (id, workout_plan_id, day_of_week, order_index, title, focus) values (?,?,?,?,?,?)').run(id, planId, input.dayOfWeek, max.m + 1, input.title, input.focus || null);
  return { ok: true, id };
}

export function updateDay(input: { id: string; title?: string; dayOfWeek?: number; focus?: string }) {
  if (!dbReady()) return { ok: true, demo: true };
  getDb().prepare('update workout_days set title=coalesce(?,title), day_of_week=coalesce(?,day_of_week), focus=coalesce(?,focus), updated_at=current_timestamp where id=?').run(input.title ?? null, input.dayOfWeek ?? null, input.focus ?? null, input.id);
  return { ok: true };
}

export function deleteDay(id: string) {
  if (!dbReady()) return { ok: true, demo: true };
  getDb().prepare('delete from workout_days where id=?').run(id);
  return { ok: true };
}

export function addExerciseToDay(input: { dayId: string; exerciseId: string; sets?: number; reps?: string; restSeconds?: number; notes?: string }) {
  if (!dbReady()) return { ok: true, demo: true };
  const db = getDb();
  const max: any = db.prepare('select coalesce(max(order_index),-1) m from workout_exercises where workout_day_id=?').get(input.dayId);
  const id = randomUUID();
  db.prepare('insert into workout_exercises (id, workout_day_id, exercise_id, order_index, sets, reps, rest_seconds, notes) values (?,?,?,?,?,?,?,?)').run(id, input.dayId, input.exerciseId, max.m + 1, input.sets ?? 3, input.reps ?? '8-12', input.restSeconds ?? 75, input.notes ?? null);
  return { ok: true, id };
}

export function updateWorkoutExercise(input: { id: string; sets?: number; reps?: string; restSeconds?: number; notes?: string }) {
  if (!dbReady()) return { ok: true, demo: true };
  getDb().prepare('update workout_exercises set sets=coalesce(?,sets), reps=coalesce(?,reps), rest_seconds=coalesce(?,rest_seconds), notes=coalesce(?,notes), updated_at=current_timestamp where id=?').run(input.sets ?? null, input.reps ?? null, input.restSeconds ?? null, input.notes ?? null, input.id);
  return { ok: true };
}

export function deleteWorkoutExercise(id: string) {
  if (!dbReady()) return { ok: true, demo: true };
  getDb().prepare('delete from workout_exercises where id=?').run(id);
  return { ok: true };
}

export function createExercise(input: any) {
  if (!dbReady()) return { ok: true, demo: true };
  const id = randomUUID();
  getDb().prepare('insert into exercises (id, name, category, primary_muscle, secondary_muscles, equipment, difficulty, technical_notes, image_url) values (?,?,?,?,?,?,?,?,?)').run(id, input.name, input.category || null, input.primaryMuscle || 'Generico', input.secondaryMuscles || null, input.equipment || null, input.difficulty || 'intermedio', input.technicalNotes || null, input.imageUrl || '/exercise-placeholder.svg');
  return { ok: true, id };
}

export function duplicatePlan(planId?: string) {
  if (!dbReady()) return { ok: true, demo: true };
  const db = getDb();
  const sourceId = planId || getActivePlanId();
  if (!sourceId) throw new Error('Nessuna scheda da duplicare');
  const plan: any = db.prepare('select * from workout_plans where id=?').get(sourceId);
  const newPlanId = randomUUID();
  db.prepare('insert into workout_plans (id, user_profile_id, name, goal, level, days_per_week, duration_minutes, equipment, priority_muscles, ai_generated, active) values (?,?,?,?,?,?,?,?,?,?,0)').run(newPlanId, plan.user_profile_id, plan.name + ' (copia)', plan.goal, plan.level, plan.days_per_week, plan.duration_minutes, plan.equipment, plan.priority_muscles, plan.ai_generated);
  const days: any[] = db.prepare('select * from workout_days where workout_plan_id=?').all(sourceId);
  for (const d of days) {
    const nd = randomUUID();
    db.prepare('insert into workout_days (id, workout_plan_id, day_of_week, order_index, title, focus, notes) values (?,?,?,?,?,?,?)').run(nd, newPlanId, d.day_of_week, d.order_index, d.title, d.focus, d.notes);
    const wex: any[] = db.prepare('select * from workout_exercises where workout_day_id=?').all(d.id);
    for (const w of wex) db.prepare('insert into workout_exercises (id, workout_day_id, exercise_id, order_index, sets, reps, rest_seconds, tempo, progression_note, notes) values (?,?,?,?,?,?,?,?,?,?)').run(randomUUID(), nd, w.exercise_id, w.order_index, w.sets, w.reps, w.rest_seconds, w.tempo, w.progression_note, w.notes);
  }
  return { ok: true, id: newPlanId };
}

// ---------------- Rule-based workout generator ----------------
export function generatePlan(input: { goal: string; daysPerWeek: number; level: string; equipment: string; priorityMuscles?: string; durationMinutes?: number }) {
  if (!dbReady()) return { ok: true, demo: true };
  const db = getDb();
  const prof: any = db.prepare('select id from user_profile limit 1').get();
  const days = Math.min(Math.max(Number(input.daysPerWeek) || 3, 1), 6);
  const repScheme = input.goal === 'forza' ? '4-6' : input.goal === 'definizione' ? '12-15' : '8-12';
  const rest = input.goal === 'forza' ? 150 : input.goal === 'definizione' ? 45 : 75;
  const sets = input.level === 'avanzato' ? 4 : input.level === 'principiante' ? 3 : 4;
  const allEx: any[] = db.prepare('select id, primary_muscle from exercises').all();
  const pick = (muscle: string) => allEx.filter((e) => (e.primary_muscle || '').toLowerCase().includes(muscle));
  const splitByDays: Record<number, { title: string; focus: string; muscles: string[] }[]> = {
    1: [{ title: 'Full Body', focus: 'Total body', muscles: ['petto','dorso','gambe','quadri','tricip'] }],
    2: [{ title: 'Upper', focus: 'Parte alta', muscles: ['petto','dorso','tricip'] }, { title: 'Lower', focus: 'Gambe', muscles: ['quadri','gambe','glute'] }],
    3: [{ title: 'Push', focus: 'Spinta', muscles: ['petto','tricip'] }, { title: 'Pull', focus: 'Tirata', muscles: ['dorso'] }, { title: 'Legs', focus: 'Gambe', muscles: ['quadri','gambe','glute'] }],
    4: [{ title: 'Upper A', focus: 'Spinta', muscles: ['petto','tricip'] }, { title: 'Lower A', focus: 'Gambe', muscles: ['quadri','gambe'] }, { title: 'Upper B', focus: 'Tirata', muscles: ['dorso'] }, { title: 'Lower B', focus: 'Glutei', muscles: ['glute','gambe'] }],
    5: [{ title: 'Petto', focus: 'Spinta', muscles: ['petto'] }, { title: 'Dorso', focus: 'Tirata', muscles: ['dorso'] }, { title: 'Gambe', focus: 'Gambe', muscles: ['quadri','gambe','glute'] }, { title: 'Spalle/Braccia', focus: 'Richiamo', muscles: ['tricip','dorso'] }, { title: 'Full upper', focus: 'Volume', muscles: ['petto','dorso'] }],
    6: [{ title: 'Push A', focus: 'Spinta', muscles: ['petto','tricip'] }, { title: 'Pull A', focus: 'Tirata', muscles: ['dorso'] }, { title: 'Legs A', focus: 'Gambe', muscles: ['quadri','gambe'] }, { title: 'Push B', focus: 'Spinta', muscles: ['petto'] }, { title: 'Pull B', focus: 'Tirata', muscles: ['dorso'] }, { title: 'Legs B', focus: 'Glutei', muscles: ['glute','gambe'] }]
  };
  const dayDefs = splitByDays[days] || splitByDays[3];
  const planId = randomUUID();
  db.prepare('update workout_plans set active=0').run();
  db.prepare('insert into workout_plans (id, user_profile_id, name, goal, level, days_per_week, duration_minutes, equipment, priority_muscles, ai_generated, active) values (?,?,?,?,?,?,?,?,?,1,1)').run(planId, prof ? prof.id : null, 'Scheda generata ' + input.goal, input.goal, input.level, days, input.durationMinutes || 60, input.equipment, input.priorityMuscles || null);
  const weekDays = [1, 2, 4, 5, 3, 6];
  dayDefs.forEach((def, i) => {
    const dayId = randomUUID();
    db.prepare('insert into workout_days (id, workout_plan_id, day_of_week, order_index, title, focus) values (?,?,?,?,?,?)').run(dayId, planId, weekDays[i] || (i + 1), i, def.title, def.focus);
    const chosen: any[] = [];
    for (const m of def.muscles) { for (const e of pick(m)) { if (!chosen.find((c) => c.id === e.id)) chosen.push(e); if (chosen.length >= 5) break; } }
    if (chosen.length === 0) allEx.slice(0, 4).forEach((e) => chosen.push(e));
    chosen.slice(0, 5).forEach((e, o) => db.prepare('insert into workout_exercises (id, workout_day_id, exercise_id, order_index, sets, reps, rest_seconds, progression_note) values (?,?,?,?,?,?,?,?)').run(randomUUID(), dayId, e.id, o, sets, repScheme, rest, 'Aumenta il carico quando completi tutte le reps con RPE <= 8.'));
  });
  return { ok: true, id: planId, days: dayDefs.length };
}

// Persist a structured plan produced by the AI provider. Exercises are matched
// by name (case-insensitive) or created on the fly. The new plan becomes active.
export function saveGeneratedPlan(plan: { name?: string; goal?: string; level?: string; equipment?: string; days: any[] }) {
  if (!dbReady()) return { ok: true, demo: true };
  const db = getDb();
  const prof: any = db.prepare('select id from user_profile limit 1').get();
  const planId = randomUUID();
  const findOrCreateExercise = (name: string, primaryMuscle?: string) => {
    const existing: any = db.prepare('select id from exercises where lower(name)=lower(?)').get(name);
    if (existing) return existing.id;
    const id = randomUUID();
    db.prepare('insert into exercises (id, name, category, primary_muscle, difficulty, image_url) values (?,?,?,?,?,?)').run(id, name, 'generato', primaryMuscle || 'Generico', 'intermedio', '/exercise-placeholder.svg');
    return id;
  };
  const tx = db.transaction(() => {
    db.prepare('update workout_plans set active=0').run();
    db.prepare('insert into workout_plans (id, user_profile_id, name, goal, level, days_per_week, equipment, ai_generated, active) values (?,?,?,?,?,?,?,1,1)')
      .run(planId, prof ? prof.id : null, plan.name || 'Scheda AI', plan.goal || null, plan.level || null, (plan.days || []).length, plan.equipment || null);
    (plan.days || []).forEach((d: any, di: number) => {
      const dayId = randomUUID();
      db.prepare('insert into workout_days (id, workout_plan_id, day_of_week, order_index, title, focus) values (?,?,?,?,?,?)').run(dayId, planId, Number(d.dayOfWeek ?? di + 1), di, d.title || ('Giorno ' + (di + 1)), d.focus || null);
      (d.exercises || []).forEach((e: any, ei: number) => {
        const exId = findOrCreateExercise(e.name, e.primaryMuscle);
        db.prepare('insert into workout_exercises (id, workout_day_id, exercise_id, order_index, sets, reps, rest_seconds, progression_note) values (?,?,?,?,?,?,?,?)')
          .run(randomUUID(), dayId, exId, ei, Number(e.sets) || 3, String(e.reps || '8-12'), Number(e.restSeconds) || 75, e.note || null);
      });
    });
  });
  tx();
  return { ok: true, id: planId, days: (plan.days || []).length };
}

// ---------------- Diet (read) ----------------
export function getTodayMeals(): Meal[] {
  if (!dbReady()) return [];
  const db = getDb();
  const planId = getActiveDietPlanId();
  const planned: any[] = db.prepare('select pm.id, pm.meal_type mealType, coalesce(em.name, pm.name) name, coalesce(em.quantity, pm.quantity) quantity, coalesce(em.unit, pm.unit) unit, coalesce(em.calories, pm.calories) calories, coalesce(em.protein_g, pm.protein_g) proteinG, coalesce(em.carbs_g, pm.carbs_g) carbsG, coalesce(em.fat_g, pm.fat_g) fatG, coalesce(em.fiber_g, pm.fiber_g) fiberG, coalesce(em.notes, pm.notes) notes, coalesce(em.status, pm.status) status, pm.name plannedName, pm.calories plannedCalories from planned_meals pm join diet_days dd on dd.id=pm.diet_day_id left join eaten_meals em on em.planned_meal_id=pm.id and em.meal_date=? where dd.day_of_week=? and (? is null or dd.diet_plan_id=?) order by pm.order_index').all(isoToday(), dow(), planId, planId);
  return planned as Meal[];
}

export function getTodayExtraMeals(): any[] {
  if (!dbReady()) return [];
  return getDb().prepare("select id, meal_type mealType, name, quantity, unit, calories, protein_g proteinG, carbs_g carbsG, fat_g fatG, source from eaten_meals where meal_date=? and planned_meal_id is null order by created_at").all(isoToday());
}

// ---------------- Diet (write) ----------------
export function markMeal(input: { plannedMealId: string; status: 'mangiato' | 'saltato' | 'modificato' }) {
  if (!dbReady()) return { ok: true, demo: true };
  const db = getDb();
  const m: any = db.prepare('select * from planned_meals where id=?').get(input.plannedMealId);
  if (!m) throw new Error('Pasto non trovato');
  db.prepare('insert into eaten_meals (id, meal_date, planned_meal_id, meal_type, name, quantity, unit, calories, protein_g, carbs_g, fat_g, fiber_g, status, source) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?) on conflict(planned_meal_id, meal_date) do update set status=excluded.status, updated_at=current_timestamp')
    .run(randomUUID(), isoToday(), input.plannedMealId, m.meal_type, m.name, m.quantity, m.unit, m.calories, m.protein_g, m.carbs_g, m.fat_g, m.fiber_g, input.status, 'planned');
  recomputeNutritionLog();
  return { ok: true };
}

// Edit or replace a planned meal: keeps the same meal_type, recomputes macros,
// and saves to history as 'modificato' (edit) or 'sostituito' (replace).
export function editPlannedMeal(input: { plannedMealId: string; replace?: boolean; name?: string; quantity?: number; unit?: string; calories?: number; proteinG?: number; carbsG?: number; fatG?: number; fiberG?: number; notes?: string }) {
  if (!dbReady()) return { ok: true, demo: true };
  const db = getDb();
  const m: any = db.prepare('select * from planned_meals where id=?').get(input.plannedMealId);
  if (!m) throw new Error('Pasto non trovato');
  const num = (v: any, fb: number) => (v === '' || v === undefined || v === null ? fb : Number(v));
  // For an existing override, fall back to the previous eaten values, else the planned ones.
  const prev: any = db.prepare('select * from eaten_meals where planned_meal_id=? and meal_date=?').get(input.plannedMealId, isoToday());
  const base = prev || m;
  const status = input.replace ? 'sostituito' : 'modificato';
  const vals = {
    name: input.name ?? base.name,
    quantity: num(input.quantity, base.quantity),
    unit: input.unit ?? base.unit,
    calories: num(input.calories, base.calories),
    protein_g: num(input.proteinG, base.protein_g),
    carbs_g: num(input.carbsG, base.carbs_g),
    fat_g: num(input.fatG, base.fat_g),
    fiber_g: num(input.fiberG, base.fiber_g),
    notes: input.notes ?? base.notes ?? null,
  };
  db.prepare('insert into eaten_meals (id, meal_date, planned_meal_id, meal_type, name, quantity, unit, calories, protein_g, carbs_g, fat_g, fiber_g, status, source, notes) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) on conflict(planned_meal_id, meal_date) do update set name=excluded.name, quantity=excluded.quantity, unit=excluded.unit, calories=excluded.calories, protein_g=excluded.protein_g, carbs_g=excluded.carbs_g, fat_g=excluded.fat_g, fiber_g=excluded.fiber_g, status=excluded.status, notes=excluded.notes, updated_at=current_timestamp')
    .run(randomUUID(), isoToday(), input.plannedMealId, m.meal_type, vals.name, vals.quantity, vals.unit, vals.calories, vals.protein_g, vals.carbs_g, vals.fat_g, vals.fiber_g, status, 'planned', vals.notes);
  recomputeNutritionLog();
  return { ok: true, status };
}

export function addEatenMeal(input: any) {
  if (!dbReady()) return { ok: true, demo: true };
  getDb().prepare('insert into eaten_meals (id, meal_date, meal_type, name, quantity, unit, calories, protein_g, carbs_g, fat_g, fiber_g, status, source, confidence, notes) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(randomUUID(), isoToday(), input.mealType || 'Extra', input.name || 'Pasto', Number(input.quantity || 1), input.unit || 'g', Number(input.calories || 0), Number(input.proteinG || 0), Number(input.carbsG || 0), Number(input.fatG || 0), Number(input.fiberG || 0), 'mangiato', input.source || 'manual', input.confidence ?? null, input.notes || null);
  recomputeNutritionLog();
  return { ok: true };
}

export function addEatenMeals(items: any[]) {
  if (!dbReady()) return { ok: true, demo: true };
  const db = getDb();
  const tx = db.transaction((rows: any[]) => { for (const r of rows) addEatenMeal(r); });
  tx(items || []);
  return { ok: true, count: (items || []).length };
}

export function recomputeNutritionLog(date = isoToday()) {
  if (!dbReady()) return;
  const db = getDb();
  const t: any = db.prepare("select coalesce(sum(calories),0) calories, coalesce(sum(protein_g),0) protein_g, coalesce(sum(carbs_g),0) carbs_g, coalesce(sum(fat_g),0) fat_g, coalesce(sum(fiber_g),0) fiber_g from eaten_meals where meal_date=? and status in ('mangiato','modificato','sostituito')").get(date);
  db.prepare('insert into nutrition_logs (id, log_date, calories, protein_g, carbs_g, fat_g, fiber_g) values (?,?,?,?,?,?,?) on conflict(log_date) do update set calories=excluded.calories, protein_g=excluded.protein_g, carbs_g=excluded.carbs_g, fat_g=excluded.fat_g, fiber_g=excluded.fiber_g, updated_at=current_timestamp')
    .run(randomUUID(), date, t.calories, t.protein_g, t.carbs_g, t.fat_g, t.fiber_g);
}

// ---------------- PDF diet import save ----------------
export function savePdfImport(input: { fileName: string; rawText?: string; rows: any[] }) {
  if (!dbReady()) return { ok: true, demo: true };
  const db = getDb();
  const importId = randomUUID();
  db.prepare('insert into pdf_imports (id, file_name, raw_text, extracted_json, status) values (?,?,?,?,?)').run(importId, input.fileName, input.rawText || null, JSON.stringify(input.rows || []), 'reviewed');
  return { ok: true, id: importId };
}

const DAY_NAME_TO_NUM: Record<string, number> = { domenica: 0, lunedi: 1, 'lunedì': 1, martedi: 2, 'martedì': 2, mercoledi: 3, 'mercoledì': 3, giovedi: 4, 'giovedì': 4, venerdi: 5, 'venerdì': 5, sabato: 6 };

export function saveDietPlanFromRows(input: { name?: string; rows: any[] }) {
  if (!dbReady()) return { ok: true, demo: true };
  const db = getDb();
  const prof: any = db.prepare('select id from user_profile limit 1').get();
  const planId = randomUUID();
  db.prepare('update diet_plans set active=0').run();
  db.prepare('insert into diet_plans (id, user_profile_id, name, active) values (?,?,?,1)').run(planId, prof ? prof.id : null, input.name || 'Dieta importata');
  const dayCache: Record<number, string> = {};
  const ensureDay = (dow: number) => { if (dayCache[dow]) return dayCache[dow]; const id = randomUUID(); db.prepare('insert into diet_days (id, diet_plan_id, day_of_week, title) values (?,?,?,?)').run(id, planId, dow, 'Giorno dieta'); dayCache[dow] = id; return id; };
  const num = (v: any) => Number(v || 0) || 0;
  let order = 0;
  const tx = db.transaction((rows: any[]) => {
    for (const r of rows) {
      const dayKey = (r.day || '').toString().toLowerCase().trim();
      const dows = DAY_NAME_TO_NUM[dayKey] !== undefined ? [DAY_NAME_TO_NUM[dayKey]] : [0,1,2,3,4,5,6];
      for (const d of dows) {
        const dayId = ensureDay(d);
        db.prepare('insert into planned_meals (id, diet_day_id, order_index, meal_type, name, quantity, unit, calories, protein_g, carbs_g, fat_g, fiber_g, notes) values (?,?,?,?,?,?,?,?,?,?,?,?,?)')
          .run(randomUUID(), dayId, order++, r.mealType || 'Pasto', r.food || r.name || 'Alimento', num(r.quantity) || 1, r.unit || 'porzione', num(r.calories), num(r.proteinG), num(r.carbsG), num(r.fatG), num(r.fiberG), r.notes || null);
      }
    }
  });
  tx(input.rows || []);
  return { ok: true, id: planId };
}

// ---------------- Body metrics + water ----------------
export function addBodyMetric(input: any) {
  if (!dbReady()) return { ok: true, demo: true };
  const db = getDb();
  const date = input.date || isoToday();
  const num = (v: any) => (v === '' || v === undefined || v === null ? null : Number(v));
  const existing: any = db.prepare('select id from body_metrics where metric_date=? order by created_at desc limit 1').get(date);
  const vals = { weight: num(input.weightKg), waist: num(input.waistCm), chest: num(input.chestCm), arm: num(input.armCm), thigh: num(input.thighCm), bf: num(input.bodyFatPercent), sleep: num(input.sleepHours), steps: num(input.steps), notes: input.notes || null };
  if (existing) {
    db.prepare('update body_metrics set weight_kg=coalesce(?,weight_kg), waist_cm=coalesce(?,waist_cm), chest_cm=coalesce(?,chest_cm), arm_cm=coalesce(?,arm_cm), thigh_cm=coalesce(?,thigh_cm), body_fat_percent=coalesce(?,body_fat_percent), sleep_hours=coalesce(?,sleep_hours), steps=coalesce(?,steps), notes=coalesce(?,notes), updated_at=current_timestamp where id=?')
      .run(vals.weight, vals.waist, vals.chest, vals.arm, vals.thigh, vals.bf, vals.sleep, vals.steps, vals.notes, existing.id);
  } else {
    db.prepare('insert into body_metrics (id, metric_date, weight_kg, waist_cm, chest_cm, arm_cm, thigh_cm, body_fat_percent, sleep_hours, steps, notes) values (?,?,?,?,?,?,?,?,?,?,?)')
      .run(randomUUID(), date, vals.weight, vals.waist, vals.chest, vals.arm, vals.thigh, vals.bf, vals.sleep, vals.steps, vals.notes);
  }
  return { ok: true };
}

export function setWater(liters: number, date = isoToday()) {
  if (!dbReady()) return { ok: true, demo: true };
  const db = getDb();
  const cur: any = db.prepare('select * from nutrition_logs where log_date=?').get(date);
  if (cur) db.prepare('update nutrition_logs set water_l=?, updated_at=current_timestamp where log_date=?').run(liters, date);
  else db.prepare('insert into nutrition_logs (id, log_date, water_l) values (?,?,?)').run(randomUUID(), date, liters);
  return { ok: true, waterL: liters };
}

export function addWater(deltaL: number, date = isoToday()) {
  if (!dbReady()) return { ok: true, demo: true };
  const cur: any = getDb().prepare('select water_l from nutrition_logs where log_date=?').get(date);
  const next = Math.max(0, Number((((cur ? cur.water_l : 0) + deltaL)).toFixed(2)));
  return setWater(next, date);
}

// ---------------- Dashboard ----------------
export function getDashboard(): DashboardData {
  const p = getProfile();
  const w = getTodayWorkout();
  const meals = getTodayMeals();
  const extras = getTodayExtraMeals();
  const eaten = meals.filter((m) => m.status === 'mangiato' || m.status === 'modificato');
  const acc = (arr: any[]) => arr.reduce((a, m) => ({ calories: a.calories + (m.calories || 0), proteinG: a.proteinG + (m.proteinG || 0), carbsG: a.carbsG + (m.carbsG || 0), fatG: a.fatG + (m.fatG || 0) }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
  const s1 = acc(eaten); const s2 = acc(extras);
  const s = { calories: s1.calories + s2.calories, proteinG: s1.proteinG + s2.proteinG, carbsG: s1.carbsG + s2.carbsG, fatG: s1.fatG + s2.fatG };
  let waterL = 0; let bodyWeight = p.weightKg;
  if (dbReady()) {
    const water: any = getDb().prepare('select water_l from nutrition_logs where log_date=?').get(isoToday());
    waterL = water ? water.water_l : 0;
    const body: any = getDb().prepare('select weight_kg from body_metrics where metric_date<=? and weight_kg is not null order by metric_date desc limit 1').get(isoToday());
    if (body && body.weight_kg) bodyWeight = body.weight_kg;
  }
  const completed = (w.exercises as any[]).filter((e) => e.completed).length;
  const confirmed = eaten.length;
  return { todayLabel: italianDate(), workoutTitle: w.title, exercisesCompleted: completed, exercisesTotal: w.exercises.length, mealsConfirmed: confirmed, mealsTotal: meals.length, calories: Math.round(s.calories), calorieTarget: p.dailyCalorieTarget, proteinG: Math.round(s.proteinG), proteinTargetG: p.proteinTargetG, carbsG: Math.round(s.carbsG), carbsTargetG: p.carbsTargetG, fatG: Math.round(s.fatG), fatTargetG: p.fatTargetG, waterL, waterTargetL: p.waterTargetL, bodyWeightKg: bodyWeight, status: dbReady() ? (completed === w.exercises.length && w.exercises.length > 0 && confirmed === meals.length ? 'Giornata completata' : 'In corso') : 'Demo senza DB: esegui npm run setup:db' };
}

// ---------------- Progress ----------------
export function getProgress() {
  if (!dbReady()) return { weight: [] as any[], nutrition: [] as any[], workouts: [] as any[], lifts: [] as any[] };
  const db = getDb();
  const weight = db.prepare('select metric_date date, weight_kg weightKg, waist_cm waistCm from body_metrics where weight_kg is not null order by metric_date asc limit 60').all();
  const nutrition = db.prepare('select log_date date, calories, protein_g proteinG, carbs_g carbsG, fat_g fatG, water_l waterL from nutrition_logs order by log_date asc limit 60').all();
  const workouts = db.prepare('select workout_date date, completion_percent pct, status from workout_logs order by workout_date desc limit 30').all();
  const lifts = db.prepare('select e.name, el.weight_kg weightKg, wl.workout_date date from exercise_logs el join workout_logs wl on wl.id=el.workout_log_id join exercises e on e.id=el.exercise_id where el.weight_kg is not null order by wl.workout_date asc limit 100').all();
  return { weight, nutrition, workouts, lifts };
}

export function getProgressList() { const p = getProgress(); return p.weight; }

// ---------------- Notifications ----------------
export function getNotifications() {
  if (!dbReady()) return [] as any[];
  return getDb().prepare('select id, type, title, body, time_of_day timeOfDay, frequency, enabled from notifications order by time_of_day').all();
}

export function upsertNotification(input: any) {
  if (!dbReady()) return { ok: true, demo: true };
  const db = getDb();
  if (input.id) {
    db.prepare('update notifications set title=coalesce(?,title), body=coalesce(?,body), time_of_day=coalesce(?,time_of_day), frequency=coalesce(?,frequency), enabled=coalesce(?,enabled), updated_at=current_timestamp where id=?')
      .run(input.title ?? null, input.body ?? null, input.timeOfDay ?? null, input.frequency ?? null, input.enabled === undefined ? null : (input.enabled ? 1 : 0), input.id);
    return { ok: true, id: input.id };
  }
  const id = randomUUID();
  db.prepare('insert into notifications (id, type, title, body, time_of_day, frequency, enabled) values (?,?,?,?,?,?,?)').run(id, input.type || 'custom', input.title || 'Promemoria', input.body || '', input.timeOfDay || '12:00', input.frequency || 'daily', input.enabled === false ? 0 : 1);
  return { ok: true, id };
}

export function deleteNotification(id: string) {
  if (!dbReady()) return { ok: true, demo: true };
  getDb().prepare('delete from notifications where id=?').run(id);
  return { ok: true };
}

// ---------------- Push subscriptions ----------------
export function savePushSubscription(input: { endpoint: string; keys: { p256dh: string; auth: string }; userAgent?: string }) {
  if (!dbReady()) return { ok: true, demo: true };
  if (!input?.endpoint || !input?.keys?.p256dh || !input?.keys?.auth) throw new Error('Subscription non valida');
  const db = getDb();
  db.prepare('insert into push_subscriptions (id, endpoint, p256dh, auth, user_agent, enabled) values (?,?,?,?,?,1) on conflict(endpoint) do update set p256dh=excluded.p256dh, auth=excluded.auth, user_agent=excluded.user_agent, enabled=1, updated_at=current_timestamp')
    .run(randomUUID(), input.endpoint, input.keys.p256dh, input.keys.auth, input.userAgent || null);
  return { ok: true };
}

export function deletePushSubscription(endpoint: string) {
  if (!dbReady()) return { ok: true, demo: true };
  getDb().prepare('delete from push_subscriptions where endpoint=?').run(endpoint);
  return { ok: true };
}

export function countPushSubscriptions(): number {
  if (!dbReady()) return 0;
  const r: any = getDb().prepare('select count(*) c from push_subscriptions where enabled=1').get();
  return r ? r.c : 0;
}

// backward-compat alias used by older manual route
export function addManualMeal(input: any) { return addEatenMeal(input); }
