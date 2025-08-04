# Script para testar funcionalidade de Login

# Funcao para log colorido
function Write-Success { param($Message) Write-Host "[OK] $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "[ERRO] $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "[AVISO] $Message" -ForegroundColor Yellow }

# Configuracoes
$Domain = "localhost"
$ApiPort = 5000
$FrontendPort = 3000

Write-Info "Testando funcionalidade de Login..."
Write-Info "="*50

# Teste 1: Verificar se a API esta rodando
Write-Info "1. Verificando se a API esta rodando..."
try {
    $response = Invoke-RestMethod -Uri "http://$Domain`:$ApiPort/health" -TimeoutSec 5
    if ($response.success) {
        Write-Success "API esta rodando corretamente"
    } else {
        Write-Warning "API respondeu mas com status: $($response.message)"
    }
} catch {
    Write-Error "API nao esta respondendo: $_"
    exit 1
}

# Teste 2: Testar login como admin
Write-Info "2. Testando login como admin..."
try {
    $loginData = @{
        email = "admin@justdancehub.com"
        password = "123456"
    } | ConvertTo-Json
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $loginResponse = Invoke-RestMethod -Uri "http://$Domain`:$ApiPort/api/mock/auth/login" -Method POST -Body $loginData -Headers $headers -TimeoutSec 10
    
    if ($loginResponse.success) {
        Write-Success "Login como admin realizado com sucesso"
        Write-Info "Usuario: $($loginResponse.user.nickname)"
        Write-Info "Papel: $($loginResponse.user.papel)"
        Write-Info "Token: $($loginResponse.token.Substring(0,20))..."
    } else {
        Write-Error "Falha no login como admin: $($loginResponse.error)"
    }
} catch {
    Write-Error "Erro ao fazer login como admin: $_"
}

# Teste 3: Testar login como staff
Write-Info "3. Testando login como staff..."
try {
    $loginData = @{
        email = "staff@justdancehub.com"
        password = "123456"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://$Domain`:$ApiPort/api/mock/auth/login" -Method POST -Body $loginData -Headers $headers -TimeoutSec 10
    
    if ($loginResponse.success) {
        Write-Success "Login como staff realizado com sucesso"
        Write-Info "Usuario: $($loginResponse.user.nickname)"
        Write-Info "Papel: $($loginResponse.user.papel)"
    } else {
        Write-Error "Falha no login como staff: $($loginResponse.error)"
    }
} catch {
    Write-Error "Erro ao fazer login como staff: $_"
}

# Teste 4: Testar login como jogador
Write-Info "4. Testando login como jogador..."
try {
    $loginData = @{
        email = "player1@test.com"
        password = "123456"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://$Domain`:$ApiPort/api/mock/auth/login" -Method POST -Body $loginData -Headers $headers -TimeoutSec 10
    
    if ($loginResponse.success) {
        Write-Success "Login como jogador realizado com sucesso"
        Write-Info "Usuario: $($loginResponse.user.nickname)"
        Write-Info "Papel: $($loginResponse.user.papel)"
    } else {
        Write-Error "Falha no login como jogador: $($loginResponse.error)"
    }
} catch {
    Write-Error "Erro ao fazer login como jogador: $_"
}

# Teste 5: Testar login com credenciais invalidas
Write-Info "5. Testando login com credenciais invalidas..."
try {
    $loginData = @{
        email = "usuario@inexistente.com"
        password = "senhaerrada"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://$Domain`:$ApiPort/api/mock/auth/login" -Method POST -Body $loginData -Headers $headers -TimeoutSec 10
    
    if ($loginResponse.success) {
        Write-Warning "Login com credenciais invalidas foi aceito (nao deveria)"
    } else {
        Write-Success "Login com credenciais invalidas foi rejeitado corretamente"
        Write-Info "Erro: $($loginResponse.error)"
    }
} catch {
    Write-Success "Login com credenciais invalidas foi rejeitado corretamente (excecao)"
}

# Teste 6: Verificar se o frontend esta rodando
Write-Info "6. Verificando se o frontend esta rodando..."
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://$Domain`:$FrontendPort" -UseBasicParsing -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Success "Frontend esta rodando corretamente"
    }
} catch {
    Write-Error "Frontend nao esta respondendo: $_"
}

Write-Info "="*50
Write-Success "Teste de funcionalidade de Login concluido!"
Write-Info "Credenciais de teste disponiveis:"
Write-Info "Admin:"
Write-Info "  - Email: admin@justdancehub.com"
Write-Info "  - Senha: 123456"
Write-Info "Staff:"
Write-Info "  - Email: staff@justdancehub.com"
Write-Info "  - Senha: 123456"
Write-Info "Jogador:"
Write-Info "  - Email: player1@test.com"
Write-Info "  - Senha: 123456"
Write-Info "Acesse: http://$Domain`:$FrontendPort para testar no navegador"