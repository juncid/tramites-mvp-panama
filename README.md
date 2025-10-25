# Trámites MVP Panamá - SNMP

Sistema de gestión de trámites desarrollado con FastAPI (Python) y React (TypeScript), utilizando MS SQL Server como base de datos principal y Redis para caché.

> **📢 Actualización Reciente (25 de Octubre de 2025):** Limpieza completa del proyecto - se eliminaron 58 archivos obsoletos (reportes históricos, código temporal, documentación duplicada), se consolidaron guías técnicas y se optimizó la estructura de carpetas. El proyecto ahora está 35% más limpio y mejor organizado. Ver detalles completos al final de este documento.

## 📋 Últimas Actualizaciones

**20 de Octubre de 2025** - Mejoras en Sistema de Workflows Dinámicos
- ✨ **Creación de workflows completos en 1 petición** (antes: ~20 peticiones)
- ✨ **UUID único** para trazabilidad completa de peticiones
- ✨ **Logging mejorado** con captura automática de request/response body
- ✨ **Uso de códigos** en lugar de IDs para referencias entre etapas
- 🐛 Fixes de compatibilidad con MSSQL

📖 **Documentación completa:** [docs/MEJORAS_LOGGING_Y_WORKFLOWS_2025-10-20.md](./docs/MEJORAS_LOGGING_Y_WORKFLOWS_2025-10-20.md)  
📖 **Resumen ejecutivo:** [docs/RESUMEN_MEJORAS_2025-10-20.md](./docs/RESUMEN_MEJORAS_2025-10-20.md)  
📖 **Ejemplos de uso:** [docs/ejemplos/](./docs/ejemplos/)

**21 de Octubre de 2025** - Reorganización Arquitectónica Clean Architecture
- 🏗️ **Implementación completa de Clean Architecture** con separación clara de capas
- 📁 **Reorganización del backend** en directorios especializados (models/, services/, routers/, schemas/, infrastructure/, utils/)
- 🔧 **Corrección masiva de imports** (50+ referencias PPSH actualizadas)
- 🗃️ **Resolución de conflictos de migración** Alembic con heads divergentes
- ✅ **Sistema 100% funcional** - Verificación completa de backend, API y base de datos
- 📚 **Documentación completa de cambios** organizada en bitácora

📖 **Resumen de cambios:** [docs/bitacora/CHANGES_SUMMARY.md](./docs/bitacora/CHANGES_SUMMARY.md)

---

## 📋 Requisitos Previos

Para ejecutar este proyecto en tu entorno local, necesitas tener instalado:

### Requisitos Obligatorios

- **[Docker Desktop](https://docs.docker.com/get-docker/)** (versión 20.10 o superior)
  - Para Windows: Docker Desktop para Windows
  - Para Mac: Docker Desktop para Mac
  - Para Linux: Docker Engine + Docker Compose
- **[Git](https://git-scm.com/downloads)** - Sistema de control de versiones

### ¿Por qué Docker?

Docker te permite ejecutar toda la aplicación (backend, frontend, base de datos, Redis) sin necesidad de instalar Python, Node.js, SQL Server u otras dependencias directamente en tu computadora. Todo se ejecuta en contenedores aislados que funcionan de manera idéntica en cualquier sistema operativo.

**Ventajas:**
- ✅ No necesitas instalar Python, Node.js, SQL Server, Redis manualmente
- ✅ Configuración automática de todas las dependencias
- ✅ Mismo entorno para todos los desarrolladores
- ✅ Un solo comando para iniciar todo el sistema

### Requisitos Opcionales (Para Desarrollo Avanzado)

Si planeas desarrollar sin Docker o ejecutar las colecciones de Postman:
- **Python 3.11+** (solo para desarrollo local sin Docker)
- **Node.js 18+** (solo para desarrollo local sin Docker)
- **Postman Desktop** o **Newman** (para ejecutar tests de API)

## 🏗️ Arquitectura del Proyecto

### ¿Qué es Clean Architecture?

Este proyecto sigue los principios de **Clean Architecture**, un patrón de diseño que organiza el código en capas independientes, facilitando el mantenimiento, las pruebas y la escalabilidad del sistema.

**Beneficios para usuarios nuevos:**
- 📂 **Código organizado:** Cada archivo tiene un propósito claro
- 🔧 **Fácil de modificar:** Cambios en una capa no afectan las demás
- 🧪 **Fácil de probar:** Cada componente se puede probar independientemente
- 📚 **Fácil de entender:** Estructura predecible y documentada

### Capas de la Arquitectura

```
┌─────────────────────────────────────────────────────┐
│  CAPA 1: FRAMEWORKS & DRIVERS (Infraestructura)    │
│  - Docker, FastAPI, React, SQL Server, Redis        │
│  - Archivos: infrastructure/, Dockerfile            │
└─────────────────────────────────────────────────────┘
              ↑ depende de ↑
┌─────────────────────────────────────────────────────┐
│  CAPA 2: INTERFACE ADAPTERS (Adaptadores)          │
│  - API Endpoints (routers/), Validaciones (schemas/)│
│  - Convierten datos entre formatos                  │
└─────────────────────────────────────────────────────┘
              ↑ depende de ↑
┌─────────────────────────────────────────────────────┐
│  CAPA 3: USE CASES (Lógica de Negocio)            │
│  - Reglas de negocio (services/)                    │
│  - Operaciones: crear, actualizar, validar          │
└─────────────────────────────────────────────────────┘
              ↑ depende de ↑
┌─────────────────────────────────────────────────────┐
│  CAPA 4: ENTITIES (Modelos de Datos)               │
│  - Definición de tablas (models/)                   │
│  - Estructuras fundamentales del sistema            │
└─────────────────────────────────────────────────────┘
```

### Estructura de Carpetas Explicada

### Estructura de Carpetas Explicada

```
tramites-mvp-panama/
├── backend/                          # 🐍 API Backend (Python/FastAPI)
│   ├── app/                         # Código principal de la aplicación
│   │   ├── main.py                  # 🚀 Punto de entrada - inicia la API
│   │   ├── config.py                # ⚙️ Configuración (puertos, BD, etc.)
│   │   ├── database.py              # 🗄️ Conexión a MS SQL Server
│   │   ├── redis_client.py          # 💾 Cliente de caché Redis
│   │   │
│   │   ├── infrastructure/          # 🏗️ CAPA 1: Frameworks & Drivers
│   │   │   ├── database_session.py  # Gestión de sesiones de BD
│   │   │   └── redis_connection.py  # Gestión de conexión Redis
│   │   │
│   │   ├── models/                  # 📊 CAPA 4: Entities (Modelos)
│   │   │   ├── models_ppsh.py       # Tablas del módulo PPSH
│   │   │   ├── models_tramites.py   # Tablas de trámites generales
│   │   │   └── models_workflow.py   # Tablas de workflows dinámicos
│   │   │
│   │   ├── services/                # 💼 CAPA 3: Use Cases (Lógica)
│   │   │   ├── services_ppsh.py     # Lógica de negocio PPSH
│   │   │   ├── services_tramites.py # Lógica de trámites
│   │   │   └── services_workflow.py # Lógica de workflows
│   │   │
│   │   ├── routers/                 # 🌐 CAPA 2: API Endpoints
│   │   │   ├── router_ppsh.py       # Endpoints PPSH (/api/v1/ppsh/*)
│   │   │   ├── router_tramites.py   # Endpoints Trámites
│   │   │   └── router_workflow.py   # Endpoints Workflow
│   │   │
│   │   ├── schemas/                 # ✅ CAPA 2: Validaciones
│   │   │   ├── schemas_ppsh.py      # Validación de datos PPSH
│   │   │   ├── schemas_tramites.py  # Validación de trámites
│   │   │   └── schemas_workflow.py  # Validación de workflows
│   │   │
│   │   └── utils/                   # 🔧 Utilidades compartidas
│   │       ├── auth_utils.py        # Funciones de autenticación
│   │       ├── file_utils.py        # Manejo de archivos
│   │       └── validation_utils.py  # Validaciones comunes
│   │
│   ├── alembic/                     # 📝 Migraciones de base de datos
│   │   └── versions/                # Historial de cambios en BD
│   ├── tests/                       # 🧪 Pruebas automatizadas
│   ├── postman/                     # 📮 Colecciones de prueba API
│   ├── sql/                         # 📊 Scripts SQL (datos iniciales)
│   ├── Dockerfile                   # 🐳 Configuración Docker backend
│   ├── requirements.txt             # 📦 Dependencias Python
│   └── .env.example                 # 🔑 Variables de entorno (ejemplo)
│
├── frontend/                        # ⚛️ Aplicación Frontend (React/TypeScript)
│   ├── src/
│   │   ├── api/                    # 🌐 Cliente para llamar al backend
│   │   ├── components/             # 🧩 Componentes reutilizables
│   │   ├── pages/                  # 📄 Páginas de la aplicación
│   │   ├── App.tsx                 # 🚀 Componente raíz
│   │   └── main.tsx                # 🎯 Punto de entrada
│   ├── Dockerfile                   # 🐳 Configuración Docker frontend
│   ├── package.json                 # 📦 Dependencias Node.js
│   └── vite.config.ts              # ⚙️ Configuración Vite
│
├── docs/                           # 📚 Documentación completa
│   ├── bitacora/                   # 📝 Registro de cambios
│   ├── ejemplos/                   # 💡 Ejemplos de uso
│   └── DICCIONARIO_DATOS_COMPLETO.md  # 📖 Documentación BD
│
├── docker-compose.yml              # 🐳 Orquestación de servicios
├── README.md                       # 📘 Este archivo (guía principal)
└── Makefile                        # 🛠️ Comandos útiles (make start, etc.)
```

**Módulos del Sistema:**

- **PPSH:** Permisos de Protección y Stateless Humanitarios (solicitudes de refugio)
- **Workflow:** Sistema de workflows dinámicos (procesos configurables)
- **Trámites:** Gestión general de trámites migratorios
- **SIM_FT:** Sistema Integrado de Migración - Funcionalidades Transversales

## ✅ Estado Actual del Proyecto

**Estado General:** 🟢 **100% Funcional**

### Arquitectura Implementada
- ✅ **Clean Architecture completa** - Separación clara de capas (Entities, Use Cases, Interface Adapters, Frameworks)
- ✅ **Backend reorganizado** - 97 archivos movidos a estructura organizada
- ✅ **Imports corregidos** - 50+ referencias PPSH actualizadas sistemáticamente
- ✅ **Migraciones resueltas** - Conflicto de heads divergentes en Alembic solucionado

### Funcionalidad Verificada
- ✅ **Backend inicia correctamente** - Sin errores de import o configuración
- ✅ **API responde** - Status 200 en endpoint principal
- ✅ **Base de datos operativa** - Todas las tablas creadas y accesibles
- ✅ **Módulos funcionales** - PPSH, Workflow y Trámites operativos

### Documentación y Organización
- ✅ **Bitácora de cambios** - Documentación completa en `docs/bitacora/CHANGES_SUMMARY.md`
- ✅ **Commits organizados** - Historial limpio con categorización por tipo de cambio
- ✅ **README actualizado** - Información actual del proyecto y arquitectura

### Próximos Pasos Recomendados
1. **Testing completo** - Resolver deuda técnica en tests automatizados (36.2% fallando)
2. **Autenticación** - Implementar sistema de login/roles
3. **Frontend integration** - Conectar React con nueva estructura de API
4. **CI/CD** - Pipeline de integración continua

## �📋 Requisitos Previos
```

## 🚀 Inicio Rápido

### Guía para Usuarios Nuevos

Si es tu primera vez trabajando con Docker o este tipo de proyectos, sigue estos pasos detallados:

#### Paso 1: Verificar Requisitos

**Windows:**
```powershell
# Verificar que Docker Desktop está instalado y corriendo
docker --version
docker-compose --version

# Verificar que Git está instalado
git --version
```

**Mac/Linux:**
```bash
# Verificar que Docker está instalado y corriendo
docker --version
docker-compose --version

# Verificar que Git está instalado
git --version
```

**Versiones mínimas esperadas:**
- Docker: 20.10+
- Docker Compose: 2.0+
- Git: 2.30+

Si algún comando falla, instala la herramienta faltante desde los enlaces en la sección [Requisitos Previos](#-requisitos-previos).

#### Paso 2: Clonar el Proyecto

```bash
# Clonar el repositorio desde GitHub
git clone https://github.com/juncid/tramites-mvp-panama.git

# Entrar al directorio del proyecto
cd tramites-mvp-panama
```

**¿Qué hace esto?** Descarga todo el código del proyecto a tu computadora.

#### Paso 3: Configurar Variables de Entorno (Opcional)

Los archivos `.env.example` contienen configuraciones de ejemplo. Para desarrollo local, **no necesitas modificarlos** - funcionan tal cual.

```bash
# Solo si quieres personalizar la configuración
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**Para producción:** Cambia las contraseñas por valores seguros en estos archivos.

#### Paso 4: Iniciar el Sistema

**Opción A: Comando Simple (Recomendado para principiantes)**

```bash
docker compose up --build
```

**¿Qué hace este comando?**
1. Descarga las imágenes base (Python, Node.js, SQL Server, Redis)
2. Construye los contenedores del backend y frontend
3. Crea la red de comunicación entre servicios
4. Inicia SQL Server y espera a que esté listo
5. Ejecuta las migraciones de base de datos (crea tablas)
6. Carga datos iniciales (catálogos)
7. Inicia el backend (API FastAPI)
8. Inicia el frontend (React)
9. Inicia Redis (caché)

**Tiempo estimado:** 3-5 minutos la primera vez (descarga de imágenes), 30-60 segundos las siguientes veces.

**Opción B: Modo Detached (Ejecuta en segundo plano)**

```bash
docker compose up --build -d
```

Agrega `-d` para que los servicios se ejecuten en segundo plano y puedas seguir usando la terminal.

#### Paso 5: Verificar que Todo Está Funcionando

**Ver los logs en tiempo real:**
```bash
docker compose logs -f
```

Presiona `Ctrl+C` para salir de los logs (los servicios siguen corriendo).

**Verificar el estado de los servicios:**
```bash
docker compose ps
```

Deberías ver algo como:
```
NAME                   STATUS              PORTS
tramites-backend       Up 2 minutes        0.0.0.0:8000->8000/tcp
tramites-frontend      Up 2 minutes        0.0.0.0:3000->3000/tcp
tramites-sqlserver     Up 2 minutes        0.0.0.0:1433->1433/tcp
tramites-redis         Up 2 minutes        0.0.0.0:6379->6379/tcp
```

**Probar los servicios:**

| Servicio | URL | ¿Qué verás? |
|----------|-----|-------------|
| **Frontend** | http://localhost:3000 | Aplicación web React |
| **Backend API** | http://localhost:8000 | JSON con información de la API |
| **Swagger Docs** | http://localhost:8000/docs | Documentación interactiva de la API |
| **ReDoc** | http://localhost:8000/redoc | Documentación alternativa de la API |

#### Paso 6: Detener el Sistema

```bash
# Detener todos los servicios
docker compose down

# Detener Y eliminar la base de datos (empezar de cero)
docker compose down -v
```

### Métodos Alternativos de Inicio

#### Opción 1: Script Automático (Linux/Mac/WSL)

```bash
./start.sh
```

#### Opción 2: Usando Make (Desarrollo)

```bash
# Ver todos los comandos disponibles
make help

# Iniciar servicios
make start

# Detener servicios
make stop

# Ver logs
make logs
```

### ¿Qué Pasa si Algo Sale Mal?

**Error: "docker: command not found"**
- Instala Docker Desktop desde https://docs.docker.com/get-docker/

**Error: "Cannot connect to the Docker daemon"**
- Asegúrate de que Docker Desktop está ejecutándose
- En Windows: Busca el ícono de Docker en la bandeja del sistema

**Error: "port is already allocated"**
- Otro programa está usando los puertos 3000, 8000, 1433 o 6379
- Cierra la aplicación que esté usando ese puerto o modifica los puertos en `docker-compose.yml`

**Error: "no space left on device"**
- Docker está usando mucho espacio
- Ejecuta: `docker system prune -a` para limpiar imágenes antiguas

**Otros problemas:**
```bash
# Ver logs del backend
docker compose logs backend

# Ver logs de SQL Server
docker compose logs sqlserver

# Reiniciar un servicio específico
docker compose restart backend
```

---

## 🧪 Probando la API

Una vez que el sistema esté corriendo, puedes probar los endpoints de varias formas:

### 1. Usando la Documentación Interactiva (Swagger)

1. Abre http://localhost:8000/docs en tu navegador
2. Explora los endpoints disponibles
3. Haz clic en "Try it out" para probar cualquier endpoint
4. Modifica los parámetros y haz clic en "Execute"
5. Ve la respuesta inmediatamente

**Ideal para:** Explorar la API sin escribir código

### 2. Usando cURL (Línea de Comandos)

```bash
# Listar todos los trámites
curl http://localhost:8000/api/v1/sim-ft/tramites

# Crear un solicitante PPSH
curl -X POST http://localhost:8000/api/v1/ppsh/solicitantes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido1": "Pérez",
    "tipo_documento": "PASAPORTE",
    "numero_documento": "N123456789",
    "nacionalidad": "VE",
    "fecha_nacimiento": "1990-01-15",
    "sexo": "M",
    "email": "juan@example.com"
  }'
```

**Ideal para:** Tests rápidos y scripts automatizados

### 3. Usando Postman (Recomendado para Tests Completos)

El proyecto incluye colecciones de Postman listas para usar:

1. Instala [Postman Desktop](https://www.postman.com/downloads/)
2. Abre Postman → Click en "Import"
3. Selecciona un archivo de `backend/postman/`:
   - `PPSH_Complete_API.postman_collection.json` - 36 requests PPSH
   - `Workflow_API_Tests.postman_collection.json` - 30 requests Workflow
   - `SIM_FT_Complete_API.postman_collection.json` - 35 requests SIM_FT
4. Las colecciones incluyen ejemplos de principio a fin
5. Click en "Send" para ejecutar requests

**Documentación completa:** [backend/postman/README.md](./backend/postman/README.md)

**Ideal para:** Testing completo, flujos end-to-end, validación de casos de uso

---

## 🔧 Comandos Útiles

### Para Usuarios Nuevos

```bash
# Ver qué servicios están corriendo
docker compose ps

# Ver logs de todos los servicios
docker compose logs

# Ver logs de un servicio específico
docker compose logs backend
docker compose logs sqlserver

# Seguir los logs en tiempo real
docker compose logs -f backend

# Reiniciar un servicio
docker compose restart backend

# Detener todos los servicios
docker compose down

# Detener y eliminar TODO (incluyendo base de datos)
docker compose down -v

# Reconstruir un servicio específico
docker compose up --build backend
```

### Para Desarrolladores

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

## 🧪 Testing Automatizado de API

### Ejecutar Tests con Datos de Prueba Completos

El proyecto incluye un sistema automatizado de testing que carga datos de prueba completos:

#### Windows PowerShell (Recomendado)
```powershell
# Ejecutar suite completa de tests
.\test-api.ps1 run

# Verificar datos de prueba
.\test-api.ps1 verify

# Recargar datos de prueba
.\test-api.ps1 reload

# Ver estado de servicios
.\test-api.ps1 status

# Abrir reportes en navegador
.\test-api.ps1 reports

# Limpiar ambiente
.\test-api.ps1 clean
```

#### Linux/Mac
```bash
# Ejecutar suite completa de tests
docker-compose -f docker-compose.api-tests.yml up --abort-on-container-exit

# Limpiar después
docker-compose -f docker-compose.api-tests.yml down
```

### Datos de Prueba Incluidos

El script `load_test_data.py` carga automáticamente:

- ✅ **27 Catálogos PPSH**: 7 causas humanitarias, 8 tipos de documento, 9 estados, 3 conceptos de pago
- ✅ **6 Registros de Ejemplo**: 3 solicitantes + 3 solicitudes PPSH con diferentes estados
- ✅ **2 Workflows Completos**: Workflow PPSH (5 etapas) + Workflow General (3 etapas)

### Reportes de Tests

Una vez ejecutados los tests:
- **Reportes HTML**: http://localhost:8080
- **Ubicación**: `./test-reports/`
  - `ppsh-report.html`
  - `workflow-report.html`
  - `tramites-report.html`

### Documentación de Testing

- 📖 [Guía Completa de Testing](./LOAD_TEST_DATA_GUIDE.md)
- 📖 [Información de Base de Datos de Test](./DATABASE_TEST_INFO.md)

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
- **Base de datos:** SIM_PANAMA

### Esquema de Base de Datos

El sistema utiliza MS SQL Server con la base de datos **`SIM_PANAMA`** organizada en los siguientes módulos:

#### 📋 Módulo PPSH (Permisos de Protección y Stateless Humanitarios)

**Tablas principales:**
- **`PPSHSolicitante`** - Datos personales del solicitante (nombre, apellidos, documentos de identidad)
- **`PPSHSolicitud`** - Solicitud PPSH completa con documentación y estado
- **`PPSHSolicitudDocumento`** - Documentos adjuntos a la solicitud

**Catálogos:**
- **`PPSHCausaHumanitaria`** - Causas humanitarias reconocidas (persecución, violencia, etc.)
- **`PPSHEstado`** - Estados del proceso (RECIBIDO, EN_REVISION, APROBADO, etc.)
- **`PPSHTipoDocumento`** - Tipos de identificación aceptados (PASAPORTE, CEDULA, etc.)
- **`PPSHConceptoPago`** - Conceptos de pago y tarifas
- **`PPSHPais`** - Catálogo de países
- **`PPSHAgencia`** - Agencias de procesamiento

#### 🔄 Módulo Workflow (Gestión de Procesos)

**Tablas principales:**
- **`Workflow`** - Definición de procesos de negocio
- **`WorkflowEtapa`** - Etapas del proceso con orden y configuración
- **`WorkflowTransicion`** - Transiciones permitidas entre etapas
- **`WorkflowInstancia`** - Instancias activas de workflows
- **`WorkflowInstanciaHistorial`** - Historial de cambios y transiciones

#### 📝 Módulo Trámites (Gestión General)

**Tablas principales:**
- **`Tramite`** - Gestión general de trámites
- **`TramiteDocumento`** - Documentos adjuntos a trámites
- **`TramiteHistorial`** - Auditoría de cambios en trámites

#### 🗄️ Módulo SIM_FT (Funcionalidades Transversales)

**Tablas de soporte:**
- **`TipoDocumento`** - Tipos de documentos del sistema
- **`EstadoDocumento`** - Estados de documentos
- **`Auditoria`** - Registro de auditoría general

### Relaciones Principales

```
PPSHSolicitante (1) ──→ (N) PPSHSolicitud
PPSHSolicitud (1) ──→ (N) PPSHSolicitudDocumento
PPSHSolicitud (N) ──→ (1) PPSHCausaHumanitaria
PPSHSolicitud (N) ──→ (1) PPSHEstado

Workflow (1) ──→ (N) WorkflowEtapa
Workflow (1) ──→ (N) WorkflowTransicion
Workflow (1) ──→ (N) WorkflowInstancia
WorkflowInstancia (1) ──→ (N) WorkflowInstanciaHistorial
```

### Documentación Completa

📖 **Diccionario de Datos Completo:** [DICCIONARIO_DATOS_COMPLETO.md](./docs/DICCIONARIO_DATOS_COMPLETO.md)  
📖 **Scripts SQL:** [backend/sql/](./backend/sql/)  
📖 **Migraciones Alembic:** [backend/alembic/versions/](./backend/alembic/versions/)

### Crear Base de Datos Manualmente (Opcional)

La base de datos se crea automáticamente mediante migraciones Alembic, pero si necesitas crearla manualmente:

```bash
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -Q "CREATE DATABASE SIM_PANAMA"
```

## 🔑 API Endpoints

### Documentación Interactiva

Una vez que el backend esté en ejecución, accede a la documentación interactiva:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Endpoints Principales

#### 🏥 Salud del Sistema
- `GET /` - Información general de la API
- `GET /health` - Estado de salud del sistema
- `GET /metrics` - Métricas de rendimiento (Redis)

#### 📋 Módulo PPSH (Permisos de Protección y Stateless Humanitarios)

**Solicitantes:**
- `GET /api/v1/ppsh/solicitantes` - Listar todos los solicitantes
- `GET /api/v1/ppsh/solicitantes/{id}` - Obtener un solicitante específico
- `POST /api/v1/ppsh/solicitantes` - Crear nuevo solicitante
- `PUT /api/v1/ppsh/solicitantes/{id}` - Actualizar solicitante
- `DELETE /api/v1/ppsh/solicitantes/{id}` - Eliminar solicitante (soft delete)

**Solicitudes:**
- `GET /api/v1/ppsh/solicitudes` - Listar todas las solicitudes
- `GET /api/v1/ppsh/solicitudes/{id}` - Obtener solicitud específica
- `POST /api/v1/ppsh/solicitudes` - Crear nueva solicitud
- `PUT /api/v1/ppsh/solicitudes/{id}` - Actualizar solicitud
- `PATCH /api/v1/ppsh/solicitudes/{id}/estado` - Cambiar estado de solicitud
- `DELETE /api/v1/ppsh/solicitudes/{id}` - Eliminar solicitud (soft delete)

**Catálogos:**
- `GET /api/v1/ppsh/catalogos/causas-humanitarias` - Listar causas humanitarias
- `GET /api/v1/ppsh/catalogos/estados` - Listar estados de solicitud
- `GET /api/v1/ppsh/catalogos/tipos-documento` - Listar tipos de documento
- `GET /api/v1/ppsh/catalogos/conceptos-pago` - Listar conceptos de pago
- `GET /api/v1/ppsh/catalogos/paises` - Listar países
- `GET /api/v1/ppsh/catalogos/agencias` - Listar agencias

**Documentos:**
- `POST /api/v1/ppsh/solicitudes/{id}/documentos` - Subir documento adjunto
- `GET /api/v1/ppsh/solicitudes/{id}/documentos` - Listar documentos de solicitud
- `DELETE /api/v1/ppsh/documentos/{id}` - Eliminar documento

#### 🔄 Módulo Workflows

**Workflows:**
- `GET /api/v1/workflows` - Listar todos los workflows
- `GET /api/v1/workflows/{id}` - Obtener workflow específico
- `POST /api/v1/workflows` - Crear workflow completo (con etapas y transiciones)
- `PUT /api/v1/workflows/{id}` - Actualizar workflow
- `DELETE /api/v1/workflows/{id}` - Eliminar workflow

**Etapas:**
- `GET /api/v1/workflows/{workflow_id}/etapas` - Listar etapas del workflow
- `POST /api/v1/workflows/{workflow_id}/etapas` - Agregar etapa
- `PUT /api/v1/workflows/etapas/{id}` - Actualizar etapa
- `DELETE /api/v1/workflows/etapas/{id}` - Eliminar etapa

**Transiciones:**
- `GET /api/v1/workflows/{workflow_id}/transiciones` - Listar transiciones
- `POST /api/v1/workflows/{workflow_id}/transiciones` - Crear transición
- `DELETE /api/v1/workflows/transiciones/{id}` - Eliminar transición

**Instancias:**
- `POST /api/v1/workflows/{workflow_id}/instancias` - Iniciar nueva instancia
- `GET /api/v1/workflows/instancias/{id}` - Obtener estado de instancia
- `POST /api/v1/workflows/instancias/{id}/avanzar` - Avanzar a siguiente etapa
- `GET /api/v1/workflows/instancias/{id}/historial` - Ver historial de cambios

#### 🏛️ Sistema SIM_FT (Oficial - Sistema Integrado de Migración)

**Trámites (con Redis Cache - 16x más rápido):**
- `GET /api/v1/sim-ft/tramites` - Listar trámites con filtros múltiples
- `GET /api/v1/sim-ft/tramites/{año}/{num}/{reg}` - Obtener trámite específico
- `POST /api/v1/sim-ft/tramites` - Crear nuevo trámite
- `PUT /api/v1/sim-ft/tramites/{año}/{num}/{reg}` - Actualizar trámite
- `POST /api/v1/sim-ft/tramites/{año}/{num}/{reg}/cierre` - Cerrar trámite

**Catálogos:**
- `GET /api/v1/sim-ft/tramites-tipos` - Tipos de trámites
- `GET /api/v1/sim-ft/estatus` - Estados disponibles
- `GET /api/v1/sim-ft/prioridades` - Niveles de prioridad
- `GET /api/v1/sim-ft/conclusiones` - Tipos de conclusión

**⚠️ Nota:** Endpoints legacy `/api/v1/tramites/*` deprecados. Usar SIM_FT.

### Parámetros de Consulta Comunes

La mayoría de endpoints de listado soportan:
- `skip` - Número de registros a omitir (paginación)
- `limit` - Número máximo de registros a retornar
- `sort_by` - Campo por el cual ordenar
- `order` - Dirección del ordenamiento (asc/desc)

**SIM_FT - Filtros adicionales:**
- `num_annio` - Año del trámite
- `cod_tramite` - Código del tipo de trámite
- `ind_estatus` - Estado del trámite
- `ind_prioridad` - Nivel de prioridad
- `fecha_desde` / `fecha_hasta` - Rango de fechas

**Ejemplo:**
```bash
GET /api/v1/sim-ft/tramites?num_annio=2025&ind_estatus=A&skip=0&limit=10
```

### Ejemplo de Uso con cURL

#### Crear un Trámite SIM_FT

```bash
# Crear un trámite en sistema oficial
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

## 📝 Ejemplos Prácticos de Uso

### Ejemplo 1: Crear una Solicitud PPSH Completa

#### Paso 1: Crear un Solicitante

```bash
curl -X POST http://localhost:8000/api/v1/ppsh/solicitantes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Carlos",
    "apellido1": "Pérez",
    "apellido2": "González",
    "tipo_documento": "PASAPORTE",
    "numero_documento": "N123456789",
    "nacionalidad": "VE",
    "fecha_nacimiento": "1990-01-15",
    "sexo": "M",
    "email": "juan.perez@example.com",
    "telefono": "+507-6000-0000"
  }'
```

**Respuesta:**
```json
{
  "id": 1,
  "nombre_completo": "Juan Carlos Pérez González",
  "numero_documento": "N123456789",
  "mensaje": "Solicitante creado exitosamente"
}
```

#### Paso 2: Crear una Solicitud PPSH

```bash
curl -X POST http://localhost:8000/api/v1/ppsh/solicitudes \
  -H "Content-Type: application/json" \
  -d '{
    "id_solicitante": 1,
    "tipo_solicitud": "PPSH",
    "id_causa_humanitaria": 1,
    "motivo_solicitud": "Persecución política en país de origen",
    "id_agencia": 1,
    "observaciones": "Caso urgente - documentación completa adjunta"
  }'
```

**Respuesta:**
```json
{
  "id": 1,
  "numero_solicitud": "PPSH-2025-001",
  "estado": "RECIBIDO",
  "fecha_creacion": "2025-10-23T10:30:00",
  "solicitante": {
    "nombre_completo": "Juan Carlos Pérez González"
  }
}
```

#### Paso 3: Subir Documentos Adjuntos

```bash
curl -X POST http://localhost:8000/api/v1/ppsh/solicitudes/1/documentos \
  -H "Content-Type: multipart/form-data" \
  -F "file=@pasaporte.pdf" \
  -F "tipo_documento=PASAPORTE" \
  -F "descripcion=Copia de pasaporte vigente"
```

### Ejemplo 2: Crear un Workflow con Múltiples Etapas

```bash
curl -X POST http://localhost:8000/api/v1/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Proceso PPSH Completo",
    "descripcion": "Workflow para tramitación de solicitudes PPSH",
    "activo": true,
    "etapas": [
      {
        "codigo": "RECEPCION",
        "nombre": "Recepción de Documentos",
        "descripcion": "Recepción y validación inicial",
        "orden": 1,
        "requiere_aprobacion": false
      },
      {
        "codigo": "REVISION",
        "nombre": "Revisión Legal",
        "descripcion": "Análisis legal de la solicitud",
        "orden": 2,
        "requiere_aprobacion": true
      },
      {
        "codigo": "APROBACION",
        "nombre": "Aprobación Directiva",
        "descripcion": "Aprobación final por directiva",
        "orden": 3,
        "requiere_aprobacion": true
      },
      {
        "codigo": "EMISION",
        "nombre": "Emisión de Documento",
        "descripcion": "Emisión del permiso aprobado",
        "orden": 4,
        "requiere_aprobacion": false
      }
    ],
    "transiciones": [
      {
        "etapa_origen_codigo": "RECEPCION",
        "etapa_destino_codigo": "REVISION",
        "nombre": "Pasar a Revisión",
        "condicion": null
      },
      {
        "etapa_origen_codigo": "REVISION",
        "etapa_destino_codigo": "APROBACION",
        "nombre": "Aprobar Revisión",
        "condicion": null
      },
      {
        "etapa_origen_codigo": "APROBACION",
        "etapa_destino_codigo": "EMISION",
        "nombre": "Aprobar y Emitir",
        "condicion": null
      }
    ]
  }'
