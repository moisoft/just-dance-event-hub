# Guia de Migração para Supabase

Este guia explica como migrar o sistema Just Dance Event Hub do banco de dados PostgreSQL local para o Supabase.

## Pré-requisitos

1. Conta no Supabase (https://supabase.com)
2. Projeto criado no Supabase
3. Node.js e npm instalados

## Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Escolha sua organização
5. Preencha os dados do projeto:
   - Name: `just-dance-event-hub`
   - Database Password: (escolha uma senha forte)
   - Region: (escolha a região mais próxima)

### 2. Obter Credenciais

Após criar o projeto, você precisará das seguintes credenciais:

1. **Project URL**: Encontre em Settings > API
2. **Anon Key**: Encontre em Settings > API
3. **Service Role Key**: Encontre em Settings > API (mantenha em segredo)

### 3. Configurar Variáveis de Ambiente

#### Backend

Copie o arquivo `backend/env.supabase.example` para `backend/.env` e preencha com suas credenciais:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Configuration (for migration)
DB_NAME=just_dance_hub
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# Frontend URL
FRONTEND_URL=http://localhost:3000

# JWT Secret (if still using custom JWT)
JWT_SECRET=your_jwt_secret

# Other environment variables
NODE_ENV=development
PORT=3001
```

#### Frontend

Copie o arquivo `frontend/env.supabase.example` para `frontend/.env` e preencha com suas credenciais:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WS_URL=ws://localhost:3002
```

## Migração do Banco de Dados

### 1. Executar Script de Migração

**Opção 1: SQL Editor do Supabase (Recomendado)**
1. Acesse o painel do Supabase
2. Vá para SQL Editor
3. Cole o script SQL abaixo
4. Execute o script

**Opção 2: Via CLI do Supabase**
```bash
# Instalar CLI do Supabase
npm install -g supabase

# Executar migração
supabase db reset
```

## 📄 Script SQL Completo

Cole o seguinte script no SQL Editor do Supabase:

```sql
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
-- DADOS INICIAIS
-- =============================================

-- Inserir avatares padrão
INSERT INTO avatar (nome, url_imagem, preco_xp, disponivel) VALUES
('Avatar Básico', 'https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=AB', 0, true),
('Avatar Prata', 'https://via.placeholder.com/100x100/C0C0C0/FFFFFF?text=AP', 100, true),
('Avatar Ouro', 'https://via.placeholder.com/100x100/FFD700/FFFFFF?text=AO', 500, true),
('Avatar Diamante', 'https://via.placeholder.com/100x100/B9F2FF/FFFFFF?text=AD', 1000, true);

-- Inserir músicas de exemplo
INSERT INTO music (titulo, artista, duracao, dificuldade, genero, ano_lancamento) VALUES
('Uptown Funk', 'Mark Ronson ft. Bruno Mars', 270, 'medio', 'Pop', 2014),
('Shape of You', 'Ed Sheeran', 233, 'facil', 'Pop', 2017),
('Despacito', 'Luis Fonsi ft. Daddy Yankee', 281, 'medio', 'Reggaeton', 2017),
('Bad Guy', 'Billie Eilish', 194, 'dificil', 'Pop', 2019),
('Levitating', 'Dua Lipa', 203, 'medio', 'Pop', 2020);

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
```

### 2. Verificar Migração

1. Acesse o painel do Supabase
2. Vá para **Table Editor** - verifique se todas as tabelas foram criadas:
   - users
   - events
   - music
   - avatar
   - tournament
   - queue
   - event_config
   - team
   - team_member
   - competition
   - competition_participant
3. Vá para **Storage** - verifique se os buckets foram criados:
   - `avatars` - Avatares dos usuários
   - `music-covers` - Capas das músicas
   - `music-audio` - Arquivos de áudio das músicas
   - `event-images` - Imagens dos eventos
   - `user-uploads` - Uploads gerais dos usuários
4. Verifique se os dados iniciais foram inseridos

## 📁 Sistema de Storage (Buckets)

### Buckets Criados

O sistema inclui 5 buckets para organizar diferentes tipos de arquivos:

#### 1. **avatars** (Público)
- **Uso**: Avatares dos usuários
- **Acesso**: Público para leitura, apenas admins para upload
- **Estrutura**: `avatars/{userId}-{timestamp}.{ext}`

#### 2. **music-covers** (Público)
- **Uso**: Capas das músicas
- **Acesso**: Público para leitura, apenas admins para upload
- **Estrutura**: `music-covers/{musicId}-cover.{ext}`

#### 3. **music-videos** (Público)
- **Uso**: Vídeos das músicas (Just Dance)
- **Acesso**: Público para leitura, apenas admins para upload
- **Estrutura**: `music-videos/{musicId}-video.{ext}`

#### 4. **event-images** (Público)
- **Uso**: Imagens dos eventos
- **Acesso**: Público para leitura, organizadores para upload
- **Estrutura**: `event-images/{eventId}-image.{ext}`

#### 5. **user-uploads** (Privado)
- **Uso**: Uploads gerais dos usuários
- **Acesso**: Apenas o próprio usuário
- **Estrutura**: `user-uploads/{userId}/{folder}/{filename}`

### Como Usar no Frontend

```typescript
import { StorageService } from './services/supabaseService';
import { useStorage } from './hooks/useStorage';

// Upload de avatar
const { uploadAvatar } = useStorage({
  maxSizeMB: 5,
  allowedTypes: ['image/jpeg', 'image/png'],
  onSuccess: (url) => console.log('Avatar enviado:', url)
});

// Upload de capa de música
const { uploadMusicCover } = useStorage({
  maxSizeMB: 10,
  allowedTypes: ['image/jpeg', 'image/png'],
  onSuccess: (url) => console.log('Capa enviada:', url)
});

// Upload de vídeo de música
const { uploadMusicVideo } = useStorage({
  maxSizeMB: 100,
  allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
  onSuccess: (url) => console.log('Vídeo enviado:', url)
});
```

### Componente de Upload

```tsx
import FileUpload from './components/FileUpload';

// Upload de avatar
<FileUpload
  bucket="avatars"
  entityId={userId}
  onUploadSuccess={(url) => setAvatarUrl(url)}
  accept="image/*"
  maxSizeMB={5}
/>

// Upload de capa de música
<FileUpload
  bucket="music-covers"
  entityId={musicId}
  onUploadSuccess={(url) => setCoverUrl(url)}
  accept="image/*"
  maxSizeMB={10}
/>

// Upload de vídeo de música
<FileUpload
  bucket="music-videos"
  entityId={musicId}
  onUploadSuccess={(url) => setVideoUrl(url)}
  accept="video/*"
  maxSizeMB={100}
/>
```

## Configuração do Backend

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Executar o Servidor

```bash
npm run dev
```

O servidor agora usará o Supabase em vez do PostgreSQL local.

## Configuração do Frontend

### 1. Instalar Dependências

```bash
cd frontend
npm install
```

### 2. Executar o Frontend

```bash
npm start
```

## Novas Funcionalidades

### Autenticação com Supabase

O sistema agora usa o Supabase Auth para autenticação:

- **Registro**: `/api/supabase-auth/register`
- **Login**: `/api/supabase-auth/login`
- **Logout**: `/api/supabase-auth/logout`
- **Perfil**: `/api/supabase-auth/profile`
- **Refresh Token**: `/api/supabase-auth/refresh`

### Endpoints de Eventos

Os eventos agora usam o Supabase:

- **Criar Evento**: `/api/supabase-events/`
- **Listar Eventos**: `/api/supabase-events/`
- **Obter Evento**: `/api/supabase-events/:id`
- **Atualizar Evento**: `/api/supabase-events/:id`
- **Deletar Evento**: `/api/supabase-events/:id`

## Vantagens da Migração

1. **Escalabilidade**: Supabase oferece escalabilidade automática
2. **Segurança**: Row Level Security (RLS) integrado
3. **Real-time**: Suporte nativo para atualizações em tempo real
4. **Backup**: Backups automáticos
5. **Interface**: Painel administrativo integrado
6. **APIs**: APIs REST e GraphQL automáticas
7. **Autenticação**: Sistema de autenticação robusto

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão**: Verifique se as variáveis de ambiente estão corretas
2. **Erro de permissão**: Verifique se as políticas RLS estão configuradas
3. **Erro de migração**: Execute o script de migração novamente

### Logs

Para debug, verifique os logs do Supabase no painel administrativo.

## Próximos Passos

1. Testar todas as funcionalidades
2. Migrar dados existentes (se houver)
3. Configurar backup e monitoramento
4. Otimizar queries para performance
5. Implementar funcionalidades de real-time

## Suporte

Para dúvidas ou problemas:
1. Consulte a documentação do Supabase
2. Verifique os logs do sistema
3. Entre em contato com a equipe de desenvolvimento
