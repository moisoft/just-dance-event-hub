import React, { useState } from 'react';
import { Song, User, Rankings, QueueItem } from '../types';
import { mockSongs, mockRankings } from '../data/mockData';
import MusicDetailScreen from './MusicDetailScreen';
import { useWebSocket } from '../hooks/useWebSocket';
import { useEvent } from '../contexts/EventContext';

interface MusicSelectionScreenProps {
  user: User;
  onViewCompetitions: () => void;
  onNavigateToTeamHub: () => void;
}

const MusicSelectionScreen: React.FC<MusicSelectionScreenProps> = ({ user, onViewCompetitions, onNavigateToTeamHub }) => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const { state } = useEvent();
  const { addQueueItem } = useWebSocket({ 
    eventId: state.currentEvent?.id, 
    userRole: 'player', 
    userId: user.id 
  });

  const handleSongClick = (song: Song) => {
    setSelectedSong(song);
  };

  const handleCloseModal = () => {
    setSelectedSong(null);
  };

  const handleAddToQueue = (song: Song, coachImageUrl: string) => {
    // Criar um novo item de fila
    const newQueueItem: QueueItem = {
      id: `temp-${Date.now()}`, // ID temporário que será substituído pelo servidor
      type: 'solo',
      player: user,
      song: song,
      coach_image_url: coachImageUrl,
      status: 'pending'
    };
    
    // Enviar para o WebSocket
    addQueueItem(newQueueItem);
    
    // Feedback para o usuário
    console.log(`Música "${song.name}" adicionada à fila com o coach ${coachImageUrl}`);
  };

  const getPlayerRankingForSong = (songId: string) => {
    return (mockRankings as Rankings)[songId]?.[user.id];
  };

  // Se não houver música selecionada, mostra a tela de seleção de música
  if (!selectedSong) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-2 xs:p-3 sm:p-4 pt-16 pb-20 relative overflow-y-auto overflow-x-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 xs:-top-30 sm:-top-40 -right-20 xs:-right-30 sm:-right-40 w-40 xs:w-60 sm:w-80 h-40 xs:h-60 sm:h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-20 xs:-bottom-30 sm:-bottom-40 -left-20 xs:-left-30 sm:-left-40 w-40 xs:w-60 sm:w-80 h-40 xs:h-60 sm:h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-20 xs:top-30 sm:top-40 left-20 xs:left-30 sm:left-40 w-40 xs:w-60 sm:w-80 h-40 xs:h-60 sm:h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 xs:mb-7 sm:mb-8">
            <div className="w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 mx-auto mb-3 xs:mb-3.5 sm:mb-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243a1 1 0 010-1.414z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M13.828 7.172a1 1 0 011.414 0A5.983 5.983 0 0117 12a5.983 5.983 0 01-1.758 4.828a1 1 0 11-1.414-1.414A3.987 3.987 0 0015 12a3.987 3.987 0 00-1.172-2.828a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-1 xs:mb-1.5 sm:mb-2">
              Seleção de Música
            </h2>
            <p className="text-sm xs:text-base text-white/70">Escolha sua próxima música para dançar</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col xs:flex-row justify-center gap-2 xs:gap-3 sm:gap-4 mb-6 xs:mb-7 sm:mb-8">
            <button
              onClick={onNavigateToTeamHub}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-2 xs:py-2.5 sm:py-3 px-4 xs:px-5 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 mb-2 xs:mb-0"
            >
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <span className="relative z-10 flex items-center">
                <span className="mr-2">👥</span>
                Dançar em Grupo
              </span>
            </button>
            <button
              onClick={onViewCompetitions}
              className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-2 xs:py-2.5 sm:py-3 px-4 xs:px-5 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <span className="relative z-10 flex items-center">
                <span className="mr-2">🏆</span>
                Ver Competições
              </span>
            </button>
          </div>

          {/* Music Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 xs:gap-4 sm:gap-6">
            {mockSongs.map((song) => (
              <div
                key={song.id}
                className="group bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:bg-white/15 border border-white/20"
                onClick={() => handleSongClick(song)}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={song.artwork_url} 
                    alt={song.name} 
                    className="w-full h-36 xs:h-40 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-2 left-2 right-2 text-white opacity-100 xs:opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 xs:bg-transparent p-1 xs:p-0 rounded">
                    <p className="text-sm font-semibold truncate">{song.name}</p>
                    <p className="text-xs text-white/80 truncate">{song.artist}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Se houver música selecionada, mostra a tela de detalhes da música
  return (
    <MusicDetailScreen
      song={selectedSong}
      playerRanking={getPlayerRankingForSong(selectedSong.id)}
      onBack={handleCloseModal}
      onAddToQueue={handleAddToQueue}
    />
  );
};

export default MusicSelectionScreen;