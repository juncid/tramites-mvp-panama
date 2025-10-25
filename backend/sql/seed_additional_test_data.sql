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

-- Solicitantes de diferentes nacionalidades y situaciones
DECLARE @solicitantes TABLE (
    nombre VARCHAR(100),
    apellido1 VARCHAR(100),
    apellido2 VARCHAR(100),
    tipo_doc VARCHAR(20),
    num_doc VARCHAR(50),
    nacionalidad VARCHAR(3),
    fecha_nac DATE,
    sexo CHAR(1),
    email VARCHAR(100),
    telefono VARCHAR(20)
);

INSERT INTO @solicitantes VALUES
    ('Carlos', 'Ramírez', 'Sánchez', 'PASAPORTE', 'VE8765432', 'VE', '1985-03-15', 'M', 'carlos.ramirez@example.com', '+507-6100-0001'),
    ('Ana', 'Morales', 'Torres', 'PASAPORTE', 'CU1234567', 'CU', '1990-07-22', 'F', 'ana.morales@example.com', '+507-6100-0002'),
    ('José', 'Fernández', 'López', 'PASAPORTE', 'NI9876543', 'NI', '1978-11-30', 'M', 'jose.fernandez@example.com', '+507-6100-0003'),
    ('Lucía', 'Castillo', 'Ruiz', 'PASAPORTE', 'HN2345678', 'HN', '1995-05-18', 'F', 'lucia.castillo@example.com', '+507-6100-0004'),
    ('Miguel', 'Díaz', 'Gómez', 'CEDULA', 'CO34567890', 'CO', '1982-09-25', 'M', 'miguel.diaz@example.com', '+507-6100-0005'),
    ('Elena', 'Vargas', 'Medina', 'PASAPORTE', 'VE5432109', 'VE', '1988-01-12', 'F', 'elena.vargas@example.com', '+507-6100-0006'),
    ('Roberto', 'Gutiérrez', 'Silva', 'PASAPORTE', 'NI6543210', 'NI', '1975-12-08', 'M', 'roberto.gutierrez@example.com', '+507-6100-0007'),
    ('Patricia', 'Herrera', 'Ortiz', 'CEDULA', 'VE7654321', 'VE', '1992-04-20', 'F', 'patricia.herrera@example.com', '+507-6100-0008'),
    ('Fernando', 'Ramos', 'Castro', 'PASAPORTE', 'CU8765432', 'CU', '1980-06-14', 'M', 'fernando.ramos@example.com', '+507-6100-0009'),
    ('Gabriela', 'Mendoza', 'Pérez', 'PASAPORTE', 'HN9876543', 'HN', '1993-08-05', 'F', 'gabriela.mendoza@example.com', '+507-6100-0010');

-- Insertar solicitantes
DECLARE @nom VARCHAR(100), @ap1 VARCHAR(100), @ap2 VARCHAR(100), @tdoc VARCHAR(20), 
        @ndoc VARCHAR(50), @nac VARCHAR(3), @fnac DATE, @sex CHAR(1), @email VARCHAR(100), @tel VARCHAR(20);

DECLARE sol_cursor CURSOR FOR 
    SELECT nombre, apellido1, apellido2, tipo_doc, num_doc, nacionalidad, fecha_nac, sexo, email, telefono 
    FROM @solicitantes;

OPEN sol_cursor;
FETCH NEXT FROM sol_cursor INTO @nom, @ap1, @ap2, @tdoc, @ndoc, @nac, @fnac, @sex, @email, @tel;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF NOT EXISTS (SELECT 1 FROM PPSH_SOLICITANTE WHERE NUM_DOCUMENTO = @ndoc)
    BEGIN
        INSERT INTO PPSH_SOLICITANTE (
            NOMBRE, APELLIDO_1, APELLIDO_2, TIPO_DOCUMENTO, NUM_DOCUMENTO,
            COD_PAIS_NACIONALIDAD, FEC_NACIMIENTO, COD_SEXO,
            EMAIL, NUM_TELEFONO, FEC_CREA_REG, ID_USUARIO_CREA
        ) VALUES (
            @nom, @ap1, @ap2, @tdoc, @ndoc, @nac, @fnac, @sex,
            @email, @tel, GETDATE(), 'ADMIN'
        );
        PRINT '  ✅ ' + @nom + ' ' + @ap1 + ' (' + @ndoc + ')';
    END
    FETCH NEXT FROM sol_cursor INTO @nom, @ap1, @ap2, @tdoc, @ndoc, @nac, @fnac, @sex, @email, @tel;
END

CLOSE sol_cursor;
DEALLOCATE sol_cursor;
GO

-- ============================================================================
-- PARTE 2: SOLICITUDES PPSH ADICIONALES (10 casos)
-- ============================================================================
PRINT '';
PRINT '📝 PARTE 2/4 - Solicitudes PPSH adicionales...';

-- Obtener IDs de solicitantes para crear solicitudes
DECLARE @solicitudes TABLE (
    num_doc VARCHAR(50),
    tipo_sol VARCHAR(20),
    causa_id INT,
    motivo TEXT,
    estado VARCHAR(20),
    dias_atras INT
);

