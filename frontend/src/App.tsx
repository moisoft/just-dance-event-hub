import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AuthScreen from './components/AuthScreen';
import EventHubScreen from './components/EventHubScreen';
import PlayerDashboard from './components/PlayerDashboard';
import MusicSelectionScreen from './components/MusicSelectionScreen';
import StaffPanel from './components/StaffPanel';
import TournamentBracket from './components/TournamentBracket';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import './styles/theme';

const App = () => {
    return (
        <Router>
            <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
                <Route path="/auth" component={AuthScreen} />
                <Route path="/event-hub" component={EventHubScreen} />
                <Route path="/player-dashboard" component={PlayerDashboard} />
                <Route path="/music-selection" component={MusicSelectionScreen} />
                <Route path="/staff-panel" component={StaffPanel} />
                <Route path="/tournament-bracket" component={TournamentBracket} />
            </Switch>
        </Router>
    );
};

export default App;