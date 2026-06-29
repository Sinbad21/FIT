import { NextResponse } from 'next/server';
import { savePushSubscription, deletePushSubscription } from '@/lib/repositories';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  try {
    return NextResponse.json(savePushSubscription({ endpoint: b.endpoint, keys: b.keys, userAgent: b.userAgent }));
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (!b.endpoint) return NextResponse.json({ ok: false, error: 'endpoint mancante' }, { status: 400 });
  return NextResponse.json(deletePushSubscription(b.endpoint));
}
