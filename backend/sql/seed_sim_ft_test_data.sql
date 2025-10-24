-- ============================================================================
-- SEED DATA SIM_FT - FLUJO COMPLETO DE PRUEBA
-- ============================================================================
-- Código trámite: PERM_TEMP (máx 10 caracteres)
-- Basado en estructura real de tablas SIM_FT
-- ============================================================================

USE SIM_PANAMA;
GO

PRINT '🚀 Cargando datos de prueba SIM_FT - Flujo Completo';
PRINT '';

-- ============================================================================
-- 1. TIPO DE TRÁMITE
-- ============================================================================
PRINT '1/6 - Tipo de trámite...';

IF NOT EXISTS (SELECT 1 FROM SIM_FT_TRAMITES WHERE COD_TRAMITE = 'PERM_TEMP')
BEGIN
    INSERT INTO SIM_FT_TRAMITES (COD_TRAMITE, DESC_TRAMITE, PAG_TRAMITE, IND_ACTIVO, ID_USUARIO_CREA, FEC_CREA_REG)
    VALUES ('PERM_TEMP', 'Permiso Temporal - Flujo completo de prueba', 'https://test.com', 'S', 'ADMIN', GETDATE());
    PRINT '  ✅ PERM_TEMP creado';
END
ELSE PRINT '  ⚠️  PERM_TEMP ya existe';
GO

-- ============================================================================
-- 2. PASOS (6 pasos)
-- ============================================================================
PRINT '2/6 - Pasos del proceso...';

-- Pasos del trámite PERM_TEMP
DECLARE @pasos TABLE (num INT, nombre VARCHAR(255));
INSERT INTO @pasos VALUES 
    (1, 'Recepción de Solicitud'),
    (2, 'Verificación de Documentos'),
    (3, 'Evaluación Legal'),
    (4, 'Aprobación Directiva'),
    (5, 'Verificación de Pago'),
    (6, 'Emisión de Permiso');

DECLARE @num INT, @nombre VARCHAR(255);
DECLARE paso_cursor CURSOR FOR SELECT num, nombre FROM @pasos;
OPEN paso_cursor;
FETCH NEXT FROM paso_cursor INTO @num, @nombre;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF NOT EXISTS (SELECT 1 FROM SIM_FT_PASOS WHERE COD_TRAMITE = 'PERM_TEMP' AND NUM_PASO = @num)
    BEGIN
        INSERT INTO SIM_FT_PASOS (COD_TRAMITE, NUM_PASO, NOM_DESCRIPCION, IND_ACTIVO, FEC_CREA_REG)
        VALUES ('PERM_TEMP', @num, @nombre, 'S', GETDATE());
        PRINT '  ✅ Paso ' + CAST(@num AS VARCHAR) + ': ' + @nombre;
    END
    FETCH NEXT FROM paso_cursor INTO @num, @nombre;
END
CLOSE paso_cursor;
DEALLOCATE paso_cursor;
GO

-- ============================================================================
-- 3. FLUJO DE PASOS
-- ============================================================================
PRINT '3/6 - Flujo de pasos...';

-- Tabla de configuración de flujo: paso -> siguiente_paso
DECLARE @flujos TABLE (paso INT, seccion VARCHAR(10), siguiente INT);
INSERT INTO @flujos VALUES 
    (1, '0101', 2),   -- Recepción -> Verificación
    (2, '0102', 3),   -- Verificación -> Evaluación
    (3, '0103', 4),   -- Evaluación -> Aprobación
    (4, '0104', 5),   -- Aprobación -> Pago
    (5, '0105', 6),   -- Pago -> Emisión
    (6, '0106', NULL); -- Emisión -> FIN

DECLARE @paso INT, @seccion VARCHAR(10), @siguiente INT;
DECLARE flujo_cursor CURSOR FOR SELECT paso, seccion, siguiente FROM @flujos;
OPEN flujo_cursor;
FETCH NEXT FROM flujo_cursor INTO @paso, @seccion, @siguiente;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF NOT EXISTS (SELECT 1 FROM SIM_FT_PASO_X_TRAM WHERE COD_TRAMITE = 'PERM_TEMP' AND NUM_PASO = @paso)
    BEGIN
        INSERT INTO SIM_FT_PASO_X_TRAM (COD_TRAMITE, NUM_PASO, COD_SECCION, ID_PASO_SGTE, IND_ACTIVO, FEC_CREA_REG)
        VALUES ('PERM_TEMP', @paso, @seccion, @siguiente, 'S', GETDATE());
        PRINT '  ✅ Flujo ' + CAST(@paso AS VARCHAR) + ' -> ' + ISNULL(CAST(@siguiente AS VARCHAR), 'FIN');
    END
    FETCH NEXT FROM flujo_cursor INTO @paso, @seccion, @siguiente;
END
CLOSE flujo_cursor;
DEALLOCATE flujo_cursor;
GO

-- ============================================================================
-- 4. USUARIOS Y SECCIONES
-- ============================================================================
PRINT '4/6 - Asignaciones usuarios-secciones...';

-- Asignar COD_AGENCIA para las inserciones (requerido NOT NULL)
DECLARE @secciones_asignar TABLE (usuario VARCHAR(17), seccion VARCHAR(10), agencia VARCHAR(10));
INSERT INTO @secciones_asignar VALUES 
    ('ADMIN', '0101', '001'),
    ('ADMIN', '0102', '001'),
    ('ADMIN', '0103', '001'),
    ('ADMIN', '0104', '001'),
    ('ADMIN', '0105', '001'),
    ('ADMIN', '0106', '001'),
    ('TEST_USER', '0101', '001');

DECLARE @usuario VARCHAR(17), @sec VARCHAR(10), @agencia VARCHAR(10);
DECLARE asign_cursor CURSOR FOR SELECT usuario, seccion, agencia FROM @secciones_asignar;
OPEN asign_cursor;
FETCH NEXT FROM asign_cursor INTO @usuario, @sec, @agencia;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF NOT EXISTS (SELECT 1 FROM SIM_FT_USUA_SEC WHERE ID_USUARIO = @usuario AND COD_SECCION = @sec)
    BEGIN
        INSERT INTO SIM_FT_USUA_SEC (ID_USUARIO, COD_SECCION, COD_AGENCIA, IND_ACTIVO, ID_USUARIO_CREA, FEC_CREA_REG)
        VALUES (@usuario, @sec, @agencia, 'S', 'ADMIN', GETDATE());
        PRINT '  ✅ ' + @usuario + ' -> ' + @sec;
    END
    FETCH NEXT FROM asign_cursor INTO @usuario, @sec, @agencia;
END
CLOSE asign_cursor;
DEALLOCATE asign_cursor;
GO

-- ============================================================================
-- 5. TRÁMITES (3 ejemplos en diferentes estados)
-- ============================================================================
PRINT '5/6 - Trámites de ejemplo...';

-- Trámite 1: En paso 2 (Verificación)
IF NOT EXISTS (SELECT 1 FROM SIM_FT_TRAMITE_E WHERE NUM_ANNIO = 2025 AND NUM_TRAMITE = 5001 AND NUM_REGISTRO = 1)
BEGIN
    INSERT INTO SIM_FT_TRAMITE_E (
        NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO, COD_TRAMITE,
        FEC_INI_TRAMITE, IND_ESTATUS, IND_PRIORIDAD,
        OBS_OBSERVA, ID_USUARIO_CREA, FEC_ACTUALIZA
    ) VALUES (
        2025, 5001, 1, 'PERM_TEMP',
        DATEADD(DAY, -5, GETDATE()), '02', '2',
        'Solicitante: Juan Rodríguez | Pasaporte: P123456', 'TEST_USER', GETDATE()
    );
    PRINT '  ✅ Trámite 2025-5001-1: Juan Rodríguez (En Revisión)';
END

