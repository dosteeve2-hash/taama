// ============================================================
// TAAMA — Requêtes Supabase typées
// Toutes les fonctions de lecture de données
// ============================================================

import { createClient } from '@/lib/supabase/server';
import type {
  UserProfile,
  DashboardStats,
  Batch,
  InventoryItem,
  InventoryMovement,
  Material,
  Supplier,
} from '@/types/database';

// ─── Profil utilisateur courant ───────────────────────────────────────────────

/**
 * Récupère le profil de l'utilisateur connecté avec son organisation et site.
 * Retourne null si non authentifié.
 */
export async function getProfilCourant(): Promise<UserProfile | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*, organizations(*), sites(*)')
      .eq('id', user.id)
      .single();

    if (error || !data) return null;
    return data as UserProfile;
  } catch {
    return null;
  }
}

// ─── Stats dashboard ─────────────────────────────────────────────────────────

/**
 * Retourne les 4 KPIs principaux du dashboard pour une organisation.
 */
export async function getOrgDashboardStats(orgId: string): Promise<DashboardStats> {
  const defaut: DashboardStats = {
    batchesInProgress: 0,
    avgYield: 0,
    stockAlerts: 0,
    tonnesThisMonth: 0,
  };

  try {
    const supabase = await createClient();

    // Récupérer les IDs de sites de l'organisation
    const { data: sitesData } = await supabase
      .from('sites')
      .select('id')
      .eq('org_id', orgId);

    const siteIds = (sitesData ?? []).map((s: { id: string }) => s.id);
    if (siteIds.length === 0) return defaut;

    // 1. Lots en cours
    const { count: batchesInProgress } = await supabase
      .from('batches')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in_progress')
      .in('site_id', siteIds);

    // 2. Lots terminés ce mois — rendement moyen + tonnes produites
    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);

    const { data: lotsTermines } = await supabase
      .from('batches')
      .select('id, batch_inputs(quantity_used), batch_outputs(quantity_produced)')
      .eq('status', 'completed')
      .gte('completed_at', debutMois.toISOString())
      .in('site_id', siteIds);

    let avgYield = 0;
    let tonnesThisMonth = 0;

    if (lotsTermines && lotsTermines.length > 0) {
      const rendements: number[] = [];

      for (const lot of lotsTermines) {
        const inputs = (lot.batch_inputs ?? []) as Array<{ quantity_used: number }>;
        const outputs = (lot.batch_outputs ?? []) as Array<{ quantity_produced: number }>;

        const totalEntree = inputs.reduce((s, i) => s + Number(i.quantity_used), 0);
        const totalSortie = outputs.reduce((s, o) => s + Number(o.quantity_produced), 0);

        tonnesThisMonth += totalSortie;
        if (totalEntree > 0) {
          rendements.push((totalSortie / totalEntree) * 100);
        }
      }

      avgYield =
        rendements.length > 0
          ? Math.round(rendements.reduce((a, b) => a + b, 0) / rendements.length)
          : 0;
    }

    // 3. Alertes stock — matières sous le seuil minimum
    const { data: stockData } = await supabase
      .from('inventory')
      .select('quantity, min_threshold')
      .in('site_id', siteIds);

    const alertesStock = (stockData ?? []).filter(
      (item: { quantity: number; min_threshold: number }) =>
        Number(item.quantity) < Number(item.min_threshold)
    ).length;

    return {
      batchesInProgress: batchesInProgress ?? 0,
      avgYield,
      stockAlerts: alertesStock,
      tonnesThisMonth: Math.round(tonnesThisMonth * 10) / 10,
    };
  } catch {
    return defaut;
  }
}

// ─── Lots ────────────────────────────────────────────────────────────────────

/**
 * Retourne les N derniers lots d'un site avec leurs entrées et sorties.
 */
export async function getRecentBatches(siteId: string, limit = 10): Promise<Batch[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('batches')
      .select('*, batch_inputs(*, materials(name, unit)), batch_outputs(*, materials(name, unit))')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data ?? []) as Batch[];
  } catch {
    return [];
  }
}

