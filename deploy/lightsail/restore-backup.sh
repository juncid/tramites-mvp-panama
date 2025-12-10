#!/bin/bash
# =============================================================================
# Script para restaurar backup de base de datos en Lightsail
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

BACKUP_FILE="../../database/backups/sim_panama_latest.bak"
CONTAINER_BACKUP_PATH="/var/opt/mssql/backup/sim_panama_latest.bak"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Restaurando Base de Datos           ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Verificar archivo de backup
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Error: No se encuentra el archivo de backup en:${NC}"
    echo -e "   $BACKUP_FILE"
    exit 1
fi

# Verificar que los contenedores estén corriendo
if ! docker compose -f docker-compose.lightsail.yml ps | grep -qE "running|Up"; then
    echo -e "${RED}❌ Error: Los contenedores no están corriendo${NC}"
    echo -e "${YELLOW}Ejecuta primero: ./start.sh${NC}"
    exit 1
fi

# Cargar variables de entorno
source .env 2>/dev/null || true
DB_PASSWORD="${SQL_PASSWORD:-YourStrong@Passw0rd}"

# Esperar a que SQL Server esté listo
echo -e "${YELLOW}[1/3] Verificando SQL Server...${NC}"
MAX_RETRIES=120
RETRY=0

while [ $RETRY -lt $MAX_RETRIES ]; do
    if docker compose -f docker-compose.lightsail.yml exec -T sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -Q "SELECT 1" -C -b > /dev/null 2>&1; then
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

# Copiar backup al contenedor
echo -e "${YELLOW}[2/3] Copiando backup al contenedor...${NC}"
docker cp "$BACKUP_FILE" tramites-sqlserver:"$CONTAINER_BACKUP_PATH"
echo -e "${GREEN}✅ Backup copiado${NC}"

# Restaurar base de datos
echo -e "${YELLOW}[3/3] Restaurando base de datos...${NC}"
echo -e "${BLUE}Esto puede tomar unos momentos...${NC}"

# Comando de restauración
# Nota: Se usa WITH REPLACE para sobrescribir si existe
# Se mueven los archivos lógicos a la ruta correcta en Linux
RESTORE_CMD="RESTORE DATABASE SIM_PANAMA FROM DISK = '$CONTAINER_BACKUP_PATH' WITH REPLACE, MOVE 'SIM_PANAMA' TO '/var/opt/mssql/data/SIM_PANAMA.mdf', MOVE 'SIM_PANAMA_log' TO '/var/opt/mssql/data/SIM_PANAMA_log.ldf'"

if docker compose -f docker-compose.lightsail.yml exec -T sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C -Q "$RESTORE_CMD" -b; then
    echo -e "${GREEN}✅ Base de datos restaurada exitosamente${NC}"
else
    echo -e "${RED}❌ Error al restaurar la base de datos${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Proceso Completado               ${NC}"
echo -e "${GREEN}========================================${NC}"
