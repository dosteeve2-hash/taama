// ============================================================
// TAAMA — Système d'alertes automatiques de stock
// ============================================================

import { createClient } from '@/lib/supabase/server';

/**
 * Vérifie les stocks critiques d'un site et crée des alertes
 * si le stock est en dessous du seuil minimum.
 * Évite les doublons : pas d'alerte si une similaire existe depuis < 24h.
 */
export async function checkAndCreateStockAlerts(siteId: string): Promise<void> {
  try {
    const supabase = await createClient();

    // Récupérer le org_id du site
    const { data: site } = await supabase
      .from('sites')
      .select('org_id')
      .eq('id', siteId)
      .single();

    if (!site) return;
    const orgId = site.org_id as string;

    // Stocks sous le seuil minimum
    const { data: stocks } = await supabase
      .from('inventory')
      .select('material_id, quantity, min_threshold, materials(name, unit)')
      .eq('site_id', siteId);

    if (!stocks || stocks.length === 0) return;

    const stocksCritiques = stocks.filter(
      (s) => Number(s.quantity) <= Number(s.min_threshold) && Number(s.min_threshold) > 0
    );

    if (stocksCritiques.length === 0) return;

    // Seuil anti-doublons : 24h
    const hier = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    for (const stock of stocksCritiques) {
      const mat = Array.isArray(stock.materials) ? stock.materials[0] : stock.materials;
      const material = mat as { name: string; unit: string } | null;
      const nomMatiere = material?.name ?? 'matière inconnue';
      const messageAlerte = `Stock critique : ${nomMatiere} (${Number(stock.quantity).toFixed(1)} ${material?.unit ?? ''} restant — seuil : ${Number(stock.min_threshold).toFixed(1)})`;

      // Vérifier si une alerte similaire existe déjà dans les 24 dernières heures
      const { data: alertesRecentes } = await supabase
        .from('alerts')
        .select('id')
        .eq('org_id', orgId)
        .eq('type', 'stock_critique')
        .ilike('message', `%${nomMatiere}%`)
        .gte('created_at', hier)
        .limit(1);

      if (alertesRecentes && alertesRecentes.length > 0) continue; // déjà alerté

      // Créer l'alerte
      await supabase.from('alerts').insert({
        org_id: orgId,
        type: 'stock_critique',
        message: messageAlerte,
        is_read: false,
      });
    }
  } catch (err) {
    // Ne pas bloquer les Server Actions si les alertes échouent
    console.error('[TAAMA] Erreur checkAndCreateStockAlerts:', err);
  }
}
