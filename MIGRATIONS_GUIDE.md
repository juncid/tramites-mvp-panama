# 🔄 Sistema de Migraciones de Base de Datos

## Descripción General

Este proyecto utiliza **Alembic** para gestionar las migraciones de base de datos de forma versionada y con registro completo de cambios.

## ¿Por qué Alembic?

### ✅ Ventajas

1. **Control de Versiones**: Cada cambio en la BD queda registrado en código
2. **Rollback**: Posibilidad de revertir cambios si algo sale mal
3. **Reproducibilidad**: Mismo esquema en dev, staging y producción
4. **Auditoría**: Historial completo de cuándo y qué cambió
5. **Colaboración**: Equipo trabaja con misma versión de BD
6. **Automatización**: Se aplica al iniciar el sistema via Docker

### ❌ Anti-patrones (Evitar)

- ❌ Ejecutar SQL directo en la BD
- ❌ Usar scripts Python sin control de versiones
- ❌ Modificar manualmente tablas en producción
- ❌ Copiar esquemas entre ambientes manualmente

---

## 📁 Estructura del Proyecto

```
backend/
├── alembic/                    # Directorio de Alembic
│   ├── versions/              # 📦 Migraciones versionadas
│   │   └── xxxx_initial_migration.py
│   ├── env.py                 # Configuración de entorno
│   ├── script.py.mako         # Template para nuevas migraciones
│   └── README
├── alembic.ini                # Configuración de Alembic
├── load_initial_data.py       # Carga de datos iniciales (catálogos)
├── create_migration.sh        # Script helper para crear migraciones
└── app/
    ├── models.py              # Modelos SQLAlchemy (trámites originales)
    ├── models_ppsh.py         # Modelos PPSH
    └── database.py            # Configuración de BD
```

---

## 🚀 Flujo de Trabajo

### 1. **Desarrollo Local: Crear Nueva Migración**

Cuando modificas o creas nuevos modelos en `models.py` o `models_ppsh.py`:

```bash
# Dentro del contenedor backend
docker exec -it tramites-backend bash

# Generar migración automática
alembic revision --autogenerate -m "Descripción del cambio"

# O usar el script helper
bash create_migration.sh "Agregar campo email a usuarios"
```

**Alembic generará automáticamente** un archivo en `alembic/versions/` con:
- Función `upgrade()`: Aplica los cambios
- Función `downgrade()`: Revierte los cambios

### 2. **Revisar la Migración Generada**

⚠️ **IMPORTANTE**: Siempre revisa el archivo generado antes de aplicarlo

```bash
# Ejemplo: alembic/versions/abc123_agregar_campo_email.py
cat alembic/versions/abc123_*.py
```

**Verificar:**
- ✅ Los cambios son los esperados
- ✅ No faltan índices importantes
- ✅ Las foreign keys están correctas
- ✅ Los defaults son apropiados

### 3. **Aplicar la Migración**

```bash
# Ver migraciones pendientes
alembic current
alembic history

# Aplicar migraciones
alembic upgrade head          # Aplicar todas las pendientes
alembic upgrade +1            # Aplicar solo la siguiente
alembic upgrade <revision>    # Aplicar hasta una específica
```

### 4. **Revertir si es Necesario**

```bash
# Ver historial
alembic history

# Revertir última migración
alembic downgrade -1

# Revertir a una versión específica
alembic downgrade <revision>

# Revertir todas
alembic downgrade base
```

---

## 🐳 Docker Compose Integration

### Flujo Automático al Iniciar

Cuando ejecutas `docker-compose up`, el sistema sigue este flujo:

```
1. sqlserver          → Inicia SQL Server
                        ↓ (healthcheck)
2. db-init           → Crea base de datos SIM_PANAMA
                        ↓ (completed)
3. db-migrations     → Aplica migraciones + datos iniciales
                        ↓ (completed)
4. backend           → Inicia API FastAPI
```

### Servicio de Migraciones

```yaml
db-migrations:
  # Ejecuta automáticamente:
  # 1. alembic upgrade head  → Aplica todas las migraciones
  # 2. load_initial_data.py  → Carga catálogos (causas, tipos doc, estados)
```

**Características:**
- ✅ Se ejecuta automáticamente al levantar el stack
- ✅ Solo corre una vez (`restart: no`)
- ✅ Backend espera a que termine antes de iniciar
- ✅ Idempotente: si ya está aplicada, no hace nada

---

## 📝 Comandos Útiles

### Ver Estado

```bash
# Estado actual de la BD
alembic current

# Historial de migraciones
alembic history --verbose

# Ver SQL que se ejecutaría (sin aplicar)
alembic upgrade head --sql
```

### Aplicar Migraciones

```bash
# Aplicar todas las pendientes
alembic upgrade head

# Aplicar solo una
alembic upgrade +1

# Aplicar hasta una versión específica
alembic upgrade abc123
```

### Revertir Migraciones

```bash
# Revertir última
alembic downgrade -1

# Revertir a base (vacía)
alembic downgrade base

# Revertir a versión específica
alembic downgrade abc123
```

### Crear Migraciones

```bash
# Autogenerar desde modelos
alembic revision --autogenerate -m "Mensaje descriptivo"

# Crear migración vacía (para SQL manual)
alembic revision -m "Mensaje"
```

---

## 📋 Ejemplo Completo: Agregar Nueva Tabla

### Paso 1: Crear Modelo en SQLAlchemy

```python
# backend/app/models_ppsh.py

class PPSHNuevoModelo(Base):
    __tablename__ = "PPSH_NUEVO_MODELO"
    
    id = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
```

### Paso 2: Generar Migración

