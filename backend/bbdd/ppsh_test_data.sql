-- ==========================================
-- Datos de Prueba Completos - Sistema PPSH
-- Sistema de Trámites Migratorios de Panamá
-- Fecha: 2025-10-23
-- ==========================================

USE [SIM_PANAMA]
GO

PRINT '=========================================='
PRINT 'GENERANDO DATOS DE PRUEBA PPSH'
PRINT '=========================================='
PRINT ''

-- ==========================================
-- PASO 1: Conceptos de Pago
-- ==========================================

PRINT 'Creando conceptos de pago...'

IF NOT EXISTS (SELECT 1 FROM PPSH_CONCEPTO_PAGO WHERE cod_concepto = 'PPSH_TRAM')
BEGIN
    INSERT INTO PPSH_CONCEPTO_PAGO (cod_concepto, nom_concepto, monto_usd, descripcion, activo, created_at, created_by)
    VALUES 
        ('PPSH_TRAM', 'Trámite PPSH', '50.00', 'Costo del trámite de solicitud PPSH', 1, GETDATE(), 'admin'),
        ('PPSH_RENOV', 'Renovación PPSH', '30.00', 'Renovación de permiso PPSH', 1, GETDATE(), 'admin'),
        ('PPSH_DUPLIC', 'Duplicado Carnet', '15.00', 'Emisión de duplicado de carnet', 1, GETDATE(), 'admin')
    
    PRINT '✓ Conceptos de pago creados'
END
ELSE
BEGIN
    PRINT '✓ Conceptos de pago ya existen'
END
GO

-- ==========================================
-- PASO 2: Solicitudes de Prueba
-- ==========================================

PRINT ''
PRINT 'Creando solicitudes de prueba...'

