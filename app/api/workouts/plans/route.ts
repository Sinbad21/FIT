import { NextResponse } from 'next/server';
import { listPlans, setActivePlan, deletePlan } from '@/lib/repositories';

export const runtime = 'nodejs';

export function GET() {
  return NextResponse.json({ plans: listPlans() });
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (!b.planId) return NextResponse.json({ ok: false, error: 'planId mancante' }, { status: 400 });
  try {
    return NextResponse.json(setActivePlan(b.planId));
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (!b.planId) return NextResponse.json({ ok: false, error: 'planId mancante' }, { status: 400 });
  return NextResponse.json(deletePlan(b.planId));
}
