"""Actualizar modelos y schemas de Workflow a nombres estándar

Revision ID: 009_workflow_schemas
Revises: 008_schema_tramite
Create Date: 2025-10-24 11:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '009_workflow_schemas'
down_revision: Union[str, None] = '008_schema_tramite'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Migración no-op (sin operaciones en base de datos).
    
    Esta migración documenta la estandarización de los modelos y schemas
    del sistema de Workflow Dinámico para usar nombres consistentes.
    
    === CAMBIOS EN MODELOS (backend/app/models/models_workflow.py) ===
    
    Modelo Workflow (tabla: workflow):
    ----------------------------------
    Antes:
    - FEC_CREA_REG = Column(DateTime...)
    - ID_USUAR_CREA = Column(String(17)...)
    - FEC_MODIF_REG = Column(DateTime...)
    - ID_USUAR_MODIF = Column(String(17))
    
    Después:
    - created_at = Column(DateTime...)
    - created_by = Column(String(17))
    - updated_at = Column(DateTime...)
    - updated_by = Column(String(17))
    
    Ahora todos los modelos de Workflow usan la misma convención de nombres
    para las columnas de auditoría, consistente con la base de datos real.
    
    === CAMBIOS EN SCHEMAS (backend/app/schemas/schemas_workflow.py) ===
    
    Actualización a Pydantic v2:
    ----------------------------
    - Agregado import: from pydantic import ConfigDict
    - Cambiado de Pydantic v1 a v2:
      
      Antes (v1):
        class Config:
            from_attributes = True
      
      Después (v2):
        model_config = ConfigDict(from_attributes=True)
    
    Schemas actualizados (11 schemas):
    - WorkflowPreguntaResponse
    - WorkflowEtapaResponse
    - WorkflowConexionResponse
    - WorkflowResponse
    - WorkflowListResponse
    - WorkflowRespuestaResponse
    - WorkflowRespuestaEtapaResponse
    - WorkflowInstanciaResponse
    - WorkflowInstanciaListResponse
    - WorkflowComentarioResponse
    - WorkflowInstanciaHistorialResponse
    
    === ESTADO DE LA BASE DE DATOS ===
    
    Las tablas workflow en la base de datos ya tienen los nombres correctos:
    - workflow: created_at, created_by, updated_at, updated_by
    - workflow_etapa: created_at, created_by, updated_at, updated_by
    - workflow_conexion: created_at, created_by
    - workflow_pregunta: created_at, created_by, updated_at, updated_by
    - workflow_instancia: created_at, updated_at, updated_by
    - workflow_respuesta_etapa: created_at, updated_at, updated_by
    - workflow_respuesta: created_at, created_by, updated_at, updated_by
    - workflow_comentario: created_at, created_by
    - workflow_instancia_historial: created_at, created_by
    
    === BENEFICIOS ===
    
    1. Consistencia: Todos los modelos usan la misma convención de nombres
    2. Mantenibilidad: Código más fácil de entender y mantener
    3. Interoperabilidad: Los modelos coinciden con los nombres reales de BD
    4. Pydantic v2: Mejor rendimiento y características modernas
    5. Sin errores de validación: Los schemas coinciden con los datos devueltos
    
    === ARCHIVOS MODIFICADOS ===
    
    1. backend/app/models/models_workflow.py
       - Modelo Workflow: Cambiadas 4 columnas de auditoría
    
    2. backend/app/schemas/schemas_workflow.py
       - Actualizado a Pydantic v2 ConfigDict
       - 11 schemas response actualizados
    
    3. backend/scripts/update_workflow_schemas_to_pydantic_v2.py
       - Script de migración automatizada (creado)
    """
    pass


def downgrade() -> None:
    """
    No hay cambios que revertir ya que:
    1. No se modificó la base de datos
    2. Los cambios en modelos/schemas son correcciones necesarias
    3. Pydantic v2 es compatible con v1 en estos casos
    """
    pass
