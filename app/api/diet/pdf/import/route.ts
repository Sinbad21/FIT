import { NextResponse } from 'next/server';
import { extractDietRows } from '@/lib/pdf';
export const runtime = 'nodejs';
export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('pdf');
  if (!(file instanceof File)) return NextResponse.json({ error: 'PDF mancante' }, { status: 400 });
  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const parsed = await pdfParse(buffer);
    const text = parsed.text || '';
    return NextResponse.json({ fileName: file.name, rows: extractDietRows(text), rawPreview: text.slice(0, 4000) });
  } catch (e) {
    return NextResponse.json({ error: 'Parsing PDF non riuscito', details: String(e) }, { status: 422 });
  }
}
