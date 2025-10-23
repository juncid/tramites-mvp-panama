# 3. Backend - API REST

Documentación completa del backend FastAPI incluyendo estructura, endpoints, autenticación y mejores prácticas.

---

## 3.1 Estructura del Proyecto

### Organización de Directorios

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
│   │   ├── models.py              # Modelos base (Tramite, Usuario)
│   │   ├── models_ppsh.py         # Modelos PPSH
│   │   └── models_workflow.py     # Modelos Workflow
│   │
│   ├── schemas/                   # CAPA 3: Interface Adapters
│   │   ├── __init__.py
│   │   ├── schemas.py             # Schemas base
│   │   ├── schemas_ppsh.py        # Schemas PPSH
│   │   └── schemas_workflow.py    # Schemas Workflow
│   │
│   ├── services/                  # CAPA 2: Use Cases (futuro)
│   │   ├── __init__.py
│   │   ├── service_ppsh.py
│   │   ├── service_tramites.py
│   │   └── service_workflow.py
│   │
│   ├── routes/                    # CAPA 3: Interface Adapters
│   │   ├── __init__.py
│   │   ├── routes.py              # Rutas trámites base
│   │   ├── routes_ppsh.py         # Rutas módulo PPSH
│   │   ├── routes_workflow.py     # Rutas workflows
│   │   └── routes_health.py       # Health check
│   │
│   ├── middleware.py              # Middlewares HTTP
│   └── utils/                     # Utilidades compartidas
│       ├── __init__.py
│       ├── auth_utils.py          # Autenticación (futuro)
│       ├── file_utils.py          # Manejo de archivos
│       └── validation_utils.py    # Validaciones
│
├── tests/                         # Tests automatizados
│   ├── unit/                      # Tests unitarios
│   ├── integration/               # Tests de integración
│   ├── conftest.py                # Configuración pytest
│   └── test_*.py
│
├── alembic/                       # Migraciones de BD
│   ├── versions/
│   │   └── 001_initial_schema.py
│   ├── env.py
│   └── script.py.mako
│
├── logs/                          # Archivos de log
│   ├── app.log
│   └── error.log
│
├── uploads/                       # Archivos subidos
│   └── ppsh/
│       └── documentos/
│
├── requirements.txt               # Dependencias Python
├── pyproject.toml                 # Configuración Poetry
├── Dockerfile                     # Imagen Docker
├── .env.example                   # Variables de entorno ejemplo
├── pytest.ini                     # Configuración pytest
└── alembic.ini                    # Configuración Alembic
```

---

## 3.2 Tecnologías y Dependencias

### Stack Tecnológico

!!! info "Python 3.11+"
    **Framework**: FastAPI 0.104+  
    **ASGI Server**: Uvicorn 0.24+  
    **ORM**: SQLAlchemy 2.0+ (async ready)  
    **Validación**: Pydantic v2  
    **Cache**: Redis-py 5.0+

### requirements.txt

```txt
# Web Framework
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6

# Database
sqlalchemy==2.0.23
pyodbc==5.0.1
alembic==1.12.1

# Validación y Serialización
pydantic==2.5.0
pydantic-settings==2.1.0

# Cache y Storage
redis==5.0.1

# Autenticación (futuro)
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4

# Configuración
python-dotenv==1.0.0

# Logging y Monitoreo
structlog==23.2.0

# Testing
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2

# Code Quality
black==23.12.0
flake8==6.1.0
mypy==1.7.1
```

### Versiones Requeridas

=== "Python"
    **Mínima**: 3.10  
    **Recomendada**: 3.11+  
    **Testeada**: 3.11.6
    
    ```bash
    python --version
    # Python 3.11.6
    ```

=== "FastAPI"
    **Versión**: 0.104+  
    **Features**: Async/await, OpenAPI 3.1, Pydantic v2
    
    ```bash
    pip install "fastapi[all]>=0.104.0"
    ```

=== "SQLAlchemy"
    **Versión**: 2.0+  
    **Features**: Async support, ORM 2.0 style
    
    ```bash
    pip install "sqlalchemy>=2.0.0"
    ```

---

## 3.3 API Endpoints

### 3.3.1 Health Check

!!! example "Verificación de Salud del Sistema"
    Endpoint para monitoreo de servicios.

```http
GET /health
```

**Respuesta (200 OK)**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-22T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "redis": "connected"
  },
  "uptime_seconds": 3600
}
```

