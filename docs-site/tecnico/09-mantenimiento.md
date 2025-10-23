# 9. Mantenimiento

Procedimientos y scripts para mantenimiento regular del sistema, backups y optimización.

---

## 9.1 Mantenimiento Diario

### Script de Verificación Diaria

```bash
#!/bin/bash
# daily_check.sh - Verificaciones diarias automatizadas

LOG_FILE="/var/log/tramites/daily_check.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Iniciando verificaciones diarias" | tee -a $LOG_FILE

# 1. Verificar servicios Docker
echo "1. Verificando servicios..." | tee -a $LOG_FILE
SERVICES=("backend" "frontend" "sqlserver" "redis" "nginx")

for service in "${SERVICES[@]}"; do
    if docker ps | grep -q $service; then
        echo "  ✅ $service: Running" | tee -a $LOG_FILE
    else
        echo "  ❌ $service: Stopped" | tee -a $LOG_FILE
        # Intentar reiniciar
        docker restart $service
        sleep 5
        if docker ps | grep -q $service; then
            echo "  ✅ $service: Restarted successfully" | tee -a $LOG_FILE
        else
            echo "  ❌ $service: Failed to restart - ALERT!" | tee -a $LOG_FILE
            # Enviar alerta (implementar)
            # send_alert "Service $service failed to restart"
        fi
    fi
done

# 2. Verificar API Health
echo "2. Verificando API..." | tee -a $LOG_FILE
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)

if [ "$HEALTH_CHECK" -eq 200 ]; then
    echo "  ✅ API Health: OK" | tee -a $LOG_FILE
else
    echo "  ❌ API Health: Failed (HTTP $HEALTH_CHECK)" | tee -a $LOG_FILE
fi

# 3. Verificar espacio en disco
echo "3. Verificando espacio en disco..." | tee -a $LOG_FILE
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

if [ "$DISK_USAGE" -lt 80 ]; then
    echo "  ✅ Disco: ${DISK_USAGE}% usado" | tee -a $LOG_FILE
elif [ "$DISK_USAGE" -lt 90 ]; then
    echo "  ⚠️  Disco: ${DISK_USAGE}% usado (advertencia)" | tee -a $LOG_FILE
else
    echo "  ❌ Disco: ${DISK_USAGE}% usado (crítico)" | tee -a $LOG_FILE
    # Limpiar Docker
    docker system prune -f
fi

# 4. Verificar errores en logs (últimas 24h)
echo "4. Verificando errores en logs..." | tee -a $LOG_FILE
ERROR_COUNT=$(docker logs --since 24h backend 2>&1 | grep -i "error" | wc -l)

if [ "$ERROR_COUNT" -eq 0 ]; then
    echo "  ✅ Sin errores en logs" | tee -a $LOG_FILE
elif [ "$ERROR_COUNT" -lt 10 ]; then
    echo "  ⚠️  $ERROR_COUNT errores encontrados (revisar)" | tee -a $LOG_FILE
else
    echo "  ❌ $ERROR_COUNT errores encontrados (crítico)" | tee -a $LOG_FILE
fi

# 5. Verificar conexiones a base de datos
echo "5. Verificando conexiones DB..." | tee -a $LOG_FILE
DB_CONNECTIONS=$(docker exec sqlserver /opt/mssql-tools/bin/sqlcmd \
    -S localhost -U sa -P $SA_PASSWORD -h -1 \
    -Q "SELECT COUNT(*) FROM sys.dm_exec_sessions WHERE is_user_process = 1" 2>/dev/null)

if [ ! -z "$DB_CONNECTIONS" ]; then
    echo "  ✅ Conexiones activas: $DB_CONNECTIONS" | tee -a $LOG_FILE
else
    echo "  ❌ No se pudo verificar conexiones" | tee -a $LOG_FILE
fi

# 6. Verificar uso de Redis
echo "6. Verificando Redis..." | tee -a $LOG_FILE
REDIS_KEYS=$(docker exec redis redis-cli DBSIZE 2>/dev/null | awk '{print $2}')
REDIS_MEMORY=$(docker exec redis redis-cli INFO memory 2>/dev/null | grep used_memory_human | cut -d: -f2)

if [ ! -z "$REDIS_KEYS" ]; then
    echo "  ✅ Redis: $REDIS_KEYS keys, $REDIS_MEMORY usado" | tee -a $LOG_FILE
else
    echo "  ❌ Redis no responde" | tee -a $LOG_FILE
fi

echo "[$DATE] Verificaciones completadas" | tee -a $LOG_FILE
echo "----------------------------------------" | tee -a $LOG_FILE
```

### Rotación de Logs

```bash
#!/bin/bash
# rotate_logs.sh - Rotar logs antiguos

LOG_DIR="/var/log/tramites"
RETENTION_DAYS=30

echo "Rotando logs..."

# Comprimir logs de ayer
find $LOG_DIR -name "*.log" -type f -mtime 0 -exec gzip {} \;

# Eliminar logs antiguos
find $LOG_DIR -name "*.log.gz" -type f -mtime +$RETENTION_DAYS -delete

# Rotar logs de Docker (opcional)
docker logs backend > $LOG_DIR/backend-$(date +%Y%m%d).log 2>&1
docker logs frontend > $LOG_DIR/frontend-$(date +%Y%m%d).log 2>&1
docker logs nginx > $LOG_DIR/nginx-$(date +%Y%m%d).log 2>&1

echo "Logs rotados correctamente"
```

### Configuración en Crontab

```bash
# Agregar a crontab
crontab -e

# Verificación diaria a las 2 AM
0 2 * * * /opt/tramites/scripts/daily_check.sh

# Rotación de logs diaria a las 3 AM
0 3 * * * /opt/tramites/scripts/rotate_logs.sh

# Backup diario a las 4 AM
0 4 * * * /opt/tramites/scripts/backup_database.sh
```

---

## 9.2 Mantenimiento Semanal

### Script SQL de Mantenimiento

