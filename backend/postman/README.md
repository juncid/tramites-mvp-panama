# 📮 Colecciones Postman

Este directorio contiene las colecciones de Postman para probar los endpoints API REST del sistema.

## 📦 Colecciones Disponibles

### 1. Tramites_Base_API.postman_collection.json
**Descripción:** Colección base con endpoints principales del sistema de trámites.

**Incluye:**
- Autenticación y autorización
- Gestión de usuarios
- Operaciones básicas CRUD
- Endpoints de configuración

**Uso:**
```bash
newman run postman/Tramites_Base_API.postman_collection.json \
  --environment postman/env-dev.json
```

---

### 2. PPSH_Complete_API.postman_collection.json
**Descripción:** API completa del sistema PPSH (Permiso de Protección de Seguridad Humanitaria).

**Incluye:**
- Gestión de solicitudes PPSH
- Carga de documentos
- Estados y workflow
- Causas humanitarias
- Reportes y estadísticas

**Endpoints:** ~36 requests  
**Pruebas:** Validaciones automáticas incluidas

**Uso:**
```bash
newman run postman/PPSH_Complete_API.postman_collection.json \
  --environment postman/env-dev.json \
  --reporters cli,html \
  --reporter-html-export reports/ppsh-tests.html
```

**📚 Documentación adicional:**
- 📝 [Ejemplos de Requests PPSH](PPSH_REQUEST_EXAMPLES.md) - Formato correcto para crear solicitudes
- 📊 [Guía de Datos de Prueba](PPSH_TEST_DATA_GUIDE.md) - Uso de las 5 solicitudes de ejemplo (IDs 6-10)

---

### 3. PPSH_Upload_Tests.postman_collection.json
**Descripción:** Pruebas específicas para carga de documentos PPSH.

**Incluye:**
- Upload de archivos PDF
- Upload de imágenes
- Validación de tipos de archivo
- Manejo de errores
- Límites de tamaño

**Uso:**
```bash
newman run postman/PPSH_Upload_Tests.postman_collection.json \
  --environment postman/env-dev.json
```

---

### 4. Workflow_API_Tests.postman_collection.json
**Descripción:** Pruebas del sistema de workflow dinámico.

**Incluye:**
- Creación de workflows
- Gestión de etapas
- Conexiones entre etapas
- Instancias de workflow
- Preguntas dinámicas
- Respuestas y validaciones
- Historial y auditoría

**Endpoints:** ~30 requests

**Uso:**
```bash
newman run postman/Workflow_API_Tests.postman_collection.json \
  --environment postman/env-dev.json
```

---

### 5. SIM_FT_Complete_API.postman_collection.json ⭐ **NUEVO**
**Descripción:** API completa del módulo SIM_FT (Sistema Integrado de Migración - Funcionalidades Transversales).

**Incluye:**
- **Tipos de Trámites** - Catálogo maestro (5 endpoints)
- **Estatus** - Estados de trámites (4 endpoints)
- **Conclusiones** - Resultados finales (2 endpoints)
- **Prioridades** - Niveles de urgencia (2 endpoints)
- **Pasos** - Definición de pasos del proceso (4 endpoints)
- **Flujo de Pasos** - Asociación pasos-trámites (2 endpoints)
- **Usuarios y Secciones** - Asignaciones (2 endpoints)
- **Trámites SIM_FT** - Gestión completa (4 endpoints)
- **Pasos de Trámites** - Seguimiento detallado (4 endpoints)
- **Cierre de Trámites** - Finalización (2 endpoints)
- **Estadísticas** - Reportes y métricas (3 endpoints)

**Endpoints:** ~35 requests  
**Fecha de creación:** 23 de Octubre de 2025  
**Versión:** 1.0.0

**Uso:**
```bash
newman run postman/SIM_FT_Complete_API.postman_collection.json \
  --environment postman/env-dev.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export reports/sim-ft-report.html
```

**Características especiales:**
- ✅ Variables automáticas (cod_tramite, num_annio, num_tramite, etc.)
- ✅ Tests de validación incluidos
- ✅ Ejemplos de datos realistas
- ✅ Documentación completa en cada request
- ✅ Flujo completo de trabajo (crear → listar → actualizar → cerrar)

---

## 🚀 Cómo Usar

### En Postman Desktop

1. **Importar colección:**
   - Abrir Postman
   - Click en "Import"
   - Seleccionar archivo `.json`
   - Click en "Import"

2. **Configurar entorno:**
   - Crear nuevo entorno o importar `env-dev.json`
   - Configurar variables:
     ```json
     {
       "baseUrl": "http://localhost:8000",
       "token": "your-auth-token"
     }
     ```

3. **Ejecutar pruebas:**
   - Seleccionar colección
   - Click en "Run collection"
   - Configurar opciones
   - Click en "Run"

### Con Newman (CLI)

#### Instalación
```bash
npm install -g newman
npm install -g newman-reporter-htmlextra
```

#### Ejecutar una colección
```bash
newman run postman/PPSH_Complete_API.postman_collection.json
```

#### Con entorno
```bash
newman run postman/PPSH_Complete_API.postman_collection.json \
  --environment postman/env-dev.json
```

#### Con reportes HTML
```bash
newman run postman/PPSH_Complete_API.postman_collection.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export reports/ppsh-report.html
```

#### Ejecutar todas las colecciones
```bash
# Bash
for collection in postman/*.json; do
  newman run "$collection" --environment postman/env-dev.json
done

# PowerShell
Get-ChildItem postman\*.json | ForEach-Object {
  newman run $_.FullName --environment postman\env-dev.json
}
```

---

## 📊 Variables de Entorno y Colección

### Variables Globales (Todas las Colecciones)

Cada colección utiliza las siguientes variables base:

| Variable | Descripción | Valor Desarrollo | Valor Producción |
|----------|-------------|------------------|------------------|
| `base_url` | URL base del servidor API | `http://localhost:8000` | `https://api.tramites.com` |
| `api_prefix` | Prefijo de la ruta API | `/api/v1` | `/api/v1` |

---

### Variables por Colección

#### 1. **Tramites_Base_API.postman_collection.json**

```json
{
  "base_url": "http://localhost:8000",
  "api_prefix": "/api/v1",
  "tramite_id": ""
}
```

**Variables automáticas:**
- `tramite_id` - Se genera automáticamente al crear un trámite (usado en GET, PUT, DELETE)

---

#### 2. **PPSH_Complete_API.postman_collection.json**

```json
{
  "base_url": "http://localhost:8000",
  "api_prefix": "/api/v1/ppsh",
  "solicitud_id": "",
  "solicitante_id": "",
  "num_expediente": "",
  "documento_id": ""
}
```

**Variables automáticas:**
- `solicitud_id` - ID de solicitud PPSH creada
- `solicitante_id` - ID del solicitante registrado
- `num_expediente` - Número de expediente generado (formato: PPSH-YYYY-NNNN)
- `documento_id` - ID del documento cargado

**Variables manuales requeridas:**
- Ninguna (todas se generan en el flujo)

---

#### 3. **PPSH_Upload_Tests.postman_collection.json**

```json
{
  "base_url": "http://localhost:8000",
  "solicitud_id": "123"
}
```

**Variables manuales requeridas:**
- `solicitud_id` - ID de solicitud PPSH existente (debe crearse primero con PPSH_Complete_API)

**Nota:** Esta colección requiere archivos de prueba en `backend/postman/test-files/`:
- `sample.pdf` (PDF válido < 10MB)
- `sample.jpg` (Imagen JPG válida)
- `invalid.txt` (Archivo de texto para prueba de validación)

---

#### 4. **Workflow_API_Tests.postman_collection.json**

```json
{
  "base_url": "http://localhost:8000",
  "api_prefix": "/api/v1/workflow",
  "workflow_id": "",
  "etapa_id": "",
  "pregunta_id": "",
  "conexion_id": "",
  "instancia_id": ""
}
```

**Variables automáticas:**
- `workflow_id` - ID del workflow creado
- `etapa_id` - ID de la etapa del workflow
- `pregunta_id` - ID de la pregunta dinámica
- `conexion_id` - ID de la conexión entre etapas
- `instancia_id` - ID de la instancia de workflow ejecutándose

---

#### 5. **SIM_FT_Complete_API.postman_collection.json** ⭐

```json
{
  "base_url": "http://localhost:8000",
  "api_prefix": "/api/v1/sim-ft",
  "cod_tramite": "",
  "num_annio": "",
  "num_tramite": "",
  "num_registro": "",
  "num_paso": ""
}
```

**Variables automáticas:**
- `cod_tramite` - Código del tipo de trámite (ej: "NAT", "RES", "VIS")
- `num_annio` - Año del trámite (ej: 2025)
- `num_tramite` - Número correlativo del trámite
- `num_registro` - Número de registro único
- `num_paso` - Número del paso en el flujo

**Nota:** Todas las variables se generan automáticamente al ejecutar los endpoints en orden.

---

### 🔧 Configuración de Variables en Postman

#### Opción 1: Variables de Colección (Recomendado para pruebas locales)

Las variables ya están incluidas en cada archivo `.json`. Al importar, Postman las carga automáticamente.

#### Opción 2: Environment (Recomendado para múltiples entornos)

Crear archivo `env-dev.json`:

```json
{
  "id": "dev-environment",
  "name": "Development",
  "values": [
    {
      "key": "base_url",
      "value": "http://localhost:8000",
      "enabled": true
    },
    {
      "key": "api_version",
      "value": "v1",
      "enabled": true
    },
    {
      "key": "auth_token",
      "value": "",
      "enabled": true
    }
  ]
}
```

Crear archivo `env-prod.json`:

```json
{
  "id": "prod-environment",
  "name": "Production",
  "values": [
    {
      "key": "base_url",
      "value": "https://api.tramites.gob.pa",
      "enabled": true
    },
    {
      "key": "api_version",
      "value": "v1",
      "enabled": true
    },
    {
      "key": "auth_token",
      "value": "{{SECURE_TOKEN}}",
      "enabled": true
    }
  ]
}
```

#### Opción 3: Newman CLI con variables

```bash
# Usando archivo de entorno
newman run PPSH_Complete_API.postman_collection.json \
  --environment env-dev.json

# Sobrescribiendo variables específicas
newman run SIM_FT_Complete_API.postman_collection.json \
  --env-var "base_url=http://localhost:9000" \
  --env-var "api_prefix=/api/v2/sim-ft"

# Usando archivo de variables globales
newman run Workflow_API_Tests.postman_collection.json \
  --globals globals.json
```

---

### 📝 Ejemplo Práctico: Ejecutar Colección SIM_FT

```bash
# 1. Sin variables adicionales (usa las predefinidas)
newman run SIM_FT_Complete_API.postman_collection.json

# 2. Con entorno personalizado
newman run SIM_FT_Complete_API.postman_collection.json \
  --environment env-staging.json

# 3. Con variables inline
newman run SIM_FT_Complete_API.postman_collection.json \
  --env-var "base_url=http://192.168.1.100:8000"

# 4. Con reporte HTML
newman run SIM_FT_Complete_API.postman_collection.json \
  --environment env-dev.json \
  --reporters htmlextra \
  --reporter-htmlextra-export reports/sim-ft-$(date +%Y%m%d).html
```

---

### 🔐 Variables Sensibles (Autenticación)

Para colecciones que requieren autenticación:

```json
{
  "auth_token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin",
  "password": "admin123",
  "api_key": "your-api-key-here"
}
```

**⚠️ IMPORTANTE:**
- **NO** commitear variables con tokens reales en Git
- Usar variables de entorno del sistema: `{{$env:API_TOKEN}}`
- En CI/CD, usar secrets del pipeline

---

### 🎯 Variables Dinámicas de Postman

Postman provee variables dinámicas útiles:

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `{{$guid}}` | `a5f1c3e7-...` | GUID único |
| `{{$timestamp}}` | `1635789012` | Timestamp Unix actual |
| `{{$randomInt}}` | `42` | Entero aleatorio 0-1000 |
| `{{$randomEmail}}` | `john@email.com` | Email aleatorio |
| `{{$randomFirstName}}` | `María` | Nombre aleatorio |

**Uso en requests:**
```json
{
  "email": "{{$randomEmail}}",
  "created_at": "{{$timestamp}}",
  "transaction_id": "{{$guid}}"
}
```

---

## 🧪 Pruebas Automatizadas

### Ejecutar Suite Completa
```bash
# Crear script run-all-tests.sh
#!/bin/bash
newman run postman/Tramites_Base_API.postman_collection.json
newman run postman/PPSH_Complete_API.postman_collection.json
newman run postman/Workflow_API_Tests.postman_collection.json
```

### Con CI/CD
```yaml
# GitHub Actions / GitLab CI
test:
  script:
    - npm install -g newman
    - newman run postman/PPSH_Complete_API.postman_collection.json
```

---

## 📝 Estructura de una Colección

```
Collection
├── Variables (baseUrl, token, etc.)
├── Autenticación
│   ├── Login
│   └── Refresh Token
├── Endpoints CRUD
│   ├── GET /resource
│   ├── POST /resource
│   ├── PUT /resource/{id}
│   └── DELETE /resource/{id}
└── Tests
    └── Validaciones automáticas
```

---

## ✅ Mejores Prácticas

1. **Usar variables** para URLs y tokens
2. **Incluir tests** en cada request
3. **Documentar** cada endpoint
4. **Organizar** en carpetas lógicas
5. **Versionar** las colecciones en Git
6. **Actualizar** cuando cambie la API

---

## 📚 Documentación Relacionada

- **Endpoints SIM_FT:** `docs/SIM_FT_API_ENDPOINTS.md`
- **Comandos Newman:** `docs/POSTMAN_NEWMAN_COMMANDS.md`
- **Índice de Colecciones:** `docs/POSTMAN_COLLECTIONS_INDEX.md`
- **Guía de Uso:** `docs/POSTMAN_COLLECTIONS_README.md`

---

**Última actualización:** 22 de Octubre de 2025
