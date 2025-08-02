# Script de Configuração para Produção - Just Dance Event Hub
# Execute como Administrador

param(
    [string]$Domain = "",
    [string]$Email = "",
    [switch]$SkipSSL = $false,
    [switch]$Help = $false
)

# Cores para output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"
$NC = "White"

# Variáveis
$APP_NAME = "just-dance-hub"
$APP_DIR = "C:\opt\$APP_NAME"
$LOG_FILE = "$APP_DIR\production-setup.log"

# Funções de logging
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage -ForegroundColor $Green
    Add-Content -Path $LOG_FILE -Value $logMessage -ErrorAction SilentlyContinue
}

function Write-Error-Log {
    param([string]$Message)
    Write-Log $Message "ERROR"
    Write-Host $Message -ForegroundColor $Red
}

function Write-Warning-Log {
    param([string]$Message)
    Write-Log $Message "WARN"
    Write-Host $Message -ForegroundColor $Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor $Blue
}

# Função de ajuda
function Show-Help {
    Write-Host "Just Dance Event Hub - Script de Configuração para Produção" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "Uso:" -ForegroundColor $Yellow
    Write-Host "  .\production-setup.ps1 -Domain exemplo.com -Email admin@exemplo.com"
    Write-Host ""
    Write-Host "Parâmetros:" -ForegroundColor $Yellow
    Write-Host "  -Domain    Domínio para configurar SSL (obrigatório para SSL)"
    Write-Host "  -Email     Email para certificados Let's Encrypt"
    Write-Host "  -SkipSSL   Pular configuração SSL"
    Write-Host "  -Help      Mostrar esta ajuda"
    Write-Host ""
    Write-Host "Exemplos:" -ForegroundColor $Yellow
    Write-Host "  .\production-setup.ps1 -Domain meusite.com -Email admin@meusite.com"
    Write-Host "  .\production-setup.ps1 -SkipSSL"
    exit 0
}

# Verificar se é administrador
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Função para gerar senhas seguras
function New-SecurePassword {
    param([int]$Length = 32)
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    $password = ""
    for ($i = 0; $i -lt $Length; $i++) {
        $password += $chars[(Get-Random -Maximum $chars.Length)]
    }
    return $password
}

# Função para configurar variáveis de ambiente de produção
function Set-ProductionEnvironment {
    Write-Info "Configurando variáveis de ambiente para produção..."
    
    $backendEnvPath = "$APP_DIR\backend\.env"
    $frontendEnvPath = "$APP_DIR\frontend\.env.production"
    
    # Gerar JWT secret seguro
    $jwtSecret = New-SecurePassword -Length 64
    $dbPassword = New-SecurePassword -Length 32
    
    # Configurar backend .env
    $backendEnvContent = @"
# Configurações de Produção - Just Dance Event Hub
NODE_ENV=production
PORT=3000

# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=just_dance_hub_prod
DB_USER=just_dance_user
DB_PASSWORD=$dbPassword

# Configurações de Segurança
JWT_SECRET=$jwtSecret
JWT_EXPIRES_IN=24h

# Configurações do Frontend
FRONTEND_URL=https://$Domain

# Configurações de Rate Limiting (mais restritivas para produção)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
AUTH_RATE_LIMIT_MAX_REQUESTS=3

# Configurações de Logging
LOG_LEVEL=warn
LOG_FILE=true

# Configurações de Segurança Avançadas
SESSION_SECRET=$(New-SecurePassword -Length 64)
CORS_ORIGIN=https://$Domain
TRUST_PROXY=true
"@
    
    Set-Content -Path $backendEnvPath -Value $backendEnvContent
    
    # Configurar frontend .env.production
    $frontendEnvContent = @"
# Configurações de Produção - Frontend
REACT_APP_API_BASE_URL=https://$Domain
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
GENERATE_SOURCEMAP=false
"@
    
    Set-Content -Path $frontendEnvPath -Value $frontendEnvContent
    
    # Definir permissões seguras
    icacls $backendEnvPath /inheritance:d /grant:r "Administrators:F" /grant:r "SYSTEM:F" /remove "Users"
    
    Write-Log "Variáveis de ambiente configuradas com sucesso"
    Write-Warning-Log "IMPORTANTE: Salve estas credenciais em local seguro:"
    Write-Warning-Log "DB Password: $dbPassword"
    Write-Warning-Log "JWT Secret: $jwtSecret"
}

