import { NextResponse } from 'next/server';
import { runChat, type ChatMessage } from '@/lib/ai/chat';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const history: ChatMessage[] = Array.isArray(body.messages)
    ? body.messages.filter((m: any) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string').slice(-20)
    : [];
  const result = await runChat(history);
  return NextResponse.json(result);
}
