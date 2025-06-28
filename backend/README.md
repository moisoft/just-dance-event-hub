# Just Dance Event Hub - Backend

Sistema modular para gerenciamento de eventos de Just Dance com funcionalidades opcionais que podem ser ativadas/desativadas pelo organizador do evento.

## 🚀 Funcionalidades

### Sistema Modular
O Just Dance Event Hub foi desenvolvido com um sistema modular que permite ao organizador do evento ativar ou desativar funcionalidades conforme sua necessidade:

#### Módulos Disponíveis:

1. **Queue (Fila de Músicas)** - `ativo por padrão`
   - Sistema de fila para músicas
   - Configurações: limite de músicas por usuário, cooldown, duplicatas

2. **XP System (Sistema de Experiência)** - `ativo por padrão`
   - Sistema de experiência e níveis
   - Configurações: XP por música, multiplicador de nível, bônus em torneios

3. **Leaderboard (Tabela de Classificação)** - `ativo por padrão`
   - Tabela de classificação dos jogadores
   - Configurações: top N jogadores, intervalo de atualização, mostrar XP

4. **Chat (Chat em Tempo Real)** - `ativo por padrão`
   - Chat em tempo real para participantes
   - Configurações: tamanho máximo de mensagem, emojis

5. **Tournament (Sistema de Torneios)** - `inativo por padrão`
   - Sistema completo de torneios
   - Configurações: máximo de participantes, tipo de chaveamento, auto-início

6. **Team Mode (Modo Equipe)** - `inativo por padrão`
   - Sistema de equipes para jogos
   - Configurações: tamanho máximo da equipe, permitir solo, tempo de formação

7. **Music Requests (Pedidos de Música)** - `ativo por padrão`
   - Sistema de pedidos de música
   - Configurações: permitir pedidos, limite por usuário, cooldown

8. **Voting (Sistema de Votação)** - `inativo por padrão`
   - Sistema de votação para decisões
   - Configurações: tempo de votação, maioria necessária

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Linguagem de programação
- **Sequelize** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Joi** - Validação de dados
- **Helmet** - Segurança
- **Rate Limiting** - Proteção contra spam

## 📋 Pré-requisitos

- Node.js 16+
- PostgreSQL 12+
- npm ou yarn

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd just-dance-event-hub/backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=just_dance_hub
DB_USER=seu_usuario
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:3000
```

4. **Configure o banco de dados**
```bash
# Execute o script SQL para criar as tabelas
psql -U seu_usuario -d just_dance_hub -f database.sql
```

5. **Popule o banco com músicas (opcional)**
```bash
node scripts/fetch_musics.js
```

6. **Inicie o servidor**
```bash
npm run dev
```

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil do usuário

### Eventos
- `POST /api/events` - Criar evento
- `GET /api/events` - Listar eventos
- `GET /api/events/:code` - Obter evento por código
- `PUT /api/events/:id` - Atualizar evento
- `DELETE /api/events/:id` - Deletar evento

### Módulos (Configurações)
- `GET /api/modules/:eventId` - Obter configurações dos módulos
- `PUT /api/modules/:eventId/:moduleName` - Atualizar módulo específico
- `PUT /api/modules/:eventId` - Atualizar múltiplos módulos
- `POST /api/modules/:eventId/reset` - Resetar para configurações padrão

### Fila (se módulo ativo)
- `POST /api/queues/:eventId` - Adicionar música à fila
- `GET /api/queues/:eventId` - Obter fila do evento
- `DELETE /api/queues/:queueId` - Remover da fila
- `PUT /api/queues/:queueId/play` - Marcar como tocada

### Torneios (se módulo ativo)
- `POST /api/tournaments` - Criar torneio
- `GET /api/tournaments/:eventId` - Listar torneios do evento
- `PUT /api/tournaments/:id/join` - Entrar no torneio
- `PUT /api/tournaments/:id/start` - Iniciar torneio

## 🔒 Segurança

- **Autenticação JWT** - Todas as rotas protegidas
- **Rate Limiting** - Proteção contra spam
- **Helmet** - Headers de segurança
- **CORS** - Configurado para frontend específico
- **Validação de dados** - Joi para validação
- **Sanitização** - Proteção contra injeção

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch

# Cobertura de testes
npm run test:coverage
```

## 📊 Monitoramento

- **Health Check**: `GET /health`
- **Logs estruturados** com Morgan
- **Tratamento de erros global**
- **Validação de entrada**

## 🚀 Deploy para Produção

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL 12+
- PM2 (para gerenciamento de processos)

### 1. Configuração do Banco de Dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE just_dance_hub;

# Sair do psql
\q
```

### 2. Configuração do Ambiente

```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar variáveis de ambiente
nano .env
```

**Variáveis obrigatórias no .env:**
```env
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=just_dance_hub
JWT_SECRET=seu_jwt_secret_aqui
PORT=3000
```

### 3. Instalação e Setup

```bash
# Instalar dependências
npm install

# Configurar banco de dados
node scripts/setup-prod-db.js

# Compilar TypeScript
npm run build

# Iniciar com PM2
pm2 start dist/app.js --name "just-dance-hub"
pm2 save
pm2 startup
```

### 4. Configuração do Nginx (Opcional)

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🛠️ Desenvolvimento

### Instalação
```bash
npm install
```

### Configuração do Ambiente de Desenvolvimento
```bash
cp env.example .env
# Editar .env com suas configurações locais
```

### Executar em Desenvolvimento
```bash
npm run dev
```

### Executar Testes
```bash
npm test
```

## 📁 Estrutura do Projeto

```
src/
├── controllers/     # Controladores da API
├── models/         # Modelos do Sequelize
├── routes/         # Rotas da API
├── middlewares/    # Middlewares (auth, validação, etc.)
├── services/       # Lógica de negócio
├── utils/          # Utilitários (database, jwt, etc.)
└── types/          # Definições de tipos TypeScript
```

## 🔐 Autenticação

A API usa JWT para autenticação. Endpoints protegidos requerem o header:
```
Authorization: Bearer <token>
```

## 📊 Banco de Dados

### Tabelas Principais:
- `users` - Usuários do sistema
- `events` - Eventos
- `event_configs` - Configurações dos módulos
- `queues` - Fila de músicas
- `musics` - Músicas disponíveis
- `tournaments` - Torneios
- `avatars` - Avatares dos usuários

### ENUMs:
- `user_role`: jogador, staff, organizador, admin
- `event_type`: festa, competicao, treino, workshop
- `event_status`: ativo, pausado, finalizado, cancelado
- `queue_status`: aguardando, em_andamento, finalizado

## 🔧 Scripts Disponíveis

- `npm run dev` - Executar em desenvolvimento
- `npm run build` - Compilar TypeScript
- `npm start` - Executar em produção
- `npm test` - Executar testes
- `node scripts/setup-prod-db.js` - Configurar banco de produção

## 📝 Logs

Em produção, os logs são gerenciados pelo PM2:
```bash
pm2 logs just-dance-hub
pm2 monit
```

## 🔄 Atualizações

Para atualizar a aplicação:
```bash
git pull
npm install
npm run build
pm2 restart just-dance-hub
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte, envie um email para [seu-email@exemplo.com] ou abra uma issue no GitHub.

## 🛡️ Super Admin

- O sistema cria automaticamente um usuário super admin padrão:
  - **Usuário:** superadmin
  - **Email:** superadmin@justdancehub.com
  - **Senha:** admin123
- **Troque a senha do super admin após a instalação!**
- O super admin tem todos os poderes e não pode ser removido por outros admins.

---

**Desenvolvido com ❤️ para a comunidade Just Dance**