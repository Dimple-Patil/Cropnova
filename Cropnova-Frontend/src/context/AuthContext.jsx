import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

// ── Helpers ──────────────────────────────────────────────────────────────────
const SESSION_KEY = 'cropnova_session';

const saveSession = (user) => {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
};

const loadSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUserRaw]          = useState(() => loadSession());
  const [theme, setTheme]           = useState('light');
  const [pendingOtpUser, setPendingOtpUser] = useState(null);

  // Sync user to localStorage on every change
  const setUser = (u) => {
    setUserRaw(u);
    saveSession(u);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const updateUserProfile = (updatedFields) => {
    setUser(prev => {
      const updated = prev ? { ...prev, ...updatedFields } : updatedFields;
      // Also sync to farmer_profile key for persistence compatibility
      localStorage.setItem('farmer_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const registerUser = async (userData) => {
    try {
      // Just mock OTP for now, but really send to backend
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
      const verifiedUser = { ...pendingOtpUser, isVerified: true };
      setUser(verifiedUser); // this will save token & user to localStorage
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
      console.error(err);
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
