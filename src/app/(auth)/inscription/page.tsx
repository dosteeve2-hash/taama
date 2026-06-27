'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Loader2, Check, AlertCircle } from 'lucide-react';
import { creerCompteAction } from '../actions';

// Secteurs industriels disponibles
const SECTEURS = [
  { valeur: 'coton', label: 'Coton' },
  { valeur: 'karite', label: 'Karité' },
  { valeur: 'sesame', label: 'Sésame' },
  { valeur: 'cereales', label: 'Céréales' },
  { valeur: 'elevage', label: 'Élevage' },
  { valeur: 'mangue_sechee', label: 'Mangue séchée' },
  { valeur: 'savonnerie', label: 'Savonnerie' },
  { valeur: 'autre', label: 'Autre' },
];

interface FormData {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  nomEntreprise: string;
  secteur: string;
  ville: string;
}

const ETAPES = ['Vos informations', 'Votre entreprise', 'Confirmation'];

export default function InscriptionPage() {
  const [etape, setEtape] = useState(1);
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormData>({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    nomEntreprise: '',
    secteur: '',
    ville: '',
  });

  const maj = (champ: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [champ]: e.target.value }));

  const validerEtape1 = () =>
    form.prenom && form.nom && form.email && form.password.length >= 8;

  const validerEtape2 = () => form.nomEntreprise && form.secteur;

  const allerEtape = (n: number) => {
    setErreur(null);
    setEtape(n);
  };

  const soumettre = () => {
    setErreur(null);
    startTransition(async () => {
      const result = await creerCompteAction(form);
      if (result?.error) {
        if (result.error.startsWith('CONFIRM_EMAIL:')) {
          setErreur(result.error.replace('CONFIRM_EMAIL: ', ''));
        } else {
          setErreur(result.error);
        }
      }
    });
  };

  const inputStyle = {
    background: 'var(--bg3)',
    border: '1px solid var(--border2)',
    color: 'var(--text)',
  };
  const fieldClass = 'w-full px-4 py-3 rounded-xl text-sm outline-none transition-all';

  return (
    <div>
      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl mb-4"
          style={{ background: 'var(--amber)', color: 'var(--bg)' }}
        >
          T
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Commencer gratuitement
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
          30 jours d&apos;essai · Aucune carte bancaire
        </p>
      </div>

      {/* Indicateur d'étapes */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {ETAPES.map((label, i) => {
          const num = i + 1;
          const actif = num === etape;
          const fait = num < etape;
          return (
            <div key={num} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: fait ? 'var(--green)' : actif ? 'var(--amber)' : 'var(--bg3)',
                    color: fait || actif ? 'var(--bg)' : 'var(--text3)',
                    border: `1px solid ${fait ? 'var(--green)' : actif ? 'var(--amber)' : 'var(--border2)'}`,
                  }}
                >
                  {fait ? <Check size={11} /> : num}
                </div>
                <span
                  className="text-xs hidden sm:block"
                  style={{ color: actif ? 'var(--text)' : 'var(--text3)' }}
                >
                  {label}
                </span>
              </div>
              {i < ETAPES.length - 1 && (
                <div className="w-8 h-px" style={{ background: 'var(--border2)' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Card formulaire */}
      <div
        className="rounded-2xl p-8"
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border2)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
        }}
      >
        {/* Erreur globale */}
        {erreur && (
          <div
            className="flex items-start gap-3 p-3 rounded-xl mb-5 text-sm"
            style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', color: 'var(--red)' }}
          >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{erreur}</span>
          </div>
        )}

        {/* ── Étape 1 : Infos utilisateur ── */}
        {etape === 1 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
                  Prénom
                </label>
                <input
                  type="text" value={form.prenom} onChange={maj('prenom')}
                  placeholder="Kofi" required className={fieldClass} style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--amber)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border2)')}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
                  Nom
                </label>
                <input
                  type="text" value={form.nom} onChange={maj('nom')}
                  placeholder="Ouédraogo" required className={fieldClass} style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--amber)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border2)')}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
                Email professionnel
              </label>
              <input
                type="email" value={form.email} onChange={maj('email')}
                placeholder="vous@entreprise.bf" required className={fieldClass} style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--amber)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border2)')}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
                Mot de passe <span style={{ color: 'var(--text3)' }}>(min. 8 caractères)</span>
              </label>
              <input
                type="password" value={form.password} onChange={maj('password')}
                placeholder="••••••••" minLength={8} required className={fieldClass} style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--amber)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border2)')}
              />
            </div>

            <button
              type="button"
              disabled={!validerEtape1()}
              onClick={() => allerEtape(2)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm mt-2 disabled:opacity-40 disabled:cursor-not-allowed taama-btn-primary"
            >
              Suivant <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── Étape 2 : Infos organisation ── */}
        {etape === 2 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
                Nom de votre entreprise
              </label>
              <input
                type="text" value={form.nomEntreprise} onChange={maj('nomEntreprise')}
                placeholder="Ex: Karité Premium SARL" required className={fieldClass} style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--amber)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border2)')}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
                Secteur d&apos;activité
              </label>
              <select
                value={form.secteur} onChange={maj('secteur')}
                required className={fieldClass}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">Sélectionner votre secteur…</option>
                {SECTEURS.map((s) => (
                  <option key={s.valeur} value={s.valeur}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
                Ville / Localité <span style={{ color: 'var(--text3)' }}>(optionnel)</span>
              </label>
              <input
                type="text" value={form.ville} onChange={maj('ville')}
                placeholder="Ex: Ouagadougou, Bobo-Dioulasso…" className={fieldClass} style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--amber)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border2)')}
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => allerEtape(1)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ border: '1px solid var(--border2)', color: 'var(--text2)' }}
              >
                <ArrowLeft size={16} /> Retour
              </button>
              <button
                type="button"
                disabled={!validerEtape2()}
                onClick={() => allerEtape(3)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed taama-btn-primary"
              >
                Suivant <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Étape 3 : Confirmation ── */}
        {etape === 3 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="text-base font-semibold" style={{ color: 'var(--text)' }}>
              Vérifiez vos informations
            </div>

            <div
              className="rounded-xl p-4 flex flex-col gap-3 text-sm"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}
            >
              <div className="flex justify-between">
                <span style={{ color: 'var(--text3)' }}>Nom</span>
                <span style={{ color: 'var(--text)' }}>{form.prenom} {form.nom}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text3)' }}>Email</span>
                <span style={{ color: 'var(--text)' }}>{form.email}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
              <div className="flex justify-between">
                <span style={{ color: 'var(--text3)' }}>Entreprise</span>
                <span style={{ color: 'var(--text)' }}>{form.nomEntreprise}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text3)' }}>Secteur</span>
                <span style={{ color: 'var(--text)' }}>
                  {SECTEURS.find((s) => s.valeur === form.secteur)?.label ?? form.secteur}
                </span>
              </div>
              {form.ville && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text3)' }}>Ville</span>
                  <span style={{ color: 'var(--text)' }}>{form.ville}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => allerEtape(2)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ border: '1px solid var(--border2)', color: 'var(--text2)' }}
              >
                <ArrowLeft size={16} /> Modifier
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={soumettre}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed taama-btn-primary"
              >
                {isPending ? (
                  <><Loader2 size={16} className="animate-spin" /> Création…</>
                ) : (
                  <><Check size={16} /> Créer mon compte</>
                )}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-sm mt-5" style={{ color: 'var(--text2)' }}>
          Déjà un compte ?{' '}
          <Link href="/connexion" className="font-semibold" style={{ color: 'var(--amber)' }}>
            Se connecter
          </Link>
        </p>
      </div>

      <p className="text-center text-xs mt-4" style={{ color: 'var(--text3)' }}>
        En créant un compte, vous acceptez nos conditions d&apos;utilisation.
      </p>
    </div>
  );
}
