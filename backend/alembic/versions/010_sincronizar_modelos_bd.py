"""Sincronizar modelos con base de datos

Migración para alinear la base de datos con los modelos SQLAlchemy:
- Renombra tablas workflow de minúsculas a MAYÚSCULAS
- Elimina columnas updated_at/updated_by de tablas PPSH (no usadas)
- Agrega índices en tablas SIM_FT para mejorar performance
- Agrega foreign keys para integridad referencial

Revision ID: 010_sincronizar_modelos_bd
Revises: 009_workflow_schemas
Create Date: 2025-10-24 18:52:00.000000

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
    """
    Sincroniza modelos SQLAlchemy con base de datos.
    
    Cambios aplicados:
    1. Renombra tablas workflow (minúsculas -> MAYÚSCULAS)
    2. Elimina columnas no utilizadas en tablas PPSH
    3. Agrega índices para mejorar consultas en tablas SIM_FT
    4. Agrega foreign keys para integridad referencial
    """
    
    # 1. RENOMBRAR TABLAS WORKFLOW (minúsculas -> MAYÚSCULAS)
    op.execute("EXEC sp_rename 'workflow', 'WORKFLOW'")
    op.execute("EXEC sp_rename 'workflow_etapa', 'WORKFLOW_ETAPA'")
    op.execute("EXEC sp_rename 'workflow_conexion', 'WORKFLOW_CONEXION'")
    op.execute("EXEC sp_rename 'workflow_instancia', 'WORKFLOW_INSTANCIA'")
    op.execute("EXEC sp_rename 'workflow_pregunta', 'WORKFLOW_PREGUNTA'")
    op.execute("EXEC sp_rename 'workflow_comentario', 'WORKFLOW_COMENTARIO'")
    op.execute("EXEC sp_rename 'workflow_instancia_historial', 'WORKFLOW_INSTANCIA_HISTORIAL'")
    op.execute("EXEC sp_rename 'workflow_respuesta_etapa', 'WORKFLOW_RESPUESTA_ETAPA'")
    op.execute("EXEC sp_rename 'workflow_respuesta', 'WORKFLOW_RESPUESTA'")
    
    # 2. ELIMINAR COLUMNAS NO UTILIZADAS DE TABLAS PPSH
    with op.batch_alter_table('PPSH_CONCEPTO_PAGO', schema=None) as batch_op:
        batch_op.drop_column('updated_at')
        batch_op.drop_column('updated_by')
    
    with op.batch_alter_table('PPSH_ENTREVISTA', schema=None) as batch_op:
        batch_op.drop_column('updated_at')
        batch_op.drop_column('updated_by')
    
    with op.batch_alter_table('PPSH_PAGO', schema=None) as batch_op:
        batch_op.drop_column('updated_at')
        batch_op.drop_column('updated_by')
    
    with op.batch_alter_table('PPSH_SOLICITANTE', schema=None) as batch_op:
        batch_op.drop_column('updated_at')
        batch_op.drop_column('updated_by')
    
    with op.batch_alter_table('PPSH_SOLICITUD', schema=None) as batch_op:
        batch_op.drop_column('updated_at')
        batch_op.drop_column('updated_by')
    
    # 3. AGREGAR ÍNDICES EN TABLAS SIM_FT
    op.create_index('IX_SIM_FT_PASOS_IND_ACTIVO', 'SIM_FT_PASOS', ['IND_ACTIVO'], unique=False)
    op.create_index('IX_SIM_FT_PASOXTRAM_COD_SECCION', 'SIM_FT_PASOXTRAM', ['COD_SECCION'], unique=False)
    
    op.create_index('IX_SIM_FT_TRAMITE_D_COD_SECCION', 'SIM_FT_TRAMITE_D', ['COD_SECCION'], unique=False)
    op.create_index('IX_SIM_FT_TRAMITE_D_COD_TRAMITE', 'SIM_FT_TRAMITE_D', ['COD_TRAMITE'], unique=False)
    op.create_index('IX_SIM_FT_TRAMITE_D_IND_ESTATUS', 'SIM_FT_TRAMITE_D', ['IND_ESTATUS'], unique=False)
    
    op.create_index('IX_SIM_FT_TRAMITE_E_COD_TRAMITE', 'SIM_FT_TRAMITE_E', ['COD_TRAMITE'], unique=False)
    op.create_index('IX_SIM_FT_TRAMITE_E_FEC_INI', 'SIM_FT_TRAMITE_E', ['FEC_INI_TRAMITE'], unique=False)
    op.create_index('IX_SIM_FT_TRAMITE_E_IND_ESTATUS', 'SIM_FT_TRAMITE_E', ['IND_ESTATUS'], unique=False)
    
    op.create_index('IX_SIM_FT_USUA_SEC_COD_AGENCIA', 'SIM_FT_USUA_SEC', ['COD_AGENCIA'], unique=False)
    op.create_index('IX_SIM_FT_USUA_SEC_COD_SECCION', 'SIM_FT_USUA_SEC', ['COD_SECCION'], unique=False)
    
    # 4. AGREGAR FOREIGN KEYS (con manejo de errores si ya existen)
    try:
        op.create_foreign_key('FK_SIM_FT_PASOS_TRAMITES', 'SIM_FT_PASOS', 'SIM_FT_TRAMITES', ['COD_TRAMITE'], ['COD_TRAMITE'])
    except:
        pass
    
    try:
        op.create_foreign_key('FK_SIM_FT_PASOXTRAM_TRAMITES', 'SIM_FT_PASOXTRAM', 'SIM_FT_TRAMITES', ['COD_TRAMITE'], ['COD_TRAMITE'])
    except:
        pass
    
    try:
        op.create_foreign_key('FK_SIM_FT_TRAMITE_CIERRE_CONCLUSION', 'SIM_FT_TRAMITE_CIERRE', 'SIM_FT_CONCLUSION', ['COD_CONCLUSION'], ['COD_CONCLUSION'])
    except:
        pass
    
    try:
        op.create_foreign_key('FK_SIM_FT_TRAMITE_E_TRAMITES', 'SIM_FT_TRAMITE_E', 'SIM_FT_TRAMITES', ['COD_TRAMITE'], ['COD_TRAMITE'])
    except:
        pass
    
    try:
        op.create_foreign_key('FK_SIM_FT_TRAMITE_E_ESTATUS', 'SIM_FT_TRAMITE_E', 'SIM_FT_ESTATUS', ['IND_ESTATUS'], ['COD_ESTATUS'])
    except:
        pass
    
    try:
        op.create_foreign_key('FK_SIM_FT_TRAMITE_E_CONCLUSION', 'SIM_FT_TRAMITE_E', 'SIM_FT_CONCLUSION', ['IND_CONCLUSION'], ['COD_CONCLUSION'])
    except:
        pass
    
    try:
        op.create_foreign_key('FK_SIM_FT_TRAMITE_E_PRIORIDAD', 'SIM_FT_TRAMITE_E', 'SIM_FT_PRIORIDAD', ['IND_PRIORIDAD'], ['COD_PRIORIDAD'])
    except:
        pass


def downgrade() -> None:
    """Revertir cambios de sincronización"""
    
    # Revertir renombrado de tablas
    op.execute("EXEC sp_rename 'WORKFLOW', 'workflow'")
    op.execute("EXEC sp_rename 'WORKFLOW_ETAPA', 'workflow_etapa'")
    op.execute("EXEC sp_rename 'WORKFLOW_CONEXION', 'workflow_conexion'")
    op.execute("EXEC sp_rename 'WORKFLOW_INSTANCIA', 'workflow_instancia'")
    op.execute("EXEC sp_rename 'WORKFLOW_PREGUNTA', 'workflow_pregunta'")
    op.execute("EXEC sp_rename 'WORKFLOW_COMENTARIO', 'workflow_comentario'")
    op.execute("EXEC sp_rename 'WORKFLOW_INSTANCIA_HISTORIAL', 'workflow_instancia_historial'")
    op.execute("EXEC sp_rename 'WORKFLOW_RESPUESTA_ETAPA', 'workflow_respuesta_etapa'")
    op.execute("EXEC sp_rename 'WORKFLOW_RESPUESTA', 'workflow_respuesta'")
    
    # Revertir índices
    op.drop_index('IX_SIM_FT_PASOS_IND_ACTIVO', 'SIM_FT_PASOS')
    op.drop_index('IX_SIM_FT_PASOXTRAM_COD_SECCION', 'SIM_FT_PASOXTRAM')
    op.drop_index('IX_SIM_FT_TRAMITE_D_COD_SECCION', 'SIM_FT_TRAMITE_D')
    op.drop_index('IX_SIM_FT_TRAMITE_D_COD_TRAMITE', 'SIM_FT_TRAMITE_D')
    op.drop_index('IX_SIM_FT_TRAMITE_D_IND_ESTATUS', 'SIM_FT_TRAMITE_D')
    op.drop_index('IX_SIM_FT_TRAMITE_E_COD_TRAMITE', 'SIM_FT_TRAMITE_E')
    op.drop_index('IX_SIM_FT_TRAMITE_E_FEC_INI', 'SIM_FT_TRAMITE_E')
    op.drop_index('IX_SIM_FT_TRAMITE_E_IND_ESTATUS', 'SIM_FT_TRAMITE_E')
    op.drop_index('IX_SIM_FT_USUA_SEC_COD_AGENCIA', 'SIM_FT_USUA_SEC')
    op.drop_index('IX_SIM_FT_USUA_SEC_COD_SECCION', 'SIM_FT_USUA_SEC')

