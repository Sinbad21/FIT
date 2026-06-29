import { NextResponse } from 'next/server';
import { getProgress } from '@/lib/repositories';
export const runtime = 'nodejs';
export function GET() { return NextResponse.json(getProgress()); }
