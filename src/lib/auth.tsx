'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  _id: string;
  email: string;
  name?: string;
  subscriptionStatus?: 'free' | 'pro_monthly' | 'pro_lifetime';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isPro: boolean;
  login: (email: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('gardengrid_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('gardengrid_user');
      }
    }
    setIsLoading(false);
  }, []);

  const refreshUser = async () => {
    const stored = localStorage.getItem('gardengrid_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  };

  const login = async (email: string, name?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      if (!response.ok) throw new Error('Login failed');
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('gardengrid_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gardengrid_user');
  };

  const isPro = user?.subscriptionStatus === 'pro_monthly' || user?.subscriptionStatus === 'pro_lifetime';

  return (
    <AuthContext.Provider value={{ user, isLoading, isPro, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
