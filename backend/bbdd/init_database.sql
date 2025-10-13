-- ==========================================
-- Script de Inicialización de Base de Datos
-- Sistema de Trámites Migratorios de Panamá
-- Fecha: 2025-10-13
-- ==========================================

USE [master]
GO

-- Crear base de datos si no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'SIM_PANAMA')
BEGIN
    CREATE DATABASE [SIM_PANAMA]
    PRINT 'Base de datos SIM_PANAMA creada exitosamente'
END
ELSE
BEGIN
    PRINT 'Base de datos SIM_PANAMA ya existe'
END
GO

USE [SIM_PANAMA]
GO

-- ==========================================
-- PARTE 1: TABLAS DE CATÁLOGOS GENERALES
-- ==========================================

PRINT 'Creando tablas de catálogos generales...'

-- Tabla: SIM_GE_SEXO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SIM_GE_SEXO]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SIM_GE_SEXO](
        [COD_SEXO] [varchar](1) NOT NULL,
        [NOM_SEXO] [varchar](9) NULL,
        CONSTRAINT [PK_SIM_GE_SEXO] PRIMARY KEY CLUSTERED ([COD_SEXO] ASC)
    )
    
    -- Datos iniciales
    INSERT INTO [dbo].[SIM_GE_SEXO] VALUES ('M', 'Masculino')
    INSERT INTO [dbo].[SIM_GE_SEXO] VALUES ('F', 'Femenino')
    
    PRINT 'Tabla SIM_GE_SEXO creada'
END
GO

-- Tabla: SIM_GE_EST_CIVIL
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SIM_GE_EST_CIVIL]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SIM_GE_EST_CIVIL](
        [COD_EST_CIVIL] [varchar](1) NOT NULL,
        [NOM_EST_CIVIL] [varchar](12) NOT NULL,
        CONSTRAINT [PK_SIM_GE_EST_CIVIL] PRIMARY KEY CLUSTERED ([COD_EST_CIVIL] ASC)
    )
    
    -- Datos iniciales
    INSERT INTO [dbo].[SIM_GE_EST_CIVIL] VALUES ('S', 'Soltero')
    INSERT INTO [dbo].[SIM_GE_EST_CIVIL] VALUES ('C', 'Casado')
    INSERT INTO [dbo].[SIM_GE_EST_CIVIL] VALUES ('D', 'Divorciado')
    INSERT INTO [dbo].[SIM_GE_EST_CIVIL] VALUES ('V', 'Viudo')
    INSERT INTO [dbo].[SIM_GE_EST_CIVIL] VALUES ('U', 'Unión Libre')
    
    PRINT 'Tabla SIM_GE_EST_CIVIL creada'
END
GO

-- Tabla: SIM_GE_VIA_TRANSP
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SIM_GE_VIA_TRANSP]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SIM_GE_VIA_TRANSP](
        [COD_VIA_TRANSP] [varchar](1) NOT NULL,
        [NOM_VIA_TRANSP] [varchar](20) NULL,
        CONSTRAINT [PK_SIM_GE_VIA_TRANSP] PRIMARY KEY CLUSTERED ([COD_VIA_TRANSP] ASC)
    )
    
    -- Datos iniciales
    INSERT INTO [dbo].[SIM_GE_VIA_TRANSP] VALUES ('A', 'Aérea')
    INSERT INTO [dbo].[SIM_GE_VIA_TRANSP] VALUES ('M', 'Marítima')
    INSERT INTO [dbo].[SIM_GE_VIA_TRANSP] VALUES ('T', 'Terrestre')
    
    PRINT 'Tabla SIM_GE_VIA_TRANSP creada'
END
GO

