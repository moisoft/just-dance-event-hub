# 📚 Documentação - Just Dance Event Hub

Bem-vindo à documentação completa do Just Dance Event Hub! Esta documentação irá guiá-lo através de todos os aspectos do projeto.

## 📖 Índice

### 🚀 Começando
- [Instalação](INSTALLATION.md) - Como instalar e configurar o projeto
- [Configuração](CONFIGURATION.md) - Configurações do ambiente
- [Primeiros Passos](GETTING_STARTED.md) - Tutorial de início rápido

### 🔧 Desenvolvimento
- [Arquitetura](ARCHITECTURE.md) - Visão geral da arquitetura
- [API Reference](API.md) - Documentação completa da API
- [Banco de Dados](DATABASE.md) - Estrutura e modelos do banco
- [Frontend](FRONTEND.md) - Guia do frontend React

### 🚀 Deploy e Produção
- [Deploy Ubuntu](UBUNTU_SCRIPTS_README.md) - Scripts automatizados para Ubuntu
- [Deploy Manual](DEPLOY_INSTRUCTIONS.md) - Instruções de deploy manual
- [Backup](BACKUP.md) - Sistema de backup e restauração
- [Monitoramento](MONITORING.md) - Health check e monitoramento

### 🔒 Segurança
- [Segurança](SECURITY.md) - Medidas de segurança implementadas
- [Autenticação](AUTHENTICATION.md) - Sistema de autenticação JWT

### 🧪 Testes
- [Testes](TESTING.md) - Como executar e escrever testes
- [Debugging](DEBUGGING.md) - Técnicas de debugging

## 🎯 Visão Geral

O Just Dance Event Hub é uma plataforma completa para gerenciamento de eventos de Just Dance, oferecendo:

- **Sistema de Filas Inteligente** - Gerenciamento automático de filas de músicas
- **Torneios** - Sistema completo de brackets e competições
- **Autenticação de Usuários** - Sistema seguro com JWT
- **Dashboard em Tempo Real** - Interface moderna e responsiva
- **Módulos Configuráveis** - Sistema flexível de módulos

## 🏗️ Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **TypeScript** - Linguagem tipada
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados
- **Sequelize** - ORM
- **JWT** - Autenticação
- **PM2** - Gerenciamento de processos

### Frontend
- **React** - Biblioteca UI
- **TypeScript** - Linguagem tipada
- **Material-UI** - Componentes UI
- **Axios** - Cliente HTTP
- **React Router** - Roteamento

### DevOps
- **Nginx** - Proxy reverso
- **Docker** - Containerização (opcional)
- **PM2** - Process manager
- **Cron** - Agendamento de tarefas

## 📊 Estrutura do Projeto

```
just-dance-event-hub/
├── backend/                 # API Backend
│   ├── src/
│   │   ├── controllers/     # Controladores da API
│   │   ├── models/         # Modelos do banco de dados
│   │   ├── routes/         # Rotas da API
│   │   ├── middlewares/    # Middlewares
│   │   ├── services/       # Lógica de negócio
│   │   ├── types/          # Tipos TypeScript
│   │   └── utils/          # Utilitários
│   ├── scripts/            # Scripts de setup
│   └── tests/              # Testes
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas
│   │   ├── services/       # Serviços de API
│   │   ├── styles/         # Estilos
│   │   └── types/          # Tipos TypeScript
│   └── public/             # Arquivos públicos
├── scripts/                # Scripts de deploy
│   ├── install-ubuntu.sh   # Instalação automática
│   ├── backup-ubuntu.sh    # Backup automático
│   └── health-check-ubuntu.sh # Verificação de saúde
└── docs/                   # Documentação
```

## 🔧 Configuração Rápida

### Pré-requisitos
- Node.js 18+
- PostgreSQL 12+
- Git

### Instalação
```bash
# Clone o repositório
git clone https://github.com/moisoft/just-dance-event-hub.git
cd just-dance-event-hub

# Backend
cd backend
npm install
cp env.example .env
# Configure o arquivo .env
npm run build
npm start

# Frontend (em outro terminal)
cd frontend
npm install
npm start
```

## 📞 Suporte

- 📧 Email: moise@moisoft.com
- 🐛 Issues: [GitHub Issues](https://github.com/moisoft/just-dance-event-hub/issues)
- 📖 Wiki: [GitHub Wiki](https://github.com/moisoft/just-dance-event-hub/wiki)

## 🤝 Contribuindo

Veja o guia de [Contribuição](../CONTRIBUTING.md) para detalhes sobre como contribuir com o projeto.

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](../LICENSE) para mais detalhes.

---

**Última atualização:** $(date) 