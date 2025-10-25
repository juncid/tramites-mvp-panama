"""Implementar estructura completa SIM_FT_* para tramites

Revision ID: 88ea061b1ac5
Revises: 005_nomenclatura
Create Date: 2025-10-22 23:57:44.708293

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '88ea061b1ac5'
down_revision: Union[str, None] = '005_nomenclatura'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
