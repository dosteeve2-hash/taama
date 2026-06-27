'use client';

// Client Component — Onglets Profil / Organisation / Membres
import { useState, useTransition, type ComponentType, type FormEvent } from 'react';
import { User, Building2, Users, Loader2, AlertCircle, CheckCircle, Plus, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { updateProfile, envoyerResetMotDePasse, addSite, updateMemberRole } from './actions';
import type { UserProfile, Organization, Site } from '@/types/database';
import type { MembreOrg } from './page';

// ─── Styles communs ───────────────────────────────────────────────────────────

const inputStyle = {
  background: 'var(--bg)',
  border: '1px solid var(--border2)',
  color: 'var(--text)',
  borderRadius: '0.75rem',
  padding: '0.625rem 0.875rem',
  fontSize: '0.875rem',
  outline: 'none',
  width: '100%',
};

// ─── Onglet Profil ────────────────────────────────────────────────────────────

function OngletProfil({ profil, email }: { profil: UserProfile; email: string }) {
  const [fullName, setFullName] = useState(profil.full_name ?? '');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPendingProfil, startProfil] = useTransition();
  const [isPendingReset, startReset] = useTransition();

  const handleUpdateProfil = (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startProfil(async () => {
      const result = await updateProfile(fullName);
      setMessage(result.success
        ? { type: 'success', text: 'Profil mis à jour avec succès.' }
        : { type: 'error', text: result.error }
      );
    });
  };

  const handleResetPassword = () => {
    if (!email) return;
    setMessage(null);
    startReset(async () => {
      const result = await envoyerResetMotDePasse(email);
      setMessage(result.success
        ? { type: 'success', text: 'Email de réinitialisation envoyé. Vérifiez votre boîte mail.' }
        : { type: 'error', text: result.error }
      );
    });
  };

  const roleBadge: Record<string, string> = { admin: 'Admin', manager: 'Manager', operator: 'Opérateur' };

  return (
    <div className="flex flex-col gap-5">
      {/* Identité */}
      <div className="taama-card p-5">
        <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text)' }}>Identité</h3>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0"
            style={{ background: 'var(--amber)', color: 'var(--bg)' }}>
            {fullName ? fullName.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{fullName || '—'}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{email}</div>
            <span className="inline-flex mt-1.5 items-center px-2 py-0.5 rounded-lg text-xs font-medium"
              style={{ background: 'rgba(240,168,50,0.15)', color: 'var(--amber)' }}>
              {roleBadge[profil.role] ?? profil.role}
            </span>
          </div>
        </div>

        {/* Feedback */}
        {message && (
          <div className="flex items-center gap-2 p-3 rounded-xl text-xs mb-4"
            style={{ background: message.type === 'success' ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)', color: message.type === 'success' ? 'var(--green)' : 'var(--red)' }}>
            {message.type === 'success' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
            {message.text}
          </div>
        )}

        {/* Formulaire profil */}
        <form onSubmit={handleUpdateProfil} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text2)' }}>Nom complet</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Prénom Nom"
              style={inputStyle}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text2)' }}>Email</label>
            <input type="email" value={email} disabled
              style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
          </div>
          <button
            type="submit"
            disabled={isPendingProfil}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold taama-btn-primary disabled:opacity-60"
          >
            {isPendingProfil ? <Loader2 size={14} className="animate-spin" /> : null}
            Enregistrer les modifications
          </button>
        </form>
      </div>

      {/* Sécurité */}
      <div className="taama-card p-5">
        <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>Sécurité</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text3)' }}>
          Un email de réinitialisation sera envoyé à {email}
        </p>
        <button
          onClick={handleResetPassword}
          disabled={isPendingReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60"
          style={{ border: '1px solid var(--border2)', color: 'var(--text2)' }}
        >
          {isPendingReset ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
          Changer de mot de passe
        </button>
      </div>
    </div>
  );
}

// ─── Onglet Organisation ──────────────────────────────────────────────────────

function OngletOrganisation({
  organisation,
  sites,
  orgId,
}: {
  organisation: Organization | null;
  sites: Site[];
  orgId: string;
}) {
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [nomSite, setNomSite] = useState('');
  const [typeSite, setTypeSite] = useState<'usine' | 'entrepot' | 'ferme'>('usine');
  const [localiteSite, setLocaliteSite] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const planBadge: Record<string, { label: string; color: string }> = {
    trial:   { label: 'Essai gratuit', color: 'var(--amber)' },
    starter: { label: 'Starter',       color: 'var(--blue)' },
    pro:     { label: 'Pro',           color: 'var(--green)' },
  };

  const plan = planBadge[organisation?.plan ?? 'trial'] ?? planBadge['trial'];

  const handleAddSite = (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await addSite({ orgId, name: nomSite, type: typeSite, location: localiteSite });
      if (result.success) {
        setMessage({ type: 'success', text: 'Site ajouté avec succès.' });
        setNomSite('');
        setLocaliteSite('');
        setAjoutOuvert(false);
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    });
  };

  const typeSiteLabel: Record<string, string> = { usine: '🏭 Usine', entrepot: '🏢 Entrepôt', ferme: '🌾 Ferme' };

  return (
    <div className="flex flex-col gap-5">
      {/* Info organisation */}
      <div className="taama-card p-5">
        <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text)' }}>Mon organisation</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--text3)' }}>Nom</div>
            <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{organisation?.name ?? '—'}</div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--text3)' }}>Secteur</div>
            <div className="text-sm" style={{ color: 'var(--text2)' }}>{organisation?.sector ?? '—'}</div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--text3)' }}>Plan actuel</div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold"
              style={{ background: `${plan.color}1a`, color: plan.color }}>
              {plan.label}
            </span>
          </div>
          {organisation?.plan === 'trial' && organisation.trial_ends_at && (
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--text3)' }}>Expire le</div>
              <div className="text-sm" style={{ color: 'var(--amber)' }}>
                {format(new Date(organisation.trial_ends_at), 'd MMMM yyyy', { locale: fr })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sites */}
      <div className="taama-card overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            Sites ({sites.length})
          </h3>
          <button
            onClick={() => setAjoutOuvert(!ajoutOuvert)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ border: '1px solid rgba(240,168,50,0.3)', color: 'var(--amber)' }}
          >
            <Plus size={12} /> Ajouter un site
          </button>
        </div>

        {/* Feedback */}
        {message && (
          <div className="mx-5 mt-4 flex items-center gap-2 p-3 rounded-xl text-xs"
            style={{ background: message.type === 'success' ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)', color: message.type === 'success' ? 'var(--green)' : 'var(--red)' }}>
            {message.type === 'success' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
            {message.text}
          </div>
        )}

        {/* Formulaire ajout site */}
        {ajoutOuvert && (
          <form onSubmit={handleAddSite} className="p-5 flex flex-col gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text" value={nomSite} onChange={(e) => setNomSite(e.target.value)}
                placeholder="Nom du site" required style={inputStyle}
              />
              <select value={typeSite} onChange={(e) => setTypeSite(e.target.value as 'usine' | 'entrepot' | 'ferme')}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="usine">Usine</option>
                <option value="entrepot">Entrepôt</option>
                <option value="ferme">Ferme</option>
              </select>
            </div>
            <input
              type="text" value={localiteSite} onChange={(e) => setLocaliteSite(e.target.value)}
              placeholder="Localité (ex: Ouagadougou, Bobo-Dioulasso…)" style={inputStyle}
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setAjoutOuvert(false)}
                className="flex-1 py-2 rounded-xl text-xs font-medium"
                style={{ border: '1px solid var(--border2)', color: 'var(--text2)' }}>
                Annuler
              </button>
              <button type="submit" disabled={isPending}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold taama-btn-primary disabled:opacity-60">
                {isPending ? <Loader2 size={12} className="animate-spin" /> : null}
                Créer le site
              </button>
            </div>
          </form>
        )}

        {/* Liste des sites */}
        {sites.length === 0 ? (
          <div className="py-10 text-center text-sm" style={{ color: 'var(--text3)' }}>
            Aucun site configuré.
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {sites.map((site) => (
              <div key={site.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm" style={{ color: 'var(--text)' }}>{site.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                    {site.location ?? 'Localité non renseignée'}
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>
                  {typeSiteLabel[site.type] ?? site.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Onglet Membres ───────────────────────────────────────────────────────────

function OngletMembres({
  membres,
  profilRole,
}: {
  membres: MembreOrg[];
  profilRole: string;
}) {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; userId?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const roleBadge: Record<string, { label: string; color: string }> = {
    admin:    { label: 'Admin',      color: 'var(--amber)' },
    manager:  { label: 'Manager',    color: 'var(--blue)' },
    operator: { label: 'Opérateur',  color: 'var(--text2)' },
  };

  const handleUpdateRole = (userId: string, newRole: 'admin' | 'manager' | 'operator') => {
    setMessage(null);
    startTransition(async () => {
      const result = await updateMemberRole(userId, newRole);
      setMessage(result.success
        ? { type: 'success', text: 'Rôle mis à jour.', userId }
        : { type: 'error', text: result.error, userId }
      );
    });
  };

  return (
    <div className="taama-card overflow-hidden">
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
          Membres ({membres.length})
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
          L&apos;invitation de nouveaux membres se fait via la page de connexion (magic link).
        </p>
      </div>

      {membres.length === 0 ? (
        <div className="py-10 text-center text-sm" style={{ color: 'var(--text3)' }}>
          Aucun membre dans cette organisation.
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {membres.map((membre) => {
            const badge = roleBadge[membre.role] ?? roleBadge['operator'];
            return (
              <div key={membre.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>
                    {(membre.full_name ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>
                      {membre.full_name ?? 'Membre sans nom'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text3)' }}>
                      Depuis {format(new Date(membre.created_at), 'MMM yyyy', { locale: fr })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Feedback inline */}
                  {message?.userId === membre.id && (
                    <span className="text-xs" style={{ color: message.type === 'success' ? 'var(--green)' : 'var(--red)' }}>
                      {message.text}
                    </span>
                  )}

                  {/* Sélecteur de rôle (admin seulement) */}
                  {profilRole === 'admin' ? (
                    <select
                      defaultValue={membre.role}
                      onChange={(e) => handleUpdateRole(membre.id, e.target.value as 'admin' | 'manager' | 'operator')}
                      disabled={isPending}
                      className="text-xs px-2.5 py-1.5 rounded-lg outline-none disabled:opacity-50"
                      style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: badge.color, cursor: 'pointer' }}
                    >
                      <option value="operator">Opérateur</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-lg"
                      style={{ background: `${badge.color}1a`, color: badge.color }}>
                      {badge.label}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  profil: UserProfile;
  email: string;
  organisation: Organization | null;
  membres: MembreOrg[];
  sites: Site[];
}

export default function ParametresClient({ profil, email, organisation, membres, sites }: Props) {
  const [onglet, setOnglet] = useState<'profil' | 'organisation' | 'membres'>('profil');

  const onglets: Array<{ id: 'profil' | 'organisation' | 'membres'; label: string; icon: ComponentType<{ size: number }> }> = [
    { id: 'profil',       label: 'Mon profil',       icon: User },
    { id: 'organisation', label: 'Mon organisation',  icon: Building2 },
    { id: 'membres',      label: 'Membres',           icon: Users },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Onglets */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        {onglets.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setOnglet(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={onglet === id
              ? { background: 'var(--bg)', color: 'var(--amber)', border: '1px solid rgba(240,168,50,0.2)' }
              : { color: 'var(--text2)', border: '1px solid transparent' }
            }
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Contenu de l'onglet actif */}
      {onglet === 'profil' && <OngletProfil profil={profil} email={email} />}
      {onglet === 'organisation' && (
        <OngletOrganisation organisation={organisation} sites={sites} orgId={profil.org_id} />
      )}
      {onglet === 'membres' && <OngletMembres membres={membres} profilRole={profil.role} />}
    </div>
  );
}
