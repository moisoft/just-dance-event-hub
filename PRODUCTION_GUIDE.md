# Guia de Produção - Just Dance Event Hub

## 📋 Pré-requisitos

### Sistema Operacional
- Windows Server 2019/2022, Windows 10/11 Pro, ou Ubuntu Server 20.04/22.04 LTS
- Mínimo 4GB RAM, recomendado 8GB+
- 20GB de espaço livre em disco
- Conexão estável com a internet

### Software Necessário
- Node.js 18+ LTS
- PostgreSQL 14+
- PM2 (gerenciador de processos)
- Nginx (servidor web/proxy reverso)
- Git

## 🚀 Instalação Rápida

### Windows

Para implantação rápida no Windows, use o script PowerShell automatizado:

```powershell
# Execute como Administrador
.\production-setup.ps1 -Domain "seudominio.com" -Email "admin@seudominio.com"

# Ou sem SSL (apenas para testes)
.\production-setup.ps1 -SkipSSL
```

### Ubuntu Server

Para implantação rápida no Ubuntu Server, use o script bash automatizado:

```bash
# Tornar scripts executáveis
sudo chmod +x ubuntu-webserver-setup.sh
sudo chmod +x ubuntu-apache-config.sh
sudo chmod +x ubuntu-nginx-config.sh

# Escolher servidor web e executar configuração
sudo ./ubuntu-webserver-setup.sh --webserver nginx --domain seudominio.com --email admin@seudominio.com --ssl

# Para configuração avançada (opcional)
sudo ./ubuntu-nginx-config.sh  # ou ubuntu-apache-config.sh para Apache
```

Os scripts do Ubuntu irão:
- Instalar e configurar todas as dependências
- Configurar o servidor web escolhido (Nginx ou Apache)
- Configurar SSL com Let's Encrypt
- Aplicar configurações de segurança (firewall UFW, Fail2ban)
- Configurar monitoramento e logging

### 1. Executar Script Automatizado

### 2. Verificar Instalação

```powershell
# Verificar status dos serviços
pm2 status

# Verificar logs
pm2 logs

# Testar health check
.\health-check.ps1
```

## 🔧 Configuração Manual

### Windows

#### 1. Preparar Ambiente

```powershell
# Instalar Node.js (se não estiver instalado)
winget install OpenJS.NodeJS

# Instalar dependências globais
npm install -g pm2
npm install -g typescript

# Instalar PostgreSQL (se não estiver instalado)
winget install PostgreSQL.PostgreSQL

# Criar diretórios
New-Item -ItemType Directory -Force -Path "C:\opt\just-dance-hub"
New-Item -ItemType Directory -Force -Path "C:\logs\just-dance-hub"
New-Item -ItemType Directory -Force -Path "C:\backups\just-dance-hub"
```

### Ubuntu Server

#### 1. Preparar Ambiente

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar dependências globais
sudo npm install -g pm2
sudo npm install -g typescript

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Instalar Git e outras dependências
sudo apt install -y git curl wget gnupg2 software-properties-common

# Criar diretórios
sudo mkdir -p /opt/just-dance-hub
sudo mkdir -p /var/log/just-dance-hub
sudo mkdir -p /var/backups/just-dance-hub

# Definir permissões
sudo chown -R $USER:$USER /opt/just-dance-hub
sudo chown -R $USER:$USER /var/log/just-dance-hub
sudo chown -R $USER:$USER /var/backups/just-dance-hub
```

### 2. Configurar Banco de Dados

```sql
-- Conectar como postgres
psql -U postgres

-- Criar usuário e banco
CREATE USER just_dance_user WITH PASSWORD 'sua_senha_segura';
CREATE DATABASE just_dance_hub_prod OWNER just_dance_user;
GRANT ALL PRIVILEGES ON DATABASE just_dance_hub_prod TO just_dance_user;
```

### 3. Configurar Variáveis de Ambiente

#### Backend (.env)
```env
NODE_ENV=production
PORT=3000

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=just_dance_hub_prod
DB_USER=just_dance_user
DB_PASSWORD=sua_senha_segura

# Segurança
JWT_SECRET=seu_jwt_secret_muito_seguro_64_caracteres_minimo
JWT_EXPIRES_IN=24h

