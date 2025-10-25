-- ==========================================
-- DATOS DE PRUEBA PARA TRAMITES BASE API
-- Sistema de Trámites Migratorios de Panamá
-- ==========================================
-- Este script inserta datos de prueba para validar la API de Trámites Base
-- Referencia: Tramites_Base_API.postman_collection.json
-- 
-- Fecha: 2025-10-24
-- Autor: Sistema de Trámites MVP Panamá
-- ==========================================

USE [SIM_PANAMA]
GO

PRINT 'Iniciando carga de datos de prueba para Trámites Base API...'
GO

-- Limpiar datos de prueba previos (opcional)
-- DELETE FROM [dbo].[TRAMITE] WHERE NOM_TITULO LIKE '%[PRUEBA]%' OR titulo LIKE '%TEST%'

-- ==========================================
-- TRÁMITES DE MIGRACIÓN (CATEGORÍA PRINCIPAL)
-- ==========================================

PRINT 'Insertando trámites de migración...'

-- Trámites de Visa
INSERT INTO [dbo].[TRAMITE] (NOM_TITULO, DESCRIPCION, COD_ESTADO, IND_ACTIVO)
VALUES 
    ('Solicitud de Visa de Turista', 
     'Trámite de solicitud de visa de turista para ciudadanos extranjeros que desean visitar Panamá con fines turísticos. Vigencia de 90 días.', 
     'ACTIVO', 1),
    
    ('Solicitud de Visa de Negocios', 
     'Visa para realizar actividades comerciales y de negocios en Panamá. Incluye participación en reuniones, conferencias y negociaciones.', 
     'ACTIVO', 1),
    
    ('Solicitud de Visa de Estudiante', 
     'Visa para extranjeros que desean cursar estudios en instituciones educativas autorizadas en Panamá. Requiere carta de aceptación.', 
     'ACTIVO', 1),
    
    ('Renovación de Visa de Turista', 
     'Trámite de renovación de visa de turista para extender la estadía en el país. Máximo 6 meses acumulados por año.', 
     'ACTIVO', 1);

-- Trámites de Residencia
INSERT INTO [dbo].[TRAMITE] (NOM_TITULO, DESCRIPCION, COD_ESTADO, IND_ACTIVO)
VALUES 
    ('Permiso de Residencia Temporal', 
     'Solicitud de permiso de residencia temporal en Panamá. Válido por 1 año, renovable. Requiere justificación de motivos de estadía.', 
     'ACTIVO', 1),
    
    ('Permiso de Residencia Permanente', 
     'Solicitud de residencia permanente en Panamá. Otorga el derecho a residir indefinidamente. Requiere cumplir requisitos específicos.', 
     'ACTIVO', 1),
    
    ('Renovación de Carnet de Residente Temporal', 
     'Renovación de carnet de residente temporal. Debe realizarse antes del vencimiento. Tiempo de procesamiento: 30-45 días hábiles.', 
     'ACTIVO', 1),
    
    ('Renovación de Carnet de Residente Permanente', 
     'Renovación de carnet de residente permanente. Vigencia de 5 años. Requiere actualización de datos personales y fotografía reciente.', 
     'ACTIVO', 1);

-- Trámites de Permiso de Trabajo
INSERT INTO [dbo].[TRAMITE] (NOM_TITULO, DESCRIPCION, COD_ESTADO, IND_ACTIVO)
VALUES 
    ('Solicitud de Permiso de Trabajo Temporal', 
     'Permiso de trabajo para extranjeros con residencia temporal. Válido por 1 año. Requiere oferta laboral de empleador panameño registrado.', 
     'ACTIVO', 1),
    
    ('Renovación de Permiso de Trabajo', 
     'Trámite para renovación de permiso de trabajo temporal para extranjeros residentes en Panamá. Incluye verificación de antecedentes y estatus migratorio.', 
     'ACTIVO', 1),
    
    ('Permiso de Trabajo para Profesionales', 
     'Permiso especial para profesionales extranjeros. Requiere validación de títulos universitarios y certificaciones profesionales.', 
     'ACTIVO', 1),
    
    ('Permiso de Trabajo para Personal Técnico', 
     'Permiso de trabajo para personal técnico especializado. Incluye ingenieros, técnicos y especialistas en áreas de demanda.', 
     'ACTIVO', 1);

-- ==========================================
-- TRÁMITES DE ESTADÍA Y MOVIMIENTO
-- ==========================================

