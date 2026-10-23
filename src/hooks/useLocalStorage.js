import { useState } from 'react';

/**
 * Hook personalizado para sincronizar estado de React con localStorage.
 * 
 * @param {string} key - Clave en localStorage
 * @param {any} initialValue - Valor inicial por defecto si no existe la clave
 * @returns {[any, Function]} - [storedValue, setValue]
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error al leer clave "${key}" de localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (valueToStore === undefined || valueToStore === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error al guardar clave "${key}" en localStorage:`, error);
    }
  };

  return [storedValue, setValue];
}
