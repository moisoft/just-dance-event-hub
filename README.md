# 🎵 Just Dance Event Hub

Uma plataforma completa para gerenciamento de eventos de Just Dance, incluindo sistema de filas, torneios, autenticação de usuários e muito mais.

## 🌟 Características

- **🎮 Sistema de Filas Inteligente** - Gerenciamento automático de filas de músicas
- **🏆 Torneios** - Sistema completo de brackets e competições
- **👥 Autenticação de Usuários** - Sistema seguro com JWT
- **🎵 Biblioteca de Músicas** - Gerenciamento de músicas e configurações
- **📊 Dashboard em Tempo Real** - Interface moderna e responsiva
- **🔧 Módulos Configuráveis** - Sistema flexível de módulos
- **🚀 Deploy Automatizado** - Scripts de instalação para Ubuntu

## 🏗️ Arquitetura

### Backend
- **Node.js** com **TypeScript**
- **Express.js** para API REST
- **PostgreSQL** com **Sequelize ORM**
- **JWT** para autenticação
- **PM2** para gerenciamento de processos
- **Nginx** como proxy reverso

### Frontend
- **React** com **TypeScript**
- **Material-UI** para interface
- **Axios** para requisições HTTP
- **React Router** para navegação

## 🚀 Instalação Rápida

### Pré-requisitos
- Ubuntu 18.04+ ou similar
- Node.js 18+
- PostgreSQL 12+
- Git

### Instalação Automática (Ubuntu)
```bash
# 1. Clone o repositório
git clone https://github.com/moisoft/just-dance-event-hub.git
cd just-dance-event-hub

# 2. Execute o script de instalação
chmod +x scripts/install-ubuntu.sh
./scripts/install-ubuntu.sh

# 3. Verifique a instalação
./scripts/health-check-ubuntu.sh
```

### Instalação Manual
```bash
# 1. Clone o repositório
git clone https://github.com/moisoft/just-dance-event-hub.git
cd just-dance-event-hub

# 2. Configure o backend
cd backend
npm install
cp env.example .env
# Edite o arquivo .env com suas configurações
npm run build
npm start

# 3. Configure o frontend
cd ../frontend
npm install
npm start
```

## 📁 Estrutura do Projeto

```
just-dance-event-hub/
├── backend/                 # API Backend
│   ├── src/
│   │   ├── controllers/     # Controladores da API
│   │   ├── models/         # Modelos do banco de dados
│   │   ├── routes/         # Rotas da API
│   │   ├── middlewares/    # Middlewares
│   │   └── utils/          # Utilitários
│   └── scripts/            # Scripts de setup
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas
│   │   ├── services/       # Serviços de API
│   │   └── types/          # Tipos TypeScript
├── scripts/                # Scripts de deploy
│   ├── install-ubuntu.sh   # Instalação automática
│   ├── backup-ubuntu.sh    # Backup automático
│   └── health-check-ubuntu.sh # Verificação de saúde
└── docs/                   # Documentação
```

## 🔧 Scripts de Deploy

### Ubuntu
- `scripts/install-ubuntu.sh` - Instalação automática completa
- `scripts/uninstall-ubuntu.sh` - Desinstalação completa
- `scripts/backup-ubuntu.sh` - Backup automático
- `scripts/health-check-ubuntu.sh` - Verificação de saúde

### Comandos de Gerenciamento
```bash
# Status da aplicação
sudo just-dance-hub status

# Ver logs
sudo just-dance-hub logs

# Reiniciar aplicação
sudo just-dance-hub restart

# Monitorar recursos
sudo just-dance-hub monit
```

## 📚 Documentação

- [📖 Documentação Completa](docs/README.md)
- [🚀 Guia de Deploy](docs/DEPLOY_INSTRUCTIONS.md)
- [🔧 Scripts Ubuntu](docs/UBUNTU_SCRIPTS_README.md)
- [🏥 Health Check](docs/README.md#health-check)
- [🔄 Backup e Restauração](docs/README.md#backup)

## 🎯 Funcionalidades

### Sistema de Filas
- Adição/remoção de músicas na fila
- Priorização de músicas
- Controle de tempo de espera
- Histórico de reprodução

### Torneios
- Criação de brackets automáticos
- Sistema de pontuação
- Histórico de partidas
- Rankings atualizados

### Autenticação
- Registro de usuários
- Login seguro com JWT
- Perfis de usuário
- Controle de acesso

### Dashboard
- Interface em tempo real
- Estatísticas de uso
- Controle de eventos
- Configurações do sistema

## 🔒 Segurança

- Autenticação JWT
- Validação de dados
- Rate limiting
- Headers de segurança
- Backup automático
- Logs de auditoria

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil do usuário

### Eventos
- `GET /api/events` - Listar eventos
- `POST /api/events` - Criar evento
- `PUT /api/events/:id` - Atualizar evento
- `DELETE /api/events/:id` - Deletar evento

### Filas
- `GET /api/queue` - Status da fila
- `POST /api/queue/add` - Adicionar música
- `DELETE /api/queue/remove/:id` - Remover música

### Torneios
- `GET /api/tournaments` - Listar torneios
- `POST /api/tournaments` - Criar torneio
- `GET /api/tournaments/:id/bracket` - Bracket do torneio

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Moise** - *Desenvolvimento inicial* - [Moise](https://github.com/moisoft)

## 🙏 Agradecimentos

- Comunidade Just Dance
- Contribuidores do projeto
- Bibliotecas open source utilizadas

## 📞 Suporte

- 📧 Email: moise@moisoft.com
- 🐛 Issues: [GitHub Issues](https://github.com/moisoft/just-dance-event-hub/issues)
- 📖 Wiki: [GitHub Wiki](https://github.com/moisoft/just-dance-event-hub/wiki)

---

⭐ **Se este projeto te ajudou, considere dar uma estrela no GitHub!**