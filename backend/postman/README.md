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

**Endpoints:** ~50+ endpoints
**Pruebas:** Validaciones automáticas incluidas

**Uso:**
```bash
newman run postman/PPSH_Complete_API.postman_collection.json \
  --environment postman/env-dev.json \
  --reporters cli,html \
  --reporter-html-export reports/ppsh-tests.html
```

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

**Endpoints:** ~30+ endpoints

**Uso:**
```bash
newman run postman/Workflow_API_Tests.postman_collection.json \
  --environment postman/env-dev.json
```

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

## 📊 Variables de Entorno

### Desarrollo Local
```json
{
  "baseUrl": "http://localhost:8000",
  "apiVersion": "v1",
  "token": ""
}
```

### Testing
```json
{
  "baseUrl": "http://localhost:8001",
  "apiVersion": "v1",
  "token": ""
}
```

### Staging
```json
{
  "baseUrl": "https://staging.tramites.gob.pa",
  "apiVersion": "v1",
  "token": ""
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
