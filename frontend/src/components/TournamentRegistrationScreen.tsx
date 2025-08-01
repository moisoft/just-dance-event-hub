import React from 'react';
import { Tournament, User } from '../types';

interface TournamentRegistrationScreenProps {
  tournament: Tournament;
  user: User;
  onRegister: (tournamentId: string) => void;
  onBack: () => void;
}

const TournamentRegistrationScreen: React.FC<TournamentRegistrationScreenProps> = ({
  tournament,
  user,
  onRegister,
  onBack,
}) => {
  const isRegistered = tournament.registered_players.includes(user.id);

  const handleRegister = () => {
    if (!isRegistered) {
      onRegister(tournament.id);
    } else {
      alert('Você já está registrado neste torneio!');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open for Registration':
        return '🟢';
      case 'Coming Soon':
        return '🟡';
      case 'Closed':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open for Registration':
        return 'text-green-400';
      case 'Coming Soon':
        return 'text-yellow-400';
      case 'Closed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
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
        <div className="max-w-lg mx-auto">
          {/* Main Card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-center transform hover:scale-[1.02] transition-all duration-500">
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-6 shadow-2xl">
                <span className="text-3xl">🏆</span>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Registrar para Torneio
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mx-auto"></div>
            </div>

            {/* Tournament Info */}
            <div className="mb-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                <h3 className="text-2xl font-bold text-white mb-4">{tournament.name}</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-lg">{getStatusIcon(tournament.status)}</span>
                    <span className="text-sm font-medium text-white/70">Status:</span>
                    <span className={`font-bold ${getStatusColor(tournament.status)}`}>
                      {tournament.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-lg">📅</span>
                    <span className="text-sm font-medium text-white/70">Início:</span>
                    <span className="font-bold text-white">
                      {new Date(tournament.start_time).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-lg">👥</span>
                    <span className="text-sm font-medium text-white/70">Inscritos:</span>
                    <span className="font-bold text-cyan-400">
                      {tournament.registered_players.length} jogadores
                    </span>
                  </div>
                </div>
              </div>

              {/* Registration Status */}
              {isRegistered && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">✅</span>
                    <span className="text-green-400 text-lg font-bold">
                      Você já está registrado!
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {!isRegistered && (
                <button
                  onClick={handleRegister}
                  disabled={tournament.status !== 'Open for Registration'}
                  className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    tournament.status === 'Open for Registration'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white hover:shadow-2xl'
                      : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-lg">
                      {tournament.status === 'Open for Registration' ? '🚀' : '🔒'}
                    </span>
                    {tournament.status === 'Open for Registration' ? 'Confirmar Inscrição' : 'Inscrições Fechadas'}
                  </span>
                </button>
              )}

              <button
                onClick={onBack}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-lg">←</span>
                  Voltar para Competições
                </span>
              </button>
            </div>
          </div>

          {/* User Info Card */}
          <div className="mt-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-lg">👤</span>
              </div>
              <div className="text-center">
                <p className="text-white/70 text-sm">Registrando como</p>
                <p className="text-white font-bold">{user.nickname}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentRegistrationScreen;