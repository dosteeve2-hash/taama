'use client';

import { useState, useTransition } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import {
  enregistrerEntreeStock,
  enregistrerSortieStock,
  ajusterStock,
} from '@/app/(dashboard)/inventaire/actions';
import type { Material, Supplier } from '@/types/database';

interface Props {
  siteId: string;
  materials: Material[];
  suppliers: Supplier[];
  onClose: () => void;
}

type TypeMouvement = 'in' | 'out' | 'adjustment';

export default function MouvementForm({ siteId, materials, suppliers, onClose }: Props) {
  const [type, setType] = useState<TypeMouvement>('in');
  const [materialId, setMaterialId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [reference, setReference] = useState('');
  const [reason, setReason] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const labelType: Record<TypeMouvement, string> = {
    in: 'Entrée stock',
    out: 'Sortie stock',
    adjustment: 'Ajustement',
  };

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);

    const qte = parseFloat(quantity);
    if (isNaN(qte) || qte <= 0) {
      setErreur('La quantité doit être un nombre positif.');
      return;
    }

    startTransition(async () => {
      let result;

      if (type === 'in') {
        result = await enregistrerEntreeStock({
          siteId,
          materialId,
          quantity: qte,
          supplierId: supplierId || undefined,
          reference: reference || undefined,
          reason: reason || 'Entrée stock',
        });
      } else if (type === 'out') {
        result = await enregistrerSortieStock({
          siteId,
          materialId,
          quantity: qte,
          reason: reason || 'Sortie stock',
        });
      } else {
        result = await ajusterStock({
          siteId,
          materialId,
          newQuantity: qte,
          reason: reason || 'Ajustement inventaire',
        });
      }

      if (!result.success) {
        setErreur(result.error);
      } else {
        onClose();
      }
    });
  };

  const inputStyle = {
    background: 'var(--bg3)',
    border: '1px solid var(--border2)',
    color: 'var(--text)',
  };
  const fieldClass = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all';

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>
            Mouvement de stock
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>
            Enregistrez une entrée, sortie ou ajustement
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg"
          style={{ border: '1px solid var(--border2)', color: 'var(--text3)' }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Erreur */}
      {erreur && (
        <div
          className="flex items-start gap-2 p-3 rounded-xl text-sm"
          style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', color: 'var(--red)' }}
        >
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> {erreur}
        </div>
      )}

      <form onSubmit={soumettre} className="flex flex-col gap-4">
        {/* Type de mouvement */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
            Type de mouvement
          </label>
          <div className="flex gap-2">
            {(['in', 'out', 'adjustment'] as TypeMouvement[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: type === t
                    ? t === 'in' ? 'rgba(63,185,80,0.15)' : t === 'out' ? 'rgba(248,81,73,0.15)' : 'rgba(88,166,255,0.15)'
                    : 'var(--bg3)',
                  color: type === t
                    ? t === 'in' ? 'var(--green)' : t === 'out' ? 'var(--red)' : 'var(--blue)'
                    : 'var(--text2)',
                  border: `1px solid ${type === t
                    ? t === 'in' ? 'rgba(63,185,80,0.3)' : t === 'out' ? 'rgba(248,81,73,0.3)' : 'rgba(88,166,255,0.3)'
                    : 'var(--border2)'}`,
                }}
              >
                {labelType[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Matière */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
            Matière / Produit
          </label>
          <select
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
            required
            className={fieldClass}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="">Sélectionner…</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.unit}) — {m.category === 'raw' ? 'MP' : m.category === 'finished' ? 'PF' : 'SP'}
              </option>
            ))}
          </select>
        </div>

        {/* Quantité */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
            {type === 'adjustment' ? 'Nouveau stock total' : 'Quantité'}
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={type === 'adjustment' ? 'Stock réel actuel…' : 'Ex: 500'}
            min="0"
            step="0.001"
            required
            className={fieldClass}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'var(--amber)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border2)')}
          />
        </div>

        {/* Fournisseur (entrée seulement) */}
        {type === 'in' && suppliers.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
              Fournisseur <span style={{ color: 'var(--text3)' }}>(optionnel)</span>
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className={fieldClass}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="">Aucun fournisseur</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Référence (entrée seulement) */}
        {type === 'in' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
              N° bon de livraison <span style={{ color: 'var(--text3)' }}>(optionnel)</span>
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="BL-2026-001"
              className={fieldClass}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--amber)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border2)')}
            />
          </div>
        )}

        {/* Raison */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
            Raison / Commentaire <span style={{ color: 'var(--text3)' }}>(optionnel)</span>
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={type === 'adjustment' ? 'Inventaire physique annuel…' : 'Livraison fournisseur…'}
            className={fieldClass}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'var(--amber)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border2)')}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium"
            style={{ border: '1px solid var(--border2)', color: 'var(--text2)' }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed taama-btn-primary"
          >
            {isPending ? (
              <><Loader2 size={15} className="animate-spin" /> Enregistrement…</>
            ) : (
              `Enregistrer ${labelType[type].toLowerCase()}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
