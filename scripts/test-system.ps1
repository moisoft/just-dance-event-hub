# Script de Teste Simples - Just Dance Event Hub

Write-Host "Testing Just Dance Event Hub" -ForegroundColor Blue
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "Node.js not found" -ForegroundColor Red
}

# Check NPM
Write-Host "Checking NPM..." -ForegroundColor Yellow
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-Host "NPM found: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "NPM not found" -ForegroundColor Red
}

# Check file structure
Write-Host "Checking file structure..." -ForegroundColor Yellow

$requiredFiles = @(
    "package.json",
    "backend\package.json",
    "frontend\package.json"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "File found: $file" -ForegroundColor Green
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

# Check directories
Write-Host "Checking directories..." -ForegroundColor Yellow

$requiredDirs = @(
    "backend",
    "frontend",
    "backend\src",
    "frontend\src"
)

foreach ($dir in $requiredDirs) {
    if (Test-Path $dir -PathType Container) {
        Write-Host "Directory found: $dir" -ForegroundColor Green
    } else {
        Write-Host "Directory not found: $dir" -ForegroundColor Red
    }
}

# Check backend dependencies
Write-Host "Checking backend dependencies..." -ForegroundColor Yellow
if (Test-Path "backend\node_modules") {
    Write-Host "Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "Backend dependencies not installed" -ForegroundColor Yellow
    Write-Host "Run: cd backend; npm install" -ForegroundColor Cyan
}

# Check frontend dependencies
Write-Host "Checking frontend dependencies..." -ForegroundColor Yellow
if (Test-Path "frontend\node_modules") {
    Write-Host "Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "Frontend dependencies not installed" -ForegroundColor Yellow
    Write-Host "Run: cd frontend; npm install" -ForegroundColor Cyan
}

# Check frontend build
Write-Host "Checking frontend build..." -ForegroundColor Yellow
if (Test-Path "frontend\build") {
    Write-Host "Frontend build found" -ForegroundColor Green
} else {
    Write-Host "Frontend build not found" -ForegroundColor Yellow
    Write-Host "Run: cd frontend; npm run build" -ForegroundColor Cyan
}

# Check configuration files
Write-Host "Checking configurations..." -ForegroundColor Yellow

$configFiles = @(
    "backend\.env",
    "frontend\.env.production"
)

foreach ($config in $configFiles) {
    if (Test-Path $config) {
        Write-Host "Config found: $config" -ForegroundColor Green
    } else {
        Write-Host "Config not found: $config" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Basic test completed!" -ForegroundColor Blue
Write-Host "For full validation, run production-validation.ps1" -ForegroundColor Green
Write-Host ""