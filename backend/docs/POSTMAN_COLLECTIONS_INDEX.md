# 🗂️ Índice de Colecciones Postman

## 📦 Archivos Principales

### Colecciones de Postman (.json)

1. **PPSH_Complete_API.postman_collection.json** ⭐ NUEVA
   - Módulo PPSH completo
   - 34 requests | 8 carpetas | 100% cobertura
   - [Ver detalles](#ppsh-complete-api)

2. **Workflow_API_Tests.postman_collection.json** ✅ EXISTENTE
   - Módulo Workflow completo
   - 29 requests | 6 carpetas | 100% cobertura
   - [Ver detalles](#workflow-api)

3. **Tramites_Base_API.postman_collection.json** ⭐ NUEVA
   - Módulo Trámites Base completo
   - 13 requests | CRUD completo | 100% cobertura
   - [Ver detalles](#tramites-base-api)

4. **PPSH_Upload_Tests.postman_collection.json** ⚠️ LEGACY
   - Solo testing de upload (parcial)
   - Mantener para referencia
   - Usar PPSH_Complete_API para testing completo

---

### Documentación (.md)

1. **POSTMAN_COLLECTIONS_README.md** 📚
   - **Guía completa de uso**
   - Instrucciones paso a paso
   - Configuración de ambientes
   - Troubleshooting
   - Integración CI/CD
   - **👉 LEER PRIMERO**

2. **POSTMAN_COLLECTIONS_RESUMEN.md** 📊
   - Resumen ejecutivo
   - Métricas y estadísticas
   - Comparativas antes/después
   - Próximos pasos
   - **Para managers y tech leads**

3. **POSTMAN_COLLECTIONS_INDEX.md** 🗂️ (este archivo)
   - Índice rápido
   - Acceso directo a colecciones
   - Referencias rápidas

---

## 🚀 Quick Start

### Para Desarrolladores:

```bash
1. Importar colección en Postman
2. Configurar base_url: http://localhost:8000
3. Ejecutar requests o carpetas
4. Ver resultados de tests
```

### Para QA:

```bash
1. Importar las 3 colecciones principales
2. Configurar environment según ambiente
3. Ejecutar collection completa
4. Revisar test results y generar reporte
```

### Para DevOps/CI:

```bash
npm install -g newman
newman run PPSH_Complete_API.postman_collection.json
newman run Workflow_API_Tests.postman_collection.json
newman run Tramites_Base_API.postman_collection.json
```

---

## 📋 Detalles de Colecciones

### PPSH Complete API

**Archivo:** `PPSH_Complete_API.postman_collection.json`

**Cobertura:** 19 endpoints | 34 requests

**Estructura:**
```
├── 1. Catálogos (3)
│   ├── Causas Humanitarias
│   ├── Tipos de Documento
│   └── Estados del Proceso
│
├── 2. Solicitudes - CRUD (6)
│   ├── Crear Individual
│   ├── Crear Familiar
│   ├── Listar (sin filtros)
│   ├── Listar (con filtros)
│   ├── Obtener por ID
│   └── Actualizar
│
├── 3. Gestión de Estado (5)
│   ├── Asignar a Funcionario
│   ├── Cambiar a En Revisión
│   ├── Cambiar a Aprobado
│   ├── Cambiar a Rechazado
│   └── Obtener Historial
│
├── 4. Documentos (4)
│   ├── Subir - Pasaporte
│   ├── Subir - Tipo Personalizado
│   ├── Verificar - Aprobado
│   └── Verificar - Rechazado
│
├── 5. Entrevistas (4)
│   ├── Programar Presencial
│   ├── Programar Virtual
│   ├── Resultado Favorable
│   └── Resultado Seguimiento
│
├── 6. Comentarios (4)
│   ├── Agregar Interno
│   ├── Agregar Público
│   ├── Listar Todos
│   └── Listar Solo Públicos
│
├── 7. Estadísticas (1)
│   └── Obtener Generales
│
└── 8. Health Check (1)
    └── Health Check Module
```

**Variables:**
- `base_url`
- `api_prefix`
- `solicitud_id`
- `documento_id`
- `entrevista_id`
- `comentario_id`
- `num_expediente`

---

### Workflow API

**Archivo:** `Workflow_API_Tests.postman_collection.json`

**Cobertura:** 27 endpoints | 29 requests

**Estructura:**
```
├── 1. Workflows (6)
│   ├── Crear Simple
│   ├── Crear Completo
│   ├── Listar
│   ├── Obtener por ID
│   ├── Actualizar
│   └── Eliminar
│
├── 2. Etapas (4)
│   ├── Crear
│   ├── Obtener
│   ├── Actualizar
│   └── Eliminar
│
├── 3. Preguntas (6)
│   ├── Crear Texto
│   ├── Crear Opciones
│   ├── Crear Archivo
│   ├── Obtener
│   ├── Actualizar
│   └── Eliminar
│
├── 4. Conexiones (5)
│   ├── Crear Simple
│   ├── Crear con Condición
│   ├── Obtener
│   ├── Actualizar
│   └── Eliminar
│
├── 5. Instancias (5)
│   ├── Crear
│   ├── Listar
│   ├── Obtener
│   ├── Actualizar
│   └── Transicionar
│
└── 6. Comentarios e Historial (3)
    ├── Agregar Comentario
    ├── Listar Comentarios
    └── Obtener Historial
```

**Variables:**
- `base_url`
- `api_prefix` 
- `workflow_id`
- `etapa_id`
- `pregunta_id`
- `conexion_id`
- `instancia_id`

---

### Tramites Base API

**Archivo:** `Tramites_Base_API.postman_collection.json`

**Cobertura:** 5 endpoints | 13 requests

**Estructura:**
```
├── Listar (2)
│   ├── Primera Página
│   └── Segunda Página
│
├── Obtener (2)
│   ├── Por ID (success)
│   └── Not Found (error)
│
├── Crear (3)
│   ├── Permiso de Trabajo
│   ├── Visa Turista
│   └── Validación Error
│
├── Actualizar (3)
│   ├── Completo
│   ├── Parcial
│   └── Not Found (error)
│
└── Eliminar (3)
    ├── Soft Delete
    ├── Not Found (error)
    └── Verificar Eliminado
```

**Variables:**
- `base_url`
- `api_prefix`
- `tramite_id`

---

## 📊 Estadísticas Globales

| Métrica | Valor |
|---------|-------|
| **Total Colecciones** | 3 principales |
| **Total Endpoints** | 51 |
| **Total Requests** | 76 |
| **Total Tests** | ~228 |
| **Cobertura** | 100% ✅ |
| **Módulos Cubiertos** | 3/3 ✅ |

---

## 🎯 Uso por Escenario

### Testing de Desarrollo:
```
→ PPSH_Complete_API: Testing funcional módulo PPSH
→ Tramites_Base_API: Testing CRUD básico
→ Workflow_API: Testing workflows dinámicos
```

### Testing de Integración:
```
1. Ejecutar PPSH_Complete_API (flujo completo)
2. Ejecutar Workflow_API (crear workflow PPSH)
3. Ejecutar Tramites_Base_API (verificar registros)
```

### Testing Pre-Deploy:
```
newman run PPSH_Complete_API.postman_collection.json -r html
newman run Workflow_API_Tests.postman_collection.json -r html
newman run Tramites_Base_API.postman_collection.json -r html
```

---

## 📚 Documentación Relacionada

- **POSTMAN_COLLECTIONS_README.md** - Guía completa de uso
- **POSTMAN_COLLECTIONS_RESUMEN.md** - Resumen ejecutivo
- `/api/docs` - Documentación OpenAPI (servidor corriendo)
- `/api/redoc` - Documentación ReDoc (servidor corriendo)

---

## 🔄 Actualización de Colecciones

### Cuando agregar nuevo endpoint:

1. Identificar módulo (PPSH/Workflow/Tramites)
2. Abrir colección correspondiente en Postman
3. Agregar request en carpeta apropiada
4. Incluir tests automáticos
5. Documentar en description
6. Exportar colección actualizada
7. Actualizar este índice si es necesario

### Cuando modificar endpoint existente:

1. Localizar request en colección
2. Actualizar URL/body/headers según cambios
3. Ajustar tests si es necesario
4. Verificar variables afectadas
5. Exportar colección actualizada
6. Probar flujos completos

---

## ⚡ Atajos Rápidos

### Variables de Entorno Comunes:

```json
{
  "base_url": "http://localhost:8000",
  "api_prefix": "/api/v1",
  "ppsh_prefix": "/api/v1/ppsh",
  "workflow_prefix": "/api/v1/workflow"
}
```

### Comandos Newman Útiles:

```bash
# Run con delay entre requests
newman run coleccion.json --delay-request 500

# Run con timeout personalizado
newman run coleccion.json --timeout-request 30000

# Run con datos externos
newman run coleccion.json -d data.json

# Run con environment
newman run coleccion.json -e prod.environment.json

# Múltiples reportes
newman run coleccion.json -r cli,html,json
```

---

## 🐛 Problemas Comunes

### "Connection Refused"
→ Verificar que servidor esté corriendo en `base_url`

### "404 Not Found" 
→ Verificar `api_prefix` correcto y endpoint registrado

### "422 Validation Error"
→ Revisar request body contra schema del endpoint

### Variables no se pasan entre requests
→ Usar `pm.collectionVariables.set()` en Tests tab

---

## 📞 Soporte

**Documentación:**
- Leer `POSTMAN_COLLECTIONS_README.md` primero
- Revisar tests en cada request
- Consultar `/api/docs` del servidor

**Problemas técnicos:**
- Revisar logs del servidor backend
- Verificar configuración de variables
- Validar formato de request body

**Nuevas funcionalidades:**
- Contactar equipo de desarrollo
- Seguir estructura de colecciones existentes
- Mantener convenciones de nomenclatura

---

**Última actualización:** 2025-10-21  
**Mantenido por:** Sistema de Trámites MVP Panamá
