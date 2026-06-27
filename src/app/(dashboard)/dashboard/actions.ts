'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types/database';

// ─── Marquer une alerte comme lue ─────────────────────────────────────────────

export async function marquerAlerteLue(alerteId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Non authentifié.' };

    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', alerteId);

    if (error) return { success: false, error: 'Erreur lors de la mise à jour.' };

    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: msg };
  }
}
