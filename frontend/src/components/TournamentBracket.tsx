import React from 'react';
import styled, { keyframes } from 'styled-components';
import { TournamentBracketProps, TournamentMatch } from '../types';

const neonGridAnimation = keyframes`
    0% { opacity: 0.8; transform: translateZ(0); }
    50% { opacity: 0.6; transform: translateZ(10px); }
    100% { opacity: 0.8; transform: translateZ(0); }
`;

const glowEffect = keyframes`
    0% { box-shadow: 0 0 15px rgba(255, 0, 127, 0.6), 0 0 30px rgba(0, 255, 255, 0.4); }
    50% { box-shadow: 0 0 25px rgba(255, 0, 127, 0.8), 0 0 50px rgba(0, 255, 255, 0.6); }
    100% { box-shadow: 0 0 15px rgba(255, 0, 127, 0.6), 0 0 30px rgba(0, 255, 255, 0.4); }
`;

const pulseGlow = keyframes`
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.02); }
    100% { opacity: 1; transform: scale(1); }
`;

const BracketContainer = styled.div`
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    padding: 3rem;
    max-width: 1600px;
    margin: 0 auto;
    background-color: rgba(0, 0, 0, 0.9);
    border-radius: 20px;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
            linear-gradient(90deg, rgba(255, 0, 127, 0.1) 1px, transparent 1px) 0 0 / 40px 40px,
            linear-gradient(0deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px) 0 0 / 40px 40px;
        animation: ${neonGridAnimation} 4s infinite;
        pointer-events: none;
        z-index: 0;
    }
`;

const RoundColumn = styled.div<{ round: number }>`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    justify-content: ${({ round }) => round === 2 ? 'center' : 'space-around'};
    position: relative;
    z-index: 1;
`;

const RoundTitle = styled.h2`
    color: ${({ theme }) => theme.colors.secondary};
    font-family: ${({ theme }) => theme.fonts.title};
    font-size: 1.5rem;
    text-align: center;
    margin-bottom: 1.5rem;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
`;

const MatchCard = styled.div<{ isActive: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    gap: 1.5rem;
    background: rgba(46, 46, 46, 0.95);
    border-radius: 15px;
    border: 1px solid rgba(75, 0, 130, 0.3);
    transition: all 0.3s ease;
    cursor: pointer;

    ${({ isActive }) => isActive && `
        animation: ${glowEffect} 3s infinite;
        border: 1px solid rgba(255, 0, 127, 0.5);
    `}

    &:hover {
        transform: scale(1.02);
        border-color: ${({ theme }) => theme.colors.primary};
    }
`;

const PlayerSection = styled.div<{ isWinner?: boolean }>`
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem;
    border-radius: 10px;
    background: ${({ isWinner }) => 
        isWinner 
            ? 'linear-gradient(45deg, rgba(255, 0, 127, 0.2), rgba(0, 255, 255, 0.2))'
            : 'transparent'};
    transition: all 0.3s ease;

    ${({ isWinner }) => isWinner && `
        animation: ${pulseGlow} 2s infinite;
    `}
`;

const Avatar = styled.div<{ url: string }>`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-image: url(${({ url }) => url});
    background-size: cover;
    background-position: center;
    border: 2px solid ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 10px rgba(255, 0, 127, 0.3);
`;

const PlayerInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
`;

const PlayerName = styled.span`
    font-size: 1.1rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.fonts.title};
`;

const Score = styled.span<{ isWinner?: boolean }>`
    font-size: 1.3rem;
    font-weight: bold;
    color: ${({ isWinner, theme }) => 
        isWinner ? theme.colors.secondary : theme.colors.text};
`;

const VsText = styled.div`
    font-size: 1.5rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
    text-shadow: 0 0 10px rgba(255, 0, 127, 0.5);
`;

const TournamentBracket: React.FC<TournamentBracketProps> = ({ tournament, onMatchClick, onPlayerClick }) => {
    const roundMatches = tournament.matches.reduce((acc, match) => {
        if (!acc[match.round]) acc[match.round] = [];
        acc[match.round].push(match);
        return acc;
    }, {} as Record<number, TournamentMatch[]>);

    const getRoundTitle = (round: number) => {
        switch (round) {
            case 1: return 'Quarter Finals';
            case 2: return 'Semi Finals';
            case 3: return 'Final';
            default: return `Round ${round}`;
        }
    };

    const handleMatchClick = (match: TournamentMatch) => {
        if (onMatchClick) onMatchClick(match);
    };

    return (
        <BracketContainer>
            {[1, 2, 3].map((round) => (
                <RoundColumn key={round} round={round}>
                    <RoundTitle>{getRoundTitle(round)}</RoundTitle>
                    {(roundMatches[round] || []).map((match) => {
                        const player1Winner = match.score1 > match.score2;
                        const player2Winner = match.score2 > match.score1;

                        return (
                            <MatchCard 
                                key={match.id} 
                                isActive={match.isActive}
                                onClick={() => handleMatchClick(match)}
                            >
                                <PlayerSection 
                                    isWinner={player1Winner}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onPlayerClick?.(match.player1);
                                    }}
                                >
                                    <Avatar url={match.player1.avatarUrl} />
                                    <PlayerInfo>
                                        <PlayerName>{match.player1.nickname}</PlayerName>
                                        <Score isWinner={player1Winner}>{match.score1}</Score>
                                    </PlayerInfo>
                                </PlayerSection>
                                <VsText>VS</VsText>
                                <PlayerSection 
                                    isWinner={player2Winner}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onPlayerClick?.(match.player2);
                                    }}
                                >
                                    <Avatar url={match.player2.avatarUrl} />
                                    <PlayerInfo>
                                        <PlayerName>{match.player2.nickname}</PlayerName>
                                        <Score isWinner={player2Winner}>{match.score2}</Score>
                                    </PlayerInfo>
                                </PlayerSection>
                            </MatchCard>
                        );
                    })}
                </RoundColumn>
            ))}
        </BracketContainer>
    );
};

export default TournamentBracket;