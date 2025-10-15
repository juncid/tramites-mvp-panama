-- ==========================================
-- MIGRACIÓN PRIORIDAD ALTA - V1
-- Sistema de Trámites Migratorios de Panamá
-- Fecha: 2025-10-14
-- Descripción: Implementa recomendaciones críticas del health check
-- ==========================================

USE [SIM_PANAMA]
GO

PRINT '🔴 INICIANDO MIGRACIÓN DE PRIORIDAD ALTA...'
GO

-- ==========================================
-- PARTE 1: AGREGAR CAMPOS DE AUDITORÍA
-- ==========================================

PRINT '📋 Agregando campos de auditoría a tablas de catálogos...'

-- 1. SIM_GE_SEXO
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[SIM_GE_SEXO]') AND name = 'created_at')
BEGIN
    ALTER TABLE [dbo].[SIM_GE_SEXO] ADD 
        created_at DATETIME2(7) NOT NULL DEFAULT GETDATE(),
        created_by VARCHAR(17) NULL,
        updated_at DATETIME2(7) NULL,
        updated_by VARCHAR(17) NULL
    
    PRINT '✅ Campos de auditoría agregados a SIM_GE_SEXO'
END
GO

-- 2. SIM_GE_EST_CIVIL
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[SIM_GE_EST_CIVIL]') AND name = 'created_at')
BEGIN
    ALTER TABLE [dbo].[SIM_GE_EST_CIVIL] ADD 
        created_at DATETIME2(7) NOT NULL DEFAULT GETDATE(),
        created_by VARCHAR(17) NULL,
        updated_at DATETIME2(7) NULL,
        updated_by VARCHAR(17) NULL
    
    PRINT '✅ Campos de auditoría agregados a SIM_GE_EST_CIVIL'
END
GO

-- 3. SIM_GE_VIA_TRANSP
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[SIM_GE_VIA_TRANSP]') AND name = 'created_at')
BEGIN
    ALTER TABLE [dbo].[SIM_GE_VIA_TRANSP] ADD 
        created_at DATETIME2(7) NOT NULL DEFAULT GETDATE(),
        created_by VARCHAR(17) NULL,
        updated_at DATETIME2(7) NULL,
        updated_by VARCHAR(17) NULL
    
    PRINT '✅ Campos de auditoría agregados a SIM_GE_VIA_TRANSP'
END
GO

-- 4. SIM_GE_TIPO_MOV
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[SIM_GE_TIPO_MOV]') AND name = 'created_at')
BEGIN
    ALTER TABLE [dbo].[SIM_GE_TIPO_MOV] ADD 
        created_at DATETIME2(7) NOT NULL DEFAULT GETDATE(),
        created_by VARCHAR(17) NULL,
        updated_at DATETIME2(7) NULL,
        updated_by VARCHAR(17) NULL
    
    PRINT '✅ Campos de auditoría agregados a SIM_GE_TIPO_MOV'
END
GO

-- 5. tramites (tabla MVP)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[tramites]') AND name = 'created_at')
BEGIN
    ALTER TABLE [dbo].[tramites] ADD 
        created_at DATETIME2(7) NOT NULL DEFAULT GETDATE(),
        created_by VARCHAR(17) NULL,
        updated_at DATETIME2(7) NULL,
        updated_by VARCHAR(17) NULL
    
    PRINT '✅ Campos de auditoría agregados a tramites'
END
GO

-- ==========================================
-- PARTE 2: CREAR TABLA PPSH_PAGO
-- ==========================================

PRINT '💰 Creando tabla PPSH_PAGO para manejo de pagos...'

