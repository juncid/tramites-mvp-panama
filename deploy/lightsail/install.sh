#!/bin/bash
# =============================================================================
# Script de Instalación para AWS Lightsail - MVP (4GB RAM)
# Sistema de Trámites Migratorios de Panamá
# =============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Instalación MVP - Trámites Panamá   ${NC}"
echo -e "${BLUE}  AWS Lightsail (4GB RAM + Swap)      ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# =============================================================================
# 1. ACTUALIZAR SISTEMA
# =============================================================================
echo -e "${YELLOW}[1/7] Actualizando sistema...${NC}"
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git htop

# =============================================================================
# 2. CONFIGURAR SWAP (4GB)
# =============================================================================
echo -e "${YELLOW}[2/7] Configurando Swap de 4GB...${NC}"

# Verificar si ya existe swap
if [ -f /swapfile ]; then
    echo -e "${GREEN}Swap ya existe, saltando...${NC}"
else
    # Crear swap de 4GB
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    
    # Hacer permanente
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    
    # Ajustar swappiness (10 = usar swap solo cuando sea necesario)
    sudo sysctl vm.swappiness=10
    echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
    
    echo -e "${GREEN}Swap de 4GB configurado correctamente${NC}"
fi

# Mostrar memoria
echo -e "${BLUE}Estado de memoria:${NC}"
free -h

# =============================================================================
# 3. INSTALAR DOCKER
# =============================================================================
echo -e "${YELLOW}[3/7] Instalando Docker...${NC}"

if command -v docker &> /dev/null; then
    echo -e "${GREEN}Docker ya instalado${NC}"
else
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}Docker instalado correctamente${NC}"
fi

# =============================================================================
# 4. INSTALAR DOCKER COMPOSE
# =============================================================================
echo -e "${YELLOW}[4/7] Verificando Docker Compose...${NC}"

if docker compose version &> /dev/null; then
    echo -e "${GREEN}Docker Compose ya instalado${NC}"
else
    sudo apt install -y docker-compose-plugin
    echo -e "${GREEN}Docker Compose instalado correctamente${NC}"
fi

# =============================================================================
# 5. CONFIGURAR FIREWALL
# =============================================================================
echo -e "${YELLOW}[5/7] Configurando Firewall (UFW)...${NC}"

sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8000/tcp  # API (temporal, quitar en producción con nginx)
sudo ufw --force enable

echo -e "${GREEN}Firewall configurado${NC}"

# =============================================================================
# 6. CLONAR REPOSITORIO
# =============================================================================
echo -e "${YELLOW}[6/7] Preparando aplicación...${NC}"

APP_DIR="$HOME/tramites-panama"

if [ -d "$APP_DIR" ]; then
    echo -e "${GREEN}Directorio ya existe, actualizando...${NC}"
    cd $APP_DIR
    git pull origin main
else
    git clone https://github.com/juncid/tramites-mvp-panama.git $APP_DIR
    cd $APP_DIR
fi

# =============================================================================
# 7. CONFIGURAR VARIABLES DE ENTORNO
# =============================================================================
echo -e "${YELLOW}[7/7] Configurando variables de entorno...${NC}"

ENV_FILE="$APP_DIR/deploy/lightsail/.env"

if [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}Archivo .env ya existe${NC}"
else
    cat > $ENV_FILE << 'EOF'
# =============================================================================
# Variables de Entorno - MVP Lightsail
# =============================================================================

# SQL Server
SQL_PASSWORD=YourStrong@Passw0rd123!
DATABASE_NAME=SIM_PANAMA

# API URL (cambiar por tu dominio o IP pública)
API_URL=http://YOUR_PUBLIC_IP:8000/api/v1

# Opcional: Redis password (dejar vacío para MVP)
# REDIS_PASSWORD=
EOF
    
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edita el archivo .env con tus valores:${NC}"
    echo -e "   ${BLUE}nano $ENV_FILE${NC}"
fi

# =============================================================================
# RESUMEN
# =============================================================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Instalación completada           ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Próximos pasos:${NC}"
echo ""
echo -e "1. ${YELLOW}Editar variables de entorno:${NC}"
echo -e "   nano $ENV_FILE"
echo ""
echo -e "2. ${YELLOW}Iniciar los contenedores:${NC}"
echo -e "   cd $APP_DIR/deploy/lightsail"
echo -e "   docker compose -f docker-compose.lightsail.yml up -d"
echo ""
echo -e "3. ${YELLOW}Inicializar base de datos (primera vez):${NC}"
echo -e "   docker compose -f docker-compose.lightsail.yml exec backend python /app/scripts/init_database.py"
echo -e "   docker compose -f docker-compose.lightsail.yml exec backend alembic upgrade head"
echo ""
echo -e "4. ${YELLOW}Ver logs:${NC}"
echo -e "   docker compose -f docker-compose.lightsail.yml logs -f"
echo ""
echo -e "5. ${YELLOW}Verificar estado:${NC}"
echo -e "   docker compose -f docker-compose.lightsail.yml ps"
echo ""
echo -e "${BLUE}Memoria actual:${NC}"
free -h
echo ""
echo -e "${YELLOW}NOTA: Cierra y vuelve a abrir la sesión SSH para que Docker funcione sin sudo${NC}"
