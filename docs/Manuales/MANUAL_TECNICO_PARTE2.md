# 📘 MANUAL TÉCNICO - PARTE 2
## Sistema de Trámites Migratorios de Panamá

**Versión**: 2.0  
**Fecha**: 22 de Octubre, 2025  
**Autor**: Equipo de Desarrollo  
**Estado**: ✅ En Producción

---

## 📋 Tabla de Contenidos - Parte 2

- [5. Infraestructura y Deployment](#5-infraestructura-y-deployment)
  - [5.1 Arquitectura de Contenedores](#51-arquitectura-de-contenedores)
  - [5.2 Docker Compose](#52-docker-compose)
  - [5.3 Variables de Entorno](#53-variables-de-entorno)
  - [5.4 Proceso de Deployment](#54-proceso-de-deployment)
  - [5.5 Estrategia Blue-Green](#55-estrategia-blue-green)
  - [5.6 Escalabilidad](#56-escalabilidad)
- [6. Seguridad](#6-seguridad)
- [7. Monitoreo y Logs](#7-monitoreo-y-logs)
- [8. Troubleshooting](#8-troubleshooting)
- [9. Procedimientos de Mantenimiento](#9-procedimientos-de-mantenimiento)

---

## 5. Infraestructura y Deployment

### 5.1 Arquitectura de Contenedores

El sistema utiliza **Docker** y **Docker Compose** para orquestar múltiples servicios en contenedores. Esta arquitectura proporciona:

- ✅ **Portabilidad**: Funciona igual en desarrollo, staging y producción
- ✅ **Aislamiento**: Cada servicio corre en su propio contenedor
- ✅ **Escalabilidad**: Fácil escalar servicios individuales
- ✅ **Consistencia**: Mismas versiones de dependencias en todos los entornos

#### Diagrama de Contenedores

```
┌─────────────────────────────────────────────────────────────────┐
│                        DOCKER HOST                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   NGINX     │  │   Backend   │  │  Frontend   │            │
│  │  Reverse    │  │   FastAPI   │  │    React    │            │
│  │   Proxy     │  │   (Uvicorn) │  │    + Vite   │            │
│  │   :80/443   │  │    :8000    │  │    :3000    │            │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘            │
│         │                │                                      │
│         │                │         ┌─────────────┐             │
│         │                └────────▶│   Redis     │             │
│         │                          │   Cache     │             │
│         │                          │    :6379    │             │
│         │                          └─────────────┘             │
│         │                                                       │
│         │                          ┌─────────────┐             │
│         └─────────────────────────▶│ SQL Server  │             │
│                                    │   Database  │             │
│                                    │    :1433    │             │
│                                    └─────────────┘             │
│                                                                 │
│  ┌────────────────────────────────────────────────────┐        │
│  │              Docker Network: tramites-network      │        │
│  └────────────────────────────────────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Servicios Principales

| Servicio | Contenedor | Puerto | Descripción |
|----------|-----------|--------|-------------|
| **nginx** | nginx:alpine | 80, 443 | Reverse proxy y SSL termination |
| **backend** | python:3.11-slim | 8000 | API REST con FastAPI |
| **frontend** | node:18-alpine | 3000 | Aplicación React |
| **db** | mcr.microsoft.com/mssql/server:2019-latest | 1433 | Base de datos SQL Server |
| **redis** | redis:7-alpine | 6379 | Caché en memoria |

---

### 5.2 Docker Compose

#### 5.2.1 Estructura de Archivos

El proyecto utiliza múltiples archivos Docker Compose para diferentes entornos:

```
tramites-mvp-panama/
├── docker-compose.yml              # Configuración base
├── config/
│   ├── docker-compose.dev.yml      # Desarrollo
│   ├── docker-compose.prod.yml     # Producción
│   ├── docker-compose.test.yml     # Testing
│   ├── docker-compose.green-blue.yml  # Blue-Green deployment
│   └── docker-compose.switchover.yml  # Switchover automation
└── backend/
    ├── Dockerfile                   # Imagen de desarrollo
    ├── Dockerfile.prod              # Imagen de producción
    └── Dockerfile.test              # Imagen de testing
```

#### 5.2.2 Docker Compose Principal

**Archivo**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  # Base de datos SQL Server
  db:
    image: mcr.microsoft.com/mssql/server:2019-latest
    container_name: tramites-db
    environment:
      ACCEPT_EULA: "Y"
      SA_PASSWORD: "${DB_PASSWORD}"
      MSSQL_PID: "Developer"
    ports:
      - "1433:1433"
    volumes:
      - db-data:/var/opt/mssql
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - tramites-network
    healthcheck:
      test: /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$${SA_PASSWORD}" -Q "SELECT 1"
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: tramites-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - tramites-network
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: tramites-backend
    environment:
      DATABASE_URL: "${DATABASE_URL}"
      REDIS_URL: "redis://redis:6379"
      SECRET_KEY: "${SECRET_KEY}"
      DEBUG: "${DEBUG:-False}"
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - backend-uploads:/app/uploads
    networks:
      - tramites-network
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  # Frontend React
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: tramites-frontend
    environment:
      VITE_API_URL: "${VITE_API_URL:-http://localhost:8000}"
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    networks:
      - tramites-network
    depends_on:
      - backend

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: tramites-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    networks:
      - tramites-network
    depends_on:
      - backend
      - frontend

networks:
  tramites-network:
    driver: bridge

volumes:
  db-data:
  redis-data:
  backend-uploads:
```

#### 5.2.3 Dockerfile del Backend

**Archivo**: `backend/Dockerfile`

```dockerfile
FROM python:3.11-slim

# Variables de entorno
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    unixodbc-dev \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Instalar SQL Server ODBC Driver
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY requirements.txt .
COPY pyproject.toml .

# Instalar dependencias Python
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copiar código de la aplicación
COPY . .

# Crear directorios necesarios
RUN mkdir -p uploads logs

# Exponer puerto
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Comando por defecto
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 5.2.4 Dockerfile de Producción

**Archivo**: `backend/Dockerfile.prod`

```dockerfile
FROM python:3.11-slim AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && apt-get install -y \
    gcc g++ unixodbc-dev curl gnupg \
    && rm -rf /var/lib/apt/lists/*

RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Imagen final
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH=/root/.local/bin:$PATH

RUN apt-get update && apt-get install -y \
    curl unixodbc \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /root/.local /root/.local
COPY --from=builder /opt/microsoft /opt/microsoft

WORKDIR /app
COPY . .

RUN mkdir -p uploads logs && \
    useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

---

### 5.3 Variables de Entorno

#### 5.3.1 Archivo .env de Ejemplo

**Archivo**: `.env.example`

```bash
# ==============================================
# CONFIGURACIÓN DE BASE DE DATOS
# ==============================================
DB_HOST=db
DB_PORT=1433
DB_NAME=TramitesMigratorios
DB_USER=sa
DB_PASSWORD=YourStrongPassword123!
DATABASE_URL=mssql+pyodbc://sa:YourStrongPassword123!@db:1433/TramitesMigratorios?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes

# ==============================================
# CONFIGURACIÓN DE REDIS
# ==============================================
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=
REDIS_DB=0

# ==============================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ==============================================
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=False
ENVIRONMENT=production
LOG_LEVEL=INFO

# ==============================================
# CONFIGURACIÓN DE CORS
# ==============================================
ALLOWED_ORIGINS=http://localhost:3000,https://tramites.gob.pa
CORS_ALLOW_CREDENTIALS=true

# ==============================================
# CONFIGURACIÓN DE FRONTEND
# ==============================================
VITE_API_URL=http://localhost:8000
VITE_APP_TITLE=Sistema de Trámites Migratorios

# ==============================================
# CONFIGURACIÓN DE EMAIL (Futuro)
# ==============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notificaciones@gob.pa
SMTP_PASSWORD=your-email-password
EMAIL_FROM=notificaciones@gob.pa

# ==============================================
# CONFIGURACIÓN DE ARCHIVOS
# ==============================================
UPLOAD_DIR=/app/uploads
MAX_UPLOAD_SIZE=10485760  # 10MB en bytes
ALLOWED_EXTENSIONS=pdf,jpg,jpeg,png,doc,docx

# ==============================================
# CONFIGURACIÓN DE JWT (Futuro)
# ==============================================
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# ==============================================
# CONFIGURACIÓN DE RATE LIMITING
# ==============================================
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=60  # segundos

# ==============================================
# CONFIGURACIÓN DE MONITOREO
# ==============================================
ENABLE_METRICS=true
METRICS_PORT=9090
SENTRY_DSN=
```

#### 5.3.2 Variables por Entorno

**Desarrollo** (`.env.dev`):
```bash
DEBUG=True
LOG_LEVEL=DEBUG
ENVIRONMENT=development
DATABASE_URL=mssql+pyodbc://sa:DevPassword123!@localhost:1433/TramitesMigratorios_Dev?driver=ODBC+Driver+18+for+SQL+Server
```

**Testing** (`.env.test`):
```bash
DEBUG=False
LOG_LEVEL=INFO
ENVIRONMENT=testing
DATABASE_URL=mssql+pyodbc://sa:TestPassword123!@localhost:1433/TramitesMigratorios_Test?driver=ODBC+Driver+18+for+SQL+Server
```

**Producción** (`.env.prod`):
```bash
DEBUG=False
LOG_LEVEL=WARNING
ENVIRONMENT=production
DATABASE_URL=mssql+pyodbc://sa:ProdPassword123!@db-prod:1433/TramitesMigratorios?driver=ODBC+Driver+18+for+SQL+Server
```

---

### 5.4 Proceso de Deployment

#### 5.4.1 Deployment Manual (Desarrollo)

```bash
# 1. Clonar el repositorio
git clone https://github.com/juncid/tramites-mvp-panama.git
cd tramites-mvp-panama

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores correctos

# 3. Construir imágenes
docker-compose build

# 4. Iniciar servicios
docker-compose up -d

# 5. Verificar salud de servicios
docker-compose ps
docker-compose logs -f backend

# 6. Inicializar base de datos
docker-compose exec backend python init_database.py
docker-compose exec backend python load_initial_data.py

# 7. Verificar API
curl http://localhost:8000/health
curl http://localhost:8000/docs
```

#### 5.4.2 Deployment en Producción

```bash
# 1. Preparar servidor
# Instalar Docker y Docker Compose en servidor de producción

# 2. Clonar repositorio en servidor
ssh user@production-server
git clone https://github.com/juncid/tramites-mvp-panama.git
cd tramites-mvp-panama

# 3. Configurar variables de producción
cp .env.example .env.prod
nano .env.prod  # Configurar valores de producción

# 4. Usar Docker Compose de producción
docker-compose -f config/docker-compose.prod.yml build

# 5. Iniciar servicios
docker-compose -f config/docker-compose.prod.yml up -d

# 6. Verificar logs
docker-compose -f config/docker-compose.prod.yml logs -f

# 7. Configurar backup automático
crontab -e
# Agregar: 0 2 * * * /path/to/backup_script.sh
```

#### 5.4.3 Script de Deployment Automatizado

**Archivo**: `scripts/deploy.sh`

```bash
#!/bin/bash

# Script de deployment automatizado
# Uso: ./scripts/deploy.sh [dev|prod]

set -e

ENVIRONMENT=${1:-dev}
COMPOSE_FILE="docker-compose.yml"

if [ "$ENVIRONMENT" = "prod" ]; then
    COMPOSE_FILE="config/docker-compose.prod.yml"
fi

echo "🚀 Iniciando deployment en entorno: $ENVIRONMENT"

# 1. Validar archivos de configuración
echo "✅ Validando configuración..."
if [ ! -f ".env" ]; then
    echo "❌ Error: Archivo .env no encontrado"
    exit 1
fi

# 2. Pull últimos cambios
echo "📥 Obteniendo últimos cambios..."
git pull origin main

# 3. Detener servicios actuales
echo "🛑 Deteniendo servicios actuales..."
docker-compose -f $COMPOSE_FILE down

# 4. Construir nuevas imágenes
echo "🔨 Construyendo imágenes..."
docker-compose -f $COMPOSE_FILE build --no-cache

# 5. Iniciar servicios
echo "▶️  Iniciando servicios..."
docker-compose -f $COMPOSE_FILE up -d

# 6. Esperar a que los servicios estén listos
echo "⏳ Esperando servicios..."
sleep 30

# 7. Verificar salud
echo "🔍 Verificando salud de servicios..."
docker-compose -f $COMPOSE_FILE ps

# 8. Ejecutar migraciones
echo "🗄️  Ejecutando migraciones de base de datos..."
docker-compose -f $COMPOSE_FILE exec -T backend alembic upgrade head

# 9. Verificar API
echo "✅ Verificando API..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ $HTTP_CODE -eq 200 ]; then
    echo "✅ Deployment exitoso!"
else
    echo "❌ Error en deployment (HTTP $HTTP_CODE)"
    exit 1
fi

# 10. Limpiar imágenes antiguas
echo "🧹 Limpiando imágenes antiguas..."
docker image prune -f

echo "🎉 Deployment completado exitosamente!"
```

---

### 5.5 Estrategia Blue-Green Deployment

#### 5.5.1 Concepto

El **Blue-Green Deployment** permite deployments con **cero downtime** manteniendo dos entornos idénticos:

- 🔵 **Blue (Azul)**: Entorno activo que sirve tráfico de producción
- 🟢 **Green (Verde)**: Entorno inactivo donde se despliega la nueva versión

```
┌────────────────────────────────────────────────────────────┐
│                   DEPLOYMENT TRADICIONAL                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Usuarios → [v1.0] → ❌ DOWN → [v1.1] ← Usuarios         │
│             └──────────────────────┘                       │
│                  ⏱️ Downtime: 5-10 min                     │
│                                                            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                  BLUE-GREEN DEPLOYMENT                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Paso 1: Blue activo, Green preparándose                  │
│  Usuarios → [Blue v1.0] ✅                                │
│              [Green v1.1] 🔧 (preparando)                 │
│                                                            │
│  Paso 2: Switch instantáneo                               │
│  Usuarios → [Blue v1.0]                                   │
│              [Green v1.1] ✅ ← Usuarios                   │
│                                                            │
│  Paso 3: Rollback inmediato si hay problemas             │
│  Usuarios ← [Blue v1.0] ✅ (revertir)                     │
│              [Green v1.1] ❌                              │
│                                                            │
│                  ⏱️ Downtime: 0 segundos                   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### 5.5.2 Configuración Blue-Green

**Archivo**: `config/docker-compose.green-blue.yml`

```yaml
version: '3.8'

services:
  # ==========================================
  # ENTORNO BLUE (PRODUCCIÓN ACTIVA)
  # ==========================================
  backend-blue:
    build:
      context: ../backend
      dockerfile: Dockerfile.prod
    container_name: tramites-backend-blue
    environment:
      DATABASE_URL: "${DATABASE_URL}"
      REDIS_URL: "redis://redis:6379/0"
      ENVIRONMENT: "production-blue"
      COLOR: "blue"
    ports:
      - "8001:8000"
    networks:
      - tramites-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend-blue.rule=Host(`api.tramites.gob.pa`) && Headers(`X-Color`, `blue`)"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  frontend-blue:
    build:
      context: ../frontend
      dockerfile: Dockerfile.prod
    container_name: tramites-frontend-blue
    environment:
      VITE_API_URL: "https://api.tramites.gob.pa"
      VITE_COLOR: "blue"
    ports:
      - "3001:80"
    networks:
      - tramites-network

  # ==========================================
  # ENTORNO GREEN (STAGING/NUEVA VERSIÓN)
  # ==========================================
  backend-green:
    build:
      context: ../backend
      dockerfile: Dockerfile.prod
    container_name: tramites-backend-green
    environment:
      DATABASE_URL: "${DATABASE_URL}"
      REDIS_URL: "redis://redis:6379/1"
      ENVIRONMENT: "production-green"
      COLOR: "green"
    ports:
      - "8002:8000"
    networks:
      - tramites-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend-green.rule=Host(`api.tramites.gob.pa`) && Headers(`X-Color`, `green`)"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  frontend-green:
    build:
      context: ../frontend
      dockerfile: Dockerfile.prod
    container_name: tramites-frontend-green
    environment:
      VITE_API_URL: "https://api.tramites.gob.pa"
      VITE_COLOR: "green"
    ports:
      - "3002:80"
    networks:
      - tramites-network

  # ==========================================
  # LOAD BALANCER / ROUTER
  # ==========================================
  nginx-router:
    image: nginx:alpine
    container_name: tramites-router
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx-router.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    networks:
      - tramites-network
    depends_on:
      - backend-blue
      - backend-green

networks:
  tramites-network:
    driver: bridge
```

#### 5.5.3 Configuración de Nginx Router

**Archivo**: `nginx/nginx-router.conf`

```nginx
# Variable que controla qué entorno está activo
# Valores: "blue" o "green"
geo $active_env {
    default "blue";
}

upstream backend_blue {
    server backend-blue:8000;
}

upstream backend_green {
    server backend-green:8000;
}

upstream frontend_blue {
    server frontend-blue:80;
}

upstream frontend_green {
    server frontend-green:80;
}

# Mapeo dinámico basado en la variable activa
map $active_env $backend_upstream {
    "blue"  backend_blue;
    "green" backend_green;
}

map $active_env $frontend_upstream {
    "blue"  frontend_blue;
    "green" frontend_green;
}

server {
    listen 80;
    server_name tramites.gob.pa;
    
    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tramites.gob.pa;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # API Backend
    location /api/ {
        proxy_pass http://$backend_upstream/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Health check bypass
        if ($request_uri = "/api/health") {
            proxy_pass http://$backend_upstream/health;
        }
    }

    # Frontend
    location / {
        proxy_pass http://$frontend_upstream/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Endpoint para cambiar entorno (protegido)
    location /admin/switch {
        allow 10.0.0.0/8;  # Solo red interna
        deny all;
        
        # Script para cambiar variable
        default_type text/plain;
        return 200 "Current: $active_env\n";
    }
}
```

#### 5.5.4 Script de Switchover

**Archivo**: `scripts/switchover.sh`

```bash
#!/bin/bash

# Script para cambiar entre Blue y Green
# Uso: ./scripts/switchover.sh [blue|green]

set -e

TARGET_ENV=${1:-green}
CURRENT_ENV=$(grep "default" nginx/nginx-router.conf | awk '{print $2}' | tr -d '";')

echo "🔄 Switchover de $CURRENT_ENV a $TARGET_ENV"

# 1. Verificar salud del entorno destino
echo "🔍 Verificando salud de $TARGET_ENV..."
if [ "$TARGET_ENV" = "green" ]; then
    HEALTH_URL="http://localhost:8002/health"
else
    HEALTH_URL="http://localhost:8001/health"
fi

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)
if [ $HTTP_CODE -ne 200 ]; then
    echo "❌ Error: $TARGET_ENV no está saludable (HTTP $HTTP_CODE)"
    exit 1
fi

echo "✅ $TARGET_ENV está saludable"

# 2. Crear backup de configuración actual
echo "💾 Creando backup de configuración..."
cp nginx/nginx-router.conf nginx/nginx-router.conf.backup

# 3. Actualizar configuración de Nginx
echo "📝 Actualizando configuración..."
sed -i "s/default \"$CURRENT_ENV\"/default \"$TARGET_ENV\"/" nginx/nginx-router.conf

# 4. Recargar Nginx sin downtime
echo "🔄 Recargando Nginx..."
docker-compose -f config/docker-compose.green-blue.yml exec nginx-router nginx -s reload

# 5. Verificar que el cambio fue exitoso
sleep 2
NEW_ENV=$(grep "default" nginx/nginx-router.conf | awk '{print $2}' | tr -d '";')

if [ "$NEW_ENV" = "$TARGET_ENV" ]; then
    echo "✅ Switchover exitoso: $CURRENT_ENV → $TARGET_ENV"
    echo "🎉 El entorno $TARGET_ENV ahora está sirviendo tráfico"
else
    echo "❌ Error en switchover"
    # Rollback
    cp nginx/nginx-router.conf.backup nginx/nginx-router.conf
    docker-compose -f config/docker-compose.green-blue.yml exec nginx-router nginx -s reload
    echo "↩️  Rollback realizado"
    exit 1
fi

# 6. Monitorear por 60 segundos
echo "📊 Monitoreando por 60 segundos..."
for i in {1..12}; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://tramites.gob.pa/api/health)
    if [ $HTTP_CODE -eq 200 ]; then
        echo "✅ Check $i/12: OK"
    else
        echo "❌ Check $i/12: FAILED (HTTP $HTTP_CODE)"
        echo "⚠️  Considera hacer rollback con: ./scripts/switchover.sh $CURRENT_ENV"
        exit 1
    fi
    sleep 5
done

echo "🎉 Switchover completado y verificado exitosamente!"
echo "💡 El entorno $CURRENT_ENV ahora puede ser actualizado"
```

#### 5.5.5 Proceso de Deployment Blue-Green

```bash
# PASO 1: Estado inicial (Blue activo)
docker-compose -f config/docker-compose.green-blue.yml ps
# backend-blue:  ✅ Running (sirviendo tráfico)
# backend-green: ✅ Running (standby)

# PASO 2: Actualizar código en Green
git pull origin main
docker-compose -f config/docker-compose.green-blue.yml build backend-green frontend-green

# PASO 3: Deploy en Green (sin afectar Blue)
docker-compose -f config/docker-compose.green-blue.yml up -d backend-green frontend-green

# PASO 4: Ejecutar migraciones en Green
docker-compose -f config/docker-compose.green-blue.yml exec backend-green alembic upgrade head

# PASO 5: Smoke tests en Green
curl http://localhost:8002/health
curl http://localhost:8002/tramites?limit=5

# PASO 6: Switchover (cambiar tráfico a Green)
./scripts/switchover.sh green

# PASO 7: Monitorear logs de Green
docker-compose -f config/docker-compose.green-blue.yml logs -f backend-green

# PASO 8 (Opcional): Rollback si hay problemas
# ./scripts/switchover.sh blue

# PASO 9: Una vez estable, actualizar Blue con la misma versión
docker-compose -f config/docker-compose.green-blue.yml build backend-blue frontend-blue
docker-compose -f config/docker-compose.green-blue.yml up -d backend-blue frontend-blue
```

---

### 5.6 Escalabilidad

#### 5.6.1 Escalado Horizontal

Para manejar mayor carga, se pueden ejecutar múltiples instancias del backend:

```bash
# Escalar backend a 3 instancias
docker-compose up -d --scale backend=3

# Verificar instancias
docker-compose ps backend
```

**Configuración con Load Balancer**:

```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G
    networks:
      - tramites-network

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/nginx-lb.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
```

**Nginx Load Balancer** (`nginx/nginx-lb.conf`):

```nginx
upstream backend_cluster {
    least_conn;  # Algoritmo de balanceo
    server backend_1:8000 max_fails=3 fail_timeout=30s;
    server backend_2:8000 max_fails=3 fail_timeout=30s;
    server backend_3:8000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;

    location / {
        proxy_pass http://backend_cluster;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_next_upstream error timeout http_500 http_502 http_503;
    }
}
```

#### 5.6.2 Límites de Recursos

**Por Contenedor**:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'      # Máximo 2 CPUs
          memory: 4G        # Máximo 4GB RAM
        reservations:
          cpus: '1.0'      # Mínimo 1 CPU
          memory: 2G        # Mínimo 2GB RAM
    
  db:
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 8G
        reservations:
          cpus: '2.0'
          memory: 4G
```

#### 5.6.3 Auto-scaling con Docker Swarm

Para entornos de producción grandes:

```bash
# Inicializar Swarm
docker swarm init

# Deploy con auto-scaling
docker stack deploy -c docker-compose.swarm.yml tramites

# Ver servicios
docker service ls

# Escalar dinámicamente
docker service scale tramites_backend=5
```

**Archivo**: `docker-compose.swarm.yml`

```yaml
version: '3.8'

services:
  backend:
    image: tramites-backend:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        max_attempts: 3
      placement:
        constraints:
          - node.role == worker
```

---

## 6. Seguridad

### 6.1 Principios de Seguridad

El sistema implementa seguridad en múltiples capas siguiendo el principio de **Defensa en Profundidad**:

```
┌────────────────────────────────────────────────────────┐
│              CAPAS DE SEGURIDAD                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Capa 7: Aplicación                                   │
│  ├── Validación de inputs (Pydantic)                  │
│  ├── Sanitización de datos                            │
│  ├── CSRF protection                                   │
│  └── Rate limiting                                     │
│                                                        │
│  Capa 6: Autenticación y Autorización                 │
│  ├── JWT tokens (futuro)                              │
│  ├── Session management                                │
│  ├── Role-based access control (RBAC)                 │
│  └── API key validation                                │
│                                                        │
│  Capa 5: Transporte                                   │
│  ├── HTTPS/TLS 1.3                                    │
│  ├── SSL certificates                                  │
│  └── Secure headers                                    │
│                                                        │
│  Capa 4: Red                                          │
│  ├── Firewall rules                                   │
│  ├── VPC/Private networks                             │
│  ├── DDoS protection                                   │
│  └── IP whitelisting                                   │
│                                                        │
│  Capa 3: Infraestructura                              │
│  ├── Container isolation (Docker)                     │
│  ├── Non-root users                                   │
│  ├── Read-only filesystems                            │
│  └── Security scanning                                 │
│                                                        │
│  Capa 2: Base de Datos                                │
│  ├── Encrypted connections                            │
│  ├── Principle of least privilege                     │
│  ├── SQL injection prevention                         │
│  └── Data encryption at rest                          │
│                                                        │
│  Capa 1: Sistema Operativo                            │
│  ├── OS hardening                                     │
│  ├── Security updates                                  │
│  ├── Audit logs                                       │
│  └── Intrusion detection                              │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 6.2 Configuración de HTTPS/SSL

#### 6.2.1 Certificados SSL con Let's Encrypt

**Script de instalación** (`scripts/setup-ssl.sh`):

```bash
#!/bin/bash

# Instalar Certbot
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Obtener certificado
certbot --nginx -d tramites.gob.pa -d www.tramites.gob.pa \
    --non-interactive \
    --agree-tos \
    --email admin@gob.pa

# Renovación automática
echo "0 0,12 * * * root certbot renew --quiet" >> /etc/crontab

# Verificar
certbot certificates
```

#### 6.2.2 Configuración Nginx con SSL

**Archivo**: `nginx/nginx-ssl.conf`

```nginx
server {
    listen 80;
    server_name tramites.gob.pa www.tramites.gob.pa;
    
    # Redirigir HTTP a HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
    
    # Permitir renovación de certificados
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}

server {
    listen 443 ssl http2;
    server_name tramites.gob.pa www.tramites.gob.pa;

    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/tramites.gob.pa/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tramites.gob.pa/privkey.pem;
    
    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    
    # HSTS (Strict Transport Security)
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/tramites.gob.pa/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    location / {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6.3 Autenticación y Autorización

#### 6.3.1 Implementación JWT (Futuro)

**Archivo**: `app/auth/jwt.py`

```python
from datetime import datetime, timedelta
from typing import Optional
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext

# Configuración
SECRET_KEY = "your-secret-key-here"  # Debe venir de .env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Hash de contraseñas
def hash_password(password: str) -> str:
    """Hash de contraseña con bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar contraseña"""
    return pwd_context.verify(plain_password, hashed_password)

# Generación de tokens
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crear token de acceso JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    """Crear refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Verificación de tokens
def verify_token(token: str) -> dict:
    """Verificar y decodificar token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

# Dependency para proteger endpoints
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Obtener usuario actual desde token JWT"""
    token = credentials.credentials
    payload = verify_token(token)
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas"
        )
    
    # Aquí buscarías el usuario en la base de datos
    # user = get_user_by_id(user_id)
    return {"user_id": user_id, "email": payload.get("email")}

# Dependency para verificar roles
def require_role(required_role: str):
    """Decorator para requerir rol específico"""
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permisos insuficientes"
            )
        return current_user
    return role_checker
```

#### 6.3.2 Endpoints de Autenticación

```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    """Login de usuario"""
    # Buscar usuario en base de datos
    user = get_user_by_email(credentials.email)
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    # Crear tokens
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role}
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id)}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str):
    """Renovar access token"""
    payload = verify_token(refresh_token)
    
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de tipo incorrecto"
        )
    
    access_token = create_access_token(
        data={"sub": payload.get("sub")}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout de usuario"""
    # Invalidar tokens (agregar a blacklist en Redis)
    return {"message": "Logout exitoso"}

# Ejemplo de endpoint protegido
@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Obtener información del usuario actual"""
    return current_user

# Ejemplo de endpoint con rol requerido
@router.get("/admin/users")
async def list_users(admin: dict = Depends(require_role("admin"))):
    """Listar usuarios (solo admin)"""
    return {"users": []}
```

### 6.4 Validación y Sanitización de Datos

#### 6.4.1 Validación con Pydantic

```python
from pydantic import BaseModel, validator, Field
from typing import Optional
import re

class TramiteCreate(BaseModel):
    tipo_tramite_id: int = Field(..., gt=0, description="ID del tipo de trámite")
    solicitante_nombre: str = Field(..., min_length=3, max_length=100)
    solicitante_cedula: str = Field(..., pattern=r'^\d{1,2}-\d{1,4}-\d{1,6}$')
    solicitante_email: str = Field(..., regex=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    descripcion: Optional[str] = Field(None, max_length=1000)
    
    @validator('solicitante_nombre')
    def validate_nombre(cls, v):
        """Validar que el nombre no contenga caracteres peligrosos"""
        if re.search(r'[<>\"\'%;()&+]', v):
            raise ValueError('El nombre contiene caracteres no permitidos')
        return v.strip().title()
    
    @validator('descripcion')
    def sanitize_descripcion(cls, v):
        """Sanitizar descripción"""
        if v:
            # Remover HTML tags
            v = re.sub(r'<[^>]+>', '', v)
            # Remover caracteres de control
            v = re.sub(r'[\x00-\x1F\x7F]', '', v)
        return v

    class Config:
        # No permitir campos extra
        extra = 'forbid'
```

#### 6.4.2 Prevención de SQL Injection

✅ **Buenas prácticas implementadas**:

```python
from sqlalchemy import text

# ✅ CORRECTO: Usar parámetros
def get_tramite_seguro(db: Session, tramite_id: int):
    stmt = text("SELECT * FROM tramites WHERE id = :id")
    result = db.execute(stmt, {"id": tramite_id})
    return result.fetchone()

# ✅ CORRECTO: Usar ORM
def get_tramite_orm(db: Session, tramite_id: int):
    return db.query(Tramite).filter(Tramite.id == tramite_id).first()

# ❌ INCORRECTO: Concatenación directa
def get_tramite_inseguro(db: Session, tramite_id: str):
    # ¡NUNCA HACER ESTO!
    query = f"SELECT * FROM tramites WHERE id = {tramite_id}"
    result = db.execute(text(query))
    return result.fetchone()
```

### 6.5 Rate Limiting

#### 6.5.1 Implementación con Redis

**Archivo**: `app/middleware/rate_limit.py`

```python
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
import redis
import time

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, redis_client: redis.Redis, 
                 requests: int = 100, window: int = 60):
        super().__init__(app)
        self.redis = redis_client
        self.max_requests = requests
        self.window_seconds = window
    
    async def dispatch(self, request: Request, call_next):
        # Identificar cliente (IP o user_id)
        client_id = request.client.host
        
        # Key en Redis
        key = f"rate_limit:{client_id}"
        
        # Obtener contador actual
        current = self.redis.get(key)
        
        if current is None:
            # Primera request
            self.redis.setex(key, self.window_seconds, 1)
        else:
            current_count = int(current)
            if current_count >= self.max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Límite de {self.max_requests} requests por {self.window_seconds}s excedido"
                )
            self.redis.incr(key)
        
        # Procesar request
        response = await call_next(request)
        
        # Agregar headers informativos
        response.headers["X-RateLimit-Limit"] = str(self.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(
            self.max_requests - int(self.redis.get(key) or 0)
        )
        
        return response

# Uso en main.py
from app.middleware.rate_limit import RateLimitMiddleware
from app.redis_client import get_redis

app.add_middleware(
    RateLimitMiddleware,
    redis_client=get_redis(),
    requests=100,  # 100 requests
    window=60      # por 60 segundos
)
```

### 6.6 Seguridad de Archivos

#### 6.6.1 Validación de Uploads

```python
from fastapi import UploadFile, HTTPException
import magic  # python-magic
import hashlib

ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_file(file: UploadFile):
    """Validar archivo subido"""
    
    # 1. Validar extensión
    ext = file.filename.split('.')[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de archivo no permitido. Permitidos: {ALLOWED_EXTENSIONS}"
        )
    
    # 2. Validar tamaño
    file.file.seek(0, 2)  # Ir al final
    size = file.file.tell()
    file.file.seek(0)  # Volver al inicio
    
    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Archivo muy grande. Máximo: {MAX_FILE_SIZE/1024/1024}MB"
        )
    
    # 3. Validar MIME type real (no confiar en extensión)
    content = file.file.read(1024)
    file.file.seek(0)
    mime = magic.from_buffer(content, mime=True)
    
    allowed_mimes = {
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
    
    if mime not in allowed_mimes:
        raise HTTPException(
            status_code=400,
            detail=f"MIME type no permitido: {mime}"
        )
    
    return True

def sanitize_filename(filename: str) -> str:
    """Sanitizar nombre de archivo"""
    # Remover caracteres peligrosos
    import re
    filename = re.sub(r'[^\w\s.-]', '', filename)
    # Generar nombre único
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    hash_part = hashlib.md5(filename.encode()).hexdigest()[:8]
    ext = filename.split('.')[-1]
    return f"{timestamp}_{hash_part}.{ext}"

@app.post("/upload")
async def upload_file(file: UploadFile):
    """Upload seguro de archivo"""
    # Validar
    validate_file(file)
    
    # Sanitizar nombre
    safe_filename = sanitize_filename(file.filename)
    file_path = f"/app/uploads/{safe_filename}"
    
    # Guardar
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    return {"filename": safe_filename, "size": len(content)}
```

### 6.7 Hardening de Docker

#### 6.7.1 Dockerfile Seguro

```dockerfile
FROM python:3.11-slim

# Ejecutar como non-root user
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app /app/uploads /app/logs && \
    chown -R appuser:appuser /app

# Instalar dependencias como root
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r /app/requirements.txt

# Cambiar a usuario no privilegiado
USER appuser
WORKDIR /app

# Copiar código
COPY --chown=appuser:appuser . /app

# Filesystem read-only (excepto uploads y logs)
VOLUME ["/app/uploads", "/app/logs"]

# Security options
LABEL security.no-new-privileges=true

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 6.7.2 Docker Compose Seguro

```yaml
services:
  backend:
    build: ./backend
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    read_only: true
    tmpfs:
      - /tmp
    volumes:
      - ./uploads:/app/uploads:rw
      - ./logs:/app/logs:rw
```

---

## 7. Monitoreo y Logs

### 7.1 Sistema de Logging

#### 7.1.1 Configuración Actual

El sistema utiliza **Python logging** con formato estructurado y UUID para trazabilidad.

**Archivo**: `app/middleware.py`

```python
import logging
import uuid
from datetime import datetime
from fastapi import Request
import time

# Configuración de logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware para logging de requests"""
    
    # Generar UUID único para esta request
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    # Log de entrada
    start_time = time.time()
    logger.info(f"[{request_id}] {request.method} {request.url.path} - START")
    
    try:
        response = await call_next(request)
        
        # Calcular duración
        duration = time.time() - start_time
        
        # Log de salida
        logger.info(
            f"[{request_id}] {request.method} {request.url.path} - "
            f"Status: {response.status_code} - Duration: {duration:.3f}s"
        )
        
        # Agregar request_id a headers
        response.headers["X-Request-ID"] = request_id
        
        return response
        
    except Exception as e:
        duration = time.time() - start_time
        logger.error(
            f"[{request_id}] {request.method} {request.url.path} - "
            f"ERROR: {str(e)} - Duration: {duration:.3f}s",
            exc_info=True
        )
        raise
```

#### 7.1.2 Formato de Logs JSON

Para mejor procesamiento por herramientas de análisis:

```python
import json
import logging

class JSONFormatter(logging.Formatter):
    """Formatter para logs en formato JSON"""
    
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Agregar exception info si existe
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # Agregar campos adicionales
        if hasattr(record, 'request_id'):
            log_data["request_id"] = record.request_id
        if hasattr(record, 'user_id'):
            log_data["user_id"] = record.user_id
        
        return json.dumps(log_data)

# Configurar handler con JSON formatter
json_handler = logging.FileHandler('logs/app.json')
json_handler.setFormatter(JSONFormatter())
logger.addHandler(json_handler)
```

#### 7.1.3 Niveles de Log por Entorno

```python
import os

def get_log_level():
    """Obtener nivel de log según entorno"""
    env = os.getenv("ENVIRONMENT", "development")
    
    levels = {
        "development": logging.DEBUG,
        "testing": logging.INFO,
        "staging": logging.INFO,
        "production": logging.WARNING
    }
    
    return levels.get(env, logging.INFO)

logging.basicConfig(level=get_log_level())
```

### 7.2 Monitoreo con Prometheus

#### 7.2.1 Instalación de Prometheus

**Archivo**: `docker-compose.monitoring.yml`

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: tramites-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
    networks:
      - tramites-network

  grafana:
    image: grafana/grafana:latest
    container_name: tramites-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    networks:
      - tramites-network
    depends_on:
      - prometheus

  node-exporter:
    image: prom/node-exporter:latest
    container_name: tramites-node-exporter
    ports:
      - "9100:9100"
    networks:
      - tramites-network

volumes:
  prometheus-data:
  grafana-data:

networks:
  tramites-network:
    external: true
```

#### 7.2.2 Configuración de Prometheus

**Archivo**: `monitoring/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'tramites-prod'
    environment: 'production'

# Alertas
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

# Reglas de alerta
rule_files:
  - "alerts/*.yml"

# Targets a monitorear
scrape_configs:
  # Backend API
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
    
  # Node Exporter (métricas del servidor)
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
  
  # Redis
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
  
  # SQL Server (si se configura exporter)
  - job_name: 'mssql'
    static_configs:
      - targets: ['mssql-exporter:4000']
```

#### 7.2.3 Métricas en FastAPI

**Instalación**:
```bash
pip install prometheus-fastapi-instrumentator
```

**Archivo**: `app/main.py`

```python
from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(title="Sistema de Trámites Migratorios")

# Instrumentar con Prometheus
Instrumentator().instrument(app).expose(app)

# Métricas personalizadas
from prometheus_client import Counter, Histogram, Gauge

# Contador de trámites creados
tramites_created = Counter(
    'tramites_created_total',
    'Total de trámites creados',
    ['tipo_tramite']
)

# Histograma de duración de requests
request_duration = Histogram(
    'request_duration_seconds',
    'Duración de requests HTTP',
    ['method', 'endpoint']
)

# Gauge de trámites activos
tramites_activos = Gauge(
    'tramites_activos',
    'Número de trámites en estado activo'
)

@app.post("/tramites")
async def crear_tramite(tramite: TramiteCreate, db: Session = Depends(get_db)):
    with request_duration.labels(method="POST", endpoint="/tramites").time():
        # Crear trámite
        nuevo_tramite = Tramite(**tramite.dict())
        db.add(nuevo_tramite)
        db.commit()
        
        # Incrementar métrica
        tramites_created.labels(tipo_tramite=tramite.tipo_tramite_id).inc()
        
        return nuevo_tramite
```

### 7.3 Dashboards con Grafana

#### 7.3.1 Dashboard de API Performance

**Archivo**: `monitoring/grafana/dashboards/api-performance.json`

```json
{
  "dashboard": {
    "title": "API Performance Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{handler}}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Response Time (95th percentile)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "{{handler}}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "{{handler}}"
          }
        ],
        "type": "graph",
        "alert": {
          "conditions": [
            {
              "evaluator": {
                "params": [0.01],
                "type": "gt"
              }
            }
          ]
        }
      },
      {
        "title": "Active Connections",
        "targets": [
          {
            "expr": "http_requests_in_progress",
            "legendFormat": "Active"
          }
        ],
        "type": "stat"
      }
    ]
  }
}
```

#### 7.3.2 Dashboard de Base de Datos

Métricas importantes:
- **Conexiones activas**: `sqlserver_database_connections`
- **Queries por segundo**: `rate(sqlserver_queries_total[1m])`
- **Tiempo de query**: `sqlserver_query_duration_seconds`
- **Deadlocks**: `rate(sqlserver_deadlocks_total[5m])`
- **Tamaño de DB**: `sqlserver_database_size_bytes`

### 7.4 Alertas Automáticas

#### 7.4.1 Reglas de Alerta

**Archivo**: `monitoring/alerts/api-alerts.yml`

```yaml
groups:
  - name: api_alerts
    interval: 30s
    rules:
      # Alta tasa de errores 5xx
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Alta tasa de errores 5xx"
          description: "{{ $value }} errores por segundo en {{ $labels.handler }}"
      
      # Latencia alta
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Latencia alta detectada"
          description: "P95 latencia: {{ $value }}s en {{ $labels.handler }}"
      
      # API Down
      - alert: APIDown
        expr: up{job="backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "API no está respondiendo"
          description: "El backend no ha respondido por 1 minuto"
      
      # Alto uso de CPU
      - alert: HighCPU
        expr: process_cpu_usage > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Uso alto de CPU"
          description: "CPU al {{ $value }}%"
      
      # Uso alto de memoria
      - alert: HighMemory
        expr: process_memory_usage_bytes / process_memory_limit_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Uso alto de memoria"
          description: "Memoria al {{ $value | humanizePercentage }}"
      
      # Base de datos lenta
      - alert: SlowDatabase
        expr: rate(sqlserver_query_duration_seconds_sum[5m]) / rate(sqlserver_query_duration_seconds_count[5m]) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Queries lentas en base de datos"
          description: "Tiempo promedio: {{ $value }}s"
```

#### 7.4.2 Notificaciones por Email/Slack

**Archivo**: `monitoring/alertmanager.yml`

```yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@tramites.gob.pa'
  smtp_auth_username: 'alerts@tramites.gob.pa'
  smtp_auth_password: 'your-password'

route:
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'team-email'
  
  routes:
    - match:
        severity: critical
      receiver: 'team-pager'
      continue: true
    
    - match:
        severity: warning
      receiver: 'team-slack'

receivers:
  - name: 'team-email'
    email_configs:
      - to: 'dev-team@tramites.gob.pa'
        headers:
          Subject: '[Alerta] {{ .GroupLabels.alertname }}'
        html: |
          <h2>{{ .GroupLabels.alertname }}</h2>
          <p><b>Severidad:</b> {{ .GroupLabels.severity }}</p>
          {{ range .Alerts }}
          <p>{{ .Annotations.description }}</p>
          {{ end }}
  
  - name: 'team-slack'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#tramites-alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
  
  - name: 'team-pager'
    pagerduty_configs:
      - service_key: 'your-pagerduty-key'
```

### 7.5 ELK Stack (Elasticsearch, Logstash, Kibana)

#### 7.5.1 Configuración Docker

**Archivo**: `docker-compose.elk.yml`

```yaml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.10.0
    container_name: tramites-elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - es-data:/usr/share/elasticsearch/data
    networks:
      - tramites-network

  logstash:
    image: docker.elastic.co/logstash/logstash:8.10.0
    container_name: tramites-logstash
    volumes:
      - ./monitoring/logstash/pipeline:/usr/share/logstash/pipeline
      - ./backend/logs:/logs:ro
    ports:
      - "5000:5000"
    environment:
      - "LS_JAVA_OPTS=-Xmx256m -Xms256m"
    networks:
      - tramites-network
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.10.0
    container_name: tramites-kibana
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    networks:
      - tramites-network
    depends_on:
      - elasticsearch

volumes:
  es-data:

networks:
  tramites-network:
    external: true
```

#### 7.5.2 Pipeline de Logstash

**Archivo**: `monitoring/logstash/pipeline/logstash.conf`

```conf
input {
  file {
    path => "/logs/app.json"
    codec => "json"
    type => "app-logs"
    start_position => "beginning"
  }
  
  file {
    path => "/logs/access.log"
    type => "access-logs"
    start_position => "beginning"
  }
}

filter {
  if [type] == "app-logs" {
    # Ya está en JSON, no necesita parsing
    mutate {
      add_field => { "[@metadata][target_index]" => "tramites-app-logs" }
    }
  }
  
  if [type] == "access-logs" {
    grok {
      match => { "message" => "%{COMBINEDAPACHELOG}" }
    }
    
    date {
      match => [ "timestamp", "dd/MMM/yyyy:HH:mm:ss Z" ]
      target => "@timestamp"
    }
    
    mutate {
      add_field => { "[@metadata][target_index]" => "tramites-access-logs" }
    }
  }
  
  # Extraer información adicional
  if [request_id] {
    mutate {
      add_tag => ["has_request_id"]
    }
  }
  
  # Detectar errores
  if [level] == "ERROR" {
    mutate {
      add_tag => ["error"]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "%{[@metadata][target_index]}-%{+YYYY.MM.dd}"
  }
  
  # También enviar a stdout para debugging
  stdout {
    codec => rubydebug
  }
}
```

### 7.6 Health Checks

#### 7.6.1 Endpoint de Health

```python
from fastapi import APIRouter, status
from sqlalchemy import text
import redis

router = APIRouter()

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check básico"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@router.get("/health/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    """Health check detallado con dependencias"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {}
    }
    
    # Check database
    try:
        db.execute(text("SELECT 1"))
        health_status["checks"]["database"] = {
            "status": "up",
            "response_time_ms": 0  # Calcular tiempo real
        }
    except Exception as e:
        health_status["checks"]["database"] = {
            "status": "down",
            "error": str(e)
        }
        health_status["status"] = "unhealthy"
    
    # Check Redis
    try:
        redis_client = get_redis()
        redis_client.ping()
        health_status["checks"]["redis"] = {
            "status": "up"
        }
    except Exception as e:
        health_status["checks"]["redis"] = {
            "status": "down",
            "error": str(e)
        }
        health_status["status"] = "degraded"
    
    # Check disk space
    import shutil
    total, used, free = shutil.disk_usage("/")
    disk_usage_percent = (used / total) * 100
    health_status["checks"]["disk"] = {
        "status": "up" if disk_usage_percent < 90 else "warning",
        "used_percent": round(disk_usage_percent, 2),
        "free_gb": round(free / (2**30), 2)
    }
    
    return health_status
```

---

## 8. Troubleshooting

### 8.1 Problemas Comunes de Deployment

#### 8.1.1 Error: Contenedor no inicia

**Síntoma**:
```bash
$ docker-compose up -d
Creating tramites-backend ... error
ERROR: Container failed to start
```

**Diagnóstico**:
```bash
# Ver logs del contenedor
docker-compose logs backend

# Inspeccionar contenedor
docker inspect tramites-backend

# Ver eventos de Docker
docker events --since 30m
```

**Soluciones**:

1. **Puerto ya en uso**:
```bash
# Verificar qué proceso usa el puerto
netstat -tulpn | grep 8000

# Cambiar puerto en docker-compose.yml
ports:
  - "8001:8000"  # Usar puerto diferente
```

2. **Variables de entorno faltantes**:
```bash
# Verificar que .env existe
ls -la .env

# Validar variables
docker-compose config
```

3. **Problemas de permisos**:
```bash
# Dar permisos a directorios
chmod -R 755 backend/
chown -R $USER:$USER backend/
```

#### 8.1.2 Error: Database connection failed

**Síntoma**:
```
sqlalchemy.exc.OperationalError: (pyodbc.OperationalError) 
('08001', '[08001] [Microsoft][ODBC Driver 18 for SQL Server]')
```

**Diagnóstico**:
```bash
# Verificar que SQL Server está corriendo
docker-compose ps db

# Ver logs de SQL Server
docker-compose logs db

# Probar conexión desde host
docker exec -it tramites-backend python -c "from app.database import engine; print(engine.connect())"
```

**Soluciones**:

1. **SQL Server no está listo**:
```yaml
# Agregar healthcheck en docker-compose.yml
backend:
  depends_on:
    db:
      condition: service_healthy
```

2. **Credenciales incorrectas**:
```bash
# Verificar variables en .env
echo $DATABASE_URL

# Probar conexión manual
docker exec -it tramites-db /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourPassword' -Q "SELECT 1"
```

3. **TrustServerCertificate**:
```python
# Agregar parámetro en DATABASE_URL
DATABASE_URL=mssql+pyodbc://sa:Pass@db:1433/TramitesMigratorios?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes
```

#### 8.1.3 Error: Redis connection refused

**Síntoma**:
```
redis.exceptions.ConnectionError: Error connecting to Redis
```

**Diagnóstico**:
```bash
# Verificar Redis
docker-compose ps redis

# Probar conexión
docker exec -it tramites-redis redis-cli ping
# Debería retornar: PONG

# Ver logs
docker-compose logs redis
```

**Soluciones**:

1. **Redis no está corriendo**:
```bash
docker-compose up -d redis
```

2. **URL incorrecta**:
```bash
# Verificar en .env
REDIS_URL=redis://redis:6379
# No usar 'localhost' dentro de Docker
```

### 8.2 Problemas de Performance

#### 8.2.1 API Lenta

**Síntoma**: Requests tardan más de 2 segundos.

**Diagnóstico**:

1. **Identificar endpoint lento**:
```bash
# Ver logs con duración
docker-compose logs backend | grep "Duration"

# Usar Prometheus
# Query: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

2. **Profiling de código**:
```python
# Agregar en app/main.py
from fastapi import Request
import time

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

3. **Queries N+1**:
```python
# ❌ MALO: Query N+1
tramites = db.query(Tramite).all()
for tramite in tramites:
    print(tramite.tipo_tramite.nombre)  # Query por cada trámite

# ✅ BUENO: Eager loading
from sqlalchemy.orm import joinedload

tramites = db.query(Tramite)\
    .options(joinedload(Tramite.tipo_tramite))\
    .all()
```

**Soluciones**:

1. **Agregar índices**:
```sql
-- Ver queries lentas
SELECT TOP 10
    qs.total_elapsed_time / qs.execution_count AS avg_elapsed_time,
    qs.execution_count,
    SUBSTRING(qt.text, (qs.statement_start_offset/2)+1,
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(qt.text)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2) + 1) AS statement_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
ORDER BY avg_elapsed_time DESC;

-- Crear índices
CREATE INDEX idx_tramites_estado ON tramites(estado);
CREATE INDEX idx_tramites_tipo_tramite_id ON tramites(tipo_tramite_id);
CREATE INDEX idx_tramites_fecha_creacion ON tramites(fecha_creacion);
```

2. **Caché con Redis**:
```python
import json
from app.redis_client import get_redis

def get_tramites_cached(db: Session):
    redis_client = get_redis()
    cache_key = "tramites:all"
    
    # Intentar desde caché
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Si no existe, obtener de DB
    tramites = db.query(Tramite).all()
    
    # Guardar en caché por 5 minutos
    redis_client.setex(
        cache_key,
        300,
        json.dumps([t.to_dict() for t in tramites])
    )
    
    return tramites
```

3. **Paginación**:
```python
@app.get("/tramites")
async def list_tramites(
    skip: int = 0,
    limit: int = 100,  # Máximo 100
    db: Session = Depends(get_db)
):
    # Limitar resultados
    tramites = db.query(Tramite)\
        .offset(skip)\
        .limit(min(limit, 100))\
        .all()
    
    return tramites
```

#### 8.2.2 Base de Datos Lenta

**Diagnóstico**:

```sql
-- Ver estadísticas de espera
SELECT wait_type, wait_time_ms, waiting_tasks_count
FROM sys.dm_os_wait_stats
WHERE wait_time_ms > 0
ORDER BY wait_time_ms DESC;

-- Ver bloqueos
SELECT 
    blocking_session_id,
    wait_type,
    wait_duration_ms,
    resource_description
FROM sys.dm_exec_requests
WHERE blocking_session_id <> 0;

-- Ver fragmentación de índices
SELECT 
    OBJECT_NAME(ips.object_id) AS TableName,
    i.name AS IndexName,
    ips.avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') ips
JOIN sys.indexes i ON ips.object_id = i.object_id AND ips.index_id = i.index_id
WHERE ips.avg_fragmentation_in_percent > 30
ORDER BY ips.avg_fragmentation_in_percent DESC;
```

**Soluciones**:

1. **Reconstruir índices**:
```sql
-- Reconstruir índices fragmentados
ALTER INDEX ALL ON tramites REBUILD;
ALTER INDEX ALL ON PPSH_SOLICITUD REBUILD;

-- Actualizar estadísticas
UPDATE STATISTICS tramites;
UPDATE STATISTICS PPSH_SOLICITUD;
```

2. **Optimizar queries**:
```sql
-- Usar EXPLAIN para analizar
SET SHOWPLAN_TEXT ON;
GO
SELECT * FROM tramites WHERE estado = 'pendiente';
GO
SET SHOWPLAN_TEXT OFF;
```

3. **Aumentar recursos**:
```yaml
# docker-compose.yml
services:
  db:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
```

### 8.3 Problemas de Datos

#### 8.3.1 Error: Constraint violation

**Síntoma**:
```
IntegrityError: (pyodbc.IntegrityError) ('23000', 
'[23000] [Microsoft][ODBC Driver 18 for SQL Server]
The INSERT statement conflicted with the FOREIGN KEY constraint')
```

**Diagnóstico**:
```python
# Ver detalles del error
try:
    db.add(nuevo_tramite)
    db.commit()
except IntegrityError as e:
    print(f"Error de integridad: {e.orig}")
    db.rollback()
```

**Soluciones**:

1. **Validar FK antes de insertar**:
```python
def crear_tramite(tramite: TramiteCreate, db: Session):
    # Verificar que tipo_tramite existe
    tipo = db.query(TipoTramite).filter(
        TipoTramite.id == tramite.tipo_tramite_id
    ).first()
    
    if not tipo:
        raise HTTPException(
            status_code=404,
            detail=f"Tipo de trámite {tramite.tipo_tramite_id} no existe"
        )
    
    nuevo_tramite = Tramite(**tramite.dict())
    db.add(nuevo_tramite)
    db.commit()
    return nuevo_tramite
```

2. **Usar cascadas**:
```python
# En modelos
class Tramite(Base):
    __tablename__ = "tramites"
    
    tipo_tramite = relationship(
        "TipoTramite",
        back_populates="tramites",
        cascade="all, delete-orphan"  # Cascada
    )
```

#### 8.3.2 Error: Duplicate key

**Síntoma**:
```
IntegrityError: Violation of PRIMARY KEY constraint
```

**Soluciones**:

1. **Verificar existencia**:
```python
def crear_usuario(email: str, db: Session):
    # Verificar si ya existe
    exists = db.query(Usuario).filter(Usuario.email == email).first()
    if exists:
        raise HTTPException(
            status_code=409,
            detail="Usuario ya existe"
        )
```

2. **Usar MERGE (UPSERT)**:
```python
from sqlalchemy.dialects.mssql import insert

def upsert_usuario(usuario_data: dict, db: Session):
    stmt = insert(Usuario).values(**usuario_data)
    stmt = stmt.on_conflict_do_update(
        index_elements=['email'],
        set_=usuario_data
    )
    db.execute(stmt)
    db.commit()
```

### 8.4 Problemas de Docker

#### 8.4.1 Error: No space left on device

**Diagnóstico**:
```bash
# Ver uso de disco
df -h

# Ver uso de Docker
docker system df
```

**Soluciones**:

1. **Limpiar imágenes no usadas**:
```bash
# Limpiar todo lo no usado
docker system prune -a

# Limpiar volúmenes
docker volume prune

# Limpiar build cache
docker builder prune
```

2. **Configurar limpieza automática**:
```bash
# Agregar a crontab
0 2 * * * docker system prune -af --filter "until=168h"
```

#### 8.4.2 Error: Container exits immediately

**Diagnóstico**:
```bash
# Ver logs
docker logs tramites-backend

# Ver exit code
docker inspect tramites-backend --format='{{.State.ExitCode}}'

# Ejecutar bash para debugging
docker-compose run backend /bin/bash
```

**Soluciones comunes**:

1. **Comando incorrecto**:
```yaml
# Verificar CMD en Dockerfile
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. **Dependencia faltante**:
```bash
# Ejecutar dentro del contenedor
docker-compose run backend pip list
docker-compose run backend python -c "import app"
```

### 8.5 Problemas de Red

#### 8.5.1 Error: Cannot connect to service

**Diagnóstico**:
```bash
# Ver redes
docker network ls

# Inspeccionar red
docker network inspect tramites-network

# Probar conectividad
docker-compose exec backend ping redis
docker-compose exec backend nc -zv db 1433
```

**Soluciones**:

1. **Usar nombres de servicio, no localhost**:
```python
# ❌ MALO
DATABASE_URL = "mssql://sa:Pass@localhost:1433/DB"

# ✅ BUENO
DATABASE_URL = "mssql://sa:Pass@db:1433/DB"
```

2. **Verificar que todos están en la misma red**:
```yaml
services:
  backend:
    networks:
      - tramites-network
  db:
    networks:
      - tramites-network
  redis:
    networks:
      - tramites-network

networks:
  tramites-network:
    driver: bridge
```

### 8.6 Comandos Útiles de Debugging

```bash
# ==========================================
# DOCKER
# ==========================================

# Ver todos los contenedores
docker ps -a

# Logs en tiempo real
docker-compose logs -f backend

# Ejecutar comando en contenedor
docker-compose exec backend python --version

# Entrar al contenedor
docker-compose exec backend bash

# Reiniciar servicio específico
docker-compose restart backend

# Recrear contenedor
docker-compose up -d --force-recreate backend

# Ver uso de recursos
docker stats

# ==========================================
# BASE DE DATOS
# ==========================================

# Conectar a SQL Server
docker exec -it tramites-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourPassword'

# Ejecutar query desde archivo
docker exec -i tramites-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'Pass' < query.sql

# Backup de BD
docker exec tramites-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'Pass' \
  -Q "BACKUP DATABASE TramitesMigratorios TO DISK='/var/opt/mssql/backup/db.bak'"

# Restaurar BD
docker exec tramites-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'Pass' \
  -Q "RESTORE DATABASE TramitesMigratorios FROM DISK='/var/opt/mssql/backup/db.bak'"

# ==========================================
# REDIS
# ==========================================

# Conectar a Redis CLI
docker exec -it tramites-redis redis-cli

# Ver todas las keys
docker exec tramites-redis redis-cli KEYS '*'

# Limpiar caché
docker exec tramites-redis redis-cli FLUSHALL

# Ver memoria usada
docker exec tramites-redis redis-cli INFO memory

# ==========================================
# PYTHON/FASTAPI
# ==========================================

# Ejecutar tests
docker-compose exec backend pytest

# Ejecutar tests con coverage
docker-compose exec backend pytest --cov=app

# Ejecutar script Python
docker-compose exec backend python scripts/migrate_data.py

# Instalar paquete adicional
docker-compose exec backend pip install package-name

# Ver versión de paquetes
docker-compose exec backend pip list

# ==========================================
# LOGS
# ==========================================

# Ver logs con timestamp
docker-compose logs -f --timestamps backend

# Ver últimas 100 líneas
docker-compose logs --tail=100 backend

# Buscar error específico
docker-compose logs backend | grep ERROR

# Exportar logs a archivo
docker-compose logs backend > logs_$(date +%Y%m%d).txt
```

### 8.7 Checklist de Diagnóstico

Cuando algo no funciona, seguir estos pasos:

```
☐ 1. Ver logs del servicio afectado
   docker-compose logs [servicio]

☐ 2. Verificar que el servicio está corriendo
   docker-compose ps

☐ 3. Verificar conectividad de red
   docker-compose exec [servicio] ping [otro-servicio]

☐ 4. Verificar variables de entorno
   docker-compose exec [servicio] env

☐ 5. Verificar archivos de configuración
   docker-compose config

☐ 6. Ver recursos del sistema
   docker stats

☐ 7. Verificar puertos
   netstat -tulpn | grep [puerto]

☐ 8. Revisar health checks
   curl http://localhost:8000/health

☐ 9. Buscar en logs del sistema
   journalctl -u docker -n 100

☐ 10. Google el error específico
    Buscar mensaje de error + "fastapi" o "sqlalchemy"
```

---

## 9. Procedimientos de Mantenimiento

### 9.1 Mantenimiento Diario

#### 9.1.1 Checklist Diario

```bash
#!/bin/bash
# Script: daily_check.sh
# Descripción: Verificaciones diarias del sistema

echo "========================================"
echo "  VERIFICACIÓN DIARIA - $(date)"
echo "========================================"

# 1. Verificar servicios
echo "1. Verificando servicios..."
docker-compose ps | grep -v "Up" && echo "⚠️ Servicios caídos detectados" || echo "✅ Todos los servicios UP"

# 2. Verificar salud de API
echo "2. Verificando API..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ $HTTP_CODE -eq 200 ]; then
    echo "✅ API respondiendo correctamente"
else
    echo "❌ API con problemas (HTTP $HTTP_CODE)"
fi

# 3. Verificar espacio en disco
echo "3. Verificando espacio en disco..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️ Disco al $DISK_USAGE%"
else
    echo "✅ Disco OK ($DISK_USAGE%)"
fi

# 4. Verificar logs de errores
echo "4. Buscando errores en logs (últimas 24h)..."
ERROR_COUNT=$(docker-compose logs --since 24h backend | grep -c ERROR)
echo "   Errores encontrados: $ERROR_COUNT"

# 5. Verificar conexiones a base de datos
echo "5. Verificando conexiones DB..."
docker exec tramites-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "${DB_PASSWORD}" \
  -Q "SELECT COUNT(*) as connections FROM sys.dm_exec_sessions WHERE is_user_process = 1" \
  -h -1

# 6. Verificar uso de Redis
echo "6. Verificando Redis..."
docker exec tramites-redis redis-cli INFO memory | grep used_memory_human

# 7. Resumen
echo "========================================"
echo "  Verificación completada"
echo "========================================"
```

#### 9.1.2 Rotación de Logs

```bash
#!/bin/bash
# Script: rotate_logs.sh
# Descripción: Rotar logs diarios

LOG_DIR="/var/log/tramites"
RETENTION_DAYS=30

# Comprimir logs del día anterior
find $LOG_DIR -name "*.log" -mtime 1 -exec gzip {} \;

# Eliminar logs antiguos
find $LOG_DIR -name "*.log.gz" -mtime +$RETENTION_DAYS -delete

# Logs de Docker
docker-compose logs --since 24h > $LOG_DIR/docker_$(date +%Y%m%d).log
gzip $LOG_DIR/docker_$(date +%Y%m%d).log

echo "✅ Rotación de logs completada"
```

**Configurar en crontab**:
```bash
# Editar crontab
crontab -e

# Agregar tareas diarias
0 1 * * * /path/to/daily_check.sh >> /var/log/daily_check.log 2>&1
0 2 * * * /path/to/rotate_logs.sh >> /var/log/rotate_logs.log 2>&1
```

### 9.2 Mantenimiento Semanal

#### 9.2.1 Checklist Semanal

```sql
-- Script: weekly_maintenance.sql
-- Descripción: Mantenimiento semanal de base de datos

USE TramitesMigratorios;
GO

PRINT '========================================';
PRINT '  MANTENIMIENTO SEMANAL - ' + CONVERT(VARCHAR, GETDATE());
PRINT '========================================';

-- 1. Actualizar estadísticas
PRINT '1. Actualizando estadísticas...';
EXEC sp_updatestats;

-- 2. Verificar integridad de base de datos
PRINT '2. Verificando integridad de BD...';
DBCC CHECKDB (TramitesMigratorios) WITH NO_INFOMSGS;

-- 3. Reindexar tablas principales
PRINT '3. Reindexando tablas...';
ALTER INDEX ALL ON tramites REORGANIZE;
ALTER INDEX ALL ON PPSH_SOLICITUD REORGANIZE;
ALTER INDEX ALL ON workflow_instancias REORGANIZE;

-- 4. Limpiar registros antiguos (opcional)
PRINT '4. Limpiando registros antiguos...';
-- Eliminar logs de auditoría mayores a 1 año
DELETE FROM audit_log WHERE fecha < DATEADD(YEAR, -1, GETDATE());

-- 5. Verificar tamaño de base de datos
PRINT '5. Tamaño de base de datos:';
SELECT 
    name AS FileName,
    size/128.0 AS CurrentSizeMB,
    size/128.0 - CAST(FILEPROPERTY(name, 'SpaceUsed') AS INT)/128.0 AS FreeSpaceMB
FROM sys.database_files;

-- 6. Ver tablas más grandes
PRINT '6. Tablas más grandes:';
SELECT TOP 10
    t.NAME AS TableName,
    p.rows AS RowCounts,
    SUM(a.total_pages) * 8 AS TotalSpaceKB,
    SUM(a.used_pages) * 8 AS UsedSpaceKB,
    (SUM(a.total_pages) - SUM(a.used_pages)) * 8 AS UnusedSpaceKB
FROM sys.tables t
INNER JOIN sys.indexes i ON t.OBJECT_ID = i.object_id
INNER JOIN sys.partitions p ON i.object_id = p.OBJECT_ID AND i.index_id = p.index_id
INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
WHERE t.is_ms_shipped = 0
GROUP BY t.Name, p.Rows
ORDER BY TotalSpaceKB DESC;

-- 7. Verificar índices fragmentados
PRINT '7. Índices fragmentados (>30%):';
SELECT 
    OBJECT_NAME(ips.object_id) AS TableName,
    i.name AS IndexName,
    ips.avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') ips
JOIN sys.indexes i ON ips.object_id = i.object_id AND ips.index_id = i.index_id
WHERE ips.avg_fragmentation_in_percent > 30
ORDER BY ips.avg_fragmentation_in_percent DESC;

PRINT '========================================';
PRINT '  Mantenimiento completado';
PRINT '========================================';
GO
```

#### 9.2.2 Script de Ejecución

```bash
#!/bin/bash
# Script: weekly_maintenance.sh

echo "Ejecutando mantenimiento semanal..."

# 1. Mantenimiento de BD
docker exec -i tramites-db /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "${DB_PASSWORD}" \
  < weekly_maintenance.sql

# 2. Limpiar Docker
echo "Limpiando Docker..."
docker system prune -f --filter "until=168h"  # 1 semana

# 3. Backup de base de datos
echo "Creando backup..."
./backup_database.sh

# 4. Verificar actualizaciones de seguridad
echo "Verificando actualizaciones..."
apt-get update
apt-get upgrade -y --security-only

# 5. Reiniciar servicios (si es necesario)
# docker-compose restart backend

echo "✅ Mantenimiento semanal completado"
```

### 9.3 Backup y Restore

#### 9.3.1 Script de Backup Completo

```bash
#!/bin/bash
# Script: backup_database.sh
# Descripción: Backup completo de base de datos y archivos

BACKUP_DIR="/backups/tramites"
DATE=$(date +%Y%m%d_%H%M%S)
DB_PASSWORD="${DB_PASSWORD:-YourPassword123!}"

echo "=========================================="
echo "  BACKUP COMPLETO - $DATE"
echo "=========================================="

# 1. Crear directorio de backup
mkdir -p $BACKUP_DIR/$DATE

# 2. Backup de base de datos
echo "1. Backup de base de datos..."
docker exec tramites-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" \
  -Q "BACKUP DATABASE TramitesMigratorios TO DISK='/var/opt/mssql/backup/db_$DATE.bak' WITH COMPRESSION"

# Copiar backup fuera del contenedor
docker cp tramites-db:/var/opt/mssql/backup/db_$DATE.bak $BACKUP_DIR/$DATE/

# 3. Backup de archivos subidos
echo "2. Backup de archivos..."
tar -czf $BACKUP_DIR/$DATE/uploads.tar.gz backend/uploads/

# 4. Backup de configuración
echo "3. Backup de configuración..."
tar -czf $BACKUP_DIR/$DATE/config.tar.gz \
  docker-compose.yml \
  .env \
  nginx/ \
  backend/alembic.ini

# 5. Verificar backups
echo "4. Verificando backups..."
ls -lh $BACKUP_DIR/$DATE/

# 6. Eliminar backups antiguos (mantener últimos 7 días)
echo "5. Limpiando backups antiguos..."
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +

# 7. Resumen
echo "=========================================="
echo "  Backup completado: $BACKUP_DIR/$DATE"
echo "=========================================="
```

#### 9.3.2 Script de Restore

```bash
#!/bin/bash
# Script: restore_database.sh
# Descripción: Restaurar base de datos desde backup

if [ -z "$1" ]; then
    echo "Uso: ./restore_database.sh <fecha_backup>"
    echo "Ejemplo: ./restore_database.sh 20250122_140530"
    exit 1
fi

BACKUP_DATE=$1
BACKUP_DIR="/backups/tramites/$BACKUP_DATE"
DB_PASSWORD="${DB_PASSWORD:-YourPassword123!}"

echo "=========================================="
echo "  RESTORE DESDE BACKUP - $BACKUP_DATE"
echo "=========================================="

# Verificar que existe el backup
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Backup no encontrado: $BACKUP_DIR"
    exit 1
fi

# Confirmación
read -p "⚠️  Esto sobrescribirá la base de datos actual. ¿Continuar? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Operación cancelada"
    exit 0
fi

# 1. Detener backend (para evitar conexiones)
echo "1. Deteniendo backend..."
docker-compose stop backend

# 2. Copiar backup al contenedor
echo "2. Copiando backup..."
docker cp $BACKUP_DIR/db_$BACKUP_DATE.bak tramites-db:/var/opt/mssql/backup/

# 3. Restaurar base de datos
echo "3. Restaurando base de datos..."
docker exec tramites-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" \
  -Q "USE master; ALTER DATABASE TramitesMigratorios SET SINGLE_USER WITH ROLLBACK IMMEDIATE; RESTORE DATABASE TramitesMigratorios FROM DISK='/var/opt/mssql/backup/db_$BACKUP_DATE.bak' WITH REPLACE; ALTER DATABASE TramitesMigratorios SET MULTI_USER;"

# 4. Restaurar archivos
echo "4. Restaurando archivos..."
tar -xzf $BACKUP_DIR/uploads.tar.gz -C ./

# 5. Reiniciar servicios
echo "5. Reiniciando servicios..."
docker-compose up -d backend

# 6. Verificar
echo "6. Verificando..."
sleep 5
curl http://localhost:8000/health

echo "=========================================="
echo "  Restore completado"
echo "=========================================="
```

### 9.4 Actualización del Sistema

#### 9.4.1 Proceso de Actualización

```bash
#!/bin/bash
# Script: update_system.sh
# Descripción: Actualización del sistema con zero-downtime

set -e

echo "=========================================="
echo "  ACTUALIZACIÓN DEL SISTEMA"
echo "=========================================="

# 1. Backup previo
echo "1. Creando backup de seguridad..."
./backup_database.sh

# 2. Pull últimos cambios
echo "2. Obteniendo últimos cambios..."
git fetch origin
git checkout main
git pull origin main

# 3. Verificar cambios en migraciones
echo "3. Verificando migraciones..."
docker-compose exec backend alembic current
docker-compose exec backend alembic check

# 4. Si hay migraciones pendientes, aplicar
NEW_MIGRATIONS=$(docker-compose exec -T backend alembic heads | wc -l)
if [ $NEW_MIGRATIONS -gt 0 ]; then
    echo "Aplicando migraciones..."
    docker-compose exec backend alembic upgrade head
fi

# 5. Reconstruir imágenes
echo "4. Reconstruyendo imágenes..."
docker-compose build --no-cache

# 6. Actualizar usando blue-green (si está configurado)
if [ -f "config/docker-compose.green-blue.yml" ]; then
    echo "5. Usando estrategia blue-green..."
    
    # Determinar entorno actual
    CURRENT=$(grep "default" nginx/nginx-router.conf | awk '{print $2}' | tr -d '";')
    
    if [ "$CURRENT" = "blue" ]; then
        TARGET="green"
    else
        TARGET="blue"
    fi
    
    echo "   Actualizando entorno: $TARGET"
    
    # Actualizar target
    docker-compose -f config/docker-compose.green-blue.yml up -d backend-$TARGET frontend-$TARGET
    
    # Esperar a que esté listo
    sleep 10
    
    # Health check
    if [ "$TARGET" = "green" ]; then
        PORT=8002
    else
        PORT=8001
    fi
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/health)
    if [ $HTTP_CODE -ne 200 ]; then
        echo "❌ Error: Nueva versión no pasa health check"
        exit 1
    fi
    
    # Switchover
    echo "6. Cambiando tráfico a $TARGET..."
    ./scripts/switchover.sh $TARGET
    
else
    # Actualización tradicional (con downtime)
    echo "5. Actualizando servicios..."
    docker-compose down
    docker-compose up -d
fi

# 7. Verificar
echo "7. Verificando actualización..."
sleep 5
curl http://localhost:8000/health
curl http://localhost:8000/docs

# 8. Monitorear por 5 minutos
echo "8. Monitoreando por 5 minutos..."
for i in {1..10}; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
    if [ $HTTP_CODE -eq 200 ]; then
        echo "   Check $i/10: OK"
    else
        echo "   Check $i/10: FAILED"
        echo "⚠️  Considera hacer rollback"
    fi
    sleep 30
done

echo "=========================================="
echo "  Actualización completada exitosamente"
echo "=========================================="
```

#### 9.4.2 Rollback

```bash
#!/bin/bash
# Script: rollback.sh
# Descripción: Rollback a versión anterior

set -e

echo "=========================================="
echo "  ROLLBACK A VERSIÓN ANTERIOR"
echo "=========================================="

# 1. Verificar git log
echo "Últimos commits:"
git log --oneline -5

# 2. Solicitar versión
read -p "Ingresa el hash del commit a restaurar: " COMMIT_HASH

# 3. Confirmación
read -p "⚠️  Esto revertirá a $COMMIT_HASH. ¿Continuar? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    exit 0
fi

# 4. Checkout a versión anterior
echo "1. Revertiendo código..."
git checkout $COMMIT_HASH

# 5. Reconstruir
echo "2. Reconstruyendo..."
docker-compose build

# 6. Verificar migraciones (puede necesitar downgrade)
echo "3. Verificando migraciones..."
# Aquí podrías necesitar: alembic downgrade <revision>

# 7. Reiniciar
echo "4. Reiniciando servicios..."
docker-compose down
docker-compose up -d

# 8. Verificar
sleep 10
curl http://localhost:8000/health

echo "=========================================="
echo "  Rollback completado"
echo "=========================================="
```

### 9.5 Optimización de Performance

#### 9.5.1 Análisis de Performance

```sql
-- Script: analyze_performance.sql

USE TramitesMigratorios;
GO

-- 1. Queries más lentas (Top 20)
SELECT TOP 20
    qs.execution_count,
    SUBSTRING(qt.text, (qs.statement_start_offset/2)+1,
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(qt.text)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2) + 1) AS query_text,
    qs.total_elapsed_time / qs.execution_count AS avg_elapsed_time,
    qs.total_worker_time / qs.execution_count AS avg_cpu_time,
    qs.total_logical_reads / qs.execution_count AS avg_logical_reads
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
ORDER BY avg_elapsed_time DESC;

-- 2. Índices faltantes
SELECT 
    migs.avg_total_user_cost * (migs.avg_user_impact / 100.0) * (migs.user_seeks + migs.user_scans) AS improvement_measure,
    'CREATE INDEX idx_' + OBJECT_NAME(mid.object_id) + '_' + 
    REPLACE(REPLACE(REPLACE(ISNULL(mid.equality_columns,''), ', ', '_'), '[', ''), ']', '') +
    CASE WHEN mid.equality_columns IS NOT NULL AND mid.inequality_columns IS NOT NULL THEN '_' ELSE '' END +
    REPLACE(REPLACE(REPLACE(ISNULL(mid.inequality_columns,''), ', ', '_'), '[', ''), ']', '') +
    ' ON ' + OBJECT_NAME(mid.object_id) + ' (' + ISNULL (mid.equality_columns,'') +
    CASE WHEN mid.equality_columns IS NOT NULL AND mid.inequality_columns IS NOT NULL THEN ', ' ELSE '' END +
    ISNULL (mid.inequality_columns, '') + ')' +
    ISNULL (' INCLUDE (' + mid.included_columns + ')', '') AS create_index_statement
FROM sys.dm_db_missing_index_groups mig
INNER JOIN sys.dm_db_missing_index_group_stats migs ON migs.group_handle = mig.index_group_handle
INNER JOIN sys.dm_db_missing_index_details mid ON mig.index_handle = mid.index_handle
WHERE migs.avg_total_user_cost * (migs.avg_user_impact / 100.0) * (migs.user_seeks + migs.user_scans) > 10
ORDER BY improvement_measure DESC;

-- 3. Índices no utilizados
SELECT 
    OBJECT_NAME(i.object_id) AS TableName,
    i.name AS IndexName,
    i.type_desc,
    s.user_seeks,
    s.user_scans,
    s.user_lookups,
    s.user_updates
FROM sys.indexes i
LEFT JOIN sys.dm_db_index_usage_stats s ON i.object_id = s.object_id AND i.index_id = s.index_id AND s.database_id = DB_ID()
WHERE OBJECTPROPERTY(i.object_id, 'IsUserTable') = 1
    AND i.type_desc <> 'HEAP'
    AND s.user_seeks = 0
    AND s.user_scans = 0
    AND s.user_lookups = 0
ORDER BY s.user_updates DESC;

-- 4. Estadísticas de wait
SELECT TOP 10
    wait_type,
    wait_time_ms / 1000.0 AS wait_time_s,
    waiting_tasks_count,
    wait_time_ms / waiting_tasks_count AS avg_wait_time_ms
FROM sys.dm_os_wait_stats
WHERE wait_time_ms > 0
    AND wait_type NOT LIKE 'SLEEP%'
ORDER BY wait_time_ms DESC;
```

#### 9.5.2 Aplicar Optimizaciones

```bash
#!/bin/bash
# Script: optimize_database.sh

echo "Ejecutando optimizaciones..."

# 1. Análisis de performance
docker exec -i tramites-db /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "${DB_PASSWORD}" \
  < analyze_performance.sql > performance_report.txt

echo "Reporte generado: performance_report.txt"
echo "Revisar y aplicar índices sugeridos manualmente"

# 2. Actualizar estadísticas
echo "Actualizando estadísticas..."
docker exec tramites-db /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "${DB_PASSWORD}" \
  -Q "EXEC sp_updatestats"

# 3. Reorganizar índices fragmentados
echo "Reorganizando índices..."
docker exec tramites-db /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "${DB_PASSWORD}" \
  -Q "EXEC sp_MSforeachtable 'ALTER INDEX ALL ON ? REORGANIZE'"

echo "✅ Optimización completada"
```

### 9.6 Calendario de Mantenimiento

| Tarea | Frecuencia | Script | Tiempo estimado |
|-------|-----------|--------|-----------------|
| Health check | Diario | `daily_check.sh` | 5 min |
| Rotación de logs | Diario | `rotate_logs.sh` | 2 min |
| Backup completo | Diario | `backup_database.sh` | 15 min |
| Mantenimiento BD | Semanal | `weekly_maintenance.sh` | 30 min |
| Limpieza Docker | Semanal | `docker system prune` | 5 min |
| Análisis de performance | Mensual | `analyze_performance.sql` | 20 min |
| Aplicar optimizaciones | Mensual | `optimize_database.sh` | 1 hora |
| Actualización sistema | Según releases | `update_system.sh` | 1 hora |
| Test de restore | Trimestral | `restore_database.sh` | 30 min |
| Auditoría de seguridad | Trimestral | Manual | 2 horas |

### 9.7 Contacts y Escalación

#### Equipo de Desarrollo
- **Email**: dev-team@tramites.gob.pa
- **Slack**: #tramites-dev
- **Horario**: Lunes a Viernes, 8:00 AM - 6:00 PM

#### Soporte de Infraestructura
- **Email**: infra@tramites.gob.pa
- **Teléfono**: +507-XXXX-XXXX
- **Disponibilidad**: 24/7

#### Escalación de Incidentes

**Nivel 1 - Bajo (Response time: 24 horas)**
- Performance degradado
- Errores no críticos en logs
- Problemas con features no esenciales

**Nivel 2 - Medio (Response time: 4 horas)**
- API lenta (>5s response time)
- Errores frecuentes (>100/hora)
- Servicios degradados

**Nivel 3 - Alto (Response time: 1 hora)**
- API down en un entorno
- Base de datos lenta
- Pérdida parcial de funcionalidad

**Nivel 4 - Crítico (Response time: 15 minutos)**
- Sistema completamente down
- Pérdida de datos
- Brecha de seguridad

---

## 🎉 FINAL DEL MANUAL TÉCNICO

### Documentos Relacionados

- 📘 **Manual Técnico - Parte 1**: Arquitectura, Base de Datos, Backend API, Frontend
- 📗 **Manual de Usuario**: Guía para usuarios finales
- 📊 **Diccionario de Datos**: Documentación detallada de todas las tablas
- 🔧 **Guía de Capacitación**: Material de entrenamiento

### Información de Versión

- **Versión**: 2.0
- **Fecha de creación**: 22 de Octubre, 2025
- **Última actualización**: 22 de Octubre, 2025
- **Autores**: Equipo de Desarrollo - Sistema de Trámites Migratorios
- **Estado**: ✅ Completo y aprobado

### Control de Cambios

| Versión | Fecha | Descripción | Autor |
|---------|-------|-------------|-------|
| 1.0 | 2025-10-22 | Versión inicial | Equipo Dev |
| 2.0 | 2025-10-22 | Manual completo con todas las secciones | GitHub Copilot |

---

**© 2025 Gobierno de Panamá - Sistema de Trámites Migratorios**  
**Confidencial - Solo para uso interno**
