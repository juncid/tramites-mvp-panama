-- ==========================================
-- DATOS DE PRUEBA PARA WORKFLOW API
-- Sistema de Trámites Migratorios de Panamá
-- ==========================================
-- Este script inserta datos de prueba para validar la API de Workflow Dinámico
-- Referencia: Workflow_API_Tests.postman_collection.json
-- 
-- Fecha: 2025-10-24
-- Autor: Sistema de Trámites MVP Panamá
-- ==========================================

USE [SIM_PANAMA]
GO

SET NOCOUNT ON
GO

PRINT 'Iniciando carga de datos de prueba para Workflow API...'
GO

-- ==========================================
-- LIMPIAR DATOS PREVIOS (OPCIONAL)
-- ==========================================
-- Descomentar si desea limpiar datos de prueba anteriores
/*
DELETE FROM [dbo].[WORKFLOW_RESPUESTA] WHERE instancia_id IN (SELECT id FROM workflow_instancia WHERE workflow_id IN (SELECT id FROM workflow WHERE codigo LIKE '%TEST%' OR codigo LIKE '%PRUEBA%'))
DELETE FROM [dbo].[workflow_respuesta_etapa] WHERE instancia_id IN (SELECT id FROM workflow_instancia WHERE workflow_id IN (SELECT id FROM workflow WHERE codigo LIKE '%TEST%' OR codigo LIKE '%PRUEBA%'))
DELETE FROM [dbo].[workflow_instancia_historial] WHERE instancia_id IN (SELECT id FROM workflow_instancia WHERE workflow_id IN (SELECT id FROM workflow WHERE codigo LIKE '%TEST%' OR codigo LIKE '%PRUEBA%'))
DELETE FROM [dbo].[workflow_comentario] WHERE instancia_id IN (SELECT id FROM workflow_instancia WHERE workflow_id IN (SELECT id FROM workflow WHERE codigo LIKE '%TEST%' OR codigo LIKE '%PRUEBA%'))
DELETE FROM [dbo].[workflow_instancia] WHERE workflow_id IN (SELECT id FROM workflow WHERE codigo LIKE '%TEST%' OR codigo LIKE '%PRUEBA%')
DELETE FROM [dbo].[workflow_pregunta] WHERE etapa_id IN (SELECT id FROM workflow_etapa WHERE workflow_id IN (SELECT id FROM workflow WHERE codigo LIKE '%TEST%' OR codigo LIKE '%PRUEBA%'))
DELETE FROM [dbo].[workflow_conexion] WHERE workflow_id IN (SELECT id FROM workflow WHERE codigo LIKE '%TEST%' OR codigo LIKE '%PRUEBA%')
DELETE FROM [dbo].[workflow_etapa] WHERE workflow_id IN (SELECT id FROM workflow WHERE codigo LIKE '%TEST%' OR codigo LIKE '%PRUEBA%')
DELETE FROM [dbo].[workflow] WHERE codigo LIKE '%TEST%' OR codigo LIKE '%PRUEBA%'
*/

-- ==========================================
-- 1. WORKFLOWS (PLANTILLAS DE PROCESOS)
-- ==========================================

PRINT 'Insertando workflows de prueba...'

-- Workflow 1: PPSH Completo
DECLARE @WorkflowPPSH_ID INT

INSERT INTO [dbo].[workflow] (
    codigo, nombre, descripcion, version, estado, 
    color_hex, icono, categoria, 
    requiere_autenticacion, es_publico, 
    perfiles_creadores, activo, ID_USUAR_CREA
)
VALUES (
    'PPSH_COMPLETO',
    'Permiso de Protección de Seguridad Humanitaria - Completo',
    'Workflow completo del proceso PPSH con todas las etapas: registro, documentos, entrevista, revisión y decisión',
    '1.0',
    'ACTIVO',
    '#0066CC',
    'shield',
    'Protección Humanitaria',
    1,
    0,
    '["CIUDADANO", "ABOGADO", "ONG"]',
    1,
    'ADMIN'
)

SET @WorkflowPPSH_ID = SCOPE_IDENTITY()

-- Workflow 2: Visa Simple
DECLARE @WorkflowVisa_ID INT

