"""Actualizar schema Pydantic de Tramite para usar nombres de columnas correctos

Revision ID: 008_schema_tramite
Revises: 007_corregir_modelos_ppsh
Create Date: 2025-10-24 11:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '008_schema_tramite'
down_revision: Union[str, None] = '007_corregir_modelos_ppsh'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Migración no-op (sin operaciones en base de datos).
    
    Esta migración documenta la corrección de los schemas Pydantic en 
    backend/app/schemas/schemas.py para usar los nombres de columnas correctos
    que coinciden con el modelo SQLAlchemy de la tabla TRAMITE.
    
    Cambios en schemas Pydantic (solo código Python, no afecta BD):
    
    Antes (usando alias):
    - titulo: str = Field(alias="NOM_TITULO")
    - descripcion: Optional[str] = Field(alias="DESCRIPCION")
    - estado: str = Field(alias="COD_ESTADO")
    - activo: bool = Field(alias="IND_ACTIVO")
    - created_at: datetime = Field(alias="FEC_CREA_REG")
    - updated_at: Optional[datetime] = Field(alias="FEC_MODIF_REG")
    
    Después (nombres directos):
    - NOM_TITULO: str
    - DESCRIPCION: Optional[str]
    - COD_ESTADO: str
    - IND_ACTIVO: bool
    - FEC_CREA_REG: datetime
    - FEC_MODIF_REG: Optional[datetime]
    
    La tabla TRAMITE en la base de datos ya tiene los nombres de columnas correctos:
    - NOM_TITULO (VARCHAR(255))
    - DESCRIPCION (VARCHAR(1000))
    - COD_ESTADO (VARCHAR(50))
    - IND_ACTIVO (BIT/Boolean)
    - FEC_CREA_REG (DATETIME con timezone)
    - FEC_MODIF_REG (DATETIME con timezone)
    
    Este cambio resuelve el error de validación Pydantic donde los modelos
    devolvían los datos de la BD pero los schemas esperaban nombres diferentes,
    causando errores "Field required" en las respuestas de la API.
    
    Archivos modificados:
    - backend/app/schemas/schemas.py: 
      * TramiteBase
      * TramiteCreate
      * TramiteUpdate
      * TramiteResponse
    
    Se actualizó también de Pydantic v1 Config a v2 ConfigDict.
    """
    pass


def downgrade() -> None:
    """
    No hay cambios que revertir ya que:
    1. No se modificó la base de datos
    2. El cambio en schemas es una corrección, no una funcionalidad nueva
    3. Revertir causaría que la API deje de funcionar correctamente
    """
    pass
