# 🚀 Como Usar os Scripts de Ubuntu

## 🐧 Instalação Direta no Ubuntu

### 1. Conectar ao servidor Ubuntu
```bash
ssh user@seu-servidor
```

### 2. Baixar scripts usando curl ou wget

**Opção A - Usando curl:**
```bash
# Baixar script principal de setup
curl -O https://raw.githubusercontent.com/moisoft/just-dance-event-hub/main/scripts/ubuntu-webserver-setup.sh

# Baixar outros scripts necessários
curl -O https://raw.githubusercontent.com/moisoft/just-dance-event-hub/main/scripts/ubuntu-apache-config.sh
curl -O https://raw.githubusercontent.com/moisoft/just-dance-event-hub/main/scripts/ubuntu-nginx-config.sh
curl -O https://raw.githubusercontent.com/moisoft/just-dance-event-hub/main/scripts/ubuntu-validation.sh
curl -O https://raw.githubusercontent.com/moisoft/just-dance-event-hub/main/scripts/backup-ubuntu.sh
curl -O https://raw.githubusercontent.com/moisoft/just-dance-event-hub/main/scripts/health-check-ubuntu.sh
```

**Opção B - Usando wget:**
```bash
# Baixar script principal de setup
wget https://raw.githubusercontent.com/moisoft/just-dance-event-hub/main/scripts/ubuntu-webserver-setup.sh

# Baixar outros scripts necessários
wget https://raw.githubusercontent.com/moisoft/just-dance-event-hub/main/scripts/ubuntu-apache-config.sh
wget https://raw.githubusercontent.com/moisoft/just-dance-event-hub/main/scripts/ubuntu-nginx-config.sh
wget https://raw.githubusercontent.com/moisoft/just-dance-event-hub/main/scripts/ubuntu-validation.sh
wget https://raw.githubusercontent.com/moisoft/just-dance-event-hub/main/scripts/backup-ubuntu.sh
wget https://raw.githubusercontent.com/moisoft/just-dance-event-hub/main/scripts/health-check-ubuntu.sh
```

### 3. Dar permissão de execução
```bash
chmod +x *.sh
```

### 4. Verificar arquivos baixados
```bash
ls -la *.sh
```

### 5. Executar setup principal
```bash
# Setup completo com escolha de servidor web
./ubuntu-webserver-setup.sh

# Ou setup específico
./ubuntu-apache-config.sh   # Para Apache
./ubuntu-nginx-config.sh    # Para Nginx
```

## 📝 Exemplo de Sessão Completa

```bash
# 1. Conectar ao servidor
ssh ubuntu@192.168.1.100

# 2. Verificar arquivos
ls -la
# Deve mostrar:
# install-ubuntu.sh
# uninstall-ubuntu.sh
# backup-ubuntu.sh
# just-dance-hub-backend-production.zip
# UBUNTU_SCRIPTS_README.md

# 3. Dar permissões
chmod +x *.sh

# 4. Executar instalação
./install-ubuntu.sh

# 5. Seguir as instruções na tela:
# - Digite a senha do PostgreSQL
# - Escolha se quer instalar Nginx (y/n)
# - Se escolher Nginx, digite o domínio/IP

# 6. Verificar instalação
sudo just-dance-hub status

# 7. Testar API (substitua SEU_ENDERECO_WEB pelo endereço do seu servidor)
curl http://SEU_ENDERECO_WEB:3000/api/health
# Exemplo: curl http://meuservidor.com:3000/api/health
```

## 🔧 Comandos de Gerenciamento

Após a instalação, use estes comandos:

```bash
# Status da aplicação
sudo just-dance-hub status

# Ver logs
sudo just-dance-hub logs

# Reiniciar
sudo just-dance-hub restart

# Monitorar recursos
sudo just-dance-hub monit

# Backup manual
./backup-ubuntu.sh

# Desinstalar (se necessário)
./uninstall-ubuntu.sh
```

## 🚨 Troubleshooting

### Se os scripts não executarem:
```bash
# Verificar permissões
ls -la *.sh

# Dar permissão novamente
chmod +x *.sh

# Executar com bash explicitamente
bash install-ubuntu.sh
```

### Se houver erro de encoding:
```bash
# Converter para UTF-8
dos2unix install-ubuntu.sh
dos2unix uninstall-ubuntu.sh
dos2unix backup-ubuntu.sh
```

### Se o ZIP não for encontrado:
```bash
# Verificar se o arquivo existe
ls -la *.zip

# Se não existir, faça upload novamente
```

## 📊 Verificação Pós-Instalação

```bash
# 1. Verificar se a aplicação está rodando
sudo just-dance-hub status

# 2. Verificar se o banco está funcionando
sudo -u postgres psql -d just_dance_hub -c "SELECT 1;"

# 3. Testar a API (substitua SEU_ENDERECO_WEB pelo endereço do seu servidor)
curl http://SEU_ENDERECO_WEB:3000/api/health
# Exemplo: curl http://meuservidor.com:3000/api/health

# 4. Verificar logs
sudo just-dance-hub logs

# 5. Verificar se o Nginx está funcionando (se instalado)
sudo systemctl status nginx
curl http://seu-dominio/api/health
```

## 🔄 Atualizações

Para atualizar a aplicação:

```bash
# 1. Fazer backup
./backup-ubuntu.sh

# 2. Preparar para atualização
sudo just-dance-hub update

# 3. Fazer upload da nova versão
# (substitua o ZIP antigo pelo novo)

# 4. Extrair nova versão
sudo rm -rf /opt/just-dance-hub/*
sudo unzip just-dance-hub-backend-production.zip -d /tmp/
sudo cp -r /tmp/backend/* /opt/just-dance-hub/
sudo chown -R just-dance-hub:just-dance-hub /opt/just-dance-hub

# 5. Instalar dependências e compilar
cd /opt/just-dance-hub
sudo -u just-dance-hub npm install --production
sudo -u just-dance-hub npm run build

# 6. Reiniciar aplicação
sudo just-dance-hub restart
```

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs:**
   ```bash
   sudo just-dance-hub logs
   sudo journalctl -u just-dance-hub
   ```

2. **Verifique o status dos serviços:**
   ```bash
   sudo systemctl status postgresql
   sudo systemctl status nginx
   sudo just-dance-hub status
   ```

3. **Execute com debug:**
   ```bash
   bash -x install-ubuntu.sh
   ```

4. **Consulte a documentação completa:**
   ```bash
   cat UBUNTU_SCRIPTS_README.md
   ```

---

**Lembre-se:** Sempre faça backup antes de qualquer operação crítica!