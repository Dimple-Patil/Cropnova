import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * usePersistedState
 * Works like useState, but automatically saves/loads from localStorage
 * keyed per logged-in user so each farmer's data is isolated.
 *
 * Usage:
 *   const [crops, setCrops] = usePersistedState('crops', []);
 */
export const usePersistedState = (key, defaultValue) => {
  const { user } = useAuth();
  const storageKey = user?.id ? `cropnova_${user.id}_${key}` : null;

  const [state, setStateRaw] = useState(() => {
    if (!storageKey) return defaultValue;
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  // Reload from localStorage whenever the logged-in user changes (e.g. after logout→login)
  useEffect(() => {
    if (!storageKey) {
      setStateRaw(defaultValue);
      return;
    }
    try {
      const saved = localStorage.getItem(storageKey);
      setStateRaw(saved ? JSON.parse(saved) : defaultValue);
    } catch {
      setStateRaw(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Persist on every change
  const setState = (valueOrUpdater) => {
    setStateRaw(prev => {
      const next = typeof valueOrUpdater === 'function' ? valueOrUpdater(prev) : valueOrUpdater;
      if (storageKey) {
        try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      }
      return next;
    });
  };

  return [state, setState];
};