```sql
-- weekly_maintenance.sql
-- Ejecutar cada domingo a las 2 AM

USE TramitesDB;
GO

PRINT '=== Mantenimiento Semanal Iniciado ===';
PRINT 'Fecha: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '';

-- 1. Actualizar estadísticas
PRINT '1. Actualizando estadísticas...';
UPDATE STATISTICS Tramites WITH FULLSCAN;
UPDATE STATISTICS TiposTramite WITH FULLSCAN;
UPDATE STATISTICS Documentos WITH FULLSCAN;
UPDATE STATISTICS WorkflowTramite WITH FULLSCAN;
UPDATE STATISTICS PPSH WITH FULLSCAN;
PRINT '   ✅ Estadísticas actualizadas';
PRINT '';

-- 2. Verificar integridad de la base de datos
PRINT '2. Verificando integridad...';
DBCC CHECKDB (TramitesDB) WITH NO_INFOMSGS;
PRINT '   ✅ Integridad verificada';
PRINT '';

-- 3. Reorganizar índices con fragmentación < 30%
PRINT '3. Reorganizando índices...';
DECLARE @TableName VARCHAR(255);
DECLARE @IndexName VARCHAR(255);
DECLARE @SQL NVARCHAR(MAX);

DECLARE index_cursor CURSOR FOR
SELECT 
    OBJECT_NAME(ps.OBJECT_ID) AS TableName,
    i.name AS IndexName
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') ps
INNER JOIN sys.indexes i ON ps.OBJECT_ID = i.OBJECT_ID AND ps.index_id = i.index_id
WHERE ps.avg_fragmentation_in_percent BETWEEN 10 AND 30
  AND ps.page_count > 1000;

OPEN index_cursor;
FETCH NEXT FROM index_cursor INTO @TableName, @IndexName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @SQL = 'ALTER INDEX ' + @IndexName + ' ON ' + @TableName + ' REORGANIZE;';
    PRINT '   Reorganizando: ' + @TableName + '.' + @IndexName;
    EXEC sp_executesql @SQL;
    
    FETCH NEXT FROM index_cursor INTO @TableName, @IndexName;
END;

CLOSE index_cursor;
DEALLOCATE index_cursor;
PRINT '   ✅ Índices reorganizados';
PRINT '';

-- 4. Reconstruir índices muy fragmentados (> 30%)
PRINT '4. Reconstruyendo índices fragmentados...';

DECLARE rebuild_cursor CURSOR FOR
SELECT 
    OBJECT_NAME(ps.OBJECT_ID) AS TableName,
    i.name AS IndexName
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') ps
INNER JOIN sys.indexes i ON ps.OBJECT_ID = i.OBJECT_ID AND ps.index_id = i.index_id
WHERE ps.avg_fragmentation_in_percent > 30
  AND ps.page_count > 1000;

OPEN rebuild_cursor;
FETCH NEXT FROM rebuild_cursor INTO @TableName, @IndexName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @SQL = 'ALTER INDEX ' + @IndexName + ' ON ' + @TableName + ' REBUILD;';
    PRINT '   Reconstruyendo: ' + @TableName + '.' + @IndexName;
    EXEC sp_executesql @SQL;
    
    FETCH NEXT FROM rebuild_cursor INTO @TableName, @IndexName;
END;

CLOSE rebuild_cursor;
DEALLOCATE rebuild_cursor;
PRINT '   ✅ Índices reconstruidos';
PRINT '';

-- 5. Limpiar registros antiguos (soft-deleted hace más de 1 año)
PRINT '5. Limpiando registros antiguos...';
DECLARE @DeletedCount INT;

DELETE FROM Tramites 
WHERE Activo = 0 
  AND FechaEliminacion < DATEADD(YEAR, -1, GETDATE());
SET @DeletedCount = @@ROWCOUNT;
PRINT '   Eliminados: ' + CAST(@DeletedCount AS VARCHAR) + ' trámites antiguos';

DELETE FROM Documentos 
WHERE Activo = 0 
  AND FechaEliminacion < DATEADD(YEAR, -1, GETDATE());
SET @DeletedCount = @@ROWCOUNT;
PRINT '   Eliminados: ' + CAST(@DeletedCount AS VARCHAR) + ' documentos antiguos';
PRINT '   ✅ Limpieza completada';
PRINT '';

-- 6. Verificar tamaño de la base de datos
PRINT '6. Tamaño de base de datos:';
SELECT 
    name AS FileName,
    size * 8 / 1024 AS SizeMB,
    CAST(FILEPROPERTY(name, 'SpaceUsed') AS INT) * 8 / 1024 AS UsedMB,
    size * 8 / 1024 - CAST(FILEPROPERTY(name, 'SpaceUsed') AS INT) * 8 / 1024 AS FreeMB
FROM sys.database_files;
PRINT '';

-- 7. Top 10 tablas más grandes
PRINT '7. Top 10 tablas más grandes:';
SELECT TOP 10
    t.NAME AS TableName,
    p.rows AS RowCounts,
    SUM(a.total_pages) * 8 / 1024 AS TotalSpaceMB
FROM sys.tables t
INNER JOIN sys.indexes i ON t.OBJECT_ID = i.object_id
INNER JOIN sys.partitions p ON i.object_id = p.OBJECT_ID AND i.index_id = p.index_id
INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
WHERE t.is_ms_shipped = 0
GROUP BY t.Name, p.Rows
ORDER BY TotalSpaceMB DESC;
PRINT '';

-- 8. Índices no utilizados (candidatos a eliminar)
PRINT '8. Índices no utilizados (últimos 30 días):';
SELECT 
    OBJECT_NAME(s.object_id) AS TableName,
    i.name AS IndexName,
    s.user_seeks,
    s.user_scans,
    s.user_lookups,
    s.user_updates
FROM sys.dm_db_index_usage_stats s
INNER JOIN sys.indexes i ON s.object_id = i.object_id AND s.index_id = i.index_id
WHERE s.database_id = DB_ID()
  AND OBJECTPROPERTY(s.object_id, 'IsUserTable') = 1
  AND s.user_seeks = 0
  AND s.user_scans = 0
  AND s.user_lookups = 0
  AND i.name IS NOT NULL;
PRINT '';

PRINT '=== Mantenimiento Semanal Completado ===';
PRINT 'Fecha: ' + CONVERT(VARCHAR, GETDATE(), 120);
GO
```

