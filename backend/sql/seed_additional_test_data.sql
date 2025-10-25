-- ============================================================================
-- DATOS ADICIONALES DE PRUEBA - CASOS REALISTAS COMPLETOS
-- ============================================================================
-- Autor: Sistema de Trámites MVP Panamá
-- Fecha: 2025-10-25
-- Descripción: Datos de ejemplo adicionales para testing más completo
-- ============================================================================

USE SIM_PANAMA;
GO

PRINT '🌟 Cargando datos adicionales de prueba...';
PRINT '';

-- ============================================================================
-- PARTE 1: MÁS SOLICITANTES PPSH (10 casos adicionales)
-- ============================================================================
PRINT '📋 PARTE 1/4 - Solicitantes PPSH adicionales...';

-- ============================================================================
-- PARTE 1: SOLICITUDES PPSH PRIMERO (para obtener IDs)
-- ============================================================================
PRINT '📋 PARTE 1/4 - Crear Solicitudes PPSH...';

-- Solicitudes con diferentes estados
DECLARE @solicitudes_temp TABLE (
    num_exp VARCHAR(50),
    tipo_sol VARCHAR(20),
    causa_id INT,
    descripcion VARCHAR(MAX),
    estado VARCHAR(20),
    dias INT
);

INSERT INTO @solicitudes_temp VALUES
    ('PPSH-2025-ADD-001', 'PPSH', 1, 'Persecución política por activismo en Venezuela', 'RECIBIDO', 2),
    ('PPSH-2025-ADD-002', 'PPSH', 2, 'Amenazas por orientación política en Cuba', 'EN_REVISION', 5),
    ('PPSH-2025-ADD-003', 'PROTECCION_HUMANITARIA', 3, 'Violencia de género - amenazas de muerte', 'EN_REVISION', 7),
    ('PPSH-2025-ADD-004', 'PPSH', 4, 'Persecución por pertenecer a minoría étnica', 'DOCUMENTOS_INCOMPLETOS', 10),
    ('PPSH-2025-ADD-005', 'PPSH', 1, 'Amenazas por trabajo como periodista', 'EN_ENTREVISTA', 12),
    ('PPSH-2025-ADD-006', 'PROTECCION_HUMANITARIA', 5, 'Violencia doméstica extrema - riesgo de vida', 'APROBADO', 15),
    ('PPSH-2025-ADD-007', 'PPSH', 2, 'Persecución por activismo sindical', 'RECHAZADO', 20),
    ('PPSH-2025-ADD-008', 'PPSH', 1, 'Amenazas por denuncia de corrupción', 'RECIBIDO', 1),
    ('PPSH-2025-ADD-009', 'PPSH', 6, 'Persecución religiosa', 'EN_REVISION', 4),
    ('PPSH-2025-ADD-010', 'PROTECCION_HUMANITARIA', 3, 'Violencia de pandillas - testigo protegido', 'EN_ENTREVISTA', 8);

DECLARE @num_exp VARCHAR(50), @tipo VARCHAR(20), @causa INT, @desc VARCHAR(MAX), @estado VARCHAR(20), @dias INT;
DECLARE @solicitud_ids TABLE (num_exp VARCHAR(50), id_solicitud INT);

DECLARE sol_cursor CURSOR FOR 
    SELECT num_exp, tipo_sol, causa_id, descripcion, estado, dias FROM @solicitudes_temp;

OPEN sol_cursor;
FETCH NEXT FROM sol_cursor INTO @num_exp, @tipo, @causa, @desc, @estado, @dias;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF NOT EXISTS (SELECT 1 FROM PPSH_SOLICITUD WHERE num_expediente = @num_exp)
    BEGIN
        INSERT INTO PPSH_SOLICITUD (
            num_expediente, tipo_solicitud, cod_causa_humanitaria,
            descripcion_caso, estado_actual, fecha_solicitud,
            created_by, created_at
        ) VALUES (
            @num_exp, @tipo, @causa, @desc, @estado,
            DATEADD(DAY, -@dias, CAST(GETDATE() AS DATE)), 'ADMIN', GETDATE()
        );
        
        INSERT INTO @solicitud_ids (num_exp, id_solicitud)
        SELECT @num_exp, SCOPE_IDENTITY();
        
        PRINT '  ✅ Solicitud: ' + @num_exp + ' - Estado: ' + @estado;
    END
    FETCH NEXT FROM sol_cursor INTO @num_exp, @tipo, @causa, @desc, @estado, @dias;