# Função para configurar banco de dados de produção
function Set-ProductionDatabase {
    Write-Info "Configurando banco de dados para produção..."
    
    try {
        # Criar usuário dedicado para a aplicação
        $createUserScript = @"
CREATE USER just_dance_user WITH PASSWORD '$dbPassword';
CREATE DATABASE just_dance_hub_prod OWNER just_dance_user;
GRANT ALL PRIVILEGES ON DATABASE just_dance_hub_prod TO just_dance_user;
"@
        
        # Executar script de configuração
        $createUserScript | psql -U postgres
        
        # Executar script de setup da aplicação
        Set-Location "$APP_DIR\backend"
        node scripts/setup-prod-db.js
        
        Write-Log "Banco de dados configurado com sucesso"
    }
    catch {
        Write-Error-Log "Erro ao configurar banco de dados: $_"
        return $false
    }
    
    return $true
}

# Função para configurar PM2 para produção
function Set-ProductionPM2 {
    Write-Info "Configurando PM2 para produção..."
    
    $ecosystemContent = @"
module.exports = {
  apps: [
    {
      name: '$APP_NAME-backend',
      script: '$APP_DIR/backend/dist/app.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: 'C:/logs/$APP_NAME/error.log',
      out_file: 'C:/logs/$APP_NAME/out.log',
      log_file: 'C:/logs/$APP_NAME/combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      kill_timeout: 5000
    },
    {
      name: '$APP_NAME-websocket',
      script: '$APP_DIR/backend/websocket-server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: 'C:/logs/$APP_NAME/ws-error.log',
      out_file: 'C:/logs/$APP_NAME/ws-out.log',
      log_file: 'C:/logs/$APP_NAME/ws-combined.log',
      time: true
    }
  ]
};
"@
    
    Set-Content -Path "$APP_DIR\ecosystem.config.js" -Value $ecosystemContent
    
    # Criar diretório de logs
    New-Item -ItemType Directory -Force -Path "C:\logs\$APP_NAME"
    
    Write-Log "PM2 configurado para produção"
}

# Função para configurar firewall do Windows
function Set-WindowsFirewall {
    Write-Info "Configurando firewall do Windows..."
    
    try {
        # Permitir HTTP e HTTPS
        New-NetFirewallRule -DisplayName "Just Dance Hub HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow -ErrorAction SilentlyContinue
        New-NetFirewallRule -DisplayName "Just Dance Hub HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow -ErrorAction SilentlyContinue
        New-NetFirewallRule -DisplayName "Just Dance Hub App" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -ErrorAction SilentlyContinue
        
        Write-Log "Firewall configurado com sucesso"
    }
    catch {
        Write-Warning-Log "Erro ao configurar firewall: $_"
    }
}

# Função para configurar monitoramento
function Set-Monitoring {
    Write-Info "Configurando monitoramento..."
    
    # Script de health check
    $healthCheckScript = @"
# Health Check Script
`$response = try {
    Invoke-RestMethod -Uri "http://localhost:3000/health" -TimeoutSec 10
} catch {
    Write-Error "Health check failed: `$_"
    exit 1
}

if (`$response.status -eq "ok") {
    Write-Host "Application is healthy"
    exit 0
} else {
    Write-Error "Application is unhealthy"
    exit 1
}
"@
    
    Set-Content -Path "$APP_DIR\health-check.ps1" -Value $healthCheckScript
    
    # Configurar tarefa agendada para health check
    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File $APP_DIR\health-check.ps1"
    $trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 5) -Once -At (Get-Date)
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
    
    Register-ScheduledTask -TaskName "JustDanceHub-HealthCheck" -Action $action -Trigger $trigger -Settings $settings -Force
    
    Write-Log "Monitoramento configurado"
}

# Função para configurar backup automático
function Set-AutoBackup {
    Write-Info "Configurando backup automático..."
    
    $backupScript = @"
# Backup Script
`$backupDir = "C:\backups\just-dance-hub"
`$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

# Criar diretório de backup
New-Item -ItemType Directory -Force -Path "`$backupDir\`$timestamp"

# Backup do banco de dados
pg_dump -U just_dance_user -h localhost just_dance_hub_prod > "`$backupDir\`$timestamp\database.sql"

# Backup dos arquivos de configuração
Copy-Item "$APP_DIR\backend\.env" "`$backupDir\`$timestamp\backend.env"
Copy-Item "$APP_DIR\frontend\.env.production" "`$backupDir\`$timestamp\frontend.env"

# Compactar backup
Compress-Archive -Path "`$backupDir\`$timestamp\*" -DestinationPath "`$backupDir\backup-`$timestamp.zip"
Remove-Item -Recurse -Force "`$backupDir\`$timestamp"

# Manter apenas os últimos 7 backups
Get-ChildItem "`$backupDir\*.zip" | Sort-Object CreationTime -Descending | Select-Object -Skip 7 | Remove-Item -Force

Write-Host "Backup concluído: backup-`$timestamp.zip"
"@
    
    Set-Content -Path "$APP_DIR\backup.ps1" -Value $backupScript
    
    # Configurar tarefa agendada para backup diário
    $backupAction = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File $APP_DIR\backup.ps1"
    $backupTrigger = New-ScheduledTaskTrigger -Daily -At "02:00"
    
    Register-ScheduledTask -TaskName "JustDanceHub-DailyBackup" -Action $backupAction -Trigger $backupTrigger -Force
    
    # Criar diretório de backup
    New-Item -ItemType Directory -Force -Path "C:\backups\just-dance-hub"
    
    Write-Log "Backup automático configurado"
}

