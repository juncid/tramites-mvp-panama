#!/bin/bash

# Quick start script for Trámites MVP Panamá

echo "=========================================="
echo "Trámites MVP Panamá - Quick Start"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado."
    echo "Por favor, instala Docker desde https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose no está disponible."
    echo "Por favor, instala Docker Compose desde https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker y Docker Compose detectados"
echo ""

# Create .env files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creando archivo backend/.env desde .env.example..."
    cp backend/.env.example backend/.env
    echo "✅ backend/.env creado"
else
    echo "✅ backend/.env ya existe"
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creando archivo frontend/.env desde .env.example..."
    cp frontend/.env.example frontend/.env
    echo "✅ frontend/.env creado"
else
    echo "✅ frontend/.env ya existe"
fi

echo ""
echo "🚀 Iniciando servicios con Docker Compose..."
echo ""
echo "Esto puede tomar varios minutos la primera vez..."
echo ""

# Start services
docker compose -f config/docker-compose.yml up --build -d

echo ""
echo "⏳ Esperando a que los servicios estén listos..."
echo ""

# Wait for services to be healthy
sleep 5

echo "=========================================="
echo "✅ Servicios iniciados correctamente!"
echo "=========================================="
echo ""
echo "🌐 URLs de acceso:"
echo "   - Frontend:         http://localhost:3000"
echo "   - Backend API:      http://localhost:8000"
echo "   - API Docs:         http://localhost:8000/docs"
echo "   - SQL Server:       localhost:1433"
echo "   - Redis:            localhost:6379"
echo ""
echo "📊 Para ver los logs:"
echo "   docker compose -f config/docker-compose.yml logs -f"
echo ""
echo "⏹  Para detener los servicios:"
echo "   docker compose -f config/docker-compose.yml down"
echo ""
echo "📖 Consulta README.md para más información"
echo "=========================================="
