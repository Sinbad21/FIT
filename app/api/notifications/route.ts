import { NextResponse } from 'next/server';
import { getNotifications, upsertNotification, deleteNotification } from '@/lib/repositories';
export const runtime = 'nodejs';
export function GET() { return NextResponse.json({ notifications: getNotifications() }); }
export async function POST(req: Request) { return NextResponse.json(upsertNotification(await req.json())); }
export async function DELETE(req: Request) { const { id } = await req.json(); return NextResponse.json(deleteNotification(id)); }
