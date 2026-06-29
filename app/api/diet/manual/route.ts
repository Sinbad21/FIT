import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { addEatenMeal } from '@/lib/repositories';
export const runtime = 'nodejs';
export async function POST(req: Request) {
  const ct = req.headers.get('content-type') || '';
  if (ct.includes('form')) { const f = await req.formData(); addEatenMeal(Object.fromEntries(f)); redirect('/diet'); }
  return NextResponse.json(addEatenMeal(await req.json()));
}
