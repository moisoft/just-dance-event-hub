import { Router } from 'express';

const router = Router();

// Mock data
const mockUsers = [
    // Super Admin (Máximo poder no sistema)
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
    // Admin Geral (Poder administrativo geral)
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
    // Staff (Suporte e moderação)
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
        nickname: 'staff_moderador',
        email: 'moderador@justdancehub.com',
        papel: 'staff',
        xp: 550,
        nivel: 5,
        is_super_admin: false,
        avatar_ativo_url: 'https://via.placeholder.com/150/F39C12/FFFFFF?text=MO'
    },
    // Admin de Evento (Administra eventos específicos)
    {
        id: '5',
        nickname: 'admin_evento1',
        email: 'admin.evento1@test.com',
        papel: 'admin_evento',
        xp: 400,
        nivel: 4,
        is_super_admin: false,
        avatar_ativo_url: 'https://via.placeholder.com/150/9B59B6/FFFFFF?text=AE1'
    },
    {
        id: '6',
        nickname: 'admin_evento2',
        email: 'admin.evento2@test.com',
        papel: 'admin_evento',
        xp: 350,
        nivel: 3,
        is_super_admin: false,
        avatar_ativo_url: 'https://via.placeholder.com/150/9B59B6/FFFFFF?text=AE2'
    },
    // Organizadores (Criam e gerenciam eventos)
    {
        id: '7',
        nickname: 'organizador1',
        email: 'org1@test.com',
        papel: 'organizador',
        xp: 500,
        nivel: 5,
        is_super_admin: false,
        avatar_ativo_url: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=O1'
    },
    {
        id: '8',
        nickname: 'organizador2',
        email: 'org2@test.com',
        papel: 'organizador',
        xp: 450,
        nivel: 4,
        is_super_admin: false,
        avatar_ativo_url: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=O2'
    },
    // Jogadores (Usuários comuns)
    {
        id: '9',
        nickname: 'jogador1',
        email: 'player1@test.com',
        papel: 'jogador',
        xp: 150,
        nivel: 2,
        is_super_admin: false,
        avatar_ativo_url: 'https://via.placeholder.com/150/45B7D1/FFFFFF?text=J1'
    },
    {
        id: '10',
        nickname: 'jogador2',
        email: 'player2@test.com',
        papel: 'jogador',
        xp: 200,
        nivel: 3,
        is_super_admin: false,
        avatar_ativo_url: 'https://via.placeholder.com/150/45B7D1/FFFFFF?text=J2'
    },
    {
        id: '11',
        nickname: 'jogador3',
        email: 'player3@test.com',
        papel: 'jogador',
        xp: 100,
        nivel: 1,
        is_super_admin: false,
        avatar_ativo_url: 'https://via.placeholder.com/150/45B7D1/FFFFFF?text=J3'
    },
    {
        id: '12',
        nickname: 'jogador_pro',
        email: 'pro.player@test.com',
        papel: 'jogador',
        xp: 750,
        nivel: 7,
        is_super_admin: false,
        avatar_ativo_url: 'https://via.placeholder.com/150/45B7D1/FFFFFF?text=PRO'
    }
];

