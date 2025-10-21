"""Agregar sistema de workflow dinámico

Revision ID: workflow_001
Revises: 
Create Date: 2025-10-20 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON

# revision identifiers, used by Alembic.
revision = '004_workflow_dinamico'
down_revision = '003_agregar_categoria_tipo_documento'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ==========================================
    # TABLA: workflow
    # ==========================================
    op.create_table(
        'workflow',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('codigo', sa.String(length=50), nullable=False),
        sa.Column('nombre', sa.String(length=255), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('version', sa.String(length=20), nullable=False, server_default='1.0'),
        sa.Column('estado', sa.String(length=20), nullable=False, server_default='BORRADOR'),
        sa.Column('color_hex', sa.String(length=7), nullable=True),
        sa.Column('icono', sa.String(length=50), nullable=True),
        sa.Column('categoria', sa.String(length=100), nullable=True),
        sa.Column('requiere_autenticacion', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('es_publico', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('perfiles_creadores', JSON, nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('created_by', sa.String(length=17), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_by', sa.String(length=17), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('codigo')
    )
    op.create_index('ix_workflow_id', 'workflow', ['id'])
    op.create_index('ix_workflow_codigo', 'workflow', ['codigo'])
    op.create_index('ix_workflow_estado', 'workflow', ['estado'])
    op.create_index('ix_workflow_categoria', 'workflow', ['categoria'])
    op.create_index('ix_workflow_created_by', 'workflow', ['created_by'])

    # ==========================================
    # TABLA: workflow_etapa
    # ==========================================
    op.create_table(
        'workflow_etapa',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('workflow_id', sa.Integer(), nullable=False),
        sa.Column('codigo', sa.String(length=50), nullable=False),
        sa.Column('nombre', sa.String(length=255), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('tipo_etapa', sa.String(length=20), nullable=False, server_default='ETAPA'),
        sa.Column('orden', sa.Integer(), nullable=False),
        sa.Column('posicion_x', sa.Integer(), nullable=True),
        sa.Column('posicion_y', sa.Integer(), nullable=True),
        sa.Column('perfiles_permitidos', JSON, nullable=True),
        sa.Column('titulo_formulario', sa.String(length=500), nullable=True),
        sa.Column('bajada_formulario', sa.Text(), nullable=True),
        sa.Column('es_etapa_inicial', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('es_etapa_final', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('requiere_validacion', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('permite_edicion_posterior', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('tiempo_estimado_minutos', sa.Integer(), nullable=True),
        sa.Column('reglas_transicion', JSON, nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('created_by', sa.String(length=17), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_by', sa.String(length=17), nullable=True),
        sa.ForeignKeyConstraint(['workflow_id'], ['workflow.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_workflow_etapa_id', 'workflow_etapa', ['id'])
    op.create_index('ix_workflow_etapa_workflow_id', 'workflow_etapa', ['workflow_id'])
    op.create_index('ix_workflow_etapa_codigo', 'workflow_etapa', ['codigo'])

    # ==========================================
    # TABLA: workflow_pregunta
    # ==========================================
    op.create_table(
        'workflow_pregunta',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('etapa_id', sa.Integer(), nullable=False),
        sa.Column('codigo', sa.String(length=50), nullable=False),
        sa.Column('pregunta', sa.Text(), nullable=False),
        sa.Column('tipo_pregunta', sa.String(length=50), nullable=False),
        sa.Column('orden', sa.Integer(), nullable=False),
        sa.Column('es_obligatoria', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('validacion_regex', sa.String(length=500), nullable=True),
        sa.Column('mensaje_validacion', sa.String(length=500), nullable=True),
        sa.Column('opciones', JSON, nullable=True),
        sa.Column('opciones_datos_caso', JSON, nullable=True),
        sa.Column('permite_multiple', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('extensiones_permitidas', JSON, nullable=True),
        sa.Column('tamano_maximo_mb', sa.Integer(), nullable=True),
        sa.Column('requiere_ocr', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('texto_ayuda', sa.Text(), nullable=True),
        sa.Column('placeholder', sa.String(length=255), nullable=True),
        sa.Column('valor_predeterminado', sa.String(length=500), nullable=True),
        sa.Column('mostrar_si', JSON, nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('created_by', sa.String(length=17), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_by', sa.String(length=17), nullable=True),
        sa.ForeignKeyConstraint(['etapa_id'], ['workflow_etapa.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_workflow_pregunta_id', 'workflow_pregunta', ['id'])
    op.create_index('ix_workflow_pregunta_etapa_id', 'workflow_pregunta', ['etapa_id'])
    op.create_index('ix_workflow_pregunta_codigo', 'workflow_pregunta', ['codigo'])

    # ==========================================
    # TABLA: workflow_conexion
    # ==========================================
    op.create_table(
        'workflow_conexion',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('workflow_id', sa.Integer(), nullable=False),
        sa.Column('etapa_origen_id', sa.Integer(), nullable=False),
        sa.Column('etapa_destino_id', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=255), nullable=True),
        sa.Column('condicion', JSON, nullable=True),
        sa.Column('es_predeterminada', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('activo', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('created_by', sa.String(length=17), nullable=True),
        sa.ForeignKeyConstraint(['workflow_id'], ['workflow.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['etapa_origen_id'], ['workflow_etapa.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['etapa_destino_id'], ['workflow_etapa.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_workflow_conexion_id', 'workflow_conexion', ['id'])
    op.create_index('ix_workflow_conexion_workflow_id', 'workflow_conexion', ['workflow_id'])
    op.create_index('ix_workflow_conexion_etapa_origen_id', 'workflow_conexion', ['etapa_origen_id'])
    op.create_index('ix_workflow_conexion_etapa_destino_id', 'workflow_conexion', ['etapa_destino_id'])

    # ==========================================
    # TABLA: workflow_instancia
    # ==========================================
    op.create_table(
        'workflow_instancia',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('workflow_id', sa.Integer(), nullable=False),
        sa.Column('num_expediente', sa.String(length=50), nullable=False),
        sa.Column('nombre_instancia', sa.String(length=255), nullable=True),
        sa.Column('estado', sa.String(length=20), nullable=False, server_default='INICIADO'),
        sa.Column('etapa_actual_id', sa.Integer(), nullable=True),
        sa.Column('creado_por_user_id', sa.String(length=17), nullable=False),
        sa.Column('asignado_a_user_id', sa.String(length=17), nullable=True),
        sa.Column('fecha_inicio', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('fecha_estimada_fin', sa.DateTime(timezone=True), nullable=True),
        sa.Column('fecha_fin', sa.DateTime(timezone=True), nullable=True),
        sa.Column('metadata_adicional', JSON, nullable=True),
        sa.Column('prioridad', sa.String(length=10), nullable=False, server_default='NORMAL'),
        sa.Column('activo', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_by', sa.String(length=17), nullable=True),
        sa.ForeignKeyConstraint(['workflow_id'], ['workflow.id']),
        sa.ForeignKeyConstraint(['etapa_actual_id'], ['workflow_etapa.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('num_expediente')
    )
    op.create_index('ix_workflow_instancia_id', 'workflow_instancia', ['id'])
    op.create_index('ix_workflow_instancia_workflow_id', 'workflow_instancia', ['workflow_id'])
    op.create_index('ix_workflow_instancia_num_expediente', 'workflow_instancia', ['num_expediente'])
    op.create_index('ix_workflow_instancia_estado', 'workflow_instancia', ['estado'])
    op.create_index('ix_workflow_instancia_etapa_actual_id', 'workflow_instancia', ['etapa_actual_id'])
    op.create_index('ix_workflow_instancia_creado_por_user_id', 'workflow_instancia', ['creado_por_user_id'])
    op.create_index('ix_workflow_instancia_asignado_a_user_id', 'workflow_instancia', ['asignado_a_user_id'])

    # ==========================================
    # TABLA: workflow_respuesta_etapa
    # ==========================================
    op.create_table(
        'workflow_respuesta_etapa',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('instancia_id', sa.Integer(), nullable=False),
        sa.Column('etapa_id', sa.Integer(), nullable=False),
        sa.Column('completada', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('fecha_inicio', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('fecha_completado', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completado_por_user_id', sa.String(length=17), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_by', sa.String(length=17), nullable=True),
        sa.ForeignKeyConstraint(['instancia_id'], ['workflow_instancia.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['etapa_id'], ['workflow_etapa.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_workflow_respuesta_etapa_id', 'workflow_respuesta_etapa', ['id'])
    op.create_index('ix_workflow_respuesta_etapa_instancia_id', 'workflow_respuesta_etapa', ['instancia_id'])
    op.create_index('ix_workflow_respuesta_etapa_etapa_id', 'workflow_respuesta_etapa', ['etapa_id'])

    # ==========================================
    # TABLA: workflow_respuesta
    # ==========================================
    op.create_table(
        'workflow_respuesta',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('respuesta_etapa_id', sa.Integer(), nullable=False),
        sa.Column('pregunta_id', sa.Integer(), nullable=False),
        sa.Column('valor_texto', sa.Text(), nullable=True),
        sa.Column('valor_json', JSON, nullable=True),
        sa.Column('valor_fecha', sa.DateTime(timezone=True), nullable=True),
        sa.Column('valor_booleano', sa.Boolean(), nullable=True),
        sa.Column('archivos', JSON, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('created_by', sa.String(length=17), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_by', sa.String(length=17), nullable=True),
        sa.ForeignKeyConstraint(['respuesta_etapa_id'], ['workflow_respuesta_etapa.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['pregunta_id'], ['workflow_pregunta.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_workflow_respuesta_id', 'workflow_respuesta', ['id'])
    op.create_index('ix_workflow_respuesta_respuesta_etapa_id', 'workflow_respuesta', ['respuesta_etapa_id'])
    op.create_index('ix_workflow_respuesta_pregunta_id', 'workflow_respuesta', ['pregunta_id'])

    # ==========================================
    # TABLA: workflow_instancia_historial
    # ==========================================
    op.create_table(
        'workflow_instancia_historial',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('instancia_id', sa.Integer(), nullable=False),
        sa.Column('tipo_cambio', sa.String(length=50), nullable=False),
        sa.Column('etapa_origen_id', sa.Integer(), nullable=True),
        sa.Column('etapa_destino_id', sa.Integer(), nullable=True),
        sa.Column('estado_anterior', sa.String(length=50), nullable=True),
        sa.Column('estado_nuevo', sa.String(length=50), nullable=True),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('datos_adicionales', JSON, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('created_by', sa.String(length=17), nullable=False),
        sa.ForeignKeyConstraint(['instancia_id'], ['workflow_instancia.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['etapa_origen_id'], ['workflow_etapa.id']),
        sa.ForeignKeyConstraint(['etapa_destino_id'], ['workflow_etapa.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_workflow_instancia_historial_id', 'workflow_instancia_historial', ['id'])
    op.create_index('ix_workflow_instancia_historial_instancia_id', 'workflow_instancia_historial', ['instancia_id'])
    op.create_index('ix_workflow_instancia_historial_tipo_cambio', 'workflow_instancia_historial', ['tipo_cambio'])
    op.create_index('ix_workflow_instancia_historial_created_at', 'workflow_instancia_historial', ['created_at'])
    op.create_index('ix_workflow_instancia_historial_created_by', 'workflow_instancia_historial', ['created_by'])

    # ==========================================
    # TABLA: workflow_comentario
    # ==========================================
    op.create_table(
        'workflow_comentario',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('instancia_id', sa.Integer(), nullable=False),
        sa.Column('comentario', sa.Text(), nullable=False),
        sa.Column('es_interno', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('es_notificacion', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('archivos', JSON, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('created_by', sa.String(length=17), nullable=False),
        sa.ForeignKeyConstraint(['instancia_id'], ['workflow_instancia.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_workflow_comentario_id', 'workflow_comentario', ['id'])
    op.create_index('ix_workflow_comentario_instancia_id', 'workflow_comentario', ['instancia_id'])
    op.create_index('ix_workflow_comentario_created_at', 'workflow_comentario', ['created_at'])
    op.create_index('ix_workflow_comentario_created_by', 'workflow_comentario', ['created_by'])


def downgrade() -> None:
    # Eliminar tablas en orden inverso (por dependencias)
    op.drop_table('workflow_comentario')
    op.drop_table('workflow_instancia_historial')
    op.drop_table('workflow_respuesta')
    op.drop_table('workflow_respuesta_etapa')
    op.drop_table('workflow_instancia')
    op.drop_table('workflow_conexion')
    op.drop_table('workflow_pregunta')
    op.drop_table('workflow_etapa')
    op.drop_table('workflow')
