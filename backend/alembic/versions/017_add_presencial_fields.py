"""add_presencial_fields

Agrega campos para etapas de tipo PRESENCIAL

Revision ID: 017_add_presencial_fields
Revises: 016_crear_sistema_acceso_publico
Create Date: 2025-01-13 15:00:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '017_add_presencial_fields'
down_revision: Union[str, None] = '016_crear_sistema_acceso_publico'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Agregar columnas descripcion_presencial y documento_presencial a WORKFLOW_ETAPA"""
    op.add_column('WORKFLOW_ETAPA', sa.Column('descripcion_presencial', sa.Text(), nullable=True))
    op.add_column('WORKFLOW_ETAPA', sa.Column('documento_presencial', sa.String(length=500), nullable=True))


def downgrade() -> None:
    """Eliminar columnas descripcion_presencial y documento_presencial de WORKFLOW_ETAPA"""
    op.drop_column('WORKFLOW_ETAPA', 'documento_presencial')
    op.drop_column('WORKFLOW_ETAPA', 'descripcion_presencial')
