import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, api, getToken, clearToken, setToken } from '../api/client';
import { useSessionTimeout } from '../hooks/useSessionTimeout';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (correo: string, pass: string) => Promise<void>;
  logout: (reason?: string) => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isJefatura: boolean;
  isColaborador: boolean;
  timeoutMinutes: number;
  setTimeoutMinutes: (m: number) => void;
  refreshTimeoutConfig: () => Promise<void>;
  showWarning: boolean;
  secondsRemaining: number;
  extendSession: () => void;
  resetActivity: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      if (getToken()) {
        const u = await api.getMe();
        setUser(u);
      } else {
        setUser(null);
      }
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = useCallback((reason?: string) => {
    clearToken();
    setUser(null);
    if (reason) {
      sessionStorage.setItem('inactivity_logout', reason);
    } else {
      sessionStorage.removeItem('inactivity_logout');
    }
  }, []);

  const {
    timeoutMinutes,
    setTimeoutMinutes,
    refreshTimeoutConfig,
    showWarning,
    secondsRemaining,
    extendSession,
    resetActivity,
  } = useSessionTimeout(Boolean(user), logout);

  const login = async (correo: string, pass: string) => {
    sessionStorage.removeItem('inactivity_logout');
    const res = await api.login(correo, pass);
    setToken(res.access_token);
    resetActivity();
    setUser(res.user);
    sessionStorage.removeItem('inactivity_logout');
  };

  const roleName = user?.rol?.nombre;
  const isAdmin = roleName === 'Administrador';
  const isJefatura = roleName === 'Jefatura' || isAdmin;
  const isColaborador = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        isAdmin,
        isJefatura,
        isColaborador,
        timeoutMinutes,
        setTimeoutMinutes,
        refreshTimeoutConfig,
        showWarning,
        secondsRemaining,
        extendSession,
        resetActivity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
