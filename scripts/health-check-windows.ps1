# Just Dance Event Hub - Script de Verificação de Saúde para Windows
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
}

function Info($message) {
    Write-Host "${Blue}[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] INFO: $message${NC}"
}

# Banner
Write-Host "${Blue}"
Write-Host "╔══════════════════════════════════════════════════════════════╗"
Write-Host "║                    Just Dance Event Hub                      ║"
Write-Host "║                 Verificação de Saúde Windows                 ║"
Write-Host "║                          v1.0.0                              ║"
Write-Host "╚══════════════════════════════════════════════════════════════╝"
Write-Host "${NC}"

# Variáveis de configuração
$APP_NAME = "just-dance-hub"
$APP_DIR = $PSScriptRoot | Split-Path -Parent
$DB_NAME = "just_dance_hub"
$DB_USER = "postgres"

# Função para verificar a instalação
function Check-Installation {
    Info "Verificando instalação..."
    
    # Verificar diretório da aplicação
    if (Test-Path "$APP_DIR\backend" -PathType Container) {
        Log "Diretório backend encontrado: $APP_DIR\backend"
    } else {
        Error "Diretório backend não encontrado: $APP_DIR\backend"
    }
    
    if (Test-Path "$APP_DIR\frontend" -PathType Container) {
        Log "Diretório frontend encontrado: $APP_DIR\frontend"
    } else {
        Error "Diretório frontend não encontrado: $APP_DIR\frontend"
    }
    
    # Verificar arquivo .env
    if (Test-Path "$APP_DIR\backend\.env" -PathType Leaf) {
        Log "Arquivo .env do backend encontrado"
    } else {
        Warn "Arquivo .env do backend não encontrado"
    }
    
    if (Test-Path "$APP_DIR\frontend\.env" -PathType Leaf) {
        Log "Arquivo .env do frontend encontrado"
    } else {
        Warn "Arquivo .env do frontend não encontrado"
    }
    
    # Verificar arquivo ecosystem.config.js
    if (Test-Path "$APP_DIR\ecosystem.config.js" -PathType Leaf) {
        Log "Arquivo ecosystem.config.js encontrado"
    } else {
        Warn "Arquivo ecosystem.config.js não encontrado"
    }
    
    # Verificar diretório dist
    if (Test-Path "$APP_DIR\backend\dist" -PathType Container) {
        Log "Diretório dist do backend encontrado"
    } else {
        Warn "Diretório dist do backend não encontrado. A aplicação pode não estar compilada."
    }
}

# Função para verificar dependências do sistema
function Check-SystemDependencies {
    Info "Verificando dependências do sistema..."
    
    # Verificar Node.js
    try {
        $nodeVersion = (node -v).Substring(1)
        Log "Node.js versão $nodeVersion encontrado"
        
        if ([version]$nodeVersion -lt [version]"18.0.0") {
            Warn "Versão do Node.js abaixo da recomendada (18.0.0+)"
        }
    } catch {
        Error "Node.js não encontrado"
    }
    
    # Verificar NPM
    try {
        $npmVersion = (npm -v)
        Log "NPM versão $npmVersion encontrado"
    } catch {
        Error "NPM não encontrado"
    }
    
    # Verificar PostgreSQL
    try {
        $pgVersion = (psql --version)
        Log "PostgreSQL encontrado: $pgVersion"
    } catch {
        Warn "PostgreSQL não encontrado ou não está no PATH"
    }
    
    # Verificar PM2
    try {
        $pm2Version = (pm2 -v)
        Log "PM2 versão $pm2Version encontrado"
    } catch {
        Warn "PM2 não encontrado. Execute: npm install -g pm2"
    }
}

# Função para verificar PostgreSQL
function Check-PostgreSQL {
    Info "Verificando PostgreSQL..."
    
    # Verificar se o serviço do PostgreSQL está em execução
    $pgService = Get-Service -Name postgresql* -ErrorAction SilentlyContinue
    if ($pgService) {
        if ($pgService.Status -eq 'Running') {
            Log "Serviço do PostgreSQL está em execução"
        } else {
            Warn "Serviço do PostgreSQL não está em execução"
        }
    } else {
        Warn "Serviço do PostgreSQL não encontrado"
    }
    
    # Verificar conexão com o banco de dados
    $DB_PASSWORD = Read-Host "Digite a senha do PostgreSQL para verificar a conexão" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD)
    $DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    $env:PGPASSWORD = $DB_PASSWORD
    try {
        $dbExists = psql -U $DB_USER -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" -t | Out-String
        
        if ($dbExists.Trim() -eq "1") {
            Log "Banco de dados $DB_NAME existe"
            
            # Verificar tabelas
            $tableCount = psql -U $DB_USER -d $DB_NAME -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'" -t | Out-String
            Log "Número de tabelas no banco de dados: $($tableCount.Trim())"
        } else {
            Warn "Banco de dados $DB_NAME não existe"
        }
    } catch {
        Error "Não foi possível conectar ao PostgreSQL: $_"
    } finally {
        $env:PGPASSWORD = $null
    }
}

# Função para verificar PM2
function Check-PM2 {
    Info "Verificando PM2..."
    
    try {
        # Verificar se o PM2 está instalado
        $pm2Version = (pm2 -v)
        Log "PM2 versão $pm2Version encontrado"
        
        # Verificar processos do PM2
        $pm2List = (pm2 list --no-color)
        if ($pm2List -match "$APP_NAME") {
            Log "Aplicação $APP_NAME encontrada no PM2"
            
            # Verificar status dos processos
            if ($pm2List -match "online") {
                Log "Processos estão online"
            } else {
                Warn "Alguns processos podem não estar online"
            }
        } else {
            Warn "Aplicação $APP_NAME não encontrada no PM2"
        }
    } catch {
        Warn "PM2 não encontrado ou erro ao executar comandos: $_"
    }
}

# Função para verificar logs
function Check-Logs {
    Info "Verificando logs..."
    
    try {
        # Verificar logs do PM2
        $logFiles = pm2 logs $APP_NAME --nostream --lines 1
        Log "Logs do PM2 disponíveis"
        
        # Verificar erros recentes
        $errorLogs = pm2 logs $APP_NAME --nostream --lines 100 | Select-String -Pattern "ERROR|Error|error"
        if ($errorLogs) {
            $errorCount = ($errorLogs | Measure-Object).Count
            Warn "Encontrados $errorCount erros recentes nos logs"
        } else {
            Log "Nenhum erro recente encontrado nos logs"
        }
    } catch {
        Warn "Não foi possível verificar logs: $_"
    }
}

# Função para verificar recursos do sistema
function Check-SystemResources {
    Info "Verificando recursos do sistema..."
    
    # CPU
    $cpuLoad = (Get-WmiObject Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average
    Log "Uso de CPU: ${cpuLoad}%"
    
    # Memória
    $os = Get-WmiObject -Class Win32_OperatingSystem
    $memoryUsed = [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / $os.TotalVisibleMemorySize * 100, 1)
    Log "Uso de memória: ${memoryUsed}%"
    
    # Disco
    $disk = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'" | Select-Object Size,FreeSpace
    $diskUsed = [math]::Round(($disk.Size - $disk.FreeSpace) / $disk.Size * 100, 1)
    $freeSpaceGB = [math]::Round($disk.FreeSpace / 1GB, 1)
    Log "Uso de disco C:: ${diskUsed}%"
    
    # Verificar se há espaço suficiente
    if ($freeSpaceGB -lt 5) {
        Warn "Pouco espaço em disco disponível: ${freeSpaceGB}GB"
    } else {
        Log "Espaço em disco OK: ${freeSpaceGB}GB disponível"
    }
}

# Função para testar API
function Test-API {
    Info "Testando API..."
    
    # Verificar se a aplicação está respondendo
    try {
        $apiBaseUrl = "http://$Domain:$ApiPort"
        $response = Invoke-WebRequest -Uri "$apiBaseUrl/api/health" -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Log "API respondendo em $apiBaseUrl"
            
            # Testar endpoints específicos
            $healthResponse = Invoke-WebRequest -Uri "$apiBaseUrl/api/health" -UseBasicParsing -ErrorAction SilentlyContinue
            if ($healthResponse.StatusCode -eq 200) {
                Log "Endpoint /api/health OK"
            } else {
                Warn "Endpoint /api/health com problema (HTTP $($healthResponse.StatusCode))"
            }
            
            # Teste de eventos (pode retornar 401 se não autenticado, mas deve responder)
            try {
                $eventsResponse = Invoke-WebRequest -Uri "$apiBaseUrl/api/events" -UseBasicParsing -ErrorAction SilentlyContinue
                Log "Endpoint /api/events respondendo (HTTP $($eventsResponse.StatusCode))"
            } catch {
                if ($_.Exception.Response.StatusCode.value__ -eq 401) {
                    Log "Endpoint /api/events respondendo (HTTP 401 - Não autenticado)"
                } else {
                    Warn "Endpoint /api/events com problema (HTTP $($_.Exception.Response.StatusCode.value__))"
                }
            }
        } else {
            Warn "API respondendo com status $($response.StatusCode)"
        }
    } catch {
        Error "API não está respondendo: $_"
    }
    
    # Verificar frontend
    try {
        $frontendUrl = "http://$Domain:$FrontendPort"
        $frontendResponse = Invoke-WebRequest -Uri "$frontendUrl" -UseBasicParsing -ErrorAction SilentlyContinue
        if ($frontendResponse.StatusCode -eq 200) {
            Log "Frontend respondendo em $frontendUrl"
        } else {
            Warn "Frontend respondendo com status $($frontendResponse.StatusCode)"
        }
    } catch {
        Warn "Frontend não está respondendo: $_"
    }
}

# Função para mostrar resumo
function Show-Summary {
    Write-Host ""
    Write-Host "${Blue}══════════════════════════════════════════════════════════════${NC}"
    Write-Host "${Blue}                    RESUMO DO HEALTH CHECK                    ${NC}"
    Write-Host "${Blue}══════════════════════════════════════════════════════════════${NC}"
    Write-Host ""
    
    Write-Host "${Green}✓ Componentes verificados com sucesso${NC}"
    Write-Host "${Yellow}⚠ Avisos e recomendações${NC}"
    Write-Host "${Red}✗ Problemas encontrados${NC}"
    
    Write-Host ""
    Write-Host "${Blue}🔧 Próximos passos recomendados:${NC}"
    Write-Host "  • Configure monitoramento contínuo"
    Write-Host "  • Monitore logs regularmente"
    Write-Host "  • Mantenha o sistema atualizado"
    
    Write-Host ""
    Write-Host "${Blue}📞 Comandos úteis:${NC}"
    Write-Host "  • Status da aplicação: .\$APP_NAME.ps1 status"
    Write-Host "  • Ver logs: .\$APP_NAME.ps1 logs"
    Write-Host "  • Reiniciar: .\$APP_NAME.ps1 restart"
    Write-Host "  • Modo Dev: .\$APP_NAME.ps1 dev"
    
    Write-Host ""
    Log "Health check concluído!"
}

# Função principal
function Main {
    Info "Iniciando health check do Just Dance Event Hub..."
    
    # Executar verificações
    Check-Installation
    Check-SystemDependencies
    Check-PostgreSQL
    Check-PM2
    Check-Logs
    Check-SystemResources
    Test-API
    
    # Mostrar resumo
    Show-Summary
}

# Executar função principal
Main