import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * usePersistedState
 * Previously saved/loaded from localStorage. Now it just acts as a regular useState
 * since localStorage usage was removed as per requirements.
 */
export const usePersistedState = (key, defaultValue) => {
  const [state, setState] = useState(defaultValue);

  return [state, setState];
};
