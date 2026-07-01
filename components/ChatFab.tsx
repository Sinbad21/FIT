'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

export function ChatFab() {
  const pathname = usePathname();
  if (pathname === '/chat') return null;
  return (
    <Link href="/chat" aria-label="Chat con il coach" className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-soft transition active:scale-95">
      <MessageCircle className="h-6 w-6" />
    </Link>
  );
}
