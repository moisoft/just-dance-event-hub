import React from 'react';
import { BrowserRouter as Router, Route, Switch, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import AuthScreen from './components/AuthScreen';
import EventHubScreen from './components/EventHubScreen';
import PlayerDashboard from './components/PlayerDashboard';
import MusicSelectionScreen from './components/MusicSelectionScreen';
import StaffPanel from './components/StaffPanel';
import TournamentBracket from './components/TournamentBracket';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import theme from './styles/theme';
import { GlobalStyles } from './styles/globalStyles';
import styled from 'styled-components';

const PageContainer = styled.div<{ hasNavbar: boolean }>`
    padding-top: ${({ hasNavbar }) => hasNavbar ? '80px' : '0'};
`;

const AppContent: React.FC = () => {
    const location = useLocation();
    const publicRoutes = ['/', '/login', '/register'];
    const hasNavbar = !publicRoutes.includes(location.pathname);

    return (
        <PageContainer hasNavbar={hasNavbar}>
            {hasNavbar && <Navbar />}
            <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
                <Route path="/auth" component={AuthScreen} />
                <Route path="/event-hub/:code" component={EventHubScreen} />
                <Route path="/player-dashboard" component={PlayerDashboard} />
                <Route path="/music-selection" component={MusicSelectionScreen} />
                <Route path="/staff-panel" component={StaffPanel} />
                <Route path="/tournament-bracket" component={TournamentBracket} />
            </Switch>
        </PageContainer>
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