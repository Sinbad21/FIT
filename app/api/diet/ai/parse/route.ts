import { NextResponse } from 'next/server';
import { parseMeal } from '@/lib/ai/parseMeal';
export const runtime = 'nodejs';
export async function POST(req: Request) {
  const { text } = await req.json();
  const r = await parseMeal(String(text || ''));
  return NextResponse.json({ items: r.items, provider: r.provider, needsConfirmation: r.needsConfirmation });
}