**Implementación**:
```python
# app/routes/routes_health.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.redis_client import redis_client
import time

router = APIRouter(tags=["Health"])
start_time = time.time()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    # Check database
    try:
        db.execute("SELECT 1")
        db_status = "connected"
    except:
        db_status = "disconnected"
    
    # Check Redis
    try:
        redis_client.ping()
        redis_status = "connected"
    except:
        redis_status = "disconnected"
    
    return {
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0",
        "services": {
            "database": db_status,
            "redis": redis_status
        },
        "uptime_seconds": int(time.time() - start_time)
    }
```

---

### 3.3.2 Trámites Base

!!! info "CRUD de Trámites Generales"
    Endpoints para gestión de trámites del sistema base.

#### Listar Trámites

```http
GET /api/v1/tramites?skip=0&limit=100&estado=pendiente
```

**Query Parameters**:

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `skip` | `int` | No | 0 | Offset para paginación |
| `limit` | `int` | No | 100 | Cantidad máxima de resultados |
| `estado` | `string` | No | - | Filtrar por estado |

**Respuesta (200 OK)**:
```json
{
  "total": 250,
  "skip": 0,
  "limit": 100,
  "items": [
    {
      "id": 1,
      "titulo": "Solicitud de Visa de Trabajo",
      "descripcion": "Permiso de trabajo temporal",
      "estado": "pendiente",
      "fecha_creacion": "2025-01-22T10:00:00Z",
      "fecha_actualizacion": null,
      "activo": true,
      "usuario_id": 1
    }
  ]
}
```

#### Crear Trámite

```http
POST /api/v1/tramites
Content-Type: application/json
```

**Request Body**:
```json
{
  "titulo": "Solicitud de Visa de Trabajo",
  "descripcion": "Solicitud para permiso de trabajo temporal en sector construcción",
  "estado": "pendiente",
  "usuario_id": 1
}
```

**Respuesta (201 Created)**:
```json
{
  "id": 1,
  "titulo": "Solicitud de Visa de Trabajo",
  "descripcion": "Solicitud para permiso de trabajo temporal en sector construcción",
  "estado": "pendiente",
  "fecha_creacion": "2025-01-22T10:30:00Z",
  "fecha_actualizacion": null,
  "activo": true,
  "usuario_id": 1
}
```

**Errores**:

=== "400 Bad Request"
    ```json
    {
      "detail": "El título es requerido"
    }
    ```

=== "422 Unprocessable Entity"
    ```json
    {
      "detail": [
        {
          "loc": ["body", "titulo"],
          "msg": "field required",
          "type": "value_error.missing"
        }
      ]
    }
    ```

#### Obtener Trámite

```http
GET /api/v1/tramites/{id}
```

**Path Parameters**:

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `int` | ID del trámite |

**Respuesta (200 OK)**:
```json
{
  "id": 1,
  "titulo": "Solicitud de Visa de Trabajo",
  "descripcion": "Solicitud para permiso de trabajo temporal",
  "estado": "en_proceso",
  "fecha_creacion": "2025-01-22T10:00:00Z",
  "fecha_actualizacion": "2025-01-22T14:30:00Z",
  "activo": true,
  "usuario_id": 1
}
```

**Errores**:

=== "404 Not Found"
    ```json
    {
      "detail": "Trámite no encontrado"
    }
    ```

#### Actualizar Trámite

```http
PUT /api/v1/tramites/{id}
Content-Type: application/json
```

**Request Body** (campos opcionales):
```json
{
  "titulo": "Solicitud de Visa de Trabajo - Actualizado",
  "estado": "en_proceso"
}
```

**Respuesta (200 OK)**:
```json
{
  "id": 1,
  "titulo": "Solicitud de Visa de Trabajo - Actualizado",
  "descripcion": "Solicitud para permiso de trabajo temporal",
  "estado": "en_proceso",
  "fecha_creacion": "2025-01-22T10:00:00Z",
  "fecha_actualizacion": "2025-01-22T15:45:00Z",
  "activo": true,
  "usuario_id": 1
}
```

