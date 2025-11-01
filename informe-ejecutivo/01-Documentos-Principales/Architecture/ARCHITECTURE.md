# Diagrama de Arquitectura - Trámites MVP Panamá

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUARIO FINAL                                │
│                      (Navegador Web)                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP (Puerto 3000)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND - React/TypeScript                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  • React 18 + TypeScript                                      │   │
│  │  • Vite (Build Tool + HMR)                                    │   │
│  │  • Axios (HTTP Client)                                        │   │
│  │  • Componentes: App.tsx, API Client                          │   │
│  │  • Estilos: CSS moderno responsivo                           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                      Container: tramites-frontend                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP REST API (Puerto 8000)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   BACKEND - FastAPI/Python                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Endpoints REST API (SIM_FT - Sistema Oficial):               │   │
│  │  • GET    /api/v1/sim-ft/tramites                    (Lista) │   │
│  │  • GET    /api/v1/sim-ft/tramites/{año}/{num}/{reg}  (Ver)   │   │
│  │  • POST   /api/v1/sim-ft/tramites                    (Crear) │   │
│  │  • PUT    /api/v1/sim-ft/tramites/{año}/{num}/{reg}  (Editar)│   │
│  │  • POST   /api/v1/sim-ft/tramites/{id}/cierre        (Cerrar)│   │
│  │                                                               │   │
│  │  ⚠️ Legacy (DEPRECADOS - No usar):                            │   │
│  │  • /api/v1/tramites/*  → Migrar a /api/v1/sim-ft/tramites    │   │
│  │                                                               │   │
│  │  Características:                                             │   │
│  │  • FastAPI + Uvicorn                                         │   │
│  │  • SQLAlchemy ORM                                            │   │
│  │  • Pydantic Validation                                       │   │
│  │  • Redis Cache Integration                                   │   │
│  │  • CORS Middleware                                           │   │
│  │  • OpenAPI/Swagger Docs                                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                      Container: tramites-backend                     │
└─────────┬────────────────────────────────────────┬───────────────────┘
          │                                        │
          │ SQL (Puerto 1433)                      │ Redis Protocol (Puerto 6379)
          ▼                                        ▼
┌──────────────────────────┐          ┌──────────────────────────────┐
│  MS SQL SERVER 2022      │          │         REDIS 7              │
│  ┌────────────────────┐  │          │  ┌────────────────────────┐  │
│  │ Base de Datos:     │  │          │  │ Cache Layer:           │  │
│  │                    │  │          │  │                        │  │
│  │ SIM_PANAMA         │  │          │  │ • Query caching        │  │
│  │                    │  │          │  │ • TTL: 5 minutos       │  │
│  │ Tablas SIM_FT:     │  │          │  │ • AOF persistence      │  │
│  │ - SIM_FT_TRAMITE_E │  │          │  │                        │  │
│  │ - SIM_FT_TRAMITES  │  │          │  │ Keys Pattern:          │  │
│  │ - SIM_FT_ESTATUS   │  │          │  │ - sim_ft:tramites:*    │  │
│  │ - SIM_FT_TRAMITE_D │  │          │  │ - sim_ft:tramite:*     │  │
│  │                    │  │          │  └────────────────────────┘  │
│  │ Legacy (DEPRECADO):│  │          │                              │
│  │ - TRAMITE          │  │          │   Container: tramites-redis  │
│  └────────────────────┘  │          └──────────────────────────────┘
│                          │
│  Features:               │
│  • Health checks         │
│  • Volume persistence    │
│  • Developer Edition     │
│                          │
│  Container:              │
│  tramites-sqlserver      │
└──────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    DOCKER NETWORK: tramites-network                  │
│  • Bridge network                                                    │
│  • Aislamiento de servicios                                         │
│  • Comunicación interna                                             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        DOCKER VOLUMES                                │
│  • sqlserver-data  (Persistencia de SQL Server)                     │
│  • redis-data      (Persistencia de Redis)                          │
└─────────────────────────────────────────────────────────────────────┘
```

## Flujo de Datos

### 1. Crear un Trámite (Sistema SIM_FT)

```
Usuario
   │
   │ 1. Completa formulario
   │    (COD_TRAMITE, IND_ESTATUS, observaciones)
   ▼
Frontend (React)
   │
   │ 2. POST /api/v1/sim-ft/tramites
   │    { NUM_ANNIO, NUM_TRAMITE, COD_TRAMITE, etc. }
   ▼
Backend (routers_sim_ft.py)
   │
   ├─→ 3. Validación (schemas_sim_ft.py)
   │      SimFtTramiteECreate schema
   │
   ├─→ 4. Crear modelo (models_sim_ft.py)
   │      SimFtTramiteE object
   │
   ├─→ 5. Guardar en DB (database.py)
   │      SQLAlchemy commit
   │
   ├─→ 6. Invalidar cache (redis_client.py)
   │      DELETE keys "sim_ft:tramites:*"
   │
   └─→ 7. Retornar respuesta
          SimFtTramiteEResponse

Frontend
   │
   │ 8. Actualizar UI
   │    Refresh lista
   ▼
Usuario ve nuevo trámite
```

### 2. Listar Trámites SIM_FT (Con Redis Cache)

```
Usuario
   │
   │ 1. Navega a página
   ▼
Frontend (React)
   │
   │ 2. GET /api/v1/sim-ft/tramites?num_annio=2025
   ▼
Backend (routers_sim_ft.py)
   │
   ├─→ 3. Verificar cache (redis_client.py)
   │      GET "sim_ft:tramites:2025:None:None:None:0:10"
   │      
   │   ┌─→ Cache HIT (~5-50ms)
   │   │   └─→ Retornar datos cached (JSON)
   │   │
   │   └─→ Cache MISS (~100-500ms)
   │       │
   │       ├─→ 4. Query DB (database.py)
   │       │      SELECT * FROM SIM_FT_TRAMITE_E
   │       │
   │       ├─→ 5. Guardar en cache (redis_client.py)
   │       │      SETEX "sim_ft:tramites:..." 300 JSON
   │       │
   │       └─→ 6. Retornar datos
   │
   └─→ Respuesta JSON
       [TramiteResponse, ...]

Frontend
   │
   │ 7. Renderizar tarjetas
   ▼
Usuario ve lista de trámites
```

### 3. Actualizar Trámite SIM_FT (con Invalidación de Cache)

```
Usuario
   │
   │ 1. Modifica estatus/observaciones
   ▼
Frontend (React)
   │
   │ 2. PUT /api/v1/sim-ft/tramites/2025/8/1
   │    { IND_ESTATUS: "02", OBS_OBSERVA: "..." }
   ▼
Backend (routers_sim_ft.py)
   │
   ├─→ 3. Buscar trámite (database.py)
   │      SELECT WHERE NUM_ANNIO=2025 AND NUM_TRAMITE=8
   │
   ├─→ 4. Actualizar (models_sim_ft.py)
   │      tramite.IND_ESTATUS = "02"
   │      tramite.FEC_ACTUALIZA = now()
   │
   ├─→ 5. Commit (database.py)
   │      SQLAlchemy commit
   │
   ├─→ 6. Invalidar cache (redis_client.py)
   │      DELETE keys "tramites:*"
   │
   └─→ 7. Retornar actualizado
          TramiteResponse

Frontend
   │
   │ 8. Refresh lista
   ▼
Usuario ve estado actualizado
```

## Stack Tecnológico

### Frontend Layer
```
┌──────────────────────────────────────┐
│  React 18.2                          │
│  ├─ TypeScript 5.3 (Type Safety)    │
│  ├─ Vite 5.0 (Build Tool)           │
│  ├─ Axios 1.6 (HTTP Client)         │
│  └─ CSS3 (Styling)                  │
└──────────────────────────────────────┘
```

### Backend Layer
```
┌──────────────────────────────────────┐
│  Python 3.11                         │
│  ├─ FastAPI 0.104 (Web Framework)   │
│  ├─ Uvicorn 0.24 (ASGI Server)      │
│  ├─ SQLAlchemy 2.0 (ORM)            │
│  ├─ PyODBC 5.0 (SQL Driver)         │
│  ├─ Redis 5.0 (Cache Client)        │
│  └─ Pydantic 2.5 (Validation)       │
└──────────────────────────────────────┘
```

### Data Layer
```
┌──────────────────────────────────────┐
│  MS SQL Server 2022                  │
│  ├─ Transactional Database           │
│  ├─ SQLAlchemy ORM                   │
│  └─ Volume Persistence               │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Redis 7                             │
│  ├─ In-Memory Cache                  │
│  ├─ AOF Persistence                  │
│  └─ Query Result Caching             │
└──────────────────────────────────────┘
```

### Infrastructure Layer
```
┌──────────────────────────────────────┐
│  Docker & Docker Compose             │
│  ├─ Container Orchestration          │
│  ├─ Network Isolation                │
│  ├─ Volume Management                │
│  └─ Health Checks                    │
└──────────────────────────────────────┘
```

## Modelo de Datos

```sql
-- Tabla: tramites
CREATE TABLE tramites (
    id INT PRIMARY KEY IDENTITY(1,1),
    titulo NVARCHAR(255) NOT NULL,
    descripcion NVARCHAR(1000),
    estado NVARCHAR(50) DEFAULT 'pendiente',
    activo BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2
);

-- Índices
CREATE INDEX idx_tramites_estado ON tramites(estado);
CREATE INDEX idx_tramites_activo ON tramites(activo);
CREATE INDEX idx_tramites_created_at ON tramites(created_at);
```

## Configuración de Entorno

### Desarrollo
```
Frontend:  localhost:3000
Backend:   localhost:8000
SQL:       localhost:1433
Redis:     localhost:6379
```

### Producción (Ejemplo)
```
Frontend:  https://app.example.com
Backend:   https://api.example.com
SQL:       internal:1433
Redis:     internal:6379
```

## Métricas del Proyecto

- **Total de archivos:** 37+
- **Líneas de código:** ~470 líneas
- **Lenguajes:** Python, TypeScript, CSS, Shell, YAML
- **Servicios Docker:** 4 (Frontend, Backend, SQL, Redis)
- **Endpoints API:** 5 principales + 2 utilidad
- **Documentos:** 4 MD comprehensivos
- **Tests:** Básicos implementados
- **Tiempo de inicio:** ~30 segundos

## Características de Calidad

✅ **Escalabilidad:** Arquitectura de microservicios con Docker
✅ **Performance:** Cache con Redis (TTL 5 min)
✅ **Mantenibilidad:** Código limpio y documentado
✅ **Seguridad:** Variables de entorno, validación de datos
✅ **Disponibilidad:** Health checks configurados
✅ **Observabilidad:** Logs estructurados
✅ **Testabilidad:** Tests unitarios incluidos
✅ **Documentación:** Completa y actualizada
