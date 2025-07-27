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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
  };

  const simulateLogin = async (role: 'jogador' | 'staff' | 'admin') => {
    // This function is for simulation purposes and will be removed once backend is fully integrated.
    // For now, it will attempt to log in with a predefined user for the given role.
    const mockUserCredentials = {
      jogador: { email: 'player@example.com', password: 'password' },
      staff: { email: 'staff@example.com', password: 'password' },
      admin: { email: 'admin@example.com', password: 'password' },
    };

    const credentials = mockUserCredentials[role];
    if (credentials) {
      try {
        const response = await authApi.login(credentials);
        if (response.success && response.data) {
          onLogin(response.data as User);
        } else {
          alert(response.error || `Failed to simulate login for ${role}`);
        }
      } catch (error: any) {
        alert(error.message || 'An unexpected error occurred during simulation');
      }
    } else {
      alert(`No mock credentials found for role: ${role}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-purple-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-purple-700">
        <h2 className="text-3xl font-bold text-center mb-6 text-pink-400">
          {isLogin ? 'Login' : 'Cadastre-se'}
        </h2>

        <div className="flex justify-center mb-6">
          <button
            className={`px-6 py-2 rounded-l-lg text-lg font-semibold transition-colors duration-300
              ${isLogin ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`px-6 py-2 rounded-r-lg text-lg font-semibold transition-colors duration-300
              ${!isLogin ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={() => setIsLogin(false)}
          >
            Cadastre-se
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
              Email:
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border border-gray-700 rounded w-full py-3 px-4 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              Senha:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border border-gray-700 rounded w-full py-3 px-4 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="nickname">
                Apelido:
              </label>
              <input
                type="text"
                id="nickname"
                className="shadow appearance-none border border-gray-700 rounded w-full py-3 px-4 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-900"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 text-lg"
          >
            {isLogin ? 'Entrar' : 'Registrar'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-3">Ou simule o login como:</p>
          <div className="flex justify-around space-x-2">
            <button
              onClick={() => simulateLogin('jogador')}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors duration-300"
            >
              Jogador
            </button>
            <button
              onClick={() => simulateLogin('staff')}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors duration-300"
            >
              Staff
            </button>
            <button
              onClick={() => simulateLogin('admin')}
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors duration-300"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;