#### Eliminar Trámite (Soft Delete)

```http
DELETE /api/v1/tramites/{id}
```

**Respuesta (200 OK)**:
```json
{
  "message": "Trámite eliminado exitosamente",
  "id": 1
}
```

---

### 3.3.3 Módulo PPSH

!!! info "Permisos de Protección y Soluciones Humanitarias"
    Endpoints especializados para gestión de solicitudes PPSH.

#### Catálogos PPSH

##### Causas Humanitarias

```http
GET /api/v1/ppsh/causas-humanitarias
```

**Respuesta (200 OK)**:
```json
[
  {
    "codigo": "CONF_ARM",
    "nombre": "Conflicto Armado",
    "descripcion": "Persona afectada por conflicto armado en su país de origen",
    "activo": true
  },
  {
    "codigo": "VIOLENCIA",
    "nombre": "Violencia Generalizada",
    "descripcion": "Situación de violencia generalizada y violación masiva de DDHH",
    "activo": true
  },
  {
    "codigo": "DESASTRE",
    "nombre": "Desastre Natural",
    "descripción": "Afectado por desastre natural en país de origen",
    "activo": true
  }
]
```

##### Tipos de Documento

```http
GET /api/v1/ppsh/tipos-documento
```

**Respuesta (200 OK)**:
```json
[
  {
    "codigo": "PASAPORTE",
    "nombre": "Pasaporte",
    "descripcion": "Copia del pasaporte vigente",
    "activo": true
  },
  {
    "codigo": "CEDULA",
    "nombre": "Cédula de Identidad",
    "descripcion": "Documento de identidad del país de origen",
    "activo": true
  }
]
```

##### Estados de Solicitud

```http
GET /api/v1/ppsh/estados
```

**Respuesta (200 OK)**:
```json
[
  {
    "codigo": "REGISTRADO",
    "nombre": "Registrado",
    "descripcion": "Solicitud registrada en el sistema",
    "orden": 1,
    "es_estado_final": false,
    "activo": true
  },
  {
    "codigo": "EN_REVISION",
    "nombre": "En Revisión",
    "descripcion": "Documentación en proceso de revisión",
    "orden": 2,
    "es_estado_final": false,
    "activo": true
  },
  {
    "codigo": "APROBADO",
    "nombre": "Aprobado",
    "descripcion": "Solicitud aprobada",
    "orden": 6,
    "es_estado_final": true,
    "activo": true
  }
]
```

#### Solicitudes PPSH

##### Crear Solicitud

```http
POST /api/v1/ppsh/solicitudes
Content-Type: application/json
```

**Request Body**:
```json
{
  "solicitante": {
    "nombres": "Juan Carlos",
    "apellido_paterno": "Pérez",
    "apellido_materno": "García",
    "numero_documento": "8-123-456",
    "pais_nacionalidad": "VEN",
    "fecha_nacimiento": "1990-05-15",
    "sexo": "M",
    "estado_civil": "SOLTERO",
    "email": "juan.perez@email.com",
    "telefono": "+507 6000-1111",
    "direccion_actual": "Calle 50, Edificio Plaza, Apto 5B, Ciudad de Panamá"
  },
  "cod_causa_humanitaria": "CONF_ARM",
  "observaciones": "Solicitando protección debido a conflicto armado en país de origen. Riesgo inminente para vida e integridad."
}
```

**Respuesta (201 Created)**:
```json
{
  "id": 1,
  "numero_solicitud": "PPSH-2025-00001",
  "solicitante": {
    "id": 1,
    "nombres": "Juan Carlos",
    "apellido_paterno": "Pérez",
    "apellido_materno": "García",
    "numero_documento": "8-123-456",
    "nombre_completo": "Juan Carlos Pérez García"
  },
  "cod_causa_humanitaria": "CONF_ARM",
  "causa_humanitaria": {
    "codigo": "CONF_ARM",
    "nombre": "Conflicto Armado"
  },
  "cod_estado": "REGISTRADO",
  "estado": {
    "codigo": "REGISTRADO",
    "nombre": "Registrado",
    "orden": 1
  },
  "observaciones": "Solicitando protección debido a conflicto armado...",
  "fecha_solicitud": "2025-01-22T10:30:00Z",
  "fecha_actualizacion": null,
  "activo": true
}
```

