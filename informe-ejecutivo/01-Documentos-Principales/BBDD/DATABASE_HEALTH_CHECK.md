# Sistema de Verificación de Salud de Base de Datos

## 📋 Resumen

Este documento explica el sistema de verificación de salud de la base de datos implementado para asegurar que las migraciones de Alembic solo se ejecuten cuando la base de datos esté completamente operativa.

## 🎯 Problema Resuelto

**Problema Anterior:**
- Timer fijo de 90 segundos antes de ejecutar migraciones
- Si la base de datos tardaba más, las migraciones fallaban
- Si tardaba menos, se desperdiciaba tiempo de espera
- No había verificación real del estado de la base de datos

**Solución Actual:**
- Verificación activa y dinámica de la base de datos
- Espera solo el tiempo necesario (más eficiente)
- Verifica no solo conectividad, sino también estado de las tablas
- Reintentos automáticos con feedback claro

## 🏗️ Arquitectura

### Flujo de Servicios Docker

```
┌─────────────────┐
│   SQL Server    │
│   (sqlserver)   │
└────────┬────────┘
         │ healthcheck: SELECT 1
         │ (verifica que SQL Server responda)
         ↓
┌─────────────────┐
│   DB Init       │
│   (db-init)     │ ← depends_on: sqlserver (service_healthy)
│                 │
│ • Crea DB       │
│ • Crea tablas   │
│ • Carga datos   │
└────────┬────────┘
         │ condition: service_completed_successfully
         │ (verifica que el proceso terminó con exit 0)
         ↓
┌─────────────────┐
│ DB Migrations   │
│ (db-migrations) │ ← depends_on: db-init (completed_successfully)
│                 │
│ 1. wait_for_db.py
│    ├─ Verifica conexión
│    ├─ Verifica DB existe
│    ├─ Verifica tablas
│    └─ Reintentos: 30
│                 │
│ 2. alembic upgrade head
│ 3. load_initial_data.py
└────────┬────────┘
         │ condition: service_completed_successfully
         ↓
┌─────────────────┐
│   Backend       │
│   (FastAPI)     │ ← depends_on: db-migrations (completed_successfully)
└─────────────────┘
```

## 🔧 Componentes

### 1. Script `wait_for_db.py`

**Ubicación:** `backend/wait_for_db.py`

**Funcionalidad:**
- Espera hasta que la base de datos esté completamente operativa
- Realiza múltiples verificaciones:
  - ✅ Conexión al servidor SQL Server
  - ✅ Base de datos `SIM_PANAMA` existe
  - ✅ Tablas base están creadas
  - ✅ Puede ejecutar queries

**Parámetros:**
- `max_attempts`: 30 intentos (configurable)
- `delay`: 3 segundos entre intentos
- **Tiempo máximo:** 90 segundos (30 × 3s)

**Ventajas sobre timer fijo:**
- Si la DB está lista en 10 segundos, continúa inmediatamente
- Si tarda más de 90 segundos, puede aumentarse `max_attempts`
- Feedback detallado en cada intento

### 2. Verificaciones Realizadas

#### Nivel 1: Conexión al Servidor
```python
conn = pyodbc.connect(connection_string, timeout=5)
cursor.execute("SELECT 1 as test")
```
**Verifica:** SQL Server está respondiendo

#### Nivel 2: Base de Datos Existe
```python
cursor.execute("SELECT DB_NAME()")
db_name = cursor.fetchone()[0]
assert db_name == "SIM_PANAMA"
```
**Verifica:** La base de datos específica fue creada

#### Nivel 3: Tablas Creadas
```python
cursor.execute("""
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_TYPE = 'BASE TABLE'
""")
table_count = cursor.fetchone()[0]
assert table_count > 0
```
**Verifica:** db-init completó la creación de tablas

#### Nivel 4: Tablas Base Específicas
```python
required_tables = [
    'SEG_TB_USUARIOS',
    'SIM_GE_PAIS',
    'SIM_GE_AGENCIA',
    'SIM_GE_TRAMITE',
    'SIM_GE_ESTADO'
]
```
**Verifica:** Las tablas críticas del sistema existen

## 📊 Ejemplo de Salida

### Caso Exitoso
```
======================================================================
🏥 VERIFICACIÓN DE SALUD DE BASE DE DATOS
======================================================================
🔍 Verificando disponibilidad de la base de datos SIM_PANAMA...
   Host: sqlserver:1433
   Intento 1/30... ⚠️  No se puede conectar al servidor
   Intento 2/30... ⚠️  No se puede conectar al servidor
   Intento 3/30... ⚠️  Base de datos aún no existe
   Intento 4/30... ⚠️  Base de datos existe pero sin tablas (db-init aún no completa)
   Intento 5/30... ✅ Base de datos lista (15 tablas encontradas)
✅ Base de datos SIM_PANAMA está completamente operativa

🔍 Verificando tablas base del sistema...
   ✅ SEG_TB_USUARIOS
   ✅ SIM_GE_PAIS
   ✅ SIM_GE_AGENCIA
   ✅ SIM_GE_TRAMITE
   ✅ SIM_GE_ESTADO
✅ Todas las tablas base verificadas correctamente

======================================================================
✅ VERIFICACIÓN COMPLETADA: Base de datos lista para migraciones
======================================================================
```

