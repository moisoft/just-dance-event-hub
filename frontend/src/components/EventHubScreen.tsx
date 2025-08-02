import React, { useState } from 'react';
import { User } from '../types';

interface EventHubScreenProps {
  user: User;
  onEnterEvent: (eventCode: string) => void;
}

const EventHubScreen: React.FC<EventHubScreenProps> = ({ user, onEnterEvent }) => {
  const [eventCode, setEventCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventCode.trim()) {
      onEnterEvent(eventCode);
    } else {
      alert('Por favor, insira um código de evento.');
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
        <div className="absolute top-10 xs:top-20 left-5 xs:left-10 w-12 xs:w-16 sm:w-20 h-12 xs:h-16 sm:h-20 bg-pink-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
        <div className="absolute top-20 xs:top-30 sm:top-40 right-10 xs:right-15 sm:right-20 w-10 xs:w-12 sm:w-16 h-10 xs:h-12 sm:h-16 bg-cyan-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
        <div className="absolute bottom-20 xs:bottom-30 sm:bottom-40 left-10 xs:left-15 sm:left-20 w-14 xs:w-18 sm:w-24 h-14 xs:h-18 sm:h-24 bg-purple-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        <div className="absolute bottom-10 xs:bottom-15 sm:bottom-20 right-5 xs:right-8 sm:right-10 w-12 xs:w-14 sm:w-18 h-12 xs:h-14 sm:h-18 bg-blue-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-3 xs:p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6 xs:mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-4 xs:mb-5 sm:mb-6 shadow-2xl">
              <span className="text-2xl xs:text-2xl sm:text-3xl">🎉</span>
            </div>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2 xs:mb-3 sm:mb-4">
              Bem-vindo, {user.nickname}!
            </h2>
            <p className="text-white/70 text-base xs:text-lg">
              Insira o código do evento para começar a dançar!
            </p>
          </div>

          {/* Event Code Form */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl xs:rounded-2xl p-4 xs:p-6 sm:p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4 xs:space-y-5 sm:space-y-6">
              <div>
                <label htmlFor="eventCode" className="block text-white/80 text-xs xs:text-sm font-medium mb-2 xs:mb-3">
                  Código do Evento
                </label>
                <input
                  type="text"
                  id="eventCode"
                  className="w-full bg-white/10 border border-white/20 rounded-lg xs:rounded-xl py-3 xs:py-3.5 sm:py-4 px-3 xs:px-3.5 sm:px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 text-center text-xl xs:text-xl sm:text-2xl uppercase tracking-wider font-bold"
                  placeholder="DIGITE O CÓDIGO"
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  required
                />
                <p className="text-white/50 text-xs mt-2 text-center">
                  O código do evento será fornecido pelo organizador
                </p>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 xs:py-3.5 sm:py-4 px-3 xs:px-3.5 sm:px-4 rounded-lg xs:rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-base xs:text-lg sm:text-xl"
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-xl xs:text-xl sm:text-2xl">🚀</span>
                  Entrar no Evento
                </span>
              </button>
            </form>

            {/* Quick Info */}
            <div className="mt-6 xs:mt-7 sm:mt-8 pt-4 xs:pt-5 sm:pt-6 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:gap-4 text-center">
                <div className="bg-white/5 rounded-lg xs:rounded-xl p-2 xs:p-2.5 sm:p-3">
                  <div className="text-xl xs:text-xl sm:text-2xl mb-0.5 xs:mb-1">🎵</div>
                  <div className="text-white/70 text-sm font-medium">Músicas</div>
                  <div className="text-white/50 text-xs">Ilimitadas</div>
                </div>
                <div className="bg-white/5 rounded-lg xs:rounded-xl p-2 xs:p-2.5 sm:p-3">
                  <div className="text-xl xs:text-xl sm:text-2xl mb-0.5 xs:mb-1">🏆</div>
                  <div className="text-white/70 text-sm font-medium">Competições</div>
                  <div className="text-white/50 text-xs">Disponíveis</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-4 xs:mt-6 sm:mt-8">
            <p className="text-white/40 text-sm">
              Desenvolvido com ❤️ para a comunidade Just Dance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventHubScreen;