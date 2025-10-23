# 💾 Scripts SQL

Este directorio contiene scripts SQL para mantenimiento, correcciones y operaciones especiales en la base de datos.

## 📦 Scripts Disponibles

### 1. create_sim_ft_tables.sql
**Descripción:** Script para crear manualmente las tablas del sistema SIM_FT_*.

**Uso:** Utilizar solo si las migraciones de Alembic fallan o para crear tablas en ambiente sin Alembic.

**Incluye:**
- SIM_FT_TRAMITES - Catálogo de tipos de trámites
- SIM_FT_TRAMITE_E - Encabezado de trámites (transaccional)
- SIM_FT_TRAMITE_D - Detalle de pasos del flujo
- SIM_FT_PASOS - Definición de pasos por tipo de trámite
- SIM_FT_PASOXTRAM - Configuración de flujo de pasos
- SIM_FT_USUA_SEC - Asignación usuarios-secciones-agencias
- SIM_FT_ESTATUS - Catálogo de estados (10 registros)
- SIM_FT_CONCLUSION - Catálogo de conclusiones (10 registros)
- SIM_FT_PRIORIDAD - Catálogo de prioridades (4 registros)
- SIM_FT_TRAMITE_CIERRE - Cierre de trámites
- SIM_FT_DEPENDTE_CIERRE - Dependientes en cierre

**Ejecución:**
```bash
# Desde SQL Server Management Studio
# O desde línea de comandos:
sqlcmd -S localhost -U sa -P Panama2024! -d SIM_PANAMA -i sql/create_sim_ft_tables.sql
```

---

### 2. fix_sim_ft_tramites.sql
**Descripción:** Script de corrección para problemas específicos en tablas SIM_FT.

**Casos de uso:**
- Corregir datos inconsistentes
- Actualizar registros específicos
- Limpiar datos de prueba
- Resetear contadores

**Incluye:**
- Correcciones de integridad referencial
- Updates de datos específicos
- Limpieza de registros huérfanos

**Ejecución:**
```bash
sqlcmd -S localhost -U sa -P Panama2024! -d SIM_PANAMA -i sql/fix_sim_ft_tramites.sql
```

---

## 🚀 Cómo Usar

### Desde Docker (Recomendado)

```bash
# Ejecutar script en contenedor SQL Server
docker exec -i tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'Panama2024!' -d SIM_PANAMA -C \
  < sql/create_sim_ft_tables.sql
```

### Desde SQL Server Management Studio (SSMS)

1. Abrir SSMS
2. Conectar al servidor
3. Abrir el archivo `.sql`
4. Seleccionar la base de datos correcta
5. Ejecutar (F5)

### Desde línea de comandos (sqlcmd)

```bash
# Windows
sqlcmd -S localhost -U sa -P Panama2024! -d SIM_PANAMA -i sql\create_sim_ft_tables.sql

# Linux/WSL
sqlcmd -S localhost -U sa -P 'Panama2024!' -d SIM_PANAMA -i sql/create_sim_ft_tables.sql
```

### Desde Azure Data Studio

1. Abrir Azure Data Studio
2. Conectar a SQL Server
3. Abrir archivo `.sql`
4. Click en "Run"

---

## ⚠️ Precauciones

### Antes de Ejecutar

1. **Hacer backup de la base de datos:**
   ```sql
   BACKUP DATABASE SIM_PANAMA 
   TO DISK = 'C:\Backups\SIM_PANAMA_backup.bak'
   ```

2. **Verificar conexión:**
   ```bash
   sqlcmd -S localhost -U sa -P Panama2024! -Q "SELECT @@VERSION"
   ```

3. **Revisar el script:**
   - Leer el contenido completo
   - Verificar nombres de tablas
   - Confirmar operaciones

### Durante la Ejecución

- Ejecutar en horas de bajo tráfico
- Monitorear logs del servidor
- Tener plan de rollback preparado

### Después de Ejecutar

1. **Verificar resultados:**
   ```sql
   -- Verificar tablas creadas
   SELECT TABLE_NAME 
   FROM INFORMATION_SCHEMA.TABLES 
   WHERE TABLE_NAME LIKE 'SIM_FT_%'
   
   -- Contar registros
   SELECT COUNT(*) FROM SIM_FT_ESTATUS
   ```

2. **Ejecutar pruebas básicas:**
   ```bash
   python scripts/verify_sim_ft_created.py
   ```

---

## 📋 Convenciones

### Nomenclatura de Scripts

```
[accion]_[componente]_[descripcion].sql
```

**Ejemplos:**
- `create_sim_ft_tables.sql` - Crea tablas
- `fix_sim_ft_tramites.sql` - Corrige datos
- `update_ppsh_estados.sql` - Actualiza estados
- `migrate_data_v2_to_v3.sql` - Migra datos

### Estructura de Scripts

```sql
-- ==========================================
-- NOMBRE DEL SCRIPT
-- Descripción: Breve descripción
-- Autor: [Nombre]
-- Fecha: [YYYY-MM-DD]
-- ==========================================

-- Verificaciones previas
SELECT 'Verificando estado inicial...' AS [Status]

-- Operaciones principales
BEGIN TRANSACTION

-- [Operaciones SQL aquí]

-- Verificaciones post-ejecución
SELECT 'Verificando resultados...' AS [Status]

-- Confirmar o revertir
-- COMMIT TRANSACTION
-- ROLLBACK TRANSACTION
```

---

## 🔄 Relación con Alembic

### Cuándo Usar SQL Directamente

❌ **NO usar para:**
- Cambios de esquema en desarrollo
- Migraciones versionadas
- Cambios que deben ser reproducibles

✅ **SÍ usar para:**
- Correcciones de emergencia
- Scripts de mantenimiento
- Operaciones especiales
- Debugging en producción
- Ambientes sin Alembic

### Preferir Alembic Para

```bash
# Crear migración
alembic revision -m "agregar columna nueva"

# Aplicar migración
alembic upgrade head

# Revertir migración
alembic downgrade -1
```

---

## 📊 Scripts de Diagnóstico

### Verificar Tablas
```sql
-- Ver todas las tablas SIM_FT
SELECT TABLE_NAME, TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE 'SIM_FT_%'
ORDER BY TABLE_NAME

-- Contar registros por tabla
SELECT 
    'SIM_FT_ESTATUS' AS Tabla,
    COUNT(*) AS Registros
FROM SIM_FT_ESTATUS
UNION ALL
SELECT 'SIM_FT_CONCLUSION', COUNT(*) FROM SIM_FT_CONCLUSION
UNION ALL
SELECT 'SIM_FT_PRIORIDAD', COUNT(*) FROM SIM_FT_PRIORIDAD
```

### Verificar Integridad
```sql
-- Verificar claves foráneas
SELECT 
    fk.name AS FK_Name,
    tp.name AS Parent_Table,
    tr.name AS Referenced_Table
FROM sys.foreign_keys fk
INNER JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
INNER JOIN sys.tables tr ON fk.referenced_object_id = tr.object_id
WHERE tp.name LIKE 'SIM_FT_%'
```

---

## 📚 Documentación Relacionada

- **Migraciones Alembic:** `alembic/MIGRATION_CHAIN.md`
- **Reporte SIM_FT:** `docs/SIM_FT_MIGRACIONES_REPORTE.md`
- **Modelo de datos:** `app/models/models_sim_ft.py`
- **Scripts de verificación:** `scripts/verify_sim_ft.py`

---

**Última actualización:** 22 de Octubre de 2025
