# Just Dance Event Hub

Sistema de gerenciamento de eventos de Just Dance com arquitetura **Frontend-Only** usando Supabase.

## 🚀 Tecnologias

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (API REST + Auth + Real-time + Storage)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Arquitetura**: Frontend-Only (sem servidor backend)

## 📋 Pré-requisitos

- Node.js 18+
- Conta no Supabase
- npm ou yarn

## ⚡ Instalação Rápida

### 1. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Obtenha suas credenciais (URL, Anon Key, Service Role Key)

### 2. Configurar Frontend

```bash
cd frontend
cp env.supabase.example .env
# Edite o arquivo .env com suas credenciais do Supabase
npm install
```

### 3. Executar Migração

```bash
# Execute o script de migração diretamente no Supabase
# Ou use o SQL fornecido no SUPABASE_MIGRATION_GUIDE.md
```

### 4. Iniciar Aplicação

```bash
cd frontend
npm start
```

## 📁 Estrutura do Projeto

```
just-dance-event-hub/
├── frontend/               # Aplicação React + Supabase
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── config/         # Configuração Supabase
│   │   ├── contexts/       # Contextos React
│   │   ├── services/       # Serviços Supabase
│   │   ├── hooks/          # Hooks customizados
│   │   └── types/          # Tipos TypeScript
│   ├── package.json
│   └── env.supabase.example
├── LICENSE
├── README.md
├── SUPABASE_MIGRATION_GUIDE.md
└── FRONTEND_ONLY_ARCHITECTURE.md
```

## 🔧 Funcionalidades

- ✅ **Autenticação** com Supabase Auth
- ✅ **Gerenciamento de eventos** com real-time
- ✅ **Sistema de filas** para eventos
- ✅ **Gerenciamento de times** e competições
- ✅ **Sistema de storage** com buckets organizados
- ✅ **Upload de arquivos** (avatares, capas, vídeos, imagens)
- ✅ **Real-time updates** para todas as funcionalidades
- ✅ **Row Level Security** para proteção de dados
- ✅ **Interface moderna** e responsiva
- ✅ **API REST completa** via Supabase

## 📚 Documentação

- [Guia de Migração para Supabase](SUPABASE_MIGRATION_GUIDE.md)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.