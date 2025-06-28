import React from 'react';

interface Match {
    player1: string;
    player2: string;
    score1: number;
    score2: number;
}

interface TournamentBracketProps {
    matches: Match[];
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({ matches }) => {
    return (
        <div className="tournament-bracket">
            {matches.map((match, index) => (
                <div key={index} className="match">
                    <div className="player">
                        <span>{match.player1}</span>
                        <span>{match.score1}</span>
                    </div>
                    <div className="vs">VS</div>
                    <div className="player">
                        <span>{match.player2}</span>
                        <span>{match.score2}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TournamentBracket;