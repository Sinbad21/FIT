import { NextResponse } from 'next/server';
import { addEatenMeals } from '@/lib/repositories';
export const runtime = 'nodejs';
export async function POST(req: Request) { const { items } = await req.json(); return NextResponse.json(addEatenMeals((items || []).map((i: any) => ({ ...i, source: 'ai' })))); }
