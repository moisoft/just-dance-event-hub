# Script simples para testar a aplicacao localmente
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

# Verificar se Node.js esta instalado
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Error "Node.js nao encontrado. Por favor, instale o Node.js primeiro."
    exit 1
}

# Verificar se npm esta instalado
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Error "npm nao encontrado. Por favor, instale o npm primeiro."
    exit 1
}

Log "Iniciando teste local da aplicacao..."

# Instalar dependencias do backend
Log "Instalando dependencias do backend..."
Set-Location "backend"
npm install
if ($LASTEXITCODE -ne 0) {
    Error "Falha ao instalar dependencias do backend"
    exit 1
}

# Instalar dependencias do frontend
Log "Instalando dependencias do frontend..."
Set-Location "../frontend"
npm install
if ($LASTEXITCODE -ne 0) {
    Error "Falha ao instalar dependencias do frontend"
    exit 1
}

# Voltar para o diretorio raiz
Set-Location ".."

# Criar arquivo .env para o backend se nao existir
$backendEnvPath = "backend\.env"
if (!(Test-Path $backendEnvPath)) {
    Log "Criando arquivo .env para o backend..."
    $backendEnvContent = @"
NODE_ENV=development
PORT=$ApiPort
DB_HOST=localhost
DB_PORT=5432
DB_NAME=just_dance_hub
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://$Domain`:$FrontendPort
"@
    Set-Content -Path $backendEnvPath -Value $backendEnvContent
    Success "Arquivo .env do backend criado"
}

# Criar arquivo .env para o frontend se nao existir
$frontendEnvPath = "frontend\.env"
if (!(Test-Path $frontendEnvPath)) {
    Log "Criando arquivo .env para o frontend..."
    $frontendEnvContent = @"
REACT_APP_API_BASE_URL=http://$Domain`:$ApiPort
REACT_APP_ENVIRONMENT=development
"@
    Set-Content -Path $frontendEnvPath -Value $frontendEnvContent
    Success "Arquivo .env do frontend criado"
}

Success "Configuracao concluida!"
Log "Para iniciar a aplicacao:"
Log "1. Backend: cd backend && npm run dev"
Log "2. Frontend: cd frontend && npm start"
Log "3. WebSocket (se necessario): cd backend && npm run websocket:dev"
Log ""
Log "URLs de acesso:"
Log "- Frontend: http://$Domain`:$FrontendPort"
Log "- API: http://$Domain`:$ApiPort"