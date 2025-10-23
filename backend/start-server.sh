#!/bin/bash
# Script para iniciar el servidor FastAPI

echo "🚀 Iniciando servidor FastAPI..."
echo "📂 Directorio actual: $(pwd)"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "app/main.py" ]; then
    echo "❌ Error: No se encuentra app/main.py"
    echo "   Por favor ejecuta este script desde el directorio backend/"
    exit 1
fi

# Verificar que existe Python3
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 no está instalado"
    exit 1
fi

# Verificar que existe uvicorn
if ! python3 -c "import uvicorn" 2>/dev/null; then
    echo "⚠️  Instalando uvicorn..."
    pip3 install uvicorn
fi

echo "✅ Iniciando servidor en http://0.0.0.0:8000"
echo "📚 Documentación: http://localhost:8000/api/docs"
echo "🔄 Modo reload activado (desarrollo)"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Iniciar el servidor
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
