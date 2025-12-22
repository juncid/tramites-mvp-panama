#!/bin/bash
# =============================================================================
# Script de Configuración SSL con Let's Encrypt para AWS Lightsail
# =============================================================================
# Uso: ./setup-ssl.sh <dominio>
# Ejemplo: ./setup-ssl.sh tramites.snm.gob.pa
# =============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar argumento
if [ -z "$1" ]; then
    echo -e "${RED}Error: Debe especificar un dominio${NC}"
    echo "Uso: $0 <dominio>"
    echo "Ejemplo: $0 tramites.snm.gob.pa"
    echo "         $0 23.23.20.56.nip.io"
    exit 1
fi

DOMAIN=$1
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CERT_DIR="/etc/letsencrypt"
EMAIL="${SSL_EMAIL:-admin@$DOMAIN}"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   Configuración SSL para: $DOMAIN${NC}"
echo -e "${BLUE}============================================${NC}"

# Verificar que estamos ejecutando como root o con sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}Este script necesita permisos de administrador${NC}"
    echo "Por favor, ejecute con: sudo $0 $DOMAIN"
    exit 1
fi

# Paso 1: Instalar Certbot
echo -e "\n${GREEN}[1/5] Instalando Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    apt-get update
    apt-get install -y certbot
    echo -e "${GREEN}✓ Certbot instalado${NC}"
else
    echo -e "${GREEN}✓ Certbot ya está instalado${NC}"
fi

# Paso 2: Detener servicios que usen puerto 80
echo -e "\n${GREEN}[2/5] Preparando para obtener certificado...${NC}"
cd "$SCRIPT_DIR"

# Detener frontend temporalmente si está corriendo
if docker ps | grep -q tramites-frontend; then
    echo "Deteniendo frontend temporalmente..."
    docker compose -f docker-compose.lightsail.yml stop frontend
fi

# Paso 3: Obtener certificado
echo -e "\n${GREEN}[3/5] Obteniendo certificado SSL...${NC}"
certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --domain "$DOMAIN" \
    --preferred-challenges http

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: No se pudo obtener el certificado SSL${NC}"
    echo "Verifique que:"
    echo "  1. El dominio $DOMAIN apunta a esta IP"
    echo "  2. El puerto 80 está abierto en el firewall"
    echo "  3. No hay otro servicio usando el puerto 80"
    exit 1
fi

echo -e "${GREEN}✓ Certificado SSL obtenido exitosamente${NC}"

# Paso 4: Crear directorio para certificados en el proyecto
echo -e "\n${GREEN}[4/5] Configurando certificados...${NC}"
CERTS_LOCAL="$SCRIPT_DIR/certs"
mkdir -p "$CERTS_LOCAL"

# Copiar certificados al directorio del proyecto
cp "$CERT_DIR/live/$DOMAIN/fullchain.pem" "$CERTS_LOCAL/"
cp "$CERT_DIR/live/$DOMAIN/privkey.pem" "$CERTS_LOCAL/"
chmod 644 "$CERTS_LOCAL/fullchain.pem"
chmod 600 "$CERTS_LOCAL/privkey.pem"

# Actualizar el archivo .env con el dominio
if [ -f "$SCRIPT_DIR/.env" ]; then
    # Agregar o actualizar DOMAIN en .env
    if grep -q "^DOMAIN=" "$SCRIPT_DIR/.env"; then
        sed -i "s|^DOMAIN=.*|DOMAIN=$DOMAIN|" "$SCRIPT_DIR/.env"
    else
        echo "DOMAIN=$DOMAIN" >> "$SCRIPT_DIR/.env"
    fi
    
    # Actualizar FRONTEND_URL para usar HTTPS
    sed -i "s|^FRONTEND_URL=http://|FRONTEND_URL=https://|" "$SCRIPT_DIR/.env"
fi

echo -e "${GREEN}✓ Certificados configurados en $CERTS_LOCAL${NC}"

# Paso 5: Configurar renovación automática
echo -e "\n${GREEN}[5/5] Configurando renovación automática...${NC}"

# Crear script de renovación
cat > /etc/letsencrypt/renewal-hooks/deploy/tramites-reload.sh << 'EOF'
#!/bin/bash
# Recargar nginx después de renovar certificado
cd /home/ubuntu/tramites-panama/deploy/lightsail
docker compose -f docker-compose.ssl.yml exec -T frontend nginx -s reload
EOF

chmod +x /etc/letsencrypt/renewal-hooks/deploy/tramites-reload.sh

# Verificar que el cron de certbot está activo
systemctl enable certbot.timer 2>/dev/null || true
systemctl start certbot.timer 2>/dev/null || true

echo -e "${GREEN}✓ Renovación automática configurada${NC}"

# Resumen final
echo -e "\n${BLUE}============================================${NC}"
echo -e "${GREEN}   ✓ SSL CONFIGURADO EXITOSAMENTE${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "Dominio: ${GREEN}$DOMAIN${NC}"
echo -e "Certificados: ${GREEN}$CERTS_LOCAL${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "1. Iniciar los servicios con SSL:"
echo "   docker compose -f docker-compose.ssl.yml up -d"
echo ""
echo "2. Verificar que funciona:"
echo "   curl -I https://$DOMAIN"
echo ""
echo -e "${YELLOW}Notas:${NC}"
echo "- El certificado se renovará automáticamente cada 60 días"
echo "- Los certificados están en: $CERTS_LOCAL"
echo "- Los logs de renovación están en: /var/log/letsencrypt/"
