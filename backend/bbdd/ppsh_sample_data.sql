-- ==========================================
-- Datos de Ejemplo - Sistema PPSH
-- Sistema de Trámites Migratorios de Panamá
-- Fecha: 2025-10-13
-- ==========================================

USE [SIM_PANAMA]
GO

PRINT '=========================================='
PRINT 'CARGANDO DATOS DE EJEMPLO PPSH'
PRINT '=========================================='
PRINT ''

-- ==========================================
-- CASO 1: Familia Venezolana (Conflicto Político)
-- ==========================================

PRINT 'Creando Caso 1: Familia venezolana...'

DECLARE @num_exp1 VARCHAR(20)
DECLARE @id_sol1 INT

EXEC SP_PPSH_GENERAR_NUM_EXPEDIENTE @num_exp1 OUTPUT

INSERT INTO PPSH_SOLICITUD (
    num_expediente, tipo_solicitud, cod_causa_humanitaria, descripcion_caso,
    fecha_solicitud, estado_actual, prioridad, cod_agencia, cod_seccion,
    user_id_asignado, fecha_asignacion, observaciones_generales, created_by
)
VALUES (
    @num_exp1, 'GRUPAL', 3, -- Persecución Política
    'Familia venezolana con riesgo político documentado. Padre periodista perseguido por régimen. Solicitante principal trabajaba en medios de comunicación independientes. Cuenta con documentación de amenazas y orden de captura en su contra.',
    DATEADD(day, -45, GETDATE()), 'EN_EVALUACION', 'ALTA', '01', '03',
    'admin', DATEADD(day, -43, GETDATE()), 
    'Caso prioritario. Expediente completo. En espera de dictamen.',
    'admin'
)

SET @id_sol1 = SCOPE_IDENTITY()

-- Titular
INSERT INTO PPSH_SOLICITANTE (
    id_solicitud, es_titular, tipo_documento, num_documento, pais_emisor,
    fecha_emision_doc, fecha_vencimiento_doc,
    primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
    fecha_nacimiento, cod_sexo, cod_nacionalidad, cod_estado_civil,
    email, telefono, direccion_panama, ocupacion, created_by
)
VALUES (
    @id_sol1, 1, 'PASAPORTE', 'E31245678', 'VEN',
    '2020-01-15', '2030-01-15',
    'Carlos', 'Andrés', 'González', 'Pérez',
    '1985-05-15', 'M', 'VEN', 'C',
    'carlos.gonzalez@email.com', '+507-6123-4567', 
    'Vía España, Apartamento 123, Ciudad de Panamá',
    'Periodista', 'admin'
)

-- Cónyuge
INSERT INTO PPSH_SOLICITANTE (
    id_solicitud, es_titular, tipo_documento, num_documento, pais_emisor,
    fecha_emision_doc, fecha_vencimiento_doc,
    primer_nombre, primer_apellido, segundo_apellido,
    fecha_nacimiento, cod_sexo, cod_nacionalidad, cod_estado_civil,
    parentesco_titular, email, telefono, ocupacion, created_by
)
VALUES (
    @id_sol1, 0, 'PASAPORTE', 'E32456789', 'VEN',
    '2020-01-20', '2030-01-20',
    'María', 'Rodríguez', 'López',
    '1987-08-20', 'F', 'VEN', 'C',
    'CONYUGE', 'maria.rodriguez@email.com', '+507-6123-4568',
    'Enfermera', 'admin'
)

-- Hijos
INSERT INTO PPSH_SOLICITANTE (
    id_solicitud, es_titular, tipo_documento, num_documento, pais_emisor,
    primer_nombre, primer_apellido,
    fecha_nacimiento, cod_sexo, cod_nacionalidad, cod_estado_civil,
    parentesco_titular, created_by
)
VALUES 
    (@id_sol1, 0, 'PASAPORTE', 'E33567890', 'VEN', 'Sofía', 'González',
     '2010-03-10', 'F', 'VEN', 'S', 'HIJO', 'admin'),
    (@id_sol1, 0, 'PASAPORTE', 'E34678901', 'VEN', 'Diego', 'González',
     '2015-11-25', 'M', 'VEN', 'S', 'HIJO', 'admin')