##### Subir Documento

```http
POST /api/v1/ppsh/solicitudes/{id}/documentos
Content-Type: multipart/form-data
```

**Form Data**:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `file` | `file` | Sí | Archivo a subir |
| `cod_tipo_documento` | `string` | Sí | Código del tipo de documento |

**Ejemplo con cURL**:
```bash
curl -X POST "http://localhost:8000/api/v1/ppsh/solicitudes/1/documentos" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/pasaporte.pdf" \
  -F "cod_tipo_documento=PASAPORTE"
```

**Respuesta (201 Created)**:
```json
{
  "id": 1,
  "id_solicitud": 1,
  "cod_tipo_documento": "PASAPORTE",
  "nombre_archivo": "pasaporte.pdf",
  "ruta_archivo": "/uploads/ppsh/1/pasaporte_20250122_103000.pdf",
  "tamano_bytes": 2048576,
  "mime_type": "application/pdf",
  "fecha_carga": "2025-01-22T10:30:00Z",
  "activo": true
}
```

##### Cambiar Estado

```http
POST /api/v1/ppsh/solicitudes/{id}/cambiar-estado
Content-Type: application/json
```

**Request Body**:
```json
{
  "nuevo_estado": "EN_REVISION",
  "comentario": "Documentación recibida, iniciando revisión técnica"
}
```

**Respuesta (200 OK)**:
```json
{
  "id": 1,
  "numero_solicitud": "PPSH-2025-00001",
  "cod_estado": "EN_REVISION",
  "estado": {
    "codigo": "EN_REVISION",
    "nombre": "En Revisión",
    "orden": 2
  },
  "fecha_actualizacion": "2025-01-22T11:00:00Z"
}
```

---

### 3.3.4 Módulo Workflow

!!! info "Sistema Dinámico de Flujos de Trabajo"
    Endpoints para crear y gestionar workflows configurables.

#### Crear Workflow Completo

```http
POST /api/v1/workflow/workflows
Content-Type: application/json
```

**Request Body**:
```json
{
  "codigo": "WF_PPSH_001",
  "nombre": "Proceso Completo de Solicitud PPSH",
  "descripcion": "Flujo de 6 etapas para gestionar solicitudes PPSH",
  "tipo_tramite": "PPSH",
  "etapas": [
    {
      "codigo": "ETAPA_001",
      "nombre": "Registro Inicial",
      "descripcion": "Captura de datos básicos del solicitante",
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
        },
        {
          "codigo": "PREG_002",
          "texto_pregunta": "Motivo principal de la solicitud",
          "tipo_respuesta": "textarea",
          "opciones": null,
          "es_obligatoria": true
        }
      ]
    },
    {
      "codigo": "ETAPA_002",
      "nombre": "Carga de Documentos",
      "descripcion": "Subida de documentación requerida",
      "orden": 2,
      "requiere_aprobacion": false,
      "es_final": false,
      "preguntas": [
        {
          "codigo": "PREG_003",
          "texto_pregunta": "Pasaporte vigente",
          "tipo_respuesta": "file",
          "opciones": ".pdf,.jpg,.png",
          "es_obligatoria": true
        }
      ]
    },
    {
      "codigo": "ETAPA_003",
      "nombre": "Revisión Técnica",
      "descripcion": "Evaluación por personal técnico",
      "orden": 3,
      "requiere_aprobacion": true,
      "es_final": false
    },
    {
      "codigo": "ETAPA_004",
      "nombre": "Decisión Final",
      "descripcion": "Aprobación o rechazo de solicitud",
      "orden": 4,
      "requiere_aprobacion": true,
      "es_final": true
    }
  ]
}
```

**Respuesta (201 Created)**:
```json
{
  "id": 1,
  "codigo": "WF_PPSH_001",
  "nombre": "Proceso Completo de Solicitud PPSH",
  "descripcion": "Flujo de 6 etapas para gestionar solicitudes PPSH",
  "tipo_tramite": "PPSH",
  "activo": true,
  "fecha_creacion": "2025-01-22T10:00:00Z",
  "etapas": [
    {
      "id": 1,
      "codigo": "ETAPA_001",
      "nombre": "Registro Inicial",
      "orden": 1,
      "preguntas": [
        {
          "id": 1,
          "codigo": "PREG_001",
          "texto_pregunta": "¿Ha estado previamente en Panamá?",
          "tipo_respuesta": "select",
          "opciones": "Si|No"
        }
      ]
    }
  ]
}
```

#### Crear Instancia de Workflow

```http
POST /api/v1/workflow/instancias
Content-Type: application/json
```

**Request Body**:
```json
{
  "workflow_id": 1,
  "usuario_id": 1,
  "referencia_tramite_id": 1,
  "referencia_tipo": "PPSH_SOLICITUD"
}
```

**Respuesta (201 Created)**:
```json
{
  "id": 1,
  "workflow_id": 1,
  "workflow": {
    "id": 1,
    "codigo": "WF_PPSH_001",
    "nombre": "Proceso Completo de Solicitud PPSH"
  },
  "etapa_actual_id": 1,
  "etapa_actual": {
    "id": 1,
    "nombre": "Registro Inicial",
    "orden": 1
  },
  "estado": "activo",
  "usuario_id": 1,
  "fecha_inicio": "2025-01-22T10:30:00Z",
  "fecha_fin": null,
  "activo": true
}
```

#### Avanzar Etapa

```http
POST /api/v1/workflow/instancias/{id}/avanzar
Content-Type: application/json
```

**Request Body**:
```json
{
  "comentario": "Documentación completa, avanzando a revisión"
}
```

**Respuesta (200 OK)**:
```json
{
  "id": 1,
  "etapa_actual_id": 2,
  "etapa_actual": {
    "id": 2,
    "nombre": "Carga de Documentos",
    "orden": 2
  },
  "estado": "activo",
  "fecha_actualizacion": "2025-01-22T11:00:00Z"
}
```

#### Guardar Respuestas

```http
POST /api/v1/workflow/instancias/{id}/respuestas
Content-Type: application/json
```

**Request Body**:
```json
{
  "respuestas": [
    {
      "pregunta_id": 1,
      "respuesta": "Si"
    },
    {
      "pregunta_id": 2,
      "respuesta": "Conflicto armado en país de origen..."
    }
  ]
}
```

**Respuesta (201 Created)**:
```json
{
  "instancia_id": 1,
  "respuestas_guardadas": 2,
  "respuestas": [
    {
      "id": 1,
      "pregunta_id": 1,
      "respuesta": "Si",
      "fecha_respuesta": "2025-01-22T10:35:00Z"
    },
    {
      "id": 2,
      "pregunta_id": 2,
      "respuesta": "Conflicto armado en país de origen...",
      "fecha_respuesta": "2025-01-22T10:35:00Z"
    }
  ]
}
```

---

## 3.4 Autenticación y Autorización

### 3.4.1 Estado Actual (v1.0)

!!! warning "Implementación Básica"
    **Versión actual**: Sin autenticación JWT  
    **Estado**: En desarrollo  
    **Plan**: Implementar en v2.0

### 3.4.2 Implementación Futura (v2.0)

#### JWT (JSON Web Tokens)

```python
# app/utils/auth_utils.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext

SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar contraseña"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashear contraseña"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Crear JWT token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Obtener usuario actual desde token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # TODO: Buscar usuario en DB
    # user = get_user_by_username(username)
    # if user is None:
    #     raise credentials_exception
    
    return username
```

#### Uso en Endpoints

```python
# app/routes/routes.py
from fastapi import APIRouter, Depends
from app.utils.auth_utils import get_current_user

router = APIRouter()

@router.get("/protected")
async def protected_route(current_user: str = Depends(get_current_user)):
    """Endpoint protegido que requiere autenticación"""
    return {
        "message": f"Hola, {current_user}!",
        "user": current_user
    }

@router.get("/tramites/mis-tramites")
async def get_my_tramites(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener trámites del usuario actual"""
    tramites = db.query(Tramite).filter(
        Tramite.usuario_id == current_user,
        Tramite.activo == True
    ).all()
    
    return tramites
```

---

## 3.5 Caché con Redis

### Configuración del Cliente