-- Tabla: SIM_GE_TIPO_MOV
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SIM_GE_TIPO_MOV]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SIM_GE_TIPO_MOV](
        [COD_TIPO_MOV] [varchar](1) NOT NULL,
        [NOM_TIPO_MOV] [varchar](10) NOT NULL,
        CONSTRAINT [PK_SIM_GE_TIPO_MOV] PRIMARY KEY CLUSTERED ([COD_TIPO_MOV] ASC)
    )
    
    -- Datos iniciales
    INSERT INTO [dbo].[SIM_GE_TIPO_MOV] VALUES ('E', 'Entrada')
    INSERT INTO [dbo].[SIM_GE_TIPO_MOV] VALUES ('S', 'Salida')
    INSERT INTO [dbo].[SIM_GE_TIPO_MOV] VALUES ('T', 'Tránsito')
    
    PRINT 'Tabla SIM_GE_TIPO_MOV creada'
END
GO

-- Tabla: SIM_GE_PAIS (Simplificada - países principales)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SIM_GE_PAIS]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SIM_GE_PAIS](
        [COD_PAIS] [varchar](3) NOT NULL,
        [NOM_PAIS] [varchar](50) NOT NULL,
        [NOM_NACIONALIDAD] [varchar](35) NOT NULL,
        [COD_CONTINENTE] [varchar](1) NULL,
        [ISO_ALPHA2] [varchar](2) NULL,
        [ISO_NUMERIC] [varchar](3) NULL,
        [IND_SUPRESION_VISA] [bit] NOT NULL DEFAULT 0,
        [ID_USUARIO] [varchar](20) NULL,
        [FEC_ACTUALIZA] [datetime] NULL,
        CONSTRAINT [PK_SIM_GE_PAIS] PRIMARY KEY CLUSTERED ([COD_PAIS] ASC)
    )
    
    -- Datos iniciales (países principales de América)
    INSERT INTO [dbo].[SIM_GE_PAIS] VALUES ('PAN', 'Panamá', 'Panameño', '2', 'PA', '591', 0, NULL, GETDATE())
    INSERT INTO [dbo].[SIM_GE_PAIS] VALUES ('USA', 'Estados Unidos', 'Estadounidense', '2', 'US', '840', 0, NULL, GETDATE())
    INSERT INTO [dbo].[SIM_GE_PAIS] VALUES ('COL', 'Colombia', 'Colombiano', '2', 'CO', '170', 0, NULL, GETDATE())
    INSERT INTO [dbo].[SIM_GE_PAIS] VALUES ('VEN', 'Venezuela', 'Venezolano', '2', 'VE', '862', 0, NULL, GETDATE())
    INSERT INTO [dbo].[SIM_GE_PAIS] VALUES ('CRI', 'Costa Rica', 'Costarricense', '2', 'CR', '188', 0, NULL, GETDATE())
    INSERT INTO [dbo].[SIM_GE_PAIS] VALUES ('MEX', 'México', 'Mexicano', '2', 'MX', '484', 0, NULL, GETDATE())
    INSERT INTO [dbo].[SIM_GE_PAIS] VALUES ('ESP', 'España', 'Español', '4', 'ES', '724', 0, NULL, GETDATE())
    
    PRINT 'Tabla SIM_GE_PAIS creada con datos iniciales'
END
GO

-- Tabla: SIM_GE_CONTINENTE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SIM_GE_CONTINENTE]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SIM_GE_CONTINENTE](
        [COD_CONTINENTE] [varchar](1) NOT NULL,
        [NOM_CONTINENTE] [varchar](35) NOT NULL,
        [ID_USUARIO] [varchar](20) NULL,
        [FEC_ACTUALIZA] [datetime] NULL,
        CONSTRAINT [PK_SIM_GE_CONTINENTE] PRIMARY KEY CLUSTERED ([COD_CONTINENTE] ASC)
    )
    
    -- Datos iniciales
    INSERT INTO [dbo].[SIM_GE_CONTINENTE] VALUES ('1', 'África', NULL, GETDATE())
    INSERT INTO [dbo].[SIM_GE_CONTINENTE] VALUES ('2', 'América', NULL, GETDATE())
    INSERT INTO [dbo].[SIM_GE_CONTINENTE] VALUES ('3', 'Asia', NULL, GETDATE())
    INSERT INTO [dbo].[SIM_GE_CONTINENTE] VALUES ('4', 'Europa', NULL, GETDATE())
    INSERT INTO [dbo].[SIM_GE_CONTINENTE] VALUES ('5', 'Oceanía', NULL, GETDATE())
    
    PRINT 'Tabla SIM_GE_CONTINENTE creada'
