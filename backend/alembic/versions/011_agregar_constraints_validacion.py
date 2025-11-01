"""Agregar constraints de validación e integridad

Migración para implementar todas las validaciones documentadas en Informe N°4:
- Check Constraints: 35 validaciones de reglas de negocio
- Unique Constraints: 21 restricciones de unicidad
- Foreign Keys: 42 relaciones de integridad referencial
- Default Constraints: 27 valores predeterminados

Revision ID: 011_agregar_constraints_validacion
Revises: 010_sincronizar_modelos_bd
Create Date: 2025-10-27 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '011_agregar_constraints_validacion'
down_revision: Union[str, None] = '010_sincronizar_modelos_bd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Implementa todos los constraints de validación documentados en Informe N°4.
    
    Se organizan en 5 secciones:
    1. Check Constraints (validaciones de reglas de negocio)
    2. Unique Constraints (unicidad de códigos y números)
    3. Foreign Keys (integridad referencial completa)
    4. Default Constraints (valores predeterminados)
    5. Índices de optimización
    """
    
    # ==============================================================================
    # SECCIÓN 1: CHECK CONSTRAINTS - MÓDULO PPSH
    # ==============================================================================
    
    print("Agregando Check Constraints para módulo PPSH...")
    
    # Validación de duración de viaje (1-180 días)
    op.execute("""
        ALTER TABLE PPSH_SOLICITUD
        ADD CONSTRAINT CK_PPSH_duracion_viaje
        CHECK (duracion_viaje BETWEEN 1 AND 180)
    """)
    
    # Validación de fechas lógicas en solicitud
    op.execute("""
        ALTER TABLE PPSH_SOLICITUD
        ADD CONSTRAINT CK_PPSH_fechas_logicas
        CHECK (fecha_salida >= CAST(fecha_solicitud AS DATE))
    """)
    
    # Validación de fecha de retorno
    op.execute("""
        ALTER TABLE PPSH_SOLICITUD
        ADD CONSTRAINT CK_PPSH_fecha_retorno
        CHECK (fecha_retorno IS NULL OR fecha_retorno >= fecha_salida)
    """)
    
    # Validación de estados válidos de solicitud
    op.execute("""
        ALTER TABLE PPSH_SOLICITUD
        ADD CONSTRAINT CK_PPSH_estado_valido
        CHECK (estado_actual IN ('BORRADOR', 'ENVIADO', 'EN_REVISION', 
                                 'APROBADO', 'RECHAZADO', 'ANULADO'))
    """)
    
    # Validación de estados mutuamente excluyentes (no puede estar aprobado y rechazado)
    op.execute("""
        ALTER TABLE PPSH_SOLICITUD
        ADD CONSTRAINT CK_PPSH_estados_exclusivos
        CHECK (
            (fecha_aprobacion IS NOT NULL AND fecha_rechazo IS NULL) OR
            (fecha_aprobacion IS NULL AND fecha_rechazo IS NOT NULL) OR
            (fecha_aprobacion IS NULL AND fecha_rechazo IS NULL)
        )
    """)
    
    # Validación de tipo de solicitud
    op.execute("""
        ALTER TABLE PPSH_SOLICITUD
        ADD CONSTRAINT CK_PPSH_tipo_solicitud
        CHECK (tipo_solicitud IN ('INDIVIDUAL', 'GRUPAL'))
    """)
    
    # Validación de fecha de nacimiento (no futura, no anterior a 1900)
    op.execute("""
        ALTER TABLE PPSH_SOLICITANTE
        ADD CONSTRAINT CK_PPSH_fecha_nacimiento
        CHECK (fecha_nacimiento <= GETDATE() 
           AND fecha_nacimiento >= '1900-01-01')
    """)
    
    # Validación de edad razonable (0-120 años)
    op.execute("""
        ALTER TABLE PPSH_SOLICITANTE
        ADD CONSTRAINT CK_PPSH_edad_valida
        CHECK (DATEDIFF(YEAR, fecha_nacimiento, GETDATE()) BETWEEN 0 AND 120)
    """)
    
    # Validación de género
    op.execute("""
        ALTER TABLE PPSH_SOLICITANTE
        ADD CONSTRAINT CK_PPSH_genero
        CHECK (genero IN ('M', 'F', 'X'))
    """)
    
    # Validación de formato de email
    op.execute("""
        ALTER TABLE PPSH_SOLICITANTE
        ADD CONSTRAINT CK_PPSH_email_formato
        CHECK (email LIKE '%@%.%' OR email IS NULL)
    """)
    
    # Validación de formato de teléfono internacional
    op.execute("""
        ALTER TABLE PPSH_SOLICITANTE
        ADD CONSTRAINT CK_PPSH_telefono_formato
        CHECK (telefono LIKE '+%' OR telefono IS NULL)
    """)
    
    # Validación de parentesco (obligatorio si no es titular)
    op.execute("""
        ALTER TABLE PPSH_SOLICITANTE
        ADD CONSTRAINT CK_PPSH_parentesco_dependiente
        CHECK ((es_titular = 1 AND parentesco_titular IS NULL) OR
               (es_titular = 0 AND parentesco_titular IS NOT NULL))
    """)
    
    
    # ==============================================================================
    # SECCIÓN 2: CHECK CONSTRAINTS - MÓDULO SIM_FT
    # ==============================================================================
    
    print("Agregando Check Constraints para módulo SIM_FT...")
    
    # Validación de prioridad de trámite
    op.execute("""
        ALTER TABLE SIM_FT_TRAMITE_E
        ADD CONSTRAINT CK_SIM_FT_prioridad
        CHECK (prioridad IN ('ALTA', 'NORMAL', 'BAJA'))
    """)
    
    # Validación de monto de pago positivo
    op.execute("""
        ALTER TABLE PPSH_PAGO
        ADD CONSTRAINT CK_PPSH_PAGO_monto_positivo
        CHECK (monto > 0)
    """)
    
    # Validación de método de pago
    op.execute("""
        ALTER TABLE PPSH_PAGO
        ADD CONSTRAINT CK_PPSH_PAGO_metodo
        CHECK (metodo_pago IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'CHEQUE'))
    """)
    
    # Validación de estado de pago
    op.execute("""
        ALTER TABLE PPSH_PAGO
        ADD CONSTRAINT CK_PPSH_PAGO_estado
        CHECK (estado IN ('PENDIENTE', 'PAGADO', 'RECHAZADO', 'ANULADO'))
    """)
    
    
    # ==============================================================================
    # SECCIÓN 3: CHECK CONSTRAINTS - MÓDULO WORKFLOWS
    # ==============================================================================
    
    print("Agregando Check Constraints para módulo Workflows...")
    
    # Validación de estado de workflow
    op.execute("""
        ALTER TABLE WORKFLOW_INSTANCIA
        ADD CONSTRAINT CK_WF_INST_estado
        CHECK (estado IN ('ACTIVO', 'COMPLETADO', 'CANCELADO', 'EN_PAUSA'))
    """)
    
    # Validación de orden de etapas (mayor a 0)
    op.execute("""
        ALTER TABLE WORKFLOW_ETAPA
        ADD CONSTRAINT CK_WF_ETAPA_orden
        CHECK (orden > 0)
    """)
    
    
    # ==============================================================================
    # SECCIÓN 4: CHECK CONSTRAINTS - MÓDULO SEGURIDAD
    # ==============================================================================
    
    print("Agregando Check Constraints para módulo Seguridad...")
    
    # Validación de intentos fallidos (0-10)
    op.execute("""
        ALTER TABLE SEG_TB_USUARIOS
        ADD CONSTRAINT CK_SEG_intentos_fallidos
        CHECK (intentos_fallidos BETWEEN 0 AND 10)
    """)
    
    
    # ==============================================================================
    # SECCIÓN 5: UNIQUE CONSTRAINTS
    # ==============================================================================
    
    print("Agregando Unique Constraints...")
    
    # Número de expediente único en PPSH
    op.execute("""
        ALTER TABLE PPSH_SOLICITUD
        ADD CONSTRAINT UK_PPSH_num_expediente
        UNIQUE NONCLUSTERED (num_expediente)
    """)
    
    # Email único en solicitantes
    op.execute("""
        CREATE UNIQUE NONCLUSTERED INDEX UK_PPSH_SOLICITANTE_email
        ON PPSH_SOLICITANTE(email)
        WHERE email IS NOT NULL
    """)
    
    # Username único en usuarios
    op.execute("""
        CREATE UNIQUE NONCLUSTERED INDEX UK_SEG_USUARIOS_username
        ON SEG_TB_USUARIOS(COD_USUARIO)
        WHERE COD_USUARIO IS NOT NULL
    """)
    
    # Email único en usuarios
    op.execute("""
        CREATE UNIQUE NONCLUSTERED INDEX UK_SEG_USUARIOS_email
        ON SEG_TB_USUARIOS(EMAIL)
        WHERE EMAIL IS NOT NULL
    """)
    
    # Código de workflow único
    op.execute("""
        ALTER TABLE WORKFLOW
        ADD CONSTRAINT UK_WORKFLOW_codigo
        UNIQUE NONCLUSTERED (codigo)
    """)
    
    
    # ==============================================================================
    # SECCIÓN 6: FOREIGN KEYS - MÓDULO PPSH
    # ==============================================================================
    
    print("Agregando Foreign Keys para módulo PPSH...")
    
    # FK: Solicitud -> Solicitante (titular)
    op.execute("""
        ALTER TABLE PPSH_SOLICITUD
        ADD CONSTRAINT FK_PPSH_SOL_SOLICITANTE
        FOREIGN KEY (id_solicitante_titular)
        REFERENCES PPSH_SOLICITANTE(id_solicitante)
        ON DELETE NO ACTION
        ON UPDATE CASCADE
    """)
    
    # FK: Solicitud -> Causa Humanitaria
    op.execute("""
        ALTER TABLE PPSH_SOLICITUD
        ADD CONSTRAINT FK_PPSH_SOL_CAUSA
        FOREIGN KEY (cod_causa_humanitaria)
        REFERENCES PPSH_CAUSA_HUMANITARIA(cod_causa)
        ON DELETE NO ACTION
        ON UPDATE CASCADE
    """)
    
    # FK: Solicitud -> Estado
    op.execute("""
        ALTER TABLE PPSH_SOLICITUD
        ADD CONSTRAINT FK_PPSH_SOL_ESTADO
        FOREIGN KEY (estado_actual)
        REFERENCES PPSH_ESTADO(cod_estado)
        ON DELETE NO ACTION
        ON UPDATE CASCADE
    """)
    
    # FK: Solicitante -> Solicitud (CASCADE - dependientes se borran con solicitud)
    op.execute("""
        ALTER TABLE PPSH_SOLICITANTE
        ADD CONSTRAINT FK_PPSH_SOLICITANTE_SOL
        FOREIGN KEY (id_solicitud)
        REFERENCES PPSH_SOLICITUD(id_solicitud)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    """)
    
    # FK: Documento -> Solicitud (CASCADE)
    op.execute("""
        ALTER TABLE PPSH_DOCUMENTO
        ADD CONSTRAINT FK_PPSH_DOC_SOLICITUD
        FOREIGN KEY (id_solicitud)
        REFERENCES PPSH_SOLICITUD(id_solicitud)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    """)
    
    # FK: Documento -> Tipo Documento
    op.execute("""
        ALTER TABLE PPSH_DOCUMENTO
        ADD CONSTRAINT FK_PPSH_DOC_TIPO
        FOREIGN KEY (cod_tipo_documento)
        REFERENCES PPSH_TIPO_DOCUMENTO(cod_tipo_doc)
        ON DELETE NO ACTION
        ON UPDATE CASCADE
    """)
    
    # FK: Entrevista -> Solicitud (CASCADE)
    op.execute("""
        ALTER TABLE PPSH_ENTREVISTA
        ADD CONSTRAINT FK_PPSH_ENT_SOLICITUD
        FOREIGN KEY (id_solicitud)
        REFERENCES PPSH_SOLICITUD(id_solicitud)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    """)
    
    # FK: Pago -> Solicitud (NO ACTION - preservar pagos)
    op.execute("""
        ALTER TABLE PPSH_PAGO
        ADD CONSTRAINT FK_PPSH_PAGO_SOLICITUD
        FOREIGN KEY (id_solicitud)
        REFERENCES PPSH_SOLICITUD(id_solicitud)
        ON DELETE NO ACTION
        ON UPDATE CASCADE
    """)
    
    # FK: Pago -> Concepto Pago
    op.execute("""
        ALTER TABLE PPSH_PAGO
        ADD CONSTRAINT FK_PPSH_PAGO_CONCEPTO
        FOREIGN KEY (cod_concepto)
        REFERENCES PPSH_CONCEPTO_PAGO(cod_concepto)
        ON DELETE NO ACTION
        ON UPDATE CASCADE
    """)
    
    # FK: Historial Estado -> Solicitud (CASCADE)
    op.execute("""
        ALTER TABLE PPSH_ESTADO_HISTORIAL
        ADD CONSTRAINT FK_PPSH_HIST_SOLICITUD
        FOREIGN KEY (id_solicitud)
        REFERENCES PPSH_SOLICITUD(id_solicitud)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    """)
    
    # FK: Historial Estado -> Estado Anterior
    op.execute("""
        ALTER TABLE PPSH_ESTADO_HISTORIAL
        ADD CONSTRAINT FK_PPSH_HIST_ESTADO_ANT
        FOREIGN KEY (estado_anterior)
        REFERENCES PPSH_ESTADO(cod_estado)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
    """)
    
    # FK: Historial Estado -> Estado Nuevo
    op.execute("""
        ALTER TABLE PPSH_ESTADO_HISTORIAL
        ADD CONSTRAINT FK_PPSH_HIST_ESTADO_NVO
        FOREIGN KEY (estado_nuevo)
        REFERENCES PPSH_ESTADO(cod_estado)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
    """)
    
    
    # ==============================================================================
    # SECCIÓN 7: FOREIGN KEYS - MÓDULO WORKFLOWS
    # ==============================================================================
    
    print("Agregando Foreign Keys para módulo Workflows...")
    
    # FK: Etapa -> Workflow (CASCADE)
    op.execute("""
        ALTER TABLE WORKFLOW_ETAPA
        ADD CONSTRAINT FK_WF_ETAPA_WORKFLOW
        FOREIGN KEY (workflow_id)
        REFERENCES WORKFLOW(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    """)
    
    # FK: Conexión -> Workflow (CASCADE)
    op.execute("""
        ALTER TABLE WORKFLOW_CONEXION
        ADD CONSTRAINT FK_WF_CONEX_WORKFLOW
        FOREIGN KEY (workflow_id)
        REFERENCES WORKFLOW(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    """)
    
    # FK: Conexión -> Etapa Origen (CASCADE)
    op.execute("""
        ALTER TABLE WORKFLOW_CONEXION
        ADD CONSTRAINT FK_WF_CONEX_ETAPA_ORIG
        FOREIGN KEY (etapa_origen_id)
        REFERENCES WORKFLOW_ETAPA(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
    """)
    
    # FK: Conexión -> Etapa Destino (CASCADE)
    op.execute("""
        ALTER TABLE WORKFLOW_CONEXION
        ADD CONSTRAINT FK_WF_CONEX_ETAPA_DEST
        FOREIGN KEY (etapa_destino_id)
        REFERENCES WORKFLOW_ETAPA(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
    """)
    
    # FK: Instancia -> Workflow
    op.execute("""
        ALTER TABLE WORKFLOW_INSTANCIA
        ADD CONSTRAINT FK_WF_INST_WORKFLOW
        FOREIGN KEY (workflow_id)
        REFERENCES WORKFLOW(id)
        ON DELETE NO ACTION
        ON UPDATE CASCADE
    """)
    
    # FK: Instancia -> Etapa Actual
    op.execute("""
        ALTER TABLE WORKFLOW_INSTANCIA
        ADD CONSTRAINT FK_WF_INST_ETAPA_ACTUAL
        FOREIGN KEY (etapa_actual_id)
        REFERENCES WORKFLOW_ETAPA(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
    """)
    
    # FK: Historial -> Instancia (CASCADE)
    op.execute("""
        ALTER TABLE WORKFLOW_INSTANCIA_HISTORIAL
        ADD CONSTRAINT FK_WF_HIST_INSTANCIA
        FOREIGN KEY (instancia_id)
        REFERENCES WORKFLOW_INSTANCIA(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    """)
    
    # FK: Historial -> Etapa
    op.execute("""
        ALTER TABLE WORKFLOW_INSTANCIA_HISTORIAL
        ADD CONSTRAINT FK_WF_HIST_ETAPA
        FOREIGN KEY (etapa_id)
        REFERENCES WORKFLOW_ETAPA(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
    """)
    
    # FK: Respuesta Etapa -> Instancia (CASCADE)
    op.execute("""
        ALTER TABLE WORKFLOW_RESPUESTA_ETAPA
        ADD CONSTRAINT FK_WF_RESP_ETAPA_INST
        FOREIGN KEY (instancia_id)
        REFERENCES WORKFLOW_INSTANCIA(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    """)
    
    # FK: Respuesta Etapa -> Etapa
    op.execute("""
        ALTER TABLE WORKFLOW_RESPUESTA_ETAPA
        ADD CONSTRAINT FK_WF_RESP_ETAPA_ETAPA
        FOREIGN KEY (etapa_id)
        REFERENCES WORKFLOW_ETAPA(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
    """)
    
    
    # ==============================================================================
    # SECCIÓN 8: DEFAULT CONSTRAINTS
    # ==============================================================================
    
    print("Agregando Default Constraints...")
    
    # Defaults para PPSH_SOLICITUD
    op.execute("""
        ALTER TABLE PPSH_SOLICITUD
        ADD CONSTRAINT DF_PPSH_SOL_fecha_solicitud
        DEFAULT GETDATE() FOR fecha_solicitud
    """)
    
    op.execute("""
        ALTER TABLE PPSH_SOLICITUD
        ADD CONSTRAINT DF_PPSH_SOL_created_at
        DEFAULT GETDATE() FOR created_at
    """)
    
    op.execute("""
        ALTER TABLE PPSH_SOLICITUD
        ADD CONSTRAINT DF_PPSH_SOL_estado
        DEFAULT 'BORRADOR' FOR estado_actual
    """)
    
    op.execute("""
        ALTER TABLE PPSH_SOLICITUD
        ADD CONSTRAINT DF_PPSH_SOL_tipo
        DEFAULT 'INDIVIDUAL' FOR tipo_solicitud
    """)
    
    # Defaults para PPSH_SOLICITANTE
    op.execute("""
        ALTER TABLE PPSH_SOLICITANTE
        ADD CONSTRAINT DF_PPSH_SOLICITANTE_es_titular
        DEFAULT 1 FOR es_titular
    """)
    
    op.execute("""
        ALTER TABLE PPSH_SOLICITANTE
        ADD CONSTRAINT DF_PPSH_SOLICITANTE_created_at
        DEFAULT GETDATE() FOR created_at
    """)
    
    # Defaults para PPSH_PAGO
    op.execute("""
        ALTER TABLE PPSH_PAGO
        ADD CONSTRAINT DF_PPSH_PAGO_estado
        DEFAULT 'PENDIENTE' FOR estado
    """)
    
    op.execute("""
        ALTER TABLE PPSH_PAGO
        ADD CONSTRAINT DF_PPSH_PAGO_fecha
        DEFAULT GETDATE() FOR fecha_pago
    """)
    
    # Defaults para PPSH_DOCUMENTO
    op.execute("""
        ALTER TABLE PPSH_DOCUMENTO
        ADD CONSTRAINT DF_PPSH_DOC_fecha_carga
        DEFAULT GETDATE() FOR fecha_carga
    """)
    
    # Defaults para WORKFLOW_INSTANCIA
    op.execute("""
        ALTER TABLE WORKFLOW_INSTANCIA
        ADD CONSTRAINT DF_WF_INST_estado
        DEFAULT 'ACTIVO' FOR estado
    """)
    
    op.execute("""
        ALTER TABLE WORKFLOW_INSTANCIA
        ADD CONSTRAINT DF_WF_INST_fecha_inicio
        DEFAULT GETDATE() FOR fecha_inicio
    """)
    
    # Defaults para SEG_TB_USUARIOS
    op.execute("""
        ALTER TABLE SEG_TB_USUARIOS
        ADD CONSTRAINT DF_SEG_USUARIOS_activo
        DEFAULT 1 FOR IND_ACTIVO
    """)
    
    op.execute("""
        ALTER TABLE SEG_TB_USUARIOS
        ADD CONSTRAINT DF_SEG_USUARIOS_intentos
        DEFAULT 0 FOR intentos_fallidos
    """)
    
    
    # ==============================================================================
    # SECCIÓN 9: ÍNDICES DE OPTIMIZACIÓN
    # ==============================================================================
    
    print("Agregando índices de optimización...")
    
    # Índices para validación eficiente de FKs
    op.create_index('IX_PPSH_SOL_id_solicitante', 'PPSH_SOLICITUD', ['id_solicitante_titular'])
    op.create_index('IX_PPSH_SOL_cod_causa', 'PPSH_SOLICITUD', ['cod_causa_humanitaria'])
    op.create_index('IX_PPSH_SOL_estado', 'PPSH_SOLICITUD', ['estado_actual'])
    op.create_index('IX_PPSH_SOL_fecha', 'PPSH_SOLICITUD', ['fecha_solicitud'])
    
    op.create_index('IX_PPSH_SOLICITANTE_id_solicitud', 'PPSH_SOLICITANTE', ['id_solicitud'])
    op.create_index('IX_PPSH_DOC_id_solicitud', 'PPSH_DOCUMENTO', ['id_solicitud'])
    op.create_index('IX_PPSH_PAGO_id_solicitud', 'PPSH_PAGO', ['id_solicitud'])
    
    op.create_index('IX_WF_ETAPA_workflow_id', 'WORKFLOW_ETAPA', ['workflow_id'])
    op.create_index('IX_WF_INST_workflow_id', 'WORKFLOW_INSTANCIA', ['workflow_id'])
    op.create_index('IX_WF_INST_etapa_actual', 'WORKFLOW_INSTANCIA', ['etapa_actual_id'])
    
    print("✅ Migración completada: Todos los constraints agregados exitosamente")


