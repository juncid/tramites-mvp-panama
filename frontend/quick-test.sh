#!/bin/bash

# Script de validación rápida
echo "═══════════════════════════════════════════════════════════"
echo "   🚀 VALIDACIÓN RÁPIDA DE DOCKERFILES"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Detectar directorio
if [ -f "Dockerfile" ]; then
    DIR="."
    CONTEXT="."
else
    DIR="frontend"
    CONTEXT="frontend/"
fi

echo "📁 Verificando archivos..."
ls -lh ${DIR}/Dockerfile ${DIR}/Dockerfile.prod ${DIR}/.dockerignore ${DIR}/nginx.conf 2>/dev/null | awk '{print "  ✓", $9, "-", $5}'
echo ""

echo "🔨 Building imagen de desarrollo..."
docker build -f ${DIR}/Dockerfile -t frontend:dev-test ${CONTEXT} -q && echo "  ✓ Build exitoso" || echo "  ✗ Build falló"
echo ""

echo "🏭 Building imagen de producción..."
docker build -f ${DIR}/Dockerfile.prod -t frontend:prod-test ${CONTEXT} -q && echo "  ✓ Build exitoso" || echo "  ✗ Build falló"
echo ""

echo "📊 Tamaños de imágenes:"
docker images frontend:dev-test frontend:prod-test --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}"
echo ""

echo "🔒 Verificando usuarios:"
DEV_USER=$(docker run --rm frontend:dev-test whoami 2>/dev/null || echo "error")
echo "  Dev:  $DEV_USER (esperado: nodejs)"

PROD_USER=$(docker run --rm --entrypoint /bin/sh frontend:prod-test -c "whoami" 2>/dev/null || echo "error")
echo "  Prod: $PROD_USER (esperado: nginx-run)"
echo ""

echo "✅ Validación rápida completada"
echo ""
echo "💡 Para validación completa ejecuta: ./test-docker-optimization.sh"
