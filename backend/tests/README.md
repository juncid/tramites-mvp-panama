# Suite de Tests - Sistema de Trámites Migratorios de Panamá

Este directorio contiene la suite completa de tests para el sistema, incluyendo tests unitarios, de integración y herramientas auxiliares.

## 📁 Estructura de Archivos

```
tests/
├── conftest.py              # Configuración base y fixtures
├── requirements.txt         # Dependencias para testing
├── test_main.py            # Tests básicos de salud del sistema
├── test_tramites_unit.py   # Tests unitarios para endpoints de trámites
├── test_ppsh_unit.py       # Tests unitarios para endpoints PPSH
├── test_integration.py     # Tests de integración end-to-end
├── test_factories.py       # Factories y helpers para datos de prueba
└── README.md               # Esta documentación
```

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias de Testing

```bash
# Desde el directorio backend/
pip install -r tests/requirements.txt
```

### 2. Configurar Variables de Entorno

Los tests usan configuraciones específicas que se establecen automáticamente en `conftest.py`:

- `ENVIRONMENT=test`
- `DATABASE_URL=sqlite:///:memory:` (Base de datos en memoria)
- `REDIS_URL=redis://localhost:6379/15` (Base de datos Redis específica para tests)
- `LOG_LEVEL=WARNING`

## 🧪 Tipos de Tests

### Tests Unitarios

**Archivos**: `test_tramites_unit.py`, `test_ppsh_unit.py`

- Prueban funcionalidad individual de endpoints
- Usan mocks para dependencias externas
- Validan lógica de negocio específica
- Rápidos de ejecutar

**Cobertura**:
- ✅ CRUD completo de trámites (6 endpoints)
- ✅ Gestión completa PPSH (~20 endpoints)
- ✅ Validaciones de entrada
- ✅ Manejo de errores
- ✅ Cache Redis
- ✅ Paginación y filtros
- ✅ Soft delete
- ✅ Permisos y roles

### Tests de Integración

**Archivo**: `test_integration.py`

- Prueban flujos completos end-to-end
- Usan base de datos real (SQLite en memoria)
- Validan interacciones entre módulos
- Incluyen escenarios complejos

**Cobertura**:
- ✅ Ciclo completo de trámites
- ✅ Flujo completo PPSH (solicitud → documentos → entrevista → decisión)
- ✅ Control de acceso y permisos
- ✅ Manejo de archivos
- ✅ Estadísticas y reportes
- ✅ Escenarios de error y rollback

### Tests de Factories y Helpers

**Archivo**: `test_factories.py`

- Factories para creación masiva de datos
- Helpers para validaciones comunes
- Utilidades para tests de performance
- Mocks reutilizables

## 🏃‍♂️ Ejecutar Tests

### Ejecutar Todos los Tests

```bash
# Desde el directorio backend/
pytest tests/ -v
```

### Ejecutar por Categoría

```bash
# Solo tests unitarios
pytest tests/test_tramites_unit.py tests/test_ppsh_unit.py -v

# Solo tests de integración
pytest tests/test_integration.py -v

# Tests por marcadores
pytest -m unit -v          # Solo unitarios
pytest -m integration -v   # Solo integración
pytest -m slow -v          # Solo tests lentos
```

### Ejecutar Tests Específicos

```bash
# Test específico por nombre
pytest tests/test_tramites_unit.py::TestTramitesEndpoints::test_get_tramites_success -v

# Tests de una clase específica
pytest tests/test_ppsh_unit.py::TestPPSHSolicitudesEndpoints -v
```

### Opciones Útiles

```bash
# Con coverage
pytest tests/ --cov=app --cov-report=html

# Solo tests que fallan
pytest tests/ --lf

# Parar en primer error
pytest tests/ -x

# Ejecutar en paralelo (requiere pytest-xdist)
pytest tests/ -n auto

# Verbose con output completo
pytest tests/ -v -s
```

## 📊 Coverage de Tests

### Endpoints Cubiertos

#### Trámites (6 endpoints):
- ✅ `GET /tramites/` - Listar con paginación y filtros
- ✅ `POST /tramites/` - Crear trámite
- ✅ `GET /tramites/{id}` - Obtener por ID
- ✅ `PUT /tramites/{id}` - Actualizar trámite
- ✅ `DELETE /tramites/{id}` - Eliminar (soft delete)
- ✅ Cache Redis en todos los endpoints

#### PPSH (~20 endpoints):
- ✅ `GET /ppsh/solicitudes/` - Listar solicitudes
- ✅ `POST /ppsh/solicitudes/` - Crear solicitud
- ✅ `GET /ppsh/solicitudes/{id}` - Obtener solicitud
- ✅ `PUT /ppsh/solicitudes/{id}` - Actualizar solicitud
- ✅ `PUT /ppsh/solicitudes/{id}/estado` - Cambiar estado
- ✅ `GET /ppsh/solicitudes/{id}/solicitantes` - Listar solicitantes
- ✅ `POST /ppsh/solicitudes/{id}/solicitantes` - Agregar solicitante
- ✅ `GET /ppsh/solicitudes/{id}/documentos` - Listar documentos
- ✅ `POST /ppsh/solicitudes/{id}/documentos` - Subir documento
- ✅ `DELETE /ppsh/documentos/{id}` - Eliminar documento
- ✅ `GET /ppsh/solicitudes/{id}/entrevistas` - Listar entrevistas
- ✅ `POST /ppsh/solicitudes/{id}/entrevistas` - Crear entrevista
- ✅ `PUT /ppsh/entrevistas/{id}/resultado` - Actualizar resultado
- ✅ `GET /ppsh/solicitudes/{id}/comentarios` - Listar comentarios
- ✅ `POST /ppsh/solicitudes/{id}/comentarios` - Agregar comentario
- ✅ `GET /ppsh/catalogos/*` - Endpoints de catálogos
- ✅ `GET /ppsh/estadisticas/dashboard` - Estadísticas
- ✅ Control de permisos en todos los endpoints

### Funcionalidades Cubiertas

#### Validaciones:
- ✅ Validación de entrada (Pydantic schemas)
- ✅ Validación de permisos y roles
- ✅ Validación de estados y transiciones
- ✅ Validación de archivos (tipos, tamaños)

#### Manejo de Errores:
- ✅ Errores 400 (Bad Request)
- ✅ Errores 401 (Unauthorized)
- ✅ Errores 403 (Forbidden)
- ✅ Errores 404 (Not Found)
- ✅ Errores 422 (Validation Error)
- ✅ Errores 500 (Internal Server Error)

#### Funcionalidades Especiales:
- ✅ Paginación con parámetros customizables
- ✅ Filtros por múltiples campos
- ✅ Cache Redis con invalidación
- ✅ Soft delete de registros
- ✅ Upload y manejo de archivos
- ✅ Transiciones de estado
- ✅ Generación de números únicos

## 🔧 Configuración de Fixtures

### Fixtures Principales

```python
# Base de datos
@pytest.fixture
def db_session():  # Sesión de BD para cada test

@pytest.fixture  
def client():      # Cliente HTTP de FastAPI

# Usuarios
@pytest.fixture
def admin_user():     # Usuario administrador
def analista_user():  # Usuario analista  
def readonly_user():  # Usuario solo lectura

# Datos de prueba
@pytest.fixture
def sample_tramite_data():        # Datos de trámite válidos
def sample_solicitud_ppsh_data(): # Datos de solicitud PPSH válidos
def sample_pdf_file():            # Archivo PDF mock
```

### Mocks Configurados

- ✅ Mock de Redis (get, set, delete, keys)
- ✅ Mock de autenticación (`get_current_user`)
- ✅ Mock de sistema de archivos
- ✅ Mock de servicios externos

## 📈 Métricas y Performance

### Tests de Carga

Los tests incluyen funcionalidades para pruebas de carga:

```python
# Crear datos masivos para testing
def create_load_test_data(db_session, tramites_count=100, solicitudes_count=50)

# Medir tiempo de respuesta
def measure_response_time(client, method, url)
```

### Benchmarks Esperados

- Listado de trámites (50 items): < 100ms
- Crear solicitud PPSH: < 200ms  
- Upload de documento: < 500ms
- Estadísticas dashboard: < 150ms

## 🐛 Debugging Tests

### Tests que Fallan

```bash
# Ver output detallado de test que falla
pytest tests/test_file.py::test_name -v -s

# Usar debugger
pytest tests/test_file.py::test_name --pdb

# Solo re-ejecutar tests que fallaron
pytest --lf
```

### Logs Durante Tests

```python
# En el test, para debug:
import logging
logging.basicConfig(level=logging.DEBUG)

# O usar print statements (con -s)
print(f"Debug: {variable}")
```

### Verificar Estado de BD

```python
# En un test, verificar datos en BD:
def test_something(client, db_session):
    # ... test code ...
    
    # Debug: verificar estado
    tramites = db_session.query(Tramite).all()
    print(f"Trámites en BD: {len(tramites)}")
```

## 🎯 Mejores Prácticas

### Estructura de Tests

```python
def test_feature_should_behavior():
    # Arrange: Preparar datos
    data = {"field": "value"}
    
    # Act: Ejecutar acción
    response = client.post("/endpoint", json=data)
    
    # Assert: Verificar resultado
    assert response.status_code == 201
    assert response.json()["field"] == "value"
```

### Naming Conventions

- Tests: `test_feature_scenario()`
- Test classes: `TestFeatureEndpoints`
- Fixtures: `noun_fixture` (ej: `admin_user`)
- Factories: `ModelFactory` (ej: `TramiteFactory`)

### Test Data

- Usar factories para datos complejos
- Usar fixtures para datos reutilizables
- Datos específicos inline en tests
- Seeds fijos para reproducibilidad

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/tests.yml
- name: Run Tests
  run: |
    cd backend
    pip install -r tests/requirements.txt
    pytest tests/ --cov=app --cov-report=xml

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

### Pre-commit Hooks

```bash
# Ejecutar tests antes de commit
pytest tests/ --maxfail=1 -q
```

## 📚 Referencias

- [pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [SQLAlchemy Testing](https://docs.sqlalchemy.org/en/14/orm/session_transaction.html#joining-a-session-into-an-external-transaction-such-as-for-test-suites)
- [Factory Boy](https://factoryboy.readthedocs.io/)
- [Faker](https://faker.readthedocs.io/)

## 🆘 Troubleshooting

### Problemas Comunes

**Error: Import modules not found**
```bash
# Solución: Instalar dependencias
pip install -r tests/requirements.txt
```

**Error: Database connection**
```bash
# Solución: Verificar configuración en conftest.py
# Los tests usan SQLite en memoria por defecto
```

**Error: Redis connection**
```bash
# Solución: Tests usan mock Redis por defecto
# Verificar configuración en conftest.py
```

**Tests lentos**
```bash
# Solución: Ejecutar solo tests unitarios
pytest tests/test_*_unit.py -v
```

### Contacto

Para problemas con los tests:
1. Verificar este README
2. Revisar configuración en `conftest.py`
3. Consultar logs de error detallados
4. Contactar al equipo de desarrollo