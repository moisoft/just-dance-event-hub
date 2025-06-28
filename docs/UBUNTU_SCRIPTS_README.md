# 🚀 Just Dance Event Hub - Scripts de Ubuntu

Este diretório contém scripts automatizados para instalação, gerenciamento e backup do Just Dance Event Hub em sistemas Ubuntu.

## 📋 Pré-requisitos

- Ubuntu 18.04 LTS ou superior
- Usuário com privilégios sudo (não root)
- Conexão com internet
- Arquivo `just-dance-hub-backend-production.zip` no diretório atual

## 📁 Scripts Disponíveis

### 1. `install-ubuntu.sh` - Instalação Automática
Script principal para instalação completa do sistema.

**Funcionalidades:**
- ✅ Instalação automática de dependências (Node.js, PostgreSQL, PM2, Nginx)
- ✅ Configuração do banco de dados PostgreSQL
- ✅ Criação de usuário do sistema dedicado
- ✅ Extração e configuração da aplicação
- ✅ Configuração de variáveis de ambiente
- ✅ Configuração do PM2 para gerenciamento de processos
- ✅ Configuração opcional do Nginx como proxy reverso
- ✅ Configuração do firewall UFW
- ✅ Criação de script de gerenciamento

### 2. `uninstall-ubuntu.sh` - Desinstalação Completa
Script para remoção completa do sistema.

**Funcionalidades:**
- ✅ Backup opcional do banco de dados
- ✅ Remoção da aplicação e arquivos
- ✅ Remoção do usuário do sistema
- ✅ Remoção do banco de dados
- ✅ Limpeza de logs e configurações
- ✅ Remoção opcional de dependências do sistema

### 3. `backup-ubuntu.sh` - Backup Automático
Script para backup completo do sistema.

**Funcionalidades:**
- ✅ Backup do banco de dados PostgreSQL
- ✅ Backup dos arquivos da aplicação
- ✅ Backup das configurações do sistema
- ✅ Compressão automática dos backups
- ✅ Limpeza de backups antigos
- ✅ Verificação de integridade dos backups
- ✅ Configuração de backup automático com cron

## 🚀 Como Usar

### Instalação

1. **Preparar o ambiente:**
   ```bash
   # Certifique-se de que o arquivo ZIP está presente
   ls -la just-dance-hub-backend-production.zip
   ```

2. **Executar instalação:**
   ```bash
   # Dar permissão de execução
   chmod +x install-ubuntu.sh
   
   # Executar instalação
   ./install-ubuntu.sh
   ```

3. **Seguir as instruções:**
   - O script irá solicitar a senha do PostgreSQL
   - Escolher se deseja instalar o Nginx
   - Fornecer domínio/IP se Nginx for instalado

### Gerenciamento

Após a instalação, use o script de gerenciamento:

```bash
# Ver status da aplicação
sudo just-dance-hub status

# Ver logs
sudo just-dance-hub logs

# Reiniciar aplicação
sudo just-dance-hub restart

# Monitorar recursos
sudo just-dance-hub monit

# Preparar para atualização
sudo just-dance-hub update
```

### Backup

```bash
# Executar backup manual
chmod +x backup-ubuntu.sh
./backup-ubuntu.sh

# Verificar backups criados
ls -la /var/backups/just-dance-hub/
```

### Desinstalação

```bash
# Executar desinstalação
chmod +x uninstall-ubuntu.sh
./uninstall-ubuntu.sh
```

## 📊 Estrutura de Instalação

Após a instalação, o sistema terá a seguinte estrutura:

```
/opt/just-dance-hub/           # Diretório da aplicação
├── dist/                      # Código compilado
├── node_modules/              # Dependências
├── .env                       # Variáveis de ambiente
├── ecosystem.config.js        # Configuração do PM2
└── scripts/                   # Scripts da aplicação

/var/log/just-dance-hub/       # Logs da aplicação
├── error.log
├── out.log
└── combined.log

/var/backups/just-dance-hub/   # Backups automáticos
├── database-YYYYMMDD-HHMMSS.sql.gz
├── application-YYYYMMDD-HHMMSS.tar.gz
└── config-YYYYMMDD-HHMMSS.tar.gz

/etc/nginx/sites-available/    # Configuração do Nginx (se instalado)
└── just-dance-hub

/usr/local/bin/                # Scripts de gerenciamento
└── just-dance-hub
```

