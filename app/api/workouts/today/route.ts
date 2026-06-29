import { NextResponse } from 'next/server';
import { getTodayWorkout } from '@/lib/repositories';
export const runtime = 'nodejs';
export function GET() { return NextResponse.json(getTodayWorkout()); }