PRINT 'Insertando trámites de estadía y movimiento...'

INSERT INTO [dbo].[TRAMITE] (NOM_TITULO, DESCRIPCION, COD_ESTADO, IND_ACTIVO)
VALUES 
    ('Prórroga de Estadía Turística', 
     'Extensión del período de estadía turística en Panamá. Permite permanecer hasta 90 días adicionales. Requiere justificación.', 
     'ACTIVO', 1),
    
    ('Permiso de Salida y Reingreso', 
     'Permiso para que residentes temporales puedan salir y reingresar al país sin perder su estatus migratorio. Vigencia: 1 año.', 
     'ACTIVO', 1),
    
    ('Salvoconducto para Extranjeros', 
     'Documento temporal que permite la salida del país a extranjeros con trámites migratorios pendientes o situaciones especiales.', 
     'ACTIVO', 1);

-- ==========================================
-- TRÁMITES ESPECIALES Y HUMANITARIOS
-- ==========================================

PRINT 'Insertando trámites especiales...'

INSERT INTO [dbo].[TRAMITE] (NOM_TITULO, DESCRIPCION, COD_ESTADO, IND_ACTIVO)
VALUES 
    ('Permiso de Protección de Seguridad Humanitaria (PPSH)', 
     'Solicitud de protección temporal para personas en situación de vulnerabilidad. Incluye evaluación de caso individual y documentación de respaldo.', 
     'ACTIVO', 1),
    
    ('Solicitud de Naturalización', 
     'Trámite de carta de naturaleza panameña para extranjeros que cumplen requisitos de residencia y otros criterios legales. Proceso: 12-18 meses.', 
     'ACTIVO', 1),
    
    ('Solicitud de Refugio', 
     'Solicitud de estatus de refugiado para personas que huyen de persecución. Incluye entrevista personal y evaluación de credibilidad.', 
     'ACTIVO', 1),
    
    ('Autorización de Trabajo Humanitario', 
     'Permiso especial de trabajo para beneficiarios de protección humanitaria. Permite trabajar legalmente mientras se resuelve estatus migratorio.', 
     'ACTIVO', 1);

-- ==========================================
-- TRÁMITES ADMINISTRATIVOS Y CERTIFICACIONES
-- ==========================================

PRINT 'Insertando trámites administrativos...'

INSERT INTO [dbo].[TRAMITE] (NOM_TITULO, DESCRIPCION, COD_ESTADO, IND_ACTIVO)
VALUES 
    ('Certificado de Movimiento Migratorio', 
     'Documento que certifica los movimientos de entrada y salida del país. Requerido para diversos trámites legales y administrativos.', 
     'ACTIVO', 1),
    
    ('Certificado de No Antecedentes Penales (Migración)', 
     'Certificado emitido por el Servicio Nacional de Migración que acredita la ausencia de antecedentes migratorios negativos.', 
     'ACTIVO', 1),
    
    ('Corrección de Datos en Registro Migratorio', 
     'Trámite para corregir errores en datos personales registrados en el sistema migratorio. Incluye cambios de nombre, fecha de nacimiento, etc.', 
     'ACTIVO', 1),
    
    ('Constancia de Trámite en Proceso', 
     'Documento que certifica que el solicitante tiene un trámite migratorio en proceso. Útil para gestiones bancarias, laborales, etc.', 
     'ACTIVO', 1);

-- ==========================================
-- TRÁMITES PARA CASOS ESPECIALES
-- ==========================================

PRINT 'Insertando trámites para casos especiales...'

INSERT INTO [dbo].[TRAMITE] (NOM_TITULO, DESCRIPCION, COD_ESTADO, IND_ACTIVO)
VALUES 
    ('Permiso Especial para Inversionistas', 
     'Visa especial para inversionistas extranjeros que realizan inversiones significativas en Panamá. Requiere verificación de fondos.', 
     'ACTIVO', 1),
    
    ('Visa de Pensionado', 
     'Visa especial para jubilados y pensionados extranjeros. Otorga múltiples beneficios. Requiere comprobación de ingresos mensuales mínimos.', 
     'ACTIVO', 1),
    
    ('Permiso para Cónyuge de Panameño', 
     'Trámite especial de residencia para cónyuges extranjeros de ciudadanos panameños. Proceso acelerado con menos requisitos.', 
     'ACTIVO', 1),
    
    ('Permiso para Personal Diplomático', 
     'Trámite especial para personal diplomático y consular acreditado en Panamá. Incluye familiares directos.', 
     'ACTIVO', 1);

