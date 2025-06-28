# 🤝 Contribuindo para o Just Dance Event Hub

Obrigado por considerar contribuir com o Just Dance Event Hub! Este documento fornece diretrizes para contribuições.

## 📋 Índice

- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Processo de Pull Request](#processo-de-pull-request)
- [Reportando Bugs](#reportando-bugs)
- [Solicitando Funcionalidades](#solicitando-funcionalidades)

## 🚀 Como Contribuir

### Tipos de Contribuições

Aceitamos os seguintes tipos de contribuições:

- 🐛 **Bug Fixes** - Correções de bugs
- ✨ **New Features** - Novas funcionalidades
- 📚 **Documentation** - Melhorias na documentação
- 🧪 **Tests** - Adição ou melhoria de testes
- 🔧 **Refactoring** - Refatoração de código
- 🎨 **UI/UX** - Melhorias na interface

### Antes de Começar

1. Verifique se já existe uma issue para o que você quer fazer
2. Se não existir, crie uma nova issue descrevendo o problema ou funcionalidade
3. Discuta a abordagem com a equipe antes de começar a codificar

## 🔧 Configuração do Ambiente

### Pré-requisitos

- Node.js 18+
- PostgreSQL 12+
- Git

### Setup Local

```bash
# 1. Fork o repositório
# 2. Clone seu fork
git clone https://github.com/seu-usuario/just-dance-event-hub.git
cd just-dance-event-hub

# 3. Adicione o repositório original como upstream
git remote add upstream https://github.com/moisoft/just-dance-event-hub.git

# 4. Configure o backend
cd backend
npm install
cp env.example .env
# Configure o arquivo .env

# 5. Configure o frontend
cd ../frontend
npm install
```

### Scripts Úteis

```bash
# Backend
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run test         # Executar testes
npm run lint         # Verificar linting

# Frontend
npm start            # Desenvolvimento
npm run build        # Build para produção
npm test             # Executar testes
npm run lint         # Verificar linting
```

## 📝 Padrões de Código

### TypeScript/JavaScript

- Use **TypeScript** para todo novo código
- Mantenha tipagem estrita
- Use interfaces para definir tipos
- Evite `any` - use tipos específicos

```typescript
// ✅ Bom
interface User {
  id: number;
  name: string;
  email: string;
}

const getUser = async (id: number): Promise<User> => {
  // implementação
};

// ❌ Evite
const getUser = async (id: any): Promise<any> => {
  // implementação
};
```

### Nomenclatura

- **Variáveis e funções**: camelCase
- **Classes e interfaces**: PascalCase
- **Constantes**: UPPER_SNAKE_CASE
- **Arquivos**: kebab-case

```typescript
// ✅ Bom
const userName = 'John';
const MAX_RETRY_ATTEMPTS = 3;

interface UserProfile {
  // ...
}

class UserService {
  // ...
}

// ❌ Evite
const user_name = 'John';
const maxRetryAttempts = 3;
```

### Estrutura de Arquivos

```
src/
├── controllers/     # Controladores da API
├── models/         # Modelos do banco
├── routes/         # Definição de rotas
├── middlewares/    # Middlewares
├── services/       # Lógica de negócio
├── types/          # Tipos TypeScript
└── utils/          # Utilitários
```

### Comentários

- Use comentários para explicar **por que**, não **o que**
- Documente funções complexas
- Mantenha comentários atualizados

```typescript
// ✅ Bom
// Retorna usuários ativos nos últimos 30 dias
// para otimizar performance da query
const getActiveUsers = async (): Promise<User[]> => {
  // implementação
};

// ❌ Evite
// Função que pega usuários
const getActiveUsers = async (): Promise<User[]> => {
  // implementação
};
```

## 🔄 Processo de Pull Request

### 1. Preparação

```bash
# 1. Mantenha seu fork atualizado
git fetch upstream
git checkout main
git merge upstream/main

# 2. Crie uma branch para sua feature
git checkout -b feature/nova-funcionalidade

# 3. Faça suas alterações
# 4. Teste suas alterações
npm run test
npm run lint
```

### 2. Commit

- Use commits atômicos e descritivos
- Use o padrão Conventional Commits

```bash
# ✅ Exemplos de commits
feat: adiciona sistema de notificações
fix: corrige bug na autenticação
docs: atualiza documentação da API
test: adiciona testes para UserService
refactor: refatora lógica de validação
```

### 3. Pull Request

1. **Título descritivo**: "feat: adiciona sistema de notificações"
2. **Descrição detalhada**: Explique o que foi feito e por quê
3. **Referência à issue**: "Closes #123" ou "Fixes #123"
4. **Screenshots**: Se aplicável para mudanças de UI

### Template de Pull Request

```markdown
## 📝 Descrição
Breve descrição das mudanças

## 🔗 Issue Relacionada
Closes #123

## 🧪 Testes
- [ ] Testes unitários passando
- [ ] Testes de integração passando
- [ ] Testes manuais realizados

## 📸 Screenshots
Se aplicável, adicione screenshots

## ✅ Checklist
- [ ] Código segue os padrões do projeto
- [ ] Documentação foi atualizada
- [ ] Testes foram adicionados/atualizados
- [ ] Build passa sem erros
```

## 🐛 Reportando Bugs

### Antes de Reportar

1. Verifique se o bug já foi reportado
2. Teste na versão mais recente
3. Tente reproduzir o bug

### Template de Bug Report

```markdown
## 🐛 Descrição do Bug
Descrição clara e concisa do bug

## 🔄 Passos para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

## ✅ Comportamento Esperado
O que deveria acontecer

## ❌ Comportamento Atual
O que está acontecendo

## 📸 Screenshots
Se aplicável

## 💻 Ambiente
- OS: [ex: Ubuntu 20.04]
- Node.js: [ex: 18.15.0]
- PostgreSQL: [ex: 14.5]
- Browser: [ex: Chrome 96]

## 📋 Informações Adicionais
Qualquer informação adicional
```

## ✨ Solicitando Funcionalidades

### Template de Feature Request

```markdown
## 🎯 Descrição da Funcionalidade
Descrição clara da funcionalidade desejada

## 💡 Caso de Uso
Como essa funcionalidade seria usada

## 🔧 Proposta de Implementação
Sugestões de como implementar (opcional)

## 📋 Alternativas Consideradas
Outras abordagens consideradas

## 📸 Mockups
Se aplicável, adicione mockups ou wireframes
```

## 🧪 Testes

### Executando Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test

# Todos os testes
npm run test:all
```

### Escrevendo Testes

- Teste todas as novas funcionalidades
- Mantenha cobertura de testes alta
- Use mocks para dependências externas
- Teste casos de sucesso e erro

```typescript
// ✅ Exemplo de teste
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const result = await userService.createUser(userData);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(userData.name);
      expect(result.email).toBe(userData.email);
    });

    it('should throw error with invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123'
      };

      await expect(userService.createUser(userData))
        .rejects.toThrow('Invalid email format');
    });
  });
});
```

## 📚 Documentação

### Atualizando Documentação

- Mantenha a documentação atualizada
- Documente novas funcionalidades
- Inclua exemplos de uso
- Atualize README quando necessário

### Padrões de Documentação

```markdown
## Funcionalidade

