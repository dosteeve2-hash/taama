'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { format, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Download, BarChart3, TrendingUp, Factory, AlertTriangle } from 'lucide-react';
import type { Batch, BatchInput, BatchOutput } from '@/types/database';

interface Props {
  lots: Batch[];
  debutInitial: string;
  finInitial: string;
}

// ─── Calculs utilitaires ──────────────────────────────────────────────────────

function calculerStats(lots: Batch[]) {
  let totalEntree = 0;
  let totalSortie = 0;
  const rendements: number[] = [];

  for (const lot of lots) {
    const entrees = (lot.batch_inputs ?? []) as BatchInput[];
    const sorties = (lot.batch_outputs ?? []) as BatchOutput[];
    const e = entrees.reduce((s, i) => s + Number(i.quantity_used), 0);
    const so = sorties.reduce((s, o) => s + Number(o.quantity_produced), 0);
    totalEntree += e;
    totalSortie += so;
    if (e > 0) rendements.push((so / e) * 100);
  }

  const avgYield = rendements.length > 0
    ? Math.round(rendements.reduce((a, b) => a + b, 0) / rendements.length)
    : 0;
  const tauxPerte = totalEntree > 0
    ? Math.round(((totalEntree - totalSortie) / totalEntree) * 100)
    : 0;

  return {
    lotsCompletes: lots.length,
    tonnesProduites: Math.round(totalSortie / 100) / 10, // en tonnes
    rendementMoyen: avgYield,
    tauxPerte,
  };
}

// Grouper par semaine pour le bar chart
function parSemaine(lots: Batch[]): Array<{ semaine: string; tonnes: number }> {
  const parSem: Record<string, number> = {};

  for (const lot of lots) {
    if (!lot.completed_at) continue;
    const d = new Date(lot.completed_at);
    const lundi = startOfWeek(d, { weekStartsOn: 1 });
    const cle = format(lundi, 'dd/MM', { locale: fr });
    const sorties = (lot.batch_outputs ?? []) as BatchOutput[];
    const tonnes = sorties.reduce((s, o) => s + Number(o.quantity_produced), 0) / 1000;
    parSem[cle] = (parSem[cle] ?? 0) + tonnes;
  }

  return Object.entries(parSem)
    .map(([semaine, tonnes]) => ({ semaine, tonnes: Math.round(tonnes * 10) / 10 }))
    .sort((a, b) => a.semaine.localeCompare(b.semaine));
}

// ─── Export CSV ───────────────────────────────────────────────────────────────