-- Verificar si ya existen solicitudes
IF NOT EXISTS (SELECT 1 FROM PPSH_SOLICITUD WHERE num_expediente LIKE 'PPSH-2025-%')
BEGIN
    -- Solicitud 1: Familia Venezolana (En Evaluación)
    INSERT INTO PPSH_SOLICITUD (
        num_expediente, tipo_solicitud, cod_causa_humanitaria, descripcion_caso,
        fecha_solicitud, estado_actual, prioridad, cod_agencia, cod_seccion,
        user_id_asignado, fecha_asignacion, observaciones_generales, created_at, created_by, activo
    )
    VALUES (
        'PPSH-2025-0001', 'GRUPAL', 3, -- Persecución Política
        'Familia venezolana con riesgo político documentado. Padre periodista perseguido por régimen actual.',
        DATEADD(day, -45, GETDATE()), 'EN_EVALUACION', 'ALTA', '01', '03',
        'admin', DATEADD(day, -43, GETDATE()), 
        'Caso prioritario. Expediente completo. En espera de dictamen.',
        GETDATE(), 'admin', 1
    )
    
    DECLARE @id_sol1 INT = SCOPE_IDENTITY()
    
    -- Titular
    INSERT INTO PPSH_SOLICITANTE (
        id_solicitud, es_titular, tipo_documento, num_documento, pais_emisor,
        fecha_emision_doc, fecha_vencimiento_doc,
        primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
        fecha_nacimiento, cod_sexo, cod_nacionalidad, cod_estado_civil,
        email, telefono, direccion_panama, ocupacion, created_at, created_by, activo
    )
    VALUES (
        @id_sol1, 1, 'PASAPORTE', 'E31245678', 'VEN',
        '2020-01-15', '2030-01-15',
        'Carlos', 'Andrés', 'González', 'Pérez',
        '1985-05-15', 'M', 'VEN', 'C',
        'carlos.gonzalez@email.com', '+507-6123-4567', 
        'Vía España, Apartamento 123, Ciudad de Panamá',
        'Periodista', GETDATE(), 'admin', 1
    )
    
    -- Cónyuge
    INSERT INTO PPSH_SOLICITANTE (
        id_solicitud, es_titular, tipo_documento, num_documento, pais_emisor,
        fecha_emision_doc, fecha_vencimiento_doc,
        primer_nombre, primer_apellido, segundo_apellido,
        fecha_nacimiento, cod_sexo, cod_nacionalidad, cod_estado_civil,
        parentesco_titular, email, telefono, ocupacion, created_at, created_by, activo
    )
    VALUES (
        @id_sol1, 0, 'PASAPORTE', 'E32456789', 'VEN',
        '2020-01-20', '2030-01-20',
        'María', 'Rodríguez', 'López',
        '1987-08-20', 'F', 'VEN', 'C',
        'CONYUGE', 'maria.rodriguez@email.com', '+507-6123-4568',
        'Enfermera', GETDATE(), 'admin', 1
    )
    
    -- Hijos
    INSERT INTO PPSH_SOLICITANTE (
        id_solicitud, es_titular, tipo_documento, num_documento, pais_emisor,
        primer_nombre, primer_apellido,
        fecha_nacimiento, cod_sexo, cod_nacionalidad, cod_estado_civil,
        parentesco_titular, created_at, created_by, activo
    )
    VALUES 
        (@id_sol1, 0, 'PASAPORTE', 'E33567890', 'VEN', 'Sofía', 'González',
         '2010-03-10', 'F', 'VEN', 'S', 'HIJO', GETDATE(), 'admin', 1),
        (@id_sol1, 0, 'PASAPORTE', 'E34678901', 'VEN', 'Diego', 'González',
         '2015-11-25', 'M', 'VEN', 'S', 'HIJO', GETDATE(), 'admin', 1)
    
    -- Comentarios
    INSERT INTO PPSH_COMENTARIO (id_solicitud, user_id, comentario, es_interno, created_at)
    VALUES
        (@id_sol1, 'admin', 'Expediente completo y bien documentado. Evidencia contundente de persecución política.', 1, GETDATE()),
        (@id_sol1, 'admin', 'Contacto telefónico realizado. Familia disponible para entrevista si requerido.', 1, DATEADD(day, -2, GETDATE()))
    
    PRINT '✓ Solicitud 1: Familia venezolana (PPSH-2025-0001)'
    
    -- Solicitud 2: Persona Individual (Razones Médicas - En Revisión)
    INSERT INTO PPSH_SOLICITUD (
        num_expediente, tipo_solicitud, cod_causa_humanitaria, descripcion_caso,
        fecha_solicitud, estado_actual, prioridad, cod_agencia, cod_seccion,
        user_id_asignado, fecha_asignacion, created_at, created_by, activo
    )
    VALUES (
        'PPSH-2025-0002', 'INDIVIDUAL', 5, -- Razones Médicas
        'Ciudadana colombiana requiere tratamiento oncológico especializado disponible solo en Panamá.',
        DATEADD(day, -30, GETDATE()), 'EN_REVISION', 'ALTA', '02', '03',
        'admin', DATEADD(day, -28, GETDATE()), GETDATE(), 'admin', 1
    )
    
    DECLARE @id_sol2 INT = SCOPE_IDENTITY()
    
    INSERT INTO PPSH_SOLICITANTE (
        id_solicitud, es_titular, tipo_documento, num_documento, pais_emisor,
        fecha_emision_doc, fecha_vencimiento_doc,
        primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
        fecha_nacimiento, cod_sexo, cod_nacionalidad, cod_estado_civil,
        email, telefono, direccion_panama, ocupacion, created_at, created_by, activo
    )
    VALUES (
        @id_sol2, 1, 'PASAPORTE', 'CC12345678', 'COL',
        '2019-06-10', '2029-06-10',
        'Ana', 'María', 'Martínez', 'Silva',
        '1975-12-08', 'F', 'COL', 'D',
        'ana.martinez@email.com', '+507-6234-5678',
        'Vía Brasil, residencial temporal',
        'Docente', GETDATE(), 'admin', 1
    )
    
    PRINT '✓ Solicitud 2: Caso médico (PPSH-2025-0002)'
    
    -- Solicitud 3: Reunificación Familiar (Pendiente)
    INSERT INTO PPSH_SOLICITUD (
        num_expediente, tipo_solicitud, cod_causa_humanitaria, descripcion_caso,
        fecha_solicitud, estado_actual, prioridad, cod_agencia, cod_seccion,
        created_at, created_by, activo
    )
    VALUES (
        'PPSH-2025-0003', 'GRUPAL', 4, -- Reunificación Familiar
        'Madre nicaragüense con dos hijos menores solicita reunificación con esposo residente en Panamá.',
        DATEADD(day, -15, GETDATE()), 'RECIBIDO', 'NORMAL', '01', '03',
        GETDATE(), 'admin', 1
    )
    
    DECLARE @id_sol3 INT = SCOPE_IDENTITY()
    
    INSERT INTO PPSH_SOLICITANTE (
        id_solicitud, es_titular, tipo_documento, num_documento, pais_emisor,
        primer_nombre, primer_apellido, segundo_apellido,
        fecha_nacimiento, cod_sexo, cod_nacionalidad, cod_estado_civil,
        email, telefono, ocupacion, created_at, created_by, activo
    )
    VALUES (
        @id_sol3, 1, 'PASAPORTE', 'C45678901', 'CRI',
        'Rosa', 'Hernández', 'Morales',
        '1990-07-22', 'F', 'CRI', 'C',
        'rosa.hernandez@email.com', '+507-6345-6789',
        'Ama de casa', GETDATE(), 'admin', 1
    )
    
    -- Hijos
    INSERT INTO PPSH_SOLICITANTE (
        id_solicitud, es_titular, tipo_documento, num_documento, pais_emisor,
        primer_nombre, primer_apellido,
        fecha_nacimiento, cod_sexo, cod_nacionalidad, cod_estado_civil,
        parentesco_titular, created_at, created_by, activo
    )
    VALUES
        (@id_sol3, 0, 'PASAPORTE', 'C45678902', 'CRI', 'Luis', 'Hernández',
         '2012-04-18', 'M', 'CRI', 'S', 'HIJO', GETDATE(), 'admin', 1),
        (@id_sol3, 0, 'PASAPORTE', 'C45678903', 'CRI', 'Carmen', 'Hernández',
         '2016-09-30', 'F', 'CRI', 'S', 'HIJO', GETDATE(), 'admin', 1)
    
    PRINT '✓ Solicitud 3: Reunificación familiar (PPSH-2025-0003)'
    
    -- Solicitud 4: Caso Aprobado
    INSERT INTO PPSH_SOLICITUD (
        num_expediente, tipo_solicitud, cod_causa_humanitaria, descripcion_caso,
        fecha_solicitud, estado_actual, prioridad, cod_agencia, cod_seccion,
        user_id_asignado, fecha_asignacion, num_resolucion, fecha_resolucion,
        fecha_vencimiento_permiso, created_at, created_by, activo
    )
    VALUES (
        'PPSH-2025-0004', 'INDIVIDUAL', 1, -- Conflicto Armado
        'Ciudadano sirio refugiado de zona de guerra. Documentación respaldada por ACNUR.',
        DATEADD(day, -90, GETDATE()), 'RESUELTO', 'ALTA', '01', '03',
        'admin', DATEADD(day, -88, GETDATE()), 
        'RES-PPSH-2025-001', DATEADD(day, -10, GETDATE()),
        DATEADD(year, 2, GETDATE()), GETDATE(), 'admin', 1
    )
    
    DECLARE @id_sol4 INT = SCOPE_IDENTITY()
    
    INSERT INTO PPSH_SOLICITANTE (
        id_solicitud, es_titular, tipo_documento, num_documento, pais_emisor,
        primer_nombre, segundo_nombre, primer_apellido,
        fecha_nacimiento, cod_sexo, cod_nacionalidad, cod_estado_civil,
        email, telefono, ocupacion, created_at, created_by, activo
    )
    VALUES (
        @id_sol4, 1, 'PASAPORTE', 'SY9876543', 'SYR',
        'Ahmed', 'Hassan', 'Al-Rahman',
        '1982-03-15', 'M', 'SYR', 'S',
        'ahmed.rahman@email.com', '+507-6456-7890',
        'Ingeniero Civil', GETDATE(), 'admin', 1
    )
    
    -- Pago
    INSERT INTO PPSH_PAGO (
        id_solicitud, monto_usd, tipo_concepto, estado_tesoreria, 
        num_recibo, fecha_pago, metodo_pago, observaciones,
        created_at, created_by
    )
    VALUES (
        @id_sol4, '50.00', 'PPSH_TRAM', 'PAGADO',
        'REC-2025-00123', DATEADD(day, -85, GETDATE()), 'TRANSFERENCIA',
        'Pago realizado por transferencia bancaria',
        DATEADD(day, -85, GETDATE()), 'admin'
    )
    
    -- Entrevista
    INSERT INTO PPSH_ENTREVISTA (
        id_solicitud, fecha_programada, fecha_realizada, lugar, cod_agencia,
        entrevistador_user_id, asistio, resultado, observaciones, 
        requiere_segunda_entrevista, created_at, created_by
    )
    VALUES (
        @id_sol4, DATEADD(day, -45, GETDATE()), DATEADD(day, -45, GETDATE()),
        'Oficina Central SNM', '02', 'admin', 1, 'FAVORABLE',
        'Solicitante demostró documentación completa. Habla español con fluidez.',
        0, DATEADD(day, -45, GETDATE()), 'admin'
    )
    
    PRINT '✓ Solicitud 4: Caso aprobado (PPSH-2025-0004)'
    
    -- Solicitud 5: Caso Rechazado
    INSERT INTO PPSH_SOLICITUD (
        num_expediente, tipo_solicitud, cod_causa_humanitaria, descripcion_caso,
        fecha_solicitud, estado_actual, prioridad, cod_agencia, cod_seccion,
        user_id_asignado, fecha_asignacion, created_at, created_by, activo
    )
    VALUES (
        'PPSH-2025-0005', 'INDIVIDUAL', 10, -- Otro
        'Solicitud con causa humanitaria no claramente definida.',
        DATEADD(day, -60, GETDATE()), 'RECHAZADO', 'BAJA', '01', '03',
        'admin', DATEADD(day, -58, GETDATE()), GETDATE(), 'admin', 1
    )
    
    DECLARE @id_sol5 INT = SCOPE_IDENTITY()
    
    INSERT INTO PPSH_SOLICITANTE (
        id_solicitud, es_titular, tipo_documento, num_documento, pais_emisor,
        primer_nombre, primer_apellido,
        fecha_nacimiento, cod_sexo, cod_nacionalidad, cod_estado_civil,
        created_at, created_by, activo
    )
    VALUES (
        @id_sol5, 1, 'PASAPORTE', 'X98765432', 'MEX',
        'Pedro', 'López',
        '1995-06-20', 'M', 'MEX', 'S',
        GETDATE(), 'admin', 1
    )
    
    PRINT '✓ Solicitud 5: Caso rechazado (PPSH-2025-0005)'
    
