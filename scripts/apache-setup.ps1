# Script de Configuração do Apache para Just Dance Event Hub
# Substitui o Nginx como servidor web

param(
    [string]$Domain = "localhost",
    [string]$Email = "admin@seudominio.com",
    [switch]$InstallApache = $false,
    [switch]$ConfigureSSL = $false,
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
$APACHE_DIR = "C:\Apache24"
$APACHE_CONF = "$APACHE_DIR\conf\httpd.conf"
$SSL_DIR = "C:\ssl\$Domain"
$LOG_DIR = "C:\logs\$APP_NAME"

# Funções de logging
function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor $Blue
}

function Write-Step {
    param([string]$Message)
    Write-Host "🔧 $Message" -ForegroundColor $Blue
}

# Função de ajuda
function Show-Help {
    Write-Host "Apache Setup - Just Dance Event Hub" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "Uso:" -ForegroundColor $Yellow
    Write-Host "  .\apache-setup.ps1 [opções]"
    Write-Host ""
    Write-Host "Opções:" -ForegroundColor $Yellow
    Write-Host "  -Domain         Domínio para configurar (padrão: localhost)"
    Write-Host "  -Email          Email para certificados SSL"
    Write-Host "  -InstallApache  Instalar Apache automaticamente"
    Write-Host "  -ConfigureSSL   Configurar SSL com Let's Encrypt"
    Write-Host "  -Help           Mostrar esta ajuda"
    Write-Host ""
    Write-Host "Exemplos:" -ForegroundColor $Yellow
    Write-Host "  .\apache-setup.ps1 -InstallApache"
    Write-Host "  .\apache-setup.ps1 -Domain meusite.com -Email admin@meusite.com -ConfigureSSL"
    exit 0
}

# Verificar se está executando como administrador
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Função para baixar arquivos
function Download-File {
    param(
        [string]$Url,
        [string]$OutputPath
    )
    
    try {
        Write-Info "Baixando: $Url"
        Invoke-WebRequest -Uri $Url -OutFile $OutputPath -UseBasicParsing
        Write-Success "Download concluído: $OutputPath"
        return $true
    } catch {
        Write-Error-Custom "Erro no download: $_"
        return $false
    }
}

# Instalar Apache
function Install-Apache {
    Write-Step "Instalando Apache HTTP Server"
    
    if (Test-Path $APACHE_DIR) {
        Write-Warning-Custom "Apache já está instalado em $APACHE_DIR"
        return
    }
    
    # URLs para download do Apache
    $apacheUrl = "https://www.apachelounge.com/download/VS17/binaries/httpd-2.4.58-240401-win64-VS17.zip"
    $vcRedistUrl = "https://aka.ms/vs/17/release/vc_redist.x64.exe"
    
    # Criar diretório temporário
    $tempDir = "C:\temp\apache-install"
    New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
    
    try {
        # Baixar Visual C++ Redistributable
        Write-Info "Baixando Visual C++ Redistributable..."
        $vcRedistPath = "$tempDir\vc_redist.x64.exe"
        if (Download-File $vcRedistUrl $vcRedistPath) {
            Write-Info "Instalando Visual C++ Redistributable..."
            Start-Process -FilePath $vcRedistPath -ArgumentList "/quiet" -Wait
            Write-Success "Visual C++ Redistributable instalado"
        }
        
        # Baixar Apache
        Write-Info "Baixando Apache HTTP Server..."
        $apacheZip = "$tempDir\apache.zip"
        if (Download-File $apacheUrl $apacheZip) {
            # Extrair Apache
            Write-Info "Extraindo Apache..."
            Expand-Archive -Path $apacheZip -DestinationPath $tempDir -Force
            
            # Mover para diretório final
            $extractedDir = Get-ChildItem -Path $tempDir -Directory | Where-Object { $_.Name -like "*Apache24*" } | Select-Object -First 1
            if ($extractedDir) {
                Move-Item -Path $extractedDir.FullName -Destination "C:\" -Force
                Write-Success "Apache instalado em $APACHE_DIR"
            } else {
                Write-Error-Custom "Não foi possível encontrar o diretório extraído do Apache"
                return
            }
        }
        
    } catch {
        Write-Error-Custom "Erro durante a instalação do Apache: $_"
        return
    } finally {
        # Limpar arquivos temporários
        if (Test-Path $tempDir) {
            Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    
    # Instalar como serviço
    Write-Info "Instalando Apache como serviço do Windows..."
    try {
        $apacheExe = "$APACHE_DIR\bin\httpd.exe"
        & $apacheExe -k install -n "Apache2.4"
        Write-Success "Apache instalado como serviço"
        
        # Configurar serviço para iniciar automaticamente
        Set-Service -Name "Apache2.4" -StartupType Automatic
        Write-Success "Serviço Apache configurado para iniciar automaticamente"
        
    } catch {
        Write-Error-Custom "Erro ao instalar serviço Apache: $_"
    }
}

# Configurar Apache
function Configure-Apache {
    Write-Step "Configurando Apache"
    
    if (-not (Test-Path $APACHE_DIR)) {
        Write-Error-Custom "Apache não encontrado. Execute com -InstallApache primeiro."
        return
    }
    
    # Criar diretórios necessários
    $directories = @(
        $LOG_DIR,
        "$LOG_DIR\dos",
        "$LOG_DIR\modsec",
        "C:\temp\modsec",
        $SSL_DIR
    )
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Force -Path $dir | Out-Null
            Write-Success "Diretório criado: $dir"
        }
    }
    
    # Backup da configuração original
    if (Test-Path $APACHE_CONF) {
        $backupConf = "$APACHE_CONF.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item -Path $APACHE_CONF -Destination $backupConf
        Write-Success "Backup da configuração criado: $backupConf"
    }
    
    # Copiar nossa configuração
    $ourConfig = "$APP_DIR\apache-ssl.conf"
    if (Test-Path $ourConfig) {
        # Personalizar configuração com domínio
        $configContent = Get-Content $ourConfig -Raw
        $configContent = $configContent -replace "seudominio\.com", $Domain
        $configContent = $configContent -replace "admin@seudominio\.com", $Email
        
        # Salvar configuração personalizada
        Set-Content -Path $APACHE_CONF -Value $configContent
        Write-Success "Configuração Apache aplicada"
    } else {
        Write-Error-Custom "Arquivo de configuração não encontrado: $ourConfig"
        return
    }
    
    # Verificar configuração
    try {
        $apacheExe = "$APACHE_DIR\bin\httpd.exe"
        $testResult = & $apacheExe -t 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Configuração Apache válida"
        } else {
            Write-Error-Custom "Erro na configuração Apache: $testResult"
            return
        }
    } catch {
        Write-Error-Custom "Erro ao testar configuração: $_"
    }
}

# Instalar módulos adicionais
function Install-ApacheModules {
    Write-Step "Instalando módulos adicionais do Apache"
    
    # URLs dos módulos
    $modules = @{
        "mod_security2" = "https://www.apachelounge.com/download/VS17/modules/mod_security2-2.9.7-win64-VS17.zip"
        "mod_evasive" = "https://www.apachelounge.com/download/VS17/modules/mod_evasive24-1.10.1-win64-VS17.zip"
    }
    
    $modulesDir = "$APACHE_DIR\modules"
    $tempDir = "C:\temp\apache-modules"
    New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
    
    foreach ($module in $modules.GetEnumerator()) {
        Write-Info "Instalando $($module.Key)..."
        
        $moduleZip = "$tempDir\$($module.Key).zip"
        if (Download-File $module.Value $moduleZip) {
            try {
                Expand-Archive -Path $moduleZip -DestinationPath $tempDir -Force
                
                # Encontrar arquivo .so e copiar
                $soFile = Get-ChildItem -Path $tempDir -Filter "*.so" -Recurse | Select-Object -First 1
                if ($soFile) {
                    Copy-Item -Path $soFile.FullName -Destination $modulesDir -Force
                    Write-Success "$($module.Key) instalado"
                } else {
                    Write-Warning-Custom "Arquivo .so não encontrado para $($module.Key)"
                }
            } catch {
                Write-Warning-Custom "Erro ao instalar $($module.Key): $_"
            }
        }
    }
    
    # Limpar arquivos temporários
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}

# Configurar SSL com Let's Encrypt
function Configure-SSL {
    Write-Step "Configurando SSL com Let's Encrypt"
    
    if ($Domain -eq "localhost") {
        Write-Warning-Custom "SSL não pode ser configurado para localhost. Use um domínio real."
        return
    }
    
    # Instalar Certbot
    Write-Info "Instalando Certbot..."
    try {
        # Verificar se Certbot já está instalado
        $certbot = Get-Command certbot -ErrorAction SilentlyContinue
        if (-not $certbot) {
            # Baixar e instalar Certbot
            $certbotUrl = "https://dl.eff.org/certbot-beta-installer-win32.exe"
            $certbotInstaller = "C:\temp\certbot-installer.exe"
            
            if (Download-File $certbotUrl $certbotInstaller) {
                Start-Process -FilePath $certbotInstaller -ArgumentList "/S" -Wait
                Write-Success "Certbot instalado"
                
                # Adicionar ao PATH
                $env:PATH += ";C:\Program Files (x86)\Certbot\bin"
            }
        } else {
            Write-Success "Certbot já está instalado"
        }
        
        # Obter certificado
        Write-Info "Obtendo certificado SSL para $Domain..."
        $webroot = "$APP_DIR\frontend\build"
        
        $certbotArgs = @(
            "certonly",
            "--webroot",
            "-w", $webroot,
            "-d", $Domain,
            "--email", $Email,
            "--agree-tos",
            "--non-interactive"
        )
        
        & certbot @certbotArgs
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Certificado SSL obtido com sucesso"
            
            # Copiar certificados para nosso diretório
            $letsEncryptDir = "C:\Certbot\live\$Domain"
            if (Test-Path $letsEncryptDir) {
                Copy-Item -Path "$letsEncryptDir\*" -Destination $SSL_DIR -Force
                Write-Success "Certificados copiados para $SSL_DIR"
            }
            
            # Configurar renovação automática
            $taskAction = New-ScheduledTaskAction -Execute "certbot" -Argument "renew --quiet"
            $taskTrigger = New-ScheduledTaskTrigger -Daily -At "02:00"
            $taskSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
            
            Register-ScheduledTask -TaskName "CertbotRenewal" -Action $taskAction -Trigger $taskTrigger -Settings $taskSettings -User "SYSTEM" -Force
            Write-Success "Renovação automática de certificados configurada"
            
        } else {
            Write-Error-Custom "Falha ao obter certificado SSL"
        }
        
    } catch {
        Write-Error-Custom "Erro ao configurar SSL: $_"
    }
}

# Configurar Firewall
function Configure-Firewall {
    Write-Step "Configurando Windows Firewall para Apache"
    
    $firewallRules = @(
        @{ Name = "Apache HTTP"; Port = 80; Protocol = "TCP" },
        @{ Name = "Apache HTTPS"; Port = 443; Protocol = "TCP" }
    )
    
    foreach ($rule in $firewallRules) {
        try {
            # Remover regra existente se houver
            Remove-NetFirewallRule -DisplayName $rule.Name -ErrorAction SilentlyContinue
            
            # Criar nova regra
            New-NetFirewallRule -DisplayName $rule.Name -Direction Inbound -Protocol $rule.Protocol -LocalPort $rule.Port -Action Allow | Out-Null
            Write-Success "Regra de firewall criada: $($rule.Name) (porta $($rule.Port))"
        } catch {
            Write-Warning-Custom "Erro ao criar regra de firewall $($rule.Name): $_"
        }
    }
}

# Iniciar Apache
function Start-Apache {
    Write-Step "Iniciando Apache"
    
    try {
        # Parar serviço se estiver rodando
        $service = Get-Service -Name "Apache2.4" -ErrorAction SilentlyContinue
        if ($service -and $service.Status -eq "Running") {
            Stop-Service -Name "Apache2.4" -Force
            Write-Info "Serviço Apache parado"
        }
        
        # Iniciar serviço
        Start-Service -Name "Apache2.4"
        Write-Success "Serviço Apache iniciado"
        
        # Verificar se está rodando
        Start-Sleep -Seconds 3
        $service = Get-Service -Name "Apache2.4"
        if ($service.Status -eq "Running") {
            Write-Success "Apache está rodando corretamente"
            
            # Testar conectividade
            try {
                $response = Invoke-WebRequest -Uri "http://localhost" -TimeoutSec 10 -UseBasicParsing
                if ($response.StatusCode -eq 200) {
                    Write-Success "Apache respondendo em http://localhost"
                }
            } catch {
                Write-Warning-Custom "Apache iniciado mas não está respondendo: $_"
            }
        } else {
            Write-Error-Custom "Falha ao iniciar Apache"
        }
        
    } catch {
        Write-Error-Custom "Erro ao iniciar Apache: $_"
    }
}

# Função para mostrar status
function Show-Status {
    Write-Host ""
    Write-Host "=== STATUS DO APACHE ===" -ForegroundColor $Blue
    Write-Host ""
    
    # Status do serviço
    $service = Get-Service -Name "Apache2.4" -ErrorAction SilentlyContinue
    if ($service) {
        $statusColor = if ($service.Status -eq "Running") { $Green } else { $Red }
        Write-Host "🔧 Serviço Apache: $($service.Status)" -ForegroundColor $statusColor
    } else {
        Write-Host "❌ Serviço Apache não encontrado" -ForegroundColor $Red
    }
    
    # Verificar portas
    $ports = @(80, 443)
    foreach ($port in $ports) {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
        $portColor = if ($connection.TcpTestSucceeded) { $Green } else { $Red }
        $portStatus = if ($connection.TcpTestSucceeded) { "Aberta" } else { "Fechada" }
        Write-Host "🌐 Porta $port : $portStatus" -ForegroundColor $portColor
    }
    
    # Verificar arquivos de configuração
    $configExists = Test-Path $APACHE_CONF
    $configColor = if ($configExists) { $Green } else { $Red }
    $configStatus = if ($configExists) { "Existe" } else { "Não encontrado" }
    Write-Host "📄 Configuração: $configStatus" -ForegroundColor $configColor
    
    # Verificar SSL
    $sslExists = Test-Path "$SSL_DIR\cert.pem"
    $sslColor = if ($sslExists) { $Green } else { $Yellow }
    $sslStatus = if ($sslExists) { "Configurado" } else { "Não configurado" }
    Write-Host "🔒 SSL: $sslStatus" -ForegroundColor $sslColor
    
    Write-Host ""
    Write-Host "📋 Logs: $LOG_DIR" -ForegroundColor $Blue
    Write-Host "⚙️  Configuração: $APACHE_CONF" -ForegroundColor $Blue
    Write-Host "🔑 SSL: $SSL_DIR" -ForegroundColor $Blue
    Write-Host ""
}

# Função principal
function Main {
    if ($Help) {
        Show-Help
    }
    
    # Verificar privilégios de administrador
    if (-not (Test-Administrator)) {
        Write-Error-Custom "Este script deve ser executado como Administrador"
        exit 1
    }
    
    Write-Host "🚀 Apache Setup - Just Dance Event Hub" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "📅 Data: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor $Blue
    Write-Host "🌐 Domínio: $Domain" -ForegroundColor $Blue
    Write-Host "📧 Email: $Email" -ForegroundColor $Blue
    Write-Host ""
    
    # Executar ações baseadas nos parâmetros
    if ($InstallApache) {
        Install-Apache
        Install-ApacheModules
    }
    
    Configure-Apache
    Configure-Firewall
    
    if ($ConfigureSSL) {
        Configure-SSL
    }
    
    Start-Apache
    Show-Status
    
    Write-Host ""
    Write-Host "🎉 Configuração do Apache concluída!" -ForegroundColor $Green
    Write-Host ""
    Write-Host "📖 Próximos passos:" -ForegroundColor $Yellow
    Write-Host "   1. Acesse http://localhost para testar"
    if ($Domain -ne "localhost") {
        Write-Host "   2. Configure DNS para apontar $Domain para este servidor"
        if ($ConfigureSSL) {
            Write-Host "   3. Acesse https://$Domain"
        } else {
            Write-Host "   3. Execute novamente com -ConfigureSSL para HTTPS"
        }
    }
    Write-Host "   4. Monitore logs em $LOG_DIR"
    Write-Host ""
}

# Executar função principal
Main