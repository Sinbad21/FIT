import { NextResponse } from 'next/server';
import { generatePlan, saveGeneratedPlan } from '@/lib/repositories';
import { generateWorkout } from '@/lib/ai/generateWorkout';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json();
  // Try the AI provider first; fall back to the rule-based generator.
  try {
    const ai = await generateWorkout({
      goal: body.goal, daysPerWeek: Number(body.daysPerWeek) || 3, level: body.level,
      equipment: body.equipment, limitations: body.limitations, priorityMuscles: body.priorityMuscles,
    });
    if (ai.plan) {
      const r = saveGeneratedPlan({ name: ai.plan.name, goal: body.goal, level: body.level, equipment: body.equipment, days: ai.plan.days });
      return NextResponse.json({ ...r, provider: 'ai' });
    }
  } catch { /* fall through to rule-based */ }
  return NextResponse.json({ ...generatePlan(body), provider: 'rule-based' });
}
