# 🚀 Guía de Despliegue - Sistema de Trámites Migratorios

## 📋 Índice
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Componentes Implementados](#componentes-implementados)
4. [Inicialización de la Base de Datos](#inicialización-de-la-base-de-datos)
5. [Health Checks y Monitoreo](#health-checks-y-monitoreo)
6. [Sistema de Logging](#sistema-de-logging)
7. [Despliegue con Docker Compose](#despliegue-con-docker-compose)
8. [Verificación Post-Despliegue](#verificación-post-despliegue)
9. [Solución de Problemas](#solución-de-problemas)

---

## 🎯 Resumen Ejecutivo

Sistema completo de gestión de trámites migratorios para el Servicio Nacional de Migración de Panamá (SNM), desplegado con **Docker Compose**, utilizando **SQL Server 2022** como base de datos principal.

### Características Principales
- ✅ Base de datos **SIM_PANAMA** con 14 tablas iniciales
- ✅ Inicialización automática de la base de datos
- ✅ Health checks para monitoreo del estado del sistema
- ✅ Middleware de logging para trazabilidad completa
- ✅ API REST con FastAPI
- ✅ Frontend React con Vite
- ✅ Redis para caché
- ✅ Documentación completa de la base de datos

---

## 🏗️ Arquitectura del Sistema

```
┌──────────────────────────────────────────────────────────┐
│                     DOCKER COMPOSE                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Frontend    │  │   Backend    │  │   DB Init    │ │
│  │  (React/Vite) │  │   (FastAPI)  │  │   (Script)   │ │
│  │  Port: 5173   │  │  Port: 8000  │  │  One-time    │ │
│  └───────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│          │                 │                  │         │
│          └─────────────────┼──────────────────┘         │
│                            │                            │
│  ┌───────────────┐  ┌──────┴───────┐                   │
│  │     Redis     │  │  SQL Server  │                   │
│  │  Port: 6379   │  │  Port: 1433  │                   │
│  └───────────────┘  └──────────────┘                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Flujo de Inicialización

```
1. SQL Server inicia → Health Check (30 retries)
2. DB-Init verifica SQL Server → Ejecuta init_database.sql
3. Backend espera DB-Init → Inicia aplicación FastAPI
4. Frontend inicia → Se conecta al Backend
5. Redis disponible para caché
```

---

## 🔧 Componentes Implementados

### 1. Base de Datos (SQL Server 2022)

**Nombre:** `SIM_PANAMA`

#### Módulos Principales:
- **Seguridad (SEG_TB_*)**: Usuarios, roles, permisos, auditoría
- **Trámites**: Gestión de solicitudes de trámites migratorios
- **Catálogos Generales (SIM_GE_*)**: Tipos de documentos, países, nacionalidades, etc.

#### Tablas Implementadas (14):
1. `tramites` - Tabla principal de trámites
2. `SEG_TB_USUARIOS` - Usuarios del sistema
3. `SEG_TB_ROLES` - Roles y permisos
4. `SEG_TB_PERMISOS` - Permisos granulares
5. `SEG_TB_ROLES_PERMISOS` - Relación roles-permisos
6. `SEG_TB_AUDITORIA` - Log de auditoría
7. `SIM_GE_TIPO_DOCUMENTO` - Tipos de documentos
8. `SIM_GE_TIPO_TRAMITE` - Tipos de trámites
9. `SIM_GE_ESTADO_TRAMITE` - Estados de trámites
10. `SIM_GE_PAIS` - Catálogo de países
11. `SIM_GE_NACIONALIDAD` - Catálogo de nacionalidades
12. `SIM_GE_TIPO_PERSONA` - Tipos de persona
13. `SIM_GE_OFICINA_MIGRATORIA` - Oficinas del SNM
14. `SIM_GE_SEDE_MIGRATORIA` - Sedes del SNM

#### Datos Iniciales:
- 🔐 Usuario admin predeterminado
- 👥 5 roles básicos (Administrador, Supervisor, Operador, Consulta, Auditor)
- 📄 12 tipos de documentos
- 🌍 20+ países
- 🏢 10 oficinas migratorias

### 2. Backend (FastAPI)

**Archivo:** `backend/app/main.py`

#### Endpoints Principales:

```python
# Raíz
GET / 
→ Información del servicio

# Health Checks
GET /health
→ Estado general del servicio

GET /health/database
→ Estado detallado de la base de datos
  - Conectividad
  - Conteo de tablas
  - Conteo de trámites
  - Usuarios activos
  - Versión de SQL Server

# API
GET /api/v1/tramites
POST /api/v1/tramites
GET /api/v1/tramites/{id}
PUT /api/v1/tramites/{id}
DELETE /api/v1/tramites/{id}
```

#### Middleware de Logging:

**Archivo:** `backend/app/middleware.py`

Dos implementaciones disponibles:

1. **LoggerMiddleware** (Básico)
   - Log de cada request/response
   - Tiempo de procesamiento
   - Código de estado HTTP

2. **RequestLoggingMiddleware** (Detallado)
   - ID único de request
   - Client IP
   - User Agent
   - Query parameters
   - Body de request (si aplica)
   - Logging con emojis según status code:
     - ✅ 200-299: Success
     - ⚠️ 300-399: Redirect
     - ❌ 400-499: Client Error
     - 💥 500-599: Server Error

### 3. Script de Inicialización

**Archivo:** `backend/init-db.sh`

#### Características:
- ⏱️ **Retry Logic**: 30 intentos con espera de 2 segundos
- ✅ **Verificación de Conectividad**: Test de conexión a SQL Server
- 🔍 **Validación de BD**: Verifica si SIM_PANAMA existe
- 📊 **Conteo de Tablas**: Valida la creación correcta
- 📝 **Logging Detallado**: Emojis y colores para mejor visualización
- 🚨 **Manejo de Errores**: Mensajes claros y salidas con código de error

#### Flujo de Ejecución:

```bash
1. Esperar SQL Server (health check)
2. Intentar conexión (max 30 retries)
3. Verificar si BD existe
   ├─ Si existe → Skip
   └─ Si no existe → Crear y ejecutar init_database.sql
4. Contar tablas creadas
5. Mostrar resumen de estado
```

### 4. Docker Compose

**Archivo:** `docker-compose.yml`

#### Servicios Configurados:

```yaml
sqlserver:
  - Image: mcr.microsoft.com/mssql/server:2022-latest
  - Port: 1433
  - Health Check: sqlcmd query cada 10s
  - Volume persistente: sqlserver-data

db-init:
  - Script de inicialización one-time
  - Depende de: sqlserver (healthy)
  - Ejecuta: init-db.sh
  - Volume: init_database.sql

backend:
  - FastAPI + Uvicorn
  - Port: 8000
  - Depende de: db-init, redis
  - Volume logs: backend-logs
  - Hot-reload habilitado

frontend:
  - React + Vite
  - Port: 5173
  - Depende de: backend

redis:
  - Port: 6379
  - Volume persistente: redis-data
```

### 5. Configuración

**Archivo:** `backend/app/config.py`

```python
class Settings:
    # Application
    app_name: str = "Trámites MVP Panamá"
    debug: bool = True
    environment: str = "development"
    
    # Database
    database_name: str = "SIM_PANAMA"
    database_host: str = "sqlserver"
    database_port: int = 1433
    database_user: str = "sa"
    database_password: str = "YourStrong@Passw0rd"
    
    # Logging
    log_level: str = "INFO"
```

---

## 🗄️ Inicialización de la Base de Datos

### Archivo SQL

**Ubicación:** `backend/bbdd/init_database.sql`

### Estructura del Script:

```sql
-- 1. Crear base de datos SIM_PANAMA
CREATE DATABASE SIM_PANAMA
GO
USE SIM_PANAMA
GO

-- 2. Crear tablas (14 tablas)
CREATE TABLE tramites (...)
CREATE TABLE SEG_TB_USUARIOS (...)
CREATE TABLE SEG_TB_ROLES (...)
-- ... etc

-- 3. Insertar datos iniciales
INSERT INTO SEG_TB_ROLES VALUES (...)
INSERT INTO SIM_GE_TIPO_DOCUMENTO VALUES (...)
-- ... etc

-- 4. Crear vistas
CREATE VIEW v_tramites_activos AS ...

-- 5. Crear stored procedures
CREATE PROCEDURE sp_crear_tramite @param1, @param2 AS ...
```

### Verificación Manual:

```bash
# Conectarse al contenedor SQL Server
docker exec -it <sqlserver-container> /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourStrong@Passw0rd

# Verificar base de datos
SELECT name FROM sys.databases WHERE name = 'SIM_PANAMA';

# Contar tablas
USE SIM_PANAMA;
SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';

# Ver tablas
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';
```

---

## 🏥 Health Checks y Monitoreo

### Endpoints Disponibles:

#### 1. Health Check Básico

```bash
curl http://localhost:8000/health
```

**Respuesta:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "tramites-api",
  "version": "1.0.0",
  "environment": "development"
}
```

#### 2. Health Check de Base de Datos

```bash
curl http://localhost:8000/health/database
```

**Respuesta (Success):**
```json
{
  "status": "healthy",
  "database": "SIM_PANAMA",
  "host": "sqlserver",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "Base de datos operando correctamente",
  "details": {
    "connection": "✅ OK",
    "database_name": "SIM_PANAMA",
    "tables": 14,
    "tramites_count": 0,
    "active_users": 1,
    "sql_server_version": "Microsoft SQL Server 2022..."
  }
}
```

**Respuesta (Error):**
```json
{
  "status": "unhealthy",
  "database": "SIM_PANAMA",
  "host": "sqlserver",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "No se pudo conectar a la base de datos",
  "error": "Connection timeout"
}
```
*HTTP Status: 503 Service Unavailable*

### Health Check Docker Compose:

```yaml
healthcheck:
  test: ["CMD-SHELL", "sqlcmd -S localhost -U sa -P $$SA_PASSWORD -Q 'SELECT 1' || exit 1"]
  interval: 10s
  timeout: 3s
  retries: 3
  start_period: 30s
```

---

## 📝 Sistema de Logging

### Configuración de Logging

**Ubicación:** `backend/app/middleware.py`

### Niveles de Log:

```python
DEBUG   - Información detallada de debugging
INFO    - Información general (requests, responses)
WARNING - Advertencias (uso incorrecto, deprecations)
ERROR   - Errores manejables
CRITICAL - Errores críticos del sistema
```

### Formato de Logs:

```
2024-01-15 10:30:15 - app.main - INFO - 🚀 Aplicación FastAPI inicializada
2024-01-15 10:30:20 - app.middleware - INFO - ✅ 200 GET /api/v1/tramites (125ms)
2024-01-15 10:30:25 - app.middleware - WARNING - ⚠️ 404 GET /api/v1/invalid (15ms)
2024-01-15 10:30:30 - app.middleware - ERROR - ❌ 500 POST /api/v1/tramites (250ms)
```

### Ejemplo de Log Detallado:

```log
============================================================
  🚀 NUEVA REQUEST
============================================================
  Request ID: abc123-def456-789
  Method: POST
  Path: /api/v1/tramites
  Client: 172.18.0.5
  User-Agent: Mozilla/5.0...
------------------------------------------------------------
  Body: {"tipo": "PASAPORTE", "estado": "PENDIENTE"}
------------------------------------------------------------
  ✅ Response Status: 201 CREATED
  Time: 150ms
============================================================
```

### Ubicación de Logs:

- **Consola**: Logs en tiempo real en `docker-compose logs -f backend`
- **Archivo**: `/app/logs/app.log` (dentro del contenedor)
- **Volume**: `backend-logs:/app/logs` (persistente)

### Ver Logs:

```bash
# Logs en tiempo real
docker-compose logs -f backend

# Logs del contenedor
docker exec -it <backend-container> cat /app/logs/app.log

# Logs desde volume
docker volume inspect tramites-mvp-panama_backend-logs
```

---

## 🚀 Despliegue con Docker Compose

### Pre-requisitos:

- ✅ Docker Engine 20.10+
- ✅ Docker Compose 2.0+
- ✅ 4GB RAM mínimo (8GB recomendado)
- ✅ 10GB espacio en disco

### Pasos de Despliegue:

#### 1. Clonar Repositorio (si aplica)

```bash
git clone <repository-url>
cd tramites-mvp-panama
```

#### 2. Configurar Variables de Entorno (Opcional)

Crear `.env` en la raíz:

```bash
# Database
SA_PASSWORD=YourStrong@Passw0rd
DATABASE_NAME=SIM_PANAMA

# Backend
LOG_LEVEL=INFO
ENVIRONMENT=development

# Frontend
VITE_API_URL=http://localhost:8000
```

#### 3. Construir Imágenes

```bash
docker-compose build
```

#### 4. Iniciar Servicios

```bash
docker-compose up -d
```

#### 5. Verificar Estado

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f sqlserver
docker-compose logs -f db-init
```

### Comandos Útiles:

```bash
# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: Borra datos)
docker-compose down -v

# Reiniciar un servicio
docker-compose restart backend

# Reconstruir un servicio
docker-compose up -d --build backend

# Ver recursos
docker stats

# Ejecutar comando en contenedor
docker-compose exec backend bash
docker-compose exec sqlserver bash
```

---

## ✅ Verificación Post-Despliegue

### Checklist de Verificación:

#### 1. ✅ SQL Server Operativo

```bash
# Health check del contenedor
docker-compose ps sqlserver

# Verificar logs
docker-compose logs sqlserver | grep "SQL Server is now ready"

# Test de conexión
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourStrong@Passw0rd -Q "SELECT @@VERSION"
```

#### 2. ✅ Base de Datos Inicializada

```bash
# Ver logs de inicialización
docker-compose logs db-init

# Verificar existencia de BD
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourStrong@Passw0rd \
  -Q "SELECT name FROM sys.databases WHERE name = 'SIM_PANAMA'"

# Contar tablas
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourStrong@Passw0rd -d SIM_PANAMA \
  -Q "SELECT COUNT(*) as TablesCount FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"
```

**Resultado esperado:** `TablesCount = 14`

#### 3. ✅ Backend Funcionando

```bash
# Health check básico
curl http://localhost:8000/health

# Health check de BD
curl http://localhost:8000/health/database

# Listar trámites
curl http://localhost:8000/api/v1/tramites

# Ver documentación
open http://localhost:8000/api/docs
```

#### 4. ✅ Frontend Accesible

```bash
# Abrir en navegador
open http://localhost:5173
```

#### 5. ✅ Redis Operativo

```bash
# Test de conexión
docker-compose exec redis redis-cli ping
```

**Resultado esperado:** `PONG`

#### 6. ✅ Logs Funcionando

```bash
# Ver logs del backend
docker-compose logs -f backend

# Hacer request y verificar log
curl http://localhost:8000/api/v1/tramites
# Debería aparecer log inmediatamente
```

### Script de Verificación Automática:

```bash
#!/bin/bash
echo "🔍 Verificando Sistema de Trámites..."

echo "1. Verificando SQL Server..."
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourStrong@Passw0rd -Q "SELECT 1" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ SQL Server OK"
else
    echo "   ❌ SQL Server FAIL"
fi

echo "2. Verificando Base de Datos..."
TABLES=$(docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourStrong@Passw0rd -d SIM_PANAMA -h -1 \
  -Q "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'" 2>/dev/null)
if [ "$TABLES" -ge 14 ]; then
    echo "   ✅ Base de Datos OK (${TABLES} tablas)"
else
    echo "   ❌ Base de Datos FAIL (${TABLES} tablas)"
fi

echo "3. Verificando Backend..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ "$HTTP_CODE" -eq 200 ]; then
    echo "   ✅ Backend OK"
else
    echo "   ❌ Backend FAIL (HTTP ${HTTP_CODE})"
fi

echo "4. Verificando Frontend..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
if [ "$HTTP_CODE" -eq 200 ]; then
    echo "   ✅ Frontend OK"
else
    echo "   ❌ Frontend FAIL (HTTP ${HTTP_CODE})"
fi

echo "5. Verificando Redis..."
PONG=$(docker-compose exec redis redis-cli ping 2>/dev/null)
if [ "$PONG" = "PONG" ]; then
    echo "   ✅ Redis OK"
else
    echo "   ❌ Redis FAIL"
fi

echo ""
echo "✅ Verificación completa!"
```

---

## 🔧 Solución de Problemas

### Problema 1: SQL Server no inicia

**Síntomas:**
```
sqlserver | SQL Server failed to start
```

**Soluciones:**
1. Verificar recursos (RAM mínimo 2GB)
   ```bash
   docker stats
   ```

2. Verificar contraseña (debe cumplir política de seguridad)
   - Al menos 8 caracteres
   - Mayúsculas, minúsculas, números y símbolos

3. Eliminar volúmenes y reiniciar
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

### Problema 2: Base de datos no se inicializa

**Síntomas:**
```
db-init | ❌ Error: Unable to connect to SQL Server
```

**Soluciones:**
1. Verificar que SQL Server esté healthy
   ```bash
   docker-compose ps sqlserver
   ```

2. Ver logs de SQL Server
   ```bash
   docker-compose logs sqlserver
   ```

3. Verificar init_database.sql existe
   ```bash
   ls -lh backend/bbdd/init_database.sql
   ```

4. Ejecutar inicialización manual
   ```bash
   docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
     -S localhost -U sa -P YourStrong@Passw0rd \
     -i /docker-entrypoint-initdb.d/init_database.sql
   ```

### Problema 3: Backend no conecta a BD

**Síntomas:**
```
backend | sqlalchemy.exc.OperationalError: Unable to connect
```

**Soluciones:**
1. Verificar configuración en `config.py`
   ```python
   database_name: str = "SIM_PANAMA"  # No tramites_db
   ```

2. Verificar conexión desde backend
   ```bash
   docker-compose exec backend python -c "from app.database import engine; engine.connect()"
   ```

3. Verificar network
   ```bash
   docker network inspect tramites-mvp-panama_default
   ```

### Problema 4: Health check falla

**Síntomas:**
```
curl http://localhost:8000/health/database
→ 503 Service Unavailable
```

**Soluciones:**
1. Ver logs detallados del backend
   ```bash
   docker-compose logs -f backend
   ```

2. Verificar tablas existen
   ```bash
   docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
     -S localhost -U sa -P YourStrong@Passw0rd -d SIM_PANAMA \
     -Q "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES"
   ```

3. Reiniciar backend
   ```bash
   docker-compose restart backend
   ```

### Problema 5: Logs no aparecen

**Síntomas:**
```
No se ven logs en docker-compose logs backend
```

**Soluciones:**
1. Verificar volumen de logs
   ```bash
   docker volume ls | grep backend-logs
   ```

2. Verificar permisos del directorio
   ```bash
   docker-compose exec backend ls -la /app/logs
   ```

3. Verificar LOG_LEVEL en config
   ```python
   log_level: str = "INFO"  # No "ERROR"
   ```

### Problema 6: Performance lenta

**Síntomas:**
```
Respuestas lentas (>1s)
```

**Soluciones:**
1. Verificar recursos
   ```bash
   docker stats
   ```

2. Verificar indices en BD
   ```sql
   SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('tramites')
   ```

3. Habilitar query logging
   ```python
   # En config.py
   debug: bool = True
   ```

4. Ver slow queries en logs
   ```bash
   docker-compose logs backend | grep "ms)" | awk '$NF > 1000'
   ```

---

## 📚 Documentación Adicional

### Archivos de Referencia:

1. **DATABASE_DOCUMENTATION.md** - Documentación completa de la base de datos
2. **DATABASE_INDEX.md** - Índice maestro de documentación
3. **backend/bbdd/README.md** - Guía de instalación de BD
4. **backend/bbdd/QUICK_REFERENCE.md** - Referencia rápida SQL
5. **backend/bbdd/SETUP_SUMMARY.md** - Resumen de configuración

### Scripts Útiles:

1. **backend/verify_database.py** - Script de verificación automática
   ```bash
   docker-compose exec backend python verify_database.py
   ```

2. **backend/init-db.sh** - Script de inicialización
   ```bash
   docker-compose exec backend bash init-db.sh
   ```

### URLs Importantes:

- **API Docs**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI**: http://localhost:8000/api/openapi.json
- **Health Check**: http://localhost:8000/health
- **DB Health**: http://localhost:8000/health/database
- **Frontend**: http://localhost:5173

---

## 🎓 Mejores Prácticas

### Desarrollo:

1. **Siempre verificar health checks antes de desarrollar**
   ```bash
   curl http://localhost:8000/health/database
   ```

2. **Usar logs para debugging**
   ```bash
   docker-compose logs -f backend
   ```

3. **Ejecutar verify_database.py regularmente**
   ```bash
   docker-compose exec backend python verify_database.py
   ```

### Producción:

1. **Cambiar contraseñas predeterminadas**
   ```bash
   SA_PASSWORD=<secure-password>
   ```

2. **Configurar CORS apropiadamente**
   ```python
   allow_origins=["https://midominio.com"]
   ```

3. **Deshabilitar debug**
   ```python
   debug: bool = False
   ```

4. **Usar variables de entorno para secrets**
   ```bash
   docker-compose --env-file .env.prod up -d
   ```

5. **Configurar backup automático**
   ```bash
   # Cron job para backup diario
   0 2 * * * docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
     -S localhost -U sa -P $SA_PASSWORD \
     -Q "BACKUP DATABASE SIM_PANAMA TO DISK='/var/opt/mssql/backup/SIM_PANAMA.bak'"
   ```

---

## 📞 Soporte

Para problemas o preguntas:

1. Revisar logs: `docker-compose logs`
2. Verificar documentación en `DATABASE_INDEX.md`
3. Ejecutar script de verificación: `verify_database.py`
4. Consultar esta guía de despliegue

---

**Última actualización:** Enero 2024  
**Versión del Sistema:** 1.0.0  
**Autor:** Sistema de Trámites Migratorios - SNM Panamá
