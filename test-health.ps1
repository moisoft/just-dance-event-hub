# Script simples para verificar se a aplicacao esta funcionando
param(
    [string]$Domain = "localhost",
    [int]$ApiPort = 5000,
    [int]$FrontendPort = 3000
)

# Cores para output
$Red = "\033[31m"
$Green = "\033[32m"
$Yellow = "\033[33m"
$Blue = "\033[34m"
$Reset = "\033[0m"

function Write-ColorOutput($ForegroundColor, $Message) {
    switch ($ForegroundColor) {
        "Red" { Write-Host "${Red}${Message}${Reset}" }
        "Green" { Write-Host "${Green}${Message}${Reset}" }
        "Yellow" { Write-Host "${Yellow}${Message}${Reset}" }
        "Blue" { Write-Host "${Blue}${Message}${Reset}" }
        default { Write-Host $Message }
    }
}

function Log($message) { Write-ColorOutput "Blue" "[INFO] $message" }
function Warn($message) { Write-ColorOutput "Yellow" "[WARN] $message" }
function Error($message) { Write-ColorOutput "Red" "[ERROR] $message" }
function Success($message) { Write-ColorOutput "Green" "[SUCCESS] $message" }

Log "Verificando saude da aplicacao..."

# Construir URLs
$apiUrl = "http://${Domain}:${ApiPort}"
$frontendUrl = "http://${Domain}:${FrontendPort}"
$apiHealthUrl = "${apiUrl}/api/health"

Log "Testando API em: $apiHealthUrl"
try {
    $apiResponse = Invoke-RestMethod -Uri $apiHealthUrl -Method GET -TimeoutSec 10
    if ($apiResponse) {
        Success "API esta respondendo corretamente"
        Log "Resposta da API: $($apiResponse | ConvertTo-Json -Compress)"
    }
} catch {
    Error "API nao esta respondendo: $($_.Exception.Message)"
}

Log "Testando Frontend em: $frontendUrl"
try {
    $frontendResponse = Invoke-WebRequest -Uri $frontendUrl -Method GET -TimeoutSec 10
    if ($frontendResponse.StatusCode -eq 200) {
        Success "Frontend esta respondendo corretamente"
        Log "Status Code: $($frontendResponse.StatusCode)"
    }
} catch {
    Error "Frontend nao esta respondendo: $($_.Exception.Message)"
}

# Verificar arquivos importantes
Log "Verificando arquivos de configuracao..."

$backendEnv = "backend\.env"
if (Test-Path $backendEnv) {
    Success "Arquivo .env do backend encontrado"
} else {
    Warn "Arquivo .env do backend nao encontrado"
}

$frontendEnv = "frontend\.env"
if (Test-Path $frontendEnv) {
    Success "Arquivo .env do frontend encontrado"
} else {
    Warn "Arquivo .env do frontend nao encontrado"
}

Log "Verificacao de saude concluida!"
Log "URLs de acesso:"
Log "- Frontend: $frontendUrl"
Log "- API: $apiUrl"
Log "- Health Check: $apiHealthUrl"