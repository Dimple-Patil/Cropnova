import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setApiToken } from '../utils/api';

const AuthContext = createContext();

// ── Helpers ──────────────────────────────────────────────────────────────────
const saveSession = (user) => {
  // Session persistence removed as per requirements.
};

const loadSession = () => {
  return null;
};

// ── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUserRaw]          = useState(() => loadSession());
  const [theme, setTheme]           = useState('light');
  const [pendingOtpUser, setPendingOtpUser] = useState(null);

  // Sync user to localStorage on every change
  const setUser = (u) => {
    setUserRaw(u);
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
      
      const pending = { ...res.user, token: res.token, otpCode: '123456' };
      setPendingOtpUser(pending);
      return { success: true, requiresOtp: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const verifyOtp = (enteredOtp) => {
    if (pendingOtpUser && (enteredOtp === pendingOtpUser.otpCode || enteredOtp === '123456')) {
      const verifiedUser = {
        ...pendingOtpUser,
        isVerified: true
      };
      setUser(verifiedUser);
      setPendingOtpUser(null);
      return true;
    }
    return false;
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
    setPendingOtpUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, registerUser, verifyOtp, pendingOtpUser, updateUserProfile, login, logout, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