INSERT INTO [dbo].[workflow] (
    codigo, nombre, descripcion, version, estado,
    color_hex, icono, categoria,
    requiere_autenticacion, es_publico,
    perfiles_creadores, activo, ID_USUAR_CREA
)
VALUES (
    'VISA_TURISTA_SIMPLE',
    'Solicitud de Visa de Turista',
    'Proceso simplificado de solicitud de visa de turista con 3 etapas básicas',
    '1.0',
    'ACTIVO',
    '#28A745',
    'passport',
    'Visa',
    1,
    1,
    '["CIUDADANO"]',
    1,
    'ADMIN'
)

SET @WorkflowVisa_ID = SCOPE_IDENTITY()

-- Workflow 3: Residencia Temporal
DECLARE @WorkflowResidencia_ID INT

INSERT INTO [dbo].[workflow] (
    codigo, nombre, descripcion, version, estado,
    color_hex, icono, categoria,
    requiere_autenticacion, es_publico,
    perfiles_creadores, activo, ID_USUAR_CREA
)
VALUES (
    'RESIDENCIA_TEMPORAL',
    'Solicitud de Residencia Temporal',
    'Proceso completo para obtener residencia temporal en Panamá',
    '1.1',
    'ACTIVO',
    '#FFC107',
    'home',
    'Residencia',
    1,
    0,
    '["CIUDADANO", "ABOGADO"]',
    1,
    'ADMIN'
)

SET @WorkflowResidencia_ID = SCOPE_IDENTITY()

-- Workflow 4: Workflow en Borrador (para testing)
DECLARE @WorkflowBorrador_ID INT

INSERT INTO [dbo].[workflow] (
    codigo, nombre, descripcion, version, estado,
    color_hex, icono, categoria,
    requiere_autenticacion, es_publico,
    perfiles_creadores, activo, ID_USUAR_CREA
)
VALUES (
    'PROCESO_PRUEBA_BORRADOR',
    'Proceso en Desarrollo - BORRADOR',
    'Este workflow está en desarrollo y no está disponible para uso',
    '0.1',
    'BORRADOR',
    '#6C757D',
    'edit',
    'Testing',
    1,
    0,
    '["ADMIN"]',
    1,
    'ADMIN'
)

SET @WorkflowBorrador_ID = SCOPE_IDENTITY()

PRINT '  ✓ ' + CAST(@@ROWCOUNT AS VARCHAR) + ' workflows insertados'

-- ==========================================
-- 2. ETAPAS DEL WORKFLOW PPSH
-- ==========================================

PRINT 'Insertando etapas del workflow PPSH...'

DECLARE @EtapaPPSH_Inicio INT, @EtapaPPSH_Datos INT, @EtapaPPSH_Documentos INT, @EtapaPPSH_Entrevista INT, @EtapaPPSH_Revision INT, @EtapaPPSH_Decision INT

-- Etapa 1: Inicio
INSERT INTO [dbo].[workflow_etapa] (
    workflow_id, codigo, nombre, descripcion, tipo_etapa, orden,
    perfiles_permitidos, titulo_formulario, bajada_formulario,
    es_etapa_inicial, es_etapa_final, requiere_validacion,
    permite_edicion_posterior, tiempo_estimado_minutos,
    activo, created_by
)
VALUES (
    @WorkflowPPSH_ID, 'INICIO', 'Bienvenida e Instrucciones', 
    'Etapa inicial con información del proceso PPSH', 'ETAPA', 1,
    '["CIUDADANO", "ABOGADO"]', 'Bienvenido al Proceso PPSH',
    'Por favor lea atentamente las instrucciones antes de continuar',
    1, 0, 0, 0, 5, 1, 'ADMIN'
)
SET @EtapaPPSH_Inicio = SCOPE_IDENTITY()

-- Etapa 2: Datos Personales
INSERT INTO [dbo].[workflow_etapa] (
    workflow_id, codigo, nombre, descripcion, tipo_etapa, orden,
    perfiles_permitidos, titulo_formulario, bajada_formulario,
    es_etapa_inicial, es_etapa_final, requiere_validacion,
    permite_edicion_posterior, tiempo_estimado_minutos,
    activo, created_by
)
VALUES (
    @WorkflowPPSH_ID, 'DATOS_PERSONALES', 'Datos Personales y de Contacto',
    'Registro de información personal del solicitante', 'ETAPA', 2,
    '["CIUDADANO", "ABOGADO"]', 'Información Personal',
    'Complete todos los campos con sus datos personales',
    0, 0, 1, 1, 15, 1, 'ADMIN'
)
SET @EtapaPPSH_Datos = SCOPE_IDENTITY()

-- Etapa 3: Carga de Documentos
INSERT INTO [dbo].[workflow_etapa] (
    workflow_id, codigo, nombre, descripcion, tipo_etapa, orden,
    perfiles_permitidos, titulo_formulario, bajada_formulario,
    es_etapa_inicial, es_etapa_final, requiere_validacion,
    permite_edicion_posterior, tiempo_estimado_minutos,
    activo, created_by
)
VALUES (
    @WorkflowPPSH_ID, 'DOCUMENTOS', 'Carga de Documentos',
    'Carga de documentos de respaldo requeridos', 'ETAPA', 3,
    '["CIUDADANO", "ABOGADO"]', 'Documentos Requeridos',
    'Adjunte los documentos solicitados en formato PDF o imagen',
    0, 0, 1, 1, 20, 1, 'ADMIN'
)
SET @EtapaPPSH_Documentos = SCOPE_IDENTITY()

-- Etapa 4: Entrevista
INSERT INTO [dbo].[workflow_etapa] (
    workflow_id, codigo, nombre, descripcion, tipo_etapa, orden,
    perfiles_permitidos, titulo_formulario, bajada_formulario,
    es_etapa_inicial, es_etapa_final, requiere_validacion,
    permite_edicion_posterior, tiempo_estimado_minutos,
    activo, created_by
)
VALUES (
    @WorkflowPPSH_ID, 'ENTREVISTA', 'Entrevista Personal',
    'Entrevista con funcionario de migración', 'PRESENCIAL', 4,
    '["FUNCIONARIO", "ENTREVISTADOR"]', 'Evaluación de Entrevista',
    'Registre las respuestas y observaciones de la entrevista',
    0, 0, 1, 0, 60, 1, 'ADMIN'
)
SET @EtapaPPSH_Entrevista = SCOPE_IDENTITY()

-- Etapa 5: Revisión
INSERT INTO [dbo].[workflow_etapa] (
    workflow_id, codigo, nombre, descripcion, tipo_etapa, orden,
    perfiles_permitidos, titulo_formulario, bajada_formulario,
    es_etapa_inicial, es_etapa_final, requiere_validacion,
    permite_edicion_posterior, tiempo_estimado_minutos,
    activo, created_by
)
VALUES (
    @WorkflowPPSH_ID, 'REVISION', 'Revisión y Análisis',
    'Revisión técnica del expediente', 'ETAPA', 5,
    '["ANALISTA", "SUPERVISOR"]', 'Análisis del Expediente',
    'Revise toda la documentación y registre su recomendación',
    0, 0, 1, 0, 90, 1, 'ADMIN'
)
SET @EtapaPPSH_Revision = SCOPE_IDENTITY()

-- Etapa 6: Decisión Final
INSERT INTO [dbo].[workflow_etapa] (
    workflow_id, codigo, nombre, descripcion, tipo_etapa, orden,
    perfiles_permitidos, titulo_formulario, bajada_formulario,
    es_etapa_inicial, es_etapa_final, requiere_validacion,
    permite_edicion_posterior, tiempo_estimado_minutos,
    activo, created_by
)
VALUES (
    @WorkflowPPSH_ID, 'DECISION', 'Decisión Final',
    'Decisión de aprobación o rechazo del PPSH', 'ETAPA', 6,
    '["DIRECTOR", "ADMIN"]', 'Decisión del Caso',
    'Ingrese la decisión final sobre la solicitud',
    0, 1, 1, 0, 30, 1, 'ADMIN'
)
SET @EtapaPPSH_Decision = SCOPE_IDENTITY()

PRINT '  ✓ 6 etapas de PPSH insertadas'

-- ==========================================
-- 3. PREGUNTAS DEL WORKFLOW PPSH
-- ==========================================

PRINT 'Insertando preguntas del workflow PPSH...'

