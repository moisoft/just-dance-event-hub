import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import AuthScreen from './components/AuthScreen';
import EventHubScreen, { EventContext } from './components/EventHubScreen';
import PlayerDashboard from './components/PlayerDashboard';
import MusicSelectionScreen from './components/MusicSelectionScreen';
import StaffPanel from './components/StaffPanel';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginScreen from './components/LoginScreen';
import Register from './pages/Register';
import TournamentPage from './pages/TournamentPage';
import theme from './styles/theme';
import { GlobalStyles } from './styles/globalStyles';
import styled from 'styled-components';
import PluginManager from './components/PluginManager';
import { MOCK_AVATARS, MOCK_TOURNAMENT_MATCHES } from './data/sampleTournament';

// --- Ícones (SVG) para a UI ---
const DancerIcon = ({ className = "h-16 w-16 text-pink-400" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M5.336 14.3a1 1 0 11-1.415-1.414l1.415 1.414zM2 10a8 8 0 1116 0 8 8 0 01-16 0zM7.5 7a.5.5 0 000 1h5a.5.5 0 000-1h-5zM6 10.5a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3a.5.5 0 01-.5-.5z" /><path d="M4.685 12.886A5.5 5.5 0 0110 4.5v1A4.5 4.5 0 005.336 14.3l-1.415-1.414A6.5 6.5 0 0110 3.5v-1A7.5 7.5 0 003.27 11.472l1.414 1.414z" /><path d="M10.508 14.936a1 1 0 01-1.414-1.414l1.414 1.414a5.5 5.5 0 01-4.266-4.266l-1.414-1.414A6.5 6.5 0 0110.508 14.936z" /></svg>;
const TrophyIcon = ({ className = "w-7 h-7" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const MusicNoteIcon = ({ className = "w-7 h-7" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>;
const UserIcon = ({ className = "w-7 h-7" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const CogIcon = ({ className = "w-7 h-7" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const HomeIcon = ({ className = "w-7 h-7" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const UsersIcon = ({ className = "w-7 h-7" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a3.001 3.001 0 015.65-1.292M12 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const PageContainer = styled.div<{ hasNavbar: boolean }>`
    padding-top: ${({ hasNavbar }) => hasNavbar ? '80px' : '0'};
`;

// Tipos para as props
interface BottomNavBarProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
}
interface ScreenWrapperProps {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
}
interface MusicSelectionScreenProps {
  onSelectSong: (song: any) => void;
  onJoinTeam: () => void;
  onNavigate: (screen: string) => void;
}
interface AdminPanelProps {
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}
interface ManageAvatarsScreenProps {
  onBack: () => void;
}
interface TournamentBracketScreenProps {
  onBack: () => void;
}
interface MusicDetailModalProps {
  song: any;
  onClose: () => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeScreen, setActiveScreen }) => ( 
    <footer className="w-full max-w-sm flex justify-around items-center p-2 mt-4 bg-gray-800 rounded-full md:hidden"> 
        {[{ icon: HomeIcon, screen: 'dashboard' }, { icon: MusicNoteIcon, screen: 'music' }, { icon: TrophyIcon, screen: 'competitions' }, { icon: CogIcon, screen: 'settings' }].map(({ icon: Icon, screen }) => ( 
            <button key={screen} onClick={() => setActiveScreen(screen)} className={`p-3 rounded-full transition-colors ${activeScreen === screen ? 'bg-pink-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}> 
                <Icon className="w-7 h-7" /> 
            </button> 
        ))} 
    </footer> 
);

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ title, children, onBack }) => ( <div className="w-full max-w-sm md:max-w-2xl lg:max-w-4xl p-4 animate-fade-in"> {onBack && <button onClick={onBack} className="text-cyan-400 mb-4">&larr; Voltar</button>} <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">{title}</h1> {children} </div> );



const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onNavigate }) => ( <ScreenWrapper title="Painel do Administrador"> <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> <button onClick={() => onNavigate('admin_songs')} className="p-6 bg-pink-600 rounded-lg text-left hover:bg-pink-700 transition-colors"><h3 className="text-2xl font-bold">Gerir Músicas</h3><p>Adicionar ou editar músicas.</p></button> <button onClick={() => onNavigate('admin_avatars')} className="p-6 bg-cyan-600 rounded-lg text-left hover:bg-cyan-700 transition-colors"><h3 className="text-2xl font-bold">Gerir Avatares</h3><p>Adicionar novos avatares.</p></button> <button onClick={() => onNavigate('admin_users')} className="p-6 bg-yellow-500 rounded-lg text-left hover:bg-yellow-600 transition-colors"><h3 className="text-2xl font-bold">Gerir Usuários</h3><p>Ver e alterar papéis de usuários.</p></button> <button onClick={onLogout} className="p-6 bg-red-600 rounded-lg text-left hover:bg-red-700 transition-colors"><h3 className="text-2xl font-bold">Sair</h3><p>Voltar para a tela de login.</p></button> </div> </ScreenWrapper> );

const ManageAvatarsScreen: React.FC<ManageAvatarsScreenProps> = ({ onBack }) => ( <ScreenWrapper title="Gerir Avatares" onBack={onBack}> <button className="w-full py-3 mb-4 bg-green-600 rounded-lg font-bold">Adicionar Novo Avatar</button> <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4"> {MOCK_AVATARS.map(avatar => ( <div key={avatar.id} className="bg-gray-800 p-3 rounded-lg flex flex-col items-center text-center"> <img src={avatar.imageUrl} alt={avatar.name} className="w-24 h-24 rounded-full mb-2"/> <p className="font-bold text-sm">{avatar.name}</p> </div> ))} </div> </ScreenWrapper> );

const TournamentBracketScreen: React.FC<TournamentBracketScreenProps> = ({ onBack }) => { const Match = ({ p1, p2, winner }: any) => ( <div className="w-full bg-gray-800 rounded-lg"> <div className={`p-3 flex items-center border-b border-gray-700 ${winner === p1.nickname ? 'bg-green-500/20' : winner ? 'opacity-50' : ''}`}> <p className={`font-bold ${winner === p1.nickname ? 'text-green-400' : ''}`}>{p1.nickname}</p> </div> <div className={`p-3 flex items-center ${winner === p2.nickname ? 'bg-green-500/20' : winner ? 'opacity-50' : ''}`}> <p className={`font-bold ${winner === p2.nickname ? 'text-green-400' : ''}`}>{p2.nickname}</p> </div> </div> ); return ( <ScreenWrapper title="Chaveamento do Torneio" onBack={onBack}> <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-4"> <div className="w-full md:w-1/2 space-y-4"> <h3 className="font-bold text-center">Quartas de Final</h3> {MOCK_TOURNAMENT_MATCHES.map((match, i) => <Match key={i} {...match} />)} </div> <div className="w-full md:w-1/2 space-y-4 flex flex-col justify-around"> <h3 className="font-bold text-center">Semifinais</h3> <Match p1={{nickname: 'Mathew'}} p2={{nickname: '???'}} winner={null} /> <Match p1={{nickname: 'Ana'}} p2={{nickname: 'Leo'}} winner={null} /> </div> </div> </ScreenWrapper> ); };

const AppContent: React.FC = () => {
    const location = useLocation();
    const publicRoutes = ['/', '/login', '/register'];
    const hasNavbar = !publicRoutes.includes(location.pathname);
    const [eventId, setEventId] = useState<string | null>(null);

    return (
        <EventContext.Provider value={{ eventId, setEventId }}>
            <PageContainer hasNavbar={hasNavbar}>
                {hasNavbar && <Navbar />}
                <Switch>
                    <Route path="/" exact component={Home} />
                    <Route path="/login" component={LoginScreen} />
                    <Route path="/register" component={Register} />
                    <Route path="/auth" component={AuthScreen} />
                    <Route path="/event-hub" render={() => <EventHubScreen user={{ nickname: 'Usuário' }} />} />
                    <Route path="/player-dashboard" component={PlayerDashboard} />
                    <Route path="/music-selection" component={MusicSelectionScreen} />
                    <Route path="/staff-panel" component={StaffPanel} />
                    <Route path="/tournament" component={TournamentPage} />
                    <Route path="/admin/plugins" component={PluginManager} />
                </Switch>
            </PageContainer>
        </EventContext.Provider>
    );
};

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles />
            <Router>
                <AppContent />
            </Router>
        </ThemeProvider>
    );
};

export default App;