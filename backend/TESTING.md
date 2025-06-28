# 🧪 Guia de Testes - Just Dance Event Hub

## 📋 Visão Geral

Este documento descreve como executar e manter os testes do projeto Just Dance Event Hub.

## 🚀 Executando os Testes

### Pré-requisitos

1. **PostgreSQL** rodando na porta 5432
2. **Node.js** versão 16 ou superior
3. **npm** ou **yarn**

### Configuração Rápida

```bash
# Navegar para o diretório backend
cd backend

# Instalar dependências
npm install

# Executar todos os testes
npm test

# Executar testes com watch mode
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

### Configuração Manual

1. **Criar banco de dados de teste:**
```sql
CREATE DATABASE just_dance_hub_test;
```

2. **Configurar variáveis de ambiente:**
```bash
# Copiar arquivo de exemplo
cp env.example .env.test

# Editar com suas configurações
DB_NAME=just_dance_hub_test
DB_USER=postgres
DB_PASSWORD=sua_senha
```

3. **Executar testes:**
```bash
npm test
```

## 📁 Estrutura dos Testes

```
src/__tests__/
├── authController.test.ts    # Testes de autenticação
├── eventController.test.ts   # Testes de eventos
├── queueController.test.ts   # Testes de fila
├── middlewares.test.ts       # Testes de middlewares
├── models.test.ts           # Testes de modelos
└── setup.ts                 # Configuração global
```

## 🧪 Tipos de Testes

### 1. Testes de Controladores
- **authController.test.ts**: Testa registro, login e perfil de usuários
- **eventController.test.ts**: Testa CRUD de eventos
- **queueController.test.ts**: Testa operações de fila

### 2. Testes de Middlewares
- **middlewares.test.ts**: Testa autenticação, rate limiting, CORS e tratamento de erros

### 3. Testes de Modelos
- **models.test.ts**: Testa validações, relacionamentos e hooks dos modelos

## 🔧 Configuração do Jest

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/app.ts',
    '!src/**/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testTimeout: 10000,
};
```

## 📊 Cobertura de Testes

### Endpoints Testados

#### Autenticação
- ✅ `POST /api/auth/register` - Registro de usuário
- ✅ `POST /api/auth/login` - Login de usuário
- ✅ `GET /api/auth/profile` - Perfil do usuário

#### Eventos
- ✅ `GET /api/events` - Listar eventos
- ✅ `POST /api/events` - Criar evento
- ✅ `GET /api/events/:code` - Obter evento por código
- ✅ `PUT /api/events/:id` - Atualizar evento
- ✅ `DELETE /api/events/:id` - Deletar evento

#### Fila
- ✅ `GET /api/queues/:eventId` - Obter fila do evento
- ✅ `POST /api/queues/:eventId` - Adicionar à fila
- ✅ `PUT /api/queues/:id/finish` - Finalizar item da fila
- ✅ `DELETE /api/queues/:id` - Remover da fila

### Funcionalidades Testadas

#### Segurança
- ✅ Autenticação JWT
- ✅ Rate Limiting
- ✅ CORS
- ✅ Headers de Segurança (Helmet)
- ✅ Validação de entrada

#### Modelos
- ✅ Validações de dados
- ✅ Relacionamentos
- ✅ Hooks (hash de senha)
- ✅ Constraints únicas

#### Middlewares
- ✅ Tratamento de erros
- ✅ Autenticação
- ✅ Validação

## 🐛 Solução de Problemas

### Erro: "Cannot find module 'supertest'"
```bash
npm install --save-dev supertest @types/supertest
```

### Erro: "Database connection failed"
1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais no `.env.test`
3. Verifique se o banco `just_dance_hub_test` existe

### Erro: "JWT_SECRET is not defined"
```bash
# Adicione ao .env.test
JWT_SECRET=test_secret_key
```

### Testes falhando por timeout
```bash
# Aumente o timeout no jest.config.js
testTimeout: 30000
```

## 📈 Adicionando Novos Testes

### 1. Criar arquivo de teste
```typescript
// src/__tests__/novoController.test.ts
import request from 'supertest';
import app from '../app';

describe('NovoController', () => {
  it('should do something', async () => {
    const response = await request(app)
      .get('/api/novo-endpoint')
      .expect(200);
    
    expect(response.body.success).toBe(true);
  });
});
```

### 2. Padrões de Teste

#### Setup/Teardown
```typescript
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await User.destroy({ where: {} });
});
```

#### Testes de Autenticação
```typescript
it('should require authentication', async () => {
  const response = await request(app)
    .get('/api/protected-endpoint')
    .expect(401);
  
  expect(response.body.message).toBe('Token não fornecido');
});
```

#### Testes de Validação
```typescript
it('should validate required fields', async () => {
  const response = await request(app)
    .post('/api/endpoint')
    .send({})
    .expect(400);
  
  expect(response.body.success).toBe(false);
});
```

## 🎯 Boas Práticas

1. **Isolamento**: Cada teste deve ser independente
2. **Limpeza**: Sempre limpe dados entre testes
3. **Nomes descritivos**: Use nomes claros para os testes
4. **Arrange-Act-Assert**: Estruture testes em 3 partes
5. **Mocks**: Use mocks para dependências externas
6. **Coverage**: Mantenha cobertura acima de 80%

## 📝 Comandos Úteis

```bash
# Executar testes específicos
npm test -- --testNamePattern="auth"

# Executar testes com verbose
npm test -- --verbose

# Executar testes e gerar relatório de cobertura
npm test -- --coverage

# Executar testes em modo watch
npm test -- --watch

# Executar testes de um arquivo específico
npm test -- authController.test.ts
```

## 🔄 CI/CD

Os testes são executados automaticamente em:
- Pull Requests
- Push para main
- Deploy

### GitHub Actions
```yaml
- name: Run Tests
  run: |
    cd backend
    npm install
    npm test
```

## 📞 Suporte

Se encontrar problemas com os testes:
1. Verifique a documentação
2. Consulte os logs de erro
3. Abra uma issue no repositório
4. Entre em contato com a equipe de desenvolvimento 