# Frontend
FRONTEND_URL=https://seudominio.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
AUTH_RATE_LIMIT_MAX_REQUESTS=3

# Logging
LOG_LEVEL=warn
LOG_FILE=true

# Segurança Avançada
SESSION_SECRET=seu_session_secret_muito_seguro
CORS_ORIGIN=https://seudominio.com
TRUST_PROXY=true
```

#### Frontend (.env.production)
```env
REACT_APP_API_BASE_URL=https://seudominio.com
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
GENERATE_SOURCEMAP=false
```

### 4. Compilar Aplicação

```powershell
# Backend
cd backend
npm ci --only=production
npm run build

# Frontend
cd ../frontend
npm ci --only=production
npm run build
```

### 5. Configurar PM2

#### ecosystem.config.js
```javascript
module.exports = {
  apps: [
    {
      name: 'just-dance-hub-backend',
      script: './backend/dist/app.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: 'C:/logs/just-dance-hub/error.log',
      out_file: 'C:/logs/just-dance-hub/out.log',
      log_file: 'C:/logs/just-dance-hub/combined.log',
      time: true
    },
    {
      name: 'just-dance-hub-websocket',
      script: './backend/websocket-server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: 'C:/logs/just-dance-hub/ws-error.log',
      out_file: 'C:/logs/just-dance-hub/ws-out.log',
      time: true
    }
  ]
};
```

### 6. Configurar Servidor Web

#### Opção A: Nginx (Padrão)

```powershell
# Instalar Nginx (se não estiver instalado)
# Baixe de: https://nginx.org/en/download.html

# Copiar configuração
copy nginx-ssl.conf C:\nginx\conf\nginx.conf

# Editar configuração para seu domínio
# Substitua 'seudominio.com' pelo seu domínio real

# Iniciar Nginx
nginx

# Ou como serviço (recomendado)
nssm install nginx C:\nginx\nginx.exe
nssm start nginx
```

#### nginx.conf (com SSL)
```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;
    
    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ws: wss:;";
    
    # Frontend
    location / {
        root C:/opt/just-dance-hub/frontend/build;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Rate Limiting
    location /api/auth/ {
        limit_req zone=auth burst=5 nodelay;
        proxy_pass http://localhost:3000/auth/;
    }
}
```

#### Opção B: Apache (Alternativa)

```powershell
# Instalação automática do Apache
.\apache-setup.ps1 -InstallApache -Domain seudominio.com -Email admin@seudominio.com

# Configurar SSL
.\apache-setup.ps1 -Domain seudominio.com -Email admin@seudominio.com -ConfigureSSL

# Verificar status
.\apache-setup.ps1 -Domain seudominio.com
```

## 🔒 Segurança

### 1. Firewall do Windows

```powershell
# Permitir portas necessárias
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
New-NetFirewallRule -DisplayName "App" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

### 2. Certificados SSL

#### Let's Encrypt (Recomendado)
```powershell
# Instalar Certbot
choco install certbot

# Obter certificado
certbot certonly --webroot -w C:/opt/just-dance-hub/frontend/build -d seudominio.com
```

#### Certificado Próprio
```powershell
# Gerar certificado auto-assinado (apenas para desenvolvimento)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### 3. Senhas Seguras

- **Altere IMEDIATAMENTE** as senhas padrão:
  - Admin: `admin@justdancehub.com` / `Admin@2024!Change`
  - Staff: `staff@justdancehub.com` / `Staff@2024!Change`

- Use senhas com pelo menos 12 caracteres
- Inclua maiúsculas, minúsculas, números e símbolos
- Use um gerenciador de senhas

## 📊 Monitoramento

### 1. Health Checks

```powershell
# Health check manual
Invoke-RestMethod -Uri "https://seudominio.com/health"

# Health check automático (agendado)
schtasks /create /tn "JustDanceHub-HealthCheck" /tr "PowerShell.exe -File C:\opt\just-dance-hub\health-check.ps1" /sc minute /mo 5
```

### 2. Logs

```powershell
# Ver logs em tempo real
pm2 logs

# Ver logs específicos
pm2 logs just-dance-hub-backend
pm2 logs just-dance-hub-websocket

