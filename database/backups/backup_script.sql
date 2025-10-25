-- Script para crear backup de la base de datos SIM_PANAMA
-- Fecha: 2025-10-25

DECLARE @BackupPath NVARCHAR(500);
DECLARE @BackupName NVARCHAR(500);
DECLARE @DateTime NVARCHAR(20);

SET @DateTime = CONVERT(NVARCHAR(20), GETDATE(), 112) + '_' + REPLACE(CONVERT(NVARCHAR(20), GETDATE(), 108), ':', '');
SET @BackupName = 'SIM_PANAMA_backup_' + @DateTime + '.bak';
SET @BackupPath = '/var/opt/mssql/backup/' + @BackupName;

PRINT 'Creando backup de SIM_PANAMA...';
PRINT 'Archivo: ' + @BackupPath;

BACKUP DATABASE [SIM_PANAMA] 
TO DISK = @BackupPath
WITH FORMAT, 
     COMPRESSION,
     STATS = 10,
     NAME = 'SIM_PANAMA Full Backup',
     DESCRIPTION = 'Backup completo de la base de datos SIM_PANAMA';

PRINT 'Backup completado exitosamente!';
