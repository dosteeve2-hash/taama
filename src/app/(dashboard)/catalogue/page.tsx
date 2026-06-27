// Server Component — Page catalogue (matières + fournisseurs)
import { redirect } from 'next/navigation';
import { getProfilCourant, getMaterials, getSuppliers } from '@/lib/queries';
import CatalogueClient from './CatalogueClient';

export default async function CataloguePage() {
  const profil = await getProfilCourant();
  if (!profil) redirect('/connexion');

  const orgId = profil.org_id;

  const [materials, suppliers] = await Promise.all([
    getMaterials(orgId),
    getSuppliers(orgId),
  ]);

  return (
    <CatalogueClient
      materials={materials}
      suppliers={suppliers}
      orgId={orgId}
    />
  );
}