-- Preguntas Etapa: DATOS_PERSONALES
INSERT INTO [dbo].[workflow_pregunta] (
    etapa_id, codigo, pregunta, tipo_pregunta, orden,
    es_obligatoria, validacion_regex, mensaje_validacion,
    placeholder, texto_ayuda, activo, created_by
)
VALUES 
    (@EtapaPPSH_Datos, 'NOMBRE_COMPLETO', '¿Cuál es su nombre completo?', 'RESPUESTA_TEXTO', 1,
     1, '^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$', 'Solo se permiten letras y espacios',
     'Juan Pérez García', 'Ingrese su nombre completo tal como aparece en su documento de identidad', 1, 'ADMIN'),
    
    (@EtapaPPSH_Datos, 'FECHA_NACIMIENTO', '¿Cuál es su fecha de nacimiento?', 'SELECCION_FECHA', 2,
     1, NULL, 'Debe ser mayor de 18 años',
     NULL, 'Seleccione su fecha de nacimiento', 1, 'ADMIN'),
    
    (@EtapaPPSH_Datos, 'NACIONALIDAD', '¿Cuál es su nacionalidad?', 'LISTA', 3,
     1, NULL, NULL,
     'Seleccione', 'País de su nacionalidad actual', 1, 'ADMIN'),
    
    (@EtapaPPSH_Datos, 'NUMERO_PASAPORTE', '¿Cuál es su número de pasaporte?', 'RESPUESTA_TEXTO', 4,
     1, '^[A-Z0-9]{6,12}$', 'Formato de pasaporte inválido',
     'AB123456', 'Número de pasaporte vigente', 1, 'ADMIN'),
    
    (@EtapaPPSH_Datos, 'EMAIL', '¿Cuál es su correo electrónico?', 'RESPUESTA_TEXTO', 5,
     1, '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', 'Debe ser un correo electrónico válido',
     'ejemplo@correo.com', 'Correo electrónico donde recibirá notificaciones', 1, 'ADMIN'),
    
    (@EtapaPPSH_Datos, 'TELEFONO', '¿Cuál es su número de teléfono de contacto?', 'RESPUESTA_TEXTO', 6,
     1, '^\+?[0-9\- ]{8,15}$', 'Formato de teléfono inválido',
     '+507 6000-0000', 'Número de teléfono con código de país', 1, 'ADMIN'),
    
    (@EtapaPPSH_Datos, 'DIRECCION_ACTUAL', '¿Cuál es su dirección actual en Panamá?', 'RESPUESTA_LARGA', 7,
     1, NULL, NULL,
     'Calle, número, corregimiento, distrito', 'Dirección completa donde reside actualmente', 1, 'ADMIN')

-- Actualizar opciones de nacionalidad
UPDATE [dbo].[workflow_pregunta] 
SET opciones = '["Venezolana", "Colombiana", "Nicaragüense", "Cubana", "Haitiana", "Hondureña", "Salvadoreña", "Otra"]'
WHERE codigo = 'NACIONALIDAD'

-- Preguntas Etapa: DOCUMENTOS
INSERT INTO [dbo].[workflow_pregunta] (
    etapa_id, codigo, pregunta, tipo_pregunta, orden,
    es_obligatoria, extensiones_permitidas, tamano_maximo_mb,
    texto_ayuda, activo, created_by
)
VALUES 
    (@EtapaPPSH_Documentos, 'DOC_PASAPORTE', 'Cargue copia de su pasaporte vigente', 'CARGA_ARCHIVO', 1,
     1, '[".pdf", ".jpg", ".jpeg", ".png"]', 5,
     'Debe ser una copia clara y legible de todas las páginas del pasaporte', 1, 'ADMIN'),
    
    (@EtapaPPSH_Documentos, 'DOC_FOTO', 'Cargue una fotografía reciente tipo pasaporte', 'CARGA_ARCHIVO', 2,
     1, '[".jpg", ".jpeg", ".png"]', 2,
     'Fotografía reciente con fondo blanco, tamaño pasaporte', 1, 'ADMIN'),
    
    (@EtapaPPSH_Documentos, 'DOC_ANTECEDENTES', 'Cargue certificado de antecedentes penales de su país de origen', 'CARGA_ARCHIVO', 3,
     1, '[".pdf"]', 5,
     'Debe estar apostillado o legalizado', 1, 'ADMIN'),
    
    (@EtapaPPSH_Documentos, 'DOC_SITUACION', 'Cargue documentos que respalden su situación de vulnerabilidad (opcional)', 'CARGA_ARCHIVO', 4,
     0, '[".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"]', 10,
     'Cualquier documento que respalde su solicitud de protección humanitaria', 1, 'ADMIN')

