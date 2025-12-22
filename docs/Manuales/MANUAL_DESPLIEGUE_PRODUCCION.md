# 🚀 MANUAL DE DESPLIEGUE EN PRODUCCIÓN
## Sistema de Gestión de Trámites Migratorios - SNM Panamá

**Versión**: 1.0  
**Fecha**: 16 de Diciembre de 2025  
**Autor**: Equipo de Desarrollo  
**Clasificación**: Uso Interno - Personal Técnico DevOps

---

## 📋 Tabla de Contenidos

1. [Arquitectura de Servidores](#1-arquitectura-de-servidores)
2. [Requisitos de Infraestructura](#2-requisitos-de-infraestructura)
3. [Despliegue en Servidor de Producción (UMCE)](#3-despliegue-en-servidor-de-producción-umce)
4. [Despliegue en Servidor Preproductivo (Lightsail)](#4-despliegue-en-servidor-preproductivo-lightsail)
5. [Configuración de Seguridad](#5-configuración-de-seguridad)
6. [Gestión de Base de Datos](#6-gestión-de-base-de-datos)
7. [Sincronización entre Servidores](#7-sincronización-entre-servidores)
8. [Configuración SSL/HTTPS](#8-configuración-sslhttps)
9. [Monitoreo y Mantenimiento](#9-monitoreo-y-mantenimiento)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Arquitectura de Servidores

### 1.1 Resumen de Ambientes

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DEL AMBIENTE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   PRODUCCIÓN                                                    │
│   ├─ Dominio: http://permisosmigratorios.online                 │
│   ├─ IP: 3.94.174.109                                           │
│   ├─ SSH Key: umce.pem                                          │
│   └─ Usuario: ubuntu                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Flujo de Despliegue

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   LOCAL      │────▶│ PREPRODUCTIVO│────▶│  PRODUCCIÓN  │
│  Desarrollo  │     │  (Lightsail) │     │    (UMCE)    │
│              │     │  Testing     │     │   Usuarios   │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
    git push            git pull             git pull
                        docker up            docker up
                                            restore BD
```

---

## 2. Requisitos de Infraestructura

### 2.1 Hardware Mínimo

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| RAM | 4 GB | 8 GB |
| CPU | 2 vCPU | 4 vCPU |
| Disco | 40 GB SSD | 80 GB SSD |
| Sistema | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### 2.2 Distribución de Memoria

| Contenedor | RAM Límite | RAM Reservada |
|------------|------------|---------------|
| SQL Server | 2 GB | 1 GB |
| Backend (FastAPI) | 768 MB | 256 MB |
| Celery Worker | 768 MB | 256 MB |
| Celery Beat | 192 MB | 64 MB |
| Redis | 192 MB | 64 MB |
| Frontend (Nginx) | 128 MB | 32 MB |
| **Total** | ~4 GB | ~1.7 GB |
| **Swap** | 4 GB | - |

### 2.3 Puertos Requeridos

| Puerto | Servicio | Firewall |
|--------|----------|----------|
| 22 | SSH | ✅ Abierto |
| 80 | HTTP | ✅ Abierto |
| 443 | HTTPS | ✅ Abierto |
| 8000 | API | ❌ Bloqueado |
| 1433 | SQL Server | ❌ Bloqueado |
| 6379 | Redis | ❌ Bloqueado |

---

## 3. Despliegue en Servidor de Producción 

### 3.1 Conexión SSH

```bash
# Desde máquina local (la clave debe estar en ~/.ssh/)
chmod 600 ~/.ssh/umce.pem
ssh -i ~/.ssh/umce.pem ubuntu@3.94.174.109

# O usando el dominio
ssh -i ~/.ssh/umce.pem ubuntu@permisosmigratorios.online
```

### 3.2 Primera Instalación

#### Paso 1: Preparar el Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker ubuntu
newgrp docker

# Verificar
docker --version
docker compose version
```

#### Paso 2: Configurar Swap (si no existe)

```bash
# Verificar swap existente
swapon --show

# Si no hay swap, crear uno de 4GB
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Hacer permanente
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

#### Paso 3: Clonar Repositorio

```bash
cd ~
git clone https://github.com/juncid/tramites-mvp-panama.git
cd tramites-mvp-panama
```

#### Paso 4: Configurar Variables de Entorno

```bash
# Crear archivo .env para producción
cat > .env << 'EOF'
# Base de datos
SA_PASSWORD=YourProductionSecurePassword123!
DATABASE_URL=mssql+pyodbc://sa:YourProductionSecurePassword123!@sqlserver:1433/SIM_PANAMA?driver=ODBC+Driver+17+for+SQL+Server

# Redis
REDIS_URL=redis://redis:6379/0

# API
ENVIRONMENT=production
LOG_LEVEL=INFO

# CORS
CORS_ORIGINS=http://permisosmigratorios.online,http://3.94.174.109

# Frontend URL (IMPORTANTE: para generar links de acceso público)
FRONTEND_URL=http://permisosmigratorios.online
EOF
```

#### Paso 5: Desplegar

```bash
# Construir e iniciar
docker compose -f docker-compose.yml up -d --build

# Verificar estado
docker compose ps

# Ver logs
docker compose logs -f
```

### 3.3 Actualizar Servidor Existente

```bash
# Conectar al servidor
ssh -i ~/.ssh/umce.pem ubuntu@permisosmigratorios.online

# Ir al proyecto
cd ~/tramites-mvp-panama

# Obtener últimos cambios
git pull origin main

# Reconstruir y reiniciar
docker compose down
docker compose up -d --build

# Verificar
docker compose ps
```

### 3.4 Verificar Despliegue

```bash
# Verificar contenedores
docker ps


ubuntu@ip-172-26-0-29:~$ docker ps
CONTAINER ID   IMAGE                                        COMMAND                  CREATED        STATUS                  PORTS                                         NAMES
15252fa09983   lightsail-frontend                           "/sbin/tini -- nginx…"   19 hours ago   Up 19 hours (healthy)   0.0.0.0:80->80/tcp, [::]:80->80/tcp           tramites-frontend
3a843373b0f3   lightsail-celery-worker                      "celery -A celery_ap…"   19 hours ago   Up 19 hours             8000/tcp                                      tramites-celery-worker
2679b0a4ba42   lightsail-backend                            "uvicorn app.main:ap…"   19 hours ago   Up 19 hours (healthy)   8000/tcp                                      tramites-backend
1f5ade2fd5fb   lightsail-celery-beat                        "celery -A celery_ap…"   19 hours ago   Up 19 hours             8000/tcp                                      tramites-celery-beat
c35198d195f1   redis:7-alpine                               "docker-entrypoint.s…"   19 hours ago   Up 19 hours (healthy)   0.0.0.0:6379->6379/tcp, [::]:6379->6379/tcp   tramites-redis
a2b388edd04a   mcr.microsoft.com/mssql/server:2022-latest   "/opt/mssql/bin/laun…"   19 hours ago   Up 19 hours (healthy)   0.0.0.0:1433->1433/tcp, [::]:1433->1433/tcp   tramites-sqlserver


# Verificar health (a través de Nginx)
curl -s http://localhost/health

# O directamente al contenedor backend
docker exec tramites-backend curl -s http://localhost:8000/health

# Verificar desde exterior
curl -s http://permisosmigratorios.online/health
```


---

## 5. Configuración de Seguridad

### 5.1 Arquitectura de Seguridad

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DE SEGURIDAD                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   INTERNET                                                      │
│      │                                                          │
│      │ Solo puertos 80/443                                      │
│      ▼                                                          │
│   ┌────────────────────────────────────────────┐               │
│   │               FIREWALL                      │               │
│   │   ✅ Puerto 22 (SSH - solo admin)           │               │
│   │   ✅ Puerto 80 (HTTP)                       │               │
│   │   ✅ Puerto 443 (HTTPS)                     │               │
│   │   ❌ Puerto 8000 (BLOQUEADO)                │               │
│   │   ❌ Puerto 1433 (BLOQUEADO)                │               │
│   │   ❌ Puerto 6379 (BLOQUEADO)                │               │
│   └────────────────────────────────────────────┘               │
│                          │                                      │
│                          ▼                                      │
│   ┌────────────────────────────────────────────┐               │
│   │            NGINX (Reverse Proxy)            │               │
│   │                                             │               │
│   │   /          → Frontend React               │               │
│   │   /api/*     → Backend FastAPI (:8000)      │               │
│   │   /uploads/* → Archivos subidos             │               │
│   │                                             │               │
│   │   Headers de seguridad aplicados            │               │
│   └────────────────────────────────────────────┘               │
│                          │                                      │
│          ┌───────────────┼───────────────┐                     │
│          ▼               ▼               ▼                     │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐                │
│   │ Backend  │    │  Redis   │    │SQL Server│                │
│   │  :8000   │    │  :6379   │    │  :1433   │                │
│   │ (interno)│    │ (interno)│    │ (interno)│                │
│   └──────────┘    └──────────┘    └──────────┘                │
│                                                                 │
│   🔒 RED DOCKER AISLADA                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Headers de Seguridad (Nginx)

El contenedor frontend incluye estos headers automáticamente:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### 5.3 Soft Delete Implementado

El sistema NO elimina datos físicamente. Todos los DELETE marcan registros con:
- `activo = False`
- `estado = 'OBSOLETO'` o `'ARCHIVADO'`

---

## 6. Gestión de Base de Datos

### 6.1 Crear Backup

```bash
# En el servidor de origen
ssh -i ~/.ssh/umce.pem ubuntu@permisosmigratorios.online

# Crear directorio de backups
docker exec tramites-sqlserver mkdir -p /var/opt/mssql/backup

# Generar backup con fecha
FECHA=$(date +%Y%m%d_%H%M%S)
docker exec tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourPassword" -C \
  -Q "BACKUP DATABASE SIM_PANAMA TO DISK='/var/opt/mssql/backup/sim_panama_${FECHA}.bak' WITH FORMAT, INIT"

# Copiar backup al host
docker cp tramites-sqlserver:/var/opt/mssql/backup/sim_panama_${FECHA}.bak ~/
```

### 6.2 Restaurar Backup

```bash
# Copiar backup al contenedor
docker cp ~/sim_panama_backup.bak tramites-sqlserver:/var/opt/mssql/backup/

# Dar permisos
docker exec -u root tramites-sqlserver chown mssql:mssql /var/opt/mssql/backup/sim_panama_backup.bak

# Restaurar
docker exec tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourPassword" -C \
  -Q "USE master; ALTER DATABASE SIM_PANAMA SET SINGLE_USER WITH ROLLBACK IMMEDIATE; RESTORE DATABASE SIM_PANAMA FROM DISK='/var/opt/mssql/backup/sim_panama_backup.bak' WITH REPLACE; ALTER DATABASE SIM_PANAMA SET MULTI_USER;"
```

### 6.3 Verificar Base de Datos

```bash
# Verificar tablas
docker exec tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourPassword" -d SIM_PANAMA -C \
  -Q "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'"

# Contar registros PPSH
docker exec tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourPassword" -d SIM_PANAMA -C \
  -Q "SELECT COUNT(*) as total FROM PPSH_SOLICITUD"
```

---

## 7. Sincronización entre Servidores

### 7.1 Sincronizar BD de Preproductivo a Producción

```bash
# 1. Crear backup en Preproductivo (Lightsail)
ssh -i ~/.ssh/KeyPairXXX.pem ubuntu@xx.xx.xx.xx
FECHA=$(date +%Y%m%d)
docker exec tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "Password" -C \
  -Q "BACKUP DATABASE SIM_PANAMA TO DISK='/var/opt/mssql/backup/sim_panama_${FECHA}.bak' WITH FORMAT"
docker cp tramites-sqlserver:/var/opt/mssql/backup/sim_panama_${FECHA}.bak ~/
exit

# 2. Descargar a máquina local
scp -i ~/.ssh/KeyPairXXX.pem ubuntu@xx.xx.xx.xx:~/sim_panama_${FECHA}.bak ./

# 3. Subir a Producción (UMCE)
scp -i ~/.ssh/umce.pem ./sim_panama_${FECHA}.bak ubuntu@permisosmigratorios.online:~/

# 4. Restaurar en Producción
ssh -i ~/.ssh/umce.pem ubuntu@permisosmigratorios.online
docker cp ~/sim_panama_${FECHA}.bak tramites-sqlserver:/var/opt/mssql/backup/
docker exec -u root tramites-sqlserver chown mssql:mssql /var/opt/mssql/backup/sim_panama_${FECHA}.bak
docker exec tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "Password" -C \
  -Q "USE master; ALTER DATABASE SIM_PANAMA SET SINGLE_USER WITH ROLLBACK IMMEDIATE; RESTORE DATABASE SIM_PANAMA FROM DISK='/var/opt/mssql/backup/sim_panama_${FECHA}.bak' WITH REPLACE; ALTER DATABASE SIM_PANAMA SET MULTI_USER;"
```

### 7.2 Sincronizar Archivos de Uploads

```bash
# 1. Crear directorio temporal
mkdir -p /tmp/uploads_sync

# 2. Descargar archivos de Preproductivo
scp -i ~/.ssh/KeyPairForWSL.pem -r \
  ubuntu@xx.xx.xx.xx:~/tramites-mvp-panama/backend/uploads/solicitudes/* \
  /tmp/uploads_sync/

# 3. Subir a Producción
scp -i ~/.ssh/umce.pem -r \
  /tmp/uploads_sync/* \
  ubuntu@permisosmigratorios.online:~/tramites-mvp-panama/backend/uploads/solicitudes/

# 4. Copiar al contenedor
ssh -i ~/.ssh/umce.pem ubuntu@permisosmigratorios.online
docker cp ~/tramites-mvp-panama/backend/uploads/solicitudes/. \
  tramites-backend:/app/uploads/solicitudes/
```

---

## 8. Configuración SSL/HTTPS

### 8.1 Con Let's Encrypt (Recomendado)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d permisosmigratorios.online

# Auto-renovación (automático con cron)
sudo certbot renew --dry-run
```

### 8.2 Configuración Nginx con SSL

```nginx
server {
    listen 80;
    server_name permisosmigratorios.online;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name permisosmigratorios.online;
    
    ssl_certificate /etc/letsencrypt/live/permisosmigratorios.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/permisosmigratorios.online/privkey.pem;
    
    # ... resto de configuración
}
```

---

## 9. Monitoreo y Mantenimiento

### 9.1 Verificar Estado de Servicios

```bash
# Estado de contenedores
docker compose ps

# Uso de recursos
docker stats --no-stream

# Espacio en disco
df -h

# Memoria
free -h
```

### 9.2 Ver Logs

```bash
# Todos los servicios
docker compose logs -f

# Servicio específico
docker compose logs -f backend

# Últimas 100 líneas
docker compose logs --tail=100 backend
```

### 9.3 Mantenimiento Programado

```bash
# Limpiar imágenes no usadas
docker image prune -a

# Limpiar volúmenes no usados (¡cuidado con datos!)
docker volume prune

# Limpiar todo lo no usado
docker system prune
```

### 9.4 Backups Automáticos (Cron)

```bash
# Editar crontab
crontab -e

# Agregar backup diario a las 3 AM
0 3 * * * cd ~/tramites-mvp-panama && ./scripts/backup.sh >> /var/log/backup.log 2>&1
```

---

## 10. Troubleshooting

### 10.1 Contenedor no inicia

```bash
# Ver logs detallados
docker compose logs <servicio>

# Inspeccionar contenedor
docker inspect <container_id>

# Reiniciar servicio
docker compose restart <servicio>
```

### 10.2 Error de conexión a BD

```bash
# Verificar SQL Server
docker logs tramites-sqlserver --tail=50

# Verificar que está healthy
docker ps | grep sqlserver

# Probar conexión
docker exec tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "Password" -Q "SELECT 1" -C
```

### 10.3 Sin memoria

```bash
# Ver memoria
free -h

# Ver uso por contenedor
docker stats --no-stream

# Verificar swap
swapon --show

# Reiniciar para liberar memoria
docker compose restart
```

### 10.4 Disco lleno

```bash
# Ver uso de disco
df -h

# Ver uso de Docker
docker system df

# Limpiar
docker system prune -a
docker volume prune
```

### 10.5 API no responde

```bash
# Verificar backend
docker compose logs backend --tail=50

# Verificar que Nginx enruta correctamente
curl -v http://localhost/health

# Reiniciar backend
docker compose restart backend
```

---

## 📌 Checklist de Despliegue

### Primera Instalación
- [ ] Servidor con Ubuntu 22.04 LTS
- [ ] Docker y Docker Compose instalados
- [ ] Swap de 4GB configurado
- [ ] Firewall configurado (solo 22, 80, 443)
- [ ] Repositorio clonado
- [ ] Archivo .env configurado
- [ ] Contenedores iniciados con `docker compose up -d`
- [ ] Base de datos inicializada
- [ ] API respondiendo en /health

### Actualización
- [ ] `git pull origin main`
- [ ] `docker compose down`
- [ ] `docker compose up -d --build`
- [ ] Verificar `docker compose ps`
- [ ] Probar endpoint de health

### Sincronización Pre → Prod
- [ ] Backup de BD creado en Preproductivo
- [ ] Backup transferido a Producción
- [ ] Backup restaurado en Producción
- [ ] Archivos de uploads sincronizados
- [ ] Verificación de datos

---

## 🔗 URLs de Acceso

| Ambiente | URL | Descripción |
|----------|-----|-------------|
| **Producción** | http://permisosmigratorios.online | Frontend principal |
| **Producción API** | http://permisosmigratorios.online/api/v1/ | API REST |
| **Producción Docs** | http://permisosmigratorios.online/docs | Swagger UI |
| **Preproductivo** | http://23.23.20.56 | Frontend testing |
| **Preproductivo API** | http://23.23.20.56/api/v1/ | API testing |

---

## 📞 Contacto de Soporte

- **Repositorio**: https://github.com/juncid/tramites-mvp-panama
- **Documentación**: `docs/` en el repositorio

---

*Documento generado: 16 de Diciembre de 2025*  
*© 2025 Clio Consulting - Todos los derechos reservados*
