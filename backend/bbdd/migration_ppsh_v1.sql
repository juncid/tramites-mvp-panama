-- ==========================================
-- MIGRACIÓN: Tablas para Proceso PPSH v1.0
-- Sistema de Trámites Migratorios de Panamá
-- Fecha: 2025-10-13
-- Descripción: Implementación de tablas para gestión de
--              Permisos Por razones Humanitarias (PPSH)
-- ==========================================

USE [SIM_PANAMA]
GO

PRINT '=========================================='
PRINT 'INICIO DE MIGRACIÓN PPSH v1.0'
PRINT '=========================================='
PRINT ''

-- ==========================================
-- TABLA 1: PPSH_CAUSA_HUMANITARIA (Catálogo)
-- ==========================================

PRINT 'Creando tabla: PPSH_CAUSA_HUMANITARIA...'

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PPSH_CAUSA_HUMANITARIA]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PPSH_CAUSA_HUMANITARIA](
        [cod_causa] [int] IDENTITY(1,1) NOT NULL,
        [nombre_causa] [varchar](100) NOT NULL,
        [descripcion] [nvarchar](500) NULL,
        [requiere_evidencia] [bit] NOT NULL DEFAULT 1,
        [activo] [bit] NOT NULL DEFAULT 1,
        [created_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [created_by] [varchar](17) NULL,
        
        CONSTRAINT [PK_PPSH_CAUSA] PRIMARY KEY CLUSTERED ([cod_causa] ASC)
    )
    
    -- Índices
    CREATE INDEX [IX_PPSH_CAUSA_ACTIVO] ON [dbo].[PPSH_CAUSA_HUMANITARIA]([activo])
    
    PRINT '✓ Tabla PPSH_CAUSA_HUMANITARIA creada'
    
    -- Datos iniciales
    INSERT INTO [dbo].[PPSH_CAUSA_HUMANITARIA] (nombre_causa, descripcion, requiere_evidencia)
    VALUES 
        ('Conflicto Armado', 'Persona proveniente de zona de conflicto armado', 1),
        ('Desastre Natural', 'Víctima de desastre natural en país de origen', 1),
        ('Persecución Política', 'Persecución por motivos políticos o ideológicos', 1),
        ('Reunificación Familiar', 'Reunificación con familiar residente en Panamá', 1),
        ('Razones Médicas', 'Tratamiento médico urgente no disponible en país de origen', 1),
        ('Violencia de Género', 'Víctima de violencia de género o doméstica', 1),
        ('Trata de Personas', 'Víctima de trata de personas o explotación', 1),
        ('Refugiado', 'Persona con estatus de refugiado reconocido', 1),
        ('Vulnerabilidad Extrema', 'Situación de vulnerabilidad extrema documentada', 1),
        ('Otro', 'Otra causa humanitaria justificada', 1)
    
    PRINT '✓ Datos iniciales cargados: 10 causas humanitarias'
END
ELSE
BEGIN
    PRINT '⚠ Tabla PPSH_CAUSA_HUMANITARIA ya existe'
END
GO

-- ==========================================
-- TABLA 2: PPSH_TIPO_DOCUMENTO (Catálogo)
-- ==========================================

PRINT 'Creando tabla: PPSH_TIPO_DOCUMENTO...'

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PPSH_TIPO_DOCUMENTO]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PPSH_TIPO_DOCUMENTO](
        [cod_tipo_doc] [int] IDENTITY(1,1) NOT NULL,
        [nombre_tipo] [varchar](100) NOT NULL,
        [es_obligatorio] [bit] NOT NULL DEFAULT 0,
        [descripcion] [nvarchar](300) NULL,
        [orden] [int] NULL,
        [activo] [bit] NOT NULL DEFAULT 1,
        [created_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT [PK_PPSH_TIPO_DOC] PRIMARY KEY CLUSTERED ([cod_tipo_doc] ASC)
    )
    
    -- Índices
    CREATE INDEX [IX_PPSH_TIPO_DOC_ACTIVO] ON [dbo].[PPSH_TIPO_DOCUMENTO]([activo])
    CREATE INDEX [IX_PPSH_TIPO_DOC_ORDEN] ON [dbo].[PPSH_TIPO_DOCUMENTO]([orden])
    
    PRINT '✓ Tabla PPSH_TIPO_DOCUMENTO creada'
    
    -- Datos iniciales
    INSERT INTO [dbo].[PPSH_TIPO_DOCUMENTO] (nombre_tipo, es_obligatorio, descripcion, orden)
    VALUES 
        ('Formulario Solicitud PPSH', 1, 'Formulario oficial de solicitud debidamente completado', 1),
        ('Pasaporte', 1, 'Copia de pasaporte vigente (todas las páginas)', 2),
        ('Fotografía', 1, 'Fotografías recientes tamaño carnet (fondo blanco)', 3),
        ('Certificado Antecedentes Penales', 1, 'Del país de origen o último país de residencia', 4),
        ('Evidencia Causa Humanitaria', 1, 'Documentos que acreditan la causa humanitaria alegada', 5),
        ('Acta de Nacimiento', 0, 'Requerido para dependientes menores de edad', 6),
        ('Certificado de Matrimonio', 0, 'Requerido si se incluye cónyuge', 7),
        ('Solvencia Económica', 0, 'Carta bancaria, constancia de trabajo o similar', 8),
        ('Carta de Invitación', 0, 'Si aplica para reunificación familiar', 9),
        ('Informe Médico', 0, 'Requerido si la causa es por razones médicas', 10),
        ('Cédula de Identidad', 0, 'Del país de origen', 11),
        ('Prueba de Parentesco', 0, 'Documentos que acrediten vínculo familiar', 12)
    
    PRINT '✓ Datos iniciales cargados: 12 tipos de documentos'
END
ELSE
BEGIN
    PRINT '⚠ Tabla PPSH_TIPO_DOCUMENTO ya existe'
END
GO

-- ==========================================
-- TABLA 3: PPSH_ESTADO (Catálogo de Estados)
-- ==========================================

PRINT 'Creando tabla: PPSH_ESTADO...'

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PPSH_ESTADO]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PPSH_ESTADO](
        [cod_estado] [varchar](30) NOT NULL,
        [nombre_estado] [varchar](100) NOT NULL,
        [descripcion] [nvarchar](300) NULL,
        [orden] [int] NOT NULL,
        [color_hex] [varchar](7) NULL, -- Para UI: #FF0000
        [es_final] [bit] NOT NULL DEFAULT 0, -- Estado terminal (aprobado/rechazado)
        [activo] [bit] NOT NULL DEFAULT 1,
        
        CONSTRAINT [PK_PPSH_ESTADO] PRIMARY KEY CLUSTERED ([cod_estado] ASC)
    )
    
    -- Índices
    CREATE INDEX [IX_PPSH_ESTADO_ORDEN] ON [dbo].[PPSH_ESTADO]([orden])
    CREATE INDEX [IX_PPSH_ESTADO_ACTIVO] ON [dbo].[PPSH_ESTADO]([activo])
    
    PRINT '✓ Tabla PPSH_ESTADO creada'
    
    -- Datos iniciales
    INSERT INTO [dbo].[PPSH_ESTADO] (cod_estado, nombre_estado, descripcion, orden, color_hex, es_final)
    VALUES 
        ('RECIBIDO', 'Recibido', 'Solicitud recibida y registrada en el sistema', 1, '#3498db', 0),
        ('EN_REVISION', 'En Revisión Documental', 'Documentación siendo revisada por analista', 2, '#f39c12', 0),
        ('INCOMPLETO', 'Documentación Incompleta', 'Faltan documentos o requiere subsanación', 3, '#e74c3c', 0),
        ('SUBSANADO', 'Documentación Subsanada', 'Documentos faltantes han sido presentados', 4, '#9b59b6', 0),
        ('EN_VERIFICACION', 'En Verificación de Antecedentes', 'Verificando antecedentes penales y migratorios', 5, '#16a085', 0),
        ('EN_EVALUACION', 'En Evaluación Técnica', 'Evaluación de la causa humanitaria', 6, '#2980b9', 0),
        ('EN_ENTREVISTA', 'En Entrevista', 'Programada o en proceso de entrevista personal', 7, '#8e44ad', 0),
        ('CON_DICTAMEN_FAV', 'Con Dictamen Favorable', 'Analista recomienda aprobación', 8, '#27ae60', 0),
        ('CON_DICTAMEN_DESFAV', 'Con Dictamen Desfavorable', 'Analista recomienda rechazo', 9, '#c0392b', 0),
        ('EN_APROBACION', 'En Aprobación', 'Pendiente de aprobación por Director', 10, '#d35400', 0),
        ('APROBADO', 'Aprobado', 'Solicitud aprobada - en emisión de resolución', 11, '#2ecc71', 1),
        ('RECHAZADO', 'Rechazado', 'Solicitud rechazada', 12, '#e74c3c', 1),
        ('EN_EMISION', 'En Emisión de Resolución', 'Emitiendo documento de resolución', 13, '#1abc9c', 0),
        ('RESUELTO', 'Resuelto - Permiso Emitido', 'Permiso PPSH emitido y entregado', 14, '#27ae60', 1),
        ('ARCHIVADO', 'Archivado', 'Expediente archivado', 15, '#95a5a6', 1),
        ('CANCELADO', 'Cancelado', 'Solicitud cancelada por el solicitante', 16, '#7f8c8d', 1)
    
    PRINT '✓ Datos iniciales cargados: 16 estados'
