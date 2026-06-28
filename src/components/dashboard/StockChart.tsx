'use client';

// Graphique stock par matière première (BarChart Recharts)
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';

export interface StockPoint {
  nom: string;
  quantite: number;
  seuil: number;
  unite: string;
}

interface Props {
  donnees: StockPoint[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: StockPoint }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const ok = d.quantite >= d.seuil;
  return (
    <div
      className="px-3 py-2 rounded-xl text-xs space-y-1"
      style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border2)',
        color: 'var(--text)',
      }}
    >
      <div className="font-semibold" style={{ color: 'var(--text)' }}>{label}</div>
      <div style={{ color: 'var(--text2)' }}>
        Stock : <span className="font-bold" style={{ color: ok ? 'var(--green)' : 'var(--red)' }}>
          {d.quantite.toLocaleString('fr-FR')} {d.unite}
        </span>
      </div>
      {d.seuil > 0 && (
        <div style={{ color: 'var(--text3)' }}>
          Seuil min. : {d.seuil.toLocaleString('fr-FR')} {d.unite}
        </div>
      )}
    </div>
  );
}

export default function StockChart({ donnees }: Props) {
  if (donnees.length === 0) {
    return (
      <div
        className="h-52 flex items-center justify-center text-sm"
        style={{ color: 'var(--text3)' }}
      >
        Aucune donnée de stock disponible
      </div>
    );
  }

  // Tronquer les noms trop longs pour l'axe X
  const donneesFormatees = donnees.slice(0, 10).map((d) => ({
    ...d,
    nomCourt: d.nom.length > 10 ? d.nom.slice(0, 9) + '…' : d.nom,
  }));

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={donneesFormatees}
          margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="nomCourt"
            tick={{ fill: 'var(--text3)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text3)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="quantite" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {donneesFormatees.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.seuil > 0 && entry.quantite < entry.seuil
                    ? 'var(--red)'
                    : entry.seuil > 0 && entry.quantite < entry.seuil * 1.5
                    ? 'var(--amber)'
                    : 'var(--terra2)'
                }
                fillOpacity={0.85}
              />
            ))}
          </Bar>
          {/* Ligne de seuil minimale si données homogènes */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
