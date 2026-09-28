import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setApiToken } from '../utils/api';

const AuthContext = createContext();

// ── Helpers ──────────────────────────────────────────────────────────────────
const saveSession = (user) => {
  if (user) {
    localStorage.setItem('cropnova-session', JSON.stringify(user));
  } else {
    localStorage.removeItem('cropnova-session');
  }
};

const loadSession = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('cropnova-session') || 'null');
    return saved?.token ? saved : null;
  } catch {
    return null;
  }
};

// ── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUserRaw]          = useState(() => loadSession());
  const [theme, setTheme]           = useState('light');

  useEffect(() => {
    setApiToken(user?.token || null);
  }, [user]);

  // Sync user to localStorage on every change
  const setUser = (u) => {
    setUserRaw(u);
    saveSession(u);
    if (u && u.token) {
      setApiToken(u.token);
    } else {
      setApiToken(null);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const updateUserProfile = async (updatedFields) => {
    try {
      await api.put('/auth/profile', updatedFields);
      // Only update local state if backend update succeeds
      setUser(prev => {
        const updated = prev ? { ...prev, ...updatedFields } : updatedFields;
        return updated;
      });
      return true;
    } catch (err) {
      console.error('Failed to update profile on backend:', err);
      alert('Failed to update profile: ' + err.message);
      return false;
    }
  };

  const registerUser = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      setUser({ ...res.user, token: res.token, isVerified: true });
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const loggedUser = {
        ...res.user,
        token: res.token,
        isVerified: true
      };

      setUser(loggedUser);
      return true;
    } catch (err) {
      console.error('Login failed (backend might be down or invalid credentials):', err);
      alert('Login failed: ' + (err.message || 'Database might be down.'));
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, registerUser, updateUserProfile, login, logout, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
