// Server Component — Page de gestion des lots de production
import { redirect } from 'next/navigation';
import { getProfilCourant, getRecentBatches, getMaterials } from '@/lib/queries';
import ProductionClient from './ProductionClient';

export default async function ProductionPage() {
  const profil = await getProfilCourant();
  if (!profil) redirect('/connexion');

  const siteId = profil.site_id ?? '';
  const orgId = profil.org_id;

  const [lots, materials] = await Promise.all([
    getRecentBatches(siteId, 50),
    getMaterials(orgId),
  ]);

  return (
    <ProductionClient
      lots={lots}
      materials={materials}
      siteId={siteId}
    />
  );
}
