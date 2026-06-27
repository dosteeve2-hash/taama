'use client';

import { useState, useTransition } from 'react';
import {
  CheckCircle, XCircle, Plus, Loader2,
  AlertCircle, ChevronDown, ChevronUp, Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { terminerLot, annulerLot, ajouterSortie } from '@/app/(dashboard)/production/actions';
import type { Batch, BatchInput, BatchOutput, Material } from '@/types/database';

// ─── Badge statut ─────────────────────────────────────────────────────────────
function StatusBadge({ statut }: { statut: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    completed:   { bg: 'rgba(63,185,80,0.15)',  color: 'var(--green)', label: 'Terminé' },
    in_progress: { bg: 'rgba(88,166,255,0.15)', color: 'var(--blue)',  label: 'En cours' },
    planned:     { bg: 'rgba(240,168,50,0.15)', color: 'var(--amber)', label: 'Planifié' },
    cancelled:   { bg: 'rgba(248,81,73,0.15)',  color: 'var(--red)',   label: 'Annulé' },
  };
  const s = map[statut] ?? map['planned'];
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

// ─── Barre de progression rendement ──────────────────────────────────────────
function BarreRendement({ rendement }: { rendement: number }) {
  const couleur =
    rendement >= 80 ? 'var(--green)'
    : rendement >= 60 ? 'var(--amber)'
    : 'var(--red)';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: 'var(--text3)' }}>Rendement</span>
        <span className="font-bold" style={{ color: couleur }}>{rendement}%</span>
      </div>
      <div className="rounded-full overflow-hidden h-1.5" style={{ background: 'var(--bg3)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, rendement)}%`, background: couleur }}
        />
      </div>
    </div>
  );
}

// ─── Distribution grades qualité ─────────────────────────────────────────────
function DistributionGrades({ sorties }: { sorties: BatchOutput[] }) {
  // Compter par grade
  const comptage: Record<string, number> = {};
  let totalQty = 0;

  for (const s of sorties) {
    const grade = s.quality_grade ?? 'Non renseigné';
    const qty = Number(s.quantity_produced);
    comptage[grade] = (comptage[grade] ?? 0) + qty;
    totalQty += qty;
  }

  if (totalQty === 0 || Object.keys(comptage).length === 0) return null;

  const gradeColor: Record<string, string> = {
    'A':            'var(--green)',
    'B':            'var(--blue)',
    'C':            'var(--amber)',
    'Rebut':        'var(--red)',
    'Non renseigné':'var(--text3)',
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-xs" style={{ color: 'var(--text3)' }}>Distribution grades</div>
      <div className="flex gap-1 h-2 rounded-full overflow-hidden">
        {Object.entries(comptage).map(([grade, qty]) => (
          <div
            key={grade}
            className="h-full transition-all"
            style={{
              width: `${(qty / totalQty) * 100}%`,
              background: gradeColor[grade] ?? 'var(--text3)',
              minWidth: '4px',
            }}
            title={`Grade ${grade} : ${qty.toLocaleString('fr-FR')} (${Math.round((qty / totalQty) * 100)}%)`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(comptage).map(([grade, qty]) => (
          <span key={grade} className="text-xs flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block"
              style={{ background: gradeColor[grade] ?? 'var(--text3)' }} />
            <span style={{ color: 'var(--text3)' }}>
              {grade} ({Math.round((qty / totalQty) * 100)}%)
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Formulaire ajout sortie (inline) ────────────────────────────────────────
interface AjoutSortieFormProps {
  batchId: string;
  siteId: string;
  batchNumber: string;
  materials: Material[];
  onClose: () => void;
}

function AjoutSortieForm({ batchId, siteId, batchNumber, materials, onClose }: AjoutSortieFormProps) {
  const [materialId, setMaterialId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [grade, setGrade] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const produitsFinisEtSousProduits = materials.filter(
    (m) => m.category === 'finished' || m.category === 'byproduct'
  );

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialId || !quantity) return;
    setErreur(null);
    startTransition(async () => {
      const result = await ajouterSortie({
        batchId,
        siteId,
        batchNumber,
        outputs: [{ materialId, quantityProduced: parseFloat(quantity), qualityGrade: grade || undefined }],
      });
      if (!result.success) setErreur(result.error);
      else onClose();
    });
  };

  const inputStyle = { background: 'var(--bg)', border: '1px solid var(--border2)', color: 'var(--text)' };

  return (
    <form onSubmit={soumettre} className="flex flex-col gap-3 p-3 rounded-xl mt-3"
      style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
      {erreur && (
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--red)' }}>
          <AlertCircle size={13} /> {erreur}
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        <select value={materialId} onChange={(e) => setMaterialId(e.target.value)}
          required className="px-2.5 py-2 rounded-lg text-sm outline-none"
          style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="">Produit…</option>
          {produitsFinisEtSousProduits.length === 0 && (
            <option disabled>Aucun produit dans le catalogue</option>
          )}
          {produitsFinisEtSousProduits.map((m) => (
            <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
          ))}
        </select>
        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantité" min="0.001" step="0.001" required
          className="px-2.5 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
        <select value={grade} onChange={(e) => setGrade(e.target.value)}
          className="px-2.5 py-2 rounded-lg text-sm outline-none"
          style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="">Grade…</option>
          {['A', 'B', 'C', 'Rebut'].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onClose}
          className="flex-1 py-2 rounded-lg text-xs font-medium"
          style={{ border: '1px solid var(--border2)', color: 'var(--text2)' }}>
          Annuler
        </button>
        <button type="submit" disabled={isPending}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold disabled:opacity-60 taama-btn-primary">
          {isPending ? <Loader2 size={12} className="animate-spin" /> : null}
          Enregistrer
        </button>
      </div>
    </form>
  );
}

// ─── LotCard principal ────────────────────────────────────────────────────────

interface Props {
  lot: Batch;
  materials: Material[];
}

export default function LotCard({ lot, materials }: Props) {
  const [detailsOuverts, setDetailsOuverts] = useState(false);
  const [ajoutSortieOuvert, setAjoutSortieOuvert] = useState(false);
  const [isPendingTerminer, startTerminer] = useTransition();
  const [isPendingAnnuler, startAnnuler] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  const entrees = (lot.batch_inputs ?? []) as BatchInput[];
  const sorties = (lot.batch_outputs ?? []) as BatchOutput[];

  const totalEntree = entrees.reduce((s, i) => s + Number(i.quantity_used), 0);
  const totalSortie = sorties.reduce((s, o) => s + Number(o.quantity_produced), 0);
  const rendement = totalEntree > 0 ? Math.round((totalSortie / totalEntree) * 100) : 0;

  const isActif = lot.status === 'in_progress' || lot.status === 'planned';

  const handleTerminer = () => {
    setErreur(null);
    startTerminer(async () => {
      const result = await terminerLot(lot.id);
      if (!result.success) setErreur(result.error);
    });
  };

  const handleAnnuler = () => {
    if (!confirm(`Annuler le lot ${lot.batch_number} ? Les stocks seront restaurés.`)) return;
    setErreur(null);
    startAnnuler(async () => {
      const result = await annulerLot(lot.id);
      if (!result.success) setErreur(result.error);
    });
  };

  return (
    <div className="taama-card overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {lot.batch_number}
            </span>
            <StatusBadge statut={lot.status} />
          </div>

          {/* Timestamps */}
          <div className="flex flex-wrap gap-3 mt-1.5 text-xs" style={{ color: 'var(--text3)' }}>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              Créé le {format(new Date(lot.created_at), 'dd/MM/yyyy', { locale: fr })}
            </span>
            {lot.completed_at && (
              <span className="flex items-center gap-1" style={{ color: 'var(--green)' }}>
                <CheckCircle size={11} />
                Terminé le {format(new Date(lot.completed_at), 'dd/MM/yyyy', { locale: fr })}
              </span>
            )}
          </div>

          {/* Résumé compact */}
          <div className="flex gap-4 mt-2 text-xs" style={{ color: 'var(--text3)' }}>
            <span>
              <span style={{ color: 'var(--text2)' }}>{entrees.length}</span>{' '}
              entrée{entrees.length !== 1 ? 's' : ''}
            </span>
            <span>
              <span style={{ color: 'var(--text2)' }}>{sorties.length}</span>{' '}
              sortie{sorties.length !== 1 ? 's' : ''}
            </span>
            {totalEntree > 0 && (
              <span>{totalEntree.toLocaleString('fr-FR')} kg consommés</span>
            )}
            {totalSortie > 0 && (
              <span style={{ color: 'var(--green)' }}>
                {totalSortie.toLocaleString('fr-FR')} kg produits
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setDetailsOuverts(!detailsOuverts)}
          className="w-7 h-7 flex items-center justify-center rounded-lg ml-3 flex-shrink-0"
          style={{ color: 'var(--text3)' }}>
          {detailsOuverts ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Barre rendement + grades (si données disponibles) */}
      {rendement > 0 && (
        <div className="px-4 pb-4 flex flex-col gap-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="pt-3">
            <BarreRendement rendement={rendement} />
          </div>
          <DistributionGrades sorties={sorties} />
        </div>
      )}

      {/* Erreur */}
      {erreur && (
        <div className="mx-4 mb-3 flex items-center gap-2 p-2.5 rounded-xl text-xs"
          style={{ background: 'rgba(248,81,73,0.1)', color: 'var(--red)' }}>
          <AlertCircle size={13} /> {erreur}
        </div>
      )}

      {/* Détails dépliables */}
      {detailsOuverts && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {/* Entrées */}
          {entrees.length > 0 && (
            <div className="p-4">
              <div className="text-xs font-medium mb-2" style={{ color: 'var(--text3)' }}>
                MATIÈRES CONSOMMÉES
              </div>
              <div className="flex flex-col gap-1.5">
                {entrees.map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--text)' }}>
                      {(e.materials as Material | undefined)?.name ?? 'Matière inconnue'}
                    </span>
                    <span className="font-mono text-xs" style={{ color: 'var(--text2)' }}>
                      {Number(e.quantity_used).toLocaleString('fr-FR')}{' '}
                      {(e.materials as Material | undefined)?.unit ?? ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sorties */}
          {sorties.length > 0 && (
            <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="text-xs font-medium mb-2" style={{ color: 'var(--text3)' }}>
                PRODUITS OBTENUS
              </div>
              <div className="flex flex-col gap-1.5">
                {sorties.map((o) => (
                  <div key={o.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span style={{ color: 'var(--text)' }}>
                        {(o.materials as Material | undefined)?.name ?? 'Produit inconnu'}
                      </span>
                      {o.quality_grade && (
                        <span className="text-xs px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(63,185,80,0.15)', color: 'var(--green)' }}>
                          Grade {o.quality_grade}
                        </span>
                      )}
                      {o.lot_code && (
                        <span className="font-mono text-xs" style={{ color: 'var(--text3)' }}>
                          {o.lot_code}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs" style={{ color: 'var(--text2)' }}>
                      {Number(o.quantity_produced).toLocaleString('fr-FR')}{' '}
                      {(o.materials as Material | undefined)?.unit ?? ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulaire ajout sortie (si lot actif) */}
          {isActif && ajoutSortieOuvert && (
            <div className="px-4" style={{ borderTop: '1px solid var(--border)' }}>
              <AjoutSortieForm
                batchId={lot.id}
                siteId={lot.site_id}
                batchNumber={lot.batch_number}
                materials={materials}
                onClose={() => setAjoutSortieOuvert(false)}
              />
            </div>
          )}

          {/* Notes */}
          {lot.notes && (
            <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="text-xs font-medium mb-1" style={{ color: 'var(--text3)' }}>NOTES</div>
              <p className="text-sm" style={{ color: 'var(--text2)' }}>{lot.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions (lots actifs seulement) */}
      {isActif && (
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => { setDetailsOuverts(true); setAjoutSortieOuvert(true); }}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
            style={{ border: '1px solid rgba(88,166,255,0.3)', color: 'var(--blue)' }}>
            <Plus size={12} /> Ajouter sortie
          </button>
          <button
            type="button"
            onClick={handleTerminer}
            disabled={isPendingTerminer}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            style={{ border: '1px solid rgba(63,185,80,0.3)', color: 'var(--green)' }}>
            {isPendingTerminer ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
            Terminer
          </button>
          <button
            type="button"
            onClick={handleAnnuler}
            disabled={isPendingAnnuler}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            style={{ border: '1px solid rgba(248,81,73,0.3)', color: 'var(--red)' }}>
            {isPendingAnnuler ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}
