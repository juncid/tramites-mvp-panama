#!/bin/bash
# ==========================================
# SCRIPT SIMPLIFICADO DE PRUEBA GREEN-BLUE
# Sistema de Trámites Migratorios de Panamá
# Fecha: 2025-10-14
# ==========================================

set -e

echo "🧪 INICIANDO PRUEBA DE DESPLIEGUE GREEN-BLUE"
echo "=============================================="

# Verificar si los servicios actuales están corriendo
echo "🔍 Verificando servicios actuales..."
docker-compose ps

echo ""
echo "⏬ Deteniendo servicios actuales si existen..."
docker-compose down --remove-orphans 2>/dev/null || true
docker-compose -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true

echo ""
echo "🟢 Iniciando solo ambiente GREEN para prueba..."

# Levantar solo GREEN primero
docker-compose -f docker-compose.green-blue.yml up -d sqlserver-green redis-green

echo "⏳ Esperando a que GREEN esté listo..."
sleep 30

# Verificar si SQL Server GREEN está listo
echo "🔍 Verificando SQL Server GREEN..."
for i in {1..10}; do
    if docker exec sim_sqlserver_green /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P SIM_Panama_2025! -C -Q "SELECT 1" &>/dev/null; then
        echo "✅ SQL Server GREEN está listo"
        break
    fi
    echo "⏳ Intento $i/10 - Esperando SQL Server GREEN..."
    sleep 10
done

# Inicializar base de datos GREEN
echo "🏗️ Inicializando base de datos GREEN..."
docker exec sim_sqlserver_green /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P SIM_Panama_2025! -C -i /var/opt/init-scripts/init_database.sql

# Levantar backend GREEN
echo "🚀 Iniciando backend GREEN..."
docker-compose -f docker-compose.green-blue.yml up -d backend-green

echo "⏳ Esperando a que backend GREEN esté listo..."
sleep 20

# Verificar backend GREEN
for i in {1..10}; do
    if curl -f -s "http://localhost:8000/health" &>/dev/null; then
        echo "✅ Backend GREEN está funcionando"
        break
    fi
    echo "⏳ Intento $i/10 - Esperando backend GREEN..."
    sleep 10
done

echo ""
echo "📊 Estado actual:"
docker-compose -f docker-compose.green-blue.yml ps

echo ""
echo "❤️ Health check GREEN:"
curl -s "http://localhost:8000/health" | jq . 2>/dev/null || curl -s "http://localhost:8000/health"

echo ""
echo "🎉 Ambiente GREEN configurado exitosamente!"
echo "🔗 Backend GREEN: http://localhost:8000"
echo "🔗 Health check: http://localhost:8000/health"

echo ""
echo "📋 Próximos pasos:"
echo "1. Verificar que GREEN funciona correctamente"
echo "2. Ejecutar: ./green_blue_manager.sh deploy (para despliegue completo)"
echo "3. Probar migración con: docker-compose -f docker-compose.green-blue.yml run --rm migration-service"