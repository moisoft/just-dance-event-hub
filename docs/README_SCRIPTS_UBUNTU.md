# 🚀 Just Dance Event Hub - Scripts de Ubuntu

Scripts automatizados para instalação, gerenciamento e manutenção do Just Dance Event Hub em sistemas Ubuntu.

## 📁 Arquivos Disponíveis

| Arquivo | Descrição | Uso |
|---------|-----------|-----|
| `install-ubuntu.sh` | Instalação automática completa | Instalar o sistema |
| `uninstall-ubuntu.sh` | Desinstalação completa | Remover o sistema |
| `backup-ubuntu.sh` | Backup automático | Fazer backup do sistema |
| `health-check-ubuntu.sh` | Verificação de saúde | Diagnosticar problemas |
| `UBUNTU_SCRIPTS_README.md` | Documentação técnica completa | Referência detalhada |
| `COMO_USAR_SCRIPTS_UBUNTU.md` | Guia de uso prático | Instruções passo a passo |

## 🚀 Instalação Rápida

### 1. Preparar arquivos
```bash
# Certifique-se de que estes arquivos estão no servidor Ubuntu:
ls -la
# install-ubuntu.sh
# just-dance-hub-backend-production.zip
# uninstall-ubuntu.sh
# backup-ubuntu.sh
# health-check-ubuntu.sh
```

### 2. Executar instalação
```bash
# Dar permissões
chmod +x *.sh

# Executar instalação
./install-ubuntu.sh
```

### 3. Verificar instalação
```bash
# Health check
./health-check-ubuntu.sh

# Testar API
curl http://localhost:3000/api/health
```

## 🔧 Comandos de Gerenciamento

Após a instalação, use estes comandos:

```bash
# Status da aplicação
sudo just-dance-hub status

# Ver logs
sudo just-dance-hub logs

# Reiniciar aplicação
sudo just-dance-hub restart

# Monitorar recursos
sudo just-dance-hub monit

# Backup manual
./backup-ubuntu.sh

# Health check
./health-check-ubuntu.sh

# Desinstalar (se necessário)
./uninstall-ubuntu.sh
```

## 📊 O que os Scripts Fazem

### `install-ubuntu.sh`
- ✅ Instala Node.js 18.x, PostgreSQL, PM2, Nginx (opcional)
- ✅ Cria usuário do sistema dedicado
- ✅ Configura banco de dados PostgreSQL
- ✅ Extrai e configura a aplicação
- ✅ Configura variáveis de ambiente
- ✅ Configura PM2 para gerenciamento de processos
- ✅ Configura Nginx como proxy reverso (opcional)
- ✅ Configura firewall UFW
- ✅ Cria script de gerenciamento

### `uninstall-ubuntu.sh`
- ✅ Backup opcional do banco de dados
- ✅ Remove aplicação e arquivos
- ✅ Remove usuário do sistema
- ✅ Remove banco de dados
- ✅ Limpa logs e configurações
- ✅ Remove dependências (opcional)

### `backup-ubuntu.sh`
- ✅ Backup do banco de dados PostgreSQL
- ✅ Backup dos arquivos da aplicação
- ✅ Backup das configurações do sistema
- ✅ Compressão automática
- ✅ Limpeza de backups antigos
- ✅ Verificação de integridade
- ✅ Configuração de backup automático

### `health-check-ubuntu.sh`
- ✅ Verifica instalação da aplicação
- ✅ Verifica usuário do sistema
- ✅ Verifica PostgreSQL e banco de dados
- ✅ Verifica PM2 e status da aplicação
- ✅ Verifica Nginx (se instalado)
- ✅ Verifica firewall UFW
- ✅ Verifica logs da aplicação
- ✅ Verifica recursos do sistema
- ✅ Testa API e endpoints
- ✅ Verifica backups

## 🏗️ Estrutura de Instalação

```
/opt/just-dance-hub/           # Aplicação
├── dist/                      # Código compilado
├── node_modules/              # Dependências
├── .env                       # Variáveis de ambiente
├── ecosystem.config.js        # Configuração PM2
└── scripts/                   # Scripts da aplicação

/var/log/just-dance-hub/       # Logs
├── error.log
├── out.log
└── combined.log

/var/backups/just-dance-hub/   # Backups
├── database-YYYYMMDD-HHMMSS.sql.gz
├── application-YYYYMMDD-HHMMSS.tar.gz
└── config-YYYYMMDD-HHMMSS.tar.gz

/etc/nginx/sites-available/    # Nginx (se instalado)
└── just-dance-hub

/usr/local/bin/                # Script de gerenciamento
└── just-dance-hub
```

## 🔒 Segurança

- **Usuário dedicado**: `just-dance-hub` sem shell de login
- **Permissões restritas**: Arquivos sensíveis com permissões 600
- **Firewall configurado**: Apenas portas necessárias abertas
- **JWT Secret**: Gerado automaticamente com 32 bytes
- **Backup seguro**: Configurações sensíveis incluídas no backup

## 📈 Monitoramento

### Logs
- **Aplicação**: `/var/log/just-dance-hub/`
- **Backup**: `/var/log/just-dance-hub-backup.log`
- **Sistema**: `journalctl -u just-dance-hub`

### Métricas
```bash
# Status da aplicação
sudo just-dance-hub status

# Monitoramento em tempo real
sudo just-dance-hub monit

# Logs em tempo real
sudo just-dance-hub logs

# Health check completo
./health-check-ubuntu.sh
```

## 🔄 Backup e Restauração

### Backup Automático
- **Frequência**: Diário às 02:00 (configurável)
- **Retenção**: Últimos 10 backups
- **Compressão**: Automática (gzip)
- **Verificação**: Integridade automática

### Restauração Manual
```bash
# Restaurar banco
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

1. **Aplicação não inicia:**
   ```bash
   sudo just-dance-hub logs
   sudo systemctl status postgresql
   ```

2. **Banco não conecta:**
   ```bash
   sudo -u postgres psql -c "\l"
   sudo -u postgres psql -d just_dance_hub -c "SELECT 1;"
   ```

3. **Nginx não funciona:**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

4. **Permissões incorretas:**
   ```bash
   sudo chown -R just-dance-hub:just-dance-hub /opt/just-dance-hub
   ```

### Debug
```bash
# Executar com debug
bash -x install-ubuntu.sh

# Verificar logs detalhados
sudo journalctl -u just-dance-hub -f

# Health check detalhado
./health-check-ubuntu.sh
```

## 🔄 Atualizações

### Atualização da Aplicação
```bash
# 1. Backup
./backup-ubuntu.sh

# 2. Preparar atualização
sudo just-dance-hub update

# 3. Upload nova versão
# (substituir just-dance-hub-backend-production.zip)

# 4. Extrair e configurar
sudo rm -rf /opt/just-dance-hub/*
sudo unzip just-dance-hub-backend-production.zip -d /tmp/
sudo cp -r /tmp/backend/* /opt/just-dance-hub/
sudo chown -R just-dance-hub:just-dance-hub /opt/just-dance-hub

# 5. Instalar dependências
cd /opt/just-dance-hub
sudo -u just-dance-hub npm install --production
sudo -u just-dance-hub npm run build

# 6. Reiniciar
sudo just-dance-hub restart
```

### Atualização do Sistema
```bash
# Atualizar dependências
sudo apt update && sudo apt upgrade

# Reiniciar serviços
sudo systemctl restart postgresql
sudo just-dance-hub restart
```

## 📞 Suporte

### Verificação Rápida
```bash
# Health check completo
./health-check-ubuntu.sh

# Status dos serviços
sudo just-dance-hub status
sudo systemctl status postgresql
sudo systemctl status nginx
```

### Logs Importantes
- **Aplicação**: `/var/log/just-dance-hub/`
- **Backup**: `/var/log/just-dance-hub-backup.log`
- **Sistema**: `journalctl -u just-dance-hub`

### Comandos de Emergência
```bash
# Parar aplicação
sudo just-dance-hub stop

# Reiniciar aplicação
sudo just-dance-hub restart

# Ver logs de erro
sudo just-dance-hub logs --err

# Backup de emergência
./backup-ubuntu.sh
```

## 📋 Checklist de Instalação

- [ ] Arquivo `just-dance-hub-backend-production.zip` presente
- [ ] Usuário com privilégios sudo (não root)
- [ ] Conexão com internet
- [ ] Ubuntu 18.04+ instalado
- [ ] Scripts com permissão de execução
- [ ] Instalação executada com sucesso
- [ ] Health check passou
- [ ] API respondendo
- [ ] Backup configurado
- [ ] Monitoramento ativo

## 🎯 Próximos Passos

1. **Configure SSL/HTTPS** para produção
2. **Configure monitoramento contínuo** (ex: Prometheus, Grafana)
3. **Configure alertas** para problemas críticos
4. **Teste restauração** de backup periodicamente
5. **Mantenha o sistema atualizado** regularmente
6. **Monitore logs** diariamente
7. **Configure backup externo** (cloud storage)

---

**Versão:** 0.0.7-alpha  
**Compatibilidade:** Ubuntu 18.04+  
**Autor:** Just Dance Event Hub Team  
**Última atualização:** $(date)

> 💡 **Dica:** Execute `./health-check-ubuntu.sh` regularmente para manter o sistema saudável! 