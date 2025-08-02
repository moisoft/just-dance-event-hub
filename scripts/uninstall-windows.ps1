# Just Dance Event Hub - Script de Desinstalação para Windows
# Versão: 1.0.0
# Autor: Just Dance Event Hub Team

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
Write-Host "║                   Desinstalador Windows                      ║"
Write-Host "║                          v1.0.0                              ║"
Write-Host "╚══════════════════════════════════════════════════════════════╝"
Write-Host "${NC}"

# Variáveis de configuração
$APP_NAME = "just-dance-hub"
$APP_DIR = $PSScriptRoot | Split-Path -Parent
$DB_NAME = "just_dance_hub"
$DB_USER = "postgres"

# Verificar se o PowerShell está sendo executado como administrador
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Error "Este script precisa ser executado como administrador. Por favor, reinicie o PowerShell como administrador."
}

# Função para parar serviços
function Stop-Services {
    Log "Parando serviços..."
    
    # Parar PM2
    try {
        pm2 stop all
        pm2 delete all
        Log "Processos PM2 parados e removidos."
    } catch {
        Warn "Não foi possível parar processos PM2: $_"
    }
    
    Log "Serviços parados com sucesso!"
}

# Função para fazer backup do banco de dados
function Backup-Database {
    $doBackup = Read-Host "Deseja fazer backup do banco de dados antes de remover? (S/N)"
    if ($doBackup -eq "S" -or $doBackup -eq "s") {
        Log "Fazendo backup do banco de dados..."
        
        # Solicitar senha do PostgreSQL
        $DB_PASSWORD = Read-Host "Digite a senha do PostgreSQL" -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD)
        $DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
        
        # Criar diretório de backup se não existir
        $backupDir = "$APP_DIR\backups"
        if (-not (Test-Path $backupDir)) {
            New-Item -ItemType Directory -Path $backupDir | Out-Null
        }
        
        # Nome do arquivo de backup
        $backupFile = "$backupDir\$DB_NAME-$(Get-Date -Format 'yyyyMMdd-HHmmss').sql"
        
        # Fazer backup
        $env:PGPASSWORD = $DB_PASSWORD
        try {
            pg_dump -U $DB_USER -d $DB_NAME -f $backupFile
            Log "Backup do banco de dados criado: $backupFile"
        } catch {
            Warn "Não foi possível criar backup do banco de dados: $_"
        } finally {
            $env:PGPASSWORD = $null
        }
    }
}

# Função para remover banco de dados
function Remove-Database {
    $removeDb = Read-Host "Deseja remover o banco de dados '$DB_NAME'? (S/N)"
    if ($removeDb -eq "S" -or $removeDb -eq "s") {
        Log "Removendo banco de dados..."
        
        # Solicitar senha do PostgreSQL
        $DB_PASSWORD = Read-Host "Digite a senha do PostgreSQL" -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD)
        $DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
        
        # Remover banco de dados
        $env:PGPASSWORD = $DB_PASSWORD
        try {
            # Verificar se o banco de dados existe
            $dbExists = psql -U $DB_USER -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" -t | Out-String
            
            if ($dbExists.Trim() -eq "1") {
                # Desconectar todos os usuários
                psql -U $DB_USER -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME'" | Out-Null
                
                # Remover banco de dados
                psql -U $DB_USER -c "DROP DATABASE $DB_NAME" | Out-Null
                Log "Banco de dados $DB_NAME removido com sucesso!"
            } else {
                Log "Banco de dados $DB_NAME não existe."
            }
        } catch {
            Warn "Não foi possível remover o banco de dados: $_"
        } finally {
            $env:PGPASSWORD = $null
        }
    }
}

# Função para remover arquivos
function Remove-AppFiles {
    Log "Removendo arquivos da aplicação..."
    
    # Remover atalho do desktop
    $shortcutPath = "$env:USERPROFILE\Desktop\$APP_NAME.lnk"
    if (Test-Path $shortcutPath) {
        Remove-Item $shortcutPath -Force
        Log "Atalho removido do desktop."
    }
    
    # Remover script de gerenciamento
    $scriptPath = "$APP_DIR\$APP_NAME.ps1"
    if (Test-Path $scriptPath) {
        Remove-Item $scriptPath -Force
        Log "Script de gerenciamento removido."
    }
    
    # Remover arquivo de configuração do PM2
    $ecosystemPath = "$APP_DIR\ecosystem.config.js"
    if (Test-Path $ecosystemPath) {
        Remove-Item $ecosystemPath -Force
        Log "Arquivo de configuração do PM2 removido."
    }
    
    # Remover arquivos .env
    $removeEnv = Read-Host "Deseja remover os arquivos de configuração (.env)? (S/N)"
    if ($removeEnv -eq "S" -or $removeEnv -eq "s") {
        if (Test-Path "$APP_DIR\backend\.env") {
            Remove-Item "$APP_DIR\backend\.env" -Force
            Log "Arquivo .env do backend removido."
        }
        
        if (Test-Path "$APP_DIR\frontend\.env") {
            Remove-Item "$APP_DIR\frontend\.env" -Force
            Log "Arquivo .env do frontend removido."
        }
    }
    
    # Remover node_modules
    $removeNodeModules = Read-Host "Deseja remover os diretórios node_modules? (S/N)"
    if ($removeNodeModules -eq "S" -or $removeNodeModules -eq "s") {
        if (Test-Path "$APP_DIR\backend\node_modules") {
            Remove-Item "$APP_DIR\backend\node_modules" -Recurse -Force
            Log "node_modules do backend removido."
        }
        
        if (Test-Path "$APP_DIR\frontend\node_modules") {
            Remove-Item "$APP_DIR\frontend\node_modules" -Recurse -Force
            Log "node_modules do frontend removido."
        }
    }
    
    # Remover diretório dist
    if (Test-Path "$APP_DIR\backend\dist") {
        Remove-Item "$APP_DIR\backend\dist" -Recurse -Force
        Log "Diretório dist do backend removido."
    }
    
    # Remover diretório build do frontend
    if (Test-Path "$APP_DIR\frontend\build") {
        Remove-Item "$APP_DIR\frontend\build" -Recurse -Force
        Log "Diretório build do frontend removido."
    }
    
    Log "Arquivos da aplicação removidos com sucesso!"
}

# Função para remover dependências globais
function Remove-GlobalDependencies {
    $removeGlobalDeps = Read-Host "Deseja remover dependências globais (PM2)? (S/N)"
    if ($removeGlobalDeps -eq "S" -or $removeGlobalDeps -eq "s") {
        Log "Removendo dependências globais..."
        
        try {
            npm uninstall -g pm2
            Log "PM2 removido globalmente."
        } catch {
            Warn "Não foi possível remover PM2: $_"
        }
    }
}

# Função para mostrar informações finais
function Show-FinalInfo {
    Write-Host "${Green}"
    Write-Host "╔══════════════════════════════════════════════════════════════╗"
    Write-Host "║                  DESINSTALAÇÃO CONCLUÍDA!                   ║"
    Write-Host "╚══════════════════════════════════════════════════════════════╝"
    Write-Host "${NC}"
    
    Log "Just Dance Event Hub foi desinstalado com sucesso!"
    
    # Verificar se o banco de dados foi removido
    $env:PGPASSWORD = $DB_PASSWORD
    try {
        $dbExists = psql -U $DB_USER -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" -t | Out-String
        if ($dbExists.Trim() -eq "1") {
            Warn "O banco de dados $DB_NAME ainda existe. Você pode removê-lo manualmente se necessário."
        }
    } catch {
        # Ignorar erros
    } finally {
        $env:PGPASSWORD = $null
    }
    
    Write-Host ""
    Write-Host "${Blue}📋 Informações Adicionais:${NC}"
    Write-Host "  • Os arquivos de código-fonte não foram removidos."
    Write-Host "  • Você pode remover manualmente o diretório $APP_DIR se necessário."
    
    if (Test-Path "$APP_DIR\backups") {
        Write-Host "  • Backups do banco de dados estão disponíveis em: $APP_DIR\backups"
    }
    
    Write-Host ""
    Log "Desinstalação concluída!"
}

# Função principal
function Main {
    Log "Iniciando desinstalação do Just Dance Event Hub..."
    
    # Confirmar desinstalação
    Write-Host "${Yellow}AVISO: Esta ação irá desinstalar o Just Dance Event Hub.${NC}"
    $confirm = Read-Host "Tem certeza que deseja continuar? (S/N)"
    if ($confirm -ne "S" -and $confirm -ne "s") {
        Log "Desinstalação cancelada pelo usuário."
        exit 0
    }
    
    # Executar etapas de desinstalação
    Stop-Services
    Backup-Database
    Remove-Database
    Remove-AppFiles
    Remove-GlobalDependencies
    Show-FinalInfo
}

# Executar função principal
Main