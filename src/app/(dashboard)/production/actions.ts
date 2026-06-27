'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { checkAndCreateStockAlerts } from '@/lib/alerts';
import type { ActionResult } from '@/types/database';

// ─── Créer un lot ─────────────────────────────────────────────────────────────

interface InputLot {
  materialId: string;
  quantityUsed: number;
  quantityPlanned?: number;
}

interface OutputLot {
  materialId: string;
  quantityProduced: number;
  qualityGrade?: string;
}

export async function creerLot(params: {
  siteId: string;
  batchNumber: string;
  notes?: string;
  inputs: InputLot[];
}): Promise<ActionResult<{ batchId: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Non authentifié.' };

    // Créer le lot
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .insert({
        site_id: params.siteId,
        batch_number: params.batchNumber,
        notes: params.notes ?? null,
        status: 'in_progress',
        created_by: user.id,
      })
      .select()
      .single();

    if (batchError || !batch) {
      return { success: false, error: 'Erreur lors de la création du lot.' };
    }

    // Insérer les entrées (matières premières consommées)
    for (const input of params.inputs) {
      // Enregistrer l'entrée du lot
      const { error: inputError } = await supabase.from('batch_inputs').insert({
        batch_id: batch.id,
        material_id: input.materialId,
        quantity_used: input.quantityUsed,
        quantity_planned: input.quantityPlanned ?? null,
      });

      if (inputError) {
        return { success: false, error: 'Erreur lors de l\'enregistrement des entrées.' };
      }

      // Décrémenter le stock via un mouvement
      const { error: mvtError } = await supabase.from('inventory_movements').insert({
        site_id: params.siteId,
        material_id: input.materialId,
        type: 'out',
        quantity: input.quantityUsed,
        reason: `Consommation lot ${params.batchNumber}`,
        created_by: user.id,
      });

      if (mvtError) {
        return { success: false, error: 'Erreur lors de la mise à jour du stock.' };
      }
    }

    // Vérifier alertes après consommation des matières premières
    await checkAndCreateStockAlerts(params.siteId);

    revalidatePath('/production');
    revalidatePath('/dashboard');
    revalidatePath('/inventaire');

    return { success: true, data: { batchId: batch.id } };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: msg };
  }
}

// ─── Ajouter une sortie (produit fini obtenu) ────────────────────────────────

export async function ajouterSortie(params: {
  batchId: string;
  siteId: string;
  batchNumber: string;
  outputs: OutputLot[];
}): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Non authentifié.' };

    for (const output of params.outputs) {
      // Générer un code de lot traçabilité unique
      const lotCode = `TRC-${params.batchNumber}-${Date.now().toString(36).toUpperCase()}`;

      const { error: outputError } = await supabase.from('batch_outputs').insert({
        batch_id: params.batchId,
        material_id: output.materialId,
        quantity_produced: output.quantityProduced,
        quality_grade: output.qualityGrade ?? null,
        lot_code: lotCode,
      });

      if (outputError) {
        return { success: false, error: 'Erreur lors de l\'enregistrement des sorties.' };
      }

      // Incrémenter le stock produit fini
      const { error: mvtError } = await supabase.from('inventory_movements').insert({
        site_id: params.siteId,
        material_id: output.materialId,
        type: 'in',
        quantity: output.quantityProduced,
        reason: `Production lot ${params.batchNumber}`,
        created_by: user.id,
      });

      if (mvtError) {
        return { success: false, error: 'Erreur lors de la mise à jour du stock.' };
      }
    }

    revalidatePath('/production');
    revalidatePath('/inventaire');
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: msg };
  }
}

// ─── Terminer un lot ──────────────────────────────────────────────────────────

export async function terminerLot(batchId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('batches')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', batchId);

    if (error) return { success: false, error: 'Erreur lors de la clôture du lot.' };

    revalidatePath('/production');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: msg };
  }
}

// ─── Annuler un lot (restaurer les stocks) ───────────────────────────────────

export async function annulerLot(batchId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Non authentifié.' };

    // Récupérer les infos du lot
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select('*, batch_inputs(*), batch_outputs(*)')
      .eq('id', batchId)
      .single();

    if (batchError || !batch) {
      return { success: false, error: 'Lot introuvable.' };
    }

    const inputs = (batch.batch_inputs ?? []) as Array<{
      material_id: string;
      quantity_used: number;
    }>;
    const outputs = (batch.batch_outputs ?? []) as Array<{
      material_id: string;
      quantity_produced: number;
    }>;

    // Restaurer les stocks des matières premières (annuler les OUT)
    for (const input of inputs) {
      await supabase.from('inventory_movements').insert({
        site_id: batch.site_id,
        material_id: input.material_id,
        type: 'in',
        quantity: input.quantity_used,
        reason: `Annulation lot ${batch.batch_number}`,
        created_by: user.id,
      });
    }

    // Retirer les produits finis créés (annuler les IN)
    for (const output of outputs) {
      await supabase.from('inventory_movements').insert({
        site_id: batch.site_id,
        material_id: output.material_id,
        type: 'out',
        quantity: output.quantity_produced,
        reason: `Annulation lot ${batch.batch_number}`,
        created_by: user.id,
      });
    }

    // Marquer le lot comme annulé
    const { error: updateError } = await supabase
      .from('batches')
      .update({ status: 'cancelled' })
      .eq('id', batchId);

    if (updateError) return { success: false, error: 'Erreur lors de l\'annulation.' };

    revalidatePath('/production');
    revalidatePath('/dashboard');
    revalidatePath('/inventaire');
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: msg };
  }
}
