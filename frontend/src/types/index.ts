export interface User {
  id: string;
  nickname: string;
  email: string;
  papel: 'jogador' | 'staff' | 'admin';
  xp: number;
  nivel: number;
  avatar_ativo_url: string;
}

export interface Song {
  id: string;
  name: string;
  artist: string;
  artwork_url: string;
  game_mode: 'Solo' | 'Dueto' | 'Team';
  coach_images: string[];
  video_file_url: string;
}

export interface Avatar {
  id: string;
  name: string;
  image_url: string;
}

export interface QueueItem {
  id: string;
  type: 'solo' | 'team' | 'tournament_match';
  player?: User;
  players?: User[];
  song: Song;
  coach_image_url: string;
  tournament_name?: string;
  status: string;
}

export interface Tournament {
  id: string;
  name: string;
  status: 'Open for Registration' | 'Coming Soon' | 'Closed';
  start_time: string;
  registered_players: string[]; // Array of user IDs
}

export interface RankingEntry {
  score: number;
  stars: number;
}

export interface Rankings {
  [songId: string]: {
    [userId: string]: RankingEntry;
  };
}

export type AppState = 'auth' | 'hub' | 'in_event' | 'staff_panel' | 'admin_panel' | 'team_hub' | 'kiosk_mode';
export type InEventScreen = 'dashboard' | 'music' | 'competitions' | 'settings';