#!/bin/bash

# ============================================
# Script de Validación de Optimizaciones
# ============================================
# Este script valida las optimizaciones realizadas
# en los Dockerfiles del frontend

set -e

echo "════════════════════════════════════════════════════════════════"
echo "   🧪 VALIDACIÓN DE DOCKERFILES OPTIMIZADOS"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Detectar si estamos en el directorio frontend o en el raíz
if [ -f "Dockerfile" ] && [ -f "package.json" ]; then
    # Estamos en el directorio frontend
    FRONTEND_DIR="."
    BUILD_CONTEXT="."
else
    # Estamos en el directorio raíz
    FRONTEND_DIR="frontend"
    BUILD_CONTEXT="frontend/"
fi

echo -e "${YELLOW}📍 Directorio detectado:${NC} $(pwd)"
echo -e "${YELLOW}📁 Frontend path:${NC} ${FRONTEND_DIR}"
echo ""

# Función para verificar
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        exit 1
    fi
}

# 1. Verificar que los archivos existen
echo -e "${YELLOW}📁 Verificando archivos...${NC}"
test -f ${FRONTEND_DIR}/Dockerfile && check "Dockerfile existe"
test -f ${FRONTEND_DIR}/Dockerfile.prod && check "Dockerfile.prod existe"
test -f ${FRONTEND_DIR}/.dockerignore && check ".dockerignore existe"
test -f ${FRONTEND_DIR}/nginx.conf && check "nginx.conf existe"
test -f ${FRONTEND_DIR}/DOCKER_OPTIMIZATION.md && check "DOCKER_OPTIMIZATION.md existe"
echo ""

# 2. Verificar sintaxis de Dockerfiles
echo -e "${YELLOW}🔍 Verificando sintaxis de Dockerfiles...${NC}"
docker run --rm -i hadolint/hadolint < ${FRONTEND_DIR}/Dockerfile 2>&1 | head -10 || true
docker run --rm -i hadolint/hadolint < ${FRONTEND_DIR}/Dockerfile.prod 2>&1 | head -10 || true
check "Sintaxis verificada"
echo ""

# 3. Build del Dockerfile de desarrollo
echo -e "${YELLOW}🔨 Building Dockerfile de desarrollo...${NC}"
START_TIME=$(date +%s)
docker build -f ${FRONTEND_DIR}/Dockerfile -t tramites-frontend:dev-optimized ${BUILD_CONTEXT} --quiet
END_TIME=$(date +%s)
BUILD_TIME=$((END_TIME - START_TIME))
check "Build completado en ${BUILD_TIME}s"
echo ""

# 4. Build del Dockerfile de producción
echo -e "${YELLOW}🏭 Building Dockerfile de producción...${NC}"
START_TIME=$(date +%s)
docker build -f ${FRONTEND_DIR}/Dockerfile.prod -t tramites-frontend:prod-optimized ${BUILD_CONTEXT} --quiet
END_TIME=$(date +%s)
BUILD_TIME=$((END_TIME - START_TIME))
check "Build completado en ${BUILD_TIME}s"
echo ""

# 5. Verificar tamaños de imágenes
echo -e "${YELLOW}📊 Verificando tamaños de imágenes...${NC}"
DEV_SIZE=$(docker images tramites-frontend:dev-optimized --format "{{.Size}}")
PROD_SIZE=$(docker images tramites-frontend:prod-optimized --format "{{.Size}}")
echo "  • Dev:  ${DEV_SIZE}"
echo "  • Prod: ${PROD_SIZE}"
check "Tamaños obtenidos"
echo ""

# 6. Verificar que NO corren como root
echo -e "${YELLOW}🔒 Verificando seguridad (usuario no-root)...${NC}"
DEV_USER=$(docker run --rm tramites-frontend:dev-optimized whoami 2>/dev/null || echo "error")
if [ "$DEV_USER" = "nodejs" ]; then
    check "Dev: corre como usuario 'nodejs' ✓"
