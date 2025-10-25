# 💾 Scripts de Datos de Prueba (Seed Data)# 💾 Scripts SQL



Este directorio contiene únicamente scripts SQL de **datos de prueba** (seed data) para validar las APIs del sistema.Este directorio contiene scripts SQL para mantenimiento, correcciones y operaciones especiales en la base de datos.



> **Nota:** Los scripts de estructura de base de datos (DDL) están en las migraciones de Alembic (`backend/alembic/versions/`)## 📦 Scripts Disponibles



## 📦 Scripts Disponibles### 1. create_sim_ft_tables.sql

**Descripción:** Script para crear manualmente las tablas del sistema SIM_FT_*.

### 1. **seed_sim_ft_test_data.sql**

Datos de prueba para el módulo SIM_FT (Sistema Integrado de Migración - Funcionalidades Transversales)**Uso:** Utilizar solo si las migraciones de Alembic fallan o para crear tablas en ambiente sin Alembic.



**Colección Postman:** `SIM_FT_Complete_API.postman_collection.json`**Incluye:**

- SIM_FT_TRAMITES - Catálogo de tipos de trámites

**Datos incluidos:**- SIM_FT_TRAMITE_E - Encabezado de trámites (transaccional)

- ✅ 1 tipo de trámite: **PERM_TEMP** (Permiso Temporal)- SIM_FT_TRAMITE_D - Detalle de pasos del flujo

- ✅ 6 pasos del proceso (workflow completo)- SIM_FT_PASOS - Definición de pasos por tipo de trámite

- ✅ 6 configuraciones de flujo (secuencia de pasos)- SIM_FT_PASOXTRAM - Configuración de flujo de pasos

- ✅ 7 asignaciones usuario-sección- SIM_FT_USUA_SEC - Asignación usuarios-secciones-agencias

- ✅ 3 trámites de ejemplo en diferentes estados- SIM_FT_ESTATUS - Catálogo de estados (10 registros)

- ✅ 12+ registros de historial de pasos- SIM_FT_CONCLUSION - Catálogo de conclusiones (10 registros)

- SIM_FT_PRIORIDAD - Catálogo de prioridades (4 registros)

**Casos de uso cubiertos:**- SIM_FT_TRAMITE_CIERRE - Cierre de trámites

- Consultar catálogos (pasos, flujo, tipos de trámite)- SIM_FT_DEPENDTE_CIERRE - Dependientes en cierre

- Listar trámites por tipo

- Ver detalle y historial de trámites**Ejecución:**

- Avanzar pasos del proceso```bash

- Cerrar/finalizar trámites# Desde SQL Server Management Studio

- Generar estadísticas (por tipo, estado, tiempo promedio)# O desde línea de comandos:

sqlcmd -S localhost -U sa -P Panama2024! -d SIM_PANAMA -i sql/create_sim_ft_tables.sql

---```



### 2. **update_sim_ft_test_data.sql**---

Actualización de datos SIM_FT para pruebas de estadísticas

### 2. fix_sim_ft_tramites.sql

**Propósito:** Agrega 3 trámites adicionales (5004, 5005, 5006) para mejorar la cobertura de estadísticas**Descripción:** Script de corrección para problemas específicos en tablas SIM_FT.



**Datos agregados:****Casos de uso:**

- 3 trámites adicionales en diferentes estados (01, 10, 10)- Corregir datos inconsistentes

- Diferentes prioridades (Baja, Alta, Media)- Actualizar registros específicos

- Diferentes conclusiones (Aprobado, Rechazado)- Limpiar datos de prueba

- Tiempo promedio de procesamiento: ~18 días- Resetear contadores



**Ejecutar después de:** `seed_sim_ft_test_data.sql`**Incluye:**

- Correcciones de integridad referencial

---- Updates de datos específicos

- Limpieza de registros huérfanos

### 3. **seed_tramites_base_test_data.sql**

Datos de prueba para la API de Trámites Base**Ejecución:**

```bash

**Colección Postman:** `Tramites_Base_API.postman_collection.json`sqlcmd -S localhost -U sa -P Panama2024! -d SIM_PANAMA -i sql/fix_sim_ft_tramites.sql

```

**Datos incluidos:**

- ✅ 40+ trámites migratorios de diferentes categorías:---

  - Visas (turista, negocios, estudiante, etc.)

  - Residencias (temporal, permanente)## 🚀 Cómo Usar

  - Permisos de trabajo

  - Trámites especiales (PPSH, naturalización, refugio)### Desde Docker (Recomendado)

  - Certificaciones administrativas

  - Casos especiales (inversionistas, pensionados, diplomáticos)```bash

- ✅ Trámites en diferentes estados (ACTIVO, EN_MANTENIMIENTO, SUSPENDIDO)# Ejecutar script en contenedor SQL Server

- ✅ Trámites activos e inactivos para probar soft deletedocker exec -i tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \

  -S localhost -U sa -P 'Panama2024!' -d SIM_PANAMA -C \

**Casos de uso cubiertos:**  < sql/create_sim_ft_tables.sql

- Listado con paginación```

