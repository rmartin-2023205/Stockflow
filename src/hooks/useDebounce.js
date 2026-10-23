import { useState, useEffect } from 'react';

/**
 * Hook personalizado para retrasar la actualización de un valor (debounce).
 * Muy útil para campos de búsqueda de catálogo y POS evitando llamadas excesivas.
 * 
 * @param {any} value - El valor de entrada a retrasar
 * @param {number} delay - Milisegundos de espera (por defecto: 300ms)
 * @returns {any} - El valor retrasado
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