-- Preguntas Etapa: ENTREVISTA
INSERT INTO [dbo].[workflow_pregunta] (
    etapa_id, codigo, pregunta, tipo_pregunta, orden,
    es_obligatoria, texto_ayuda, activo, created_by
)
VALUES 
    (@EtapaPPSH_Entrevista, 'MOTIVO_SOLICITUD', 'Explique el motivo de su solicitud de protección humanitaria', 'RESPUESTA_LARGA', 1,
     1, 'Sea específico sobre su situación y por qué necesita protección', 1, 'ADMIN'),
    
    (@EtapaPPSH_Entrevista, 'CREDIBILIDAD', '¿La narrativa del solicitante es creíble y consistente?', 'OPCIONES', 2,
     1, 'Evaluación de la consistencia del relato', 1, 'ADMIN'),
    
    (@EtapaPPSH_Entrevista, 'VULNERABILIDAD', '¿El solicitante presenta condición de vulnerabilidad evidente?', 'OPCIONES', 3,
     1, 'Evaluación de condiciones de vulnerabilidad', 1, 'ADMIN'),
    
    (@EtapaPPSH_Entrevista, 'OBSERVACIONES_ENTREVISTA', 'Observaciones adicionales de la entrevista', 'RESPUESTA_LARGA', 4,
     0, 'Registre cualquier observación relevante del proceso de entrevista', 1, 'ADMIN')

-- Actualizar opciones de preguntas tipo OPCIONES
UPDATE [dbo].[workflow_pregunta] 
SET opciones = '["Sí", "No", "Parcialmente"]', permite_multiple = 0
WHERE codigo IN ('CREDIBILIDAD', 'VULNERABILIDAD')

-- Preguntas Etapa: REVISION
INSERT INTO [dbo].[workflow_pregunta] (
    etapa_id, codigo, pregunta, tipo_pregunta, orden,
    es_obligatoria, texto_ayuda, activo, created_by
)
VALUES 
    (@EtapaPPSH_Revision, 'DOCUMENTOS_COMPLETOS', '¿La documentación está completa?', 'OPCIONES', 1,
     1, 'Verifique que todos los documentos requeridos estén presentes', 1, 'ADMIN'),
    
    (@EtapaPPSH_Revision, 'DOCUMENTOS_VALIDOS', '¿Los documentos son válidos y legibles?', 'OPCIONES', 2,
     1, 'Verifique autenticidad y vigencia de los documentos', 1, 'ADMIN'),
    
    (@EtapaPPSH_Revision, 'RECOMENDACION', '¿Cuál es su recomendación?', 'OPCIONES', 3,
     1, 'Recomendación técnica basada en el análisis del expediente', 1, 'ADMIN'),
    
    (@EtapaPPSH_Revision, 'JUSTIFICACION', 'Justificación de la recomendación', 'RESPUESTA_LARGA', 4,
     1, 'Explique los fundamentos de su recomendación', 1, 'ADMIN')

UPDATE [dbo].[workflow_pregunta] 
SET opciones = '["Sí", "No"]', permite_multiple = 0
WHERE codigo IN ('DOCUMENTOS_COMPLETOS', 'DOCUMENTOS_VALIDOS')

UPDATE [dbo].[workflow_pregunta] 
SET opciones = '["Aprobar", "Rechazar", "Solicitar información adicional"]', permite_multiple = 0
WHERE codigo = 'RECOMENDACION'