### Caso de Fallo
```
======================================================================
🏥 VERIFICACIÓN DE SALUD DE BASE DE DATOS
======================================================================
🔍 Verificando disponibilidad de la base de datos SIM_PANAMA...
   Host: sqlserver:1433
   Intento 1/30... ⚠️  No se puede conectar al servidor
   Intento 2/30... ⚠️  No se puede conectar al servidor
   ...
   Intento 30/30... ⚠️  No se puede conectar al servidor

❌ No se pudo verificar la base de datos después de 30 intentos

❌ FALLO: La base de datos no está disponible
```

## 🔄 Integración en Docker Compose

### Antes (Timer Fijo)
```yaml
command: >
  sh -c "
    echo '⏳ Esperando 90 segundos...' &&
    sleep 90 &&
    alembic upgrade head
  "
```
**Problema:** Espera innecesaria o insuficiente

### Después (Verificación Activa)
```yaml
command: >
  sh -c "
    echo '🏥 Verificando salud de la base de datos...' &&
    python /app/wait_for_db.py &&
    echo '✅ Base de datos confirmada como operativa' &&
    alembic upgrade head
  "
```
**Beneficio:** Espera dinámica solo hasta que esté realmente lista

## ⚙️ Configuración

### Ajustar Tiempo Máximo de Espera

Si necesitas más tiempo para entornos lentos:

**Opción 1: Modificar `wait_for_db.py`**
```python
if not wait_for_database(max_attempts=60, delay=5):  # 300 segundos = 5 minutos
```

**Opción 2: Variable de entorno**
```yaml
environment:
  - DB_WAIT_MAX_ATTEMPTS=60
  - DB_WAIT_DELAY=5
```

### Agregar Más Tablas a Verificar

En `wait_for_db.py`, función `verify_base_tables()`:
```python
required_tables = [
    'SEG_TB_USUARIOS',
    'SIM_GE_PAIS',
    'SIM_GE_AGENCIA',
    'SIM_GE_TRAMITE',
    'SIM_GE_ESTADO',
    'TU_NUEVA_TABLA',  # ← Agregar aquí
]
```

## 🐛 Troubleshooting

### Problema: "Base de datos aún no existe" (después de muchos intentos)

**Causa:** db-init puede haber fallado

**Solución:**
```bash
docker-compose logs db-init
```
Revisar errores en el script de inicialización

### Problema: "Base de datos existe pero sin tablas"

**Causa:** db-init se conectó pero no ejecutó los scripts SQL

**Solución:**
```bash
docker exec -it tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong@Passw0rd" -C \
  -Q "SELECT name FROM sys.databases"
```
Verificar si SIM_PANAMA existe

### Problema: "Tabla X no encontrada"

**Causa:** El script `init_database.sql` no creó esa tabla

**Solución:**
1. Verificar que la tabla esté en `backend/bbdd/init_database.sql`
2. Ejecutar: `docker-compose down -v && docker-compose up -d`

### Problema: Timeout después de 90 segundos

**Causa:** Servidor muy lento o recursos insuficientes

**Solución:**
```python
# En wait_for_db.py
if not wait_for_database(max_attempts=60, delay=5):  # Aumentar a 5 minutos
```

## 📈 Métricas de Rendimiento

| Escenario | Timer Fijo | Verificación Activa |
|-----------|-----------|---------------------|
| DB lista en 10s | Espera 90s | Continúa en 10s ✅ |
| DB lista en 60s | Espera 90s | Continúa en 60s ✅ |
| DB lista en 100s | ❌ Falla | Continúa en 100s ✅ |
| DB nunca lista | Espera 90s y falla | Falla después de 90s (configurable) |

## 🎯 Mejores Prácticas

### ✅ DO (Hacer)
- Usar `wait_for_db.py` antes de cualquier operación crítica de DB
- Aumentar `max_attempts` en entornos de producción con hardware lento
- Verificar logs si falla: `docker-compose logs db-migrations`
- Agregar tablas críticas a `required_tables`

### ❌ DON'T (No Hacer)
- No usar `sleep` fijos para esperar la base de datos
- No asumir que `depends_on: service_completed_successfully` garantiza que la DB esté lista para queries complejas
- No reducir `max_attempts` por debajo de 20 (puede causar falsos negativos)

## 🔗 Referencias

- **Script principal:** `backend/wait_for_db.py`
- **Configuración Docker:** `docker-compose.yml` (servicio `db-migrations`)
- **Documentación migraciones:** `MIGRATIONS_GUIDE.md`
- **Configuración Alembic:** `backend/alembic/env.py`

## 📝 Resumen

| Aspecto | Implementación |
|---------|----------------|
| **Método** | Verificación activa con reintentos |
| **Tiempo máximo** | 90 segundos (configurable) |
| **Intentos** | 30 (cada 3 segundos) |
| **Verificaciones** | Conexión + DB + Tablas + Queries |
| **Feedback** | Output detallado en cada intento |
| **Exit code** | 0 si éxito, 1 si fallo |
| **Impacto en startup** | Mínimo (solo el tiempo real necesario) |

---

**Última actualización:** 2025-10-13  
**Versión:** 1.0  
**Autor:** Sistema de Migraciones Trámites MVP Panamá
