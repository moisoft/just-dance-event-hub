// frontend/src/types/index.ts
export interface User {
    id: string;
    nickname: string;
    email: string;
    passwordHash: string;
    role: 'jogador' | 'staff' | 'organizador' | 'admin';
    xp: number;
    level: number;
    activeAvatarUrl?: string;
}

export interface Avatar {
    id: number;
    name: string;
    imageUrl: string;
    unlockType: 'inicial' | 'nivel' | 'conquista' | 'exclusivo';
    requiredLevel?: number;
    requiredAchievementId?: number;
}

export interface Music {
    id: number;
    name: string;
    artist?: string;
    gameVersion?: string;
    difficulty: number;
    artworkUrl?: string;
    videoPreviewUrl?: string;
    mode: 'Solo' | 'Dueto' | 'Trio' | 'Quarteto';
}

export interface Event {
    id: number;
    name: string;
    organizerId: string;
    type: 'casual' | 'torneio';
    eventCode: string;
    status?: string;
}

export interface EventDetails {
    id: number;
    nome_evento: string;
    id_organizador: string;
    tipo: 'casual' | 'torneio';
    status: string;
}

export interface Queue {
    id: number;
    eventId: number;
    userId: string;
    musicId: number;
    teamId?: string;
    selectedCoach: string;
    status: 'na_fila' | 'jogando' | 'finalizado';
    score?: number;
    stars?: number;
    addedAt?: string;
}

// Enhanced Tournament Types
export interface TournamentPlayer {
    id: string;
    nickname: string;
    avatarUrl: string;
    score?: number;
    rank?: number;
    userId: string; // Reference to User
    status: 'registered' | 'active' | 'eliminated';
}

export interface TournamentMatch {
    id: string;
    eventId: number;
    round: number;
    matchNumber: number;
    player1: TournamentPlayer;
    player2: TournamentPlayer;
    score1: number;
    score2: number;
    musicId: number;
    isActive: boolean;
    startTime?: Date;
    endTime?: Date;
    status: 'pending' | 'in_progress' | 'completed';
    winnerId?: string;
}

export interface Tournament {
    id: string;
    eventId: number;
    name: string;
    startDate: Date;
    endDate?: Date;
    players: TournamentPlayer[];
    matches: TournamentMatch[];
    currentRound: number;
    maxParticipants: number;
    status: 'registration' | 'in_progress' | 'completed';
    winner?: TournamentPlayer;
    tournamentModel: string;
}

export interface TournamentBracketProps {
    tournament: Tournament;
    onMatchClick?: (match: TournamentMatch) => void;
    onPlayerClick?: (player: TournamentPlayer) => void;
}