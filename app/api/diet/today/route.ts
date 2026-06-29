import { NextResponse } from 'next/server';
import { getTodayMeals, getTodayExtraMeals } from '@/lib/repositories';
export const runtime = 'nodejs';
export function GET() { return NextResponse.json({ meals: getTodayMeals(), extras: getTodayExtraMeals() }); }
