import { User, Song, Avatar, QueueItem, Tournament } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user1',
    nickname: 'PlayerOne',
    email: 'player@example.com',
    papel: 'jogador',
    xp: 1200,
    nivel: 12,
    avatar_ativo_url: 'https://via.placeholder.com/150/FF69B4/000000?text=P1'
  },
  {
    id: 'user2',
    nickname: 'StaffMember',
    email: 'staff@example.com',
    papel: 'staff',
    xp: 5000,
    nivel: 50,
    avatar_ativo_url: 'https://via.placeholder.com/150/8A2BE2/FFFFFF?text=Staff'
  },
  {
    id: 'user3',
    nickname: 'AdminBoss',
    email: 'admin@example.com',
    papel: 'admin',
    xp: 10000,
    nivel: 100,
    avatar_ativo_url: 'https://via.placeholder.com/150/00FFFF/000000?text=Admin'
  },
];

export const mockSongs: Song[] = [
  {
    id: 'song1',
    name: 'Bad Romance',
    artist: 'Lady Gaga',
    video_file_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    artwork_url: 'https://via.placeholder.com/200x200/FF1493/FFFFFF?text=Bad+Romance',
    game_mode: 'Solo',
    coach_images: ['https://via.placeholder.com/50/FF1493?text=C1'],
    video_preview_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: 240,
    difficulty: 'Médio',
    year: 2009,
    genre: 'Pop',
    approved: true,
    coaches: [{
      id: 'coach1',
      name: 'Gaga Coach',
      image_url: 'https://via.placeholder.com/50/FF1493?text=C1',
      description: 'Expert em pop dance',
      specialty: 'Pop Dance'
    }]
  },
  {
    id: 'song2',
    name: 'Blinding Lights',
    artist: 'The Weeknd',
    video_file_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    artwork_url: 'https://via.placeholder.com/200x200/00FFFF/000000?text=Blinding+Lights',
    game_mode: 'Solo',
    coach_images: ['https://via.placeholder.com/50/00FFFF?text=C2'],
    video_preview_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: 200,
    difficulty: 'Fácil',
    year: 2019,
    genre: 'Synthpop',
    approved: true,
    coaches: [{
      id: 'coach2',
      name: 'Neon Coach',
      image_url: 'https://via.placeholder.com/50/00FFFF?text=C2',
      description: 'Especialista em synthpop',
      specialty: 'Synthpop'
    }]
  },
  {
    id: 'song3',
    name: 'Despacito',
    artist: 'Luis Fonsi ft. Daddy Yankee',
    video_file_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    artwork_url: 'https://via.placeholder.com/200x200/FF69B4/000000?text=Despacito',
    game_mode: 'Dueto',
    coach_images: ['https://via.placeholder.com/50/FF69B4?text=C3', 'https://via.placeholder.com/50/FF69B4?text=C4'],
    video_preview_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: 228,
    difficulty: 'Difícil',
    year: 2017,
    genre: 'Reggaeton',
    approved: true,
    coaches: [{
      id: 'coach3',
      name: 'Latin Coach 1',
      image_url: 'https://via.placeholder.com/50/FF69B4?text=C3',
      description: 'Expert em reggaeton',
      specialty: 'Reggaeton'
    }, {
      id: 'coach4',
      name: 'Latin Coach 2',
      image_url: 'https://via.placeholder.com/50/FF69B4?text=C4',
      description: 'Especialista em dança latina',
      specialty: 'Latin Dance'
    }]
  },
  {
    id: 'song4',
    name: 'Uptown Funk',
    artist: 'Mark Ronson ft. Bruno Mars',
    video_file_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    artwork_url: 'https://via.placeholder.com/200x200/8A2BE2/FFFFFF?text=Uptown+Funk',
    game_mode: 'Solo',
    coach_images: ['https://via.placeholder.com/50/8A2BE2?text=C5'],
    video_preview_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: 270,
    difficulty: 'Extremo',
    year: 2014,
    genre: 'Funk',
    approved: true,
    coaches: [{
      id: 'coach5',
      name: 'Funk Master',
      image_url: 'https://via.placeholder.com/50/8A2BE2?text=C5',
      description: 'Mestre do funk',
      specialty: 'Funk'
    }]
  },
  {
    id: 'song5',
    name: 'Shape of You',
    artist: 'Ed Sheeran',
    video_file_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    artwork_url: 'https://via.placeholder.com/200x200/FFD700/000000?text=Shape+of+You',
    game_mode: 'Solo',
    coach_images: ['https://via.placeholder.com/50/FFD700?text=C6'],
    video_preview_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: 233,
    difficulty: 'Médio',
    year: 2017,
    genre: 'Pop',
    approved: false,
    coaches: [{
      id: 'coach6',
      name: 'Pop Coach',
      image_url: 'https://via.placeholder.com/50/FFD700?text=C6',
      description: 'Especialista em pop moderno',
      specialty: 'Modern Pop'
    }]
  }
];

export const mockAvatars: Avatar[] = [
  {
    id: 'avatar1',
    name: 'Cool Dancer',
    image_url: 'https://via.placeholder.com/100/FF69B4/000000?text=Avatar1'
  },
  {
    id: 'avatar2',
    name: 'Groovy Mover',
    image_url: 'https://via.placeholder.com/100/00FFFF/000000?text=Avatar2'
  }
];

export const mockQueue: QueueItem[] = [
  {
    id: 'queue1',
    type: 'solo',
    player: mockUsers[0],
    song: mockSongs[0],
    coach_image_url: mockSongs[0].coach_images[0],
    status: 'pending'
  },
  {
    id: 'queue2',
    type: 'team',
    players: [mockUsers[0], mockUsers[1]],
    song: mockSongs[2],
    coach_image_url: mockSongs[2].coach_images[0],
    status: 'pending'
  },
  {
    id: 'queue3',
    type: 'tournament_match',
    players: [mockUsers[0], mockUsers[2]],
    tournament_name: 'Summer Championship',
    song: mockSongs[1],
    coach_image_url: mockSongs[1].coach_images[0],
    status: 'pending'
  }
];

export const mockTournaments: Tournament[] = [
  {
    id: 'tournament1',
    name: 'Just Dance Summer Championship',
    status: 'Open for Registration',
    start_time: '2024-08-15T18:00:00Z',
    registered_players: [mockUsers[0].id]
  },
  {
    id: 'tournament2',
    name: 'Winter Dance-off',
    status: 'Coming Soon',
    start_time: '2024-12-01T19:00:00Z',
    registered_players: []
  }
];

export const mockRankings = {
  'song1': {
    'user1': { score: 10000, stars: 5 },
    'user2': { score: 8000, stars: 4 }
  },
  'song2': {
    'user1': { score: 9500, stars: 5 }
  }
};