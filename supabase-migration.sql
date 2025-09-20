-- =============================================
-- JUST DANCE EVENT HUB - SCRIPT DE MIGRAÇÃO
-- =============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELAS PRINCIPAIS
-- =============================================

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nickname VARCHAR(30) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  papel VARCHAR(20) NOT NULL DEFAULT 'jogador' CHECK (papel IN ('jogador', 'staff', 'organizador', 'admin')),
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  nivel INTEGER NOT NULL DEFAULT 1 CHECK (nivel >= 1),
  avatar_ativo_url VARCHAR(500),
  is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de eventos
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  local VARCHAR(200),
  status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'finalizado')),
  organizador_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de músicas
CREATE TABLE IF NOT EXISTS music (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  artista VARCHAR(200) NOT NULL,
  duracao INTEGER NOT NULL,
  dificuldade VARCHAR(20) NOT NULL CHECK (dificuldade IN ('facil', 'medio', 'dificil', 'extremo')),
  genero VARCHAR(50),
  ano_lancamento INTEGER,
  url_audio VARCHAR(500),
  url_imagem VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de avatares
CREATE TABLE IF NOT EXISTS avatar (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  url_imagem VARCHAR(500) NOT NULL,
  preco_xp INTEGER NOT NULL DEFAULT 0,
  disponivel BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de torneios
CREATE TABLE IF NOT EXISTS tournament (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  evento_id UUID REFERENCES events(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'finalizado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de filas
CREATE TABLE IF NOT EXISTS queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  evento_id UUID REFERENCES events(id) ON DELETE CASCADE,
  musica_id UUID REFERENCES music(id) ON DELETE CASCADE,
  jogador_id UUID REFERENCES users(id) ON DELETE CASCADE,
  posicao INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'aguardando' CHECK (status IN ('aguardando', 'tocando', 'finalizado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações de evento
CREATE TABLE IF NOT EXISTS event_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  evento_id UUID REFERENCES events(id) ON DELETE CASCADE,
  config_key VARCHAR(100) NOT NULL,
  config_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(evento_id, config_key)
);

-- Tabela de times
CREATE TABLE IF NOT EXISTS team (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  lider_id UUID REFERENCES users(id) ON DELETE CASCADE,
  evento_id UUID REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de membros de time
CREATE TABLE IF NOT EXISTS team_member (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES team(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  papel VARCHAR(20) NOT NULL DEFAULT 'membro' CHECK (papel IN ('membro', 'lider')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Tabela de competições
CREATE TABLE IF NOT EXISTS competition (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  evento_id UUID REFERENCES events(id) ON DELETE CASCADE,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'finalizado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de participantes de competição
CREATE TABLE IF NOT EXISTS competition_participant (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  competition_id UUID REFERENCES competition(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES team(id) ON DELETE CASCADE,
  pontuacao INTEGER DEFAULT 0,
  posicao INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(competition_id, user_id),
  UNIQUE(competition_id, team_id)
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para usuários
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);

-- Índices para eventos
CREATE INDEX IF NOT EXISTS idx_events_organizador ON events(organizador_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_data_inicio ON events(data_inicio);

-- Índices para filas
CREATE INDEX IF NOT EXISTS idx_queue_evento ON queue(evento_id);
CREATE INDEX IF NOT EXISTS idx_queue_jogador ON queue(jogador_id);
CREATE INDEX IF NOT EXISTS idx_queue_posicao ON queue(posicao);

-- Índices para times
CREATE INDEX IF NOT EXISTS idx_team_evento ON team(evento_id);
CREATE INDEX IF NOT EXISTS idx_team_lider ON team(lider_id);
CREATE INDEX IF NOT EXISTS idx_team_member_team ON team_member(team_id);
CREATE INDEX IF NOT EXISTS idx_team_member_user ON team_member(user_id);

-- Índices para competições
CREATE INDEX IF NOT EXISTS idx_competition_evento ON competition(evento_id);
CREATE INDEX IF NOT EXISTS idx_competition_participant_competition ON competition_participant(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_participant_user ON competition_participant(user_id);

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas as tabelas
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON events 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_music_updated_at 
  BEFORE UPDATE ON music 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_avatar_updated_at 
  BEFORE UPDATE ON avatar 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournament_updated_at 
  BEFORE UPDATE ON tournament 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_queue_updated_at 
  BEFORE UPDATE ON queue 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_config_updated_at 
  BEFORE UPDATE ON event_config 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_updated_at 
  BEFORE UPDATE ON team 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_member_updated_at 
  BEFORE UPDATE ON team_member 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competition_updated_at 
  BEFORE UPDATE ON competition 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competition_participant_updated_at 
  BEFORE UPDATE ON competition_participant 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE music ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_participant ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS RLS
-- =============================================

-- Políticas para usuários
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para eventos
CREATE POLICY "Anyone can view active events" ON events
  FOR SELECT USING (status = 'ativo');

CREATE POLICY "Organizers can manage their events" ON events
  FOR ALL USING (auth.uid() = organizador_id);

CREATE POLICY "Admins can manage all events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.papel = 'admin'
    )
  );

-- Políticas para filas
CREATE POLICY "Users can view queues for events they're in" ON queue
  FOR SELECT USING (true);

CREATE POLICY "Users can add themselves to queue" ON queue
  FOR INSERT WITH CHECK (auth.uid() = jogador_id);

CREATE POLICY "Users can update their own queue entries" ON queue
  FOR UPDATE USING (auth.uid() = jogador_id);

CREATE POLICY "Event organizers can manage queues" ON queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = queue.evento_id 
      AND events.organizador_id = auth.uid()
    )
  );

-- Políticas para times
CREATE POLICY "Anyone can view teams" ON team
  FOR SELECT USING (true);

CREATE POLICY "Team leaders can manage their teams" ON team
  FOR ALL USING (auth.uid() = lider_id);

CREATE POLICY "Event organizers can manage teams" ON team
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = team.evento_id 
      AND events.organizador_id = auth.uid()
    )
  );

-- Políticas para membros de time
CREATE POLICY "Team members can view team details" ON team_member
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Team leaders can manage team members" ON team_member
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team 
      WHERE team.id = team_member.team_id 
      AND team.lider_id = auth.uid()
    )
  );

-- Políticas para competições
CREATE POLICY "Anyone can view active competitions" ON competition
  FOR SELECT USING (status = 'ativo');

CREATE POLICY "Event organizers can manage competitions" ON competition
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = competition.evento_id 
      AND events.organizador_id = auth.uid()
    )
  );

-- Políticas para participantes de competição
CREATE POLICY "Users can participate in competitions" ON competition_participant
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own participation" ON competition_participant
  FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- BUCKETS DE STORAGE
-- =============================================

-- Criar buckets para armazenamento de arquivos
INSERT INTO storage.buckets (id, name, public) VALUES
('avatars', 'avatars', true),
('music-covers', 'music-covers', true),
('music-videos', 'music-videos', true),
('event-images', 'event-images', true),
('user-uploads', 'user-uploads', true);

-- =============================================
-- POLÍTICAS DE STORAGE
-- =============================================

-- Políticas para bucket de avatares
CREATE POLICY "Avatars are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Only admins can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.papel = 'admin'
    )
  );

CREATE POLICY "Only admins can update avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.papel = 'admin'
    )
  );

