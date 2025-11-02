"""012_add_ocr_tables

Revision ID: 012_add_ocr_tables
Revises: 011_agregar_constraints_validacion
Create Date: 2025-11-01 17:41:24.696043

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '012_add_ocr_tables'
down_revision: Union[str, None] = '011_agregar_constraints_validacion'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Crear tabla PPSH_DOCUMENTO_OCR
    op.create_table(
        'PPSH_DOCUMENTO_OCR',
        sa.Column('id_ocr', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('id_documento', sa.Integer(), nullable=False),
        sa.Column('estado_ocr', sa.String(20), nullable=False, server_default='PENDIENTE'),
        sa.Column('celery_task_id', sa.String(255), nullable=True),
        sa.Column('texto_extraido', sa.Text(), nullable=True),
        sa.Column('texto_confianza', sa.Numeric(5, 2), nullable=True),
        sa.Column('idioma_detectado', sa.String(10), nullable=True),
        sa.Column('num_caracteres', sa.Integer(), nullable=True),
        sa.Column('num_palabras', sa.Integer(), nullable=True),
        sa.Column('num_paginas', sa.Integer(), nullable=True, server_default='1'),
        sa.Column('datos_estructurados', sa.Text(), nullable=True),
        sa.Column('fecha_inicio_proceso', sa.DateTime(), nullable=True),
        sa.Column('fecha_fin_proceso', sa.DateTime(), nullable=True),
        sa.Column('tiempo_procesamiento_ms', sa.Integer(), nullable=True),
        sa.Column('intentos_procesamiento', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('codigo_error', sa.String(100), nullable=True),
        sa.Column('mensaje_error', sa.String(1000), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('GETDATE()')),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.String(100), nullable=True),
        sa.Column('updated_by', sa.String(100), nullable=True),
        sa.PrimaryKeyConstraint('id_ocr'),
        sa.ForeignKeyConstraint(['id_documento'], ['PPSH_DOCUMENTO.id_documento'], 
                              name='FK_PPSH_DOCUMENTO_OCR_DOCUMENTO', ondelete='CASCADE')
    )
    
    # Índices para PPSH_DOCUMENTO_OCR
    op.create_index('IX_PPSH_DOCUMENTO_OCR_id_documento', 'PPSH_DOCUMENTO_OCR', ['id_documento'])
    op.create_index('IX_PPSH_DOCUMENTO_OCR_celery_task_id', 'PPSH_DOCUMENTO_OCR', ['celery_task_id'])
    op.create_index('IX_PPSH_DOCUMENTO_OCR_estado_ocr', 'PPSH_DOCUMENTO_OCR', ['estado_ocr'])
    op.create_index('IX_PPSH_DOCUMENTO_OCR_created_at', 'PPSH_DOCUMENTO_OCR', ['created_at'])
    
    # Crear tabla PPSH_DOCUMENTO_OCR_HISTORIAL
    op.create_table(
        'PPSH_DOCUMENTO_OCR_HISTORIAL',
        sa.Column('id_historial', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('id_ocr', sa.Integer(), nullable=True),
        sa.Column('id_documento', sa.Integer(), nullable=False),
        sa.Column('texto_extraido', sa.Text(), nullable=True),
        sa.Column('texto_confianza', sa.Numeric(5, 2), nullable=True),
        sa.Column('idioma_detectado', sa.String(10), nullable=True),
        sa.Column('num_caracteres', sa.Integer(), nullable=True),
        sa.Column('num_palabras', sa.Integer(), nullable=True),
        sa.Column('num_paginas', sa.Integer(), nullable=True),
        sa.Column('datos_estructurados', sa.Text(), nullable=True),
        sa.Column('tiempo_procesamiento_ms', sa.Integer(), nullable=True),
        sa.Column('fecha_proceso_original', sa.DateTime(), nullable=True),
        sa.Column('motivo_reprocesamiento', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('GETDATE()')),
        sa.Column('created_by', sa.String(100), nullable=True),
        sa.PrimaryKeyConstraint('id_historial'),
        sa.ForeignKeyConstraint(['id_documento'], ['PPSH_DOCUMENTO.id_documento'], 
                              name='FK_PPSH_DOCUMENTO_OCR_HIST_DOCUMENTO', ondelete='CASCADE')
    )
    
    # Índices para PPSH_DOCUMENTO_OCR_HISTORIAL
    op.create_index('IX_PPSH_DOCUMENTO_OCR_HISTORIAL_id_documento', 'PPSH_DOCUMENTO_OCR_HISTORIAL', ['id_documento'])
    op.create_index('IX_PPSH_DOCUMENTO_OCR_HISTORIAL_created_at', 'PPSH_DOCUMENTO_OCR_HISTORIAL', ['created_at'])


def downgrade() -> None:
    # Eliminar índices de PPSH_DOCUMENTO_OCR_HISTORIAL
    op.drop_index('IX_PPSH_DOCUMENTO_OCR_HISTORIAL_created_at', table_name='PPSH_DOCUMENTO_OCR_HISTORIAL')
    op.drop_index('IX_PPSH_DOCUMENTO_OCR_HISTORIAL_id_documento', table_name='PPSH_DOCUMENTO_OCR_HISTORIAL')
    
    # Eliminar tabla PPSH_DOCUMENTO_OCR_HISTORIAL
    op.drop_table('PPSH_DOCUMENTO_OCR_HISTORIAL')
    
    # Eliminar índices de PPSH_DOCUMENTO_OCR
    op.drop_index('IX_PPSH_DOCUMENTO_OCR_created_at', table_name='PPSH_DOCUMENTO_OCR')
    op.drop_index('IX_PPSH_DOCUMENTO_OCR_estado_ocr', table_name='PPSH_DOCUMENTO_OCR')
    op.drop_index('IX_PPSH_DOCUMENTO_OCR_celery_task_id', table_name='PPSH_DOCUMENTO_OCR')
    op.drop_index('IX_PPSH_DOCUMENTO_OCR_id_documento', table_name='PPSH_DOCUMENTO_OCR')
    
    # Eliminar tabla PPSH_DOCUMENTO_OCR
    op.drop_table('PPSH_DOCUMENTO_OCR')

