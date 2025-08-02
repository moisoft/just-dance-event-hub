import React, { useState, useEffect } from 'react';
import { Song, RankingEntry } from '../types';

// Ensure RankingEntry is properly defined in ../types.ts as:
// export interface RankingEntry {
//   score: number;
//   stars: number;
// }

interface MusicDetailScreenProps {
  song: Song;
  playerRanking: RankingEntry | undefined;
  onBack: () => void;
  onAddToQueue: (song: Song, coachImageUrl: string) => void;
}

const MusicDetailScreen: React.FC<MusicDetailScreenProps> = ({ song, playerRanking, onBack, onAddToQueue }) => {
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'coaches'>('preview');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {    
    // Auto-select first coach if there's only one
    if (song.coach_images.length === 1) {
      setSelectedCoach(song.coach_images[0]);
    }
    
    // Add escape key listener for back functionality
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [song, onBack]);

  const handleAddToQueue = () => {
    if (selectedCoach) {
      setIsAdding(true);
      // Chamar a função onAddToQueue diretamente
      onAddToQueue(song, selectedCoach);
      // Aguardar um pouco para feedback visual
      setTimeout(() => {
        onBack();
      }, 800);
    } else {
      // Animate to coaches tab if no coach selected
      setActiveTab('coaches');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'Fácil': return 'from-green-400 to-emerald-500';
      case 'Médio': return 'from-blue-400 to-cyan-500';
      case 'Difícil': return 'from-orange-400 to-red-500';
      case 'Extremo': return 'from-purple-400 to-pink-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getStarsDisplay = (stars: number) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={`text-xl ${i < stars ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-2 xs:p-3 sm:p-4 pt-16 pb-20 relative overflow-y-auto overflow-x-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 xs:-top-15 sm:-top-20 -right-10 xs:-right-15 sm:-right-20 w-30 xs:w-45 sm:w-60 h-30 xs:h-45 sm:h-60 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-10 xs:-bottom-15 sm:-bottom-20 -left-10 xs:-left-15 sm:-left-20 w-30 xs:w-45 sm:w-60 h-30 xs:h-45 sm:h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Back button */}
        <button 
          onClick={onBack} 
          className="mb-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all duration-300 z-10 group flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>

        {/* Song header with artwork */}
        <div className="flex flex-col md:flex-row items-center gap-3 xs:gap-4 sm:gap-6 mb-4 xs:mb-5 sm:mb-6">
          <div className="relative w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 flex-shrink-0 rounded-lg xs:rounded-xl overflow-hidden group">
            <img 
              src={song.artwork_url} 
              alt={song.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute bottom-2 left-0 right-0 text-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {song.year} • {song.genre}
            </div>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-1">
              {song.name}
            </h2>
            <p className="text-base xs:text-lg sm:text-xl text-white/80 mb-2 xs:mb-3">{song.artist}</p>
            
            <div className="flex flex-wrap gap-2 xs:gap-3 justify-center md:justify-start">
              <span className="px-2 xs:px-3 py-0.5 xs:py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs xs:text-sm font-medium">
                {song.game_mode}
              </span>
              <span className={`px-2 xs:px-3 py-0.5 xs:py-1 bg-gradient-to-r ${getDifficultyColor(song.difficulty)} rounded-full text-xs xs:text-sm font-medium text-white`}>
                {song.difficulty}
              </span>
              <span className="px-2 xs:px-3 py-0.5 xs:py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs xs:text-sm font-medium">
                {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/10 rounded-lg xs:rounded-xl p-0.5 xs:p-1 mb-4 xs:mb-5 sm:mb-6">
          <button
            className={`flex-1 py-1.5 xs:py-2 px-2 xs:px-3 sm:px-4 rounded-md xs:rounded-lg text-xs xs:text-sm font-semibold transition-all duration-300 ${
              activeTab === 'preview' 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
          <button
            className={`flex-1 py-1.5 xs:py-2 px-2 xs:px-3 sm:px-4 rounded-md xs:rounded-lg text-xs xs:text-sm font-semibold transition-all duration-300 ${
              activeTab === 'coaches' 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            onClick={() => setActiveTab('coaches')}
          >
            Coaches
          </button>
        </div>

        {/* Tab content */}
        <div className="mb-4 xs:mb-5 sm:mb-6 transition-all duration-500">
          {activeTab === 'preview' ? (
            <div className="animate-fadeIn">
              <div className="rounded-xl overflow-hidden shadow-2xl border border-white/20">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  controls 
                  src={song.video_file_url} 
                  className="w-full h-auto rounded-xl" 
                />
              </div>
              
              {/* Player ranking */}
              <div className="mt-4 xs:mt-5 sm:mt-6 bg-white/10 backdrop-blur-sm rounded-lg xs:rounded-xl p-3 xs:p-4 border border-white/20">
                <h3 className="text-lg xs:text-xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2 xs:mb-3">
                  Seu Recorde Pessoal
                </h3>
                {playerRanking ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-lg">
                        Pontuação: <span className="font-bold text-pink-300">{playerRanking.score.toLocaleString()}</span>
                      </p>
                      <div className="flex mt-1">
                        {getStarsDisplay(playerRanking.stars)}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold py-2 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
                      TOP DANCER
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-white/70">Nenhum recorde ainda. Dance para fazer história!</p>
                    <div className="animate-bounce">
                      <span className="text-xl">💃</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="animate-fadeIn">
              <h3 className="text-lg xs:text-xl font-semibold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-3 xs:mb-4">
                Escolha seu Coach
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
                {song.coach_images.map((coachUrl, index) => (
                  <div 
                    key={index}
                    className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${selectedCoach === coachUrl ? 'scale-105' : ''}`}
                    onClick={() => setSelectedCoach(coachUrl)}
                  >
                    <div className={`absolute inset-0 rounded-xl ${selectedCoach === coachUrl ? 'bg-gradient-to-r from-pink-500/30 to-purple-600/30 animate-pulse' : 'bg-black/40 group-hover:bg-black/20'} transition-colors duration-300`}></div>
                    <div className={`h-28 xs:h-32 sm:h-36 md:h-40 rounded-lg xs:rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedCoach === coachUrl ? 'border-pink-500 shadow-lg shadow-pink-500/30' : 'border-white/20 group-hover:border-white/40'}`}>
                      <img
                        src={coachUrl}
                        alt={`Coach ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className={`absolute bottom-2 left-0 right-0 text-center transition-opacity duration-300 ${selectedCoach === coachUrl ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <span className="bg-black/70 text-white text-xs py-1 px-3 rounded-full">
                        Coach {index + 1}
                      </span>
                    </div>
                    {selectedCoach === coachUrl && (
                      <div className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1 shadow-lg">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 group relative overflow-hidden py-3 xs:py-3.5 sm:py-4 rounded-lg xs:rounded-xl font-bold text-base xs:text-lg shadow-lg transition-all duration-500 transform hover:scale-105 bg-white/20 text-white"
          >
            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            <span className="relative z-10 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </span>
          </button>
          
          <button
            onClick={handleAddToQueue}
            disabled={isAdding}
            className={`flex-1 group relative overflow-hidden py-3 xs:py-3.5 sm:py-4 rounded-lg xs:rounded-xl font-bold text-base xs:text-lg shadow-lg transition-all duration-500 transform hover:scale-105 ${selectedCoach ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white' : 'bg-white/20 text-white/70'}`}
          >
            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            <span className="relative z-10 flex items-center justify-center">
              {isAdding ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adicionando à Fila...
                </>
              ) : (
                <>
                  <span className="mr-2">🎵</span>
                  {selectedCoach ? 'Entrar na Fila' : 'Selecione um Coach'}
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicDetailScreen;