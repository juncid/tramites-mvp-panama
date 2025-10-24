-- ==========================================
-- Script de Datos de Prueba para SIM_FT
-- Sistema Integrado de Migración - Flujo de Trámites
-- Fecha: 2025-10-23
-- Propósito: Poblar base de datos con datos de prueba para testing de endpoints
-- ==========================================

USE SIM_PANAMA;
GO

-- Limpiar datos existentes (en orden inverso por dependencias)
DELETE FROM SIM_FT_DEPENDTE_CIERRE;
DELETE FROM SIM_FT_TRAMITE_CIERRE;
DELETE FROM SIM_FT_TRAMITE_D;
DELETE FROM SIM_FT_TRAMITE_E;
DELETE FROM SIM_FT_PASOXTRAM;
DELETE FROM SIM_FT_PASOS;
DELETE FROM SIM_FT_USUA_SEC;
DELETE FROM SIM_FT_PRIORIDAD;
DELETE FROM SIM_FT_CONCLUSION;
DELETE FROM SIM_FT_ESTATUS;
DELETE FROM SIM_FT_TRAMITES;
GO

PRINT '✅ Tablas limpiadas';
GO

-- ==========================================
-- 1. CATÁLOGO: Tipos de Trámites
-- ==========================================
INSERT INTO SIM_FT_TRAMITES (COD_TRAMITE, DESC_TRAMITE, PAG_TRAMITE, IND_ACTIVO, ID_USUARIO_CREA, FEC_CREA_REG)
VALUES 
    ('VISA_TUR', 'Visa de Turista - Solicitud y renovación para extranjeros', 'https://migracion.gob.pa/visa-turista', 'S', 'ADMIN', GETDATE()),
    ('VISA_TRAB', 'Visa de Trabajo - Permiso laboral para extranjeros', 'https://migracion.gob.pa/visa-trabajo', 'S', 'ADMIN', GETDATE()),
    ('RESIDENCIA', 'Solicitud de Residencia Permanente', 'https://migracion.gob.pa/residencia', 'S', 'ADMIN', GETDATE()),
    ('PRORROGA', 'Prórroga de Permanencia Temporal', 'https://migracion.gob.pa/prorroga', 'S', 'ADMIN', GETDATE()),
    ('NATURALIZ', 'Naturalización - Solicitud de ciudadanía panameña', 'https://migracion.gob.pa/naturalizacion', 'S', 'ADMIN', GETDATE()),
    ('CERT_MIGR', 'Certificado de Movimientos Migratorios', 'https://migracion.gob.pa/certificados', 'S', 'ADMIN', GETDATE()),
    ('SALVOCOND', 'Salvoconducto - Documento de salida temporal', 'https://migracion.gob.pa/salvoconducto', 'S', 'ADMIN', GETDATE());
GO

PRINT '✅ 7 tipos de trámites insertados';
GO

-- ==========================================
-- 2. CATÁLOGO: Estatus de Trámites
-- ==========================================
INSERT INTO SIM_FT_ESTATUS (COD_ESTATUS, NOM_ESTATUS, IND_ACTIVO, ID_USUARIO_CREA, FEC_CREA_REG)
VALUES 
    ('01', 'Recibido', 'S', 'ADMIN', GETDATE()),
    ('02', 'En Revisión', 'S', 'ADMIN', GETDATE()),
    ('03', 'Requiere Información Adicional', 'S', 'ADMIN', GETDATE()),
    ('04', 'En Evaluación', 'S', 'ADMIN', GETDATE()),
    ('05', 'Aprobado', 'S', 'ADMIN', GETDATE()),
    ('06', 'Rechazado', 'S', 'ADMIN', GETDATE()),
    ('07', 'Suspendido', 'S', 'ADMIN', GETDATE()),
    ('08', 'En Espera de Pago', 'S', 'ADMIN', GETDATE()),
    ('09', 'En Impresión', 'S', 'ADMIN', GETDATE()),
    ('10', 'Finalizado', 'S', 'ADMIN', GETDATE());
