# Script PowerShell para servir el sitio de documentación MkDocs

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Sistema de Trámites Migratorios de Panamá" -ForegroundColor Cyan
Write-Host "   Sitio de Documentación - MkDocs" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Python está instalado
$pythonCmd = $null
if (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
}

if (-not $pythonCmd) {
    Write-Host "❌ Error: Python no está instalado" -ForegroundColor Red
    Write-Host "Por favor instala Python 3.8+ desde https://www.python.org/" -ForegroundColor Yellow
    exit 1
}

$pythonVersion = & $pythonCmd --version
Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
Write-Host ""

# Verificar si pip está instalado
$pipCmd = $null
if (Get-Command pip3 -ErrorAction SilentlyContinue) {
    $pipCmd = "pip3"
} elseif (Get-Command pip -ErrorAction SilentlyContinue) {
    $pipCmd = "pip"
}

if (-not $pipCmd) {
    Write-Host "❌ Error: pip no está instalado" -ForegroundColor Red
    Write-Host "Por favor instala pip" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ pip encontrado" -ForegroundColor Green
Write-Host ""

# Verificar si mkdocs está instalado
if (-not (Get-Command mkdocs -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  MkDocs no está instalado. Instalando dependencias..." -ForegroundColor Yellow
    Write-Host ""
    
    # Instalar dependencias
    & $pipCmd install -r requirements-docs.txt
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Dependencias instaladas exitosamente" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
        exit 1
    }
} else {
    $mkdocsVersion = mkdocs --version
    Write-Host "✅ MkDocs ya está instalado: $mkdocsVersion" -ForegroundColor Green
    Write-Host ""
}

# Servir el sitio
Write-Host "🚀 Iniciando servidor de documentación..." -ForegroundColor Cyan
Write-Host ""
Write-Host "   URL: " -NoNewline
Write-Host "http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Presiona Ctrl+C para detener el servidor" -ForegroundColor Gray
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

mkdocs serve