- Filtrado por estado

- Búsqueda por ID### Desde SQL Server Management Studio (SSMS)

- Creación, actualización y eliminación (soft delete)

- Validaciones y manejo de errores1. Abrir SSMS

2. Conectar al servidor

---3. Abrir el archivo `.sql`

4. Seleccionar la base de datos correcta

### 4. **seed_workflow_test_data.sql**5. Ejecutar (F5)

Datos de prueba para el sistema de Workflow Dinámico

### Desde línea de comandos (sqlcmd)

**Colección Postman:** `Workflow_API_Tests.postman_collection.json`

```bash

**Datos incluidos:**# Windows

- ✅ 4 workflows completos:sqlcmd -S localhost -U sa -P Panama2024! -d SIM_PANAMA -i sql\create_sim_ft_tables.sql

  - **PPSH_COMPLETO**: Proceso completo con 6 etapas y múltiples preguntas

  - **VISA_TURISTA_SIMPLE**: Proceso simplificado de visa# Linux/WSL

  - **RESIDENCIA_TEMPORAL**: Solicitud de residenciasqlcmd -S localhost -U sa -P 'Panama2024!' -d SIM_PANAMA -i sql/create_sim_ft_tables.sql

  - **PROCESO_PRUEBA_BORRADOR**: Workflow en borrador para testing```

- ✅ Etapas con diferentes tipos (ETAPA, PRESENCIAL, COMPUERTA)

- ✅ Preguntas de diferentes tipos (texto, selección única/múltiple, fecha, archivo, número)### Desde Azure Data Studio

- ✅ Conexiones entre etapas (secuenciales y condicionales)

- ✅ Instancias de workflow en ejecución1. Abrir Azure Data Studio

- ✅ Respuestas de prueba y comentarios2. Conectar a SQL Server

3. Abrir archivo `.sql`

**Casos de uso cubiertos:**4. Click en "Run"

- Creación y gestión de workflows

- Configuración de etapas y preguntas---

- Definición de conexiones entre etapas

- Ejecución de instancias de workflow## ⚠️ Precauciones

- Avance entre etapas con validaciones

- Historial y auditoría### Antes de Ejecutar



---1. **Hacer backup de la base de datos:**

   ```sql

## 🚀 Cómo Ejecutar los Scripts   BACKUP DATABASE SIM_PANAMA 

   TO DISK = 'C:\Backups\SIM_PANAMA_backup.bak'

### Opción 1: Desde Docker (Recomendado)   ```



```powershell2. **Verificar conexión:**

# 1. Copiar script al contenedor   ```bash

docker cp backend/sql/seed_sim_ft_test_data.sql tramites-sqlserver:/var/opt/mssql/backup/   sqlcmd -S localhost -U sa -P Panama2024! -Q "SELECT @@VERSION"

   ```

# 2. Ejecutar script

docker exec -i tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd `3. **Revisar el script:**

    -S localhost -U sa -P 'YourStrong@Passw0rd' -C `   - Leer el contenido completo

    -i /var/opt/mssql/backup/seed_sim_ft_test_data.sql   - Verificar nombres de tablas

```   - Confirmar operaciones



### Opción 2: Desde SQL Server Management Studio (SSMS)### Durante la Ejecución



1. Abrir SSMS- Ejecutar en horas de bajo tráfico

2. Conectar al servidor- Monitorear logs del servidor

3. Abrir el archivo `.sql`- Tener plan de rollback preparado

4. Seleccionar base de datos `SIM_PANAMA`

5. Ejecutar (F5)### Después de Ejecutar



### Opción 3: Desde línea de comandos (sqlcmd)1. **Verificar resultados:**

   ```sql

```bash   -- Verificar tablas creadas

# Windows   SELECT TABLE_NAME 

sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -d SIM_PANAMA -i backend\sql\seed_sim_ft_test_data.sql   FROM INFORMATION_SCHEMA.TABLES 

   WHERE TABLE_NAME LIKE 'SIM_FT_%'

# Linux/WSL   

sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -d SIM_PANAMA -i backend/sql/seed_sim_ft_test_data.sql   -- Contar registros

```   SELECT COUNT(*) FROM SIM_FT_ESTATUS

   ```

---

2. **Ejecutar pruebas básicas:**

## 🎯 Orden de Ejecución Recomendado   ```bash

   python scripts/verify_sim_ft_created.py

Para cargar todos los datos de prueba:   ```



```powershell---

