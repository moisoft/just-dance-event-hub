# Script de Validação de Produção - Just Dance Event Hub
# Verifica se todos os componentes estão funcionando corretamente

param(
    [string]$Domain = "localhost",
    [int]$Port = 3000,
    [switch]$Detailed = $false,
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
$VALIDATION_LOG = "$APP_DIR\validation-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
$ERRORS = @()
$WARNINGS = @()
$SUCCESS_COUNT = 0
$TOTAL_TESTS = 0

# Funções de logging
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Add-Content -Path $VALIDATION_LOG -Value $logMessage -ErrorAction SilentlyContinue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $Green
    Write-Log $Message "SUCCESS"
    $script:SUCCESS_COUNT++
}

function Write-Error-Test {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $Red
    Write-Log $Message "ERROR"
    $script:ERRORS += $Message
}

function Write-Warning-Test {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $Yellow
    Write-Log $Message "WARNING"
    $script:WARNINGS += $Message
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor $Blue
}

function Start-Test {
    param([string]$TestName)
    Write-Host "🔍 Testando: $TestName" -ForegroundColor $Blue
    Write-Log "Iniciando teste: $TestName" "TEST"
    $script:TOTAL_TESTS++
}

# Função de ajuda
function Show-Help {
    Write-Host "Just Dance Event Hub - Script de Validação de Produção" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "Uso:" -ForegroundColor $Yellow
    Write-Host "  .\production-validation.ps1 [opções]"
    Write-Host ""
    Write-Host "Opções:" -ForegroundColor $Yellow
    Write-Host "  -Domain     Domínio para testar (padrão: localhost)"
    Write-Host "  -Port       Porta da aplicação (padrão: 3000)"
    Write-Host "  -Detailed   Mostrar informações detalhadas"
    Write-Host "  -Help       Mostrar esta ajuda"
    Write-Host ""
    Write-Host "Exemplos:" -ForegroundColor $Yellow
    Write-Host "  .\production-validation.ps1"
    Write-Host "  .\production-validation.ps1 -Domain meusite.com -Port 443 -Detailed"
    exit 0
}

# Teste 1: Verificar estrutura de arquivos
function Test-FileStructure {
    Start-Test "Estrutura de Arquivos"
    
    $requiredFiles = @(
        "$APP_DIR\backend\package.json",
        "$APP_DIR\backend\.env",
        "$APP_DIR\frontend\package.json",
        "$APP_DIR\frontend\.env.production",
        "$APP_DIR\ecosystem.config.js",
        "$APP_DIR\production-setup.ps1",
        "$APP_DIR\security-hardening.ps1",
        "$APP_DIR\PRODUCTION_GUIDE.md"
    )
    
    $missingFiles = @()
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            $missingFiles += $file
        }
    }
    
    if ($missingFiles.Count -eq 0) {
        Write-Success "Todos os arquivos necessários estão presentes"
    } else {
        Write-Error-Test "Arquivos ausentes: $($missingFiles -join ', ')"
    }
    
    # Verificar diretórios
    $requiredDirs = @(
        "C:\logs\$APP_NAME",
        "C:\backups\$APP_NAME"
    )
    
    foreach ($dir in $requiredDirs) {
        if (-not (Test-Path $dir)) {
            Write-Warning-Test "Diretório ausente: $dir"
        }
    }
}

# Teste 2: Verificar dependências
function Test-Dependencies {
    Start-Test "Dependências do Sistema"
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version
        if ($nodeVersion -match "v(\d+)\.(\d+)\.(\d+)") {
            $majorVersion = [int]$matches[1]
            if ($majorVersion -ge 18) {
                Write-Success "Node.js versão $nodeVersion (OK)"
            } else {
                Write-Error-Test "Node.js versão $nodeVersion é muito antiga (mínimo: v18)"
            }
        }
    } catch {
        Write-Error-Test "Node.js não encontrado"
    }
    
    # Verificar PM2
    try {
        $pm2Version = pm2 --version
        Write-Success "PM2 versão $pm2Version instalado"
    } catch {
        Write-Error-Test "PM2 não encontrado"
    }
    
    # Verificar PostgreSQL
    try {
        $pgVersion = psql --version
        Write-Success "PostgreSQL: $pgVersion"
    } catch {
        Write-Error-Test "PostgreSQL não encontrado ou não acessível"
    }
    
    # Verificar servidor web (Nginx ou Apache)
    $webServerFound = $false
    
    # Verificar Nginx
    try {
        $nginxVersion = nginx -v 2>&1
        Write-Success "Nginx: $nginxVersion"
        $webServerFound = $true
    } catch {
        # Nginx não encontrado, verificar Apache
    }
    
    # Verificar Apache se Nginx não foi encontrado
    if (-not $webServerFound) {
        try {
            $apacheService = Get-Service -Name "Apache2.4" -ErrorAction SilentlyContinue
            if ($apacheService) {
                Write-Success "Apache: Serviço encontrado (Status: $($apacheService.Status))"
                $webServerFound = $true
            }
        } catch {
            # Apache também não encontrado
        }
    }
    
    if (-not $webServerFound) {
        Write-Warning-Test "Nenhum servidor web (Nginx/Apache) encontrado"
    }
}

# Teste 3: Verificar configurações de ambiente
function Test-EnvironmentConfig {
    Start-Test "Configurações de Ambiente"
    
    # Verificar .env do backend
    $backendEnv = "$APP_DIR\backend\.env"
    if (Test-Path $backendEnv) {
        $envContent = Get-Content $backendEnv
        $requiredVars = @('NODE_ENV', 'DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET')
        
        foreach ($var in $requiredVars) {
            if ($envContent -match "^$var=") {
                Write-Success "Variável $var configurada"
            } else {
                Write-Error-Test "Variável $var não encontrada no .env"
            }
        }
        
        # Verificar se NODE_ENV está como production
        if ($envContent -match "NODE_ENV=production") {
            Write-Success "NODE_ENV configurado para produção"
        } else {
            Write-Warning-Test "NODE_ENV não está configurado para produção"
        }
    } else {
        Write-Error-Test "Arquivo .env do backend não encontrado"
    }
    
    # Verificar .env.production do frontend
    $frontendEnv = "$APP_DIR\frontend\.env.production"
    if (Test-Path $frontendEnv) {
        $envContent = Get-Content $frontendEnv
        if ($envContent -match "REACT_APP_ENVIRONMENT=production") {
            Write-Success "Frontend configurado para produção"
        } else {
            Write-Warning-Test "Frontend pode não estar configurado para produção"
        }
    } else {
        Write-Error-Test "Arquivo .env.production do frontend não encontrado"
    }
}

# Teste 4: Verificar banco de dados
function Test-Database {
    Start-Test "Conexão com Banco de Dados"
    
    try {
        # Carregar variáveis do .env
        $envFile = "$APP_DIR\backend\.env"
        if (Test-Path $envFile) {
            $envVars = @{}
            Get-Content $envFile | ForEach-Object {
                if ($_ -match "^([^=]+)=(.*)$") {
                    $envVars[$matches[1]] = $matches[2]
                }
            }
            
            # Testar conexão
            $dbHost = if ($envVars['DB_HOST']) { $envVars['DB_HOST'] } else { 'localhost' }
            $dbPort = if ($envVars['DB_PORT']) { $envVars['DB_PORT'] } else { '5432' }
            $dbName = if ($envVars['DB_NAME']) { $envVars['DB_NAME'] } else { 'just_dance_hub_prod' }
            $dbUser = if ($envVars['DB_USER']) { $envVars['DB_USER'] } else { 'just_dance_user' }
            
            $testQuery = "SELECT 1 as test;"
            $result = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c $testQuery 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Conexão com banco de dados estabelecida"
                
                # Verificar tabelas principais
                $tablesQuery = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
                $tables = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c $tablesQuery -t 2>&1
                
                $requiredTables = @('Users', 'Events', 'QueueItems', 'Music')
                foreach ($table in $requiredTables) {
                    if ($tables -match $table) {
                        Write-Success "Tabela $table existe"
                    } else {
                        Write-Error-Test "Tabela $table não encontrada"
                    }
                }
            } else {
                Write-Error-Test "Falha na conexão com banco de dados: $result"
            }
        } else {
            Write-Error-Test "Arquivo .env não encontrado para testar banco"
        }
    } catch {
        Write-Error-Test "Erro ao testar banco de dados: $_"
    }
}

# Teste 5: Verificar processos PM2
function Test-PM2Processes {
    Start-Test "Processos PM2"
    
    try {
        $pm2List = pm2 jlist | ConvertFrom-Json
        
        $requiredProcesses = @('just-dance-hub-backend', 'just-dance-hub-websocket')
        
        foreach ($processName in $requiredProcesses) {
            $process = $pm2List | Where-Object { $_.name -eq $processName }
            
            if ($process) {
                if ($process.pm2_env.status -eq 'online') {
                    Write-Success "Processo $processName está rodando (PID: $($process.pid))"
                } else {
                    Write-Error-Test "Processo $processName não está online (Status: $($process.pm2_env.status))"
                }
            } else {
                Write-Error-Test "Processo $processName não encontrado"
            }
        }
    } catch {
        Write-Error-Test "Erro ao verificar processos PM2: $_"
    }
}

# Teste 6: Verificar conectividade HTTP
function Test-HTTPConnectivity {
    Start-Test "Conectividade HTTP"
    
    $baseUrl = if ($Domain -eq "localhost") { "http://localhost:$Port" } else { "https://$Domain" }
    
    # Testar endpoint de health
    try {
        $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -TimeoutSec 10
        if ($healthResponse.status -eq "ok") {
            Write-Success "Health check endpoint respondendo corretamente"
        } else {
            Write-Warning-Test "Health check retornou status: $($healthResponse.status)"
        }
    } catch {
        Write-Error-Test "Falha no health check: $_"
    }
    
    # Testar endpoint da API
    try {
        $apiResponse = Invoke-RestMethod -Uri "$baseUrl/api/events" -TimeoutSec 10
        Write-Success "API endpoint /api/events respondendo"
    } catch {
        Write-Warning-Test "API endpoint pode não estar acessível: $_"
    }
    
    # Testar frontend (se não for localhost)
    if ($Domain -ne "localhost") {
        try {
            $frontendResponse = Invoke-WebRequest -Uri "https://$Domain" -TimeoutSec 10
            if ($frontendResponse.StatusCode -eq 200) {
                Write-Success "Frontend acessível via HTTPS"
            }
        } catch {
            Write-Error-Test "Frontend não acessível: $_"
        }
    }
}

# Teste 7: Verificar WebSocket
function Test-WebSocket {
    Start-Test "Conectividade WebSocket"
    
    try {
        # Verificar se a porta WebSocket está aberta
        $wsPort = 8080
        $tcpConnection = Test-NetConnection -ComputerName localhost -Port $wsPort -WarningAction SilentlyContinue
        
        if ($tcpConnection.TcpTestSucceeded) {
            Write-Success "Porta WebSocket $wsPort está aberta"
        } else {
            Write-Error-Test "Porta WebSocket $wsPort não está acessível"
        }
    } catch {
        Write-Error-Test "Erro ao testar WebSocket: $_"
    }
}

# Teste 8: Verificar segurança
function Test-Security {
    Start-Test "Configurações de Segurança"
    
    # Verificar firewall
    try {
        $firewallStatus = netsh advfirewall show allprofiles state
        if ($firewallStatus -match "ON") {
            Write-Success "Windows Firewall está ativo"
        } else {
            Write-Warning-Test "Windows Firewall pode não estar ativo"
        }
    } catch {
        Write-Warning-Test "Não foi possível verificar status do firewall"
    }
    
    # Verificar permissões de arquivos sensíveis
    $sensitiveFiles = @(
        "$APP_DIR\backend\.env"
    )
    
    foreach ($file in $sensitiveFiles) {
        if (Test-Path $file) {
            $acl = Get-Acl $file
            $hasEveryoneAccess = $acl.Access | Where-Object { $_.IdentityReference -eq "Everyone" }
            
            if (-not $hasEveryoneAccess) {
                Write-Success "Arquivo $file tem permissões seguras"
            } else {
                Write-Warning-Test "Arquivo $file pode ter permissões muito abertas"
            }
        }
    }
    
    # Verificar se senhas padrão foram alteradas
    if (Test-Path "$APP_DIR\backend\.env") {
        $envContent = Get-Content "$APP_DIR\backend\.env" -Raw
        if ($envContent -match "Admin@2024!Change" -or $envContent -match "Staff@2024!Change") {
            Write-Error-Test "CRÍTICO: Senhas padrão ainda estão em uso!"
        } else {
            Write-Success "Senhas padrão foram alteradas"
        }
    }
}

# Teste 9: Verificar logs
function Test-Logs {
    Start-Test "Sistema de Logs"
    
    $logDir = "C:\logs\$APP_NAME"
    
    if (Test-Path $logDir) {
        Write-Success "Diretório de logs existe"
        
        # Verificar se logs estão sendo gerados
        $recentLogs = Get-ChildItem $logDir -Filter "*.log" | Where-Object { $_.LastWriteTime -gt (Get-Date).AddHours(-1) }
        
        if ($recentLogs) {
            Write-Success "Logs estão sendo gerados recentemente"
        } else {
            Write-Warning-Test "Nenhum log recente encontrado"
        }
        
        # Verificar tamanho dos logs
        $largeLogs = Get-ChildItem $logDir -Filter "*.log" | Where-Object { $_.Length -gt 100MB }
        if ($largeLogs) {
            Write-Warning-Test "Logs grandes encontrados - considere rotação: $($largeLogs.Name -join ', ')"
        }
    } else {
        Write-Error-Test "Diretório de logs não existe"
    }
}

# Teste 10: Verificar backup
function Test-Backup {
    Start-Test "Sistema de Backup"
    
    $backupDir = "C:\backups\$APP_NAME"
    
    if (Test-Path $backupDir) {
        Write-Success "Diretório de backup existe"
        
        # Verificar se há backups recentes
        $recentBackups = Get-ChildItem $backupDir -Filter "*.zip" | Where-Object { $_.LastWriteTime -gt (Get-Date).AddDays(-7) }
        
        if ($recentBackups) {
            Write-Success "Backups recentes encontrados (últimos 7 dias)"
        } else {
            Write-Warning-Test "Nenhum backup recente encontrado"
        }
        
        # Verificar tarefa agendada de backup
        $backupTask = Get-ScheduledTask -TaskName "JustDanceHub-DailyBackup" -ErrorAction SilentlyContinue
        if ($backupTask) {
            Write-Success "Tarefa de backup automático configurada"
        } else {
            Write-Warning-Test "Tarefa de backup automático não encontrada"
        }
    } else {
        Write-Error-Test "Diretório de backup não existe"
    }
}

# Função para gerar relatório final
function New-ValidationReport {
    Write-Host ""
    Write-Host "=== RELATÓRIO DE VALIDAÇÃO ===" -ForegroundColor $Blue
    Write-Host ""
    
    $successRate = [math]::Round(($SUCCESS_COUNT / $TOTAL_TESTS) * 100, 2)
    
    Write-Host "📊 Estatísticas:" -ForegroundColor $Yellow
    Write-Host "   • Total de testes: $TOTAL_TESTS"
    Write-Host "   • Sucessos: $SUCCESS_COUNT"
    Write-Host "   • Erros: $($ERRORS.Count)"
    Write-Host "   • Avisos: $($WARNINGS.Count)"
    Write-Host "   • Taxa de sucesso: $successRate%"
    Write-Host ""
    
    if ($ERRORS.Count -gt 0) {
        Write-Host "❌ ERROS ENCONTRADOS:" -ForegroundColor $Red
        foreach ($error in $ERRORS) {
            Write-Host "   • $error" -ForegroundColor $Red
        }
        Write-Host ""
    }
    
    if ($WARNINGS.Count -gt 0) {
        Write-Host "⚠️  AVISOS:" -ForegroundColor $Yellow
        foreach ($warning in $WARNINGS) {
            Write-Host "   • $warning" -ForegroundColor $Yellow
        }
        Write-Host ""
    }
    
    # Status geral
    if ($ERRORS.Count -eq 0) {
        Write-Host "🎉 VALIDAÇÃO CONCLUÍDA COM SUCESSO!" -ForegroundColor $Green
        Write-Host "   A aplicação está pronta para produção." -ForegroundColor $Green
    } elseif ($ERRORS.Count -le 2) {
        Write-Host "⚠️  VALIDAÇÃO CONCLUÍDA COM PROBLEMAS MENORES" -ForegroundColor $Yellow
        Write-Host "   Corrija os erros antes de usar em produção." -ForegroundColor $Yellow
    } else {
        Write-Host "❌ VALIDAÇÃO FALHOU" -ForegroundColor $Red
        Write-Host "   Muitos problemas encontrados. Revise a configuração." -ForegroundColor $Red
    }
    
    Write-Host ""
    Write-Host "📋 Log detalhado salvo em: $VALIDATION_LOG" -ForegroundColor $Blue
    
    # Salvar resumo no log
    Write-Log "=== RESUMO DA VALIDAÇÃO ===" "SUMMARY"
    Write-Log "Total de testes: $TOTAL_TESTS" "SUMMARY"
    Write-Log "Sucessos: $SUCCESS_COUNT" "SUMMARY"
    Write-Log "Erros: $($ERRORS.Count)" "SUMMARY"
    Write-Log "Avisos: $($WARNINGS.Count)" "SUMMARY"
    Write-Log "Taxa de sucesso: $successRate%" "SUMMARY"
}

# Função principal
function Main {
    if ($Help) {
        Show-Help
    }
    
    Write-Host "🚀 Just Dance Event Hub - Validação de Produção" -ForegroundColor $Blue
    Write-Host "" 
    Write-Host "📅 Data: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor $Blue
    Write-Host "🌐 Domínio: $Domain" -ForegroundColor $Blue
    Write-Host "🔌 Porta: $Port" -ForegroundColor $Blue
    Write-Host ""
    
    # Criar diretório de logs se não existir
    New-Item -ItemType Directory -Force -Path (Split-Path $VALIDATION_LOG -Parent) | Out-Null
    
    Write-Log "Iniciando validação de produção" "START"
    
    # Executar todos os testes
    Test-FileStructure
    Test-Dependencies
    Test-EnvironmentConfig
    Test-Database
    Test-PM2Processes
    Test-HTTPConnectivity
    Test-WebSocket
    Test-Security
    Test-Logs
    Test-Backup
    
    # Gerar relatório final
    New-ValidationReport
    
    Write-Log "Validation completed" "END"
}

# Executar função principal
Main