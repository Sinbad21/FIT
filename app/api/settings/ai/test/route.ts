import { NextResponse } from 'next/server';
import { testAIConnection } from '@/lib/ai/provider';
export const runtime = 'nodejs';
export async function POST() { return NextResponse.json(await testAIConnection()); }
