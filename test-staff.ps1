# Script para testar a funcionalidade de Staff

# Funcao para log colorido
function Write-Success { param($Message) Write-Host "[OK] $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "[ERRO] $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "[AVISO] $Message" -ForegroundColor Yellow }

# Configurações
$Domain = "localhost"
$ApiPort = 5000
$FrontendPort = 3000

Write-Info "Testando funcionalidade de Staff..."
Write-Info "="*50

# Teste 1: Verificar se a API está rodando
Write-Info "1. Verificando se a API está rodando..."
try {
    $response = Invoke-RestMethod -Uri "http://$Domain`:$ApiPort/health" -TimeoutSec 5
    if ($response.success) {
        Write-Success "API está rodando corretamente"
    } else {
        Write-Warning "API respondeu mas com status: $($response.message)"
    }
} catch {
    Write-Error "API não está respondendo: $_"
    exit 1
}

# Teste 2: Verificar se o frontend está rodando
Write-Info "2. Verificando se o frontend está rodando..."
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://$Domain`:$FrontendPort" -UseBasicParsing -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Success "Frontend está rodando corretamente"
    }
} catch {
    Write-Error "Frontend não está respondendo: $_"
    exit 1
}

# Teste 3: Testar login como staff
Write-Info "3. Testando login como staff..."
try {
    $loginData = @{
        email = "staff@justdancehub.com"
        password = "123456"
    } | ConvertTo-Json
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $loginResponse = Invoke-RestMethod -Uri "http://$Domain`:$ApiPort/api/mock/auth/login" -Method POST -Body $loginData -Headers $headers -TimeoutSec 10
    
    if ($loginResponse.success -and $loginResponse.user.papel -eq "staff") {
        Write-Success "Login como staff realizado com sucesso"
        Write-Info "Usuário: $($loginResponse.user.nickname)"
        Write-Info "Papel: $($loginResponse.user.papel)"
        $token = $loginResponse.token
    } else {
        Write-Error "Falha no login como staff: $($loginResponse.error)"
        exit 1
    }
} catch {
    Write-Error "Erro ao fazer login como staff: $_"
    exit 1
}

# Teste 4: Testar API de fila do staff
Write-Info "4. Testando API de fila do staff..."
try {
    $queueHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }
    
    $queueResponse = Invoke-RestMethod -Uri "http://$Domain`:$ApiPort/api/mock/staff/queue" -Headers $queueHeaders -TimeoutSec 10
    
    if ($queueResponse.success) {
        Write-Success "API de fila do staff está funcionando"
        Write-Info "Itens na fila: $($queueResponse.data.Count)"
        
        if ($queueResponse.data.Count -gt 0) {
            Write-Info "Primeiro item da fila:"
            $firstItem = $queueResponse.data[0]
            Write-Info "  - ID: $($firstItem.id)"
            Write-Info "  - Jogador: $($firstItem.player.nickname)"
            Write-Info "  - Música: $($firstItem.song.name) - $($firstItem.song.artist)"
            Write-Info "  - Status: $($firstItem.status)"
        }
    } else {
        Write-Error "API de fila do staff falhou: $($queueResponse.error)"
    }
} catch {
    Write-Error "Erro ao acessar API de fila do staff: $_"
}

# Teste 5: Testar atualização de status na fila
Write-Info "5. Testando atualização de status na fila..."
try {
    # Primeiro, obter um item da fila para testar
    $queueResponse = Invoke-RestMethod -Uri "http://$Domain`:$ApiPort/api/mock/staff/queue" -Headers $queueHeaders -TimeoutSec 10
    
    if ($queueResponse.success -and $queueResponse.data.Count -gt 0) {
        $testItem = $queueResponse.data[0]
        $updateData = @{ status = "playing" } | ConvertTo-Json
        
        $updateResponse = Invoke-RestMethod -Uri "http://$Domain`:$ApiPort/api/mock/staff/queue/$($testItem.id)" -Method PUT -Body $updateData -Headers $queueHeaders -TimeoutSec 10
        
        if ($updateResponse.success) {
            Write-Success "Atualização de status funcionando corretamente"
            Write-Info "Item $($testItem.id) atualizado para status: $($updateResponse.data.status)"
        } else {
            Write-Error "Falha na atualização de status: $($updateResponse.error)"
        }
    } else {
        Write-Warning "Nenhum item na fila para testar atualização"
    }
} catch {
    Write-Error "Erro ao testar atualização de status: $_"
}

Write-Info "="*50
Write-Success "Teste de funcionalidade de Staff concluído!"
Write-Info "Para acessar a tela de staff:"
Write-Info "1. Acesse: http://$Domain`:$FrontendPort"
Write-Info "2. Faça login com:"
Write-Info "   - Email: staff@justdancehub.com"
Write-Info "   - Senha: 123456"
Write-Info "3. Voce sera redirecionado automaticamente para o painel de staff"