#!/bin/bash
# =============================================================================
# Script para iniciar la aplicación en Lightsail
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Iniciando MVP - Trámites Panamá     ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Verificar archivo .env
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: Archivo .env no encontrado${NC}"
    echo -e "${YELLOW}Copia .env.example a .env y configura tus valores:${NC}"
    echo -e "   cp .env.example .env"
    echo -e "   nano .env"
    exit 1
fi

# Verificar swap
SWAP_TOTAL=$(free -m | grep Swap | awk '{print $2}')
if [ "$SWAP_TOTAL" -lt 2000 ]; then
    echo -e "${YELLOW}⚠️  Advertencia: Swap es menor a 2GB (actual: ${SWAP_TOTAL}MB)${NC}"
    echo -e "${YELLOW}   Se recomienda al menos 4GB de swap para 4GB RAM${NC}"
fi

# Mostrar estado de memoria
echo -e "${BLUE}Estado de memoria:${NC}"
free -h
echo ""

# Iniciar contenedores
echo -e "${YELLOW}Iniciando contenedores...${NC}"
docker compose -f docker-compose.lightsail.yml up -d

# Esperar a que SQL Server esté listo
echo -e "${YELLOW}Esperando a que SQL Server esté listo...${NC}"
MAX_RETRIES=30
RETRY=0
while [ $RETRY -lt $MAX_RETRIES ]; do
    if docker compose -f docker-compose.lightsail.yml exec -T sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "${SQL_PASSWORD:-YourStrong@Passw0rd}" -Q "SELECT 1" -C -b > /dev/null 2>&1; then
        echo -e "${GREEN}✅ SQL Server está listo${NC}"
        break
    fi
    RETRY=$((RETRY + 1))
    echo -e "   Intento $RETRY/$MAX_RETRIES..."
    sleep 5
done

if [ $RETRY -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ SQL Server no respondió después de $MAX_RETRIES intentos${NC}"
    echo -e "${YELLOW}Revisa los logs: docker compose -f docker-compose.lightsail.yml logs sqlserver${NC}"
    exit 1
fi

# Mostrar estado
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Aplicación iniciada               ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
docker compose -f docker-compose.lightsail.yml ps
echo ""
echo -e "${BLUE}Accesos:${NC}"
echo -e "  Frontend: ${GREEN}http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_IP')/${NC}"
echo -e "  API Docs: ${GREEN}http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_IP'):8000/docs${NC}"
echo ""
echo -e "${YELLOW}Si es la primera vez, ejecuta:${NC}"
echo -e "  ./init-db.sh"
