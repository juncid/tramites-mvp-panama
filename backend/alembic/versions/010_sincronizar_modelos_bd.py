"""Sincronizar modelos con base de datos

Revision ID: ad1f553731a2
Revises: 009_workflow_schemas
Create Date: 2025-10-24 18:52:47.773476

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '010_sincronizar_modelos_bd'
down_revision: Union[str, None] = '009_workflow_schemas'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
