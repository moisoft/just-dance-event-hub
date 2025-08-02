# Ubuntu Server Setup Guide - Just Dance Event Hub

Guia completo para configuração do Just Dance Event Hub em Ubuntu Server 20.04/22.04 LTS.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação Rápida](#instalação-rápida)
3. [Configuração Manual](#configuração-manual)
4. [Escolha do Servidor Web](#escolha-do-servidor-web)
5. [Configuração SSL](#configuração-ssl)
6. [Segurança](#segurança)
7. [Monitoramento](#monitoramento)
8. [Backup](#backup)
9. [Manutenção](#manutenção)
10. [Solução de Problemas](#solução-de-problemas)

## 🔧 Pré-requisitos

### Requisitos do Sistema
- **SO**: Ubuntu Server 20.04 LTS ou 22.04 LTS
- **RAM**: Mínimo 2GB, Recomendado 4GB+
- **Armazenamento**: Mínimo 20GB de espaço livre
- **Rede**: IP estático recomendado para produção
- **Acesso**: Usuário com privilégios sudo

### Verificação Inicial

```bash
# Verificar versão do Ubuntu
lsb_release -a

# Verificar recursos do sistema
free -h
df -h

# Atualizar sistema
sudo apt update && sudo apt upgrade -y
```

## 🚀 Instalação Rápida

### Opção 1: Script Automatizado (Recomendado)

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/just-dance-event-hub.git
cd just-dance-event-hub

# 2. Tornar scripts executáveis
sudo chmod +x ubuntu-webserver-setup.sh
sudo chmod +x ubuntu-nginx-config.sh
sudo chmod +x ubuntu-apache-config.sh

# 3. Executar configuração (escolha uma opção)

# Para Nginx (Recomendado)
sudo ./ubuntu-webserver-setup.sh --webserver nginx --domain seudominio.com --email admin@seudominio.com --ssl

# Para Apache
sudo ./ubuntu-webserver-setup.sh --webserver apache --domain seudominio.com --email admin@seudominio.com --ssl

# Para desenvolvimento local (sem SSL)
sudo ./ubuntu-webserver-setup.sh --webserver nginx
```

### Opção 2: Configuração Interativa

```bash
# Executar script sem parâmetros para modo interativo
sudo ./ubuntu-webserver-setup.sh
```

O script irá:
- ✅ Instalar todas as dependências
- ✅ Configurar PostgreSQL
- ✅ Configurar servidor web (Nginx ou Apache)
- ✅ Configurar SSL com Let's Encrypt
- ✅ Configurar firewall (UFW)
- ✅ Configurar logs e monitoramento

## 🔧 Configuração Manual

Se preferir configuração manual ou personalizada:

### 1. Instalar Dependências

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências básicas
sudo apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates

# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version

# Instalar PM2
sudo npm install -g pm2

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Instalar Git
sudo apt install -y git
```

### 2. Configurar PostgreSQL

```bash
# Iniciar e habilitar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configurar usuário postgres
sudo -u postgres psql
```

```sql
-- No prompt do PostgreSQL
CREATE DATABASE just_dance_hub;
CREATE USER hub_user WITH ENCRYPTED PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE just_dance_hub TO hub_user;
\q
```

```bash
# Configurar autenticação
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Adicionar linha: local just_dance_hub hub_user md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### 3. Configurar Aplicação

```bash
# Criar diretórios
sudo mkdir -p /opt/just-dance-hub
sudo mkdir -p /var/log/just-dance-hub
sudo mkdir -p /var/backups/just-dance-hub

# Clonar repositório
cd /opt
sudo git clone https://github.com/seu-usuario/just-dance-event-hub.git just-dance-hub

# Definir permissões
sudo chown -R $USER:$USER /opt/just-dance-hub
sudo chown -R $USER:$USER /var/log/just-dance-hub

# Instalar dependências
cd /opt/just-dance-hub
npm install

# Configurar backend
cd backend
npm install
cp .env.example .env

# Editar variáveis de ambiente
nano .env
```

### 4. Configurar Frontend

```bash
# Configurar frontend
cd /opt/just-dance-hub/frontend
npm install

# Criar arquivo de configuração de produção
cp .env.example .env.production
nano .env.production
```

```env
# .env.production
REACT_APP_API_URL=https://seudominio.com/api
REACT_APP_WS_URL=wss://seudominio.com/ws
REACT_APP_ENVIRONMENT=production
```

```bash
# Build da aplicação
npm run build
```

## 🌐 Escolha do Servidor Web

### Nginx (Recomendado)

**Vantagens:**
- Melhor performance para conteúdo estático
- Menor uso de memória
- Excelente para proxy reverso
- Configuração mais simples

```bash
# Instalar Nginx
sudo apt install -y nginx

# Configurar site
sudo cp nginx-ssl.conf /etc/nginx/sites-available/just-dance-hub
sudo ln -s /etc/nginx/sites-available/just-dance-hub /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Iniciar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Apache

**Vantagens:**
- Mais módulos disponíveis
- Configuração mais flexível
- Melhor para aplicações dinâmicas
- Suporte nativo a .htaccess

```bash
# Instalar Apache
sudo apt install -y apache2

# Habilitar módulos
sudo a2enmod rewrite ssl proxy proxy_http proxy_wstunnel headers deflate expires

# Configurar site
sudo cp apache-ssl.conf /etc/apache2/sites-available/just-dance-hub.conf
sudo a2ensite just-dance-hub
sudo a2dissite 000-default

# Testar configuração
sudo apache2ctl configtest

# Iniciar Apache
sudo systemctl start apache2
sudo systemctl enable apache2
```

## 🔒 Configuração SSL

### Automática com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot

# Para Nginx
sudo apt install -y python3-certbot-nginx
sudo certbot --nginx -d seudominio.com

# Para Apache
sudo apt install -y python3-certbot-apache
sudo certbot --apache -d seudominio.com

# Configurar renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Manual com Certificados Próprios

```bash
# Criar diretório SSL
sudo mkdir -p /etc/ssl/just-dance-hub

# Copiar certificados
sudo cp seu-certificado.crt /etc/ssl/just-dance-hub/fullchain.pem
sudo cp sua-chave-privada.key /etc/ssl/just-dance-hub/privkey.pem

# Definir permissões
sudo chown root:root /etc/ssl/just-dance-hub/*
sudo chmod 600 /etc/ssl/just-dance-hub/*
```

## 🛡️ Segurança

### Configurar Firewall (UFW)

```bash
# Instalar e configurar UFW
sudo apt install -y ufw

# Configurar regras básicas
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir SSH
sudo ufw allow ssh

# Permitir HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Habilitar firewall
sudo ufw enable

# Verificar status
sudo ufw status verbose
```

### Configurar Fail2ban (Anti-bruteforce)

```bash
# Instalar Fail2ban
sudo apt install -y fail2ban

# Configurar para SSH
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

```ini
# /etc/fail2ban/jail.local
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/just-dance-hub/nginx_error.log
maxretry = 3
bantime = 3600
```

```bash
# Iniciar Fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### Hardening do Sistema

```bash
# Atualizar sistema automaticamente
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Configurar limites de sistema
sudo nano /etc/security/limits.conf
# Adicionar:
# * soft nofile 65536
# * hard nofile 65536

# Configurar kernel
sudo nano /etc/sysctl.conf
# Adicionar:
# net.core.somaxconn = 65536
# net.ipv4.tcp_max_syn_backlog = 65536

# Aplicar configurações
sudo sysctl -p
```

## 📊 Monitoramento

### Configurar PM2

```bash
# Configurar PM2 para inicialização automática
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# Iniciar aplicação
cd /opt/just-dance-hub
pm2 start ecosystem.config.js

# Salvar configuração PM2
pm2 save

# Monitorar aplicação
pm2 monit
```

### Configurar Logs

```bash
# Configurar logrotate
sudo nano /etc/logrotate.d/just-dance-hub
```

```
/var/log/just-dance-hub/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
```

### Monitoramento de Sistema

```bash
# Instalar htop para monitoramento
sudo apt install -y htop iotop nethogs

# Criar script de monitoramento
sudo nano /usr/local/bin/system-monitor.sh
```

```bash
#!/bin/bash
# Script de monitoramento do sistema

LOG_FILE="/var/log/just-dance-hub/system-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# CPU e Memória
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
MEM_USAGE=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')

echo "[$DATE] CPU: ${CPU_USAGE}%, MEM: ${MEM_USAGE}%, DISK: ${DISK_USAGE}%" >> "$LOG_FILE"

# Verificar serviços
for service in nginx postgresql pm2; do
    if systemctl is-active --quiet $service; then
        echo "[$DATE] $service: OK" >> "$LOG_FILE"
    else
        echo "[$DATE] $service: FAILED" >> "$LOG_FILE"
    fi
done
```

```bash
# Tornar executável
sudo chmod +x /usr/local/bin/system-monitor.sh

# Adicionar ao crontab
crontab -e
# Adicionar: */5 * * * * /usr/local/bin/system-monitor.sh
```

## 💾 Backup

### Backup Automático

```bash
# Criar script de backup
sudo nano /usr/local/bin/backup-hub.sh
```

```bash
#!/bin/bash
# Script de backup do Just Dance Hub

BACKUP_DIR="/var/backups/just-dance-hub"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/opt/just-dance-hub"
DB_NAME="just_dance_hub"
DB_USER="hub_user"

# Criar diretório de backup
mkdir -p "$BACKUP_DIR/$DATE"

# Backup do banco de dados
pg_dump -U $DB_USER -h localhost $DB_NAME > "$BACKUP_DIR/$DATE/database.sql"

# Backup dos arquivos da aplicação
tar -czf "$BACKUP_DIR/$DATE/application.tar.gz" -C "$APP_DIR" .

# Backup das configurações
cp -r /etc/nginx "$BACKUP_DIR/$DATE/nginx-config" 2>/dev/null || true
cp -r /etc/apache2 "$BACKUP_DIR/$DATE/apache-config" 2>/dev/null || true
cp -r /etc/ssl/just-dance-hub "$BACKUP_DIR/$DATE/ssl-certs" 2>/dev/null || true

# Remover backups antigos (manter últimos 7 dias)
find "$BACKUP_DIR" -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true

echo "Backup concluído: $BACKUP_DIR/$DATE"
```

```bash
# Tornar executável
sudo chmod +x /usr/local/bin/backup-hub.sh

# Configurar backup diário
sudo crontab -e
# Adicionar: 0 2 * * * /usr/local/bin/backup-hub.sh
```

### Restaurar Backup

```bash
# Restaurar banco de dados
psql -U hub_user -h localhost just_dance_hub < /var/backups/just-dance-hub/20231201_020000/database.sql

# Restaurar aplicação
cd /opt
sudo rm -rf just-dance-hub
sudo tar -xzf /var/backups/just-dance-hub/20231201_020000/application.tar.gz
sudo chown -R $USER:$USER just-dance-hub

# Reiniciar serviços
pm2 restart all
sudo systemctl restart nginx
```

## 🔄 Manutenção

### Atualizações do Sistema

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Atualizar Node.js (se necessário)
sudo npm install -g n
sudo n stable

# Atualizar PM2
sudo npm install -g pm2@latest
pm2 update
```

### Atualizações da Aplicação

```bash
# Script de atualização
sudo nano /usr/local/bin/update-hub.sh
```

```bash
#!/bin/bash
# Script de atualização do Just Dance Hub

APP_DIR="/opt/just-dance-hub"
BACKUP_DIR="/var/backups/just-dance-hub/pre-update-$(date +%Y%m%d_%H%M%S)"

# Fazer backup antes da atualização
mkdir -p "$BACKUP_DIR"
cp -r "$APP_DIR" "$BACKUP_DIR/"

# Parar aplicação
pm2 stop all

# Atualizar código
cd "$APP_DIR"
git pull origin main

# Atualizar dependências
npm install
cd backend && npm install
cd ../frontend && npm install && npm run build

# Executar migrações (se houver)
cd ../backend
npm run migrate

# Reiniciar aplicação
pm2 restart all

echo "Atualização concluída!"
```

```bash
# Tornar executável
sudo chmod +x /usr/local/bin/update-hub.sh
```

### Limpeza de Logs

```bash
# Limpar logs antigos
sudo find /var/log/just-dance-hub -name "*.log" -mtime +30 -delete

# Limpar cache do Nginx
sudo rm -rf /var/cache/nginx/*

# Limpar logs do PM2
pm2 flush
```

## 🔍 Solução de Problemas

### Verificar Status dos Serviços

```bash
# Verificar status geral
sudo systemctl status nginx postgresql
pm2 status

# Verificar logs
sudo tail -f /var/log/just-dance-hub/nginx_error.log
pm2 logs
sudo journalctl -u postgresql -f
```

### Problemas Comuns

#### 1. Aplicação não inicia

```bash
# Verificar logs do PM2
pm2 logs

# Verificar variáveis de ambiente
cd /opt/just-dance-hub/backend
cat .env

# Testar conexão com banco
psql -U hub_user -h localhost just_dance_hub
```

#### 2. Erro 502 Bad Gateway

```bash
# Verificar se aplicação está rodando
pm2 status

# Verificar configuração do Nginx
sudo nginx -t

# Verificar logs
sudo tail -f /var/log/just-dance-hub/nginx_error.log
```

#### 3. SSL não funciona

```bash
# Verificar certificados
sudo certbot certificates

# Testar renovação
sudo certbot renew --dry-run

# Verificar configuração SSL
openssl s_client -connect seudominio.com:443
```

#### 4. Alto uso de memória

```bash
# Verificar uso de memória
free -h
ps aux --sort=-%mem | head

# Reiniciar PM2
pm2 restart all

# Verificar configuração PM2
cat ecosystem.config.js
```

### Comandos Úteis

```bash
# Monitoramento em tempo real
htop
iotop
nethogs

# Verificar conexões de rede
ss -tuln
netstat -tlnp

# Verificar espaço em disco
df -h
du -sh /opt/just-dance-hub

# Verificar logs do sistema
sudo journalctl -f
sudo tail -f /var/log/syslog

# Verificar firewall
sudo ufw status verbose
sudo fail2ban-client status
```

## 📞 Suporte

Para suporte adicional:

- **Documentação**: Consulte os arquivos README.md
- **Logs**: Sempre verifique os logs em `/var/log/just-dance-hub/`
- **Monitoramento**: Use `pm2 monit` para monitoramento em tempo real
- **Comunidade**: Abra issues no repositório GitHub

---

**Nota**: Este guia assume conhecimento básico de administração de sistemas Linux. Para ambientes de produção críticos, considere contratar um administrador de sistemas experiente.