CREATE POLICY "Only admins can delete avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.papel = 'admin'
    )
  );

-- Políticas para bucket de capas de músicas
CREATE POLICY "Music covers are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'music-covers');

CREATE POLICY "Only admins can upload music covers" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'music-covers' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.papel = 'admin'
    )
  );

-- Políticas para bucket de vídeos de músicas
CREATE POLICY "Music videos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'music-videos');

CREATE POLICY "Only admins can upload music videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'music-videos' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.papel = 'admin'
    )
  );

-- Políticas para bucket de imagens de eventos
CREATE POLICY "Event images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-images');

CREATE POLICY "Event organizers can upload event images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'event-images' AND
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.organizador_id = auth.uid()
    )
  );

-- Políticas para bucket de uploads de usuários
CREATE POLICY "Users can view their own uploads" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- FUNÇÕES PARA STORAGE
-- =============================================

-- Função para obter URL pública de arquivo
CREATE OR REPLACE FUNCTION get_public_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CONCAT('https://', current_setting('app.settings.supabase_url'), '/storage/v1/object/public/', bucket_name, '/', file_path);
END;
$$ LANGUAGE plpgsql;

-- Função para obter URL assinada de arquivo
CREATE OR REPLACE FUNCTION get_signed_url(bucket_name TEXT, file_path TEXT, expires_in INTEGER DEFAULT 3600)
RETURNS TEXT AS $$
DECLARE
  signed_url TEXT;