GO

PRINT '✅ 10 estatus insertados';
GO

-- ==========================================
-- 3. CATÁLOGO: Conclusiones
-- ==========================================
INSERT INTO SIM_FT_CONCLUSION (COD_CONCLUSION, NOM_CONCLUSION, IND_ACTIVO, ID_USUARIO_CREA, FEC_CREA_REG)
VALUES 
    ('AP', 'Aprobado', 'S', 'ADMIN', GETDATE()),
    ('RE', 'Rechazado', 'S', 'ADMIN', GETDATE()),
    ('CA', 'Cancelado', 'S', 'ADMIN', GETDATE()),
    ('DE', 'Desistido', 'S', 'ADMIN', GETDATE()),
    ('AR', 'Archivado', 'S', 'ADMIN', GETDATE());
GO

PRINT '✅ 5 conclusiones insertadas';
GO

-- ==========================================
-- 4. CATÁLOGO: Prioridades
-- ==========================================
INSERT INTO SIM_FT_PRIORIDAD (COD_PRIORIDAD, NOM_PRIORIDAD, IND_ACTIVO, ID_USUARIO_CREA, FEC_CREA_REG)
VALUES 
    ('1', 'Urgente', 'S', 'ADMIN', GETDATE()),
    ('2', 'Alta', 'S', 'ADMIN', GETDATE()),
    ('3', 'Normal', 'S', 'ADMIN', GETDATE()),
    ('4', 'Baja', 'S', 'ADMIN', GETDATE());
GO

PRINT '✅ 4 prioridades insertadas';
GO

-- ==========================================
-- 5. CATÁLOGO: Usuarios y Secciones
-- ==========================================
INSERT INTO SIM_FT_USUA_SEC (ID_USUARIO, COD_SECCION, COD_AGENCIA, IND_ACTIVO, ID_USUARIO_CREA, FEC_CREA_REG)
VALUES 
    ('USR001', '0101', '01', 'S', 'ADMIN', GETDATE()), -- Usuario 1 - Oficina Central - Recepción
    ('USR002', '0102', '01', 'S', 'ADMIN', GETDATE()), -- Usuario 2 - Oficina Central - Evaluación
    ('USR003', '0103', '01', 'S', 'ADMIN', GETDATE()), -- Usuario 3 - Oficina Central - Aprobación
    ('USR004', '0201', '02', 'S', 'ADMIN', GETDATE()), -- Usuario 4 - Tocumen - Recepción
    ('USR005', '0201', '02', 'S', 'ADMIN', GETDATE()), -- Usuario 5 - Tocumen - Recepción
    ('USR006', '0301', '03', 'S', 'ADMIN', GETDATE()), -- Usuario 6 - Colón - Recepción
    ('USR007', '0102', '01', 'S', 'ADMIN', GETDATE()); -- Usuario 7 - Oficina Central - Evaluación
GO

PRINT '✅ 7 asignaciones usuario-sección insertadas';
GO

-- ==========================================
-- 6. PASOS: Definición de pasos por trámite
-- ==========================================

-- Pasos para VISA_TUR
INSERT INTO SIM_FT_PASOS (COD_TRAMITE, NUM_PASO, NOM_DESCRIPCION, IND_ACTIVO, ID_USUARIO_CREA, FEC_CREA_REG)
VALUES 
    ('VISA_TUR', 1, 'Recepción de Solicitud', 'S', 'ADMIN', GETDATE()),
    ('VISA_TUR', 2, 'Revisión de Documentos', 'S', 'ADMIN', GETDATE()),
    ('VISA_TUR', 3, 'Evaluación de Antecedentes', 'S', 'ADMIN', GETDATE()),
    ('VISA_TUR', 4, 'Aprobación Final', 'S', 'ADMIN', GETDATE()),
    ('VISA_TUR', 5, 'Emisión de Visa', 'S', 'ADMIN', GETDATE());