function exporterCSV(lots: Batch[], debut: string, fin: string) {
  const headers = ['Numéro lot', 'Statut', 'Entrées (kg)', 'Sorties (kg)', 'Rendement (%)', 'Date clôture'];

  const lignes = lots.map((lot) => {
    const entrees = (lot.batch_inputs ?? []) as BatchInput[];
    const sorties = (lot.batch_outputs ?? []) as BatchOutput[];
    const totalE = entrees.reduce((s, i) => s + Number(i.quantity_used), 0);
    const totalS = sorties.reduce((s, o) => s + Number(o.quantity_produced), 0);
    const rend = totalE > 0 ? Math.round((totalS / totalE) * 100) : 0;

    return [
      lot.batch_number,
      lot.status,
      totalE.toString(),
      totalS.toString(),
      rend.toString(),
      lot.completed_at ? format(new Date(lot.completed_at), 'dd/MM/yyyy HH:mm') : '',
    ].join(',');
  });

  const csv = [headers.join(','), ...lignes].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taama-rapport-${debut}-${fin}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Tooltip bar chart ────────────────────────────────────────────────────────
function CustomTooltip({
  active, payload, label,
}: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs"
      style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)' }}>
      <div style={{ color: 'var(--text2)' }}>Sem. {label}</div>
      <div className="font-bold mt-0.5" style={{ color: 'var(--amber)' }}>{payload[0].value} t</div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function RapportsClient({ lots, debutInitial, finInitial }: Props) {
  const router = useRouter();
  const [debut, setDebut] = useState(debutInitial);
  const [fin, setFin]     = useState(finInitial);

  const stats     = useMemo(() => calculerStats(lots), [lots]);
  const donneesSem = useMemo(() => parSemaine(lots), [lots]);

  const appliquerPeriode = () => {
    router.push(`/rapports?debut=${debut}&fin=${fin}`);
  };

  // Raccourcis périodes
  const setPeriode = (type: 'mois' | 'mois_prec' | 'trimestre') => {
    const now = new Date();
    if (type === 'mois') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      setDebut(d.toISOString().slice(0, 10));
      setFin(now.toISOString().slice(0, 10));
    } else if (type === 'mois_prec') {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const f = new Date(now.getFullYear(), now.getMonth(), 0);
      setDebut(d.toISOString().slice(0, 10));
      setFin(f.toISOString().slice(0, 10));
    } else {
      const d = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      setDebut(d.toISOString().slice(0, 10));
      setFin(now.toISOString().slice(0, 10));
    }
  };

  const inputStyle = { background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)' };

  const kpis = [
    { label: 'Lots complétés',   value: stats.lotsCompletes,                icon: Factory,        color: 'var(--blue)',   bg: 'rgba(88,166,255,0.1)' },
    { label: 'Tonnes produites',  value: `${stats.tonnesProduites} t`,        icon: BarChart3,      color: 'var(--amber)',  bg: 'rgba(240,168,50,0.1)' },
    { label: 'Rendement moyen',   value: `${stats.rendementMoyen}%`,          icon: TrendingUp,     color: 'var(--green)',  bg: 'rgba(63,185,80,0.1)' },
    { label: 'Taux de perte',     value: `${stats.tauxPerte}%`,               icon: AlertTriangle,  color: 'var(--red)',    bg: 'rgba(248,81,73,0.1)' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Rapports</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            Analyse de production par période
          </p>
        </div>
        <button
          onClick={() => exporterCSV(lots, debut, fin)}
          disabled={lots.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
          style={{ border: '1px solid var(--border2)', color: 'var(--text2)' }}
        >
          <Download size={15} /> Exporter CSV
        </button>
      </div>

      {/* Sélecteur de période */}
      <div className="taama-card p-4 flex flex-wrap items-end gap-4">
        <div className="flex gap-2 flex-wrap">
          {([
            ['mois',      'Ce mois'],
            ['mois_prec', 'Mois précédent'],
            ['trimestre', '3 derniers mois'],
          ] as ['mois' | 'mois_prec' | 'trimestre', string][]).map(([type, label]) => (
            <button key={type}
              onClick={() => { setPeriode(type); setTimeout(appliquerPeriode, 50); }}
              className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{ border: '1px solid var(--border2)', color: 'var(--text2)' }}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input type="date" value={debut} onChange={(e) => setDebut(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
            style={{ ...inputStyle, minWidth: 130 }} />
          <span className="text-xs" style={{ color: 'var(--text3)' }}>→</span>
          <input type="date" value={fin} onChange={(e) => setFin(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
            style={{ ...inputStyle, minWidth: 130 }} />
          <button onClick={appliquerPeriode}
            className="px-4 py-2 rounded-xl text-sm font-semibold taama-btn-primary whitespace-nowrap">
            Appliquer
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="taama-card p-5 flex flex-col gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: kpi.bg }}>
              <kpi.icon size={16} style={{ color: kpi.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphique production par semaine */}
      <div className="taama-card p-6">
        <h2 className="font-semibold text-base mb-6" style={{ color: 'var(--text)' }}>
          Production par semaine (tonnes)
        </h2>
        {donneesSem.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm"
            style={{ color: 'var(--text3)' }}>
            Aucune production sur cette période
          </div>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={donneesSem} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="semaine" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tonnes" fill="var(--amber)" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tableau détaillé */}
      <div className="taama-card overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-base" style={{ color: 'var(--text)' }}>
            Détail des lots ({lots.length})
          </h2>
        </div>
        {lots.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text3)' }}>
            Aucun lot complété sur cette période.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Lot', 'Entrées (kg)', 'Sorties (kg)', 'Rendement', 'Date clôture'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium"
                      style={{ color: 'var(--text3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lots.map((lot, i) => {
                  const entrees = (lot.batch_inputs ?? []) as BatchInput[];
                  const sorties = (lot.batch_outputs ?? []) as BatchOutput[];
                  const totalE = entrees.reduce((s, e) => s + Number(e.quantity_used), 0);
                  const totalS = sorties.reduce((s, o) => s + Number(o.quantity_produced), 0);
                  const rend = totalE > 0 ? Math.round((totalS / totalE) * 100) : 0;

                  return (
                    <tr key={lot.id}
                      style={{ borderBottom: i < lots.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td className="px-6 py-3.5 font-mono text-xs font-semibold"
                        style={{ color: 'var(--text)' }}>{lot.batch_number}</td>
                      <td className="px-6 py-3.5 font-mono text-xs" style={{ color: 'var(--text2)' }}>
                        {totalE.toLocaleString('fr-FR')}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs" style={{ color: 'var(--text2)' }}>
                        {totalS.toLocaleString('fr-FR')}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-bold text-xs"
                          style={{ color: rend >= 75 ? 'var(--green)' : rend >= 50 ? 'var(--amber)' : 'var(--red)' }}>
                          {rend}%
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-xs" style={{ color: 'var(--text3)' }}>
                        {lot.completed_at
                          ? format(new Date(lot.completed_at), 'dd/MM/yyyy', { locale: fr })
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
