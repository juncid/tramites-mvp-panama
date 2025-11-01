# Backend - Trámites MVP Panamá

API REST desarrollada con FastAPI (Python) para el sistema de gestión de trámites.

## 🏗️ Estructura del Proyecto

```
backend/
├── app/                    # Código de la aplicación
│   ├── models.py          # Modelos SQLAlchemy (trámites generales)
│   ├── models_ppsh.py     # Modelos PPSH (causas humanitarias)
│   ├── models_workflow.py # Modelos de workflow dinámico
│   ├── schemas.py         # Esquemas Pydantic
│   ├── schemas_ppsh.py    # Esquemas PPSH
│   ├── routes.py          # Rutas generales
│   ├── routes_ppsh.py     # Rutas PPSH
│   ├── routes_workflow*.py # Rutas de workflow
│   ├── services_ppsh.py   # Lógica de negocio PPSH
│   ├── database.py        # Configuración de base de datos
│   ├── redis_client.py    # Cliente Redis
│   └── main.py            # Punto de entrada
├── tests/                  # Tests unitarios e integración
├── alembic/               # Migraciones de base de datos
├── docs/                  # Documentación técnica
├── init_database.py       # 🆕 Inicialización de BD (crea tablas)
├── load_initial_data.py   # 🆕 Datos iniciales básicos (usuarios, países)
├── load_test_data.py      # 🆕 Datos de prueba completos (catálogos, workflows)
├── verify_test_data.py    # 🆕 Verificación de datos de prueba
├── requirements.txt       # Dependencias Python
└── Dockerfile             # Imagen Docker
```

## 🗄️ Scripts de Base de Datos

### `init_database.py`
Crea la estructura completa de la base de datos (35 tablas):
- Trámites base
- Módulo PPSH (11 tablas)
- Módulo Workflow (9 tablas)
- Catálogos generales
- Seguridad y usuarios

```bash
python scripts/init_database.py
```

### `load_initial_data.py`
Carga datos iniciales mínimos:
- Usuario admin
- Países base (7 registros)
- Datos esenciales de catálogos

```bash
python scripts/load_initial_data.py
```

### `load_test_data.py` 🆕
Carga datos completos para testing automatizado:
- **27 registros de catálogos PPSH**: causas humanitarias, tipos de documento, estados, conceptos de pago
- **6 registros de ejemplo PPSH**: 3 solicitantes + 3 solicitudes
- **2 workflows completos**: PPSH (5 etapas) y General (3 etapas)

```bash
python scripts/load_test_data.py
```

Ver guía completa en: [`../LOAD_TEST_DATA_GUIDE.md`](../LOAD_TEST_DATA_GUIDE.md)

### `verify_test_data.py` 🆕
Verifica que todos los datos de prueba estén cargados correctamente:

```bash
python scripts/verify_test_data.py
```

Output esperado:
```
✅ Causas Humanitarias:      7 (esperado: 7)
✅ Tipos de Documento:       8 (esperado: 8)
✅ Estados:                  9 (esperado: 9)
✅ Conceptos de Pago:        3 (esperado: 3)
✅ Solicitantes:             3 (esperado: 3)
✅ Solicitudes:              3 (esperado: 3)
✅ Workflows:                2 (esperado: 2)
✅ Etapas:                   8 (esperado: 8)
```

## 🐳 Uso en Docker

Los scripts se ejecutan automáticamente en el ambiente de testing:

```yaml
# docker-compose.api-tests.yml
command: >
  sh -c "
    python init_database.py &&          # 1. Crea tablas
    python load_initial_data.py &&      # 2. Datos básicos
    python load_test_data.py &&         # 3. Datos de prueba (NUEVO!)
    uvicorn app.main:app --host 0.0.0.0 --port 8000
  "
```

Ver información completa de la BD de test en: [`../DATABASE_TEST_INFO.md`](../DATABASE_TEST_INFO.md)
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
docker-compose -f docker-compose.test.yml run --rm test-runner pytest tests/ -v

# Tests específicos
docker-compose -f docker-compose.test.yml run --rm test-runner pytest tests/test_ppsh_unit.py -v

# Con cobertura
docker-compose -f docker-compose.test.yml run --rm test-runner pytest tests/ --cov=app --cov-report=html
```

### Estado Actual de Tests

**Última actualización:** 20 de Octubre, 2025

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

## 📚 Documentación Técnica

### Guías de Desarrollo
- [Testing Guide](TESTING_GUIDE.md) - Guía completa de testing
- [Testing Results Report](TESTING_RESULTS_REPORT.md) - Resultados de tests
- [Migrations Guide](MIGRATIONS_GUIDE.md) - Guía de migraciones de BD

### Módulo PPSH (Causas Humanitarias)
- [Análisis PPSH MVP](docs/ANALISIS_PPSH_MVP.md) - Análisis del módulo
- [Migración Tipos de Documentos PPSH](MIGRACION_TIPOS_DOCUMENTOS_PPSH.md)
- **Documentación de Tests:**
  - 📊 [**Resumen Ejecutivo de Sesión 2025-10-20**](SESION_2025_10_20_RESUMEN.md) - **LEER PRIMERO**
  - 📈 [Progress Report](PPSH_TESTS_PROGRESS_REPORT.md) - Estado y plan de acción detallado
  - 🔍 [Analysis](PPSH_TESTS_ANALYSIS.md) - Categorización de errores
  - 📝 [Fix Guide](PPSH_TESTS_FIX_GUIDE.md) - Guía de problemas y soluciones
  - 📋 [Final Report](PPSH_TESTS_FINAL_REPORT.md) - Reporte detallado

### Workflow Dinámico
- [Workflow Dinámico Design](docs/WORKFLOW_DINAMICO_DESIGN.md)
- [Workflow Integration Guide](WORKFLOW_INTEGRATION_GUIDE.md)
- [Workflow Resumen Implementación](docs/WORKFLOW_RESUMEN_IMPLEMENTACION.md)

### Deployment y Observabilidad
- [Deployment Guide](../DEPLOYMENT_GUIDE.md)
- [Observability](../OBSERVABILITY.md) - Logs y métricas
- [Logs Guide](../LOGS_GUIDE.md)

## 🛠️ Scripts de Utilidad

### Scripts de Testing
```bash
# Ejecutar tests con monitoring
python scripts/monitor_logs.py

# Corrección automática de tests PPSH (Fase 1)
python scripts/fix_ppsh_tests.py

# Corrección automática de tests PPSH (Fase 2)
python scripts/fix_ppsh_tests_phase2.py
```

### Scripts de Base de Datos
```bash
# Inicializar base de datos
python scripts/init_database.py

# Cargar datos iniciales
python scripts/load_initial_data.py

# Cargar datos PPSH
python scripts/load_ppsh_data.py

# Verificar base de datos
python scripts/verify_database.py

# Esperar a que la BD esté lista
python scripts/wait_for_db.py
```

### Scripts de Migraciones
```bash
# Crear nueva migración
./create_migration.sh "descripcion_del_cambio"

# Migrar datos PPSH
python scripts/migrate_ppsh.py
python scripts/migrate_ppsh_documentos.py

# Migración Green/Blue
python scripts/migrate_green_to_blue.py
```

## 🔧 Fixtures de Test Disponibles

### Fixtures Generales (conftest.py)
- `db_session` - Sesión de base de datos en memoria
- `client` - Cliente de test de FastAPI
- `mock_redis` - Mock de Redis para tests

### Fixtures de Usuario
- `admin_user` - Usuario administrador
- `analista_user` - Usuario analista
- `readonly_user` - Usuario solo lectura

### Fixtures PPSH
- `setup_ppsh_catalogos` - **NUEVO** ✨
  - Crea 2 PPSHCausaHumanitaria
  - Crea 3 PPSHEstado (RECIBIDO, EN_REVISION, APROBADO)
  - Uso: Resolver IntegrityError por Foreign Keys

## ⚠️ Deuda Técnica

Ver sección "Deuda Técnica en Testing" en el [README principal](../README.md#deuda-técnica-en-testing) para:
- Estado completo de tests
- Prioridades de corrección
- Estimaciones de esfuerzo
- Plan de resolución

### Resumen de Deuda Técnica PPSH

**Estado actual:** 5/27 tests pasando (18.5%)  
**Tiempo estimado para completar:** 2-3 horas  
**Documentación completa:** Ver [SESION_2025_10_20_RESUMEN.md](SESION_2025_10_20_RESUMEN.md)

**Correcciones ya aplicadas:**
- ✅ Bug crítico SQLAlchemy (`selectinload.filter`)
- ✅ Propiedad `nombre_completo` en modelo
- ✅ Estado inicial corregido
- ✅ Nombres de modelos corregidos (7)
- ✅ Fixture de catálogos creado

**Pendiente:**
- Agregar fixture a 15 tests
- Corregir assertions de campos
- Revisar 6 tests con mocks
- Implementar 1 endpoint faltante

## 🚀 Desarrollo

### Instalar Dependencias

```bash
pip install -r requirements.txt
```

### Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

```env
DATABASE_URL=mssql+pyodbc://...
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
```

### Ejecutar en Desarrollo

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📊 Métricas y Monitoreo

El sistema expone métricas en el endpoint `/metrics` en formato Prometheus.

**Métricas disponibles:**
- Contadores de requests por endpoint
- Histogramas de latencia
- Contadores de errores
- Métricas de base de datos
- Métricas de Redis

Ver [OBSERVABILITY.md](../OBSERVABILITY.md) para más detalles.

## 🤝 Contribución

1. Ejecutar tests antes de commit
2. Mantener cobertura de tests > 60%
3. Documentar cambios en archivos relevantes
4. Seguir convenciones de código (PEP 8)

## 📝 Notas Importantes

- **Tests PPSH:** Ver [SESION_2025_10_20_RESUMEN.md](SESION_2025_10_20_RESUMEN.md) para contexto completo
- **Migraciones:** Siempre hacer backup antes de migrar en producción
- **Redis:** Configurar correctamente para evitar pérdida de caché
- **CORS:** Configurado para frontend en `main.py`
