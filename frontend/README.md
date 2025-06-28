# Just Dance Event Hub - Frontend Documentation

## Visão Geral
O Just Dance Event Hub é uma aplicação web projetada para gerenciar eventos de Just Dance, proporcionando uma experiência interativa e gamificada para jogadores e organizadores. O frontend é construído com React e TypeScript, oferecendo uma interface moderna e responsiva.

## Estrutura do Projeto
A estrutura do frontend é organizada da seguinte forma:

```
frontend
├── src
│   ├── components          # Componentes reutilizáveis da aplicação
│   │   ├── AuthScreen.tsx  # Tela de autenticação
│   │   ├── EventHubScreen.tsx # Tela principal para interação com eventos
│   │   ├── PlayerDashboard.tsx # Painel do jogador
│   │   ├── MusicSelectionScreen.tsx # Seleção de músicas
│   │   ├── StaffPanel.tsx  # Painel de controle para staff
│   │   └── TournamentBracket.tsx # Exibição da árvore do torneio
│   ├── pages               # Páginas da aplicação
│   │   ├── Home.tsx        # Página inicial
│   │   ├── Login.tsx       # Página de login
│   │   └── Register.tsx     # Página de registro
│   ├── services            # Serviços para interagir com a API
│   │   └── api.ts          # Funções para chamadas à API
│   ├── types               # Tipos TypeScript
│   │   └── index.ts        # Definições de tipos
│   ├── styles              # Estilos da aplicação
│   │   └── theme.ts        # Tema de estilo
│   ├── App.tsx             # Componente principal da aplicação
│   └── index.tsx           # Ponto de entrada da aplicação React
├── package.json            # Configuração do npm
├── tsconfig.json           # Configuração do TypeScript
└── README.md               # Documentação do projeto frontend
```

## Instalação
Para instalar as dependências do projeto, execute o seguinte comando na raiz do diretório `frontend`:

```
npm install
```

## Execução
Para iniciar a aplicação em modo de desenvolvimento, utilize o comando:

```
npm start
```

A aplicação estará disponível em `http://localhost:3000`.

## Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests para melhorias e correções.

## Licença
Este projeto está licenciado sob a MIT License. Veja o arquivo LICENSE para mais detalhes.