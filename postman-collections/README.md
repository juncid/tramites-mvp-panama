# Colecciones Postman - API Trámites Panamá

Este directorio contiene las colecciones Postman oficiales para probar los endpoints de la API.

## 📦 Colecciones Disponibles

### 1. PPSH_Complete_API.postman_collection.json
**Módulo:** Permisos Provisionales de Salud Humana (PPSH)

Endpoints incluidos:
- ✅ Gestión de solicitudes PPSH
- ✅ Gestión de solicitantes
- ✅ Consultas y filtros
- ✅ Cargas de documentos
- ✅ Actualizaciones de estado

**Base URL:** `http://localhost:8001/api/v1/ppsh`

---

### 2. SIM_FT_Complete_API.postman_collection.json
**Módulo:** Sistema de Información de Migración - Flujo de Trabajo (SIM-FT)

Endpoints incluidos:
- ✅ Gestión de trámites SIM-FT
- ✅ CRUD de trámites
- ✅ Consultas y búsquedas
- ✅ Actualizaciones de estado
- ✅ Integración con PPSH

**Base URL:** `http://localhost:8001/api/v1/sim-ft`

---

### 3. Workflow_API_Tests.postman_collection.json
**Módulo:** Motor de Workflow

Endpoints incluidos:
- ✅ Gestión de instancias de workflow
- ✅ Transiciones de estado
- ✅ Validaciones de negocio
- ✅ Consultas de progreso
- ✅ Historial de cambios

**Base URL:** `http://localhost:8001/api/v1/workflow`

---

## 🌍 Environments

### env-dev.json
Configuración para ambiente de desarrollo local:
- **Host:** `localhost:8001`
- **Protocol:** `http`
- **Database:** Base de datos de desarrollo

### env-staging.json
Configuración para ambiente de staging:
- **Host:** Servidor de staging
- **Protocol:** `https`
- **Database:** Base de datos de staging

---

## 🚀 Cómo Usar

### 1. Importar en Postman

1. Abre Postman
2. Click en **Import**
3. Selecciona las colecciones que necesites:
   - `PPSH_Complete_API.postman_collection.json`
   - `SIM_FT_Complete_API.postman_collection.json`
   - `Workflow_API_Tests.postman_collection.json`
4. Importa el environment correspondiente:
   - `env-dev.json` para desarrollo local
   - `env-staging.json` para staging

### 2. Configurar Environment

1. En Postman, selecciona el environment importado (Dev o Staging)
2. Click en el ícono de ojo 👁️ para verificar las variables
3. Asegúrate que las URLs estén correctas

### 3. Ejecutar Requests

#### Opción A: Requests Individuales
- Navega por la colección
- Selecciona el request que necesites
- Click en **Send**

#### Opción B: Ejecutar Toda la Colección
- Click derecho en la colección
- Selecciona **Run collection**
- Configura las opciones de ejecución
- Click en **Run**

---

## 📋 Requisitos Previos

Antes de usar las colecciones, asegúrate de:

1. **Backend corriendo:**
   ```bash
   docker compose up backend
   ```

2. **Base de datos inicializada:**
   ```bash
   docker compose run --rm db-seed
   ```

3. **Verificar que el backend responde:**
   ```bash
   curl http://localhost:8001/api/health
   ```

---

## 🔍 Estructura de las Colecciones

Todas las colecciones siguen la misma estructura:

```
📁 Colección
├── 📂 GET Requests (Consultas)
│   ├── Listar todos
│   ├── Obtener por ID
│   └── Búsquedas con filtros
├── 📂 POST Requests (Creación)
│   ├── Crear nuevo registro
│   └── Validaciones
├── 📂 PUT Requests (Actualización)
│   ├── Actualizar completo
│   └── Actualizar parcial
└── 📂 DELETE Requests (Eliminación)
    └── Soft delete
```

---

## ⚠️ Colecciones Deprecadas

Las siguientes colecciones **NO** deben usarse para nuevos desarrollos:

- ❌ `Tramites_Base_API.postman_collection.json` - **DEPRECADA**
  - Usar `SIM_FT_Complete_API.postman_collection.json` en su lugar
  - Fecha de remoción: 2025-12-01

---

## 🐛 Troubleshooting

### Error: "Could not connect to server"
```bash
# Verifica que el backend esté corriendo
docker ps | grep tramites-backend

# Si no está corriendo, inícialo
docker compose up backend
```

### Error: "Unauthorized" o "401"
- Verifica que el token de autenticación esté configurado en el environment
- Revisa que las variables de environment estén seleccionadas

### Error: "404 Not Found"
- Verifica que la URL base sea correcta (`http://localhost:8001/api/v1`)
- Asegúrate de estar usando el environment correcto

### Error: "500 Internal Server Error"
- Revisa los logs del backend: `docker logs tramites-backend`
- Verifica que la base de datos esté inicializada

---

## 📚 Documentación Adicional

- **Swagger UI:** http://localhost:8001/api/docs
- **ReDoc:** http://localhost:8001/api/redoc
- **Manual Técnico:** `/docs/MANUAL_TECNICO.md`

---

## 🔄 Actualización de Colecciones

Las colecciones se mantienen sincronizadas con el código del backend. Si agregas nuevos endpoints:

1. Actualiza la colección correspondiente en Postman
2. Exporta la colección actualizada
3. Reemplaza el archivo en este directorio
4. Haz commit de los cambios

---

## 📞 Soporte

Si encuentras problemas con las colecciones o tienes sugerencias:
1. Revisa la documentación en `/docs`
2. Verifica los logs del backend
3. Consulta el manual técnico
