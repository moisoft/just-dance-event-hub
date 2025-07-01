import React, { useEffect, useState } from 'react';
import { UsersIcon, TrophyIcon } from '../components/Icons';
import ScreenWrapper from '../components/ScreenWrapper';
import { musicAPI } from '../services/api';

interface MusicSelectionScreenProps {
  onSelectSong: (song: any) => void;
  onJoinTeam: () => void;
  onNavigate: (screen: string) => void;
}

const MusicSelectionScreen: React.FC<MusicSelectionScreenProps> = ({ onSelectSong, onJoinTeam, onNavigate }) => {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    musicAPI.getAll().then(setSongs).finally(() => setLoading(false));
  }, []);

  return (
    <ScreenWrapper title="Escolha sua Música">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <button onClick={onJoinTeam} className="w-full py-3 text-lg font-bold rounded-lg bg-cyan-600 hover:bg-cyan-700 flex items-center justify-center">
          <UsersIcon className="w-6 h-6 mr-2" />Dançar em Grupo
        </button>
        <button onClick={() => onNavigate('competitions')} className="w-full py-3 text-lg font-bold rounded-lg bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center">
          <TrophyIcon className="w-6 h-6 mr-2" />Ver Competições
        </button>
      </div>
      {loading ? <p className="text-center text-gray-400">Carregando músicas...</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {songs.map((song: any) => (
            <div key={song.id} onClick={() => onSelectSong(song)} className="cursor-pointer group relative rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform">
              <img src={song.artworkUrl} alt={song.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end p-2">
                <h3 className="text-white font-bold text-lg">{song.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScreenWrapper>
  );
};

export default MusicSelectionScreen; 