import { NextResponse } from 'next/server';
import { markMeal } from '@/lib/repositories';
export const runtime = 'nodejs';
export async function POST(req: Request) { return NextResponse.json(markMeal(await req.json())); }