### Script Bash para Mantenimiento

```bash
#!/bin/bash
# weekly_maintenance.sh - Mantenimiento semanal completo

LOG_FILE="/var/log/tramites/weekly_maintenance.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] === MANTENIMIENTO SEMANAL ===" | tee -a $LOG_FILE

# 1. Ejecutar mantenimiento SQL
echo "1. Ejecutando mantenimiento de base de datos..." | tee -a $LOG_FILE
docker exec sqlserver /opt/mssql-tools/bin/sqlcmd \
    -S localhost -U sa -P $SA_PASSWORD \
    -i /scripts/weekly_maintenance.sql \
    | tee -a $LOG_FILE

# 2. Limpiar imágenes Docker antiguas
echo "2. Limpiando imágenes Docker..." | tee -a $LOG_FILE
BEFORE_SIZE=$(docker system df | grep "Images" | awk '{print $4}')
docker image prune -a -f --filter "until=168h" # 7 días
AFTER_SIZE=$(docker system df | grep "Images" | awk '{print $4}')
echo "   Antes: $BEFORE_SIZE, Después: $AFTER_SIZE" | tee -a $LOG_FILE

# 3. Limpiar volumes huérfanos
echo "3. Limpiando volumes huérfanos..." | tee -a $LOG_FILE
docker volume prune -f | tee -a $LOG_FILE

# 4. Backup completo
echo "4. Realizando backup..." | tee -a $LOG_FILE
/opt/tramites/scripts/backup_database.sh | tee -a $LOG_FILE

# 5. Verificar y aplicar actualizaciones de seguridad
echo "5. Verificando actualizaciones de seguridad..." | tee -a $LOG_FILE
apt-get update -qq
SECURITY_UPDATES=$(apt-get upgrade -s | grep -i security | wc -l)
if [ "$SECURITY_UPDATES" -gt 0 ]; then
    echo "   Aplicando $SECURITY_UPDATES actualizaciones de seguridad..." | tee -a $LOG_FILE
    apt-get upgrade -y -qq
fi

echo "[$DATE] === MANTENIMIENTO COMPLETADO ===" | tee -a $LOG_FILE
```

---

## 9.3 Backup y Restore

### Script de Backup Completo

