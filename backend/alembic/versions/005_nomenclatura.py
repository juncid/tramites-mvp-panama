"""Aplicar convenciones de nomenclatura de BD

Revision ID: 005_nomenclatura
Revises: 004_workflow_dinamico
Create Date: 2025-10-22 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '005_nomenclatura'
down_revision = '004_workflow_dinamico'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Aplicar convenciones de nomenclatura de base de datos"""

    # Renombrar tablas workflow a mayúsculas
    op.rename_table('workflow', 'WORKFLOW')
    op.rename_table('workflow_etapa', 'WORKFLOW_ETAPA')
    op.rename_table('workflow_conexion', 'WORKFLOW_CONEXION')
    op.rename_table('workflow_pregunta', 'WORKFLOW_PREGUNTA')
    op.rename_table('workflow_instancia', 'WORKFLOW_INSTANCIA')
    op.rename_table('workflow_respuesta_etapa', 'WORKFLOW_RESPUESTA_ETAPA')
    op.rename_table('workflow_respuesta', 'WORKFLOW_RESPUESTA')
    op.rename_table('workflow_instancia_historial', 'WORKFLOW_INSTANCIA_HISTORIAL')
    op.rename_table('workflow_comentario', 'WORKFLOW_COMENTARIO')


def downgrade() -> None:
    """Revertir convenciones de nomenclatura de base de datos"""

    # Revertir nombres de tablas
    op.rename_table('WORKFLOW_COMENTARIO', 'workflow_comentario')
    op.rename_table('WORKFLOW_INSTANCIA_HISTORIAL', 'workflow_instancia_historial')
    op.rename_table('WORKFLOW_RESPUESTA', 'workflow_respuesta')
    op.rename_table('WORKFLOW_RESPUESTA_ETAPA', 'workflow_respuesta_etapa')
    op.rename_table('WORKFLOW_INSTANCIA', 'workflow_instancia')
    op.rename_table('WORKFLOW_PREGUNTA', 'workflow_pregunta')
    op.rename_table('WORKFLOW_CONEXION', 'workflow_conexion')
    op.rename_table('WORKFLOW_ETAPA', 'workflow_etapa')
    op.rename_table('WORKFLOW', 'workflow')
