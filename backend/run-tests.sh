#!/bin/bash

# Script para ejecutar tests usando Docker con Python 3.11

set -e

# Verificar que docker y docker-compose están disponibles
if ! command -v docker &> /dev/null; then
    echo "Error: Docker no está instalado o no está en el PATH"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose no está instalado o no está en el PATH"
    exit 1
fi

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  all         - Ejecutar todos los tests"
    echo "  basic       - Ejecutar tests básicos funcionales"
    echo "  unit        - Ejecutar tests unitarios"
    echo "  integration - Ejecutar tests de integración"
    echo "  coverage    - Ejecutar tests con reporte de cobertura"
    echo "  build       - Construir imagen de testing"
    echo "  clean       - Limpiar contenedores y volúmenes"
    echo "  shell       - Abrir shell en contenedor de testing"
    echo "  help        - Mostrar esta ayuda"
}

# Función para construir la imagen de testing
build_test_image() {
    echo "🔨 Construyendo imagen de testing con Python 3.11..."
    docker-compose -f docker-compose.test.yml build test-runner
    echo "✅ Imagen de testing construida"
}

# Función para limpiar recursos
clean_resources() {
    echo "🧹 Limpiando contenedores y volúmenes de testing..."
    docker-compose -f docker-compose.test.yml down -v --remove-orphans
    docker image prune -f --filter label=testing=true 2>/dev/null || true
    echo "✅ Limpieza completada"
}

# Función para ejecutar tests específicos
run_tests() {
    local test_type="$1"
    echo "🧪 Ejecutando tests: $test_type"
    
    # Asegurar que Redis esté corriendo
    docker-compose -f docker-compose.test.yml up -d redis-test
    
    case "$test_type" in
        "all")
            docker-compose -f docker-compose.test.yml run --rm test-runner pytest tests/ -v
            ;;
        "basic")
            docker-compose -f docker-compose.test.yml run --rm test-runner pytest tests/test_basic_functional.py -v
            ;;
        "unit")
            docker-compose -f docker-compose.test.yml run --rm test-unit
            ;;
        "integration")
            docker-compose -f docker-compose.test.yml run --rm test-integration
            ;;
        "coverage")
            docker-compose -f docker-compose.test.yml run --rm test-coverage
            ;;
        *)
            echo "❌ Tipo de test desconocido: $test_type"
            show_help
            exit 1
            ;;
    esac
    
    echo "✅ Tests completados"
}

# Función para abrir shell en contenedor
open_shell() {
    echo "🐚 Abriendo shell en contenedor de testing..."
    docker-compose -f docker-compose.test.yml run --rm test-runner bash
}

# Procesar comando
case "${1:-help}" in
    "all"|"basic"|"unit"|"integration"|"coverage")
        build_test_image
        run_tests "$1"
        ;;
    "build")
        build_test_image
        ;;
    "clean")
        clean_resources
        ;;
    "shell")
        build_test_image
        open_shell
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo "❌ Comando desconocido: $1"
        show_help
        exit 1
        ;;
esac