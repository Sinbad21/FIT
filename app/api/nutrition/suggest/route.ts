import { NextResponse } from 'next/server';
import { suggestNutritionTargets } from '@/lib/ai/suggestNutrition';
export const runtime = 'nodejs';
export async function POST(req: Request) { return NextResponse.json(await suggestNutritionTargets(await req.json())); }
