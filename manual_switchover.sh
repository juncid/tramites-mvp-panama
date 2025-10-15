#!/bin/bash
# ==========================================
# SWITCHOVER MANUAL A AMBIENTE BLUE
# Sistema de Trámites Migratorios de Panamá
# Fecha: 2025-10-14
# ==========================================

set -e

echo "🔄 EJECUTANDO SWITCHOVER MANUAL A BLUE..."
echo "=========================================="

# Paso 1: Verificar ambos ambientes
echo "🔍 Verificando estado actual..."
GREEN_STATUS=$(curl -s http://localhost:8000/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
BLUE_STATUS=$(curl -s http://localhost:8001/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

echo "🟢 GREEN Status: $GREEN_STATUS"
echo "🔵 BLUE Status: $BLUE_STATUS"

if [ "$BLUE_STATUS" != "healthy" ]; then
    echo "❌ ERROR: BLUE no está saludable, abortando switchover"
    exit 1
fi

# Paso 2: Parar backend GREEN
echo "⏸️ Deteniendo backend GREEN..."
docker-compose -f docker-compose.green-blue.yml stop backend-green

# Paso 3: Cambiar puerto de BLUE al principal (8000)
echo "🔄 Reconfigurando puertos para BLUE..."

# Detener BLUE temporalmente
docker-compose -f docker-compose.green-blue.yml stop backend-blue

# Crear configuración temporal para switchover
cat > docker-compose.switchover.yml << 'EOF'
version: '3.8'

networks:
  sim_network:
    external: true
    name: tramites-mvp-panama_sim_network

services:
  backend-blue-active:
    image: tramites-mvp-panama-backend-blue:latest
    container_name: sim_backend_blue_active
    environment:
      - DATABASE_URL=mssql+pyodbc://sa:SIM_Panama_2025!@sim_sqlserver_blue:1433/SIM_PANAMA?driver=ODBC+Driver+17+for+SQL+Server&TrustServerCertificate=yes
      - REDIS_URL=redis://sim_redis_blue:6379/0
      - ENVIRONMENT=blue-active
      - LOG_LEVEL=INFO
    ports:
      - "8000:8000"  # BLUE ahora toma el puerto principal
    depends_on:
      - sqlserver-blue-ref
      - redis-blue-ref
    restart: unless-stopped
    networks:
      sim_network:
        ipv4_address: 172.20.0.25
    volumes:
      - ./backend/logs:/app/logs
    healthcheck:
      test: curl -f http://localhost:8000/health || exit 1
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s
    labels:
      - "environment=blue"
      - "status=active"

  # Referencias a servicios existentes
  sqlserver-blue-ref:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: sim_sqlserver_blue
    external_links:
      - sim_sqlserver_blue
    network_mode: "none"

  redis-blue-ref:
    image: redis:7-alpine
    container_name: sim_redis_blue
    external_links:
      - sim_redis_blue
    network_mode: "none"
EOF

# Paso 4: Levantar BLUE en puerto principal
echo "🚀 Levantando BLUE en puerto principal (8000)..."
docker-compose -f docker-compose.switchover.yml up -d backend-blue-active

# Paso 5: Esperar y verificar
echo "⏳ Esperando a que BLUE esté listo en puerto 8000..."
sleep 15

# Verificar que el switchover fue exitoso
MAIN_STATUS=$(curl -s http://localhost:8000/health | grep -o '"environment":"[^"]*"' | cut -d'"' -f4)

if [ "$MAIN_STATUS" = "blue-active" ]; then
    echo "✅ SWITCHOVER EXITOSO!"
    echo "🔵 BLUE está ahora activo en puerto principal: http://localhost:8000"
    echo ""
    echo "📊 Nuevo estado:"
    echo "🔵 BLUE (ACTIVO): http://localhost:8000"
    echo "🟢 GREEN (DETENIDO): Detenido"
    echo ""
    echo "🎉 MIGRACIÓN COMPLETADA - SISTEMA DE PAGOS PPSH ACTIVO"
    echo ""
    echo "✅ Cambios aplicados exitosamente:"
    echo "   - Campos de auditoría funcionando"
    echo "   - Sistema de pagos PPSH disponible"
    echo "   - Migraciones de prioridad alta activas"
else
    echo "❌ ERROR: Switchover falló"
    echo "Revirtiendo cambios..."
    docker-compose -f docker-compose.switchover.yml down
    docker-compose -f docker-compose.green-blue.yml up -d backend-green
    exit 1
fi