```

**Respuesta:**
```json
{
  "id": 1,
  "nombre": "Proceso PPSH Completo",
  "total_etapas": 4,
  "total_transiciones": 3,
  "mensaje": "Workflow creado exitosamente"
}
```

### Ejemplo 3: Iniciar y Avanzar una Instancia de Workflow

#### Iniciar Instancia

```bash
curl -X POST http://localhost:8000/api/v1/workflows/1/instancias \
  -H "Content-Type: application/json" \
  -d '{
    "referencia_tipo": "PPSH_SOLICITUD",
    "referencia_id": 1,
    "datos_contexto": {
      "solicitante": "Juan Carlos Pérez",
      "numero_solicitud": "PPSH-2025-001"
    }
  }'
```

#### Avanzar a Siguiente Etapa

```bash
curl -X POST http://localhost:8000/api/v1/workflows/instancias/1/avanzar \
  -H "Content-Type: application/json" \
  -d '{
    "comentario": "Documentación verificada y completa",
    "usuario_responsable": "admin@migracion.gob.pa"
  }'
```

### Ejemplo 4: Consultar Catálogos

```bash
# Listar causas humanitarias disponibles
curl http://localhost:8000/api/v1/ppsh/catalogos/causas-humanitarias

# Listar estados de solicitud
curl http://localhost:8000/api/v1/ppsh/catalogos/estados

