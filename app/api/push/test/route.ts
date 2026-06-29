import { NextResponse } from 'next/server';
import { sendToAll, pushConfigured } from '@/lib/push';

export const runtime = 'nodejs';

export async function POST() {
  if (!pushConfigured()) return NextResponse.json({ ok: false, error: 'VAPID non configurato' }, { status: 400 });
  try {
    const r = await sendToAll({ title: 'FitControl', body: 'Notifica di prova ✅', url: '/' });
    return NextResponse.json({ ok: true, ...r });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
