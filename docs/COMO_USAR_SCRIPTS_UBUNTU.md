# 🚀 Como Usar os Scripts de Ubuntu

## 📋 Preparação no Windows

1. **Copie os arquivos para o servidor Ubuntu:**
   ```bash
   # Via SCP (do Windows)
   scp install-ubuntu.sh user@seu-servidor:/home/user/
   scp uninstall-ubuntu.sh user@seu-servidor:/home/user/
   scp backup-ubuntu.sh user@seu-servidor:/home/user/
   scp just-dance-hub-backend-production.zip user@seu-servidor:/home/user/
   scp UBUNTU_SCRIPTS_README.md user@seu-servidor:/home/user/
   ```

2. **Ou via transferência de arquivos:**
   - Use FileZilla, WinSCP ou similar
   - Faça upload dos arquivos para o servidor Ubuntu

## 🐧 Execução no Ubuntu

### 1. Conectar ao servidor
```bash
ssh user@seu-servidor
```

### 2. Dar permissão de execução
```bash
chmod +x install-ubuntu.sh
chmod +x uninstall-ubuntu.sh
chmod +x backup-ubuntu.sh
```

### 3. Verificar arquivos
```bash
ls -la *.sh
ls -la *.zip
```

### 4. Executar instalação
```bash
./install-ubuntu.sh
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

# 7. Testar API
curl http://localhost:3000/api/health
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

# 3. Testar a API
curl http://localhost:3000/api/health

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