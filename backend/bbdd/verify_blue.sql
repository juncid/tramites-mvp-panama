-- Verificación de migración Blue
USE [SIM_PANAMA]
GO

PRINT '📊 REPORTE DE VERIFICACIÓN AMBIENTE BLUE'
PRINT '============================================='

-- Verificar tabla PPSH_PAGO
SELECT COUNT(*) as ppsh_pago_exists 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'PPSH_PAGO'

-- Verificar conceptos de pago
SELECT COUNT(*) as conceptos_pago_count
FROM PPSH_CONCEPTO_PAGO

-- Verificar campos de auditoría en SIM_GE_SEXO
SELECT COUNT(*) as audit_fields_count
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'SIM_GE_SEXO' 
AND COLUMN_NAME IN ('created_at', 'created_by', 'updated_at', 'updated_by')

-- Verificar todas las tablas PPSH
SELECT COUNT(*) as ppsh_tables_count
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME LIKE 'PPSH_%'

PRINT '✅ Verificación completada'