INSERT INTO @solicitudes VALUES
    ('VE8765432', 'PPSH', 1, 'Persecución política por activismo en Venezuela', 'RECIBIDO', 2),
    ('CU1234567', 'PPSH', 2, 'Amenazas por orientación política en Cuba', 'EN_REVISION', 5),
    ('NI9876543', 'PROTECCION', 3, 'Violencia de género - amenazas de muerte', 'EN_REVISION', 7),
    ('HN2345678', 'PPSH', 4, 'Persecución por pertenecer a minoría étnica', 'DOCUMENTOS_INCOMPLETOS', 10),
    ('CO34567890', 'PPSH', 1, 'Amenazas por trabajo como periodista', 'EN_ENTREVISTA', 12),
    ('VE5432109', 'PROTECCION', 5, 'Violencia doméstica extrema - riesgo de vida', 'APROBADO', 15),
    ('NI6543210', 'PPSH', 2, 'Persecución por activismo sindical', 'RECHAZADO', 20),
    ('VE7654321', 'PPSH', 1, 'Amenazas por denuncia de corrupción', 'RECIBIDO', 1),
    ('CU8765432', 'PPSH', 6, 'Persecución religiosa', 'EN_REVISION', 4),
    ('HN9876543', 'PROTECCION', 3, 'Violencia de pandillas - testigo protegido', 'EN_ENTREVISTA', 8);

-- Insertar solicitudes
DECLARE @ndoc VARCHAR(50), @tipo VARCHAR(20), @causa INT, @motivo TEXT, @estado VARCHAR(20), @dias INT, @sol_id INT;
DECLARE solic_cursor CURSOR FOR 
    SELECT num_doc, tipo_sol, causa_id, motivo, estado, dias_atras FROM @solicitudes;

OPEN solic_cursor;
FETCH NEXT FROM solic_cursor INTO @ndoc, @tipo, @causa, @motivo, @estado, @dias;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Obtener ID del solicitante
    SELECT @sol_id = ID FROM PPSH_SOLICITANTE WHERE NUM_DOCUMENTO = @ndoc;
    
    IF @sol_id IS NOT NULL
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM PPSH_SOLICITUD 
            WHERE ID_SOLICITANTE = @sol_id 
            AND FEC_SOLICITUD = DATEADD(DAY, -@dias, GETDATE())
        )
        BEGIN
            INSERT INTO PPSH_SOLICITUD (
                ID_SOLICITANTE, TIPO_SOLICITUD, ID_CAUSA_HUMANITARIA,
                MOTIVO_SOLICITUD, COD_ESTADO, FEC_SOLICITUD,
                ID_USUARIO_CREA, FEC_CREA_REG
            ) VALUES (
                @sol_id, @tipo, @causa, @motivo, @estado,
                DATEADD(DAY, -@dias, GETDATE()), 'ADMIN', GETDATE()
            );
            
            -- Generar número de expediente
            DECLARE @exp_id INT, @num_exp VARCHAR(50);
            SELECT @exp_id = SCOPE_IDENTITY();
            SET @num_exp = 'PPSH-2025-' + RIGHT('00000' + CAST(@exp_id AS VARCHAR), 5);
            
            UPDATE PPSH_SOLICITUD 
            SET NUM_EXPEDIENTE = @num_exp
            WHERE ID = @exp_id;
            
            PRINT '  ✅ Solicitud ' + @num_exp + ' - Estado: ' + @estado;
        END
    END
    
    FETCH NEXT FROM solic_cursor INTO @ndoc, @tipo, @causa, @motivo, @estado, @dias;
END

CLOSE solic_cursor;
DEALLOCATE solic_cursor;
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
    ref_tipo VARCHAR(50),
    ref_id INT,
    estado VARCHAR(20),
    descripcion VARCHAR(255),
    dias INT
);

INSERT INTO @instancias VALUES
    (@workflow_ppsh_id, 'PPSH_SOLICITUD', 1, 'activa', 'Procesando solicitud de Carlos Ramírez', 2),
    (@workflow_ppsh_id, 'PPSH_SOLICITUD', 2, 'activa', 'Procesando solicitud de Ana Morales', 5),
    (@workflow_ppsh_id, 'PPSH_SOLICITUD', 3, 'completada', 'Solicitud de José Fernández completada', 15),
    (@workflow_general_id, 'TRAMITE', 5004, 'activa', 'Trámite de Andrea López en proceso', 1),
    (@workflow_general_id, 'TRAMITE', 5005, 'activa', 'Trámite de Ricardo Campos en proceso', 3);

DECLARE @wf_id INT, @ref_tipo VARCHAR(50), @ref_id INT, @est_wf VARCHAR(20), @desc VARCHAR(255), @dias_wf INT;
DECLARE inst_cursor CURSOR FOR 
    SELECT workflow_id, ref_tipo, ref_id, estado, descripcion, dias FROM @instancias;

OPEN inst_cursor;
FETCH NEXT FROM inst_cursor INTO @wf_id, @ref_tipo, @ref_id, @est_wf, @desc, @dias_wf;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF @wf_id IS NOT NULL
    BEGIN
        -- Obtener primera etapa del workflow
        DECLARE @etapa_id INT;
        SELECT TOP 1 @etapa_id = id FROM workflow_etapa 
        WHERE id_workflow = @wf_id ORDER BY orden;
        
        IF @etapa_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM workflow_instancia 
            WHERE id_workflow = @wf_id 
            AND referencia_tipo = @ref_tipo 
            AND referencia_id = @ref_id
        )
        BEGIN
            INSERT INTO workflow_instancia (
                id_workflow, id_etapa_actual, referencia_tipo, referencia_id,
                estado, fecha_inicio, fecha_fin, datos_contexto,
                id_usuario_crea, fec_crea_reg
            ) VALUES (
                @wf_id, @etapa_id, @ref_tipo, @ref_id, @est_wf,
                DATEADD(DAY, -@dias_wf, GETDATE()),
                CASE WHEN @est_wf = 'completada' THEN GETDATE() ELSE NULL END,
                '{"descripcion": "' + @desc + '"}',
                'ADMIN', GETDATE()
            );
            PRINT '  ✅ Instancia workflow: ' + @desc;
        END
    END
    FETCH NEXT FROM inst_cursor INTO @wf_id, @ref_tipo, @ref_id, @est_wf, @desc, @dias_wf;
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
