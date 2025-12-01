# ===========================================================================
# Script de PowerShell para cargar datos de prueba
# Sistema de Trámites Migratorios de Panamá
# ===========================================================================

param(
    [switch]$All,
    [switch]$Tramites,
    [switch]$Workflow,
    [switch]$Help
)

# Colores para salida
function Write-Header {
    param([string]$Message)
    Write-Host "`n================================================================" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host "================================================================`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Yellow
}

function Show-Help {
    Write-Header "🌱 SISTEMA DE CARGA DE DATOS DE PRUEBA"
    Write-Host "Uso: .\seed-data.ps1 [-All] [-Tramites] [-Workflow] [-Help]`n" -ForegroundColor White
    Write-Host "Opciones:" -ForegroundColor Green
    Write-Host "  -All         Cargar TODOS los datos de prueba (Trámites + Workflow)"
    Write-Host "  -Tramites    Cargar solo datos de Trámites Base"
    Write-Host "  -Workflow    Cargar solo datos de Workflow API"
    Write-Host "  -Help        Mostrar esta ayuda`n"
    
    Write-Host "Prerequisitos:" -ForegroundColor Yellow
    Write-Host "  - Servicios Docker en ejecución (docker-compose up -d)"
    Write-Host "  - Migraciones aplicadas (automático al iniciar servicios)`n"
    
    Write-Host "Ejemplos:" -ForegroundColor Yellow
    Write-Host "  .\seed-data.ps1 -All               # Cargar todos los datos"
    Write-Host "  .\seed-data.ps1 -Tramites          # Solo trámites base"
    Write-Host "  .\seed-data.ps1 -Workflow          # Solo workflow`n"
    
    Write-Host "Después de cargar los datos:" -ForegroundColor Cyan
    Write-Host "  1. Abrir Postman"
    Write-Host "  2. Importar colecciones desde: backend/postman/"
    Write-Host "  3. Ejecutar las colecciones para probar los datos`n"
}

function Test-DockerRunning {
    Write-Host "🔍 Verificando Docker..." -ForegroundColor Cyan
    
    try {
        $null = docker ps 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Docker no está en ejecución"
            Write-Info "Inicie Docker Desktop y vuelva a intentar"
            return $false
        }
        Write-Success "Docker está en ejecución"
        return $true
    }
    catch {
        Write-Error "No se pudo conectar a Docker"
        return $false
    }
}

function Test-ServicesRunning {
    Write-Host "🔍 Verificando servicios..." -ForegroundColor Cyan
    
    $sqlserver = docker ps --filter "name=tramites-sqlserver" --filter "status=running" -q
    
    if (-not $sqlserver) {
        Write-Error "El contenedor de SQL Server no está en ejecución"
        Write-Info "Ejecute primero: docker-compose up -d"
        return $false
    }
    
    Write-Success "Servicios necesarios están en ejecución"
    return $true
}

function Invoke-SeedAll {
    Write-Header "🌱 CARGANDO TODOS LOS DATOS DE PRUEBA"
    
    Write-Info "Iniciando carga completa..."
    
    docker-compose --profile seed up db-seed --abort-on-container-exit
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Datos de prueba cargados exitosamente`n"
        
        Write-Header "📋 PRÓXIMOS PASOS"
        Write-Host "1. Abrir Postman" -ForegroundColor White
        Write-Host "2. Importar colecciones desde: backend/postman/" -ForegroundColor White
        Write-Host "   - Tramites_Base_API.postman_collection.json" -ForegroundColor Gray
        Write-Host "   - Workflow_API_Tests.postman_collection.json" -ForegroundColor Gray
        Write-Host "3. Configurar environment en Postman:" -ForegroundColor White
        Write-Host "   - base_url: http://localhost:8000" -ForegroundColor Gray
        Write-Host "   - api_prefix: /api/v1" -ForegroundColor Gray
        Write-Host "4. Ejecutar las colecciones para validar los datos`n" -ForegroundColor White
        
        Write-Info "Consulte: backend\sql\README_TEST_DATA.md para más información"
        
        # Limpiar contenedor
        docker rm tramites-db-seed 2>$null | Out-Null
        
        return $true
    }
    else {
        Write-Error "Error al cargar los datos de prueba"
        return $false
    }
}

function Invoke-SeedTramites {
    Write-Header "🏛️ CARGANDO DATOS DE TRÁMITES BASE"
    
    docker-compose run --rm `
        -e DATABASE_HOST=sqlserver `
        -e DATABASE_PORT=1433 `
        -e DATABASE_NAME=SIM_PANAMA `
        -e DATABASE_USER=sa `
        -e DATABASE_PASSWORD=YourStrong@Passw0rd `
        --name tramites-seed-temp `
        backend `
        python /app/scripts/seed_test_data.py --tramites
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Datos de Trámites Base cargados exitosamente`n"
        Write-Info "Pruebe la colección: Tramites_Base_API.postman_collection.json"
        
        # Limpiar contenedor
        docker rm tramites-seed-temp 2>$null | Out-Null
        
        return $true
    }
    else {
        Write-Error "Error al cargar datos de Trámites Base"
        return $false
    }
}

function Invoke-SeedWorkflow {
    Write-Header "🔄 CARGANDO DATOS DE WORKFLOW API"
    
    docker-compose run --rm `
        -e DATABASE_HOST=sqlserver `
        -e DATABASE_PORT=1433 `
        -e DATABASE_NAME=SIM_PANAMA `
        -e DATABASE_USER=sa `
        -e DATABASE_PASSWORD=YourStrong@Passw0rd `
        --name tramites-seed-temp `
        backend `
        python /app/scripts/seed_test_data.py --workflow
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Datos de Workflow cargados exitosamente`n"
        Write-Info "Pruebe la colección: Workflow_API_Tests.postman_collection.json"
        
        # Limpiar contenedor
        docker rm tramites-seed-temp 2>$null | Out-Null
        
        return $true
    }
    else {
        Write-Error "Error al cargar datos de Workflow"
        return $false
    }
}

# ===========================================================================
# Main Script
# ===========================================================================

# Mostrar ayuda si se solicita o no hay parámetros
if ($Help -or (-not ($All -or $Tramites -or $Workflow))) {
    Show-Help
    exit 0
}

# Verificar Docker
if (-not (Test-DockerRunning)) {
    exit 1
}

# Verificar servicios
if (-not (Test-ServicesRunning)) {
    exit 1
}

# Ejecutar según parámetros
$success = $true

if ($All) {
    $success = Invoke-SeedAll
}
else {
    if ($Tramites) {
        if (-not (Invoke-SeedTramites)) {
            $success = $false
        }
    }
    
    if ($Workflow) {
        if (-not (Invoke-SeedWorkflow)) {
            $success = $false
        }
    }
}

# Resultado final
Write-Host "`n================================================================" -ForegroundColor Cyan
if ($success) {
    Write-Success "PROCESO COMPLETADO EXITOSAMENTE"
} else {
    Write-Error "PROCESO COMPLETADO CON ERRORES"
    exit 1
}
Write-Host "================================================================`n" -ForegroundColor Cyan

exit 0
