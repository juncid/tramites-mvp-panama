# ===========================================================================
# Script de Testing Automatizado de API (PowerShell)
# Sistema de Trámites Migratorios de Panamá
#
# Ejecuta las colecciones de Postman usando Docker Compose
# ===========================================================================

# Stop on errors
$ErrorActionPreference = "Stop"

# Banner
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                                   ║" -ForegroundColor Cyan
Write-Host "║       🧪 SUITE DE TESTING AUTOMATIZADO DE API                    ║" -ForegroundColor Cyan
Write-Host "║       Sistema de Trámites Migratorios de Panamá                  ║" -ForegroundColor Cyan
Write-Host "║                                                                   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Variables
$ComposeFile = "docker-compose.api-tests.yml"
$ReportDir = ".\test-reports"

# Functions
function Print-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Print-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# Check dependencies
Print-Header "Verificando Dependencias"

# Check Docker
try {
    docker --version | Out-Null
    Print-Success "Docker instalado"
} catch {
    Print-Error "Docker no está instalado o no está en PATH"
    exit 1
}

# Check Docker Compose
try {
    docker-compose --version | Out-Null
    Print-Success "Docker Compose instalado"
} catch {
    Print-Error "Docker Compose no está instalado o no está en PATH"
    exit 1
}

# Check if compose file exists
if (-not (Test-Path $ComposeFile)) {
    Print-Error "Archivo $ComposeFile no encontrado"
    exit 1
}
Print-Success "Archivo de compose encontrado"

# Prepare environment
Print-Header "Preparando Ambiente"

if (Test-Path $ReportDir) {
    Print-Info "Limpiando reportes anteriores..."
    Remove-Item -Path "$ReportDir\*" -Recurse -Force -ErrorAction SilentlyContinue
} else {
    Print-Info "Creando directorio de reportes..."
    New-Item -ItemType Directory -Path $ReportDir -Force | Out-Null
}
Print-Success "Directorio de reportes preparado"

# Clean up previous containers
Print-Info "Limpiando contenedores anteriores..."
docker-compose -f $ComposeFile down -v 2>$null
Print-Success "Ambiente limpio"

# Start services
Print-Header "Iniciando Servicios de Testing"
Print-Info "Esto puede tomar varios minutos la primera vez..."

$TestStatus = 0
try {
    docker-compose -f $ComposeFile up --abort-on-container-exit --exit-code-from newman-api-tests
    Print-Success "Tests ejecutados exitosamente"
} catch {
    Print-Error "Tests fallaron"
    $TestStatus = 1
}

# Show reports
Print-Header "Reportes Generados"

if ((Test-Path $ReportDir) -and ((Get-ChildItem $ReportDir).Count -gt 0)) {
    Write-Host "📊 Reportes disponibles en: $ReportDir" -ForegroundColor Green
    Write-Host ""
    
    if (Test-Path "$ReportDir\ppsh-report.html") {
        Print-Success "PPSH API Report: $ReportDir\ppsh-report.html"
    }
    
    if (Test-Path "$ReportDir\workflow-report.html") {
        Print-Success "Workflow API Report: $ReportDir\workflow-report.html"
    }
    
    if (Test-Path "$ReportDir\tramites-report.html") {
        Print-Success "Trámites Base API Report: $ReportDir\tramites-report.html"
    }
    
    Write-Host ""
    Print-Info "Puedes abrir los reportes en tu navegador"
    Print-Info "O visitar http://localhost:8080 para ver todos los reportes"
} else {
    Print-Warning "No se generaron reportes"
}

# Summary
Print-Header "Resumen"

if (Test-Path "$ReportDir\ppsh-results.json") {
    try {
        $ppshResults = Get-Content "$ReportDir\ppsh-results.json" | ConvertFrom-Json
        $ppshTotal = $ppshResults.run.stats.tests.total
        $ppshFailed = $ppshResults.run.stats.tests.failed
        Write-Host "📋 PPSH API: $ppshTotal tests, $ppshFailed fallidos"
    } catch {
        Write-Host "📋 PPSH API: Resultados no disponibles"
    }
}

if (Test-Path "$ReportDir\workflow-results.json") {
    try {
        $wfResults = Get-Content "$ReportDir\workflow-results.json" | ConvertFrom-Json
        $wfTotal = $wfResults.run.stats.tests.total
        $wfFailed = $wfResults.run.stats.tests.failed
        Write-Host "📋 Workflow API: $wfTotal tests, $wfFailed fallidos"
    } catch {
        Write-Host "📋 Workflow API: Resultados no disponibles"
    }
}

if (Test-Path "$ReportDir\tramites-results.json") {
    try {
        $trResults = Get-Content "$ReportDir\tramites-results.json" | ConvertFrom-Json
        $trTotal = $trResults.run.stats.tests.total
        $trFailed = $trResults.run.stats.tests.failed
        Write-Host "📋 Trámites Base API: $trTotal tests, $trFailed fallidos"
    } catch {
        Write-Host "📋 Trámites Base API: Resultados no disponibles"
    }
}

# Cleanup
Print-Header "Limpieza"
Print-Info "Deteniendo servicios..."
docker-compose -f $ComposeFile down -v
Print-Success "Servicios detenidos"

# Final message
Write-Host ""
if ($TestStatus -eq 0) {
    Print-Header "✅ TESTS COMPLETADOS EXITOSAMENTE"
    
    # Ask to open reports
    $openReports = Read-Host "¿Deseas abrir los reportes en el navegador? (s/n)"
    if ($openReports -eq "s" -or $openReports -eq "S") {
        if (Test-Path "$ReportDir\ppsh-report.html") {
            Start-Process "$ReportDir\ppsh-report.html"
        }
        if (Test-Path "$ReportDir\workflow-report.html") {
            Start-Process "$ReportDir\workflow-report.html"
        }
        if (Test-Path "$ReportDir\tramites-report.html") {
            Start-Process "$ReportDir\tramites-report.html"
        }
    }
    
    exit 0
} else {
    Print-Header "❌ TESTS FALLARON - Revisar reportes para más detalles"
    exit 1
}