END
GO

-- ==========================================
-- PARTE 2: TABLAS DE SEGURIDAD Y USUARIOS
-- ==========================================

PRINT 'Creando tablas de seguridad...'

-- Tabla: SEG_TB_USUARIOS
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SEG_TB_USUARIOS]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SEG_TB_USUARIOS](
        [USER_ID] [varchar](17) NOT NULL,
        [CED_USUARIO] [varchar](17) NULL,
        [NOM_USUARIO] [varchar](50) NULL,
        [EMAIL_USUARIO] [varchar](50) NULL,
        [PASSWORD] [varchar](255) NULL,
        [ACTIVO] [bit] NOT NULL DEFAULT 1,
        [INTENTOFALLIDO] [int] NULL DEFAULT 0,
        [FECHULTCAMBIOPASS] [datetime] NULL,
        [FEC_ACTUALIZACION] [datetime] NULL,
        [CED_ACTUALIZACION] [varchar](17) NULL,
        [NOM_ACTUALIZACION] [varchar](50) NULL,
        [LOGIN] [bit] NOT NULL DEFAULT 0,
        [RESETPASS] [bit] NOT NULL DEFAULT 0,
        CONSTRAINT [PK_SEG_TB_USUARIOS] PRIMARY KEY CLUSTERED ([USER_ID] ASC)
    )
    
    -- Usuario admin por defecto (password debe ser cambiada)
    INSERT INTO [dbo].[SEG_TB_USUARIOS] 
    VALUES ('admin', '0-0-0', 'Administrador', 'admin@sim.gob.pa', 
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5/6SJDxFEXBSS', -- password: admin123
            1, 0, GETDATE(), GETDATE(), 'SYSTEM', 'Sistema', 0, 0)
    
    PRINT 'Tabla SEG_TB_USUARIOS creada con usuario admin'
END
GO

-- Tabla: SEG_TB_ROLES
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SEG_TB_ROLES]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SEG_TB_ROLES](
        [COD_ROLE] [int] IDENTITY(1,1) NOT NULL,
        [NOM_ROLE] [varchar](30) NOT NULL,
        [DESCRIPCION] [varchar](200) NULL,
        [FEC_ACTUALIZACION] [datetime] NULL,
        [CED_ACTUALIZACION] [varchar](17) NULL,
        [NOM_ACTUALIZACION] [varchar](50) NULL,
        CONSTRAINT [PK_SEG_TB_ROLES] PRIMARY KEY CLUSTERED ([COD_ROLE] ASC),
        CONSTRAINT [UK_SEG_TB_ROLES_NOM] UNIQUE ([NOM_ROLE])
    )
    
    -- Roles por defecto
    INSERT INTO [dbo].[SEG_TB_ROLES] (NOM_ROLE, DESCRIPCION, FEC_ACTUALIZACION)
    VALUES ('ADMINISTRADOR', 'Administrador del sistema con acceso total', GETDATE())
    
    INSERT INTO [dbo].[SEG_TB_ROLES] (NOM_ROLE, DESCRIPCION, FEC_ACTUALIZACION)
    VALUES ('INSPECTOR', 'Inspector de migración en puestos fronterizos', GETDATE())
    
    INSERT INTO [dbo].[SEG_TB_ROLES] (NOM_ROLE, DESCRIPCION, FEC_ACTUALIZACION)
    VALUES ('ANALISTA', 'Analista de trámites y expedientes', GETDATE())
    
    INSERT INTO [dbo].[SEG_TB_ROLES] (NOM_ROLE, DESCRIPCION, FEC_ACTUALIZACION)
    VALUES ('CONSULTA', 'Usuario solo consulta', GETDATE())
    
    PRINT 'Tabla SEG_TB_ROLES creada con roles por defecto'
END
GO

