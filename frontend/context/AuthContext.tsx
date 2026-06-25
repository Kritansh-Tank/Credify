'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getUser, clearAuth, User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    setIsLoading(false);
  }, []);

  const logout = () => {
    clearAuth();
    setUser(null);
    // Clear the token cookie used by proxy.ts
    document.cookie = 'token=; path=/; max-age=0';
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
