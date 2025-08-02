import React, { useState } from 'react';
import { User } from '../types';

interface SettingsScreenProps {
  user: User;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ user }) => {
  const [rewardCode, setRewardCode] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [language, setLanguage] = useState('pt-BR');

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
    <div className="min-h-screen relative overflow-y-auto overflow-x-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-pink-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        <div className="absolute bottom-20 right-10 w-18 h-18 bg-blue-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 pt-16 pb-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-6 shadow-2xl">
              <span className="text-3xl">⚙️</span>
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Configurações
            </h2>
            <p className="text-white/70 text-lg">
              Personalize sua experiência no Just Dance Hub
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Section */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Perfil</h3>
                  <p className="text-white/70">Gerencie suas informações pessoais</p>
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                <p className="text-lg text-white/90">
                  Olá, <span className="font-bold text-cyan-400">{user.nickname}</span>! 👋
                </p>
                <p className="text-white/60 text-sm mt-1">
                  Papel: <span className="capitalize font-medium">{user.papel}</span>
                </p>
              </div>
              
              <button
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                onClick={() => alert('Navegar para tela de edição de perfil (simulado)')}
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-lg">✏️</span>
                  Editar Perfil
                </span>
              </button>
            </div>

            {/* Reward Code Section */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">🎁</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Resgatar Recompensa</h3>
                  <p className="text-white/70">Insira códigos para ganhar prêmios</p>
                </div>
              </div>
              
              <form onSubmit={handleRedeemCode} className="space-y-4">
                <div>
                  <label htmlFor="rewardCode" className="block text-white/80 text-sm font-medium mb-2">
                    Código de Recompensa
                  </label>
                  <input
                    type="text"
                    id="rewardCode"
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                    placeholder="Insira o código de recompensa"
                    value={rewardCode}
                    onChange={(e) => setRewardCode(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-lg">🚀</span>
                    Resgatar Código
                  </span>
                </button>
              </form>
            </div>

            {/* App Settings Section */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">🔧</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Preferências do App</h3>
                  <p className="text-white/70">Customize sua experiência</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Notifications Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🔔</span>
                    <div>
                      <p className="text-white font-medium">Notificações</p>
                      <p className="text-white/60 text-sm">Receber alertas de torneios</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                      notifications ? 'bg-green-500' : 'bg-gray-500'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                        notifications ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    ></div>
                  </button>
                </div>

                {/* Sound Effects Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🔊</span>
                    <div>
                      <p className="text-white font-medium">Efeitos Sonoros</p>
                      <p className="text-white/60 text-sm">Sons da interface</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSoundEffects(!soundEffects)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                      soundEffects ? 'bg-green-500' : 'bg-gray-500'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                        soundEffects ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    ></div>
                  </button>
                </div>

                {/* Language Selection */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg">🌍</span>
                    <div>
                      <p className="text-white font-medium">Idioma</p>
                      <p className="text-white/60 text-sm">Selecione seu idioma preferido</p>
                    </div>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 backdrop-blur-sm"
                  >
                    <option value="pt-BR" className="bg-gray-800">Português (Brasil)</option>
                    <option value="en-US" className="bg-gray-800">English (US)</option>
                    <option value="es-ES" className="bg-gray-800">Español</option>
                  </select>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <h4 className="text-lg font-bold text-white mb-2">Just Dance Event Hub</h4>
              <p className="text-white/60 text-sm mb-2">Versão 1.0.0</p>
              <p className="text-white/50 text-xs">
                Desenvolvido com ❤️ para a comunidade Just Dance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;