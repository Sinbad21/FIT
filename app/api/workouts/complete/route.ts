import { NextResponse } from 'next/server';
import { logExercise } from '@/lib/repositories';
export const runtime = 'nodejs';
export async function POST(req: Request) { return NextResponse.json(logExercise(await req.json())); }