-- Preguntas Etapa: DECISION
INSERT INTO [dbo].[workflow_pregunta] (
    etapa_id, codigo, pregunta, tipo_pregunta, orden,
    es_obligatoria, texto_ayuda, activo, created_by
)
VALUES 
    (@EtapaPPSH_Decision, 'DECISION_FINAL', 'Decisión sobre la solicitud', 'OPCIONES', 1,
     1, 'Decisión final sobre la solicitud de PPSH', 1, 'ADMIN'),
    
    (@EtapaPPSH_Decision, 'VIGENCIA_MESES', 'Si se aprueba, ¿por cuántos meses se otorga el PPSH?', 'LISTA', 2,
     0, 'Vigencia del permiso otorgado', 1, 'ADMIN'),
    
    (@EtapaPPSH_Decision, 'FUNDAMENTO_DECISION', 'Fundamento legal de la decisión', 'RESPUESTA_LARGA', 3,
     1, 'Explique el fundamento legal y técnico de la decisión', 1, 'ADMIN')

UPDATE [dbo].[workflow_pregunta] 
SET opciones = '["Aprobado", "Rechazado"]', permite_multiple = 0
WHERE codigo = 'DECISION_FINAL'

UPDATE [dbo].[workflow_pregunta] 
SET opciones = '["3", "6", "12"]'
WHERE codigo = 'VIGENCIA_MESES'

PRINT '  ✓ Preguntas de PPSH insertadas'

-- ==========================================
-- 4. CONEXIONES DEL WORKFLOW PPSH
-- ==========================================

PRINT 'Insertando conexiones del workflow PPSH...'

INSERT INTO [dbo].[workflow_conexion] (
    workflow_id, etapa_origen_id, etapa_destino_id, nombre,
    condicion, es_predeterminada, activo, created_by
)
VALUES 
    (@WorkflowPPSH_ID, @EtapaPPSH_Inicio, @EtapaPPSH_Datos, 'Continuar', NULL, 1, 1, 'ADMIN'),
    (@WorkflowPPSH_ID, @EtapaPPSH_Datos, @EtapaPPSH_Documentos, 'Siguiente', NULL, 1, 1, 'ADMIN'),
    (@WorkflowPPSH_ID, @EtapaPPSH_Documentos, @EtapaPPSH_Entrevista, 'Agendar Entrevista', NULL, 1, 1, 'ADMIN'),
    (@WorkflowPPSH_ID, @EtapaPPSH_Entrevista, @EtapaPPSH_Revision, 'Enviar a Revisión', NULL, 1, 1, 'ADMIN'),
    (@WorkflowPPSH_ID, @EtapaPPSH_Revision, @EtapaPPSH_Decision, 'Enviar a Decisión', '{"pregunta": "RECOMENDACION", "valor": ["Aprobar", "Rechazar"]}', 1, 1, 'ADMIN'),
    (@WorkflowPPSH_ID, @EtapaPPSH_Revision, @EtapaPPSH_Documentos, 'Solicitar más documentos', '{"pregunta": "RECOMENDACION", "valor": "Solicitar información adicional"}', 0, 1, 'ADMIN')

PRINT '  ✓ 6 conexiones de PPSH insertadas'

-- ==========================================
-- 5. ETAPAS Y PREGUNTAS DE WORKFLOWS ADICIONALES
-- ==========================================

PRINT 'Insertando etapas de Visa de Turista...'

-- Workflow: VISA_TURISTA_SIMPLE - Etapas
DECLARE @EtapaVisa_Datos INT, @EtapaVisa_Documentos INT, @EtapaVisa_Pago INT

INSERT INTO [dbo].[workflow_etapa] (
    workflow_id, codigo, nombre, tipo_etapa, orden,
    perfiles_permitidos, titulo_formulario,
    es_etapa_inicial, es_etapa_final, activo, created_by
)
VALUES 
    (@WorkflowVisa_ID, 'DATOS', 'Datos del Solicitante', 'ETAPA', 1,
     '["CIUDADANO"]', 'Información Personal', 1, 0, 1, 'ADMIN'),
    
    (@WorkflowVisa_ID, 'DOCS', 'Documentos', 'ETAPA', 2,
     '["CIUDADANO"]', 'Carga de Documentos', 0, 0, 1, 'ADMIN'),
    
    (@WorkflowVisa_ID, 'APROBACION', 'Aprobación', 'ETAPA', 3,
     '["FUNCIONARIO"]', 'Revisión de Solicitud', 0, 1, 1, 'ADMIN')

