#!/bin/bash
# Script de despliegue vía GIT
# REQUISITO: Los cambios locales deben haber sido subidos al repositorio remoto (git push) antes de ejecutar este script.

KEY_FILE="deploy/lightsail/KeyPairForWSL.pem"
REMOTE_USER="ubuntu"
REMOTE_DIR="tramites-mvp-panama" # Directorio del repo en el servidor
BRANCH="main"

if [ -z "$1" ]; then
    echo "Uso: $0 <IP_ADDRESS>"
    echo "Ejemplo: $0 23.23.20.56"
    exit 1
fi

HOST=$1

# Verificar permisos de la llave
if [ ! -f "$KEY_FILE" ]; then
    echo "Error: No se encuentra la llave $KEY_FILE"
    exit 1
fi

chmod 400 "$KEY_FILE"

echo "========================================================"
echo "Iniciando despliegue GIT a $REMOTE_USER@$HOST"
echo "Rama: $BRANCH"
echo "========================================================"

ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no $REMOTE_USER@$HOST << EOF
    set -e
    
    # 1. Verificar si existe el directorio
    if [ ! -d "$REMOTE_DIR" ]; then
        echo "Error: El directorio $REMOTE_DIR no existe en el servidor."
        echo "Por favor clona el repositorio primero."
        exit 1
    fi

    cd $REMOTE_DIR
    
    # 2. Actualizar código
    echo "[1/3] Descargando últimos cambios de git..."
    git fetch origin
    git reset --hard origin/$BRANCH
    
    # 3. Despliegue Docker
    echo "[2/3] Reiniciando contenedores..."
    cd deploy/lightsail
    
    # Bajar servicios para asegurar limpieza
    docker compose -f docker-compose.lightsail.yml down
    
    # Levantar reconstruyendo imágenes (para tomar cambios de Dockerfile/Nginx)
    docker compose -f docker-compose.lightsail.yml up --build -d
    
    # 4. Limpieza
    echo "[3/3] Limpiando imágenes antiguas..."
    docker system prune -f
    
    echo "========================================================"
    echo "✅ Despliegue completado. Estado actual:"
    docker compose -f docker-compose.lightsail.yml ps
EOF