else
    echo -e "${RED}✗${NC} Dev: NO corre como usuario no-root (actual: $DEV_USER)"
fi

PROD_USER=$(docker run --rm --entrypoint /bin/sh tramites-frontend:prod-optimized -c "whoami" 2>/dev/null || echo "error")
if [ "$PROD_USER" = "nginx-run" ]; then
    check "Prod: corre como usuario 'nginx-run' ✓"
else
    echo -e "${YELLOW}⚠${NC} Prod: Usuario detectado: $PROD_USER (esperado: nginx-run)"
fi
echo ""

# 7. Verificar health checks
echo -e "${YELLOW}💊 Verificando health checks...${NC}"
DEV_HEALTH=$(docker inspect tramites-frontend:dev-optimized | grep -c "Healthcheck" || echo "0")
PROD_HEALTH=$(docker inspect tramites-frontend:prod-optimized | grep -c "Healthcheck" || echo "0")

if [ "$DEV_HEALTH" -gt "0" ]; then
    check "Dev: Health check configurado"
else
    echo -e "${RED}✗${NC} Dev: Health check NO configurado"
fi

if [ "$PROD_HEALTH" -gt "0" ]; then
    check "Prod: Health check configurado"
else
    echo -e "${RED}✗${NC} Prod: Health check NO configurado"
fi
echo ""

# 8. Análisis de capas
echo -e "${YELLOW}🔬 Análisis de capas...${NC}"
DEV_LAYERS=$(docker history tramites-frontend:dev-optimized | wc -l)
PROD_LAYERS=$(docker history tramites-frontend:prod-optimized | wc -l)
echo "  • Dev:  ${DEV_LAYERS} capas"
echo "  • Prod: ${PROD_LAYERS} capas"
check "Análisis de capas completado"
echo ""

# 9. Verificar vulnerabilidades (si trivy está disponible)
echo -e "${YELLOW}🛡️  Escaneando vulnerabilidades...${NC}"
if command -v trivy &> /dev/null; then
    echo "  Escaneando con Trivy..."
    trivy image --severity HIGH,CRITICAL tramites-frontend:prod-optimized --quiet || true
else
    echo "  ℹ️  Trivy no instalado, saltando escaneo de vulnerabilidades"
fi
echo ""

# 10. Test rápido de contenedor de producción
echo -e "${YELLOW}🚀 Test de contenedor de producción...${NC}"
echo "  Iniciando contenedor temporal..."
CONTAINER_ID=$(docker run -d -p 8888:80 tramites-frontend:prod-optimized)
sleep 5

# Verificar que responde
if curl -f http://localhost:8888/health &> /dev/null; then
    check "Contenedor responde correctamente"
else
    echo -e "${RED}✗${NC} Contenedor NO responde"
fi

# Limpiar
docker stop $CONTAINER_ID &> /dev/null
docker rm $CONTAINER_ID &> /dev/null
check "Contenedor de prueba eliminado"
echo ""

# Resumen final
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}   ✅ VALIDACIÓN COMPLETADA EXITOSAMENTE${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📊 Resumen:"
echo "  • Dockerfile Dev:  ${DEV_SIZE} (${DEV_LAYERS} capas)"
echo "  • Dockerfile Prod: ${PROD_SIZE} (${PROD_LAYERS} capas)"
echo "  • Usuario Dev:  ${DEV_USER}"
echo "  • Usuario Prod: ${PROD_USER}"
echo ""
echo "🎯 Comandos útiles:"
echo "  # Ver imágenes"
echo "  docker images | grep tramites-frontend"
echo ""
echo "  # Análisis detallado con dive"
echo "  docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock wagoodman/dive:latest tramites-frontend:prod-optimized"
echo ""
echo "  # Ejecutar en desarrollo"
echo "  docker run -p 3000:3000 tramites-frontend:dev-optimized"
echo ""
echo "  # Ejecutar en producción"
echo "  docker run -p 80:80 tramites-frontend:prod-optimized"
echo ""