```bash
#!/bin/bash
# backup_database.sh - Backup completo del sistema

BACKUP_DIR="/backups/tramites"
DATE=$(date '+%Y%m%d_%H%M%S')
BACKUP_NAME="tramites_backup_${DATE}"
RETENTION_DAYS=30

echo "Iniciando backup: $BACKUP_NAME"

# Crear directorio si no existe
mkdir -p $BACKUP_DIR/$BACKUP_NAME

# 1. Backup de base de datos
echo "1. Backup de base de datos..."
docker exec sqlserver /opt/mssql-tools/bin/sqlcmd \
    -S localhost -U sa -P $SA_PASSWORD \
    -Q "BACKUP DATABASE TramitesDB TO DISK = '/var/opt/mssql/backup/tramites_${DATE}.bak' WITH COMPRESSION, STATS = 10"

# Copiar backup fuera del container
docker cp sqlserver:/var/opt/mssql/backup/tramites_${DATE}.bak $BACKUP_DIR/$BACKUP_NAME/

# 2. Backup de archivos subidos
echo "2. Backup de archivos..."
tar -czf $BACKUP_DIR/$BACKUP_NAME/uploads.tar.gz /opt/tramites/uploads

# 3. Backup de configuración
echo "3. Backup de configuración..."
cp /opt/tramites/.env $BACKUP_DIR/$BACKUP_NAME/
cp /opt/tramites/docker-compose.yml $BACKUP_DIR/$BACKUP_NAME/
cp -r /opt/tramites/nginx $BACKUP_DIR/$BACKUP_NAME/

# 4. Crear archivo de metadata
echo "4. Creando metadata..."
cat > $BACKUP_DIR/$BACKUP_NAME/backup_info.txt <<EOF
Backup Date: $DATE
Database Size: $(du -sh $BACKUP_DIR/$BACKUP_NAME/tramites_${DATE}.bak | cut -f1)
Uploads Size: $(du -sh $BACKUP_DIR/$BACKUP_NAME/uploads.tar.gz | cut -f1)
Docker Version: $(docker --version)
Git Commit: $(cd /opt/tramites && git rev-parse HEAD)
EOF

# 5. Comprimir todo
echo "5. Comprimiendo backup..."
tar -czf $BACKUP_DIR/${BACKUP_NAME}.tar.gz -C $BACKUP_DIR $BACKUP_NAME
rm -rf $BACKUP_DIR/$BACKUP_NAME

# 6. Verificar integridad
echo "6. Verificando integridad..."
tar -tzf $BACKUP_DIR/${BACKUP_NAME}.tar.gz > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backup completado: ${BACKUP_NAME}.tar.gz"
else
    echo "❌ Error en backup"
    exit 1
fi

# 7. Eliminar backups antiguos
echo "7. Eliminando backups antiguos (> $RETENTION_DAYS días)..."
find $BACKUP_DIR -name "tramites_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

# 8. Subir a almacenamiento remoto (opcional)
# aws s3 cp $BACKUP_DIR/${BACKUP_NAME}.tar.gz s3://backups-tramites/

echo "Backup completado exitosamente"
```

### Script de Restore

```bash
#!/bin/bash
# restore_database.sh - Restaurar desde backup

if [ -z "$1" ]; then
    echo "Uso: $0 <archivo_backup.tar.gz>"
    exit 1
fi

BACKUP_FILE=$1
RESTORE_DIR="/tmp/restore_tramites"

echo "⚠️  ADVERTENCIA: Esta operación sobrescribirá los datos actuales"
read -p "¿Continuar? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelado"
    exit 0
fi

# 1. Detener backend
echo "1. Deteniendo backend..."
docker-compose stop backend

# 2. Extraer backup
echo "2. Extrayendo backup..."
mkdir -p $RESTORE_DIR
tar -xzf $BACKUP_FILE -C $RESTORE_DIR

BACKUP_NAME=$(basename $BACKUP_FILE .tar.gz)

# 3. Copiar backup al container SQL
echo "3. Copiando backup a SQL Server..."
docker cp $RESTORE_DIR/$BACKUP_NAME/tramites_*.bak sqlserver:/var/opt/mssql/backup/restore.bak

# 4. Restaurar base de datos
echo "4. Restaurando base de datos..."
docker exec sqlserver /opt/mssql-tools/bin/sqlcmd \
    -S localhost -U sa -P $SA_PASSWORD \
    -Q "ALTER DATABASE TramitesDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE; 
        RESTORE DATABASE TramitesDB FROM DISK = '/var/opt/mssql/backup/restore.bak' WITH REPLACE;
        ALTER DATABASE TramitesDB SET MULTI_USER;"

# 5. Restaurar archivos
echo "5. Restaurando archivos..."
tar -xzf $RESTORE_DIR/$BACKUP_NAME/uploads.tar.gz -C /opt/tramites/

# 6. Restaurar configuración
echo "6. Restaurando configuración..."
cp $RESTORE_DIR/$BACKUP_NAME/.env /opt/tramites/
cp $RESTORE_DIR/$BACKUP_NAME/docker-compose.yml /opt/tramites/
cp -r $RESTORE_DIR/$BACKUP_NAME/nginx /opt/tramites/

# 7. Reiniciar servicios
echo "7. Reiniciando servicios..."
docker-compose up -d

# 8. Limpiar
rm -rf $RESTORE_DIR

echo "✅ Restore completado exitosamente"
```