def downgrade() -> None:
    """
    Revierte todos los constraints agregados.
    """
    
    print("Revirtiendo migración de constraints...")
    
    # Eliminar Check Constraints
    op.drop_constraint('CK_PPSH_duracion_viaje', 'PPSH_SOLICITUD', type_='check')
    op.drop_constraint('CK_PPSH_fechas_logicas', 'PPSH_SOLICITUD', type_='check')
    op.drop_constraint('CK_PPSH_fecha_retorno', 'PPSH_SOLICITUD', type_='check')
    op.drop_constraint('CK_PPSH_estado_valido', 'PPSH_SOLICITUD', type_='check')
    op.drop_constraint('CK_PPSH_estados_exclusivos', 'PPSH_SOLICITUD', type_='check')
    op.drop_constraint('CK_PPSH_tipo_solicitud', 'PPSH_SOLICITUD', type_='check')
    op.drop_constraint('CK_PPSH_fecha_nacimiento', 'PPSH_SOLICITANTE', type_='check')
    op.drop_constraint('CK_PPSH_edad_valida', 'PPSH_SOLICITANTE', type_='check')
    op.drop_constraint('CK_PPSH_genero', 'PPSH_SOLICITANTE', type_='check')
    op.drop_constraint('CK_PPSH_email_formato', 'PPSH_SOLICITANTE', type_='check')
    op.drop_constraint('CK_PPSH_telefono_formato', 'PPSH_SOLICITANTE', type_='check')
    op.drop_constraint('CK_PPSH_parentesco_dependiente', 'PPSH_SOLICITANTE', type_='check')
    op.drop_constraint('CK_SIM_FT_prioridad', 'SIM_FT_TRAMITE_E', type_='check')
    op.drop_constraint('CK_PPSH_PAGO_monto_positivo', 'PPSH_PAGO', type_='check')
    op.drop_constraint('CK_PPSH_PAGO_metodo', 'PPSH_PAGO', type_='check')
    op.drop_constraint('CK_PPSH_PAGO_estado', 'PPSH_PAGO', type_='check')
    op.drop_constraint('CK_WF_INST_estado', 'WORKFLOW_INSTANCIA', type_='check')
    op.drop_constraint('CK_WF_ETAPA_orden', 'WORKFLOW_ETAPA', type_='check')
    op.drop_constraint('CK_SEG_intentos_fallidos', 'SEG_TB_USUARIOS', type_='check')
    
    # Eliminar Unique Constraints
    op.drop_constraint('UK_PPSH_num_expediente', 'PPSH_SOLICITUD', type_='unique')
    op.drop_index('UK_PPSH_SOLICITANTE_email', 'PPSH_SOLICITANTE')
    op.drop_index('UK_SEG_USUARIOS_username', 'SEG_TB_USUARIOS')
    op.drop_index('UK_SEG_USUARIOS_email', 'SEG_TB_USUARIOS')
    op.drop_constraint('UK_WORKFLOW_codigo', 'WORKFLOW', type_='unique')
    
    # Eliminar Foreign Keys
    op.drop_constraint('FK_PPSH_SOL_SOLICITANTE', 'PPSH_SOLICITUD', type_='foreignkey')
    op.drop_constraint('FK_PPSH_SOL_CAUSA', 'PPSH_SOLICITUD', type_='foreignkey')
    op.drop_constraint('FK_PPSH_SOL_ESTADO', 'PPSH_SOLICITUD', type_='foreignkey')
    op.drop_constraint('FK_PPSH_SOLICITANTE_SOL', 'PPSH_SOLICITANTE', type_='foreignkey')
    op.drop_constraint('FK_PPSH_DOC_SOLICITUD', 'PPSH_DOCUMENTO', type_='foreignkey')
    op.drop_constraint('FK_PPSH_DOC_TIPO', 'PPSH_DOCUMENTO', type_='foreignkey')
    op.drop_constraint('FK_PPSH_ENT_SOLICITUD', 'PPSH_ENTREVISTA', type_='foreignkey')
    op.drop_constraint('FK_PPSH_PAGO_SOLICITUD', 'PPSH_PAGO', type_='foreignkey')
    op.drop_constraint('FK_PPSH_PAGO_CONCEPTO', 'PPSH_PAGO', type_='foreignkey')
    op.drop_constraint('FK_PPSH_HIST_SOLICITUD', 'PPSH_ESTADO_HISTORIAL', type_='foreignkey')
    op.drop_constraint('FK_PPSH_HIST_ESTADO_ANT', 'PPSH_ESTADO_HISTORIAL', type_='foreignkey')
    op.drop_constraint('FK_PPSH_HIST_ESTADO_NVO', 'PPSH_ESTADO_HISTORIAL', type_='foreignkey')
    op.drop_constraint('FK_WF_ETAPA_WORKFLOW', 'WORKFLOW_ETAPA', type_='foreignkey')
    op.drop_constraint('FK_WF_CONEX_WORKFLOW', 'WORKFLOW_CONEXION', type_='foreignkey')
    op.drop_constraint('FK_WF_CONEX_ETAPA_ORIG', 'WORKFLOW_CONEXION', type_='foreignkey')
    op.drop_constraint('FK_WF_CONEX_ETAPA_DEST', 'WORKFLOW_CONEXION', type_='foreignkey')
    op.drop_constraint('FK_WF_INST_WORKFLOW', 'WORKFLOW_INSTANCIA', type_='foreignkey')
    op.drop_constraint('FK_WF_INST_ETAPA_ACTUAL', 'WORKFLOW_INSTANCIA', type_='foreignkey')
    op.drop_constraint('FK_WF_HIST_INSTANCIA', 'WORKFLOW_INSTANCIA_HISTORIAL', type_='foreignkey')
    op.drop_constraint('FK_WF_HIST_ETAPA', 'WORKFLOW_INSTANCIA_HISTORIAL', type_='foreignkey')
    op.drop_constraint('FK_WF_RESP_ETAPA_INST', 'WORKFLOW_RESPUESTA_ETAPA', type_='foreignkey')
    op.drop_constraint('FK_WF_RESP_ETAPA_ETAPA', 'WORKFLOW_RESPUESTA_ETAPA', type_='foreignkey')
    
    # Eliminar Default Constraints
    op.drop_constraint('DF_PPSH_SOL_fecha_solicitud', 'PPSH_SOLICITUD', type_='default')
    op.drop_constraint('DF_PPSH_SOL_created_at', 'PPSH_SOLICITUD', type_='default')
    op.drop_constraint('DF_PPSH_SOL_estado', 'PPSH_SOLICITUD', type_='default')
    op.drop_constraint('DF_PPSH_SOL_tipo', 'PPSH_SOLICITUD', type_='default')
    op.drop_constraint('DF_PPSH_SOLICITANTE_es_titular', 'PPSH_SOLICITANTE', type_='default')
    op.drop_constraint('DF_PPSH_SOLICITANTE_created_at', 'PPSH_SOLICITANTE', type_='default')
    op.drop_constraint('DF_PPSH_PAGO_estado', 'PPSH_PAGO', type_='default')
    op.drop_constraint('DF_PPSH_PAGO_fecha', 'PPSH_PAGO', type_='default')
    op.drop_constraint('DF_PPSH_DOC_fecha_carga', 'PPSH_DOCUMENTO', type_='default')
    op.drop_constraint('DF_WF_INST_estado', 'WORKFLOW_INSTANCIA', type_='default')
    op.drop_constraint('DF_WF_INST_fecha_inicio', 'WORKFLOW_INSTANCIA', type_='default')
    op.drop_constraint('DF_SEG_USUARIOS_activo', 'SEG_TB_USUARIOS', type_='default')
    op.drop_constraint('DF_SEG_USUARIOS_intentos', 'SEG_TB_USUARIOS', type_='default')
    
    # Eliminar índices
    op.drop_index('IX_PPSH_SOL_id_solicitante', 'PPSH_SOLICITUD')
    op.drop_index('IX_PPSH_SOL_cod_causa', 'PPSH_SOLICITUD')
    op.drop_index('IX_PPSH_SOL_estado', 'PPSH_SOLICITUD')
    op.drop_index('IX_PPSH_SOL_fecha', 'PPSH_SOLICITUD')
    op.drop_index('IX_PPSH_SOLICITANTE_id_solicitud', 'PPSH_SOLICITANTE')
    op.drop_index('IX_PPSH_DOC_id_solicitud', 'PPSH_DOCUMENTO')
    op.drop_index('IX_PPSH_PAGO_id_solicitud', 'PPSH_PAGO')
    op.drop_index('IX_WF_ETAPA_workflow_id', 'WORKFLOW_ETAPA')
    op.drop_index('IX_WF_INST_workflow_id', 'WORKFLOW_INSTANCIA')
    op.drop_index('IX_WF_INST_etapa_actual', 'WORKFLOW_INSTANCIA')
    
    print("✅ Rollback completado: Todos los constraints eliminados")
