import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService } from '../services/supabaseService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  refreshToken: (refreshToken: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

interface SupabaseAuthProviderProps {
  children: ReactNode;
}

export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há uma sessão ativa
    const getInitialSession = async () => {
      try {
        const { user } = await AuthService.getCurrentUser();
        if (user) {
          setUser({
            id: user.id,
            email: user.email || '',
            nickname: user.user_metadata?.['nickname'],
            papel: user.user_metadata?.['papel'],
            xp: user.user_metadata?.['xp'] || 0,
            nivel: user.user_metadata?.['nivel'] || 1,
            is_super_admin: user.user_metadata?.['is_super_admin'] || false,
            avatar_ativo_url: user.user_metadata?.['avatar_ativo_url'] || ''
          });
        }
      } catch (error) {
        console.error('Erro ao obter sessão inicial:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escutar mudanças no estado de autenticação
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            nickname: session.user.user_metadata?.nickname,
            papel: session.user.user_metadata?.papel,
            xp: session.user.user_metadata?.xp || 0,
            nivel: session.user.user_metadata?.nivel || 1,
            is_super_admin: session.user.user_metadata?.is_super_admin || false,
            avatar_ativo_url: session.user.user_metadata?.avatar_ativo_url || ''
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await AuthService.signUp(email, password, metadata);
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await AuthService.signIn(email, password);
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const refreshToken = async (refreshToken: string) => {
    try {
      const { data, error } = await AuthService.updateProfile({});
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
