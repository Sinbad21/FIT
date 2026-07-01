import { NextResponse } from 'next/server';
import { skipOnboarding } from '@/lib/repositories';
export const runtime = 'nodejs';
export async function POST() { return NextResponse.json(skipOnboarding()); }