END
ELSE
BEGIN
    PRINT '⚠ Tabla PPSH_ESTADO ya existe'
END
GO

-- ==========================================
-- TABLA 4: PPSH_SOLICITUD (Principal)
-- ==========================================

PRINT 'Creando tabla: PPSH_SOLICITUD...'

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PPSH_SOLICITUD]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PPSH_SOLICITUD](
        [id_solicitud] [int] IDENTITY(1,1) NOT NULL,
        [num_expediente] [varchar](20) NOT NULL,
        [tipo_solicitud] [varchar](20) NOT NULL DEFAULT 'INDIVIDUAL', -- 'INDIVIDUAL' | 'GRUPAL'
        [cod_causa_humanitaria] [int] NOT NULL,
        [descripcion_caso] [nvarchar](2000) NULL,
        [fecha_solicitud] [date] NOT NULL DEFAULT CAST(GETDATE() AS DATE),
        [estado_actual] [varchar](30) NOT NULL DEFAULT 'RECIBIDO',
        [cod_agencia] [varchar](2) NULL,
        [cod_seccion] [varchar](2) NULL,
        [user_id_asignado] [varchar](17) NULL,
        [fecha_asignacion] [datetime2](7) NULL,
        [prioridad] [varchar](10) NULL DEFAULT 'NORMAL', -- 'ALTA' | 'NORMAL' | 'BAJA'
        [observaciones_generales] [nvarchar](2000) NULL,
        [num_resolucion] [varchar](50) NULL,
        [fecha_resolucion] [date] NULL,
        [fecha_vencimiento_permiso] [date] NULL,
        [activo] [bit] NOT NULL DEFAULT 1,
        [created_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [created_by] [varchar](17) NULL,
        [updated_at] [datetime2](7) NULL,
        [updated_by] [varchar](17) NULL,
        
        CONSTRAINT [PK_PPSH_SOLICITUD] PRIMARY KEY CLUSTERED ([id_solicitud] ASC),
        CONSTRAINT [UK_PPSH_NUM_EXPEDIENTE] UNIQUE ([num_expediente]),
        CONSTRAINT [FK_PPSH_SOL_CAUSA] FOREIGN KEY ([cod_causa_humanitaria]) 
            REFERENCES [dbo].[PPSH_CAUSA_HUMANITARIA]([cod_causa]),
        CONSTRAINT [FK_PPSH_SOL_ESTADO] FOREIGN KEY ([estado_actual]) 
            REFERENCES [dbo].[PPSH_ESTADO]([cod_estado]),
        CONSTRAINT [FK_PPSH_SOL_AGENCIA] FOREIGN KEY ([cod_agencia]) 
            REFERENCES [dbo].[SIM_GE_AGENCIA]([COD_AGENCIA]),
        CONSTRAINT [FK_PPSH_SOL_SECCION] FOREIGN KEY ([cod_seccion]) 
            REFERENCES [dbo].[SIM_GE_SECCION]([COD_SECCION]),
        CONSTRAINT [FK_PPSH_SOL_USUARIO] FOREIGN KEY ([user_id_asignado]) 
            REFERENCES [dbo].[SEG_TB_USUARIOS]([USER_ID])
    )
    
    -- Índices para performance
    CREATE INDEX [IX_PPSH_SOL_NUM_EXP] ON [dbo].[PPSH_SOLICITUD]([num_expediente])
    CREATE INDEX [IX_PPSH_SOL_ESTADO] ON [dbo].[PPSH_SOLICITUD]([estado_actual])
    CREATE INDEX [IX_PPSH_SOL_FECHA] ON [dbo].[PPSH_SOLICITUD]([fecha_solicitud])
    CREATE INDEX [IX_PPSH_SOL_ASIGNADO] ON [dbo].[PPSH_SOLICITUD]([user_id_asignado])
    CREATE INDEX [IX_PPSH_SOL_ACTIVO] ON [dbo].[PPSH_SOLICITUD]([activo])
    CREATE INDEX [IX_PPSH_SOL_CAUSA] ON [dbo].[PPSH_SOLICITUD]([cod_causa_humanitaria])
    
    PRINT '✓ Tabla PPSH_SOLICITUD creada con índices'
END
ELSE
BEGIN
    PRINT '⚠ Tabla PPSH_SOLICITUD ya existe'
END
GO

-- ==========================================
-- TABLA 5: PPSH_SOLICITANTE (Personas)
-- ==========================================

PRINT 'Creando tabla: PPSH_SOLICITANTE...'

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PPSH_SOLICITANTE]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PPSH_SOLICITANTE](
        [id_solicitante] [int] IDENTITY(1,1) NOT NULL,
        [id_solicitud] [int] NOT NULL,
        [es_titular] [bit] NOT NULL DEFAULT 0,
        [tipo_documento] [varchar](20) NOT NULL DEFAULT 'PASAPORTE',
        [num_documento] [varchar](50) NOT NULL,
        [pais_emisor] [varchar](3) NOT NULL,
        [fecha_emision_doc] [date] NULL,
        [fecha_vencimiento_doc] [date] NULL,
        [primer_nombre] [varchar](50) NOT NULL,
        [segundo_nombre] [varchar](50) NULL,
        [primer_apellido] [varchar](50) NOT NULL,
        [segundo_apellido] [varchar](50) NULL,
        [fecha_nacimiento] [date] NOT NULL,
        [cod_sexo] [varchar](1) NOT NULL,
        [cod_nacionalidad] [varchar](3) NOT NULL,
        [cod_estado_civil] [varchar](1) NULL,
        [parentesco_titular] [varchar](20) NULL, -- 'CONYUGE' | 'HIJO' | 'PADRE' | 'MADRE' | 'HERMANO'
        [email] [varchar](100) NULL,
        [telefono] [varchar](20) NULL,
        [direccion_pais_origen] [nvarchar](200) NULL,
        [direccion_panama] [nvarchar](200) NULL,
        [ocupacion] [varchar](100) NULL,
        [foto] [varbinary](max) NULL,
        [observaciones] [nvarchar](500) NULL,
        [activo] [bit] NOT NULL DEFAULT 1,
        [created_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [created_by] [varchar](17) NULL,
        [updated_at] [datetime2](7) NULL,
        [updated_by] [varchar](17) NULL,
        
        CONSTRAINT [PK_PPSH_SOLICITANTE] PRIMARY KEY CLUSTERED ([id_solicitante] ASC),
        CONSTRAINT [FK_PPSH_SOLICITANTE_SOL] FOREIGN KEY ([id_solicitud]) 
            REFERENCES [dbo].[PPSH_SOLICITUD]([id_solicitud]) ON DELETE CASCADE,
        CONSTRAINT [FK_PPSH_SOLICITANTE_PAIS] FOREIGN KEY ([pais_emisor]) 
            REFERENCES [dbo].[SIM_GE_PAIS]([COD_PAIS]),
        CONSTRAINT [FK_PPSH_SOLICITANTE_SEXO] FOREIGN KEY ([cod_sexo]) 
            REFERENCES [dbo].[SIM_GE_SEXO]([COD_SEXO]),
        CONSTRAINT [FK_PPSH_SOLICITANTE_NACIONALIDAD] FOREIGN KEY ([cod_nacionalidad]) 
            REFERENCES [dbo].[SIM_GE_PAIS]([COD_PAIS]),
        CONSTRAINT [FK_PPSH_SOLICITANTE_ECIVIL] FOREIGN KEY ([cod_estado_civil]) 
            REFERENCES [dbo].[SIM_GE_EST_CIVIL]([COD_EST_CIVIL])
    )
    
    -- Índices
    CREATE INDEX [IX_PPSH_SOLICITANTE_SOL] ON [dbo].[PPSH_SOLICITANTE]([id_solicitud])
    CREATE INDEX [IX_PPSH_SOLICITANTE_DOC] ON [dbo].[PPSH_SOLICITANTE]([num_documento])
    CREATE INDEX [IX_PPSH_SOLICITANTE_TITULAR] ON [dbo].[PPSH_SOLICITANTE]([es_titular])
    CREATE INDEX [IX_PPSH_SOLICITANTE_NOMBRE] ON [dbo].[PPSH_SOLICITANTE]([primer_apellido], [primer_nombre])
    
    PRINT '✓ Tabla PPSH_SOLICITANTE creada con índices'
END
ELSE
BEGIN
    PRINT '⚠ Tabla PPSH_SOLICITANTE ya existe'
END
GO

-- ==========================================
-- TABLA 6: PPSH_DOCUMENTO (Archivos)
-- ==========================================

PRINT 'Creando tabla: PPSH_DOCUMENTO...'

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PPSH_DOCUMENTO]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PPSH_DOCUMENTO](
        [id_documento] [int] IDENTITY(1,1) NOT NULL,
        [id_solicitud] [int] NOT NULL,
        [cod_tipo_documento] [int] NULL,
        [tipo_documento_texto] [varchar](100) NULL, -- Si no está en catálogo
        [nombre_archivo] [varchar](255) NOT NULL,
        [ruta_archivo] [varchar](500) NULL,
        [contenido_binario] [varbinary](max) NULL,
        [extension] [varchar](10) NULL,
        [tamano_bytes] [bigint] NULL,
        [hash_md5] [varchar](32) NULL, -- Para verificar integridad
        [observaciones] [nvarchar](500) NULL,
        [es_obligatorio] [bit] NOT NULL DEFAULT 0,
        [estado_verificacion] [varchar](20) NULL DEFAULT 'PENDIENTE', -- 'PENDIENTE' | 'VERIFICADO' | 'RECHAZADO'
        [verificado_por] [varchar](17) NULL,
        [fecha_verificacion] [datetime2](7) NULL,
        [uploaded_by] [varchar](17) NULL,
        [uploaded_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT [PK_PPSH_DOCUMENTO] PRIMARY KEY CLUSTERED ([id_documento] ASC),
        CONSTRAINT [FK_PPSH_DOC_SOL] FOREIGN KEY ([id_solicitud]) 
            REFERENCES [dbo].[PPSH_SOLICITUD]([id_solicitud]) ON DELETE CASCADE,
        CONSTRAINT [FK_PPSH_DOC_TIPO] FOREIGN KEY ([cod_tipo_documento]) 
            REFERENCES [dbo].[PPSH_TIPO_DOCUMENTO]([cod_tipo_doc]),
        CONSTRAINT [FK_PPSH_DOC_UPLOADED] FOREIGN KEY ([uploaded_by]) 
            REFERENCES [dbo].[SEG_TB_USUARIOS]([USER_ID]),
        CONSTRAINT [FK_PPSH_DOC_VERIFICADO] FOREIGN KEY ([verificado_por]) 
            REFERENCES [dbo].[SEG_TB_USUARIOS]([USER_ID])
    )
    
    -- Índices
    CREATE INDEX [IX_PPSH_DOC_SOL] ON [dbo].[PPSH_DOCUMENTO]([id_solicitud])
    CREATE INDEX [IX_PPSH_DOC_TIPO] ON [dbo].[PPSH_DOCUMENTO]([cod_tipo_documento])
    CREATE INDEX [IX_PPSH_DOC_ESTADO] ON [dbo].[PPSH_DOCUMENTO]([estado_verificacion])
    CREATE INDEX [IX_PPSH_DOC_FECHA] ON [dbo].[PPSH_DOCUMENTO]([uploaded_at])
    
    PRINT '✓ Tabla PPSH_DOCUMENTO creada con índices'
END
ELSE
BEGIN
    PRINT '⚠ Tabla PPSH_DOCUMENTO ya existe'
END
GO

-- ==========================================
-- TABLA 7: PPSH_ESTADO_HISTORIAL (Trazabilidad)
-- ==========================================

PRINT 'Creando tabla: PPSH_ESTADO_HISTORIAL...'

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PPSH_ESTADO_HISTORIAL]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PPSH_ESTADO_HISTORIAL](
        [id_historial] [int] IDENTITY(1,1) NOT NULL,
        [id_solicitud] [int] NOT NULL,
        [estado_anterior] [varchar](30) NULL,
        [estado_nuevo] [varchar](30) NOT NULL,
        [fecha_cambio] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [user_id] [varchar](17) NOT NULL,
        [observaciones] [nvarchar](1000) NULL,
        [es_dictamen] [bit] NOT NULL DEFAULT 0,
        [tipo_dictamen] [varchar](20) NULL, -- 'FAVORABLE' | 'DESFAVORABLE' | NULL
        [dictamen_detalle] [nvarchar](2000) NULL,
        [dias_en_estado_anterior] [int] NULL, -- Calculado
        
        CONSTRAINT [PK_PPSH_HISTORIAL] PRIMARY KEY CLUSTERED ([id_historial] ASC),
        CONSTRAINT [FK_PPSH_HIST_SOL] FOREIGN KEY ([id_solicitud]) 
            REFERENCES [dbo].[PPSH_SOLICITUD]([id_solicitud]) ON DELETE CASCADE,
        CONSTRAINT [FK_PPSH_HIST_ESTADO_ANT] FOREIGN KEY ([estado_anterior]) 
            REFERENCES [dbo].[PPSH_ESTADO]([cod_estado]),
        CONSTRAINT [FK_PPSH_HIST_ESTADO_NVO] FOREIGN KEY ([estado_nuevo]) 
            REFERENCES [dbo].[PPSH_ESTADO]([cod_estado]),
        CONSTRAINT [FK_PPSH_HIST_USER] FOREIGN KEY ([user_id]) 
            REFERENCES [dbo].[SEG_TB_USUARIOS]([USER_ID])
    )
    
    -- Índices
    CREATE INDEX [IX_PPSH_HIST_SOL] ON [dbo].[PPSH_ESTADO_HISTORIAL]([id_solicitud])
    CREATE INDEX [IX_PPSH_HIST_FECHA] ON [dbo].[PPSH_ESTADO_HISTORIAL]([fecha_cambio])
    CREATE INDEX [IX_PPSH_HIST_ESTADO_NVO] ON [dbo].[PPSH_ESTADO_HISTORIAL]([estado_nuevo])
    CREATE INDEX [IX_PPSH_HIST_USER] ON [dbo].[PPSH_ESTADO_HISTORIAL]([user_id])
    CREATE INDEX [IX_PPSH_HIST_DICTAMEN] ON [dbo].[PPSH_ESTADO_HISTORIAL]([es_dictamen])
    
    PRINT '✓ Tabla PPSH_ESTADO_HISTORIAL creada con índices'