END
ELSE
BEGIN
    PRINT '✓ Ya existen solicitudes de prueba'
END
GO

-- ==========================================
-- RESUMEN
-- ==========================================

PRINT ''
PRINT '=========================================='
PRINT 'DATOS DE PRUEBA GENERADOS'
PRINT '=========================================='
PRINT ''

SELECT 
    'Solicitudes Creadas' AS Metrica,
    COUNT(*) AS Cantidad
FROM PPSH_SOLICITUD
WHERE num_expediente LIKE 'PPSH-2025-%'

UNION ALL

SELECT 
    'Solicitantes',
    COUNT(*)
FROM PPSH_SOLICITANTE s
INNER JOIN PPSH_SOLICITUD sol ON s.id_solicitud = sol.id_solicitud
WHERE sol.num_expediente LIKE 'PPSH-2025-%'

UNION ALL

SELECT 
    'Conceptos de Pago',
    COUNT(*)
FROM PPSH_CONCEPTO_PAGO

UNION ALL

SELECT 
    'Pagos Registrados',
    COUNT(*)
FROM PPSH_PAGO p
INNER JOIN PPSH_SOLICITUD sol ON p.id_solicitud = sol.id_solicitud
WHERE sol.num_expediente LIKE 'PPSH-2025-%'

UNION ALL

