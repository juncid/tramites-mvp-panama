#!/bin/bash
# Script para crear una nueva migración con Alembic

echo "🔧 Generando migración con Alembic..."

# Instalar Alembic si no está instalado
pip install -q alembic==1.12.1

# Generar migración automática
alembic revision --autogenerate -m "${1:-Initial migration with PPSH tables}"

echo "✅ Migración creada en alembic/versions/"
echo ""
echo "📝 Revisa el archivo generado antes de aplicarlo"
echo "🚀 Para aplicar la migración: alembic upgrade head"
