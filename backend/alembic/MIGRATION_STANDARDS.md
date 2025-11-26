# 📋 Estándar de Migraciones y Datos

## 🎯 Principio General

**Separación de Responsabilidades:**
- **Migraciones (Alembic):** Cambios de estructura (DDL)
- **Scripts de Datos:** Inserción de datos (DML)

---

## 📐 Estándar de Migraciones

### Formato de Archivo

```
###_descripcion_corta.py
```

**Ejemplos:**
- ✅ `014_add_ppsh_etapa_solicitud.py`
- ✅ `015_ppsh_decreto6.py`
- ❌ `16c34c20acdb_actualizar_documentos.py` (hash autogenerado)

### Estructura de Migración

```python
"""Título corto de la migración

Descripción detallada de lo que hace la migración.
Puede incluir contexto de negocio.

Revision ID: ###_descripcion_corta
Revises: ###_migracion_anterior
Create Date: YYYY-MM-DD HH:MM:SS.mmmmmm

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '###_descripcion_corta'
down_revision = '###_migracion_anterior'
branch_labels = None
depends_on = None


def upgrade():
    """
    Descripción de los cambios que se aplicarán.
    """
    # Cambios DDL aquí
    op.create_table(...)
    op.add_column(...)
    # etc.


def downgrade():
    """
    Revierte los cambios de upgrade().
    """
    # Revertir en orden inverso
    op.drop_column(...)
    op.drop_table(...)
```

### ✅ Usar Migraciones Para:

1. **Crear tablas**
   ```python
   op.create_table('MI_TABLA',
       sa.Column('id', sa.Integer(), primary_key=True),
       sa.Column('nombre', sa.String(100))
   )
   ```

2. **Modificar columnas**
   ```python
   op.add_column('MI_TABLA', sa.Column('nueva_col', sa.String(50)))
   op.alter_column('MI_TABLA', 'col_existente', type_=sa.Integer())
   ```

3. **Crear índices**
   ```python
   op.create_index('idx_nombre', 'MI_TABLA', ['nombre'])
   ```

4. **Agregar constraints**
   ```python
   op.create_foreign_key('fk_usuario', 'TABLA', 'USUARIOS', ['user_id'], ['id'])
   ```

5. **Eliminar/renombrar objetos**
   ```python
   op.drop_table('TABLA_VIEJA')
   op.rename_table('TABLA_VIEJA', 'TABLA_NUEVA')
   ```

### ❌ NO Usar Migraciones Para:

1. ❌ Insertar usuarios de prueba
2. ❌ Poblar catálogos de testing
3. ❌ Datos de demostración
4. ❌ Configuraciones específicas de ambiente

---

## 📊 Scripts de Datos (Data Seeds)

### Ubicación

```
backend/sql/
├── seed_test_users.sql
├── seed_sim_ft_test_data.sql
└── seed_[modulo]_data.sql
```

### Formato de Script

```sql
/*
 * Script de Datos: [Nombre Módulo]
 * Propósito: [Descripción]
 * Autor: [Nombre]
 * Fecha: YYYY-MM-DD
 * 
 * IMPORTANTE: SOLO PARA DESARROLLO
 */

USE SIM_PANAMA;
GO

SET NOCOUNT ON;
GO

BEGIN TRY
    BEGIN TRANSACTION;
    
    PRINT '🔄 Iniciando carga de datos...';
    
    -- Validar existencia
    IF EXISTS (SELECT 1 FROM TABLA WHERE condicion)
    BEGIN
        PRINT '⚠️  Datos ya existen. Limpiando...';
        DELETE FROM TABLA WHERE condicion;
    END
    
    -- Insertar datos
    INSERT INTO TABLA (campos)
    VALUES (valores);
    
    COMMIT TRANSACTION;
    PRINT '✅ Datos cargados exitosamente';
    
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '❌ ERROR: ' + ERROR_MESSAGE();
    THROW;
END CATCH;
GO
```

### ✅ Usar Scripts de Datos Para:

1. **Usuarios de prueba**
   ```sql
   INSERT INTO SEG_TB_USUARIOS (...) VALUES (...)
   ```

2. **Catálogos de prueba**
   ```sql
   INSERT INTO CATALOGO_TIPOS (...) VALUES (...)
   ```

3. **Datos de demostración**
   ```sql
   INSERT INTO TRAMITES_DEMO (...) VALUES (...)
   ```

4. **Configuraciones de desarrollo**
   ```sql
   INSERT INTO CONFIGURACION (...) VALUES (...)
   ```

---

## ⚖️ Caso Especial: Catálogos Oficiales

### Problema: Migración 015

La migración `015_actualizar_documentos_ppsh_decreto_6.py` **incluye datos** (los 13 requisitos del Decreto N° 6).

### ❓ ¿Es correcto?

**Depende del contexto:**

#### ✅ Usar Migración SI:
- Son **datos de catálogo oficial** requeridos por el sistema
- Deben existir en **todos los ambientes** (dev, test, prod)
- Son **parte de la lógica de negocio**
- Su ausencia **rompe la funcionalidad**

