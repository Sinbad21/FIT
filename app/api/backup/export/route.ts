import { NextResponse } from 'next/server';
import { exportAll, exportCsv } from '@/lib/repositories';

export const runtime = 'nodejs';

export function GET(req: Request) {
  const type = new URL(req.url).searchParams.get('csv');
  if (type && ['meals', 'weight', 'workouts', 'exercises'].includes(type)) {
    const csv = exportCsv(type as any);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="fitcontrol-${type}.csv"`,
      },
    });
  }
  const data = exportAll();
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="fitcontrol-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
