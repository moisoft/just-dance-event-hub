import React from 'react';
import styled from 'styled-components';
import TournamentBracket from '../components/TournamentBracket';
import { sampleTournament } from '../data/sampleTournament';
import { TournamentMatch, TournamentPlayer } from '../types';

const PageContainer = styled.div`
    min-height: 100vh;
    background-color: ${({ theme }) => theme.colors.background};
    padding: 2rem;
`;

const TournamentHeader = styled.div`
    text-align: center;
    margin-bottom: 3rem;
`;

const TournamentTitle = styled.h1`
    font-family: ${({ theme }) => theme.fonts.title};
    font-size: 2.5rem;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 1rem;
    text-shadow: 0 0 20px rgba(255, 0, 127, 0.5);
`;

const TournamentInfo = styled.div`
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.text};
    opacity: 0.8;
`;

const TournamentPage: React.FC = () => {
    const handleMatchClick = (match: TournamentMatch) => {
        console.log('Match clicked:', match);
        // Handle match click - could show match details, update scores, etc.
    };

    const handlePlayerClick = (player: TournamentPlayer) => {
        console.log('Player clicked:', player);
        // Handle player click - could show player stats, profile, etc.
    };

    return (
        <PageContainer>
            <TournamentHeader>
                <TournamentTitle>{sampleTournament.name}</TournamentTitle>
                <TournamentInfo>
                    Round {sampleTournament.currentRound} of 3 | {sampleTournament.players.length} Players
                </TournamentInfo>
            </TournamentHeader>
            <TournamentBracket 
                tournament={sampleTournament}
                onMatchClick={handleMatchClick}
                onPlayerClick={handlePlayerClick}
            />
        </PageContainer>
    );
};

export default TournamentPage;