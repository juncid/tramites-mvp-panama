"""Corregir modelos PPSH - eliminar campos updated_at/updated_by inexistentes

Revision ID: 007_corregir_modelos_ppsh
Revises: 88ea061b1ac5
Create Date: 2025-10-23 23:39:22.005547

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '007_corregir_modelos_ppsh'
down_revision: Union[str, None] = '88ea061b1ac5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Migración no-op (sin operaciones).
    
    Las columnas updated_at y updated_by fueron eliminadas de los modelos SQLAlchemy
    de las tablas PPSH (PPSH_SOLICITUD, PPSH_SOLICITANTE, PPSH_ENTREVISTA, 
    PPSH_CONCEPTO_PAGO, PPSH_PAGO) porque nunca existieron en la base de datos real.
    
    Esta migración documenta el cambio en los modelos sin realizar cambios en la BD.
    
    Tablas afectadas (solo en modelos Python, no en BD):
    - PPSH_SOLICITUD: eliminados updated_at, updated_by
    - PPSH_SOLICITANTE: eliminados updated_at, updated_by  
    - PPSH_ENTREVISTA: eliminados updated_at, updated_by
    - PPSH_CONCEPTO_PAGO: eliminados updated_at, updated_by
    - PPSH_PAGO: eliminados updated_at, updated_by
    
    Las tablas ya usaban created_at y created_by correctamente.
    """
    pass


def downgrade() -> None:
    """No hay cambios que revertir ya que no se modificó la base de datos."""
    pass
