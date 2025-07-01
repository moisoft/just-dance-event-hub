import React, { useEffect, useState } from 'react';
import { DancerIcon, SparklesIcon } from '../components/Icons';
import ScreenWrapper from '../components/ScreenWrapper';
import { authAPI, eventAPI } from '../services/api';

interface PlayerDashboardProps {
  userId: string;
  eventId: string;
}

const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ userId, eventId }) => {
  const [user, setUser] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authAPI.getProfile(),
      eventAPI.getByCode(eventId)
    ]).then(([userData, eventData]) => {
      setUser(userData);
      setEvent(eventData);
    }).finally(() => setLoading(false));
  }, [userId, eventId]);

  if (loading) return <ScreenWrapper title="Dashboard"><p className="text-center text-gray-400">Carregando...</p></ScreenWrapper>;
  if (!user || !event) return <ScreenWrapper title="Dashboard"><p className="text-center text-red-400">Erro ao carregar dados.</p></ScreenWrapper>;

  return (
    <ScreenWrapper title={`Bem-vindo(a), ${user.nickname}!`}>
      <div className="w-full max-w-sm md:max-w-md bg-gray-900 font-sans p-4 rounded-3xl mx-auto">
        <header className="flex items-center p-4">
          <h1 className="text-4xl font-bold flex-1">{user.nickname}</h1>
          <img src={user.avatarUrl} alt="Avatar do jogador" className="w-20 h-20 rounded-full border-4 border-cyan-400" />
        </header>
        <main className="px-4 space-y-4">
          <div className="bg-pink-500 rounded-xl p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center">
              <DancerIcon className="h-12 w-12 text-white mr-4" />
              <div>
                <p className="text-white text-sm">Most Danced</p>
                <p className="text-white text-2xl font-bold">{event.mostDanced}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
            <p className="text-gray-400 text-sm">High Score</p>
            <p className="text-white text-4xl font-bold">{event.highScore}</p>
          </div>
          {/* ... outros widgets ... */}
        </main>
      </div>
    </ScreenWrapper>
  );
};

export default PlayerDashboard; 