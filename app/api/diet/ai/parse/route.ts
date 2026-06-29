import { NextResponse } from 'next/server';
import { parseMealHeuristically } from '@/lib/ai';
export const runtime = 'nodejs';
export async function POST(req: Request) { const { text } = await req.json(); return NextResponse.json({ items: parseMealHeuristically(String(text || '')), provider: 'local-heuristic' }); }
