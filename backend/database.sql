-- Just Dance Event Hub - Estrutura Inicial do Banco de Dados (PostgreSQL)

-- Usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nickname VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    papel VARCHAR(20) NOT NULL DEFAULT 'jogador',
    xp INTEGER NOT NULL DEFAULT 0,
    nivel INTEGER NOT NULL DEFAULT 1,
    avatar_ativo_url VARCHAR(255),
    is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Avatares
CREATE TABLE IF NOT EXISTS avatars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_avatar VARCHAR(50) NOT NULL,
    url_imagem VARCHAR(255) NOT NULL,
    tipo_desbloqueio VARCHAR(20) NOT NULL,
    requisito_nivel INTEGER,
    requisito_conquista_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Eventos
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_evento VARCHAR(100) NOT NULL,
    id_organizador UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL,
    codigo_evento VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Configurações de Eventos (Módulos)
CREATE TABLE IF NOT EXISTS event_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_evento UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    modulo VARCHAR(50) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    configuracao JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_evento, modulo)
);

-- Músicas
CREATE TABLE IF NOT EXISTS musics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(100) NOT NULL,
    artista VARCHAR(100) NOT NULL,
    duracao INTEGER NOT NULL,
    dificuldade VARCHAR(10) NOT NULL,
    ano INTEGER NOT NULL,
    genero VARCHAR(50) NOT NULL,
    url_thumbnail VARCHAR(255),
    aprovada BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Torneios
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_evento UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'inscricoes',
    max_participantes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fila de músicas
CREATE TABLE IF NOT EXISTS queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_evento UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    id_jogador UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    id_musica UUID NOT NULL REFERENCES musics(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente',
    pontuacao INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_events_organizador ON events(id_organizador);
CREATE INDEX IF NOT EXISTS idx_events_codigo ON events(codigo_evento);
CREATE INDEX IF NOT EXISTS idx_event_configs_evento ON event_configs(id_evento);
CREATE INDEX IF NOT EXISTS idx_queues_evento ON queues(id_evento);
CREATE INDEX IF NOT EXISTS idx_queues_jogador ON queues(id_jogador);
CREATE INDEX IF NOT EXISTS idx_musics_aprovada ON musics(aprovada);

-- Inserir configurações padrão dos módulos
INSERT INTO event_configs (id_evento, modulo, ativo, configuracao) VALUES
-- Exemplo: para cada evento criado, inserir configurações padrão
-- (será feito via trigger ou no código da aplicação)
-- ('event-id', 'queue', true, '{"max_songs_per_user": 3, "cooldown_minutes": 5}'),
-- ('event-id', 'tournament', false, '{"max_participants": 16, "bracket_type": "single_elimination"}'),
-- ('event-id', 'xp_system', true, '{"xp_per_song": 10, "level_multiplier": 1.5}'),
-- ('event-id', 'team_mode', false, '{"max_team_size": 4, "allow_solo": true}'),
-- ('event-id', 'music_requests', true, '{"allow_requests": true, "max_requests_per_user": 2}'),
-- ('event-id', 'leaderboard', true, '{"show_top": 10, "update_interval": 300}');

-- Índices e constraints extras podem ser adicionados conforme necessário.

-- Conta de super admin padrão (senha: admin123, hash gerado com bcrypt)
INSERT INTO users (nickname, email, senha_hash, papel, xp, nivel, is_super_admin)
VALUES (
  'superadmin',
  'superadmin@justdancehub.com',
  '$2b$10$wQwQwQwQwQwQwQwQwQwQwOeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw', -- hash de admin123
  'admin',
  0,
  1,
  TRUE
)
ON CONFLICT (email) DO NOTHING; 