END

CLOSE sol_cursor;
DEALLOCATE sol_cursor;
GO

-- ============================================================================
-- PARTE 2: SOLICITANTES PPSH (10 casos)
-- ============================================================================
PRINT '';
PRINT '� PARTE 2/4 - Solicitantes PPSH adicionales...';

-- Solicitantes de diferentes nacionalidades y situaciones
DECLARE @solicitantes TABLE (
    num_exp VARCHAR(50),
    primer_nombre VARCHAR(100),
    primer_apellido VARCHAR(100),
    segundo_apellido VARCHAR(100),
    tipo_doc VARCHAR(20),
    num_doc VARCHAR(50),
    nacionalidad VARCHAR(3),
    fecha_nac DATE,
    sexo CHAR(1),
    email VARCHAR(100),
    telefono VARCHAR(20)
);

INSERT INTO @solicitantes VALUES
    ('PPSH-2025-ADD-001', 'Carlos', 'Ramírez', 'Sánchez', 'PASAPORTE', 'VE8765432', 'VE', '1985-03-15', 'M', 'carlos.ramirez@example.com', '+507-6100-0001'),
    ('PPSH-2025-ADD-002', 'Ana', 'Morales', 'Torres', 'PASAPORTE', 'CU1234567', 'CU', '1990-07-22', 'F', 'ana.morales@example.com', '+507-6100-0002'),
    ('PPSH-2025-ADD-003', 'José', 'Fernández', 'López', 'PASAPORTE', 'NI9876543', 'NI', '1978-11-30', 'M', 'jose.fernandez@example.com', '+507-6100-0003'),
    ('PPSH-2025-ADD-004', 'Lucía', 'Castillo', 'Ruiz', 'PASAPORTE', 'HN2345678', 'HN', '1995-05-18', 'F', 'lucia.castillo@example.com', '+507-6100-0004'),
    ('PPSH-2025-ADD-005', 'Miguel', 'Díaz', 'Gómez', 'CEDULA', 'CO34567890', 'CO', '1982-09-25', 'M', 'miguel.diaz@example.com', '+507-6100-0005'),
    ('PPSH-2025-ADD-006', 'Elena', 'Vargas', 'Medina', 'PASAPORTE', 'VE5432109', 'VE', '1988-01-12', 'F', 'elena.vargas@example.com', '+507-6100-0006'),
    ('PPSH-2025-ADD-007', 'Roberto', 'Gutiérrez', 'Silva', 'PASAPORTE', 'NI6543210', 'NI', '1975-12-08', 'M', 'roberto.gutierrez@example.com', '+507-6100-0007'),
    ('PPSH-2025-ADD-008', 'Patricia', 'Herrera', 'Ortiz', 'CEDULA', 'VE7654321', 'VE', '1992-04-20', 'F', 'patricia.herrera@example.com', '+507-6100-0008'),
    ('PPSH-2025-ADD-009', 'Fernando', 'Ramos', 'Castro', 'PASAPORTE', 'CU8765432', 'CU', '1980-06-14', 'M', 'fernando.ramos@example.com', '+507-6100-0009'),
    ('PPSH-2025-ADD-010', 'Gabriela', 'Mendoza', 'Pérez', 'PASAPORTE', 'HN9876543', 'HN', '1993-08-05', 'F', 'gabriela.mendoza@example.com', '+507-6100-0010');

DECLARE @num_exp_sol VARCHAR(50), @nom VARCHAR(100), @ap1 VARCHAR(100), @ap2 VARCHAR(100), @tdoc VARCHAR(20), 
        @ndoc VARCHAR(50), @nac VARCHAR(3), @fnac DATE, @sex CHAR(1), @email VARCHAR(100), @tel VARCHAR(20), @id_sol INT;

DECLARE solicitante_cursor CURSOR FOR 
    SELECT num_exp, primer_nombre, primer_apellido, segundo_apellido, tipo_doc, num_doc, nacionalidad, fecha_nac, sexo, email, telefono 
    FROM @solicitantes;

