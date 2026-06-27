'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { connexionAction } from '../actions';

export default function ConnexionPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);

    startTransition(async () => {
      const result = await connexionAction({ email, password });
      // Si on arrive ici, c'est qu'il y a eu une erreur (redirect est géré côté serveur)
      if (result?.error) {
        setErreur(result.error);
      }
    });
  };

  const inputStyle = {
    background: 'var(--bg3)',
    border: '1px solid var(--border2)',
    color: 'var(--text)',
  };

  return (
    <div>
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl mb-4"
          style={{ background: 'var(--amber)', color: 'var(--bg)' }}
        >
          T
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Bon retour
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
          Connectez-vous à votre espace TAAMA
        </p>
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
        {/* Bandeau d'erreur */}
        {erreur && (
          <div
            className="flex items-start gap-3 p-3 rounded-xl mb-5 text-sm"
            style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', color: 'var(--red)' }}
          >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{erreur}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
              Email professionnel
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@entreprise.bf"
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--amber)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border2)')}
            />
          </div>

          {/* Mot de passe */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
                Mot de passe
              </label>
              <a href="#" className="text-xs transition-colors" style={{ color: 'var(--amber)' }}>
                Oublié ?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--amber)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border2)')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--text3)' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Bouton submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed taama-btn-primary"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Connexion en cours…
              </>
            ) : (
              <>
                Se connecter
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--text3)' }}>ou</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        <p className="text-center text-sm" style={{ color: 'var(--text2)' }}>
          Pas encore de compte ?{' '}
          <Link href="/inscription" className="font-semibold" style={{ color: 'var(--amber)' }}>
            Créer un compte gratuit
          </Link>
        </p>
      </div>

      <p className="text-center text-xs mt-6" style={{ color: 'var(--text3)' }}>
        TAAMA · Ouagadougou, Burkina Faso
      </p>
    </div>
  );
}
