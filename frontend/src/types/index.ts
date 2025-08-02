export interface User {
  id: string;
  nickname: string;
  email: string;
  papel: 'jogador' | 'staff' | 'admin';
  role?: 'jogador' | 'staff' | 'admin'; // Adicionando campo role como alternativa a papel
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
  id: number;
  id_evento: number;
  nome: string;
  tipo: 'individual' | 'team';
  formato: 'eliminacao_simples' | 'round_robin' | 'suico';
  status: 'criada' | 'inscricoes_abertas' | 'em_andamento' | 'finalizada' | 'cancelada';
  max_participantes: number;
  participantes_atuais: number;
  data_inicio: string;
  data_fim?: string;
  premio?: string;
  taxa_inscricao?: number;
  regras?: string;
  chaveamento?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Team {
  id: number;
  id_evento: number;
  nome: string;
  lider_id: number;
  max_membros: number;
  status: 'ativa' | 'inativa' | 'dissolvida';
  codigo_convite: string;
  created_at: string;
  updated_at: string;
  lider?: User;
  membros?: TeamMember[];
}

export interface TeamMember {
  id: number;
  id_team: number;
  id_usuario: number;
  papel: 'lider' | 'membro';
  status: 'ativo' | 'inativo' | 'removido';
  data_entrada: string;
  usuario?: User;
  team?: Team;
}

export interface CompetitionParticipant {
  id: number;
  id_competition: number;
  id_usuario?: number;
  id_team?: number;
  tipo_participacao: 'individual' | 'team';
  status: 'inscrito' | 'confirmado' | 'eliminado' | 'desistente';
  posicao_final?: number;
  pontuacao_total?: number;
  data_inscricao: string;
  usuario?: User;
  team?: Team;
}

export interface Avatar {
  id: string;
  name: string;
  image_url: string;
}

export interface QueueItem {
  id: string;
  type: 'solo' | 'team' | 'tournament_match' | 'duo' | 'trio' | 'quarteto';
  player?: User;
  players?: User[];
  player_ids?: string[]; // Adicionando campo player_ids como alternativa a players
  song: Song;
  music_id?: string; // Adicionando campo music_id como alternativa a song
  coach_image_url: string;
  tournament_name?: string;
  status: string;
}

export interface Tournament {
  id: string;
  name: string;
  event_id?: string; // Adicionando campo event_id
  status: 'Open for Registration' | 'Coming Soon' | 'Closed' | 'inscricoes' | 'em_andamento' | 'finalizado';
  start_time: string;
  registered_players: string[]; // Array of user IDs
  max_participants?: number; // Adicionando campo max_participants
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

export interface Module {
  id: string;
  name: string;
  code: string;
  description?: string;
  version?: string;
  active: boolean;
}

export interface Music extends Song {
  // Music é um alias para Song com possíveis extensões futuras
}

export type AppState = 'auth' | 'hub' | 'in_event' | 'staff_panel' | 'admin_panel' | 'team_hub' | 'kiosk_mode';
export type InEventScreen = 'dashboard' | 'music' | 'competitions' | 'settings';