-- Pasos para VISA_TRAB
INSERT INTO SIM_FT_PASOS (COD_TRAMITE, NUM_PASO, NOM_DESCRIPCION, IND_ACTIVO, ID_USUARIO_CREA, FEC_CREA_REG)
VALUES 
    ('VISA_TRAB', 1, 'Recepción de Solicitud', 'S', 'ADMIN', GETDATE()),
    ('VISA_TRAB', 2, 'Verificación de Oferta Laboral', 'S', 'ADMIN', GETDATE()),
    ('VISA_TRAB', 3, 'Evaluación de Antecedentes', 'S', 'ADMIN', GETDATE()),
    ('VISA_TRAB', 4, 'Validación del Empleador', 'S', 'ADMIN', GETDATE()),
    ('VISA_TRAB', 5, 'Aprobación MITRADEL', 'S', 'ADMIN', GETDATE()),
    ('VISA_TRAB', 6, 'Aprobación Final Migración', 'S', 'ADMIN', GETDATE()),
    ('VISA_TRAB', 7, 'Emisión de Visa', 'S', 'ADMIN', GETDATE());

-- Pasos para RESIDENCIA
INSERT INTO SIM_FT_PASOS (COD_TRAMITE, NUM_PASO, NOM_DESCRIPCION, IND_ACTIVO, ID_USUARIO_CREA, FEC_CREA_REG)
VALUES 
    ('RESIDENCIA', 1, 'Recepción de Solicitud', 'S', 'ADMIN', GETDATE()),
    ('RESIDENCIA', 2, 'Revisión de Documentación Completa', 'S', 'ADMIN', GETDATE()),
    ('RESIDENCIA', 3, 'Evaluación de Antecedentes Penales', 'S', 'ADMIN', GETDATE()),
    ('RESIDENCIA', 4, 'Verificación de Solvencia Económica', 'S', 'ADMIN', GETDATE()),
    ('RESIDENCIA', 5, 'Aprobación Dirección', 'S', 'ADMIN', GETDATE()),
    ('RESIDENCIA', 6, 'Emisión de Cédula de Residente', 'S', 'ADMIN', GETDATE());

-- Pasos para CERT_MIGR
INSERT INTO SIM_FT_PASOS (COD_TRAMITE, NUM_PASO, NOM_DESCRIPCION, IND_ACTIVO, ID_USUARIO_CREA, FEC_CREA_REG)
VALUES 
    ('CERT_MIGR', 1, 'Recepción de Solicitud', 'S', 'ADMIN', GETDATE()),
    ('CERT_MIGR', 2, 'Consulta en Sistema', 'S', 'ADMIN', GETDATE()),
    ('CERT_MIGR', 3, 'Generación de Certificado', 'S', 'ADMIN', GETDATE());
GO

PRINT '✅ 21 pasos de trámites insertados';
GO

-- ==========================================
-- 7. FLUJO: Configuración de pasos y secuencia
-- ==========================================

-- Flujo para VISA_TUR
INSERT INTO SIM_FT_PASOXTRAM (COD_TRAMITE, NUM_PASO, COD_SECCION, ID_PASO_SGTE, IND_ACTIVO, ID_USUARIO_CREA, FEC_CREA_REG)
VALUES 
    ('VISA_TUR', 1, '0101', 2, 'S', 'ADMIN', GETDATE()),
    ('VISA_TUR', 2, '0102', 3, 'S', 'ADMIN', GETDATE()),
    ('VISA_TUR', 3, '0102', 4, 'S', 'ADMIN', GETDATE()),
    ('VISA_TUR', 4, '0103', 5, 'S', 'ADMIN', GETDATE()),
    ('VISA_TUR', 5, '0101', NULL, 'S', 'ADMIN', GETDATE());