-- Documentos
INSERT INTO PPSH_DOCUMENTO (
    id_solicitud, cod_tipo_documento, nombre_archivo, extension, 
    tamano_bytes, estado_verificacion, uploaded_by
)
VALUES
    (@id_sol1, 1, 'formulario_ppsh_gonzalez.pdf', 'pdf', 245678, 'VERIFICADO', 'admin'),
    (@id_sol1, 2, 'pasaportes_familia.pdf', 'pdf', 1567890, 'VERIFICADO', 'admin'),
    (@id_sol1, 3, 'fotos_familia.pdf', 'pdf', 890123, 'VERIFICADO', 'admin'),
    (@id_sol1, 5, 'evidencia_amenazas.pdf', 'pdf', 3456789, 'VERIFICADO', 'admin'),
    (@id_sol1, 5, 'articulos_periodisticos.pdf', 'pdf', 2345678, 'VERIFICADO', 'admin')

-- Historial
INSERT INTO PPSH_ESTADO_HISTORIAL (
    id_solicitud, estado_anterior, estado_nuevo, fecha_cambio, user_id, observaciones
)
VALUES
    (@id_sol1, 'RECIBIDO', 'EN_REVISION', DATEADD(day, -43, GETDATE()), 'admin', 
     'Asignado a analista para revisión documental'),
    (@id_sol1, 'EN_REVISION', 'EN_VERIFICACION', DATEADD(day, -35, GETDATE()), 'admin',
     'Documentación completa. Iniciando verificación de antecedentes'),
    (@id_sol1, 'EN_VERIFICACION', 'EN_EVALUACION', DATEADD(day, -20, GETDATE()), 'admin',
     'Antecedentes verificados. Evaluando causa humanitaria')

-- Comentarios
INSERT INTO PPSH_COMENTARIO (id_solicitud, user_id, comentario, es_interno)
VALUES
    (@id_sol1, 'admin', 'Expediente completo y bien documentado. Evidencia contundente de persecución política.', 1),
    (@id_sol1, 'admin', 'Contacto telefónico realizado. Familia disponible para entrevista si requerido.', 1)

PRINT '✓ Caso 1 creado: ' + @num_exp1
PRINT ''

-- ==========================================
-- CASO 2: Persona Individual (Razones Médicas)
-- ==========================================

PRINT 'Creando Caso 2: Tratamiento médico urgente...'

DECLARE @num_exp2 VARCHAR(20)
DECLARE @id_sol2 INT

EXEC SP_PPSH_GENERAR_NUM_EXPEDIENTE @num_exp2 OUTPUT

INSERT INTO PPSH_SOLICITUD (
    num_expediente, tipo_solicitud, cod_causa_humanitaria, descripcion_caso,
    fecha_solicitud, estado_actual, prioridad, cod_agencia, cod_seccion,
    user_id_asignado, fecha_asignacion, created_by
)
VALUES (
    @num_exp2, 'INDIVIDUAL', 5, -- Razones Médicas
    'Ciudadana colombiana requiere tratamiento oncológico especializado disponible solo en Panamá. Diagnóstico: cáncer de mama etapa II. Hospital Santo Tomás ha confirmado disponibilidad para tratamiento.',
    DATEADD(day, -30, GETDATE()), 'EN_REVISION', 'ALTA', '02', '03',
    'admin', DATEADD(day, -28, GETDATE()), 'admin'
)

SET @id_sol2 = SCOPE_IDENTITY()

