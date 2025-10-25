# Database Backups - SIM_PANAMA

Este directorio contiene backups y dumps de la base de datos SIM_PANAMA.

## 📋 Contenido

### Backups Nativos (.bak)

**SIM_PANAMA_backup_20251025_194649.bak**
- **Fecha**: 25 de Octubre, 2025 - 19:46:49
- **Tamaño**: ~1 MB (comprimido)
- **Tipo**: Full backup nativo de SQL Server
- **Compresión**: Habilitada
- **Estado**: ✅ Completado exitosamente
- **Páginas procesadas**: 1,906 páginas
- **Velocidad**: 248.111 MB/sec

### Metadata y Estadísticas

**SIM_PANAMA_metadata_20251025.txt**
- **Fecha**: 25 de Octubre, 2025
- **Contenido**: 
  - Lista de todas las tablas con schemas
  - Fechas de creación y modificación
  - Conteo de registros por tabla
  - Estadísticas de la base de datos

### Scripts SQL

**backup_script.sql**
- Script T-SQL para crear backups automáticos
- Genera nombre de archivo con timestamp
- Incluye compresión y estadísticas de progreso

**dump_metadata.sql**
- Script para extraer metadata de la base de datos
- Genera reporte de estructura y conteos

## 🔄 Restaurar Backup

### Opción 1: Usando Docker (Recomendado)

```bash
# 1. Copiar el backup al contenedor
docker cp database/backups/SIM_PANAMA_backup_20251025_194649.bak tramites-sqlserver:/var/opt/mssql/backup/

# 2. Restaurar la base de datos
docker exec tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -C -Q "RESTORE DATABASE [SIM_PANAMA_RESTORED] FROM DISK = '/var/opt/mssql/backup/SIM_PANAMA_backup_20251025_194649.bak' WITH MOVE 'SIM_PANAMA' TO '/var/opt/mssql/data/SIM_PANAMA_RESTORED.mdf', MOVE 'SIM_PANAMA_log' TO '/var/opt/mssql/data/SIM_PANAMA_RESTORED_log.ldf', REPLACE"
```

### Opción 2: Usando SQL Server Management Studio (SSMS)

1. Conectar a SQL Server (localhost:1433)
2. Click derecho en "Databases" → "Restore Database"
3. Seleccionar "Device" y buscar el archivo .bak
4. Configurar opciones de restauración
5. Click en "OK"

### Opción 3: Usando Azure Data Studio

1. Conectar al servidor SQL
2. Click derecho en "Databases" → "Restore"
3. Seleccionar archivo de backup
4. Configurar destino y opciones
5. Restaurar

## 📝 Crear Nuevos Backups

### Backup Manual

```bash
# Usando el script provisto
docker cp database/backups/backup_script.sql tramites-sqlserver:/tmp/
docker exec tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -C -i /tmp/backup_script.sql

# Copiar backup generado
docker cp tramites-sqlserver:/var/opt/mssql/backup/SIM_PANAMA_backup_YYYYMMDD_HHMMSS.bak database/backups/
```

### Backup Directo (comando único)

```bash
docker exec tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -C -Q "BACKUP DATABASE [SIM_PANAMA] TO DISK = '/var/opt/mssql/backup/SIM_PANAMA_manual.bak' WITH FORMAT, COMPRESSION"
```

## ⚠️ Consideraciones Importantes

### Seguridad
- ⚠️ Los archivos .bak contienen **todos los datos** de la base de datos
- 🔒 No commitear archivos .bak al repositorio Git (están en .gitignore)
- 🔐 Almacenar backups en ubicación segura y encriptada
- 👤 Limitar acceso solo a personal autorizado

### Tamaño y Almacenamiento
- Los backups comprimidos ocupan ~1 MB actualmente
- Tamaño crecerá conforme aumenten los datos
- Considerar rotación de backups antiguos
- Almacenar en ubicación con suficiente espacio

### Frecuencia Recomendada
- **Desarrollo**: Backup diario antes de cambios mayores
- **Staging**: Backup diario automático
- **Producción**: 
  - Full backup: Diario (retención 7 días)
  - Differential backup: Cada 6 horas (retención 24 horas)
  - Transaction log backup: Cada 15 minutos (retención 24 horas)

## 🗂️ Estructura de la Base de Datos

La base de datos SIM_PANAMA contiene:

- **Módulo PPSH**: 10+ tablas para gestión de solicitudes
- **Módulo SIM_FT**: 11+ tablas para trámites migratorios
- **Módulo Workflows**: 9+ tablas para workflows dinámicos
- **Seguridad**: 4+ tablas de usuarios y roles
- **Catálogos**: 9+ tablas de datos maestros
- **Auditoría**: Tablas de log y seguimiento

## 📊 Validar Backup

Después de crear un backup, validar:

```sql
-- Verificar header del backup
RESTORE HEADERONLY 
FROM DISK = '/var/opt/mssql/backup/SIM_PANAMA_backup_20251025_194649.bak';

-- Verificar integridad
RESTORE VERIFYONLY 
FROM DISK = '/var/opt/mssql/backup/SIM_PANAMA_backup_20251025_194649.bak';

-- Listar archivos contenidos
RESTORE FILELISTONLY 
FROM DISK = '/var/opt/mssql/backup/SIM_PANAMA_backup_20251025_194649.bak';
```

## 🔗 Referencias

- [SQL Server Backup Documentation](https://docs.microsoft.com/sql/relational-databases/backup-restore/)
- [Docker SQL Server Guide](https://docs.microsoft.com/sql/linux/sql-server-linux-docker)
- Manual Técnico del Proyecto: `docs/MANUAL_TECNICO.md`
- Diccionario de Datos: `docs/DICCIONARIO_DATOS_COMPLETO.md`

---

**Última actualización**: 25 de Octubre, 2025  
**Versión BD**: SIM_PANAMA v2.0  
**Responsable**: Equipo de Desarrollo Backend