-- Flujo para VISA_TRAB
INSERT INTO SIM_FT_PASOXTRAM (COD_TRAMITE, NUM_PASO, COD_SECCION, ID_PASO_SGTE, IND_ACTIVO, ID_USUARIO_CREA, FEC_CREA_REG)
VALUES 
    ('VISA_TRAB', 1, '0101', 2, 'S', 'ADMIN', GETDATE()),
    ('VISA_TRAB', 2, '0102', 3, 'S', 'ADMIN', GETDATE()),
    ('VISA_TRAB', 3, '0102', 4, 'S', 'ADMIN', GETDATE()),
    ('VISA_TRAB', 4, '0102', 5, 'S', 'ADMIN', GETDATE()),
    ('VISA_TRAB', 5, '0102', 6, 'S', 'ADMIN', GETDATE()),
    ('VISA_TRAB', 6, '0103', 7, 'S', 'ADMIN', GETDATE()),
    ('VISA_TRAB', 7, '0101', NULL, 'S', 'ADMIN', GETDATE());

-- Flujo para RESIDENCIA
INSERT INTO SIM_FT_PASOXTRAM (COD_TRAMITE, NUM_PASO, COD_SECCION, ID_PASO_SGTE, IND_ACTIVO, ID_USUARIO_CREA, FEC_CREA_REG)
VALUES 
    ('RESIDENCIA', 1, '0101', 2, 'S', 'ADMIN', GETDATE()),
    ('RESIDENCIA', 2, '0102', 3, 'S', 'ADMIN', GETDATE()),
    ('RESIDENCIA', 3, '0102', 4, 'S', 'ADMIN', GETDATE()),
    ('RESIDENCIA', 4, '0102', 5, 'S', 'ADMIN', GETDATE()),
    ('RESIDENCIA', 5, '0103', 6, 'S', 'ADMIN', GETDATE()),
    ('RESIDENCIA', 6, '0101', NULL, 'S', 'ADMIN', GETDATE());

-- Flujo para CERT_MIGR
INSERT INTO SIM_FT_PASOXTRAM (COD_TRAMITE, NUM_PASO, COD_SECCION, ID_PASO_SGTE, IND_ACTIVO, ID_USUARIO_CREA, FEC_CREA_REG)
VALUES 
    ('CERT_MIGR', 1, '0101', 2, 'S', 'ADMIN', GETDATE()),
    ('CERT_MIGR', 2, '0102', 3, 'S', 'ADMIN', GETDATE()),
    ('CERT_MIGR', 3, '0101', NULL, 'S', 'ADMIN', GETDATE());
GO

PRINT '✅ 21 configuraciones de flujo insertadas';
GO

