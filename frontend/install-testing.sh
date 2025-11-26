#!/bin/bash

# Script de instalación de testing para el frontend
# Usage: ./install-testing.sh

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║        🧪 Instalación de Testing - Frontend                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Verificar que estamos en el directorio frontend
if [ ! -f "package.json" ]; then
    echo "❌ Error: Debes ejecutar este script desde el directorio frontend/"
    exit 1
fi

echo "📦 Paso 1: Instalando dependencias de testing..."
npm install --save-dev \
    vitest@^1.0.4 \
    @testing-library/react@^14.1.2 \
    @testing-library/user-event@^14.5.1 \
    @testing-library/jest-dom@^6.1.5 \
    @types/jest@^29.5.11 \
    jsdom@^23.0.1

echo ""
echo "✅ Dependencias instaladas correctamente"
echo ""

echo "🔍 Paso 2: Verificando instalación..."
if npm list vitest @testing-library/react > /dev/null 2>&1; then
    echo "✅ Paquetes verificados correctamente"
else
    echo "⚠️  Advertencia: Algunos paquetes pueden no haberse instalado correctamente"
fi

echo ""
echo "🧪 Paso 3: Ejecutando test de prueba..."
npm run test:run || echo "⚠️  Los tests actuales tienen errores (esperado si faltan dependencias)"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ Instalación Completa                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📚 Próximos pasos:"
echo "   1. npm run test          - Ejecutar tests en modo watch"
echo "   2. npm run test:ui       - Abrir UI interactiva"
echo "   3. npm run test:coverage - Ver cobertura de código"
echo ""
echo "📖 Documentación:"
echo "   - TESTING_PLAN.md        - Plan completo de testing"
echo "   - TESTING_SETUP.md       - Guía de setup y comandos"
echo ""
