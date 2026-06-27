'use client';

// Composant client pour le graphique de production (recharts nécessite le DOM)
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

interface PointGraphique {
  date: string;
  tonnes: number;
}

interface Props {
  donnees: PointGraphique[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-xl text-xs"
      style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border2)',
        color: 'var(--text)',
      }}
    >
      <div style={{ color: 'var(--text2)' }}>{label}</div>
      <div className="font-bold mt-0.5" style={{ color: 'var(--amber)' }}>
        {payload[0].value} t
      </div>
    </div>
  );
}

export default function ProductionChart({ donnees }: Props) {
  if (donnees.length === 0) {
    return (
      <div
        className="h-52 flex items-center justify-center text-sm"
        style={{ color: 'var(--text3)' }}
      >
        Aucune donnée de production ce mois
      </div>
    );
  }

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={donnees} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--text3)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text3)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="tonnes"
            stroke="var(--amber)"
            strokeWidth={2}
            dot={{ fill: 'var(--amber)', r: 3 }}
            activeDot={{ r: 5, fill: 'var(--amber2)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
