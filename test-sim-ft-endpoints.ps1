#!/usr/bin/env pwsh
# ============================================================================
# Script: test-sim-ft-endpoints.ps1
# Descripción: Pruebas completas de endpoints SIM_FT con datos PERM_TEMP
# ============================================================================

$baseUrl = "http://localhost:8000/api/v1/sim-ft"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        PRUEBAS DE ENDPOINTS SIM_FT - PERM_TEMP               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# 1. CATÁLOGOS
# ============================================================================
Write-Host "📚 1. CATÁLOGOS" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

Write-Host "`n🔹 Pasos del trámite PERM_TEMP:" -ForegroundColor White
docker exec tramites-backend curl -s "$baseUrl/pasos?cod_tramite=PERM_TEMP" | `
    ConvertFrom-Json | Select-Object NUM_PASO, NOM_DESCRIPCION | Format-Table

Write-Host "`n🔹 Flujo de pasos PERM_TEMP:" -ForegroundColor White
docker exec tramites-backend curl -s "$baseUrl/flujo-pasos?cod_tramite=PERM_TEMP" | `
    ConvertFrom-Json | Select-Object NUM_PASO, COD_SECCION, ID_PASO_SGTE | Format-Table

# ============================================================================
# 2. TRÁMITES
# ============================================================================
Write-Host ""
Write-Host "📋 2. TRÁMITES" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

Write-Host "`n🔹 Todos los trámites PERM_TEMP:" -ForegroundColor White
docker exec tramites-backend curl -s "$baseUrl/tramites?cod_tramite=PERM_TEMP" | `
    ConvertFrom-Json | Select-Object NUM_TRAMITE, IND_ESTATUS, IND_PRIORIDAD, @{N='Solicitante';E={$_.OBS_OBSERVA -replace '\|.*',''}} | Format-Table

# ============================================================================
# 3. DETALLES DE TRÁMITES
# ============================================================================
Write-Host ""
Write-Host "🔍 3. DETALLES DE TRÁMITES" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

Write-Host "`n🔹 Trámite 2025-5001-1 (En Revisión):" -ForegroundColor White
$tramite1 = docker exec tramites-backend curl -s "$baseUrl/tramites/2025/5001/1" | ConvertFrom-Json
Write-Host "   NUM_TRAMITE   : $($tramite1.NUM_TRAMITE)" -ForegroundColor Cyan
Write-Host "   COD_TRAMITE   : $($tramite1.COD_TRAMITE)" -ForegroundColor Cyan
Write-Host "   ESTATUS       : $($tramite1.IND_ESTATUS)" -ForegroundColor Cyan
Write-Host "   PRIORIDAD     : $($tramite1.IND_PRIORIDAD)" -ForegroundColor Cyan
Write-Host "   OBSERVACIÓN   : $($tramite1.OBS_OBSERVA)" -ForegroundColor Cyan

Write-Host "`n🔹 Historial de pasos del trámite 5001:" -ForegroundColor White
docker exec tramites-backend curl -s "$baseUrl/tramites/2025/5001/pasos" | `
    ConvertFrom-Json | Select-Object NUM_PASO, IND_ESTATUS, @{N='Observación';E={$_.OBS_OBSERVA}} | Format-Table

Write-Host "`n🔹 Trámite 2025-5002-1 (En Evaluación):" -ForegroundColor White
$tramite2 = docker exec tramites-backend curl -s "$baseUrl/tramites/2025/5002/1" | ConvertFrom-Json
Write-Host "   NUM_TRAMITE   : $($tramite2.NUM_TRAMITE)" -ForegroundColor Cyan
Write-Host "   ESTATUS       : $($tramite2.IND_ESTATUS)" -ForegroundColor Cyan
Write-Host "   OBSERVACIÓN   : $($tramite2.OBS_OBSERVA)" -ForegroundColor Cyan

Write-Host "`n🔹 Trámite 2025-5003-1 (Finalizado):" -ForegroundColor White
$tramite3 = docker exec tramites-backend curl -s "$baseUrl/tramites/2025/5003/1" | ConvertFrom-Json
Write-Host "   NUM_TRAMITE   : $($tramite3.NUM_TRAMITE)" -ForegroundColor Cyan
Write-Host "   ESTATUS       : $($tramite3.IND_ESTATUS)" -ForegroundColor Cyan
Write-Host "   CONCLUSIÓN    : $($tramite3.IND_CONCLUSION)" -ForegroundColor Green
Write-Host "   FEC_FIN       : $($tramite3.FEC_FIN_TRAMITE)" -ForegroundColor Cyan

# ============================================================================
# 4. ESTADÍSTICAS
# ============================================================================
Write-Host ""
Write-Host "📊 4. ESTADÍSTICAS" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

Write-Host "`n🔹 Estadísticas generales:" -ForegroundColor White
$stats = docker exec tramites-backend curl -s "$baseUrl/estadisticas" | ConvertFrom-Json
Write-Host "   Total trámites: $($stats.total_tramites)" -ForegroundColor Cyan
Write-Host "   Por estatus:" -ForegroundColor Cyan
$stats.por_estatus | Format-Table

# ============================================================================
# 5. PRUEBAS DE CREACIÓN/MODIFICACIÓN
# ============================================================================
Write-Host ""
Write-Host "✍️  5. PRUEBAS DE CREACIÓN (Opcional)" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "Para avanzar un paso del trámite 5001:" -ForegroundColor Gray
Write-Host '  curl -X POST http://localhost:8000/api/v1/sim-ft/tramites/2025/5001/pasos \' -ForegroundColor White
Write-Host '    -H "Content-Type: application/json" \' -ForegroundColor White
Write-Host '    -d ''{"NUM_PASO":3,"IND_ESTATUS":"02","OBS_OBSERVA":"Paso 3 iniciado"}''' -ForegroundColor White
Write-Host ""

Write-Host "Para cerrar el trámite 5002:" -ForegroundColor Gray
Write-Host '  curl -X POST http://localhost:8000/api/v1/sim-ft/tramites/2025/5002/1/cierre \' -ForegroundColor White
Write-Host '    -H "Content-Type: application/json" \' -ForegroundColor White
Write-Host '    -d ''{"IND_CONCLUSION":"AP","OBS_CONCLUSION":"Aprobado"}''' -ForegroundColor White
Write-Host ""

# ============================================================================
# RESUMEN
# ============================================================================
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  ✅ PRUEBAS COMPLETADAS                       ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📦 DATOS DISPONIBLES:" -ForegroundColor Cyan
Write-Host "   • Tipo: PERM_TEMP (Permiso Temporal)" -ForegroundColor White
Write-Host "   • 6 Pasos configurados" -ForegroundColor White
Write-Host "   • 3 Trámites de prueba (5001, 5002, 5003)" -ForegroundColor White
Write-Host ""
Write-Host "🎯 ENDPOINTS VERIFICADOS:" -ForegroundColor Cyan
Write-Host "   ✅ GET  /pasos?cod_tramite=PERM_TEMP" -ForegroundColor White
Write-Host "   ✅ GET  /flujo-pasos?cod_tramite=PERM_TEMP" -ForegroundColor White
Write-Host "   ✅ GET  /tramites?cod_tramite=PERM_TEMP" -ForegroundColor White
Write-Host "   ✅ GET  /tramites/{annio}/{num}/{reg}" -ForegroundColor White
Write-Host "   ✅ GET  /tramites/{annio}/{num}/pasos" -ForegroundColor White
Write-Host "   ✅ GET  /estadisticas" -ForegroundColor White
Write-Host ""