-- ==========================================
-- TRÁMITES EN DIFERENTES ESTADOS (PARA TESTING)
-- ==========================================

PRINT 'Insertando trámites en diferentes estados para pruebas...'

-- Trámites en mantenimiento
INSERT INTO [dbo].[TRAMITE] (NOM_TITULO, DESCRIPCION, COD_ESTADO, IND_ACTIVO)
VALUES 
    ('Visa de Tránsito [TEST - EN MANTENIMIENTO]', 
     'Visa de tránsito para extranjeros que pasan por Panamá hacia otro destino. ACTUALMENTE EN MANTENIMIENTO DEL SISTEMA.', 
     'EN_MANTENIMIENTO', 1),
    
    ('Permiso de Trabajo Doméstico [TEST - EN MANTENIMIENTO]', 
     'Permiso especial para trabajadores domésticos extranjeros. SISTEMA TEMPORALMENTE SUSPENDIDO POR ACTUALIZACIÓN.', 
     'EN_MANTENIMIENTO', 1);

-- Trámites suspendidos
INSERT INTO [dbo].[TRAMITE] (NOM_TITULO, DESCRIPCION, COD_ESTADO, IND_ACTIVO)
VALUES 
    ('Visa de Excepción COVID-19 [TEST - SUSPENDIDO]', 
     'Visa especial durante pandemia COVID-19. PROGRAMA SUSPENDIDO - YA NO SE ACEPTAN NUEVAS SOLICITUDES.', 
     'SUSPENDIDO', 0),
    
    ('Permiso Temporal de Emergencia Sanitaria [TEST - SUSPENDIDO]', 
     'Permiso otorgado durante emergencia sanitaria. PROGRAMA FINALIZADO.', 
     'SUSPENDIDO', 0);

-- Trámites para probar paginación (registros adicionales)
INSERT INTO [dbo].[TRAMITE] (NOM_TITULO, DESCRIPCION, COD_ESTADO, IND_ACTIVO)
VALUES 
    ('Registro de Extranjero Residente', 
     'Registro obligatorio para todo extranjero con residencia en Panamá. Debe actualizarse anualmente.', 
     'ACTIVO', 1),
    
    ('Autorización de Viaje para Menores', 
     'Permiso de viaje para menores extranjeros residentes que viajarán sin sus padres. Requiere autorización notariada.', 
     'ACTIVO', 1),
    
    ('Cambio de Categoría Migratoria', 
     'Trámite para cambiar de una categoría migratoria a otra (ej: de turista a residente). Requiere cumplir requisitos de nueva categoría.', 
     'ACTIVO', 1),
    
    ('Restablecimiento de Residencia Vencida', 
     'Trámite para restablecer residencia que venció por permanencia prolongada fuera del país. Requiere justificación.', 
     'ACTIVO', 1),
    
    ('Canje de Pasaporte en Registro Migratorio', 
     'Actualización de datos de pasaporte en el registro migratorio tras renovación o emisión de nuevo pasaporte.', 
     'ACTIVO', 1);

GO

-- ==========================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ==========================================

PRINT ''
PRINT 'Datos insertados exitosamente!'
PRINT ''
PRINT 'Resumen de trámites por estado:'

SELECT 
    COD_ESTADO,
    COUNT(*) as total_tramites,
    SUM(CASE WHEN IND_ACTIVO = 1 THEN 1 ELSE 0 END) as activos,
    SUM(CASE WHEN IND_ACTIVO = 0 THEN 1 ELSE 0 END) as inactivos
FROM [dbo].[TRAMITE]
GROUP BY COD_ESTADO
ORDER BY total_tramites DESC

PRINT ''
PRINT 'Total de trámites en la tabla:'
SELECT COUNT(*) as total FROM [dbo].[TRAMITE]

PRINT ''
PRINT 'Primeros 10 trámites:'
SELECT TOP 10 
    id, 
    NOM_TITULO, 
    COD_ESTADO, 
    IND_ACTIVO,
    FEC_CREA_REG
FROM [dbo].[TRAMITE]
ORDER BY id DESC

PRINT ''
PRINT '✓ Script completado exitosamente!'
PRINT 'Puede usar estos datos para probar la colección Postman: Tramites_Base_API.postman_collection.json'
GO
