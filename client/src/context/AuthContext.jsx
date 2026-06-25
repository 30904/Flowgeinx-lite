import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { clearSession, getAccessToken } from '../services/authToken';

const AuthContext = createContext(null);

function readStoredUser() {
  const stored = localStorage.getItem('user');
  const token = getAccessToken();
  if (!stored || !token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp || Date.now() >= payload.exp * 1000) {
      clearSession();
      return null;
    }
    return JSON.parse(stored);
  } catch {
    clearSession();
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(readStoredUser());
    setLoading(false);

    const onLogout = () => setUser(null);
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const login = async (phone, otp, email) => {
    const data = await api.verifyOtp(phone, otp, email);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const isAuthenticated = Boolean(user && getAccessToken());

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