```python
# app/redis_client.py
import redis
import os
from functools import wraps
import json
import logging

logger = logging.getLogger(__name__)

# Cliente Redis
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=int(os.getenv("REDIS_DB", 0)),
    decode_responses=True,
    socket_connect_timeout=5,
    socket_timeout=5
)

def cache_result(ttl: int = 300, prefix: str = ""):
    """
    Decorator para cachear resultados de funciones
    
    Args:
        ttl: Time to live en segundos (default: 5 minutos)
        prefix: Prefijo para la key del cache
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generar key del cache
            cache_key = f"{prefix}:{func.__name__}:{str(args)}:{str(kwargs)}"
            
            try:
                # Buscar en cache
                cached = redis_client.get(cache_key)
                if cached:
                    logger.info(f"✅ Cache HIT: {cache_key}")
                    return json.loads(cached)
                
                logger.info(f"❌ Cache MISS: {cache_key}")
            except Exception as e:
                logger.warning(f"⚠️ Error leyendo cache: {e}")
            
            # Ejecutar función
            result = await func(*args, **kwargs)
            
            try:
                # Guardar en cache
                redis_client.setex(
                    cache_key,
                    ttl,
                    json.dumps(result, default=str)
                )
                logger.info(f"💾 Guardado en cache: {cache_key}")
            except Exception as e:
                logger.warning(f"⚠️ Error guardando en cache: {e}")
            
            return result
        return wrapper
    return decorator

def invalidate_cache(pattern: str):
    """Invalidar cache por patrón"""
    try:
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)
            logger.info(f"🗑️ Cache invalidado: {pattern} ({len(keys)} keys)")
    except Exception as e:
        logger.warning(f"⚠️ Error invalidando cache: {e}")
```

### Uso en Endpoints

```python
# app/routes/routes_ppsh.py
from app.redis_client import cache_result, invalidate_cache

@router.get("/causas-humanitarias")
@cache_result(ttl=3600, prefix="ppsh")  # Cache por 1 hora
async def get_causas_humanitarias(db: Session = Depends(get_db)):
    """Obtener catálogo de causas humanitarias (cacheado)"""
    causas = db.query(CausaHumanitaria).filter_by(activo=True).all()
    return causas

@router.post("/causas-humanitarias")
async def create_causa_humanitaria(
    causa: CausaHumanitariaCreate,
    db: Session = Depends(get_db)
):
    """Crear causa humanitaria e invalidar cache"""
    db_causa = CausaHumanitaria(**causa.dict())
    db.add(db_causa)
    db.commit()
    
    # Invalidar cache
    invalidate_cache("ppsh:get_causas_humanitarias:*")
    
    return db_causa
```

---

## 3.6 Logging y Trazabilidad

### Configuración de Logging

```python
# app/main.py
import logging
import uuid
from fastapi import FastAPI, Request
from datetime import datetime

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

app = FastAPI()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware para logging de requests"""
    # Generar UUID único para request
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    # Log request
    logger.info(
        f"[{request_id}] {request.method} {request.url} | "
        f"IP: {request.client.host}"
    )
    
    start_time = datetime.now()
    
    # Ejecutar request
    response = await call_next(request)
    
    # Calcular tiempo de respuesta
    process_time = (datetime.now() - start_time).total_seconds()
    
    # Log response
    logger.info(
        f"[{request_id}] Status: {response.status_code} | "
        f"Time: {process_time:.3f}s"
    )
    
    # Agregar headers de trazabilidad
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = str(process_time)
    
    return response
```

### Structured Logging (Avanzado)

```python
# app/utils/logging_utils.py
import structlog
import logging

def setup_structured_logging():
    """Configurar structured logging con structlog"""
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

# Uso
log = structlog.get_logger()

log.info("solicitud_creada", 
         solicitud_id=1, 
         numero="PPSH-2025-00001",
         causa="CONF_ARM")
```

**Output JSON**:
```json
{
  "event": "solicitud_creada",
  "solicitud_id": 1,
  "numero": "PPSH-2025-00001",
  "causa": "CONF_ARM",
  "timestamp": "2025-01-22T10:30:00.123456Z",
  "level": "info",
  "logger": "app.routes.routes_ppsh"
}
```

---

## Navegación

[← Base de Datos](02-database.md) | [Manual Técnico](index.md) | [Frontend →](04-frontend.md)
