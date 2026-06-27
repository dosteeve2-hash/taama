// Server Component — Page rapports de production
import { redirect } from 'next/navigation';
import { getProfilCourant, getBatchesForPeriod } from '@/lib/queries';
import RapportsClient from './RapportsClient';

// Calcul de la période par défaut : mois en cours
function getPeriodeMoisCourant(): { debut: Date; fin: Date } {
  const debut = new Date();
  debut.setDate(1);
  debut.setHours(0, 0, 0, 0);
  const fin = new Date();
  fin.setHours(23, 59, 59, 999);
  return { debut, fin };
}

export default async function RapportsPage({
  searchParams,
}: {
  searchParams: Promise<{ debut?: string; fin?: string }>;
}) {
  const profil = await getProfilCourant();
  if (!profil) redirect('/connexion');

  const params = await searchParams;
  const periodeDefaut = getPeriodeMoisCourant();

  const debut = params.debut ? new Date(params.debut) : periodeDefaut.debut;
  const fin   = params.fin   ? new Date(params.fin)   : periodeDefaut.fin;

  const siteId = profil.site_id ?? '';
  const lots = await getBatchesForPeriod(siteId, debut, fin);

  return (
    <RapportsClient
      lots={lots}
      debutInitial={debut.toISOString().slice(0, 10)}
      finInitial={fin.toISOString().slice(0, 10)}
    />
  );
}
