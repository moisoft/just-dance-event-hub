# Just Dance Event Hub - Script de Instalação para Windows
# Versão: 1.0.0
# Autor: Just Dance Event Hub Team

# Parâmetros
param(
    [string]$Domain = "localhost",
    [int]$ApiPort = 5000,
    [int]$FrontendPort = 3000
)

# Cores para output
$Green = "\033[0;32m"
$Yellow = "\033[1;33m"
$Red = "\033[0;31m"
$Blue = "\033[0;34m"
$NC = "\033[0m" # No Color

# Função para log colorido
function Log($message) {
    Write-Host "${Green}[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $message${NC}"
}

function Warn($message) {
    Write-Host "${Yellow}[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] AVISO: $message${NC}"
}

function Error($message) {
    Write-Host "${Red}[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ERRO: $message${NC}"
    exit 1
}

function Info($message) {
    Write-Host "${Blue}[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] INFO: $message${NC}"
}

# Banner
Write-Host "${Blue}"
Write-Host "╔══════════════════════════════════════════════════════════════╗"
Write-Host "║                    Just Dance Event Hub                      ║"
Write-Host "║                     Instalador Windows                       ║"
Write-Host "║                          v1.0.0                              ║"
Write-Host "╚══════════════════════════════════════════════════════════════╝"
Write-Host "${NC}"

# Variáveis de configuração
$APP_NAME = "just-dance-hub"
$APP_DIR = $PSScriptRoot | Split-Path -Parent
$DB_NAME = "just_dance_hub"
$DB_USER = "postgres"
$DB_PASSWORD = ""
$JWT_SECRET = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Verificar se o PowerShell está sendo executado como administrador
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Error "Este script precisa ser executado como administrador. Por favor, reinicie o PowerShell como administrador."
}

