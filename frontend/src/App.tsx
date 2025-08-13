import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';

// Lazy load components for better performance
const AuthScreen = lazy(() => import('./components/AuthScreen'));
const EventHubScreen = lazy(() => import('./components/EventHubScreen'));
const PlayerDashboard = lazy(() => import('./components/PlayerDashboard'));
const MusicSelectionScreen = lazy(() => import('./components/MusicSelectionScreen'));
const CompetitionsHubScreen = lazy(() => import('./components/CompetitionsHubScreen'));
const TournamentRegistrationScreen = lazy(() => import('./components/TournamentRegistrationScreen'));
const RegistrationConfirmationScreen = lazy(() => import('./components/RegistrationConfirmationScreen'));
const SettingsScreen = lazy(() => import('./components/SettingsScreen'));
const EditProfileScreen = lazy(() => import('./components/EditProfileScreen'));
const StaffPanelScreen = lazy(() => import('./components/StaffPanelScreen'));
const AdminScreen = lazy(() => import('./components/AdminScreen'));
const ManageSongsScreen = lazy(() => import('./components/ManageSongsScreen'));
const ManageUsersScreen = lazy(() => import('./components/ManageUsersScreen'));
const ManageAvatarsScreen = lazy(() => import('./components/ManageAvatarsScreen'));
const KioskScreen = lazy(() => import('./components/KioskScreen'));
const TeamHubScreen = lazy(() => import('./components/TeamHubScreen'));

// Keep these components loaded immediately as they're always visible
import BottomNavBar from './components/BottomNavBar';
import NotificationCenter from './components/NotificationCenter';
import ConnectionStatus from './components/ConnectionStatus';

// Contexts
import { EventProvider, useEvent } from './contexts/EventContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { AuthProvider } from './contexts/AuthContext';

// Types and data
import type { User, AppState, InEventScreen, Tournament } from './types';
import { mockTournaments } from './data/mockData';
import { eventApi } from './api/api';

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
  </div>
);

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

  const handleLogin = useCallback((user: User) => {
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
  }, []);

  const handleEnterEvent = useCallback((code: string) => {
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
  }, [dispatch]);

  const handleRegisterTournament = useCallback((tournamentId: string) => {
    const tournament = mockTournaments.find(t => t.id === tournamentId);
    if (tournament && currentUser) {
      tournament.registered_players.push(currentUser.id); // Simulate registration
      setRegisteredTournament(tournament);
      setAppState('in_event'); // Stay in event context
      setActiveScreen('competitions'); // Go back to competitions view
    }
  }, [currentUser]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setAppState('auth');
    setActiveScreen('dashboard');
    setSelectedTournament(null);
    setRegisteredTournament(null);
    setEventCode('');
    setAdminSubScreen('main');
    setShowEditProfile(false);
  }, []);

  const handleNavigateToEditProfile = useCallback((screen: string) => {
    if (screen === 'editProfile') {
      setShowEditProfile(true);
    }
  }, []);

  const handleSaveProfile = useCallback((updatedUser: User) => {
    setCurrentUser(updatedUser);
    setShowEditProfile(false);
    // TODO: Aqui você pode adicionar a chamada para a API para salvar no backend
    console.log('Perfil atualizado:', updatedUser);
  }, []);

  const handleBackFromEditProfile = useCallback(() => {
    setShowEditProfile(false);
  }, []);

  const renderScreen = () => {
    // Se não há usuário logado, mostrar tela de autenticação
    if (!currentUser) {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <AuthScreen onLogin={handleLogin} />
        </Suspense>
      );
    }

    switch (appState) {
      case 'hub':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <EventHubScreen user={currentUser} onEnterEvent={handleEnterEvent} />
          </Suspense>
        );
      case 'in_event':
        return (
          <div className="flex flex-col min-h-screen pb-20">
            <Suspense fallback={<LoadingSpinner />}>
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
