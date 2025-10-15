USE [ renombre por la base de datos a usar ] 
GO 
/****** Object:   Table [dbo].[App_versions]     Script Date: 16 -05-2025 13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[App_versions](  
 [Id_Programa] [int] NOT NULL,  
 [Nombre] [char](50) NULL,  
 [Version] [char](25) NULL,  
 [Fecha_Version] [datetime] NULL,  
 [Ejecutable] [char](50) NULL,  
 [Path] [char](150) NULL,  
 [Sleeper] [bit] NULL,  
 CONSTRAINT [PK_App_verions] PRIMARY KEY NONCLUSTERED   
( 
 [Id_Programa] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[BCK_BMM_VUELO]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
 
 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[BCK_BMM_VUELO](  
 [COM_AEREA] [varchar](2) NOT NULL,  
 [NUM_VUELO] [varchar](4) NOT NULL,  
 [FEC_VUELO] [datetime] NOT NULL,  
 [HORA_VUELO] [varchar](6) NULL,  
 [TIPO_MOV] [varchar](1) NULL,  
 [PA_ORIGEN] [varchar](2) NULL,  
 [CIU_ORIGEN] [varchar](3) NULL,  
 [PA_ESCALA] [varchar](2) NULL,  
 [CIU_ESCALA] [varchar](3) NULL,  
 [PA_DESTINO] [varchar](2) NULL,  
 [CIU_DESTINO] [varchar](3) NULL,  
 [EST_VUELO] [varchar](1) NULL,  
 [USU_MODIF] [varchar](20) NULL,  
 [FEC_MODIF] [datetime] NULL,  
 [HORA_MODIF] [datetime] NULL,  
 [FEC_SAL_V] [datetime] NULL,  
 [HORA_SAL_V] [datetime] NULL,  
 [USU_SAL] [varchar](20) NULL,  
 [FEC_SAL] [datetime] NULL,  
 [HORA_SAL] [datetime] NULL,  
 [EST_MOV_MIG] [bit] NULL,  
 [OBSERVACION] [varchar](50) NULL,  
 [EST_ANOM_V] [bit] NULL,  
 [EST_CONFIR_V] [bit] NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[BCK_MM_BOLETA]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[BCK_MM_BOLETA](  
 [COD_BOLETA] [varchar](25) NOT NULL,  
 [NUM_BOLETA] [varchar](7) NULL,  
 [DIGITO] [varchar](1) NULL,  
 [APELLIDO] [varchar](25) NOT NULL,  
 [NOMBRE] [varchar](25) NOT NULL,  
 [NUM_DOC_VIAJE] [varchar](25) NOT NULL,  
 [COD_DOC_VIAJE] [varchar](2) NULL,  
 [COD_TIPO_PASAPORT] [varchar](2) NULL,  
 [COD_PAIS_EXPEDIDO] [varchar](3) NULL,  
 [ID] [varchar](20) NULL,  
 [COD_PAIS_NACIONAL] [varchar](3) NULL,
 [COD_OCUPACION] [varchar](3) NULL,  
 [FECHA_NACIMIENTO] [datetime] NOT NULL,  
 [COD_SEXO] [varchar](1) NOT NULL,  
 [COD_PAIS_NACIMIEN] [varchar](3) NOT NULL,  
 [COD_PAIS_RESIDEN] [varchar](3) NULL,  
 [COD_MOTIVO_VIAJE] [varchar](1) NULL,  
 [DIR_PREVISTA] [varchar](100) NULL,  
 [COD_PAIS_PROC] [varchar](3) NULL,  
 [COD_CIA_TRANS_ENT] [varchar](3) NULL,  
 [VIAJE_ENTRADA] [varchar](15) NULL,  
 [TIEMPO_ESTADIA_INS] [smallint] NULL,  
 [COD_PAIS_DESTINO] [varchar](3) NULL,  
 [COD_CIA_TRANS_SAL] [varchar](3) NULL,  
 [VIAJE_SALIDA] [varchar](15) NULL,  
 [COD_TIP_VIAJ_ENT] [varchar](3) NULL,  
 [COD_TIPO_VISA] [varchar](2) NULL,  
 [NUMERO_VISA] [varchar](30) NULL,  
 [COD_TIP_VIAJ_SAL] [varchar](3) NULL,  
 [IND_ALTERNADORA] [bit] NOT NULL,  
 [COD_MOTIVO_DEVOLU] [varchar](3) NULL,  
 [TIPO_MOV] [varchar](1) NULL,  
 [APLICACION] [varchar](2) NULL,  
 [CONTROL] [bit] NOT NULL,  
 [ORIGEN_BOLETA] [varchar](1) NULL,  
 [COD_CATEG_ENTRADA] [varchar](1) NULL,  
 [COD_AGENCIA_ENTRA] [varchar](2) NULL,  
 [COD_SECCION_ENTRA] [varchar](2) NULL,  
 [COD_PUESTO_ENTRA] [varchar](2) NULL,  
 [COD_INSPECTOR_ENT] [varchar](20) NULL,  
 [FECHA_ENTRADA] [datetime] NULL,  
 [HORA_ENTRADA] [datetime] NULL,  
 [HITS_ENTRADA] [int] NULL,  
 [PAS_ROB_ENT] [bit] NOT NULL,  
 [OBS_ENTRADA] [varchar](30) NULL,  
 [COD_CATEG_SALIDA] [varchar](1) NULL,  
 [COD_AGENCIA_SALIDA] [varchar](2) NULL,  
 [COD_SECCION_SALIDA] [varchar](2) NULL,  
 [COD_PUESTO_SALIDA] [varchar](2) NULL,  
 [COD_INSPECTOR_SAL] [varchar](20) NULL,  
 [FECHA_SALIDA] [datetime] NULL,  
 [HORA_SALIDA] [datetime] NULL,  
 [HITS_SALIDA] [int] NULL,  
 [PAS_ROB_SAL] [bit] NOT NULL,  
 [OBS_SALIDA] [varchar](30) NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [IND_CAPTURA] [varchar](1) NULL,  
 
 CONSTRAINT [PKIND_COD_BOLETA_BCK_MM_BOLETA] PRIMARY KEY CLUSTERED   
( 
 [COD_BOLETA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[genesis_permisos]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[genesis_permisos](  
 [user_id] [varchar](17) NULL,  
 [ced_usuario] [varchar](17) NULL,  
 [nom_usuario] [varchar](50) NULL,  
 [permiso_mm] [varchar](1) NULL,  
 [permiso_consulta_impedimento] [varchar](1) NULL,  
 [permiso_consulta_mm] [varchar](1) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[IMAGEN_DOCUMENTO_IMPEDIMENTO]     Script Date: 
16-05-2025 13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[IMAGEN_DOCUMENTO_IMPEDIMENTO](  
 [COD_IMPEDIDO] [int] NOT NULL,  
 [COD_IMPEDIMENTO] [int] NOT NULL,  
 [IMAGEN] [image] NOT NULL,  
 [Usuario] [varchar](100) NOT NULL,  
 [Fecha] [datetime] NOT NULL,  
 [TipoArchivo] [varchar](5) NOT NULL  
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]  
GO 
/****** Object:   Table 
[dbo].[IMAGEN_DOCUMENTO_IMPEDIMENTO_ACTUALIZADO]     Script Date: 16 -05-
2025 13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[IMAGEN_DOCUMENTO_IMPEDIMENTO_ACTUALIZADO](  
 [COD_IMPEDIDO] [int] NOT NULL,  
 [COD_IMPEDIMENTO] [int] NOT NULL,  
 [UsuarioCambio] [varchar](100) NOT NULL,  
 [Fecha] [datetime] NOT NULL,  
 [FechaCambio] [datetime] NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[IMAGEN_DOCUMENTO_LEVANTAMIENTO]     Script Date: 
16-05-2025 13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[IMAGEN_DOCUMENTO_LEVANTAMIENTO](  
 [COD_IMPEDIDO] [int] NOT NULL,  
 [COD_IMPEDIMENTO] [int] NOT NULL,  
 [IMAGEN] [image] NOT NULL,  
 [Usuario] [varchar](100) NOT NULL,  
 [Fecha] [datetime] NOT NULL,  
 [TipoArchivo] [varchar](5) NOT NULL,  
 CONSTRAINT [PK_IMAGEN_DOCUMENTO_LEVANTAMIENTO] PRIMARY KEY 
CLUSTERED   
( 
 [COD_IMPEDIDO] ASC,  
 [COD_IMPEDIMENTO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]  
GO 
/****** Object:   Table 
[dbo].[IMAGEN_DOCUMENTO_LEVANTAMIENTO_ACTUALIZADO]     Script Date: 16 -
05-2025 13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[IMAGEN_DOCUMENTO_LEVANTAMIENTO_ACTUALIZADO](  
 [COD_IMPEDIDO] [int] NOT NULL,  
 [COD_IMPEDIMENTO] [int] NOT NULL,  
 [UsuarioCambio] [varchar](100) NOT NULL,  
 [Fecha] [datetime] NOT NULL,  
 [FechaCambio] [datetime] NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[Impedido_N]     Script Date: 16 -05-2025 13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
 
 
 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[Impedido_N](  
 [cod_impedido] [varchar](10) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[Impedimento_N]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[Impedimento_N](  
 [cod_impedimento] [varchar](10) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[log_insertar_marinos]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[log_insertar_marinos](  
 [id] [int] IDENTITY(1,1) NOT NULL,  
 [campo] [varchar](250) NOT NULL,  
 [valor] [varchar](250) NULL,  
 [fecha] [datetime] NOT NULL,  
 [num_caso] [int] NULL,  
 CONSTRAINT [PK_log_insertar_marinos] PRIMARY KEY CLUSTERED   
( 
 [id] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[log_insertar_marinos2]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[log_insertar_marinos2](  
 [ID] [int] IDENTITY(1,1) NOT NULL,  
 [PRIMER_NOMBRE] [nvarchar](150) NULL,  
 [SEGUNDO_NOMBRE] [nvarchar](150) NULL,  
 [PRIMER_APELLIDO] [nvarchar](150) NULL,  
 [SEGUNDO_APELLIDO] [nvarchar](150) NULL,  
 [PASAPORTE] [nvarchar](150) NULL,  
 [COD_NACIONALIDAD] [varchar](3) NULL,  
 [PAIS_NACIMIENTO] [varchar](3) NULL,  
 [FEC_NACIMIENTO] [varchar](20) NULL,  
 [GENERO] [char](1) NULL,  
 [NUM_CEDULA_ORIGEN] [varchar](50) NULL,  
 [COD_STATUS_ACTUAL] [varchar](3) NULL,  
 [COD_PTO_ENTRADA] [varchar](3) NULL,  
 [COD_PAIS_PROCEDENCIA] [varchar](3) NULL,  
 [COD_CIA_TRANSPORTE] [varchar](3) NULL,  
 [RUEX] [varchar](150) NULL,  
 [APP_NUMBER] [varchar](150) NULL,  
 [FECHA_CREACION] [datetime] NOT NULL,  
 CONSTRAINT [PK_log_insertar_marinos2] PRIMARY KEY CLUSTERED   
( 
 [ID] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[log_pruebas_parametros]     Script Date: 16 -05-2025 
13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[log_pruebas_parametros](  
 [id] [int] IDENTITY(1,1) NOT NULL,  
 [parametro] [varchar](100) NULL,  
 [valor] [varchar](100) NULL,  
 [fecha] [datetime] NULL,  
 CONSTRAINT [PK_log_pruebas_parametros] PRIMARY KEY CLUSTERED   
( 
 [id] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[mes]     Script Date: 16 -05-2025 13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[mes](  
 [id] [int] NOT NULL,  
 [mes] [varchar](500) NULL,  
 CONSTRAINT [PK_mes] PRIMARY KEY CLUSTERED   
( 
 [id] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[movis]     Script Date: 16 -05-2025 13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[movis](  
 [facha] [char](12) NULL,  
 [apecasada] [char](15) NULL,  
 [ciam] [char](41) NOT NULL,  
 [codvisam] [numeric](2, 0) NOT NULL,  
 [domper] [char](20) NULL,  
 [dompan] [char](40) NULL,  
 [edadm] [numeric](2, 0) NULL,  
 [estadiam] [numeric](3, 0) NULL,  
 [fechafox] [char](30) NULL,  
 [hora] [char](10) NOT NULL,  
 [motivo] [numeric](1, 0) NOT NULL,  
 [naciona] [numeric](4, 0) NOT NULL,  
 [numvuelo] [numeric](4, 0) NOT NULL,  
 [ocupacion] [numeric](4, 0) NOT NULL,  
 [paisnac] [numeric](4, 0) NOT NULL,  
 [priape] [char](15) NOT NULL,  
 [pasapor] [char](15) NOT NULL,  
 [prinombre] [char](15) NOT NULL,  
 [prodes] [char](40) NOT NULL,  
 [puerto] [numeric](2, 0) NOT NULL,  
 [segape] [char](15) NULL,  
 [sexo] [char](1) NOT NULL,  
 [segnom] [char](15) NULL,  
 [tipomov] [numeric](1, 0) NOT NULL,  
 [fecha1] [char](12) NOT NULL,  
 [quien] [char](15) NOT NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[MOVIS_FECHA]     Script Date: 16 -05-2025 13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
 
 
 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[MOVIS_FECHA](  
 [NUMERO] [int] IDENTITY(1,1) NOT NULL,  
 [FECHA] [smalldatetime] NOT NULL,  
 [PROCESADO] [char](1) NOT NULL,  
 CONSTRAINT [PK_MOVIS_FECHA] PRIMARY KEY CLUSTERED   
( 
 [NUMERO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[MOVIS_MM_BOLETA]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[MOVIS_MM_BOLETA](  
 [COD_BOLETA] [varchar](25) NOT NULL,  
 [NUM_BOLETA] [varchar](7) NULL,  
 [DIGITO] [varchar](1) NULL,  
 [APELLIDO] [varchar](25) NOT NULL,  
 [NOMBRE] [varchar](25) NOT NULL,  
 [NUM_DOC_VIAJE] [varchar](25) NOT NULL,  
 [COD_DOC_VIAJE] [varchar](2) NULL,  
 [COD_TIPO_PASAPORT] [varchar](2) NULL,  
 [COD_PAIS_EXPEDIDO] [varchar](3) NULL,  
 [ID] [varchar](20) NULL,  
 [COD_PAIS_NACIONAL] [varchar](3) NULL,  
 [COD_OCUPACION] [varchar](3) NULL,  
 [FECHA_NACIMIENTO] [datetime] NOT NULL,  
 [COD_SEXO] [varchar](1) NOT NULL,  
 [COD_PAIS_NACIMIEN] [varchar](3) NOT NULL,  
 [COD_PAIS_RESIDEN] [varchar](3) NULL,  
 [COD_MOTIVO_VIAJE] [varchar](1) NULL,  
 [DIR_PREVISTA] [varchar](100) NULL,  
 [COD_PAIS_PROC] [varchar](3) NULL,  
 [COD_CIA_TRANS_ENT] [varchar](3) NULL,  
 [VIAJE_ENTRADA] [varchar](15) NULL,  
 [TIEMPO_ESTADIA_INS] [smallint] NULL,  
 [COD_PAIS_DESTINO] [varchar](3) NULL,  
 [COD_CIA_TRANS_SAL] [varchar](3) NULL,  
 [VIAJE_SALIDA] [varchar](15) NULL,  
 [COD_TIP_VIAJ_ENT] [varchar](3) NULL,  
 [COD_TIPO_VISA] [varchar](3) NULL,  
 [NUMERO_VISA] [varchar](30) NULL,  
 [COD_TIP_VIAJ_SAL] [varchar](3) NULL,  
 [IND_ALTERNADORA] [bit] NOT NULL,  
 [COD_MOTIVO_DEVOLU] [varchar](3) NULL,  
 [TIPO_MOV] [varchar](1) NULL,  
 [APLICACION] [varchar](2) NULL,  
 [CONTROL] [bit] NOT NULL,  
 [ORIGEN_BOLETA] [varchar](1) NULL,  
 [COD_CATEG_ENTRADA] [varchar](1) NULL,  
 [COD_AGENCIA_ENTRA] [varchar](2) NULL,  
 [COD_SECCION_ENTRA] [varchar](2) NULL,  
 [COD_PUESTO_ENTRA] [varchar](2) NULL,  
 [COD_INSPECTOR_ENT] [varchar](20) NULL,  
 [FECHA_ENTRADA] [datetime] NULL,  
 [HORA_ENTRADA] [datetime] NULL,  
 [HITS_ENTRADA] [int] NULL,  
 [PAS_ROB_ENT] [bit] NOT NULL,  
 [OBS_ENTRADA] [varchar](30) NULL,  
 [COD_CATEG_SALIDA] [varchar](1) NULL,  
 [COD_AGENCIA_SALIDA] [varchar](2) NULL,  
 [COD_SECCION_SALIDA] [varchar](2) NULL,  
 [COD_PUESTO_SALIDA] [varchar](2) NULL,  
 [COD_INSPECTOR_SAL] [varchar](20) NULL,  
 [FECHA_SALIDA] [datetime] NULL,  
 [HORA_SALIDA] [datetime] NULL,  
 [HITS_SALIDA] [int] NULL,  
 [PAS_ROB_SAL] [bit] NOT NULL,  
 [OBS_SALIDA] [varchar](30) NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [IND_CAPTURA] [varchar](1) NULL,  
 CONSTRAINT [PK_SIM_MM_BOLETA] PRIMARY KEY CLUSTERED   
( 
 [COD_BOLETA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[plantilla]     Script Date: 16 -05-2025 13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[plantilla](  
 [idpl] [int] IDENTITY(1,1) NOT NULL,  
 [nombre] [varchar](500) NULL,  
 [descripcion] [varchar](500) NULL,  
 CONSTRAINT [PK_plantilla] PRIMARY KEY CLUSTERED   
( 
 [idpl] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[Results]     Script Date: 16 -05-2025 13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[Results](  
 [COD_MIGRACION] [varchar](4) NULL,  
 [COD_PAIS] [nvarchar](255) NULL,  
 [ISO_ALPHA2] [nvarchar](255) NULL,  
 [ISO_NUMERIC] [float] NULL,  
 [NOM_PAIS ] [nvarchar](255) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[sc_log]     Script Date: 16 -05-2025 13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[sc_log](  
 [id] [int] IDENTITY(1,1) NOT NULL,  
 [inserted_date] [datetime] NOT NULL,  
 [username] [varchar](90) NOT NULL,  
 [application] [varchar](200) NOT NULL,  
 [creator] [varchar](30) NOT NULL,  
 [ip_user] [varchar](32) NOT NULL,  
 [action] [varchar](30) NOT NULL,  
 [description] [text] NOT NULL,  
PRIMARY KEY CLUSTERED   
( 
 [id] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF , IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[sc_params]     Script Date: 16 -05-2025 13:14:42 ******/  
