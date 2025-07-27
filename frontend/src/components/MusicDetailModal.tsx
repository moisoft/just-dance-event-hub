import React, { useState } from 'react';
import { Song, RankingEntry } from '../types';

interface MusicDetailModalProps {
  song: Song;
  playerRanking: RankingEntry | undefined;
  onClose: () => void;
  onAddToQueue: (song: Song, coachImageUrl: string) => void;
}

const MusicDetailModal: React.FC<MusicDetailModalProps> = ({ song, playerRanking, onClose, onAddToQueue }) => {
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);



  const handleAddToQueue = () => {
    if (selectedCoach) {
      onAddToQueue(song, selectedCoach);
      onClose();
    } else {
      alert('Por favor, selecione um coach.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl border border-purple-700 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold">
          &times;
        </button>
        <h2 className="text-3xl font-bold text-pink-400 mb-4 text-center">{song.name}</h2>
        <p className="text-gray-300 text-center mb-6">{song.artist}</p>

        <div className="mb-6 rounded-lg overflow-hidden">
          <video controls src={song.video_file_url} className="w-full h-auto rounded-lg" />
        </div>

        <div className="mb-6 text-center">
          <h3 className="text-xl font-semibold text-cyan-400 mb-2">Seu Recorde Pessoal:</h3>
          {playerRanking ? (
            <p className="text-lg">
              Pontuação: <span className="font-bold text-pink-300">{playerRanking.score}</span>,
              Estrelas: <span className="font-bold text-pink-300">{playerRanking.stars} ⭐</span>
            </p>
          ) : (
            <p className="text-lg text-gray-400">Nenhum recorde ainda. Dance para fazer história!</p>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-cyan-400 mb-3 text-center">Selecione um Coach:</h3>
          <div className="flex justify-center space-x-4">
            {song.coach_images.map((coachUrl, index) => (
              <img
                key={index}
                src={coachUrl}
                alt={`Coach ${index + 1}`}
                className={`w-20 h-20 rounded-full object-cover cursor-pointer border-4 transition-all duration-200
                  ${selectedCoach === coachUrl ? 'border-pink-500 ring-2 ring-pink-300' : 'border-gray-600 hover:border-purple-500'}`}
                onClick={() => setSelectedCoach(coachUrl)}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleAddToQueue}
          className={`w-full py-3 rounded-lg font-bold text-lg transition-colors duration-300
            ${selectedCoach ? 'bg-pink-600 hover:bg-pink-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
          disabled={!selectedCoach}
        >
          Adicionar à Fila
        </button>
      </div>
    </div>
  );
};

export default MusicDetailModal;