-- ==========================================
-- 8. TRÁMITES: Encabezados (SIM_FT_TRAMITE_E)
-- ==========================================
INSERT INTO SIM_FT_TRAMITE_E (
    NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO, COD_TRAMITE, 
    FEC_INI_TRAMITE, FEC_FIN_TRAMITE, IND_ESTATUS, IND_CONCLUSION, IND_PRIORIDAD,
    OBS_OBSERVA, HITS_TRAMITE, ID_USUARIO_CREA, FEC_ACTUALIZA
)
VALUES 
    -- Trámite 1: Visa de Turista - En proceso
    (2025, 1, 1, 'VISA_TUR', DATEADD(day, -15, GETDATE()), NULL, '02', NULL, '3', 'Solicitud de visa de turista en revisión documental.', 5, 'USR001', GETDATE()),
    
    -- Trámite 2: Visa de Trabajo - Aprobado
    (2025, 2, 1, 'VISA_TRAB', DATEADD(day, -45, GETDATE()), DATEADD(day, -32, GETDATE()), '05', 'AP', '2', 'Visa de trabajo aprobada. MITRADEL validó empleador.', 15, 'USR001', GETDATE()),
    
    -- Trámite 3: Residencia - En evaluación
    (2025, 3, 1, 'RESIDENCIA', DATEADD(day, -30, GETDATE()), NULL, '04', NULL, '1', 'Residencia permanente en evaluación. Verificando solvencia económica.', 8, 'USR001', GETDATE()),
    
    -- Trámite 4: Certificado Migratorio - Recién recibido
    (2025, 4, 1, 'CERT_MIGR', DATEADD(day, -2, GETDATE()), NULL, '01', NULL, '3', 'Certificado de movimientos migratorios recién recibido.', 1, 'USR004', GETDATE()),
    
    -- Trámite 5: Visa de Turista - Requiere información
    (2025, 5, 1, 'VISA_TUR', DATEADD(day, -20, GETDATE()), NULL, '03', NULL, '3', 'Requiere documentación adicional (pasaporte legible).', 4, 'USR001', GETDATE()),
    
    -- Trámite 6: Visa de Trabajo - Urgente en proceso
    (2025, 6, 1, 'VISA_TRAB', DATEADD(day, -10, GETDATE()), NULL, '04', NULL, '1', 'Caso urgente - inversor extranjero. Prioridad alta.', 6, 'USR001', GETDATE()),
    
    -- Trámite 7: Residencia - Finalizado
    (2025, 7, 1, 'RESIDENCIA', DATEADD(day, -60, GETDATE()), DATEADD(day, -30, GETDATE()), '10', 'AP', '2', 'Residencia aprobada y cédula emitida.', 20, 'USR001', GETDATE()),
    
    -- Trámite 8: Certificado - Procesándose
    (2025, 8, 1, 'CERT_MIGR', DATEADD(day, -1, GETDATE()), NULL, '02', NULL, '4', 'Certificado en proceso de generación.', 2, 'USR006', GETDATE());
GO

PRINT '✅ 8 trámites (encabezados) insertados';
GO

-- ==========================================
-- 9. TRÁMITES: Detalles/Pasos (SIM_FT_TRAMITE_D)
-- ==========================================

-- Pasos del Trámite 1 (Visa Turista - En revisión)
INSERT INTO SIM_FT_TRAMITE_D (
    NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO, NUM_PASO, COD_TRAMITE,
    NUM_ACTIVIDAD, COD_SECCION, COD_AGENCIA, ID_USUAR_RESP,
    OBS_OBSERVACION, NUM_PASO_SGTE, IND_ESTATUS, IND_CONCLUSION,
    ID_USUARIO_CREA, FEC_ACTUALIZA
)
VALUES 
    (2025, 1, 1, 1, 'VISA_TUR', 1, '0101', '01', 'USR001', 'Solicitud recibida. Documentación inicial completa.', 2, '10', NULL, 'USR001', DATEADD(day, -15, GETDATE())),
    (2025, 1, 1, 2, 'VISA_TUR', 2, '0102', '01', 'USR002', 'En proceso de revisión documental.', 3, '02', NULL, 'USR002', GETDATE());

