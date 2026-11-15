import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, api, getToken, clearToken, setToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (correo: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isJefatura: boolean;
  isColaborador: boolean;
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

  const login = async (correo: string, pass: string) => {
    const res = await api.login(correo, pass);
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    clearToken();
    setUser(null);
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
