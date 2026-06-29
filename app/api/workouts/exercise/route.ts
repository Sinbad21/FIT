import { NextResponse } from 'next/server';
import { addExerciseToDay, updateWorkoutExercise, deleteWorkoutExercise } from '@/lib/repositories';
export const runtime = 'nodejs';
export async function POST(req: Request) { return NextResponse.json(addExerciseToDay(await req.json())); }
export async function PATCH(req: Request) { return NextResponse.json(updateWorkoutExercise(await req.json())); }
export async function DELETE(req: Request) { const { id } = await req.json(); return NextResponse.json(deleteWorkoutExercise(id)); }
