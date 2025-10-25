-- Script para generar dump de datos de SIM_PANAMA
-- Fecha: 2025-10-25
-- Incluye estructura y datos de todas las tablas

USE SIM_PANAMA;
GO

-- Configurar opciones para el dump
SET NOCOUNT ON;
GO

PRINT 'Generando dump de la base de datos SIM_PANAMA...';
PRINT 'Fecha: ' + CONVERT(VARCHAR(20), GETDATE(), 120);
GO

-- Lista de todas las tablas de usuario
SELECT 
    SCHEMA_NAME(schema_id) AS SchemaName,
    name AS TableName,
    create_date AS CreatedDate,
    modify_date AS ModifiedDate
FROM sys.tables
WHERE type = 'U'
ORDER BY schema_name, name;
GO

-- Contar registros por tabla
DECLARE @TableName NVARCHAR(256);
DECLARE @SQL NVARCHAR(MAX);

DECLARE table_cursor CURSOR FOR
SELECT SCHEMA_NAME(schema_id) + '.' + name
FROM sys.tables
WHERE type = 'U'
ORDER BY name;

PRINT '';
PRINT 'Conteo de registros por tabla:';
PRINT '================================';

OPEN table_cursor;
FETCH NEXT FROM table_cursor INTO @TableName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @SQL = N'SELECT ''' + @TableName + ''' AS TableName, COUNT(*) AS RecordCount FROM ' + @TableName;
    EXEC sp_executesql @SQL;
    
    FETCH NEXT FROM table_cursor INTO @TableName;
END;

CLOSE table_cursor;
DEALLOCATE table_cursor;
GO

PRINT '';
PRINT 'Dump completado!';
