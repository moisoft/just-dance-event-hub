import React from 'react';
import styled, { keyframes } from 'styled-components';

interface Match {
    player1: string;
    player2: string;
    score1: number;
    score2: number;
}

interface TournamentBracketProps {
    matches: Match[];
}

const glowEffect = keyframes`
    0% { box-shadow: 0 0 10px rgba(255, 0, 127, 0.5); }
    50% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.7); }
    100% { box-shadow: 0 0 10px rgba(255, 0, 127, 0.5); }
`;

const pulseGlow = keyframes`
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
`;

const BracketContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
`;

const MatchCard = styled.div.attrs({
    className: 'card'
})`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    gap: 2rem;
    animation: ${glowEffect} 3s infinite;
    transition: transform 0.3s ease;

    &:hover {
        transform: scale(1.02);
    }
`;

const PlayerSection = styled.div<{ isWinner?: boolean }>`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: 10px;
    background: ${({ isWinner, theme }) => 
        isWinner 
            ? `linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.secondary})` 
            : 'rgba(255, 255, 255, 0.1)'};
    transition: all 0.3s ease;

    ${({ isWinner }) => isWinner && `
        &.pulse-element {
            animation: ${pulseGlow} 1.5s infinite;
        }
    `}
`;

const PlayerName = styled.span.attrs({
    className: 'gradient-text'
})`
    font-size: 1.2rem;
    font-weight: bold;
`;

const Score = styled.span.attrs<{ isWinner?: boolean }>(({ isWinner }) => ({
    className: isWinner ? 'neon-text' : ''
}))<{ isWinner?: boolean }>`
    font-size: 1.5rem;
    font-weight: bold;
`;

const VsText = styled.div.attrs({
    className: 'floating-element neon-text'
})`
    font-size: 2rem;
    font-weight: bold;
    padding: 1rem;
`;

const TournamentBracket: React.FC<TournamentBracketProps> = ({ matches }) => {
    return (
        <BracketContainer>
            {matches.map((match, index) => {
                const player1Winner = match.score1 > match.score2;
                const player2Winner = match.score2 > match.score1;

                return (
                    <MatchCard key={index}>
                        <PlayerSection isWinner={player1Winner}>
                            <PlayerName>{match.player1}</PlayerName>
                            <Score isWinner={player1Winner}>{match.score1}</Score>
                        </PlayerSection>
                        <VsText>VS</VsText>
                        <PlayerSection isWinner={player2Winner}>
                            <PlayerName>{match.player2}</PlayerName>
                            <Score isWinner={player2Winner}>{match.score2}</Score>
                        </PlayerSection>
                    </MatchCard>
                );
            })}
        </BracketContainer>
    );
};

export default TournamentBracket;