---

## 9.4 Actualización del Sistema

### Script de Update

```bash
#!/bin/bash
# update_system.sh - Actualizar sistema a nueva versión

LOG_FILE="/var/log/tramites/update.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] === ACTUALIZACIÓN DEL SISTEMA ===" | tee -a $LOG_FILE

# 1. Backup preventivo
echo "1. Realizando backup preventivo..." | tee -a $LOG_FILE
/opt/tramites/scripts/backup_database.sh | tee -a $LOG_FILE

# 2. Pull de cambios
echo "2. Descargando nueva versión..." | tee -a $LOG_FILE
cd /opt/tramites
git fetch origin
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
git pull origin $CURRENT_BRANCH | tee -a $LOG_FILE

# 3. Verificar si hay migraciones pendientes
echo "3. Verificando migraciones..." | tee -a $LOG_FILE
docker exec backend alembic current | tee -a $LOG_FILE

PENDING_MIGRATIONS=$(docker exec backend alembic history | grep "(head)" | wc -l)
if [ "$PENDING_MIGRATIONS" -gt 0 ]; then
    echo "   Hay migraciones pendientes, aplicando..." | tee -a $LOG_FILE
    docker exec backend alembic upgrade head | tee -a $LOG_FILE
else
    echo "   No hay migraciones pendientes" | tee -a $LOG_FILE
fi

# 4. Reconstruir imágenes
echo "4. Reconstruyendo imágenes Docker..." | tee -a $LOG_FILE
docker-compose build --no-cache | tee -a $LOG_FILE

# 5. Usar Blue-Green deployment si está disponible
if [ -f "docker-compose.green-blue.yml" ]; then
    echo "5. Usando Blue-Green deployment..." | tee -a $LOG_FILE
    /opt/tramites/scripts/switchover.sh | tee -a $LOG_FILE
else
    echo "5. Deployment tradicional..." | tee -a $LOG_FILE
    docker-compose down
    docker-compose up -d | tee -a $LOG_FILE
fi

# 6. Health check
echo "6. Verificando salud del sistema..." | tee -a $LOG_FILE
sleep 10
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)

if [ "$HEALTH_STATUS" -eq 200 ]; then
    echo "   ✅ Sistema funcionando correctamente" | tee -a $LOG_FILE
else
    echo "   ❌ Sistema no responde, iniciando rollback..." | tee -a $LOG_FILE
    /opt/tramites/scripts/rollback.sh | tee -a $LOG_FILE
    exit 1
fi

# 7. Monitoreo post-deployment
echo "7. Monitoreando por 5 minutos..." | tee -a $LOG_FILE
for i in {1..10}; do
    sleep 30
    ERROR_COUNT=$(docker logs --since 30s backend 2>&1 | grep -i "error" | wc -l)
    if [ "$ERROR_COUNT" -gt 5 ]; then
        echo "   ❌ Muchos errores detectados, rollback..." | tee -a $LOG_FILE
        /opt/tramites/scripts/rollback.sh | tee -a $LOG_FILE
        exit 1
    fi
    echo "   Check $i/10: $ERROR_COUNT errores" | tee -a $LOG_FILE
done

echo "[$DATE] === ACTUALIZACIÓN COMPLETADA ===" | tee -a $LOG_FILE
```

### Script de Rollback

