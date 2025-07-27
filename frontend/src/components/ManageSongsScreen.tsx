import React, { useState } from 'react';
import { Song } from '../types';
import { mockSongs } from '../data/mockData';
import EditSongModal from './EditSongModal';

interface ManageSongsScreenProps {
  onBack: () => void;
}

const ManageSongsScreen: React.FC<ManageSongsScreenProps> = ({ onBack }) => {
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [songs, setSongs] = useState<Song[]>(mockSongs);

  const handleEditSong = (song: Song) => {
    setEditingSong(song);
  };

  const handleAddSong = () => {
    setEditingSong({ id: '', name: '', artist: '', artwork_url: '', game_mode: 'Solo', coach_images: [], video_file_url: '' });
  };

  const handleSaveSong = (updatedSong: Song) => {
    if (updatedSong.id) {
      // Update existing song
      setSongs(songs.map(s => (s.id === updatedSong.id ? updatedSong : s)));
    } else {
      // Add new song
      setSongs([...songs, { ...updatedSong, id: `song${songs.length + 1}` }]);
    }
    setEditingSong(null);
  };

  const handleDeleteSong = (songId: string) => {
    if (window.confirm('Tem certeza de que deseja excluir esta música?')) {
      setSongs(songs.filter(s => s.id !== songId));
    }
  };

  const generateDescription = (song: Song) => {
    alert(`Gerando descrição para ${song.name} (simulado)...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-4 pt-16 pb-20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8 text-pink-400">Gerenciar Músicas</h2>

        <div className="flex justify-end mb-6">
          <button
            onClick={handleAddSong}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-5 rounded-lg transition-colors duration-300 text-lg"
          >
            Adicionar Nova Música
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-purple-700">
          <ul className="space-y-4">
            {songs.map((song) => (
              <li key={song.id} className="flex flex-col md:flex-row items-center justify-between bg-gray-700 p-4 rounded-md border border-gray-600">
                <div className="flex items-center mb-4 md:mb-0">
                  <img src={song.artwork_url} alt={song.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                  <div>
                    <h3 className="text-xl font-semibold text-pink-300">{song.name}</h3>
                    <p className="text-gray-400">{song.artist} - {song.game_mode}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => generateDescription(song)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors duration-300"
                  >
                    ✨ Gerar Descrição
                  </button>
                  <button
                    onClick={() => handleEditSong(song)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors duration-300"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteSong(song.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors duration-300"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 text-lg"
          >
            Voltar para o Painel do Admin
          </button>
        </div>

        {editingSong && (
          <EditSongModal
            song={editingSong}
            onSave={handleSaveSong}
            onClose={() => setEditingSong(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ManageSongsScreen;