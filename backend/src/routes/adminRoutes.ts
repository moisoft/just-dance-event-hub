import { Router, Request, Response } from 'express';

const router = Router();

// Mock data para usuários
const mockUsers = [
  {
    id: '1',
    nickname: 'superadmin',
    email: 'superadmin@justdancehub.com',
    papel: 'admin',
    xp: 1000,
    nivel: 10,
    is_super_admin: true,
    avatar_ativo_url: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=SA'
  },
  {
    id: '2',
    nickname: 'admin_geral',
    email: 'admin@justdancehub.com',
    papel: 'admin',
    xp: 800,
    nivel: 8,
    is_super_admin: false,
    avatar_ativo_url: 'https://via.placeholder.com/150/E74C3C/FFFFFF?text=AG'
  },
  {
    id: '3',
    nickname: 'staff_suporte',
    email: 'staff@justdancehub.com',
    papel: 'staff',
    xp: 600,
    nivel: 6,
    is_super_admin: false,
    avatar_ativo_url: 'https://via.placeholder.com/150/F39C12/FFFFFF?text=ST'
  },
  {
    id: '4',
    nickname: 'jogador1',
    email: 'player1@test.com',
    papel: 'jogador',
    xp: 150,
    nivel: 2,
    is_super_admin: false,
    avatar_ativo_url: 'https://via.placeholder.com/150/45B7D1/FFFFFF?text=J1'
  }
];

// Rota para obter todos os usuários
router.get('/users', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: mockUsers,
    total: mockUsers.length
  });
});

// Rota para atualizar papel de um usuário
router.put('/users/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const { papel } = req.body;
  
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Usuário não encontrado'
    });
  }
  
  const validRoles = ['jogador', 'staff', 'admin', 'organizador', 'admin_evento'];
  if (!validRoles.includes(papel)) {
    return res.status(400).json({
      success: false,
      error: 'Papel inválido'
    });
  }
  
  const user = mockUsers[userIndex];
  if (user) {
    user.papel = papel;
  }
  
  return res.json({
    success: true,
    message: 'Papel do usuário atualizado com sucesso',
    data: user
  });
});

// Rota para deletar um usuário
router.delete('/users/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Usuário não encontrado'
    });
  }
  
  const user = mockUsers[userIndex];
  if (user && user.is_super_admin) {
    return res.status(403).json({
      success: false,
      error: 'Não é possível deletar um super administrador'
    });
  }
  
  mockUsers.splice(userIndex, 1);
  
  return res.json({
    success: true,
    message: 'Usuário deletado com sucesso'
  });
});

// Admin routes for managing events, competitions, musics, coaches, queue, and tournaments
router.get('/events', (_req, res) => {
  const mockEvents = [
    {
      id: '1',
      name: 'Workshop de Dança',
      organizer_id: '1',
      type: 'workshop',
      event_code: 'WS001',
      status: 'active',
      created_at: '2024-01-15T10:00:00Z',
      description: 'Workshop para iniciantes',
      max_participants: 20,
      location: 'Estúdio Principal'
    },
    {
      id: '2',
      name: 'Festa Dançante',
      organizer_id: '2',
      type: 'party',
      event_code: 'PT002',
      status: 'active',
      created_at: '2024-01-16T19:00:00Z',
      description: 'Festa com as melhores músicas',
      max_participants: 50,
      location: 'Salão de Eventos'
    }
  ];
  res.json({ success: true, data: mockEvents });
});

router.get('/competitions', (_req, res) => {
  const mockCompetitions = [
    {
      id: '1',
      name: 'Campeonato de Verão 2024',
      organizer_id: '1',
      type: 'championship',
      competition_code: 'CV2024',
      status: 'registration',
      created_at: '2024-01-10T08:00:00Z',
      start_date: '2024-02-01T10:00:00Z',
      end_date: '2024-02-03T18:00:00Z',
      prize_pool: 'R$ 5.000',
      max_participants: 32,
      current_participants: 18,
      rules: 'Competição individual com eliminatórias',
      entry_fee: 50
    },
    {
      id: '2',
      name: 'Torneio Relâmpago',
      organizer_id: '2',
      type: 'tournament',
      competition_code: 'TR001',
      status: 'ongoing',
      created_at: '2024-01-20T14:00:00Z',
      start_date: '2024-01-25T15:00:00Z',
      prize_pool: 'R$ 1.000',
      max_participants: 16,
      current_participants: 16,
      rules: 'Torneio rápido, melhor de 3',
      entry_fee: 25
    }
  ];
  res.json({ success: true, data: mockCompetitions });
});

router.get('/coaches', (_req, res) => {
  const mockCoaches = [
    {
      id: '1',
      name: 'Sara',
      image_url: 'https://via.placeholder.com/150x200/FF6B6B/FFFFFF?text=Sara',
      description: 'Coach especialista em pop',
      specialty: 'Pop'
    },
    {
      id: '2',
      name: 'Mike',
      image_url: 'https://via.placeholder.com/150x200/4ECDC4/FFFFFF?text=Mike',
      description: 'Coach de hip-hop e street dance',
      specialty: 'Hip-Hop'
    },
    {
      id: '3',
      name: 'Luna',
      image_url: 'https://via.placeholder.com/150x200/45B7D1/FFFFFF?text=Luna',
      description: 'Coach de dança latina',
      specialty: 'Latino'
    },
    {
      id: '4',
      name: 'Alex',
      image_url: 'https://via.placeholder.com/150x200/96CEB4/FFFFFF?text=Alex',
      description: 'Coach de K-Pop',
      specialty: 'K-Pop'
    }
  ];
  res.json({ success: true, data: mockCoaches });
});

router.post('/events', (req, res) => {
  const { nome_evento, tipo, codigo_evento } = req.body;
  const newEvent = {
    id: Date.now().toString(),
    nome_evento,
    tipo,
    codigo_evento,
    status: 'ativo',
    created_at: new Date().toISOString()
  };
  res.json({ success: true, data: newEvent });
});

router.put('/events/:id', (_req, res) => {
  res.json({ success: true, message: 'Evento atualizado com sucesso' });
});

router.delete('/events/:id', (_req, res) => {
  res.json({ success: true, message: 'Evento deletado com sucesso' });
});

// Rotas para gerenciar músicas
router.get('/musics', (_req, res) => {
  const mockMusics = [
    {
      id: '1',
      name: 'Flowers',
      artist: 'Miley Cyrus',
      artwork_url: 'https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Flowers',
      game_mode: 'Solo',
      coach_images: ['https://via.placeholder.com/150x200/FF6B6B/FFFFFF?text=Sara'],
      video_file_url: 'https://example.com/flowers.mp4',
      video_preview_url: 'https://example.com/flowers_preview.mp4',
      duration: 200,
      difficulty: 'Médio',
      year: 2023,
      genre: 'Pop',
      approved: true,
      coaches: [
        {
          id: '1',
          name: 'Sara',
          image_url: 'https://via.placeholder.com/150x200/FF6B6B/FFFFFF?text=Sara',
          description: 'Coach especialista em pop',
          specialty: 'Pop'
        }
      ]
    },
    {
      id: '2',
      name: 'As It Was',
      artist: 'Harry Styles',
      artwork_url: 'https://via.placeholder.com/300x300/4ECDC4/FFFFFF?text=As+It+Was',
      game_mode: 'Solo',
      coach_images: ['https://via.placeholder.com/150x200/4ECDC4/FFFFFF?text=Mike'],
      video_file_url: 'https://example.com/asitwas.mp4',
      video_preview_url: 'https://example.com/asitwas_preview.mp4',
      duration: 167,
      difficulty: 'Fácil',
      year: 2022,
      genre: 'Pop',
      approved: true,
      coaches: [
        {
          id: '2',
          name: 'Mike',
          image_url: 'https://via.placeholder.com/150x200/4ECDC4/FFFFFF?text=Mike',
          description: 'Coach de hip-hop e street dance',
          specialty: 'Hip-Hop'
        }
      ]
    },
    {
      id: '3',
      name: 'Unholy',
      artist: 'Sam Smith ft. Kim Petras',
      artwork_url: 'https://via.placeholder.com/300x300/45B7D1/FFFFFF?text=Unholy',
      game_mode: 'Dueto',
      coach_images: [
        'https://via.placeholder.com/150x200/45B7D1/FFFFFF?text=Luna',
        'https://via.placeholder.com/150x200/96CEB4/FFFFFF?text=Alex'
      ],
      video_file_url: 'https://example.com/unholy.mp4',
      video_preview_url: 'https://example.com/unholy_preview.mp4',
      duration: 156,
      difficulty: 'Difícil',
      year: 2022,
      genre: 'Pop',
      approved: true,
      coaches: [
        {
          id: '3',
          name: 'Luna',
          image_url: 'https://via.placeholder.com/150x200/45B7D1/FFFFFF?text=Luna',
          description: 'Coach de dança latina',
          specialty: 'Latino'
        },
        {
          id: '4',
          name: 'Alex',
          image_url: 'https://via.placeholder.com/150x200/96CEB4/FFFFFF?text=Alex',
          description: 'Coach de K-Pop',
          specialty: 'K-Pop'
        }
      ]
    }
  ];
  res.json({ success: true, data: mockMusics });
});

