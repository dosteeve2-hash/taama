// Server Component — Page de traçabilité et conformité EUDR
import { redirect } from 'next/navigation';
import { GitBranch } from 'lucide-react';

import { getProfilCourant } from '@/lib/queries';
import { createClient } from '@/lib/supabase/server';
import TracabiliteClient from './TracabiliteClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LotTracabilite {
  id: string;
  batch_number: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  inputs: Array<{
    id: string;
    quantity_used: number;
    material_name: string;
    material_unit: string;
  }>;
  outputs: Array<{
    id: string;
    quantity_produced: number;
    quality_grade: string | null;
    lot_code: string | null;
    material_name: string;
    material_unit: string;
  }>;
  rendement: number;
  conformiteEUDR: 'conforme' | 'incomplet' | 'non_conforme';
}

// ─── Calcul conformité EUDR ───────────────────────────────────────────────────

function calculerConformiteEUDR(lot: {
  inputs: Array<{ material_name: string }>;
  outputs: Array<{ quality_grade: string | null; lot_code: string | null }>;
}): 'conforme' | 'incomplet' | 'non_conforme' {
  const hasInputs = lot.inputs.length > 0;
  const hasOutputs = lot.outputs.length > 0;
  const hasLotCode = lot.outputs.every((o) => o.lot_code !== null && o.lot_code !== '');
  const hasGrade = lot.outputs.every((o) => o.quality_grade !== null && o.quality_grade !== '');

  if (!hasInputs || !hasOutputs) return 'non_conforme';
  if (!hasLotCode || !hasGrade) return 'incomplet';
  return 'conforme';
}

// ─── Fetch données traçabilité ────────────────────────────────────────────────

async function getLotsPourTracabilite(siteId: string): Promise<LotTracabilite[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('batches')
      .select(`
        id, batch_number, status, started_at, completed_at, created_at,
        batch_inputs(id, quantity_used, material_id, materials(name, unit)),
        batch_outputs(id, quantity_produced, quality_grade, lot_code, material_id, materials(name, unit))
      `)
      .eq('site_id', siteId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(200);

    if (error || !data) return [];

    return data.map((lot) => {
      const inputs = (lot.batch_inputs ?? []).map((i) => {
        const mat = Array.isArray(i.materials) ? i.materials[0] : i.materials;
        return {
          id: i.id,
          quantity_used: Number(i.quantity_used),
          material_name: (mat as { name?: string } | null)?.name ?? 'Inconnu',
          material_unit: (mat as { unit?: string } | null)?.unit ?? '',
        };
      });

      const outputs = (lot.batch_outputs ?? []).map((o) => {
        const mat = Array.isArray(o.materials) ? o.materials[0] : o.materials;
        return {
          id: o.id,
          quantity_produced: Number(o.quantity_produced),
          quality_grade: o.quality_grade ?? null,
          lot_code: o.lot_code ?? null,
          material_name: (mat as { name?: string } | null)?.name ?? 'Inconnu',
          material_unit: (mat as { unit?: string } | null)?.unit ?? '',
        };
      });

      const totalEntree = inputs.reduce((s, i) => s + i.quantity_used, 0);
      const totalSortie = outputs.reduce((s, o) => s + o.quantity_produced, 0);
      const rendement = totalEntree > 0 ? Math.round((totalSortie / totalEntree) * 100) : 0;
      const conformiteEUDR = calculerConformiteEUDR({ inputs, outputs });

      return {
        id: lot.id,
        batch_number: lot.batch_number,
        status: lot.status,
        started_at: lot.started_at,
        completed_at: lot.completed_at,
        created_at: lot.created_at,
        inputs,
        outputs,
        rendement,
        conformiteEUDR,
      };
    });
  } catch {
    return [];
  }
}

// ─── Statistiques EUDR ───────────────────────────────────────────────────────

function StatsEUDR({ lots }: { lots: LotTracabilite[] }) {
  const conforme = lots.filter((l) => l.conformiteEUDR === 'conforme').length;
  const incomplet = lots.filter((l) => l.conformiteEUDR === 'incomplet').length;
  const nonConforme = lots.filter((l) => l.conformiteEUDR === 'non_conforme').length;
  const total = lots.length;
  const tauxConformite = total > 0 ? Math.round((conforme / total) * 100) : 0;

  return (
    <div className="taama-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(240,168,50,0.1)' }}>
          <GitBranch size={15} style={{ color: 'var(--amber)' }} />
        </div>
        <div>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            Conformité EUDR
          </h2>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>
            Effective décembre 2026 — {total} lot{total > 1 ? 's' : ''} terminé{total > 1 ? 's' : ''}
          </p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-2xl font-bold" style={{ color: tauxConformite >= 80 ? 'var(--green)' : tauxConformite >= 50 ? 'var(--amber)' : 'var(--red)' }}>
            {tauxConformite}%
          </div>
          <div className="text-xs" style={{ color: 'var(--text3)' }}>taux de conformité</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.2)' }}>
          <div className="text-xl font-bold" style={{ color: 'var(--green)' }}>{conforme}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>Conformes</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(240,168,50,0.08)', border: '1px solid rgba(240,168,50,0.2)' }}>
          <div className="text-xl font-bold" style={{ color: 'var(--amber)' }}>{incomplet}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>Incomplets</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)' }}>
          <div className="text-xl font-bold" style={{ color: 'var(--red)' }}>{nonConforme}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>Non-conformes</div>
        </div>
      </div>
      <div className="mt-3 rounded-full overflow-hidden h-2" style={{ background: 'var(--bg3)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${tauxConformite}%`, background: tauxConformite >= 80 ? 'var(--green)' : tauxConformite >= 50 ? 'var(--amber)' : 'var(--red)' }} />
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default async function TracabilitePage() {
  const profil = await getProfilCourant();
  if (!profil) redirect('/connexion');

  const siteId = profil.site_id ?? '';
  const lots = await getLotsPourTracabilite(siteId);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            Traçabilité
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            Suivi des lots et conformité réglementaire EUDR
          </p>
        </div>
      </div>

      {/* Stats EUDR */}
      <StatsEUDR lots={lots} />

      {/* Tableau interactif (Client Component pour filtres + export) */}
      <TracabiliteClient lots={lots} />
    </div>
  );
}
