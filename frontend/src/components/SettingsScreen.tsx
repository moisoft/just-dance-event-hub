import React, { useState } from 'react';
import { User } from '../types';

interface SettingsScreenProps {
  user: User;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ user }) => {
  const [rewardCode, setRewardCode] = useState('');

  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (rewardCode.trim()) {
      alert(`Código de recompensa "${rewardCode}" resgatado! (Simulado)`);
      setRewardCode('');
    } else {
      alert('Por favor, insira um código de recompensa.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-4 pt-16 pb-20">
      <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-lg border border-purple-700">
        <h2 className="text-4xl font-bold text-center mb-8 text-pink-400">Configurações</h2>

        <div className="space-y-6">
          <div className="bg-gray-700 p-5 rounded-lg border border-gray-600">
            <h3 className="text-2xl font-semibold text-cyan-400 mb-3">Perfil</h3>
            <p className="text-lg mb-4">Olá, <span className="font-bold">{user.nickname}</span>!</p>
            <button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 text-lg"
              onClick={() => alert('Navegar para tela de edição de perfil (simulado)')}
            >
              Editar Perfil
            </button>
          </div>

          <div className="bg-gray-700 p-5 rounded-lg border border-gray-600">
            <h3 className="text-2xl font-semibold text-cyan-400 mb-3">Resgatar Recompensa</h3>
            <form onSubmit={handleRedeemCode} className="space-y-4">
              <div>
                <label htmlFor="rewardCode" className="sr-only">Código de Recompensa</label>
                <input
                  type="text"
                  id="rewardCode"
                  className="shadow appearance-none border border-gray-700 rounded w-full py-3 px-4 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-900"
                  placeholder="Insira o código de recompensa"
                  value={rewardCode}
                  onChange={(e) => setRewardCode(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 text-lg"
              >
                Resgatar Código
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;