import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/api';

interface User {
  id: string;
  nickname: string;
  email: string;
  avatar_ativo_url?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (nickname: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token;

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          // Fetch user data
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            throw new Error('Failed to validate token');
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    validateToken();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.mockLogin({ email, password });
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Login failed');
      }
      
      // Handle different response structures
      const responseData = response.data as any;
      const newToken = responseData.token || '';
      const userData = responseData.user || responseData;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData as User);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const register = async (nickname: string, email: string, password: string) => {
    try {
      const response = await authApi.register({ nickname, email, password });
      if (!response.success) {
        throw new Error(response.error || 'Registration failed');
      }
      // After registration, we can automatically log the user in
      await login(email, password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;