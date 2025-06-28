# 🚀 Instruções de Deploy - Just Dance Event Hub Backend

## 📦 Arquivo: `just-dance-hub-backend-production.zip`

### ⚡ Deploy Rápido (5 minutos)

#### 1. Upload e Extração
```bash
# Upload do ZIP para o servidor
# Extrair no diretório desejado
unzip just-dance-hub-backend-production.zip
cd backend
```

#### 2. Configuração do Banco
```bash
# Conectar ao PostgreSQL
sudo -u postgres psql

# Criar banco de dados
CREATE DATABASE just_dance_hub;
\q

# Configurar ENUMs
node scripts/setup-prod-db.js
```

#### 3. Configuração do Ambiente
```bash
# Copiar e editar .env
cp env.example .env
nano .env
```

**Conteúdo do .env:**
```env
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=just_dance_hub
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
PORT=3000
```

#### 4. Instalação e Build
```bash
# Instalar dependências
npm install

# Compilar TypeScript
npm run build
```

#### 5. Iniciar com PM2
```bash
# Instalar PM2 (se não tiver)
npm install -g pm2

# Iniciar aplicação
pm2 start dist/app.js --name "just-dance-hub"

# Salvar configuração
pm2 save
pm2 startup
```

#### 6. Verificar Status
```bash
# Verificar se está rodando
pm2 status
pm2 logs just-dance-hub

# Testar API
curl http://localhost:3000/api/health
```

### 🔧 Comandos Úteis

```bash
# Reiniciar aplicação
pm2 restart just-dance-hub

# Ver logs em tempo real
pm2 logs just-dance-hub --lines 100

# Monitorar recursos
pm2 monit

# Parar aplicação
pm2 stop just-dance-hub

# Remover do PM2
pm2 delete just-dance-hub
```

### 🌐 Configuração do Nginx (Opcional)

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

### 📊 Endpoints Principais

- `GET /api/health` - Status da API
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `GET /api/events` - Listar eventos
- `POST /api/events` - Criar evento
- `GET /api/queues/:eventId` - Fila do evento

### 🔐 Autenticação

Todos os endpoints protegidos requerem:
```
Authorization: Bearer <token>
```

### 📝 Logs e Monitoramento

```bash
# Logs da aplicação
pm2 logs just-dance-hub

# Logs do sistema
sudo journalctl -u pm2-root

# Monitoramento
pm2 monit
```

### 🔄 Atualizações

```bash
# Parar aplicação
pm2 stop just-dance-hub

# Fazer backup (se necessário)
cp -r backend backend-backup

# Extrair nova versão
unzip nova-versao.zip

# Instalar e build
npm install
npm run build

# Reiniciar
pm2 restart just-dance-hub
```

---

## ✅ Checklist de Deploy

- [ ] Banco de dados criado
- [ ] ENUMs configurados
- [ ] Arquivo .env configurado
- [ ] Dependências instaladas
- [ ] TypeScript compilado
- [ ] PM2 configurado
- [ ] Aplicação rodando
- [ ] API respondendo
- [ ] Logs verificados

---

**🎉 Deploy concluído! A API está pronta para uso em produção.** 