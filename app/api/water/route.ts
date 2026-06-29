import { NextResponse } from 'next/server';
import { addWater, setWater } from '@/lib/repositories';
export const runtime = 'nodejs';
export async function POST(req: Request) { const b = await req.json(); if (b.set !== undefined) return NextResponse.json(setWater(Number(b.set))); return NextResponse.json(addWater(Number(b.delta || 0))); }