-- Tabla: PPSH_PAGO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PPSH_PAGO]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PPSH_PAGO](
        [id_pago] [int] IDENTITY(1,1) NOT NULL,
        [id_solicitud] [int] NOT NULL,
        [monto_usd] [decimal](10,2) NOT NULL,
        [tipo_concepto] [varchar](30) NOT NULL,
        [estado_tesoreria] [varchar](20) NOT NULL DEFAULT 'PENDIENTE',
        [num_recibo] [varchar](50) NULL,
        [fecha_pago] [datetime2](7) NULL,
        [metodo_pago] [varchar](20) NULL,
        [banco_emisor] [varchar](50) NULL,
        [num_cheque] [varchar](20) NULL,
        [num_transferencia] [varchar](50) NULL,
        [observaciones] [nvarchar](500) NULL,
        [created_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [created_by] [varchar](17) NULL,
        [updated_at] [datetime2](7) NULL,
        [updated_by] [varchar](17) NULL,
        
        CONSTRAINT [PK_PPSH_PAGO] PRIMARY KEY CLUSTERED ([id_pago] ASC),
        CONSTRAINT [FK_PPSH_PAGO_SOL] FOREIGN KEY ([id_solicitud]) 
            REFERENCES [dbo].[PPSH_SOLICITUD]([id_solicitud]) ON DELETE CASCADE
    )
    
    -- Crear índices para performance
    CREATE INDEX [IX_PPSH_PAGO_SOLICITUD] ON [dbo].[PPSH_PAGO]([id_solicitud])
    CREATE INDEX [IX_PPSH_PAGO_ESTADO] ON [dbo].[PPSH_PAGO]([estado_tesoreria])
    CREATE INDEX [IX_PPSH_PAGO_FECHA] ON [dbo].[PPSH_PAGO]([fecha_pago])
    CREATE INDEX [IX_PPSH_PAGO_CONCEPTO] ON [dbo].[PPSH_PAGO]([tipo_concepto])
    
    PRINT '✅ Tabla PPSH_PAGO creada con índices'
END
GO

-- ==========================================
-- PARTE 3: INSERTAR DATOS INICIALES PPSH_PAGO
-- ==========================================

PRINT '📊 Insertando catálogo de conceptos de pago...'

-- Insertar conceptos de pago estándar
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PPSH_CONCEPTO_PAGO]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PPSH_CONCEPTO_PAGO](
        [cod_concepto] [varchar](20) NOT NULL,
        [nom_concepto] [varchar](50) NOT NULL,
        [monto_usd] [decimal](10,2) NOT NULL,
        [descripcion] [nvarchar](200) NULL,
        [activo] [bit] NOT NULL DEFAULT 1,
        [created_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [created_by] [varchar](17) NULL,
        [updated_at] [datetime2](7) NULL,
        [updated_by] [varchar](17) NULL,
        
        CONSTRAINT [PK_PPSH_CONCEPTO_PAGO] PRIMARY KEY CLUSTERED ([cod_concepto] ASC)
    )
    
    -- Insertar conceptos de pago oficiales
    INSERT INTO [dbo].[PPSH_CONCEPTO_PAGO] 
    ([cod_concepto], [nom_concepto], [monto_usd], [descripcion], [created_by]) 
    VALUES 
    ('PPSH_INICIAL', 'Pago Inicial PPSH', 800.00, 'Pago inicial para solicitud de Permiso Por razones de Seguridad Humanitaria', 'SYSTEM'),
    ('PPSH_ADICIONAL', 'Pago Adicional PPSH', 250.00, 'Pago adicional para revisión especial de documentos', 'SYSTEM'),
    ('PPSH_REVISION', 'Pago de Revisión', 100.00, 'Pago para re-evaluación de solicitud rechazada', 'SYSTEM'),
    ('PPSH_EXPEDICION', 'Expedición de Documento', 50.00, 'Pago por expedición del documento final', 'SYSTEM'),
    ('PPSH_DUPLICADO', 'Duplicado de Documento', 25.00, 'Pago por duplicado de documento en caso de pérdida', 'SYSTEM')
    
    PRINT '✅ Conceptos de pago insertados'
END
GO

-- ==========================================
-- PARTE 4: CREAR TRIGGERS DE AUDITORÍA
-- ==========================================

PRINT '🔄 Creando triggers de auditoría automática...'

-- Trigger para auditoría automática de PPSH_PAGO
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_PPSH_PAGO_AUDIT')
BEGIN
    EXEC('
    CREATE TRIGGER TR_PPSH_PAGO_AUDIT
    ON [dbo].[PPSH_PAGO]
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        
        UPDATE [dbo].[PPSH_PAGO]
        SET updated_at = GETDATE(),
            updated_by = COALESCE(SUSER_SNAME(), ''SYSTEM'')
        FROM [dbo].[PPSH_PAGO] p
        INNER JOIN inserted i ON p.id_pago = i.id_pago
    END
    ')
    
    PRINT '✅ Trigger de auditoría TR_PPSH_PAGO_AUDIT creado'
END
GO

-- ==========================================
-- PARTE 5: CREAR VISTAS PARA REPORTES
-- ==========================================

PRINT '📊 Creando vistas para reportes de pagos...'

-- Vista para reporte completo de pagos
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'VW_PPSH_PAGOS_COMPLETO')
BEGIN
    EXEC('
    CREATE VIEW [dbo].[VW_PPSH_PAGOS_COMPLETO]
    AS
    SELECT 
        p.id_pago,
        p.id_solicitud,
        s.num_expediente,
        s.fecha_solicitud,
        p.tipo_concepto,
        cp.nom_concepto,
        p.monto_usd,
        p.estado_tesoreria,
        p.num_recibo,
        p.fecha_pago,
        p.metodo_pago,
        p.banco_emisor,
        p.num_cheque,
        p.num_transferencia,
        p.observaciones,
        p.created_at as fecha_registro,
        p.created_by as registrado_por,
        
        -- Información del solicitante principal
        sol.nombre_completo as solicitante_principal,
        sol.num_documento as documento_solicitante,
        
        -- Estado actual de la solicitud
        s.estado_actual,
        es.descripcion as estado_descripcion,
        
        -- Agencia que procesa
        ag.nombre as agencia_procesadora
        
    FROM [dbo].[PPSH_PAGO] p
    INNER JOIN [dbo].[PPSH_SOLICITUD] s ON p.id_solicitud = s.id_solicitud
    LEFT JOIN [dbo].[PPSH_CONCEPTO_PAGO] cp ON p.tipo_concepto = cp.cod_concepto
    LEFT JOIN [dbo].[PPSH_SOLICITANTE] sol ON s.id_solicitud = sol.id_solicitud AND sol.es_titular = 1
    LEFT JOIN [dbo].[PPSH_ESTADO] es ON s.estado_actual = es.codigo
    LEFT JOIN [dbo].[SIM_GE_AGENCIA] ag ON s.cod_agencia = ag.codigo
    ')
    
    PRINT '✅ Vista VW_PPSH_PAGOS_COMPLETO creada'
END
GO

-- ==========================================
-- PARTE 6: CREAR PROCEDIMIENTOS ALMACENADOS
-- ==========================================

PRINT '⚙️ Creando procedimientos almacenados para gestión de pagos...'

-- Procedimiento para registrar pago
IF NOT EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_REGISTRAR_PAGO_PPSH')
BEGIN
    EXEC('
    CREATE PROCEDURE [dbo].[SP_REGISTRAR_PAGO_PPSH]
        @id_solicitud INT,
        @tipo_concepto VARCHAR(30),
        @metodo_pago VARCHAR(20),
        @num_recibo VARCHAR(50) = NULL,
        @banco_emisor VARCHAR(50) = NULL,
        @num_cheque VARCHAR(20) = NULL,
        @num_transferencia VARCHAR(50) = NULL,
        @observaciones NVARCHAR(500) = NULL,
        @usuario VARCHAR(17)
    AS
    BEGIN
        SET NOCOUNT ON;
        
        DECLARE @monto_usd DECIMAL(10,2)
        DECLARE @id_pago INT
        
        -- Obtener monto del concepto
        SELECT @monto_usd = monto_usd 
        FROM [dbo].[PPSH_CONCEPTO_PAGO] 
        WHERE cod_concepto = @tipo_concepto AND activo = 1
        
        IF @monto_usd IS NULL
        BEGIN
            RAISERROR(''Concepto de pago no válido o inactivo'', 16, 1)
            RETURN
        END
        
        -- Insertar pago
        INSERT INTO [dbo].[PPSH_PAGO] 
        (id_solicitud, monto_usd, tipo_concepto, estado_tesoreria, num_recibo, 
         fecha_pago, metodo_pago, banco_emisor, num_cheque, num_transferencia, 
         observaciones, created_by)
        VALUES 
        (@id_solicitud, @monto_usd, @tipo_concepto, ''PAGADO'', @num_recibo, 
         GETDATE(), @metodo_pago, @banco_emisor, @num_cheque, @num_transferencia, 
         @observaciones, @usuario)
         
        SET @id_pago = SCOPE_IDENTITY()
        
        -- Actualizar estado de solicitud si es pago inicial
        IF @tipo_concepto = ''PPSH_INICIAL''
        BEGIN
            UPDATE [dbo].[PPSH_SOLICITUD] 
            SET estado_actual = ''PAGO_CONFIRMADO''
            WHERE id_solicitud = @id_solicitud
        END
        
        SELECT @id_pago as id_pago_generado, @monto_usd as monto_pagado
    END
    ')
    
    PRINT '✅ Procedimiento SP_REGISTRAR_PAGO_PPSH creado'
END
GO

-- ==========================================
-- PARTE 7: VERIFICACIÓN FINAL
-- ==========================================

PRINT '🔍 Verificando integridad de la migración...'

-- Verificar que todas las tablas tienen campos de auditoría
DECLARE @tablas_sin_auditoria INT = 0

SELECT @tablas_sin_auditoria = COUNT(*)
FROM sys.tables t
WHERE t.name IN ('SIM_GE_SEXO', 'SIM_GE_EST_CIVIL', 'SIM_GE_VIA_TRANSP', 'SIM_GE_TIPO_MOV', 'tramites')
AND NOT EXISTS (
    SELECT 1 FROM sys.columns c 
    WHERE c.object_id = t.object_id AND c.name = 'created_at'
)

IF @tablas_sin_auditoria = 0
    PRINT '✅ VERIFICACIÓN: Todas las tablas tienen campos de auditoría'
ELSE
    PRINT '❌ VERIFICACIÓN: Faltan campos de auditoría en algunas tablas'

-- Verificar que la tabla PPSH_PAGO existe
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PPSH_PAGO]') AND type in (N'U'))
    PRINT '✅ VERIFICACIÓN: Tabla PPSH_PAGO creada correctamente'
ELSE
    PRINT '❌ VERIFICACIÓN: Tabla PPSH_PAGO no se creó'

-- Verificar que los conceptos de pago se insertaron
DECLARE @conceptos_count INT
SELECT @conceptos_count = COUNT(*) FROM [dbo].[PPSH_CONCEPTO_PAGO]

IF @conceptos_count >= 5
    PRINT '✅ VERIFICACIÓN: Conceptos de pago insertados correctamente (' + CAST(@conceptos_count AS VARCHAR) + ' conceptos)'
ELSE
    PRINT '❌ VERIFICACIÓN: Faltan conceptos de pago'

PRINT ''
PRINT '🎉 MIGRACIÓN DE PRIORIDAD ALTA COMPLETADA EXITOSAMENTE'
PRINT '📊 Resumen de cambios aplicados:'
PRINT '   ✅ Campos de auditoría agregados a 5 tablas'
PRINT '   ✅ Tabla PPSH_PAGO creada con 4 índices'
PRINT '   ✅ Tabla PPSH_CONCEPTO_PAGO creada con 5 conceptos'
PRINT '   ✅ Trigger de auditoría automática creado'
PRINT '   ✅ Vista de reportes VW_PPSH_PAGOS_COMPLETO creada'
PRINT '   ✅ Procedimiento SP_REGISTRAR_PAGO_PPSH creado'
PRINT ''
PRINT '🔄 Próximos pasos recomendados:'
PRINT '   1. Actualizar modelos SQLAlchemy en models_ppsh.py'
PRINT '   2. Generar migración Alembic'
PRINT '   3. Actualizar schemas y routes para pagos'
PRINT '   4. Ejecutar tests de integridad'
GO