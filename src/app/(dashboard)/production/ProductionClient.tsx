'use client';

// Composant client — Page production avec onglets En cours / Terminés / Annulés
import { useState, useMemo } from 'react';
import { Plus, Factory } from 'lucide-react';
import LotCard from '@/components/production/LotCard';
import NouveauLotForm from '@/components/production/NouveauLotForm';
import type { Batch, Material } from '@/types/database';

// ─── Types d'onglets et filtres ───────────────────────────────────────────────
type OngletProduction = 'en_cours' | 'termines' | 'annules';
type FiltrePeriode = 'tout' | 'mois_courant' | 'mois_dernier';

interface Props {
  lots: Batch[];
  materials: Material[];
  siteId: string;
}

export default function ProductionClient({ lots, materials, siteId }: Props) {
  const [modalOuverte, setModalOuverte] = useState(false);
  const [onglet, setOnglet] = useState<OngletProduction>('en_cours');
  const [filtrePeriode, setFiltrePeriode] = useState<FiltrePeriode>('tout');

  // ─── Filtrage par onglet et période ────────────────────────────────────────
  const lotsFiltres = useMemo(() => {
    const maintenant = new Date();

    return lots.filter((lot) => {
      // Filtre onglet
      if (onglet === 'en_cours'  && lot.status !== 'in_progress' && lot.status !== 'planned') return false;
      if (onglet === 'termines'  && lot.status !== 'completed') return false;
      if (onglet === 'annules'   && lot.status !== 'cancelled') return false;

      // Filtre période (sur created_at)
      if (filtrePeriode !== 'tout') {
        const date = new Date(lot.created_at);
        if (filtrePeriode === 'mois_courant') {
          const debut = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
          if (date < debut) return false;
        } else if (filtrePeriode === 'mois_dernier') {
          const debutMoisCourant = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
          const debutMoisDernier = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 1);
          if (date < debutMoisDernier || date >= debutMoisCourant) return false;
        }
      }
      return true;
    });
  }, [lots, onglet, filtrePeriode]);

  // Compteurs pour les badges d'onglets
  const comptes = useMemo(() => ({
    en_cours: lots.filter((l) => l.status === 'in_progress' || l.status === 'planned').length,
    termines:  lots.filter((l) => l.status === 'completed').length,
    annules:   lots.filter((l) => l.status === 'cancelled').length,
  }), [lots]);

  const onglets: Array<{ id: OngletProduction; label: string }> = [
    { id: 'en_cours', label: 'En cours' },
    { id: 'termines', label: 'Terminés' },
    { id: 'annules',  label: 'Annulés' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Production</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            {comptes.en_cours} lot{comptes.en_cours !== 1 ? 's' : ''} en cours
          </p>
        </div>
        <button
          onClick={() => setModalOuverte(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold taama-btn-primary"
        >
          <Plus size={16} />
          Nouveau lot
        </button>
      </div>

      {/* Barre de filtres : onglets + période */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Onglets */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          {onglets.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setOnglet(id)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={onglet === id
                ? { background: 'var(--bg)', color: 'var(--amber)', border: '1px solid rgba(240,168,50,0.2)' }
                : { color: 'var(--text2)', border: '1px solid transparent' }
              }
            >
              {label}
              {comptes[id] > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={onglet === id
                    ? { background: 'rgba(240,168,50,0.15)', color: 'var(--amber)' }
                    : { background: 'var(--bg3)', color: 'var(--text3)' }
                  }>
                  {comptes[id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filtre période */}
        <select
          value={filtrePeriode}
          onChange={(e) => setFiltrePeriode(e.target.value as FiltrePeriode)}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border2)',
            color: 'var(--text2)',
            cursor: 'pointer',
          }}
        >
          <option value="tout">Toute la période</option>
          <option value="mois_courant">Ce mois</option>
          <option value="mois_dernier">Mois dernier</option>
        </select>
      </div>

      {/* Modal Nouveau lot */}
      {modalOuverte && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setModalOuverte(false)}
          />
          <div
            className="relative h-full w-full max-w-lg overflow-y-auto p-6"
            style={{ background: 'var(--bg2)', borderLeft: '1px solid var(--border)' }}
          >
            <NouveauLotForm
              siteId={siteId}
              materials={materials}
              onClose={() => setModalOuverte(false)}
            />
          </div>
        </div>
      )}

      {/* Liste des lots */}
      {lotsFiltres.length === 0 ? (
        <div className="taama-card flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(240,168,50,0.1)' }}>
            <Factory size={24} style={{ color: 'var(--amber)' }} />
          </div>
          <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
            {onglet === 'en_cours' ? 'Aucun lot en cours' : onglet === 'termines' ? 'Aucun lot terminé' : 'Aucun lot annulé'}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>
            {onglet === 'en_cours' ? 'Créez un nouveau lot pour commencer la production.' : 'Aucun résultat pour cette période.'}
          </p>
          {onglet === 'en_cours' && (
            <button
              onClick={() => setModalOuverte(true)}
              className="mt-1 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold taama-btn-primary"
            >
              <Plus size={15} /> Créer un lot
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {lotsFiltres.map((lot) => (
            <LotCard key={lot.id} lot={lot} materials={materials} />
          ))}
        </div>
      )}
    </div>
  );
}