-- Solicitante
INSERT INTO PPSH_SOLICITANTE (
    id_solicitud, es_titular, tipo_documento, num_documento, pais_emisor,
    fecha_emision_doc, fecha_vencimiento_doc,
    primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
    fecha_nacimiento, cod_sexo, cod_nacionalidad, cod_estado_civil,
    email, telefono, direccion_panama, ocupacion, created_by
)
VALUES (
    @id_sol2, 1, 'PASAPORTE', 'CC12345678', 'COL',
    '2019-06-10', '2029-06-10',
    'Ana', 'María', 'Martínez', 'Silva',
    '1975-12-08', 'F', 'COL', 'D',
    'ana.martinez@email.com', '+507-6234-5678',
    'Vía Brasil, residencial temporal',
    'Docente', 'admin'
)

-- Documentos
INSERT INTO PPSH_DOCUMENTO (
    id_solicitud, cod_tipo_documento, nombre_archivo, extension,
    tamano_bytes, estado_verificacion, uploaded_by
)
VALUES
    (@id_sol2, 1, 'formulario_ppsh_martinez.pdf', 'pdf', 198765, 'VERIFICADO', 'admin'),
    (@id_sol2, 2, 'pasaporte_martinez.pdf', 'pdf', 987654, 'VERIFICADO', 'admin'),
    (@id_sol2, 3, 'foto_martinez.jpg', 'jpg', 156789, 'VERIFICADO', 'admin'),
    (@id_sol2, 10, 'informe_medico_oncologia.pdf', 'pdf', 4567890, 'VERIFICADO', 'admin'),
    (@id_sol2, 10, 'carta_hospital_santo_tomas.pdf', 'pdf', 234567, 'VERIFICADO', 'admin')

-- Historial
INSERT INTO PPSH_ESTADO_HISTORIAL (
    id_solicitud, estado_anterior, estado_nuevo, fecha_cambio, user_id, observaciones
)
VALUES
    (@id_sol2, 'RECIBIDO', 'EN_REVISION', DATEADD(day, -28, GETDATE()), 'admin',
     'Caso prioritario por razones médicas urgentes')

PRINT '✓ Caso 2 creado: ' + @num_exp2
PRINT ''

-- ==========================================
-- CASO 3: Familia (Reunificación Familiar)
-- ==========================================

PRINT 'Creando Caso 3: Reunificación familiar...'

DECLARE @num_exp3 VARCHAR(20)
DECLARE @id_sol3 INT

EXEC SP_PPSH_GENERAR_NUM_EXPEDIENTE @num_exp3 OUTPUT

INSERT INTO PPSH_SOLICITUD (
    num_expediente, tipo_solicitud, cod_causa_humanitaria, descripcion_caso,
    fecha_solicitud, estado_actual, prioridad, cod_agencia, cod_seccion,
    user_id_asignado, fecha_asignacion, created_by
)
VALUES (
    @num_exp3, 'GRUPAL', 4, -- Reunificación Familiar
    'Madre nicaragüense con dos hijos menores solicita reunificación con esposo residente permanente en Panamá. Esposo trabaja legalmente desde hace 5 años.',
    DATEADD(day, -15, GETDATE()), 'EN_VERIFICACION', 'NORMAL', '01', '03',
    'admin', DATEADD(day, -13, GETDATE()), 'admin'
)

SET @id_sol3 = SCOPE_IDENTITY()

-- Titular
INSERT INTO PPSH_SOLICITANTE (
    id_solicitud, es_titular, tipo_documento, num_documento, pais_emisor,
    primer_nombre, primer_apellido, segundo_apellido,
    fecha_nacimiento, cod_sexo, cod_nacionalidad, cod_estado_civil,
    parentesco_titular, email, telefono, ocupacion, created_by
)
VALUES (
    @id_sol3, 1, 'PASAPORTE', 'C45678901', 'CRI',
    'Rosa', 'Hernández', 'Morales',
    '1990-07-22', 'F', 'CRI', 'C',
    NULL, 'rosa.hernandez@email.com', '+507-6345-6789',
    'Ama de casa', 'admin'
)

