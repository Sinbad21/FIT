import { NextResponse } from 'next/server';
import { editPlannedMeal } from '@/lib/repositories';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (!b.plannedMealId) return NextResponse.json({ ok: false, error: 'plannedMealId mancante' }, { status: 400 });
  try {
    return NextResponse.json(editPlannedMeal(b));
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
