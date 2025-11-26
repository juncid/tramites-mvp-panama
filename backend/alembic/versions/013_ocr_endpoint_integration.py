"""013_ocr_endpoint_integration

Integración de información OCR en el endpoint de documentos.

NOTA: Esta migración documenta cambios en la API, no en la base de datos.

Cambios implementados:
- Endpoint GET /ppsh/solicitudes/{id}/documentos ahora incluye información OCR
- Nuevo schema OCRResultadoResponse con:
  * id_ocr, estado_ocr, texto_confianza
  * idioma_detectado, num_paginas
  * datos_estructurados (dict con campos extraídos)
  * codigo_error, mensaje_error
- DocumentoResponse actualizado con:
  * ocr_resultado: Optional[OCRResultadoResponse]
  * ocr_exitoso: bool (True si estado_ocr='COMPLETADO' y confianza >= 70%)
- Eager loading de ocr_results con joinedload para evitar N+1 queries

La estructura de base de datos (PPSH_DOCUMENTO_OCR) ya existe desde migración 012.
No hay cambios de esquema en esta migración.

Revision ID: 013_ocr_endpoint_integration
Revises: 012_add_ocr_tables
Create Date: 2025-11-03 18:03:37.698955

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '013_ocr_endpoint_integration'
down_revision: Union[str, None] = '012_add_ocr_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    No hay cambios en el esquema de base de datos.
    Esta migración documenta la integración de OCR en la API.
    """
    pass


def downgrade() -> None:
    """
    No hay cambios en el esquema de base de datos.
    """
    pass
