#!/usr/bin/env pwsh
# ============================================================================
# Script: load-sim-ft-test-data.ps1
# Descripción: Carga datos de prueba completos para SIM_FT
# Uso: .\load-sim-ft-test-data.ps1
# ============================================================================

Write-Host "🚀 Cargando datos de prueba SIM_FT..." -ForegroundColor Cyan
Write-Host ""

# Verificar que SQL Server esté corriendo
Write-Host "🔍 Verificando SQL Server..." -ForegroundColor Yellow
$sqlServerStatus = docker ps --filter "name=tramites-sqlserver" --format "{{.Status}}"

if (-not $sqlServerStatus) {
    Write-Host "❌ Error: SQL Server no está corriendo" -ForegroundColor Red
    Write-Host "💡 Ejecuta: docker-compose up -d sqlserver" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ SQL Server está corriendo" -ForegroundColor Green
Write-Host ""

# Ejecutar script SQL
Write-Host "📥 Ejecutando seed_sim_ft_complete_flow.sql..." -ForegroundColor Yellow
Write-Host ""

docker exec -i tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd `
    -S localhost `
    -U sa `
    -P 'YourStrong@Passw0rd' `
    -C `
    -i /var/opt/mssql/backup/seed_sim_ft_complete_flow.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║        ✅ DATOS DE PRUEBA SIM_FT CARGADOS EXITOSAMENTE           ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "🧪 Prueba los endpoints con:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  # Ver tipo de trámite" -ForegroundColor Gray
    Write-Host '  curl http://localhost:8000/api/v1/sim-ft/tramites-tipos' -ForegroundColor White
    Write-Host ""
    Write-Host "  # Ver pasos del trámite PERMISO_TEMP" -ForegroundColor Gray
    Write-Host '  curl "http://localhost:8000/api/v1/sim-ft/pasos?cod_tramite=PERMISO_TEMP"' -ForegroundColor White
    Write-Host ""
    Write-Host "  # Ver flujo completo" -ForegroundColor Gray
    Write-Host '  curl "http://localhost:8000/api/v1/sim-ft/flujo-pasos?cod_tramite=PERMISO_TEMP"' -ForegroundColor White
    Write-Host ""
    Write-Host "  # Ver todos los trámites" -ForegroundColor Gray
    Write-Host '  curl http://localhost:8000/api/v1/sim-ft/tramites' -ForegroundColor White
    Write-Host ""
    Write-Host "  # Ver trámite específico" -ForegroundColor Gray
    Write-Host '  curl http://localhost:8000/api/v1/sim-ft/tramites/2025/1001' -ForegroundColor White
    Write-Host ""
    Write-Host "  # Avanzar paso de trámite" -ForegroundColor Gray
    Write-Host '  curl -X POST http://localhost:8000/api/v1/sim-ft/tramites/2025/1001/pasos \' -ForegroundColor White
    Write-Host '    -H "Content-Type: application/json" \' -ForegroundColor White
    Write-Host '    -d ''{"NUM_PASO":3,"COD_ESTATUS":"02","DES_OBSERVACION":"Avanzando a paso 3"}''' -ForegroundColor White
    Write-Host ""
    Write-Host "  # Ver estadísticas" -ForegroundColor Gray
    Write-Host '  curl http://localhost:8000/api/v1/sim-ft/estadisticas' -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Error al cargar datos de prueba" -ForegroundColor Red
    Write-Host "💡 Revisa los logs arriba para más detalles" -ForegroundColor Yellow
    exit 1
}
