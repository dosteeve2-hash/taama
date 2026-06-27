'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { checkAndCreateStockAlerts } from '@/lib/alerts';
import type { ActionResult } from '@/types/database';

// ─── Entrée de stock ──────────────────────────────────────────────────────────

export async function enregistrerEntreeStock(params: {
  siteId: string;
  materialId: string;
  quantity: number;
  supplierId?: string;
  reference?: string;
  reason?: string;
}): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Non authentifié.' };

    const { error } = await supabase.from('inventory_movements').insert({
      site_id: params.siteId,
      material_id: params.materialId,
      type: 'in',
      quantity: params.quantity,
      supplier_id: params.supplierId ?? null,
      reference: params.reference ?? null,
      reason: params.reason ?? 'Entrée stock',
      created_by: user.id,
    });

    if (error) return { success: false, error: 'Erreur lors de l\'enregistrement.' };

    // Vérifier alertes stock après le mouvement
    await checkAndCreateStockAlerts(params.siteId);

    revalidatePath('/inventaire');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: msg };
  }
}

// ─── Sortie de stock ──────────────────────────────────────────────────────────

export async function enregistrerSortieStock(params: {
  siteId: string;
  materialId: string;
  quantity: number;
  reason: string;
}): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Non authentifié.' };

    const { error } = await supabase.from('inventory_movements').insert({
      site_id: params.siteId,
      material_id: params.materialId,
      type: 'out',
      quantity: params.quantity,
      reason: params.reason,
      created_by: user.id,
    });

    if (error) return { success: false, error: 'Erreur lors de l\'enregistrement.' };

    // Vérifier alertes stock après la sortie
    await checkAndCreateStockAlerts(params.siteId);

    revalidatePath('/inventaire');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: msg };
  }
}

// ─── Ajustement de stock ──────────────────────────────────────────────────────

export async function ajusterStock(params: {
  siteId: string;
  materialId: string;
  newQuantity: number;
  reason: string;
}): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Non authentifié.' };

    const { error } = await supabase.from('inventory_movements').insert({
      site_id: params.siteId,
      material_id: params.materialId,
      type: 'adjustment',
      quantity: params.newQuantity,
      reason: params.reason,
      created_by: user.id,
    });

    if (error) return { success: false, error: 'Erreur lors de l\'ajustement.' };

    // Vérifier alertes stock après l'ajustement
    await checkAndCreateStockAlerts(params.siteId);

    revalidatePath('/inventaire');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: msg };
  }
}

// ─── Mettre à jour le seuil minimum ──────────────────────────────────────────

export async function mettreAJourSeuilMinimum(params: {
  siteId: string;
  materialId: string;
  minThreshold: number;
}): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('inventory')
      .upsert(
        {
          site_id: params.siteId,
          material_id: params.materialId,
          min_threshold: params.minThreshold,
        },
        { onConflict: 'site_id,material_id' }
      );

    if (error) return { success: false, error: 'Erreur lors de la mise à jour.' };

    revalidatePath('/inventaire');
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: msg };
  }
}
