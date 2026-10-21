import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('tripvault_token') || sessionStorage.getItem('tripvault_token');

    if (!token) {
      setLoading(false);
      return () => { active = false; };
    }

    api.get('/auth/me')
      .then(({ data }) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem('tripvault_token');
        sessionStorage.removeItem('tripvault_token');
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const login = useCallback(async (credentials, { remember = true } = {}) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.removeItem('tripvault_token');
    sessionStorage.removeItem('tripvault_token');
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('tripvault_token', data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (details) => {
    const { data } = await api.post('/auth/register', details);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tripvault_token');
    sessionStorage.removeItem('tripvault_token');
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
