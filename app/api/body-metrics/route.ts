import { NextResponse } from 'next/server';
import { addBodyMetric, getProgress } from '@/lib/repositories';
export const runtime = 'nodejs';
export function GET() { return NextResponse.json(getProgress()); }
export async function POST(req: Request) { return NextResponse.json(addBodyMetric(await req.json())); }
