-- ============================================================================
-- ACTUALIZACIÓN DE DATOS DE PRUEBA SIM_FT
-- ============================================================================
-- Descripción: Mejora los datos de prueba para estadísticas
-- Fecha: 2025-10-24
-- ============================================================================

USE SIM_PANAMA;
GO

PRINT '============================================================================';
PRINT 'ACTUALIZANDO DATOS DE PRUEBA SIM_FT PARA ESTADÍSTICAS';
PRINT '============================================================================';

-- ============================================================================
-- 1. Agregar más variedad de estados
-- ============================================================================
PRINT '';
PRINT '1/3 - Actualizando estados de trámites existentes...';

-- Actualizar trámite 5001 con estado específico
UPDATE SIM_FT_TRAMITE_E 
SET IND_ESTATUS = '02', -- En Revisión
    IND_PRIORIDAD = '2'  -- Prioridad media
WHERE NUM_TRAMITE = 5001;
PRINT '  ✅ Trámite 5001: Estado 02 (En Revisión)';

-- Actualizar trámite 5002 con estado específico  
UPDATE SIM_FT_TRAMITE_E 
SET IND_ESTATUS = '04', -- En Evaluación
    IND_PRIORIDAD = '1'  -- Prioridad alta
WHERE NUM_TRAMITE = 5002;
PRINT '  ✅ Trámite 5002: Estado 04 (En Evaluación)';

-- Actualizar trámite 5003 con estado finalizado
UPDATE SIM_FT_TRAMITE_E 
SET IND_ESTATUS = '10',           -- Finalizado
    IND_CONCLUSION = 'AP',         -- Aprobado
    IND_PRIORIDAD = '2',           -- Prioridad media
    FEC_INI_TRAMITE = DATEADD(DAY, -20, GETDATE()),  -- Inicio hace 20 días
    FEC_FIN_TRAMITE = DATEADD(DAY, -1, GETDATE())    -- Fin hace 1 día
WHERE NUM_TRAMITE = 5003;
PRINT '  ✅ Trámite 5003: Estado 10 (Finalizado) - Tiempo procesamiento: ~19 días';

-- ============================================================================
-- 2. Agregar más trámites para estadísticas
-- ============================================================================
PRINT '';
PRINT '2/3 - Agregando trámites adicionales para estadísticas...';

-- Trámite 5004: En proceso inicial (estado 01)
IF NOT EXISTS (SELECT 1 FROM SIM_FT_TRAMITE_E WHERE NUM_TRAMITE = 5004)
BEGIN
    INSERT INTO SIM_FT_TRAMITE_E (
        NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO, COD_TRAMITE,
        FEC_INI_TRAMITE, IND_ESTATUS, IND_PRIORIDAD,
        OBS_OBSERVA, ID_USUARIO_CREA, FEC_ACTUALIZA
    )
    VALUES (
        2025, 5004, 1, 'PERM_TEMP',
        DATEADD(DAY, -2, GETDATE()), '01', '3',
        'Solicitante: Ana Silva | Pasaporte: P789012 | RECIÉN INGRESADO',
        'ADMIN', GETDATE()
    );
    PRINT '  ✅ Trámite 5004: Estado 01 (Recién Ingresado)';
END

-- Trámite 5005: Finalizado hace más tiempo (para promedio)
IF NOT EXISTS (SELECT 1 FROM SIM_FT_TRAMITE_E WHERE NUM_TRAMITE = 5005)
BEGIN
    INSERT INTO SIM_FT_TRAMITE_E (
        NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO, COD_TRAMITE,
        FEC_INI_TRAMITE, FEC_FIN_TRAMITE, IND_ESTATUS, IND_CONCLUSION, IND_PRIORIDAD,
        OBS_OBSERVA, ID_USUARIO_CREA, FEC_ACTUALIZA
    )
    VALUES (
        2025, 5005, 1, 'PERM_TEMP',
        DATEADD(DAY, -30, GETDATE()), DATEADD(DAY, -5, GETDATE()), '10', 'AP', '1',
        'Solicitante: Carlos Méndez | Pasaporte: C345678 | APROBADO',
        'ADMIN', GETDATE()
    );
    PRINT '  ✅ Trámite 5005: Estado 10 (Finalizado) - Tiempo procesamiento: ~25 días';
