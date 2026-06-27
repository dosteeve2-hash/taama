'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types/database';

// ─── Mettre à jour le profil ──────────────────────────────────────────────────

export async function updateProfile(fullName: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Non authentifié.' };

    const { error } = await supabase
      .from('user_profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);

    if (error) return { success: false, error: 'Erreur lors de la mise à jour du profil.' };

    revalidatePath('/parametres');
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: msg };
  }
}

// ─── Envoyer un email de reset de mot de passe ────────────────────────────────

export async function envoyerResetMotDePasse(email: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback?next=/parametres`,
    });

    if (error) return { success: false, error: 'Erreur lors de l\'envoi de l\'email.' };
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: msg };
  }
}

// ─── Ajouter un site ──────────────────────────────────────────────────────────

export async function addSite(params: {
  orgId: string;
  name: string;
  type: 'usine' | 'entrepot' | 'ferme';
  location: string;
}): Promise<ActionResult<{ siteId: string }>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Non authentifié.' };

    const { data, error } = await supabase
      .from('sites')
      .insert({
        org_id: params.orgId,
        name: params.name,
        type: params.type,
        location: params.location || null,
      })
      .select()
      .single();

    if (error || !data) return { success: false, error: 'Erreur lors de la création du site.' };

    revalidatePath('/parametres');
    return { success: true, data: { siteId: data.id } };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: msg };
  }
}

// ─── Mettre à jour le rôle d'un membre ───────────────────────────────────────

export async function updateMemberRole(
  userId: string,
  newRole: 'admin' | 'manager' | 'operator'
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Non authentifié.' };

    // Vérifier que l'utilisateur courant est admin
    const { data: profil } = await supabase
      .from('user_profiles')
      .select('role, org_id')
      .eq('id', user.id)
      .single();

    if (!profil || profil.role !== 'admin') {
      return { success: false, error: 'Permissions insuffisantes. Rôle admin requis.' };
    }

    // Mettre à jour le rôle
    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .eq('org_id', profil.org_id);

    if (error) return { success: false, error: 'Erreur lors de la mise à jour du rôle.' };

    revalidatePath('/parametres');
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: msg };
  }
}
