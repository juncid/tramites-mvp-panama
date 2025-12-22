# 🔧 MANUAL DE ADMINISTRADOR
## Sistema de Gestión de Trámites Migratorios - SNM Panamá

**Versión**: 1.1  
**Fecha**: 16 de Diciembre de 2025  
**Autor**: Equipo de Desarrollo  
**Clasificación**: Uso Interno - Administradores del Sistema

---

## 📋 Tabla de Contenidos

1. [Información General](#1-información-general)
2. [Acceso al Servidor](#2-acceso-al-servidor)
3. [Gestión de Contenedores](#3-gestión-de-contenedores)
4. [Gestión de Base de Datos](#4-gestión-de-base-de-datos)
5. [Monitoreo del Sistema](#5-monitoreo-del-sistema)
6. [Gestión de Logs](#6-gestión-de-logs)
7. [Seguridad](#7-seguridad)
8. [Backup y Recuperación](#8-backup-y-recuperación)
9. [Actualizaciones](#9-actualizaciones)
10. [Procedimientos de Emergencia](#10-procedimientos-de-emergencia)

---

## 1. Información General

### 1.1 Arquitectura del Sistema

El sistema está desplegado en un servidor usando contenedores Docker:

- **🟢 Producción (UMCE)**: http://permisosmigratorios.online (3.94.174.109)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DE PRODUCCIÓN                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   USUARIOS                                                       │
│      │                                                           │
│      ▼                                                           │
│   ┌───────────────────────────────────────┐                     │
│   │  tramites-frontend (NGINX)            │                     │
│   │  Puerto 80 → Público                  │                     │
│   │  - Sirve archivos React               │                     │
│   │  - Proxy reverso a API (/api/*)       │                     │
│   └───────────────────────────────────────┘                     │
│                      │                                           │
│                      ▼                                           │
│   ┌───────────────────────────────────────┐                     │
│   │  tramites-backend (FastAPI)           │                     │
│   │  Puerto 8000 → Solo interno           │                     │
│   │  - API REST                           │                     │
│   │  - Validaciones                       │                     │
│   │  - Lógica de negocio                  │                     │
│   └───────────────────────────────────────┘                     │
│              │                    │                              │
│              ▼                    ▼                              │
│   ┌──────────────────┐  ┌──────────────────┐                    │
│   │ tramites-redis   │  │ tramites-sqlserver│                   │
│   │ Puerto 6379      │  │ Puerto 1433       │                   │
│   │ (Solo interno)   │  │ (Solo interno)    │                   │
│   └──────────────────┘  └──────────────────┘                    │
│                                                                  │
│   ┌───────────────────────────────────────┐                     │
│   │  Celery Workers                       │                     │
│   │  - tramites-celery-worker             │                     │
│   │  - tramites-celery-beat               │                     │
│   │  (Tareas en background)               │                     │
│   └───────────────────────────────────────┘                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Información de los Servidores

**🟢 Servidor de Producción **

| Campo | Valor |
|-------|-------|
| **Dominio** | http://permisosmigratorios.online |
| **IP Pública** | 3.94.174.109 |
| **Sistema Operativo** | Ubuntu 22.04 LTS |
| **RAM** | 4 GB + Swap |
| **Usuario SSH** | ubuntu |
| **Llave SSH** | umce.pem |


### 1.3 Puertos y Servicios

| Puerto | Servicio | Acceso | Descripción |
|--------|----------|--------|-------------|
| 22 | SSH | Externo | Administración remota |
| 80 | HTTP | Externo | Frontend + API proxy |
| 443 | HTTPS | Externo | Frontend + API (SSL) |
| 8000 | FastAPI | **Interno** | Backend API |
| 1433 | SQL Server | **Interno** | Base de datos |
| 6379 | Redis | **Interno** | Caché |

---

## 2. Acceso al Servidor

### 2.1 Conexión SSH

```bash
# Desde terminal local
ssh -i /ruta/a/tu-llave.pem ubuntu@23.23.20.56

# Desde la consola de AWS Lightsail
# Ir a Lightsail → Tu instancia → "Connect using SSH"
```

### 2.2 Ubicación de Archivos

```
/home/ubuntu/tramites-panama/
├── backend/                    # Código del backend
├── frontend/                   # Código del frontend
├── deploy/
│   └── lightsail/
│       ├── docker-compose.lightsail.yml
│       ├── .env                # Variables de entorno
│       ├── start.sh            # Script de inicio
│       └── init-db.sh          # Inicialización BD
├── docs/                       # Documentación
└── database/                   # Scripts de BD
```

### 2.3 Credenciales

⚠️ **IMPORTANTE**: Las credenciales están en el archivo `.env`:

```bash
cat ~/tramites-panama/deploy/lightsail/.env
```

---

## 3. Gestión de Contenedores

### 3.1 Ver Estado de Contenedores

```bash
# Ir al directorio de deploy
cd ~/tramites-panama/deploy/lightsail

# Ver todos los contenedores
docker ps -a

# Ver con formato tabla
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**Salida esperada**:
```
NAMES                    STATUS                    PORTS
tramites-frontend        Up 2 hours (healthy)      0.0.0.0:80->80/tcp
tramites-backend         Up 2 hours (healthy)      8000/tcp
tramites-celery-worker   Up 2 hours                8000/tcp
tramites-celery-beat     Up 2 hours                8000/tcp
tramites-redis           Up 2 hours (healthy)      6379/tcp
tramites-sqlserver       Up 2 hours (healthy)      1433/tcp
```

### 3.2 Iniciar/Detener Servicios

```bash
cd ~/tramites-panama/deploy/lightsail

# Iniciar todos los servicios
docker compose -f docker-compose.lightsail.yml up -d

# Detener todos los servicios
docker compose -f docker-compose.lightsail.yml down

# Reiniciar todos los servicios
docker compose -f docker-compose.lightsail.yml restart

# Reiniciar un servicio específico
docker restart tramites-backend
docker restart tramites-frontend
```

### 3.3 Ver Uso de Recursos

```bash
# Estadísticas en tiempo real
docker stats

# Una sola vez
docker stats --no-stream

# Ver uso de disco
docker system df
```

**Salida ejemplo**:
```
CONTAINER ID   NAME                   CPU %   MEM USAGE / LIMIT   MEM %
abc123         tramites-sqlserver     5.2%    1.5GiB / 2GiB       75%
def456         tramites-backend       2.1%    450MiB / 768MiB     58%
ghi789         tramites-frontend      0.1%    50MiB / 128MiB      39%
```

### 3.4 Reconstruir Contenedores

```bash
cd ~/tramites-panama/deploy/lightsail

# Reconstruir sin caché
docker compose -f docker-compose.lightsail.yml build --no-cache

# Reconstruir y reiniciar
docker compose -f docker-compose.lightsail.yml up -d --build
```

---

## 4. Gestión de Base de Datos

### 4.1 Conectar a SQL Server

```bash
# Desde el contenedor
docker exec -it tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "$(grep SQL_PASSWORD ~/tramites-panama/deploy/lightsail/.env | cut -d= -f2)" -C

# O con contraseña directa
docker exec -it tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "TuPassword" -C
```

### 4.2 Comandos SQL Útiles

```sql
-- Ver bases de datos
SELECT name FROM sys.databases;
GO

-- Usar la base de datos del sistema
USE SIM_PANAMA;
GO

-- Ver tablas
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';
GO

-- Contar registros en tabla específica
SELECT COUNT(*) FROM PPSH_SOLICITUD;
GO

-- Ver columnas de una tabla
SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PPSH_SOLICITUD';
GO
```

### 4.3 Ejecutar Scripts SQL

```bash
# Ejecutar un archivo SQL
docker exec -i tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "TuPassword" -C \
  -i /var/opt/mssql/scripts/tu_script.sql

# Copiar archivo al contenedor primero si es necesario
docker cp mi_script.sql tramites-sqlserver:/var/opt/mssql/scripts/
```

---

## 5. Monitoreo del Sistema

### 5.1 Verificar Salud del Sistema

```bash
# Script de verificación rápida
echo "=== Estado de Contenedores ===" && \
docker ps --format "{{.Names}}: {{.Status}}" && \
echo "" && \
echo "=== Memoria ===" && \
free -h && \
echo "" && \
echo "=== Disco ===" && \
df -h / | tail -1 && \
echo "" && \
echo "=== Test Frontend ===" && \
curl -s -o /dev/null -w "%{http_code}" http://localhost/ && \
echo "" && \
echo "=== Test API ===" && \
curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/tramites
```

### 5.2 Monitoreo de Recursos

```bash
# Ver memoria en tiempo real
watch -n 2 free -h

# Ver procesos que más consumen
htop

# Ver uso de disco por directorio
du -sh /var/lib/docker/*
```

### 5.3 Verificar Conectividad

```bash
# Verificar que el frontend responde
curl -I http://localhost/

# Verificar que la API responde
curl -s http://localhost/api/v1/tramites | head -50

# Verificar Redis
docker exec tramites-redis redis-cli ping
# Respuesta esperada: PONG

# Verificar SQL Server
docker exec tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "TuPassword" -Q "SELECT 1" -C -b
```

---

## 6. Gestión de Logs

### 6.1 Ver Logs de Contenedores

```bash
cd ~/tramites-panama/deploy/lightsail

# Todos los logs
docker compose -f docker-compose.lightsail.yml logs

# Últimas 100 líneas
docker compose -f docker-compose.lightsail.yml logs --tail=100

# Logs en tiempo real
docker compose -f docker-compose.lightsail.yml logs -f

# Logs de un servicio específico
docker logs tramites-backend --tail=100
docker logs tramites-frontend --tail=100
docker logs tramites-sqlserver --tail=100
```

### 6.2 Filtrar Logs

```bash
# Buscar errores
docker logs tramites-backend 2>&1 | grep -i error

# Buscar por fecha
docker logs tramites-backend --since "2025-12-13T00:00:00"

# Últimas 24 horas
docker logs tramites-backend --since 24h
```

### 6.3 Logs del Sistema

```bash
# Logs del sistema operativo
sudo journalctl -u docker -n 100

# Logs de Docker daemon
sudo journalctl -u docker.service --since "1 hour ago"
```

### 6.4 Rotación de Logs

Los contenedores tienen rotación automática configurada:
- Máximo 10 MB por archivo
- Máximo 3 archivos de log

Para limpiar logs manualmente:
```bash
# Limpiar logs de un contenedor
sudo truncate -s 0 $(docker inspect --format='{{.LogPath}}' tramites-backend)
```

---

## 7. Seguridad

### 7.1 Configuración de Firewall

El firewall está gestionado por AWS Lightsail. Para verificar:

1. Ir a AWS Lightsail Console
2. Seleccionar la instancia
3. Ir a **Networking** → **IPv4 Firewall**

**Configuración correcta**:
| Puerto | Protocolo | Descripción |
|--------|-----------|-------------|
| 22 | TCP | SSH |
| 80 | TCP | HTTP |
| 443 | TCP | HTTPS |

**Puertos que NO deben estar abiertos**:
- ❌ 8000 (API directa)
- ❌ 1433 (SQL Server)
- ❌ 6379 (Redis)

### 7.2 Verificar que Puerto 8000 está Bloqueado

```bash
# Desde fuera del servidor (tu máquina local)

curl --max-time 5 http://permisosmigratorios.online:8000/docs
# Debe dar timeout o connection refused

# Verificar que SÍ funciona vía proxy
curl http://permisosmigratorios.online/api/v1/tramites | head -20
# Debe responder con JSON
```

### 7.3 Cambiar Contraseñas

```bash
# Editar archivo .env
nano ~/tramites-panama/deploy/lightsail/.env

# Cambiar SQL_PASSWORD
# SQL_PASSWORD=NuevaContraseñaSegura123!

# Reiniciar servicios
docker compose -f docker-compose.lightsail.yml down
docker compose -f docker-compose.lightsail.yml up -d
```

### 7.4 Actualizar el Sistema Operativo

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Reiniciar si es necesario
sudo reboot
```

---

## 8. Backup y Recuperación

### 8.1 Crear Backup de Base de Datos

```bash
# Crear directorio de backups
mkdir -p ~/backups

# Ejecutar backup
docker exec tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "TuPassword" -C \
  -Q "BACKUP DATABASE SIM_PANAMA TO DISK='/var/opt/mssql/backup/sim_panama_$(date +%Y%m%d).bak' WITH FORMAT"

# Copiar backup al host
docker cp tramites-sqlserver:/var/opt/mssql/backup/sim_panama_$(date +%Y%m%d).bak ~/backups/
```

### 8.2 Script de Backup Automatizado

Crear archivo `~/scripts/backup.sh`:

```bash
#!/bin/bash
FECHA=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/backups
SQL_PASSWORD="TuPassword"

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Backup de SQL Server
docker exec tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "$SQL_PASSWORD" -C \
  -Q "BACKUP DATABASE SIM_PANAMA TO DISK='/var/opt/mssql/backup/sim_panama_$FECHA.bak' WITH FORMAT"

docker cp tramites-sqlserver:/var/opt/mssql/backup/sim_panama_$FECHA.bak $BACKUP_DIR/

# Limpiar backups antiguos (mantener últimos 7)
cd $BACKUP_DIR && ls -t *.bak | tail -n +8 | xargs -r rm

echo "Backup completado: $BACKUP_DIR/sim_panama_$FECHA.bak"
```

```bash
# Hacer ejecutable
chmod +x ~/scripts/backup.sh

# Programar con cron (diario a las 2am)
crontab -e
# Agregar: 0 2 * * * /home/ubuntu/scripts/backup.sh >> /home/ubuntu/logs/backup.log 2>&1
```

### 8.3 Restaurar Backup

```bash
# Copiar backup al contenedor
docker cp ~/backups/sim_panama_20251213.bak tramites-sqlserver:/var/opt/mssql/backup/

# Restaurar
docker exec tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "TuPassword" -C \
  -Q "RESTORE DATABASE SIM_PANAMA FROM DISK='/var/opt/mssql/backup/sim_panama_20251213.bak' WITH REPLACE"
```

### 8.4 Backup de Configuración

```bash
# Backup de archivos de configuración
tar -czvf ~/backups/config_$(date +%Y%m%d).tar.gz \
  ~/tramites-panama/deploy/lightsail/.env \
  ~/tramites-panama/frontend/nginx.conf
```

---

## 9. Actualizaciones

### 9.1 Actualizar Código del Sistema

```bash
cd ~/tramites-panama

# Obtener últimos cambios
git fetch origin
git pull origin main

# Reconstruir y reiniciar
cd deploy/lightsail
docker compose -f docker-compose.lightsail.yml up -d --build
```

### 9.2 Actualizar Imágenes Docker

```bash
cd ~/tramites-panama/deploy/lightsail

# Descargar últimas imágenes base
docker compose -f docker-compose.lightsail.yml pull

# Reconstruir con nuevas imágenes
docker compose -f docker-compose.lightsail.yml up -d --build
```

### 9.3 Rollback a Versión Anterior

```bash
cd ~/tramites-panama

# Ver historial de commits
git log --oneline -10

# Volver a un commit específico
git checkout <commit_hash>

# Reconstruir
cd deploy/lightsail
docker compose -f docker-compose.lightsail.yml up -d --build
```

---

## 10. Procedimientos de Emergencia

### 10.1 Sistema No Responde

```bash
# 1. Verificar conectividad básica
ping 23.23.20.56

# 2. Conectar por SSH
ssh -i tu-llave.pem ubuntu@23.23.20.56

# 3. Verificar contenedores
docker ps -a

# 4. Reiniciar todos los servicios
cd ~/tramites-panama/deploy/lightsail
docker compose -f docker-compose.lightsail.yml restart

# 5. Si persiste, reiniciar Docker
sudo systemctl restart docker

# 6. Último recurso: reiniciar servidor
sudo reboot
```

### 10.2 Base de Datos No Conecta

```bash
# 1. Verificar estado del contenedor
docker ps | grep sqlserver

# 2. Ver logs de SQL Server
docker logs tramites-sqlserver --tail=100

# 3. Reiniciar SQL Server
docker restart tramites-sqlserver

# 4. Esperar y verificar
sleep 30
docker exec tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "TuPassword" -Q "SELECT 1" -C
```

### 10.3 Sin Espacio en Disco

```bash
# 1. Ver uso de disco
df -h

# 2. Ver qué consume espacio
du -sh /var/lib/docker/*

# 3. Limpiar Docker
docker system prune -a --volumes

# 4. Limpiar logs antiguos
sudo journalctl --vacuum-time=7d
```

### 10.4 Sin Memoria

```bash
# 1. Ver memoria
free -h

# 2. Verificar swap
swapon --show

# 3. Reiniciar contenedores pesados
docker restart tramites-sqlserver

# 4. Si no hay swap, agregarlo
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```


## 📌 Comandos Rápidos de Referencia

```bash
# Estado del sistema
docker ps                                    # Ver contenedores
docker stats                                 # Ver recursos
free -h                                      # Ver memoria
df -h                                        # Ver disco

# Logs
docker logs tramites-backend --tail=100     # Ver logs
docker compose logs -f                       # Logs en tiempo real

# Reinicio
docker restart tramites-backend             # Reiniciar un servicio
docker compose restart                       # Reiniciar todo

# Backup
./scripts/backup.sh                          # Ejecutar backup

# Actualizar
git pull && docker compose up -d --build    # Actualizar sistema
```

---

*Documento generado: 16 de Diciembre de 2025*  
*© 2025 Clio Consulting - Todos los derechos reservados*
