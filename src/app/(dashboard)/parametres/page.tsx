// Server Component — Page paramètres (3 onglets : Profil / Organisation / Membres)
import { redirect } from 'next/navigation';
import { getProfilCourant } from '@/lib/queries';
import { createClient } from '@/lib/supabase/server';
import ParametresClient from './ParametresClient';
import type { UserProfile, Organization, Site } from '@/types/database';

// ─── Types locaux ─────────────────────────────────────────────────────────────

export interface MembreOrg {
  id: string;
  full_name: string | null;
  role: 'admin' | 'manager' | 'operator';
  created_at: string;
  // email depuis auth.users — non disponible via RLS simple,
  // on le stocke dans le profil si besoin ; ici on l'affiche tel quel
  email?: string;
}

// ─── Fetch membres de l'organisation ─────────────────────────────────────────

async function getMembresOrg(orgId: string): Promise<MembreOrg[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, full_name, role, created_at')
      .eq('org_id', orgId)
      .order('created_at', { ascending: true });

    if (error) return [];
    return (data ?? []) as MembreOrg[];
  } catch {
    return [];
  }
}

// ─── Fetch sites de l'organisation ───────────────────────────────────────────

async function getSitesOrg(orgId: string): Promise<Site[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: true });

    if (error) return [];
    return (data ?? []) as Site[];
  } catch {
    return [];
  }
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default async function ParametresPage() {
  const profil = await getProfilCourant();
  if (!profil) redirect('/connexion');

  const orgId = profil.org_id;
  const organisation = profil.organizations as Organization | undefined;

  const [membres, sites] = await Promise.all([
    getMembresOrg(orgId),
    getSitesOrg(orgId),
  ]);

  // Email de l'utilisateur courant depuis Supabase Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email ?? '';

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Paramètres
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
          Gérez votre profil, votre organisation et votre équipe
        </p>
      </div>

      <ParametresClient
        profil={profil}
        email={email}
        organisation={organisation ?? null}
        membres={membres}
        sites={sites}
      />
    </div>
  );
}
