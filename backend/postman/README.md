# 📮 Colecciones Postman - API Trámites Migratorios Panamá# 📮 Colecciones Postman



Este directorio contiene las colecciones de Postman para probar los endpoints de la API REST del sistema.Este directorio contiene las colecciones de Postman para probar los endpoints API REST del sistema.



## 📦 Colecciones Disponibles## 📦 Colecciones Disponibles



### 1. **SIM_FT_Complete_API.postman_collection.json** v2.1.0### 1. Tramites_Base_API.postman_collection.json

API completa del módulo SIM_FT (Sistema Integrado de Migración - Funcionalidades Transversales)**Descripción:** Colección base con endpoints principales del sistema de trámites.



**Endpoints incluidos:****Incluye:**

- Tipos de Trámites, Estatus, Conclusiones, Prioridades- Autenticación y autorización

- Pasos y Flujos de Pasos- Gestión de usuarios

- Usuarios y Secciones- Operaciones básicas CRUD

- Trámites SIM_FT completos- Endpoints de configuración

- Cierre de Trámites

- Estadísticas (por tipo, estado, tiempo promedio)**Uso:**

- **🎯 Ejemplo End-to-End:** Flujo completo PERM_TEMP (14 requests)```bash

newman run postman/Tramites_Base_API.postman_collection.json \

**Variables automáticas:** `cod_tramite`, `num_tramite`, `num_registro`, `num_paso`  --environment postman/env-dev.json

```

---

---

### 2. **PPSH_Complete_API.postman_collection.json** v2.0.0

API completa del módulo PPSH (Permiso de Protección de Seguridad Humanitaria)### 2. PPSH_Complete_API.postman_collection.json

**Descripción:** API completa del sistema PPSH (Permiso de Protección de Seguridad Humanitaria).

**Endpoints incluidos:**

- Catálogos (Causas Humanitarias, Tipos de Documento, Estados)**Incluye:**

- Solicitudes CRUD (Individual, Grupal)- Gestión de solicitudes PPSH

- Gestión de Documentos (Upload, Verificación)- Carga de documentos

- Entrevistas (Programar, Registrar Resultado)- Estados y workflow

- Comentarios y Seguimiento- Causas humanitarias

- Gestión de Estado y Asignación- Reportes y estadísticas

- Estadísticas y Reportes

- **🎯 Ejemplo End-to-End:** Flujo completo solicitud PPSH (13 requests)**Endpoints:** ~36 requests  

**Pruebas:** Validaciones automáticas incluidas

**Variables automáticas:** `solicitud_id`, `num_expediente`, `documento_id`, `entrevista_id`, `comentario_id`

**Uso:**

---```bash

newman run postman/PPSH_Complete_API.postman_collection.json \

### 3. **Workflow_API_Tests.postman_collection.json** v2.0.0  --environment postman/env-dev.json \

API del sistema de Workflow Dinámico  --reporters cli,html \

  --reporter-html-export reports/ppsh-tests.html

**Endpoints incluidos:**```

- Gestión de Workflows (Create, List, Get, Update, Delete)

- Gestión de Etapas**📚 Documentación adicional:**

- Gestión de Preguntas (con opciones, archivos)- 📝 [Ejemplos de Requests PPSH](PPSH_REQUEST_EXAMPLES.md) - Formato correcto para crear solicitudes

- Gestión de Conexiones (secuenciales y condicionales)- 📊 [Guía de Datos de Prueba](PPSH_TEST_DATA_GUIDE.md) - Uso de las 5 solicitudes de ejemplo (IDs 6-10)

- Gestión de Instancias (ejecución de workflows)

- Comentarios e Historial---

- **🎯 Ejemplo End-to-End:** Diseño y ejecución completa de workflow (14 requests)

### 3. PPSH_Upload_Tests.postman_collection.json

**Variables automáticas:** `workflow_id`, `etapa_id`, `pregunta_id`, `conexion_id`, `instancia_id`**Descripción:** Pruebas específicas para carga de documentos PPSH.



---**Incluye:**

- Upload de archivos PDF

### 4. **Tramites_Base_API.postman_collection.json**- Upload de imágenes

Colección base con endpoints generales del sistema- Validación de tipos de archivo

- Manejo de errores

**Endpoints incluidos:**- Límites de tamaño

- Autenticación y autorización

- Gestión de usuarios**Uso:**

- Operaciones CRUD básicas```bash

- Endpoints de configuraciónnewman run postman/PPSH_Upload_Tests.postman_collection.json \

  --environment postman/env-dev.json

**Variables automáticas:** `tramite_id````



------



## 🎯 Secciones de Ejemplo End-to-End### 4. Workflow_API_Tests.postman_collection.json

**Descripción:** Pruebas del sistema de workflow dinámico.

Cada colección principal (SIM_FT, PPSH, Workflow) incluye una sección especial de **ejemplo de flujo completo** que demuestra el uso de todos los endpoints de principio a fin:

**Incluye:**

- ✅ Requests secuenciales con dependencias automáticas- Creación de workflows

- ✅ Variables que se generan y reutilizan automáticamente- Gestión de etapas

- ✅ Tests de validación en cada paso- Conexiones entre etapas

- ✅ Documentación detallada inline- Instancias de workflow

- ✅ Datos de ejemplo realistas- Preguntas dinámicas

- Respuestas y validaciones

**Ver guía completa:** [`README_EJEMPLOS_END_TO_END.md`](README_EJEMPLOS_END_TO_END.md)- Historial y auditoría



---**Endpoints:** ~30 requests



## 🚀 Uso Rápido**Uso:**

```bash

### En Postman Desktopnewman run postman/Workflow_API_Tests.postman_collection.json \

  --environment postman/env-dev.json

1. **Importar:**```

   - Abrir Postman → Import

   - Seleccionar archivo `.json`---

   - Las variables se cargan automáticamente

### 5. SIM_FT_Complete_API.postman_collection.json ⭐ **NUEVO**

2. **Ejecutar ejemplo end-to-end:****Descripción:** API completa del módulo SIM_FT (Sistema Integrado de Migración - Funcionalidades Transversales).

   - Navegar a la sección 🎯 EJEMPLO

   - Ejecutar requests en orden (E1 → E2 → E3 → ...)**Incluye:**

   - Ver variables generarse automáticamente- **Tipos de Trámites** - Catálogo maestro (5 endpoints)

- **Estatus** - Estados de trámites (4 endpoints)

3. **Ejecutar con Collection Runner:**- **Conclusiones** - Resultados finales (2 endpoints)

   - Click derecho en carpeta de ejemplo- **Prioridades** - Niveles de urgencia (2 endpoints)

   - "Run folder"- **Pasos** - Definición de pasos del proceso (4 endpoints)

   - Delay 500ms recomendado- **Flujo de Pasos** - Asociación pasos-trámites (2 endpoints)

- **Usuarios y Secciones** - Asignaciones (2 endpoints)

### Con Newman (CLI)- **Trámites SIM_FT** - Gestión completa (4 endpoints)

- **Pasos de Trámites** - Seguimiento detallado (4 endpoints)

```bash- **Cierre de Trámites** - Finalización (2 endpoints)

# Instalar Newman- **Estadísticas** - Reportes y métricas (3 endpoints)

npm install -g newman newman-reporter-htmlextra

**Endpoints:** ~35 requests  

# Ejecutar colección**Fecha de creación:** 23 de Octubre de 2025  

newman run SIM_FT_Complete_API.postman_collection.json**Versión:** 1.0.0



# Con entorno personalizado**Uso:**

newman run PPSH_Complete_API.postman_collection.json \```bash

  --environment env-dev.jsonnewman run postman/SIM_FT_Complete_API.postman_collection.json \

  --environment postman/env-dev.json \

# Con reporte HTML  --reporters cli,htmlextra \

newman run Workflow_API_Tests.postman_collection.json \  --reporter-htmlextra-export reports/sim-ft-report.html

  --reporters htmlextra \```

  --reporter-htmlextra-export reports/workflow-report.html

```**Características especiales:**

- ✅ Variables automáticas (cod_tramite, num_annio, num_tramite, etc.)

---- ✅ Tests de validación incluidos

- ✅ Ejemplos de datos realistas

## 📊 Archivos de Entorno- ✅ Documentación completa en cada request

- ✅ Flujo completo de trabajo (crear → listar → actualizar → cerrar)

- **`env-dev.json`** - Entorno de desarrollo local (`http://localhost:8000`)

- **`env-staging.json`** - Entorno de staging---

- **`env-prod.json.example`** - Plantilla para producción

## 🚀 Cómo Usar

**Variables comunes:**

```json### En Postman Desktop

{

  "base_url": "http://localhost:8000",1. **Importar colección:**

  "api_prefix": "/api/v1",   - Abrir Postman

  "auth_token": ""   - Click en "Import"

}   - Seleccionar archivo `.json`

```   - Click en "Import"



---2. **Configurar entorno:**

   - Crear nuevo entorno o importar `env-dev.json`

## 📚 Documentación Completa   - Configurar variables:

     ```json

**📖 Guía detallada de ejemplos end-to-end:**       {

[`README_EJEMPLOS_END_TO_END.md`](README_EJEMPLOS_END_TO_END.md)       "baseUrl": "http://localhost:8000",

       "token": "your-auth-token"

Incluye:     }

- Descripción completa de cada flujo de ejemplo     ```

- Instrucciones paso a paso

- Variables automáticas y su uso3. **Ejecutar pruebas:**

- Troubleshooting   - Seleccionar colección

- Mejores prácticas   - Click en "Run collection"

   - Configurar opciones

---   - Click en "Run"



## ✅ Mejores Prácticas### Con Newman (CLI)



1. ✅ Usar las secciones de ejemplo para aprender el flujo completo#### Instalación

2. ✅ Ejecutar requests en orden (las variables se generan secuencialmente)```bash

3. ✅ Revisar los tests para entender las validacionesnpm install -g newman

4. ✅ Usar Collection Runner con delay de 500ms para ejecución automáticanpm install -g newman-reporter-htmlextra

5. ✅ No commitear tokens o datos sensibles en archivos de entorno```



---#### Ejecutar una colección

```bash

**Última actualización:** 25 de Octubre de 2025  newman run postman/PPSH_Complete_API.postman_collection.json

**Versiones:** SIM_FT v2.1.0 | PPSH v2.0.0 | Workflow v2.0.0```


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