OPEN solicitante_cursor;
FETCH NEXT FROM solicitante_cursor INTO @num_exp_sol, @nom, @ap1, @ap2, @tdoc, @ndoc, @nac, @fnac, @sex, @email, @tel;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Obtener ID de la solicitud
    SELECT @id_sol = id_solicitud FROM PPSH_SOLICITUD WHERE num_expediente = @num_exp_sol;
    
    IF @id_sol IS NOT NULL AND NOT EXISTS (SELECT 1 FROM PPSH_SOLICITANTE WHERE num_documento = @ndoc)
    BEGIN
        INSERT INTO PPSH_SOLICITANTE (
            id_solicitud, es_titular, primer_nombre, primer_apellido, segundo_apellido, tipo_documento, num_documento,
            cod_nacionalidad, fecha_nacimiento, cod_sexo,
            email, telefono, created_by, created_at
        ) VALUES (
            @id_sol, 1, @nom, @ap1, @ap2, @tdoc, @ndoc, @nac, @fnac, @sex,
            @email, @tel, 'ADMIN', GETDATE()
        );
        PRINT '  ✅ ' + @nom + ' ' + @ap1 + ' (' + @ndoc + ') -> ' + @num_exp_sol;
    END
    FETCH NEXT FROM solicitante_cursor INTO @num_exp_sol, @nom, @ap1, @ap2, @tdoc, @ndoc, @nac, @fnac, @sex, @email, @tel;
END

CLOSE solicitante_cursor;
DEALLOCATE solicitante_cursor;
GO

-- ============================================================================
-- PARTE 3: MÁS TRÁMITES SIM_FT (7 casos adicionales)
-- ============================================================================
PRINT '';
PRINT '🏛️ PARTE 3/4 - Trámites SIM_FT adicionales...';

-- Trámites con diferentes estados y prioridades
DECLARE @tramites TABLE (
    num INT,
    solicitante VARCHAR(100),
    pasaporte VARCHAR(50),
    estado VARCHAR(2),
    prioridad VARCHAR(1),
    dias INT,
    conclusion VARCHAR(2)
);

INSERT INTO @tramites VALUES
    (5004, 'Andrea López', 'PE123456', '01', '1', 1, NULL),
    (5005, 'Ricardo Campos', 'BO789012', '02', '2', 3, NULL),
    (5006, 'Sofía Reyes', 'EC345678', '03', '1', 5, NULL),
    (5007, 'Diego Moreno', 'PY901234', '04', '3', 7, NULL),
    (5008, 'Valentina Cruz', 'UY567890', '05', '2', 10, NULL),
    (5009, 'Sebastián Vega', 'CL234567', '08', '1', 12, 'PA'),
    (5010, 'Camila Torres', 'AR890123', '10', '2', 15, 'AP');

DECLARE @num INT, @sol VARCHAR(100), @pas VARCHAR(50), @est VARCHAR(2), @pri VARCHAR(1), @dias INT, @conc VARCHAR(2);
DECLARE tram_cursor CURSOR FOR 
    SELECT num, solicitante, pasaporte, estado, prioridad, dias, conclusion FROM @tramites;

OPEN tram_cursor;
FETCH NEXT FROM tram_cursor INTO @num, @sol, @pas, @est, @pri, @dias, @conc;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF NOT EXISTS (SELECT 1 FROM SIM_FT_TRAMITE_E WHERE NUM_ANNIO = 2025 AND NUM_TRAMITE = @num AND NUM_REGISTRO = 1)
    BEGIN
        INSERT INTO SIM_FT_TRAMITE_E (
            NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO, COD_TRAMITE,
            FEC_INI_TRAMITE, IND_ESTATUS, IND_PRIORIDAD, IND_CONCLUSION,
            FEC_FIN_TRAMITE, OBS_OBSERVA, ID_USUARIO_CREA, FEC_ACTUALIZA
        ) VALUES (
            2025, @num, 1, 'PERM_TEMP',
            DATEADD(DAY, -@dias, GETDATE()), @est, @pri, @conc,
            CASE WHEN @conc IS NOT NULL THEN DATEADD(DAY, -1, GETDATE()) ELSE NULL END,
            'Solicitante: ' + @sol + ' | Pasaporte: ' + @pas,
            'ADMIN', GETDATE()
        );
        PRINT '  ✅ Trámite 2025-' + CAST(@num AS VARCHAR) + '-1: ' + @sol;
    END
    FETCH NEXT FROM tram_cursor INTO @num, @sol, @pas, @est, @pri, @dias, @conc;
