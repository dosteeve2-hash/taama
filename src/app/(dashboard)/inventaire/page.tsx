// Server Component — Page inventaire avec stock en temps réel
import { redirect } from 'next/navigation';
import { getProfilCourant, getInventoryWithAlerts, getRecentMovements, getMaterials, getSuppliers } from '@/lib/queries';
import InventaireClient from './InventaireClient';

export default async function InventairePage() {
  const profil = await getProfilCourant();
  if (!profil) redirect('/connexion');

  const siteId = profil.site_id ?? '';
  const orgId = profil.org_id;

  const [inventaire, mouvements, materials, suppliers] = await Promise.all([
    getInventoryWithAlerts(siteId),
    getRecentMovements(siteId, 20),
    getMaterials(orgId),
    getSuppliers(orgId),
  ]);

  return (
    <InventaireClient
      inventaire={inventaire}
      mouvements={mouvements}
      materials={materials}
      suppliers={suppliers}
      siteId={siteId}
    />
  );
}