-- Trámite 2: En paso 4 (Aprobación)
IF NOT EXISTS (SELECT 1 FROM SIM_FT_TRAMITE_E WHERE NUM_ANNIO = 2025 AND NUM_TRAMITE = 5002 AND NUM_REGISTRO = 1)
BEGIN
    INSERT INTO SIM_FT_TRAMITE_E (
        NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO, COD_TRAMITE,
        FEC_INI_TRAMITE, IND_ESTATUS, IND_PRIORIDAD,
        OBS_OBSERVA, ID_USUARIO_CREA, FEC_ACTUALIZA
    ) VALUES (
        2025, 5002, 1, 'PERM_TEMP',
        DATEADD(DAY, -10, GETDATE()), '04', '1',
        'Solicitante: María González | Pasaporte: V987654', 'ADMIN', GETDATE()
    );
    PRINT '  ✅ Trámite 2025-5002-1: María González (En Evaluación)';
END

-- Trámite 3: Finalizado
IF NOT EXISTS (SELECT 1 FROM SIM_FT_TRAMITE_E WHERE NUM_ANNIO = 2025 AND NUM_TRAMITE = 5003 AND NUM_REGISTRO = 1)
BEGIN
    INSERT INTO SIM_FT_TRAMITE_E (
        NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO, COD_TRAMITE,
        FEC_INI_TRAMITE, FEC_FIN_TRAMITE, IND_ESTATUS, IND_CONCLUSION, IND_PRIORIDAD,
        OBS_OBSERVA, ID_USUARIO_CREA, FEC_ACTUALIZA
    ) VALUES (
        2025, 5003, 1, 'PERM_TEMP',
        DATEADD(DAY, -20, GETDATE()), DATEADD(DAY, -1, GETDATE()), '10', 'AP', '3',
        'Solicitante: Pedro Martínez | Pasaporte: N456789 | APROBADO', 'ADMIN', GETDATE()
    );
    PRINT '  ✅ Trámite 2025-5003-1: Pedro Martínez (Finalizado - Aprobado)';
END
GO

-- ============================================================================
-- 6. DETALLES (Historial de pasos)
-- ============================================================================
PRINT '6/6 - Detalles de pasos ejecutados...';

-- Trámite 5001 - Pasos 1 y 2
IF NOT EXISTS (SELECT 1 FROM SIM_FT_TRAMITE_D WHERE NUM_ANNIO = 2025 AND NUM_TRAMITE = 5001 AND NUM_REGISTRO = 1 AND NUM_PASO = 1)
BEGIN
    INSERT INTO SIM_FT_TRAMITE_D (NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO, NUM_PASO, COD_TRAMITE, NUM_ACTIVIDAD, IND_ESTATUS, OBS_OBSERVACION, ID_USUARIO_CREA, FEC_ACTUALIZA)
    VALUES (2025, 5001, 1, 1, 'PERM_TEMP', 1, '01', 'Solicitud recibida - Documentos completos', 'TEST_USER', DATEADD(DAY, -5, GETDATE()));
    
    INSERT INTO SIM_FT_TRAMITE_D (NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO, NUM_PASO, COD_TRAMITE, NUM_ACTIVIDAD, IND_ESTATUS, OBS_OBSERVACION, ID_USUARIO_CREA, FEC_ACTUALIZA)
    VALUES (2025, 5001, 1, 2, 'PERM_TEMP', 1, '02', 'Verificación en proceso', 'ADMIN', DATEADD(DAY, -3, GETDATE()));
    
    PRINT '  ✅ Trámite 5001: 2 pasos registrados';
END

-- Trámite 5002 - Pasos 1, 2, 3, 4
IF NOT EXISTS (SELECT 1 FROM SIM_FT_TRAMITE_D WHERE NUM_ANNIO = 2025 AND NUM_TRAMITE = 5002 AND NUM_REGISTRO = 1 AND NUM_PASO = 1)
BEGIN
    INSERT INTO SIM_FT_TRAMITE_D (NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO, NUM_PASO, COD_TRAMITE, NUM_ACTIVIDAD, IND_ESTATUS, OBS_OBSERVACION, ID_USUARIO_CREA, FEC_ACTUALIZA)
    VALUES 
        (2025, 5002, 1, 1, 'PERM_TEMP', 1, '01', 'Recepción OK', 'ADMIN', DATEADD(DAY, -10, GETDATE())),
        (2025, 5002, 1, 2, 'PERM_TEMP', 1, '02', 'Documentos verificados', 'ADMIN', DATEADD(DAY, -8, GETDATE())),
        (2025, 5002, 1, 3, 'PERM_TEMP', 1, '02', 'Evaluación legal completada', 'ADMIN', DATEADD(DAY, -5, GETDATE())),
        (2025, 5002, 1, 4, 'PERM_TEMP', 1, '04', 'Esperando aprobación directiva', 'ADMIN', DATEADD(DAY, -2, GETDATE()));
    
    PRINT '  ✅ Trámite 5002: 4 pasos registrados';
END

-- Trámite 5003 - Flujo completo (6 pasos)
IF NOT EXISTS (SELECT 1 FROM SIM_FT_TRAMITE_D WHERE NUM_ANNIO = 2025 AND NUM_TRAMITE = 5003 AND NUM_REGISTRO = 1 AND NUM_PASO = 1)
BEGIN
    INSERT INTO SIM_FT_TRAMITE_D (NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO, NUM_PASO, COD_TRAMITE, NUM_ACTIVIDAD, IND_ESTATUS, OBS_OBSERVACION, ID_USUARIO_CREA, FEC_ACTUALIZA)
    VALUES 
        (2025, 5003, 1, 1, 'PERM_TEMP', 1, '01', 'Recepción', 'ADMIN', DATEADD(DAY, -20, GETDATE())),
        (2025, 5003, 1, 2, 'PERM_TEMP', 1, '02', 'Verificación OK', 'ADMIN', DATEADD(DAY, -18, GETDATE())),
        (2025, 5003, 1, 3, 'PERM_TEMP', 1, '02', 'Evaluación legal OK', 'ADMIN', DATEADD(DAY, -15, GETDATE())),
        (2025, 5003, 1, 4, 'PERM_TEMP', 1, '05', 'Aprobado por director', 'ADMIN', DATEADD(DAY, -10, GETDATE())),
        (2025, 5003, 1, 5, 'PERM_TEMP', 1, '08', 'Pago verificado', 'ADMIN', DATEADD(DAY, -5, GETDATE())),
        (2025, 5003, 1, 6, 'PERM_TEMP', 1, '10', 'Permiso emitido', 'ADMIN', DATEADD(DAY, -1, GETDATE()));
    
    PRINT '  ✅ Trámite 5003: 6 pasos registrados (completo)';
END
GO

-- ============================================================================
-- RESUMEN
-- ============================================================================
PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '         ✅ DATOS DE PRUEBA CARGADOS EXITOSAMENTE';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '';
PRINT '📦 COMPONENTES:';
PRINT '   • 1 Tipo: PERM_TEMP';
PRINT '   • 6 Pasos configurados';
PRINT '   • 6 Flujos definidos';
PRINT '   • 7 Asignaciones usuario-sección';
PRINT '   • 3 Trámites de ejemplo';
PRINT '   • 12 Detalles de pasos';
PRINT '';
PRINT '🧪 ENDPOINTS PARA PROBAR:';
PRINT '   GET  /api/v1/sim-ft/pasos?cod_tramite=PERM_TEMP';
PRINT '   GET  /api/v1/sim-ft/flujo-pasos?cod_tramite=PERM_TEMP';
PRINT '   GET  /api/v1/sim-ft/tramites';
PRINT '   GET  /api/v1/sim-ft/tramites/2025/5001';
PRINT '   POST /api/v1/sim-ft/tramites/2025/5001/pasos';
PRINT '   GET  /api/v1/sim-ft/estadisticas';
PRINT '';
PRINT '✨ ¡Listo para pruebas end-to-end!';
GO
