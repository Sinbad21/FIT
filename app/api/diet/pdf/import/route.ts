import { NextResponse } from 'next/server';
import { extractDietFromPdf } from '@/lib/ai/extractDietFromPdf';
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
    // Digital PDF: text is present. If empty, it's likely scanned -> needs OCR (not bundled).
    if (!text.trim()) {
      return NextResponse.json({ fileName: file.name, rows: [], rawPreview: '', provider: 'none', warning: 'PDF probabilmente scansionato: nessun testo estraibile. Serve OCR o inserimento manuale.' });
    }
    const { rows, provider } = await extractDietFromPdf(text);
    // Output sempre revisionabile: mai salvato direttamente senza conferma utente.
    return NextResponse.json({ fileName: file.name, rows, rawPreview: text.slice(0, 4000), provider });
  } catch (e) {
    return NextResponse.json({ error: 'Parsing PDF non riuscito', details: String(e) }, { status: 422 });
  }
}
