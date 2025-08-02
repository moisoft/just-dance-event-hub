import React from 'react';
import { Tournament } from '../types';
import CompetitionManagement from './competitions/CompetitionManagement';

interface CompetitionsHubScreenProps {
  onBack?: () => void;
  onSelectTournament?: React.Dispatch<React.SetStateAction<Tournament | null>>;
}

const CompetitionsHubScreen: React.FC<CompetitionsHubScreenProps> = ({ onBack, onSelectTournament }) => {
  // Mock data for event, user, and role
  const eventId = 123;
  const userId = 456;
  const userRole = 'participant';

  return (
    <div className="min-h-screen relative overflow-y-auto overflow-x-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 xs:top-15 sm:top-20 left-5 xs:left-8 sm:left-10 w-12 xs:w-16 sm:w-20 h-12 xs:h-16 sm:h-20 bg-pink-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
        <div className="absolute top-20 xs:top-30 sm:top-40 right-5 xs:right-10 sm:right-20 w-10 xs:w-12 sm:w-16 h-10 xs:h-12 sm:h-16 bg-cyan-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
        <div className="absolute bottom-20 xs:bottom-30 sm:bottom-40 left-5 xs:left-10 sm:left-20 w-14 xs:w-18 sm:w-24 h-14 xs:h-18 sm:h-24 bg-purple-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        <div className="absolute bottom-10 xs:bottom-15 sm:bottom-20 right-5 xs:right-8 sm:right-10 w-10 xs:w-14 sm:w-18 h-10 xs:h-14 sm:h-18 bg-blue-500/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-2 xs:p-3 sm:p-4 pt-12 xs:pt-14 sm:pt-16 pb-16 xs:pb-18 sm:pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 xs:mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-14 xs:w-16 sm:w-20 h-14 xs:h-16 sm:h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-3 xs:mb-4 sm:mb-6 shadow-2xl">
              <span className="text-xl xs:text-2xl sm:text-3xl">🏆</span>
            </div>
            <h2 className="text-3xl xs:text-4xl sm:text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2 xs:mb-3 sm:mb-4">
              Competições
            </h2>
            <p className="text-white/70 text-sm xs:text-base sm:text-lg max-w-2xl mx-auto px-2 xs:px-4 sm:px-0">
              Participe dos torneios mais emocionantes e mostre suas habilidades de dança!
            </p>
          </div>

          {/* Competition Management Component */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-6 shadow-2xl">
            <CompetitionManagement 
              eventId={eventId}
              userId={userId}
              userRole={userRole}
            />
          </div>

          {/* Back Button */}
          {onBack && (
            <div className="text-center mt-4 xs:mt-6 sm:mt-8">
              <button
                onClick={onBack}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-2 xs:py-2.5 sm:py-3 px-5 xs:px-6 sm:px-8 rounded-lg xs:rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl text-sm xs:text-base sm:text-base"
            >
              ← Voltar
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitionsHubScreen;