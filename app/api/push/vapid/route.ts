import { NextResponse } from 'next/server';
import { pushConfigured } from '@/lib/push';
import { countPushSubscriptions } from '@/lib/repositories';

export const runtime = 'nodejs';

export function GET() {
  return NextResponse.json({
    configured: pushConfigured(),
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null,
    subscriptions: countPushSubscriptions(),
  });
}
