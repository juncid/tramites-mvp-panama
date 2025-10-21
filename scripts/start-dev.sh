#!/bin/bash

# Script para iniciar el entorno de desarrollo
# Frontend local + Backend/DB en contenedores

echo "🚀 Iniciando entorno de desarrollo de Trámites MVP Panamá"
echo "=================================================="
echo ""
echo "📋 Configuración:"
echo "   • Frontend: Ejecutándose localmente en http://localhost:3000"
echo "   • Backend:  Contenedor en http://localhost:8001"
echo "   • Base de datos: Contenedor en puerto 1434"
echo "   • Redis: Contenedor en puerto 6380"
echo "   • Logs: http://localhost:8081 (Dozzle)"
echo ""

# Verificar que Docker esté ejecutándose
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker no está ejecutándose. Por favor inicia Docker primero."
    exit 1
fi

# Función para limpiar al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    docker-compose -f config/docker-compose.dev.yml down
    echo "✅ Servicios detenidos"
}

# Configurar trap para limpiar al salir
trap cleanup EXIT INT TERM

# Levantar servicios backend
echo "🔧 Iniciando servicios backend (base de datos, cache, API)..."
docker-compose -f config/docker-compose.dev.yml up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar que el backend esté respondiendo
echo "🏥 Verificando salud del backend..."
until curl -f http://localhost:8001/health > /dev/null 2>&1; do
    echo "   ⏳ Esperando backend..."
    sleep 5
done

echo "✅ Backend listo en http://localhost:8001"
echo ""
echo "🎨 Iniciando frontend en modo desarrollo..."
echo "   📂 Cambiar al directorio: cd frontend"
echo "   🚀 Ejecutar: npm run dev"
echo ""
echo "📊 Servicios disponibles:"
echo "   • API Docs: http://localhost:8001/api/docs"
echo "   • Logs en tiempo real: http://localhost:8081"
echo ""
echo "Para detener los servicios, presiona Ctrl+C"
echo ""

# Mostrar logs de los contenedores
docker-compose -f config/docker-compose.dev.yml logs -f