-- Hijos
INSERT INTO PPSH_SOLICITANTE (
    id_solicitud, es_titular, tipo_documento, num_documento, pais_emisor,
    primer_nombre, primer_apellido,
    fecha_nacimiento, cod_sexo, cod_nacionalidad, cod_estado_civil,
    parentesco_titular, created_by
)
VALUES
    (@id_sol3, 0, 'PASAPORTE', 'C45678902', 'CRI', 'Luis', 'Hernández',
     '2012-04-18', 'M', 'CRI', 'S', 'HIJO', 'admin'),
    (@id_sol3, 0, 'PASAPORTE', 'C45678903', 'CRI', 'Carmen', 'Hernández',
     '2016-09-30', 'F', 'CRI', 'S', 'HIJO', 'admin')

-- Documentos
INSERT INTO PPSH_DOCUMENTO (
    id_solicitud, cod_tipo_documento, nombre_archivo, extension,
    tamano_bytes, estado_verificacion, uploaded_by
)
VALUES
    (@id_sol3, 1, 'formulario_hernandez.pdf', 'pdf', 187654, 'VERIFICADO', 'admin'),
    (@id_sol3, 2, 'pasaportes_familia_hernandez.pdf', 'pdf', 1876543, 'PENDIENTE', 'admin'),
    (@id_sol3, 7, 'certificado_matrimonio.pdf', 'pdf', 456789, 'VERIFICADO', 'admin'),
    (@id_sol3, 9, 'carta_invitacion_esposo.pdf', 'pdf', 234567, 'VERIFICADO', 'admin'),
    (@id_sol3, 12, 'actas_nacimiento_hijos.pdf', 'pdf', 567890, 'VERIFICADO', 'admin')

-- Historial
INSERT INTO PPSH_ESTADO_HISTORIAL (
    id_solicitud, estado_anterior, estado_nuevo, fecha_cambio, user_id, observaciones
)
VALUES
    (@id_sol3, 'RECIBIDO', 'EN_REVISION', DATEADD(day, -13, GETDATE()), 'admin',
     'Iniciando revisión de documentación familiar'),
    (@id_sol3, 'EN_REVISION', 'EN_VERIFICACION', DATEADD(day, -8, GETDATE()), 'admin',
     'Documentación completa. Verificando antecedentes')

PRINT '✓ Caso 3 creado: ' + @num_exp3
PRINT ''

-- ==========================================
-- CASO 4: Individual (Conflicto Armado - Aprobado)
-- ==========================================

PRINT 'Creando Caso 4: Caso ya aprobado (ejemplo)...'

DECLARE @num_exp4 VARCHAR(20)
DECLARE @id_sol4 INT

EXEC SP_PPSH_GENERAR_NUM_EXPEDIENTE @num_exp4 OUTPUT

INSERT INTO PPSH_SOLICITUD (
    num_expediente, tipo_solicitud, cod_causa_humanitaria, descripcion_caso,
    fecha_solicitud, estado_actual, prioridad, cod_agencia, cod_seccion,
    user_id_asignado, fecha_asignacion, num_resolucion, fecha_resolucion,
    fecha_vencimiento_permiso, created_by
)
VALUES (
    @num_exp4, 'INDIVIDUAL', 1, -- Conflicto Armado
    'Ciudadano sirio refugiado de zona de guerra. Documentación respaldada por ACNUR.',
    DATEADD(day, -90, GETDATE()), 'RESUELTO', 'ALTA', '01', '03',
    'admin', DATEADD(day, -88, GETDATE()), 
    'RES-PPSH-2025-001', DATEADD(day, -10, GETDATE()),
    DATEADD(year, 2, GETDATE()), 'admin'
)

SET @id_sol4 = SCOPE_IDENTITY()

