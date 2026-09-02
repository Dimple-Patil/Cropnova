import React, { createContext, useContext, useState, useEffect } from 'react';

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
    setUser(prev => prev ? { ...prev, ...updatedFields } : null);
  };

  const registerUser = (userData) => {
    if (userData.role === 'admin') {
      const adminUser = { ...userData, id: `admin_${userData.email}`, isVerified: true };
      setUser(adminUser);
      return { success: true, requiresOtp: false };
    }
    const pending = { ...userData, id: `user_${userData.email}`, otpCode: '123456' };
    setPendingOtpUser(pending);
    return { success: true, requiresOtp: true };
  };

  const verifyOtp = (enteredOtp) => {
    if (pendingOtpUser && (enteredOtp === pendingOtpUser.otpCode || enteredOtp === '123456')) {
      const verifiedUser = { ...pendingOtpUser, isVerified: true };
      setUser(verifiedUser);
      setPendingOtpUser(null);
      return true;
    }
    return false;
  };

  const login = (email, password) => {
    let role = 'farmer';
    if (email.includes('admin'))  role = 'admin';
    else if (email.includes('expert')) role = 'expert';
    else if (email.includes('vendor')) role = 'vendor';

    const loggedUser = {
      id: `user_${email}`,          // Stable ID keyed to email for localStorage
      name: email.split('@')[0].toUpperCase(),
      email,
      role,
      phone: '',
      isVerified: true
    };

    setUser(loggedUser);
    return true;
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