-- Pasos del Trámite 2 (Visa Trabajo - Aprobado)
INSERT INTO SIM_FT_TRAMITE_D (
    NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO, NUM_PASO, COD_TRAMITE,
    NUM_ACTIVIDAD, COD_SECCION, COD_AGENCIA, ID_USUAR_RESP,
    OBS_OBSERVACION, NUM_PASO_SGTE, IND_ESTATUS, IND_CONCLUSION,
    ID_USUARIO_CREA, FEC_ACTUALIZA
)
VALUES 
    (2025, 2, 1, 1, 'VISA_TRAB', 1, '0101', '01', 'USR001', 'Solicitud recibida con carta de empleador.', 2, '10', NULL, 'USR001', DATEADD(day, -45, GETDATE())),
    (2025, 2, 1, 2, 'VISA_TRAB', 2, '0102', '01', 'USR002', 'Oferta laboral verificada exitosamente.', 3, '10', NULL, 'USR002', DATEADD(day, -44, GETDATE())),
    (2025, 2, 1, 3, 'VISA_TRAB', 3, '0102', '01', 'USR007', 'Antecedentes limpios. Sin observaciones.', 4, '10', NULL, 'USR007', DATEADD(day, -42, GETDATE())),
    (2025, 2, 1, 4, 'VISA_TRAB', 4, '0102', '01', 'USR002', 'Empleador válido y registrado ante MITRADEL.', 5, '10', NULL, 'USR002', DATEADD(day, -39, GETDATE())),
    (2025, 2, 1, 5, 'VISA_TRAB', 5, '0102', '01', 'USR002', 'MITRADEL emitió aprobación.', 6, '10', NULL, 'USR002', DATEADD(day, -37, GETDATE())),
    (2025, 2, 1, 6, 'VISA_TRAB', 6, '0103', '01', 'USR003', 'Aprobación final concedida.', 7, '10', 'AP', 'USR003', DATEADD(day, -34, GETDATE()));

-- Pasos del Trámite 3 (Residencia - En evaluación)
INSERT INTO SIM_FT_TRAMITE_D (
    NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO, NUM_PASO, COD_TRAMITE,
    NUM_ACTIVIDAD, COD_SECCION, COD_AGENCIA, ID_USUAR_RESP,
    OBS_OBSERVACION, NUM_PASO_SGTE, IND_ESTATUS, IND_CONCLUSION,
    ID_USUARIO_CREA, FEC_ACTUALIZA
)
VALUES 
    (2025, 3, 1, 1, 'RESIDENCIA', 1, '0101', '01', 'USR001', 'Solicitud de residencia permanente recibida.', 2, '10', NULL, 'USR001', DATEADD(day, -30, GETDATE())),
    (2025, 3, 1, 2, 'RESIDENCIA', 2, '0102', '01', 'USR002', 'Documentación completa y certificada.', 3, '10', NULL, 'USR002', DATEADD(day, -28, GETDATE())),
    (2025, 3, 1, 3, 'RESIDENCIA', 3, '0102', '01', 'USR007', 'Antecedentes en proceso de verificación internacional.', 4, '10', NULL, 'USR007', DATEADD(day, -25, GETDATE())),
    (2025, 3, 1, 4, 'RESIDENCIA', 4, '0102', '01', 'USR007', 'Validando solvencia económica con extractos bancarios.', 5, '04', NULL, 'USR007', GETDATE());

-- Pasos del Trámite 4 (Certificado - Recién recibido)
INSERT INTO SIM_FT_TRAMITE_D (
    NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO, NUM_PASO, COD_TRAMITE,
    NUM_ACTIVIDAD, COD_SECCION, COD_AGENCIA, ID_USUAR_RESP,
    OBS_OBSERVACION, NUM_PASO_SGTE, IND_ESTATUS, IND_CONCLUSION,
    ID_USUARIO_CREA, FEC_ACTUALIZA
)
VALUES 
    (2025, 4, 1, 1, 'CERT_MIGR', 1, '0201', '02', 'USR004', 'Solicitud de certificado recibida en Tocumen.', 2, '01', NULL, 'USR004', DATEADD(day, -2, GETDATE()));

-- Pasos del Trámite 5 (Visa Turista - Requiere información)
INSERT INTO SIM_FT_TRAMITE_D (
    NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO, NUM_PASO, COD_TRAMITE,
    NUM_ACTIVIDAD, COD_SECCION, COD_AGENCIA, ID_USUAR_RESP,
    OBS_OBSERVACION, NUM_PASO_SGTE, IND_ESTATUS, IND_CONCLUSION,
    ID_USUARIO_CREA, FEC_ACTUALIZA
)
VALUES 
    (2025, 5, 1, 1, 'VISA_TUR', 1, '0101', '01', 'USR001', 'Solicitud recibida.', 2, '10', NULL, 'USR001', DATEADD(day, -20, GETDATE())),
    (2025, 5, 1, 2, 'VISA_TUR', 2, '0102', '01', 'USR002', 'REQUIERE: Fotocopia legible del pasaporte completo. El documento actual no es legible.', 3, '03', NULL, 'USR002', DATEADD(day, -18, GETDATE()));
