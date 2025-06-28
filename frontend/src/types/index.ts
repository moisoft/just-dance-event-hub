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

export interface Tournament {
    eventId: number;
    tournamentModel: string;
    maxParticipants: number;
}

export interface TournamentMatch {
    id: number;
    eventId: number;
    round: number;
    player1Id: string;
    player2Id: string;
    drawnMusicId: number;
    player1Score?: number;
    player2Score?: number;
    winnerId?: string;
    status?: string;
}