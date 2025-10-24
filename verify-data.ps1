# Script de verificación de datos de prueba
Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "🔍 VERIFICANDO DATOS DE PRUEBA" -ForegroundColor Cyan
Write-Host "================================================================`n" -ForegroundColor Cyan

Write-Host "📡 Verificando API..." -ForegroundColor Yellow

# Verificar que la API está disponible
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 5
    Write-Host "✅ API está respondiendo" -ForegroundColor Green
    Write-Host "   Estado: $($health.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ API no está disponible: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n📊 Consultando datos...`n" -ForegroundColor Yellow

# Verificar trámites
try {
    $tramites = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/tramites" -TimeoutSec 10
    if ($tramites -is [Array]) {
        Write-Host "✅ Trámites Base:" -ForegroundColor Green
        Write-Host "   Total: $($tramites.Count) registros" -ForegroundColor White
        if ($tramites.Count -gt 0) {
            Write-Host "   Ejemplo: $($tramites[0].NOM_TITULO)" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️  Trámites: formato inesperado" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error obteniendo trámites: $_" -ForegroundColor Red
}

# Verificar workflows
try {
    $workflows = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/workflow/workflows" -TimeoutSec 10
    if ($workflows -is [Array]) {
        Write-Host "`n✅ Workflows:" -ForegroundColor Green
        Write-Host "   Total: $($workflows.Count) registros" -ForegroundColor White
        if ($workflows.Count -gt 0) {
            Write-Host "   Ejemplo: $($workflows[0].nombre)" -ForegroundColor Gray
        }
    } else {
        Write-Host "`n⚠️  Workflows: formato inesperado" -ForegroundColor Yellow
    }
} catch {
    Write-Host "`n❌ Error obteniendo workflows: $_" -ForegroundColor Red
}

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "✅ VERIFICACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "================================================================`n" -ForegroundColor Cyan

Write-Host "💡 Para probar con Postman:" -ForegroundColor Yellow
Write-Host "   1. Importar colecciones desde: backend/postman/" -ForegroundColor White
Write-Host "   2. Configurar environment: base_url=http://localhost:8000" -ForegroundColor White
Write-Host "   3. Ejecutar las colecciones`n" -ForegroundColor White
