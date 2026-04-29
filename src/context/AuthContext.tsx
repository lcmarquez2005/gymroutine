import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { authService } from '../services/auth.service';
import { getUserMe } from '../services/user.service';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Empezamos cargando para verificar sesión

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await getUserMe();
          setUser(userData);
        } catch (error) {
          console.error("Error fetching user data on mount:", error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token, user: userData } = await authService.login(email, password);
      localStorage.setItem('token', token);
      setUser(userData);
    } catch (error) {
      setIsLoading(false);
      throw error; // Lanzamos el error para que Login.tsx lo maneje
    }
    setIsLoading(false);
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token, user: userData } = await authService.register(name, email, password);
      localStorage.setItem('token', token);
      setUser(userData);
    } catch (error) {
      setIsLoading(false);
      throw error; // Lanzamos el error para que Register.tsx lo maneje
    }
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