-- Solicitante
INSERT INTO PPSH_SOLICITANTE (
    id_solicitud, es_titular, tipo_documento, num_documento, pais_emisor,
    primer_nombre, segundo_nombre, primer_apellido,
    fecha_nacimiento, cod_sexo, cod_nacionalidad, cod_estado_civil,
    email, telefono, ocupacion, created_by
)
VALUES (
    @id_sol4, 1, 'PASAPORTE', 'SY9876543', 'ESP',
    'Ahmed', 'Hassan', 'Al-Rahman',
    '1982-03-15', 'M', 'ESP', 'S',
    'ahmed.rahman@email.com', '+507-6456-7890',
    'Ingeniero Civil', 'admin'
)

-- Historial completo de estados
INSERT INTO PPSH_ESTADO_HISTORIAL (
    id_solicitud, estado_anterior, estado_nuevo, fecha_cambio, user_id, observaciones
)
VALUES
    (@id_sol4, 'RECIBIDO', 'EN_REVISION', DATEADD(day, -88, GETDATE()), 'admin',
     'Caso prioritario respaldado por ACNUR'),
    (@id_sol4, 'EN_REVISION', 'EN_VERIFICACION', DATEADD(day, -80, GETDATE()), 'admin',
     'Documentación completa y validada'),
    (@id_sol4, 'EN_VERIFICACION', 'EN_EVALUACION', DATEADD(day, -65, GETDATE()), 'admin',
     'Antecedentes verificados satisfactoriamente'),
    (@id_sol4, 'EN_EVALUACION', 'EN_ENTREVISTA', DATEADD(day, -50, GETDATE()), 'admin',
     'Programada entrevista personal'),
    (@id_sol4, 'EN_ENTREVISTA', 'CON_DICTAMEN_FAV', DATEADD(day, -40, GETDATE()), 'admin',
     'Entrevista realizada con resultado favorable'),
    (@id_sol4, 'CON_DICTAMEN_FAV', 'EN_APROBACION', DATEADD(day, -30, GETDATE()), 'admin',
     'Enviado a Director para aprobación final'),
    (@id_sol4, 'EN_APROBACION', 'APROBADO', DATEADD(day, -20, GETDATE()), 'admin',
     'Aprobado por Director. Proceder con emisión'),
    (@id_sol4, 'APROBADO', 'EN_EMISION', DATEADD(day, -15, GETDATE()), 'admin',
     'Emitiendo resolución y permiso PPSH'),
    (@id_sol4, 'EN_EMISION', 'RESUELTO', DATEADD(day, -10, GETDATE()), 'admin',
     'Permiso PPSH emitido y entregado. Válido por 2 años.')

-- Entrevista
INSERT INTO PPSH_ENTREVISTA (
    id_solicitud, fecha_programada, fecha_realizada, lugar, cod_agencia,
    entrevistador_user_id, asistio, resultado, observaciones, created_by
)
VALUES (
    @id_sol4, DATEADD(day, -45, GETDATE()), DATEADD(day, -45, GETDATE()),
    'Oficina Central SNM', '02', 'admin', 1, 'FAVORABLE',
    'Solicitante demostró documentación completa de situación de refugio. Habla español con fluidez. Tiene oferta de trabajo en empresa constructora local. Entrevista muy satisfactoria.',
    'admin'
)

PRINT '✓ Caso 4 creado: ' + @num_exp4 + ' (APROBADO)'
PRINT ''

-- ==========================================
-- CASO 5: Individual (Rechazado - Documentación Insuficiente)
-- ==========================================

PRINT 'Creando Caso 5: Caso rechazado (ejemplo)...'

DECLARE @num_exp5 VARCHAR(20)
DECLARE @id_sol5 INT

EXEC SP_PPSH_GENERAR_NUM_EXPEDIENTE @num_exp5 OUTPUT