const mockEvents = [
    {
        id: '1',
        nome_evento: 'Just Dance Party 2024',
        id_organizador: '7',
        tipo: 'casual',
        codigo_evento: 'PARTY2024',
        status: 'ativo',
        created_at: '2024-01-15T10:00:00Z',
        organizador: mockUsers[6],
        modules: [
            { modulo: 'queue', ativo: true, configuracao: { max_songs_per_user: 3, cooldown_minutes: 5 } },
            { modulo: 'tournament', ativo: false, configuracao: { max_participants: 16 } },
            { modulo: 'xp_system', ativo: true, configuracao: { xp_per_song: 10 } },
            { modulo: 'leaderboard', ativo: true, configuracao: { show_top: 10 } },
            { modulo: 'chat', ativo: true, configuracao: { max_message_length: 200 } },
            { modulo: 'music_requests', ativo: true, configuracao: { allow_requests: true } },
            { modulo: 'team_mode', ativo: false, configuracao: { max_team_size: 4 } },
            { modulo: 'voting', ativo: false, configuracao: { enabled: false } }
        ]
    },
    {
        id: '2',
        nome_evento: 'Torneio Competitivo',
        id_organizador: '1',
        tipo: 'torneio',
        codigo_evento: 'TORNEIO2024',
        status: 'ativo',
        created_at: '2024-01-10T14:00:00Z',
        organizador: mockUsers[0],
        modules: [
            { modulo: 'queue', ativo: true, configuracao: { max_songs_per_user: 2, cooldown_minutes: 10 } },
            { modulo: 'tournament', ativo: true, configuracao: { max_participants: 32 } },
            { modulo: 'xp_system', ativo: true, configuracao: { xp_per_song: 15 } },
            { modulo: 'leaderboard', ativo: true, configuracao: { show_top: 20 } },
            { modulo: 'chat', ativo: false, configuracao: { enabled: false } },
            { modulo: 'music_requests', ativo: false, configuracao: { allow_requests: false } },
            { modulo: 'team_mode', ativo: true, configuracao: { max_team_size: 2 } },
            { modulo: 'voting', ativo: true, configuracao: { enabled: true } }
        ]
    },
    {
        id: '3',
        nome_evento: 'Festa da Galera',
        id_organizador: '8',
        tipo: 'casual',
        codigo_evento: 'FESTA2024',
        status: 'ativo',
        created_at: '2024-01-12T16:00:00Z',
        organizador: mockUsers[7],
        modules: [
            { modulo: 'queue', ativo: true, configuracao: { max_songs_per_user: 5, cooldown_minutes: 2 } },
            { modulo: 'tournament', ativo: false, configuracao: { max_participants: 16 } },
            { modulo: 'xp_system', ativo: true, configuracao: { xp_per_song: 8 } },
            { modulo: 'leaderboard', ativo: true, configuracao: { show_top: 15 } },
            { modulo: 'chat', ativo: true, configuracao: { max_message_length: 300 } },
            { modulo: 'music_requests', ativo: true, configuracao: { allow_requests: true } },
            { modulo: 'team_mode', ativo: true, configuracao: { max_team_size: 6 } },
            { modulo: 'voting', ativo: true, configuracao: { enabled: true } }
        ]
    },
    {
        id: '4',
        nome_evento: 'Campeonato Regional',
        id_organizador: '5',
        tipo: 'torneio',
        codigo_evento: 'REGIONAL2024',
        status: 'ativo',
        created_at: '2024-01-08T09:00:00Z',
        organizador: mockUsers[4],
        modules: [
            { modulo: 'queue', ativo: true, configuracao: { max_songs_per_user: 1, cooldown_minutes: 15 } },
            { modulo: 'tournament', ativo: true, configuracao: { max_participants: 64 } },
            { modulo: 'xp_system', ativo: true, configuracao: { xp_per_song: 20 } },
            { modulo: 'leaderboard', ativo: true, configuracao: { show_top: 50 } },
            { modulo: 'chat', ativo: false, configuracao: { enabled: false } },
            { modulo: 'music_requests', ativo: false, configuracao: { allow_requests: false } },
            { modulo: 'team_mode', ativo: false, configuracao: { max_team_size: 1 } },
            { modulo: 'voting', ativo: false, configuracao: { enabled: false } }
        ]
    },
    {
        id: '5',
        nome_evento: 'Noite das Estrelas',
        id_organizador: '6',
        tipo: 'casual',
        codigo_evento: 'ESTRELAS2024',
        status: 'ativo',
        created_at: '2024-01-14T20:00:00Z',
        organizador: mockUsers[5],
        modules: [
            { modulo: 'queue', ativo: true, configuracao: { max_songs_per_user: 4, cooldown_minutes: 3 } },
            { modulo: 'tournament', ativo: false, configuracao: { max_participants: 16 } },
            { modulo: 'xp_system', ativo: true, configuracao: { xp_per_song: 12 } },
            { modulo: 'leaderboard', ativo: true, configuracao: { show_top: 25 } },
            { modulo: 'chat', ativo: true, configuracao: { max_message_length: 150 } },
            { modulo: 'music_requests', ativo: true, configuracao: { allow_requests: true } },
            { modulo: 'team_mode', ativo: true, configuracao: { max_team_size: 3 } },
            { modulo: 'voting', ativo: true, configuracao: { enabled: true } }
        ]
    }
];

