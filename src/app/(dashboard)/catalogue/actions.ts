'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types/database';

// ─── MATIÈRES ────────────────────────────────────────────────────────────────

export async function ajouterMatiere(params: {
  orgId: string;
  name: string;
  unit: string;
  category: 'raw' | 'finished' | 'byproduct';
  description?: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('materials')
      .insert({
        org_id: params.orgId,
        name: params.name.trim(),
        unit: params.unit,
        category: params.category,
        description: params.description?.trim() || null,
      })
      .select('id')
      .single();

    if (error) return { success: false, error: 'Erreur lors de l\'ajout.' };

    revalidatePath('/catalogue');
    return { success: true, data: { id: data.id } };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: msg };
  }
}

export async function supprimerMatiere(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('materials').delete().eq('id', id);
    if (error) return { success: false, error: 'Impossible de supprimer (matière utilisée dans des lots ?).' };
    revalidatePath('/catalogue');
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: msg };
  }
}

// ─── FOURNISSEURS ─────────────────────────────────────────────────────────────

export async function ajouterFournisseur(params: {
  orgId: string;
  name: string;
  contact?: string;
  location?: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        org_id: params.orgId,
        name: params.name.trim(),
        contact: params.contact?.trim() || null,
        location: params.location?.trim() || null,
      })
      .select('id')
      .single();

    if (error) return { success: false, error: 'Erreur lors de l\'ajout.' };

    revalidatePath('/catalogue');
    return { success: true, data: { id: data.id } };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: msg };
  }
}

export async function supprimerFournisseur(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) return { success: false, error: 'Impossible de supprimer ce fournisseur.' };
    revalidatePath('/catalogue');
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: msg };
  }
}
