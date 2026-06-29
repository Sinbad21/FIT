import { NextResponse } from 'next/server';
import { createDay, updateDay, deleteDay } from '@/lib/repositories';
export const runtime = 'nodejs';
export async function POST(req: Request) { return NextResponse.json(createDay(await req.json())); }
export async function PATCH(req: Request) { return NextResponse.json(updateDay(await req.json())); }
export async function DELETE(req: Request) { const { id } = await req.json(); return NextResponse.json(deleteDay(id)); }