# Função para compilar aplicação para produção
function Build-Production {
    Write-Info "Compilando aplicação para produção..."
    
    try {
        # Backend
        Set-Location "$APP_DIR\backend"
        npm ci --only=production
        npm run build
        
        # Frontend
        Set-Location "$APP_DIR\frontend"
        npm ci --only=production
        npm run build
        
        Write-Log "Aplicação compilada com sucesso"
        return $true
    }
    catch {
        Write-Error-Log "Erro ao compilar aplicação: $_"
        return $false
    }
}

# Função para iniciar aplicação em produção
function Start-ProductionApp {
    Write-Info "Iniciando aplicação em produção..."
    
    try {
        Set-Location $APP_DIR
        
        # Parar aplicação se estiver rodando
        pm2 stop all
        pm2 delete all
        
        # Iniciar com configuração de produção
        pm2 start ecosystem.config.js
        pm2 save
        
        # Configurar PM2 para iniciar com o sistema
        pm2 startup
        
        Write-Log "Aplicação iniciada em produção"
        return $true
    }
    catch {
        Write-Error-Log "Erro ao iniciar aplicação: $_"
        return $false
    }
}

# Função para mostrar resumo final
function Show-Summary {
    Write-Host ""
    Write-Host "=== CONFIGURAÇÃO DE PRODUÇÃO CONCLUÍDA ===" -ForegroundColor $Green
    Write-Host ""
    Write-Host "🚀 Aplicação configurada para produção!" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "📊 Status dos serviços:" -ForegroundColor $Yellow
    pm2 status
    Write-Host ""
    Write-Host "🔗 URLs importantes:" -ForegroundColor $Yellow
    if (-not $SkipSSL -and $Domain) {
        Write-Host "  • Frontend: https://$Domain"
        Write-Host "  • API: https://$Domain/api"
        Write-Host "  • Health Check: https://$Domain/health"
    } else {
        Write-Host "  • Frontend: http://localhost:3000"
        Write-Host "  • API: http://localhost:3000/api"
        Write-Host "  • Health Check: http://localhost:3000/health"
    }
    Write-Host ""
    Write-Host "📝 Comandos úteis:" -ForegroundColor $Yellow
    Write-Host "  • Ver status: pm2 status"
    Write-Host "  • Ver logs: pm2 logs"
    Write-Host "  • Reiniciar: pm2 restart all"
    Write-Host "  • Monitorar: pm2 monit"
    Write-Host "  • Health check: .\health-check.ps1"
    Write-Host "  • Backup manual: .\backup.ps1"
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE:" -ForegroundColor $Red
    Write-Host "  • Altere a senha do super admin padrão"
    Write-Host "  • Configure SSL se não foi feito automaticamente"
    Write-Host "  • Monitore logs regularmente"
    Write-Host "  • Mantenha backups atualizados"
    Write-Host ""
}

# Função principal
function Main {
    if ($Help) {
        Show-Help
    }
    
    if (-not (Test-Administrator)) {
        Write-Error-Log "Este script deve ser executado como Administrador"
        exit 1
    }
    
    if (-not $SkipSSL -and -not $Domain) {
        Write-Error-Log "Domínio é obrigatório para configuração SSL. Use -SkipSSL para pular SSL."
        exit 1
    }
    
    Write-Info "Iniciando configuração de produção do Just Dance Event Hub..."
    
    # Criar diretório de logs
    New-Item -ItemType Directory -Force -Path (Split-Path $LOG_FILE -Parent)
    
    # Executar configurações
    Set-ProductionEnvironment
    Set-ProductionDatabase
    Set-ProductionPM2
    Set-WindowsFirewall
    Set-Monitoring
    Set-AutoBackup
    
    if (Build-Production) {
        if (Start-ProductionApp) {
            Show-Summary
        } else {
            Write-Error-Log "Falha ao iniciar aplicação"
            exit 1
        }
    } else {
        Write-Error-Log "Falha ao compilar aplicação"
        exit 1
    }
    
    Write-Log "Configuração de produção concluída com sucesso!"
}

# Executar função principal
Main