# Função para verificar se um programa está instalado
function Test-CommandExists {
    param ($command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'stop'
    try {
        if (Get-Command $command) { return $true }
    } catch {
        return $false
    } finally {
        $ErrorActionPreference = $oldPreference
    }
}

# Função para instalar dependências do sistema
function Install-SystemDependencies {
    Log "Verificando dependências do sistema..."
    
    # Verificar Node.js
    if (Test-CommandExists node) {
        $nodeVersion = (node -v).Substring(1)
        if ([version]$nodeVersion -lt [version]"18.0.0") {
            Warn "Node.js versão $nodeVersion encontrado, mas é recomendado a versão 18.0.0 ou superior."
            $installNode = Read-Host "Deseja instalar Node.js 18.x? (S/N)"
            if ($installNode -eq "S" -or $installNode -eq "s") {
                Info "Baixando Node.js 18.x..."
                $nodejsUrl = "https://nodejs.org/dist/v18.18.2/node-v18.18.2-x64.msi"
                $nodejsInstaller = "$env:TEMP\node-v18.18.2-x64.msi"
                Invoke-WebRequest -Uri $nodejsUrl -OutFile $nodejsInstaller
                Info "Instalando Node.js 18.x..."
                Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$nodejsInstaller`" /quiet /norestart" -Wait
                Remove-Item $nodejsInstaller
                Log "Node.js 18.x instalado com sucesso!"
            }
        } else {
            Log "Node.js versão $nodeVersion encontrado."
        }
    } else {
        Info "Node.js não encontrado. Baixando Node.js 18.x..."
        $nodejsUrl = "https://nodejs.org/dist/v18.18.2/node-v18.18.2-x64.msi"
        $nodejsInstaller = "$env:TEMP\node-v18.18.2-x64.msi"
        Invoke-WebRequest -Uri $nodejsUrl -OutFile $nodejsInstaller
        Info "Instalando Node.js 18.x..."
        Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$nodejsInstaller`" /quiet /norestart" -Wait
        Remove-Item $nodejsInstaller
        Log "Node.js 18.x instalado com sucesso!"
    }
    
    # Verificar PostgreSQL
    if (Test-CommandExists psql) {
        Log "PostgreSQL encontrado."
    } else {
        Info "PostgreSQL não encontrado."
        $installPostgres = Read-Host "Deseja instalar PostgreSQL? (S/N)"
        if ($installPostgres -eq "S" -or $installPostgres -eq "s") {
            Info "Baixando PostgreSQL..."
            $postgresUrl = "https://get.enterprisedb.com/postgresql/postgresql-14.10-1-windows-x64.exe"
            $postgresInstaller = "$env:TEMP\postgresql-14.10-1-windows-x64.exe"
            Invoke-WebRequest -Uri $postgresUrl -OutFile $postgresInstaller
            
            # Solicitar senha para o usuário postgres
            $DB_PASSWORD = Read-Host "Digite a senha para o usuário postgres" -AsSecureString
            $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD)
            $DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
            
            Info "Instalando PostgreSQL..."
            Start-Process -FilePath $postgresInstaller -ArgumentList "--mode unattended --superpassword $DB_PASSWORD" -Wait
            Remove-Item $postgresInstaller
            
            # Adicionar PostgreSQL ao PATH
            $pgPath = "C:\Program Files\PostgreSQL\14\bin"
            $env:Path += ";$pgPath"
            [Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::Machine)
            
            Log "PostgreSQL instalado com sucesso!"
        } else {
            Error "PostgreSQL é necessário para o funcionamento da aplicação."
        }
    }
    
    # Instalar PM2 globalmente
    if (Test-CommandExists pm2) {
        Log "PM2 encontrado."
    } else {
        Info "Instalando PM2 globalmente..."
        npm install -g pm2
        Log "PM2 instalado com sucesso!"
    }
    
    Log "Dependências do sistema verificadas com sucesso!"
}

# Função para configurar PostgreSQL
function Setup-PostgreSQL {
    Log "Configurando PostgreSQL..."
    
    # Se a senha não foi definida durante a instalação, solicitar agora
    if ($DB_PASSWORD -eq "") {
        $securePassword = Read-Host "Digite a senha do usuário postgres" -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
        $DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    }
    
    # Verificar se o serviço do PostgreSQL está em execução
    $pgService = Get-Service -Name postgresql* -ErrorAction SilentlyContinue
    if ($pgService -and $pgService.Status -ne 'Running') {
        Info "Iniciando serviço do PostgreSQL..."
        Start-Service $pgService.Name
    }
    
    # Criar banco de dados se não existir
    $env:PGPASSWORD = $DB_PASSWORD
    $dbExists = psql -U $DB_USER -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" -t | Out-String
    
    if ($dbExists.Trim() -ne "1") {
        Info "Criando banco de dados $DB_NAME..."
        psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;" -t
        Log "Banco de dados $DB_NAME criado com sucesso!"
    } else {
        Log "Banco de dados $DB_NAME ja existe."
    }
    
    Log "PostgreSQL configurado com sucesso!"
}

# Função para configurar variáveis de ambiente
function Setup-Environment {
    Log "Configurando variáveis de ambiente..."
    
    # Backend .env
    $backendEnvPath = Join-Path $APP_DIR 'backend\.env'
    if (Test-Path $backendEnvPath) {
        Warn "Arquivo .env do backend já existe. Deseja sobrescrevê-lo?"
        $overwrite = Read-Host "Sobrescrever? (S/N)"
        if ($overwrite -ne "S" -and $overwrite -ne "s") {
            Log "Mantendo arquivo .env existente."
            return
        }
    }
    
    $backendEnvContent = @"
# Configurações do Servidor
NODE_ENV=development
PORT=5000

# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Configurações de Segurança
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h

# Configurações do Frontend
FRONTEND_URL=http://$Domain`:$FrontendPort

# Configurações de Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5
"@
    
    Set-Content -Path $backendEnvPath -Value $backendEnvContent
    
    # Frontend .env
    $frontendEnvPath = Join-Path $APP_DIR 'frontend\.env'
    if (Test-Path $frontendEnvPath) {
        Warn "Arquivo .env do frontend ja existe. Deseja sobrescreve-lo?"
        $overwrite = Read-Host "Sobrescrever? (S/N)"
        if ($overwrite -ne "S" -and $overwrite -ne "s") {
            Log "Mantendo arquivo .env existente."
            return
        }
    }
    
    $frontendEnvContent = @"
# Frontend Environment Variables
REACT_APP_API_BASE_URL=http://$Domain`:$ApiPort
REACT_APP_ENVIRONMENT=development
"@
    
    Set-Content -Path $frontendEnvPath -Value $frontendEnvContent
    
    Log "Variaveis de ambiente configuradas com sucesso!"
}

# Função para instalar dependências da aplicação
function Install-AppDependencies {
    Log "Instalando dependências da aplicação..."
    
    # Backend
    Info "Instalando dependências do backend..."
    Set-Location (Join-Path $APP_DIR "backend")
    npm install
    
    # Frontend
    Info "Instalando dependências do frontend..."
    Set-Location (Join-Path $APP_DIR "frontend")
    npm install
    
    # Voltar para o diretório original
    Set-Location $APP_DIR
    
    Log "Dependências da aplicação instaladas com sucesso!"
}

# Função para compilar a aplicação
function Build-Application {
    Log "Compilando aplicação..."
    
    # Backend
    Info "Compilando backend..."
    Set-Location (Join-Path $APP_DIR "backend")
    npm run build
    
    # Frontend (opcional)
    $buildFrontend = Read-Host "Deseja compilar o frontend para produção? (S/N)"
    if ($buildFrontend -eq "S" -or $buildFrontend -eq "s") {
        Info "Compilando frontend..."
        Set-Location (Join-Path $APP_DIR "frontend")
        npm run build
    }
    
    # Voltar para o diretório original
    Set-Location $APP_DIR
    
    Log "Aplicação compilada com sucesso!"
}

# Função para configurar PM2
function Setup-PM2 {
    Log "Configurando PM2..."
    
    # Criar arquivo de configuração do PM2
    $ecosystemPath = Join-Path $APP_DIR 'ecosystem.config.js'
    $ecosystemContent = @"
module.exports = {
  apps: [
    {
      name: '$APP_NAME-backend',
      script: '$APP_DIR/backend/dist/app.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      }
    },
    {
      name: '$APP_NAME-websocket',
      script: '$APP_DIR/backend/websocket-server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};
"@
    
    Set-Content -Path $ecosystemPath -Value $ecosystemContent
    
    # Criar script de gerenciamento
    $scriptName = "$APP_NAME.ps1"
    $scriptPath = Join-Path $APP_DIR $scriptName
    $scriptContent = @"
param(
    [Parameter(Mandatory=`$true)]
    [ValidateSet('start', 'stop', 'restart', 'status', 'logs', 'monit', 'dev')]
    [string]`$Command
)

`$APP_DIR = "$APP_DIR"

function Start-App {
    Set-Location `$APP_DIR
    pm2 start ecosystem.config.js
    Write-Host "Aplicação iniciada!"
}

function Stop-App {
    Set-Location `$APP_DIR
    pm2 stop all
    Write-Host "Aplicação parada!"
}

function Restart-App {
    Set-Location `$APP_DIR
    pm2 restart all
    Write-Host "Aplicação reiniciada!"
}

function Get-AppStatus {
    pm2 status
}

function Get-AppLogs {
    pm2 logs
}

function Monitor-App {
    pm2 monit
}

function Start-DevMode {
    `$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$APP_DIR/backend'; npm run dev" -PassThru
`$websocketProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$APP_DIR/backend'; npm run websocket:dev" -PassThru
`$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$APP_DIR/frontend'; npm start" -PassThru
    
    Write-Host "Aplicação iniciada em modo de desenvolvimento!"
    Write-Host "Pressione qualquer tecla para encerrar todos os processos..."
    `$null = `$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    Stop-Process -Id `$backendProcess.Id -Force
    Stop-Process -Id `$websocketProcess.Id -Force
    Stop-Process -Id `$frontendProcess.Id -Force
    
    Write-Host "Todos os processos encerrados!"
}

switch (`$Command) {
    'start' { Start-App }
    'stop' { Stop-App }
    'restart' { Restart-App }
    'status' { Get-AppStatus }
    'logs' { Get-AppLogs }
    'monit' { Monitor-App }
    'dev' { Start-DevMode }
}
"@
    
    Set-Content -Path $scriptPath -Value $scriptContent
    
    # Criar atalho para o script
    $shortcutPath = "$env:USERPROFILE\Desktop\$APP_NAME.lnk"
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = "powershell.exe"
    $Shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$scriptPath`" -Command start"
    $Shortcut.WorkingDirectory = $APP_DIR
    $Shortcut.IconLocation = "powershell.exe,0"
    $Shortcut.Save()
    
    Log "PM2 configurado com sucesso!"
}

# Função para criar usuário admin
function Create-AdminUser {
    Log "Configurando usuário administrador..."
    
    $adminEmail = Read-Host "Digite o email do usuário administrador"
    $adminPassword = Read-Host "Digite a senha do usuário administrador" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminPassword)
    $adminPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    # Configurar variáveis de ambiente para o script de setup
    $env:ADMIN_EMAIL = $adminEmail
    $env:ADMIN_PASSWORD = $adminPassword
    
    # Executar script de setup do banco de dados
    Set-Location (Join-Path $APP_DIR "backend")
    node scripts/setup-prod-db.js
    
    # Limpar variáveis de ambiente sensíveis
    $env:ADMIN_EMAIL = $null
    $env:ADMIN_PASSWORD = $null
    
    Log "Usuário administrador configurado com sucesso!"
}

# Função para mostrar informações finais
function Show-FinalInfo {
    Write-Host "${Green}"
    Write-Host "╔══════════════════════════════════════════════════════════════╗"
    Write-Host "║                    INSTALAÇÃO CONCLUÍDA!                     ║"
    Write-Host "╚══════════════════════════════════════════════════════════════╝"
    Write-Host "${NC}"
    
    Log "Just Dance Event Hub foi instalado com sucesso!"
    Write-Host ""
    Write-Host "${Blue}📋 Informações da Instalação:${NC}"
    Write-Host "  • Diretório da aplicação: $APP_DIR"
    Write-Host "  • Banco de dados: $DB_NAME"
    Write-Host "  • Porta da API: 5000"
    Write-Host "  • Porta do Frontend: 3000"
    
    Write-Host ""
    Write-Host "${Blue}🔧 Comandos de Gerenciamento:${NC}"
    Write-Host "  • Iniciar: .\$APP_NAME.ps1 start"
    Write-Host "  • Parar: .\$APP_NAME.ps1 stop"
    Write-Host "  • Reiniciar: .\$APP_NAME.ps1 restart"
    Write-Host "  • Status: .\$APP_NAME.ps1 status"
    Write-Host "  • Logs: .\$APP_NAME.ps1 logs"
    Write-Host "  • Monitorar: .\$APP_NAME.ps1 monit"
    Write-Host "  • Modo Dev: .\$APP_NAME.ps1 dev"
    
    Write-Host ""
    Write-Host "${Blue}🌐 Acesso à Aplicação:${NC}"
    Write-Host "  • API: http://$Domain`:$ApiPort"
    Write-Host "  • Frontend: http://$Domain`:$FrontendPort"
    
    Write-Host ""
    Write-Host "${Blue}📊 Endpoints Principais:${NC}"
    Write-Host "  • GET /api/health - Status da API"
    Write-Host "  • POST /api/auth/register - Registro"
    Write-Host "  • POST /api/auth/login - Login"
    Write-Host "  • GET /api/events - Listar eventos"
    
    Write-Host ""
    Write-Host "${Yellow}⚠️  IMPORTANTE:${NC}"
    Write-Host "  • Mantenha suas credenciais seguras"
    Write-Host "  • Faça backups regulares do banco de dados"
    Write-Host "  • Para iniciar em modo de desenvolvimento, use: .\$APP_NAME.ps1 dev"
    
    Write-Host ""
    Log "Instalação concluída! A aplicação está pronta para uso."
    
    # Perguntar se deseja iniciar a aplicação
    $startApp = Read-Host "Deseja iniciar a aplicação agora? (S/N)"
    if ($startApp -eq "S" -or $startApp -eq "s") {
        $startDev = Read-Host "Iniciar em modo de desenvolvimento? (S/N)"
        if ($startDev -eq "S" -or $startDev -eq "s") {
            & (Join-Path $APP_DIR "$APP_NAME.ps1") dev
        } else {
            & (Join-Path $APP_DIR "$APP_NAME.ps1") start
        }
    }
}

# Função principal
function Main {
    Log "Iniciando instalação do Just Dance Event Hub..."
    
    # Executar etapas de instalação
    Install-SystemDependencies
    Setup-PostgreSQL
    Setup-Environment
    Install-AppDependencies
    Build-Application
    Setup-PM2
    Create-AdminUser
    Show-FinalInfo
}

# Executar função principal
Main