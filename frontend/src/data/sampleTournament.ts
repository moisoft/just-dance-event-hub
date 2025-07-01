import { Tournament } from '../types';

export const sampleTournament: Tournament = {
    id: 'tournament-1',
    eventId: 1,
    name: 'Just Dance Championship 2024',
    startDate: new Date('2024-01-20T10:00:00'),
    players: [
        {
            id: 'player-1',
            userId: 'user-1',
            nickname: 'DanceKing',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DanceKing',
            status: 'active',
            rank: 1
        },
        {
            id: 'player-2',
            userId: 'user-2',
            nickname: 'GrooveMaster',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GrooveMaster',
            status: 'active',
            rank: 2
        },
        {
            id: 'player-3',
            userId: 'user-3',
            nickname: 'RhythmQueen',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RhythmQueen',
            status: 'active',
            rank: 3
        },
        {
            id: 'player-4',
            userId: 'user-4',
            nickname: 'BeatBreaker',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BeatBreaker',
            status: 'active',
            rank: 4
        },
        {
            id: 'player-5',
            userId: 'user-5',
            nickname: 'MoveNinja',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MoveNinja',
            status: 'eliminated',
            rank: 5
        },
        {
            id: 'player-6',
            userId: 'user-6',
            nickname: 'StepMaster',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StepMaster',
            status: 'eliminated',
            rank: 6
        },
        {
            id: 'player-7',
            userId: 'user-7',
            nickname: 'DanceNinja',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DanceNinja',
            status: 'eliminated',
            rank: 7
        },
        {
            id: 'player-8',
            userId: 'user-8',
            nickname: 'GrooveWarrior',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GrooveWarrior',
            status: 'eliminated',
            rank: 8
        }
    ],
    matches: [
        // Quarter Finals (Round 1)
        {
            id: 'match-1',
            eventId: 1,
            round: 1,
            matchNumber: 1,
            player1: {
                id: 'player-1',
                userId: 'user-1',
                nickname: 'DanceKing',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DanceKing',
                status: 'active'
            },
            player2: {
                id: 'player-8',
                userId: 'user-8',
                nickname: 'GrooveWarrior',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GrooveWarrior',
                status: 'eliminated'
            },
            score1: 12000,
            score2: 10500,
            musicId: 1,
            isActive: false,
            status: 'completed'
        },
        {
            id: 'match-2',
            eventId: 1,
            round: 1,
            matchNumber: 2,
            player1: {
                id: 'player-4',
                userId: 'user-4',
                nickname: 'BeatBreaker',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BeatBreaker',
                status: 'active'
            },
            player2: {
                id: 'player-5',
                userId: 'user-5',
                nickname: 'MoveNinja',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MoveNinja',
                status: 'eliminated'
            },
            score1: 11800,
            score2: 11200,
            musicId: 2,
            isActive: false,
            status: 'completed'
        },
        {
            id: 'match-3',
            eventId: 1,
            round: 1,
            matchNumber: 3,
            player1: {
                id: 'player-2',
                userId: 'user-2',
                nickname: 'GrooveMaster',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GrooveMaster',
                status: 'active'
            },
            player2: {
                id: 'player-7',
                userId: 'user-7',
                nickname: 'DanceNinja',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DanceNinja',
                status: 'eliminated'
            },
            score1: 13000,
            score2: 12500,
            musicId: 3,
            isActive: false,
            status: 'completed'
        },
        {
            id: 'match-4',
            eventId: 1,
            round: 1,
            matchNumber: 4,
            player1: {
                id: 'player-3',
                userId: 'user-3',
                nickname: 'RhythmQueen',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RhythmQueen',
                status: 'active'
            },
            player2: {
                id: 'player-6',
                userId: 'user-6',
                nickname: 'StepMaster',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StepMaster',
                status: 'eliminated'
            },
            score1: 12800,
            score2: 12000,
            musicId: 4,
            isActive: false,
            status: 'completed'
        },
        // Semi Finals (Round 2)
        {
            id: 'match-5',
            eventId: 1,
            round: 2,
            matchNumber: 5,
            player1: {
                id: 'player-1',
                userId: 'user-1',
                nickname: 'DanceKing',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DanceKing',
                status: 'active'
            },
            player2: {
                id: 'player-4',
                userId: 'user-4',
                nickname: 'BeatBreaker',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BeatBreaker',
                status: 'active'
            },
            score1: 13500,
            score2: 13200,
            musicId: 5,
            isActive: false,
            status: 'completed'
        },
        {
            id: 'match-6',
            eventId: 1,
            round: 2,
            matchNumber: 6,
            player1: {
                id: 'player-2',
                userId: 'user-2',
                nickname: 'GrooveMaster',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GrooveMaster',
                status: 'active'
            },
            player2: {
                id: 'player-3',
                userId: 'user-3',
                nickname: 'RhythmQueen',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RhythmQueen',
                status: 'active'
            },
            score1: 14000,
            score2: 13800,
            musicId: 6,
            isActive: false,
            status: 'completed'
        },
        // Final (Round 3)
        {
            id: 'match-7',
            eventId: 1,
            round: 3,
            matchNumber: 7,
            player1: {
                id: 'player-1',
                userId: 'user-1',
                nickname: 'DanceKing',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DanceKing',
                status: 'active'
            },
            player2: {
                id: 'player-2',
                userId: 'user-2',
                nickname: 'GrooveMaster',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GrooveMaster',
                status: 'active'
            },
            score1: 0,
            score2: 0,
            musicId: 7,
            isActive: true,
            status: 'in_progress'
        }
    ],
    currentRound: 3,
    maxParticipants: 8,
    status: 'in_progress',
    tournamentModel: 'single_elimination'
};

// Exportando mocks para uso no App.tsx
export const MOCK_AVATARS = sampleTournament.players.map(player => ({
  id: player.id,
  name: player.nickname,
  imageUrl: player.avatarUrl
}));

export const MOCK_TOURNAMENT_MATCHES = sampleTournament.matches.map(match => ({
  p1: match.player1,
  p2: match.player2,
  winner: match.score1 > match.score2 ? match.player1.nickname : (match.score2 > match.score1 ? match.player2.nickname : null)
}));