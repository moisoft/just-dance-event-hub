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
  video_preview_url?: string;
  duration: number;
  difficulty: 'Fácil' | 'Médio' | 'Difícil' | 'Extremo';
  year: number;
  genre: string;
  approved: boolean;
  coaches: Coach[];
}

export interface Coach {
  id: string;
  name: string;
  image_url: string;
  description?: string;
  specialty?: string;
}

export interface Event {
  id: string;
  name: string;
  organizer_id: string;
  type: 'casual' | 'workshop' | 'party' | 'practice';
  event_code: string;
  status: 'active' | 'inactive' | 'finished';
  created_at: string;
  description?: string;
  max_participants?: number;
  location?: string;
}

export interface Competition {
  id: string;
  name: string;
  organizer_id: string;
  type: 'tournament' | 'championship' | 'league' | 'battle';
  competition_code: string;
  status: 'registration' | 'ongoing' | 'finished' | 'cancelled';
  created_at: string;
  start_date: string;
  end_date?: string;
  prize_pool?: string;
  max_participants: number;
  current_participants: number;
  rules?: string;
  entry_fee?: number;
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