router.post('/musics', (req, res) => {
  const { titulo, artista, duracao, dificuldade, ano, genero } = req.body;
  const newMusic = {
    id: Date.now().toString(),
    titulo,
    artista,
    duracao,
    dificuldade,
    ano,
    genero,
    aprovada: false
  };
  res.json({ success: true, data: newMusic });
});

router.put('/musics/:id', (_req, res) => {
  res.json({ success: true, message: 'Música atualizada com sucesso' });
});

router.delete('/musics/:id', (_req, res) => {
  res.json({ success: true, message: 'Música deletada com sucesso' });
});

// Rotas para gerenciar fila
router.get('/queue', (_req, res) => {
  const mockQueue = [
    {
      id: '1',
      id_evento: '1',
      id_jogador: '3',
      id_musica: '1',
      status: 'pendente',
      pontuacao: null,
      created_at: '2024-01-15T10:30:00Z',
      jogador: { nickname: 'staff_suporte' },
      musica: { titulo: 'Shape of You', artista: 'Ed Sheeran' }
    }
  ];
  res.json({ success: true, data: mockQueue });
});

router.put('/queue/:id', (_req, res) => {
  res.json({ success: true, message: 'Item da fila atualizado com sucesso' });
});

router.delete('/queue/:id', (_req, res) => {
  res.json({ success: true, message: 'Item removido da fila com sucesso' });
});

// Rotas para gerenciar torneios
router.get('/tournaments', (_req, res) => {
  const mockTournaments = [
    {
      id: '1',
      id_evento: '2',
      nome: 'Torneio Principal',
      status: 'inscricoes',
      max_participantes: 16,
      created_at: '2024-01-10T14:00:00Z',
      participantes_count: 8
    }
  ];
  res.json({ success: true, data: mockTournaments });
});

router.post('/tournaments', (req, res) => {
  const { nome, max_participantes, id_evento } = req.body;
  const newTournament = {
    id: Date.now().toString(),
    nome,
    max_participantes,
    id_evento,
    status: 'inscricoes',
    created_at: new Date().toISOString(),
    participantes_count: 0
  };
  res.json({ success: true, data: newTournament });
});

router.put('/tournaments/:id', (_req, res) => {
  res.json({ success: true, message: 'Torneio atualizado com sucesso' });
});

router.delete('/tournaments/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: `Torneio ${id} deletado com sucesso`
  });
});

// Competition routes
router.post('/competitions', (req, res) => {
  const { name, type, competition_code, start_date, max_participants } = req.body;
  res.json({
    success: true,
    data: {
      id: Date.now().toString(),
      name,
      organizer_id: '1',
      type,
      competition_code,
      status: 'registration',
      created_at: new Date().toISOString(),
      start_date,
      max_participants,
      current_participants: 0
    }
  });
});

router.put('/competitions/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  res.json({
    success: true,
    data: { id, ...updateData }
  });
});

router.delete('/competitions/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: `Competição ${id} deletada com sucesso`
  });
});

// Coach routes
router.post('/coaches', (req, res) => {
  const { name, image_url, description, specialty } = req.body;
  res.json({
    success: true,
    data: {
      id: Date.now().toString(),
      name,
      image_url,
      description,
      specialty
    }
  });
});

router.put('/coaches/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  res.json({
    success: true,
    data: { id, ...updateData }
  });
});

router.delete('/coaches/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: `Coach ${id} deletado com sucesso`
  });
});

export default router;