```bash
#!/bin/bash
# rollback.sh - Revertir a versión anterior

echo "⚠️  Iniciando ROLLBACK..."

# 1. Volver a commit anterior
cd /opt/tramites
PREVIOUS_COMMIT=$(git rev-parse HEAD~1)
git reset --hard $PREVIOUS_COMMIT

# 2. Reconstruir con versión anterior
docker-compose build --no-cache

# 3. Reiniciar servicios
docker-compose down
docker-compose up -d

# 4. Verificar
sleep 10
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)

if [ "$HEALTH_STATUS" -eq 200 ]; then
    echo "✅ Rollback exitoso"
else
    echo "❌ Rollback falló - revisar manualmente"
    exit 1
fi
```

---

## 9.5 Optimización de Performance

### Análisis de Performance

```sql
-- analyze_performance.sql

USE TramitesDB;
GO

-- 1. Top 20 queries más lentas
PRINT '1. Queries más lentas (últimas 24h):';
SELECT TOP 20
    SUBSTRING(qt.TEXT, (qs.statement_start_offset/2)+1,
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(qt.TEXT)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2)+1) AS query_text,
    qs.execution_count,
    qs.total_elapsed_time / 1000000.0 AS total_elapsed_time_sec,
    qs.total_worker_time / 1000000.0 AS total_cpu_time_sec,
    qs.total_logical_reads,
    qs.total_logical_writes,
    qs.creation_time,
    qs.last_execution_time
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
WHERE qs.last_execution_time > DATEADD(HOUR, -24, GETDATE())
ORDER BY qs.total_elapsed_time DESC;

-- 2. Índices faltantes sugeridos por SQL Server
PRINT '2. Índices faltantes sugeridos:';
SELECT 
    'CREATE INDEX IX_' + 
    OBJECT_NAME(mid.object_id) + '_' + 
    REPLACE(REPLACE(ISNULL(mid.equality_columns, ''), ', ', '_'), '[', '') AS index_name,
    'ON ' + OBJECT_NAME(mid.object_id) + 
    ' (' + ISNULL(mid.equality_columns, '') + 
    CASE WHEN mid.inequality_columns IS NOT NULL 
         THEN ', ' + mid.inequality_columns 
         ELSE '' 
    END + ')' AS create_statement,
    migs.avg_user_impact,
    migs.user_seeks,
    migs.user_scans
FROM sys.dm_db_missing_index_groups mig
INNER JOIN sys.dm_db_missing_index_group_stats migs 
    ON migs.group_handle = mig.index_group_handle
INNER JOIN sys.dm_db_missing_index_details mid 
    ON mig.index_handle = mid.index_handle
WHERE migs.avg_user_impact > 50
  AND migs.user_seeks + migs.user_scans > 100
ORDER BY migs.avg_user_impact DESC;

-- 3. Índices no utilizados (candidatos a eliminar)
PRINT '3. Índices no utilizados:';
SELECT 
    OBJECT_NAME(s.object_id) AS TableName,
    i.name AS IndexName,
    i.type_desc,
    s.user_seeks,
    s.user_scans,
    s.user_lookups,
    s.user_updates,
    (SELECT SUM(total_pages) * 8 / 1024 
     FROM sys.allocation_units a
     WHERE a.container_id = p.partition_id) AS SizeMB
FROM sys.dm_db_index_usage_stats s
INNER JOIN sys.indexes i ON s.object_id = i.object_id AND s.index_id = i.index_id
INNER JOIN sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
WHERE s.database_id = DB_ID()
  AND OBJECTPROPERTY(s.object_id, 'IsUserTable') = 1
  AND s.user_seeks = 0
  AND s.user_scans = 0
  AND s.user_lookups = 0
  AND s.user_updates > 0
  AND i.name IS NOT NULL
ORDER BY s.user_updates DESC;

-- 4. Wait statistics
PRINT '4. Wait Statistics:';
SELECT TOP 10
    wait_type,
    wait_time_ms / 1000.0 AS wait_time_sec,
    (wait_time_ms / SUM(wait_time_ms) OVER()) * 100 AS percentage,
    waiting_tasks_count
FROM sys.dm_os_wait_stats
WHERE wait_type NOT IN (
    'CLR_SEMAPHORE', 'LAZYWRITER_SLEEP', 'RESOURCE_QUEUE',
    'SLEEP_TASK', 'SLEEP_SYSTEMTASK', 'SQLTRACE_BUFFER_FLUSH',
    'WAITFOR', 'LOGMGR_QUEUE', 'CHECKPOINT_QUEUE'
)
ORDER BY wait_time_ms DESC;
```

