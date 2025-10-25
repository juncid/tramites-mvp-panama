# 🔧 MANUAL TÉCNICO
## Sistema de Gestión de Trámites Migratorios de Panamá

**Versión**: 1.0  
**Fecha**: Octubre 2025  
**Confidencialidad**: Uso Interno - Personal Técnico  
**Autor**: Equipo de Desarrollo SNMP

---

## 📋 Tabla de Contenidos

1. [Arquitectura del Sistema](#1-arquitectura-del-sistema)
2. [Base de Datos](#2-base-de-datos)
3. [Backend - API REST](#3-backend-api-rest)
4. [Frontend - Aplicación Web](#4-frontend-aplicación-web)
5. [Infraestructura y Deployment](#5-infraestructura-y-deployment)
6. [Seguridad](#6-seguridad)
7. [Monitoreo y Logs](#7-monitoreo-y-logs)
8. [Troubleshooting](#8-troubleshooting)
9. [Procedimientos de Mantenimiento](#9-procedimientos-de-mantenimiento)

---

## 1. Arquitectura del Sistema

### 1.1 Visión General

El sistema sigue una arquitectura de **microservicios** con separación clara de responsabilidades basada en **Clean Architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA GENERAL                     │
└─────────────────────────────────────────────────────────────┘

                          USUARIO
                             │
                             ▼
                    ┌────────────────┐
                    │   FRONTEND     │
                    │   React + TS   │
                    └────────┬───────┘
                             │
                    ┌────────▼───────┐
                    │   NGINX        │
                    │ Reverse Proxy  │
                    └────────┬───────┘
                             │
              ┌──────────────┼──────────────┐
              │                             │
       ┌──────▼──────┐              ┌──────▼──────┐
       │   BACKEND   │              │    REDIS    │
       │ FastAPI+API │◄────────────►│    Cache    │
       └──────┬──────┘              └─────────────┘
              │
              ▼
       ┌─────────────┐
       │  SQL SERVER │
       │  Database   │
       └─────────────┘
```

### 1.2 Componentes Principales

#### Frontend (React + TypeScript)
- **Puerto**: 3000
- **Framework**: React 18 + Vite
- **UI**: CSS Modules
- **Estado**: Context API
- **HTTP Client**: Axios

#### Backend (FastAPI + Python)
- **Puerto**: 8000
- **Framework**: FastAPI 0.104+
- **ORM**: SQLAlchemy 2.0
- **Validación**: Pydantic
- **Autenticación**: JWT (futuro)

#### Base de Datos (SQL Server)
- **Puerto**: 1433
- **Versión**: SQL Server 2019
- **Driver**: ODBC Driver 18
- **Pool**: 20 conexiones máx

#### Caché (Redis)
- **Puerto**: 6379
- **Versión**: Redis 7-alpine
- **Persistencia**: RDB
- **TTL**: Configurable por endpoint

#### Proxy Reverso (Nginx)
- **Puerto**: 80/443
- **Versión**: Nginx Alpine
- **SSL**: Let's Encrypt (producción)
- **Rate Limiting**: Configurado

### 1.3 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│              FLUJO DE UNA PETICIÓN TÍPICA                   │
└─────────────────────────────────────────────────────────────┘

1. Usuario → Frontend (React)
   │ Interacción con UI
   │
2. Frontend → Nginx
   │ HTTP Request (axios)
   │
3. Nginx → Backend (FastAPI)
   │ Proxy Pass, Rate Limit Check
   │
4. Backend → Redis (Opcional)
   │ Cache Lookup
   │ └─ Si existe: Return cached
   │ └─ Si no existe: Continue
   │
5. Backend → SQL Server
   │ Query Database (SQLAlchemy)
   │
6. SQL Server → Backend
   │ Result Set
   │
7. Backend → Redis
   │ Cache Result (si aplica)
   │
8. Backend → Nginx
   │ HTTP Response (JSON)
   │
9. Nginx → Frontend
   │ Response Data
   │
10. Frontend → Usuario
    │ Render UI Update
```

### 1.4 Capas de Clean Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLEAN ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│  CAPA 4: Frameworks & Drivers (Infrastructure)           │
│  • FastAPI Application (main.py)                          │
│  • SQLAlchemy Engine (database.py)                        │
│  • Redis Client (redis_client.py)                         │
│  • Docker Containers                                      │
└───────────────────────────────────────────────────────────┘
                          ▲
                          │
┌───────────────────────────────────────────────────────────┐
│  CAPA 3: Interface Adapters                               │
│  • API Routers (routers/)                                 │
│  • Pydantic Schemas (schemas/)                            │
│  • HTTP Middleware                                        │
└───────────────────────────────────────────────────────────┘
                          ▲
                          │
┌───────────────────────────────────────────────────────────┐
│  CAPA 2: Use Cases (Business Logic)                      │
│  • Services (services/)                                   │
│  • Business Rules                                         │
│  • Validation Logic                                       │
└───────────────────────────────────────────────────────────┘
                          ▲
                          │
┌───────────────────────────────────────────────────────────┐
│  CAPA 1: Entities (Domain Models)                        │
│  • SQLAlchemy Models (models/)                            │
│  • Domain Objects                                         │
│  • Business Entities                                      │
└───────────────────────────────────────────────────────────┘
```

---

## 2. Base de Datos

### 2.1 Diagrama Entidad-Relación

```
┌─────────────────────────────────────────────────────────────┐
│              DIAGRAMA ENTIDAD-RELACIÓN (ER)                 │
└─────────────────────────────────────────────────────────────┘

MÓDULO DE TRÁMITES BASE:
┌─────────────────┐
│   tramites      │
├─────────────────┤
│ PK id           │
│    titulo       │
│    descripcion  │
│    estado       │
│    fecha_creacion│
│    activo       │
└─────────────────┘

MÓDULO PPSH (Simplified):
┌──────────────────────┐         ┌──────────────────────┐
│ PPSH_SOLICITANTE     │         │ PPSH_SOLICITUD       │
├──────────────────────┤         ├──────────────────────┤
│ PK id_solicitante    │◄────────│ PK id_solicitud      │
│    nombres           │  1:N    │ FK id_solicitante    │
│    apellido_paterno  │         │ FK cod_causa         │
│    numero_documento  │         │ FK cod_estado        │
│    email             │         │    numero_solicitud  │
│    telefono          │         │    fecha_solicitud   │
└──────────────────────┘         └──────────────────────┘
         │                                │
         │                                │ 1:N
         │                                ▼
         │                       ┌──────────────────────┐
         │                       │ PPSH_DOCUMENTO       │
         │                       ├──────────────────────┤
         │                       │ PK id_documento      │
         │                       │ FK id_solicitud      │
         │                       │ FK cod_tipo_doc      │
         │                       │    nombre_archivo    │
         │                       │    ruta_archivo      │
         │                       └──────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│ PPSH_CAUSA_HUMANITARIA│        │ PPSH_ESTADO          │
├──────────────────────┤         ├──────────────────────┤
│ PK cod_causa         │         │ PK cod_estado        │
│    nombre            │         │    nombre            │
│    descripcion       │         │    descripcion       │
│    activo            │         │    orden             │
└──────────────────────┘         │    color             │
         ▲                       └──────────────────────┘
         │                                ▲
         │                                │
         └────────────┬───────────────────┘
                      │
              ┌───────┴────────┐
              │ PPSH_SOLICITUD │
              │ (ver arriba)    │
              └────────────────┘

MÓDULO WORKFLOW:
┌──────────────────────┐         ┌──────────────────────┐
│ workflow             │         │ workflow_etapa       │
├──────────────────────┤         ├──────────────────────┤
│ PK id_workflow       │◄────────│ PK id_etapa          │
│    codigo            │  1:N    │ FK id_workflow       │
│    nombre            │         │    codigo            │
│    descripcion       │         │    nombre            │
│    tipo_tramite      │         │    orden             │
│    activo            │         │    requiere_aprobacion│
└──────────────────────┘         └──────────────────────┘
         │                                │
         │                                │
         │                                ▼
         │                       ┌──────────────────────┐
         │                       │ workflow_pregunta    │
         │                       ├──────────────────────┤
         │                       │ PK id_pregunta       │
         │                       │ FK id_etapa          │
         │                       │    texto_pregunta    │
         │                       │    tipo_respuesta    │
         │                       │    opciones          │
         │                       └──────────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────────┐         ┌──────────────────────┐
│ workflow_instancia   │         │ workflow_respuesta   │
├──────────────────────┤         ├──────────────────────┤
│ PK id_instancia      │◄────────│ PK id_respuesta      │
│ FK id_workflow       │  1:N    │ FK id_instancia      │
│ FK id_etapa_actual   │         │ FK id_pregunta       │
│    estado            │         │    respuesta         │
│    fecha_inicio      │         │    fecha_respuesta   │
└──────────────────────┘         └──────────────────────┘
```

### 2.2 Diccionario de Datos

#### 2.2.1 Tabla: tramites

**Descripción**: Tabla principal para gestión de trámites generales.

| Columna | Tipo | Nulo | Default | Descripción |
|---------|------|------|---------|-------------|
| id | INT | NO | IDENTITY | Identificador único (PK) |
| titulo | NVARCHAR(255) | NO | - | Título descriptivo del trámite |
| descripcion | NVARCHAR(MAX) | YES | NULL | Descripción detallada |
| estado | NVARCHAR(50) | NO | 'pendiente' | Estado actual: pendiente, en_proceso, completado, cancelado |
| fecha_creacion | DATETIME | NO | GETDATE() | Fecha de creación del registro |
| fecha_actualizacion | DATETIME | YES | NULL | Última fecha de actualización |
| usuario_creador | INT | YES | NULL | ID del usuario que creó (FK a usuarios) |
| activo | BIT | NO | 1 | Indicador de registro activo (soft delete) |

**Índices**:
- PK: `PK_tramites` (id)
- IX: `IX_tramites_estado` (estado)
- IX: `IX_tramites_fecha_creacion` (fecha_creacion DESC)

#### 2.2.2 Tabla: PPSH_SOLICITUD

**Descripción**: Solicitudes de Permiso Por razones de Seguridad Humanitaria.

| Columna | Tipo | Nulo | Default | Descripción |
|---------|------|------|---------|-------------|
| id_solicitud | INT | NO | IDENTITY | Identificador único (PK) |
| numero_solicitud | NVARCHAR(50) | NO | - | Número de solicitud formato: PPSH-YYYY-NNNN |
| id_solicitante | INT | NO | - | ID del solicitante (FK) |
| cod_causa_humanitaria | NVARCHAR(20) | NO | - | Código de causa (FK) |
| cod_estado | NVARCHAR(20) | NO | 'PENDIENTE' | Estado actual (FK) |
| fecha_solicitud | DATETIME | NO | GETDATE() | Fecha de solicitud |
| fecha_ultima_actualizacion | DATETIME | YES | NULL | Última actualización |
| observaciones | NVARCHAR(MAX) | YES | NULL | Observaciones adicionales |
| activo | BIT | NO | 1 | Registro activo |

**Índices**:
- PK: `PK_PPSH_SOLICITUD` (id_solicitud)
- UK: `UK_PPSH_SOLICITUD_numero` (numero_solicitud)
- IX: `IX_PPSH_SOLICITUD_solicitante` (id_solicitante)
- IX: `IX_PPSH_SOLICITUD_estado` (cod_estado)

#### 2.2.3 Tabla: workflow

**Descripción**: Definiciones de workflows dinámicos.

| Columna | Tipo | Nulo | Default | Descripción |
|---------|------|------|---------|-------------|
| id_workflow | INT | NO | IDENTITY | Identificador único (PK) |
| codigo | NVARCHAR(50) | NO | - | Código único del workflow |
| nombre | NVARCHAR(255) | NO | - | Nombre descriptivo |
| descripcion | NVARCHAR(MAX) | YES | NULL | Descripción detallada |
| tipo_tramite | NVARCHAR(50) | YES | NULL | Tipo de trámite asociado |
| activo | BIT | NO | 1 | Workflow activo |
| fecha_creacion | DATETIME | NO | GETDATE() | Fecha de creación |
| creado_por | INT | YES | NULL | Usuario creador |

**Índices**:
- PK: `PK_workflow` (id_workflow)
- UK: `UK_workflow_codigo` (codigo)
- IX: `IX_workflow_tipo_tramite` (tipo_tramite)

### 2.3 Relaciones y Constraints

```sql
-- Foreign Keys principales

-- PPSH Module
ALTER TABLE PPSH_SOLICITUD
ADD CONSTRAINT FK_PPSH_SOLICITUD_SOLICITANTE
FOREIGN KEY (id_solicitante) REFERENCES PPSH_SOLICITANTE(id_solicitante);

ALTER TABLE PPSH_SOLICITUD
ADD CONSTRAINT FK_PPSH_SOLICITUD_CAUSA
FOREIGN KEY (cod_causa_humanitaria) REFERENCES PPSH_CAUSA_HUMANITARIA(cod_causa);

ALTER TABLE PPSH_SOLICITUD
ADD CONSTRAINT FK_PPSH_SOLICITUD_ESTADO
FOREIGN KEY (cod_estado) REFERENCES PPSH_ESTADO(cod_estado);

-- Workflow Module
ALTER TABLE workflow_etapa
ADD CONSTRAINT FK_workflow_etapa_workflow
FOREIGN KEY (id_workflow) REFERENCES workflow(id_workflow);

ALTER TABLE workflow_instancia
ADD CONSTRAINT FK_workflow_instancia_workflow
FOREIGN KEY (id_workflow) REFERENCES workflow(id_workflow);
```

### 2.4 Scripts de Inicialización

**Ubicación**: `backend/init_database.py`

**Ejecución**:
```bash
cd backend
python init_database.py
```

**Orden de creación**:
1. Tablas de catálogos (sin dependencias)
2. Tablas de seguridad (usuarios, roles)
3. Tablas principales (trámites, PPSH, workflow)
4. Tablas de relación (documentos, comentarios, respuestas)
5. Índices y constraints
6. Datos iniciales

### 2.5 Backup y Restore

#### Backup Manual

```powershell
# Backup completo
sqlcmd -S localhost -U sa -P "YourPassword!" -Q "BACKUP DATABASE SIM_PANAMA TO DISK = 'C:\backups\SIM_PANAMA_$(Get-Date -Format 'yyyyMMdd_HHmmss').bak' WITH COMPRESSION, STATS = 10"
```

```bash
# Backup en Docker
docker exec tramites-db-test /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "TestP@ssw0rd2025!" -Q "BACKUP DATABASE SIM_PANAMA TO DISK = '/var/opt/mssql/backup/SIM_PANAMA_$(date +%Y%m%d_%H%M%S).bak' WITH COMPRESSION" -C
```

#### Restore

```sql
-- Restore desde backup
RESTORE DATABASE SIM_PANAMA
FROM DISK = 'C:\backups\SIM_PANAMA_20251022_100000.bak'
WITH REPLACE, RECOVERY, STATS = 10;
```

#### Backup Automatizado (Recomendado)

Crear job de SQL Server Agent:

```sql
-- Crear job de backup diario
USE msdb;
GO

EXEC sp_add_job
    @job_name = N'Daily_Backup_SIM_PANAMA',
    @enabled = 1;

EXEC sp_add_jobstep
    @job_name = N'Daily_Backup_SIM_PANAMA',
    @step_name = N'Backup Database',
    @subsystem = N'TSQL',
    @command = N'
        DECLARE @BackupFile VARCHAR(500)
        SET @BackupFile = ''C:\backups\SIM_PANAMA_'' + 
                         FORMAT(GETDATE(), ''yyyyMMdd_HHmmss'') + ''.bak''
        
        BACKUP DATABASE SIM_PANAMA
        TO DISK = @BackupFile
        WITH COMPRESSION, STATS = 10
    ';

-- Programar para las 2:00 AM diario
EXEC sp_add_schedule
    @schedule_name = N'Daily_2AM',
    @freq_type = 4,
    @freq_interval = 1,
    @active_start_time = 020000;

EXEC sp_attach_schedule
    @job_name = N'Daily_Backup_SIM_PANAMA',
    @schedule_name = N'Daily_2AM';
```

---

## 3. Backend - API REST

### 3.1 Estructura del Proyecto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # Aplicación FastAPI principal
│   ├── config.py                  # Configuración global
│   ├── database.py                # SQLAlchemy setup
│   ├── redis_client.py            # Redis connection
│   │
│   ├── models/                    # CAPA 1: Entities
│   │   ├── __init__.py
│   │   ├── models_base.py
│   │   ├── models_ppsh.py
│   │   ├── models_tramites.py
│   │   └── models_workflow.py
│   │
│   ├── schemas/                   # CAPA 3: Interface Adapters
│   │   ├── __init__.py
│   │   ├── schemas_ppsh.py
│   │   ├── schemas_tramites.py
│   │   └── schemas_workflow.py
│   │
│   ├── services/                  # CAPA 2: Use Cases
│   │   ├── __init__.py
│   │   ├── services_ppsh.py
│   │   ├── services_tramites.py
│   │   └── services_workflow.py
│   │
│   ├── routers/                   # CAPA 3: Interface Adapters
│   │   ├── __init__.py
│   │   ├── router_health.py
│   │   ├── router_ppsh.py
│   │   ├── router_tramites.py
│   │   └── router_workflow.py
│   │
│   └── utils/                     # Utilidades compartidas
│       ├── __init__.py
│       ├── auth_utils.py
│       ├── file_utils.py
│       └── validation_utils.py
│
├── tests/                         # Tests automatizados
│   ├── unit/
│   ├── integration/
│   └── conftest.py
│
├── alembic/                       # Migraciones de BD
│   ├── versions/
│   └── env.py
│
├── requirements.txt               # Dependencias Python
├── Dockerfile                     # Imagen Docker
├── .env.example                   # Variables de entorno ejemplo
└── pytest.ini                     # Configuración de tests
```

### 3.2 Tecnologías y Dependencias

#### Dependencias Principales

```txt
# requirements.txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pyodbc==5.0.1
pydantic==2.5.0
python-dotenv==1.0.0
redis==5.0.1
python-multipart==0.0.6
```

#### Versiones de Python

- **Mínima**: Python 3.10
- **Recomendada**: Python 3.11
- **Testeada**: Python 3.11.6

### 3.3 API Endpoints

#### 3.3.1 Health Check

```http
GET /health
```

**Respuesta**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-22T10:30:00Z",
  "version": "1.0.0",
  "database": "connected",
  "redis": "connected"
}
```

#### 3.3.2 Trámites Base

```http
GET    /api/v1/tramites              # Listar trámites
POST   /api/v1/tramites              # Crear trámite
GET    /api/v1/tramites/{id}         # Obtener trámite
PUT    /api/v1/tramites/{id}         # Actualizar trámite
DELETE /api/v1/tramites/{id}         # Eliminar trámite (soft)
```

**Ejemplo Request (POST /api/v1/tramites)**:
```json
{
  "titulo": "Solicitud de Visa de Trabajo",
  "descripcion": "Solicitud para permiso de trabajo temporal",
  "estado": "pendiente"
}
```

**Ejemplo Response (200 OK)**:
```json
{
  "id": 1,
  "titulo": "Solicitud de Visa de Trabajo",
  "descripcion": "Solicitud para permiso de trabajo temporal",
  "estado": "pendiente",
  "fecha_creacion": "2025-10-22T10:30:00Z",
  "activo": true
}
```

#### 3.3.3 Módulo PPSH

```http
# Catálogos
GET /api/v1/ppsh/causas-humanitarias    # Listar causas
GET /api/v1/ppsh/tipos-documento        # Listar tipos de documento
GET /api/v1/ppsh/estados                # Listar estados
GET /api/v1/ppsh/conceptos-pago         # Listar conceptos de pago

# Solicitudes
GET    /api/v1/ppsh/solicitudes                    # Listar solicitudes
POST   /api/v1/ppsh/solicitudes                    # Crear solicitud
GET    /api/v1/ppsh/solicitudes/{id}               # Obtener solicitud
PUT    /api/v1/ppsh/solicitudes/{id}               # Actualizar solicitud
POST   /api/v1/ppsh/solicitudes/{id}/documentos    # Subir documento
POST   /api/v1/ppsh/solicitudes/{id}/comentarios   # Agregar comentario
POST   /api/v1/ppsh/solicitudes/{id}/cambiar-estado  # Cambiar estado
```

**Ejemplo Request (POST /api/v1/ppsh/solicitudes)**:
```json
{
  "solicitante": {
    "nombres": "Juan",
    "apellido_paterno": "Pérez",
    "apellido_materno": "García",
    "numero_documento": "8-123-456",
    "pais_nacionalidad": "VEN",
    "fecha_nacimiento": "1990-05-15",
    "sexo": "M",
    "estado_civil": "SOLTERO",
    "email": "juan.perez@email.com",
    "telefono": "+507 6000-1111",
    "direccion_actual": "Calle 50, Ciudad de Panamá"
  },
  "cod_causa_humanitaria": "CONF_ARM",
  "observaciones": "Solicitando protección debido a conflicto armado en país de origen"
}
```

#### 3.3.4 Módulo Workflow

```http
# Workflows
GET    /api/v1/workflow/workflows           # Listar workflows
POST   /api/v1/workflow/workflows           # Crear workflow completo
GET    /api/v1/workflow/workflows/{id}      # Obtener workflow
PUT    /api/v1/workflow/workflows/{id}      # Actualizar workflow
DELETE /api/v1/workflow/workflows/{id}      # Eliminar workflow

# Instancias
GET    /api/v1/workflow/instancias                 # Listar instancias
POST   /api/v1/workflow/instancias                 # Crear instancia
GET    /api/v1/workflow/instancias/{id}            # Obtener instancia
POST   /api/v1/workflow/instancias/{id}/avanzar    # Avanzar etapa
POST   /api/v1/workflow/instancias/{id}/respuestas # Guardar respuestas
GET    /api/v1/workflow/instancias/{id}/historial  # Ver historial
```

**Ejemplo Request (POST /api/v1/workflow/workflows)** - Crear Workflow Completo:
```json
{
  "codigo": "WF_PPSH_001",
  "nombre": "Proceso de Solicitud PPSH",
  "descripcion": "Flujo completo para PPSH",
  "tipo_tramite": "PPSH",
  "etapas": [
    {
      "codigo": "ETAPA_001",
      "nombre": "Registro Inicial",
      "descripcion": "Captura de datos básicos",
      "orden": 1,
      "requiere_aprobacion": false,
      "es_final": false,
      "preguntas": [
        {
          "codigo": "PREG_001",
          "texto_pregunta": "¿Ha estado previamente en Panamá?",
          "tipo_respuesta": "select",
          "opciones": "Si|No",
          "es_obligatoria": true
        }
      ]
    },
    {
      "codigo": "ETAPA_002",
      "nombre": "Carga de Documentos",
      "descripcion": "Subida de documentación",
      "orden": 2,
      "requiere_aprobacion": false,
      "es_final": false
    }
  ],
  "conexiones": [
    {
      "codigo_etapa_origen": "ETAPA_001",
      "codigo_etapa_destino": "ETAPA_002"
    }
  ]
}
```

### 3.4 Autenticación y Autorización

#### Implementación Actual (v1.0)

**Estado**: Autenticación básica sin JWT

```python
# Actualmente en desarrollo
# TODO: Implementar JWT completo
```

#### Implementación Futura (v2.0)

**JWT (JSON Web Tokens)**:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta

SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return username
```

**Uso en endpoints**:
```python
@router.get("/protected")
async def protected_route(current_user: str = Depends(get_current_user)):
    return {"message": f"Hello, {current_user}!"}
```

### 3.5 Caché con Redis

**Implementación**:

```python
# app/redis_client.py
import redis
from functools import wraps
import json

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=int(os.getenv("REDIS_DB", 0)),
    decode_responses=True
)

def cache_result(ttl=300):
    """Decorator para cachear resultados de funciones"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generar key del cache
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Buscar en cache
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # Ejecutar función
            result = await func(*args, **kwargs)
            
            # Guardar en cache
            redis_client.setex(
                cache_key,
                ttl,
                json.dumps(result, default=str)
            )
            
            return result
        return wrapper
    return decorator
```

**Uso**:
```python
from app.redis_client import cache_result

@cache_result(ttl=600)  # Cache por 10 minutos
async def get_causas_humanitarias(db: Session):
    return db.query(CausaHumanitaria).filter_by(activo=True).all()
```

### 3.6 Logging y Trazabilidad

**Configuración de Logging**:

```python
# app/main.py
import logging
import uuid
from fastapi import Request

# Configurar logging
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
    # Generar UUID único para request
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    # Log request
    logger.info(f"[{request_id}] {request.method} {request.url}")
    
    # Ejecutar request
    response = await call_next(request)
    
    # Log response
    logger.info(f"[{request_id}] Status: {response.status_code}")
    
    return response
```

---

## 4. Frontend - Aplicación Web

### 4.1 Estructura del Proyecto

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
│
├── src/
│   ├── api/                      # Cliente API
│   │   ├── axios.ts
│   │   ├── tramites.ts
│   │   ├── ppsh.ts
│   │   └── workflow.ts
│   │
│   ├── components/               # Componentes reutilizables
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── tramites/
│   │   ├── ppsh/
│   │   └── workflow/
│   │
│   ├── pages/                    # Páginas/Vistas
│   │   ├── Home.tsx
│   │   ├── Tramites.tsx
│   │   ├── PPSH.tsx
│   │   └── Workflow.tsx
│   │
│   ├── contexts/                 # Context API
│   │   ├── AuthContext.tsx
│   │   └── AppContext.tsx
│   │
│   ├── hooks/                    # Custom Hooks
│   │   ├── useAuth.ts
│   │   └── useTramites.ts
│   │
│   ├── utils/                    # Utilidades
│   │   ├── format.ts
│   │   └── validation.ts
│   │
│   ├── App.tsx                   # Componente principal
│   ├── App.css                   # Estilos
│   ├── main.tsx                  # Punto de entrada
│   └── vite-env.d.ts
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── Dockerfile
```

### 4.2 Tecnologías

- **React**: 18.2.0
- **TypeScript**: 5.0+
- **Vite**: 4.5+
- **Axios**: 1.6+
- **CSS Modules**: Incluido

### 4.3 Configuración de API Client

```typescript
// src/api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

*Continuaré con las secciones restantes del Manual Técnico en el siguiente archivo...*

---

**Este manual continúa en**: `MANUAL_TECNICO_PARTE2.md`
