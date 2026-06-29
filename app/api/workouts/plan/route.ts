import { NextResponse } from 'next/server';
import { getPlanWithDays, duplicatePlan } from '@/lib/repositories';
export const runtime = 'nodejs';
export function GET() { return NextResponse.json(getPlanWithDays()); }
export async function POST(req: Request) { const b = await req.json().catch(() => ({})); return NextResponse.json(duplicatePlan(b.planId)); }