const mockMusics = [
    {
        id: '1',
        titulo: 'Dance Monkey',
        artista: 'Tones and I',
        duracao: 210,
        dificuldade: 'Médio',
        ano: 2019,
        genero: 'Pop',
        url_thumbnail: 'https://via.placeholder.com/200x200/FF6B6B/FFFFFF?text=Dance+Monkey',
        aprovada: true
    },
    {
        id: '2',
        titulo: 'Blinding Lights',
        artista: 'The Weeknd',
        duracao: 200,
        dificuldade: 'Fácil',
        ano: 2020,
        genero: 'Pop',
        url_thumbnail: 'https://via.placeholder.com/200x200/4ECDC4/FFFFFF?text=Blinding+Lights',
        aprovada: true
    },
    {
        id: '3',
        titulo: 'Levitating',
        artista: 'Dua Lipa',
        duracao: 203,
        dificuldade: 'Difícil',
        ano: 2020,
        genero: 'Pop',
        url_thumbnail: 'https://via.placeholder.com/200x200/45B7D1/FFFFFF?text=Levitating',
        aprovada: true
    },
    {
        id: '4',
        titulo: 'Stay',
        artista: 'Kid LAROI & Justin Bieber',
        duracao: 138,
        dificuldade: 'Médio',
        ano: 2021,
        genero: 'Pop',
        url_thumbnail: 'https://via.placeholder.com/200x200/96CEB4/FFFFFF?text=Stay',
        aprovada: true
    },
    {
        id: '5',
        titulo: 'As It Was',
        artista: 'Harry Styles',
        duracao: 167,
        dificuldade: 'Fácil',
        ano: 2022,
        genero: 'Pop',
        url_thumbnail: 'https://via.placeholder.com/200x200/FFEAA7/FFFFFF?text=As+It+Was',
        aprovada: true
    }
];

const mockQueue = [
    {
        id: '1',
        id_evento: '1',
        id_jogador: '3',
        id_musica: '1',
        status: 'pendente',
        pontuacao: null,
        created_at: '2024-01-15T10:30:00Z',
        jogador: mockUsers[2],
        musica: mockMusics[0]
    },
    {
        id: '2',
        id_evento: '1',
        id_jogador: '2',
        id_musica: '2',
        status: 'pendente',
        pontuacao: null,
        created_at: '2024-01-15T10:35:00Z',
        jogador: mockUsers[1],
        musica: mockMusics[1]
    },
    {
        id: '3',
        id_evento: '1',
        id_jogador: '3',
        id_musica: '3',
        status: 'finalizado',
        pontuacao: 8500,
        created_at: '2024-01-15T10:00:00Z',
        jogador: mockUsers[2],
        musica: mockMusics[2]
    }
];

const mockTournaments = [
    {
        id: '1',
        id_evento: '2',
        nome: 'Torneio Principal',
        status: 'inscricoes',
        max_participantes: 16,
        created_at: '2024-01-10T14:00:00Z',
        participantes: [mockUsers[2], mockUsers[1]]
    }
];

// Mock Auth Routes
router.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    const user = mockUsers.find(u => u.email === email);
    
    if (user && password === '123456') {
        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            token: 'mock-jwt-token-' + user.id,
            user: {
                id: user.id,
                nickname: user.nickname,
                email: user.email,
                papel: user.papel,
                xp: user.xp,
                nivel: user.nivel,
                is_super_admin: user.is_super_admin,
                avatar_ativo_url: user.avatar_ativo_url
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Email ou senha incorretos'
        });
    }
});

router.post('/auth/register', (req, res) => {
    const { nickname, email } = req.body;
    
    if (mockUsers.find(u => u.email === email)) {
        res.status(400).json({
            success: false,
            message: 'Email já cadastrado'
        });
        return;
    }
    
    const newUser = {
        id: (mockUsers.length + 1).toString(),
        nickname,
        email,
        papel: 'jogador',
        xp: 0,
        nivel: 1,
        is_super_admin: false,
        avatar_ativo_url: 'https://via.placeholder.com/150/95A5A6/FFFFFF?text=NEW'
    };
    
    mockUsers.push(newUser);
    
    res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        user: {
            id: newUser.id,
            nickname: newUser.nickname,
            email: newUser.email,
            papel: newUser.papel,
            xp: newUser.xp,
            nivel: newUser.nivel,
            is_super_admin: newUser.is_super_admin
        }
    });
});

router.get('/auth/profile', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const userId = token?.split('-').pop();
    
    const user = mockUsers.find(u => u.id === userId);
    
    if (user) {
        res.json({
            success: true,
            user: {
                id: user.id,
                nickname: user.nickname,
                email: user.email,
                papel: user.papel,
                xp: user.xp,
                nivel: user.nivel,
                is_super_admin: user.is_super_admin,
                avatar_ativo_url: user.avatar_ativo_url
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Usuário não autenticado'
        });
    }
});

