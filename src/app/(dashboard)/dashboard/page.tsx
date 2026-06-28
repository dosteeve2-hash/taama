// Serveur Component — Dashboard principal avec vraies données Supabase
import {
  Factory, Package, AlertTriangle, TrendingUp,
  ArrowUpRight, ArrowDownRight, Clock,
} from 'lucide-react';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import {
  getProfilCourant,
  getOrgDashboardStats,
  getRecentBatches,
  getAlertesNonLues,
  getSitesAvecLotsEnCours,
  getInventoryWithAlerts,
} from '@/lib/queries';
import ProductionChart from '@/components/dashboard/ProductionChart';
import StockChart, { type StockPoint } from '@/components/dashboard/StockChart';
import DashboardAlertes from './DashboardAlertes';
import type { Batch, BatchInput, BatchOutput, Alert, InventoryItem } from '@/types/database';

// ─── Badge statut lot ─────────────────────────────────────────────────────────
function StatusBadge({ statut }: { statut: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    completed:   { bg: 'rgba(63,185,80,0.15)',  color: 'var(--green)', label: 'Terminé' },
    in_progress: { bg: 'rgba(88,166,255,0.15)', color: 'var(--blue)',  label: 'En cours' },
    planned:     { bg: 'rgba(240,168,50,0.15)', color: 'var(--amber)', label: 'Planifié' },
    cancelled:   { bg: 'rgba(248,81,73,0.15)',  color: 'var(--red)',   label: 'Annulé' },
  };
  const s = styles[statut] ?? styles['planned'];
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

// ─── Calcul du rendement d'un lot ────────────────────────────────────────────
function calculerRendement(lot: Batch): number {
  const entrees = (lot.batch_inputs ?? []) as BatchInput[];
  const sorties = (lot.batch_outputs ?? []) as BatchOutput[];
  const totalEntree = entrees.reduce((s, i) => s + Number(i.quantity_used), 0);
  const totalSortie = sorties.reduce((s, o) => s + Number(o.quantity_produced), 0);
  if (totalEntree === 0) return 0;
  return Math.round((totalSortie / totalEntree) * 100);
}

// ─── Préparer données stock par matière ──────────────────────────────────────
function preparerDonneesStock(inventaire: InventoryItem[]): StockPoint[] {
  return inventaire
    .filter((item) => item.materials?.category === 'raw')
    .map((item) => ({
      nom: item.materials?.name ?? '?',
      quantite: Math.round(Number(item.quantity) * 10) / 10,
      seuil: Math.round(Number(item.min_threshold) * 10) / 10,
      unite: item.materials?.unit ?? '',
    }))
    .sort((a, b) => b.quantite - a.quantite)
    .slice(0, 10);
}

// ─── Préparer les données du graphique ───────────────────────────────────────
function preparerDonneesGraphique(lots: Batch[]): Array<{ date: string; tonnes: number }> {
  // Grouper les sorties par jour du mois en cours
  const parJour: Record<string, number> = {};

  for (const lot of lots) {
    if (lot.status === 'completed' && lot.completed_at) {
      const dateStr = format(new Date(lot.completed_at), 'd MMM', { locale: fr });
      const sorties = (lot.batch_outputs ?? []) as BatchOutput[];
      const tonnes = sorties.reduce((s, o) => s + Number(o.quantity_produced), 0);
      parJour[dateStr] = (parJour[dateStr] ?? 0) + tonnes / 1000; // kg → tonnes
    }
  }

  return Object.entries(parJour)
    .map(([date, tonnes]) => ({ date, tonnes: Math.round(tonnes * 10) / 10 }))
    .slice(-12); // 12 derniers points
}

// ─── Page principale ─────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const profil = await getProfilCourant();
  if (!profil) redirect('/connexion');

  const siteId = profil.site_id ?? '';
  const orgId = profil.org_id;

  const [stats, lots, alertes, sitesActifs, inventaire] = await Promise.all([
    getOrgDashboardStats(orgId),
    getRecentBatches(siteId, 20),
    getAlertesNonLues(orgId, 5),
    getSitesAvecLotsEnCours(orgId),
    getInventoryWithAlerts(siteId),
  ]);

  const derniersMajAt = format(new Date(), "d MMMM 'à' HH'h'mm", { locale: fr });
  const donneesCourbe = preparerDonneesGraphique(lots);
  const donneesStock = preparerDonneesStock(inventaire as InventoryItem[]);

  const kpis = [
    {
      label: 'Lots en cours',
      value: String(stats.batchesInProgress),
      icon: Factory,
      color: 'var(--blue)',
      bg: 'rgba(88,166,255,0.1)',
      trend: 'neutral' as const,
    },
    {
      label: 'Rendement moyen',
      value: `${stats.avgYield}%`,
      icon: TrendingUp,
      color: 'var(--green)',
      bg: 'rgba(63,185,80,0.1)',
      trend: 'up' as const,
    },
    {
      label: 'Alertes stock',
      value: String(stats.stockAlerts),
      icon: AlertTriangle,
      color: 'var(--amber)',
      bg: 'rgba(240,168,50,0.1)',
      trend: stats.stockAlerts > 0 ? 'down' as const : 'up' as const,
    },
    {
      label: 'Tonnes ce mois',
      value: `${stats.tonnesThisMonth}t`,
      icon: Package,
      color: 'var(--terra2)',
      bg: 'rgba(224,112,80,0.1)',
      trend: 'up' as const,
    },
  ];

  const cinqDerniers = lots.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Vue d&apos;ensemble
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
          <Clock size={13} className="inline mr-1.5" />
          Dernière mise à jour : {derniersMajAt}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="taama-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: kpi.bg }}
              >
                <kpi.icon size={16} style={{ color: kpi.color }} />
              </div>
              {kpi.trend !== 'neutral' && (
                <span
                  className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: kpi.trend === 'up' ? 'var(--green)' : 'var(--red)' }}
                >
                  {kpi.trend === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                </span>
              )}
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: kpi.color }}>
                {kpi.value}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                {kpi.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphique production */}
      <div className="taama-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-base" style={{ color: 'var(--text)' }}>
            Production — 30 derniers jours
          </h2>
          <span
            className="text-xs px-2 py-1 rounded-lg"
            style={{ background: 'rgba(240,168,50,0.1)', color: 'var(--amber)' }}
          >
            en tonnes
          </span>
        </div>
        <ProductionChart donnees={donneesCourbe} />
      </div>

      {/* Graphique stock matières premières */}
      {donneesStock.length > 0 && (
        <div className="taama-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-base" style={{ color: 'var(--text)' }}>
              Stock matières premières
            </h2>
            <span
              className="text-xs px-2 py-1 rounded-lg"
              style={{ background: 'rgba(196,87,42,0.1)', color: 'var(--terra)' }}
            >
              en stock
            </span>
          </div>
          <StockChart donnees={donneesStock} />
        </div>
      )}

      {/* Sites actifs */}
      {sitesActifs.length > 0 && (
        <div className="taama-card overflow-hidden">
          <div
            className="px-6 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <h2 className="font-semibold text-base" style={{ color: 'var(--text)' }}>
              Sites actifs
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
            {sitesActifs.map((site, i) => {
              const typeSiteLabel: Record<string, string> = {
                usine: '🏭 Usine',
                entrepot: '🏢 Entrepôt',
                ferme: '🌾 Ferme',
              };
              return (
                <div
                  key={site.id}
                  className="px-6 py-4 flex items-center justify-between"
                  style={{
                    borderBottom:
                      i < sitesActifs.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div>
                    <div className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                      {site.name}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                      {typeSiteLabel[site.type] ?? site.type}
                      {site.location ? ` · ${site.location}` : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-lg font-bold"
                      style={{ color: site.lotsEnCours > 0 ? 'var(--blue)' : 'var(--text3)' }}
                    >
                      {site.lotsEnCours}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text3)' }}>
                      lot{site.lotsEnCours !== 1 ? 's' : ''} en cours
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tableau derniers lots */}
      <div className="taama-card overflow-hidden">
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="font-semibold text-base" style={{ color: 'var(--text)' }}>
            Derniers lots
          </h2>
          <a href="/production" className="text-xs font-medium" style={{ color: 'var(--amber)' }}>
            Voir tout →
          </a>
        </div>

        {cinqDerniers.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text3)' }}>
            Aucun lot créé. Commencez par créer votre premier lot dans{' '}
            <a href="/production" style={{ color: 'var(--amber)' }}>Production</a>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Lot', 'Statut', 'Entrées (kg)', 'Sorties (kg)', 'Rendement', 'Date'].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium"
                      style={{ color: 'var(--text3)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cinqDerniers.map((lot, i) => {
                  const entrees = (lot.batch_inputs ?? []) as BatchInput[];
                  const sorties = (lot.batch_outputs ?? []) as BatchOutput[];
                  const totalEntree = entrees.reduce((s, e) => s + Number(e.quantity_used), 0);
                  const totalSortie = sorties.reduce((s, o) => s + Number(o.quantity_produced), 0);
                  const rendement = calculerRendement(lot);

                  return (
                    <tr
                      key={lot.id}
                      style={{
                        borderBottom:
                          i < cinqDerniers.length - 1
                            ? '1px solid var(--border)'
                            : 'none',
                      }}
                    >
                      <td
                        className="px-6 py-3.5 font-mono text-xs"
                        style={{ color: 'var(--text2)' }}
                      >
                        {lot.batch_number}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge statut={lot.status} />
                      </td>
                      <td
                        className="px-6 py-3.5 font-mono text-xs"
                        style={{ color: 'var(--text2)' }}
                      >
                        {totalEntree > 0 ? totalEntree.toLocaleString('fr-FR') : '—'}
                      </td>
                      <td
                        className="px-6 py-3.5 font-mono text-xs"
                        style={{ color: 'var(--text2)' }}
                      >
                        {totalSortie > 0 ? totalSortie.toLocaleString('fr-FR') : '—'}
                      </td>
                      <td className="px-6 py-3.5">
                        {rendement > 0 ? (
                          <span
                            className="font-bold text-xs"
                            style={{
                              color:
                                rendement >= 75
                                  ? 'var(--green)'
                                  : rendement >= 50
                                  ? 'var(--amber)'
                                  : 'var(--red)',
                            }}
                          >
                            {rendement}%
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text3)' }}>—</span>
                        )}
                      </td>
                      <td
                        className="px-6 py-3.5 text-xs"
                        style={{ color: 'var(--text3)' }}
                      >
                        {lot.created_at
                          ? format(new Date(lot.created_at), 'dd/MM', { locale: fr })
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
      {/* Dernières alertes */}
      <DashboardAlertes alertes={alertes as Alert[]} />
    </div>
  );
}
