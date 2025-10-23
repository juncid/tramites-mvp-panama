#!/bin/bash
# Script para servir el sitio de documentación MkDocs

echo "================================================"
echo "   Sistema de Trámites Migratorios de Panamá"
echo "   Sitio de Documentación - MkDocs"
echo "================================================"
echo ""

# Verificar si Python está instalado
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Error: Python no está instalado"
    echo "Por favor instala Python 3.8+ desde https://www.python.org/"
    exit 1
fi

# Usar python3 o python según disponibilidad
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

echo "✅ Python encontrado: $($PYTHON_CMD --version)"
echo ""

# Verificar si pip está instalado
if ! command -v pip3 &> /dev/null && ! command -v pip &> /dev/null; then
    echo "❌ Error: pip no está instalado"
    echo "Por favor instala pip"
    exit 1
fi

PIP_CMD="pip3"
if ! command -v pip3 &> /dev/null; then
    PIP_CMD="pip"
fi

echo "✅ pip encontrado"
echo ""

# Verificar si mkdocs está instalado
if ! command -v mkdocs &> /dev/null; then
    echo "⚠️  MkDocs no está instalado. Creando entorno virtual e instalando dependencias..."
    echo ""
    
    # Crear entorno virtual
    $PYTHON_CMD -m venv docs_env
    
    # Activar entorno virtual
    source docs_env/bin/activate
    
    # Instalar dependencias
    pip install -r requirements-docs.txt
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Dependencias instaladas exitosamente"
        echo ""
    else
        echo ""
        echo "❌ Error instalando dependencias"
        exit 1
    fi
else
    echo "✅ MkDocs ya está instalado: $(mkdocs --version)"
    echo ""
fi

# Servir el sitio
echo "🚀 Iniciando servidor de documentación..."
echo ""
echo "   URL: http://127.0.0.1:8000"
echo ""
echo "   Presiona Ctrl+C para detener el servidor"
echo ""
echo "================================================"
echo ""

# Si se creó el entorno virtual, activarlo y servir
if [ -d "docs_env" ]; then
    source docs_env/bin/activate
    mkdocs serve
else
    mkdocs serve
fi
