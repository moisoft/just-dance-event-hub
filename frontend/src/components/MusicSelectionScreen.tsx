import React, { useState } from 'react';
import { Song, User, Rankings } from '../types';
import { mockSongs, mockRankings } from '../data/mockData';
import MusicDetailModal from './MusicDetailModal';

interface MusicSelectionScreenProps {
  user: User;
  onViewCompetitions: () => void;
  onNavigateToTeamHub: () => void;
}

const MusicSelectionScreen: React.FC<MusicSelectionScreenProps> = ({ user, onViewCompetitions, onNavigateToTeamHub }) => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const handleSongClick = (song: Song) => {
    setSelectedSong(song);
  };

  const handleCloseModal = () => {
    setSelectedSong(null);
  };

  const handleAddToQueue = (song: Song, coachImageUrl: string) => {
    console.log(`Música "${song.name}" adicionada à fila com o coach ${coachImageUrl}`);
    alert(`Música "${song.name}" adicionada à fila!`);
    // In a real app, you'd update the global queue state
  };

  const getPlayerRankingForSong = (songId: string) => {
    return (mockRankings as Rankings)[songId]?.[user.id];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-4 pt-16 pb-20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8 text-pink-400">Seleção de Música</h2>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={onNavigateToTeamHub}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 text-lg"
          >
            Dançar em Grupo
          </button>
          <button
            onClick={onViewCompetitions}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 text-lg"
          >
            Ver Competições
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {mockSongs.map((song) => (
            <div
              key={song.id}
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-105 border border-purple-700"
              onClick={() => handleSongClick(song)}
            >
              <img src={song.artwork_url} alt={song.name} className="w-full h-48 object-cover" />
            </div>
          ))}
        </div>

        {selectedSong && (
          <MusicDetailModal
            song={selectedSong}
            playerRanking={getPlayerRankingForSong(selectedSong.id)}
            onClose={handleCloseModal}
            onAddToQueue={handleAddToQueue}
          />
        )}
      </div>
    </div>
  );
};

export default MusicSelectionScreen;