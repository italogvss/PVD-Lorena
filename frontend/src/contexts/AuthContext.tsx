import { createContext, FC, ReactNode, useEffect, useState } from 'react';
import authService from '../services/authService';
import type { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isLoading: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
      console.log(user)
  }, []);

  const login = async (username: string, password: string) => {
    await authService.login({ username, password });
    const me = await authService.me();
    setUser(me);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'Admin', isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