-- Tabla: SEG_TB_USUA_ROLE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SEG_TB_USUA_ROLE]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SEG_TB_USUA_ROLE](
        [COD_ROLE] [int] NOT NULL,
        [USER_ID] [varchar](17) NOT NULL,
        [FEC_ACTUALIZACION] [datetime] NULL,
        [CED_ACTUALIZACION] [varchar](17) NULL,
        [NOM_ACTUALIZACION] [varchar](50) NULL,
        CONSTRAINT [PK_SEG_TB_USUA_ROLE] PRIMARY KEY CLUSTERED ([COD_ROLE] ASC, [USER_ID] ASC),
        CONSTRAINT [FK_USUA_ROLE_ROLE] FOREIGN KEY ([COD_ROLE]) REFERENCES [dbo].[SEG_TB_ROLES]([COD_ROLE]),
        CONSTRAINT [FK_USUA_ROLE_USER] FOREIGN KEY ([USER_ID]) REFERENCES [dbo].[SEG_TB_USUARIOS]([USER_ID])
    )
    
    -- Asignar rol admin al usuario admin
    INSERT INTO [dbo].[SEG_TB_USUA_ROLE] (COD_ROLE, USER_ID, FEC_ACTUALIZACION)
    VALUES (1, 'admin', GETDATE())
    
    PRINT 'Tabla SEG_TB_USUA_ROLE creada'
END
GO

-- ==========================================
-- PARTE 3: TABLAS DE AGENCIAS Y ESTRUCTURA
-- ==========================================

PRINT 'Creando tablas de estructura organizacional...'

-- Tabla: SIM_GE_REGION
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SIM_GE_REGION]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SIM_GE_REGION](
        [COD_REGION] [varchar](2) NOT NULL,
        [NOM_REGION] [varchar](50) NULL,
        [ID_USUARIO] [varchar](20) NULL,
        [FEC_ACTUALIZA] [datetime] NULL,
        CONSTRAINT [PK_SIM_GE_REGION] PRIMARY KEY CLUSTERED ([COD_REGION] ASC)
    )
    
    -- Datos iniciales
    INSERT INTO [dbo].[SIM_GE_REGION] VALUES ('01', 'Panamá Centro', NULL, GETDATE())
    INSERT INTO [dbo].[SIM_GE_REGION] VALUES ('02', 'Panamá Oeste', NULL, GETDATE())
    INSERT INTO [dbo].[SIM_GE_REGION] VALUES ('03', 'Colón', NULL, GETDATE())
    INSERT INTO [dbo].[SIM_GE_REGION] VALUES ('04', 'Chiriquí', NULL, GETDATE())
    
    PRINT 'Tabla SIM_GE_REGION creada'
END
GO

-- Tabla: SIM_GE_AGENCIA
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SIM_GE_AGENCIA]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SIM_GE_AGENCIA](
        [COD_AGENCIA] [varchar](2) NOT NULL,
        [NOM_AGENCIA] [varchar](50) NOT NULL,
        [COD_VIA_TRANSP] [varchar](1) NULL,
        [COD_REGION] [varchar](2) NULL,
        [IND_MOVIM_MIGRATO] [bit] NOT NULL DEFAULT 1,
        [ID_USUARIO] [varchar](20) NULL,
        [FEC_ACTUALIZA] [datetime] NULL,
        CONSTRAINT [PK_SIM_GE_AGENCIA] PRIMARY KEY CLUSTERED ([COD_AGENCIA] ASC),
        CONSTRAINT [FK_AGENCIA_VIA] FOREIGN KEY ([COD_VIA_TRANSP]) REFERENCES [dbo].[SIM_GE_VIA_TRANSP]([COD_VIA_TRANSP]),
        CONSTRAINT [FK_AGENCIA_REGION] FOREIGN KEY ([COD_REGION]) REFERENCES [dbo].[SIM_GE_REGION]([COD_REGION])
    )
    
    -- Datos iniciales
    INSERT INTO [dbo].[SIM_GE_AGENCIA] VALUES ('01', 'Aeropuerto Internacional de Tocumen', 'A', '01', 1, NULL, GETDATE())
    INSERT INTO [dbo].[SIM_GE_AGENCIA] VALUES ('02', 'Oficina Central SNM', NULL, '01', 0, NULL, GETDATE())
    INSERT INTO [dbo].[SIM_GE_AGENCIA] VALUES ('03', 'Paso Canoas', 'T', '04', 1, NULL, GETDATE())
    INSERT INTO [dbo].[SIM_GE_AGENCIA] VALUES ('04', 'Darién', 'T', '01', 1, NULL, GETDATE())
    
    PRINT 'Tabla SIM_GE_AGENCIA creada'
