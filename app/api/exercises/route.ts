import { NextResponse } from 'next/server';
import { listExercises, createExercise, updateExercise, deleteExercise, getExercise } from '@/lib/repositories';
export const runtime = 'nodejs';

export function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  if (id) return NextResponse.json({ exercise: getExercise(id) });
  return NextResponse.json({ exercises: listExercises() });
}

export async function POST(req: Request) {
  try { return NextResponse.json(createExercise(await req.json())); }
  catch (e: any) { return NextResponse.json({ ok: false, error: e.message }, { status: 400 }); }
}

export async function PUT(req: Request) {
  try { return NextResponse.json(updateExercise(await req.json())); }
  catch (e: any) { return NextResponse.json({ ok: false, error: e.message }, { status: 400 }); }
}

export async function DELETE(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (!b.id) return NextResponse.json({ ok: false, error: 'id mancante' }, { status: 400 });
  try { return NextResponse.json(deleteExercise(b.id)); }
  catch (e: any) { return NextResponse.json({ ok: false, error: e.message }, { status: 400 }); }
}
