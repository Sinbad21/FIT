'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

function Chart({ title, data, dataKey, color, unit }: { title: string; data: any[]; dataKey: string; color: string; unit?: string }) {
  return (
    <article className="glass-card rounded-[1.6rem] p-4">
      <h3 className="mb-3 font-black">{title}</h3>
      {data.length === 0 ? <p className="text-sm text-gray-500">Nessun dato ancora.</p> : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => String(v).slice(5)} />
              <YAxis tick={{ fontSize: 10 }} width={40} />
              <Tooltip />
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={false} unit={unit} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
}

export function ProgressCharts({ progress }: { progress: any }) {
  return (
    <div className="space-y-4">
      <Chart title="Peso corporeo (kg)" data={progress.weight || []} dataKey="weightKg" color="#f97316" unit=" kg" />
      <Chart title="Calorie giornaliere" data={progress.nutrition || []} dataKey="calories" color="#2563eb" />
      <Chart title="Proteine (g)" data={progress.nutrition || []} dataKey="proteinG" color="#22c55e" unit=" g" />
      <article className="glass-card rounded-[1.6rem] p-4">
        <h3 className="mb-3 font-black">Allenamenti recenti</h3>
        {(progress.workouts || []).length === 0 ? <p className="text-sm text-gray-500">Nessun allenamento registrato.</p> : (
          <div className="space-y-2">
            {(progress.workouts || []).map((w: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-gray-50 p-2 text-sm">
                <span className="font-bold">{w.date}</span>
                <span>{w.pct}% · {w.status}</span>
              </div>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
