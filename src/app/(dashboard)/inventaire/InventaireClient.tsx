'use client';

import { useState } from 'react';
import { Plus, Package, ArrowUp, ArrowDown, ArrowLeftRight, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import MouvementForm from '@/components/inventaire/MouvementForm';
import type { InventoryItem, InventoryMovement, Material, Supplier } from '@/types/database';

interface Props {
  inventaire: InventoryItem[];
  mouvements: InventoryMovement[];
  materials: Material[];
  suppliers: Supplier[];
  siteId: string;
}

// Badge de statut du stock
function StatutStock({ quantite, seuil }: { quantite: number; seuil: number }) {
  if (seuil === 0 || quantite > seuil * 1.5) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
        style={{ background: 'rgba(63,185,80,0.15)', color: 'var(--green)' }}>
        OK
      </span>
    );
  }
  if (quantite > seuil) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
        style={{ background: 'rgba(240,168,50,0.15)', color: 'var(--amber)' }}>
        <AlertTriangle size={10} /> Alerte
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
      style={{ background: 'rgba(248,81,73,0.15)', color: 'var(--red)' }}>
      <AlertTriangle size={10} /> Rupture
    </span>
  );
}

const labelCategorie: Record<string, string> = {
  raw: 'Matière première',
  finished: 'Produit fini',
  byproduct: 'Sous-produit',
};

export default function InventaireClient({ inventaire, mouvements, materials, suppliers, siteId }: Props) {
  const [modalOuverte, setModalOuverte] = useState(false);
  const [onglet, setOnglet] = useState<'stock' | 'mouvements'>('stock');

  const nbAlertes = inventaire.filter(
    (i) => i.min_threshold > 0 && Number(i.quantity) < Number(i.min_threshold)
  ).length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Inventaire</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            {inventaire.length} référence{inventaire.length > 1 ? 's' : ''} en stock
            {nbAlertes > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded text-xs"
                style={{ background: 'rgba(240,168,50,0.15)', color: 'var(--amber)' }}>
                {nbAlertes} alerte{nbAlertes > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setModalOuverte(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold taama-btn-primary"
        >
          <Plus size={16} /> Mouvement de stock
        </button>
      </div>

      {/* Modal mouvement */}
      {modalOuverte && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setModalOuverte(false)} />
          <div className="relative h-full w-full max-w-lg overflow-y-auto p-6"
            style={{ background: 'var(--bg2)', borderLeft: '1px solid var(--border)' }}>
            <MouvementForm
              siteId={siteId}
              materials={materials}
              suppliers={suppliers}
              onClose={() => setModalOuverte(false)}
            />
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'var(--bg3)' }}>
        {([['stock', 'Vue d\'ensemble'], ['mouvements', 'Mouvements récents']] as [string, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setOnglet(id as 'stock' | 'mouvements')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: onglet === id ? 'var(--bg2)' : 'transparent',
              color: onglet === id ? 'var(--text)' : 'var(--text3)',
              border: onglet === id ? '1px solid var(--border)' : '1px solid transparent',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Onglet Stock */}
      {onglet === 'stock' && (
        <div className="taama-card overflow-hidden">
          {inventaire.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(88,166,255,0.1)' }}>
                <Package size={24} style={{ color: 'var(--blue)' }} />
              </div>
              <p className="text-sm text-center" style={{ color: 'var(--text2)' }}>
                Aucun stock enregistré. Commencez par ajouter des matières dans{' '}
                <a href="/catalogue" style={{ color: 'var(--amber)' }}>le catalogue</a>.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Matière / Produit', 'Catégorie', 'Quantité', 'Seuil min.', 'Statut', 'Mis à jour'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium"
                        style={{ color: 'var(--text3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inventaire.map((item, i) => (
                    <tr key={item.id}
                      style={{ borderBottom: i < inventaire.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--text)' }}>
                        {item.materials?.name ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text2)' }}>
                        {item.materials?.category ? labelCategorie[item.materials.category] ?? '—' : '—'}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold"
                        style={{ color: 'var(--text)' }}>
                        {Number(item.quantity).toLocaleString('fr-FR')} {item.materials?.unit ?? ''}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs" style={{ color: 'var(--text2)' }}>
                        {item.min_threshold > 0
                          ? `${Number(item.min_threshold).toLocaleString('fr-FR')} ${item.materials?.unit ?? ''}`
                          : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatutStock quantite={Number(item.quantity)} seuil={Number(item.min_threshold)} />
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text3)' }}>
                        {item.updated_at
                          ? format(new Date(item.updated_at), 'dd/MM HH:mm', { locale: fr })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Onglet Mouvements */}
      {onglet === 'mouvements' && (
        <div className="taama-card overflow-hidden">
          {mouvements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <p className="text-sm" style={{ color: 'var(--text2)' }}>
                Aucun mouvement de stock enregistré.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Type', 'Matière', 'Quantité', 'Raison', 'Date'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium"
                        style={{ color: 'var(--text3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mouvements.map((mvt, i) => (
                    <tr key={mvt.id}
                      style={{ borderBottom: i < mouvements.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td className="px-5 py-3.5">
                        {mvt.type === 'in' && (
                          <span className="flex items-center gap-1.5 text-xs font-medium w-fit px-2 py-1 rounded-lg"
                            style={{ background: 'rgba(63,185,80,0.1)', color: 'var(--green)' }}>
                            <ArrowUp size={11} /> Entrée
                          </span>
                        )}
                        {mvt.type === 'out' && (
                          <span className="flex items-center gap-1.5 text-xs font-medium w-fit px-2 py-1 rounded-lg"
                            style={{ background: 'rgba(248,81,73,0.1)', color: 'var(--red)' }}>
                            <ArrowDown size={11} /> Sortie
                          </span>
                        )}
                        {mvt.type === 'adjustment' && (
                          <span className="flex items-center gap-1.5 text-xs font-medium w-fit px-2 py-1 rounded-lg"
                            style={{ background: 'rgba(88,166,255,0.1)', color: 'var(--blue)' }}>
                            <ArrowLeftRight size={11} /> Ajust.
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--text)' }}>
                        {(mvt.materials as Material | undefined)?.name ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold"
                        style={{ color: 'var(--text)' }}>
                        {mvt.type === 'in' ? '+' : mvt.type === 'out' ? '-' : '='}
                        {Number(mvt.quantity).toLocaleString('fr-FR')}{' '}
                        {(mvt.materials as Material | undefined)?.unit ?? ''}
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text2)' }}>
                        {mvt.reason ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text3)' }}>
                        {mvt.created_at
                          ? format(new Date(mvt.created_at), 'dd/MM HH:mm', { locale: fr })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