BEGIN
  -- Esta função seria implementada com a API do Supabase
  -- Por enquanto, retorna a URL pública
  RETURN get_public_url(bucket_name, file_path);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- DADOS INICIAIS
-- =============================================

-- Inserir avatares padrão (usando storage paths)
INSERT INTO avatar (nome, url_imagem, preco_xp, disponivel) VALUES
('Avatar Básico', 'avatars/default-avatar-basic.png', 0, true),
('Avatar Prata', 'avatars/default-avatar-silver.png', 100, true),
('Avatar Ouro', 'avatars/default-avatar-gold.png', 500, true),
('Avatar Diamante', 'avatars/default-avatar-diamond.png', 1000, true);

-- Inserir músicas de exemplo (usando storage paths)
INSERT INTO music (titulo, artista, duracao, dificuldade, genero, ano_lancamento, url_imagem, url_audio) VALUES
('Uptown Funk', 'Mark Ronson ft. Bruno Mars', 270, 'medio', 'Pop', 2014, 'music-covers/uptown-funk.jpg', 'music-videos/uptown-funk.mp4'),
('Shape of You', 'Ed Sheeran', 233, 'facil', 'Pop', 2017, 'music-covers/shape-of-you.jpg', 'music-videos/shape-of-you.mp4'),
('Despacito', 'Luis Fonsi ft. Daddy Yankee', 281, 'medio', 'Reggaeton', 2017, 'music-covers/despacito.jpg', 'music-videos/despacito.mp4'),
('Bad Guy', 'Billie Eilish', 194, 'dificil', 'Pop', 2019, 'music-covers/bad-guy.jpg', 'music-videos/bad-guy.mp4'),
('Levitating', 'Dua Lipa', 203, 'medio', 'Pop', 2020, 'music-covers/levitating.jpg', 'music-videos/levitating.mp4');

-- =============================================
-- FUNÇÕES ÚTEIS
-- =============================================

-- Função para obter ranking de usuários
CREATE OR REPLACE FUNCTION get_user_ranking()
RETURNS TABLE (
  user_id UUID,
  nickname VARCHAR(30),
  xp INTEGER,
  nivel INTEGER,
  posicao BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.nickname,
    u.xp,
    u.nivel,
    ROW_NUMBER() OVER (ORDER BY u.xp DESC) as posicao
  FROM users u
  ORDER BY u.xp DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas de evento
CREATE OR REPLACE FUNCTION get_event_stats(event_id UUID)
RETURNS TABLE (
  total_participantes BIGINT,
  total_filas BIGINT,
  total_times BIGINT,
  total_competicoes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM queue WHERE queue.evento_id = event_id) as total_participantes,
    (SELECT COUNT(*) FROM queue WHERE queue.evento_id = event_id) as total_filas,
    (SELECT COUNT(*) FROM team WHERE team.evento_id = event_id) as total_times,
    (SELECT COUNT(*) FROM competition WHERE competition.evento_id = event_id) as total_competicoes;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMENTÁRIOS FINAIS
-- =============================================

-- Adicionar comentários nas tabelas
COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON TABLE events IS 'Tabela de eventos de Just Dance';
COMMENT ON TABLE music IS 'Tabela de músicas disponíveis';
COMMENT ON TABLE avatar IS 'Tabela de avatares para usuários';
COMMENT ON TABLE tournament IS 'Tabela de torneios';
COMMENT ON TABLE queue IS 'Tabela de filas de eventos';
COMMENT ON TABLE team IS 'Tabela de times';
COMMENT ON TABLE competition IS 'Tabela de competições';

-- =============================================
-- MIGRAÇÃO CONCLUÍDA
-- =============================================

-- Verificar se todas as tabelas foram criadas
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('users', 'events', 'music', 'avatar', 'tournament', 'queue', 'event_config', 'team', 'team_member', 'competition', 'competition_participant');
  
  IF table_count = 11 THEN
    RAISE NOTICE '✅ Migração concluída com sucesso! Todas as % tabelas foram criadas.', table_count;
  ELSE
    RAISE NOTICE '⚠️ Aviso: Apenas % de 11 tabelas foram criadas.', table_count;
  END IF;
END $$;