SELECT 
    'Entrevistas',
    COUNT(*)
FROM PPSH_ENTREVISTA e
INNER JOIN PPSH_SOLICITUD sol ON e.id_solicitud = sol.id_solicitud
WHERE sol.num_expediente LIKE 'PPSH-2025-%'

PRINT ''
PRINT 'Solicitudes por Estado:'
PRINT ''

SELECT 
    estado_actual AS Estado,
    COUNT(*) AS Cantidad,
    prioridad AS Prioridad
FROM PPSH_SOLICITUD
WHERE num_expediente LIKE 'PPSH-2025-%'
GROUP BY estado_actual, prioridad
ORDER BY 
    CASE prioridad 
        WHEN 'ALTA' THEN 1 
        WHEN 'NORMAL' THEN 2 
        WHEN 'BAJA' THEN 3 
    END,
    COUNT(*) DESC

PRINT ''
PRINT '✅ Datos listos para consumir desde Postman'
PRINT ''
PRINT 'Solicitudes disponibles:'
PRINT '  - PPSH-2025-0001: Familia venezolana (EN_EVALUACION)'
PRINT '  - PPSH-2025-0002: Caso médico (EN_REVISION)'
PRINT '  - PPSH-2025-0003: Reunificación familiar (RECIBIDO)'
PRINT '  - PPSH-2025-0004: Caso aprobado (RESUELTO)'
PRINT '  - PPSH-2025-0005: Caso rechazado (RECHAZADO)'
PRINT ''

GO
