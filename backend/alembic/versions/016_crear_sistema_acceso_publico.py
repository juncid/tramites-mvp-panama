"""016_crear_sistema_acceso_publico

Revision ID: 016_crear_sistema_acceso_publico
Revises: 015_actualizar_documentos_ppsh_decreto_6
Create Date: 2025-01-12 10:30:00

Sistema de acceso público para ciudadanos y abogados sin contraseña.
Permite consultar solicitudes mediante número de solicitud + documento de identidad.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mssql

# revision identifiers, used by Alembic.
revision = '016_crear_sistema_acceso_publico'
down_revision = '015_actualizar_documentos_ppsh_decreto_6'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Crear tabla de accesos públicos
    op.execute("""
        CREATE TABLE SEG_TB_ACCESO_PUBLICO (
            acceso_publico_id INT IDENTITY(1,1) PRIMARY KEY,
            solicitud_id INT NOT NULL,
            numero_documento NVARCHAR(50) NOT NULL,
            tipo_documento NVARCHAR(20) NOT NULL CHECK (tipo_documento IN ('PASAPORTE', 'CEDULA')),
            fecha_acceso DATETIME2 NOT NULL DEFAULT GETDATE(),
            ip_address NVARCHAR(50),
            user_agent NVARCHAR(500),
            token_temporal NVARCHAR(500),
            token_expiracion DATETIME2,
            intentos_fallidos INT DEFAULT 0,
            bloqueado_hasta DATETIME2 NULL,
            fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
            
            CONSTRAINT FK_AccesoPublico_Solicitud 
                FOREIGN KEY (solicitud_id) REFERENCES PPSH_TB_SOLICITUD(solicitud_id)
        );
    """)
    
    # 2. Crear índices para optimizar búsquedas
    op.execute("""
        CREATE INDEX IDX_AccesoPublico_Solicitud 
        ON SEG_TB_ACCESO_PUBLICO(solicitud_id);
    """)
    
    op.execute("""
        CREATE INDEX IDX_AccesoPublico_NumeroDocumento 
        ON SEG_TB_ACCESO_PUBLICO(numero_documento);
    """)
    
    op.execute("""
        CREATE INDEX IDX_AccesoPublico_FechaAcceso 
        ON SEG_TB_ACCESO_PUBLICO(fecha_acceso);
    """)
    
    op.execute("""
        CREATE INDEX IDX_AccesoPublico_IP 
        ON SEG_TB_ACCESO_PUBLICO(ip_address);
    """)
    
    # 3. Agregar campos a WORKFLOW_TB_ETAPA para visibilidad pública
    op.execute("""
        ALTER TABLE WORKFLOW_TB_ETAPA
        ADD visible_publico BIT DEFAULT 0;
    """)
    
    # 4. Agregar campos a WORKFLOW_TB_DOCUMENTO_ETAPA para visibilidad pública
    op.execute("""
        ALTER TABLE WORKFLOW_TB_DOCUMENTO_ETAPA
        ADD visible_publico BIT DEFAULT 1;
    """)
    
    # 5. Agregar campos a PPSH_TB_SOLICITUD para información pública
    op.execute("""
        ALTER TABLE PPSH_TB_SOLICITUD
        ADD observaciones_publicas NVARCHAR(1000) NULL;
    """)
    
    op.execute("""
        ALTER TABLE PPSH_TB_SOLICITUD
        ADD proximo_paso_publico NVARCHAR(500) NULL;
    """)
    
    op.execute("""
        ALTER TABLE PPSH_TB_SOLICITUD
        ADD solicitante_documento NVARCHAR(50) NULL;
    """)
    
    op.execute("""
        ALTER TABLE PPSH_TB_SOLICITUD
        ADD solicitante_tipo_documento NVARCHAR(20) NULL;
    """)
    
    # 6. Actualizar solicitudes existentes con datos del solicitante (si hay campo pasaporte_numero)
    # Esto depende de si ya existe un campo con esta información en la tabla
    # Si no existe, se dejará NULL por ahora y se llenará cuando se creen nuevas solicitudes
    
    # 7. Marcar etapas estándar del PPSH como visibles públicamente
    op.execute("""
        UPDATE WORKFLOW_TB_ETAPA
        SET visible_publico = 1
        WHERE nombre IN (
            'Recepción de Solicitud',
            'Revisión de Documentos',
            'Evaluación Técnica',
            'Aprobación Final',
            'Emisión de Permiso',
            'Entrega de Permiso'
        );
    """)
    
    # 8. Marcar etapas internas como NO visibles
    op.execute("""
        UPDATE WORKFLOW_TB_ETAPA
        SET visible_publico = 0
        WHERE nombre IN (
            'Revisión Interna',
            'Revisión de Antecedentes',
            'Aprobación Directiva',
            'Verificación de Seguridad'
        );
    """)


def downgrade():
    # Revertir en orden inverso
    
    # 1. Eliminar campos de PPSH_TB_SOLICITUD
    op.execute("""
        ALTER TABLE PPSH_TB_SOLICITUD
        DROP COLUMN IF EXISTS solicitante_tipo_documento;
    """)
    
    op.execute("""
        ALTER TABLE PPSH_TB_SOLICITUD
        DROP COLUMN IF EXISTS solicitante_documento;
    """)
    
    op.execute("""
        ALTER TABLE PPSH_TB_SOLICITUD
        DROP COLUMN IF EXISTS proximo_paso_publico;
    """)
    
    op.execute("""
        ALTER TABLE PPSH_TB_SOLICITUD
        DROP COLUMN IF EXISTS observaciones_publicas;
    """)
    
    # 2. Eliminar campos de WORKFLOW_TB_DOCUMENTO_ETAPA
    op.execute("""
        ALTER TABLE WORKFLOW_TB_DOCUMENTO_ETAPA
        DROP COLUMN IF EXISTS visible_publico;
    """)
    
    # 3. Eliminar campos de WORKFLOW_TB_ETAPA
    op.execute("""
        ALTER TABLE WORKFLOW_TB_ETAPA
        DROP COLUMN IF EXISTS visible_publico;
    """)
    
    # 4. Eliminar índices
    op.execute("DROP INDEX IF EXISTS IDX_AccesoPublico_IP ON SEG_TB_ACCESO_PUBLICO;")
    op.execute("DROP INDEX IF EXISTS IDX_AccesoPublico_FechaAcceso ON SEG_TB_ACCESO_PUBLICO;")
    op.execute("DROP INDEX IF EXISTS IDX_AccesoPublico_NumeroDocumento ON SEG_TB_ACCESO_PUBLICO;")
    op.execute("DROP INDEX IF EXISTS IDX_AccesoPublico_Solicitud ON SEG_TB_ACCESO_PUBLICO;")
    
    # 5. Eliminar tabla
    op.execute("DROP TABLE IF EXISTS SEG_TB_ACCESO_PUBLICO;")
