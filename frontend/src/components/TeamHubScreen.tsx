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
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-pink-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        <div className="absolute bottom-20 right-10 w-18 h-18 bg-blue-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 pt-16 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-6 shadow-2xl">
              <span className="text-3xl">👥</span>
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Hub da Equipe
            </h2>
            <p className="text-white/70 text-lg">
              Organize suas danças em grupo e forme a equipe perfeita!
            </p>
          </div>

          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">⬅️</span>
                Voltar
              </span>
            </button>
          </div>

          {/* Team Management Component */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
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