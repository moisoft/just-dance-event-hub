import React, { useState } from 'react';
import TeamManagement from './teams/TeamManagement';

interface TeamHubScreenProps {
  onBack: () => void;
}

const TeamHubScreen: React.FC<TeamHubScreenProps> = ({ onBack }) => {
  // Mock data - in a real app, these would come from props or context
  const eventId = 1; // This should come from the current event context
  const userId = 1; // This should come from the current user context
  const userRole = 'jogador'; // This should come from the current user context

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        </div>
        
        {/* Floating Elements - Responsive sizes */}
        <div className="absolute top-10 xs:top-15 sm:top-20 left-5 xs:left-8 sm:left-10 w-12 xs:w-16 sm:w-20 h-12 xs:h-16 sm:h-20 bg-pink-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
        <div className="absolute top-20 xs:top-30 sm:top-40 right-5 xs:right-10 sm:right-20 w-10 xs:w-12 sm:w-16 h-10 xs:h-12 sm:h-16 bg-cyan-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
        <div className="absolute bottom-20 xs:bottom-30 sm:bottom-40 left-5 xs:left-10 sm:left-20 w-14 xs:w-18 sm:w-24 h-14 xs:h-18 sm:h-24 bg-purple-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        <div className="absolute bottom-10 xs:bottom-15 sm:bottom-20 right-5 xs:right-8 sm:right-10 w-10 xs:w-14 sm:w-18 h-10 xs:h-14 sm:h-18 bg-blue-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}></div>
      </div>

      {/* Content - Responsive padding */}
      <div className="relative z-10 p-3 xs:p-4 pt-10 xs:pt-12 sm:pt-16 pb-12 xs:pb-16 sm:pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header - Responsive sizes */}
          <div className="text-center mb-6 xs:mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-16 xs:w-18 sm:w-20 h-16 xs:h-18 sm:h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-4 xs:mb-5 sm:mb-6 shadow-2xl">
              <span className="text-2xl xs:text-2xl sm:text-3xl">👥</span>
            </div>
            <h2 className="text-3xl xs:text-4xl sm:text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2 xs:mb-3 sm:mb-4">
              Hub da Equipe
            </h2>
            <p className="text-white/70 text-sm xs:text-base sm:text-lg">
              Organize suas danças em grupo e forme a equipe perfeita!
            </p>
          </div>

          {/* Back Button - Responsive padding */}
          <div className="mb-4 xs:mb-5 sm:mb-6">
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-2 xs:py-2.5 sm:py-3 px-4 xs:px-5 sm:px-6 rounded-lg xs:rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-sm xs:text-base"
            >
              <span className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
                <span className="text-base xs:text-lg">⬅️</span>
                Voltar
              </span>
            </button>
          </div>

          {/* Team Management Component - Responsive padding */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 shadow-2xl">
            <TeamManagement 
              eventId={eventId}
              userId={userId}
              userRole={userRole}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamHubScreen;