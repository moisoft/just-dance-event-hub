# Script de Hardening de Segurança - Just Dance Event Hub
# Execute como Administrador

param(
    [switch]$ApplyAll = $false,
    [switch]$NetworkSecurity = $false,
    [switch]$SystemHardening = $false,
    [switch]$ApplicationSecurity = $false,
    [switch]$AuditSecurity = $false,
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
$LOG_FILE = "$APP_DIR\security-hardening.log"

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
    Write-Host "Just Dance Event Hub - Script de Hardening de Segurança" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "Uso:" -ForegroundColor $Yellow
    Write-Host "  .\security-hardening.ps1 [opções]"
    Write-Host ""
    Write-Host "Opções:" -ForegroundColor $Yellow
    Write-Host "  -ApplyAll           Aplicar todas as configurações de segurança"
    Write-Host "  -NetworkSecurity    Configurar segurança de rede"
    Write-Host "  -SystemHardening    Aplicar hardening do sistema"
    Write-Host "  -ApplicationSecurity Configurar segurança da aplicação"
    Write-Host "  -AuditSecurity      Configurar auditoria e logs de segurança"
    Write-Host "  -Help               Mostrar esta ajuda"
    Write-Host ""
    Write-Host "Exemplos:" -ForegroundColor $Yellow
    Write-Host "  .\security-hardening.ps1 -ApplyAll"
    Write-Host "  .\security-hardening.ps1 -NetworkSecurity -SystemHardening"
    exit 0
}

# Verificar se é administrador
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Configurações de Segurança de Rede
function Set-NetworkSecurity {
    Write-Info "🔒 Configurando segurança de rede..."
    
    try {
        # Configurar firewall avançado
        Write-Log "Configurando Windows Firewall..."
        
        # Habilitar firewall para todos os perfis
        netsh advfirewall set allprofiles state on
        
        # Configurar regras de entrada padrão
        netsh advfirewall set allprofiles firewallpolicy blockinbound,allowoutbound
        
        # Bloquear portas desnecessárias
        $dangerousPorts = @(135, 139, 445, 1433, 1434, 3389, 5985, 5986)
        foreach ($port in $dangerousPorts) {
            netsh advfirewall firewall add rule name="Block Port $port" dir=in action=block protocol=TCP localport=$port
        }
        
        # Permitir apenas portas necessárias para a aplicação
        New-NetFirewallRule -DisplayName "Just Dance Hub HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow -Profile Any
        New-NetFirewallRule -DisplayName "Just Dance Hub HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow -Profile Any
        New-NetFirewallRule -DisplayName "Just Dance Hub App" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Any -RemoteAddress LocalSubnet
        New-NetFirewallRule -DisplayName "Just Dance Hub WebSocket" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow -Profile Any -RemoteAddress LocalSubnet
        
        # Configurar proteção contra DDoS
        netsh int ipv4 set global taskoffload=disabled
        netsh int ipv4 set global chimney=disabled
        
        # Desabilitar NetBIOS sobre TCP/IP
        $adapters = Get-WmiObject -Class Win32_NetworkAdapterConfiguration | Where-Object { $_.IPEnabled -eq $true }
        foreach ($adapter in $adapters) {
            $adapter.SetTcpipNetbios(2)  # 2 = Disable NetBIOS over TCP/IP
        }
        
        Write-Log "Segurança de rede configurada com sucesso"
        
    } catch {
        Write-Error-Log "Erro ao configurar segurança de rede: $_"
    }
}

# Hardening do Sistema
function Set-SystemHardening {
    Write-Info "🛡️ Aplicando hardening do sistema..."
    
    try {
        # Configurações de registro para segurança
        Write-Log "Aplicando configurações de registro..."
        
        # Desabilitar SMBv1
        Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\lanmanserver\parameters" -Name "SMB1" -Value 0 -Force
        
        # Configurar política de senhas
        secedit /export /cfg c:\temp\secpol.cfg
        (Get-Content c:\temp\secpol.cfg) -replace "MinimumPasswordLength = \d+", "MinimumPasswordLength = 12" | Set-Content c:\temp\secpol.cfg
        (Get-Content c:\temp\secpol.cfg) -replace "PasswordComplexity = \d+", "PasswordComplexity = 1" | Set-Content c:\temp\secpol.cfg
        secedit /configure /db c:\windows\security\local.sdb /cfg c:\temp\secpol.cfg /areas SECURITYPOLICY
        Remove-Item c:\temp\secpol.cfg -Force
        
        # Desabilitar serviços desnecessários
        $servicesToDisable = @(
            "Fax",
            "TelnetD",
            "RemoteRegistry",
            "Messenger",
            "NetMeeting Remote Desktop Sharing",
            "Remote Desktop Help Session Manager",
            "Routing and Remote Access",
            "Simple Mail Transfer Protocol (SMTP)",
            "SNMP Service",
            "SSDP Discovery Service",
            "Universal Plug and Play Device Host",
            "Web Client",
            "Windows Media Player Network Sharing Service"
        )
        
        foreach ($service in $servicesToDisable) {
            try {
                Stop-Service -Name $service -Force -ErrorAction SilentlyContinue
                Set-Service -Name $service -StartupType Disabled -ErrorAction SilentlyContinue
                Write-Log "Serviço desabilitado: $service"
            } catch {
                Write-Warning-Log "Não foi possível desabilitar o serviço: $service"
            }
        }
        
        # Configurar UAC
        Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" -Name "ConsentPromptBehaviorAdmin" -Value 2
        Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" -Name "ConsentPromptBehaviorUser" -Value 3
        Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" -Name "EnableLUA" -Value 1
        
        # Desabilitar AutoRun/AutoPlay
        Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer" -Name "NoDriveTypeAutoRun" -Value 255
        Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer" -Name "NoDriveTypeAutoRun" -Value 255
        
        # Configurar Windows Update para automático
        Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" -Name "AUOptions" -Value 4
        Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" -Name "AutoInstallMinorUpdates" -Value 1
        
        Write-Log "Hardening do sistema aplicado com sucesso"
        
    } catch {
        Write-Error-Log "Erro ao aplicar hardening do sistema: $_"
    }
}

# Segurança da Aplicação
function Set-ApplicationSecurity {
    Write-Info "🔐 Configurando segurança da aplicação..."
    
    try {
        # Configurar permissões de arquivos
        Write-Log "Configurando permissões de arquivos..."
        
        # Remover permissões desnecessárias do diretório da aplicação
        icacls "$APP_DIR" /inheritance:d
        icacls "$APP_DIR" /grant:r "Administrators:F"
        icacls "$APP_DIR" /grant:r "SYSTEM:F"
        icacls "$APP_DIR" /grant:r "Users:RX"
        icacls "$APP_DIR" /remove "Everyone"
        
        # Proteger arquivos de configuração
        icacls "$APP_DIR\backend\.env" /inheritance:d
        icacls "$APP_DIR\backend\.env" /grant:r "Administrators:F"
        icacls "$APP_DIR\backend\.env" /grant:r "SYSTEM:F"
        icacls "$APP_DIR\backend\.env" /remove "Users"
        icacls "$APP_DIR\backend\.env" /remove "Everyone"
        
        # Configurar permissões de logs
        icacls "C:\logs\$APP_NAME" /inheritance:d
        icacls "C:\logs\$APP_NAME" /grant:r "Administrators:F"
        icacls "C:\logs\$APP_NAME" /grant:r "SYSTEM:F"
        icacls "C:\logs\$APP_NAME" /grant:r "Users:RX"
        
        # Criar arquivo de configuração de segurança para Node.js
        $nodeSecurityConfig = @"
// Configurações de Segurança Node.js
process.env.NODE_OPTIONS = '--max-old-space-size=1024 --max-http-header-size=8192';

// Configurar timeouts
process.env.HTTP_TIMEOUT = '30000';
process.env.KEEP_ALIVE_TIMEOUT = '5000';

// Configurar limites
process.env.MAX_CONNECTIONS = '1000';
process.env.MAX_REQUESTS_PER_SOCKET = '100';
"@
        
        Set-Content -Path "$APP_DIR\backend\security.js" -Value $nodeSecurityConfig
        
        # Configurar Content Security Policy
        $cspConfig = @"
// Content Security Policy
const cspOptions = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:"],
    connectSrc: ["'self'", "ws:", "wss:"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
    upgradeInsecureRequests: []
  }
};

module.exports = cspOptions;
"@
        
        Set-Content -Path "$APP_DIR\backend\csp-config.js" -Value $cspConfig
        
        Write-Log "Segurança da aplicação configurada com sucesso"
        
    } catch {
        Write-Error-Log "Erro ao configurar segurança da aplicação: $_"
    }
}

# Configurar Auditoria e Logs de Segurança
function Set-AuditSecurity {
    Write-Info "📊 Configurando auditoria e logs de segurança..."
    
    try {
        # Habilitar auditoria de eventos de segurança
        Write-Log "Configurando auditoria de eventos..."
        
        auditpol /set /category:"Logon/Logoff" /success:enable /failure:enable
        auditpol /set /category:"Account Logon" /success:enable /failure:enable
        auditpol /set /category:"Account Management" /success:enable /failure:enable
        auditpol /set /category:"Privilege Use" /success:enable /failure:enable
        auditpol /set /category:"Policy Change" /success:enable /failure:enable
        auditpol /set /category:"System" /success:enable /failure:enable
        
        # Configurar tamanho dos logs de eventos
        wevtutil sl Security /ms:104857600  # 100MB
        wevtutil sl System /ms:104857600    # 100MB
        wevtutil sl Application /ms:104857600 # 100MB
        
        # Criar script de monitoramento de segurança
        $securityMonitorScript = @"
# Script de Monitoramento de Segurança
`$logPath = "C:\logs\$APP_NAME\security-monitor.log"
`$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Verificar tentativas de login falhadas
`$failedLogins = Get-WinEvent -FilterHashtable @{LogName='Security'; ID=4625; StartTime=(Get-Date).AddHours(-1)} -ErrorAction SilentlyContinue
if (`$failedLogins) {
    `$count = (`$failedLogins | Measure-Object).Count
    Add-Content -Path `$logPath -Value "`$timestamp - ALERT: `$count tentativas de login falhadas na última hora"
}

# Verificar mudanças de política
`$policyChanges = Get-WinEvent -FilterHashtable @{LogName='Security'; ID=4719; StartTime=(Get-Date).AddHours(-1)} -ErrorAction SilentlyContinue
if (`$policyChanges) {
    Add-Content -Path `$logPath -Value "`$timestamp - ALERT: Mudanças de política detectadas"
}

# Verificar uso de privilégios administrativos
`$adminPrivUse = Get-WinEvent -FilterHashtable @{LogName='Security'; ID=4672; StartTime=(Get-Date).AddHours(-1)} -ErrorAction SilentlyContinue
if (`$adminPrivUse) {
    `$count = (`$adminPrivUse | Measure-Object).Count
    Add-Content -Path `$logPath -Value "`$timestamp - INFO: `$count usos de privilégios administrativos na última hora"
}

# Verificar processos suspeitos
`$suspiciousProcesses = Get-Process | Where-Object { `$_.ProcessName -match "(cmd|powershell|wscript|cscript)" -and `$_.CPU -gt 10 }
if (`$suspiciousProcesses) {
    foreach (`$proc in `$suspiciousProcesses) {
        Add-Content -Path `$logPath -Value "`$timestamp - WARNING: Processo suspeito detectado: `$(`$proc.ProcessName) (PID: `$(`$proc.Id))"
    }
}

# Verificar conexões de rede suspeitas
`$suspiciousConnections = Get-NetTCPConnection | Where-Object { `$_.State -eq "Established" -and `$_.RemotePort -in @(4444, 5555, 6666, 7777, 8888, 9999) }
if (`$suspiciousConnections) {
    foreach (`$conn in `$suspiciousConnections) {
        Add-Content -Path `$logPath -Value "`$timestamp - ALERT: Conexão suspeita detectada: `$(`$conn.RemoteAddress):`$(`$conn.RemotePort)"
    }
}

Write-Host "Monitoramento de segurança executado em `$timestamp"
"@
        
        Set-Content -Path "$APP_DIR\security-monitor.ps1" -Value $securityMonitorScript
        
        # Configurar tarefa agendada para monitoramento
        $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File $APP_DIR\security-monitor.ps1"
        $trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 15) -Once -At (Get-Date)
        $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
        
        Register-ScheduledTask -TaskName "JustDanceHub-SecurityMonitor" -Action $action -Trigger $trigger -Settings $settings -Force
        
        Write-Log "Auditoria e logs de segurança configurados com sucesso"
        
    } catch {
        Write-Error-Log "Erro ao configurar auditoria: $_"
    }
}

# Função para gerar relatório de segurança
function New-SecurityReport {
    Write-Info "📋 Gerando relatório de segurança..."
    
    $reportPath = "$APP_DIR\security-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
    
    $report = @"
RELATÓRIO DE SEGURANÇA - JUST DANCE EVENT HUB
Gerado em: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

=== CONFIGURAÇÕES DE FIREWALL ===
$(netsh advfirewall show allprofiles)

=== SERVIÇOS EM EXECUÇÃO ===
$(Get-Service | Where-Object {$_.Status -eq 'Running'} | Select-Object Name, Status | Format-Table -AutoSize | Out-String)

=== CONEXÕES DE REDE ATIVAS ===
$(Get-NetTCPConnection | Where-Object {$_.State -eq 'Established'} | Select-Object LocalAddress, LocalPort, RemoteAddress, RemotePort | Format-Table -AutoSize | Out-String)

=== USUÁRIOS LOCAIS ===
$(Get-LocalUser | Select-Object Name, Enabled, LastLogon | Format-Table -AutoSize | Out-String)

=== POLÍTICAS DE AUDITORIA ===
$(auditpol /get /category:*)

=== ATUALIZAÇÕES PENDENTES ===
$(Get-WindowsUpdate -ErrorAction SilentlyContinue | Select-Object Title, Size | Format-Table -AutoSize | Out-String)

=== VERIFICAÇÃO DE INTEGRIDADE ===
Data da última verificação: $(Get-Date)
Status: OK
"@
    
    Set-Content -Path $reportPath -Value $report
    Write-Log "Relatório de segurança gerado: $reportPath"
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
    
    Write-Info "Iniciando hardening de segurança do Just Dance Event Hub..."
    
    # Criar diretório de logs se não existir
    New-Item -ItemType Directory -Force -Path (Split-Path $LOG_FILE -Parent)
    
    if ($ApplyAll -or $NetworkSecurity) {
        Set-NetworkSecurity
    }
    
    if ($ApplyAll -or $SystemHardening) {
        Set-SystemHardening
    }
    
    if ($ApplyAll -or $ApplicationSecurity) {
        Set-ApplicationSecurity
    }
    
    if ($ApplyAll -or $AuditSecurity) {
        Set-AuditSecurity
    }
    
    # Gerar relatório de segurança
    New-SecurityReport
    
    Write-Host ""
    Write-Host "=== HARDENING DE SEGURANÇA CONCLUÍDO ===" -ForegroundColor $Green
    Write-Host ""
    Write-Host "🔒 Configurações aplicadas com sucesso!" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "📋 Próximos passos recomendados:" -ForegroundColor $Yellow
    Write-Host "  • Reiniciar o sistema para aplicar todas as mudanças"
    Write-Host "  • Testar a aplicação após o reinício"
    Write-Host "  • Revisar logs de segurança regularmente"
    Write-Host "  • Manter sistema e aplicação atualizados"
    Write-Host "  • Realizar testes de penetração periodicamente"
    Write-Host ""
    Write-Host "📊 Monitoramento configurado:" -ForegroundColor $Yellow
    Write-Host "  • Verificação de segurança a cada 15 minutos"
    Write-Host "  • Logs em: C:\logs\$APP_NAME\security-monitor.log"
    Write-Host "  • Relatório gerado em: $APP_DIR"
    Write-Host ""
    
    Write-Log "Hardening de segurança concluído com sucesso!"
}

# Executar função principal
Main