### Script de Optimización

```bash
#!/bin/bash
# optimize_database.sh - Optimizar base de datos

LOG_FILE="/var/log/tramites/optimization.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] === OPTIMIZACIÓN DE BASE DE DATOS ===" | tee -a $LOG_FILE

# 1. Ejecutar análisis
echo "1. Ejecutando análisis de performance..." | tee -a $LOG_FILE
docker exec sqlserver /opt/mssql-tools/bin/sqlcmd \
    -S localhost -U sa -P $SA_PASSWORD \
    -i /scripts/analyze_performance.sql \
    -o /var/opt/mssql/backup/performance_analysis.txt

# 2. Actualizar estadísticas
echo "2. Actualizando estadísticas..." | tee -a $LOG_FILE
docker exec sqlserver /opt/mssql-tools/bin/sqlcmd \
    -S localhost -U sa -P $SA_PASSWORD \
    -Q "EXEC sp_updatestats"

# 3. Reorganizar índices
echo "3. Reorganizando índices fragmentados..." | tee -a $LOG_FILE
docker exec sqlserver /opt/mssql-tools/bin/sqlcmd \
    -S localhost -U sa -P $SA_PASSWORD \
    -Q "EXEC sp_MSforeachtable 'ALTER INDEX ALL ON ? REORGANIZE'"

echo "[$DATE] === OPTIMIZACIÓN COMPLETADA ===" | tee -a $LOG_FILE
```

---

## 9.6 Calendario de Mantenimiento

| Tarea | Frecuencia | Script | Tiempo Estimado |
|-------|-----------|--------|----------------|
| Health check | Diario 2 AM | `daily_check.sh` | 5 minutos |
| Rotación de logs | Diario 3 AM | `rotate_logs.sh` | 2 minutos |
| Backup completo | Diario 4 AM | `backup_database.sh` | 15 minutos |
| Mantenimiento BD | Semanal (Domingo 2 AM) | `weekly_maintenance.sh` | 30 minutos |
| Limpieza Docker | Semanal | Incluido en weekly | 5 minutos |
| Análisis de performance | Mensual | `analyze_performance.sql` | 20 minutos |
| Optimización BD | Mensual | `optimize_database.sh` | 1 hora |
| Actualización del sistema | Según releases | `update_system.sh` | 1 hora |
| Test de restore | Trimestral | Manual | 30 minutos |
| Auditoría de seguridad | Trimestral | Manual | 2 horas |

---

## 9.7 Contactos y Escalación

### Equipo de Desarrollo

- **Email**: desarrollo@gob.pa
- **Horario**: Lunes a Viernes, 8:00 AM - 5:00 PM
- **Slack**: #tramites-dev

### Soporte de Infraestructura

- **Email**: infraestructura@gob.pa
- **On-call**: +507 6000-0000 (24/7)
- **Escalación**: oncall@gob.pa

### Niveles de Severidad

| Nivel | Descripción | Tiempo de Respuesta | Ejemplos |
|-------|-------------|-------------------|----------|
| **P4 - Bajo** | Consultas generales, mejoras | 24 horas | Feature request, optimización |
| **P3 - Medio** | Problema que afecta funcionalidad secundaria | 4 horas | Reporte no se genera |
| **P2 - Alto** | Problema que afecta funcionalidad principal | 1 hora | Trámites no se crean |
| **P1 - Crítico** | Sistema caído o pérdida de datos | 15 minutos | API no responde, DB corrupta |

---

## Navegación

[← Troubleshooting](08-troubleshooting.md) | [Manual Técnico](index.md) | [Inicio](../index.md)
