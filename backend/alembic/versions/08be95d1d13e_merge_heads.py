"""merge_heads

Revision ID: 08be95d1d13e
Revises: 018_migrate_tipo_pregunta_values, 4478a4b15950
Create Date: 2025-11-18 21:44:35.866228

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '08be95d1d13e'
down_revision: Union[str, None] = ('018_migrate_tipo_pregunta_values', '4478a4b15950')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