# Logs do sistema
Get-EventLog -LogName Application -Source "Just Dance Hub" -Newest 50
```

### 3. Métricas

```powershell
# Status dos processos
pm2 status

# Monitoramento em tempo real
pm2 monit

# Informações do sistema
Get-ComputerInfo | Select-Object TotalPhysicalMemory, CsProcessors
```

## 💾 Backup

### 1. Backup Automático

```powershell
# Configurar backup diário
schtasks /create /tn "JustDanceHub-DailyBackup" /tr "PowerShell.exe -File C:\opt\just-dance-hub\backup.ps1" /sc daily /st 02:00
```

### 2. Backup Manual

```powershell
# Executar backup
.\backup.ps1

# Backup do banco de dados
pg_dump -U just_dance_user -h localhost just_dance_hub_prod > backup-$(Get-Date -Format "yyyyMMdd-HHmmss").sql

# Backup dos arquivos
Compress-Archive -Path "C:\opt\just-dance-hub" -DestinationPath "backup-files-$(Get-Date -Format "yyyyMMdd-HHmmss").zip"
```

### 3. Restauração

```powershell
# Restaurar banco de dados
psql -U just_dance_user -h localhost just_dance_hub_prod < backup-20241201-120000.sql

# Restaurar arquivos
Expand-Archive -Path "backup-files-20241201-120000.zip" -DestinationPath "C:\opt\just-dance-hub-restore"
```

## 🔄 Atualizações

### 1. Atualização da Aplicação

```powershell
# Parar aplicação
pm2 stop all

# Fazer backup
.\backup.ps1

# Atualizar código
git pull origin main

# Instalar dependências
cd backend && npm ci --only=production
cd ../frontend && npm ci --only=production

# Compilar
npm run build

# Executar migrações se necessário
node scripts/migrate.js

# Reiniciar aplicação
pm2 restart all
```

### 2. Atualização do Sistema

```powershell
# Atualizar Node.js
choco upgrade nodejs

# Atualizar PostgreSQL
choco upgrade postgresql

# Atualizar PM2
npm update -g pm2
```

## 🚨 Troubleshooting

### 1. Problemas Comuns

#### Aplicação não inicia
```powershell
# Verificar logs
pm2 logs

# Verificar configuração
node -e "console.log(process.env.NODE_ENV)"

# Testar conexão com banco
psql -U just_dance_user -h localhost just_dance_hub_prod -c "SELECT 1;"
```

#### Erro de conexão WebSocket
```powershell
# Verificar se o WebSocket está rodando
netstat -an | findstr :8080

# Reiniciar apenas o WebSocket
pm2 restart just-dance-hub-websocket
```

#### Erro 502 Bad Gateway
```powershell
# Verificar se a aplicação está rodando
pm2 status

# Verificar configuração do Nginx
nginx -t

# Reiniciar Nginx
net stop nginx
net start nginx
```

### 2. Logs de Debug

```powershell
# Habilitar logs detalhados temporariamente
$env:LOG_LEVEL="debug"
pm2 restart all

# Voltar ao normal
$env:LOG_LEVEL="warn"
pm2 restart all
```

### 3. Performance

```powershell
# Verificar uso de memória
pm2 monit

# Verificar conexões do banco
psql -U just_dance_user -h localhost just_dance_hub_prod -c "SELECT count(*) FROM pg_stat_activity;"

# Limpar cache se necessário
pm2 flush
```

## 📞 Suporte

### Contatos
- **Desenvolvedor**: [Seu contato]
- **Suporte Técnico**: [Email de suporte]
- **Documentação**: [Link para documentação]

### Recursos Úteis
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## ✅ Checklist de Produção

- [ ] Banco de dados configurado e seguro
- [ ] Variáveis de ambiente configuradas
- [ ] SSL/HTTPS configurado
- [ ] Firewall configurado
- [ ] Senhas padrão alteradas
- [ ] Backup automático configurado
- [ ] Monitoramento configurado
- [ ] Health checks funcionando
- [ ] Logs sendo coletados
- [ ] Performance otimizada
- [ ] Documentação atualizada
- [ ] Equipe treinada

**🎉 Parabéns! Sua aplicação está pronta para produção!**