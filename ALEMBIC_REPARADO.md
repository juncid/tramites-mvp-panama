# Reparación de Alembic - 17 de Noviembre 2025

## Problema Identificado

El sistema de migraciones Alembic tenía una **desincronización** entre:
- **Base de datos:** Versión `5e29a091bfb6` (hash antiguo de Alembic)
- **Archivos de migración:** Última versión `017_add_presencial_fields`
- **Estado real:** Las columnas `descripcion_presencial` y `documento_presencial` **ya existían** en `WORKFLOW_ETAPA` (agregadas manualmente)

## Causa Raíz

Durante la implementación de la etapa PRESENCIAL, se ejecutó SQL directo para agregar las columnas sin actualizar el registro de Alembic en la tabla `alembic_version`.

## Solución Aplicada

### 1. Diagnóstico

Creamos un script para verificar el estado:

```python
# verify_alembic.py
- Verificó que la tabla alembic_version existe
- Detectó versión obsoleta: 5e29a091bfb6
- Confirmó que las columnas PRESENCIAL ya existen
```

### 2. Reparación

Actualizamos el registro de Alembic **sin ejecutar migraciones**:

```python
# fix_alembic.py
UPDATE alembic_version SET version_num = '017_add_presencial_fields'
```

### 3. Verificación

```bash
$ docker-compose exec backend alembic current
017_add_presencial_fields (head) ✅

$ docker-compose exec backend alembic history
016_crear_sistema_acceso_publico -> 017_add_presencial_fields (head)
015_ppsh_decreto6 -> 016_crear_sistema_acceso_publico
...
```

### 4. Prueba de Nueva Migración

```bash
$ docker-compose exec backend alembic revision -m "test"
✅ Generó correctamente: 5c024bbccc92_test.py
✅ down_revision: '017_add_presencial_fields'
```

## Estado Final

✅ **Alembic completamente funcional**
✅ **Cadena de migraciones íntegra**
✅ **Listo para nuevas migraciones secuenciales**

## Cadena de Migraciones Actual

```
002_actualizar_tipos_documento_ppsh
  ↓
003_agregar_categoria_tipo_documento
  ↓
004_workflow_dinamico
  ↓
005_nomenclatura
  ↓
88ea061b1ac5 (migración antigua sin nombre descriptivo)
  ↓
007_corregir_modelos_ppsh
  ↓
008_schema_tramite
  ↓
009_workflow_schemas
  ↓
010_sincronizar_modelos_bd
  ↓
011_agregar_constraints_validacion
  ↓
012_add_ocr_tables
  ↓
013_ocr_endpoint_integration
  ↓
014_add_ppsh_etapa_solicitud
  ↓
015_ppsh_decreto6
  ↓
016_crear_sistema_acceso_publico
  ↓
017_add_presencial_fields (HEAD) ← Versión actual
```

## Uso para Futuras Migraciones

### Crear nueva migración con autogenerate:
```bash
docker-compose exec backend alembic revision --autogenerate -m "descripcion_cambio"
```

### Crear migración manual:
```bash
docker-compose exec backend alembic revision -m "descripcion_cambio"
```

### Aplicar migraciones pendientes:
```bash
docker-compose exec backend alembic upgrade head
```

### Ver estado actual:
```bash
docker-compose exec backend alembic current
docker-compose exec backend alembic history
```

## Prevención de Futuros Problemas

### ✅ Hacer:
1. Siempre crear migración Alembic para cambios de schema
2. Usar `alembic revision --autogenerate` cuando sea posible
3. Revisar el SQL generado antes de aplicar
4. Aplicar con `alembic upgrade head`
5. Verificar con `alembic current`

### ❌ Evitar:
1. Ejecutar SQL directo sin migración Alembic
2. Modificar migraciones ya aplicadas
3. Cambiar `revision` o `down_revision` manualmente
4. Eliminar archivos de migración aplicados

## Comandos de Emergencia

Si vuelve a ocurrir desincronización:

```bash
# 1. Ver versión en BD
docker-compose exec backend python -c "
from sqlalchemy import create_engine, text
from app.infrastructure.database import get_database_url
engine = create_engine(get_database_url())
with engine.connect() as conn:
    result = conn.execute(text('SELECT version_num FROM alembic_version'))
    print(result.fetchone()[0])
"

# 2. Actualizar a última versión (stamp)
docker-compose exec backend alembic stamp 017_add_presencial_fields

# 3. Verificar
docker-compose exec backend alembic current
```

## Archivos Involucrados

- ✅ `/backend/alembic/versions/017_add_presencial_fields.py` - Última migración
- ✅ `/backend/alembic/versions/016_crear_sistema_acceso_publico.py` - Migración anterior
- ✅ Base de datos: `alembic_version` actualizada correctamente
- ✅ Base de datos: `WORKFLOW_ETAPA.descripcion_presencial` existe
- ✅ Base de datos: `WORKFLOW_ETAPA.documento_presencial` existe

---

**Responsable:** Sistema automatizado de reparación
**Fecha:** 17 de Noviembre, 2025
**Duración:** ~5 minutos
**Resultado:** ✅ Exitoso - Sin pérdida de datos
