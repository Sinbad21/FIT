import { NextResponse } from 'next/server';
import { saveGeneratedPlan } from '@/lib/repositories';
import { groupWorkoutRows } from '@/lib/workoutPdf';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const rows = Array.isArray(b.rows) ? b.rows : [];
  if (rows.length === 0) return NextResponse.json({ ok: false, error: 'Nessun esercizio da salvare' }, { status: 400 });
  try {
    const days = groupWorkoutRows(rows);
    const r = saveGeneratedPlan({ name: b.name || 'Scheda importata', days });
    return NextResponse.json(r);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