END
ELSE
BEGIN
    PRINT '⚠ Tabla PPSH_ESTADO_HISTORIAL ya existe'
END
GO

-- ==========================================
-- TABLA 8: PPSH_ENTREVISTA (Opcional)
-- ==========================================

PRINT 'Creando tabla: PPSH_ENTREVISTA...'

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PPSH_ENTREVISTA]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PPSH_ENTREVISTA](
        [id_entrevista] [int] IDENTITY(1,1) NOT NULL,
        [id_solicitud] [int] NOT NULL,
        [fecha_programada] [datetime2](7) NOT NULL,
        [fecha_realizada] [datetime2](7) NULL,
        [lugar] [varchar](100) NULL,
        [cod_agencia] [varchar](2) NULL,
        [entrevistador_user_id] [varchar](17) NOT NULL,
        [asistio] [bit] NULL,
        [motivo_inasistencia] [nvarchar](300) NULL,
        [resultado] [varchar](20) NULL DEFAULT 'PENDIENTE', -- 'FAVORABLE' | 'DESFAVORABLE' | 'PENDIENTE'
        [observaciones] [nvarchar](2000) NULL,
        [acta_entrevista] [nvarchar](max) NULL, -- Texto completo de la entrevista
        [requiere_segunda_entrevista] [bit] NOT NULL DEFAULT 0,
        [created_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [created_by] [varchar](17) NULL,
        [updated_at] [datetime2](7) NULL,
        [updated_by] [varchar](17) NULL,
        
        CONSTRAINT [PK_PPSH_ENTREVISTA] PRIMARY KEY CLUSTERED ([id_entrevista] ASC),
        CONSTRAINT [FK_PPSH_ENT_SOL] FOREIGN KEY ([id_solicitud]) 
            REFERENCES [dbo].[PPSH_SOLICITUD]([id_solicitud]) ON DELETE CASCADE,
        CONSTRAINT [FK_PPSH_ENT_AGENCIA] FOREIGN KEY ([cod_agencia]) 
            REFERENCES [dbo].[SIM_GE_AGENCIA]([COD_AGENCIA]),
        CONSTRAINT [FK_PPSH_ENT_USER] FOREIGN KEY ([entrevistador_user_id]) 
            REFERENCES [dbo].[SEG_TB_USUARIOS]([USER_ID])
    )
    
    -- Índices
    CREATE INDEX [IX_PPSH_ENT_SOL] ON [dbo].[PPSH_ENTREVISTA]([id_solicitud])
    CREATE INDEX [IX_PPSH_ENT_FECHA_PROG] ON [dbo].[PPSH_ENTREVISTA]([fecha_programada])
    CREATE INDEX [IX_PPSH_ENT_ENTREVISTADOR] ON [dbo].[PPSH_ENTREVISTA]([entrevistador_user_id])
    CREATE INDEX [IX_PPSH_ENT_RESULTADO] ON [dbo].[PPSH_ENTREVISTA]([resultado])
    
    PRINT '✓ Tabla PPSH_ENTREVISTA creada con índices'
END
ELSE
BEGIN
    PRINT '⚠ Tabla PPSH_ENTREVISTA ya existe'
END
GO

-- ==========================================
-- TABLA 9: PPSH_COMENTARIO (Comunicación)
-- ==========================================

PRINT 'Creando tabla: PPSH_COMENTARIO...'

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PPSH_COMENTARIO]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PPSH_COMENTARIO](
        [id_comentario] [int] IDENTITY(1,1) NOT NULL,
        [id_solicitud] [int] NOT NULL,
        [user_id] [varchar](17) NOT NULL,
        [comentario] [nvarchar](2000) NOT NULL,
        [es_interno] [bit] NOT NULL DEFAULT 1, -- Visible solo para funcionarios
        [created_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT [PK_PPSH_COMENTARIO] PRIMARY KEY CLUSTERED ([id_comentario] ASC),
        CONSTRAINT [FK_PPSH_COM_SOL] FOREIGN KEY ([id_solicitud]) 
            REFERENCES [dbo].[PPSH_SOLICITUD]([id_solicitud]) ON DELETE CASCADE,
        CONSTRAINT [FK_PPSH_COM_USER] FOREIGN KEY ([user_id]) 
            REFERENCES [dbo].[SEG_TB_USUARIOS]([USER_ID])
    )
    
    -- Índices
    CREATE INDEX [IX_PPSH_COM_SOL] ON [dbo].[PPSH_COMENTARIO]([id_solicitud])
    CREATE INDEX [IX_PPSH_COM_FECHA] ON [dbo].[PPSH_COMENTARIO]([created_at])
    CREATE INDEX [IX_PPSH_COM_USER] ON [dbo].[PPSH_COMENTARIO]([user_id])
    
    PRINT '✓ Tabla PPSH_COMENTARIO creada con índices'
END
ELSE
BEGIN
    PRINT '⚠ Tabla PPSH_COMENTARIO ya existe'
END
GO

-- ==========================================
-- VISTAS ÚTILES
-- ==========================================

PRINT ''
PRINT 'Creando vistas...'

-- Vista: Solicitudes con información completa
IF EXISTS (SELECT * FROM sys.views WHERE name = 'VW_PPSH_SOLICITUDES_COMPLETAS')
    DROP VIEW [dbo].[VW_PPSH_SOLICITUDES_COMPLETAS]
GO

CREATE VIEW [dbo].[VW_PPSH_SOLICITUDES_COMPLETAS]
AS
SELECT 
    s.id_solicitud,
    s.num_expediente,
    s.tipo_solicitud,
    c.nombre_causa AS causa_humanitaria,
    s.descripcion_caso,
    s.fecha_solicitud,
    e.nombre_estado AS estado_actual,
    e.color_hex AS estado_color,
    s.prioridad,
    a.NOM_AGENCIA AS agencia,
    sec.NOM_SECCION AS seccion,
    u.NOM_USUARIO AS funcionario_asignado,
    s.fecha_asignacion,
    s.num_resolucion,
    s.fecha_resolucion,
    s.fecha_vencimiento_permiso,
    -- Contadores
    (SELECT COUNT(*) FROM PPSH_SOLICITANTE WHERE id_solicitud = s.id_solicitud AND activo = 1) AS total_personas,
    (SELECT COUNT(*) FROM PPSH_DOCUMENTO WHERE id_solicitud = s.id_solicitud) AS total_documentos,
    (SELECT COUNT(*) FROM PPSH_COMENTARIO WHERE id_solicitud = s.id_solicitud) AS total_comentarios,
    -- Datos del titular
    sol.primer_nombre + ' ' + sol.primer_apellido AS nombre_titular,
    sol.num_documento AS documento_titular,
    sol.cod_nacionalidad AS nacionalidad_titular,
    -- Tiempos
    DATEDIFF(day, s.fecha_solicitud, GETDATE()) AS dias_transcurridos,
    -- Metadata
    s.created_at,
    s.created_by,
    s.updated_at,
    s.updated_by
FROM PPSH_SOLICITUD s
LEFT JOIN PPSH_CAUSA_HUMANITARIA c ON s.cod_causa_humanitaria = c.cod_causa
LEFT JOIN PPSH_ESTADO e ON s.estado_actual = e.cod_estado
LEFT JOIN SIM_GE_AGENCIA a ON s.cod_agencia = a.COD_AGENCIA
LEFT JOIN SIM_GE_SECCION sec ON s.cod_seccion = sec.COD_SECCION
LEFT JOIN SEG_TB_USUARIOS u ON s.user_id_asignado = u.USER_ID
LEFT JOIN PPSH_SOLICITANTE sol ON s.id_solicitud = sol.id_solicitud AND sol.es_titular = 1
WHERE s.activo = 1
GO

PRINT '✓ Vista VW_PPSH_SOLICITUDES_COMPLETAS creada'

-- Vista: Estadísticas por estado
IF EXISTS (SELECT * FROM sys.views WHERE name = 'VW_PPSH_ESTADISTICAS_ESTADOS')
    DROP VIEW [dbo].[VW_PPSH_ESTADISTICAS_ESTADOS]
GO

CREATE VIEW [dbo].[VW_PPSH_ESTADISTICAS_ESTADOS]
AS
SELECT 
    e.cod_estado,
    e.nombre_estado,
    e.color_hex,
    COUNT(s.id_solicitud) AS total_solicitudes,
    AVG(DATEDIFF(day, s.fecha_solicitud, GETDATE())) AS promedio_dias
FROM PPSH_ESTADO e
LEFT JOIN PPSH_SOLICITUD s ON e.cod_estado = s.estado_actual AND s.activo = 1
GROUP BY e.cod_estado, e.nombre_estado, e.color_hex, e.orden
GO

PRINT '✓ Vista VW_PPSH_ESTADISTICAS_ESTADOS creada'

-- ==========================================
-- PROCEDIMIENTOS ALMACENADOS
-- ==========================================

PRINT ''
PRINT 'Creando procedimientos almacenados...'

-- SP: Generar número de expediente único
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_PPSH_GENERAR_NUM_EXPEDIENTE')
    DROP PROCEDURE [dbo].[SP_PPSH_GENERAR_NUM_EXPEDIENTE]
GO

CREATE PROCEDURE [dbo].[SP_PPSH_GENERAR_NUM_EXPEDIENTE]
    @num_expediente VARCHAR(20) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @anio VARCHAR(4) = YEAR(GETDATE())
    DECLARE @mes VARCHAR(2) = RIGHT('0' + CAST(MONTH(GETDATE()) AS VARCHAR(2)), 2)
    DECLARE @secuencia INT
    
    -- Obtener último número del mes
    SELECT @secuencia = ISNULL(MAX(CAST(RIGHT(num_expediente, 4) AS INT)), 0) + 1
    FROM PPSH_SOLICITUD
    WHERE num_expediente LIKE 'PPSH-' + @anio + @mes + '%'
    
    -- Formato: PPSH-YYYYMM-NNNN
    SET @num_expediente = 'PPSH-' + @anio + @mes + '-' + RIGHT('0000' + CAST(@secuencia AS VARCHAR(4)), 4)
END
GO

PRINT '✓ Procedimiento SP_PPSH_GENERAR_NUM_EXPEDIENTE creado'

-- SP: Cambiar estado de solicitud
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_PPSH_CAMBIAR_ESTADO')
    DROP PROCEDURE [dbo].[SP_PPSH_CAMBIAR_ESTADO]
GO

CREATE PROCEDURE [dbo].[SP_PPSH_CAMBIAR_ESTADO]
    @id_solicitud INT,
    @estado_nuevo VARCHAR(30),
    @user_id VARCHAR(17),
    @observaciones NVARCHAR(1000) = NULL,
    @es_dictamen BIT = 0,
    @tipo_dictamen VARCHAR(20) = NULL,
    @dictamen_detalle NVARCHAR(2000) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @estado_anterior VARCHAR(30)
    DECLARE @dias_en_estado INT
    
    -- Obtener estado actual
    SELECT @estado_anterior = estado_actual
    FROM PPSH_SOLICITUD
    WHERE id_solicitud = @id_solicitud
    
    IF @estado_anterior IS NULL
    BEGIN
        RAISERROR('Solicitud no encontrada', 16, 1)
        RETURN
    END
    
    -- Calcular días en estado anterior
    SELECT @dias_en_estado = DATEDIFF(day, MAX(fecha_cambio), GETDATE())
    FROM PPSH_ESTADO_HISTORIAL
    WHERE id_solicitud = @id_solicitud
    
    BEGIN TRANSACTION
    
    -- Actualizar estado en solicitud
    UPDATE PPSH_SOLICITUD
    SET estado_actual = @estado_nuevo,
        updated_at = GETDATE(),
        updated_by = @user_id
    WHERE id_solicitud = @id_solicitud
    
    -- Registrar en historial
    INSERT INTO PPSH_ESTADO_HISTORIAL (
        id_solicitud, estado_anterior, estado_nuevo, user_id,
        observaciones, es_dictamen, tipo_dictamen, dictamen_detalle,
        dias_en_estado_anterior
    )
    VALUES (
        @id_solicitud, @estado_anterior, @estado_nuevo, @user_id,
        @observaciones, @es_dictamen, @tipo_dictamen, @dictamen_detalle,
        ISNULL(@dias_en_estado, 0)
    )
    
    COMMIT TRANSACTION
    
    SELECT 'Estado cambiado exitosamente' AS mensaje
END
GO

PRINT '✓ Procedimiento SP_PPSH_CAMBIAR_ESTADO creado'

-- SP: Obtener solicitudes asignadas a un usuario
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_PPSH_MIS_SOLICITUDES')
    DROP PROCEDURE [dbo].[SP_PPSH_MIS_SOLICITUDES]
GO

CREATE PROCEDURE [dbo].[SP_PPSH_MIS_SOLICITUDES]
    @user_id VARCHAR(17),
    @estado VARCHAR(30) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT *
    FROM VW_PPSH_SOLICITUDES_COMPLETAS
    WHERE funcionario_asignado = (SELECT NOM_USUARIO FROM SEG_TB_USUARIOS WHERE USER_ID = @user_id)
    AND (@estado IS NULL OR estado_actual = @estado)
    ORDER BY fecha_solicitud DESC
END
GO

PRINT '✓ Procedimiento SP_PPSH_MIS_SOLICITUDES creado'

-- ==========================================
-- TRIGGERS
-- ==========================================

PRINT ''
PRINT 'Creando triggers...'

-- Trigger: Registrar cambio de estado automáticamente
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TRG_PPSH_SOLICITUD_ESTADO')
    DROP TRIGGER [dbo].[TRG_PPSH_SOLICITUD_ESTADO]
GO

CREATE TRIGGER [dbo].[TRG_PPSH_SOLICITUD_ESTADO]
ON [dbo].[PPSH_SOLICITUD]
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Registrar estado inicial solo para nuevas solicitudes
    INSERT INTO PPSH_ESTADO_HISTORIAL (
        id_solicitud, estado_anterior, estado_nuevo, user_id, observaciones
    )
    SELECT 
        i.id_solicitud,
        NULL,
        i.estado_actual,
        ISNULL(i.created_by, 'SYSTEM'),
        'Estado inicial de la solicitud'
    FROM inserted i
END
GO

PRINT '✓ Trigger TRG_PPSH_SOLICITUD_ESTADO creado'

-- ==========================================
-- DATOS DE PRUEBA (OPCIONAL)
-- ==========================================

PRINT ''
PRINT 'Insertando datos de prueba (opcional)...'

-- Verificar si ya existen solicitudes
IF NOT EXISTS (SELECT * FROM PPSH_SOLICITUD)
BEGIN
    DECLARE @num_exp VARCHAR(20)
    DECLARE @id_sol INT
    
    -- Generar expediente 1
    EXEC SP_PPSH_GENERAR_NUM_EXPEDIENTE @num_exp OUTPUT
    
    INSERT INTO PPSH_SOLICITUD (
        num_expediente, tipo_solicitud, cod_causa_humanitaria, descripcion_caso,
        fecha_solicitud, estado_actual, prioridad, cod_agencia, cod_seccion,
        user_id_asignado, created_by
    )
    VALUES (
        @num_exp, 'GRUPAL', 1, 
        'Familia venezolana proveniente de zona de conflicto político. Grupo familiar de 4 personas.',
        CAST(GETDATE() AS DATE), 'EN_REVISION', 'ALTA', '01', '03',
        'admin', 'admin'
    )
    
    SET @id_sol = SCOPE_IDENTITY()
    
    -- Agregar titular
    INSERT INTO PPSH_SOLICITANTE (
        id_solicitud, es_titular, tipo_documento, num_documento, pais_emisor,
        primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
        fecha_nacimiento, cod_sexo, cod_nacionalidad, cod_estado_civil,
        email, telefono, created_by
    )
    VALUES (
        @id_sol, 1, 'PASAPORTE', 'V12345678', 'VEN',
        'Carlos', 'Andrés', 'González', 'Pérez',
        '1985-05-15', 'M', 'VEN', 'C',
        'carlos.gonzalez@email.com', '+507-6000-0001', 'admin'
    )
    
    -- Agregar cónyuge
    INSERT INTO PPSH_SOLICITANTE (
        id_solicitud, es_titular, tipo_documento, num_documento, pais_emisor,
        primer_nombre, primer_apellido, segundo_apellido,
        fecha_nacimiento, cod_sexo, cod_nacionalidad, cod_estado_civil,
        parentesco_titular, created_by
    )
    VALUES (
        @id_sol, 0, 'PASAPORTE', 'V23456789', 'VEN',
        'María', 'Rodríguez', 'López',
        '1987-08-20', 'F', 'VEN', 'C',
        'CONYUGE', 'admin'
    )
    
    -- Agregar hijo 1
    INSERT INTO PPSH_SOLICITANTE (
        id_solicitud, es_titular, tipo_documento, num_documento, pais_emisor,
        primer_nombre, primer_apellido,
        fecha_nacimiento, cod_sexo, cod_nacionalidad, cod_estado_civil,
        parentesco_titular, created_by
    )
    VALUES (
        @id_sol, 0, 'PASAPORTE', 'V34567890', 'VEN',
        'Sofía', 'González',
        '2010-03-10', 'F', 'VEN', 'S',
        'HIJO', 'admin'
    )
    
    -- Agregar hijo 2
    INSERT INTO PPSH_SOLICITANTE (
        id_solicitud, es_titular, tipo_documento, num_documento, pais_emisor,
        primer_nombre, primer_apellido,
        fecha_nacimiento, cod_sexo, cod_nacionalidad, cod_estado_civil,
        parentesco_titular, created_by
    )
    VALUES (
        @id_sol, 0, 'PASAPORTE', 'V45678901', 'VEN',
        'Diego', 'González',
        '2015-11-25', 'M', 'VEN', 'S',
        'HIJO', 'admin'
    )
    
    PRINT '✓ Datos de prueba insertados: 1 solicitud con 4 personas'
END
ELSE
BEGIN
    PRINT '⚠ Ya existen solicitudes, omitiendo datos de prueba'
END
GO

-- ==========================================
-- VERIFICACIÓN FINAL
-- ==========================================

PRINT ''
PRINT '=========================================='
PRINT 'VERIFICACIÓN DE MIGRACIÓN'
PRINT '=========================================='
PRINT ''

-- Contar tablas creadas
DECLARE @tablas_ppsh INT
SELECT @tablas_ppsh = COUNT(*)
FROM sys.tables
WHERE name LIKE 'PPSH_%'

PRINT 'Tablas PPSH creadas: ' + CAST(@tablas_ppsh AS VARCHAR(10))
PRINT ''

-- Mostrar resumen de cada tabla
SELECT 
    t.name AS 'Tabla',
    (SELECT COUNT(*) FROM sys.columns c WHERE c.object_id = t.object_id) AS 'Columnas',
    (SELECT COUNT(*) FROM sys.indexes i WHERE i.object_id = t.object_id AND i.index_id > 0) AS 'Índices',
    (SELECT COUNT(*) FROM sys.foreign_keys fk WHERE fk.parent_object_id = t.object_id) AS 'Foreign Keys'
FROM sys.tables t
WHERE t.name LIKE 'PPSH_%'
ORDER BY t.name

PRINT ''
PRINT '=========================================='
PRINT '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE'
PRINT '=========================================='
PRINT ''
PRINT 'Próximos pasos:'
PRINT '1. Verificar las tablas en SQL Server Management Studio'
PRINT '2. Crear modelos SQLAlchemy en backend/app/models.py'
PRINT '3. Crear schemas Pydantic en backend/app/schemas.py'
PRINT '4. Implementar endpoints REST en backend/app/routes.py'
PRINT '5. Desarrollar componentes React en frontend'
PRINT ''
PRINT 'Documentación: docs/ANALISIS_PPSH_MVP.md'
PRINT ''

GO
