import React, { useEffect, useState } from 'react';
import { Tournament } from '../types';

interface RegistrationConfirmationScreenProps {
  tournament: Tournament;
  onBackToCompetitions: () => void;
}

const RegistrationConfirmationScreen: React.FC<RegistrationConfirmationScreenProps> = ({
  tournament,
  onBackToCompetitions,
}) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

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

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-4 pt-16 pb-20">
        <div className="max-w-lg mx-auto">
          {/* Success Card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-center transform hover:scale-[1.02] transition-all duration-500">
            {/* Success Animation */}
            <div className="mb-8">
              <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                  <span className="text-4xl animate-bounce">✅</span>
                </div>
              </div>
              
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                Inscrição Confirmada!
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mx-auto"></div>
            </div>

            {/* Success Message */}
            <div className="mb-8">
              <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-6 mb-6">
                <p className="text-white/90 text-lg mb-4">
                  🎉 Parabéns! Você se registrou com sucesso para o torneio:
                </p>
                <h3 className="text-2xl font-bold text-white mb-4">{tournament.name}</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-lg">📅</span>
                    <span className="text-sm font-medium text-white/70">Início do torneio:</span>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <span className="font-bold text-cyan-400 text-lg">
                      {new Date(tournament.start_time).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-white mb-3">📋 Próximos Passos:</h4>
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-green-400">•</span>
                    <span className="text-white/80 text-sm">Chegue 15 minutos antes do início</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-400">•</span>
                    <span className="text-white/80 text-sm">Prepare-se para mostrar suas habilidades</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-400">•</span>
                    <span className="text-white/80 text-sm">Boa sorte e divirta-se!</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onBackToCompetitions}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="text-lg">🏆</span>
                Voltar para Competições
              </span>
            </button>
          </div>

          {/* Motivational Quote */}
          <div className="mt-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-white/70 text-sm italic">
              "O sucesso é a soma de pequenos esforços repetidos dia após dia."
            </p>
            <p className="text-white/50 text-xs mt-1">- Robert Collier</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationConfirmationScreen;