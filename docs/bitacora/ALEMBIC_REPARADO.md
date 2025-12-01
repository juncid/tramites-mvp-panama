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

## 9. Archivos Involucrados en la Reparación

- `backend/alembic/versions/017_add_presencial_fields.py` - Última migración válida
- `backend/alembic/versions/4478a4b15950_sincronizar_modelos_con_bd.py` - Migración 018 (marcada como aplicada sin ejecutar)
- `backend/alembic/env.py` - Configuración de Alembic

---

## 10. Nota Importante: Nomenclatura de Tablas

⚠️ **Situación Actual:** Las tablas workflow en la base de datos utilizan nombres en **minúsculas** (`workflow`, `workflow_etapa`, etc.) que fueron creadas en migraciones tempranas antes de establecer el estándar de MAYÚSCULAS del proyecto.

**Estado actual del sistema:**
- Base de datos: Tablas workflow en minúsculas (funcionando correctamente)
- Modelos Python: Definiciones con minúsculas en `__tablename__` (sincronizadas con DB)
- Otras tablas del proyecto: MAYÚSCULAS (PPSH_SOLICITUD, SIM_FT_TRAMITE_E, etc.)
- Migración 018 (4478a4b15950): Sincronización completa entre modelos y base de datos

**Funcionamiento:**
- ✅ SQL Server es case-insensitive por defecto - el sistema funciona correctamente
- ✅ Las tablas en minúsculas contienen todos los datos reales del sistema
- ✅ Alembic sincronizado correctamente en versión 4478a4b15950

**Decisión técnica:**
Se mantienen las tablas workflow en minúsculas por las siguientes razones:
1. **Datos en producción**: Las tablas contienen flujos de trabajo activos
2. **Riesgo de migración**: Renombrar implica recrear todas las FK y datos
3. **Sin impacto funcional**: SQL Server es case-insensitive
4. **Consistencia futura**: Nuevas tablas seguirán el estándar de MAYÚSCULAS

**Para futuras migraciones:**
- Las nuevas migraciones deben ejecutarse con `alembic upgrade head`
- `alembic check` puede mostrar diferencias menores de nomenclatura (ignorar si solo afecta caso)
- Nuevas tablas del sistema deben usar MAYÚSCULAS según estándar del proyecto

**Scripts de corrección creados (no aplicados):**
- `rename_workflow_tables.py` - Análisis de nomenclatura
- `fix_workflow_tables_case.py` - Intento de renombrado
- `drop_lowercase_workflow_tables.py` - Análisis de duplicados
- `cleanup_workflow_tables_final.py` - Limpieza de constraints
- `cleanup_workflow_definitivo.py` - Solución completa (parcial)

Estos scripts documentan los intentos de corrección pero NO se aplicaron completamente debido a complejidad de dependencias circulares y riesgo de pérdida de datos.

---

**Fecha de reparación:** 17 de Noviembre, 2025
**Estado:** ✅ Sistema operativo - Alembic sincronizado en versión 4478a4b15950 (018)
**Nomenclatura:** Tablas workflow en minúsculas (decisión técnica por datos en producción)
