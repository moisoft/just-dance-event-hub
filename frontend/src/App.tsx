import React, { useState, useEffect } from 'react';
import AuthScreen from './components/AuthScreen';
import EventHubScreen from './components/EventHubScreen';
import PlayerDashboard from './components/PlayerDashboard';
import MusicSelectionScreen from './components/MusicSelectionScreen';
import CompetitionsHubScreen from './components/CompetitionsHubScreen';
import TournamentRegistrationScreen from './components/TournamentRegistrationScreen';
import RegistrationConfirmationScreen from './components/RegistrationConfirmationScreen';
import SettingsScreen from './components/SettingsScreen';
import StaffPanelScreen from './components/StaffPanelScreen';
import AdminScreen from './components/AdminScreen';
import ManageSongsScreen from './components/ManageSongsScreen';
import ManageUsersScreen from './components/ManageUsersScreen';
import ManageAvatarsScreen from './components/ManageAvatarsScreen';
import KioskScreen from './components/KioskScreen';
import TeamHubScreen from './components/TeamHubScreen';
import BottomNavBar from './components/BottomNavBar';
import { User, AppState, InEventScreen, Tournament } from './types';
import { mockTournaments } from './data/mockData';

function App() {
  const [appState, setAppState] = useState<AppState>('auth');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeScreen, setActiveScreen] = useState<InEventScreen>('dashboard');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [registeredTournament, setRegisteredTournament] = useState<Tournament | null>(null);
  const [eventCode, setEventCode] = useState('');
  const [adminSubScreen, setAdminSubScreen] = useState<'main' | 'songs' | 'users' | 'avatars'>('main');

  useEffect(() => {
    if (currentUser) {
      console.log(`Usuário logado: ${currentUser.nickname} (${currentUser.papel})`);
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.papel === 'admin') {
      setAppState('admin_panel');
    } else if (user.papel === 'staff') {
      setAppState('staff_panel');
    } else {
      setAppState('hub');
    }
  };

  const handleEnterEvent = (code: string) => {
    setEventCode(code);
    setAppState('in_event');
    setActiveScreen('dashboard');
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

  const renderScreen = () => {
    if (!currentUser) {
      return <AuthScreen onLogin={handleLogin} />;
    }

    switch (appState) {
      case 'auth':
        return <AuthScreen onLogin={handleLogin} />;
      case 'hub':
        return <EventHubScreen user={currentUser} onEnterEvent={handleEnterEvent} />;
      case 'in_event':
        return (
          <div className="flex flex-col min-h-screen">
            {activeScreen === 'dashboard' && <PlayerDashboard user={currentUser} />}
            {activeScreen === 'music' && (
              <MusicSelectionScreen
                user={currentUser}
                onViewCompetitions={() => setActiveScreen('competitions')}
                onNavigateToTeamHub={() => setAppState('team_hub')} // Navigate to TeamHubScreen
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
            {activeScreen === 'settings' && <SettingsScreen user={currentUser} />}
            <BottomNavBar activeScreen={activeScreen} onScreenChange={setActiveScreen} />
          </div>
        );
      case 'staff_panel':
        return <StaffPanelScreen onLogout={() => setAppState('auth')} />;
      case 'admin_panel':
        return <AdminScreen onLogout={() => setAppState('auth')} />;
      case 'kiosk_mode':
        return <KioskScreen onExitKioskMode={() => setAppState('staff_panel')} />;
      case 'team_hub':
        return <TeamHubScreen onBack={() => setAppState('in_event')} />;
      default:
        return <div className="text-white">Tela não encontrada.</div>;
    }
  };

  return (
    <div className="App bg-gray-900 min-h-screen">
      {renderScreen()}
    </div>
  );
}

export default App;