GO

PRINT '✅ Pasos de trámites insertados (múltiples pasos por trámite)';
GO

-- ==========================================
-- 10. CIERRE: Trámites finalizados
-- ==========================================

-- Cierre del Trámite 7 (Residencia finalizada)
INSERT INTO SIM_FT_TRAMITE_CIERRE (
    NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO,
    FEC_CIERRE, ID_USUARIO_CIERRE, OBS_CIERRE, COD_CONCLUSION,
    ID_USUARIO_CREA, FEC_CREA_REG
)
VALUES 
    (2025, 7, 1, DATEADD(day, -30, GETDATE()), 'USR003', 
     'Trámite completado satisfactoriamente. Cédula de residente emitida y entregada al solicitante.', 
     'AP', 'USR003', DATEADD(day, -30, GETDATE()));
GO

PRINT '✅ Cierre de trámite insertado';
GO

-- ==========================================
-- RESUMEN DE DATOS INSERTADOS
-- ==========================================
PRINT '';
PRINT '═══════════════════════════════════════════════════════════';
PRINT '📊 RESUMEN DE DATOS DE PRUEBA INSERTADOS';
PRINT '═══════════════════════════════════════════════════════════';
PRINT '';

SELECT 'SIM_FT_TRAMITES' AS Tabla, COUNT(*) AS Registros FROM SIM_FT_TRAMITES
UNION ALL
SELECT 'SIM_FT_ESTATUS', COUNT(*) FROM SIM_FT_ESTATUS
UNION ALL
SELECT 'SIM_FT_CONCLUSION', COUNT(*) FROM SIM_FT_CONCLUSION
UNION ALL
SELECT 'SIM_FT_PRIORIDAD', COUNT(*) FROM SIM_FT_PRIORIDAD
UNION ALL
SELECT 'SIM_FT_USUA_SEC', COUNT(*) FROM SIM_FT_USUA_SEC
UNION ALL
SELECT 'SIM_FT_PASOS', COUNT(*) FROM SIM_FT_PASOS
UNION ALL
SELECT 'SIM_FT_PASOXTRAM', COUNT(*) FROM SIM_FT_PASOXTRAM
UNION ALL
SELECT 'SIM_FT_TRAMITE_E', COUNT(*) FROM SIM_FT_TRAMITE_E
UNION ALL
SELECT 'SIM_FT_TRAMITE_D', COUNT(*) FROM SIM_FT_TRAMITE_D
UNION ALL
SELECT 'SIM_FT_TRAMITE_CIERRE', COUNT(*) FROM SIM_FT_TRAMITE_CIERRE;

PRINT '';
PRINT '✅ Datos de prueba insertados correctamente';
PRINT '';
PRINT '📝 Detalles de trámites de ejemplo:';
PRINT '  1. Visa Turista (VT-2025-000001) - En Revisión';
PRINT '  2. Visa Trabajo (VTR-2025-000002) - Aprobado';
PRINT '  3. Residencia (RES-2025-000003) - En Evaluación (Urgente)';
PRINT '  4. Certificado (CM-2025-000004) - Recibido';
PRINT '  5. Visa Turista (VT-2025-000005) - Requiere Información';
PRINT '  6. Visa Trabajo (VTR-2025-000006) - En Evaluación (Urgente)';
PRINT '  7. Residencia (RES-2025-000007) - Finalizado';
PRINT '  8. Certificado (CM-2025-000008) - Procesándose';
PRINT '';
PRINT '═══════════════════════════════════════════════════════════';
GO