END
GO

-- Tabla: SIM_GE_SECCION
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SIM_GE_SECCION]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SIM_GE_SECCION](
        [COD_SECCION] [varchar](2) NOT NULL,
        [NOM_SECCION] [varchar](50) NOT NULL,
        [ID_USUARIO] [varchar](20) NULL,
        [FEC_ACTUALIZA] [datetime] NULL,
        CONSTRAINT [PK_SIM_GE_SECCION] PRIMARY KEY CLUSTERED ([COD_SECCION] ASC)
    )
    
    -- Datos iniciales
    INSERT INTO [dbo].[SIM_GE_SECCION] VALUES ('01', 'Entrada', NULL, GETDATE())
    INSERT INTO [dbo].[SIM_GE_SECCION] VALUES ('02', 'Salida', NULL, GETDATE())
    INSERT INTO [dbo].[SIM_GE_SECCION] VALUES ('03', 'Trámites', NULL, GETDATE())
    INSERT INTO [dbo].[SIM_GE_SECCION] VALUES ('04', 'Impedimentos', NULL, GETDATE())
    INSERT INTO [dbo].[SIM_GE_SECCION] VALUES ('05', 'Naturalización', NULL, GETDATE())
    
    PRINT 'Tabla SIM_GE_SECCION creada'
END
GO

-- ==========================================
-- PARTE 4: TABLA SIMPLE DE TRÁMITES (MVP)
-- ==========================================

PRINT 'Creando tabla de trámites simplificada para MVP...'

-- Tabla: tramites (para el MVP actual)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tramites]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[tramites](
        [id] [int] IDENTITY(1,1) NOT NULL,
        [titulo] [nvarchar](255) NOT NULL,
        [descripcion] [nvarchar](1000) NULL,
        [estado] [nvarchar](50) NULL DEFAULT 'pendiente',
        [activo] [bit] NOT NULL DEFAULT 1,
        [created_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [updated_at] [datetime2](7) NULL,
        CONSTRAINT [PK_tramites] PRIMARY KEY CLUSTERED ([id] ASC)
    )
    
    -- Datos de ejemplo
    INSERT INTO [dbo].[tramites] (titulo, descripcion, estado)
    VALUES 
        ('Solicitud de Visa de Turismo', 'Trámite para obtener visa de turismo', 'en_proceso'),
        ('Renovación de Carnet de Residente', 'Renovación de carnet para residentes temporales', 'completado'),
        ('Prórroga de Estadía Turística', 'Extensión del período de estadía turística', 'pendiente'),
        ('Solicitud de Naturalización', 'Trámite de carta de naturaleza panameña', 'en_revision')
    
    PRINT 'Tabla tramites creada con datos de ejemplo'
END
GO

-- ==========================================
-- PARTE 5: TABLAS DE AUDITORÍA Y LOG
-- ==========================================

PRINT 'Creando tablas de auditoría...'

-- Tabla: SEG_TB_ERROR_LOG
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SEG_TB_ERROR_LOG]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SEG_TB_ERROR_LOG](
        [NUM_INTENTO] [int] IDENTITY(1,1) NOT NULL,
        [USER_ID] [varchar](17) NULL,
        [FEC_ACTUALIZACION] [datetime] NULL DEFAULT GETDATE(),
        [HORA] [varchar](2) NULL,
        [MINUTO] [varchar](2) NULL,
        CONSTRAINT [PK_SEG_TB_ERROR_LOG] PRIMARY KEY CLUSTERED ([NUM_INTENTO] ASC)
    )
    
    PRINT 'Tabla SEG_TB_ERROR_LOG creada'
