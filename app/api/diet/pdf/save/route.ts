import { NextResponse } from 'next/server';
import { saveDietPlanFromRows, savePdfImport } from '@/lib/repositories';
export const runtime = 'nodejs';
export async function POST(req: Request) {
  const body = await req.json();
  savePdfImport({ fileName: body.fileName || 'dieta.pdf', rows: body.rows || [] });
  return NextResponse.json(saveDietPlanFromRows({ name: body.name, rows: body.rows || [] }));
}
