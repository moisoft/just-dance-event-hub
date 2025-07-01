import React, { useState } from 'react';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // true para Entrar, false para Criar Conta

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode adicionar a lógica para enviar os dados para o backend
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Modo:', isLogin ? 'Entrar' : 'Criar Conta');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="bg-[#1e293b] rounded-lg p-8 w-full max-w-md shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="bg-pink-600 rounded-full p-4">
            <span className="text-white text-2xl font-bold">-</span>
          </div>
        </div>
        <h1 className="text-white text-3xl font-bold text-center mb-2">Just Dance Hub</h1>
        <p className="text-cyan-500 text-center mb-6">Sua Fila. Seu Progresso. Sua Pista de Dança.</p>

        <div className="flex justify-center mb-6">
          <button
            className={`mr-4 pb-2 font-semibold ${isLogin ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-400'}`}
            onClick={() => setIsLogin(true)}
          >
            Entrar
          </button>
          <button
            className={`pb-2 font-semibold ${!isLogin ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-400'}`}
            onClick={() => setIsLogin(false)}
          >
            Criar Conta
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="exemplo@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 p-3 rounded bg-[#334155] text-white placeholder-gray-400 focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 p-3 rounded bg-[#334155] text-white placeholder-gray-400 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="w-full bg-pink-600 text-white font-bold py-3 rounded hover:bg-pink-700 transition-colors"
          >
            {isLogin ? 'Entrar no Ritmo!' : 'Criar Conta'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;