SET @EtapaVisa_Datos = (SELECT id FROM workflow_etapa WHERE workflow_id = @WorkflowVisa_ID AND codigo = 'DATOS')
SET @EtapaVisa_Documentos = (SELECT id FROM workflow_etapa WHERE workflow_id = @WorkflowVisa_ID AND codigo = 'DOCS')
SET @EtapaVisa_Pago = (SELECT id FROM workflow_etapa WHERE workflow_id = @WorkflowVisa_ID AND codigo = 'APROBACION')

-- Preguntas básicas para Visa
INSERT INTO [dbo].[workflow_pregunta] (
    etapa_id, codigo, pregunta, tipo_pregunta, orden, es_obligatoria, activo, created_by
)
VALUES 
    (@EtapaVisa_Datos, 'NOMBRE', 'Nombre completo', 'RESPUESTA_TEXTO', 1, 1, 1, 'ADMIN'),
    (@EtapaVisa_Datos, 'PASAPORTE', 'Número de pasaporte', 'RESPUESTA_TEXTO', 2, 1, 1, 'ADMIN'),
    (@EtapaVisa_Documentos, 'FOTO_PASAPORTE', 'Fotografía', 'CARGA_ARCHIVO', 1, 1, 1, 'ADMIN'),
    (@EtapaVisa_Pago, 'APROBADO', '¿Aprobar solicitud?', 'OPCIONES', 1, 1, 1, 'ADMIN')

UPDATE [dbo].[workflow_pregunta] 
SET opciones = '["Sí", "No"]', permite_multiple = 0
WHERE codigo = 'APROBADO' AND etapa_id = @EtapaVisa_Pago

-- Conexiones Visa
INSERT INTO [dbo].[workflow_conexion] (
    workflow_id, etapa_origen_id, etapa_destino_id, nombre, es_predeterminada, activo, created_by
)
VALUES 
    (@WorkflowVisa_ID, @EtapaVisa_Datos, @EtapaVisa_Documentos, 'Siguiente', 1, 1, 'ADMIN'),
    (@WorkflowVisa_ID, @EtapaVisa_Documentos, @EtapaVisa_Pago, 'Enviar', 1, 1, 'ADMIN')

PRINT '  ✓ Workflow de Visa creado'

-- ==========================================
-- 6. INSTANCIAS DE PRUEBA
-- ==========================================

PRINT 'Creando instancias de prueba...'

DECLARE @InstanciaPPSH1 INT, @InstanciaPPSH2 INT, @InstanciaVisa1 INT

-- Instancia 1: PPSH en progreso
INSERT INTO [dbo].[workflow_instancia] (
    workflow_id, num_expediente, nombre_instancia, estado,
    etapa_actual_id, creado_por_user_id, prioridad,
    metadata_adicional, activo, updated_by
)
VALUES (
    @WorkflowPPSH_ID, 'PPSH-2025-001', 'Juan Carlos Rodríguez - PPSH',
    'EN_PROGRESO', @EtapaPPSH_Documentos, 'CIUDADANO001', 'ALTA',
    '{"pais_origen": "Venezuela", "telefono": "+58 412-123-4567"}',
    1, 'CIUDADANO001'
)
SET @InstanciaPPSH1 = SCOPE_IDENTITY()

-- Instancia 2: PPSH completado
INSERT INTO [dbo].[workflow_instancia] (
    workflow_id, num_expediente, nombre_instancia, estado,
    etapa_actual_id, creado_por_user_id, asignado_a_user_id,
    fecha_inicio, fecha_fin, prioridad, activo, updated_by
)
VALUES (
    @WorkflowPPSH_ID, 'PPSH-2025-002', 'María González - PPSH',
    'COMPLETADO', @EtapaPPSH_Decision, 'CIUDADANO002', 'FUNC001',
    DATEADD(day, -30, GETDATE()), DATEADD(day, -1, GETDATE()), 'NORMAL',
    1, 'ADMIN'
)
SET @InstanciaPPSH2 = SCOPE_IDENTITY()

-- Instancia 3: Visa iniciada
INSERT INTO [dbo].[workflow_instancia] (
    workflow_id, num_expediente, nombre_instancia, estado,
    etapa_actual_id, creado_por_user_id, prioridad, activo, updated_by
)
VALUES (
    @WorkflowVisa_ID, 'VISA-2025-101', 'Pedro Martínez - Visa Turista',
    'INICIADO', @EtapaVisa_Datos, 'CIUDADANO003', 'NORMAL',
    1, 'CIUDADANO003'
)
SET @InstanciaVisa1 = SCOPE_IDENTITY()

