import React, { useState, useEffect } from 'react';
import AuthScreen from './components/AuthScreen';
import EventHubScreen from './components/EventHubScreen';
import PlayerDashboard from './components/PlayerDashboard';
import MusicSelectionScreen from './components/MusicSelectionScreen';
import CompetitionsHubScreen from './components/CompetitionsHubScreen';
import TournamentRegistrationScreen from './components/TournamentRegistrationScreen';
import RegistrationConfirmationScreen from './components/RegistrationConfirmationScreen';
import SettingsScreen from './components/SettingsScreen';
import EditProfileScreen from './components/EditProfileScreen';
import StaffPanelScreen from './components/StaffPanelScreen';
import AdminScreen from './components/AdminScreen';
import ManageSongsScreen from './components/ManageSongsScreen';
import ManageUsersScreen from './components/ManageUsersScreen';
import ManageAvatarsScreen from './components/ManageAvatarsScreen';
import KioskScreen from './components/KioskScreen';
import TeamHubScreen from './components/TeamHubScreen';
import BottomNavBar from './components/BottomNavBar';
import NotificationCenter from './components/NotificationCenter';
import ConnectionStatus from './components/ConnectionStatus';
import { EventProvider, useEvent } from './contexts/EventContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { AuthProvider } from './contexts/AuthContext';
import { User, AppState, InEventScreen, Tournament } from './types';
import { mockTournaments } from './data/mockData';
import { eventApi } from './api/api';

function AppContent() {
  const [appState, setAppState] = useState<AppState>('auth');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeScreen, setActiveScreen] = useState<InEventScreen>('dashboard');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [registeredTournament, setRegisteredTournament] = useState<Tournament | null>(null);
  const [eventCode, setEventCode] = useState('');
  const [adminSubScreen, setAdminSubScreen] = useState<'main' | 'songs' | 'users' | 'avatars'>('main');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const { dispatch } = useEvent();

  useEffect(() => {
    if (currentUser) {
      console.log(`Usuário logado: ${currentUser.nickname} (${currentUser.papel})`);
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    console.log('handleLogin chamado com usuário:', user);
    setCurrentUser(user);
    if (user.papel === 'admin') {
      console.log('Redirecionando para admin_panel');
      setAppState('admin_panel');
    } else if (user.papel === 'staff') {
      console.log('Redirecionando para staff_panel');
      setAppState('staff_panel');
    } else {
      console.log('Redirecionando para hub');
      setAppState('hub');
    }
  };

  const handleEnterEvent = (code: string) => {
    setEventCode(code);
    setAppState('in_event');
    setActiveScreen('dashboard');
    
    // Fetch event data by code
    eventApi.getEventByCode(code)
      .then(response => {
        if (response.success && response.data && response.data.event) {
          // Dispatch event data to EventContext
          dispatch({
            type: 'SET_EVENT',
            payload: {
              id: response.data.event.id,
              name: response.data.event.nome_evento,
              code: response.data.event.codigo_evento
            }
          });
          console.log('Event data fetched successfully:', response.data.event);
        } else {
          console.error('Failed to fetch event data:', response.error);
        }
      })
      .catch(error => {
        console.error('Error fetching event data:', error);
      });
  };

  const handleRegisterTournament = (tournamentId: string) => {
    const tournament = mockTournaments.find(t => t.id === tournamentId);
    if (tournament) {
      tournament.registered_players.push(currentUser!.id); // Simulate registration
      setRegisteredTournament(tournament);
      setAppState('in_event'); // Stay in event context
      setActiveScreen('competitions'); // Go back to competitions view
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAppState('auth');
    setActiveScreen('dashboard');
    setSelectedTournament(null);
    setRegisteredTournament(null);
    setEventCode('');
    setAdminSubScreen('main');
    setShowEditProfile(false);
  };

  const handleNavigateToEditProfile = (screen: string) => {
    if (screen === 'editProfile') {
      setShowEditProfile(true);
    }
  };

  const handleSaveProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setShowEditProfile(false);
    // TODO: Aqui você pode adicionar a chamada para a API para salvar no backend
    console.log('Perfil atualizado:', updatedUser);
  };

  const handleBackFromEditProfile = () => {
    setShowEditProfile(false);
  };

  const renderScreen = () => {
    // Se não há usuário logado, mostrar tela de autenticação
    if (!currentUser) {
      return <AuthScreen onLogin={handleLogin} />;
    }

    switch (appState) {
      case 'hub':
        return <EventHubScreen user={currentUser} onEnterEvent={handleEnterEvent} />;
      case 'in_event':
        return (
          <div className="flex flex-col min-h-screen pb-20">
            {activeScreen === 'dashboard' && <PlayerDashboard user={currentUser} />}
            {activeScreen === 'music' && (
              <MusicSelectionScreen
                user={currentUser}
                onViewCompetitions={() => setActiveScreen('competitions')}
                onNavigateToTeamHub={() => setAppState('team_hub')}
              />
            )}
            {activeScreen === 'competitions' && (
              registeredTournament ? (
                <RegistrationConfirmationScreen
                  tournament={registeredTournament}
                  onBackToCompetitions={() => setRegisteredTournament(null)}
                />
              ) : selectedTournament ? (
                <TournamentRegistrationScreen
                  tournament={selectedTournament}
                  user={currentUser}
                  onRegister={handleRegisterTournament}
                  onBack={() => setSelectedTournament(null)}
                />
              ) : (
                <CompetitionsHubScreen onSelectTournament={setSelectedTournament} />
              )
            )}
            {activeScreen === 'settings' && !showEditProfile && (
              <SettingsScreen user={currentUser} onNavigate={handleNavigateToEditProfile} />
            )}
            {activeScreen === 'settings' && showEditProfile && (
              <EditProfileScreen
                user={currentUser}
                onSave={handleSaveProfile}
                onBack={handleBackFromEditProfile}
              />
            )}
            <BottomNavBar activeScreen={activeScreen} onScreenChange={setActiveScreen} />
          </div>
        );
      case 'staff_panel':
        return <StaffPanelScreen onLogout={handleLogout} />;
      case 'admin_panel':
        return <AdminScreen onLogout={handleLogout} />;
      case 'kiosk_mode':
        return <KioskScreen onExitKioskMode={handleLogout} />;
      case 'team_hub':
        return <TeamHubScreen onBack={() => setAppState('in_event')} />;
      default:
        // Se o usuário está logado mas não há estado válido, redirecionar baseado no papel
        if (currentUser.papel === 'admin') {
          setAppState('admin_panel');
        } else if (currentUser.papel === 'staff') {
          setAppState('staff_panel');
        } else {
          setAppState('hub');
        }
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Redirecionando...</div>;
    }
  };

  return (
    <div className="App bg-gray-900 min-h-screen relative w-full overflow-auto">
      {renderScreen()}
      
      {/* Componentes de comunicação em tempo real - apenas quando usuário está logado */}
      {currentUser && (
        <>
          <NotificationCenter />
          
          {/* Status de conexão no canto inferior esquerdo */}
          <div className="fixed bottom-4 left-4 z-30">
            <ConnectionStatus />
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <EventProvider>
      <AuthProvider>
        <WebSocketProvider>
          <AppContent />
        </WebSocketProvider>
      </AuthProvider>
    </EventProvider>
  );
}

export default App;
