'use server';

import { createClient } from '@/lib/supabase/server';

export interface DemoFormData {
  prenom: string;
  nom: string;
  email: string;
  entreprise: string;
  filiere: string;
  nbEmployes: string;
  message: string;
}

export async function soumettreDemandeDemo(
  data: DemoFormData
): Promise<{ success: boolean; error?: string }> {
  // Validation basique côté serveur
  if (!data.prenom || !data.nom || !data.email || !data.entreprise || !data.filiere || !data.nbEmployes) {
    return { success: false, error: 'Veuillez remplir tous les champs obligatoires.' };
  }

  // ── Tentative de sauvegarde dans Supabase ─────────────────────────────────
  try {
    const supabase = await createClient();

    const { error: dbError } = await supabase.from('demo_requests').insert({
      prenom: data.prenom,
      nom: data.nom,
      email: data.email,
      entreprise: data.entreprise,
      filiere: data.filiere,
      nb_employes: data.nbEmployes,
      message: data.message || null,
    });

    if (dbError) {
      // Table absente ou RLS — fallback console.log
      console.log('[TAAMA DEMO] Fallback log (Supabase error):', {
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        entreprise: data.entreprise,
        filiere: data.filiere,
        nbEmployes: data.nbEmployes,
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log('[TAAMA DEMO] Sauvegardé dans Supabase:', data.email);
    }
  } catch {
    // Fallback si Supabase inaccessible
    console.log('[TAAMA DEMO] Fallback log (exception):', {
      email: data.email,
      entreprise: data.entreprise,
      filiere: data.filiere,
      timestamp: new Date().toISOString(),
    });
  }

  return { success: true };
}
