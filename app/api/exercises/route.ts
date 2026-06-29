import { NextResponse } from 'next/server';
import { listExercises, createExercise } from '@/lib/repositories';
export const runtime = 'nodejs';
export function GET() { return NextResponse.json({ exercises: listExercises() }); }
export async function POST(req: Request) { return NextResponse.json(createExercise(await req.json())); }