## 🔧 Configurações Automáticas

### Variáveis de Ambiente
O script cria automaticamente o arquivo `.env` com:
- `NODE_ENV=production`
- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_USER=postgres`
- `DB_PASSWORD=[senha fornecida]`
- `DB_NAME=just_dance_hub`
- `JWT_SECRET=[gerado automaticamente]`
- `PORT=3000`

### PM2 Configuration
```javascript
{
  name: 'just-dance-hub',
  script: 'dist/app.js',
  instances: 1,
  autorestart: true,
  max_memory_restart: '1G',
  env: { NODE_ENV: 'production', PORT: 3000 }
}
```

### Nginx Configuration (se instalado)
```nginx
server {
    listen 80;
    server_name [seu-dominio];
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔒 Segurança

### Usuário do Sistema
- Criação de usuário dedicado `just-dance-hub`
- Permissões restritas
- Execução sem shell de login

### Firewall
- Configuração automática do UFW
- Abertura apenas das portas necessárias (22, 80, 443)

### Arquivos Sensíveis
- `.env` com permissões 600
- Logs com permissões apropriadas
- Backup de configurações sensíveis

## 📈 Monitoramento

### Logs
- Logs centralizados em `/var/log/just-dance-hub/`
- Rotação automática pelo PM2
- Logs de backup em `/var/log/just-dance-hub-backup.log`

### Métricas
- Monitoramento via PM2: `sudo just-dance-hub monit`
- Status da aplicação: `sudo just-dance-hub status`
- Logs em tempo real: `sudo just-dance-hub logs`

## 🔄 Backup e Restauração

### Backup Automático
- Execução diária às 02:00 (configurável)
- Retenção dos últimos 10 backups
- Compressão automática
- Verificação de integridade

### Restauração Manual
```bash
# Restaurar banco de dados
sudo -u postgres createdb just_dance_hub
sudo -u postgres psql just_dance_hub < backup-file.sql

# Restaurar arquivos
sudo tar -xzf backup-file.tar.gz -C /opt/

# Restaurar configurações
sudo tar -xzf config-backup.tar.gz -C /tmp/
sudo cp /tmp/config/* /opt/just-dance-hub/
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de permissão:**
   ```bash
   sudo chown -R just-dance-hub:just-dance-hub /opt/just-dance-hub
   ```

2. **Aplicação não inicia:**
   ```bash
   sudo just-dance-hub logs
   sudo systemctl status postgresql
   ```

3. **Banco de dados não conecta:**
   ```bash
   sudo -u postgres psql -c "\l"
   sudo -u postgres psql -d just_dance_hub -c "SELECT 1;"
   ```

4. **Nginx não funciona:**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

### Logs Importantes
- Aplicação: `/var/log/just-dance-hub/`
- Backup: `/var/log/just-dance-hub-backup.log`
- Sistema: `journalctl -u just-dance-hub`

## 📞 Suporte

Para problemas ou dúvidas:

1. Verifique os logs da aplicação
2. Consulte a documentação do projeto
3. Verifique o status dos serviços
4. Execute os scripts com `bash -x` para debug

## 🔄 Atualizações

### Atualização da Aplicação
```bash
# Preparar backup
sudo just-dance-hub update

# Fazer upload da nova versão
# Extrair no diretório correto

# Reiniciar aplicação
sudo just-dance-hub restart
```

### Atualização do Sistema
```bash
# Atualizar dependências
sudo apt update && sudo apt upgrade

# Reiniciar serviços se necessário
sudo systemctl restart postgresql
sudo just-dance-hub restart
```

---

**Versão:** 1.0.0  
**Última atualização:** $(date)  
**Compatibilidade:** Ubuntu 18.04+  
**Autor:** Just Dance Event Hub Team 