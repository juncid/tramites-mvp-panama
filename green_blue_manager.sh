#!/bin/bash
# ==========================================
# SCRIPTS DE GESTIÓN GREEN-BLUE DEPLOYMENT
# Sistema de Trámites Migratorios de Panamá
# Fecha: 2025-10-14
# ==========================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# ==========================================
# FUNCIONES PRINCIPALES
# ==========================================

deploy_green_blue() {
    log "🚀 Iniciando despliegue Green-Blue..."
    
    # Paso 1: Validar pre-requisitos
    log "📋 Validando pre-requisitos..."
    if ! command -v docker &> /dev/null; then
        error "Docker no está instalado"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose no está instalado"
        exit 1
    fi
    
    # Paso 2: Levantar ambiente GREEN (actual)
    log "🟢 Levantando ambiente GREEN (producción actual)..."
    docker-compose -f docker-compose.green-blue.yml up -d sqlserver-green redis-green backend-green
    
    # Esperar a que GREEN esté saludable
    log "⏳ Esperando a que GREEN esté saludable..."
    wait_for_health "http://localhost:8000/health" "GREEN"
    
    # Paso 3: Levantar ambiente BLUE (nuevo)
    log "🔵 Levantando ambiente BLUE (migración)..."
    docker-compose -f docker-compose.green-blue.yml up -d sqlserver-blue redis-blue backend-blue
    
    # Esperar a que BLUE esté saludable
    log "⏳ Esperando a que BLUE esté saludable..."
    wait_for_health "http://localhost:8001/health" "BLUE"
    
    # Paso 4: Ejecutar migración
    log "🔄 Ejecutando migración Green-Blue..."
    docker-compose -f docker-compose.green-blue.yml run --rm migration-service
    
    # Paso 5: Verificar BLUE
    log "🔍 Verificando integridad del ambiente BLUE..."
    if verify_blue_environment; then
        log "✅ Ambiente BLUE verificado exitosamente"
    else
        error "❌ Fallo en verificación de BLUE"
        exit 1
    fi
    
    # Paso 6: Levantar proxy
    log "🔀 Levantando proxy nginx..."
    docker-compose -f docker-compose.green-blue.yml up -d nginx-proxy
    
    log "🎉 Despliegue Green-Blue completado exitosamente"
    log "🔗 Acceso a aplicación: http://localhost"
    log "🔗 Panel de salud: http://health.sim.local"
    log "📊 Para cambiar a BLUE: curl http://health.sim.local/switch/blue"
}

wait_for_health() {
    local url=$1
    local env_name=$2
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            log "✅ $env_name está saludable"
            return 0
        fi
        
        info "⏳ Intento $attempt/$max_attempts - $env_name no está listo, esperando..."
        sleep 10
        ((attempt++))
    done
    
    error "❌ $env_name no respondió después de $max_attempts intentos"
    return 1
}

verify_blue_environment() {
    log "🔍 Verificando ambiente BLUE..."
    
    # Test 1: Health check
    if ! curl -f -s "http://localhost:8001/health" > /dev/null; then
        error "❌ BLUE health check falló"
        return 1
    fi
    
    # Test 2: Conectividad a base de datos (a través del backend)
    local response=$(curl -s "http://localhost:8001/health" | grep -o '"database":"[^"]*"' | cut -d'"' -f4)
    if [ "$response" != "healthy" ]; then
        error "❌ Base de datos BLUE no está saludable"
        return 1
    fi
    
    log "✅ Ambiente BLUE verificado correctamente"
    return 0
}

switch_to_blue() {
    log "🔄 Cambiando tráfico a ambiente BLUE..."
    
    # Verificar que BLUE esté saludable
    if ! verify_blue_environment; then
        error "❌ BLUE no está saludable, no se puede hacer switchover"
        exit 1
    fi
    
    # Hacer el switchover
    info "🔀 Configurando nginx para dirigir tráfico a BLUE..."
    curl -s "http://health.sim.local/switch/blue" > /dev/null
    
    # Verificar switchover
    sleep 5
    local env_header=$(curl -s -I "http://localhost/health" | grep -i "X-Environment" | cut -d' ' -f2- | tr -d '\r\n')
    
    if [[ "$env_header" == *"blue"* ]]; then
        log "✅ Switchover exitoso - tráfico dirigido a BLUE"
        log "🔵 Ambiente BLUE está ahora activo"
        
        # Opcional: Detener ambiente GREEN después de un tiempo
        warning "💡 Para detener ambiente GREEN: ./green_blue_manager.sh stop-green"
    else
        error "❌ Switchover falló - tráfico sigue en GREEN"
        exit 1
    fi
}

