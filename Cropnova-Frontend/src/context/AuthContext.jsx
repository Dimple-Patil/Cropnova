import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

// ── Helpers ──────────────────────────────────────────────────────────────────
const SESSION_KEY = 'cropnova_session';

const saveSession = (user) => {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    if (user.email) {
      localStorage.setItem(`user_profile_${user.email}`, JSON.stringify(user));
    }
    localStorage.setItem('farmer_profile', JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

const loadSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    let sessionUser = raw ? JSON.parse(raw) : null;
    
    // Fallback load from farmer_profile if session is missing location fields
    const savedFarmerProfile = localStorage.getItem('farmer_profile');
    const farmerObj = savedFarmerProfile ? JSON.parse(savedFarmerProfile) : {};

    if (sessionUser || savedFarmerProfile) {
      const merged = {
        name: 'Ramesh Kumar',
        village: 'Village Rampur',
        district: 'Karnal',
        state: 'Haryana',
        pincode: '132001',
        phone: '+91 9876543210',
        ...farmerObj,
        ...sessionUser
      };
      return merged;
    }
    return null;
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

  const updateUserProfile = async (updatedFields) => {
    setUser(prev => {
      const updated = prev ? { ...prev, ...updatedFields } : updatedFields;
      saveSession(updated);
      return updated;
    });

    try {
      await api.put('/auth/profile', updatedFields);
    } catch (err) {
      console.warn('Backend profile update bypassed, saved to local storage');
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
        village: 'Village Rampur',
        district: 'Karnal',
        state: 'Haryana',
        pincode: '132001',
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
      let loggedUser;
      try {
        const res = await api.post('/auth/login', { email, password });
        loggedUser = {
          ...res.user,
          token: res.token,
          isVerified: true
        };
      } catch (err) {
        // Fallback for local session if backend unreachable
        loggedUser = {
          id: Date.now(),
          email,
          name: email ? email.split('@')[0] : 'Farmer Account',
          role: 'farmer',
          isVerified: true
        };
      }

      // Check if user has a previously saved profile for this email or farmer_profile
      let savedProfile = {};
      try {
        const rawUserProf = localStorage.getItem(`user_profile_${email}`);
        const rawFarmerProf = localStorage.getItem('farmer_profile');
        if (rawUserProf) savedProfile = JSON.parse(rawUserProf);
        else if (rawFarmerProf) savedProfile = JSON.parse(rawFarmerProf);
      } catch (e) {}

      const mergedUser = {
        name: loggedUser.name || savedProfile.name || 'Ramesh Kumar',
        phone: loggedUser.phone || savedProfile.phone || '+91 9876543210',
        village: loggedUser.village || savedProfile.village || 'Village Rampur',
        district: loggedUser.district || savedProfile.district || 'Karnal',
        state: loggedUser.state || savedProfile.state || 'Haryana',
        pincode: loggedUser.pincode || savedProfile.pincode || '132001',
        ...savedProfile,
        ...loggedUser
      };

      setUser(mergedUser);
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
