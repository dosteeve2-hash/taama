'use client';

import { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  /** Valeur courante du champ */
  value: string;
  /** Callback appelé à chaque changement */
  onChange: (value: string) => void;
  /** Texte placeholder */
  placeholder?: string;
  /** Focalise automatiquement le champ au montage */
  autoFocus?: boolean;
  /** Classes CSS additionnelles sur le conteneur */
  className?: string;
  /** Afficher le compteur de résultats (ex: "12 résultats") */
  resultCount?: number;
}

/**
 * SearchInput — champ de recherche réutilisable avec bouton d'effacement,
 * icône de loupe et compteur de résultats optionnel.
 *
 * Supporte le raccourci clavier Escape pour vider la recherche.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Rechercher…',
  autoFocus = false,
  className = '',
  resultCount,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onChange('');
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Icône loupe */}
      <Search
        size={15}
        className="absolute left-3 pointer-events-none"
        style={{ color: 'var(--text3)' }}
        aria-hidden="true"
      />

      {/* Champ texte */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full py-2.5 pl-9 pr-9 rounded-xl text-sm outline-none transition-all"
        style={{
          background: 'var(--bg3)',
          border: '1px solid var(--border2)',
          color: 'var(--text)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--amber)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border2)';
        }}
      />

      {/* Bouton effacer (visible si valeur non vide) */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Effacer la recherche"
          className="absolute right-2.5 p-0.5 rounded-md transition-opacity hover:opacity-70"
          style={{ color: 'var(--text3)' }}
        >
          <X size={14} />
        </button>
      )}

      {/* Compteur de résultats */}
      {resultCount !== undefined && value && (
        <span
          className="absolute -bottom-5 left-0 text-xs"
          style={{ color: 'var(--text3)' }}
          aria-live="polite"
          aria-atomic="true"
        >
          {resultCount === 0
            ? 'Aucun résultat'
            : `${resultCount} résultat${resultCount > 1 ? 's' : ''}`}
        </span>
      )}
    </div>
  );
}