switch_to_green() {
    log "🔄 Cambiando tráfico de vuelta a ambiente GREEN..."
    
    # Hacer el switchover de vuelta
    curl -s "http://health.sim.local/switch/green" > /dev/null
    
    # Verificar switchover
    sleep 5
    local env_header=$(curl -s -I "http://localhost/health" | grep -i "X-Environment" | cut -d' ' -f2- | tr -d '\r\n')
    
    if [[ "$env_header" == *"green"* ]]; then
        log "✅ Rollback exitoso - tráfico dirigido a GREEN"
        log "🟢 Ambiente GREEN está activo nuevamente"
    else
        error "❌ Rollback falló"
        exit 1
    fi
}

stop_green() {
    warning "⚠️ Deteniendo ambiente GREEN..."
    read -p "¿Estás seguro? El ambiente GREEN será detenido (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose -f docker-compose.green-blue.yml stop backend-green sqlserver-green redis-green
        log "🟢 Ambiente GREEN detenido"
    else
        info "Operación cancelada"
    fi
}

stop_blue() {
    warning "⚠️ Deteniendo ambiente BLUE..."
    read -p "¿Estás seguro? El ambiente BLUE será detenido (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose -f docker-compose.green-blue.yml stop backend-blue sqlserver-blue redis-blue
        log "🔵 Ambiente BLUE detenido"
    else
        info "Operación cancelada"
    fi
}

show_status() {
    log "📊 Estado de ambientes Green-Blue:"
    echo
    
    # Estado de contenedores
    echo "🐳 Estado de contenedores:"
    docker-compose -f docker-compose.green-blue.yml ps
    echo
    
    # Health checks
    echo "❤️ Health checks:"
    
    # GREEN
    if curl -f -s "http://localhost:8000/health" > /dev/null 2>&1; then
        echo -e "🟢 GREEN: ${GREEN}HEALTHY${NC} (http://localhost:8000)"
    else
        echo -e "🟢 GREEN: ${RED}UNHEALTHY${NC} (http://localhost:8000)"
    fi
    
    # BLUE
    if curl -f -s "http://localhost:8001/health" > /dev/null 2>&1; then
        echo -e "🔵 BLUE: ${GREEN}HEALTHY${NC} (http://localhost:8001)"
    else
        echo -e "🔵 BLUE: ${RED}UNHEALTHY${NC} (http://localhost:8001)"
    fi
    
    # Proxy status
    echo
    echo "🔀 Estado del proxy:"
    if curl -f -s "http://localhost/admin/status" > /dev/null 2>&1; then
        echo -e "📡 Proxy: ${GREEN}ACTIVE${NC}"
        echo "📄 Estado actual:"
        curl -s "http://localhost/admin/status"
    else
        echo -e "📡 Proxy: ${RED}INACTIVE${NC}"
    fi
    
    echo
    log "📋 Comandos útiles:"
    echo "  - Cambiar a BLUE: ./green_blue_manager.sh switch-blue"
    echo "  - Cambiar a GREEN: ./green_blue_manager.sh switch-green"
    echo "  - Detener GREEN: ./green_blue_manager.sh stop-green"
    echo "  - Detener BLUE: ./green_blue_manager.sh stop-blue"
}

cleanup() {
    warning "🧹 Limpiando todos los recursos Green-Blue..."
    read -p "¿Estás seguro? Todos los contenedores serán detenidos (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose -f docker-compose.green-blue.yml down --volumes --remove-orphans
        log "✅ Limpieza completada"
    else
        info "Operación cancelada"
    fi
}

# ==========================================
# ROUTER DE COMANDOS
# ==========================================

case "${1:-}" in
    deploy)
        deploy_green_blue
        ;;
    switch-blue)
        switch_to_blue
        ;;
    switch-green)
        switch_to_green
        ;;
    stop-green)
        stop_green
        ;;
    stop-blue)
        stop_blue
        ;;
    status)
        show_status
        ;;
    cleanup)
        cleanup
        ;;
    *)
        echo "🎛️ Gestor de Despliegue Green-Blue - SIM Panamá"
        echo
        echo "Uso: $0 {deploy|switch-blue|switch-green|stop-green|stop-blue|status|cleanup}"
        echo
        echo "Comandos:"
        echo "  deploy       - Despliega ambientes Green-Blue y ejecuta migración"
        echo "  switch-blue  - Cambia tráfico al ambiente BLUE"
        echo "  switch-green - Cambia tráfico al ambiente GREEN (rollback)"
        echo "  stop-green   - Detiene ambiente GREEN"
        echo "  stop-blue    - Detiene ambiente BLUE"
        echo "  status       - Muestra estado de ambos ambientes"
        echo "  cleanup      - Limpia todos los recursos"
        echo
        exit 1
        ;;
esac