/**
 * Retourne tous les lots actifs (en cours + planifiés) d'un site.
 */
export async function getActiveBatches(siteId: string): Promise<Batch[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('batches')
      .select('*, batch_inputs(*, materials(name, unit)), batch_outputs(*, materials(name, unit))')
      .eq('site_id', siteId)
      .in('status', ['in_progress', 'planned'])
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data ?? []) as Batch[];
  } catch {
    return [];
  }
}

// ─── Inventaire ──────────────────────────────────────────────────────────────

/**
 * Retourne l'inventaire complet d'un site avec les infos matière.
 */
export async function getInventoryWithAlerts(siteId: string): Promise<InventoryItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('inventory')
      .select('*, materials(name, unit, category)')
      .eq('site_id', siteId)
      .order('updated_at', { ascending: false });

    if (error) return [];
    return (data ?? []) as InventoryItem[];
  } catch {
    return [];
  }
}

/**
 * Retourne les N derniers mouvements de stock d'un site.
 */
export async function getRecentMovements(
  siteId: string,
  limit = 20
): Promise<InventoryMovement[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('inventory_movements')
      .select('*, materials(name, unit), suppliers(name)')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data ?? []) as InventoryMovement[];
  } catch {
    return [];
  }
}

// ─── Catalogue ────────────────────────────────────────────────────────────────

/**
 * Retourne toutes les matières/produits d'une organisation.
 */
export async function getMaterials(orgId: string): Promise<Material[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('org_id', orgId)
      .order('name');

    if (error) return [];
    return (data ?? []) as Material[];
  } catch {
    return [];
  }
}

/**
 * Retourne tous les fournisseurs d'une organisation.
 */
export async function getSuppliers(orgId: string): Promise<Supplier[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('org_id', orgId)
      .order('name');

    if (error) return [];
    return (data ?? []) as Supplier[];
  } catch {
    return [];
  }
}

// ─── Alertes ──────────────────────────────────────────────────────────────────

/**
 * Retourne les N dernières alertes non-lues d'une organisation.
 */
export async function getAlertesNonLues(orgId: string, limit = 5) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/**
 * Retourne les sites d'une org avec le nombre de lots en cours.
 */
export async function getSitesAvecLotsEnCours(
  orgId: string
): Promise<Array<{ id: string; name: string; type: string; location: string | null; lotsEnCours: number }>> {
  try {
    const supabase = await createClient();
    const { data: sites, error } = await supabase
      .from('sites')
      .select('id, name, type, location')
      .eq('org_id', orgId);

    if (error || !sites) return [];

    // Pour chaque site, compter les lots en cours
    const result = await Promise.all(
      sites.map(async (site: { id: string; name: string; type: string; location: string | null }) => {
        const { count } = await supabase
          .from('batches')
          .select('*', { count: 'exact', head: true })
          .eq('site_id', site.id)
          .in('status', ['in_progress', 'planned']);

        return {
          id: site.id,
          name: site.name,
          type: site.type,
          location: site.location,
          lotsEnCours: count ?? 0,
        };
      })
    );

    return result;
  } catch {
    return [];
  }
}

// ─── Rapports ────────────────────────────────────────────────────────────────

/**
 * Retourne tous les lots complétés dans une période donnée pour un site.
 */
export async function getBatchesForPeriod(
  siteId: string,
  debut: Date,
  fin: Date
): Promise<Batch[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('batches')
      .select('*, batch_inputs(*, materials(name, unit)), batch_outputs(*, materials(name, unit))')
      .eq('site_id', siteId)
      .eq('status', 'completed')
      .gte('completed_at', debut.toISOString())
      .lte('completed_at', fin.toISOString())
      .order('completed_at', { ascending: false });

    if (error) return [];
    return (data ?? []) as Batch[];
  } catch {
    return [];
  }
}