### Descrição
Breve descrição da funcionalidade

### Uso
```typescript
// Exemplo de código
const result = await api.getUsers();
```

### Parâmetros
- `param1` (string): Descrição do parâmetro
- `param2` (number): Descrição do parâmetro

### Retorno
- `Promise<User[]>`: Lista de usuários
```

## 🎯 Diretrizes Gerais

### Comunicação

- Seja respeitoso e construtivo
- Use linguagem clara e profissional
- Responda a comentários e feedback
- Mantenha discussões focadas no código

### Qualidade

- Escreva código limpo e legível
- Siga os padrões estabelecidos
- Teste suas alterações
- Documente mudanças significativas

### Performance

- Considere o impacto na performance
- Otimize queries de banco de dados
- Minimize o tamanho do bundle
- Use lazy loading quando apropriado

## 🏆 Reconhecimento

Contribuições significativas serão reconhecidas:

- Menção no README
- Badge de contribuidor
- Agradecimento em releases

## 📞 Suporte

Se você tiver dúvidas sobre como contribuir:

- 📧 Email: moise@moisoft.com
- 💬 Discord: [Link do servidor]
- 🐛 Issues: [GitHub Issues](https://github.com/moisoft/just-dance-event-hub/issues)

---

**Obrigado por contribuir com o Just Dance Event Hub! 🎵** 