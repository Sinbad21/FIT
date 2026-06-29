import { NextResponse } from 'next/server';
import { generatePlan } from '@/lib/repositories';
export const runtime = 'nodejs';
export async function POST(req: Request) { return NextResponse.json(generatePlan(await req.json())); }
