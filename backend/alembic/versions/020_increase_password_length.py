"""increase password length

Revision ID: 020_password_len
Revises: 019_codigo_acceso
Create Date: 2025-12-13 19:50:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '020_password_len'
down_revision = '019_codigo_acceso'
branch_labels = None
depends_on = None


def upgrade():
    # Increase password column length to support bcrypt hashes
    op.alter_column('SEG_TB_USUARIOS', 'PASSWORD',
               existing_type=sa.String(length=100),
               type_=sa.String(length=255),
               existing_nullable=True)


def downgrade():
    # Revert to original length
    op.alter_column('SEG_TB_USUARIOS', 'PASSWORD',
               existing_type=sa.String(length=255),
               type_=sa.String(length=100),
               existing_nullable=True)