END

CLOSE tram_cursor;
DEALLOCATE tram_cursor;
GO

-- ============================================================================
-- PARTE 4: INSTANCIAS DE WORKFLOW ADICIONALES (5 casos)
-- ============================================================================
PRINT '';
PRINT '🔄 PARTE 4/4 - Instancias de Workflow adicionales...';

-- Obtener IDs de workflows
DECLARE @workflow_ppsh_id INT, @workflow_general_id INT;
SELECT @workflow_ppsh_id = id FROM workflow WHERE codigo = 'WF_PPSH';
SELECT @workflow_general_id = id FROM workflow WHERE codigo = 'WF_GENERAL';

-- Instancias en diferentes estados
DECLARE @instancias TABLE (
    workflow_id INT,
    num_exp VARCHAR(50),
    nombre VARCHAR(255),
    estado VARCHAR(20),
    dias INT
);

INSERT INTO @instancias VALUES
    (@workflow_ppsh_id, 'PPSH-2025-ADD-001', 'Solicitud Carlos Ramírez', 'en_proceso', 2),
    (@workflow_ppsh_id, 'PPSH-2025-ADD-002', 'Solicitud Ana Morales', 'en_proceso', 5),
    (@workflow_ppsh_id, 'PPSH-2025-ADD-003', 'Solicitud José Fernández', 'completado', 15),
    (@workflow_general_id, 'TRAM-2025-5004', 'Trámite Andrea López', 'en_proceso', 1),
    (@workflow_general_id, 'TRAM-2025-5005', 'Trámite Ricardo Campos', 'en_proceso', 3);

DECLARE @wf_id INT, @num_exp VARCHAR(50), @nombre VARCHAR(255), @est_wf VARCHAR(20), @dias_wf INT;
DECLARE inst_cursor CURSOR FOR 
    SELECT workflow_id, num_exp, nombre, estado, dias FROM @instancias;

OPEN inst_cursor;
FETCH NEXT FROM inst_cursor INTO @wf_id, @num_exp, @nombre, @est_wf, @dias_wf;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF @wf_id IS NOT NULL
    BEGIN
        -- Obtener primera etapa del workflow
        DECLARE @etapa_id INT;
        SELECT TOP 1 @etapa_id = id FROM workflow_etapa 
        WHERE workflow_id = @wf_id ORDER BY orden;
        
        IF @etapa_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM workflow_instancia WHERE num_expediente = @num_exp
        )
        BEGIN
            INSERT INTO workflow_instancia (
                workflow_id, etapa_actual_id, num_expediente, nombre_instancia,
                estado, fecha_inicio, fecha_fin, prioridad, activo, created_at
            ) VALUES (
                @wf_id, @etapa_id, @num_exp, @nombre, @est_wf,
                DATEADD(DAY, -@dias_wf, GETDATE()),
                CASE WHEN @est_wf = 'completado' THEN GETDATE() ELSE NULL END,
                'NORMAL', 1, GETDATE()
            );
            PRINT '  ✅ Instancia workflow: ' + @nombre;
        END
    END
    FETCH NEXT FROM inst_cursor INTO @wf_id, @num_exp, @nombre, @est_wf, @dias_wf;
END

CLOSE inst_cursor;
DEALLOCATE inst_cursor;
GO

-- ============================================================================
-- RESUMEN FINAL
-- ============================================================================
PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '    ✅ DATOS ADICIONALES CARGADOS EXITOSAMENTE';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '';
PRINT '📊 RESUMEN DE DATOS ADICIONALES:';
PRINT '   • 10 Solicitantes PPSH nuevos';
PRINT '   • 10 Solicitudes PPSH con diferentes estados';
PRINT '   • 7 Trámites SIM_FT adicionales';
PRINT '   • 5 Instancias de Workflow nuevas';
PRINT '';
PRINT '🎯 TOTAL ACUMULADO ESTIMADO:';
PRINT '   • ~24 Solicitantes PPSH';
PRINT '   • ~16 Solicitudes PPSH';
PRINT '   • ~17 Trámites SIM_FT';
PRINT '   • ~6 Instancias de Workflow';
PRINT '';
PRINT '✅ Base de datos lista para pruebas extensivas!';
PRINT '';
GO