**Ejemplo:** Los 13 tipos de documento PPSH según Decreto N° 6
```python
# ✅ CORRECTO: Datos de catálogo oficial en migración
def upgrade():
    requisitos = [
        (1, 'Poder y solicitud...', True, 'Documento oficial'),
        # ... 13 requisitos oficiales
    ]
    for orden, nombre, obligatorio, desc in requisitos:
        op.execute(f"INSERT INTO PPSH_TIPO_DOCUMENTO ...")
```

#### ❌ Usar Script SI:
- Son **datos de prueba/testing**
- Solo necesarios en **desarrollo**
- Son **ejemplos/demos**
- Pueden variar por ambiente

**Ejemplo:** Usuarios de prueba
```sql
-- ❌ INCORRECTO en migración
-- ✅ CORRECTO en script SQL
INSERT INTO SEG_TB_USUARIOS (user_id, password, rol)
VALUES ('test.user', 'hash', 'CONSULTA');
```

### Recomendación para Migración 015

**Opción A: Mantener en Migración (RECOMENDADO)**
```python
# Si los 13 documentos son oficiales y obligatorios
def upgrade():
    """Carga catálogo oficial de documentos PPSH según Decreto 6"""
    requisitos = [...]  # Datos oficiales
    for req in requisitos:
        op.execute(...)
```

**Opción B: Mover a Script**
```sql
-- Si pueden cambiar o son solo para desarrollo
-- Archivo: seed_ppsh_documentos_decreto6.sql
INSERT INTO PPSH_TIPO_DOCUMENTO (...)
VALUES (...);
```

---

## 🔄 Workflow Correcto

### 1. Crear Migración (Solo Estructura)

```bash
# Crear migración automática
alembic revision --autogenerate -m "add user profile fields"

# O crear manualmente
alembic revision -m "add user profile fields"
```

### 2. Editar Migración

```python
# Archivo: 016_add_user_profile_fields.py

def upgrade():
    """Agrega campos de perfil a usuarios"""
    op.add_column('SEG_TB_USUARIOS',
        sa.Column('telefono', sa.String(20), nullable=True)
    )
    op.add_column('SEG_TB_USUARIOS',
        sa.Column('cargo', sa.String(100), nullable=True)
    )

def downgrade():
    """Revierte cambios"""
    op.drop_column('SEG_TB_USUARIOS', 'cargo')
    op.drop_column('SEG_TB_USUARIOS', 'telefono')
```

### 3. Ejecutar Migración

```bash
# Aplicar migraciones
alembic upgrade head

# Verificar
alembic current
```

### 4. Poblar Datos (Si Necesario)

```bash
# Ejecutar script de datos
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Passw0rd' \
  -d SIM_PANAMA \
  -i /sql/seed_test_users.sql
```

---

## 📝 Checklist de Revisión

### Antes de Crear Migración:

- [ ] ¿Cambia la estructura de la BD? → **Migración**
- [ ] ¿Solo inserta datos? → Evaluar si es catálogo oficial
- [ ] ¿Datos de prueba? → **Script SQL**
- [ ] ¿Necesario en producción? → **Migración**
- [ ] ¿Solo para desarrollo? → **Script SQL**

### Antes de Commit:

- [ ] Nombre sigue formato `###_descripcion.py`
- [ ] Tiene docstring descriptivo
- [ ] `revision` y `down_revision` correctos
- [ ] Función `upgrade()` documentada
- [ ] Función `downgrade()` implementada
- [ ] Probado en ambiente local
- [ ] No incluye datos de prueba

---

## 🚨 Errores Comunes

### ❌ Error 1: Hash en nombre
```python
# MAL
revision = '16c34c20acdb'
# Archivo: 16c34c20acdb_descripcion.py

# BIEN
revision = '016_descripcion'
# Archivo: 016_descripcion.py
```

### ❌ Error 2: Datos de prueba en migración
```python
# MAL: Usuarios de prueba en migración
def upgrade():
    op.execute("INSERT INTO SEG_TB_USUARIOS VALUES ('test', ...)")

# BIEN: En script SQL separado
# Archivo: backend/sql/seed_test_users.sql
```

### ❌ Error 3: Sin downgrade
```python
# MAL: Sin implementar
def downgrade():
    pass

# BIEN: Revertir cambios
def downgrade():
    op.drop_column('tabla', 'columna')
```

### ❌ Error 4: Migraciones duplicadas
```bash
# MAL: Dos archivos para mismo cambio
015_actualizar_documentos.py
16c34c20acdb_actualizar_documentos.py

# BIEN: Un solo archivo
015_actualizar_documentos.py
```

---

## 📚 Referencias

- [Documentación Alembic](https://alembic.sqlalchemy.org/)
- [Guía de Data Seeds](../sql/DATA_SEED_README.md)
- [Usuarios de Prueba](../../USUARIOS_PRUEBA.md)

---

**Última actualización:** 2025-11-12  
**Próxima revisión:** Al agregar nuevas migraciones