END
GO

-- Tabla: sc_log (Log de aplicación)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sc_log]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[sc_log](
        [id] [int] IDENTITY(1,1) NOT NULL,
        [inserted_date] [datetime] NOT NULL DEFAULT GETDATE(),
        [username] [varchar](90) NOT NULL,
        [application] [varchar](200) NOT NULL,
        [creator] [varchar](30) NOT NULL,
        [ip_user] [varchar](32) NOT NULL,
        [action] [varchar](30) NOT NULL,
        [description] [text] NOT NULL,
        PRIMARY KEY CLUSTERED ([id] ASC)
    )
    
    PRINT 'Tabla sc_log creada'
END
GO

-- ==========================================
-- PARTE 6: VISTAS ÚTILES
-- ==========================================

PRINT 'Creando vistas...'

-- Vista: Trámites activos
IF EXISTS (SELECT * FROM sys.views WHERE name = 'VW_TRAMITES_ACTIVOS')
    DROP VIEW [dbo].[VW_TRAMITES_ACTIVOS]
GO

CREATE VIEW [dbo].[VW_TRAMITES_ACTIVOS]
AS
SELECT 
    id,
    titulo,
    descripcion,
    estado,
    created_at,
    updated_at,
    DATEDIFF(day, created_at, GETDATE()) AS dias_transcurridos
FROM [dbo].[tramites]
WHERE activo = 1
GO

PRINT 'Vista VW_TRAMITES_ACTIVOS creada'

-- ==========================================
-- PARTE 7: PROCEDIMIENTOS ALMACENADOS BÁSICOS
-- ==========================================

PRINT 'Creando procedimientos almacenados...'

-- SP: Obtener todos los trámites
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_GET_TRAMITES')
    DROP PROCEDURE [dbo].[SP_GET_TRAMITES]
GO

CREATE PROCEDURE [dbo].[SP_GET_TRAMITES]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        id,
        titulo,
        descripcion,
        estado,
        activo,
        created_at,
        updated_at
    FROM [dbo].[tramites]
    WHERE activo = 1
    ORDER BY created_at DESC
END
GO

PRINT 'Procedimiento SP_GET_TRAMITES creado'

-- SP: Insertar nuevo trámite
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_INSERT_TRAMITE')
    DROP PROCEDURE [dbo].[SP_INSERT_TRAMITE]
GO

CREATE PROCEDURE [dbo].[SP_INSERT_TRAMITE]
    @titulo NVARCHAR(255),
    @descripcion NVARCHAR(1000),
    @estado NVARCHAR(50) = 'pendiente'
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO [dbo].[tramites] (titulo, descripcion, estado)
    VALUES (@titulo, @descripcion, @estado)
    
    SELECT SCOPE_IDENTITY() AS id
END
GO

PRINT 'Procedimiento SP_INSERT_TRAMITE creado'

-- ==========================================
-- FINALIZACIÓN
-- ==========================================

PRINT ''
PRINT '=========================================='
PRINT 'Inicialización de base de datos completada'
PRINT '=========================================='
PRINT ''
PRINT 'Resumen:'
PRINT '- Base de datos: SIM_PANAMA'
PRINT '- Tablas de catálogos: Creadas'
PRINT '- Tablas de seguridad: Creadas'
PRINT '- Usuario admin: Creado (password: admin123 - CAMBIAR)'
PRINT '- Tabla tramites (MVP): Creada con datos de ejemplo'
PRINT '- Vistas: Creadas'
PRINT '- Procedimientos: Creados'
PRINT ''
PRINT 'IMPORTANTE:'
PRINT '1. Cambiar la contraseña del usuario admin inmediatamente'
PRINT '2. Configurar backups automáticos'
PRINT '3. Revisar permisos de usuarios'
PRINT ''
PRINT 'Para conectar desde el backend, usar:'
PRINT 'DATABASE_NAME=SIM_PANAMA'
PRINT ''

GO