SET ANSI_NULLS ON  
 
 
 
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[sc_params](  
 [id] [smallint] IDENTITY(1,1) NOT NULL,  
 [dir_url] [varchar](400) NOT NULL,  
 [dir_url_foto] [varchar](400) NULL,  
 [url_foto_carnet] [varchar](400) NULL,  
 CONSTRAINT [PK_sc_params] PRIMARY KEY CLUSTERED   
( 
 [id] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[sec_apps]     Script Date: 16 -05-2025 13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[sec_apps](  
 [app_name] [varchar](128) NOT NULL,  
 [app_type] [varchar](255) NULL,  
 [description] [varchar](255) NULL,  
 CONSTRAINT [PK__sec_apps__A5AEA8373026824A] PRIMARY KEY CLUSTERED   
( 
 [app_name] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[sec_groups]     Script Date: 16 -05-2025 13:14:42 ******/  
SET ANSI_NULLS OFF  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[sec_groups](  
 [group_id] [int] NOT NULL,  
 [description] [varchar](64) NULL,  
PRIMARY KEY CLUSTERED   
( 
 [group_id] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY], 
UNIQUE NONCLUSTERED   
( 
 [description] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[sec_groups_apps]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS OFF  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[sec_groups_apps](  
 [group_id] [int] NOT NULL,  
 [app_name] [varchar](128) NOT NULL,  
 [priv_access] [varchar](1) NULL,  
 [priv_insert] [varchar](1) NULL,  
 [priv_delete] [varchar](1) NULL,  
 [priv_update] [varchar](1) NULL,  
 [priv_export] [varchar](1) NULL,  
 [priv_print] [varchar](1) NULL,  
PRIMARY KEY CLUSTERED   
( 
 [group_id] ASC,  
 [app_name] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[sec_users]     Script Date: 16 -05-2025 13:14:42 ******/  
SET ANSI_NULLS OFF  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[sec_users](  
 [login] [varchar](32) NOT NULL,  
 [pswd] [varchar](32) NOT NULL,  
 [name] [varchar](64) NULL,  
 [email] [varchar](64) NULL,  
 [active] [varchar](1) NULL,  
 [activation_code] [varchar](32) NULL,  
 [priv_admin] [varchar](1) NULL,  
 [view_levantado] [bit] NOT NULL,  
PRIMARY KEY CLUSTERED   
( 
 [login] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[sec_users_groups]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS OFF  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[sec_users_groups](  
 [login] [varchar](32) NOT NULL,  
 [group_id] [int] NOT NULL,  
PRIMARY KEY CLUSTERED   
( 
 [login] ASC,  
 [group_id] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[security_new]     Script Date: 16 -05-2025 13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[security_new](  
 [user_id] [char](10) NULL,  
 [password] [char](10) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SEG_TB_ERROR_LOG]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SEG_TB_ERROR_LOG](  
 [NUM_INTENTO] [int] IDENTITY(1,1) NOT NULL,  
 [USER_ID] [varchar](17) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [HORA] [varchar](2) NULL,  
 [MINUTO] [varchar](2) NULL,  
 CONSTRAINT [PKPrimaryKey_SEG_TB_ERROR_LOGN] PRIMARY KEY CLUSTERED   
( 
 [NUM_INTENTO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SEG_TB_PARAMETRO]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SEG_TB_PARAMETRO](  
 [COD_PARAMETRO] [varchar](2) NOT NULL,  
 [NOM_PARAMETRO] [varchar](60) NULL,  
 [VAL_PARAMETRO] [varchar](3) NULL,  
 CONSTRAINT [PKPrimaryKey_SEG_TB_PARAMETROC] PRIMARY KEY CLUSTERED   
( 
 [COD_PARAMETRO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SEG_TB_ROLES]     Script Date: 16 -05-2025 13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SEG_TB_ROLES](  
 [COD_ROLE] [int] IDENTITY(1,1) NOT NULL,  
 [NOM_ROLE] [varchar](30) NOT NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [CED_ACTUALIZACION] [varchar](17) NULL,  
 [NOM_ACTUALIZACION] [varchar](50) NULL,  
 [DESCRIPCION] [varchar](200) NULL,  
 CONSTRAINT [PKIND_COD_ROLE_SEG_TB_ROLESCOD] PRIMARY KEY CLUSTERED   
( 
 [COD_ROLE] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],  
 CONSTRAINT [U_IND_NOM_ROLE_SEG_TB_ROLESNOM] UNIQUE NONCLUSTERED   
( 
 [NOM_ROLE] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SEG_TB_USUA_ROLE]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SEG_TB_USUA_ROLE](  
 [COD_ROLE] [int] NOT NULL,  
 [USER_ID] [varchar](17) NOT NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [CED_ACTUALIZACION] [varchar](17) NULL,  
 [NOM_ACTUALIZACION] [varchar](50) NULL,  
 CONSTRAINT [PKIND_USUA_ROLE_SEG_TB_USUA_RO] PRIMARY KEY CLUSTERED   
( 
 [COD_ROLE] ASC,  
 [USER_ID] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SEG_TB_USUARIOS]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SEG_TB_USUARIOS](  
 [USER_ID] [varchar](17) NOT NULL,  
 [CED_USUARIO] [varchar](17) NULL,  
 [NOM_USUARIO] [varchar](50) NULL,  
 [EMAIL_USUARIO] [varchar](50) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [CED_ACTUALIZACION] [varchar](17) NULL,  
 [NOM_ACTUALIZACION] [varchar](50) NULL,  
 [FECHULTCAMBIOPASS] [datetime] NULL,  
 [INTENTOFALLIDO] [int] NULL,  
 [PASSWORD] [varchar](20) NULL,  
 [NOM_CIA] [varchar](75) NULL,  
 [CONTROL_MJE] [bit] NOT NULL,  
 [REGISTRADO_BLS] [bit] NOT NULL,  
 [ACTIVO] [bit] NOT NULL,  
 [CAMBIOPASS] [bit] NOT NULL,  
 [CONFIR_PASSW] [varchar](20) NULL,  
 [NOM_SERVER] [varchar](30) NULL,  
 [NUEVO_PASS] [varchar](20) NULL,  
 [LOGIN] [bit] NOT NULL,  
 [RESETPASS] [bit] NOT NULL,  
 CONSTRAINT [PKPrimaryKey_SEG_TB_USUARIOSUS] PRIMARY KEY CLUSTERED   
( 
 [USER_ID] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_AL_ENT_CUPOS]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_AL_ENT_CUPOS](  
 [FEC_CUPO] [datetime] NOT NULL,  
 [NUM_CANT_CUPOS] [smallint] NULL,  
 CONSTRAINT [PKpkey1_SIM_AL_ENT_CUPOSFEC_CU] PRIMARY KEY CLUSTERED   
( 
 [FEC_CUPO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_AL_ENTREVISTA]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_AL_ENTREVISTA](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [FEC_SOLICITUD] [datetime] NOT NULL,  
 [FEC_ENTREVISTA] [datetime] NOT NULL,  
 [COD_MOTIVO] [varchar](1000) NOT NULL,  
 [NOM_NACIONAL] [varchar](50) NULL,  
 [NUM_CEDULA_NAL] [varchar](12) NULL,  
 [LUG_TRABAJO_NAL] [varchar](100) NULL,  
 [LUG_TRABAJO_EXT] [varchar](100) NULL,  
 [NOM_APODER_LEGAL] [varchar](20) NULL,  
 [OBS_OBSERVACION] [varchar](1000) NULL,  
 [ID_RESPOSABLE_AL] [varchar](50) NULL,  
 [IND_RESULTADO] [varchar](1) NULL,  
 CONSTRAINT [PKpkey1_SIM_AL_ENTREVISTANUM_R] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [FEC_SOLICITUD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_AUTENTICACION]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_AUTENTICACION](  
 [LOGIN] [char](14) NULL,  
 [PASSWORD] [char](14) NULL,  
 [nivel] [int] NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_BMM_BOLETA]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_BMM_BOLETA](  
 [COD_BOLETA] [varchar](25) NOT NULL,  
 [NUM_BOLETA] [varchar](7) NULL,  
 [DIGITO] [varchar](1) NULL,  
 [APELLIDO] [varchar](25) NOT NULL,  
 [NOMBRE] [varchar](25) NOT NULL,  
 [NUM_DOC_VIAJE] [varchar](25) NOT NULL,  
 [COD_DOC_VIAJE] [varchar](2) NULL,  
 [COD_TIPO_PASAPORT] [varchar](2) NULL,  
 [COD_PAIS_EXPEDIDO] [varchar](3) NULL,  
 [ID] [varchar](20) NULL,  
 [COD_PAIS_NACIONAL] [varchar](3) NULL,  
 [COD_OCUPACION] [varchar](3) NULL,  
 [FECHA_NACIMIENTO] [datetime] NOT NULL,  
 [COD_SEXO] [varchar](1) NOT NULL,  
 [COD_PAIS_NACIMIEN] [varchar](3) NOT NULL,  
 [COD_PAIS_RESIDEN] [varchar](3) NULL,  
 [COD_MOTIVO_VIAJE] [varchar](1) NULL,  
 [DIR_PREVISTA] [varchar](100) NULL,  
 [COD_PAIS_PROC] [varchar](3) NULL,  
 [COD_CIA_TRANS_ENT] [varchar](3) NULL,  
 [VIAJE_ENTRADA] [varchar](15) NULL,  
 [TIEMPO_ESTADIA_INS] [smallint] NULL,  
 [COD_PAIS_DESTINO] [varchar](3) NULL,  
 [COD_CIA_TRANS_SAL] [varchar](3) NULL,  
 [VIAJE_SALIDA] [varchar](15) NULL,  
 [COD_TIP_VIAJ_ENT] [varchar](3) NULL,  
 [COD_TIPO_VISA] [varchar](2) NULL,  
 [NUMERO_VISA] [varchar](30) NULL,  
 [COD_TIP_VIAJ_SAL] [varchar](3) NULL,  
 [IND_ALTERNADORA] [bit] NOT NULL,  
 [COD_MOTIVO_DEVOLU] [varchar](3) NULL,  
 [TIPO_MOV] [varchar](1) NULL,  
 [APLICACION] [varchar](2) NULL,  
 [CONTROL] [bit] NOT NULL,  
 [ORIGEN_BOLETA] [varchar](1) NULL,  
 [COD_CATEG_ENTRADA] [varchar](1) NULL,  
 [COD_AGENCIA_ENTRA] [varchar](2) NULL,  
 [COD_SECCION_ENTRA] [varchar](2) NULL,  
 [COD_PUESTO_ENTRA] [varchar](2) NULL,  
 [COD_INSPECTOR_ENT] [varchar](20) NULL,  
 [FECHA_ENTRADA] [datetime] NULL,  
 [HORA_ENTRADA] [datetime] NULL,  
 [HITS_ENTRADA] [int] NULL,  
 [PAS_ROB_ENT] [bit] NOT NULL,  
 [OBS_ENTRADA] [varchar](30) NULL,  
 [COD_CATEG_SALIDA] [varchar](1) NULL,  
 [COD_AGENCIA_SALIDA] [varchar](2) NULL,  
 [COD_SECCION_SALIDA] [varchar](2) NULL,  
 [COD_PUESTO_SALIDA] [varchar](2) NULL,  
 [COD_INSPECTOR_SAL] [varchar](20) NULL,  
 [FECHA_SALIDA] [datetime] NULL,  
 [HORA_SALIDA] [datetime] NULL,  
 [HITS_SALIDA] [int] NULL,  
 [PAS_ROB_SAL] [bit] NOT NULL,  
 [OBS_SALIDA] [varchar](30) NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [IND_CAPTURA] [varchar](1) NULL,  
 CONSTRAINT [PKIND_COD_BOLETA_BCK] PRIMARY KEY CLUSTERED   
( 
 [COD_BOLETA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_BMM_PASAJERO]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_BMM_PASAJERO](  
 [REGISTRO] [int] NOT NULL,  
 [COM_AEREA] [varchar](2) NOT NULL,  
 [NUM_VUELO] [varchar](4) NOT NULL,  
 [FEC_VUELO] [datetime] NOT NULL,  
 [PASAPORTE] [varchar](20) NOT NULL,  
 [NACIONAL] [varchar](2) NOT NULL,  
 [APELLIDOS] [varchar](30) NOT NULL,  
 [NOMBRES] [varchar](30) NOT NULL,  
 [FEC_NACI] [varchar](10) NOT NULL,  
 [SEXO] [varchar](1) NOT NULL,  
 [TIPO_P] [varchar](5) NULL,  
 [PA_ORIGEN] [varchar](2) NULL,  
 [CIU_ORIGEN] [varchar](3) NULL,  
 [PA_DESTINO] [varchar](2) NULL,  
 [CIU_DESTINO] [varchar](3) NULL,  
 [EST_PASAJ] [bit] NULL,  
 [EST_ANOM] [bit] NULL,  
 [USU_MODIF] [varchar](20) NULL,  
 [FEC_MODIF] [datetime] NULL,  
 [HORA_MODIF] [datetime] NULL,  
 CONSTRAINT [PK_SIM_BMM_PASAJERO] PRIMARY KEY CLUSTERED   
( 
 [COM_AEREA] ASC,  
 [NUM_VUELO] ASC,  
 [FEC_VUELO] ASC,  
 [PASAPORTE] ASC,  
 [NACIONAL] ASC,  
 [APELLIDOS] ASC,  
 [NOMBRES] ASC,  
 [FEC_NACI] ASC,  
 [SEXO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
 
 
 
GO 
/****** Object:   Table [dbo].[SIM_BMM_VUELO]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_BMM_VUELO](  
 [COM_AEREA] [varchar](2) NOT NULL,  
 [NUM_VUELO] [varchar](4) NOT NULL,  
 [FEC_VUELO] [datetime] NOT NULL,  
 [HORA_VUELO] [varchar](6) NULL,  
 [TIPO_MOV] [varchar](1) NULL,  
 [PA_ORIGEN] [varchar](2) NULL,  
 [CIU_ORIGEN] [varchar](3) NULL,  
 [PA_ESCALA] [varchar](2) NULL,  
 [CIU_ESCALA] [varchar](3) NULL,  
 [PA_DESTINO] [varchar](2) NULL,  
 [CIU_DESTINO] [varchar](3) NULL,  
 [EST_VUELO] [varchar](1) NULL,  
 [USU_MODIF] [varchar](20) NULL,  
 [FEC_MODIF] [datetime] NULL,  
 [HORA_MODIF] [datetime] NULL,  
 [FEC_SAL_V] [datetime] NULL,  
 [HORA_SAL_V] [datetime] NULL,  
 [USU_SAL] [varchar](20) NULL,  
 [FEC_SAL] [datetime] NULL,  
 [HORA_SAL] [datetime] NULL,  
 [EST_MOV_MIG] [bit] NULL,  
 [OBSERVACION] [varchar](50) NULL,  
 [EST_ANOM_V] [bit] NULL,  
 [EST_CONFIR_V] [bit] NULL,  
 CONSTRAINT [PKIND_VUELO_SIM_BMM_VUELO] PRIMARY KEY CLUSTERED   
( 
 [COM_AEREA] ASC,  
 [NUM_VUELO] ASC,  
 [FEC_VUELO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_DE_MODIFICACION]     Script Date: 16 -05-2025 
13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_DE_MODIFICACION](  
 [COD_MODIFICACION] [int] NOT NULL,  
 [NOM_MODIFICACION] [varchar](25) NOT NULL,  
 CONSTRAINT [PKkey_modificacion_SIM_DE_MODIF] PRIMARY KEY CLUSTERED   
( 
 [COD_MODIFICACION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_ACTI_INAC]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_ACTI_INAC](  
 [COD_ACTI_INAC] [varchar](1) NOT NULL,  
 [NOM_ACTI_INAC] [varchar](8) NULL,  
 CONSTRAINT [PKkey1_SIM_FI_ACTI_INACCOD_ACT] PRIMARY KEY CLUSTERED   
( 
 [COD_ACTI_INAC] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_CALIDAD]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_CALIDAD](  
 [COD_CALIDAD] [varchar](2) NOT NULL,  
 [NOM_CALIDAD] [varchar](50) NOT NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 CONSTRAINT [PKKey1_SIM_FI_CALIDADCOD_CALID] PRIMARY KEY CLUSTERED   
( 
 [COD_CALIDAD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
 
 
 
GO 
/****** Object:   Table [dbo].[SIM_FI_CANC_STAT]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_CANC_STAT](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [FEC_CANCELA] [datetime] NOT NULL,  
 [IND_ESTADO] [varchar](1) NOT NULL,  
 [COD_STAT_ACTUAL] [varchar](3) NOT NULL,  
 [COD_CAUSA] [varchar](2) NOT NULL,  
 [COD_STAT_ANTER] [varchar](3) NOT NULL,  
 [NUM_RESUELTO] [smallint] NULL,  
 [ID_USUAR_CREA] [varchar](20) NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [FEC_SOLICITUD] [datetime] NULL,  
 [OBS_OBSERVACION] [varchar](1000) NULL,  
 [NOM_TIPO_CANCELA] [varchar](50) NULL,  
 [DES_ORDENA] [varchar](100) NULL,  
 [NUM_ANNIO] [varchar](4) NULL,  
 CONSTRAINT [PKpkey1_SIM_FI_CANC_STATNUM_RE] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [FEC_CANCELA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_CARTA_NAT]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_CARTA_NAT](  
 [NUM_SOLICITUD] [int] NOT NULL,  
 [FEC_SOLICITUD] [datetime] NOT NULL,  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [NUM_CEDULA] [varchar](20) NULL,  
 [IND_ESTADO] [varchar](1) NULL,  
 [NUM_RESUELTO] [smallint] NULL,  
 [COD_STAT_ACTUAL] [varchar](3) NULL,  
 [COD_STAT_ANTER] [varchar](3) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_RESUELTO] [datetime] NULL,  
 [IND_SOLICITUD] [varchar](1) NULL,  
 [FEC_APROB_REC] [datetime] NULL,  
 [OBSERVACION] [varchar](100) NULL,  
 [FEC_PRESENTA] [datetime] NULL,  
 [NUM_NOTA] [int] NULL,  
 [HITS_NAT] [int] NULL,  
 [NUM_TRB] [int] NULL,  
 [NUM_MGJ] [int] NULL,  
 [NUM_GOB] [int] NULL,  
 [ANNIO_IMP] [datetime] NULL,  
 [NUM_SEC] [int] NULL,  
 [FEC_ENVIO] [datetime] NULL,  
 [COD_DETENIDO] [varchar](2) NULL,  
 [COD_INSTITUCION] [varchar](1) NULL,  
 [NUM_CARTA_NAT] [int] NULL,  
 [FEC_CARTA_NAT] [datetime] NULL,  
 [NOMBRES_FIL] [varchar](80) NULL,  
 CONSTRAINT [PKIDX_CARTA_NAT_SIM_FI_CARTA_N] PRIMARY KEY CLUSTERED   
( 
 [NUM_SOLICITUD] ASC,  
 [FEC_SOLICITUD] ASC,  
 [NUM_REG_FILIACION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_CAUSAS]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_CAUSAS](  
 [COD_CAUSAS] [varchar](2) NOT NULL,  
 [NOM_CAUSAS] [varchar](60) NOT NULL,  
 CONSTRAINT [PKpkey1_SIM_FI_CAUSASCOD_CAUSA] PRIMARY KEY CLUSTERED   
( 
 [COD_CAUSAS] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
 
 
 
/****** Object:   Table [dbo].[SIM_FI_CAUSAS_CIT]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_CAUSAS_CIT](  
 [COD_CAUSAS] [varchar](2) NOT NULL,  
 [NOM_CAUSA] [varchar](60) NULL,  
 CONSTRAINT [PK_SIM_FI_CAUSAS_CIT] PRIMARY KEY CLUSTERED   
( 
 [COD_CAUSAS] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_CITACION]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_CITACION](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [FEC_CITACION] [datetime] NOT NULL,  
 [IND_ESTADO] [varchar](1) NULL,  
 [NUM_RECIBO] [varchar](8) NULL,  
 [COD_CAUSA] [varchar](2) NOT NULL,  
 [COD_STAT_ACTUAL] [varchar](3) NULL,  
 [NUM_CARNET] [varchar](6) NOT NULL,  
 [ID_USUAR_CREA] [varchar](20) NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [FEC_EMITE_CARNET] [datetime] NULL,  
 [FEC_VENC_CITAC] [datetime] NULL,  
 CONSTRAINT [PKpkey1_SIM_FI_CITACIONNUM_REG] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [FEC_CITACION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_CONDICION]     Script Date: 16 -05-2025 13:14:42 
******/  
 
 
 
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_CONDICION](  
 [COD_CONDICION] [varchar](1) NOT NULL,  
 [NOM_CONDICION] [varchar](10) NULL,  
 CONSTRAINT [PKPkey1_SIM_FI_CONDICIONCOD_CO] PRIMARY KEY CLUSTERED   
( 
 [COD_CONDICION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_CRIMINALISTICA]     Script Date: 16 -05-2025 
13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_CRIMINALISTICA](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [NOM_PRIMER_APELL] [varchar](25) NULL,  
 [NOM_SEGUND_APELL] [varchar](25) NULL,  
 [NOM_CASADA_APELL] [varchar](25) NULL,  
 [NOM_PRIMER_NOMB] [varchar](25) NULL,  
 [NOM_SEGUND_NOMB] [varchar](25) NULL,  
 [NOM_USUAL] [varchar](50) NULL,  
 [IND_SEXO] [varchar](1) NULL,  
 [NUM_PASAPORTE] [varchar](17) NULL,  
 [COD_PAIS_NACIM] [varchar](3) NULL,  
 [FEC_NACIM] [datetime] NULL,  
 [COD_NACION_ACTUAL] [varchar](3) NULL,  
 [IN_RESENADO] [bit] NULL,  
 [FE_RESENADO] [datetime] NULL,  
 [DE_RESENADO] [nvarchar](250) NULL,  
 [DE_OBSERVACION] [nvarchar](500) NULL,  
 [IN_HUELLA_EXTRAIDA] [bit] NULL,  
 [ID_USUARIO_EXTRACCION] [nvarchar](128) NULL,  
 [NM_USUARIO_EXTRACCION] [nvarchar](500) NULL,  
 [FE_EXTRACCION] [datetime] NULL,  
 [FEC_CREA_REG] [datetime] NULL,  
 [ID_USUARIO_MODIFICACION] [nvarchar](128) NULL,  
 [NM_USUARIO_MODIFICACION] [nvarchar](500) NULL,  
 [FE_MODIFICACION] [datetime] NULL,  
 [ID_USUAR_CREA] [varchar](20) NULL,  
 [Exportado] [tinyint] NOT NULL,  
 CONSTRAINT [PK_SIM_FI_GENERALES] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_DEP_EXP]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_DEP_EXP](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [FEC_SOLICITUD] [datetime] NOT NULL,  
 [NUM_RESUELTO] [smallint] NULL,  
 [FEC_DEP_EXP] [datetime] NOT NULL,  
 [COD_DEP_EXP] [varchar](1) NOT NULL,  
 [COD_CAUSAS] [varchar](2) NOT NULL,  
 [IND_ESTATUS] [varchar](1) NULL,  
 [OBS_OBSERVACION] [varchar](1000) NULL,  
 [COD_STAT_ACTUAL] [varchar](3) NULL,  
 [COD_STAT_ANTER] [varchar](3) NULL,  
 [ID_USUAR_CREA] [varchar](20) NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [COD_CIA_TRANSP] [varchar](3) NULL,  
 [NUM_VUELO] [varchar](5) NULL,  
 [FEC_GEN_RESOL] [datetime] NULL,  
 [IND_BORRADOR] [varchar](1) NULL,  
 [ID_ABOGADO] [varchar](20) NULL,  
 [IND_APROB_NEG] [varchar](1) NULL,  
 [FEC_APROB_NEG] [datetime] NULL,  
 CONSTRAINT [PKpkey1_SIM_FI_DEP_EXPNUM_REG_] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [FEC_SOLICITUD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_ES_MULTIP]     Script Date: 16 -05-2025 13:14:42 
******/  
 
 
 
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_ES_MULTIP](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [IND_ESTATUS] [varchar](1) NOT NULL,  
 [FEC_EMISION] [datetime] NOT NULL,  
 [FEC_VENCE] [datetime] NOT NULL,  
 [NOM_SOLICITANTE] [varchar](35) NULL,  
 [ID_USUAR_CREA] [varchar](20) NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [NUM_PERMISO] [int] NOT NULL,  
 [NUM_COSTO_VISA] [smallint] NULL,  
 CONSTRAINT [PKpkey1_SIM_FI_ES_MULTIPNUM_RE] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [NUM_PERMISO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_GENERALES]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_GENERALES](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [NOM_PRIMER_APELL] [varchar](25) NOT NULL,  
 [NOM_SEGUND_APELL] [varchar](25) NULL,  
 [NOM_CASADA_APELL] [varchar](25) NULL,  
 [NOM_PRIMER_NOMB] [varchar](25) NOT NULL,  
 [NOM_SEGUND_NOMB] [varchar](25) NULL,  
 [NOM_USUAL] [varchar](50) NULL,  
 [IND_SEXO] [varchar](1) NOT NULL,  
 [NUM_PASAPORTE] [varchar](17) NOT NULL,  
 [DIR_EXPED_PASAPOR] [varchar](40) NULL,  
 [FEC_EXPED_PASAPOR] [datetime] NULL,  
 [FEC_VENCE_PASAPOR] [datetime] NULL,  
 [IND_ESTADO_CIVIL] [varchar](1) NULL,  
 [COD_OCUPACION] [varchar](3) NULL,  
 [NOM_ACTIV_DESEMP] [varchar](40) NULL,  
 [COD_COLOR_OJOS] [varchar](1) NULL,  
 [COD_COLOR_CABELLO] [varchar](1) NULL,  
 [COD_COLOR_PIEL] [varchar](1) NULL,  
 [NUM_ESTATURA] [numeric](5, 2) NULL,  
 [NOM_LUGAR_NACIM] [varchar](30) NULL,  
 [COD_PAIS_NACIM] [varchar](3) NOT NULL,  
 [FEC_NACIM] [datetime] NOT NULL,  
 [DIR_RESIDENCIA] [varchar](50) NULL,  
 [DIR_RESIDENCIA_PMA] [varchar](50) NULL,  
 [COD_STAT_ANTER] [varchar](3) NULL,  
 [COD_NACION_ANTER] [varchar](3) NULL,  
 [COD_STAT_ACTUAL] [varchar] (3) NOT NULL,  
 [COD_NACION_ACTUAL] [varchar](3) NOT NULL,  
 [TEL_DOMICILIO] [varchar](15) NULL,  
 [NOM_PERS_RESP] [varchar](50) NULL,  
 [DIR_PERS_RESP] [varchar](50) NULL,  
 [TEL_PERS_RESP] [varchar](15) NULL,  
 [NUM_CANT_PERSONAS] [smallint] NULL,  
 [COD_NACION_CONYUG] [varchar](3) NULL,  
 [NOM_CONYUGUE] [varchar](30) NULL,  
 [NOM_PADRE] [varchar](30) NULL,  
 [COD_NACION_PADRE] [varchar](3) NULL,  
 [NOM_MADRE] [varchar](30) NULL,  
 [COD_NACION_MADRE] [varchar](3) NULL,  
 [COD_PTO_ENTRADA] [varchar](2) NOT NULL,  
 [COD_PAIS_PROCEDE] [varchar](3) NOT NULL,  
 [COD_CIA_TRANSP] [varchar](3) NOT NULL,  
 [FEC_LLEGADA_PMA] [datetime] NULL,  
 [NOM_FAMILIAR1] [varchar](30) NULL,  
 [NOM_FAMILIAR2] [varchar](30) NULL,  
 [NOM_FAMILIAR3] [varchar](30) NULL,  
 [COD_CALIDAD] [varchar](2) NULL,  
 [NUM_TARJET_TURISM] [varchar](15) NULL,  
 [ID_USUAR_CREA] [varchar](20) NULL,  
 [NOM_LUGAR_TRAB] [varchar](30) NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [IDENTIFICA_EMPL] [varchar](20) NULL,  
 [NOM_LUG_INSCRIBE] [varchar](20) NULL,  
 [FEC_CREA_REG] [datetime] NULL,  
 [FEC_MODIF_REG] [datetime] NULL,  
 [FEC_INSCRIPCION] [datetime] NULL,  
 [NUM_REF_FIL_ANT] [int] NULL,  
 [NUM_PASAPORTE_ANT] [varchar](17) NULL,  
 [IND_EXP_DIGITAL] [bit] NOT NULL,  
 [ID_USUA_ASES_LEG] [varchar](20) NULL,  
 [FEC_DIGITAL] [datetime] NULL,  
 [FEC_VENCE_STATUS] [datetime] NULL,  
 [COD_DESTINO_FINAL] [varchar](3) NULL,  
 [DESC_OBJETO_DE] [varchar](1000) NULL,  
 [NOM_PAIS_NACIO] [varchar](50) NULL,  
 [TIPODOC_CONYUGUE] [varchar](2) NULL,  
 [NUM_DOC_CONYUGUE] [varchar](25) NULL,  
 CONSTRAINT [PKpkey1_SIM_FI_GENERALESNUM_RE] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_GENERALES_RUEX]     Script Date: 16 -05-2025 
13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_GENERALES_RUEX](  
 [FECHA_CARGA] [datetime] NOT NULL,  
 [ANIO] [int] NULL,  
 [FECHA] [date] NULL,  
 [GENERO] [varchar](13) NOT NULL,  
 [GRUPO_EDAD] [varchar](6) NOT NULL,  
 [GRUPO_EDAD_N] [varchar](11) NOT NULL,  
 [NACIONALIDAD] [varchar](50) NULL,  
 [NOM_AGENCIA] [varchar](50) NULL,  
 [COD_VIA_TRANSP] [varchar](1) NULL,  
 [TOTAL] [int] NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_GENERALESX]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_GENERALESX](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [NOM_PRIMER_APELL] [varchar](25) NOT NULL,  
 [NOM_SEGUND_APELL] [varchar](25) NULL,  
 [NOM_CASADA_APELL] [varchar](25) NULL,  
 [NOM_PRIMER_NOMB] [varchar](25) NOT NULL,  
 [NOM_SEGUND_NOMB] [varchar](25) NULL,  
 [NOM_USUAL] [varchar](50) NULL,  
 [IND_SEXO] [varchar](1) NOT NULL,  
 [NUM_PASAPORTE] [varchar](20) NOT NULL,  
 [DIR_EXPED_PASAPOR] [varchar](40) NULL,  
 [FEC_EXPED_PASAPOR] [datetime] NULL,  
 [FEC_VENCE_PASAPOR] [datetime] NULL,  
 [IND_ESTADO_CIVIL] [varchar](1) NULL,  
 [COD_OCUPACION] [varchar](3) NULL,  
 [NOM_ACTIV_DESEMP] [varchar](40) NULL,  
 [COD_COLOR_OJOS] [varchar](1) NULL,  
 [COD_COLOR_CABELLO] [varchar](1) NULL,  
 [COD_COLOR_PIEL] [varchar](1) NULL,  
 [NUM_ESTATURA] [numeric](5, 2) NULL,  
 [NOM_LUGAR_NACIM] [varchar](30) NULL,  
 [COD_PAIS_NACIM] [varchar](3) NOT NULL,  
 [FEC_NACIM] [datetime] NOT NULL,  
 [DIR_RESIDENCIA] [varchar](50) NULL,  
 [DIR_RESIDENCIA_PMA] [varchar](50) NULL,  
 [COD_STAT_ANTER] [varchar](3) NULL,  
 [COD_NACION_ANTER] [varchar](3) NULL,  
 [COD_STAT_ACTUAL] [varchar](3) NOT NULL,  
 [COD_NACION_ACTUAL] [varchar](3) NOT NULL,  
 [TEL_DOMICILIO] [varchar](15) NULL,  
 [NOM_PERS_RESP] [varchar](50) NULL,  
 [DIR_PERS_RESP] [varchar](50) NULL,  
 [TEL_PERS_RESP] [varchar](15) NULL,  
 [NUM_CANT_PERSONAS] [smallint] NULL,  
 [COD_NACION_CONYUG] [varchar](3) NULL,  
 [NOM_CONYUGUE] [varchar](30) NULL,  
 [NOM_PADRE] [varchar](30) NULL,  
 [COD_NACION_PADRE] [varchar](3) NULL,  
 [NOM_MADRE] [varchar](30) NULL,  
 [COD_NACION_MADRE] [varchar](3) NULL,  
 [COD_PTO_ENTRADA] [varchar](2) NOT NULL,  
 [COD_PAIS_PROCEDE] [varchar](3) NOT NULL,  
 [COD_CIA_TRANSP] [varchar](3) NOT NULL,  
 [FEC_LLEGADA_PMA] [datetime] NULL,  
 [NOM_FAMILIAR1] [varchar](30) NULL,  
 [NOM_FAMILIAR2] [varchar](30) NULL,  
 [NOM_FAMILIAR3] [varchar](30) NULL,  
 [COD_CALIDAD] [varchar](2) NULL,  
 [NUM_TARJET_TURISM] [varchar](15) NULL,  
 [ID_USUAR_CREA] [varchar](20) NULL,  
 [NOM_LUGAR_TRAB] [varchar](30) NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [IDENTIFICA_EMPL] [varchar](20) NULL,  
 [NOM_LUG_INSCRIBE] [varchar](20) NULL,  
 [FEC_CREA_REG] [datetime] NULL,  
 [FEC_MODIF_REG] [datetime] NULL,  
 [FEC_INSCRIPCION] [datetime] NULL,  
 [NUM_REF_FIL_ANT] [int] NULL,  
 [NUM_PASAPORTE_ANT] [varchar](20) NULL,  
 [IND_EXP_DIGITAL] [bit] NOT NULL,  
 [ID_USUA_ASES_LEG] [varchar](20) NULL,  
 [FEC_DIGITAL] [datetime] NULL,  
 [FEC_VENCE_STATUS] [datetime] NULL,  
 [COD_DESTINO_FINAL] [varchar](3) NULL,  
 [DESC_OBJETO_DE] [varchar](1000) NULL,  
 [NOM_PAIS_NACIO] [varchar](50) NULL,  
 [TIPODOC_CONYUGUE] [varchar](2) NULL,  
 [NUM_DOC_CONYUGUE] [varchar](25) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_IND_DE_EX]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_IND_DE_EX](  
 [COD_DEPOR_EXPUL] [varchar](1) NOT NULL,  
 [NOM_DEPOR_EXPUL] [varchar](10) NULL,  
 CONSTRAINT [PKPkey1_SIM_FI_IND_DE_EXCOD_DE] PRIMARY KEY CLUSTERED   
( 
 [COD_DEPOR_EXPUL] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_INDICES]     Script Date: 16 -05-2025 13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_INDICES](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [NUM_INDICE] [int] NOT NULL,  
 [COD_TIPO_REGISTRO] [varchar](2) NOT NULL,  
 CONSTRAINT [PKEY1_SIM_FI_INDICESNUM_REG_FI] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [NUM_INDICE] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
 
 
 
GO 
/****** Object:   Table [dbo].[SIM_FI_LOG_FILIA]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_LOG_FILIA](  
 [REGISTRO] [int] IDENTITY(1,1) NOT NULL,  
 [NUM_REGISTRO] [int] NOT NULL,  
 [NOM_CAMPO] [varchar](20) NOT NULL,  
 [DES_CAMPO] [varchar](20) NOT NULL,  
 [VALOR_ANT] [varchar](50) NULL,  
 [VALOR_NVO] [varchar](50) NULL,  
 [ID_USUAR_MODIF] [varchar](20) NOT NULL,  
 [FEC_MODIF] [datetime] NOT NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_MANGENERAL]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_MANGENERAL](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [NUM_REG_GENERAL] [int] NOT NULL,  
 [PRIMER_APELL_ANT] [varchar](25) NULL,  
 [SEGUND_APELL_ANT] [varchar](25) NULL,  
 [CASADA_APELL_ANT] [varchar](25) NULL,  
 [PRIMER_NOMB_ANT] [varchar](25) NULL,  
 [SEGUND_NOMB_ANT] [varchar](25) NULL,  
 [PRIMER_APELL_ACT] [varchar](25) NULL,  
 [SEGUND_APELL_ACT] [varchar](25) NULL,  
 [CASADA_APELL_ACT] [varchar](25) NULL,  
 [PRIMER_NOMB_ACT] [varchar](25) NULL,  
 [SEGUND_NOMB_ACT] [varchar](25) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [USU_ACTUALIZACION] [varchar](20) NULL,  
 CONSTRAINT [PK1_UNICO_SIM_FI_MANGENERALNUM] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [NUM_REG_GENERAL] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
 
 
 
GO 
/****** Object:   Table [dbo].[SIM_FI_MOTIVO_REP]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_MOTIVO_REP](  
 [COD_MOTIVO_REP] [varchar](3) NOT NULL,  
 [NOM_MOTIVO_REP] [varchar](80) NOT NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_MULTAS]     Script Date: 16 -05-2025 13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_MULTAS](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [NUM_RECIBO] [varchar](8) NOT NULL,  
 [IND_ESTADO] [varchar](1) NOT NULL,  
 [NUM_MONTO] [numeric](7, 2) NOT NULL,  
 [NOM_CAUSA] [varchar](100) NOT NULL,  
 [COD_SECCION] [varchar](2) NULL,  
 [IND_USUAR_CREA] [varchar](20) NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [FEC_PAGO] [datetime] NULL,  
 [OBS_OBSERVACION] [varchar](1000) NULL,  
 [FEC_MULTA] [datetime] NOT NULL,  
 CONSTRAINT [PKpkey1_SIM_FI_MULTASNUM_REG_F] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [NUM_RECIBO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_NEG_RESOL]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_NEG_RESOL](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [NUM_RESUELTO] [smallint] NOT NULL,  
 [FEC_RESUELTO] [datetime] NOT NULL,  
 [COD_STAT_ACTUAL] [varchar](3) NOT NULL,  
 [COD_STAT_ANTER] [varchar](3) NOT NULL,  
 [IND_ESTADO] [varchar](1) NOT NULL,  
 [ID_USUAR_CREA] [varchar](20) NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [NUM_RESUELTO_CANC] [smallint] NOT NULL,  
 [FEC_RESUELTO_CANC] [datetime] NOT NULL,  
 [NOM_MOTIVO] [varchar](1000) NOT NULL,  
 CONSTRAINT [PKpkey1_SIM_FI_NEG_RESOLNUM_RE] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [NUM_RESUELTO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_OBSERVA]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_OBSERVA](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [FEC_OBSERVACION] [datetime] NOT NULL,  
 [OBS_OBSERVACION] [varchar](1000) NOT NULL,  
 [IND_ESTADO] [varchar](1) NOT NULL,  
 [ID_USUAR_CREA] [varchar](20) NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [NUM_OBSERVACION] [int] IDENTITY(1,1) NOT NULL,  
 CONSTRAINT [PKpkey1_SIM_FI_OBSERVANUM_REG_] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [NUM_OBSERVACION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_PASAPORTE]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
 
 
 
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_PASAPORTE](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [NUM_PASAP_ACTUAL] [varchar](15) NOT NULL,  
 [NUM_PASAP_ANTER] [varchar](15) NOT NULL,  
 [IND_ESTADO] [varchar](1) NOT NULL,  
 [NOM_LUGAR_EXPEDIC] [varchar](50) NULL,  
 [FEC_VENCE] [datetime] NOT NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_EXPEDIC_PASAP] [datetime] NULL,  
 CONSTRAINT [PKpkey1_SIM_FI_PASAPORTENUM_RE] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [NUM_PASAP_ACTUAL] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_PasaporteAbodago_Java]     Script Date: 16 -05-
2025 13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_PasaporteAbodago_Java](  
 [id] [int] IDENTITY(1,1) NOT NULL,  
 [NUM_REG_FILIACION] [int] NULL,  
 [NUM_PASAPORTE] [varchar](15) NULL,  
 [ABOGADO] [varchar](75) NULL,  
 [IDONEIDAD] [varchar](50) NULL,  
 [PASANTE] [varchar](75) NULL,  
 [CEDULAPASANTE] [varchar](25) NULL,  
 [FECHA] [datetime] NULL,  
 CONSTRAINT [PK_PasaporteAbodago_Java] PRIMARY KEY CLUSTERED   
( 
 [id] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_PRORR_TUR]     Script Date: 16 -05-2025 13:14:42 
******/  
 
 
 
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_PRORR_TUR](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [FEC_EMISION] [datetime] NOT NULL,  
 [IND_ESTADO] [varchar](1) NOT NULL,  
 [COD_STAT_ACTUAL] [varchar](3) NULL,  
 [ID_USUAR_CREA] [varchar](20) NULL,  
 [COD_CIA_AEREA] [varchar](3) NULL,  
 [NUM_PASAJE] [varchar](15) NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_VENCE] [datetime] NULL,  
 [NUM_CARNET] [varchar](8) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [COD_TIPO_PRORROGA] [varchar](3) NULL,  
 [FEC_EMISION_CARNE] [datetime] NULL,  
 [NOM_MOTIVO_PRORR] [varchar](1000) NOT NULL,  
 [FEC_ULT_ENTRADA] [datetime] NULL,  
 [NUM_DIAS_SOL_PROR] [smallint] NULL,  
 [NUM_DIAS_AUT_PROR] [smallint] NULL,  
 CONSTRAINT [PKpkey1_SIM_FI_PRORR_TURNUM_RE] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [FEC_EMISION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_RECONSID]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_RECONSID](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [NUM_RESUELTO] [varchar](8) NOT NULL,  
 [IND_CONDICION] [varchar](1) NULL,  
 [IND_ESTATUS] [varchar](1) NOT NULL,  
 [COD_CAUSA] [varchar](2) NOT NULL,  
 [COD_STAT_ACTUAL] [varchar](3) NOT NULL,  
 [ID_USUAR_CREA] [varchar](20) NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_RECONSIDERA] [datetime] NOT NULL,  
 
 
 
 [FEC_ACTUALIZA] [datetime] NULL,  
 CONSTRAINT [PKpkey1_SIM_FI_RECONSIDNUM_REG] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [NUM_RESUELTO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_REPATRIAR]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_REPATRIAR](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [FEC_REPATRIADO] [datetime] NOT NULL,  
 [COD_MOTIVO] [varchar](2) NULL,  
 [IND_ESTATUS] [varchar](1) NOT NULL,  
 [OBS_OBSERVACION] [varchar](1000) NULL,  
 [COD_STAT_ACTUAL] [varchar](3) NOT NULL,  
 [COD_STAT_ANTERIOR] [varchar](3) NOT NULL,  
 [FEC_VENCE] [datetime] NULL,  
 [ID_USUAR_CREA] [varchar](20) NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 CONSTRAINT [PKpkey1_SIM_FI_REPATRIARNUM_RE] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [FEC_REPATRIADO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_RESIDENCIA]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_RESIDENCIA](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [FEC_CAMB_RESID] [datetime] NOT NULL,  
 [IND_ESTATUS] [varchar](1) NOT NULL,  
 
 
 
 [DIR_RESIDENCIA] [varchar](50) NOT NULL,  
 [TEL_RESIDENCIA] [varchar](8) NULL,  
 [ID_USUAR_CREA] [varchar](20) NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 CONSTRAINT [PKpkey1_SIM_FI_RESIDENCIANUM_R] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [FEC_CAMB_RESID] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FI_TIPO_REG]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FI_TIPO_REG](  
 [COD_TIPO_REGISTRO] [varchar](2) NOT NULL,  
 [NOM_TIPO_REGISTRO] [varchar](22) NULL,  
 CONSTRAINT [PKPkey1_SIM_FI_TIPO_REGCOD_TIP] PRIMARY KEY CLUSTERED   
( 
 [COD_TIPO_REGISTRO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FT_CONC_ACTI]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FT_CONC_ACTI](  
 [COD_CONCLUSION] [varchar](1) NOT NULL,  
 [NOM_CONCLUSION] [varchar](25) NULL,  
 CONSTRAINT [PK_SIM_FT_CONC_ACTI] PRIMARY KEY CLUSTERED   
( 
 [COD_CONCLUSION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
 
 
 
GO 
/****** Object:   Table [dbo].[SIM_FT_CONCLUSION]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FT_CONCLUSION](  
 [COD_CONCLUSION] [varchar](1) NOT NULL,  
 [NOM_CONCLUSION] [varchar](25) NULL,  
 CONSTRAINT [PKEY1_SIM_FT_CONCLUSIONCOD_CON] PRIMARY KEY CLUSTERED   
( 
 [COD_CONCLUSION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FT_DEPENDTE_CIERRE]     Script Date: 16 -05-2025 
13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FT_DEPENDTE_CIERRE](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [COD_TIPO_VISA] [varchar](3) NOT NULL,  
 [FEC_SOLICITUD] [datetime] NOT NULL,  
 [NUM_REG_FIL_DEP] [int] NOT NULL,  
 [ID_USUARIO_CREA] [varchar](17) NULL,  
 [ID_USUARIO_MODIF] [varchar](17) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [FEC_CREACION] [datetime] NULL,  
 [COD_PARENTESCO] [varchar](3) NULL,  
 [IND_CONYUG] [varchar](1) NULL,  
 [NUM_TRAMITE] [int] NOT NULL,  
 [OBSERVACIONES] [varchar](1000) NULL,  
 CONSTRAINT [PK_SIM_VI_DEPENDTE_CIERRE] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [COD_TIPO_VISA] ASC,  
 [FEC_SOLICITUD] ASC,  
 [NUM_REG_FIL_DEP] ASC,  
 [NUM_TRAMITE] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
 
 
 
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FT_ESTA_ACTI]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FT_ESTA_ACTI](  
 [COD_ESTATUS] [varchar](1) NOT NULL,  
 [NOM_ESTATUS] [varchar](24) NULL,  
 CONSTRAINT [PK_SIM_FT_ESTA_ACTI] PRIMARY KEY CLUSTERED   
( 
 [COD_ESTATUS] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FT_ESTATUS]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FT_ESTATUS](  
 [COD_ESTATUS] [varchar](1) NOT NULL,  
 [NOM_ESTATUS] [varchar](24) NULL,  
 CONSTRAINT [PKpkey1_SIM_FT_ESTATUSCOD_ESTA] PRIMARY KEY CLUSTERED   
( 
 [COD_ESTATUS] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FT_PASOS]     Script Date: 16 -05-2025 13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FT_PASOS](  
 [COD_TRAMITE] [varchar](3) NOT NULL,  
 [NUM_PASO] [varchar](2) NOT NULL,  
 [NOM_DESCRIPCION] [varchar](50) NULL,  
 CONSTRAINT [PKpkey1_SIM_FT_PASOSCOD_TRAMIT] PRIMARY KEY CLUSTERED   
( 
 
 
 
 [COD_TRAMITE] ASC,  
 [NUM_PASO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FT_PASOXTRAM]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FT_PASOXTRAM](  
 [COD_TRAMITE] [varchar](3) NOT NULL,  
 [NUM_PASO] [varchar](2) NOT NULL,  
 [COD_SECCION] [varchar](2) NOT NULL,  
 [ID_PASO_SGTE] [varchar](1) NULL,  
 [ID_USUAR_MODIFICA] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [DESC_PASOXTRAM] [varchar](1000) NULL,  
 [COD_AGENCIA] [varchar](2) NOT NULL,  
 CONSTRAINT [PKEY1_SIM_FT_PASOXTRAMCOD_TRAM] PRIMARY KEY CLUSTERED   
( 
 [COD_TRAMITE] ASC,  
 [NUM_PASO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FT_PRIORIDAD]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FT_PRIORIDAD](  
 [COD_PRIORIDAD] [varchar](2) NOT NULL,  
 [NOM_PRIORIDAD] [varchar](25) NULL,  
 CONSTRAINT [PK_SIM_FT_PRIORIDAD] PRIMARY KEY CLUSTERED   
( 
 [COD_PRIORIDAD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
 
 
 
GO 
/****** Object:   Table [dbo].[SIM_FT_TRAMITE_CIERRE]     Script Date: 16 -05-2025 
13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FT_TRAMITE_CIERRE](  
 [NUM_REGISTRO] [int] NOT NULL,  
 [NUM_TRAMITE] [int] NOT NULL,  
 [NUM_ANNIO] [varchar](4) NOT NULL,  
 [IND_ESTATUS] [varchar](1) NOT NULL,  
 [ID_USUARIO_SOLICITA] [varchar](20) NOT NULL,  
 [ID_USUARIO_CIERRE] [varchar](20) NULL,  
 [PROCESADO] [bit] NULL,  
 CONSTRAINT [PK_SIM_FT_TRAMITE_CIERRE] PRIMARY KEY CLUSTERED   
( 
 [NUM_REGISTRO] ASC,  
 [NUM_TRAMITE] ASC,  
 [NUM_ANNIO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FT_TRAMITE_D]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FT_TRAMITE_D](  
 [NUM_ANNIO] [varchar](4) NOT NULL,  
 [NUM_TRAMITE] [int] NOT NULL,  
 [COD_TRAMITE] [varchar](3) NOT NULL,  
 [NUM_PASO] [varchar](2) NOT NULL,  
 [NUM_ACTIVIDAD] [varchar](2) NULL,  
 [FEC_FIN_TRAMITE] [datetime] NULL,  
 [FEC_INI_TRAMITE] [datetime] NULL,  
 [COD_SECCION] [varchar](2) NULL,  
 [ID_USUARIO_MODIF] [varchar](20) NULL,  
 [OBS_OBSERVACION] [varchar](1000) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [NUM_PASO_SGTE] [varchar](2) NULL,  
 [IND_ESTATUS] [varchar](1) NULL,  
 [IND_CONCLUSION] [varchar](1) NULL,  
 [NUM_REGISTRO] [int] NOT NULL,  
 
 
 
 [COD_AGENCIA] [varchar](2) NULL,  
 [ID_USUAR_RESP] [varchar](20) NULL,  
 [FEC_CREA_REG] [datetime] NULL,  
 [IND_ULTACTIV] [varchar](1) NULL,  
 [COD_AGENCIA_SIG] [varchar](2) NULL,  
 [COD_SECCION_SIG] [varchar](2) NULL,  
 [IND_USUAULT_ACTIV] [varchar](1) NULL,  
 CONSTRAINT [PKpkey1_SIM_FT_TRAMITE_DNUM_AN] PRIMARY KEY CLUSTERED   
( 
 [NUM_ANNIO] ASC,  
 [NUM_TRAMITE] ASC,  
 [NUM_PASO] ASC,  
 [NUM_REGISTRO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FT_TRAMITE_E]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FT_TRAMITE_E](  
 [NUM_ANNIO] [varchar](4) NOT NULL,  
 [NUM_TRAMITE] [int] NOT NULL,  
 [FEC_INI_TRAMITE] [datetime] NULL,  
 [FEC_FIN_TRAMITE] [datetime] NULL,  
 [NUM_REGISTRO] [int] NOT NULL,  
 [ID_USUARIO_CREA] [varchar](20) NULL,  
 [OBS_OBSERVA] [varchar](1000) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [IND_ESTATUS] [varchar](1) NULL,  
 [COD_TRAMITE] [varchar](3) NOT NULL,  
 [IND_CONCLUSION] [varchar](1) NULL,  
 [IND_PRIORIDAD] [varchar](2) NULL,  
 [HITS_TRAMITE] [int] NULL,  
 CONSTRAINT [PKEY1_SIM_FT_TRAMITE_ENUM_ANNI] PRIMARY KEY CLUSTERED   
( 
 [NUM_ANNIO] ASC,  
 [NUM_TRAMITE] ASC,  
 [NUM_REGISTRO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
 
 
 
GO 
/****** Object:   Table [dbo].[SIM_FT_TRAMITE_REVERTIRCIERRE]     Script Date: 16 -05-
2025 13:14:42 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FT_TRAMITE_REVERTIRCIERRE](  
 [id] [int] IDENTITY(1,1) NOT NULL,  
 [NUM_REGISTRO] [int] NOT NULL,  
 [NUM_TRAMITE] [int] NOT NULL,  
 [NUM_ANNIO] [varchar](4) NOT NULL,  
 [IND_ESTATUS] [varchar](1) NOT NULL,  
 [ID_USUARIO_SOLICITA] [varchar](20) NOT NULL,  
 [ID_USUARIO_CIERRE] [varchar](20) NULL,  
 [ID_USUARIO_REVIERTE] [varchar](20) NOT NULL,  
 [FECHA_REVIERTE] [datetime] NOT NULL,  
 [MOTIVO_REVIERTE] [int] NOT NULL,  
 [OBSERVACION] [varchar](max) NOT NULL,  
 CONSTRAINT [PK_SIM_FT_TRAMITE_REVERTIRCIERRE_1] PRIMARY KEY CLUSTERED   
( 
 [id] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_FT_TRAMITES]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FT_TRAMITES](  
 [COD_TRAMITE] [varchar](3) NOT NULL,  
 [DESC_TRAMITE] [varchar](50) NOT NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [PAG_TRAMITE] [varchar](50) NOT NULL,  
 CONSTRAINT [PKEY1_SIM_FT_TRAMITESCOD_TRAMI] PRIMARY KEY CLUSTERED   
( 
 [COD_TRAMITE] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
 
 
 
/****** Object:   Table [dbo].[SIM_FT_USUA_SEC]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_FT_USUA_SEC](  
 [COD_AGENCIA] [varchar](2) NOT NULL,  
 [COD_SECCION] [varchar](2) NOT NULL,  
 [ID_USUARIO] [varchar](20) NOT NULL,  
 [CONT_TRANSAC] [smallint] NULL,  
 [IND_USUAR_RESPON] [varchar](1) NULL,  
 [IND_ESTADO] [varchar](1) NOT NULL,  
 CONSTRAINT [PKpkey1_SIM_FT_USUA_SECCOD_AGE] PRIMARY KEY CLUSTERED   
( 
 [COD_AGENCIA] ASC,  
 [COD_SECCION] ASC,  
 [ID_USUARIO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_AERNAC]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_AERNAC](  
 [COD_PAISNAC] [varchar](2) NOT NULL,  
 [NOM_PAIS] [varchar](30) NULL,  
 [NOM_NAC] [varchar](30) NULL,  
 [msrepl_tran_version] [uniqueidentifier] NOT NULL,  
 CONSTRAINT [PKIND_NAC_SIM_GE_AERNACCOD_PAI] PRIMARY KEY CLUSTERED   
( 
 [COD_PAISNAC] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_AEROLINEA]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
 
 
 
GO 
CREATE TABLE [dbo].[SIM_GE_AEROLINEA](  
 [COD_AEROLINEA] [varchar](2) NOT NULL,  
 [NOM_AEROLINEA] [varchar](50) NULL,  
 [COD_PANAMA] [varchar](3) NULL,  
 [msrepl_tran_version] [uniqueidentifier] NOT NULL,  
 CONSTRAINT [PKIND_AEROLINEA_SIM_GE_AEROLIN] PRIMARY KEY CLUSTERED   
( 
 [COD_AEROLINEA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_AG_SEC]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_AG_SEC](  
 [COD_AGENCIA] [varchar](2) NOT NULL,  
 [COD_SECCION] [varchar](2) NOT NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 CONSTRAINT [PKEY1_SIM_GE_AG_SECCOD_AGENCIA] PRIMARY KEY CLUSTERED   
( 
 [COD_AGENCIA] ASC,  
 [COD_SECCION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_AGENCIA]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_AGENCIA](  
 [COD_AGENCIA] [varchar](2) NOT NULL,  
 [NOM_AGENCIA] [varchar](50) NOT NULL,  
 [COD_VIA_TRANSP] [varchar](1) NULL,  
 [IND_MOVIM_MIGRATO] [bit] NOT NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 
 
 
 [CORREO_SUPERIOR] [varchar](50) NULL,  
 [CORREO_SUPERVISOR] [varchar](50) NULL,  
 [PAGER_SUPERVISOR] [varchar](50) NULL,  
 [COD_REGION] [varchar](2) NULL,  
 [CORREO_PERSONAL] [varchar](50) NULL,  
 [COD_AGENCIA_LETRA] [varchar](2) NULL,  
 [SECUENCIA_BOLETA] [int] NULL,  
 CONSTRAINT [PKEY1_SIM_GE_AGENCIACOD_AGENCI] PRIMARY KEY CLUSTERED   
( 
 [COD_AGENCIA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_AUTORIDAD]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_AUTORIDAD](  
 [COD_AUTORIDAD] [varchar](5) NOT NULL,  
 [NOM_AUTORIDAD] [varchar](150) NOT NULL,  
 [UBICACION] [varchar](100) NOT NULL,  
 [ESTADO] [varchar](100) NOT NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 CONSTRAINT [PKEY_SIM_GE_AUTORIDADCOD_AUTOR] PRIMARY KEY CLUSTERED   
( 
 [COD_AUTORIDAD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_BANCOS]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_BANCOS](  
 [COD_BANCO] [varchar](3) NOT NULL,  
 [NOM_BANCO] [varchar](40) NOT NULL,  
 [USER_ID] [varchar](17) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 
 
 
 CONSTRAINT [PKPE_PK_BANCOS_SIM_GE_BANCOSCO] PRIMARY KEY CLUSTERED   
( 
 [COD_BANCO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_CABELLO]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_CABELLO](  
 [COD_COLOR_CABELLO] [varchar](1) NOT NULL,  
 [NOM_COLOR_CABELLO] [varchar](15) NULL,  
 CONSTRAINT [PKEY1_SIM_GE_CABELLOCOD_COLOR_] PRIMARY KEY CLUSTERED   
( 
 [COD_COLOR_CABELLO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_CARGO]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_CARGO](  
 [COD_CARGO] [varchar](2) NOT NULL,  
 [NOM_CARGO] [varchar](50) NOT NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 CONSTRAINT [PKEY_SIM_GE_CARGOCOD_CARGO_] PRIMARY KEY CLUSTERED   
( 
 [COD_CARGO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_CAT_ENTRAD]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
 
 
 
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_CAT_ENTRAD](  
 [COD_CATEG_ENTRADA] [varchar](1) NOT NULL,  
 [NOM_CATEG_ENTRADA] [varchar](35) NULL,  
 CONSTRAINT [PKEY1_SIM_GE_CAT_ENTRADCOD_CAT] PRIMARY KEY CLUSTERED   
( 
 [COD_CATEG_ENTRADA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_CATEGORIA]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_CATEGORIA](  
 [COD_CATEGORIA] [varchar](2) NOT NULL,  
 [NOM_CATEGORIA] [varchar](25) NULL,  
 CONSTRAINT [PKGE_PK_VCATEGORIA_SIM_GE_CATE] PRIMARY KEY CLUSTERED   
( 
 [COD_CATEGORIA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_CIA_TRANSP]     Script Date: 16 -05-2025 13:14:42 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_CIA_TRANSP](  
 [COD_COMPANIA] [varchar](3) NOT NULL,  
 [NOM_COMPANIA] [varchar](50) NOT NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [CODIGO_IATA] [varchar](3) NULL,  
 [COD_VIA_TRANSP] [varchar](1) NULL,  
 [IMO] [int] NULL,  
 CONSTRAINT [PKEY1_SIM_GE_CIA_TRANSPCOD_COM] PRIMARY KEY CLUSTERED   
( 
 
 
 
 [COD_COMPANIA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_COMPLEXION]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_COMPLEXION](  
 [COD_COMPLEXION] [varchar](1) NOT NULL,  
 [NOM_COMPLEXION] [varchar](15) NULL,  
 CONSTRAINT [PKkey_complexion_SIM_GE_COMPLE] PRIMARY KEY CLUSTERED   
( 
 [COD_COMPLEXION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_CONT_NUM]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_CONT_NUM](  
 [COD_NUMERACION] [varchar](3) NOT NULL,  
 [NUMERACION] [int] NULL,  
 [NUM_SECUENCIA] [smallint] NULL,  
 [ANIO_SECUENCIA] [smallint] NULL,  
 [USER_ID] [varchar](17) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [NOM_CONT_NUM] [varchar](40) NULL,  
 [COD_CATEGORIA] [varchar](2) NULL,  
 [RESET_ANIO] [bit] NOT NULL,  
 CONSTRAINT [PKPE_PK_CONT_NUM_SIM_GE_CONT_N] PRIMARY KEY CLUSTERED   
( 
 [COD_NUMERACION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
 
 
 
/****** Object:   Table [dbo].[SIM_GE_CONTINENTE]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_CONTINENTE](  
 [COD_CONTINENTE] [varchar](1) NOT NULL,  
 [NOM_CONTINENTE] [varchar](35) NOT NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 CONSTRAINT [PKEY1_SIM_GE_CONTINENTECOD_CON] PRIMARY KEY CLUSTERED   
( 
 [COD_CONTINENTE] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_EST_CIVIL]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_EST_CIVIL](  
 [COD_EST_CIVIL] [varchar](1) NOT NULL,  
 [NOM_EST_CIVIL] [varchar](12) NOT NULL,  
 CONSTRAINT [PKGE_PK_VEST_CIVIL_SIM_GE_EST_] PRIMARY KEY CLUSTERED   
( 
 [COD_EST_CIVIL] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_MOTIVO_DEV]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_MOTIVO_DEV](  
 [COD_MOTIVO] [varchar](3) NOT NULL,  
 [NOM_MOTIVO] [varchar](50) NOT NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 
 
 
 CONSTRAINT [PKEY1_SIM_GE_MOTIVO_DEVCOD_MOT] PRIMARY KEY CLUSTERED   
( 
 [COD_MOTIVO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_OCUPACION]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_OCUPACION](  
 [COD_OCUPACION] [varchar](3) NOT NULL,  
 [NOM_OCUPACION] [varchar](50) NOT NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [CIOU88] [varchar](5) NULL,  
 CONSTRAINT [PKEY1_SIM_GE_OCUPACIONCOD_OCUP] PRIMARY KEY CLUSTERED   
( 
 [COD_OCUPACION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_OJOS]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_OJOS](  
 [COD_COLOR_OJOS] [varchar](1) NOT NULL,  
 [NOM_COLOR_OJOS] [varchar](20) NULL,  
 CONSTRAINT [PKEY1_SIM_GE_OJOSCOD_COLOR_OJO] PRIMARY KEY CLUSTERED   
( 
 [COD_COLOR_OJOS] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_PACIU]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
 
 
 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_PACIU](  
 [COD_PAIS] [varchar](2) NOT NULL,  
 [COD_CIUDAD] [varchar](3) NOT NULL,  
 [NOM_PACIU] [varchar](50) NULL,  
 CONSTRAINT [PKIND_PACIU_SIM_GE_PACIUCOD_PA] PRIMARY KEY CLUSTERED   
( 
 [COD_PAIS] ASC,  
 [COD_CIUDAD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_PAIS]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_PAIS](  
 [COD_PAIS] [varchar](3) NOT NULL,  
 [NOM_PAIS] [varchar](50) NOT NULL,  
 [NOM_NACIONALIDAD] [varchar](35) NOT NULL,  
 [COD_TIPO_PAIS] [varchar](2) NULL,  
 [COD_TIPO_SENSI] [varchar](2) NULL,  
 [IND_SUPRESION_VISA] [bit] NOT NULL,  
 [COD_CONTINENTE] [varchar](1) NULL,  
 [NUM_PRECIO_FAX] [numeric](5, 2) NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [ISO_ALPHA2] [varchar](2) NULL,  
 [COD_MIGRACION] [varchar](3) NULL,  
 [ISO_NUMERIC] [varchar](3) NULL,  
 [COD_CATEG_ENTRADA] [varchar](1) NULL,  
 CONSTRAINT [PKEY1_SIM_GE_PAISCOD_PAIS_] PRIMARY KEY CLUSTERED   
( 
 [COD_PAIS] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_PARAMETRO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
 
 
 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_PARAMETRO](  
 [COD_PARAMETRO] [varchar](2) NOT NULL,  
 [NOM_PARAMETRO] [varchar](60) NULL,  
 [VAL_PARAMETRO] [varchar](50) NULL,  
 [FEC_DESDE] [datetime] NULL,  
 [FEC_HASTA] [datetime] NULL,  
 CONSTRAINT [PKEY1_SIM_GE_PARAMETROCOD_PARA] PRIMARY KEY CLUSTERED   
( 
 [COD_PARAMETRO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_PERIODO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_PERIODO](  
 [COD_PERIODO] [varchar](1) NOT NULL,  
 [NOM_PERIODO] [varchar](7) NOT NULL,  
 CONSTRAINT [PKEY1_SIM_GE_PERIODOCOD_PERIOD] PRIMARY KEY CLUSTERED   
( 
 [COD_PERIODO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_PIEL]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_PIEL](  
 [COD_COLOR_PIEL] [varchar](1) NOT NULL,  
 [NOM_COLOR_PIEL] [varchar](15) NULL,  
 CONSTRAINT [PKEY1_SIM_GE_PIELCOD_COLOR_PIE] PRIMARY KEY CLUSTERED   
( 
 [COD_COLOR_PIEL] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
 
 
 
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_PUESTO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_PUESTO](  
 [COD_PUESTO] [varchar](2) NOT NULL,  
 [NOM_PUESTO] [varchar](50) NOT NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 CONSTRAINT [PKEY1_SIM_GE_PUESTOCOD_PUESTO_] PRIMARY KEY CLUSTERED   
( 
 [COD_PUESTO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_REGION]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_REGION](  
 [COD_REGION] [varchar](2) NOT NULL,  
 [NOM_REGION] [varchar](50) NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 CONSTRAINT [PKEY1_SIM_GE_REGIONCOD_REGION_] PRIMARY KEY CLUSTERED   
( 
 [COD_REGION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_SEC_PUE]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_SEC_PUE](  
 
 
 
 [COD_PUESTO] [varchar](2) NOT NULL,  
 [COD_SECCION] [varchar](2) NOT NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [COD_AGENCIA] [varchar](2) NOT NULL,  
 CONSTRAINT [PKEY1_SIM_GE_SEC_PUECOD_AGENCI] PRIMARY KEY CLUSTERED   
( 
 [COD_AGENCIA] ASC,  
 [COD_SECCION] ASC,  
 [COD_PUESTO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_SECCION]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_SECCION](  
 [COD_SECCION] [varchar](2) NOT NULL,  
 [NOM_SECCION] [varchar](50) NOT NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 CONSTRAINT [PKEY1_SIM_GE_SECCIONCOD_SECCIO] PRIMARY KEY CLUSTERED   
( 
 [COD_SECCION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_SEXO]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_SEXO](  
 [COD_SEXO] [varchar](1) NOT NULL,  
 [NOM_SEXO] [varchar](9) NULL,  
 CONSTRAINT [PKPE_PK_VGE_SEXO_SIM_GE_SEXOCO] PRIMARY KEY CLUSTERED   
( 
 [COD_SEXO] ASC  
 
 
 
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_TIPO_MOV]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_TIPO_MOV](  
 [COD_TIPO_MOV] [varchar](1) NOT NULL,  
 [NOM_TIPO_MOV] [varchar](10) NOT NULL,  
 CONSTRAINT [PKEY1_SIM_GE_TIPO_MOVCOD_TIPO_] PRIMARY KEY CLUSTERED   
( 
 [COD_TIPO_MOV] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_TIPO_PAIS]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_TIPO_PAIS](  
 [COD_TIPO_PAIS] [varchar](2) NOT NULL,  
 [NOM_TIPO_PAIS] [varchar](15) NULL,  
 CONSTRAINT [PKEY1_SIM_GE_TIPO_PAISCOD_TIPO] PRIMARY KEY CLUSTERED   
( 
 [COD_TIPO_PAIS] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_TIPO_SENSI]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_TIPO_SENSI](  
 [COD_TIPO_SENSI] [varchar](2) NOT NULL,  
 
 
 
 [NOM_TIPO_SENSI] [varchar](15) NULL,  
 CONSTRAINT [PKEY1_SIM_GE_TIPO_SENSICOD_TIP] PRIMARY KEY CLUSTERED   
( 
 [COD_TIPO_SENSI] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_TIPO_VISA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_TIPO_VISA](  
 [Cod_TipoVisa] [varchar](2) NOT NULL,  
 [Nom_TipoVisa] [varchar](50) NOT NULL,  
 CONSTRAINT [PK_SIM_GE_Tipo_Visa] PRIMARY KEY CLUSTERED   
( 
 [Cod_TipoVisa] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_USUARIOS]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_USUARIOS](  
 [USER_ID] [varchar](17) NOT NULL,  
 [CED_USUARIO] [varchar](17) NULL,  
 [NOM_USUARIO] [varchar](50) NULL,  
 [EMAIL_USUARIO] [varchar](50) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [CED_ACTUALIZACION] [varchar](17) NULL,  
 [NOM_ACTUALIZACION] [varchar](50) NULL,  
 [FECHULTCAMBIOPASS] [datetime] NULL,  
 [INTENTOFALLIDO] [int] NULL,  
 [PASSWORD] [varchar](20) NULL,  
 [NOM_CIA] [varchar](75) NULL,  
 [CONTROL_MJE] [bit] NOT NULL,  
 [REGISTRADO_BLS] [bit] NOT NULL,  
 [ACTIVO] [bit] NOT NULL,  
 
 
 
 [CAMBIOPASS] [bit] NOT NULL,  
 [RESETPASS] [bit] NOT NULL,  
 [CONFIR_PASSW] [varchar](30) NULL,  
 [NOM_SERVER] [varchar](30) NULL,  
 [NUEVO_PASS] [varchar](30) NULL,  
 [LOGIN] [bit] NOT NULL,  
 CONSTRAINT [PKPrimaryKey_SIM_GE_USUARIOSUS] PRIMARY KEY CLUSTERED   
( 
 [USER_ID] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_GE_VIA_TRANSP]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_GE_VIA_TRANSP](  
 [COD_VIA_TRANSP] [varchar](1) NOT NULL,  
 [NOM_VIA_TRANSP] [varchar](20) NULL,  
 CONSTRAINT [PKEY1_SIM_GE_VIA_TRANSPCOD_VIA] PRIMARY KEY CLUSTERED   
( 
 [COD_VIA_TRANSP] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_IM_ACCION]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_IM_ACCION](  
 [COD_ACCION] [varchar](5) NOT NULL,  
 [NOM_ACCION] [varchar](40) NOT NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [TIP_IDENTIFICA] [varchar](1) NULL,  
 CONSTRAINT [PKEY1_SIM_IM_ACCIONCOD_ACCION_] PRIMARY KEY CLUSTERED   
( 
 [COD_ACCION] ASC  
 
 
 
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_IM_ACCION_EJE]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_IM_ACCION_EJE](  
 [COD_ACCION] [varchar](5) NULL,  
 [FECHA_ACCION] [datetime] NULL,  
 [COD_FUNC_NOTIFICA] [varchar](20) NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NOT NULL,  
 [OBSERVACION] [text] NULL,  
 [ACCION_TOMADA] [bit] NOT NULL,  
 [COD_BOLETA] [varchar](25) NOT NULL,  
 [COD_IMPEDIDO] [int] NULL,  
 [TIPO_MOV] [varchar](1) NOT NULL,  
 [APLICACION] [varchar](2) NOT NULL,  
 CONSTRAINT [PKEY1_SIM_IM_ACCION_EJECOD_BOL] PRIMARY KEY CLUSTERED   
( 
 [FEC_ACTUALIZA] ASC,  
 [COD_BOLETA] ASC,  
 [TIPO_MOV] ASC,  
 [APLICACION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_IM_ALERTA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_IM_ALERTA](  
 [COD_ALERTA] [varchar](5) NOT NULL,  
 [NOM_ALERTA] [varchar](50) NOT NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [COD_CATEGORIA] [varchar](2) NULL,  
 CONSTRAINT [PKEY1_SIM_IM_ALERTACOD_ALERTA_] PRIMARY KEY CLUSTERED   
 
 
 
( 
 [COD_ALERTA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_IM_ALIAS]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_IM_ALIAS](  
 [COD_ALIAS] [int] NOT NULL,  
 [COD_IMPEDIDO] [int] NOT NULL,  
 [NOMBRE_ALIAS] [varchar](25) NULL,  
 [APELLIDO_ALIAS] [varchar](25) NULL,  
 [ALIAS] [varchar](25) NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 CONSTRAINT [PKEY1_SIM_IM_ALIASCOD_ALIAS_] PRIMARY KEY CLUSTERED   
( 
 [COD_ALIAS] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_IM_ANOMALIA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_IM_ANOMALIA](  
 [COD_ANOMALIA] [int] NOT NULL,  
 [COD_BOLETA] [varchar](25) NOT NULL,  
 [COD_DOC_VIAJE] [varchar](2) NULL,  
 [NUM_DOC_VIAJE] [varchar](25) NULL,  
 [FECHA_ALERTA] [datetime] NULL,  
 [COD_DETECTA] [varchar](20) NULL,  
 [IND_NOTIFICADO] [bit] NOT NULL,  
 [COD_FUNC_NOTIFICA] [varchar](20) NULL,  
 [FECHA_NOTIFICACION] [datetime] NULL,  
 [OBSERVACION] [text] NULL,  
 [IDENTIFICACION] [bit] NOT NULL,  
 [COD_ALERTA] [varchar](5) NULL,  
 
 
 
 [COD_ACCION] [varchar](5) NULL,  
 [COD_IMPEDIDO] [int] NULL,  
 [TIPO_MOV] [varchar](1) NOT NULL,  
 [APLICACION] [varchar](2) NOT NULL,  
 [COD_SECCION] [varchar](2) NULL,  
 [COD_PUESTO] [varchar](2) NULL,  
 [COD_AGENCIA] [varchar](2) NULL,  
 CONSTRAINT [PKIND_IM_ANOMALIA_SIM_IM_ANOMA] PRIMARY KEY CLUSTERED   
( 
 [COD_BOLETA] ASC,  
 [TIPO_MOV] ASC,  
 [COD_ANOMALIA] ASC,  
 [APLICACION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_IM_CATEGORIA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_IM_CATEGORIA](  
 [COD_CATEGORIA] [varchar](2) NOT NULL,  
 [NOM_CATEGORIA] [varchar](50) NULL,  
 CONSTRAINT [PK_SIM_IM_CATEGORIA] PRIMARY KEY CLUSTERED   
( 
 [COD_CATEGORIA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_IM_IMPEDIDO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_IM_IMPEDIDO](  
 [COD_IMPEDIDO] [int] NOT NULL,  
 [NOMBRE] [varchar](25) NOT NULL,  
 [APELLIDO] [varchar](25) NOT NULL,  
 [FECHA_NACIMIENTO] [datetime] NOT NULL,  
 [COD_ETNIA] [varchar](1) NULL,  
 
 
 
 [COD_PAIS_NACIONAL] [varchar](3) NOT NULL,  
 [ESTATURA] [varchar](10) NULL,  
 [IND_ALIAS] [bit] NOT NULL,  
 [FOTO] [varchar](50) NULL,  
 [COD_SEXO] [varchar](1) NOT NULL,  
 [COD_COLOR_PIEL] [varchar](1) NULL,  
 [COD_COLOR_OJOS] [varchar](1) NULL,  
 [COD_COLOR_CABELLO] [varchar](1) NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [ID] [varchar](14) NULL,  
 [TIPO_ID] [varchar](2) NULL,  
 [SIN_IMPEDIMENTO] [bit] NOT NULL,  
 [PARTICULARIDADES] [varchar](225) NULL,  
 [COD_COMPLEXION] [varchar](1) NULL,  
 [OBSERVACION] [varchar](225) NULL,  
 [PRIMER_NOMBRE] [varchar](20) NOT NULL,  
 [SEGUNDO_NOMBRE] [varchar](20) NULL,  
 [PRIMER_APELLIDO] [varchar](20) NOT NULL,  
 [SEGUNDO_APELLIDO] [varchar](20) NULL,  
 [APELLIDO_CASADA] [varchar](20) NULL,  
 [LLAVE_PN_PA] [varchar](10) NULL,  
 [LLAVE_PN_SA] [varchar](10) NULL,  
 [LLAVE_PN_CA] [varchar](10) NULL,  
 [LLAVE_SN_PA] [varchar](10) NULL,  
 [LLAVE_SN_SA] [varchar](10) NULL,  
 [LLAVE_SN_CA] [varchar](10) NULL,  
 [msrepl_tran_version] [uniqueidentifier] NOT NULL,  
 [rowguid] [uniqueidentifier] ROWGUIDCOL   NOT NULL,  
 [BACKUP_NOMBRE] [varchar](25) NULL,  
 [BACKUP_APELLIDO] [varchar](25) NULL,  
 [FLAG_DEPURACION] [int] NOT NULL,  
 [FLAG_PROCESADO] [bit] NOT NULL,  
 CONSTRAINT [PKEY1_SIM_IM_IMPEDIDOCOD_IMPED] PRIMARY KEY CLUSTERED   
( 
 [COD_IMPEDIDO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_IM_IMPEDIMEN]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
 
 
 
CREATE TABLE [dbo].[SIM_IM_IMPEDIMEN](  
 [COD_IMPEDIMENTO] [int] NOT NULL,  
 [COD_IMPEDIDO] [int] NOT NULL,  
 [COD_DOC_VIAJE] [varchar](2) NULL,  
 [NUM_DOC_VIAJE] [varchar](25) NULL,  
 [COD_ALERTA] [varchar](5) NOT NULL,  
 [COD_AUTORIDAD] [varchar](5) NOT NULL,  
 [NUM_OFICIO] [varchar](12) NOT NULL,  
 [FECHA_OFICIO] [datetime] NOT NULL,  
 [COD_ACCION] [varchar](5) NOT NULL,  
 [IND_LEVANTADO] [bit] NOT NULL,  
 [TIEMPO_VIGENCIA] [smallint] NULL,  
 [COD_TIPO_MOV] [varchar](1) NOT NULL,  
 [COD_PERIODO] [varchar](1) NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [NUM_NOTA] [varchar](12) NULL,  
 [NUM_REG] [varchar](8) NULL,  
 [COD_PAIS_EXPEDIDO] [varchar](3) NULL,  
 [NOMBRE_AUTORIDAD] [varchar](30) NULL,  
 [OBSERVACION] [varchar](500) NULL,  
 [IND_LEVAN_DEFINI] [bit] NOT NULL,  
 [FECHA_NOTA] [datetime] NULL,  
 [msrepl_tran_version] [uniqueidentifier] NOT NULL,  
 [rowguid] [uniqueidentifier] ROWGUIDCOL   NOT NULL,  
 CONSTRAINT [PKEY1_SIM_IM_IMPEDIMENCOD_IMPE] PRIMARY KEY CLUSTERED   
( 
 [COD_IMPEDIMENTO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_IM_LEVANTAMI]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_IM_LEVANTAMI](  
 [COD_IMPEDIMENTO] [int] NOT NULL,  
 [IND_DEFINITIVO] [bit] NOT NULL,  
 [TIEMPO_PERMISO] [smallint] NULL,  
 [COD_AUTORIDAD] [varchar](5) NOT NULL,  
 [COD_IMPEDIDO] [int] NOT NULL,  
 [COD_PERIODO] [varchar](1) NULL,  
 [FECHA_OFICIO_PERM] [datetime] NOT NULL,  
 
 
 
 [NUM_OFICIO_PERMIS] [varchar](12) NOT NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [FECHA_LEVANTAMIEN] [datetime] NULL,  
 [IND_APLICADO] [bit] NOT NULL,  
 [FECHA_PERM_DESDE] [datetime] NULL,  
 [FECHA_PERM_HASTA] [datetime] NULL,  
 [NOMBRE_AUTORIDAD] [varchar](20) NULL,  
 [msrepl_tran_version] [uniqueidentifier] NOT NULL,  
 [rowguid] [uniqueidentifier] ROWGUIDCOL   NOT NULL,  
 CONSTRAINT [PKEY_SIM_IM_LEVA_COD_IMP] PRIMARY KEY NONCLUSTERED   
( 
 [COD_IMPEDIMENTO] ASC,  
 [COD_AUTORIDAD] ASC,  
 [NUM_OFICIO_PERMIS] ASC,  
 [COD_IMPEDIDO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_IM_OTROS_NOM]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_IM_OTROS_NOM](  
 [COD_OTROS] [int] IDENTITY(1,1) NOT NULL,  
 [COD_IMPEDIDO] [int] NULL,  
 [NOMBRE] [varchar](25) NULL,  
 [APELLIDO] [varchar](25) NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [PRIMER_NOMBRE] [varchar](20) NOT NULL,  
 [SEGUNDO_NOMBRE] [varchar](20) NULL,  
 [PRIMER_APELLIDO] [varchar](20) NOT NULL,  
 [SEGUNDO_APELLIDO] [varchar](20) NULL,  
 [APELLIDO_CASADA] [varchar](20) NULL,  
 [LLAVE_PN_PA] [varchar](10) NULL,  
 [LLAVE_PN_SA] [varchar](10) NULL,  
 [LLAVE_PN_CA] [varchar](10) NULL,  
 [LLAVE_SN_PA] [varchar](10) NULL,  
 [LLAVE_SN_SA] [varchar](10) NULL,  
 [LLAVE_SN_CA] [varchar](10) NULL,  
 CONSTRAINT [PKIND_OTROS_NOM_SIM_IM_OTROS_N] PRIMARY KEY CLUSTERED   
( 
 
 
 
 [COD_OTROS] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_IM_PAS_ROBADO]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_IM_PAS_ROBADO](  
 [EXPEDIDO_EN] [varchar](3) NOT NULL,  
 [NUM_PASAPORTE_FIN] [varchar](9) NOT NULL,  
 [COD_PASAPORTE] [varchar](2) NOT NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [NUM_PASAPORTE_INI] [varchar](9) NULL,  
 [ALFANUMERICO] [bit] NOT NULL,  
 CONSTRAINT [PKKEY_PAS_ROB_SIM_IM_PAS_ROBAD] PRIMARY KEY CLUSTERED   
( 
 [NUM_PASAPORTE_FIN] ASC,  
 [EXPEDIDO_EN] ASC,  
 [COD_PASAPORTE] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_IM_PASA_ROBA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_IM_PASA_ROBA](  
 [COD_PASAPORTE] [int] NOT NULL,  
 [NUM_NOTA] [varchar](25) NOT NULL,  
 [FEC_NOTA] [datetime] NOT NULL,  
 [COD_AUTORIDAD] [varchar](5) NOT NULL,  
 [COD_PAIS] [varchar](3) NOT NULL,  
 [NUM_PAS_INICIAL] [varchar](15) NOT NULL,  
 [NUM_PAS_FINAL] [varchar](15) NULL,  
 [NOMBRE_AUTORIDAD] [varchar](30) NULL,  
 [TIP_PASAPORTE] [varchar](2) NOT NULL,  
 [OBSERVACION] [varchar](500) NULL,  
 
 
 
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 CONSTRAINT [PKIND_COD_PASAPORTE_SIM_IM_PAS] PRIMARY KEY CLUSTERED   
( 
 [COD_PASAPORTE] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],  
 CONSTRAINT [U_IND_PASAPORTE_SIM_IM_PASA_RO] UNIQUE NONCLUSTERED   
( 
 [NUM_NOTA] ASC,  
 [FEC_NOTA] ASC,  
 [COD_AUTORIDAD] ASC,  
 [COD_PAIS] ASC,  
 [NUM_PAS_INICIAL] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_IM_TIPO_IDENT]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_IM_TIPO_IDENT](  
 [COD_IDENTIFICA] [varchar](1) NULL,  
 [NOM_IDENTIFICA] [varchar](23) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_IN_LLAMADOATENCION]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_IN_LLAMADOATENCION](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [FEC_LLAMADOATENCION] [datetime] NOT NULL,  
 [OBS_LLAMADOATENCION] [varchar](1000) NOT NULL,  
 [IND_ESTADO] [varchar](1) NOT NULL,  
 [ID_USUAR_CREA] [varchar](20) NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_CREACION] [datetime] NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [NUM_LLAMADOATENCION] [int] IDENTITY(1,1) NOT NULL,  
 
 
 
 CONSTRAINT [PKpkey1_SIM_IN_OBSERVANUM_REG_] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [NUM_LLAMADOATENCION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_LOG_ALIAS]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_LOG_ALIAS](  
 [COD_ALIAS] [int] NULL,  
 [COD_IMPEDIDO] [varchar](5) NULL,  
 [NOMBRE_ALIAS] [varchar](25) NULL,  
 [APELLIDO_ALIAS] [varchar](25) NULL,  
 [ALIAS] [varchar](25) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_LOG_IDENTIFIC]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_LOG_IDENTIFIC](  
 [COD_LOG] [int] IDENTITY(1,1) NOT NULL,  
 [COD_IMPEDIMENTO] [int] NULL,  
 [COD_DETECTA] [varchar](20) NULL,  
 [FECHA_HORA_LOG] [datetime] NULL,  
 [IND_IDENTIFICADO] [bit] NOT NULL,  
 [IND_NOTIFICADO] [bit] NOT NULL,  
 [COD_PUESTO] [varchar](2) NULL,  
 [COD_AGENCIA] [varchar](2) NULL,  
 [COD_SECCION] [varchar](2) NULL,  
 [COD_BOLETA] [varchar](25) NULL,  
 [COD_IMPEDIDO] [int] NULL,  
 CONSTRAINT [PKEY1_SIM_LOG_IDENTIFICCOD_LOG] PRIMARY KEY CLUSTERED   
( 
 [COD_LOG] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
 
 
 
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_LOG_IMPEDIMEN]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_LOG_IMPEDIMEN](  
 [COD_LOG] [int] IDENTITY(1,1) NOT NULL,  
 [COD_IMPEDIMENTO] [int] NULL,  
 [COD_DETECTA] [varchar](20) NULL,  
 [FECHA_ALERTA] [datetime] NULL,  
 [COD_BOLETA] [varchar](20) NULL,  
 [IND_NOTIFICADO] [bit] NOT NULL,  
 [COD_FUNC_NOTIFICA] [varchar](20) NULL,  
 [FECHA_NOTIFICACION] [datetime] NULL,  
 [COD_ALERTA] [varchar](5) NULL,  
 [TIP_IMPEDIMEN] [varchar](1) NULL,  
 [NUM_DOC_VIAJE] [varchar](25) NULL,  
 [COD_DOC_VIAJE] [varchar](5) NULL,  
 CONSTRAINT [PKEY1_SIM_LOG_IMPEDIMENCOD_LOG] PRIMARY KEY CLUSTERED   
( 
 [COD_LOG] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_LOG_IMPELEVAN]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_LOG_IMPELEVAN](  
 [COD_IMPEDIMENTO] [int] NOT NULL,  
 [COD_IMPEDIDO] [int] NULL,  
 [COD_DOC_VIAJE] [varchar](2) NULL,  
 [NUM_DOC_VIAJE] [varchar](25) NULL,  
 [COD_ALERTA] [varchar](5) NULL,  
 [COD_AUTORIDAD] [varchar](5) NULL,  
 [NUM_OFICIO] [varchar](12) NULL,  
 [FECHA_NOTA] [datetime] NULL,  
 [NUM_NOTA] [varchar](12) NULL,  
 [COD_ACCION] [varchar](2) NULL,  
 [COD_TIPO_MOV] [varchar](1) NULL,  
 
 
 
 [COD_PAIS_EXPEDIDO] [varchar](3) NULL,  
 [NUM_REG] [varchar](8) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 CONSTRAINT [PKEY1_SIM_LOG_IMPELEVANCOD_IMP] PRIMARY KEY CLUSTERED   
( 
 [COD_IMPEDIMENTO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_LOG_MODIFICAC]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_LOG_MODIFICAC](  
 [COD_LOG] [int] IDENTITY(1,1) NOT NULL,  
 [COD_IMPEDIMENTO] [int] NULL,  
 [COD_FUNCIONARIO] [varchar](20) NULL,  
 [ACCION] [varchar](25) NULL,  
 [TABLA] [varchar](50) NULL,  
 [CAMPO] [varchar](50) NULL,  
 [VALOR_NUEVO] [varchar](255) NULL,  
 [VALOR_ANTERIOR] [varchar](255) NULL,  
 [FECHA_ACCION] [datetime] NULL,  
 [COD_IMPEDIDO] [int] NULL,  
 CONSTRAINT [PKEY1_SIM_LOG_MODIFICACCOD_LOG] PRIMARY KEY CLUSTERED   
( 
 [COD_LOG] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_LOG_PROC_DEP]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_LOG_PROC_DEP](  
 [FECHA] [datetime] NOT NULL,  
 [MSG] [varchar](5000) NULL  
) ON [PRIMARY]  
GO 
 
 
 
/****** Object:   Table [dbo].[SIM_LOG_REACTIVADO]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_LOG_REACTIVADO](  
 [COD_IMPEDIMENTO] [int] NULL,  
 [TIEMPO_PERMISO] [smallint] NULL,  
 [COD_AUTORIDAD] [varchar](5) NULL,  
 [COD_IMPEDIDO] [int] NULL,  
 [COD_PERIODO] [varchar](7) NULL,  
 [FECHA_OFICIO_PERM] [datetime] NULL,  
 [NUM_OFICIO_PERMIS] [smallint] NULL,  
 [FECHA_LEVANTAMI] [datetime] NULL,  
 [FEC_ACTUALIZA] [datetime] NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_LOG_SIN_IMPED]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_LOG_SIN_IMPED](  
 [COD_IMPEDIDO] [int] NULL,  
 [NOMBRE] [varchar](25) NULL,  
 [APELLIDO] [varchar](25) NULL,  
 [FECHA_NACIMIENTO] [datetime] NULL,  
 [COD_ETNIA] [varchar](1) NULL,  
 [COD_PAIS_NACIONAL] [varchar](3) NULL,  
 [ESTATURA] [varchar](10) NULL,  
 [ANO_NAC_APROX] [smallint] NULL,  
 [IND_ALIAS] [bit] NOT NULL,  
 [FOTO] [varchar](50) NULL,  
 [COD_SEXO] [varchar](1) NULL,  
 [COD_COLOR_PIEL] [varchar](1) NULL,  
 [COD_COLOR_OJOS] [varchar](1) NULL,  
 [COD_COLOR_CABELLO] [varchar](1) NULL,  
 [ID] [varchar](14) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MI_CONTROL_FCH]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
 
 
 
GO 
CREATE TABLE [dbo].[SIM_MI_CONTROL_FCH](  
 [LINEA] [int] NOT NULL,  
 [FEC_CONTROL] [datetime] NOT NULL,  
 CONSTRAINT [PK_SIM_MI_CONTROL_FCH] PRIMARY KEY CLUSTERED   
( 
 [LINEA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_ALERTA_SUPERVISOR]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_ALERTA_SUPERVISOR](  
 [COD_BOLETA] [varchar](25) NOT NULL,  
 [NUM_BOLETA] [varchar](7) NULL,  
 [DIGITO] [varchar](1) NULL,  
 [APELLIDO] [varchar](25) NOT NULL,  
 [NOMBRE] [varchar](25) NOT NULL,  
 [NUM_DOC_VIAJE] [varchar](25) NOT NULL,  
 [COD_DOC_VIAJE] [varchar](2) NULL,  
 [ID] [varchar](20) NULL,  
 [FECHA_NACIMIENTO] [datetime] NOT NULL,  
 [COD_SEXO] [varchar](1) NOT NULL,  
 [COD_PAIS_NACIMIEN] [varchar](3) NOT NULL,  
 [COD_CIA_TRANS] [varchar](3) NULL,  
 [VIAJE] [varchar](15) NULL,  
 [TIPO_MOV] [varchar](1) NULL,  
 [APLICACION] [varchar](2) NULL,  
 [contesto] [bit] NOT NULL,  
 [COD_AGENCIA] [varchar](2) NULL,  
 [COD_SECCION] [varchar](2) NULL,  
 [COD_PUESTO] [varchar](2) NULL,  
 [COD_INSPECTOR] [varchar](20) NULL,  
 [FECHA] [datetime] NULL,  
 [HORA] [datetime] NULL,  
 [OBS] [varchar](30) NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL  
) ON [PRIMARY]  
GO 
 
 
 
/****** Object:   Table [dbo].[SIM_MM_ANOMALIA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_ANOMALIA](  
 [REGISTRO] [int] NOT NULL,  
 [COM_AEREA] [varchar](2) NOT NULL,  
 [NUM_VUELO] [varchar](4) NOT NULL,  
 [FEC_VUELO] [datetime] NOT NULL,  
 [PASAPORTE] [varchar](20) NOT NULL,  
 [NACIONAL] [varchar](2) NOT NULL,  
 [COD_IMPEDIDO] [int] NOT NULL,  
 [COD_IMPEDIMENTO] [int] NOT NULL,  
 [APELLIDOS] [varchar](30) NULL,  
 [NOMBRES] [varchar](30) NULL,  
 [SEXO] [varchar](1) NULL,  
 [FEC_NACI] [datetime] NULL,  
 [COD_NACION] [varchar](3) NULL,  
 [CALIFICA] [bit] NOT NULL,  
 [OBSERVACION] [varchar](100) NULL,  
 [COD_ALERTA] [varchar](5) NULL,  
 [COD_ACCION] [varchar](5) NULL,  
 [USU_MODIF] [varchar](20) NULL,  
 [FEC_MODIF] [datetime] NULL,  
 [HORA_MODIF] [datetime] NULL,  
 [COD_DOC_VIAJE] [varchar](2) NULL,  
 [NUM_DOC_VIAJE] [varchar](25) NULL,  
 [COD_TIPO_MOV] [varchar](1) NULL,  
 [IND_LEVANTADO] [bit] NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_AnulacionObs]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS OFF  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_AnulacionObs](  
 [Cod_Boleta] [varchar](25) NOT NULL,  
 [Fec_Actualizacion] [datetime] NOT NULL,  
 [Id_UsuarioModifica] [varchar](20) NULL,  
 [ID_MachineName] [varchar](100) NULL,  
 [Obs_ValorAnterior] [varchar](30) NULL,  
 [Cod_Motivo_Devolucion] [varchar](3) NULL,  
 CONSTRAINT [PK_SIM_MM_AnulacionObs] PRIMARY KEY CLUSTERED   
 
 
 
( 
 [Cod_Boleta] ASC,  
 [Fec_Actualizacion] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_BOLETA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_BOLETA](  
 [COD_BOLETA] [varchar](25) NOT NULL,  
 [NUM_BOLETA] [varchar](7) NULL,  
 [DIGITO] [varchar](1) NULL,  
 [APELLIDO] [varchar](25) NOT NULL,  
 [NOMBRE] [varchar](25) NOT NULL,  
 [NUM_DOC_VIAJE] [varchar](25) NOT NULL,  
 [COD_DOC_VIAJE] [varchar](2) NULL,  
 [COD_TIPO_PASAPORT] [varchar](2) NULL,  
 [COD_PAIS_EXPEDIDO] [varchar](3) NULL,  
 [ID] [varchar](20) NULL,  
 [COD_PAIS_NACIONAL] [varchar](3) NULL,  
 [COD_OCUPACION] [varchar](3) NULL,  
 [FECHA_NACIMIENTO] [datetime] NOT NULL,  
 [COD_SEXO] [varchar](1) NOT NULL,  
 [COD_PAIS_NACIMIEN] [varchar](3) NOT NULL,  
 [COD_PAIS_RESIDEN] [varchar](3) NULL,  
 [COD_MOTIVO_VIAJE] [varchar](1) NULL,  
 [DIR_PREVISTA] [varchar](100) NULL,  
 [COD_PAIS_PROC] [varchar](3) NULL,  
 [COD_CIA_TRANS_ENT] [varchar](3) NULL,  
 [VIAJE_ENTRADA] [varchar](15) NULL,  
 [TIEMPO_ESTADIA_INS] [smallint] NULL,  
 [COD_PAIS_DESTINO] [varchar](3) NULL,  
 [COD_CIA_TRANS_SAL] [varchar](3) NULL,  
 [VIAJE_SALIDA] [varchar](15) NULL,  
 [COD_TIP_VIAJ_ENT] [varchar](3) NULL,  
 [COD_TIPO_VISA] [varchar](2) NULL,  
 [NUMERO_VISA] [varchar](30) NULL,  
 [COD_TIP_VIAJ_SAL] [varchar](3) NULL,  
 [IND_ALTERNADORA] [bit] NOT NULL,  
 [COD_MOTIVO_DEVOLU] [varchar](3) NULL,  
 [TIPO_MOV] [varchar](1) NULL,  
 
 
 
 [APLICACION] [varchar](2) NULL,  
 [CONTROL] [bit] NOT NULL,  
 [ORIGEN_BOLETA] [varchar](1) NULL,  
 [COD_CATEG_ENTRADA] [varchar](1) NULL,  
 [COD_AGENCIA_ENTRA] [varchar](2) NULL,  
 [COD_SECCION_ENTRA] [varchar](2) NULL,  
 [COD_PUESTO_ENTRA] [varchar](2) NULL,  
 [COD_INSPECTOR_ENT] [varchar](20) NULL,  
 [FECHA_ENTRADA] [datetime] NULL,  
 [HORA_ENTRADA] [datetime] NULL,  
 [HITS_ENTRADA] [int] NULL,  
 [PAS_ROB_ENT] [bit] NOT NULL,  
 [OBS_ENTRADA] [varchar](30) NULL,  
 [COD_CATEG_SALIDA] [varchar](1) NULL,  
 [COD_AGENCIA_SALIDA] [varchar](2) NULL,  
 [COD_SECCION_SALIDA] [varchar](2) NULL,  
 [COD_PUESTO_SALIDA] [varchar](2) NULL,  
 [COD_INSPECTOR_SAL] [varchar](20) NULL,  
 [FECHA_SALIDA] [datetime] NULL,  
 [HORA_SALIDA] [datetime] NULL,  
 [HITS_SALIDA] [int] NULL,  
 [PAS_ROB_SAL] [bit] NOT NULL,  
 [OBS_SALIDA] [varchar](30) NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [IND_CAPTURA] [varchar](1) NULL,  
 CONSTRAINT [PKIND_COD_BOLETA_SIM_MM_BOLETA] PRIMARY KEY CLUSTERED   
( 
 [COD_BOLETA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_CAT_SALIDA]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_CAT_SALIDA](  
 [COD_CATEG_SALIDA] [varchar](1) NOT NULL,  
 [NOM_CATEG_SALIDA] [varchar](15) NULL,  
 CONSTRAINT [PKEY1_SIM_MM_CAT_SALIDACOD_CAT] PRIMARY KEY CLUSTERED   
( 
 [COD_CATEG_SALIDA] ASC  
 
 
 
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_DEVOL_PAIS]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_DEVOL_PAIS](  
 [COD_BOLETA] [varchar](25) NOT NULL,  
 [COD_MOTIVO] [varchar](3) NOT NULL,  
 [COD_DOC_VIAJE] [varchar](2) NOT NULL,  
 [VUELO] [varchar](50) NULL,  
 [FECHA_DEVOLUCION] [datetime] NULL,  
 [COD_SUPERVISOR] [varchar](5) NOT NULL,  
 [COD_PAIS_NACIONAL] [varchar](3) NOT NULL,  
 [NUM_DOC_VIAJE] [varchar](25) NOT NULL,  
 [COD_PAIS_PROCEDEN] [varchar](5) NOT NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [COD_CIA_TRANS_SAL] [varchar](2) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_DOC_VIAJE]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_DOC_VIAJE](  
 [COD_DOC_VIAJE] [varchar](2) NOT NULL,  
 [NOM_DOC_VIAJE] [varchar](50) NOT NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 CONSTRAINT [PKEY1_SIM_MM_DOC_VIAJECOD_DOC_] PRIMARY KEY CLUSTERED   
( 
 [COD_DOC_VIAJE] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_ENT_SAL_TR]     Script Date: 16 -05-2025 13:14:43 
******/  
 
 
 
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_ENT_SAL_TR](  
 [COD_BOLETA] [varchar](25) NOT NULL,  
 [NUM_BOLETA] [varchar](7) NULL,  
 [DIGITO] [varchar](1) NULL,  
 [APELLIDO] [varchar](25) NOT NULL,  
 [NOMBRE] [varchar](25) NOT NULL,  
 [NUM_DOC_VIAJE] [varchar](25) NOT NULL,  
 [COD_DOC_VIAJE] [varchar](2) NULL,  
 [COD_TIPO_PASAPORT] [varchar](2) NULL,  
 [COD_PAIS_EXPEDIDO] [varchar](3) NULL,  
 [ID] [varchar](20) NULL,  
 [COD_PAIS_NACIONAL] [varchar](3) NULL,  
 [COD_OCUPACION] [varchar](3) NULL,  
 [FECHA_NACIMIENTO] [datetime] NOT NULL,  
 [COD_SEXO] [varchar](1) NOT NULL,  
 [COD_PAIS_NACIMIEN] [varchar](3) NOT NULL,  
 [COD_PAIS_RESIDEN] [varchar](3) NULL,  
 [COD_MOTIVO_VIAJE] [varchar](1) NULL,  
 [DIR_PREVISTA] [varchar](100) NULL,  
 [COD_PA_PROC_DEST] [varchar](3) NULL,  
 [COD_CIA_TRANS] [varchar](3) NULL,  
 [VIAJE_ENT_SAL] [varchar](15) NULL,  
 [TIEMPO_ESTADIA_INS] [smallint] NULL,  
 [COD_TIPO_VISA] [varchar](3) NULL,  
 [NUMERO_VISA] [varchar](30) NULL,  
 [COD_TIP_VIAJ_SAL] [varchar](3) NULL,  
 [IND_ALTERNADORA] [bit] NOT NULL,  
 [COD_MOTIVO_DEVOLU] [varchar](3) NULL,  
 [TIPO_MOV] [varchar](1) NOT NULL,  
 [APLICACION] [varchar](2) NULL,  
 [CONTROL] [bit] NOT NULL,  
 [ORIGEN_BOLETA] [varchar](1) NULL,  
 [COD_CATEG] [varchar](1) NULL,  
 [COD_AGENCIA] [varchar](2) NULL,  
 [COD_SECCION] [varchar](2) NULL,  
 [COD_PUESTO] [varchar](2) NULL,  
 [COD_INSPECTOR] [varchar](20) NULL,  
 [FECHA_ENT_SAL] [datetime] NULL,  
 [HORA_ENT_SAL] [datetime] NULL,  
 [HITS_ENT_SAL] [int] NULL,  
 [PAS_ROB_ENT_SAL] [bit] NOT NULL,  
 [OBS_ENT_SAL] [varchar](30) NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 
 
 
 [FEC_ACTUALIZA] [datetime] NULL,  
 [IND_CAPTURA] [varchar](1) NULL,  
 [COD_CATEG_SAL] [varchar](1) NULL,  
 CONSTRAINT [PKIND_ENT_SAL_SIM_MM_ENT_SAL_T] PRIMARY KEY CLUSTERED   
( 
 [COD_BOLETA] ASC,  
 [TIPO_MOV] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_EST_VUELO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_EST_VUELO](  
 [COD_ESTADO] [varchar](1) NOT NULL,  
 [NOM_ESTADO] [varchar](25) NULL,  
 CONSTRAINT [PKIND_ESTADO_SIM_MM_EST_VUELOC] PRIMARY KEY CLUSTERED   
( 
 [COD_ESTADO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_ETNIA]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_ETNIA](  
 [COD_ETNIA] [varchar](1) NOT NULL,  
 [NOM_ETNIA] [varchar](20) NOT NULL,  
 CONSTRAINT [PKEY1_SIM_MM_ETNIACOD_ETNIA_] PRIMARY KEY CLUSTERED   
( 
 [COD_ETNIA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_IMAGEN_HUELLAS]     Script Date: 16 -05-2025 
13:14:43 ******/  
 
 
 
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_IMAGEN_HUELLAS](  
 [NUM_PASAPORTE] [varchar](25) NOT NULL,  
 [NACIONALIDAD] [varchar](3) NOT NULL,  
 [DER_DEDOPULGAR] [image] NULL,  
 [DER_DEDOINDICE] [image] NULL,  
 [DER_DEDOMEDIO] [image] NULL,  
 [DER_DEDOANULAR] [image] NULL,  
 [DER_DEDOMENIQUE] [image] NULL,  
 [IZQ_DEDOPULGAR] [image] NULL,  
 [IZQ_DEDOINDICE] [image] NULL,  
 [IZQ_DEDOMEDIO] [image] NULL,  
 [IZQ_DEDOANULAR] [image] NULL,  
 [IZQ_DEDOMENIQUE] [image] NULL,  
 [MANODERECHA] [image] NULL,  
 [MANOIZQUIERDA] [image] NULL,  
 [PULGARES] [image] NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [TIPOARCHIVO] [varchar](5) NULL,  
 CONSTRAINT [PK_SIM_MM_IMAGEN_HUELLAS] PRIMARY KEY CLUSTERED   
( 
 [NUM_PASAPORTE] ASC,  
 [NACIONALIDAD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_IMAGEN_PASAPORTE]     Script Date: 16 -05-
2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_IMAGEN_PASAPORTE](  
 [NUM_PASAPORTE] [varchar](25) NULL,  
 [NACIONALIDAD] [varchar](3) NULL,  
 [ID] [int] IDENTITY(1,1) NOT NULL,  
 [COD_BOLETA] [varchar](25) NULL,  
 [IMAGEN_PASAPORTE] [image] NULL,  
 [FOTO] [image] NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 
 
 
 [TIPOARCHIVO] [varchar](5) NULL,  
 CONSTRAINT [PK__SIM_MM_IMAGEN_PA__0C7331B9] PRIMARY KEY CLUSTERED   
( 
 [ID] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_LISTA_SOSP]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_LISTA_SOSP](  
 [COD_IMPEDIDO] [int] NULL,  
 [NOMBRE] [varchar](25) NULL,  
 [APELLIDO] [varchar](25) NULL,  
 [ETNIA] [varchar](20) NULL,  
 [ESTATURA] [varchar](10) NULL,  
 [EDAD] [tinyint] NULL,  
 [SEXO] [varchar](9) NULL,  
 [PIEL] [varchar](15) NULL,  
 [OJOS] [varchar](20) NULL,  
 [CABELLO] [varchar](15) NULL,  
 [COD_BOLETA] [varchar](25) NOT NULL,  
 [CALIFICA] [bit] NOT NULL,  
 [COD_SOSPECHOSO] [int] NOT NULL,  
 [COD_ALERTA] [varchar](5) NULL,  
 [COD_ACCION] [varchar](5) NULL,  
 [IND_ALIAS] [bit] NOT NULL,  
 [FECHA_NACIMIENTO] [datetime] NULL,  
 [COD_PAIS_NACIONAL] [varchar](3) NULL,  
 [TIPO_MOV] [varchar](1) NOT NULL,  
 [TIPO_ALERTA] [varchar](1) NULL,  
 [APLICACION] [varchar](2) NOT NULL,  
 [ALERTA] [varchar](80) NULL,  
 [ACCION] [varchar](50) NULL,  
 CONSTRAINT [PKIND_MM_LISTA_SOSP_SIM_MM_LIS] PRIMARY KEY CLUSTERED   
( 
 [COD_BOLETA] ASC,  
 [TIPO_MOV] ASC,  
 [COD_SOSPECHOSO] ASC,  
 [APLICACION] ASC  
 
 
 
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_MOT_VIAJE]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_MOT_VIAJE](  
 [COD_MOTIVO_VIAJE] [varchar](1) NOT NULL,  
 [NOM_MOTIVO_VIAJE] [varchar](100) NOT NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 CONSTRAINT [PKEY1_SIM_MM_MOT_VIAJECOD_MOTI] PRIMARY KEY CLUSTERED   
( 
 [COD_MOTIVO_VIAJE] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_MOVIS]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_MOVIS](  
 [COD_BOLETA] [varchar](25) NOT NULL,  
 [NUM_BOLETA] [varchar](7) NULL,  
 [DIGITO] [varchar](1) NULL,  
 [APELLIDO] [varchar](25) NOT NULL,  
 [NOMBRE] [varchar](25) NOT NULL,  
 [NUM_DOC_VIAJE] [varchar](25) NOT NULL,  
 [COD_DOC_VIAJE] [varchar](2) NULL,  
 [COD_TIPO_PASAPORT] [varchar](2) NULL,  
 [COD_PAIS_EXPEDIDO] [varchar](3) NULL,  
 [ID] [varchar](20) NULL,  
 [COD_PAIS_NACIONAL] [varchar](3) NULL,  
 [COD_OCUPACION] [varchar](3) NULL,  
 [FECHA_NACIMIENTO] [datetime] NOT NULL,  
 [COD_SEXO] [varchar](1) NOT NULL,  
 [COD_PAIS_NACIMIEN] [varchar](3) NOT NULL,  
 [COD_PAIS_RESIDEN] [varchar](3) NULL,  
 
 
 
 [COD_MOTIVO_VIAJE] [varchar](1) NULL,  
 [DIR_PREVISTA] [varchar](100) NULL,  
 [COD_PA_PROC_DEST] [varchar](3) NULL,  
 [COD_CIA_TRANS] [varchar](3) NULL,  
 [VIAJE_ENT_SAL] [varchar](15) NULL,  
 [TIEMPO_ESTADIA_INS] [smallint] NULL,  
 [COD_TIPO_VISA] [varchar](3) NULL,  
 [NUMERO_VISA] [varchar](30) NULL,  
 [COD_TIP_VIAJ_SAL] [varchar](3) NULL,  
 [IND_ALTERNADORA] [bit] NOT NULL,  
 [COD_MOTIVO_DEVOLU] [varchar](3) NULL,  
 [TIPO_MOV] [varchar](1) NOT NULL,  
 [APLICACION] [varchar](2) NULL,  
 [CONTROL] [bit] NOT NULL,  
 [ORIGEN_BOLETA] [varchar](1) NULL,  
 [COD_CATEG] [varchar](1) NULL,  
 [COD_AGENCIA] [varchar](2) NULL,  
 [COD_SECCION] [varchar](2) NULL,  
 [COD_PUESTO] [varchar](2) NULL,  
 [COD_INSPECTOR] [varchar](20) NULL,  
 [FECHA_ENT_SAL] [datetime] NULL,  
 [HORA_ENT_SAL] [datetime] NULL,  
 [HITS_ENT_SAL] [int] NULL,  
 [PAS_ROB_ENT_SAL] [bit] NOT NULL,  
 [OBS_ENT_SAL] [varchar](30) NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [IND_CAPTURA] [varchar](1) NULL,  
 [COD_CATEG_SAL] [varchar](1) NULL,  
 CONSTRAINT [PKIND_ENT_SAL_SIM_MM_MOVIS] PRIMARY KEY CLUSTERED   
( 
 [COD_BOLETA] ASC,  
 [TIPO_MOV] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_PASAJERO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_PASAJERO](  
 [REGISTRO] [int] IDENTITY(1473000,1) NOT NULL,  
 [COM_AEREA] [varchar](2) NOT NULL,  
 
 
 
 [NUM_VUELO] [varchar](4) NOT NULL,  
 [FEC_VUELO] [datetime] NOT NULL,  
 [PASAPORTE] [varchar](20) NOT NULL,  
 [NACIONAL] [varchar](2) NOT NULL,  
 [APELLIDOS] [varchar](30) NOT NULL,  
 [NOMBRES] [varchar](30) NOT NULL,  
 [FEC_NACI] [varchar](10) NOT NULL,  
 [SEXO] [varchar](1) NOT NULL,  
 [TIPO_P] [varchar](5) NULL,  
 [PA_ORIGEN] [varchar](2) NULL,  
 [CIU_ORIGEN] [varchar](3) NULL,  
 [PA_DESTINO] [varchar](2) NULL,  
 [CIU_DESTINO] [varchar](3) NULL,  
 [EST_PASAJ] [bit] NULL,  
 [EST_ANOM] [bit] NULL,  
 [USU_MODIF] [varchar](20) NULL,  
 [FEC_MODIF] [datetime] NULL,  
 [HORA_MODIF] [datetime] NULL,  
 [ref] [varchar](20) NULL,  
 [cod_impedido] [int] NULL,  
 CONSTRAINT [PK_SIM_MM_PASAJERO] PRIMARY KEY CLUSTERED   
( 
 [COM_AEREA] ASC,  
 [NUM_VUELO] ASC,  
 [FEC_VUELO] ASC,  
 [PASAPORTE] ASC,  
 [NACIONAL] ASC,  
 [APELLIDOS] ASC,  
 [NOMBRES] ASC,  
 [FEC_NACI] ASC,  
 [SEXO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_PERIODO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_PERIODO](  
 [COD_PERIODO] [varchar](1) NOT NULL,  
 [NOM_PERIODO] [varchar](10) NULL,  
 CONSTRAINT [PKEY_SIM_MM_PERIODO] PRIMARY KEY NONCLUSTERED   
( 
 
 
 
 [COD_PERIODO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_PERMIS_ENT]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_PERMIS_ENT](  
 [COD_DOC_VIAJE] [varchar](2) NOT NULL,  
 [NUM_DOC_VIAJE] [varchar](25) NOT NULL,  
 [COD_PAIS_NACIMIEN] [varchar](3) NOT NULL,  
 [COD_BOLETA] [varchar](25) NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [COD_IMPEDIDO] [int] NULL,  
 [FECHA_ENTRADA] [datetime] NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_PRODUC]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_PRODUC](  
 [USER_ID] [varchar](20) NOT NULL,  
 [FEC_CAPTURA] [datetime] NOT NULL,  
 [CANT_BOLETAS] [smallint] NULL,  
 CONSTRAINT [PKIND_MM_PRODUC_SIM_MM_PRODUCU] PRIMARY KEY CLUSTERED   
( 
 [USER_ID] ASC,  
 [FEC_CAPTURA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_PROGRAMADO]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
 
 
 
GO 
CREATE TABLE [dbo].[SIM_MM_PROGRAMADO](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FECHA] [datetime] NOT NULL,  
 [HORA_ENTRADA] [varchar](2) NOT NULL,  
 [MINUTO_ENTRADA] [varchar](2) NOT NULL,  
 [HORA_SALIDA] [varchar](2) NOT NULL,  
 [HORA_ULT_ENTRADA] [varchar](2) NULL,  
 [MINUTO_SALIDA] [varchar](2) NOT NULL,  
 [MINUTO_ULT_ENTRADA] [varchar](2) NULL,  
 [HORA_ULT_SALIDA] [varchar](2) NULL,  
 [MINUTO_ULT_SALIDA] [varchar](2) NULL,  
 [COD_PUESTO] [varchar](2) NOT NULL,  
 CONSTRAINT [PKEY1_SIM_MM_PROGRAMADOIDENTIF] PRIMARY KEY CLUSTERED   
( 
 [IDENTIFICA_EMPL] ASC,  
 [FECHA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_SAL_CONTRO]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_SAL_CONTRO](  
 [COD_DOC_VIAJE] [varchar](2) NOT NULL,  
 [NUM_DOC_VIAJE] [varchar](25) NOT NULL,  
 [COD_PAIS_NACIMIEN] [varchar](3) NOT NULL,  
 [COD_BOLETA] [varchar](25) NOT NULL,  
 [FECHA_SALIDA] [datetime] NULL,  
 [ID_USUARIO] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [COD_IMPEDIDO] [int] NULL,  
 CONSTRAINT [PKEY1_SIM_MM_SAL_CONTROCOD_BOL] PRIMARY KEY CLUSTERED   
( 
 [COD_BOLETA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_TIP_PASJ]     Script Date: 16 -05-2025 13:14:43 
******/  
 
 
 
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_TIP_PASJ](  
 [COD_TIPASJ] [varchar](3) NOT NULL,  
 [NOM_TIPASJ] [varchar](20) NULL,  
 CONSTRAINT [PK_SIM_MM_TIP_PASJ] PRIMARY KEY CLUSTERED   
( 
 [COD_TIPASJ] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_TIP_VIAJ]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_TIP_VIAJ](  
 [COD_TIP_VIAJERO] [varchar](3) NOT NULL,  
 [DES_TIP_VIAJERO] [varchar](30) NULL,  
 CONSTRAINT [PK_SIM_MM_TIP_VIAJ] PRIMARY KEY CLUSTERED   
( 
 [COD_TIP_VIAJERO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_TIPO_MOV]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_TIPO_MOV](  
 [COD_TIPMOV] [varchar](1) NOT NULL,  
 [NOM_TIPMOV] [varchar](10) NULL,  
 CONSTRAINT [PKIND_TIPOMOV_SIM_MM_TIPO_MOVC] PRIMARY KEY CLUSTERED   
( 
 [COD_TIPMOV] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
 
 
 
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_TIPO_PASAP]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_TIPO_PASAP](  
 [COD_PASAPORTE] [varchar](2) NOT NULL,  
 [NOM_PASAPORTE] [varchar](100) NOT NULL,  
 CONSTRAINT [PKEY1_SIM_MM_TIPO_PASAPCOD_PAS] PRIMARY KEY CLUSTERED   
( 
 [COD_PASAPORTE] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_TmpConsultaMM]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_TmpConsultaMM](  
 [IDBusqueda] [varchar](100) NOT NULL,  
 [ID_Usuario] [int] NOT NULL,  
 [IndexPasajero] [int] IDENTITY(1,1) NOT NULL,  
 [Nombre] [varchar](30) NOT NULL,  
 [Apellido] [varchar](30) NOT NULL,  
 [Pasaporte] [varchar](25) NOT NULL,  
 [Fecha_Nacimiento] [datetime] NOT NULL,  
 [Nacionalidad] [varchar](3) NULL,  
 [Num_Vuelo] [varchar](15) NOT NULL,  
 [Comp_Aerea] [varchar](3) NULL,  
 [Fecha_Vuelo] [datetime] NULL,  
 [Tipo_Mov] [varchar](1) NOT NULL,  
 [Hora] [datetime] NULL,  
 [Cod_Agencia] [varchar](2) NULL,  
 [Pa_Origen] [varchar](2) NULL,  
 [Ciu_Origen] [varchar](3) NULL,  
 [Pa_Destino] [varchar](2) NULL,  
 [Ciu_Destino] [varchar](3) NULL,  
 [Tipo_Pasajero] [varchar](3) NULL,  
 [Genero] [varchar](1) NULL,  
 [Cod_Boleta] [varchar](25) NULL,  
 
 
 
 [Name_App] [varchar](2) NOT NULL,  
 [Cod_Seccion] [varchar](2) NULL,  
 [Cod_Puesto] [varchar](2) NULL,  
 [Cod_Inspector] [varchar](20) NULL,  
 [Fec_Actualiza] [varchar](50) NULL,  
 CONSTRAINT [PK_SIM_MM_TmpConsultaMM] PRIMARY KEY CLUSTERED   
( 
 [IDBusqueda] ASC,  
 [ID_Usuario] ASC,  
 [IndexPasajero] ASC,  
 [Name_App] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_UBICACION]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_UBICACION](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FECHA] [datetime] NOT NULL,  
 [HORA_ENTRADA] [varchar](2) NOT NULL,  
 [MINUTO_ENTRADA] [varchar](2) NOT NULL,  
 [HORA_SALIDA] [varchar](2) NOT NULL,  
 [MINUTO_SALIDA] [varchar](2) NULL,  
 [COD_PUESTO] [varchar](2) NOT NULL,  
 CONSTRAINT [PKEY1_SIM_MM_UBICACIONIDENTIFI] PRIMARY KEY CLUSTERED   
( 
 [IDENTIFICA_EMPL] ASC,  
 [FECHA] ASC,  
 [HORA_ENTRADA] ASC,  
 [MINUTO_ENTRADA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_VIAJES]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
 
 
 
CREATE TABLE [dbo].[SIM_MM_VIAJES](  
 [NOMBRE_ARCHIVO] [varchar](80) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_MM_VUELO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_MM_VUELO](  
 [COM_AEREA] [varchar](2) NOT NULL,  
 [NUM_VUELO] [varchar](4) NOT NULL,  
 [FEC_VUELO] [datetime] NOT NULL,  
 [HORA_VUELO] [varchar](6) NULL,  
 [TIPO_MOV] [varchar](1) NULL,  
 [PA_ORIGEN] [varchar](2) NULL,  
 [CIU_ORIGEN] [varchar](3) NULL,  
 [PA_ESCALA] [varchar](2) NULL,  
 [CIU_ESCALA] [varchar](3) NULL,  
 [PA_DESTINO] [varchar](2) NULL,  
 [CIU_DESTINO] [varchar](3) NULL,  
 [EST_VUELO] [varchar](1) NULL,  
 [USU_MODIF] [varchar](20) NULL,  
 [FEC_MODIF] [datetime] NULL,  
 [HORA_MODIF] [datetime] NULL,  
 [FEC_SAL_V] [datetime] NULL,  
 [HORA_SAL_V] [datetime] NULL,  
 [USU_SAL] [varchar](20) NULL,  
 [FEC_SAL] [datetime] NULL,  
 [HORA_SAL] [datetime] NULL,  
 [EST_MOV_MIG] [bit] NULL,  
 [OBSERVACION] [varchar](50) NULL,  
 [EST_ANOM_V] [bit] NULL,  
 [EST_CONFIR_V] [bit] NULL,  
 CONSTRAINT [PKIND_VUELO_SIM_MM_VUELOCOM_AE] PRIMARY KEY CLUSTERED   
( 
 [COM_AEREA] ASC,  
 [NUM_VUELO] ASC,  
 [FEC_VUELO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PARAM_PROC_DEP]     Script Date: 16 -05-2025 
13:14:43 ******/  
 
 
 
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PARAM_PROC_DEP](  
 [TIPO_PARAM] [varchar](10) NOT NULL,  
 [VAL_PARAM] [varchar](10) NOT NULL,  
 CONSTRAINT [PKkey_modificacion_SIM_PARAM_PROC_DEP] PRIMARY KEY 
CLUSTERED   
( 
 [TIPO_PARAM] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PARAM_WS]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PARAM_WS](  
 [usuario] [varchar](50) NULL,  
 [user_pass] [varchar](50) NULL,  
 [dir_ws] [varchar](1000) NOT NULL,  
 [process_id] [varchar](32) NULL,  
 [task_id] [varchar](50) NULL,  
 [id] [int] IDENTITY(1,1) NOT NULL,  
 [jefe] [nchar](200) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_ACCION_APL]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_ACCION_APL](  
 [NUM_ACCION_APL] [int] NOT NULL,  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FEC_APLICACION] [datetime] NOT NULL,  
 [COD_TIP_ACCION] [varchar](3) NULL,  
 [NUM_RESUELTO] [varchar](5) NULL,  
 [FEC_RESUELTO] [datetime] NULL,  
 [AUTOR_NOMINADOR] [varchar](50) NULL,  
 [COD_MOT_RETIRO] [varchar](2) NULL,  
 
 
 
 [NUM_ACTA_DEFUNC] [varchar](10) NULL,  
 [NOM_EXPEDIDOR] [varchar](20) NULL,  
 [FEC_DEFUNCION] [datetime] NULL,  
 [CAUSAL_HECHO] [varchar](30) NULL,  
 [CAUSAL_DERECHO] [varchar](30) NULL,  
 [COD_CARGO_ANT] [varchar](10) NULL,  
 [POS_PLANILLA_ANT] [varchar](10) NULL,  
 [SALARIO_ANT] [numeric](8, 2) NULL,  
 [COD_PART_PRE_ANT] [varchar](30) NULL,  
 [COD_TIP_ASCENSO] [varchar](2) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [COD_CARGO_ACT] [varchar](10) NULL,  
 [POS_PLANILLA_ACT] [varchar](10) NULL,  
 [SALARIO_ACT] [numeric](8, 2) NULL,  
 [COD_PART_PRE_ACT] [varchar](30) NULL,  
 [OBSERVACIONES] [varchar](50) NULL,  
 [COD_AGENCIA_ANT] [varchar](2) NULL,  
 [COD_SECCION_ANT] [varchar](2) NULL,  
 [COD_AGENCIA_ACT] [varchar](2) NULL,  
 [COD_SECCION_ACT] [varchar](2) NULL,  
 [COD_FUNCION_ANT] [varchar](10) NULL,  
 [COD_FUNCION_ACT] [varchar](10) NULL,  
 [COD_PRE_ACCION] [varchar](3) NULL,  
 [NUM_PRE_ACCION] [int] NULL,  
 [FEC_PRE_ACCION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_ACCION_APL_SIM_PE_ACCI] PRIMARY KEY CLUSTERED   
( 
 [NUM_ACCION_APL] ASC,  
 [IDENTIFICA_EMPL] ASC,  
 [FEC_APLICACION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_ACU_ASISTE]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_ACU_ASISTE](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [MES_PROCESO] [varchar](2) NOT NULL,  
 [HORA_LABORADAS] [smallint] NULL,  
 [HORA_AUS_AUTORIZA] [smallint] NULL,  
 
 
 
 [HORA_AUS_NO_AUT] [smallint] NULL,  
 [HORA_FERIADOS] [smallint] NULL,  
 [HORAS_VACACION] [smallint] NULL,  
 [HORA_LABORA_REAL] [smallint] NULL,  
 [DIF_HORA_LAB_REAL] [smallint] NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_ACU_ASISTE_SIM_PE_ACU_] PRIMARY KEY CLUSTERED   
( 
 [IDENTIFICA_EMPL] ASC,  
 [MES_PROCESO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_ACUM_VACAC]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_ACUM_VACAC](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [CANT_PEN_DIAS_VC] [smallint] NULL,  
 [FEC_VACACION] [datetime] NULL,  
 [CANT_AC_GANADA_VC] [smallint] NULL,  
 [CANT_TOM_MESES_VC] [smallint] NULL,  
 [OBSERVACIONES] [varchar](50) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [CANT_TOM_DIAS_VC] [smallint] NULL,  
 [SUM_PEN_DIAS_VC] [smallint] NULL,  
 [CAN_PEN_MESES_VC] [smallint] NULL,  
 [SUM_PEN_MESES_VC] [smallint] NULL,  
 CONSTRAINT [PKPE_PK_ACUM_VACAC_SIM_PE_ACUM] PRIMARY KEY CLUSTERED   
( 
 [IDENTIFICA_EMPL] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_AMONEST]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
 
 
 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_AMONEST](  
 [COD_TIP_AMONESTA] [varchar](2) NOT NULL,  
 [NOM_TIP_AMONESTA] [varchar](20) NULL,  
 CONSTRAINT [PKPE_PK_VAMONESTA_SIM_PE_AMONE] PRIMARY KEY CLUSTERED   
( 
 [COD_TIP_AMONESTA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_AMONESTA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_AMONESTA](  
 [NUM_AMONESTACION] [int] NOT NULL,  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FEC_APLICACION] [datetime] NOT NULL,  
 [NUM_RESUELTO] [varchar](5) NULL,  
 [FEC_RESUELTO] [datetime] NULL,  
 [COD_TIP_AMONESTA] [varchar](2) NULL,  
 [OBSERVACIONES] [varchar](50) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_AMONESTA_SIM_PE_AMONES] PRIMARY KEY CLUSTERED   
( 
 [NUM_AMONESTACION] ASC,  
 [IDENTIFICA_EMPL] ASC,  
 [FEC_APLICACION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_AUDITORIA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_AUDITORIA](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 
 
 
 [FEC_CAMBIO] [datetime] NOT NULL,  
 [FEC_INGRESO] [datetime] NULL,  
 [USER_ID] [varchar](20) NULL,  
 [OBSERVACION] [varchar](50) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_AUSENC]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_AUSENC](  
 [COD_TIP_AUSENCIA] [varchar](2) NOT NULL,  
 [NOM_TIP_AUSENCIA] [varchar](20) NULL,  
 CONSTRAINT [PKPE_PK_VAUSENC_SIM_PE_AUSENCC] PRIMARY KEY CLUSTERED   
( 
 [COD_TIP_AUSENCIA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_AUSENCIAS]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_AUSENCIAS](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FEC_AUSENCIA] [datetime] NOT NULL,  
 [NUM_SEC_AUSENCIA] [int] NOT NULL,  
 [COD_TIP_AUSENCIA] [varchar](2) NULL,  
 [COD_TIP_JUSTIFICA] [varchar](2) NULL,  
 [COD_MOT_AUSENCIA] [varchar](3) NULL,  
 [REPORTADO] [varchar](20) NULL,  
 [USER_ID] [varchar](17) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [HORAS_TARDE] [varchar](2) NULL,  
 [MINUTOS_TARDE] [varchar](2) NULL,  
 [TR_TOMADO] [smallint] NULL,  
 [TR_TOMADO_ANT] [smallint] NULL,  
 [CONT_CAMBIO_TR] [smallint] NULL,  
 [IND_DESC_DIA] [bit] NOT NULL,  
 [IND_ORIG_AUS] [bit] NOT NULL,  
 [TIPO_SALDO] [varchar](1) NULL,  
 
 
 
 [COD_TIP_COMPENSA] [varchar](2) NULL,  
 [COD_ESTADO] [varchar](2) NULL,  
 CONSTRAINT [PKPE_PK_AUSENCIAS_SIM_PE_AUSEN] PRIMARY KEY CLUSTERED   
( 
 [IDENTIFICA_EMPL] ASC,  
 [FEC_AUSENCIA] ASC,  
 [NUM_SEC_AUSENCIA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_CALEN_FER]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_CALEN_FER](  
 [FEC_FERIADO] [datetime] NOT NULL,  
 [NOM_FERIADO] [varchar](50) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_CALEN_FER_SIM_PE_CALEN] PRIMARY KEY CLUSTERED   
( 
 [FEC_FERIADO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_CARGO_PL]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_CARGO_PL](  
 [COD_CARGO] [varchar](10) NOT NULL,  
 [NOM_CARGO] [varchar](40) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK__SIM_PE_CARGO_PLCOD_CA] PRIMARY KEY CLUSTERED   
( 
 [COD_CARGO] ASC  
 
 
 
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_CARRERA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_CARRERA](  
 [COD_CARRERA] [varchar](1) NOT NULL,  
 [NOM_CARRERA] [varchar](2) NULL,  
 CONSTRAINT [PKPE_PK_VCARRERA_SIM_PE_CARRER] PRIMARY KEY CLUSTERED   
( 
 [COD_CARRERA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_COMP_AUSEN]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_COMP_AUSEN](  
 [NUM_COMPENSACION] [int] NOT NULL,  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FEC_AUSENCIA] [datetime] NOT NULL,  
 [NUM_SEC_AUSENCIA] [smallint] NOT NULL,  
 [COD_TIP_AUSENCIA] [varchar](2) NULL,  
 [COD_TIP_JUSTIFICA] [varchar](2) NULL,  
 [COD_MOT_AUSENCIA] [varchar](50) NULL,  
 [REPORTADO] [varchar](20) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [COD_TIP_COMPENSA] [varchar](2) NULL,  
 CONSTRAINT [PKPE_PK_COMP_AUSEN_SIM_PE_COMP] PRIMARY KEY CLUSTERED   
( 
 [NUM_COMPENSACION] ASC,  
 [IDENTIFICA_EMPL] ASC,  
 [FEC_AUSENCIA] ASC,  
 [NUM_SEC_AUSENCIA] ASC  
 
 
 
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_CRI_EVALUA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_CRI_EVALUA](  
 [COD_CRITERIO] [varchar](3) NOT NULL,  
 [NOM_CRITERIO] [varchar](100) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_EVALUA_SIM_PE_CRI_EVAL] PRIMARY KEY CLUSTERED   
( 
 [COD_CRITERIO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_DE_CARRERA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_DE_CARRERA](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FEC_DESDE] [datetime] NOT NULL,  
 [FEC_HASTA] [datetime] NOT NULL,  
 [CARGO_DESEMPENO] [varchar](10) NULL,  
 [EMPRESA] [varchar](50) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [PUESTO_DESEMP] [varchar](50) NULL,  
 CONSTRAINT [PKPE_PK_DE_CARRERA_SIM_PE_DE_C] PRIMARY KEY CLUSTERED   
( 
 [IDENTIFICA_EMPL] ASC,  
 [FEC_DESDE] ASC,  
 [FEC_HASTA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
 
 
 
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_DEPENDIEN]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_DEPENDIEN](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [IDENTIFICA_DEP] [varchar](20) NOT NULL,  
 [COD_PARENTESCO] [varchar](3) NULL,  
 [NOM_DEP] [varchar](20) NULL,  
 [APE_DEP] [varchar](20) NULL,  
 [SEXO] [varchar](1) NULL,  
 [FEC_NACIMIENTO] [datetime] NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_DEPENDIEN_SIM_PE_DEPEN] PRIMARY KEY CLUSTERED   
( 
 [IDENTIFICA_EMPL] ASC,  
 [IDENTIFICA_DEP] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_DET_EVALUA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_DET_EVALUA](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FEC_A_EVALUAR] [datetime] NOT NULL,  
 [COD_CRITERIO] [varchar](3) NOT NULL,  
 [COD_CALIFICA] [varchar](2) NULL,  
 [NOTAS_ADICIONALES] [varchar](50) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_DET_EVALUA_SIM_PE_DET_] PRIMARY KEY CLUSTERED   
( 
 [IDENTIFICA_EMPL] ASC,  
 [FEC_A_EVALUAR] ASC,  
 [COD_CRITERIO] ASC  
 
 
 
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_DIA]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_DIA](  
 [COD_DIA] [varchar](2) NULL,  
 [NOM_DIA] [varchar](15) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_EDUCACION]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_EDUCACION](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [COD_TIP_ESCOLAR] [varchar](2) NOT NULL,  
 [ESPECIALIZACION] [varchar](50) NOT NULL,  
 [FEC_HASTA] [datetime] NOT NULL,  
 [FEC_DESDE] [datetime] NULL,  
 [NOM_INSTITUTO] [varchar](30) NULL,  
 [GRADUADO] [bit] NOT NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_EDUCACION_SIM_PE_EDUCA] PRIMARY KEY CLUSTERED   
( 
 [IDENTIFICA_EMPL] ASC,  
 [COD_TIP_ESCOLAR] ASC,  
 [ESPECIALIZACION] ASC,  
 [FEC_HASTA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_EMPLEADO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
 
 
 
GO 
CREATE TABLE [dbo].[SIM_PE_EMPLEADO](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [NOM_EMPL_PRIMERO] [varchar](15) NULL,  
 [NOM_EMPL_SEGUNDO] [varchar](15) NULL,  
 [APE_EMPL_PATERNO] [varchar](15) NULL,  
 [APE_EMPL_MATERNO] [varchar](15) NULL,  
 [APE_EMPL_CASADA] [varchar](15) NULL,  
 [SEGURO_SOCIAL] [varchar](20) NULL,  
 [ESTADO_CIVIL] [varchar](1) NOT NULL,  
 [FEC_NACIMIENTO] [datetime] NULL,  
 [LUGAR_NACIMIENTO] [varchar](50) NULL,  
 [TEL_CASA] [varchar](8) NULL,  
 [DIR_CASA] [varchar](100) NULL,  
 [DIR_POSTAL] [varchar](32) NULL,  
 [DIR_CORREO] [varchar](50) NULL,  
 [NOM_PER_EMERG] [varchar](50) NULL,  
 [TEL_PER_EMERG] [varchar](8) NULL,  
 [ALERGIA_EMPL] [varchar](50) NULL,  
 [TIPO_SANGRE] [varchar](3) NULL,  
 [NOM_PADRE] [varchar](40) NULL,  
 [NOM_MADRE] [varchar](40) NULL,  
 [NOM_CONYUGUE] [varchar](40) NULL,  
 [DIR_TRA_CONYUGUE] [varchar](60) NULL,  
 [FEC_INGRESO] [datetime] NULL,  
 [FEC_SALIDA] [datetime] NULL,  
 [TIPO_CARRERA] [varchar](1) NULL,  
 [TIPO_NOMBRAMIENTO] [varchar](1) NULL,  
 [POSICION_PLANILLA] [varchar](10) NULL,  
 [COD_CARGO] [varchar](2) NULL,  
 [COD_FUNCION] [varchar](10) NULL,  
 [NUM_ENTIDAD] [varchar](3) NULL,  
 [NUM_PLANILLA] [varchar](4) NULL,  
 [NUM_RESUELTO] [varchar](5) NULL,  
 [FEC_RESUELTO] [datetime] NULL,  
 [COD_PART_PRESUP] [varchar](30) NULL,  
 [TIPO_HORARIO] [varchar](1) NOT NULL,  
 [HORARIO_ENTRADA] [varchar](2) NULL,  
 [HORARIO_SALIDA] [varchar](2) NULL,  
 [COD_TIP_CUENTA] [varchar](1) NULL,  
 [NUM_CUENTA_BAN] [varchar](15) NULL,  
 [COD_BANCO] [varchar](3) NULL,  
 [SALARIO] [numeric](8, 2) NULL,  
 [FEC_PER_ACTUAL] [datetime] NULL,  
 [CAN_DIA_AUSENCIA] [smallint] NULL,  
 [CANT_HOR_TARDANZA] [smallint] NULL,  
 [ESTADO_EMPL] [varchar](2) NOT NULL,  
 
 
 
 [USER_ID] [varchar](17) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [COD_MINU_ENTRADA] [varchar](2) NULL,  
 [COD_MINU_SALIDA] [varchar](2) NULL,  
 [SEXO] [varchar](1) NOT NULL,  
 [DIR_BEEPER] [varchar](50) NULL,  
 [COD_AGENCIA] [varchar](2) NULL,  
 [COD_SECCION] [varchar](2) NULL,  
 [COD_UNID_ADMINIST] [varchar](3) NULL,  
 [COD_ULT_ACCION] [varchar](3) NULL,  
 [NUM_ULT_ACCION] [int] NULL,  
 [FEC_ULT_ACCION] [datetime] NULL,  
 [FEC_PER_INIC] [datetime] NULL,  
 [TIEMPO_X_DIA] [smallint] NULL,  
 [TIEMPO_COM] [smallint] NULL,  
 [HORA_ENTRA_COM] [varchar](2) NULL,  
 [MINUTO_ENTRA_COM] [varchar](2) NULL,  
 [HORA_SAL_COM] [varchar](2) NULL,  
 [MINUTO_SAL_COM] [varchar](2) NULL,  
 [FEC_INIC_NVO_PER] [datetime] NULL,  
 [TIPO_CONTRIB] [varchar](1) NULL,  
 [NUM_DEPEN] [smallint] NULL,  
 CONSTRAINT [PK_SIM_PE_EMPLEADO] PRIMARY KEY CLUSTERED   
( 
 [IDENTIFICA_EMPL] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_EMPLEADO_VIEJO]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_EMPLEADO_VIEJO](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [NOM_EMPL_PRIMERO] [varchar](15) NULL,  
 [NOM_EMPL_SEGUNDO] [varchar](15) NULL,  
 [APE_EMPL_PATERNO] [varchar](15) NULL,  
 [APE_EMPL_MATERNO] [varchar](15) NULL,  
 [APE_EMPL_CASADA] [varchar](15) NULL,  
 [SEGURO_SOCIAL] [varchar](20) NULL,  
 [ESTADO_CIVIL] [varchar](1) NOT NULL,  
 [FEC_NACIMIENTO] [datetime] NULL,  
 [LUGAR_NACIMIENTO] [varchar](50) NULL,  
 
 
 
 [TEL_CASA] [varchar](8) NULL,  
 [DIR_CASA] [varchar](50) NULL,  
 [DIR_POSTAL] [varchar](32) NULL,  
 [DIR_CORREO] [varchar](50) NULL,  
 [NOM_PER_EMERG] [varchar](20) NULL,  
 [TEL_PER_EMERG] [varchar](8) NULL,  
 [ALERGIA_EMPL] [varchar](25) NULL,  
 [TIPO_SANGRE] [varchar](3) NULL,  
 [NOM_PADRE] [varchar](40) NULL,  
 [NOM_MADRE] [varchar](40) NULL,  
 [NOM_CONYUGUE] [varchar](40) NULL,  
 [DIR_TRA_CONYUGUE] [varchar](30) NULL,  
 [FEC_INGRESO] [datetime] NULL,  
 [FEC_SALIDA] [datetime] NULL,  
 [TIPO_CARRERA] [varchar](1) NULL,  
 [TIPO_NOMBRAMIENTO] [varchar](1) NULL,  
 [POSICION_PLANILLA] [varchar](10) NULL,  
 [COD_CARGO] [varchar](2) NULL,  
 [COD_FUNCION] [varchar](10) NULL,  
 [NUM_ENTIDAD] [varchar](3) NULL,  
 [NUM_PLANILLA] [varchar](4) NULL,  
 [NUM_RESUELTO] [varchar](5) NULL,  
 [FEC_RESUELTO] [datetime] NULL,  
 [COD_PART_PRESUP] [varchar](30) NULL,  
 [TIPO_HORARIO] [varchar](1) NOT NULL,  
 [HORARIO_ENTRADA] [varchar](2) NULL,  
 [HORARIO_SALIDA] [varchar](2) NULL,  
 [COD_TIP_CUENTA] [varchar](1) NULL,  
 [NUM_CUENTA_BAN] [varchar](15) NULL,  
 [COD_BANCO] [varchar](3) NULL,  
 [SALARIO] [numeric](8, 2) NULL,  
 [FEC_PER_ACTUAL] [datetime] NULL,  
 [CAN_DIA_AUSENCIA] [smallint] NULL,  
 [CANT_HOR_TARDANZA] [smallint] NULL,  
 [ESTADO_EMPL] [varchar](2) NOT NULL,  
 [USER_ID] [varchar](17) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [COD_MINU_ENTRADA] [varchar](2) NULL,  
 [COD_MINU_SALIDA] [varchar](2) NULL,  
 [SEXO] [varchar](1) NOT NULL,  
 [DIR_BEEPER] [varchar](50) NULL,  
 [COD_AGENCIA] [varchar](2) NULL,  
 [COD_SECCION] [varchar](2) NULL,  
 [COD_UNID_ADMINIST] [varchar](3) NULL,  
 [COD_ULT_ACCION] [varchar](3) NULL,  
 [NUM_ULT_ACCION] [int] NULL,  
 [FEC_ULT_ACCION] [datetime] NULL,  
 
 
 
 [FEC_PER_INIC] [datetime] NULL,  
 [TIEMPO_X_DIA] [smallint] NULL,  
 [TIEMPO_COM] [smallint] NULL,  
 [HORA_ENTRA_COM] [varchar](2) NULL,  
 [MINUTO_ENTRA_COM] [varchar](2) NULL,  
 [HORA_SAL_COM] [varchar](2) NULL,  
 [MINUTO_SAL_COM] [varchar](2) NULL,  
 [FEC_INIC_NVO_PER] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_EMPLEADO_SIM_PE_EMPLEA] PRIMARY KEY CLUSTERED   
( 
 [IDENTIFICA_EMPL] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_ES_EMPL]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_ES_EMPL](  
 [COD_ESTADO] [varchar](2) NOT NULL,  
 [NOM_ESTADO] [varchar](8) NULL,  
 CONSTRAINT [PKPE_PK_VES_EMPL_SIM_PE_ES_EMP] PRIMARY KEY CLUSTERED   
( 
 [COD_ESTADO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_ESCOLAR]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_ESCOLAR](  
 [COD_TIP_ESCOLAR] [varchar](2) NOT NULL,  
 [NOM_TIP_ESCOLAR] [varchar](40) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_ESCOLAR_SIM_PE_ESCOLAR] PRIMARY KEY CLUSTERED   
( 
 [COD_TIP_ESCOLAR] ASC  
 
 
 
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_EST_CARGO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_EST_CARGO](  
 [COD_CARGO] [varchar](10) NOT NULL,  
 [POSICION_PLANILLA] [varchar](10) NOT NULL,  
 [COD_PART_PRESUP] [varchar](30) NULL,  
 [VACANCIA] [bit] NOT NULL,  
 [SALARIO] [numeric](8, 2) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [COD_AGENCIA] [varchar](2) NULL,  
 [COD_SECCION] [varchar](2) NULL,  
 [FEC_INGRESO] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_EST_CARGO_SIM_PE_EST_C] PRIMARY KEY CLUSTERED   
( 
 [COD_CARGO] ASC,  
 [POSICION_PLANILLA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_EST_SOL]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_EST_SOL](  
 [COD_ESTADO] [varchar](2) NOT NULL,  
 [NOM_ESTADO] [varchar](9) NULL,  
 CONSTRAINT [PKPE_PK_VEST_SOL_SIM_PE_EST_SO] PRIMARY KEY CLUSTERED   
( 
 [COD_ESTADO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
 
 
 
GO 
/****** Object:   Table [dbo].[SIM_PE_EVALUACION]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_EVALUACION](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [IDENTIFICA_EVALUA] [varchar](20) NULL,  
 [FEC_A_EVALUAR] [datetime] NOT NULL,  
 [FEC_EVALUACION] [datetime] NULL,  
 [PENDIENTE] [bit] NOT NULL,  
 [COD_CARGO] [varchar](10) NULL,  
 [COD_FUNCION] [varchar](10) NULL,  
 [COD_AGENCIA] [varchar](2) NULL,  
 [COD_SECCION] [varchar](2) NULL,  
 CONSTRAINT [PKPE_PK_EVALUACION_SIM_PE_EVAL] PRIMARY KEY CLUSTERED   
( 
 [IDENTIFICA_EMPL] ASC,  
 [FEC_A_EVALUAR] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_FERIADO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_FERIADO](  
 [COD_FERIADO] [varchar](2) NOT NULL,  
 [NOM_FERIADO] [varchar](20) NULL,  
 CONSTRAINT [PKPE_PK_VFERIADO_SIM_PE_FERIAD] PRIMARY KEY CLUSTERED   
( 
 [COD_FERIADO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_FORMULARIO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
 
 
 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_FORMULARIO](  
 [NUM_FORM_APL] [int] NOT NULL,  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FEC_APLICACION] [datetime] NOT NULL,  
 [FEC_RESUELTO] [datetime] NULL,  
 [CANT_DIA_APL] [smallint] NULL,  
 [MONTO_APLICAR] [numeric](8, 2) NULL,  
 [COD_TIP_QUINCENA] [varchar](2) NULL,  
 [OBSERVACIONES] [varchar](50) NULL,  
 [COD_TIP_PAGO] [varchar](2) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [NUM_RESUELTO] [varchar](5) NULL,  
 CONSTRAINT [PKPE_PK_FORMULARIO_SIM_PE_FORM] PRIMARY KEY CLUSTERED   
( 
 [NUM_FORM_APL] ASC,  
 [IDENTIFICA_EMPL] ASC,  
 [FEC_APLICACION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_FUNCIONARI]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_FUNCIONARI](  
 [COD_FUNCIONARIO] [varchar](50) NOT NULL,  
 [NOM_FUNCIONARIO] [varchar](30) NULL,  
 [SUPERVISOR] [bit] NOT NULL,  
 [CORREO_ELECTRONICO] [varchar](40) NULL,  
 [BUSCA_PERSONAS] [varchar](40) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_FUNCIONES]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_FUNCIONES](  
 [COD_FUNCION] [varchar](10) NOT NULL,  
 
 
 
 [NOM_FUNCION] [varchar](40) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_FUNCIONES_SIM_PE_FUNCI] PRIMARY KEY CLUSTERED   
( 
 [COD_FUNCION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_GRUP_EMPL]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_GRUP_EMPL](  
 [COD_GRUPO] [varchar](2) NOT NULL,  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [NOM_EMPL_PRIMERO] [varchar](15) NULL,  
 [NOM_EMPL_SEGUNDO] [varchar](15) NULL,  
 [APE_EMPL_PATERNO] [varchar](15) NULL,  
 [APE_EMPL_MATERNO] [varchar](15) NULL,  
 [APE_EMPL_CASADA] [varchar](15) NULL,  
 [IND_ACTIVO] [bit] NOT NULL,  
 CONSTRAINT [PKEY1_SIM_PE_GRUP_EMPLCOD_GRUP] PRIMARY KEY CLUSTERED   
( 
 [COD_GRUPO] ASC,  
 [IDENTIFICA_EMPL] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_GRUPOS]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_GRUPOS](  
 [COD_GRUPO] [varchar](2) NOT NULL,  
 [NOM_GRUPO] [varchar](40) NULL,  
 [USER_ID] [varchar](20) NULL,  
 
 
 
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [COD_AGENCIA] [varchar](2) NULL,  
 [IDENTIFICA_SUP] [varchar](20) NULL,  
 [IDENTIFICA_JEF] [varchar](20) NULL,  
 [COD_SECCION] [varchar](2) NULL,  
 [CORREO_JEF_AREA] [varchar](50) NULL,  
 [CORREO_SUPERVISOR] [varchar](50) NULL,  
 CONSTRAINT [PKPE_PK_GRUPOS_SIM_PE_GRUPOSCO] PRIMARY KEY CLUSTERED   
( 
 [COD_GRUPO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_HIST_EMPL]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_HIST_EMPL](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FEC_APLICA] [datetime] NOT NULL,  
 [COD_CARGO_ANT] [varchar](10) NULL,  
 [COD_FUNCION_ANT] [varchar](10) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [SALARIO_ACT] [numeric](8, 2) NULL,  
 [COD_CARGO_ACT] [varchar](10) NULL,  
 [COD_FUNCION_ACT] [varchar](10) NULL,  
 [SALARIO_ANT] [numeric](8, 2) NULL,  
 [COD_AGENCIA_ACT] [varchar](2) NULL,  
 [COD_SECCION_ACT] [varchar](2) NULL,  
 [COD_AGENCIA_ANT] [varchar](2) NULL,  
 [COD_SECCION_ANT] [varchar](2) NULL,  
 CONSTRAINT [PKPE_PK_HIST_EMPL_SIM_PE_HIST_] PRIMARY KEY CLUSTERED   
( 
 [IDENTIFICA_EMPL] ASC,  
 [FEC_APLICA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_HOR_ROT_EM]     Script Date: 16 -05-2025 13:14:43 
******/  
 
 
 
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_HOR_ROT_EM](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [COD_TIP_HORARIO] [varchar](2) NULL,  
 [FEC_TRABAJO] [datetime] NOT NULL,  
 [MINUTO_ENTRADA] [varchar](2) NULL,  
 [HORA_SALIDA] [varchar](2) NULL,  
 [MINUTO_SALIDA] [varchar](2) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [COD_DIA] [varchar](2) NULL,  
 [COD_FERIADO] [varchar](2) NULL,  
 [HORA_ENTRADA] [varchar](2) NULL,  
 CONSTRAINT [PKPE_PK_HOR_ROT_EM_SIM_PE_HOR_] PRIMARY KEY CLUSTERED   
( 
 [IDENTIFICA_EMPL] ASC,  
 [FEC_TRABAJO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_HOR_ROT_GR]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_HOR_ROT_GR](  
 [COD_GRUPO] [varchar](2) NOT NULL,  
 [FEC_TRABAJO] [datetime] NOT NULL,  
 [COD_TIP_HORARIO] [varchar](2) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [COD_DIA] [varchar](2) NULL,  
 [COD_FERIADO] [varchar](2) NULL,  
 CONSTRAINT [PKPE_PK_HOR_ROT_GR_SIM_PE_HOR_] PRIMARY KEY CLUSTERED   
( 
 [COD_GRUPO] ASC,  
 [FEC_TRABAJO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
 
 
 
GO 
/****** Object:   Table [dbo].[SIM_PE_HORARIOS]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_HORARIOS](  
 [COD_TIP_HORARIO] [varchar](2) NOT NULL,  
 [HORA_ENTRADA] [varchar](2) NULL,  
 [MINUTO_ENTRADA] [varchar](2) NULL,  
 [HORA_SALIDA] [varchar](2) NULL,  
 [MINUTO_SALIDA] [varchar](2) NULL,  
 [TIPO_TURNO] [varchar](2) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [TIEMPO_X_DIA] [smallint] NULL,  
 [TIEMPO_COM] [smallint] NULL,  
 [HORA_ENTRA_COM] [varchar](2) NULL,  
 [MINUTO_ENTRA_COM] [varchar](2) NULL,  
 [HORA_SAL_COM] [varchar](2) NULL,  
 [MINUTO_SAL_COM] [varchar](2) NULL,  
 CONSTRAINT [PKPE_PK_HORARIOS_SIM_PE_HORARI] PRIMARY KEY CLUSTERED   
( 
 [COD_TIP_HORARIO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_IND_SUE]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_IND_SUE](  
 [COD_IND_SUELDO] [varchar](1) NOT NULL,  
 [NOM_IND_SUELDO] [varchar](12) NULL,  
 CONSTRAINT [PKPE_PK_VIND_SUE_SIM_PE_IND_SU] PRIMARY KEY CLUSTERED   
( 
 [COD_IND_SUELDO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
 
 
 
/****** Object:   Table [dbo].[SIM_PE_LICENCIAS]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_LICENCIAS](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FEC_DESDE] [datetime] NOT NULL,  
 [FEC_HASTA] [datetime] NOT NULL,  
 [COD_MOTIVO] [varchar](3) NULL,  
 [NUM_DOCUM_CJS] [varchar](20) NULL,  
 [COD_IND_SUELDO] [varchar](1) NULL,  
 [NUM_RESUELTO] [varchar](5) NULL,  
 [FEC_RESUELTO] [datetime] NULL,  
 [OBSERVACIONES] [varchar](40) NULL,  
 [CANT_DIA_PAGAR] [smallint] NULL,  
 [VALOR_DESCUENTO] [numeric](8, 2) NULL,  
 [FEC_DESDE_NO_SALA] [datetime] NULL,  
 [FEC_HASTA_NO_SALA] [datetime] NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [COD_TIP_LICENCIA] [varchar](2) NULL,  
 [IND_DESC_DIAS] [bit] NOT NULL,  
 CONSTRAINT [PKPE_PK_LICENCIAS_SIM_PE_LICEN] PRIMARY KEY CLUSTERED   
( 
 [IDENTIFICA_EMPL] ASC,  
 [FEC_DESDE] ASC,  
 [FEC_HASTA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_MER_RECON]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_MER_RECON](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FEC_MER_RECONO] [datetime] NOT NULL,  
 [DISTINCION] [varchar](40) NULL,  
 [MOTIVO] [varchar](50) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 
 
 
 [MOTIVO2] [varchar](50) NULL,  
 [MOTIVO3] [varchar](50) NULL,  
 CONSTRAINT [PKPE_PK_MER_RECON_SIM_PE_MER_R] PRIMARY KEY CLUSTERED   
( 
 [IDENTIFICA_EMPL] ASC,  
 [FEC_MER_RECONO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_MESES]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_MESES](  
 [COD_MES] [varchar](2) NOT NULL,  
 [NOM_MES] [varchar](15) NULL,  
 CONSTRAINT [PKPE_PK_VMESES_SIM_PE_MESESCOD] PRIMARY KEY CLUSTERED   
( 
 [COD_MES] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_MOT_AUSENC]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_MOT_AUSENC](  
 [COD_MOT_AUSENCIA] [varchar](3) NOT NULL,  
 [NOM_MOT_AUSENCIA] [varchar](40) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_MOT_AUSENC_SIM_PE_MOT_] PRIMARY KEY CLUSTERED   
( 
 [COD_MOT_AUSENCIA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
 
 
 
/****** Object:   Table [dbo].[SIM_PE_MOT_LICENC]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_MOT_LICENC](  
 [COD_MOTIVO] [varchar](2) NOT NULL,  
 [NOM_MOTIVO] [varchar](40) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_MOT_LICENC_SIM_PE_MOT_] PRIMARY KEY CLUSTERED   
( 
 [COD_MOTIVO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_MOT_PERMI]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_MOT_PERMI](  
 [COD_MOTIVO] [varchar](3) NOT NULL,  
 [NOM_MOTIVO] [varchar](40) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_MOT_PERMI_SIM_PE_MOT_P] PRIMARY KEY CLUSTERED   
( 
 [COD_MOTIVO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_PAR_PRESUP]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_PAR_PRESUP](  
 [COD_PART_PRESUP] [varchar](30) NOT NULL,  
 [NOM_PART_PRESUP] [varchar](40) NULL,  
 
 
 
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_PART_PRESUP_SIM_PE_PAR] PRIMARY KEY CLUSTERED   
( 
 [COD_PART_PRESUP] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_PARENTESCO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_PARENTESCO](  
 [COD_PARENTESCO] [varchar](3) NOT NULL,  
 [NOM_PARENTESCO] [varchar](40) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_PARENTESCO_SIM_PE_PARE] PRIMARY KEY CLUSTERED   
( 
 [COD_PARENTESCO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_PARM_SIST]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_PARM_SIST](  
 [COD_PARAMETRO] [varchar](2) NOT NULL,  
 [NOM_PARAMETRO] [varchar](40) NULL,  
 [CANT_DIA_APL] [smallint] NULL,  
 [COD_UNID_TIEMPO] [varchar](2) NULL,  
 [MES_FIN] [varchar](2) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [DIA_FIN] [varchar](2) NULL,  
 [FEC_FIN] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_PARM_SIST_SIM_PE_PARM_] PRIMARY KEY CLUSTERED   
( 
 
 
 
 [COD_PARAMETRO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_QUINCEN]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_QUINCEN](  
 [COD_TIP_QUINCENA] [varchar](2) NOT NULL,  
 [NOM_TIP_QUINCENA] [varchar](20) NULL,  
 CONSTRAINT [PKPE_PK_VQUINCEN_SIM_PE_QUINCE] PRIMARY KEY CLUSTERED   
( 
 [COD_TIP_QUINCENA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_REG_ASISTE]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_REG_ASISTE](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FEC_ASISTENCIA] [datetime] NOT NULL,  
 [HORA_ENTRADA] [varchar](2) NULL,  
 [MINUTO_ENTRADA] [varchar](2) NULL,  
 [HORA_SALIDA] [varchar](2) NULL,  
 [MINUTO_SALIDA] [varchar](2) NULL,  
 [HORA_ENTRA_ALM] [varchar](2) NULL,  
 [MINUTO_ENTRA_ALM] [varchar](2) NULL,  
 [HORA_SAL_ALM] [varchar](2) NULL,  
 [MINUTO_SAL_ALM] [varchar](2) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_REG_ASISTE_SIM_PE_REG_] PRIMARY KEY CLUSTERED   
( 
 [IDENTIFICA_EMPL] ASC,  
 [FEC_ASISTENCIA] ASC  
 
 
 
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_SOLIC_PER]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_SOLIC_PER](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FEC_DESDE] [datetime] NULL,  
 [FEC_HASTA] [datetime] NULL,  
 [HORA_DESDE] [varchar](2) NULL,  
 [MINUTO_DESDE] [varchar](2) NULL,  
 [HORA_HASTA] [varchar](2) NULL,  
 [MINUTO_HASTA] [varchar](2) NULL,  
 [COD_MOTIVO] [varchar](3) NULL,  
 [COD_TIP_COMPENSA] [varchar](2) NULL,  
 [FEC_SOLICITUD] [datetime] NOT NULL,  
 [IDENTIFICA_SOLIC] [varchar](20) NULL,  
 [IDENTIFICA_CONC] [varchar](20) NULL,  
 [FEC_CONCESION] [datetime] NULL,  
 [COD_ESTADO] [varchar](2) NULL,  
 [OBSERVACIONES] [varchar](40) NULL,  
 [USER_ID] [varchar](17) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [NUM_SOLICITUD] [int] NOT NULL,  
 [CANT_DIAS] [smallint] NULL,  
 [IND_DIA_COMPL] [bit] NOT NULL,  
 [TIPO_USER_CREA] [varchar](1) NULL,  
 [COD_GRUPO] [varchar](2) NULL,  
 [CANT_MINUTOS] [smallint] NULL,  
 [CANT_HOR] [smallint] NULL,  
 [TIPO_SALDO] [varchar](1) NULL,  
 CONSTRAINT [PKPE_PK_SOLIC_PER_SIM_PE_SOLIC] PRIMARY KEY CLUSTERED   
( 
 [NUM_SOLICITUD] ASC,  
 [IDENTIFICA_EMPL] ASC,  
 [FEC_SOLICITUD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
 
 
 
/****** Object:   Table [dbo].[SIM_PE_SOLIC_TC]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_SOLIC_TC](  
 [NUM_SOLICITUD] [int] NOT NULL,  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FEC_SOLICITUD] [datetime] NOT NULL,  
 [IDENTIFICA_SOLIC] [varchar](20) NULL,  
 [FEC_DESDE] [varchar](2) NULL,  
 [FEC_HASTA] [varchar](2) NULL,  
 [HORA_DESDE] [varchar](2) NULL,  
 [MINUTOS_DESDE] [varchar](2) NULL,  
 [HORA_HASTA] [varchar](2) NULL,  
 [MINUTOS_HASTA] [varchar](2) NULL,  
 [IDENTIFICA_CONC] [varchar](20) NULL,  
 [FEC_CONCESION] [datetime] NULL,  
 [COD_ESTADO] [varchar](2) NULL,  
 [OBSERVACIONES] [varchar](40) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_SOLIC_TC_SIM_PE_SOLIC_] PRIMARY KEY CLUSTERED   
( 
 [NUM_SOLICITUD] ASC,  
 [IDENTIFICA_EMPL] ASC,  
 [FEC_SOLICITUD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_SOLIC_VAC]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_SOLIC_VAC](  
 [NUM_SOLICITUD] [int] NOT NULL,  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FEC_SOLICITUD] [datetime] NOT NULL,  
 [IDENTIFICA_SOLIC] [varchar](20) NULL,  
 [FEC_DESDE] [datetime] NULL,  
 [FEC_HASTA] [datetime] NULL,  
 [IDENTIFICA_CONC] [varchar](20) NULL,  
 
 
 
 [FEC_CONCESION] [datetime] NULL,  
 [COD_ESTADO] [varchar](2) NULL,  
 [COD_TIP_VACACION] [varchar](2) NULL,  
 [OBSERVACIONES] [varchar](50) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [PAGO_QUINCENA] [varchar](2) NULL,  
 [TIPO_USER_CREA] [varchar](1) NULL,  
 CONSTRAINT [PKPE_PK_SOLIC_VAC_SIM_PE_SOLIC] PRIMARY KEY CLUSTERED   
( 
 [NUM_SOLICITUD] ASC,  
 [IDENTIFICA_EMPL] ASC,  
 [FEC_SOLICITUD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_TIEM_COMP]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TIEM_COMP](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FEC_TIEM_COMP] [datetime] NOT NULL,  
 [HORAS_DESDE] [varchar](2) NOT NULL,  
 [MINUTOS_DESDE] [varchar](2) NOT NULL,  
 [HORA_HASTA] [varchar](2) NOT NULL,  
 [MINUTOS_HASTA] [varchar](2) NULL,  
 [SALDO_TIEM_COMP] [smallint] NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [IND_REPO_TIEM] [bit] NOT NULL,  
 [NUM_SOLIC_REP] [int] NULL,  
 [FEC_SOLIC_REP] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_TIEM_COMP_SIM_PE_TIEM_] PRIMARY KEY CLUSTERED   
( 
 [IDENTIFICA_EMPL] ASC,  
 [FEC_TIEM_COMP] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
 
 
 
/****** Object:   Table [dbo].[SIM_PE_TIP_ACCION]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TIP_ACCION](  
 [COD_TIP_ACCION] [varchar](3) NOT NULL,  
 [NOM_TIP_ACCION] [varchar](40) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_TIP_ACCION_SIM_PE_TIP_] PRIMARY KEY CLUSTERED   
( 
 [COD_TIP_ACCION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_TIP_ASC]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TIP_ASC](  
 [COD_TIP_ASCENSO] [varchar](2) NOT NULL,  
 [NOM_TIP_ASCENSO] [varchar](40) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_VTIP_ASC_SIM_PE_TIP_AS] PRIMARY KEY CLUSTERED   
( 
 [COD_TIP_ASCENSO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_TIP_CAL]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TIP_CAL](  
 [COD_CALIFICA] [varchar](2) NOT NULL,  
 [NOM_CALIFICA] [varchar](15) NULL,  
 
 
 
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_VTIP_CAL_SIM_PE_TIP_CA] PRIMARY KEY CLUSTERED   
( 
 [COD_CALIFICA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_TIP_CAMBIO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TIP_CAMBIO](  
 [COD_CAMBIO] [varchar](2) NOT NULL,  
 [NOM_CAMBIO] [varchar](30) NULL,  
 CONSTRAINT [PKPE_PK_VTIP_CAMBIO_SIM_PE_TIP] PRIMARY KEY CLUSTERED   
( 
 [COD_CAMBIO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_TIP_COM]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TIP_COM](  
 [COD_TIP_COMPENSA] [varchar](2) NOT NULL,  
 [NOM_TIP_COMPENSA] [varchar](21) NULL,  
 CONSTRAINT [PKPE_PK_TIP_COM_SIM_PE_TIP_COM] PRIMARY KEY CLUSTERED   
( 
 [COD_TIP_COMPENSA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_TIP_CTA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
 
 
 
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TIP_CTA](  
 [COD_TIP_CUENTA] [varchar](1) NOT NULL,  
 [NOM_TIP_CUENTA] [varchar](40) NULL,  
 CONSTRAINT [PKPE_PK_VTIP_CTA_SIM_PE_TIP_CT] PRIMARY KEY CLUSTERED   
( 
 [COD_TIP_CUENTA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_TIP_HOR]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TIP_HOR](  
 [COD_TIP_HORARIO] [varchar](2) NOT NULL,  
 [NOM_TIP_HORARIO] [varchar](8) NULL,  
 CONSTRAINT [PKPE_PK_VTIP_HOR_SIM_PE_TIP_HO] PRIMARY KEY CLUSTERED   
( 
 [COD_TIP_HORARIO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_TIP_HRA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TIP_HRA](  
 [NOM_HORA] [varchar](2) NULL,  
 [COD_HORA] [varchar](2) NOT NULL,  
 CONSTRAINT [PKPE_PK_VTIP_HRA_SIM_PE_TIP_HR] PRIMARY KEY CLUSTERED   
( 
 [COD_HORA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
 
 
 
GO 
/****** Object:   Table [dbo].[SIM_PE_TIP_JEFE]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TIP_JEFE](  
 [COD_TIP_JEFE] [varchar](2) NOT NULL,  
 [NOM_TIP_JEFE] [varchar](20) NULL,  
 CONSTRAINT [PKPE_PK_TIP_JEF_SIM_PE_TIP_JEF] PRIMARY KEY CLUSTERED   
( 
 [COD_TIP_JEFE] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_TIP_JUS]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TIP_JUS](  
 [COD_TIP_JUSTIFICA] [varchar](2) NOT NULL,  
 [NOM_TIP_JUSTIFICA] [varchar](15) NULL,  
 CONSTRAINT [PKPE_PK_TIP_JUS_SIM_PE_TIP_JUS] PRIMARY KEY CLUSTERED   
( 
 [COD_TIP_JUSTIFICA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_TIP_LIC]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TIP_LIC](  
 [COD_TIP_LICENCIA] [varchar](2) NOT NULL,  
 [NOM_TIP_LICENCIA] [varchar](30) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_VTIP_LIC_SIM_PE_TIP_LI] PRIMARY KEY CLUSTERED   
( 
 [COD_TIP_LICENCIA] ASC  
 
 
 
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_TIP_MTO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TIP_MTO](  
 [COD_MINU] [varchar](2) NOT NULL,  
 [NOM_MINU] [varchar](2) NULL,  
 CONSTRAINT [PKPE_PK_VTIP_MTO_SIM_PE_TIP_MT] PRIMARY KEY CLUSTERED   
( 
 [COD_MINU] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_TIP_NOM]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TIP_NOM](  
 [COD_NOMBRAMIENTO] [varchar](1) NOT NULL,  
 [NOM_NOMBRAMIENTO] [varchar](8) NULL,  
 CONSTRAINT [PKPE_PK_VTIP_NOM_SIM_PE_TIP_NO] PRIMARY KEY CLUSTERED   
( 
 [COD_NOMBRAMIENTO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_TIP_PAG]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TIP_PAG](  
 [COD_TIP_PAGO] [varchar](2) NOT NULL,  
 
 
 
 [NOM_TIP_PAGO] [varchar](30) NULL,  
 CONSTRAINT [PKPE_PK_VTIP_PAG_SIM_PE_TIP_PA] PRIMARY KEY CLUSTERED   
( 
 [COD_TIP_PAGO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_TIP_RET]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TIP_RET](  
 [COD_TIP_RETIRO] [varchar](2) NOT NULL,  
 [NOM_TIP_RETIRO] [varchar](40) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_VTIP_RET_SIM_PE_TIP_RE] PRIMARY KEY CLUSTERED   
( 
 [COD_TIP_RETIRO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_TIP_SALDO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TIP_SALDO](  
 [TIP_SALDO] [varchar](1) NOT NULL,  
 [DESC_SALDO] [varchar](20) NULL,  
 CONSTRAINT [PK_SIM_PE_TIP_SALDO] PRIMARY KEY CLUSTERED   
( 
 [TIP_SALDO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_TIP_SANG]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
 
 
 
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TIP_SANG](  
 [COD_SANGRE] [varchar](3) NOT NULL,  
 [NOM_SANGRE] [varchar](12) NULL,  
 CONSTRAINT [PKPE_PK_VTIP_SANG_SIM_PE_TIP_S] PRIMARY KEY CLUSTERED   
( 
 [COD_SANGRE] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_TIP_SOL]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TIP_SOL](  
 [COD_TIP_SOLICTUD] [varchar](2) NOT NULL,  
 [NOM_TIP_SOLICITUD] [varchar](20) NULL,  
 CONSTRAINT [PKPE_PK_TIP_SOL_SIM_PE_TIP_SOL] PRIMARY KEY CLUSTERED   
( 
 [COD_TIP_SOLICTUD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_TIP_VAC]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TIP_VAC](  
 [COD_TIP_VACACION] [varchar](2) NOT NULL,  
 [NOM_TIP_VACACION] [varchar](30) NULL,  
 CONSTRAINT [PKPE_PK_TIP_VAC_SIM_PE_TIP_VAC] PRIMARY KEY CLUSTERED   
( 
 [COD_TIP_VACACION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
 
 
 
GO 
/****** Object:   Table [dbo].[SIM_PE_TRASLADOS]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TRASLADOS](  
 [NUM_TRASLADO] [int] NOT NULL,  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FEC_APLICACION] [datetime] NOT NULL,  
 [NUM_RESUELTO] [varchar](5) NULL,  
 [FEC_RESUELTO] [datetime] NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [COD_AGENCIA_ACT] [varchar](2) NULL,  
 [COD_SECCION_ACT] [varchar](2) NULL,  
 [COD_AGENCIA_ANT] [varchar](2) NULL,  
 [COD_SECCION_ANT] [varchar](2) NULL,  
 [COD_PRE_ACCION] [varchar](3) NULL,  
 [NUM_PRE_ACCION] [int] NULL,  
 [FEC_PRE_ACCION] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_TRASLADOS_SIM_PE_TRASL] PRIMARY KEY CLUSTERED   
( 
 [NUM_TRASLADO] ASC,  
 [IDENTIFICA_EMPL] ASC,  
 [FEC_APLICACION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_TURNOS]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_TURNOS](  
 [COD_TURNO] [varchar](2) NOT NULL,  
 [NOM_TURNO] [varchar](6) NULL,  
 CONSTRAINT [PKPE_PK_TURNOS_SIM_PE_TURNOSCO] PRIMARY KEY CLUSTERED   
( 
 [COD_TURNO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
 
 
 
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_UNI_TIEM]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_UNI_TIEM](  
 [COD_UNID_TIEMPO] [varchar](2) NOT NULL,  
 [NOM_UNID_TIEMPO] [varchar](15) NULL,  
 CONSTRAINT [PKPE_PK_UNI_TIEM_SIM_PE_UNI_TI] PRIMARY KEY CLUSTERED   
( 
 [COD_UNID_TIEMPO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_UNID_ADMIN]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_UNID_ADMIN](  
 [COD_UNID_ADMINST] [varchar](3) NOT NULL,  
 [NOM_UNID_ADMINIST] [varchar](40) NULL,  
 [IDENTIFICA_EMPL] [varchar](20) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [COD_UNID_ADM_ANT] [varchar](3) NULL,  
 [COD_TIP_JEFE] [varchar](2) NULL,  
 CONSTRAINT [PKPE_PK_UNID_ADMIN_SIM_PE_UNID] PRIMARY KEY CLUSTERED   
( 
 [COD_UNID_ADMINST] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_UTILIZA_TC]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
 
 
 
CREATE TABLE [dbo].[SIM_PE_UTILIZA_TC](  
 [NUM_SOLICITUD] [int] NOT NULL,  
 [NUM_SEC_SOLICITUD] [smallint] NOT NULL,  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FEC_TIEM_COMP] [datetime] NULL,  
 [FEC_UTILIZAR] [datetime] NULL,  
 [HORA_DESDE] [varchar](2) NULL,  
 [MINUTOS_DESDE] [varchar](2) NULL,  
 [HORA_HASTA] [varchar](2) NULL,  
 [MINUTOS_HASTA] [varchar](2) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [TR_TOMADO] [smallint] NULL,  
 [TR_TOMADO_ANT] [smallint] NULL,  
 [CONT_CAMBIO_TR] [smallint] NULL,  
 CONSTRAINT [PKPE_PK_UTILIZA_TC_SIM_PE_UTIL] PRIMARY KEY CLUSTERED   
( 
 [NUM_SOLICITUD] ASC,  
 [NUM_SEC_SOLICITUD] ASC,  
 [IDENTIFICA_EMPL] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_UTILIZA_VC]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_UTILIZA_VC](  
 [NUM_SEC_SOLICITUD] [smallint] NOT NULL,  
 [FEC_DESDE] [datetime] NOT NULL,  
 [FEC_HASTA] [datetime] NOT NULL,  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FEC_RESUELTO] [datetime] NULL,  
 [NUM_RESUELTO] [varchar](5) NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [NUM_SOLICITUD] [int] NOT NULL,  
 CONSTRAINT [PKPE_PK_UTILIZA_VC_SIM_PE_UTIL] PRIMARY KEY CLUSTERED   
( 
 [NUM_SOLICITUD] ASC,  
 [NUM_SEC_SOLICITUD] ASC,  
 [IDENTIFICA_EMPL] ASC,  
 [FEC_DESDE] ASC,  
 
 
 
 [FEC_HASTA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_PE_VACACIONES]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_PE_VACACIONES](  
 [IDENTIFICA_EMPL] [varchar](20) NOT NULL,  
 [FEC_DESDE] [datetime] NOT NULL,  
 [FEC_RESUELTO] [datetime] NULL,  
 [NUM_RESUELTO] [varchar](5) NULL,  
 [CANT_DIA_TOMADO] [smallint] NULL,  
 [CANT_DIA_PENDIEN] [smallint] NULL,  
 [USER_ID] [varchar](20) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [CANT_DIA_GANADO] [smallint] NULL,  
 [FECHA_HASTA] [datetime] NULL,  
 [FEC_INI_LABOR] [datetime] NULL,  
 [FEC_INI_VACAC] [datetime] NULL,  
 CONSTRAINT [PKPE_PK_VACACIONES_SIM_PE_VACA] PRIMARY KEY CLUSTERED   
( 
 [IDENTIFICA_EMPL] ASC,  
 [FEC_DESDE] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_SG_REPORTES]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_SG_REPORTES](  
 [NUM_REPORTE] [varchar](4) NOT NULL,  
 [COD_SECCION] [varchar](2) NOT NULL,  
 [NOM_REPORTE] [varchar](20) NOT NULL,  
 [DES_REPORTE] [varchar](100) NOT NULL,  
 [IND_TIPO_REPORTE] [varchar](1) NOT NULL,  
 CONSTRAINT [PKEY1_SIM_SG_REPORTESNUM_REPOR] PRIMARY KEY CLUSTERED   
 
 
 
( 
 [NUM_REPORTE] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_SG_RESOLUCION]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_SG_RESOLUCION](  
 [NUM_RESOLUCION] [smallint] NOT NULL,  
 [NUM_REG_FILIACION] [int] NULL,  
 [FEC_RESOLUCION] [datetime] NOT NULL,  
 [COD_TIPO_VISA] [varchar](3) NULL,  
 [OBS_OBSERVACION] [varchar](1000) NULL,  
 [COD_TIPO_RESOL] [varchar](3) NOT NULL,  
 [NOM_REPORTE] [varchar](50) NOT NULL,  
 [COD_LEGISLACION1] [varchar](15) NULL,  
 [COD_LEGISLACION2] [varchar](15) NULL,  
 [COD_LEGISLACION3] [varchar](15) NULL,  
 [COD_LEGISLACION4] [varchar](15) NULL,  
 [COD_LEGISLACION5] [varchar](15) NULL,  
 [NOMBRE_DIRECTOR] [varchar](60) NULL,  
 [NOMBRE_SUBDIREC] [varchar](60) NULL,  
 [IND_TIPO_REPORTE] [varchar](1) NULL,  
 [ID_ABOGADO] [varchar](20) NULL,  
 [COD_STATUS] [varchar](3) NULL,  
 [FEC_SOLICITUD] [datetime] NULL,  
 [TIPO_SALVOCOND] [varchar](3) NULL,  
 [COD_COMPANIA] [varchar](3) NULL,  
 [NUM_VUELO] [varchar](20) NULL,  
 [FEC_VUELO] [datetime] NULL,  
 [HORA_VUELO] [smallint] NULL,  
 [MIN_VUELO] [smallint] NULL,  
 [FEC_VENCIMTO] [datetime] NULL,  
 [FEC_CREACION] [datetime] NULL,  
 [ID_USUARIO_CREA] [varchar](17) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [ID_USUARIO_MODIF] [varchar](17) NULL,  
 [FEC_MULTA] [datetime] NULL,  
 [IND_BORRADOR] [varchar](1) NOT NULL,  
 CONSTRAINT [PKpkey1_SIM_SG_RESOLUCIONNUM_R] PRIMARY KEY CLUSTERED   
( 
 
 
 
 [NUM_RESOLUCION] ASC,  
 [IND_BORRADOR] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_SG_TIP_REPORT]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_SG_TIP_REPORT](  
 [IND_TIPO_REPORTE] [varchar](1) NOT NULL,  
 [NOM_TIPO_REPORTE] [varchar](15) NULL,  
 CONSTRAINT [PKEY1_SIM_SG_TIP_REPORTIND_TIP] PRIMARY KEY CLUSTERED   
( 
 [IND_TIPO_REPORTE] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_SG_TIPO_RESOL]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_SG_TIPO_RESOL](  
 [COD_TIPO_RESOL] [varchar](3) NOT NULL,  
 [NOM_TIPO_RESOL] [varchar](100) NULL,  
 [IND_TIPO_REPORTE] [varchar](1) NULL,  
 [NOMBRE_REPORTE] [varchar](50) NULL,  
 [COD_LEGISLACION1] [varchar](15) NULL,  
 [COD_LEGISLACION2] [varchar](15) NULL,  
 [COD_LEGISLACION3] [varchar](15) NULL,  
 [COD_LEGISLACION4] [varchar](15) NULL,  
 [COD_LEGISLACION5] [varchar](15) NULL,  
 [FEC_CREACION] [datetime] NULL,  
 [ID_USUARIO_CREA] [varchar](17) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [ID_USUARIO_MODIF] [varchar](17) NULL,  
 CONSTRAINT [PKEY1_SIM_SG_TIPO_RESOLCOD_TIP] PRIMARY KEY CLUSTERED   
( 
 [COD_TIPO_RESOL] ASC  
 
 
 
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_TR_ALT_CONTRA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_TR_ALT_CONTRA](  
 [NUM_SOLICITUD] [int] NOT NULL,  
 [NUM_CONTRATO] [varchar](50) NOT NULL,  
 [FEC_CONTRATO] [datetime] NULL,  
 [FEC_INI_CONTRATO] [datetime] NULL,  
 [FEC_FIN_CONTRATO] [datetime] NULL,  
 [NUM_ANNIO] [smallint] NOT NULL,  
 [NUM_CARNET] [int] NULL,  
 [FEC_CARNET] [datetime] NULL,  
 [NUM_CANT_CONTRA] [smallint] NULL,  
 [IND_ESTADO] [varchar](1) NULL,  
 [OBS_OBSERVACION] [varchar](1000) NULL,  
 CONSTRAINT [PKpkey1_SIM_TR_ALT_CONTRANUM_A] PRIMARY KEY CLUSTERED   
( 
 [NUM_ANNIO] ASC,  
 [NUM_SOLICITUD] ASC,  
 [NUM_CONTRATO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_TR_CONDICION]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_TR_CONDICION](  
 [COD_CONDICION] [varchar](1) NOT NULL,  
 [NOM_CONDICION] [varchar](15) NULL,  
 CONSTRAINT [PKOKEY1_SIM_TR_CONDICIONCOD_CO] PRIMARY KEY CLUSTERED   
( 
 [COD_CONDICION] ASC  
 
 
 
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_TR_CUPO_ASIGN]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_TR_CUPO_ASIGN](  
 [NUM_SOLICITUD] [int] NOT NULL,  
 [NUM_PERMISO] [int] NULL,  
 [FEC_PERMISO] [datetime] NULL,  
 [FEC_VENCE_PERMISO] [datetime] NULL,  
 [NUM_REG_FILIACION] [int] NULL,  
 [FEC_ENTRADA] [datetime] NULL,  
 [FEC_SALIDA] [datetime] NULL,  
 [NUM_ANNIO] [smallint] NOT NULL,  
 [IND_ESTADO] [varchar](1) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 CONSTRAINT [PKpkey1_SIM_TR_CUPO_ASIGNNUM_A] PRIMARY KEY CLUSTERED   
( 
 [NUM_ANNIO] ASC,  
 [NUM_SOLICITUD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_TR_IND_REF_AS]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_TR_IND_REF_AS](  
 [COD_REFAS] [varchar](1) NOT NULL,  
 [DESCRIPCION] [varchar](50) NULL,  
 CONSTRAINT [PKpkCODREFAS_SIM_TR_IND_REF_AS] PRIMARY KEY CLUSTERED   
( 
 [COD_REFAS] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
 
 
 
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_TR_LOCALES]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_TR_LOCALES](  
 [ID_LOCAL] [smallint] NOT NULL,  
 [NOM_LOCAL] [varchar](100) NULL,  
 [NUM_CUPOS] [smallint] NULL,  
 [NOM_CONTACTO] [varchar](50) NULL,  
 [NUM_TEL_1] [varchar](15) NULL,  
 [NUM_TEL_2] [varchar](15) NULL,  
 [NUM_CUPOS_DISP] [smallint] NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [DIR_DIRECCION] [varchar](500) NULL,  
 [NOM_REPRESENTANTE] [varchar](70) NULL,  
 [CED_REPRESENTATE] [varchar](17) NULL,  
 CONSTRAINT [PKEY1_SIM_TR_LOCALESID_LOCAL_] PRIMARY KEY CLUSTERED   
( 
 [ID_LOCAL] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_TR_ORG_REF]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_TR_ORG_REF](  
 [COD_ORGANISMO] [varchar](5) NOT NULL,  
 [DESCRIPCION] [varchar](50) NULL,  
 CONSTRAINT [PKpkey_SIM_TR_ORG_REFCOD_ORGAN] PRIMARY KEY CLUSTERED   
( 
 [COD_ORGANISMO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
 
 
 
/****** Object:   Table [dbo].[SIM_TR_PERM_ENTRA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_TR_PERM_ENTRA](  
 [NUM_REGISTRO] [int] NOT NULL,  
 [NUM_PERMISO] [int] NOT NULL,  
 [NUM_CARNET] [int] NULL,  
 [FEC_EMISION] [datetime] NULL,  
 [FEC_VENCE] [datetime] NULL,  
 [COD_CALIDAD] [varchar](2) NULL,  
 [NOM_SOLICITANTE] [varchar](75) NULL,  
 [NOM_LUGAR_TRABAJA] [varchar](100) NULL,  
 [FEC_SOL_PERM] [datetime] NULL,  
 [COD_TSOLICTAN] [varchar](1) NULL,  
 [NUM_CONT_TRAB] [varchar](25) NULL,  
 [NUM_PERM_TRAB] [varchar](25) NULL,  
 [IND_PAZYSALVO] [varchar](1) NULL,  
 [COD_CIA_TRANSP] [varchar](3) NULL,  
 [FEC_SALIDA_EST] [datetime] NULL,  
 [NUM_TIEMPO_SOL] [smallint] NULL,  
 [IND_TIEMPO_SOL] [varchar](1) NULL,  
 [IND_USUA_MODIF] [varchar](20) NULL,  
 [FEC_ACUTALIZA] [datetime] NULL,  
 CONSTRAINT [PKPkey1_SIM_TR_PERM_ENTRANUM_R] PRIMARY KEY CLUSTERED   
( 
 [NUM_REGISTRO] ASC,  
 [NUM_PERMISO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_TR_PRO_PENTRA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_TR_PRO_PENTRA](  
 [NUM_REGISTRO] [int] NOT NULL,  
 [NUM_PERMISO] [int] NOT NULL,  
 [FEC_SOLICITUD] [datetime] NOT NULL,  
 [COD_TIPO_PRORROGA] [varchar](3) NULL,  
 [DES_MOTI_PRORROGA] [varchar](1000) NULL,  
 
 
 
 [NUM_TIEMPO_SOL] [smallint] NULL,  
 [IND_TIEMPO_SOL] [varchar](1) NULL,  
 [FEC_EMISION_PRO] [datetime] NULL,  
 [FEC_VENCE_PRO] [datetime] NULL,  
 [NUM_TIEMPO_PRO] [smallint] NULL,  
 [IND_TIEMPO_PRO] [varchar](1) NULL,  
 [COD_CIA_TRANSP] [varchar](3) NULL,  
 [NUM_PASAJE] [varchar](15) NULL,  
 [NUM_CARNET_PRO] [smallint] NULL,  
 [COD_STAT_ACTUAL] [varchar](3) NULL,  
 [IND_USUA_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 CONSTRAINT [PKEY1_SIM_TR_PRO_PENTRANUM_REG] PRIMARY KEY CLUSTERED   
( 
 [NUM_REGISTRO] ASC,  
 [NUM_PERMISO] ASC,  
 [FEC_SOLICITUD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_TR_REF_ASIL]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_TR_REF_ASIL](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [FEC_SOLICITUD] [datetime] NOT NULL,  
 [NUM_RESUELTO] [smallint] NULL,  
 [COD_DEP_EXP] [varchar](1) NOT NULL,  
 [IND_ESTATUS] [varchar](1) NOT NULL,  
 [OBS_OBSERVACION] [varchar](1000) NULL,  
 [TIEMPO_SOLICITADO] [smallint] NULL,  
 [COD_CALIDAD] [varchar](2) NULL,  
 [NUMERO_CARNET] [varchar](15) NULL,  
 [NUM_SOLIC_ORG] [varchar](15) NULL,  
 [FEC_SOL_ORG] [datetime] NULL,  
 [FEC_VENCIMTO] [datetime] NULL,  
 [ESTATUS_SOLIC] [varchar](1) NULL,  
 [ORG_SOLICITA] [varchar](5) NULL,  
 [STATUS_MIG] [varchar](3) NULL,  
 [ID_USUAR_CREA] [varchar](20) NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 
 
 
 [IND_TIEMPO_SOL] [varchar](1) NULL,  
 [FEC_APROBADO] [datetime] NULL,  
 [HITS_REFASIL] [int] NULL,  
 CONSTRAINT [PKpkey1_SIM_TR_REF_ASILNUM_REG] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [FEC_SOLICITUD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_TR_SOL_ALTERN]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_TR_SOL_ALTERN](  
 [NUM_ANNIO] [smallint] NOT NULL,  
 [NUM_SOLICITUD] [int] NOT NULL,  
 [NOM_PRIMER_APELL] [varchar](25) NOT NULL,  
 [NOM_SEGUND_APELL] [varchar](25) NULL,  
 [NOM_PRIMER_NOMB] [varchar](25) NOT NULL,  
 [NOM_SEGUND_NOMB] [varchar](25) NULL,  
 [COD_NACION_ACTUAL] [varchar](3) NOT NULL,  
 [FEC_NACIM] [datetime] NOT NULL,  
 [NUM_PASAPORTE] [varchar](17) NOT NULL,  
 [ID_LOCAL] [smallint] NOT NULL,  
 [NOM_PADRE] [varchar](50) NULL,  
 [NOM_MADRE] [varchar](50) NULL,  
 [FEC_SOLICITUD] [datetime] NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [ID_ACTUALIZA] [varchar](20) NULL,  
 [IND_AUTORIZ_NEGAC] [varchar](1) NOT NULL,  
 [OBSERVACION] [varchar](1000) NULL,  
 [NUM_CANT_CONTRA] [smallint] NULL,  
 [IND_ESTADO] [varchar](1) NULL,  
 CONSTRAINT [PKEY1_SIM_TR_SOL_ALTERNNUM_ANN] PRIMARY KEY CLUSTERED   
( 
 [NUM_ANNIO] ASC,  
 [NUM_SOLICITUD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
 
 
 
/****** Object:   Table [dbo].[SIM_TR_TSOLICITAN]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_TR_TSOLICITAN](  
 [COD_TSOLICITAN] [varchar](50) NOT NULL,  
 [NOM_TSOLICITAN] [varchar](15) NULL,  
 CONSTRAINT [PKPkey1_SIM_TR_TSOLICITANCOD_T] PRIMARY KEY CLUSTERED   
( 
 [COD_TSOLICITAN] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VA_CONDICION]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VA_CONDICION](  
 [COD_CONDICION] [varchar](1) NOT NULL,  
 [NOM_CONDICION] [varchar](20) NULL,  
 CONSTRAINT [PKpkey1_SIM_VA_CONDICIONCOD_CO] PRIMARY KEY CLUSTERED   
( 
 [COD_CONDICION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VA_CONSULADOS]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VA_CONSULADOS](  
 [COD_CONSULADO] [varchar](3) NOT NULL,  
 [NOM_CONSUL] [varchar](50) NOT NULL,  
 [COD_PAIS] [varchar](3) NOT NULL,  
 [NOM_ESTADO] [varchar](50) NOT NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 
 
 
 [TIPO_CARGO] [varchar](2) NULL,  
 [DIR_DIRECCION_LUG] [varchar](100) NULL,  
 [DIR_APARTADO] [varchar](100) NULL,  
 [IND_TIPO_PUESTO] [varchar](1) NULL,  
 [TEL_TELEFONO_1] [varchar](30) NULL,  
 [TEL_TELEFONO_2] [varchar](30) NULL,  
 [TEL_FAX] [varchar](30) NULL,  
 [TEL_TELEX] [varchar](30) NULL,  
 [DIR_EMAIL] [varchar](50) NULL,  
 CONSTRAINT [PKpkey1_SIM_VA_CONSULADOSCOD_C] PRIMARY KEY CLUSTERED   
( 
 [COD_CONSULADO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VA_CONT_GRUPO]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VA_CONT_GRUPO](  
 [DESC_GRUPO] [varchar](1000) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [NUM_CONTROL] [int] NOT NULL,  
 CONSTRAINT [PKEY1_SIM_VA_CONT_GRUPONUM_CON] PRIMARY KEY CLUSTERED   
( 
 [NUM_CONTROL] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VA_GENERALES]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VA_GENERALES](  
 [NUM_REGISTRO] [int] NOT NULL,  
 [NUM_REG_DIGITAL] [int] NULL,  
 [NOM_PRIMER_APELL] [varchar](25) NOT NULL,  
 [NOM_SEGUND_APELL] [varchar](25) NULL,  
 
 
 
 [NOM_CASADA_APELL] [varchar](25) NULL,  
 [NOM_PRIMER_NOM] [varchar](25) NOT NULL,  
 [NOM_SEGUND_NOM] [varchar](25) NULL,  
 [COD_NACION_ACTUAL] [varchar](3) NOT NULL,  
 [IND_SEXO] [varchar](1) NOT NULL,  
 [NUM_DOC_VIAJE] [varchar](15) NOT NULL,  
 [LUG_EXPED_PASAPOR] [varchar](50) NULL,  
 [FEC_EXPED_PASAPOR] [datetime] NOT NULL,  
 [FEC_VENCE_PASAPOR] [datetime] NOT NULL,  
 [FEC_NACIMIENTO] [datetime] NOT NULL,  
 [ID_USUAR_CREA] [varchar](20) NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [NOM_CORREO_ELEC] [varchar](50) NULL,  
 [NUM_REGISTRO_SOL] [int] NULL,  
 [TIP_DOC_VIAJE] [varchar](2) NOT NULL,  
 [NOM_PAIS_NACIO] [varchar](50) NULL,  
 CONSTRAINT [PKpkey1_SIM_VA_GENERALESNUM_RE] PRIMARY KEY CLUSTERED   
( 
 [NUM_REGISTRO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VA_GRALES_SOL]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VA_GRALES_SOL](  
 [NUM_REGISTRO] [int] NOT NULL,  
 [NUM_REG_DIGITAL] [int] NULL,  
 [NOM_PRIMER_APELL] [varchar](25) NOT NULL,  
 [NOM_SEGUND_APELL] [varchar](25) NULL,  
 [NOM_CASADA_APELL] [varchar](25) NULL,  
 [NOM_PRIMER_NOMB] [varchar](25) NOT NULL,  
 [NOM_SEGUND_NOM] [varchar](25) NULL,  
 [COD_NACION_ACTUAL] [varchar](3) NOT NULL,  
 [IND_SEXO] [varchar](1) NOT NULL,  
 [LUG_EXPED_PASAPOR] [varchar](50) NULL,  
 [FEC_EXPED_PASAPOR] [datetime] NOT NULL,  
 [FEC_VENCE_PASAPOR] [datetime] NOT NULL,  
 [FEC_NACIMIENTO] [datetime] NOT NULL,  
 [ID_USUAR_CREA] [varchar](20) NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 
 
 
 [FEC_ACTUALIZA] [datetime] NULL,  
 [NOM_CORREO_ELECT] [varchar](50) NULL,  
 [NUM_DOC_VIAJE] [varchar](15) NOT NULL,  
 [TIP_DOC_VIAJE] [varchar](50) NOT NULL,  
 [NOM_PAIS_NACIO] [varchar](50) NULL,  
 CONSTRAINT [PKpkey1_SIM_VA_GRALES_SOLNUM_R] PRIMARY KEY CLUSTERED   
( 
 [NUM_REGISTRO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VA_MOTIVO_AUT]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VA_MOTIVO_AUT](  
 [COD_MOTIVO_AUTOR] [varchar](2) NOT NULL,  
 [NOM_MOTIVO_AUTOR] [varchar](100) NOT NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [IND_AUTORIZ_NEGAC] [varchar](1) NULL,  
 CONSTRAINT [PKEY1_SIM_VA_MOTIVO_AUTCOD_MOT] PRIMARY KEY CLUSTERED   
( 
 [COD_MOTIVO_AUTOR] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VA_OBSERVA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VA_OBSERVA](  
 [NUM_REGISTRO] [int] NOT NULL,  
 [FEC_OBSERVACION] [datetime] NOT NULL,  
 [OBS_OBSERVACION] [varchar](1000) NOT NULL,  
 [ID_USUARIO_CREA] [varchar](20) NULL,  
 [ID_USUARIO_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [NUM_OBSERVACION] [int] IDENTITY(1,1) NOT NULL,  
 
 
 
 CONSTRAINT [PKpkey1_SIM_VA_OBSERVANUM_REGI] PRIMARY KEY CLUSTERED   
( 
 [NUM_REGISTRO] ASC,  
 [NUM_OBSERVACION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VA_SI_NO]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VA_SI_NO](  
 [COD_SI_NO] [varchar](1) NOT NULL,  
 [NOM_SI_NO] [varchar](2) NULL,  
 CONSTRAINT [PKpkey1_SIM_VA_SI_NOCOD_SI_NO_] PRIMARY KEY CLUSTERED   
( 
 [COD_SI_NO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VA_TIP_MOTIVO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VA_TIP_MOTIVO](  
 [COD_TIP_MOTIVO] [varchar](1) NULL,  
 [NOM_TIP_MOTIVO] [varchar](12) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VA_TIP_PUESTO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VA_TIP_PUESTO](  
 [COD_TIPO_PUESTO] [varchar](1) NOT NULL,  
 [NOM_TIPO_PUESTO] [varchar](10) NULL,  
 CONSTRAINT [PKEY1_SIM_VA_TIP_PUESTOCOD_TIP] PRIMARY KEY CLUSTERED   
( 
 
 
 
 [COD_TIPO_PUESTO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VA_VAUTOR]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VA_VAUTOR](  
 [NUM_REGISTRO] [int] NOT NULL,  
 [FEC_SOLICITUD] [datetime] NOT NULL,  
 [NOM_SOLICITANTE] [varchar](50) NOT NULL,  
 [COD_VISA] [varchar](3) NOT NULL,  
 [COD_CONSULADO] [varchar](3) NULL,  
 [FAX_CONSULADO] [varchar](30) NULL,  
 [OBS_OBSERVACION] [varchar](1000) NULL,  
 [NOM_RESP_PMA] [varchar](50) NULL,  
 [DIR_RESP_PMA] [varchar](50) NULL,  
 [TEL_RESP_PMA] [varchar](15) NULL,  
 [NUM_ESTADIA] [varchar](3) NOT NULL,  
 [NOM_MOTIVO_VIAJE] [varchar](1) NOT NULL,  
 [COD_PAIS_RESIDE] [varchar](3) NOT NULL,  
 [DIR_SOLICITANTE] [varchar](50) NULL,  
 [TEL_SOLICITANTE] [varchar](15) NULL,  
 [NUM_REFERENCIA] [varchar](12) NULL,  
 [NUM_CONTROL] [int] NULL,  
 [NUM_NOTA] [int] NULL,  
 [FEC_ENVIO_CNS] [datetime] NULL,  
 [FEC_RETORNA_CNS] [datetime] NULL,  
 [FEC_TELEX] [datetime] NULL,  
 [NUM_PROVIAP] [varchar](12) NULL,  
 [FEC_AUTORIZ_NEGAC] [datetime] NULL,  
 [IND_AUTORIZ_NEGAC] [varchar](1) NULL,  
 [IND_PRORROGA] [varchar](1) NULL,  
 [NUM_DIAS_VALIDEZ] [smallint] NULL,  
 [NUM_MES_VALIDEZ] [smallint] NULL,  
 [NUM_ANIO_VALIDEZ] [smallint] NULL,  
 [IND_VALID_TRAMITE] [varchar](1) NULL,  
 [FEC_RECONSIDERA] [datetime] NULL,  
 [IND_ESTATUS] [varchar](1) NULL,  
 [ID_USUAR_CREA] [varchar](20) NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 
 
 
 [NUM_TARJETA_CRE] [varchar](30) NULL,  
 [NOM_CORREO_EMAIL] [varchar](50) NULL,  
 [IND_ESTADIA] [varchar](1) NOT NULL,  
 [COD_MOTIVO_AUTOR] [varchar](2) NULL,  
 [FEC_ENTRADA] [datetime] NULL,  
 [FEC_SOL_RECON] [datetime] NULL,  
 [NUM_DIAS_RECON] [smallint] NULL,  
 [IND_AUTNEG_RECON] [varchar](1) NULL,  
 [COD_BOLETA] [varchar](25) NULL,  
 CONSTRAINT [PKpkey1_SIM_VA_VAUTORNUM_REGIS] PRIMARY KEY CLUSTERED   
( 
 [NUM_REGISTRO] ASC,  
 [FEC_SOLICITUD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VA_VAUTOR_SOL]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VA_VAUTOR_SOL](  
 [NUM_REGISTRO] [int] NOT NULL,  
 [FEC_SOLICITUD] [datetime] NOT NULL,  
 [NOM_SOLICITANTE] [varchar](50) NOT NULL,  
 [COD_VISA] [varchar](3) NOT NULL,  
 [COD_CONSULADO] [varchar](3) NULL,  
 [FAX_CONSULADO] [varchar](30) NULL,  
 [OBS_OBSERVACION] [varchar](1000) NULL,  
 [NOM_RESP_PMA] [varchar](50) NULL,  
 [DIR_RESP_PMA] [varchar](50) NULL,  
 [TEL_RESP_PMA] [varchar](15) NULL,  
 [NUM_ESTADIA] [varchar](3) NOT NULL,  
 [NOM_MOTIVO_VIAJE] [varchar](1) NOT NULL,  
 [COD_PAIS_RESIDE] [varchar](3) NOT NULL,  
 [DIR_SOLICITANTE] [varchar](50) NULL,  
 [TEL_SOLICITANTE] [varchar](15) NULL,  
 [ID_USUARIO_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [NUM_TARJETA_CRE] [varchar](30) NULL,  
 [NOM_CORREO_EMAIL] [varchar](50) NULL,  
 [IND_ESTADIA] [varchar](1) NOT NULL,  
 [IND_PRORROGA] [varchar](1) NULL,  
 [IND_VALID_TRAMITE] [varchar](1) NULL,  
 
 
 
 CONSTRAINT [PKpkey1_SIM_VA_VAUTOR_SOLNUM_R] PRIMARY KEY CLUSTERED   
( 
 [NUM_REGISTRO] ASC,  
 [FEC_SOLICITUD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_ABOGADO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_ABOGADO](  
 [ID_ABOGADO] [varchar](20) NOT NULL,  
 [NOMBRE_ABOGADO] [varchar](50) NOT NULL,  
 [IND_PASANTE] [varchar](1) NULL,  
 [IDONEIDAD] [varchar](20) NULL,  
 [DIRECCION] [varchar](50) NULL,  
 [TELEFONO] [varchar](14) NULL,  
 [APARTADO] [varchar](20) NULL,  
 [NUMERO_DE_CARNET] [varchar](20) NULL,  
 [FEC_EXPEDICION] [datetime] NULL,  
 [FEC_EXPIRACION] [datetime] NULL,  
 [NOMBRE_FIRMA] [varchar](50) NULL,  
 CONSTRAINT [PKpkey_SIM_VI_ABOGADOID_ABOGAD] PRIMARY KEY CLUSTERED   
( 
 [ID_ABOGADO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_CARNET]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_CARNET](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [NUM_CARNET] [varchar](6) NOT NULL,  
 [FEC_EMIS_CARNET] [datetime] NULL,  
 [FEC_VENC_CARNET] [datetime] NULL,  
 [ID_USUARIO_CREA] [varchar](20) NULL,  
 
 
 
 [FEC_CREACION] [datetime] NULL,  
 [ID_USUARIO_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZACIÓN] [datetime] NULL,  
 [COD_TIPO_VISA] [varchar](3) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_CERTIFIC]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_CERTIFIC](  
 [NUM_SOLICITUD] [int] NOT NULL,  
 [FEC_SOLICITUD] [datetime] NULL,  
 [NUM_REG_FILIACION] [int] NULL,  
 [COD_BOLETA] [varchar](25) NULL,  
 [PARA_USO_DE] [varchar](50) NULL,  
 [FEC_CERTIFIC] [datetime] NULL,  
 [NUMERO_CERTIFIC] [int] NULL,  
 [NOM_JEFE_CERTIF] [varchar](50) NULL,  
 [TIPO_CERTIFIC] [varchar](1) NULL,  
 [TIEMPO_DURACION] [smallint] NULL,  
 [PERIODO_DURAC] [varchar](1) NULL,  
 [CERT_ANULADA] [varchar](1) NULL,  
 [FEC_ANULACION] [datetime] NULL,  
 [OBSERVA_ANULACION] [varchar](1000) NULL,  
 [ID_USUARIO_CREA] [varchar](17) NULL,  
 [ID_USUARIO_MODIF] [varchar](17) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [FEC_CREACION] [datetime] NULL,  
 CONSTRAINT [PKpkey1_SIM_VI_CERTIFICNUM_SOL] PRIMARY KEY CLUSTERED   
( 
 [NUM_SOLICITUD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_CHEQUE]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_CHEQUE](  
 [NUM_REG_FILIACION] [int] NULL,  
 
 
 
 [NUM_TRAMITE] [int] NULL,  
 [NUM_CHEQUE] [varchar](20) NOT NULL,  
 [COD_BANCO] [varchar](2) NOT NULL,  
 [FEC_CHEQUE] [datetime] NOT NULL,  
 [IND_ESTADO] [varchar](1) NULL,  
 [FEC_DEPOSITO] [datetime] NULL,  
 [NUM_DEPOSITO] [varchar](20) NULL,  
 [MONTO_CHEQUE] [numeric](10, 2) NULL,  
 [OBSERVACION] [varchar](250) NULL,  
 [ID_USUARIO_CREA] [varchar](17) NULL,  
 [ID_USUARIO_MODIF] [varchar](17) NULL,  
 [FEC_CREACION] [datetime] NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 CONSTRAINT [PKpkey1_SIM_VI_CHEQUENUM_CHEQU] PRIMARY KEY CLUSTERED   
( 
 [NUM_CHEQUE] ASC,  
 [COD_BANCO] ASC,  
 [FEC_CHEQUE] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_DEPENDTE]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_DEPENDTE](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [COD_TIPO_VISA] [varchar](3) NOT NULL,  
 [FEC_SOLICITUD] [datetime] NOT NULL,  
 [NUM_REG_FIL_DEP] [int] NOT NULL,  
 [ID_USUARIO_CREA] [varchar](17) NULL,  
 [ID_USUARIO_MODIF] [varchar](17) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [FEC_CREACION] [datetime] NULL,  
 [COD_PARENTESCO] [varchar](3) NOT NULL,  
 [IND_CONYUG] [varchar](1) NULL,  
 CONSTRAINT [PKpkey1_SIM_VI_DEPENDTENUM_REG] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [COD_TIPO_VISA] ASC,  
 [FEC_SOLICITUD] ASC,  
 [NUM_REG_FIL_DEP] ASC  
 
 
 
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_DESISTIMTO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_DESISTIMTO](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [FEC_SOLICITUD] [datetime] NOT NULL,  
 [NUM_RESUELTO] [smallint] NULL,  
 [FEC_APROBADO] [datetime] NULL,  
 [COD_STAT_ACTUAL] [varchar](3) NULL,  
 [IND_AUTORIZ_NEGAC] [varchar](1) NULL,  
 [MOTIVO] [varchar](250) NULL,  
 [ID_USUARIO_CREA] [varchar](17) NULL,  
 [ID_USUARIO_MODIF] [varchar](17) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [FEC_CREACION] [datetime] NULL,  
 [FEC_GEN_RESOL] [datetime] NULL,  
 [IND_BORRADOR] [varchar](1) NULL,  
 CONSTRAINT [PKpkey1_SIM_VI_DESISTIMTONUM_R] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [FEC_SOLICITUD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_DETENIDO]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_DETENIDO](  
 [COD_DETENIDO] [varchar](2) NOT NULL,  
 [NOM_DETENIDO] [varchar](50) NULL,  
 CONSTRAINT [PKIDX_DETENIDO_SIM_VI_DETENIDO] PRIMARY KEY CLUSTERED   
( 
 [COD_DETENIDO] ASC  
 
 
 
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_EST_SOLIC]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_EST_SOLIC](  
 [COD_ESTATUS] [varchar](1) NOT NULL,  
 [NOM_ESTATUS] [varchar](40) NULL,  
 CONSTRAINT [PKIDX_ESTATUS_SIM_VI_EST_SOLIC] PRIMARY KEY CLUSTERED   
( 
 [COD_ESTATUS] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_ESTAMP_ESP]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_ESTAMP_ESP](  
 [NUM_SOLIC] [int] NOT NULL,  
 [FEC_SOLICITUD] [datetime] NULL,  
 [NUM_REG_FILIACION] [int] NULL,  
 [OBSERVACION] [varchar](100) NULL,  
 [MONTO_TIMBRE] [numeric](10, 2) NULL,  
 [FEC_ENTREGA] [datetime] NULL,  
 [NUM_RESUELTO] [int] NULL,  
 [FEC_GEN_RESOL] [datetime] NULL,  
 [COD_TIPO_VISAE] [varchar](3) NULL,  
 [FEC_ESTAMPADO] [datetime] NULL,  
 [ID_USUARIO_CREA] [varchar](17) NULL,  
 [FEC_CREACION] [datetime] NULL,  
 [ID_USUARIO_MODIF] [varchar](17) NULL,  
 [FEC_MODIFICA] [datetime] NULL,  
 CONSTRAINT [PKID_ESTAMP_ESP_SIM_VI_ESTAMP_] PRIMARY KEY CLUSTERED   
( 
 [NUM_SOLIC] ASC  
 
 
 
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_ESTAMPADA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_ESTAMPADA](  
 [NUMERO_SOLICITUD] [int] NOT NULL,  
 [NUMERO_TARJETA] [varchar](25) NULL,  
 [NUMERO_PASAPORTE] [varchar](17) NULL,  
 [COD_TIPO_VISA] [varchar](3) NULL,  
 [COD_NACIONALIDAD] [varchar](3) NULL,  
 [PRIMER_NOMBRE] [varchar](25) NULL,  
 [SEGUNDO_NOMBRE] [varchar](25) NULL,  
 [PRIMER_APELLIDO] [varchar](25) NULL,  
 [SEGUNDO_APELLIDO] [varchar](25) NULL,  
 [APELLIDO_CASADA] [varchar](25) NULL,  
 [FEC_NACIMIENTO] [datetime] NULL,  
 [IND_SEXO] [varchar](1) NULL,  
 [COD_CATEG_ENTRADA] [varchar](1) NULL,  
 [PAIS_PROCEDENCIA] [varchar](3) NULL,  
 [FEC_ENTRADA] [datetime] NULL,  
 [FEC_ESTAMPADO] [datetime] NULL,  
 [MONTO_MULTA] [numeric](10, 2) NULL,  
 [IND_AUTORIZ_NEGAC] [varchar](1) NULL,  
 [FEC_VENCMTO] [datetime] NULL,  
 [ID_USUARIO_CREA] [varchar](17) NULL,  
 [FEC_CREACION] [datetime] NULL,  
 [ID_USUARIO_MODIF] [varchar](17) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 CONSTRAINT [PKpkey1_SIM_VI_ESTAMPADANUMERO] PRIMARY KEY CLUSTERED   
( 
 [NUMERO_SOLICITUD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_IDBORRADOR]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
 
 
 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_IDBORRADOR](  
 [IND_BORRADOR] [varchar](1) NOT NULL,  
 [BORRADOR] [varchar](25) NULL,  
 CONSTRAINT [PKIDX_BORRADOR_SIM_VI_IDBORRAD] PRIMARY KEY CLUSTERED   
( 
 [IND_BORRADOR] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_IND_APRNG]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_IND_APRNG](  
 [COD_APRNEG] [varchar](1) NOT NULL,  
 [NOM_APRNEG] [varchar](15) NULL,  
 CONSTRAINT [PKpkey1_SIM_VI_IND_APRNGCOD_AP] PRIMARY KEY CLUSTERED   
( 
 [COD_APRNEG] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_INST_ENVIA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_INST_ENVIA](  
 [COD_INSTITUCION] [varchar](1) NOT NULL,  
 [NOM_INSTITUCION] [varchar](40) NULL,  
 CONSTRAINT [PKIDX_INST_SIM_VI_INST_ENVIACO] PRIMARY KEY CLUSTERED   
( 
 [COD_INSTITUCION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
 
 
 
/****** Object:   Table [dbo].[SIM_VI_LEGISL]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_LEGISL](  
 [COD_LEGISLACION] [varchar](15) NOT NULL,  
 [DESCRIP_LEGISLA] [varchar](1000) NULL,  
 [ID_USUARIO_CREA] [varchar](17) NULL,  
 [ID_USUARIO_MODIF] [varchar](17) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [FEC_CREACION] [datetime] NULL,  
 CONSTRAINT [PKpkey1_SIM_VI_LEGISLCOD_LEGIS] PRIMARY KEY CLUSTERED   
( 
 [COD_LEGISLACION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_LOG_NPRI]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_LOG_NPRI](  
 [NUM_ANNIO] [varchar](4) NOT NULL,  
 [NUM_TRAMITE] [int] NOT NULL,  
 [FECHA] [datetime] NOT NULL,  
 [HORA] [datetime] NOT NULL,  
 [USUARIO] [varchar](17) NULL,  
 [IND_PRIORIDAD_ANT] [varchar](2) NULL,  
 [IND_PRIORIDAD] [varchar](2) NULL,  
 CONSTRAINT [PKANIO_TRAM_FH_SIM_VI_LOG_NPRI] PRIMARY KEY CLUSTERED   
( 
 [NUM_ANNIO] ASC,  
 [NUM_TRAMITE] ASC,  
 [FECHA] ASC,  
 [HORA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_MODULO]     Script Date: 16 -05-2025 13:14:43 
******/  
 
 
 
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_MODULO](  
 [COD_MODULO] [varchar](2) NOT NULL,  
 [NOM_MODULO] [varchar](15) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [ID_USUAR_MODIF] [varchar](17) NULL,  
 CONSTRAINT [PKpkey1_SIM_VI_MODULOCOD_MODUL] PRIMARY KEY CLUSTERED   
( 
 [COD_MODULO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_MULTA_AER]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_MULTA_AER](  
 [COD_COMPANIA] [varchar](3) NOT NULL,  
 [NUM_VUELO] [varchar](20) NOT NULL,  
 [FEC_VUELO] [datetime] NOT NULL,  
 [HORA_VUELO] [smallint] NOT NULL,  
 [MIN_VUELO] [smallint] NOT NULL,  
 [MONTO_MULTA] [numeric](10, 2) NULL,  
 [OBSERVACION] [varchar](1000) NULL,  
 [NOMBRE_REPRES_LEGAL] [varchar](50) NULL,  
 [CARGO_REPRES_LEGAL] [varchar](50) NULL,  
 [ID_USUARIO_CREA] [varchar](17) NULL,  
 [ID_USUARIO_MODIF] [varchar](17) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [FEC_CREACION] [datetime] NULL,  
 [FEC_PAGO] [datetime] NULL,  
 [FEC_MULTA] [datetime] NULL,  
 [COD_PAIS_PROCED] [varchar](3) NULL,  
 [FEC_GEN_RESOL] [datetime] NULL,  
 [NUM_RESUELTO] [int] NULL,  
 [IND_BORRADOR] [varchar](1) NULL,  
 CONSTRAINT [PKpkey1_SIM_VI_MULTA_AERCOD_CO] PRIMARY KEY CLUSTERED   
( 
 [COD_COMPANIA] ASC,  
 [NUM_VUELO] ASC,  
 
 
 
 [FEC_VUELO] ASC,  
 [HORA_VUELO] ASC,  
 [MIN_VUELO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_MULTA_PASJ]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_MULTA_PASJ](  
 [COD_COMPANIA] [varchar](3) NOT NULL,  
 [NUM_VUELO] [varchar](20) NOT NULL,  
 [FEC_VUELO] [datetime] NOT NULL,  
 [HORA_VUELO] [smallint] NOT NULL,  
 [MIN_VUELO] [smallint] NOT NULL,  
 [NUM_PASAPORTE] [varchar](17) NOT NULL,  
 [COD_NACION_ACTUAL] [varchar](3) NOT NULL,  
 [NOM_PRIMER_APELL] [varchar](25) NOT NULL,  
 [NOM_SEGUND_APELL] [varchar](25) NULL,  
 [NOM_CASADA_APELL] [varchar](25) NULL,  
 [NOM_PRIMER_NOMB] [varchar](25) NOT NULL,  
 [NOM_SEGUND_NOMB] [varchar](25) NULL,  
 [IND_SEXO] [varchar](1) NOT NULL,  
 [ID_USUARIO_CREA] [varchar](17) NULL,  
 [ID_USUARIO_MODIF] [varchar](17) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [FEC_CREACION] [datetime] NULL,  
 CONSTRAINT [PKpkey1_SIM_VI_MULTA_PASJCOD_C] PRIMARY KEY CLUSTERED   
( 
 [COD_COMPANIA] ASC,  
 [NUM_VUELO] ASC,  
 [FEC_VUELO] ASC,  
 [HORA_VUELO] ASC,  
 [MIN_VUELO] ASC,  
 [NUM_PASAPORTE] ASC,  
 [COD_NACION_ACTUAL] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
 
 
 
/****** Object:   Table [dbo].[SIM_VI_MULTREST]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_MULTREST](  
 [NUM_SOLICITUD] [int] NOT NULL,  
 [FEC_SOLICITUD] [datetime] NULL,  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [COD_NACIONAL] [varchar](3) NOT NULL,  
 [NUM_PASAPORTE] [varchar](17) NULL,  
 [NUM_ID] [varchar](17) NULL,  
 [COD_ABOGADO] [varchar](20) NULL,  
 [COD_APRNEG] [varchar](1) NULL,  
 [FEC_APROBNEG] [datetime] NULL,  
 [TIEMPO_VISA] [smallint] NULL,  
 [PERIODO_VISA] [varchar](1) NULL,  
 [ID_USUAR_CREA] [varchar](20) NULL,  
 [FEC_CREACION] [datetime] NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 CONSTRAINT [PKID_MULTREST_SIM_VI_MULTRESTN] PRIMARY KEY CLUSTERED   
( 
 [NUM_SOLICITUD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_PARM_CNAT]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_PARM_CNAT](  
 [USUARIO] [varchar](17) NOT NULL,  
 [FECHA] [datetime] NOT NULL,  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [INSTITUCION] [varchar](3) NULL,  
 CONSTRAINT [PKPpkey_SIM_VI_PARM_CNATUSUARI] PRIMARY KEY CLUSTERED   
( 
 [USUARIO] ASC,  
 [FECHA] ASC,  
 [NUM_REG_FILIACION] ASC  
 
 
 
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_PERM_ESP]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_PERM_ESP](  
 [NUM_PERMISO] [int] NOT NULL,  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [ID_ABOGADO] [varchar](20) NULL,  
 [FECHA_SOLICITUD] [datetime] NULL,  
 [OBSERVACION] [varchar](100) NULL,  
 [NUM_CARNET] [varchar](6) NULL,  
 [IND_APROB_NEG] [varchar](1) NULL,  
 [FECHA_APROBNEG] [datetime] NULL,  
 [NUM_TIEMPO] [smallint] NULL,  
 [IND_TIEMPO_PER] [varchar](1) NULL,  
 [COD_TIPO_VISA] [varchar](3) NULL,  
 [ID_USUAR_CREA] [varchar](17) NULL,  
 [FEC_CREACION] [datetime] NULL,  
 [ID_USUAR_MODIF] [varchar](17) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [COD_MOTIVO] [varchar](3) NULL,  
 CONSTRAINT [PKID_PERM_ESP_SIM_VI_PERM_ESPN] PRIMARY KEY CLUSTERED   
( 
 [NUM_PERMISO] ASC,  
 [NUM_REG_FILIACION] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_PERMES_MOT]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_PERMES_MOT](  
 [COD_MOTIVO] [varchar](2) NOT NULL,  
 [NOM_MOTIVO] [varchar](50) NULL,  
 CONSTRAINT [PK_SIM_VI_PERMES_MOT] PRIMARY KEY CLUSTERED   
 
 
 
( 
 [COD_MOTIVO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_RENTISTA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_RENTISTA](  
 [NUM_SOLICITUD] [int] NOT NULL,  
 [FEC_SOLICITUD] [datetime] NOT NULL,  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [NUM_PASAPORTE] [varchar](17) NULL,  
 [FEC_EXPEDICION] [datetime] NULL,  
 [LUGAR_EXPEDICION] [varchar](50) NULL,  
 [MONTO_PASAPORTE] [numeric](10, 2) NULL,  
 [NUM_RECIBO] [varchar](20) NULL,  
 [FEC_ENTREGA] [datetime] NULL,  
 [NUM_RESUELTO] [int] NULL,  
 [FEC_GEN_RESOL] [datetime] NULL,  
 [ID_USUARIO_CREA] [varchar](17) NULL,  
 [FEC_CREACION] [datetime] NULL,  
 [ID_USUARIO_MODIF] [varchar](17) NULL,  
 [FEC_MODIFICA] [datetime] NULL,  
 CONSTRAINT [PKIND_RENIST_SIM_VI_RENTISTANU] PRIMARY KEY CLUSTERED   
( 
 [NUM_SOLICITUD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_RENTPOVISA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_RENTPOVISA](  
 [TPO_VISAR] [varchar](3) NOT NULL,  
 [MODULO] [varchar](2) NULL,  
 [TPO_VISAOP] [varchar](1) NULL,  
 
 
 
 [ID_USUARIO] [varchar](17) NULL,  
 [FECHA_ACT] [datetime] NULL,  
 CONSTRAINT [PKID_RENTPOVISA_SIM_VI_RENTPOV] PRIMARY KEY CLUSTERED   
( 
 [TPO_VISAR] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_SALVOCOND]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_SALVOCOND](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [TIPO_SALVOCOND] [varchar](3) NOT NULL,  
 [FEC_SOLICITUD] [datetime] NOT NULL,  
 [IND_AUTORIZ_NEGAC] [varchar](1) NULL,  
 [FEC_APROBACION] [datetime] NULL,  
 [OBSERVACION] [varchar](250) NULL,  
 [IND_CONDICION] [varchar](1) NULL,  
 [IND_ESTATUS] [varchar](1) NULL,  
 [ID_ABOGADO] [varchar](20) NULL,  
 [NUM_RESUELTO] [int] NULL,  
 [NUM_SALVOCOND] [int] NULL,  
 [TIEMPO_DURACION] [smallint] NULL,  
 [COD_PERIODO] [varchar](1) NULL,  
 [FEC_ENTREGA] [datetime] NULL,  
 [FEC_EXPIRACION] [datetime] NULL,  
 [ID_USUARIO_CREA] [varchar](17) NULL,  
 [ID_USUARIO_MODIF] [varchar](17) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [FEC_CREACION] [datetime] NULL,  
 [FEC_GEN_RESOL] [datetime] NULL,  
 [HITS_SSAL] [int] NULL,  
 [IND_BORRADOR] [varchar](1) NULL,  
 CONSTRAINT [PKpkey1_SIM_VI_SALVOCONDNUM_RE] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [TIPO_SALVOCOND] ASC,  
 [FEC_SOLICITUD] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
 
 
 
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_SOLICITUD]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_SOLICITUD](  
 [NUM_ANNIO] [varchar](4) NULL,  
 [NUM_TRAMITE] [int] NULL,  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [COD_TIPO_VISA] [varchar](3) NOT NULL,  
 [FEC_SOLICITUD] [datetime] NOT NULL,  
 [IND_ESTATUS] [varchar](1) NULL,  
 [NUM_CARNET] [varchar](6) NULL,  
 [COD_STAT_ACTUAL] [varchar](3) NULL,  
 [FEC_APROBADO] [datetime] NULL,  
 [FEC_ENTREGA] [datetime] NULL,  
 [FEC_CANCELA] [datetime] NULL,  
 [NUM_AMPARADOS] [smallint] NULL,  
 [NUM_RESUELTO] [smallint] NULL,  
 [NOM_EMPRESA] [varchar](60) NULL,  
 [NOM_RESPONSABLE] [varchar](60) NULL,  
 [MONTO_CAPITAL] [numeric](10, 2) NULL,  
 [FEC_EXPIRACION] [datetime] NULL,  
 [ID_USUARIO_CREA] [varchar](17) NULL,  
 [ID_USUARIO_MODIF] [varchar](17) NULL,  
 [FEC_ACTUALIZACION] [datetime] NULL,  
 [FEC_CREACION] [datetime] NULL,  
 [ID_ABOGADO] [varchar](20) NOT NULL,  
 [IND_APROB_NEG] [varchar](1) NULL,  
 [FEC_EMISION_CARNET] [datetime] NULL,  
 [OBSERVACION] [varchar](1000) NULL,  
 [FEC_GEN_RESOL] [datetime] NULL,  
 [HITS_SOLIC] [int] NULL,  
 [NUM_EXP_CARNET] [varchar](20) NULL,  
 [FEC_VENC_CARNET] [datetime] NULL,  
 [IND_BORRADOR] [varchar](1) NULL,  
 [NUM_CHEQUE] [varchar](20) NULL,  
 [COD_BANCO] [varchar](2) NULL,  
 [FEC_CHEQUE] [datetime] NULL,  
 CONSTRAINT [PKpkey1_SIM_VI_SOLICITUDNUM_RE] PRIMARY KEY CLUSTERED   
( 
 [NUM_REG_FILIACION] ASC,  
 [COD_TIPO_VISA] ASC,  
 [FEC_SOLICITUD] ASC  
 
 
 
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_STAT_MIGRA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_STAT_MIGRA](  
 [COD_STATUS] [varchar](3) NOT NULL,  
 [NOM_STATUS] [varchar](250) NOT NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [ID_USUAR_MODIF] [varchar](17) NULL,  
 CONSTRAINT [PKkey1_SIM_VI_STAT_MIGRACOD_ST] PRIMARY KEY CLUSTERED   
( 
 [COD_STATUS] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_TIP_CERTIF]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_TIP_CERTIF](  
 [COD_CERTIF] [varchar](1) NOT NULL,  
 [NOMBRE_CERTIF] [varchar](20) NULL,  
 CONSTRAINT [PKpkey_SIM_VI_TIP_CERTIFCOD_CE] PRIMARY KEY CLUSTERED   
( 
 [COD_CERTIF] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_TIP_SALVOC]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
 
 
 
CREATE TABLE [dbo].[SIM_VI_TIP_SALVOC](  
 [CODIGO] [varchar](3) NOT NULL,  
 [DESCRIPCION] [varchar](50) NULL,  
 CONSTRAINT [PKpkey1_SIM_VI_TIP_SALVOCCODIG] PRIMARY KEY CLUSTERED   
( 
 [CODIGO] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_TIPO_VISA]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_TIPO_VISA](  
 [COD_TIPO_VISA] [varchar](3) NOT NULL,  
 [NOM_TIPO_VISA] [varchar](250) NOT NULL,  
 [COD_MODULO] [varchar](2) NOT NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [ID_USUAR_MODIF] [varchar](17) NULL,  
 CONSTRAINT [PKEY1_SIM_VI_TIPO_VISACOD_TIPO] PRIMARY KEY CLUSTERED   
( 
 [COD_TIPO_VISA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[SIM_VI_VISA_RESOL]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_VISA_RESOL](  
 [COD_TIPO_VISA] [varchar](3) NOT NULL,  
 [COD_TIPO_RESOL] [varchar](3) NULL,  
 CONSTRAINT [PKpkey1_SIM_VI_VISA_RESOLCOD_T] PRIMARY KEY CLUSTERED   
( 
 [COD_TIPO_VISA] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
 
 
 
GO 
/****** Object:   Table [dbo].[SIM_VI_VISAREG]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[SIM_VI_VISAREG](  
 [TPO_VISAREG] [varchar](1) NOT NULL,  
 [VISA_REG] [varchar](40) NULL,  
 CONSTRAINT [PKID_VISAREG_SIM_VI_VISAREGTPO] PRIMARY KEY CLUSTERED   
( 
 [TPO_VISAREG] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[sysworkgen]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[sysworkgen](  
 [NUM_REG_FILIACION] [int] NULL,  
 [NOM_CAMPO] [nvarchar](25) NULL,  
 [DES_CAMPO] [nvarchar](25) NULL,  
 [VALOR_ANT] [nvarchar](25) NULL,  
 [VALOR_NVO] [nvarchar](25) NULL,  
 [USUARIO_MODIFICACION] [nvarchar](25) NULL,  
 [FEC_MODIF] [datetime] NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[sysworkgene]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[sysworkgene](  
 [num_reg_filiacion] [int] NOT NULL,  
 [nom_primer_apell] [varchar](25) NOT NULL,  
 [nom_segund_apell] [varchar](25) NULL,  
 [nom_casada_apell] [varchar](25) NULL,  
 [nom_primer_nomb] [varchar](25) NOT NULL,  
 [nom_segund_nomb] [varchar](25) NULL,  
 [ind_sexo] [varchar](1) NOT NULL,  
 [num_pasaporte] [varchar](17) NOT NULL,  
 
 
 
 [ind_estado_civil] [varchar](1) NULL,  
 [cod_pais_nacim] [varchar](3) NOT NULL,  
 [fec_nacim] [datetime] NOT NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[sysworkimp]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[sysworkimp](  
 [COD_IMPEDIDO] [int] NULL,  
 [NOM_CAMPO] [nvarchar](25) NULL,  
 [DES_CAMPO] [nvarchar](25) NULL,  
 [VALOR_ANT] [nvarchar](50) NULL,  
 [VALOR_NVO] [nvarchar](50) NULL,  
 [USUARIO_MODIFICACION] [nvarchar](20) NULL,  
 [FEC_MODIF] [datetime] NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[sysworkimto]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[sysworkimto](  
 [COD_IMPEDIMENTO] [int] NULL,  
 [NOM_CAMPO] [nvarchar](25) NULL,  
 [DES_CAMPO] [nvarchar](25) NULL,  
 [VALOR_ANT] [nvarchar](25) NULL,  
 [VALOR_NVO] [nvarchar](25) NULL,  
 [USUARIO_MODIFICACION] [nvarchar](20) NULL,  
 [FEC_MODIF] [datetime] NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[sysworklev]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[sysworklev](  
 [COD_IMPEDIDO] [int] NULL,  
 [NOM_CAMPO] [nvarchar](25) NULL,  
 [DES_CAMPO] [nvarchar](25) NULL,  
 [VALOR_ANT] [nvarchar](50) NULL,  
 [VALOR_NVO] [nvarchar](50) NULL,  
 [USUARIO_MODIFICACION] [nvarchar](20) NULL,  
 
 
 
 [FEC_MODIF] [datetime] NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[Sysworktbusuario]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[Sysworktbusuario](  
 [user_id] [varchar](17) NULL,  
 [NOM_CAMPO] [varchar](50) NULL,  
 [DES_CAMPO] [varchar](50) NULL,  
 [VALOR_ANT] [varchar](50) NULL,  
 [VALOR_NVO] [varchar](50) NULL,  
 [USUARIO_MODIFICACION] [varchar](50) NULL,  
 [usuario_corriente] [varchar](50) NULL,  
 [FEC_MODIF] [datetime] NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[sysworkusrol]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[sysworkusrol](  
 [COD_ROLE] [int] NULL,  
 [NOM_CAMPO] [nvarchar](25) NULL,  
 [DES_CAMPO] [nvarchar](25) NULL,  
 [VALOR_ANT] [nvarchar](25) NULL,  
 [VALOR_NVO] [nvarchar](25) NULL,  
 [USUARIO_MODIFICACION] [nvarchar](20) NULL,  
 [FEC_MODIF] [datetime] NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[Temp_ActualizacionDesdeCriminalistica]     Script Date: 
16-05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[Temp_ActualizacionDesdeCriminalistica](  
 [NUM_REG_FILIACION] [int] NOT NULL,  
 [in_resenado] [bit] NULL,  
 [fe_resenado] [datetime] NULL,  
 [de_resenado] [nvarchar](250) NULL,  
 [de_observacion] [nvarchar](500) NULL,  
 
 
 
 [in_huella_Extraida] [bit] NULL,  
 [ID_USUARIO_EXTRACCION] [nvarchar](128) NULL,  
 [NM_USUARIO_EXTRACCION] [nvarchar](500) NULL,  
 [FE_EXTRACCION] [datetime] NULL,  
 [ID_USUARIO_MODIFICACION] [nvarchar](128) NULL,  
 [NM_USUARIO_MODIFICACION] [nvarchar](500) NULL,  
 [FE_MODIFICACION] [datetime] NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[tmp_filiaciones_marinos]     Script Date: 16 -05-2025 
13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[tmp_filiaciones_marinos](  
 [NOMBRE] [nvarchar](150) NULL,  
 [PASAPORTE] [nvarchar](150) NULL,  
 [RUEX] [varchar](150) NULL,  
 [FECHA_NACIMIENTO] [varchar](150) NULL,  
 [FECHA_NACIMIENTO_LABEL] [nvarchar](150) NULL,  
 [APP_NUMBER] [varchar](150) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[tmp_reporte_rusos]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[tmp_reporte_rusos](  
 [numtramite] [int] NULL,  
 [fecha] [datetime] NULL,  
 [condicion_visa] [varchar](50) NULL,  
 [expediente] [varchar](20) NULL,  
 [num_filiacion] [int] NULL,  
 [nombre] [varchar](75) NULL,  
 [num_pasaporte] [varchar](50) NULL,  
 [fecha_nacimiento] [datetime] NULL,  
 [nacionalidad] [varchar](100) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[VIAJE]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
 
 
 
CREATE TABLE [dbo].[VIAJE](  
 [Linea] [int] NOT NULL,  
 [Destination] [varchar](50) NULL,  
 [Escala] [varchar](50) NULL,  
 [Origen] [varchar](50) NULL,  
 [Viaje] [varchar](50) NULL,  
 [Pasaporte] [varchar](50) NULL,  
 [Nombre] [varchar](150) NULL,  
 [Tipo] [varchar](10) NULL,  
 [OrigenDestino] [varchar](20) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[visas_monitor]     Script Date: 16 -05-2025 13:14:43 ******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[visas_monitor](  
 [NUM_REGISTRO] [int] NOT NULL,  
 [FEC_SOLICITUD] [datetime] NOT NULL,  
 [NOM_SOLICITANTE] [varchar](50) NOT NULL,  
 [COD_VISA] [varchar](3) NOT NULL,  
 [COD_CONSULADO] [varchar](3) NULL,  
 [FAX_CONSULADO] [varchar](30) NULL,  
 [OBS_OBSERVACION] [varchar](1000) NULL,  
 [NOM_RESP_PMA] [varchar](50) NULL,  
 [DIR_RESP_PMA] [varchar](50) NULL,  
 [TEL_RESP_PMA] [varchar](15) NULL,  
 [NUM_ESTADIA] [varchar](3) NOT NULL,  
 [NOM_MOTIVO_VIAJE] [varchar](1) NOT NULL,  
 [COD_PAIS_RESIDE] [varchar](3) NOT NULL,  
 [DIR_SOLICITANTE] [varchar](50) NULL,  
 [TEL_SOLICITANTE] [varchar](15) NULL,  
 [NUM_REFERENCIA] [varchar](12) NULL,  
 [NUM_CONTROL] [int] NULL,  
 [NUM_NOTA] [int] NULL,  
 [FEC_ENVIO_CNS] [datetime] NULL,  
 [FEC_RETORNA_CNS] [datetime] NULL,  
 [FEC_TELEX] [datetime] NULL,  
 [NUM_PROVIAP] [varchar](12) NULL,  
 [FEC_AUTORIZ_NEGAC] [datetime] NULL,  
 [IND_AUTORIZ_NEGAC] [varchar](1) NULL,  
 [IND_PRORROGA] [varchar](1) NULL,  
 [NUM_DIAS_VALIDEZ] [smallint] NULL,  
 [NUM_MES_VALIDEZ] [smallint] NULL,  
 [NUM_ANIO_VALIDEZ] [smallint] NULL,  
 [IND_VALID_TRAMITE] [varchar](1) NULL,  
 
 
 
 [FEC_RECONSIDERA] [datetime] NULL,  
 [IND_ESTATUS] [varchar](1) NULL,  
 [ID_USUAR_CREA] [varchar](20) NULL,  
 [ID_USUAR_MODIF] [varchar](20) NULL,  
 [FEC_ACTUALIZA] [datetime] NULL,  
 [NUM_TARJETA_CRE] [varchar](30) NULL,  
 [NOM_CORREO_EMAIL] [varchar](50) NULL,  
 [IND_ESTADIA] [varchar](1) NOT NULL,  
 [COD_MOTIVO_AUTOR] [varchar](2) NULL,  
 [FEC_ENTRADA] [datetime] NULL,  
 [FEC_SOL_RECON] [datetime] NULL,  
 [NUM_DIAS_RECON] [smallint] NULL,  
 [IND_AUTNEG_RECON] [varchar](1) NULL,  
 [COD_BOLETA] [varchar](25) NULL,  
 [TIPO] [varchar](10) NULL  
) ON [PRIMARY]  
GO 
/****** Object:   Table [dbo].[VSVBTableVersions]     Script Date: 16 -05-2025 13:14:43 
******/  
SET ANSI_NULLS ON  
GO 
SET QUOTED_IDENTIFIER ON  
GO 
CREATE TABLE [dbo].[VSVBTableVersions](  
 [RepositoryTableName] [varchar](255) NOT NULL,  
 [TableVersion] [varchar](50) NULL,  
 [LastRulesUpdated] [varchar](50) NULL,  
 CONSTRAINT [PKPrimaryKey_VSVBTableVersions] PRIMARY KEY CLUSTERED   
( 
 [RepositoryTableName] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, 
OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]  
) ON [PRIMARY]  
GO 
ALTER TABLE [dbo].[BCK_MM_BOLETA]   WITH CHECK ADD FOREIGN 
KEY([COD_CATEG_ENTRADA])  
REFERENCES [dbo].[SIM_GE_CAT_ENTRAD] ([COD_CATEG_ENTRADA])  
GO 
ALTER TABLE [dbo].[BCK_MM_BOLETA]   WITH CHECK ADD FOREIGN 
KEY([COD_CATEG_SALIDA])  
REFERENCES [dbo].[SIM_MM_CAT_SALIDA] ([COD_CATEG_SALIDA])  
GO 
ALTER TABLE [dbo].[BCK_MM_BOLETA]   WITH CHECK ADD FOREIGN 
KEY([COD_DOC_VIAJE])  
REFERENCES [dbo].[SIM_MM_DOC_VIAJE] ([COD_DOC_VIAJE])  
GO 
 
 
 
ALTER TABLE [dbo].[BCK_MM_BOLETA]   WITH CHECK ADD FOREIGN 
KEY([COD_MOTIVO_VIAJE])  
REFERENCES [dbo].[SIM_MM_MOT_VIAJE] ([COD_MOTIVO_VIAJE])  
GO 
ALTER TABLE [dbo].[BCK_MM_BOLETA]   WITH CHECK ADD FOREIGN 
KEY([COD_OCUPACION])  
REFERENCES [dbo].[SIM_GE_OCUPACION] ([COD_OCUPACION])  
GO 
ALTER TABLE [dbo].[BCK_MM_BOLETA]   WITH CHECK ADD FOREIGN 
KEY([COD_SEXO])  
REFERENCES [dbo].[SIM_GE_SEXO] ([COD_SEXO])  
GO 
ALTER TABLE [dbo].[genesis_permisos]   WITH CHECK ADD FOREIGN KEY([user_id])  
REFERENCES [dbo].[SIM_GE_USUARIOS] ([USER_ID])  
GO 
ALTER TABLE [dbo].[MOVIS_MM_BOLETA]   WITH CHECK ADD FOREIGN 
KEY([COD_OCUPACION])  
REFERENCES [dbo].[SIM_GE_OCUPACION] ([COD_OCUPACION])  
GO 
ALTER TABLE [dbo].[MOVIS_MM_BOLETA]   WITH CHECK ADD FOREIGN 
KEY([COD_OCUPACION])  
REFERENCES [dbo].[SIM_GE_OCUPACION] ([COD_OCUPACION])  
GO 
ALTER TABLE [dbo].[SEG_TB_ERROR_LOG]   WITH CHECK ADD FOREIGN KEY([USER_ID])  
REFERENCES [dbo].[SEG_TB_USUARIOS] ([USER_ID])  
GO 
ALTER TABLE [dbo].[SEG_TB_USUA_ROLE]   WITH CHECK ADD FOREIGN KEY([USER_ID])  
REFERENCES [dbo].[SEG_TB_USUARIOS] ([USER_ID])  
GO 
ALTER TABLE [dbo].[SIM_BMM_BOLETA]   WITH CHECK ADD FOREIGN 
KEY([COD_CATEG_ENTRADA])  
REFERENCES [dbo].[SIM_GE_CAT_ENTRAD] ([COD_CATEG_ENTRADA])  
GO 
ALTER TABLE [dbo].[SIM_BMM_BOLETA]   WITH CHECK ADD FOREIGN 
KEY([COD_CATEG_SALIDA])  
REFERENCES [dbo].[SIM_MM_CAT_SALIDA] ([COD_CATEG_SALIDA])  
GO 
ALTER TABLE [dbo].[SIM_BMM_BOLETA]   WITH CHECK ADD FOREIGN 
KEY([COD_DOC_VIAJE])  
REFERENCES [dbo].[SIM_MM_DOC_VIAJE] ([COD_DOC_VIAJE])  
GO 
ALTER TABLE [dbo].[SIM_BMM_BOLETA]   WITH CHECK ADD FOREIGN 
KEY([COD_MOTIVO_VIAJE])  
REFERENCES [dbo].[SIM_MM_MOT_VIAJE] ([COD_MOTIVO_VIAJE])  
GO 
ALTER TABLE [dbo].[SIM_BMM_BOLETA]   WITH CHECK ADD FOREIGN 
KEY([COD_OCUPACION])  
 
 
 
REFERENCES [dbo].[SIM_GE_OCUPACION] ([COD_OCUPACION])  
GO 
ALTER TABLE [dbo].[SIM_BMM_BOLETA]   WITH CHECK ADD FOREIGN 
KEY([COD_SEXO])  
REFERENCES [dbo].[SIM_GE_SEXO] ([COD_SEXO])  
GO 
ALTER TABLE [dbo].[SIM_FI_CARTA_NAT]   WITH CHECK ADD FOREIGN 
KEY([COD_DETENIDO])  
REFERENCES [dbo].[SIM_VI_DETENIDO] ([COD_DETENIDO])  
GO 
ALTER TABLE [dbo].[SIM_FI_CARTA_NAT]   WITH CHECK ADD FOREIGN 
KEY([COD_INSTITUCION])  
REFERENCES [dbo].[SIM_VI_INST_ENVIA] ([COD_INSTITUCION])  
GO 
ALTER TABLE [dbo].[SIM_FI_DEP_EXP]   WITH CHECK ADD FOREIGN 
KEY([COD_CAUSAS])  
REFERENCES [dbo].[SIM_FI_CAUSAS] ([COD_CAUSAS])  
GO 
ALTER TABLE [dbo].[SIM_FI_DEP_EXP]   WITH CHECK ADD FOREIGN 
KEY([ID_ABOGADO])  
REFERENCES [dbo].[SIM_VI_ABOGADO] ([ID_ABOGADO])  
GO 
ALTER TABLE [dbo].[SIM_FI_DEP_EXP]   WITH CHECK ADD FOREIGN 
KEY([IND_BORRADOR])  
REFERENCES [dbo].[SIM_VI_IDBORRADOR] ([IND_BORRADOR])  
GO 
ALTER TABLE [dbo].[SIM_FI_GENERALES]   WITH CHECK ADD FOREIGN 
KEY([COD_COLOR_CABELLO])  
REFERENCES [dbo].[SIM_GE_CABELLO] ([COD_COLOR_CABELLO])  
GO 
ALTER TABLE [dbo].[SIM_FI_GENERALES]   WITH CHECK ADD FOREIGN 
KEY([COD_COLOR_PIEL])  
REFERENCES [dbo].[SIM_GE_PIEL] ([COD_COLOR_PIEL])  
GO 
ALTER TABLE [dbo].[SIM_FI_GENERALES]   WITH CHECK ADD FOREIGN 
KEY([COD_COLOR_OJOS])  
REFERENCES [dbo].[SIM_GE_OJOS] ([COD_COLOR_OJOS])  
GO 
ALTER TABLE [dbo].[SIM_FI_GENERALES]   WITH CHECK ADD FOREIGN 
KEY([COD_CALIDAD])  
REFERENCES [dbo].[SIM_FI_CALIDAD] ([COD_CALIDAD])  
GO 
ALTER TABLE [dbo].[SIM_FI_GENERALES]   WITH CHECK ADD FOREIGN 
KEY([COD_OCUPACION])  
REFERENCES [dbo].[SIM_GE_OCUPACION] ([COD_OCUPACION])  
GO 
 
 
 
ALTER TABLE [dbo].[SIM_FI_GENERALES_RUEX]   WITH CHECK ADD FOREIGN 
KEY([COD_VIA_TRANSP])  
REFERENCES [dbo].[SIM_GE_VIA_TRANSP] ([COD_VIA_TRANSP])  
GO 
ALTER TABLE [dbo].[SIM_FI_GENERALESX]   WITH CHECK ADD FOREIGN 
KEY([COD_COLOR_CABELLO])  
REFERENCES [dbo].[SIM_GE_CABELLO] ([COD_COLOR_CABELLO])  
GO 
ALTER TABLE [dbo].[SIM_FI_GENERALESX]   WITH CHECK ADD FOREIGN 
KEY([COD_COLOR_PIEL])  
REFERENCES [dbo].[SIM_GE_PIEL] ([COD_COLOR_PIEL])  
GO 
ALTER TABLE [dbo].[SIM_FI_GENERALESX]   WITH CHECK ADD FOREIGN 
KEY([COD_COLOR_OJOS])  
REFERENCES [dbo].[SIM_GE_OJOS] ([COD_COLOR_OJOS])  
GO 
ALTER TABLE [dbo].[SIM_FI_GENERALESX]   WITH CHECK ADD FOREIGN 
KEY([COD_CALIDAD])  
REFERENCES [dbo].[SIM_FI_CALIDAD] ([COD_CALIDAD])  
GO 
ALTER TABLE [dbo].[SIM_FI_GENERALESX]   WITH CHECK ADD FOREIGN 
KEY([COD_OCUPACION])  
REFERENCES [dbo].[SIM_GE_OCUPACION] ([COD_OCUPACION])  
GO 
ALTER TABLE [dbo].[SIM_FT_PASOXTRAM]   WITH CHECK ADD FOREIGN 
KEY([COD_SECCION])  
REFERENCES [dbo].[SIM_GE_SECCION] ([COD_SECCION])  
GO 
ALTER TABLE [dbo].[SIM_FT_TRAMITE_D]   WITH CHECK ADD FOREIGN 
KEY([COD_SECCION])  
REFERENCES [dbo].[SIM_GE_SECCION] ([COD_SECCION])  
GO 
ALTER TABLE [dbo].[SIM_FT_USUA_SEC]   WITH CHECK ADD FOREIGN 
KEY([COD_SECCION])  
REFERENCES [dbo].[SIM_GE_SECCION] ([COD_SECCION])  
GO 
ALTER TABLE [dbo].[SIM_GE_AG_SEC]   WITH CHECK ADD FOREIGN 
KEY([COD_SECCION])  
REFERENCES [dbo].[SIM_GE_SECCION] ([COD_SECCION])  
GO 
ALTER TABLE [dbo].[SIM_GE_AGENCIA]   WITH CHECK ADD FOREIGN 
KEY([COD_REGION])  
REFERENCES [dbo].[SIM_GE_REGION] ([COD_REGION])  
GO 
ALTER TABLE [dbo].[SIM_GE_AGENCIA]   WITH CHECK ADD FOREIGN 
KEY([COD_VIA_TRANSP])  
REFERENCES [dbo].[SIM_GE_VIA_TRANSP] ([COD_VIA_TRANSP])  
 
 
 
GO 
ALTER TABLE [dbo].[SIM_GE_BANCOS]   WITH CHECK ADD FOREIGN KEY([USER_ID])  
REFERENCES [dbo].[SIM_GE_USUARIOS] ([USER_ID])  
GO 
ALTER TABLE [dbo].[SIM_GE_CIA_TRANSP]   WITH CHECK ADD FOREIGN 
KEY([COD_VIA_TRANSP])  
REFERENCES [dbo].[SIM_GE_VIA_TRANSP] ([COD_VIA_TRANSP])  
GO 
ALTER TABLE [dbo].[SIM_GE_CONT_NUM]   WITH CHECK ADD FOREIGN 
KEY([COD_CATEGORIA])  
REFERENCES [dbo].[SIM_GE_CATEGORIA] ([COD_CATEGORIA])  
GO 
ALTER TABLE [dbo].[SIM_GE_CONT_NUM]   WITH CHECK ADD FOREIGN KEY([USER_ID])  
REFERENCES [dbo].[SIM_GE_USUARIOS] ([USER_ID])  
GO 
ALTER TABLE [dbo].[SIM_GE_PAIS]   WITH CHECK ADD FOREIGN 
KEY([COD_CATEG_ENTRADA])  
REFERENCES [dbo].[SIM_GE_CAT_ENTRAD] ([COD_CATEG_ENTRADA])  
GO 
ALTER TABLE [dbo].[SIM_GE_PAIS]   WITH CHECK ADD FOREIGN 
KEY([COD_CONTINENTE])  
REFERENCES [dbo].[SIM_GE_CONTINENTE] ([COD_CONTINENTE])  
GO 
ALTER TABLE [dbo].[SIM_GE_SEC_PUE]   WITH CHECK ADD FOREIGN 
KEY([COD_PUESTO])  
REFERENCES [dbo].[SIM_GE_PUESTO] ([COD_PUESTO])  
GO 
ALTER TABLE [dbo].[SIM_GE_SEC_PUE]   WITH CHECK ADD FOREIGN 
KEY([COD_SECCION])  
REFERENCES [dbo].[SIM_GE_SECCION] ([COD_SECCION])  
GO 
ALTER TABLE [dbo].[SIM_IM_ACCION_EJE]   WITH CHECK ADD FOREIGN 
KEY([COD_ACCION])  
REFERENCES [dbo].[SIM_IM_ACCION] ([COD_ACCION])  
GO 
ALTER TABLE [dbo].[SIM_IM_ANOMALIA]   WITH CHECK ADD FOREIGN 
KEY([COD_ACCION])  
REFERENCES [dbo].[SIM_IM_ACCION] ([COD_ACCION])  
GO 
ALTER TABLE [dbo].[SIM_IM_ANOMALIA]   WITH CHECK ADD FOREIGN 
KEY([COD_ALERTA])  
REFERENCES [dbo].[SIM_IM_ALERTA] ([COD_ALERTA])  
GO 
ALTER TABLE [dbo].[SIM_IM_ANOMALIA]   WITH CHECK ADD FOREIGN 
KEY([COD_DOC_VIAJE])  
REFERENCES [dbo].[SIM_MM_DOC_VIAJE] ([COD_DOC_VIAJE])  
GO 
 
 
 
ALTER TABLE [dbo].[SIM_IM_ANOMALIA]   WITH CHECK ADD FOREIGN 
KEY([COD_PUESTO])  
REFERENCES [dbo].[SIM_GE_PUESTO] ([COD_PUESTO])  
GO 
ALTER TABLE [dbo].[SIM_IM_ANOMALIA]   WITH CHECK ADD FOREIGN 
KEY([COD_SECCION])  
REFERENCES [dbo].[SIM_GE_SECCION] ([COD_SECCION])  
GO 
ALTER TABLE [dbo].[SIM_IM_IMPEDIDO]   WITH CHECK ADD FOREIGN 
KEY([COD_COLOR_CABELLO])  
REFERENCES [dbo].[SIM_GE_CABELLO] ([COD_COLOR_CABELLO])  
GO 
ALTER TABLE [dbo].[SIM_IM_IMPEDIDO]   WITH CHECK ADD FOREIGN 
KEY([COD_COMPLEXION])  
REFERENCES [dbo].[SIM_GE_COMPLEXION] ([COD_COMPLEXION])  
GO 
ALTER TABLE [dbo].[SIM_IM_IMPEDIDO]   WITH CHECK ADD FOREIGN 
KEY([COD_COLOR_PIEL])  
REFERENCES [dbo].[SIM_GE_PIEL] ([COD_COLOR_PIEL])  
GO 
ALTER TABLE [dbo].[SIM_IM_IMPEDIDO]   WITH CHECK ADD FOREIGN 
KEY([COD_ETNIA])  
REFERENCES [dbo].[SIM_MM_ETNIA] ([COD_ETNIA])  
GO 
ALTER TABLE [dbo].[SIM_IM_IMPEDIDO]   WITH CHECK ADD FOREIGN 
KEY([COD_SEXO])  
REFERENCES [dbo].[SIM_GE_SEXO] ([COD_SEXO])  
GO 
ALTER TABLE [dbo].[SIM_IM_IMPEDIDO]   WITH CHECK ADD   CONSTRAINT 
[FK_SIM_IM_IMPEDIDO_SIM_GE_OJOS] FOREIGN KEY([COD_COLOR_OJOS])  
REFERENCES [dbo].[SIM_GE_OJOS] ([COD_COLOR_OJOS])  
GO 
ALTER TABLE [dbo].[SIM_IM_IMPEDIDO] CHECK CONSTRAINT 
[FK_SIM_IM_IMPEDIDO_SIM_GE_OJOS]  
GO 
ALTER TABLE [dbo].[SIM_IM_IMPEDIMEN]   WITH CHECK ADD FOREIGN 
KEY([COD_DOC_VIAJE])  
REFERENCES [dbo].[SIM_MM_DOC_VIAJE] ([COD_DOC_VIAJE])  
GO 
ALTER TABLE [dbo].[SIM_IM_IMPEDIMEN]   WITH CHECK ADD FOREIGN 
KEY([COD_PERIODO])  
REFERENCES [dbo].[SIM_MM_PERIODO] ([COD_PERIODO])  
GO 
ALTER TABLE [dbo].[SIM_IM_IMPEDIMEN]   WITH CHECK ADD   CONSTRAINT 
[FK_SIM_IM_IMPEDIMEN_SIM_GE_AUTORIDAD] FOREIGN KEY([COD_AUTORIDAD])  
REFERENCES [dbo].[SIM_GE_AUTORIDAD] ([COD_AUTORIDAD])  
GO 
 
 
 
ALTER TABLE [dbo].[SIM_IM_IMPEDIMEN] CHECK CONSTRAINT 
[FK_SIM_IM_IMPEDIMEN_SIM_GE_AUTORIDAD]  
GO 
ALTER TABLE [dbo].[SIM_IM_IMPEDIMEN]   WITH CHECK ADD   CONSTRAINT 
[FK_SIM_IM_IMPEDIMEN_SIM_GE_TIPO_MOV] FOREIGN KEY([COD_TIPO_MOV])  
REFERENCES [dbo].[SIM_GE_TIPO_MOV] ([COD_TIPO_MOV])  
GO 
ALTER TABLE [dbo].[SIM_IM_IMPEDIMEN] CHECK CONSTRAINT 
[FK_SIM_IM_IMPEDIMEN_SIM_GE_TIPO_MOV]  
GO 
ALTER TABLE [dbo].[SIM_IM_IMPEDIMEN]   WITH CHECK ADD   CONSTRAINT 
[FK_SIM_IM_IMPEDIMEN_SIM_IM_ACCION] FOREIGN KEY([COD_ACCION])  
REFERENCES [dbo].[SIM_IM_ACCION] ([COD_ACCION])  
GO 
ALTER TABLE [dbo].[SIM_IM_IMPEDIMEN] CHECK CONSTRAINT 
[FK_SIM_IM_IMPEDIMEN_SIM_IM_ACCION]  
GO 
ALTER TABLE [dbo].[SIM_IM_IMPEDIMEN]   WITH CHECK ADD   CONSTRAINT 
[FK_SIM_IM_IMPEDIMEN_SIM_IM_ALERTA] FOREIGN KEY([COD_ALERTA])  
REFERENCES [dbo].[SIM_IM_ALERTA] ([COD_ALERTA])  
GO 
ALTER TABLE [dbo].[SIM_IM_IMPEDIMEN] CHECK CONSTRAINT 
[FK_SIM_IM_IMPEDIMEN_SIM_IM_ALERTA]  
GO 
ALTER TABLE [dbo].[SIM_IM_LEVANTAMI]   WITH CHECK ADD FOREIGN 
KEY([COD_AUTORIDAD])  
REFERENCES [dbo].[SIM_GE_AUTORIDAD] ([COD_AUTORIDAD])  
GO 
ALTER TABLE [dbo].[SIM_IM_LEVANTAMI]   WITH CHECK ADD FOREIGN 
KEY([COD_PERIODO])  
REFERENCES [dbo].[SIM_GE_PERIODO] ([COD_PERIODO])  
GO 
ALTER TABLE [dbo].[SIM_MM_ALERTA_SUPERVISOR]   WITH CHECK ADD FOREIGN 
KEY([COD_DOC_VIAJE])  
REFERENCES [dbo].[SIM_MM_DOC_VIAJE] ([COD_DOC_VIAJE])  
GO 
ALTER TABLE [dbo].[SIM_MM_ALERTA_SUPERVISOR]   WITH CHECK ADD FOREIGN 
KEY([COD_SEXO])  
REFERENCES [dbo].[SIM_GE_SEXO] ([COD_SEXO])  
GO 
ALTER TABLE [dbo].[SIM_MM_ALERTA_SUPERVISOR]   WITH CHECK ADD   CONSTRAINT 
[FK_SIM_MM_ALERTA_SUPERVISOR_SIM_GE_PUESTO] FOREIGN KEY([COD_PUESTO])  
REFERENCES [dbo].[SIM_GE_PUESTO] ([COD_PUESTO])  
GO 
ALTER TABLE [dbo].[SIM_MM_ALERTA_SUPERVISOR] CHECK CONSTRAINT 
[FK_SIM_MM_ALERTA_SUPERVISOR_SIM_GE_PUESTO]  
GO 
 
 
 
ALTER TABLE [dbo].[SIM_MM_ALERTA_SUPERVISOR]   WITH CHECK ADD   CONSTRAINT 
[FK_SIM_MM_ALERTA_SUPERVISOR_SIM_GE_SECCION] FOREIGN 
KEY([COD_SECCION])  
REFERENCES [dbo].[SIM_GE_SECCION] ([COD_SECCION])  
GO 
ALTER TABLE [dbo].[SIM_MM_ALERTA_SUPERVISOR] CHECK CONSTRAINT 
[FK_SIM_MM_ALERTA_SUPERVISOR_SIM_GE_SECCION]  
GO 
ALTER TABLE [dbo].[SIM_MM_BOLETA]   WITH CHECK ADD FOREIGN 
KEY([COD_CATEG_ENTRADA])  
REFERENCES [dbo].[SIM_GE_CAT_ENTRAD] ([COD_CATEG_ENTRADA])  
GO 
ALTER TABLE [dbo].[SIM_MM_BOLETA]   WITH CHECK ADD FOREIGN 
KEY([COD_CATEG_SALIDA])  
REFERENCES [dbo].[SIM_MM_CAT_SALIDA] ([COD_CATEG_SALIDA])  
GO 
ALTER TABLE [dbo].[SIM_MM_BOLETA]   WITH CHECK ADD FOREIGN 
KEY([COD_DOC_VIAJE])  
REFERENCES [dbo].[SIM_MM_DOC_VIAJE] ([COD_DOC_VIAJE])  
GO 
ALTER TABLE [dbo].[SIM_MM_BOLETA]   WITH CHECK ADD FOREIGN KEY([COD_SEXO])  
REFERENCES [dbo].[SIM_GE_SEXO] ([COD_SEXO])  
GO 
ALTER TABLE [dbo].[SIM_MM_BOLETA]   WITH CHECK ADD   CONSTRAINT 
[FK_SIM_MM_BOLETA_SIM_GE_OCUPACION] FOREIGN KEY([COD_OCUPACION])  
REFERENCES [dbo].[SIM_GE_OCUPACION] ([COD_OCUPACION])  
GO 
ALTER TABLE [dbo].[SIM_MM_BOLETA] CHECK CONSTRAINT 
[FK_SIM_MM_BOLETA_SIM_GE_OCUPACION]  
GO 
ALTER TABLE [dbo].[SIM_MM_BOLETA]   WITH CHECK ADD   CONSTRAINT 
[FK_SIM_MM_BOLETA_SIM_MM_MOT_VIAJE] FOREIGN KEY([COD_MOTIVO_VIAJE])  
REFERENCES [dbo].[SIM_MM_MOT_VIAJE] ([COD_MOTIVO_VIAJE])  
GO 
ALTER TABLE [dbo].[SIM_MM_BOLETA] CHECK CONSTRAINT 
[FK_SIM_MM_BOLETA_SIM_MM_MOT_VIAJE]  
GO 
ALTER TABLE [dbo].[SIM_MM_ENT_SAL_TR]   WITH CHECK ADD FOREIGN 
KEY([COD_DOC_VIAJE])  
REFERENCES [dbo].[SIM_MM_DOC_VIAJE] ([COD_DOC_VIAJE])  
GO 
ALTER TABLE [dbo].[SIM_MM_ENT_SAL_TR]   WITH CHECK ADD FOREIGN 
KEY([COD_MOTIVO_VIAJE])  
REFERENCES [dbo].[SIM_MM_MOT_VIAJE] ([COD_MOTIVO_VIAJE])  
GO 
ALTER TABLE [dbo].[SIM_MM_ENT_SAL_TR]   WITH CHECK ADD FOREIGN 
KEY([COD_OCUPACION])  
 
 
 
REFERENCES [dbo].[SIM_GE_OCUPACION] ([COD_OCUPACION])  
GO 
ALTER TABLE [dbo].[SIM_MM_ENT_SAL_TR]   WITH CHECK ADD FOREIGN 
KEY([COD_PUESTO])  
REFERENCES [dbo].[SIM_GE_PUESTO] ([COD_PUESTO])  
GO 
ALTER TABLE [dbo].[SIM_MM_ENT_SAL_TR]   WITH CHECK ADD FOREIGN 
KEY([COD_SEXO])  
REFERENCES [dbo].[SIM_GE_SEXO] ([COD_SEXO])  
GO 
ALTER TABLE [dbo].[SIM_MM_ENT_SAL_TR]   WITH CHECK ADD FOREIGN 
KEY([COD_SECCION])  
REFERENCES [dbo].[SIM_GE_SECCION] ([COD_SECCION])  
GO 
ALTER TABLE [dbo].[SIM_MM_MOVIS]   WITH CHECK ADD FOREIGN 
KEY([COD_DOC_VIAJE])  
REFERENCES [dbo].[SIM_MM_DOC_VIAJE] ([COD_DOC_VIAJE])  
GO 
ALTER TABLE [dbo].[SIM_MM_MOVIS]   WITH CHECK ADD FOREIGN 
KEY([COD_MOTIVO_VIAJE])  
REFERENCES [dbo].[SIM_MM_MOT_VIAJE] ([COD_MOTIVO_VIAJE])  
GO 
ALTER TABLE [dbo].[SIM_MM_MOVIS]   WITH CHECK ADD FOREIGN 
KEY([COD_OCUPACION])  
REFERENCES [dbo].[SIM_GE_OCUPACION] ([COD_OCUPACION])  
GO 
ALTER TABLE [dbo].[SIM_MM_MOVIS]   WITH CHECK ADD FOREIGN 
KEY([COD_PUESTO])  
REFERENCES [dbo].[SIM_GE_PUESTO] ([COD_PUESTO])  
GO 
ALTER TABLE [dbo].[SIM_MM_MOVIS]   WITH CHECK ADD FOREIGN KEY([COD_SEXO])  
REFERENCES [dbo].[SIM_GE_SEXO] ([COD_SEXO])  
GO 
ALTER TABLE [dbo].[SIM_MM_MOVIS]   WITH CHECK ADD FOREIGN 
KEY([COD_SECCION])  
REFERENCES [dbo].[SIM_GE_SECCION] ([COD_SECCION])  
GO 
ALTER TABLE [dbo].[SIM_PE_AUSENCIAS]   WITH CHECK ADD FOREIGN 
KEY([COD_ESTADO])  
REFERENCES [dbo].[SIM_PE_EST_SOL] ([COD_ESTADO])  
GO 
ALTER TABLE [dbo].[SIM_PE_AUSENCIAS]   WITH CHECK ADD FOREIGN 
KEY([COD_MOT_AUSENCIA])  
REFERENCES [dbo].[SIM_PE_MOT_AUSENC] ([COD_MOT_AUSENCIA])  
GO 
ALTER TABLE [dbo].[SIM_PE_AUSENCIAS]   WITH CHECK ADD FOREIGN 
KEY([COD_TIP_AUSENCIA])  
 
 
 
REFERENCES [dbo].[SIM_PE_AUSENC] ([COD_TIP_AUSENCIA])  
GO 
ALTER TABLE [dbo].[SIM_PE_AUSENCIAS]   WITH CHECK ADD FOREIGN KEY([USER_ID])  
REFERENCES [dbo].[SIM_GE_USUARIOS] ([USER_ID])  
GO 
ALTER TABLE [dbo].[SIM_PE_AUSENCIAS]   WITH CHECK ADD FOREIGN KEY([USER_ID])  
REFERENCES [dbo].[SIM_GE_USUARIOS] ([USER_ID])  
GO 
ALTER TABLE [dbo].[SIM_PE_EMPLEADO]   WITH CHECK ADD FOREIGN 
KEY([COD_BANCO])  
REFERENCES [dbo].[SIM_GE_BANCOS] ([COD_BANCO])  
GO 
ALTER TABLE [dbo].[SIM_PE_EMPLEADO]   WITH CHECK ADD FOREIGN 
KEY([COD_FUNCION])  
REFERENCES [dbo].[SIM_PE_FUNCIONES] ([COD_FUNCION])  
GO 
ALTER TABLE [dbo].[SIM_PE_EMPLEADO]   WITH CHECK ADD FOREIGN 
KEY([COD_PART_PRESUP])  
REFERENCES [dbo].[SIM_PE_PAR_PRESUP] ([COD_PART_PRESUP])  
GO 
ALTER TABLE [dbo].[SIM_PE_EMPLEADO]   WITH CHECK ADD FOREIGN 
KEY([COD_SECCION])  
REFERENCES [dbo].[SIM_GE_SECCION] ([COD_SECCION])  
GO 
ALTER TABLE [dbo].[SIM_PE_EMPLEADO]   WITH CHECK ADD FOREIGN KEY([USER_ID])  
REFERENCES [dbo].[SIM_GE_USUARIOS] ([USER_ID])  
GO 
ALTER TABLE [dbo].[SIM_PE_EMPLEADO_VIEJO]   WITH CHECK ADD FOREIGN 
KEY([COD_BANCO])  
REFERENCES [dbo].[SIM_GE_BANCOS] ([COD_BANCO])  
GO 
ALTER TABLE [dbo].[SIM_PE_EMPLEADO_VIEJO]   WITH CHECK ADD FOREIGN 
KEY([COD_CARGO])  
REFERENCES [dbo].[SIM_GE_CARGO] ([COD_CARGO])  
GO 
ALTER TABLE [dbo].[SIM_PE_EMPLEADO_VIEJO]   WITH CHECK ADD FOREIGN 
KEY([COD_CARGO])  
REFERENCES [dbo].[SIM_GE_CARGO] ([COD_CARGO])  
GO 
ALTER TABLE [dbo].[SIM_PE_EMPLEADO_VIEJO]   WITH CHECK ADD FOREIGN 
KEY([COD_FUNCION])  
REFERENCES [dbo].[SIM_PE_FUNCIONES] ([COD_FUNCION])  
GO 
ALTER TABLE [dbo].[SIM_PE_EMPLEADO_VIEJO]   WITH CHECK ADD FOREIGN 
KEY([COD_PART_PRESUP])  
REFERENCES [dbo].[SIM_PE_PAR_PRESUP] ([COD_PART_PRESUP])  
GO 
 
 
 
ALTER TABLE [dbo].[SIM_PE_EMPLEADO_VIEJO]   WITH CHECK ADD FOREIGN 
KEY([COD_SECCION])  
REFERENCES [dbo].[SIM_GE_SECCION] ([COD_SECCION])  
GO 
ALTER TABLE [dbo].[SIM_PE_EMPLEADO_VIEJO]   WITH CHECK ADD FOREIGN 
KEY([USER_ID])  
REFERENCES [dbo].[SIM_GE_USUARIOS] ([USER_ID])  
GO 
ALTER TABLE [dbo].[SIM_PE_LICENCIAS]   WITH CHECK ADD FOREIGN 
KEY([COD_MOTIVO])  
REFERENCES [dbo].[SIM_PE_MOT_PERMI] ([COD_MOTIVO])  
GO 
ALTER TABLE [dbo].[SIM_PE_SOLIC_PER]   WITH CHECK ADD FOREIGN 
KEY([COD_ESTADO])  
REFERENCES [dbo].[SIM_PE_EST_SOL] ([COD_ESTADO])  
GO 
ALTER TABLE [dbo].[SIM_PE_SOLIC_PER]   WITH CHECK ADD FOREIGN 
KEY([COD_MOTIVO])  
REFERENCES [dbo].[SIM_PE_MOT_PERMI] ([COD_MOTIVO])  
GO 
ALTER TABLE [dbo].[SIM_PE_SOLIC_PER]   WITH CHECK ADD FOREIGN KEY([USER_ID])  
REFERENCES [dbo].[SIM_GE_USUARIOS] ([USER_ID])  
GO 
ALTER TABLE [dbo].[SIM_PE_SOLIC_VAC]   WITH CHECK ADD FOREIGN 
KEY([COD_ESTADO])  
REFERENCES [dbo].[SIM_PE_EST_SOL] ([COD_ESTADO])  
GO 
ALTER TABLE [dbo].[SIM_SG_RESOLUCION]   WITH CHECK ADD   CONSTRAINT 
[FK_SIM_SG_RESOLUCION_SIM_SG_TIPO_RESOL] FOREIGN KEY([COD_TIPO_RESOL])  
REFERENCES [dbo].[SIM_SG_TIPO_RESOL] ([COD_TIPO_RESOL])  
GO 
ALTER TABLE [dbo].[SIM_SG_RESOLUCION] CHECK CONSTRAINT 
[FK_SIM_SG_RESOLUCION_SIM_SG_TIPO_RESOL]  
GO 
ALTER TABLE [dbo].[SIM_SG_RESOLUCION]   WITH CHECK ADD   CONSTRAINT 
[FK_SIM_SG_RESOLUCION_SIM_VI_ABOGADO] FOREIGN KEY([ID_ABOGADO])  
REFERENCES [dbo].[SIM_VI_ABOGADO] ([ID_ABOGADO])  
GO 
ALTER TABLE [dbo].[SIM_SG_RESOLUCION] CHECK CONSTRAINT 
[FK_SIM_SG_RESOLUCION_SIM_VI_ABOGADO]  
GO 
ALTER TABLE [dbo].[SIM_SG_RESOLUCION]   WITH CHECK ADD   CONSTRAINT 
[FK_SIM_SG_RESOLUCION_SIM_VI_IDBORRADOR] FOREIGN KEY([IND_BORRADOR])  
REFERENCES [dbo].[SIM_VI_IDBORRADOR] ([IND_BORRADOR])  
GO 
ALTER TABLE [dbo].[SIM_SG_RESOLUCION] CHECK CONSTRAINT 
[FK_SIM_SG_RESOLUCION_SIM_VI_IDBORRADOR]  
 
 
 
GO 
ALTER TABLE [dbo].[SIM_SG_RESOLUCION]   WITH CHECK ADD   CONSTRAINT 
[FK_SIM_SG_RESOLUCION_SIM_VI_STAT_MIGRA] FOREIGN KEY([COD_STATUS])  
REFERENCES [dbo].[SIM_VI_STAT_MIGRA] ([COD_STATUS])  
GO 
ALTER TABLE [dbo].[SIM_SG_RESOLUCION] CHECK CONSTRAINT 
[FK_SIM_SG_RESOLUCION_SIM_VI_STAT_MIGRA]  
GO 
ALTER TABLE [dbo].[SIM_VI_ESTAMPADA]   WITH CHECK ADD FOREIGN 
KEY([COD_CATEG_ENTRADA])  
REFERENCES [dbo].[SIM_GE_CAT_ENTRAD] ([COD_CATEG_ENTRADA])  
GO 
ALTER TABLE [dbo].[SIM_VI_PERM_ESP]   WITH CHECK ADD FOREIGN 
KEY([COD_MOTIVO])  
REFERENCES [dbo].[SIM_PE_MOT_PERMI] ([COD_MOTIVO])  
GO 
ALTER TABLE [dbo].[SIM_VI_PERM_ESP]   WITH CHECK ADD   CONSTRAINT 
[FK_SIM_VI_PERM_ESP_SIM_GE_MOTIVO_DEV] FOREIGN KEY([COD_MOTIVO])  
REFERENCES [dbo].[SIM_GE_MOTIVO_DEV] ([COD_MOTIVO])  
GO 
ALTER TABLE [dbo].[SIM_VI_PERM_ESP] CHECK CONSTRAINT 
[FK_SIM_VI_PERM_ESP_SIM_GE_MOTIVO_DEV]  
GO 
ALTER TABLE [dbo].[SIM_VI_PERM_ESP]   WITH CHECK ADD   CONSTRAINT 
[FK_SIM_VI_PERM_ESP_SIM_VI_ABOGADO] FOREIGN KEY([ID_ABOGADO])  
REFERENCES [dbo].[SIM_VI_ABOGADO] ([ID_ABOGADO])  
GO 
ALTER TABLE [dbo].[SIM_VI_PERM_ESP] CHECK CONSTRAINT 
[FK_SIM_VI_PERM_ESP_SIM_VI_ABOGADO]  
GO 
ALTER TABLE [dbo].[SIM_VI_SOLICITUD]   WITH CHECK ADD   CONSTRAINT 
[FK_SIM_VI_SOLICITUD_SIM_VI_ABOGADO] FOREIGN KEY([ID_ABOGADO])  
REFERENCES [dbo].[SIM_VI_ABOGADO] ([ID_ABOGADO])  
GO 
ALTER TABLE [dbo].[SIM_VI_SOLICITUD] CHECK CONSTRAINT 
[FK_SIM_VI_SOLICITUD_SIM_VI_ABOGADO]  
GO 
ALTER TABLE [dbo].[SIM_VI_SOLICITUD]   WITH CHECK ADD   CONSTRAINT 
[FK_SIM_VI_SOLICITUD_SIM_VI_IDBORRADOR] FOREIGN KEY([IND_BORRADOR])  
REFERENCES [dbo].[SIM_VI_IDBORRADOR] ([IND_BORRADOR])  
GO 
ALTER TABLE [dbo].[SIM_VI_SOLICITUD] CHECK CONSTRAINT 
[FK_SIM_VI_SOLICITUD_SIM_VI_IDBORRADOR]  
GO 
 
 