INSERT INTO PPSH_SOLICITUD (
    num_expediente, tipo_solicitud, cod_causa_humanitaria, descripcion_caso,
    fecha_solicitud, estado_actual, prioridad, cod_agencia, cod_seccion,
    user_id_asignado, fecha_asignacion, created_by
)
VALUES (
    @num_exp5, 'INDIVIDUAL', 10, -- Otro
    'Solicitud con causa humanitaria no claramente definida.',
    DATEADD(day, -60, GETDATE()), 'RECHAZADO', 'BAJA', '01', '03',
    'admin', DATEADD(day, -58, GETDATE()), 'admin'
)

SET @id_sol5 = SCOPE_IDENTITY()

-- Solicitante
INSERT INTO PPSH_SOLICITANTE (
    id_solicitud, es_titular, tipo_documento, num_documento, pais_emisor,
    primer_nombre, primer_apellido,
    fecha_nacimiento, cod_sexo, cod_nacionalidad, cod_estado_civil,
    created_by
)
VALUES (
    @id_sol5, 1, 'PASAPORTE', 'X98765432', 'MEX',
    'Pedro', 'López',
    '1995-06-20', 'M', 'MEX', 'S',
    'admin'
)

-- Historial con rechazo
INSERT INTO PPSH_ESTADO_HISTORIAL (
    id_solicitud, estado_anterior, estado_nuevo, fecha_cambio, user_id, 
    observaciones, es_dictamen, tipo_dictamen, dictamen_detalle
)
VALUES
    (@id_sol5, 'RECIBIDO', 'EN_REVISION', DATEADD(day, -58, GETDATE()), 'admin',
     'Iniciando revisión', 0, NULL, NULL),
    (@id_sol5, 'EN_REVISION', 'INCOMPLETO', DATEADD(day, -50, GETDATE()), 'admin',
     'Falta documentación probatoria de causa humanitaria', 0, NULL, NULL),
    (@id_sol5, 'INCOMPLETO', 'CON_DICTAMEN_DESFAV', DATEADD(day, -25, GETDATE()), 'admin',
     'Plazo vencido sin subsanación', 1, 'DESFAVORABLE',
     'No se presentó documentación adicional en el plazo establecido (30 días). La causa humanitaria alegada no está respaldada por evidencia documental. Se recomienda rechazo de la solicitud.'),
    (@id_sol5, 'CON_DICTAMEN_DESFAV', 'RECHAZADO', DATEADD(day, -20, GETDATE()), 'admin',
     'Solicitud rechazada por falta de sustento', 0, NULL, NULL)

PRINT '✓ Caso 5 creado: ' + @num_exp5 + ' (RECHAZADO)'
PRINT ''

-- ==========================================
-- RESUMEN
-- ==========================================

PRINT ''
PRINT '=========================================='
PRINT 'DATOS DE EJEMPLO CARGADOS'
PRINT '=========================================='
PRINT ''

SELECT 
    'Total Solicitudes' AS Metrica,
    COUNT(*) AS Cantidad
FROM PPSH_SOLICITUD
WHERE activo = 1

UNION ALL

SELECT 
    'Total Solicitantes',
    COUNT(*)
FROM PPSH_SOLICITANTE
WHERE activo = 1

UNION ALL

SELECT 
    'Total Documentos',
    COUNT(*)
FROM PPSH_DOCUMENTO

UNION ALL

SELECT 
    'Total Comentarios',
    COUNT(*)
FROM PPSH_COMENTARIO

UNION ALL

SELECT 
    'Total Entrevistas',
    COUNT(*)
FROM PPSH_ENTREVISTA

PRINT ''
PRINT 'Solicitudes por Estado:'
PRINT ''

SELECT 
    estado_actual AS Estado,
    COUNT(*) AS Cantidad
FROM PPSH_SOLICITUD
WHERE activo = 1
GROUP BY estado_actual
ORDER BY COUNT(*) DESC

PRINT ''
PRINT '✅ Datos de ejemplo listos para testing'
PRINT ''

GO