// Mock Event Routes
router.get('/events', (_req, res) => {
    res.json({
        success: true,
        events: mockEvents
    });
});

router.get('/events/:code', (req, res) => {
    const { code } = req.params;
    const event = mockEvents.find(e => e.codigo_evento === code);
    
    if (event) {
        res.json({
            success: true,
            event
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Evento não encontrado'
        });
    }
});

router.post('/events', (req, res) => {
    const { nome_evento, tipo, codigo_evento } = req.body;
    
    if (mockEvents.find(e => e.codigo_evento === codigo_evento)) {
        res.status(400).json({
            success: false,
            message: 'Código do evento já existe'
        });
        return;
    }
    
    const newEvent = {
        id: (mockEvents.length + 1).toString(),
        nome_evento,
        id_organizador: '2',
        tipo,
        codigo_evento,
        status: 'ativo',
        created_at: new Date().toISOString(),
        organizador: mockUsers[1],
        modules: [
            { modulo: 'queue', ativo: true, configuracao: { max_songs_per_user: 3, cooldown_minutes: 5 } },
            { modulo: 'tournament', ativo: false, configuracao: { max_participants: 16 } },
            { modulo: 'xp_system', ativo: true, configuracao: { xp_per_song: 10 } },
            { modulo: 'leaderboard', ativo: true, configuracao: { show_top: 10 } },
            { modulo: 'chat', ativo: true, configuracao: { max_message_length: 200 } },
            { modulo: 'music_requests', ativo: true, configuracao: { allow_requests: true } },
            { modulo: 'team_mode', ativo: false, configuracao: { max_team_size: 4 } },
            { modulo: 'voting', ativo: false, configuracao: { enabled: false } }
        ]
    };
    
    mockEvents.push(newEvent);
    
    res.status(201).json({
        success: true,
        message: 'Evento criado com sucesso',
        event: newEvent
    });
});

// Mock Module Routes
router.get('/modules/:eventId', (req, res) => {
    const { eventId } = req.params;
    const event = mockEvents.find(e => e.id === eventId);
    
    if (event) {
        res.json({
            success: true,
            event: {
                id: event.id,
                nome_evento: event.nome_evento,
                codigo_evento: event.codigo_evento
            },
            modules: event.modules,
            availableModules: [
                { name: 'queue', description: 'Sistema de fila de músicas', defaultEnabled: true },
                { name: 'tournament', description: 'Sistema de torneios', defaultEnabled: false },
                { name: 'xp_system', description: 'Sistema de experiência e níveis', defaultEnabled: true },
                { name: 'team_mode', description: 'Modo equipe para jogos', defaultEnabled: false },
                { name: 'music_requests', description: 'Sistema de pedidos de música', defaultEnabled: true },
                { name: 'leaderboard', description: 'Tabela de classificação', defaultEnabled: true },
                { name: 'chat', description: 'Chat em tempo real', defaultEnabled: true },
                { name: 'voting', description: 'Sistema de votação', defaultEnabled: false }
            ]
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Evento não encontrado'
        });
    }
});

// Mock Queue Routes
router.get('/queues/:eventId', (req, res) => {
    const { eventId } = req.params;
    const eventQueue = mockQueue.filter(q => q.id_evento === eventId);
    
    res.json({
        success: true,
        queue: eventQueue
    });
});

router.post('/queues/:eventId', (req, res) => {
    const { eventId } = req.params;
    const { id_musica } = req.body;
    
    const music = mockMusics.find(m => m.id === id_musica);
    if (!music) {
        res.status(404).json({
            success: false,
            message: 'Música não encontrada'
        });
        return;
    }
    
    const newQueueItem = {
        id: (mockQueue.length + 1).toString(),
        id_evento: eventId,
        id_jogador: '3',
        id_musica,
        status: 'pendente',
        pontuacao: null,
        created_at: new Date().toISOString(),
        jogador: mockUsers[2],
        musica: music
    };
    
    mockQueue.push(newQueueItem);
    
    res.status(201).json({
        success: true,
        message: 'Música adicionada à fila com sucesso',
        queueItem: newQueueItem
    });
});

// Mock Music Routes
router.get('/musics', (_req, res) => {
    res.json({
        success: true,
        musics: mockMusics
    });
});

// Mock Tournament Routes
router.get('/tournaments/:eventId', (req, res) => {
    const { eventId } = req.params;
    const eventTournaments = mockTournaments.filter(t => t.id_evento === eventId);
    
    res.json({
        success: true,
        tournaments: eventTournaments
    });
});

export default router; 