import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [activeMembership, setActiveMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check current session on mount
  const checkSession = async () => {
    try {
      setLoading(true);
      const res = await api.getMe();
      setUser(res.data.user);
      setActiveMembership(res.data.activeMembership || res.data.user.memberships?.[0] || null);
      setError(null);
    } catch (err) {
      setUser(null);
      setActiveMembership(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (credentials) => {
    setError(null);
    const res = await api.login(credentials);
    setUser(res.data.user);
    setActiveMembership(res.data.user.memberships?.[0] || null);
    return res.data;
  };

  const register = async (data) => {
    setError(null);
    const res = await api.register(data);
    setUser(res.data.user);
    setActiveMembership(res.data.user.memberships?.[0] || null);
    return res.data;
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setActiveMembership(null);
    }
  };

  const switchOrganization = (orgId) => {
    if (!user) return;
    const found = user.memberships?.find((m) => m.organization?.id === orgId);
    if (found) {
      setActiveMembership(found);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeMembership,
        organization: activeMembership?.organization || null,
        role: activeMembership?.role || null,
        loading,
        error,
        login,
        register,
        logout,
        switchOrganization,
        refreshSession: checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
