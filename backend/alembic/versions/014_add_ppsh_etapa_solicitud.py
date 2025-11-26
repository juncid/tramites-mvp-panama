"""add ppsh etapa solicitud table

Revision ID: 014_add_ppsh_etapa_solicitud
Revises: 013_ocr_endpoint_integration
Create Date: 2025-11-03 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mssql

# revision identifiers, used by Alembic.
revision = '014_add_ppsh_etapa_solicitud'
down_revision = '013_ocr_endpoint_integration'
branch_labels = None
depends_on = None


def upgrade():
    """
    Crea tabla para tracking de etapas del proceso PPSH por solicitud.
    Permite registrar el estado de cada etapa (1.2, 1.7, etc.) de manera dinámica.
    """
    
    # Crear tabla PPSH_ETAPA_SOLICITUD
    op.create_table(
        'PPSH_ETAPA_SOLICITUD',
        sa.Column('id_etapa_solicitud', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('id_solicitud', sa.Integer(), nullable=False),
        sa.Column('codigo_etapa', sa.String(20), nullable=False),  # Ej: "1.2", "1.7"
        sa.Column('nombre_etapa', sa.String(500), nullable=False),
        sa.Column('descripcion', sa.String(2000)),
        sa.Column('estado', sa.String(20), nullable=False, server_default='PENDIENTE'),  # PENDIENTE, EN_PROCESO, COMPLETADO
        sa.Column('orden', sa.Integer(), nullable=False),  # Para ordenar las etapas
        sa.Column('fecha_inicio', sa.DateTime()),
        sa.Column('fecha_completado', sa.DateTime()),
        sa.Column('completado_por', sa.String(17)),
        sa.Column('observaciones', sa.String(1000)),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), onupdate=sa.func.now()),
        
        sa.PrimaryKeyConstraint('id_etapa_solicitud'),
        sa.ForeignKeyConstraint(['id_solicitud'], ['PPSH_SOLICITUD.id_solicitud'], ondelete='CASCADE'),
    )
    
    # Crear índices
    op.create_index('ix_ppsh_etapa_solicitud_id_solicitud', 'PPSH_ETAPA_SOLICITUD', ['id_solicitud'])
    op.create_index('ix_ppsh_etapa_solicitud_codigo_etapa', 'PPSH_ETAPA_SOLICITUD', ['codigo_etapa'])
    op.create_index('ix_ppsh_etapa_solicitud_estado', 'PPSH_ETAPA_SOLICITUD', ['estado'])
    
    # Crear índice único compuesto (una solicitud no puede tener la misma etapa duplicada)
    op.create_index(
        'ix_ppsh_etapa_solicitud_unique',
        'PPSH_ETAPA_SOLICITUD',
        ['id_solicitud', 'codigo_etapa'],
        unique=True
    )
    
    # Insertar etapas por defecto para solicitudes existentes
    op.execute("""
        INSERT INTO PPSH_ETAPA_SOLICITUD (id_solicitud, codigo_etapa, nombre_etapa, estado, orden, created_at)
        SELECT 
            id_solicitud,
            '1.2' as codigo_etapa,
            'Recolectar requisitos del trámite PPSH y los anexo en el sistema' as nombre_etapa,
            'COMPLETADO' as estado,
            1 as orden,
            GETDATE() as created_at
        FROM PPSH_SOLICITUD
        WHERE NOT EXISTS (
            SELECT 1 FROM PPSH_ETAPA_SOLICITUD 
            WHERE PPSH_ETAPA_SOLICITUD.id_solicitud = PPSH_SOLICITUD.id_solicitud 
            AND codigo_etapa = '1.2'
        )
    """)
    
    op.execute("""
        INSERT INTO PPSH_ETAPA_SOLICITUD (id_solicitud, codigo_etapa, nombre_etapa, estado, orden, created_at)
        SELECT 
            id_solicitud,
            '1.7' as codigo_etapa,
            'Revisados requisitos vs checklist en Sistema, completa control de cita, valida # caso, registro' as nombre_etapa,
            'PENDIENTE' as estado,
            2 as orden,
            GETDATE() as created_at
        FROM PPSH_SOLICITUD
        WHERE NOT EXISTS (
            SELECT 1 FROM PPSH_ETAPA_SOLICITUD 
            WHERE PPSH_ETAPA_SOLICITUD.id_solicitud = PPSH_SOLICITUD.id_solicitud 
            AND codigo_etapa = '1.7'
        )
    """)


def downgrade():
    """Revertir cambios"""
    op.drop_index('ix_ppsh_etapa_solicitud_unique', 'PPSH_ETAPA_SOLICITUD')
    op.drop_index('ix_ppsh_etapa_solicitud_estado', 'PPSH_ETAPA_SOLICITUD')
    op.drop_index('ix_ppsh_etapa_solicitud_codigo_etapa', 'PPSH_ETAPA_SOLICITUD')
    op.drop_index('ix_ppsh_etapa_solicitud_id_solicitud', 'PPSH_ETAPA_SOLICITUD')
    op.drop_table('PPSH_ETAPA_SOLICITUD')
