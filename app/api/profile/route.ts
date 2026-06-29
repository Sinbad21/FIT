import { NextResponse } from 'next/server';
import { getProfileRaw, updateProfile } from '@/lib/repositories';
export const runtime = 'nodejs';
export function GET() { return NextResponse.json(getProfileRaw()); }
export async function POST(req: Request) { return NextResponse.json(updateProfile(await req.json())); }
