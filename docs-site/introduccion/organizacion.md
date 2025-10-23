# 📁 Organización del Proyecto

Esta guía describe la estructura organizativa del repositorio y las convenciones de ubicación de archivos.

---

## 📂 Estructura General

```
tramites-mvp-panama/
├── 📄 README.md                    # Documentación principal del proyecto
├── 📄 REORGANIZACION_DOCS_RAIZ.md  # Historial de reorganización
│
├── backend/                         # Backend FastAPI
│   ├── app/                         # Código de la aplicación
│   ├── tests/                       # Tests unitarios y de integración
│   ├── alembic/                     # Migraciones de base de datos
│   │
│   ├── 📂 scripts/                  # Scripts de utilidades (15 archivos)
│   │   ├── init_database.py
│   │   ├── load_initial_data.py
│   │   ├── load_test_data.py
│   │   ├── verify_test_data.py
│   │   ├── load_sim_ft_data.py
│   │   ├── load_ppsh_data.py
│   │   ├── migrate_ppsh.py
│   │   └── README.md
│   │
│   ├── 📂 docs/                     # Documentación técnica (32 archivos)
│   │   ├── SIM_FT_*.md
│   │   ├── PPSH_*.md
│   │   ├── WORKFLOW_*.md
│   │   └── README.md
│   │
│   ├── 📂 postman/                  # Colecciones Postman (4 archivos)
│   │   ├── PPSH_Complete_API.postman_collection.json
│   │   ├── Workflow_API_Tests.postman_collection.json
│   │   └── README.md
│   │
│   └── 📂 sql/                      # Scripts SQL directos (2 archivos)
│       ├── create_sim_ft_tables.sql
│       └── README.md
│
├── frontend/                        # Frontend React
│   ├── src/
│   ├── public/
│   └── package.json
│
├── docs/                            # Documentación general
│   ├── 📂 Testing/                  # Documentación de testing (6 archivos)
│   │   ├── API_TESTING_README.md
│   │   ├── LOAD_TEST_DATA_GUIDE.md
│   │   └── README.md
│   │
│   ├── 📂 Reports/                  # Reportes y análisis (4 archivos)
│   │   ├── ANALISIS_CUMPLIMIENTO_PRODUCTO_1.md
│   │   ├── MIGRACION_MANUAL_USUARIO_REPORTE.md
│   │   └── README.md
│   │
│   ├── 📂 Fixes/                    # Correcciones documentadas (2 archivos)
│   │   ├── FIX_INTRODUCCION_404.md
│   │   └── README.md
│   │
│   ├── Architecture/
│   ├── BBDD/
│   ├── Development/
│   ├── Workflow/
│   └── ... (otros subdirectorios)
│
├── docs-site/                       # Documentación MkDocs (este sitio)
│   ├── introduccion/
│   ├── usuario/
│   ├── tecnico/
│   ├── database/
│   └── capacitacion/
│
├── config/                          # Configuraciones
├── database/                        # Esquemas y datos iniciales
├── nginx/                           # Configuración de Nginx
└── scripts/                         # Scripts de automatización
```

---

## 🎯 Convenciones de Ubicación

### Backend

#### Scripts Python (`backend/scripts/`)
Todos los scripts ejecutables de Python:

**Inicialización:**
- `init_database.py` - Inicializar estructura de BD
- `load_initial_data.py` - Cargar datos básicos
- `load_test_data.py` - Cargar datos de prueba completos

**Verificación:**
- `verify_test_data.py` - Verificar datos cargados
- `verify_database.py` - Verificar estado de BD
- `verify_sim_ft.py` - Verificar sistema SIM_FT

**Migración:**
- `migrate_ppsh.py` - Migrar datos PPSH
- `migrate_ppsh_documentos.py` - Migrar documentos PPSH
- `migrate_green_to_blue.py` - Migración Green/Blue

**Datos Específicos:**
- `load_sim_ft_data.py` - Cargar datos SIM_FT
- `load_ppsh_data.py` - Cargar datos PPSH

**Mantenimiento:**
- `monitor_logs.py` - Monitorear logs
- `wait_for_db.py` - Esperar disponibilidad de BD
- `fix_ppsh_tests.py` - Corrección de tests PPSH

#### Documentación Técnica (`backend/docs/`)
Documentación detallada de implementación:

**Por Módulo:**
- `SIM_FT_*.md` - Sistema SIM_FT (9 archivos)
- `PPSH_*.md` - Sistema PPSH (5 archivos)
- `WORKFLOW_*.md` - Sistema de Workflows (9 archivos)

**Testing:**
- `TESTING_*.md` - Guías de testing
- `TESTS_*.md` - Reportes de tests

**Migraciones:**
- `MIGRACION_*.md` - Documentos de migraciones

#### Colecciones Postman (`backend/postman/`)
Colecciones para testing de API:

- `PPSH_Complete_API.postman_collection.json` - 50+ endpoints PPSH
- `Tramites_Base_API.postman_collection.json` - Endpoints base
- `Workflow_API_Tests.postman_collection.json` - 30+ endpoints workflows
- `PPSH_Upload_Tests.postman_collection.json` - Tests de carga

#### Scripts SQL (`backend/sql/`)
Scripts SQL directos (usar con precaución):

- `create_sim_ft_tables.sql` - Crear tablas SIM_FT
- `fix_sim_ft_tramites.sql` - Correcciones de datos

### Documentación General (`docs/`)

#### Testing (`docs/Testing/`)
Todo relacionado con pruebas:
- Guías de API testing
- Información de base de datos de test
- Implementación de tests
- Correcciones aplicadas

#### Reports (`docs/Reports/`)
Reportes de progreso y cumplimiento:
- Análisis de cumplimiento
- Reportes de migración
- Resúmenes ejecutivos

#### Fixes (`docs/Fixes/`)
Documentación de correcciones:
- Problemas resueltos
- Parches aplicados
- Lecciones aprendidas

---

## 📝 Nomenclatura de Archivos

### Scripts Python
```
<accion>_<modulo>_<objeto>.py

Ejemplos:
- load_sim_ft_data.py
- verify_test_data.py
- migrate_ppsh.py
```

### Documentación Técnica
```
<MODULO>_<TIPO>_<DESCRIPCION>.md

Ejemplos:
- SIM_FT_IMPLEMENTATION.md
- PPSH_TESTS_FINAL_REPORT.md
- WORKFLOW_INTEGRATION_SUMMARY.md
```

### Colecciones Postman
```
<Modulo>_<Tipo>_<Proposito>.postman_collection.json

Ejemplos:
- PPSH_Complete_API.postman_collection.json
- Workflow_API_Tests.postman_collection.json
```

### Reportes
```
<TIPO>_<MODULO>_REPORTE.md

Ejemplos:
- MIGRACION_MANUAL_USUARIO_REPORTE.md
- ANALISIS_CUMPLIMIENTO_PRODUCTO_1.md
```

---

## 🚀 Uso de Scripts

### Desde el Directorio Backend

```bash
cd backend

# Scripts de inicialización
python scripts/init_database.py
python scripts/load_initial_data.py
python scripts/load_test_data.py

# Scripts de verificación
python scripts/verify_test_data.py
python scripts/verify_database.py

# Scripts de datos específicos
python scripts/load_sim_ft_data.py
python scripts/load_ppsh_data.py

# Scripts de migración
python scripts/migrate_ppsh.py
python scripts/migrate_ppsh_documentos.py
```

### Con Docker

```bash
# Desde la raíz del proyecto
docker compose exec backend python scripts/init_database.py
docker compose exec backend python scripts/load_test_data.py
docker compose exec backend python scripts/verify_test_data.py
```

### Colecciones Postman

```bash
# Con Newman (CLI de Postman)
cd backend
newman run postman/PPSH_Complete_API.postman_collection.json
newman run postman/Workflow_API_Tests.postman_collection.json
```

---

## 📊 Beneficios de la Organización

### ✅ Claridad
- Fácil encontrar scripts y documentación
- Estructura lógica por categorías
- Nombres descriptivos y consistentes

### ✅ Mantenibilidad
- Cada directorio tiene su README
- Convenciones claras establecidas
- Fácil agregar nuevos archivos

### ✅ Navegabilidad
- READMEs en cada categoría
- Enlaces cruzados
- Documentación de ubicaciones

### ✅ Profesionalismo
- Estructura similar a proyectos enterprise
- Documentación exhaustiva
- Onboarding simplificado

---

## 🔍 Localización Rápida

### "¿Dónde está el script para...?"

| Acción | Ubicación |
|--------|-----------|
| Inicializar BD | `backend/scripts/init_database.py` |
| Cargar datos de prueba | `backend/scripts/load_test_data.py` |
| Verificar datos | `backend/scripts/verify_test_data.py` |
| Migrar PPSH | `backend/scripts/migrate_ppsh.py` |
| Cargar SIM_FT | `backend/scripts/load_sim_ft_data.py` |

### "¿Dónde está la documentación de...?"

| Tema | Ubicación |
|------|-----------|
| Implementación SIM_FT | `backend/docs/SIM_FT_*.md` |
| Tests PPSH | `backend/docs/PPSH_TESTS_*.md` |
| Workflows | `backend/docs/WORKFLOW_*.md` |
| Testing API | `docs/Testing/API_TESTING_README.md` |
| Reportes | `docs/Reports/` |

### "¿Dónde están las colecciones...?"

| Colección | Ubicación |
|-----------|-----------|
| API PPSH completa | `backend/postman/PPSH_Complete_API.postman_collection.json` |
| Tests de Workflow | `backend/postman/Workflow_API_Tests.postman_collection.json` |
| API Base | `backend/postman/Tramites_Base_API.postman_collection.json` |

---

## 📚 Enlaces Útiles

### READMEs Principales
- [Backend Scripts](../../backend/scripts/README.md) - Guía completa de scripts
- [Backend Docs](../../backend/docs/README.md) - Índice de documentación técnica
- [Postman Collections](../../backend/postman/README.md) - Guía de colecciones
- [Testing Docs](../../docs/Testing/README.md) - Documentación de testing
- [Reports](../../docs/Reports/README.md) - Reportes y análisis

### Guías de Reorganización
- [Reorganización Backend](../../backend/ORGANIZACION_BACKEND.md)
- [Reorganización Docs Raíz](../../REORGANIZACION_DOCS_RAIZ.md)
- [Actualización de Rutas](../../backend/ACTUALIZACION_RUTAS.md)

---

## ⚠️ Notas Importantes

### ✓ Siempre usa el prefijo `scripts/`
```bash
# ✅ CORRECTO
python scripts/load_test_data.py

# ❌ INCORRECTO (ya no funciona)
python load_test_data.py
```

### ✓ Las colecciones están en `postman/`
```bash
# ✅ CORRECTO
newman run postman/PPSH_Complete_API.postman_collection.json

# ❌ INCORRECTO
newman run PPSH_Complete_API.postman_collection.json
```

### ✓ Documentación técnica en `backend/docs/`
- No confundir con `docs/` en la raíz (documentación general)
- `backend/docs/` = Documentación técnica de implementación
- `docs/` = Documentación general, reportes, testing

---

**Última actualización**: 22 de Octubre, 2025  
**Versión**: 1.0

!!! success "Estructura Organizada"
    El proyecto ahora tiene una estructura clara, mantenible y profesional. ¡Fácil de navegar! 🎉
