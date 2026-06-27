'use client';

// Client Component — Filtres, tableau et export CSV EUDR
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Download, CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';
import type { LotTracabilite } from './page';

// ─── Badge conformité ─────────────────────────────────────────────────────────

function BadgeEUDR({ statut }: { statut: 'conforme' | 'incomplet' | 'non_conforme' }) {
  if (statut === 'conforme') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium"
        style={{ background: 'rgba(63,185,80,0.15)', color: 'var(--green)' }}>
        <CheckCircle size={10} /> Conforme
      </span>
    );
  }
  if (statut === 'incomplet') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium"
        style={{ background: 'rgba(240,168,50,0.15)', color: 'var(--amber)' }}>
        <AlertTriangle size={10} /> Incomplet
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium"
      style={{ background: 'rgba(248,81,73,0.15)', color: 'var(--red)' }}>
      <XCircle size={10} /> Non-conforme
    </span>
  );
}

// ─── Export CSV EUDR ──────────────────────────────────────────────────────────

function exporterCSV(lots: LotTracabilite[]) {
  const entetes = [
    'Numéro lot',
    'Date début',
    'Date fin',
    'Matières utilisées',
    'Quantités entrées (kg)',
    'Produits obtenus',
    'Codes lot',
    'Grades qualité',
    'Rendement (%)',
    'Conformité EUDR',
  ];

  const lignes = lots.map((lot) => [
    lot.batch_number,
    lot.started_at ? format(new Date(lot.started_at), 'dd/MM/yyyy', { locale: fr }) : '',
    lot.completed_at ? format(new Date(lot.completed_at), 'dd/MM/yyyy', { locale: fr }) : '',
    lot.inputs.map((i) => i.material_name).join(' | '),
    lot.inputs.map((i) => `${i.quantity_used} ${i.material_unit}`).join(' | '),
    lot.outputs.map((o) => o.material_name).join(' | '),
    lot.outputs.map((o) => o.lot_code ?? '—').join(' | '),
    lot.outputs.map((o) => o.quality_grade ?? '—').join(' | '),
    String(lot.rendement),
    lot.conformiteEUDR === 'conforme'
      ? 'Conforme'
      : lot.conformiteEUDR === 'incomplet'
      ? 'Incomplet'
      : 'Non-conforme',
  ]);

  const csvContent = [entetes, ...lignes]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `traçabilite-eudr-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  lots: LotTracabilite[];
}

export default function TracabiliteClient({ lots }: Props) {
  const [filtreConformite, setFiltreConformite] = useState<string>('tous');
  const [filtreRecherche, setFiltreRecherche] = useState('');
  const [filtrePeriode, setFiltrePeriode] = useState<string>('tout');

  // Filtrage
  const lotsFiltres = useMemo(() => {
    const maintenant = new Date();
    return lots.filter((lot) => {
      // Filtre conformité
      if (filtreConformite !== 'tous' && lot.conformiteEUDR !== filtreConformite) return false;

      // Filtre recherche
      if (filtreRecherche) {
        const terme = filtreRecherche.toLowerCase();
        const dansNumero = lot.batch_number.toLowerCase().includes(terme);
        const dansMatieres = lot.inputs.some((i) => i.material_name.toLowerCase().includes(terme));
        const dansLotCode = lot.outputs.some((o) => o.lot_code?.toLowerCase().includes(terme));
        if (!dansNumero && !dansMatieres && !dansLotCode) return false;
      }

      // Filtre période
      if (filtrePeriode !== 'tout' && lot.completed_at) {
        const dateCompletion = new Date(lot.completed_at);
        if (filtrePeriode === 'mois') {
          const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
          if (dateCompletion < debutMois) return false;
        } else if (filtrePeriode === 'trimestre') {
          const debutTrimestre = new Date(maintenant);
          debutTrimestre.setMonth(maintenant.getMonth() - 3);
          if (dateCompletion < debutTrimestre) return false;
        }
      }

      return true;
    });
  }, [lots, filtreConformite, filtreRecherche, filtrePeriode]);

  const inputStyle = {
    background: 'var(--bg2)',
    border: '1px solid var(--border2)',
    color: 'var(--text)',
    borderRadius: '0.75rem',
    padding: '0.5rem 0.875rem',
    fontSize: '0.8125rem',
    outline: 'none',
  };

  return (
    <div className="taama-card overflow-hidden">
      {/* Filtres */}
      <div
        className="px-5 py-4 flex flex-wrap items-center gap-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <h2 className="font-semibold text-sm flex-1 min-w-[8rem]" style={{ color: 'var(--text)' }}>
          Lots terminés ({lotsFiltres.length})
        </h2>

        {/* Recherche */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} />
          <input
            type="text"
            placeholder="Rechercher…"
            value={filtreRecherche}
            onChange={(e) => setFiltreRecherche(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '2rem' }}
          />
        </div>

        {/* Filtre période */}
        <select value={filtrePeriode} onChange={(e) => setFiltrePeriode(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="tout">Toute la période</option>
          <option value="mois">Ce mois</option>
          <option value="trimestre">Ce trimestre</option>
        </select>

        {/* Filtre conformité */}
        <select value={filtreConformite} onChange={(e) => setFiltreConformite(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="tous">Toute conformité</option>
          <option value="conforme">✅ Conformes</option>
          <option value="incomplet">⚠️ Incomplets</option>
          <option value="non_conforme">❌ Non-conformes</option>
        </select>

        {/* Bouton export */}
        <button
          onClick={() => exporterCSV(lotsFiltres)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors taama-btn-primary"
        >
          <Download size={13} />
          Export EUDR
        </button>
      </div>

      {/* Tableau */}
      {lotsFiltres.length === 0 ? (
        <div className="py-16 text-center text-sm" style={{ color: 'var(--text3)' }}>
          Aucun lot ne correspond aux filtres sélectionnés.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['N° Lot', 'Date fin', 'Matières utilisées', 'Produits obtenus', 'Codes lot', 'Rendement', 'Conformité EUDR'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'var(--text3)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lotsFiltres.map((lot, i) => (
                <tr
                  key={lot.id}
                  style={{
                    borderBottom: i < lotsFiltres.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  {/* N° Lot */}
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs font-semibold" style={{ color: 'var(--text)' }}>
                      {lot.batch_number}
                    </span>
                  </td>

                  {/* Date fin */}
                  <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text2)' }}>
                    {lot.completed_at
                      ? format(new Date(lot.completed_at), 'dd MMM yyyy', { locale: fr })
                      : '—'}
                  </td>

                  {/* Matières utilisées */}
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      {lot.inputs.length === 0 ? (
                        <span className="text-xs" style={{ color: 'var(--text3)' }}>—</span>
                      ) : (
                        lot.inputs.slice(0, 2).map((inp, idx) => (
                          <span key={idx} className="text-xs" style={{ color: 'var(--text2)' }}>
                            {inp.material_name} ({inp.quantity_used.toLocaleString('fr-FR')} {inp.material_unit})
                          </span>
                        ))
                      )}
                      {lot.inputs.length > 2 && (
                        <span className="text-xs" style={{ color: 'var(--text3)' }}>
                          +{lot.inputs.length - 2} autre{lot.inputs.length - 2 > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Produits obtenus */}
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      {lot.outputs.length === 0 ? (
                        <span className="text-xs" style={{ color: 'var(--text3)' }}>—</span>
                      ) : (
                        lot.outputs.slice(0, 2).map((out, idx) => (
                          <span key={idx} className="text-xs" style={{ color: 'var(--text2)' }}>
                            {out.material_name} ({out.quantity_produced.toLocaleString('fr-FR')} {out.material_unit})
                          </span>
                        ))
                      )}
                      {lot.outputs.length > 2 && (
                        <span className="text-xs" style={{ color: 'var(--text3)' }}>
                          +{lot.outputs.length - 2} autre{lot.outputs.length - 2 > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Codes lot */}
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      {lot.outputs.length === 0 ? (
                        <span className="text-xs" style={{ color: 'var(--text3)' }}>—</span>
                      ) : (
                        lot.outputs.slice(0, 2).map((out, idx) => (
                          <span key={idx} className="font-mono text-xs" style={{ color: out.lot_code ? 'var(--text2)' : 'var(--text3)' }}>
                            {out.lot_code ?? '—'}
                          </span>
                        ))
                      )}
                    </div>
                  </td>

                  {/* Rendement */}
                  <td className="px-5 py-3.5">
                    {lot.rendement > 0 ? (
                      <span
                        className="font-bold text-xs"
                        style={{
                          color:
                            lot.rendement >= 80
                              ? 'var(--green)'
                              : lot.rendement >= 60
                              ? 'var(--amber)'
                              : 'var(--red)',
                        }}
                      >
                        {lot.rendement}%
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text3)' }}>—</span>
                    )}
                  </td>

                  {/* Conformité EUDR */}
                  <td className="px-5 py-3.5">
                    <BadgeEUDR statut={lot.conformiteEUDR} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