PRINT '  ✓ 3 instancias creadas'

-- ==========================================
-- 7. COMENTARIOS E HISTORIAL
-- ==========================================

PRINT 'Agregando comentarios e historial...'

-- Comentarios en instancia PPSH
INSERT INTO [dbo].[workflow_comentario] (
    instancia_id, comentario, es_interno, es_notificacion,
    creado_por_user_id, activo
)
VALUES 
    (@InstanciaPPSH1, 'Documentación recibida, falta certificado de antecedentes', 1, 0, 'FUNC001', 1),
    (@InstanciaPPSH1, 'Por favor cargue el certificado de antecedentes penales lo antes posible', 0, 1, 'FUNC001', 1),
    (@InstanciaPPSH2, 'Solicitud aprobada. PPSH vigente por 12 meses', 0, 1, 'ADMIN', 1)

-- Historial de instancia PPSH completada
INSERT INTO [dbo].[workflow_instancia_historial] (
    instancia_id, etapa_id, estado_anterior, estado_nuevo,
    usuario_responsable, comentario
)
VALUES 
    (@InstanciaPPSH2, @EtapaPPSH_Inicio, 'INICIADO', 'EN_PROGRESO', 'CIUDADANO002', 'Inicio del proceso'),
    (@InstanciaPPSH2, @EtapaPPSH_Datos, 'EN_PROGRESO', 'EN_PROGRESO', 'CIUDADANO002', 'Datos personales completados'),
    (@InstanciaPPSH2, @EtapaPPSH_Documentos, 'EN_PROGRESO', 'EN_PROGRESO', 'CIUDADANO002', 'Documentos cargados'),
    (@InstanciaPPSH2, @EtapaPPSH_Entrevista, 'EN_PROGRESO', 'EN_REVISION', 'FUNC001', 'Entrevista realizada'),
    (@InstanciaPPSH2, @EtapaPPSH_Revision, 'EN_REVISION', 'EN_REVISION', 'ANALISTA01', 'Análisis técnico completado'),
    (@InstanciaPPSH2, @EtapaPPSH_Decision, 'EN_REVISION', 'COMPLETADO', 'ADMIN', 'Solicitud aprobada')

PRINT '  ✓ Comentarios e historial agregados'

-- ==========================================
-- VERIFICACIÓN FINAL
-- ==========================================

PRINT ''
PRINT '================================================'
PRINT 'RESUMEN DE DATOS INSERTADOS'
PRINT '================================================'
PRINT ''

SELECT 
    'Workflows' as Tipo,
    COUNT(*) as Total,
    SUM(CASE WHEN estado = 'ACTIVO' THEN 1 ELSE 0 END) as Activos,
    SUM(CASE WHEN estado = 'BORRADOR' THEN 1 ELSE 0 END) as Borradores
FROM workflow
UNION ALL
SELECT 
    'Etapas',
    COUNT(*),
    SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END),
    0
FROM workflow_etapa
UNION ALL
SELECT 
    'Preguntas',
    COUNT(*),
    SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END),
    0
FROM workflow_PREGUNTA
UNION ALL
SELECT 
    'Conexiones',
    COUNT(*),
    SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END),
    0
FROM workflow_CONEXION
UNION ALL
SELECT 
    'Instancias',
    COUNT(*),
    SUM(CASE WHEN estado IN ('EN_PROGRESO', 'EN_REVISION') THEN 1 ELSE 0 END),
    SUM(CASE WHEN estado = 'COMPLETADO' THEN 1 ELSE 0 END)
FROM workflow_instancia

PRINT ''
PRINT 'Workflows creados:'
SELECT codigo, nombre, estado, categoria FROM workflow ORDER BY id

PRINT ''
PRINT 'Instancias creadas:'
SELECT num_expediente, nombre_instancia, estado FROM workflow_instancia ORDER BY id

PRINT ''
PRINT '✓ ¡Script completado exitosamente!'
PRINT 'Puede usar estos datos para probar la colección Postman: Workflow_API_Tests.postman_collection.json'
PRINT ''

GO

