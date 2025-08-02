# 🚀 Quick Deploy Guide - Just Dance Event Hub

## Pré-requisitos
- Windows 10/11 ou Windows Server 2019+
- PowerShell 5.1+ (executar como Administrador)
- Conexão com internet

## Deploy Rápido (5 minutos)

### 1. Clone e Configure
```powershell
# Clone o repositório
git clone <repository-url> C:\opt\just-dance-hub
cd C:\opt\just-dance-hub

# Execute o setup automático
.\production-setup.ps1
```

#### Ubuntu Server
```bash
# Make scripts executable
sudo chmod +x ubuntu-webserver-setup.sh
sudo chmod +x ubuntu-nginx-config.sh
sudo chmod +x ubuntu-apache-config.sh

# Choose web server and run setup
sudo ./ubuntu-webserver-setup.sh --webserver nginx --domain yourdomain.com --email admin@yourdomain.com --ssl

# For advanced configuration (optional)
sudo ./ubuntu-nginx-config.sh  # or ubuntu-apache-config.sh for Apache
```

### 2. Configure o Banco de Dados
```powershell
# Execute o script de configuração do banco
node backend\scripts\setup-prod-db.js
```

### 3. Inicie a Aplicação
```powershell
# Inicie com PM2
pm2 start ecosystem.config.js

# Verifique o status
pm2 status
pm2 logs
```

### 4. Valide a Instalação
```powershell
# Execute a validação completa
.\production-validation.ps1 -Detailed
```

### 5. Acesse a Aplicação
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health
- **WebSocket**: ws://localhost:8080

## Credenciais Padrão

⚠️ **ALTERE IMEDIATAMENTE APÓS O PRIMEIRO LOGIN**

- **Super Admin**: admin@justdance.com / Admin@2024!Change
- **Staff**: staff@justdance.com / Staff@2024!Change

## Configuração do Servidor Web (Produção)

### Opção A: Nginx (Padrão)

#### 1. Obtenha Certificados SSL
```powershell
# Usando Let's Encrypt (certbot)
certbot certonly --webroot -w C:\opt\just-dance-hub\frontend\build -d seudominio.com
```

#### 2. Configure Nginx
```powershell
# Copie a configuração SSL
copy nginx-ssl.conf C:\nginx\conf\nginx.conf

# Edite o arquivo e substitua 'seudominio.com' pelo seu domínio
# Reinicie o Nginx
nginx -s reload
```

### Opção B: Apache (Alternativa)

#### 1. Instalar e Configurar Apache
```powershell
# Instalação completa do Apache
.\apache-setup.ps1 -InstallApache -Domain seudominio.com -Email admin@seudominio.com

# Ou apenas configurar (se Apache já estiver instalado)
.\apache-setup.ps1 -Domain seudominio.com -Email admin@seudominio.com
```

#### 2. Configurar SSL com Apache
```powershell
# Configurar SSL automaticamente
.\apache-setup.ps1 -Domain seudominio.com -Email admin@seudominio.com -ConfigureSSL
```

### 3. Configure Firewall
```powershell
# Execute o script de segurança
.\security-hardening.ps1
```

## Comandos Úteis

### PM2
```powershell
pm2 status                    # Status dos processos
pm2 logs                     # Ver logs em tempo real
pm2 restart all              # Reiniciar todos os processos
pm2 stop all                 # Parar todos os processos
pm2 delete all               # Remover todos os processos
```

### Logs
```powershell
# Logs da aplicação
Get-Content C:\logs\just-dance-hub\app.log -Tail 50

# Logs do PM2
pm2 logs --lines 100
```

### Backup
```powershell
# Backup manual
.\scripts\backup.ps1

# Verificar backups
Get-ChildItem C:\backups\just-dance-hub
```

### Monitoramento
```powershell
# Health check
Invoke-RestMethod http://localhost:3000/health

# Status do sistema
.\health-check-windows.ps1
```

## Solução de Problemas

### Aplicação não inicia
```powershell
# Verificar logs
pm2 logs

# Verificar porta em uso
netstat -ano | findstr :3000

# Reiniciar processos
pm2 restart all
```

### Erro de banco de dados
```powershell
# Testar conexão
psql -h localhost -U just_dance_user -d just_dance_hub_prod

# Verificar serviço PostgreSQL
Get-Service postgresql*
```

### WebSocket não conecta
```powershell
# Verificar porta WebSocket
Test-NetConnection localhost -Port 8080

# Verificar firewall
netsh advfirewall firewall show rule name="Just Dance Hub WebSocket"
```

### Performance lenta
```powershell
# Verificar recursos
Get-Process node
Get-Counter "\Processor(_Total)\% Processor Time"

# Verificar logs de erro
pm2 logs --err
```

## Atualizações

### Atualizar aplicação
```powershell
# Parar aplicação
pm2 stop all

# Atualizar código
git pull origin main

# Instalar dependências
cd backend && npm install
cd ../frontend && npm install && npm run build

# Reiniciar
pm2 start ecosystem.config.js
```

### Atualizar dependências
```powershell
# Backend
cd backend
npm audit fix
npm update

# Frontend
cd ../frontend
npm audit fix
npm update
npm run build
```

## Contatos de Suporte

- **Documentação Completa**: `PRODUCTION_GUIDE.md`
- **Logs**: `C:\logs\just-dance-hub\`
- **Backups**: `C:\backups\just-dance-hub\`
- **Configuração**: `ecosystem.config.js`

## Checklist de Deploy

- [ ] Executar `production-setup.ps1`
- [ ] Configurar banco com `setup-prod-db.js`
- [ ] Alterar senhas padrão
- [ ] Configurar SSL (produção)
- [ ] Executar `security-hardening.ps1`
- [ ] Validar com `production-validation.ps1`
- [ ] Configurar backup automático
- [ ] Testar todos os endpoints
- [ ] Verificar logs
- [ ] Documentar credenciais seguras

---

🎉 **Aplicação pronta para produção!**

Para suporte detalhado, consulte `PRODUCTION_GUIDE.md`