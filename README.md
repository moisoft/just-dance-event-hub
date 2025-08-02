# 🎵 Just Dance Event Hub

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-blue)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen)](https://github.com/moisoft/just-dance-event-hub)
[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen)](CONTRIBUTING.md)

> 🎮 **Uma plataforma completa e open source para gerenciamento de eventos de Just Dance**

Uma plataforma completa para gerenciamento de eventos de Just Dance, incluindo sistema de filas, torneios, autenticação de usuários e muito mais. **100% Open Source** e construída com tecnologias modernas.

## 🌟 Características

- **🎮 Sistema de Filas Inteligente** - Gerenciamento automático de filas de músicas
- **🏆 Torneios** - Sistema completo de brackets e competições
- **👥 Autenticação de Usuários** - Sistema seguro com JWT
- **🎵 Biblioteca de Músicas** - Gerenciamento de músicas e configurações
- **📊 Dashboard em Tempo Real** - Interface moderna e responsiva
- **🔧 Módulos Configuráveis** - Sistema flexível de módulos
- **🚀 Deploy Automatizado** - Scripts de instalação para Ubuntu
- **🔒 Segurança Robusta** - Rate limiting, validação e headers de segurança
- **📱 Responsivo** - Funciona em desktop e mobile
- **🌍 Internacionalização** - Suporte a múltiplos idiomas

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

## 🚀 Pré-requisitos

- Ubuntu 18.04+ ou Windows 10/11
- Node.js 18+
- PostgreSQL 12+
- Git

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
│   └── scripts/            # Scripts de setup do backend
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas
│   │   ├── services/       # Serviços de API
│   │   └── types/          # Tipos TypeScript
├── config/                 # Arquivos de configuração
│   ├── apache-ssl.conf     # Configuração SSL Apache
│   └── nginx-ssl.conf      # Configuração SSL Nginx
├── scripts/                # Scripts de automação
│   ├── install-ubuntu.sh   # Instalação automática (Ubuntu)
│   ├── ubuntu-webserver-setup.sh # Setup servidor web Ubuntu
│   ├── ubuntu-apache-config.sh # Configuração Apache Ubuntu
│   ├── ubuntu-nginx-config.sh # Configuração Nginx Ubuntu
│   ├── ubuntu-validation.sh # Validação sistema Ubuntu
│   ├── backup-ubuntu.sh    # Backup automático (Ubuntu)
│   ├── health-check-ubuntu.sh # Verificação de saúde (Ubuntu)
│   ├── install-windows.ps1 # Instalação automática (Windows)
│   ├── production-setup.ps1 # Setup produção Windows
│   ├── production-validation.ps1 # Validação sistema Windows
│   ├── apache-setup.ps1    # Setup Apache Windows
│   ├── security-hardening.ps1 # Hardening de segurança
│   ├── test-system.ps1     # Teste do sistema
│   ├── uninstall-windows.ps1 # Desinstalação (Windows)
│   └── health-check-windows.ps1 # Verificação de saúde (Windows)
├── docs/                   # Documentação
│   ├── COMO_USAR_SCRIPTS_UBUNTU.md # Guia scripts Ubuntu
│   ├── COMO_USAR_SCRIPTS_WINDOWS.md # Guia scripts Windows
│   ├── DEPLOY_INSTRUCTIONS.md # Instruções de deploy
│   └── README.md           # Documentação principal
└── error-middleware-app/   # Aplicação middleware de erro
```

## 🔧 Scripts de Automação

### Ubuntu Server
- `scripts/ubuntu-webserver-setup.sh` - Setup completo com escolha Nginx/Apache
- `scripts/ubuntu-apache-config.sh` - Configuração avançada Apache
- `scripts/ubuntu-nginx-config.sh` - Configuração avançada Nginx
- `scripts/ubuntu-validation.sh` - Validação completa do sistema
- `scripts/install-ubuntu.sh` - Instalação automática completa
- `scripts/uninstall-ubuntu.sh` - Desinstalação completa
- `scripts/backup-ubuntu.sh` - Backup automático
- `scripts/health-check-ubuntu.sh` - Verificação de saúde

### Windows
- `scripts/production-setup.ps1` - Setup completo para produção
- `scripts/production-validation.ps1` - Validação do sistema
- `scripts/apache-setup.ps1` - Configuração Apache
- `scripts/security-hardening.ps1` - Hardening de segurança
- `scripts/test-system.ps1` - Teste básico do sistema
- `scripts/install-windows.ps1` - Instalação automática completa
- `scripts/uninstall-windows.ps1` - Desinstalação completa
- `scripts/health-check-windows.ps1` - Verificação de saúde

### Comandos de Gerenciamento (Ubuntu)
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

### Comandos de Gerenciamento (Windows)
```powershell
# Status da aplicação
.\just-dance-hub.ps1 status