END

-- Trámite 5006: Rechazado (para variedad en conclusiones)
IF NOT EXISTS (SELECT 1 FROM SIM_FT_TRAMITE_E WHERE NUM_TRAMITE = 5006)
BEGIN
    INSERT INTO SIM_FT_TRAMITE_E (
        NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO, COD_TRAMITE,
        FEC_INI_TRAMITE, FEC_FIN_TRAMITE, IND_ESTATUS, IND_CONCLUSION, IND_PRIORIDAD,
        OBS_OBSERVA, ID_USUARIO_CREA, FEC_ACTUALIZA
    )
    VALUES (
        2025, 5006, 1, 'PERM_TEMP',
        DATEADD(DAY, -15, GETDATE()), DATEADD(DAY, -3, GETDATE()), '10', 'RE', '2',
        'Solicitante: Laura Torres | Pasaporte: L901234 | RECHAZADO - Documentación incompleta',
        'ADMIN', GETDATE()
    );
    PRINT '  ✅ Trámite 5006: Estado 10 (Finalizado) - RECHAZADO - Tiempo: ~12 días';
END

-- ============================================================================
-- 3. Resumen de datos para estadísticas
-- ============================================================================
PRINT '';
PRINT '3/3 - Resumen de datos cargados:';
PRINT '------------------------------------------------------------';

-- Contar por estado
DECLARE @count_01 INT, @count_02 INT, @count_04 INT, @count_10 INT;
SELECT @count_01 = COUNT(*) FROM SIM_FT_TRAMITE_E WHERE COD_TRAMITE = 'PERM_TEMP' AND IND_ESTATUS = '01';
SELECT @count_02 = COUNT(*) FROM SIM_FT_TRAMITE_E WHERE COD_TRAMITE = 'PERM_TEMP' AND IND_ESTATUS = '02';
SELECT @count_04 = COUNT(*) FROM SIM_FT_TRAMITE_E WHERE COD_TRAMITE = 'PERM_TEMP' AND IND_ESTATUS = '04';
SELECT @count_10 = COUNT(*) FROM SIM_FT_TRAMITE_E WHERE COD_TRAMITE = 'PERM_TEMP' AND IND_ESTATUS = '10';

PRINT '  📊 Estado 01 (Recién Ingresado): ' + CAST(@count_01 AS VARCHAR);
PRINT '  📊 Estado 02 (En Revisión): ' + CAST(@count_02 AS VARCHAR);
PRINT '  📊 Estado 04 (En Evaluación): ' + CAST(@count_04 AS VARCHAR);
PRINT '  📊 Estado 10 (Finalizado): ' + CAST(@count_10 AS VARCHAR);

-- Total
DECLARE @total INT;
SELECT @total = COUNT(*) FROM SIM_FT_TRAMITE_E WHERE COD_TRAMITE = 'PERM_TEMP';
PRINT '';
PRINT '  📈 TOTAL TRÁMITES PERM_TEMP: ' + CAST(@total AS VARCHAR);

-- Tiempo promedio de finalizados
DECLARE @promedio FLOAT;
SELECT @promedio = AVG(DATEDIFF(DAY, FEC_INI_TRAMITE, FEC_FIN_TRAMITE))
FROM SIM_FT_TRAMITE_E 
WHERE COD_TRAMITE = 'PERM_TEMP' 
  AND IND_ESTATUS = '10'
  AND FEC_FIN_TRAMITE IS NOT NULL;

PRINT '  ⏱️  TIEMPO PROMEDIO (finalizados): ' + CAST(ROUND(@promedio, 1) AS VARCHAR) + ' días';

PRINT '';
PRINT '============================================================================';
PRINT '✅ ACTUALIZACIÓN COMPLETADA';
PRINT '============================================================================';
PRINT '';
PRINT 'Endpoints disponibles para probar:';
PRINT '  GET /api/v1/sim-ft/estadisticas/tramites-por-tipo';
PRINT '  GET /api/v1/sim-ft/estadisticas/tramites-por-estado';
PRINT '  GET /api/v1/sim-ft/estadisticas/tiempo-promedio?cod_tramite=PERM_TEMP';
PRINT '';
GO
