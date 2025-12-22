"""migrate_tipo_pregunta_values

Migra valores antiguos de tipo_pregunta a los nuevos valores del enum:
- TEXTO -> RESPUESTA_TEXTO
- SELECCION_SIMPLE -> OPCIONES
- FECHA -> SELECCION_FECHA

Revision ID: 018_migrate_tipo_pregunta_values
Revises: 017_add_presencial_fields
Create Date: 2025-11-18 10:00:00

"""
from typing import Sequence, Union
from alembic import op


# revision identifiers, used by Alembic.
revision: str = '018_migrate_tipo_pregunta_values'
down_revision: Union[str, None] = '017_add_presencial_fields'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Actualizar valores antiguos de tipo_pregunta a los nuevos valores del enum"""
    
    # Mapeo de valores antiguos a nuevos
    # TEXTO -> RESPUESTA_TEXTO
    op.execute("""
        UPDATE WORKFLOW_PREGUNTA
        SET tipo_pregunta = 'RESPUESTA_TEXTO'
        WHERE tipo_pregunta = 'TEXTO'
    """)
    
    # SELECCION_SIMPLE -> OPCIONES
    op.execute("""
        UPDATE WORKFLOW_PREGUNTA
        SET tipo_pregunta = 'OPCIONES'
        WHERE tipo_pregunta = 'SELECCION_SIMPLE'
    """)
    
    # FECHA -> SELECCION_FECHA
    op.execute("""
        UPDATE WORKFLOW_PREGUNTA
        SET tipo_pregunta = 'SELECCION_FECHA'
        WHERE tipo_pregunta = 'FECHA'
    """)
    
    # Otros valores legacy que podrían existir
    # NUMERO -> RESPUESTA_TEXTO (se validará como número en el frontend)
    op.execute("""
        UPDATE WORKFLOW_PREGUNTA
        SET tipo_pregunta = 'RESPUESTA_TEXTO'
        WHERE tipo_pregunta = 'NUMERO'
    """)
    
    # SELECCION_MULTIPLE -> OPCIONES (con permite_multiple = true)
    op.execute("""
        UPDATE WORKFLOW_PREGUNTA
        SET tipo_pregunta = 'OPCIONES',
            permite_multiple = 1
        WHERE tipo_pregunta = 'SELECCION_MULTIPLE'
    """)


def downgrade() -> None:
    """Revertir valores a los antiguos (por si se necesita rollback)"""
    
    # RESPUESTA_TEXTO -> TEXTO (solo los que no tienen permite_multiple)
    op.execute("""
        UPDATE WORKFLOW_PREGUNTA
        SET tipo_pregunta = 'TEXTO'
        WHERE tipo_pregunta = 'RESPUESTA_TEXTO'
        AND (permite_multiple IS NULL OR permite_multiple = 0)
    """)
    
    # OPCIONES -> SELECCION_SIMPLE o SELECCION_MULTIPLE
    op.execute("""
        UPDATE WORKFLOW_PREGUNTA
        SET tipo_pregunta = 'SELECCION_SIMPLE'
        WHERE tipo_pregunta = 'OPCIONES'
        AND (permite_multiple IS NULL OR permite_multiple = 0)
    """)
    
    op.execute("""
        UPDATE WORKFLOW_PREGUNTA
        SET tipo_pregunta = 'SELECCION_MULTIPLE'
        WHERE tipo_pregunta = 'OPCIONES'
        AND permite_multiple = 1
    """)
    
    # SELECCION_FECHA -> FECHA
    op.execute("""
        UPDATE WORKFLOW_PREGUNTA
        SET tipo_pregunta = 'FECHA'
        WHERE tipo_pregunta = 'SELECCION_FECHA'
    """)
