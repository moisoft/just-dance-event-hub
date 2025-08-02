import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/api';
import { Song, Coach, QueueItem, Tournament, Event, Competition } from '../types';
import { useEvent } from '../contexts/EventContext';
import { useWebSocket } from '../hooks/useWebSocket';
import ConnectionStatus from './ConnectionStatus';
import AdminPanelScreen from './AdminPanelScreen';
import ManageSongsScreen from './ManageSongsScreen';
import ManageUsersScreen from './ManageUsersScreen';
import ManageAvatarsScreen from './ManageAvatarsScreen';
import ManageEventsScreen from './ManageEventsScreen';
import ManageTournamentsScreen from './ManageTournamentsScreen';
import ManageQueueScreen from './ManageQueueScreen';
import ManageCoachesScreen from './ManageCoachesScreen';
import ManageCompetitionsScreen from './ManageCompetitionsScreen';
import ManageModulesScreen from './ManageModulesScreen';
import './AdminScreen.css';

interface AdminScreenProps {
  onLogout: () => void;
}

// Função para determinar a quantidade de coaches baseada no modo de jogo
const getCoachCount = (gameMode: string): number => {
  switch (gameMode) {
    case 'Solo':
      return 1;
    case 'Dueto':
      return 2;
    case 'Team':
      return 4; // Assumindo quarteto para Team
    default:
      return 1;
  }
};

const AdminScreen: React.FC<AdminScreenProps> = ({ onLogout }) => {
  const { state, dispatch } = useEvent();
  const { sendMessage } = useWebSocket({ 
    eventId: state.currentEvent?.id || '', 
    userRole: 'admin', 
    userId: 'admin-user' 
  });
  
  const [activeScreen, setActiveScreen] = useState<
    'panel' | 'songs' | 'users' | 'avatars' | 'events' | 'tournaments' | 'queue' | 'coaches' | 'competitions' | 'modules'
  >('panel');

  const handleManageSongs = () => setActiveScreen('songs');
  const handleManageAvatars = () => setActiveScreen('avatars');
  const handleManageUsers = () => setActiveScreen('users');
  const handleManageEvents = () => setActiveScreen('events');
  const handleManageTournaments = () => setActiveScreen('tournaments');
  const handleManageQueue = () => setActiveScreen('queue');
  const handleManageCoaches = () => setActiveScreen('coaches');
  const handleManageCompetitions = () => setActiveScreen('competitions');
  const handleManageModules = () => setActiveScreen('modules');
  const handleBackToPanel = () => setActiveScreen('panel');

  // Efeito para redirecionar caso tente acessar telas desativadas
  useEffect(() => {
    // Verificar se a tela ativa é uma das funcionalidades desativadas
    if (activeScreen === 'tournaments' || activeScreen === 'competitions') {
      // Redirecionar para o painel principal
      setActiveScreen('panel');
      // Mostrar mensagem informativa (opcional - poderia ser implementado com um toast/notificação)
      alert('Funcionalidade temporariamente desativada para priorizar Queue e Event.');
    }
  }, [activeScreen]);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'panel':
        return (
          <AdminPanelScreen 
            onManageSongs={handleManageSongs}
            onManageAvatars={handleManageAvatars}
            onManageUsers={handleManageUsers}
            onManageEvents={handleManageEvents}
            onManageTournaments={handleManageTournaments} // Mantido para compatibilidade
            onManageQueue={handleManageQueue}
            onManageCoaches={handleManageCoaches}
            onManageCompetitions={handleManageCompetitions} // Mantido para compatibilidade
            onManageModules={handleManageModules}
          />
        );
      case 'songs':
        return <ManageSongsScreen onBack={handleBackToPanel} />;
      case 'avatars':
        return <ManageAvatarsScreen onBack={handleBackToPanel} />;
      case 'users':
        return <ManageUsersScreen onBack={handleBackToPanel} />;
      case 'events':
        return <ManageEventsScreen onBack={handleBackToPanel} />;
      // Casos de torneios e competições são tratados pelo useEffect acima
      // e redirecionados para o painel principal
      case 'queue':
        return <ManageQueueScreen onBack={handleBackToPanel} />;
      case 'coaches':
        return <ManageCoachesScreen onBack={handleBackToPanel} />;
      case 'modules':
        return <ManageModulesScreen onBack={handleBackToPanel} />;
      default:
        return <div>Tela não encontrada</div>;
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-content">
          <h1>Painel de Administração</h1>
          <button className="logout-btn" onClick={onLogout}>
            Sair
          </button>
        </div>
      </div>

      <div className="admin-content">
        {renderScreen()}
      </div>
    </div>
  );
};

export default AdminScreen;