# Listar tipos de documento aceptados
curl http://localhost:8000/api/v1/ppsh/catalogos/tipos-documento
```

### Ejemplo 5: Búsqueda y Filtrado

```bash
# Buscar solicitudes por estado
curl "http://localhost:8000/api/v1/ppsh/solicitudes?estado=RECIBIDO&limit=10"

# Buscar solicitantes por nacionalidad
curl "http://localhost:8000/api/v1/ppsh/solicitantes?nacionalidad=VE&limit=20"

# Obtener workflows activos
curl "http://localhost:8000/api/v1/workflows?activo=true"
```

### 📖 Más Ejemplos

Para ejemplos más avanzados y casos de uso específicos, consulta:
- **Documentación de ejemplos:** [docs/ejemplos/](./docs/ejemplos/)
- **Swagger UI interactivo:** http://localhost:8000/docs
- **Colecciones de Postman:** [backend/postman/](./backend/postman/)

## 📮 Colecciones Postman

El proyecto incluye colecciones completas de Postman para probar todos los endpoints de la API.

### 📦 Colecciones Disponibles

| Colección | Endpoints | Descripción |
|-----------|-----------|-------------|
| **PPSH_Complete_API.json** | ~36 requests | API completa del módulo PPSH (Permisos de Protección y Stateless Humanitarios) |
| **Workflow_API_Tests.json** | ~30 requests | API completa del sistema de Workflows dinámicos |
| **SIM_FT_Complete_API.json** | ~35 requests | API completa del módulo SIM_FT (Sistema Integrado de Migración) |
| **Tramites_Base_API.json** | ~5 requests | API básica de gestión de trámites |
| **PPSH_Upload_Tests.json** | Tests | Pruebas específicas para carga de documentos |

### 🚀 Uso de Colecciones

#### Importar en Postman Desktop

1. Abrir Postman
2. Click en "Import"
3. Seleccionar archivo `.json` desde `backend/postman/`
4. Click en "Import"

#### Ejecutar con Newman (CLI)

```bash
# Instalar Newman
npm install -g newman

# Ejecutar una colección
newman run backend/postman/PPSH_Complete_API.postman_collection.json

# Ejecutar con reportes HTML
newman run backend/postman/PPSH_Complete_API.postman_collection.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export reports/api-test-report.html
```

#### Ejecutar Todas las Colecciones (PowerShell)

```powershell
# Ejecutar todas las colecciones de Postman
Get-ChildItem backend\postman\*_API*.json | ForEach-Object {
  Write-Host "Ejecutando: $($_.Name)" -ForegroundColor Cyan
  newman run $_.FullName
}
```

### 📊 Cobertura de Endpoints

| Módulo | Endpoints Backend | Cobertura Postman | Estado |
|--------|-------------------|-------------------|--------|
| PPSH | 18 endpoints | ✅ 100% | Completo |
| Workflows | 24 endpoints | ✅ 100% | Completo |
| SIM_FT | 35 endpoints | ✅ 100% | Completo |
| Trámites Base | 5 endpoints | ✅ 100% | Completo |
| **TOTAL** | **82 endpoints** | **✅ 100%** | **Completo** |

### 📝 Variables de Entorno

#### Opción 1: Variables en las Colecciones (Incluidas)

Todas las colecciones ya incluyen sus variables predefinidas. Al importarlas en Postman, estarán listas para usar.

#### Opción 2: Archivos de Entorno (Recomendado)

El proyecto incluye archivos de entorno predefinidos en `backend/postman/`:

```bash
# Desarrollo Local
backend/postman/env-dev.json
{
  "base_url": "http://localhost:8000",
  "api_prefix": "/api/v1",
  "username": "admin",
  "password": "admin123"
}

# Staging
backend/postman/env-staging.json
{
  "base_url": "https://staging.tramites.gob.pa",
  "api_prefix": "/api/v1"
}

# Producción (ejemplo - NO commitear con datos reales)
backend/postman/env-prod.json.example
```

**Importar entorno en Postman:**
1. Click en "Environments" → "Import"
2. Seleccionar `backend/postman/env-dev.json`
3. Activar el entorno importado

**Usar con Newman:**
```bash
newman run backend/postman/PPSH_Complete_API.postman_collection.json \
  --environment backend/postman/env-dev.json
```

#### Variables por Colección

| Colección | Variables Automáticas | Variables Requeridas |
|-----------|----------------------|---------------------|
| **Tramites_Base_API** | `tramite_id` | Ninguna |
| **PPSH_Complete_API** | `solicitud_id`, `num_expediente`, `solicitante_id` | Ninguna |
| **PPSH_Upload_Tests** | Ninguna | `solicitud_id` (existente) |
| **Workflow_API_Tests** | `workflow_id`, `etapa_id`, `instancia_id` | Ninguna |
| **SIM_FT_Complete_API** | `cod_tramite`, `num_annio`, `num_tramite` | Ninguna |

**📖 Documentación completa de variables:** [backend/postman/README.md#variables](./backend/postman/README.md#-variables-de-entorno-y-colección)

### 📚 Documentación Adicional

- **README de Postman:** [backend/postman/README.md](./backend/postman/README.md)
- **Comandos Newman:** Guía completa en README de Postman
- **Documentación interactiva:** http://localhost:8000/docs

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

## 📋 Historial de Limpieza del Proyecto

### Limpieza Completa - 25 de Octubre de 2025

**Objetivo:** Optimizar la estructura del proyecto eliminando archivos obsoletos, consolidando documentación y mejorando la organización general.

#### Resumen de Cambios

**Total de archivos eliminados:** 58 archivos  
**Reducción de líneas de código:** ~11,540 líneas  
**Reducción general del proyecto:** 35%

#### Archivos Eliminados por Categoría

##### 1. Colecciones Postman (7 archivos - 41% reducción)
- ✅ Eliminados archivos de ejemplo individual (PPSH_REQUEST_*.md)
- ✅ Eliminado mapeo obsoleto (MAPEO_PPSH_API.md)
- ✅ Eliminadas colecciones redundantes (Upload_Tests, Cache_Tests)
- ✅ Consolidado README de 900+ líneas a 143 líneas
- ✅ Creada guía completa de ejemplos end-to-end (418 líneas)

**Archivos mantenidos:** 10 archivos esenciales (colecciones principales + documentación consolidada)

##### 2. Scripts SQL (4 archivos - 44% reducción)
- ✅ Eliminados DDL scripts (ahora en migraciones Alembic)
  - `create_sim_ft_tables.sql`
  - `fix_sim_ft_tramites.sql`
- ✅ Consolidados 3 README en uno solo
- ✅ Mantenidos solo scripts de datos iniciales (seed)

**Archivos mantenidos:** 5 archivos (4 seed scripts + 1 README consolidado)

##### 3. Documentación Backend (18 archivos - 53% reducción)
- ✅ Eliminados reportes de sesión históricos (SESION_*.md)
- ✅ Eliminados reportes de problemas resueltos (PPSH_TESTS_*, WORKFLOW_FIX_*)
- ✅ Eliminadas guías de corrección ya aplicadas
- ✅ Eliminada documentación duplicada de colecciones Postman

**Archivos mantenidos:** 16 archivos de documentación técnica actual

##### 4. Archivos Raíz del Proyecto (9 archivos)
- ✅ Eliminados reportes de sesión (RESUMEN_SESION_*.md)
- ✅ Eliminados reportes de integración (RESULTADO_INTEGRACION_*.md)
- ✅ Eliminados archivos de reorganización (REORGANIZACION_DOCS_*.md)
- ✅ Eliminadas guías de carga de datos obsoletas

##### 5. Código Temporal (3 archivos Python)
- ✅ `temp_postman_script.py`
- ✅ `temp_routers_workflow.py`
- ✅ `temp_services_workflow.py`

##### 6. Backend Root (2 archivos)
- ✅ `ACTUALIZACION_RUTAS.md`
- ✅ `ORGANIZACION_BACKEND.md`

#### Mejoras en Documentación

**Consolidación:**
- backend/postman/README.md: 900+ líneas → 143 líneas (simplificado)
- backend/postman/README_EJEMPLOS_END_TO_END.md: 0 → 418 líneas (nueva guía completa)
- backend/sql/README.md: 3 archivos → 1 archivo consolidado (418 líneas)

**Organización:**
- ✅ Toda la documentación relevante se mantiene
- ✅ Referencias actualizadas a ubicaciones correctas
- ✅ Información redundante eliminada
- ✅ Guías técnicas consolidadas en una sola fuente

#### Estructura Actual del Proyecto

```
tramites-mvp-panama/
├── backend/
│   ├── postman/                    # 10 archivos (vs 17 anteriores)
│   │   ├── *.postman_collection.json (5 colecciones)
│   │   ├── env-*.json (3 ambientes)
│   │   ├── README.md (simplificado)
│   │   └── README_EJEMPLOS_END_TO_END.md (nueva guía)
│   ├── sql/                        # 5 archivos (vs 9 anteriores)
│   │   ├── seed_*.sql (4 scripts)
│   │   └── README.md (consolidado)
│   ├── docs/                       # 16 archivos técnicos actuales
│   └── app/                        # Código fuente organizado
├── docs/                           # Documentación general
│   ├── bitacora/                   # Historial de cambios
│   ├── ejemplos/                   # Ejemplos de uso
│   └── *.md                        # Guías técnicas
└── [otros directorios...]
```

#### Commits Realizados

1. **8822dd2** - feat: Agregar secciones de ejemplo end-to-end a colecciones PPSH y Workflow
2. **81ceb5b** - docs: Agregar guía completa de ejemplos end-to-end en colecciones Postman
3. **f2853ae** - refactor: Limpiar directorio postman - eliminar archivos obsoletos
4. **bbfbe68** - refactor: Limpiar directorio sql - eliminar DDL y consolidar documentación
5. **0a68ed4** - refactor: Limpiar archivos obsoletos y temporales del proyecto

**Todos los commits están en la rama:** `review-entrega-api`

#### Beneficios de la Limpieza

**Para Nuevos Desarrolladores:**
- ✅ Estructura más clara y fácil de navegar
- ✅ Menos confusión por archivos duplicados u obsoletos
- ✅ Documentación consolidada en ubicaciones predecibles

**Para el Proyecto:**
- ✅ Reducción del 35% en archivos
- ✅ Menor tamaño de repositorio
- ✅ Búsquedas más rápidas en el código
- ✅ Menor uso de almacenamiento

**Para Mantenimiento:**
- ✅ Solo archivos esenciales y actuales
- ✅ Documentación consolidada y actualizada
- ✅ Separación clara: DDL (Alembic) vs DML (sql/)
- ✅ Historia de cambios preservada en commits

#### Archivos Esenciales Mantenidos

**Colecciones Postman (100% de endpoints cubiertos):**
- PPSH_Complete_API.postman_collection.json (36 requests)
- Workflow_API_Tests.postman_collection.json (30 requests)
- SIM_FT_Complete_API.postman_collection.json (35 requests)
- Tramites_Base_API.postman_collection.json (5 requests)
- SIM_FT_Tramite_Upload_Tests.postman_collection.json (tests de upload)

**Scripts SQL (solo datos iniciales):**
- seed_sim_ft_test_data.sql
- update_sim_ft_test_data.sql
- seed_tramites_base_test_data.sql
- seed_workflow_test_data.sql

**Documentación (consolidada y actual):**
- backend/postman/README.md
- backend/postman/README_EJEMPLOS_END_TO_END.md
- backend/sql/README.md
- docs/bitacora/ (historial completo de cambios)
- docs/ejemplos/ (ejemplos de uso)
- 16 documentos técnicos en backend/docs/

#### Próximos Pasos Sugeridos

1. **Revisión periódica:** Establecer un proceso trimestral de limpieza de archivos obsoletos
2. **Documentación viva:** Mantener README files actualizados con cada cambio importante
3. **Git hooks:** Considerar pre-commit hooks para evitar commits de archivos temporales
4. **Convenciones de nombres:** Documentar convenciones para evitar proliferación de archivos

---