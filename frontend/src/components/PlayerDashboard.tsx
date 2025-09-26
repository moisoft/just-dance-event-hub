import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useEvent } from '../contexts/EventContext';
import { useWebSocket } from '../hooks/useWebSocket';

interface PlayerDashboardProps {
  user: User;
}

const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ user }) => {
  const { state, dispatch } = useEvent();
  const { sendMessage } = useWebSocket({ 
    eventId: state.currentEvent?.id || '', 
    userRole: 'player', 
    userId: user.id 
  });
  const [tip, setTip] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [currentSong, setCurrentSong] = useState<string | null>(null);

  // Verificar posição na fila
  useEffect(() => {
    const userInQueue = state.queue.find(item => item.player?.id === user.id);
    if (userInQueue) {
      const position = state.queue.findIndex(item => item.player?.id === user.id) + 1;
      setQueuePosition(position);
      if (userInQueue.status === 'playing') {
        setCurrentSong(userInQueue.song.name);
      }
    } else {
      setQueuePosition(null);
      setCurrentSong(null);
    }
  }, [state.queue, user.id]);

  const generatePerformanceTip = async () => {
    setLoadingTip(true);
    setTip(null);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    const tips = [
      "Mantenha seus joelhos flexionados para um melhor fluxo!",
      "Use todo o seu corpo para expressar a música!",
      "Pratique as partes mais difíceis em câmera lenta primeiro!",
      "Sinta o ritmo e deixe a música te guiar!",
      "Não tenha medo de adicionar seu próprio estilo!",
      "Hidrate-se bem antes e depois de dançar!",
      "Alongue-se para evitar lesões e melhorar sua flexibilidade!",
      "Assista aos coaches para pegar os movimentos mais sutis!",
      "Divirta-se! A alegria é a chave para uma ótima performance!"
    ];
    setTip(tips[Math.floor(Math.random() * tips.length)] || null);
    setLoadingTip(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-2 xs:p-3 sm:p-4 pt-16 pb-20 relative overflow-y-auto overflow-x-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 xs:-top-30 sm:-top-40 -right-20 xs:-right-30 sm:-right-40 w-40 xs:w-60 sm:w-80 h-40 xs:h-60 sm:h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-20 xs:-bottom-30 sm:-bottom-40 -left-20 xs:-left-30 sm:-left-40 w-40 xs:w-60 sm:w-80 h-40 xs:h-60 sm:h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-20 xs:top-30 sm:top-40 left-20 xs:left-30 sm:left-40 w-40 xs:w-60 sm:w-80 h-40 xs:h-60 sm:h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 xs:mb-6 sm:mb-8">
          <div className="w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 mx-auto mb-2 xs:mb-3 sm:mb-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-1 xs:mb-2">
            Olá, {user.nickname}!
          </h2>
          <p className="text-white/70">Bem-vindo ao seu painel de dança</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4 sm:gap-6 mb-4 xs:mb-6 sm:mb-8">
          <div className="bg-white/10 backdrop-blur-lg p-3 xs:p-4 sm:p-6 rounded-xl xs:rounded-2xl shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center mb-2 xs:mb-3 sm:mb-4">
              <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg xs:rounded-xl flex items-center justify-center mr-2 xs:mr-3 sm:mr-4 shadow-lg">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-lg xs:text-xl sm:text-2xl font-semibold text-white bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Seu Desempenho</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Recorde:</span>
                <span className="font-bold text-cyan-300 text-base xs:text-lg">12,500</span>
              </div>
              <div className="text-sm text-white/60">(Blinding Lights)</div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Estrelas Totais:</span>
                <span className="font-bold text-pink-300 text-base xs:text-lg">{user.xp}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg p-3 xs:p-4 sm:p-6 rounded-xl xs:rounded-2xl shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center mb-2 xs:mb-3 sm:mb-4">
              <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg xs:rounded-xl flex items-center justify-center mr-2 xs:mr-3 sm:mr-4 shadow-lg">
                <span className="text-2xl">🎵</span>
              </div>
              <h3 className="text-lg xs:text-xl sm:text-2xl font-semibold text-white bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Fila de Dança</h3>
            </div>
            <div className="space-y-3">
              {currentSong ? (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-2 xs:p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-green-400 text-lg">🎤</span>
                    <span className="text-green-300 font-semibold text-sm xs:text-base">Sua vez!</span>
                  </div>
                  <p className="text-white text-sm">Tocando: {currentSong}</p>
                </div>
              ) : queuePosition ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Posição na Fila:</span>
                    <span className="font-bold text-purple-300 text-lg">#{queuePosition}</span>
                  </div>
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-1 xs:p-2">
                    <p className="text-blue-300 text-sm">🕐 Aguardando sua vez...</p>
                  </div>
                </>
              ) : (
                <div className="bg-gray-500/20 border border-gray-500/30 rounded-lg p-2 xs:p-3">
                  <p className="text-gray-300 text-sm">📝 Você não está na fila</p>
                  <p className="text-gray-400 text-xs mt-1">Vá para Música para se inscrever!</p>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-white/80">Próxima Música:</span>
                <span className="font-bold text-pink-300">Bad Romance</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Tips Section */}
        <div className="bg-white/10 backdrop-blur-lg p-3 xs:p-4 sm:p-6 rounded-xl xs:rounded-2xl shadow-2xl border border-white/20 mb-4 xs:mb-6 sm:mb-8">
          <div className="flex items-center mb-3 xs:mb-4 sm:mb-6">
            <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-red-600 rounded-lg xs:rounded-xl flex items-center justify-center mr-2 xs:mr-3 sm:mr-4 shadow-lg">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-semibold text-white bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">Recursos Gemini</h3>
          </div>
          <button
            onClick={generatePerformanceTip}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-2 xs:py-2.5 sm:py-3 px-3 xs:px-3.5 sm:px-4 rounded-lg xs:rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center text-base xs:text-lg shadow-lg"
            disabled={loadingTip}
          >
            {loadingTip ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 xs:mr-3 h-4 w-4 xs:h-5 xs:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gerando dica...
              </>
            ) : (
              '✨ Gerar Dica de Performance'
            )}
          </button>
          {tip && (
            <div className="mt-3 xs:mt-4 sm:mt-6 p-3 xs:p-4 bg-white/10 backdrop-blur-sm rounded-lg xs:rounded-xl border border-white/20 animate-fade-in shadow-lg">
              <p className="text-base xs:text-lg italic text-white/90">{tip}</p>
            </div>
          )}
        </div>

        {/* Most Played Songs */}
        <div className="bg-white/10 backdrop-blur-lg p-3 xs:p-4 sm:p-6 rounded-xl xs:rounded-2xl shadow-2xl border border-white/20">
          <div className="flex items-center mb-3 xs:mb-4 sm:mb-6">
            <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg xs:rounded-xl flex items-center justify-center mr-2 xs:mr-3 sm:mr-4 shadow-lg">
              <span className="text-2xl">🎶</span>
            </div>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-semibold text-white bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Músicas Mais Dançadas</h3>
          </div>
          <div className="space-y-2 xs:space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm p-2 xs:p-3 sm:p-4 rounded-lg xs:rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-lg group">
              <div className="flex items-center">
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mr-2 xs:mr-3 text-xs xs:text-sm font-bold shadow-md group-hover:scale-110 transition-transform duration-300">1</div>
                <span className="text-base xs:text-lg font-medium text-white group-hover:text-yellow-300 transition-colors duration-300">Blinding Lights</span>
              </div>
              <span className="text-cyan-300 font-semibold text-sm xs:text-base">50 vezes</span>
            </div>
            <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm p-2 xs:p-3 sm:p-4 rounded-lg xs:rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-lg group">
              <div className="flex items-center">
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mr-2 xs:mr-3 text-xs xs:text-sm font-bold shadow-md group-hover:scale-110 transition-transform duration-300">2</div>
                <span className="text-base xs:text-lg font-medium text-white group-hover:text-gray-300 transition-colors duration-300">Bad Romance</span>
              </div>
              <span className="text-cyan-300 font-semibold text-sm xs:text-base">45 vezes</span>
            </div>
            <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm p-2 xs:p-3 sm:p-4 rounded-lg xs:rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-lg group">
              <div className="flex items-center">
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-amber-600 to-yellow-700 rounded-full flex items-center justify-center mr-2 xs:mr-3 text-xs xs:text-sm font-bold shadow-md group-hover:scale-110 transition-transform duration-300">3</div>
                <span className="text-base xs:text-lg font-medium text-white group-hover:text-amber-300 transition-colors duration-300">Despacito</span>
              </div>
              <span className="text-cyan-300 font-semibold text-sm xs:text-base">30 vezes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;