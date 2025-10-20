# Trámites MVP Panamá - SNMP

Sistema de gestión de trámites desarrollado con FastAPI (Python) y React (TypeScript), utilizando MS SQL Server como base de datos principal y Redis para caché.

## � Últimas Actualizaciones

**20 de Octubre de 2025** - Mejoras en Sistema de Workflows Dinámicos
- ✨ **Creación de workflows completos en 1 petición** (antes: ~20 peticiones)
- ✨ **UUID único** para trazabilidad completa de peticiones
- ✨ **Logging mejorado** con captura automática de request/response body
- ✨ **Uso de códigos** en lugar de IDs para referencias entre etapas
- 🐛 Fixes de compatibilidad con MSSQL

📖 **Documentación completa:** [docs/MEJORAS_LOGGING_Y_WORKFLOWS_2025-10-20.md](./docs/MEJORAS_LOGGING_Y_WORKFLOWS_2025-10-20.md)  
📖 **Resumen ejecutivo:** [docs/RESUMEN_MEJORAS_2025-10-20.md](./docs/RESUMEN_MEJORAS_2025-10-20.md)  
📖 **Ejemplos de uso:** [docs/ejemplos/](./docs/ejemplos/)

## �📋 Requisitos Previos

Para ejecutar este proyecto en tu entorno local, necesitas tener instalado:

- [Docker](https://docs.docker.com/get-docker/) (versión 20.10 o superior)
- [Docker Compose](https://docs.docker.com/compose/install/) (versión 2.0 o superior)
- Git

## 🏗️ Arquitectura del Proyecto

```
tramites-mvp-panama/
├── backend/                 # API FastAPI (Python)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # Punto de entrada de la aplicación
│   │   ├── config.py       # Configuración
│   │   ├── database.py     # Conexión a MS SQL Server
│   │   ├── redis_client.py # Cliente Redis
│   │   ├── models.py       # Modelos SQLAlchemy
│   │   ├── schemas.py      # Esquemas Pydantic
│   │   └── routes.py       # Rutas de la API
│   ├── tests/              # Tests del backend
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/               # Aplicación React (TypeScript)
│   ├── src/
│   │   ├── api/           # Cliente API
│   │   ├── App.tsx        # Componente principal
│   │   ├── App.css        # Estilos
│   │   ├── main.tsx       # Punto de entrada
│   │   └── index.css      # Estilos globales
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docker-compose.yml      # Orquestación de servicios
└── README.md              # Este archivo
```

## 🚀 Inicio Rápido

### Opción 1: Script de Inicio Automático (Recomendado)

```bash
git clone https://github.com/juncid/tramites-mvp-panama.git
cd tramites-mvp-panama
./start.sh
```

### Opción 2: Usando Make (Recomendado para Desarrollo)

```bash
git clone https://github.com/juncid/tramites-mvp-panama.git
cd tramites-mvp-panama
make start
```

Ver todos los comandos disponibles:
```bash
make help
```

### Opción 3: Manual con Docker Compose

#### 1. Clonar el Repositorio

```bash
git clone https://github.com/juncid/tramites-mvp-panama.git
cd tramites-mvp-panama
```

#### 2. Configurar Variables de Entorno

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

**Nota:** Las contraseñas predeterminadas son para desarrollo local. En producción, usa contraseñas seguras.

#### 3. Levantar los Servicios

```bash
docker compose up --build -d
```

Este comando:
- Construye las imágenes Docker
- Inicia MS SQL Server en el puerto 1433
- Inicia Redis en el puerto 6379
- Inicia el backend FastAPI en el puerto 8000
- Inicia el frontend React en el puerto 3000

#### 4. Acceder a la Aplicación

Una vez que todos los servicios estén en ejecución:

- **Frontend (React):** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Documentación API (Swagger):** http://localhost:8000/docs
- **Documentación API (ReDoc):** http://localhost:8000/redoc

## 🔧 Comandos Útiles

### Usando Make (Recomendado)

```bash
# Ver todos los comandos disponibles
make help

# Iniciar servicios
make start

# Detener servicios
make stop

# Ver logs
make logs

# Ejecutar tests
make test

# Acceder a shells
make backend-shell
make frontend-shell
make db-shell
make redis-cli
```

### Usando Docker Compose Directamente

### Detener los Servicios

```bash
docker-compose down
```

### Detener y Eliminar Volúmenes (Limpia la Base de Datos)

```bash
docker-compose down -v
```

### Ver Logs de un Servicio Específico

```bash
# Backend
docker-compose logs -f backend

# Frontend
docker-compose logs -f frontend

# SQL Server
docker-compose logs -f sqlserver

# Redis
docker-compose logs -f redis
```

### Reconstruir un Servicio Específico

```bash
# Backend
docker-compose up --build backend

# Frontend
docker-compose up --build frontend
```

### Ejecutar Comandos en un Contenedor

```bash
# Acceder al contenedor del backend
docker-compose exec backend bash

# Acceder al contenedor de SQL Server
docker-compose exec sqlserver bash
```

## 📊 Base de Datos

### Conexión a MS SQL Server

Puedes conectarte a la base de datos usando cualquier cliente SQL:

- **Host:** localhost
- **Puerto:** 1433
- **Usuario:** sa
- **Contraseña:** YourStrong@Passw0rd
- **Base de datos:** tramites_db

### Crear Base de Datos Manualmente (Opcional)

La base de datos se crea automáticamente, pero si necesitas crearla manualmente:

```bash
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -Q "CREATE DATABASE tramites_db"
```

## 🔑 API Endpoints

### Endpoints Principales

#### Salud del Sistema
- `GET /` - Información general de la API
- `GET /health` - Estado de salud

#### Trámites
- `GET /api/v1/tramites` - Listar todos los trámites
- `GET /api/v1/tramites/{id}` - Obtener un trámite específico
- `POST /api/v1/tramites` - Crear un nuevo trámite
- `PUT /api/v1/tramites/{id}` - Actualizar un trámite
- `DELETE /api/v1/tramites/{id}` - Eliminar un trámite (soft delete)

### Ejemplo de Uso con cURL

```bash
# Crear un trámite
curl -X POST http://localhost:8000/api/v1/tramites \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Solicitud de Permiso",
    "descripcion": "Permiso para construcción",
    "estado": "pendiente"
  }'

# Listar trámites
curl http://localhost:8000/api/v1/tramites
```

## 🧪 Testing

### Backend Tests

```bash
# Ejecutar tests del backend
docker-compose exec backend pytest

# Con cobertura
docker-compose exec backend pytest --cov=app
```

## 🛠️ Desarrollo

### Desarrollo Local sin Docker

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Hot Reload

Ambos servicios están configurados con hot reload:
- **Backend:** Uvicorn con `--reload`
- **Frontend:** Vite con hot module replacement

Los cambios en el código se reflejarán automáticamente.

## 📦 Tecnologías Utilizadas

### Backend
- **FastAPI:** Framework web moderno y rápido
- **SQLAlchemy:** ORM para SQL Server
- **Pydantic:** Validación de datos
- **PyODBC:** Driver ODBC para SQL Server
- **Redis:** Cliente de caché
- **Uvicorn:** Servidor ASGI

### Frontend
- **React 18:** Biblioteca de interfaz de usuario
- **TypeScript:** Superset tipado de JavaScript
- **Vite:** Build tool y dev server
- **Axios:** Cliente HTTP

### Infraestructura
- **MS SQL Server 2022:** Base de datos principal
- **Redis 7:** Sistema de caché en memoria
- **Docker & Docker Compose:** Contenerización y orquestación

## 🔒 Seguridad

Para un entorno de producción:

1. Cambia todas las contraseñas por defecto
2. Configura CORS apropiadamente en el backend
3. Usa variables de entorno seguras
4. Implementa HTTPS
5. Configura rate limiting
6. Implementa autenticación y autorización

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es para uso interno de SNMP.

## 📞 Soporte

Para preguntas o problemas, por favor crea un issue en el repositorio.

## 🎯 Roadmap

- [ ] Autenticación y autorización
- [ ] Notificaciones en tiempo real
- [ ] Búsqueda y filtros avanzados
- [ ] Exportación de datos
- [ ] Dashboard de estadísticas
- [ ] Tests automatizados completos
- [ ] CI/CD pipeline
- [ ] Documentación API extendida

---

## ✅ Sistema de Migraciones con Alembic

**Estado:** � Totalmente Operacional

### Implementación Completa

El proyecto cuenta con un sistema de migraciones totalmente funcional usando Alembic para gestionar cambios en el esquema de la base de datos de forma versionada y controlada.

#### Lo que está implementado y funcionando ✅

1. **Configuración completa de Alembic:**
   - `backend/alembic.ini` - Configuración principal
   - `backend/alembic/env.py` - Integración con FastAPI y SQL Server
   - `backend/alembic/versions/001_initial.py` - Migración inicial (baseline)

2. **Verificación dinámica de base de datos:**
   - `backend/wait_for_db.py` - Script que verifica el estado de la BD antes de ejecutar migraciones
   - Verifica conexión, existencia de BD, tablas creadas y tablas críticas
   - Reemplaza timers fijos por verificación activa (~7s vs 90s)

3. **Carga robusta de datos iniciales:**
   - `backend/load_initial_data.py` - Script idempotente para cargar catálogos PPSH
   - Verifica si las tablas existen antes de intentar cargar
   - No falla si las tablas no existen, simplemente lo omite

4. **Integración en Docker Compose:**
   - Servicio `db-migrations` ejecuta automáticamente:
     - Verificación de base de datos lista
     - `alembic stamp head` - Establece baseline
     - `alembic upgrade head` - Aplica migraciones
     - Carga de datos iniciales

5. **Documentación completa:**
   - `MIGRATIONS_GUIDE.md` - Guía técnica completa (2,500+ líneas)
   - `MIGRATIONS_IMPLEMENTATION.md` - Resumen ejecutivo
   - `DATABASE_HEALTH_CHECK.md` - Documentación del sistema de verificación
   - `DATABASE_HEALTH_CHECK_SUMMARY.md` - Resumen del sistema de verificación
   - `DATABASE_HEALTH_CHECK_EXAMPLES.md` - Ejemplos prácticos
   - `DATABASE_HEALTH_CHECK_DIAGRAM.md` - Diagramas visuales
   - `DATABASE_HEALTH_CHECK_INDEX.md` - Índice de navegación
   - `OBSERVABILITY.md` - Sistema de observabilidad y logs

6. **Sistema de Observabilidad (Fase 1):**
   - **Dozzle** - Visualizador de logs en tiempo real (puerto 8080)
   - **Rotación de logs** - Configurada en todos los servicios Docker
   - **Sistema de métricas** - Endpoints `/metrics` con Redis
   - **Monitor de logs** - Script `monitor_logs.py` para detección de errores

### Resolución del Problema Anterior ✅

**Problema identificado (Octubre 2025):**  
Archivos de Alembic tenían permisos incorrectos (root:root) causando conflictos de caché en WSL/Docker.

**Solución aplicada:**
1. ✅ Cambio de permisos: `chown -R junci:junci backend/alembic/`
2. ✅ Limpieza de caché Python: `find . -name '__pycache__' -exec rm -rf {} +`
3. ✅ Sincronización de filesystem: `wsl sync`
4. ✅ Reconstrucción de contenedores con configuración correcta
5. ✅ Reintegración de Alembic en `docker-compose.yml`

**Resultado:**
```
🔄 Aplicando migraciones de Alembic...
INFO  [alembic.runtime.migration] Context impl MSSQLImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
✅ Baseline establecido (alembic stamp head)
✅ Migraciones aplicadas exitosamente (alembic upgrade head)
```

### Uso del Sistema de Migraciones 🎯

#### Crear nueva migración
```bash
# Generar migración automáticamente (detecta cambios en modelos)
docker exec tramites-backend alembic revision --autogenerate -m "Add new field to users"

# Crear migración vacía (para escribir SQL manualmente)
docker exec tramites-backend alembic revision -m "Custom migration"
```

#### Aplicar migraciones
```bash
# Aplicar todas las migraciones pendientes
docker exec tramites-backend alembic upgrade head

# Aplicar hasta una versión específica
docker exec tramites-backend alembic upgrade <revision_id>

# Aplicar siguiente migración
docker exec tramites-backend alembic upgrade +1
```

#### Rollback de migraciones
```bash
# Revertir última migración
docker exec tramites-backend alembic downgrade -1

# Revertir hasta una versión específica
docker exec tramites-backend alembic downgrade <revision_id>

# Revertir todas las migraciones
docker exec tramites-backend alembic downgrade base
```

#### Ver estado de migraciones
```bash
# Ver estado actual
docker exec tramites-backend alembic current

# Ver historial completo
docker exec tramites-backend alembic history

# Ver migraciones pendientes
docker exec tramites-backend alembic show head
```

### Beneficios del Sistema Actual 🚀

1. **Migraciones versionadas:** Cada cambio en el esquema está versionado y documentado
2. **Rollback seguro:** Posibilidad de revertir cambios si algo falla
3. **Generación automática:** Alembic detecta cambios en modelos SQLAlchemy
4. **Deploy confiable:** Cada ambiente puede estar en diferentes versiones
5. **Auditoría completa:** Historial de todos los cambios en la base de datos
6. **Trabajo en equipo:** Múltiples desarrolladores pueden gestionar cambios simultáneos

### Observabilidad y Monitoreo 📊

#### Visualizador de logs (Dozzle)
```bash
# Acceder a interfaz web
http://localhost:8080
```

#### Métricas del sistema
```bash
# Ver todas las métricas
curl http://localhost:8000/metrics

# Ver métrica específica
curl http://localhost:8000/metrics/http_requests_total
```

#### Monitor de logs automatizado
```bash
# Escaneo único
docker exec tramites-backend python /app/monitor_logs.py once

# Monitoreo continuo
docker exec tramites-backend python /app/monitor_logs.py run

# Ver estadísticas
docker exec tramites-backend python /app/monitor_logs.py stats
```

### Referencias 📚

- **Guías técnicas:** Ver `MIGRATIONS_GUIDE.md` para documentación completa
- **Sistema de verificación:** Ver `DATABASE_HEALTH_CHECK_INDEX.md`
- **Observabilidad:** Ver `OBSERVABILITY.md` para sistema de logs y métricas

---

## ⚠️ Deuda Técnica

### Estado de las Pruebas Automatizadas

**Última evaluación:** Octubre 15, 2025

#### Cobertura General
- **Total de pruebas:** 75 tests
- **Pruebas exitosas:** 37 (49.3%)
- **Pruebas fallidas:** 38 (50.7%)
- **Cobertura de código:** 68%

#### Desglose por Módulos

##### ✅ Pruebas Básicas (100% exitosas - 10/10)
- **Estado:** Completamente operacional
- **Módulos:** Configuración básica, health checks, servicios fundamentales
- **Observaciones:** Base sólida del sistema funcionando correctamente

##### ⚠️ Configuración de Redis para Tests (Parcialmente resuelto - 1/6)
- **Estado:** Trabajo en progreso - progreso significativo logrado
- **Problema principal:** Configuración de mocks de Redis en el entorno de testing
- **Error típico:** `TypeError: <Mock name='get_redis().delete'> argument after * must be an iterable, not Mock`

**Progreso realizado:**
- ✅ Implementación completa de clase `MockRedis` con todos los métodos Redis necesarios
- ✅ Configuración de dependency injection para tests
- ✅ Parcial éxito: 1 test de caché ahora funciona (`test_get_tramites_cache_miss_and_set`)
- ⚠️ Pendiente: Resolver problemas de scope en dependency injection para 5 tests restantes

**Detalles técnicos:**
```python
# MockRedis implementado con:
- Simulación completa de almacenamiento (data, hashes, lists)
- Métodos: get, setex, delete, keys, hincrby, hset, hgetall, lpush, ltrim, expire
- Manejo de patrones como redis.delete(*keys)
- Detección y manejo de objetos Mock anidados
```

##### ❌ Pruebas de Endpoints PPSH (0% exitosas - 32/32)
- **Estado:** Requiere investigación completa
- **Problema principal:** Fallas en endpoints específicos del módulo PPSH
- **Impacto:** Módulo de trámites PPSH no está cubierto por testing automatizado

#### Implicaciones para Producción

##### Riesgos Identificados
1. **Caché Redis:** Sin testing completo, cambios en lógica de caché pueden introducir bugs silenciosos
2. **Módulo PPSH:** Sin cobertura de tests, el módulo principal del negocio carece de validación automatizada
3. **Integración:** Tests de integración incompletos pueden ocultar problemas de comunicación entre servicios

##### Mitigaciones Actuales
1. **Tests manuales:** Funcionalidad verificada manualmente durante desarrollo
2. **Environment de staging:** Validación en ambiente controlado antes de producción
3. **Monitoreo:** Sistema de logs y métricas implementado para detectar issues en runtime

#### Plan de Resolución Sugerido

##### Prioridad Alta 🔴
1. **Completar configuración Redis testing**
   - Resolver problemas de dependency injection scope
   - Asegurar consistencia en patching de `get_redis()`
   - Target: 6/6 tests de caché funcionando

##### Prioridad Media 🟡
2. **Completar corrección tests PPSH** _(Actualizado: 2025-10-20)_
   - **Estado actual:** 5/27 tests pasando (18.5%)
   - **Problemas identificados:**
     * 15 tests necesitan fixture `setup_ppsh_catalogos` (ya creado en conftest.py)
     * Nombres de campos inconsistentes en assertions (`agencia` → `cod_agencia`)
     * 6-8 tests con problemas de mock/lógica de datos
     * 1 endpoint faltante: `/api/v1/ppsh/catalogos/paises`
   - **Correcciones ya aplicadas:**
     * ✅ Bug crítico SQLAlchemy en `services_ppsh.py` (selectinload.filter)
     * ✅ Propiedad `nombre_completo` agregada a modelo PPSHSolicitante
     * ✅ Estado inicial corregido: "RECEPCION" → "RECIBIDO"
     * ✅ Nombres de modelos corregidos (7 correcciones)
   - **Documentación:** Ver `backend/PPSH_TESTS_PROGRESS_REPORT.md`
   - **Estimación:** 2-3 horas para alcanzar 80%+ cobertura
   - **Scripts disponibles:** `fix_ppsh_tests_phase2.py` para correcciones automáticas

##### Prioridad Baja 🟢
3. **Mejoras de infraestructura de testing**
   - Refactoring para mejor testabilidad
   - Implementación de factory patterns para datos de test
   - Configuración de CI/CD con validación automática

#### Recursos Técnicos Disponibles

- **Configuración Docker completa** para testing aislado
- **MockRedis class** implementada y funcionando parcialmente
- **Infraestructura de fixtures** establecida en `conftest.py`
  - ✨ **Nuevo:** `setup_ppsh_catalogos` fixture (PPSHCausaHumanitaria, PPSHEstado)
- **Scripts de corrección automática:**
  - `fix_ppsh_tests.py` - Primera fase (73 correcciones aplicadas)
  - `fix_ppsh_tests_phase2.py` - Segunda fase (7 correcciones aplicadas)
- **Documentación detallada:**
  - `backend/PPSH_TESTS_PROGRESS_REPORT.md` - Reporte completo con análisis y plan
  - `backend/PPSH_TESTS_ANALYSIS.md` - Categorización de errores
  - `backend/PPSH_TESTS_FIX_GUIDE.md` - Guía de problemas y soluciones
  - `backend/PPSH_TESTS_FINAL_REPORT.md` - Reporte detallado con action plan

#### Estimación de Esfuerzo

- **Redis testing (completar):** 1-2 días de desarrollo
- **PPSH tests (completar correcciones):** 2-3 horas _(análisis ya realizado)_
- **Trámites tests (12/24 failing):** 1-2 días
- **Integration tests (0/9 passing):** 2-3 días
- **Infrastructure improvements:** 2-3 días de refactoring

**Total estimado actualizado:** 6-8 días de desarrollo para testing completo

#### Estado Actual de Tests _(2025-10-20)_

```
Total: 130 tests
✅ Pasando: 83 tests (63.8%)
❌ Fallando: 47 tests (36.2%)

Desglose por módulo:
✅ Workflow routes:    30/30 (100%)
✅ Workflow services:  17/18 (94.4%)
✅ Upload documento:    6/6  (100%)
✅ Basic functional:   10/10 (100%)
⚠️  PPSH unit:          5/27 (18.5%) ← Deuda técnica principal
⚠️  Trámites unit:    12/24 (50%)
❌ Integration:         0/9  (0%)
❌ Auth:                1/4  (25%)
```

---

**Nota:** Esta deuda técnica no impide el funcionamiento del sistema en producción, pero limita la confianza en cambios futuros y la velocidad de desarrollo. Se recomienda abordar progresivamente según las prioridades del negocio.

---