# 1. Datos base de trámites

docker cp backend/sql/seed_tramites_base_test_data.sql tramites-sqlserver:/var/opt/mssql/backup/## 📋 Convenciones

docker exec -i tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -C -i /var/opt/mssql/backup/seed_tramites_base_test_data.sql

### Nomenclatura de Scripts

# 2. Datos de workflow

docker cp backend/sql/seed_workflow_test_data.sql tramites-sqlserver:/var/opt/mssql/backup/```

docker exec -i tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -C -i /var/opt/mssql/backup/seed_workflow_test_data.sql[accion]_[componente]_[descripcion].sql

```

# 3. Datos SIM_FT iniciales

docker cp backend/sql/seed_sim_ft_test_data.sql tramites-sqlserver:/var/opt/mssql/backup/**Ejemplos:**

docker exec -i tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -C -i /var/opt/mssql/backup/seed_sim_ft_test_data.sql- `create_sim_ft_tables.sql` - Crea tablas

- `fix_sim_ft_tramites.sql` - Corrige datos

# 4. Datos SIM_FT adicionales (estadísticas)- `update_ppsh_estados.sql` - Actualiza estados

docker cp backend/sql/update_sim_ft_test_data.sql tramites-sqlserver:/var/opt/mssql/backup/- `migrate_data_v2_to_v3.sql` - Migra datos

docker exec -i tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -C -i /var/opt/mssql/backup/update_sim_ft_test_data.sql

```### Estructura de Scripts



---```sql

-- ==========================================

## 📊 Verificación de Datos-- NOMBRE DEL SCRIPT

-- Descripción: Breve descripción

Después de ejecutar los scripts, verificar que los datos se cargaron correctamente:-- Autor: [Nombre]

-- Fecha: [YYYY-MM-DD]

```sql-- ==========================================

-- Verificar datos SIM_FT

SELECT COUNT(*) AS total_tramites FROM SIM_FT_TRAMITE_E;-- Verificaciones previas

SELECT COUNT(*) AS pasos_definidos FROM SIM_FT_PASOS;SELECT 'Verificando estado inicial...' AS [Status]

SELECT COUNT(*) AS historial_pasos FROM SIM_FT_TRAMITE_D;

-- Operaciones principales

-- Verificar datos de WorkflowBEGIN TRANSACTION

SELECT COUNT(*) AS workflows FROM WORKFLOW;

SELECT COUNT(*) AS etapas FROM ETAPA;-- [Operaciones SQL aquí]

SELECT COUNT(*) AS instancias FROM INSTANCIA_WORKFLOW;

-- Verificaciones post-ejecución

-- Verificar datos baseSELECT 'Verificando resultados...' AS [Status]

SELECT COUNT(*) AS tramites_base FROM TRAMITES;

```-- Confirmar o revertir

-- COMMIT TRANSACTION

O desde la API:-- ROLLBACK TRANSACTION

```

```bash

# SIM_FT---

curl http://localhost:8000/api/v1/sim-ft/tramites

curl http://localhost:8000/api/v1/sim-ft/estadisticas/tramites-por-tipo## 🔄 Relación con Alembic



# Workflow### Cuándo Usar SQL Directamente

curl http://localhost:8000/api/v1/workflow/workflows

curl http://localhost:8000/api/v1/workflow/workflows/1/instancias❌ **NO usar para:**

- Cambios de esquema en desarrollo

# Trámites Base- Migraciones versionadas

curl http://localhost:8000/api/v1/tramites- Cambios que deben ser reproducibles

```

✅ **SÍ usar para:**

---- Correcciones de emergencia

- Scripts de mantenimiento

## ⚠️ Consideraciones Importantes- Operaciones especiales

- Debugging en producción

### Scripts Son Idempotentes- Ambientes sin Alembic

- Ejecutar múltiples veces no crea duplicados

- Los scripts verifican existencia antes de insertar### Preferir Alembic Para

- Usan números específicos para evitar conflictos (ej: 5001-5006 para SIM_FT)

```bash

### Datos de Prueba, NO Producción# Crear migración

- ⚠️ **NO ejecutar en producción**alembic revision -m "agregar columna nueva"

- Los datos son ficticios para testing

- Diseñados para validar funcionalidad, no para uso real# Aplicar migración

alembic upgrade head

### Respaldo Antes de Ejecutar

```sql# Revertir migración

-- Hacer backup antes de cargar datosalembic downgrade -1

BACKUP DATABASE SIM_PANAMA ```

TO DISK = '/var/opt/mssql/backup/SIM_PANAMA_backup.bak'

```---



---## 📊 Scripts de Diagnóstico



## 🔧 Limpiar Datos de Prueba### Verificar Tablas

```sql

Si necesitas eliminar los datos de prueba:-- Ver todas las tablas SIM_FT

SELECT TABLE_NAME, TABLE_TYPE

```sqlFROM INFORMATION_SCHEMA.TABLES

-- Limpiar datos SIM_FTWHERE TABLE_NAME LIKE 'SIM_FT_%'

DELETE FROM SIM_FT_TRAMITE_D WHERE NUM_TRAMITE BETWEEN 5001 AND 5006;ORDER BY TABLE_NAME

DELETE FROM SIM_FT_TRAMITE_E WHERE NUM_TRAMITE BETWEEN 5001 AND 5006;

DELETE FROM SIM_FT_PASOXTRAM WHERE COD_TRAMITE = 'PERM_TEMP';-- Contar registros por tabla

DELETE FROM SIM_FT_PASOS WHERE COD_TRAMITE = 'PERM_TEMP';SELECT 

DELETE FROM SIM_FT_TRAMITES WHERE COD_TRAMITE = 'PERM_TEMP';    'SIM_FT_ESTATUS' AS Tabla,

DELETE FROM SIM_FT_USUA_SEC WHERE ID_USUARIO = 'TEST_USER';    COUNT(*) AS Registros

FROM SIM_FT_ESTATUS

-- Limpiar datos de Workflow (ajustar IDs según tus datos)UNION ALL

DELETE FROM RESPUESTA WHERE instancia_id IN (SELECT id FROM INSTANCIA_WORKFLOW WHERE workflow_id BETWEEN 1 AND 4);SELECT 'SIM_FT_CONCLUSION', COUNT(*) FROM SIM_FT_CONCLUSION

DELETE FROM INSTANCIA_WORKFLOW WHERE workflow_id BETWEEN 1 AND 4;UNION ALL

DELETE FROM CONEXION WHERE workflow_id BETWEEN 1 AND 4;SELECT 'SIM_FT_PRIORIDAD', COUNT(*) FROM SIM_FT_PRIORIDAD

DELETE FROM PREGUNTA WHERE etapa_id IN (SELECT id FROM ETAPA WHERE workflow_id BETWEEN 1 AND 4);```

DELETE FROM ETAPA WHERE workflow_id BETWEEN 1 AND 4;

DELETE FROM WORKFLOW WHERE id BETWEEN 1 AND 4;### Verificar Integridad

``````sql

-- Verificar claves foráneas

---SELECT 

    fk.name AS FK_Name,

## 📚 Relación con Otros Componentes    tp.name AS Parent_Table,

    tr.name AS Referenced_Table

### Migraciones de AlembicFROM sys.foreign_keys fk

- **Estructura de BD:** `backend/alembic/versions/*.py`INNER JOIN sys.tables tp ON fk.parent_object_id = tp.object_id

- Los scripts de este directorio **solo insertan datos**, no crean tablasINNER JOIN sys.tables tr ON fk.referenced_object_id = tr.object_id

- Las tablas deben existir antes de ejecutar estos scriptsWHERE tp.name LIKE 'SIM_FT_%'

- Ejecutar `alembic upgrade head` antes de cargar datos de prueba```



### Colecciones Postman---

- **SIM_FT:** `backend/postman/SIM_FT_Complete_API.postman_collection.json`

- **Workflow:** `backend/postman/Workflow_API_Tests.postman_collection.json`## 📚 Documentación Relacionada

- **Trámites Base:** `backend/postman/Tramites_Base_API.postman_collection.json`

- Cada colección tiene sección de ejemplo end-to-end que usa estos datos- **Migraciones Alembic:** `alembic/MIGRATION_CHAIN.md`

- **Reporte SIM_FT:** `docs/SIM_FT_MIGRACIONES_REPORTE.md`

### Documentación- **Modelo de datos:** `app/models/models_sim_ft.py`

- **Guía de ejemplos Postman:** `backend/postman/README_EJEMPLOS_END_TO_END.md`- **Scripts de verificación:** `scripts/verify_sim_ft.py`

- **Manual técnico:** `docs/MANUAL_TECNICO.md`

- **Diccionario de datos:** `docs/DICCIONARIO_DATOS_COMPLETO.md`---



---**Última actualización:** 22 de Octubre de 2025


## ✅ Mejores Prácticas

1. ✅ Ejecutar migraciones de Alembic primero (`alembic upgrade head`)
2. ✅ Cargar datos en orden (base → workflow → SIM_FT)
3. ✅ Verificar datos después de cada carga
4. ✅ Usar variables de entorno para passwords (no hardcodear)
5. ✅ Documentar cualquier modificación a los scripts
6. ✅ Mantener sincronizados con las colecciones Postman

---

**Última actualización:** 25 de Octubre de 2025  
**Archivos:** 4 scripts seed
