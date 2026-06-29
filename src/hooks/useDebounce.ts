import { useState, useEffect } from 'react';

/**
 * useDebounce — retarde la mise à jour d'une valeur.
 *
 * @param value  La valeur à surveiller (ex: texte d'un champ de recherche)
 * @param delay  Délai en ms avant que la valeur "debouncée" soit mise à jour (défaut: 300ms)
 * @returns      La valeur retardée
 *
 * @example
 * const [query, setQuery] = useState('');
 * const debouncedQuery = useDebounce(query, 400);
 *
 * useEffect(() => {
 *   // N'est déclenché que 400ms après la dernière frappe
 *   fetchResults(debouncedQuery);
 * }, [debouncedQuery]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
