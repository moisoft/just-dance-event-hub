import React, { useEffect, useState } from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import { queueAPI } from '../services/api';

interface StaffPanelScreenProps {
  eventId: string;
  onNavigate: (screen: string) => void;
}

const StaffPanelScreen: React.FC<StaffPanelScreenProps> = ({ eventId, onNavigate }) => {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    queueAPI.getEventQueue(eventId).then(setQueue).finally(() => setLoading(false));
  }, [eventId]);

  return (
    <ScreenWrapper title="Painel do Staff">
      {loading ? <p className="text-center text-gray-400">Carregando fila...</p> : (
        <div className="space-y-2">
          {queue.map((item: any, i: number) => (
            <div key={item.id || i} className="bg-gray-700 p-3 rounded-lg flex items-center">
              <span className="text-gray-400 mr-3">{i + 1}.</span>
              <div className="flex-1 font-bold">{item.user?.name} - {item.song}</div>
              {/* Botões de ação para staff */}
            </div>
          ))}
        </div>
      )}
      <button onClick={() => onNavigate('kiosk')} className="w-full py-3 mt-4 bg-indigo-600 rounded-lg font-bold flex items-center justify-center">Modo Telão</button>
    </ScreenWrapper>
  );
};

export default StaffPanelScreen; 