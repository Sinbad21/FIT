import { NextResponse } from 'next/server';
import { getAISettingsForClient, updateAISettings } from '@/lib/ai/provider';
export const runtime = 'nodejs';
export function GET() { return NextResponse.json(getAISettingsForClient()); }
export async function POST(req: Request) { return NextResponse.json(updateAISettings(await req.json())); }
