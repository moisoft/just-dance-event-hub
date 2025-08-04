# 🚀 Como Usar os Scripts de Windows

## 📋 Preparação

1. **Abra o PowerShell como Administrador:**
   - Clique com o botão direito no ícone do PowerShell
   - Selecione "Executar como administrador"

2. **Navegue até o diretório de scripts:**
   ```powershell
   cd "C:\caminho\para\just-dance-event-hub\scripts"
   ```

3. **Verifique a política de execução:**
   ```powershell
   Get-ExecutionPolicy
   ```
   
   Se a política for "Restricted", altere temporariamente para permitir a execução dos scripts:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
   ```

## 🔧 Execução

### 1. Instalação
```powershell
.\install-windows.ps1
```

O script irá:
- Verificar e instalar dependências (Node.js, PostgreSQL, PM2)
- Configurar o banco de dados PostgreSQL
- Configurar variáveis de ambiente (.env)
- Instalar dependências da aplicação
- Compilar a aplicação
- Configurar PM2 para gerenciamento de processos
- Criar um usuário administrador

### 2. Verificação de Saúde
```powershell
.\health-check-windows.ps1
```

O script irá verificar:
- Instalação da aplicação
- Dependências do sistema
- PostgreSQL e banco de dados
- PM2 e status da aplicação
- Logs da aplicação
- Recursos do sistema
- API e endpoints

### 3. Desinstalação
```powershell
.\uninstall-windows.ps1
```

O script irá:
- Parar serviços
- Fazer backup opcional do banco de dados
- Remover o banco de dados (opcional)
- Remover arquivos da aplicação
- Remover dependências globais (opcional)

## 📝 Exemplo de Sessão Completa

```powershell
# 1. Abrir PowerShell como Administrador

# 2. Navegar até o diretório de scripts
cd "C:\Users\moise\just dance hub\just-dance-event-hub\scripts"

# 3. Permitir execução de scripts
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# 4. Executar instalação
.\install-windows.ps1

# 5. Seguir as instruções na tela:
# - Digite a senha do PostgreSQL
# - Escolha se quer compilar o frontend
# - Digite o email e senha do usuário admin

# 6. Verificar instalação
.\health-check-windows.ps1

# 7. Testar API (substitua SEU_ENDERECO_WEB pelo endereço do seu servidor)
Invoke-WebRequest -Uri http://SEU_ENDERECO_WEB:5000/api/health
# Exemplo: Invoke-WebRequest -Uri http://meuservidor.com:5000/api/health
```

## 🔧 Comandos de Gerenciamento

Após a instalação, use o script de gerenciamento criado:

```powershell
# Iniciar aplicação
.\just-dance-hub.ps1 start

# Parar aplicação
.\just-dance-hub.ps1 stop

# Reiniciar aplicação
.\just-dance-hub.ps1 restart

# Ver status
.\just-dance-hub.ps1 status

# Ver logs
.\just-dance-hub.ps1 logs

# Monitorar recursos
.\just-dance-hub.ps1 monit

# Iniciar em modo de desenvolvimento
.\just-dance-hub.ps1 dev
```

## 🚨 Troubleshooting

### Se os scripts não executarem:
```powershell
# Verificar política de execução
Get-ExecutionPolicy

# Permitir execução apenas para o processo atual
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Executar com bypass explícito
PowerShell -ExecutionPolicy Bypass -File .\install-windows.ps1
```

### Se o PostgreSQL não estiver acessível:
```powershell
# Verificar se o serviço está em execução
Get-Service -Name postgresql*

# Iniciar o serviço
Start-Service -Name postgresql*

# Verificar conexão
psql -U postgres -c "SELECT version();"
```

### Se o Node.js não estiver no PATH:
```powershell
# Verificar instalação
where.exe node

# Adicionar ao PATH temporariamente
$env:Path += ";C:\Program Files\nodejs"
```

### Se a aplicação não iniciar:
```powershell
# Verificar logs do PM2
pm2 logs

# Reiniciar PM2
pm2 resurrect
pm2 reload all

# Verificar variáveis de ambiente
Get-Content .\backend\.env
```

### Verificação detalhada:
```powershell
# Verificar banco de dados
psql -U postgres -c "\l"

# Verificar tabelas
psql -U postgres -d just_dance_hub -c "\dt"

# Verificar processos do Node.js
Get-Process -Name node

# Verificar portas em uso
netstat -ano | findstr "3000 5000"
```

---

**Lembre-se:** Sempre faça backup antes de qualquer operação crítica!