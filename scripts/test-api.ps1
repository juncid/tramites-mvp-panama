# ============================================================================
# Script PowerShell para Testing Automatizado de API
# Sistema de Trámites Migratorios de Panamá
# ============================================================================
# Este script facilita la ejecución de tests con datos de prueba completos
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("run", "verify", "reload", "clean", "status", "reports")]
    [string]$Action = "run"
)

$ErrorActionPreference = "Stop"
$ComposeFile = "docker-compose.api-tests.yml"

# Colores para output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

# Banner
function Show-Banner {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  🧪 TESTING AUTOMATIZADO DE API - Trámites MVP Panamá" -ForegroundColor White
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

# Verificar que docker-compose está instalado
function Test-DockerCompose {
    try {
        $null = docker-compose --version
        return $true
    } catch {
        Write-Error "❌ Error: docker-compose no está instalado o no está en el PATH"
        Write-Info "💡 Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop"
        exit 1
    }
}

# Ejecutar tests completos
function Start-Tests {
    Write-Info "🚀 Iniciando suite completa de tests..."
    Write-Info "   Esto incluye:"
    Write-Info "   - Inicialización de base de datos"
    Write-Info "   - Carga de datos de prueba (catálogos PPSH, workflows)"
    Write-Info "   - Ejecución de 3 colecciones de Postman"
    Write-Info "   - Generación de reportes HTML"
    Write-Host ""
    
    Write-Warning "⏰ Esto puede tomar 2-3 minutos..."
    Write-Host ""
    
    docker-compose -f $ComposeFile up --abort-on-container-exit
    
    Write-Host ""
    Write-Success "✅ Tests completados!"
    Write-Info "📊 Ver reportes en: http://localhost:8080"
    Write-Host ""
}

# Verificar datos de prueba
function Test-Data {
    Write-Info "🔍 Verificando datos de prueba en la base de datos..."
    Write-Host ""
    
    # Levantar solo BD y backend
    docker-compose -f $ComposeFile up -d db-test redis-test backend-test
    
    Write-Info "⏳ Esperando a que los servicios estén listos (15 segundos)..."
    Start-Sleep -Seconds 15
    
    # Ejecutar script de verificación
    Write-Info "🔎 Ejecutando verificación..."
    docker exec tramites-backend-test python verify_test_data.py
    
    Write-Host ""
    Write-Info "💡 Para recargar datos, usa: .\test-api.ps1 reload"
}

# Recargar datos de prueba
function Update-TestData {
    Write-Info "🔄 Recargando datos de prueba..."
    Write-Host ""
    
    # Verificar si los servicios están corriendo
    $backend = docker ps --filter "name=tramites-backend-test" --format "{{.Names}}"
    
    if (-not $backend) {
        Write-Warning "⚠️  Backend no está corriendo. Levantando servicios..."
        docker-compose -f $ComposeFile up -d db-test redis-test backend-test
        Start-Sleep -Seconds 15
    }
    
    Write-Info "📦 Ejecutando script de carga de datos..."
    docker exec tramites-backend-test python load_test_data.py
    
    Write-Host ""
    Write-Success "✅ Datos recargados correctamente"
    
    Write-Info "🔍 Verificando..."
    docker exec tramites-backend-test python verify_test_data.py
}

# Limpiar todo
function Clear-Environment {
    Write-Warning "🧹 Limpiando ambiente de testing..."
    Write-Host ""
    
    Write-Info "🛑 Deteniendo contenedores..."
    docker-compose -f $ComposeFile down
    
    Write-Warning "⚠️  ¿Deseas eliminar también los volúmenes (datos de BD)? (S/N)"
    $response = Read-Host
    
    if ($response -eq 'S' -or $response -eq 's') {
        Write-Info "🗑️  Eliminando volúmenes..."
        docker-compose -f $ComposeFile down -v
        Write-Success "✅ Ambiente limpio completamente (incluyendo datos)"
    } else {
        Write-Success "✅ Contenedores detenidos (datos preservados)"
    }
    
    Write-Host ""
    Write-Info "💡 Para volver a ejecutar: .\test-api.ps1 run"
}

# Ver estado de servicios
function Show-Status {
    Write-Info "📊 Estado de servicios de testing:"
    Write-Host ""
    
    docker-compose -f $ComposeFile ps
    
    Write-Host ""
    Write-Info "🌐 URLs disponibles:"
    Write-Info "   - API Backend:    http://localhost:8001"
    Write-Info "   - API Health:     http://localhost:8001/health"
    Write-Info "   - API Docs:       http://localhost:8001/docs"
    Write-Info "   - Reportes:       http://localhost:8080"
    Write-Host ""
}

# Abrir reportes
function Open-Reports {
    Write-Info "📊 Abriendo visor de reportes..."
    
    # Verificar si report-viewer está corriendo
    $viewer = docker ps --filter "name=tramites-report-viewer" --format "{{.Names}}"
    
    if (-not $viewer) {
        Write-Warning "⚠️  Report viewer no está corriendo"
        Write-Info "💡 Primero ejecuta: .\test-api.ps1 run"
        return
    }
    
    Start-Process "http://localhost:8080"
    Write-Success "✅ Abriendo navegador en http://localhost:8080"
}

# Main
Show-Banner
Test-DockerCompose

switch ($Action) {
    "run" {
        Start-Tests
    }
    "verify" {
        Test-Data
    }
    "reload" {
        Update-TestData
    }
    "clean" {
        Clear-Environment
    }
    "status" {
        Show-Status
    }
    "reports" {
        Open-Reports
    }
}

Write-Host ""
Write-Info "═══════════════════════════════════════════════════════════"
Write-Info "  Comandos disponibles:"
Write-Info "  - .\test-api.ps1 run      : Ejecutar tests completos"
Write-Info "  - .\test-api.ps1 verify   : Verificar datos de prueba"
Write-Info "  - .\test-api.ps1 reload   : Recargar datos de prueba"
Write-Info "  - .\test-api.ps1 status   : Ver estado de servicios"
Write-Info "  - .\test-api.ps1 reports  : Abrir reportes en navegador"
Write-Info "  - .\test-api.ps1 clean    : Limpiar ambiente"
Write-Info "═══════════════════════════════════════════════════════════"
Write-Host ""
