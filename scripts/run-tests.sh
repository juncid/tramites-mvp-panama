#!/bin/bash

# Script para ejecutar tests en Docker
# Sistema de Trámites Migratorios de Panamá

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}Sistema de Tests - Trámites Migratorios de Panamá${NC}"
    echo ""
    echo "Uso: $0 [COMANDO] [OPCIONES]"
    echo ""
    echo "Comandos disponibles:"
    echo "  all          - Ejecutar todos los tests"
    echo "  unit         - Ejecutar solo tests unitarios"
    echo "  integration  - Ejecutar solo tests de integración"
    echo "  coverage     - Ejecutar tests con reporte de coverage"
    echo "  build        - Construir imagen de testing"
    echo "  clean        - Limpiar containers y volúmenes de test"
    echo "  shell        - Abrir shell interactivo en container de test"
    echo "  help         - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 all                    # Todos los tests"
    echo "  $0 unit                   # Solo unitarios"
    echo "  $0 coverage               # Con coverage"
    echo "  $0 shell                  # Shell interactivo"
    echo ""
}

# Función para verificar si Docker está disponible
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker no está instalado o no está en PATH${NC}"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}Error: Docker Compose no está instalado o no está en PATH${NC}"
        exit 1
    fi
}

# Función para construir imagen de testing
build_test_image() {
    echo -e "${BLUE}Construyendo imagen de testing...${NC}"
    docker-compose -f config/docker-compose.test.yml build test-runner
    echo -e "${GREEN}✅ Imagen de testing construida${NC}"
}

# Función para ejecutar todos los tests
run_all_tests() {
    echo -e "${BLUE}Ejecutando todos los tests...${NC}"
    docker-compose -f config/docker-compose.test.yml up --build --abort-on-container-exit test-runner
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ Todos los tests pasaron${NC}"
    else
        echo -e "${RED}❌ Algunos tests fallaron${NC}"
    fi
    
    return $exit_code
}

# Función para ejecutar tests unitarios
run_unit_tests() {
    echo -e "${BLUE}Ejecutando tests unitarios...${NC}"
    docker-compose -f config/docker-compose.test.yml up --build --abort-on-container-exit test-unit
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ Tests unitarios pasaron${NC}"
    else
        echo -e "${RED}❌ Algunos tests unitarios fallaron${NC}"
    fi
    
    return $exit_code
}

# Función para ejecutar tests de integración
run_integration_tests() {
    echo -e "${BLUE}Ejecutando tests de integración...${NC}"
    docker-compose -f config/docker-compose.test.yml up --build --abort-on-container-exit test-integration
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ Tests de integración pasaron${NC}"
    else
        echo -e "${RED}❌ Algunos tests de integración fallaron${NC}"
    fi
    
    return $exit_code
}

# Función para ejecutar tests con coverage
run_coverage_tests() {
    echo -e "${BLUE}Ejecutando tests con coverage...${NC}"
    
    # Crear directorio de coverage si no existe
    mkdir -p ./coverage
    
    docker-compose -f config/docker-compose.test.yml up --build --abort-on-container-exit test-coverage
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ Tests con coverage completados${NC}"
        echo -e "${YELLOW}📊 Reporte de coverage generado en ./coverage/index.html${NC}"
    else
        echo -e "${RED}❌ Tests con coverage fallaron${NC}"
    fi
    
    return $exit_code
}

# Función para abrir shell interactivo
open_shell() {
    echo -e "${BLUE}Abriendo shell interactivo en container de test...${NC}"
    docker-compose -f config/docker-compose.test.yml run --rm test-runner bash
}

# Función para limpiar containers y volúmenes
clean_test_env() {
    echo -e "${YELLOW}Limpiando entorno de testing...${NC}"
    
    # Parar y remover containers
    docker-compose -f config/docker-compose.test.yml down --remove-orphans
    
    # Remover volúmenes (opcional)
    read -p "¿Desea eliminar también los volúmenes de test? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose -f config/docker-compose.test.yml down -v
        echo -e "${GREEN}✅ Volúmenes eliminados${NC}"
    fi
    
    # Limpiar imágenes no utilizadas (opcional)
    read -p "¿Desea limpiar imágenes Docker no utilizadas? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker image prune -f
        echo -e "${GREEN}✅ Imágenes no utilizadas eliminadas${NC}"
    fi
    
    echo -e "${GREEN}✅ Entorno de testing limpiado${NC}"
}

# Función principal
main() {
    check_docker
    
    case "${1:-help}" in
        "all")
            run_all_tests
            ;;
        "unit")
            run_unit_tests
            ;;
        "integration")
            run_integration_tests
            ;;
        "coverage")
            run_coverage_tests
            ;;
        "build")
            build_test_image
            ;;
        "shell")
            open_shell
            ;;
        "clean")
            clean_test_env
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Trap para limpiar en caso de interrupción
trap 'echo -e "\n${YELLOW}Interrumpido por usuario${NC}"; docker-compose -f config/docker-compose.test.yml down' INT TERM

# Ejecutar función principal con todos los argumentos
main "$@"