'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2, Loader2, X, AlertCircle } from 'lucide-react';
import { creerLot } from '@/app/(dashboard)/production/actions';
import type { Material } from '@/types/database';

interface Props {
  siteId: string;
  materials: Material[];
  onClose: () => void;
}

interface LigneEntree {
  materialId: string;
  quantityUsed: string;
  quantityPlanned: string;
}

// Génère un numéro de lot automatique
function genererNumeroDeLot(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const suffixe = Math.floor(1000 + Math.random() * 9000);
  return `LOT-${date}-${suffixe}`;
}

export default function NouveauLotForm({ siteId, materials, onClose }: Props) {
  const [batchNumber, setBatchNumber] = useState(genererNumeroDeLot);
  const [notes, setNotes] = useState('');
  const [entrees, setEntrees] = useState<LigneEntree[]>([
    { materialId: '', quantityUsed: '', quantityPlanned: '' },
  ]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Matières premières disponibles pour les entrées
  const matieresPremières = materials.filter((m) => m.category === 'raw');

  const majEntree = (index: number, champ: keyof LigneEntree, valeur: string) => {
    setEntrees((prev) => {
      const copie = [...prev];
      copie[index] = { ...copie[index], [champ]: valeur };
      return copie;
    });
  };

  const ajouterLigne = () => {
    setEntrees((prev) => [...prev, { materialId: '', quantityUsed: '', quantityPlanned: '' }]);
  };

  const supprimerLigne = (index: number) => {
    setEntrees((prev) => prev.filter((_, i) => i !== index));
  };

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);

    const inputsValides = entrees.filter(
      (e) => e.materialId && parseFloat(e.quantityUsed) > 0
    );

    if (inputsValides.length === 0) {
      setErreur('Ajoutez au moins une matière première avec une quantité.');
      return;
    }

    startTransition(async () => {
      const result = await creerLot({
        siteId,
        batchNumber,
        notes: notes || undefined,
        inputs: inputsValides.map((e) => ({
          materialId: e.materialId,
          quantityUsed: parseFloat(e.quantityUsed),
          quantityPlanned: e.quantityPlanned ? parseFloat(e.quantityPlanned) : undefined,
        })),
      });

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
            Nouveau lot de production
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>
            Renseignez les matières consommées
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
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
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          {erreur}
        </div>
      )}

      <form onSubmit={soumettre} className="flex flex-col gap-4">
        {/* Numéro de lot */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
            Numéro de lot
          </label>
          <input
            type="text"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            required
            className={fieldClass}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'var(--amber)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border2)')}
          />
        </div>

        {/* Entrées — matières premières */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
              Matières premières consommées
            </label>
            <button
              type="button"
              onClick={ajouterLigne}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
              style={{ color: 'var(--amber)', border: '1px solid rgba(240,168,50,0.3)' }}
            >
              <Plus size={12} /> Ajouter
            </button>
          </div>

          {matieresPremières.length === 0 ? (
            <div
              className="p-3 rounded-xl text-sm text-center"
              style={{ background: 'var(--bg3)', color: 'var(--text3)' }}
            >
              Aucune matière première dans le catalogue.{' '}
              <a href="/catalogue" style={{ color: 'var(--amber)' }}>
                Ajouter →
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {entrees.map((entree, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <select
                    value={entree.materialId}
                    onChange={(e) => majEntree(i, 'materialId', e.target.value)}
                    required
                    className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">Matière…</option>
                    {matieresPremières.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.unit})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={entree.quantityUsed}
                    onChange={(e) => majEntree(i, 'quantityUsed', e.target.value)}
                    placeholder="Qté utilisée"
                    min="0.001"
                    step="0.001"
                    required
                    className="w-32 px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--amber)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border2)')}
                  />
                  <input
                    type="number"
                    value={entree.quantityPlanned}
                    onChange={(e) => majEntree(i, 'quantityPlanned', e.target.value)}
                    placeholder="Qté prévue"
                    min="0.001"
                    step="0.001"
                    className="w-32 px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--amber)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border2)')}
                  />
                  {entrees.length > 1 && (
                    <button
                      type="button"
                      onClick={() => supprimerLigne(i)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
                      style={{ background: 'rgba(248,81,73,0.1)', color: 'var(--red)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
            Notes <span style={{ color: 'var(--text3)' }}>(optionnel)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observations, instructions particulières…"
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
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
              <><Loader2 size={15} className="animate-spin" /> Création…</>
            ) : (
              <>Créer le lot</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
