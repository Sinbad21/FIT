import { NextResponse } from 'next/server';
import { importBackup } from '@/lib/repositories';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || !b.data) return NextResponse.json({ ok: false, error: 'Nessun backup fornito' }, { status: 400 });
  try {
    return NextResponse.json(importBackup(b.data, b.mode === 'replace' ? 'replace' : 'merge'));
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
