#!/bin/bash

# ===========================================================================
# Script de Testing Automatizado de API
# Sistema de Trámites Migratorios de Panamá
#
# Ejecuta las colecciones de Postman usando Docker Compose
# ===========================================================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║       🧪 SUITE DE TESTING AUTOMATIZADO DE API                    ║
║       Sistema de Trámites Migratorios de Panamá                  ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Variables
COMPOSE_FILE="docker-compose.api-tests.yml"
REPORT_DIR="./test-reports"

# Functions
print_header() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check dependencies
print_header "Verificando Dependencias"

if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado"
    exit 1
fi
print_success "Docker instalado"

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado"
    exit 1
fi
print_success "Docker Compose instalado"

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "Archivo $COMPOSE_FILE no encontrado"
    exit 1
fi
print_success "Archivo de compose encontrado"

# Create reports directory
print_header "Preparando Ambiente"

if [ -d "$REPORT_DIR" ]; then
    print_info "Limpiando reportes anteriores..."
    rm -rf "$REPORT_DIR"/*
else
    print_info "Creando directorio de reportes..."
    mkdir -p "$REPORT_DIR"
fi
print_success "Directorio de reportes preparado"

# Clean up previous containers
print_info "Limpiando contenedores anteriores..."
docker-compose -f "$COMPOSE_FILE" down -v 2>/dev/null || true
print_success "Ambiente limpio"

# Start services
print_header "Iniciando Servicios de Testing"
print_info "Esto puede tomar varios minutos la primera vez..."

if docker-compose -f "$COMPOSE_FILE" up --abort-on-container-exit --exit-code-from newman-api-tests; then
    print_success "Tests ejecutados exitosamente"
    TEST_STATUS=0
else
    print_error "Tests fallaron"
    TEST_STATUS=1
fi

# Show reports
print_header "Reportes Generados"

if [ -d "$REPORT_DIR" ] && [ "$(ls -A $REPORT_DIR 2>/dev/null)" ]; then
    echo -e "${GREEN}📊 Reportes disponibles en: $REPORT_DIR${NC}"
    echo ""
    
    if [ -f "$REPORT_DIR/ppsh-report.html" ]; then
        print_success "PPSH API Report: $REPORT_DIR/ppsh-report.html"
    fi
    
    if [ -f "$REPORT_DIR/workflow-report.html" ]; then
        print_success "Workflow API Report: $REPORT_DIR/workflow-report.html"
    fi
    
    if [ -f "$REPORT_DIR/tramites-report.html" ]; then
        print_success "Trámites Base API Report: $REPORT_DIR/tramites-report.html"
    fi
    
    echo ""
    print_info "Puedes abrir los reportes en tu navegador"
    print_info "O visitar http://localhost:8080 para ver todos los reportes"
else
    print_warning "No se generaron reportes"
fi

# Summary
print_header "Resumen"

if [ -f "$REPORT_DIR/ppsh-results.json" ]; then
    PPSH_TOTAL=$(jq '.run.stats.tests.total' "$REPORT_DIR/ppsh-results.json" 2>/dev/null || echo "N/A")
    PPSH_FAILED=$(jq '.run.stats.tests.failed' "$REPORT_DIR/ppsh-results.json" 2>/dev/null || echo "N/A")
    echo -e "📋 PPSH API: ${PPSH_TOTAL} tests, ${PPSH_FAILED} fallidos"
fi

if [ -f "$REPORT_DIR/workflow-results.json" ]; then
    WF_TOTAL=$(jq '.run.stats.tests.total' "$REPORT_DIR/workflow-results.json" 2>/dev/null || echo "N/A")
    WF_FAILED=$(jq '.run.stats.tests.failed' "$REPORT_DIR/workflow-results.json" 2>/dev/null || echo "N/A")
    echo -e "📋 Workflow API: ${WF_TOTAL} tests, ${WF_FAILED} fallidos"
fi

if [ -f "$REPORT_DIR/tramites-results.json" ]; then
    TR_TOTAL=$(jq '.run.stats.tests.total' "$REPORT_DIR/tramites-results.json" 2>/dev/null || echo "N/A")
    TR_FAILED=$(jq '.run.stats.tests.failed' "$REPORT_DIR/tramites-results.json" 2>/dev/null || echo "N/A")
    echo -e "📋 Trámites Base API: ${TR_TOTAL} tests, ${TR_FAILED} fallidos"
fi

# Cleanup
print_header "Limpieza"
print_info "Deteniendo servicios..."
docker-compose -f "$COMPOSE_FILE" down -v
print_success "Servicios detenidos"

# Final message
echo ""
if [ $TEST_STATUS -eq 0 ]; then
    print_header "✅ TESTS COMPLETADOS EXITOSAMENTE"
    exit 0
else
    print_header "❌ TESTS FALLARON - Revisar reportes para más detalles"
    exit 1
fi
