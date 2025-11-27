"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: number;
  email?: string;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verifica se há um token válido e busca dados do usuário
  const checkAuth = async () => {
    try {
      // Chama a rota /api/auth/me que retorna os dados do usuário autenticado
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUser({
          id: data.id,
          email: data.email,
          name: data.nome,
        });
      } else {
        // Se não autorizado ou qualquer outro erro, usuário não está autenticado
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Chama a rota de logout no backend que remove o cookie HttpOnly
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      // Limpa o estado local
      setUser(null);
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
      // Mesmo com erro, limpa o estado local
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