```bash
docker exec -it tramites-backend bash
alembic revision --autogenerate -m "Agregar tabla PPSH_NUEVO_MODELO"
```

**Salida:**
```
INFO  [alembic.runtime.migration] Context impl MSSQLImpl.
INFO  [alembic.autogenerate.compare] Detected added table 'PPSH_NUEVO_MODELO'
  Generating /app/alembic/versions/2025

10131415_agregar_tabla_ppsh_nuevo_modelo.py ...  done
```

### Paso 3: Revisar Archivo Generado

```bash
cat alembic/versions/20251013*_agregar*.py
```

```python
def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('PPSH_NUEVO_MODELO',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('nombre', sa.String(length=100), nullable=False),
    sa.Column('activo', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_PPSH_NUEVO_MODELO_id'), 'PPSH_NUEVO_MODELO', ['id'], unique=False)
    # ### end Alembic commands ###

def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_PPSH_NUEVO_MODELO_id'), table_name='PPSH_NUEVO_MODELO')
    op.drop_table('PPSH_NUEVO_MODELO')
    # ### end Alembic commands ###
```

### Paso 4: Aplicar Migración

```bash
alembic upgrade head
```

**Salida:**
```
INFO  [alembic.runtime.migration] Context impl MSSQLImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade xxxx -> yyyy, Agregar tabla PPSH_NUEVO_MODELO
```

### Paso 5: Verificar en BD

```bash
docker exec tramites-backend python -c \
  "from app.database import engine; \
   from sqlalchemy import text; \
   with engine.connect() as c: \
     result = c.execute(text('SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PPSH_NUEVO_MODELO'')); \
     print(list(result))"
```

---

## 🔒 Mejores Prácticas

### ✅ DO (Hacer)

1. **Siempre usar migraciones** para cambios en BD
2. **Revisar migraciones autogeneradas** antes de aplicar
3. **Escribir mensajes descriptivos** en commits de migraciones
4. **Probar rollback** antes de aplicar en producción
5. **Mantener migraciones pequeñas** y atómicas
6. **Versionar archivos de migraciones** en Git

### ❌ DON'T (No hacer)

1. **No modificar migraciones ya aplicadas** en otros ambientes
2. **No ejecutar SQL directo** si puedes usar migración
3. **No borrar archivos de versiones** antiguas
4. **No commitear migraciones sin probarlas**
5. **No usar `--autogenerate` a ciegas** sin revisar
6. **No olvidar el `downgrade()`** por si necesitas revertir

---

## 🎯 Casos de Uso Comunes

### Agregar Columna

```python
# Modelo
class MiTabla(Base):
    # ... columnas existentes
    nuevo_campo = Column(String(50), nullable=True)
```

```bash
alembic revision --autogenerate -m "Agregar campo nuevo_campo a MiTabla"
alembic upgrade head
```

### Agregar Índice

```python
# Modelo
class MiTabla(Base):
    campo = Column(String(50), index=True)  # Agregar index=True
```

```bash
alembic revision --autogenerate -m "Agregar índice a campo"
alembic upgrade head
```

### Modificar Tipo de Columna

⚠️ Requiere intervención manual en la migración autogenerada

```python
def upgrade() -> None:
    # Cambiar VARCHAR(50) a VARCHAR(100)
    op.alter_column('mi_tabla', 'campo',
               existing_type=sa.String(length=50),
               type_=sa.String(length=100),
               existing_nullable=True)
```

### Eliminar Tabla

```python
# Eliminar o comentar modelo

alembic revision --autogenerate -m "Eliminar tabla obsoleta"
# Revisar que el downgrade() recree la tabla correctamente
alembic upgrade head
```

---

## 🐛 Troubleshooting

### Error: "Target database is not up to date"

```bash
# Ver qué migraciones faltan
alembic current
alembic history

# Aplicar pendientes
alembic upgrade head
```

### Error: "Can't locate revision identified by 'xxxx'"

```bash
# Verificar archivos en alembic/versions/
ls -la alembic/versions/

# Re-sincronizar con BD
alembic stamp head
```

### Base de datos corrupta o inconsistente

```bash
# Opción 1: Revertir a estado conocido
alembic downgrade <revision_buena>
alembic upgrade head

# Opción 2: Reset completo (⚠️ CUIDADO: Borra datos)
docker-compose down -v
docker-compose up -d
```

### Migración genera SQL incorrecto

1. Editar manualmente el archivo de migración
2. Ajustar las funciones `upgrade()` y `downgrade()`
3. Probar en ambiente de desarrollo
4. Aplicar con confianza

---

## 📚 Referencias

- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Database Migration Best Practices](https://www.prisma.io/dataguide/types/relational/migration-strategies)

---

## 🎓 Resumen para el Equipo

### Para Desarrolladores

```bash
# 1. Modificas modelos en app/models*.py
# 2. Generas migración
alembic revision --autogenerate -m "Tu mensaje"

# 3. Revisas el archivo generado
# 4. Aplicas localmente
alembic upgrade head

# 5. Commiteas los cambios (modelos + migración)
git add app/models*.py alembic/versions/*
git commit -m "feat: agregar nueva tabla X"
```

### Para DevOps/Deployment

```bash
# Las migraciones se aplican automáticamente via docker-compose
docker-compose up -d

# O manualmente si es necesario
docker exec tramites-backend alembic upgrade head
```

### Para Rollback de Emergencia

```bash
# Identificar versión buena
docker exec tramites-backend alembic history

# Revertir
docker exec tramites-backend alembic downgrade <revision>

# Reiniciar backend
docker-compose restart backend
```

---

**🎉 Con este sistema, todos los cambios en la base de datos están versionados, auditados y se pueden revertir!**
