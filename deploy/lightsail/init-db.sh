#!/bin/bash
# =============================================================================
# Script para inicializar la base de datos (solo primera vez)
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
echo -e "${BLUE}  Inicializando Base de Datos         ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Verificar que los contenedores estén corriendo
if ! docker compose -f docker-compose.lightsail.yml ps | grep -q "running"; then
    echo -e "${RED}❌ Error: Los contenedores no están corriendo${NC}"
    echo -e "${YELLOW}Ejecuta primero: ./start.sh${NC}"
    exit 1
fi

# Esperar a que SQL Server esté listo
echo -e "${YELLOW}[1/4] Verificando SQL Server...${NC}"
MAX_RETRIES=120
RETRY=0
source .env 2>/dev/null || true

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
    echo -e "${RED}❌ SQL Server no respondió${NC}"
    exit 1
fi

# Inicializar base de datos
echo -e "${YELLOW}[2/4] Creando base de datos...${NC}"
docker compose -f docker-compose.lightsail.yml exec -T backend python /app/scripts/init_database.py
echo -e "${GREEN}✅ Base de datos creada${NC}"

# Aplicar migraciones
echo -e "${YELLOW}[3/4] Aplicando migraciones...${NC}"
docker compose -f docker-compose.lightsail.yml exec -T backend alembic stamp head
docker compose -f docker-compose.lightsail.yml exec -T backend alembic upgrade head
echo -e "${GREEN}✅ Migraciones aplicadas${NC}"

# Preguntar si cargar datos de prueba
echo ""
read -p "¿Cargar datos de prueba? (s/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}[4/4] Cargando datos de prueba...${NC}"
    docker compose -f docker-compose.lightsail.yml exec -T backend python /app/scripts/seed_test_data.py --all
    echo -e "${GREEN}✅ Datos de prueba cargados${NC}"
else
    echo -e "${BLUE}[4/4] Saltando datos de prueba${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Base de datos inicializada        ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}La aplicación está lista para usar:${NC}"
echo -e "  Frontend: ${GREEN}http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_IP')/${NC}"
echo -e "  API Docs: ${GREEN}http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_IP'):8000/docs${NC}"
