'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// ─── Connexion ────────────────────────────────────────────────────────────────

export async function connexionAction(credentials: {
  email: string;
  password: string;
}): Promise<{ error: string } | never> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    // Traduire les messages d'erreur Supabase en français
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Email ou mot de passe incorrect.' };
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Veuillez confirmer votre email avant de vous connecter.' };
    }
    return { error: error.message };
  }

  redirect('/dashboard');
}

// ─── Déconnexion ──────────────────────────────────────────────────────────────

export async function deconnexionAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/connexion');
}

// ─── Création de compte (inscription multi-étapes) ───────────────────────────

interface InscriptionData {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  nomEntreprise: string;
  secteur: string;
  ville: string;
}

export async function creerCompteAction(
  data: InscriptionData
): Promise<{ error: string } | never> {
  const supabase = await createClient();

  // Étape 1 : Créer l'utilisateur dans Supabase Auth
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (signUpError) {
    if (signUpError.message.includes('already registered')) {
      return { error: 'Cet email est déjà utilisé.' };
    }
    return { error: signUpError.message };
  }

  if (!authData.user) {
    return { error: 'Erreur lors de la création du compte.' };
  }

  // Si email confirmation activée, impossible de continuer sans session
  if (!authData.session) {
    return {
      error:
        'CONFIRM_EMAIL: Vérifiez votre boîte email et confirmez votre adresse pour finaliser l\'inscription.',
    };
  }

  // Étape 2 : Créer l'organisation
  const slug = genererSlug(data.nomEntreprise);
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: data.nomEntreprise,
      slug,
      sector: data.secteur,
    })
    .select()
    .single();

  if (orgError || !org) {
    return { error: 'Erreur lors de la création de l\'organisation.' };
  }

  // Étape 3 : Créer le site principal
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .insert({
      org_id: org.id,
      name: data.nomEntreprise,
      location: data.ville || null,
      type: 'usine',
    })
    .select()
    .single();

  if (siteError || !site) {
    return { error: 'Erreur lors de la création du site.' };
  }

  // Étape 4 : Créer le profil utilisateur
  const { error: profileError } = await supabase.from('user_profiles').insert({
    id: authData.user.id,
    org_id: org.id,
    full_name: `${data.prenom} ${data.nom}`.trim(),
    role: 'admin',
    site_id: site.id,
  });

  if (profileError) {
    return { error: 'Erreur lors de la création du profil.' };
  }

  // Étape 5 : Rediriger vers le dashboard (déjà authentifié via signUp)
  redirect('/dashboard');
}

// ─── Utilitaire : génère un slug unique ───────────────────────────────────────

function genererSlug(nom: string): string {
  const base = nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // supprimer accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  // Suffixe aléatoire pour garantir l'unicité
  const suffixe = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffixe}`;
}
