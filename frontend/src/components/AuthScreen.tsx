import React, { useState } from 'react';
import { User } from '../types';
import { authApi } from '../api/api';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let response;
      if (isLogin) {
        response = await authApi.login({ email, password });
      } else {
        response = await authApi.register({ email, password, nickname });
      }

      if (response.success && response.data) {
        onLogin(response.data as User);
      } else {
        alert(response.error || 'Authentication failed');
      }
    } catch (error: any) {
      alert(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const simulateLogin = async (role: 'jogador' | 'staff' | 'admin') => {
    console.log(`Iniciando simulação de login para: ${role}`);
    setIsLoading(true);
    const mockUserCredentials = {
      jogador: { email: 'player1@test.com', password: '123456' },
      staff: { email: 'staff@justdancehub.com', password: '123456' },
      admin: { email: 'admin@justdancehub.com', password: '123456' },
    };

    const credentials = mockUserCredentials[role];
    if (credentials) {
      try {
        console.log(`Fazendo requisição para login mock`);
        const response = await authApi.mockLogin(credentials);
        console.log('Resposta da API:', response);
        
        if (response.success && response.data) {
          console.log('Chamando onLogin com usuário:', response.data);
          onLogin(response.data as User);
        } else {
          console.error('Falha no login:', response.error);
          alert(response.error || `Failed to simulate login for ${role}`);
        }
      } catch (error: any) {
        console.error('Erro durante simulação:', error);
        alert(error.message || 'An unexpected error occurred during simulation');
      } finally {
        setIsLoading(false);
      }
    } else {
      alert(`No mock credentials found for role: ${role}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Just Dance Hub
          </h2>
          <p className="text-white/70 mt-2">
            {isLogin ? 'Bem-vindo de volta!' : 'Junte-se à comunidade!'}
          </p>
        </div>

        <div className="flex bg-white/10 rounded-xl p-1 mb-6">
          <button
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
              isLogin 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            onClick={() => setIsLogin(true)}
            disabled={isLoading}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
              !isLogin 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            onClick={() => setIsLogin(false)}
            disabled={isLoading}
          >
            Cadastre-se
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-white/80 text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-white/80 text-sm font-medium" htmlFor="password">
              Senha
            </label>
            <input
              type="password"
              id="password"
              className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          {!isLogin && (
            <div className="space-y-2">
              <label className="block text-white/80 text-sm font-medium" htmlFor="nickname">
                Apelido
              </label>
              <input
                type="text"
                id="nickname"
                className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                placeholder="Seu apelido"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </>
            ) : (
              isLogin ? 'Entrar' : 'Criar Conta'
            )}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/10 text-white/70 rounded-full backdrop-blur-sm">Acesso Rápido</span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-3">
            <button
              onClick={() => simulateLogin('jogador')}
              disabled={isLoading}
              className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <span className="relative z-10 text-xs">🎮 Jogador</span>
            </button>
            <button
              onClick={() => simulateLogin('staff')}
              disabled={isLoading}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <span className="relative z-10 text-xs">👥 Staff</span>
            </button>
            <button
              onClick={() => simulateLogin('admin')}
              disabled={isLoading}
              className="group relative overflow-hidden bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <span className="relative z-10 text-xs">⚡ Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;