-- ==========================================
-- ACTUALIZACIÓN: Tipos de Documentos PPSH según Decreto N° 6
-- Sistema de Trámites Migratorios de Panamá
-- Fecha: 2025-11-10
-- Descripción: Actualiza catálogo de documentos PPSH según
--              Decreto N° 6 del 11 de Marzo del 2025
--              Requisitos oficiales del Servicio Nacional de Migración
-- ==========================================

USE [SIM_PANAMA]
GO

PRINT '=========================================='
PRINT 'ACTUALIZACIÓN DE DOCUMENTOS PPSH - DECRETO N° 6'
PRINT '=========================================='
PRINT ''

-- Limpiar datos anteriores (solo si existe la tabla)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PPSH_TIPO_DOCUMENTO]') AND type in (N'U'))
BEGIN
    PRINT 'Limpiando datos anteriores de PPSH_TIPO_DOCUMENTO...'
    DELETE FROM [dbo].[PPSH_TIPO_DOCUMENTO]
    PRINT '✓ Datos anteriores eliminados'
    PRINT ''
END
ELSE
BEGIN
    PRINT '⚠ La tabla PPSH_TIPO_DOCUMENTO no existe. Ejecutar primero migration_ppsh_v1.sql'
    PRINT ''
    -- No continuar si la tabla no existe
    RAISERROR('Tabla PPSH_TIPO_DOCUMENTO no encontrada', 16, 1)
    RETURN
END

-- ==========================================
-- INSERTAR LOS 13 REQUISITOS OFICIALES
-- ==========================================

PRINT 'Insertando 13 requisitos oficiales según Decreto N° 6...'

INSERT INTO [dbo].[PPSH_TIPO_DOCUMENTO] (nombre_tipo, es_obligatorio, descripcion, orden, activo)
VALUES 
    -- Requisito 1
    (
        'Poder y solicitud mediante apoderado legal',
        1, -- Obligatorio
        'Documento notariado que autoriza al apoderado legal a realizar el trámite',
        1
    ),
    
    -- Requisito 2
    (
        'Dos fotos tamaño carnet, fondo blanco o a color',
        1, -- Obligatorio
        'Fotografías recientes tipo carnet',
        2
    ),
    
    -- Requisito 3
    (
        'Copia completa del pasaporte debidamente notariado',
        1, -- Obligatorio
        'Todas las páginas del pasaporte vigente',
        3
    ),
    
    -- Requisito 4
    (
        'Comprobante de domicilio del solicitante',
        1, -- Obligatorio
        'Contrato de arrendamiento notariado (copia de cédula del arrendador Notariado) O Recibo de servicios públicos (Luz, agua, Cable e Internet - Copia Notariada)',
        4
    ),
    
    -- Requisito 5
    (
        'Certificado de antecedentes penales',
        1, -- Obligatorio
        'Del país de origen debidamente autenticado o apostillado, según sea el caso',
        5
    ),
    
    -- Requisito 6
    (
        'Declaración jurada de antecedentes personales',
        1, -- Obligatorio
        'Documento legal que declara los antecedentes del solicitante',
        6
    ),
    
    -- Requisito 7
    (
        'Certificado de salud',
        1, -- Obligatorio
        'Expedido por un profesional idóneo',
        7
    ),
    
    -- Requisito 8
    (
        'Registro de mano de obra migrante',
        1, -- Obligatorio
        'Copia del registro solicitado ante el Ministerio de Trabajo y Desarrollo Laboral',
        8
    ),
    
    -- Requisito 9
    (
        'Documentación para menores de edad',
        0, -- Condicional (solo si aplica)
        'Poder notariado otorgado por ambos padres o tutor legal, documento que compruebe el parentesco y carta de responsabilidad debidamente autenticada o apostillada',
        9
    ),
    
    -- Requisito 10
    (
        'Cheque B/.800.00 - Repatriación',
        1, -- Obligatorio
        'Cheque Certificado o de Gerencia del Banco Nacional, a favor del Servicio Nacional de Migración por un monto de B/.800.00 en concepto de repatriación',
        10
    ),
    
    -- Requisito 11
    (
        'Cheque B/.250.00 - Servicio Migratorio',
        1, -- Obligatorio
        'Cheque Certificado o de Gerencia del Banco Nacional, a favor del Servicio Nacional de Migración por un monto de B/.250.00 en concepto de servicio migratorio',
        11
    ),
    
    -- Requisito 12
    (
        'Pago B/.100.00 - Carnet y Visa Múltiple',
        1, -- Obligatorio
        'Pago por la suma de B/.100.00 en concepto de carnet y visa múltiple por el permiso solicitado',
        12
    ),
    
    -- Requisito 13
    (
        'Cheque B/.100.00 - Permiso de Trabajo',
        1, -- Obligatorio
        'Cheque Certificado o de Gerencia del Banco Nacional de Panamá a favor del Tesoro Nacional por un monto de cien balboas (B/.100.00), en concepto de Permiso de Trabajo',
        13
    )

PRINT '✓ 13 requisitos oficiales insertados correctamente'
PRINT ''

-- ==========================================
-- VERIFICACIÓN
-- ==========================================

PRINT 'Verificando datos insertados...'
PRINT ''

SELECT 
    cod_tipo_doc,
    nombre_tipo,
    es_obligatorio,
    orden,
    activo,
    LEFT(descripcion, 50) + '...' as descripcion_preview
FROM [dbo].[PPSH_TIPO_DOCUMENTO]
ORDER BY orden

DECLARE @total_docs INT
DECLARE @obligatorios INT
DECLARE @condicionales INT

SELECT @total_docs = COUNT(*) FROM [dbo].[PPSH_TIPO_DOCUMENTO]
SELECT @obligatorios = COUNT(*) FROM [dbo].[PPSH_TIPO_DOCUMENTO] WHERE es_obligatorio = 1
SELECT @condicionales = COUNT(*) FROM [dbo].[PPSH_TIPO_DOCUMENTO] WHERE es_obligatorio = 0

PRINT ''
PRINT '=========================================='
PRINT 'RESUMEN:'
PRINT CONCAT('Total de documentos: ', @total_docs)
PRINT CONCAT('Obligatorios: ', @obligatorios)
PRINT CONCAT('Condicionales: ', @condicionales)
PRINT '=========================================='
PRINT ''
PRINT '✓ Actualización completada exitosamente'
PRINT 'Documentos PPSH actualizados según Decreto N° 6 del 11 de Marzo del 2025'

GO