# Ver logs
.\just-dance-hub.ps1 logs

# Reiniciar aplicação
.\just-dance-hub.ps1 restart

# Monitorar recursos
.\just-dance-hub.ps1 monit
```

## 📚 Documentação

### Guias Principais
- [📖 Documentação Completa](docs/README.md)
- [🚀 Guia de Deploy](docs/DEPLOY_INSTRUCTIONS.md)
- [🐧 Guia Ubuntu Server](UBUNTU_SETUP_GUIDE.md)
- [🏭 Guia de Produção](PRODUCTION_GUIDE.md)
- [⚡ Deploy Rápido](QUICK_DEPLOY.md)
- [🌐 Guia Servidor Web](WEB_SERVER_GUIDE.md)

### Scripts e Automação
- [🐧 Como Usar Scripts Ubuntu](docs/COMO_USAR_SCRIPTS_UBUNTU.md)
- [🪟 Como Usar Scripts Windows](docs/COMO_USAR_SCRIPTS_WINDOWS.md)

### Configurações
- [⚙️ Configurações SSL](config/) - Arquivos de configuração Apache e Nginx
- [🔒 Segurança](SECURITY.md) - Práticas de segurança
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

**Contribuições são sempre bem-vindas!** 🎉

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

Veja nosso [Guia de Contribuição](CONTRIBUTING.md) para mais detalhes.

### 🏆 Contribuidores

<a href="https://github.com/moisoft/just-dance-event-hub/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=moisoft/just-dance-event-hub" />
</a>

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Moises** - *Desenvolvimento inicial* - [Moise](https://github.com/moisoft)

## 🙏 Agradecimentos

- Comunidade Just Dance
- Contribuidores do projeto
- Bibliotecas open source utilizadas
- Todos que testaram e reportaram bugs

## 📞 Suporte

- 📧 Email: moise@moisoft.com
- 🐛 Issues: [GitHub Issues](https://github.com/moisoft/just-dance-event-hub/issues)
- 📖 Wiki: [GitHub Wiki](https://github.com/moisoft/just-dance-event-hub/wiki)
- 💬 Discussões: [GitHub Discussions](https://github.com/moisoft/just-dance-event-hub/discussions)

## 🌟 Stargazers

[![Stargazers repo roster for @moisoft/just-dance-event-hub](https://reporoster.com/stars/moisoft/just-dance-event-hub)](https://github.com/moisoft/just-dance-event-hub/stargazers)

## 📈 Estatísticas

![GitHub stars](https://img.shields.io/github/stars/moisoft/just-dance-event-hub?style=social)
![GitHub forks](https://img.shields.io/github/forks/moisoft/just-dance-event-hub?style=social)
![GitHub issues](https://img.shields.io/github/issues/moisoft/just-dance-event-hub)
![GitHub pull requests](https://img.shields.io/github/issues-pr/moisoft/just-dance-event-hub)
![GitHub license](https://img.shields.io/github/license/moisoft/just-dance-event-hub)

---

⭐ **Se este projeto te ajudou, considere dar uma estrela no GitHub!**

---

**🎵 Just Dance Event Hub - Feito com ❤️ pela comunidade open source**
