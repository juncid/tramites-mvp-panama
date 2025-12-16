"""
Tests para app/services/workflow_execution_service.py
Sistema de Trámites Migratorios de Panamá

Objetivo: Cubrir las líneas faltantes para alcanzar 85%+ de cobertura.
"""

import pytest
from datetime import datetime
from unittest.mock import Mock, MagicMock, patch
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.services.workflow_execution_service import WorkflowExecutionService
from app.models import models_workflow as models


class TestObtenerEtapasPorPerfil:
    """Tests para obtener_etapas_por_perfil"""
    
    def test_workflow_not_found_raises_404(self, db_session: Session):
        """Test: Workflow inexistente lanza 404"""
        with pytest.raises(HTTPException) as exc_info:
            WorkflowExecutionService.obtener_etapas_por_perfil(
                db=db_session,
                workflow_id=99999,
                perfil="CIUDADANO"
            )
        
        assert exc_info.value.status_code == 404
    
    def test_workflow_inactive_raises_404(self, db_session: Session):
        """Test: Workflow inactivo lanza 404"""
        workflow = models.Workflow(
            codigo="WF_INACTIVE",
            nombre="Workflow Inactivo",
            descripcion="Test",
            activo=False
        )
        db_session.add(workflow)
        db_session.commit()
        
        with pytest.raises(HTTPException) as exc_info:
            WorkflowExecutionService.obtener_etapas_por_perfil(
                db=db_session,
                workflow_id=workflow.id,
                perfil="CIUDADANO"
            )
        
        assert exc_info.value.status_code == 404
    
    def test_filter_etapas_by_perfil(self, db_session: Session):
        """Test: Filtra etapas por perfil correctamente"""
        workflow = models.Workflow(
            codigo="WF_FILTER",
            nombre="Workflow Filtro",
            descripcion="Test",
            activo=True
        )
        db_session.add(workflow)
        db_session.flush()
        
        # Etapa para todos
        etapa1 = models.WorkflowEtapa(
            workflow_id=workflow.id,
            codigo="ETAPA_ALL",
            nombre="Etapa para todos",
            orden=1,
            tipo_etapa=models.TipoEtapa.ETAPA,
            perfiles_permitidos=None,
            activo=True
        )
        # Etapa solo para CIUDADANO
        etapa2 = models.WorkflowEtapa(
            workflow_id=workflow.id,
            codigo="ETAPA_CIUDADANO",
            nombre="Etapa ciudadano",
            orden=2,
            tipo_etapa=models.TipoEtapa.ETAPA,
            perfiles_permitidos=["CIUDADANO"],
            activo=True
        )
        # Etapa solo para FUNCIONARIO
        etapa3 = models.WorkflowEtapa(
            workflow_id=workflow.id,
            codigo="ETAPA_FUNC",
            nombre="Etapa funcionario",
            orden=3,
            tipo_etapa=models.TipoEtapa.ETAPA,
            perfiles_permitidos=["FUNCIONARIO"],
            activo=True
        )
        
        db_session.add_all([etapa1, etapa2, etapa3])
        db_session.commit()
        
        # CIUDADANO debería ver etapa1 y etapa2
        etapas = WorkflowExecutionService.obtener_etapas_por_perfil(
            db=db_session,
            workflow_id=workflow.id,
            perfil="CIUDADANO"
        )
        
        codigos = [e.codigo for e in etapas]
        assert "ETAPA_ALL" in codigos
        assert "ETAPA_CIUDADANO" in codigos
        assert "ETAPA_FUNC" not in codigos


class TestValidarPermisoEtapa:
    """Tests para validar_permiso_etapa"""
    
    def test_admin_siempre_tiene_acceso(self):
        """Test: ADMIN siempre tiene acceso"""
        etapa = Mock()
        etapa.perfiles_permitidos = ["CIUDADANO"]
        
        result = WorkflowExecutionService.validar_permiso_etapa(etapa, "ADMIN")
        
        assert result is True
    
    def test_sin_perfiles_definidos_todos_acceden(self):
        """Test: Sin perfiles definidos, todos tienen acceso"""
        etapa = Mock()
        etapa.perfiles_permitidos = None
        
        result = WorkflowExecutionService.validar_permiso_etapa(etapa, "CUALQUIERA")
        
        assert result is True
    
    def test_perfil_en_lista_tiene_acceso(self):
        """Test: Perfil en la lista tiene acceso"""
        etapa = Mock()
        etapa.perfiles_permitidos = ["CIUDADANO", "FUNCIONARIO"]
        
        result = WorkflowExecutionService.validar_permiso_etapa(etapa, "CIUDADANO")
        
        assert result is True
    
    def test_perfil_no_en_lista_sin_acceso(self):
        """Test: Perfil no en la lista no tiene acceso"""
        etapa = Mock()
        etapa.perfiles_permitidos = ["FUNCIONARIO"]
        
        result = WorkflowExecutionService.validar_permiso_etapa(etapa, "CIUDADANO")
        
        assert result is False


class TestEvaluarCondicion:
    """Tests para _evaluar_condicion"""
    
    def test_operador_igual_true(self):
        """Test: Operador == evalúa correctamente True"""
        condicion = {"campo": "respuesta", "operador": "==", "valor": "SI"}
        respuestas = {"respuesta": "SI"}
        
        result = WorkflowExecutionService._evaluar_condicion(condicion, respuestas)
        
        assert result is True
    
    def test_operador_igual_false(self):
        """Test: Operador == evalúa correctamente False"""
        condicion = {"campo": "respuesta", "operador": "==", "valor": "SI"}
        respuestas = {"respuesta": "NO"}
        
        result = WorkflowExecutionService._evaluar_condicion(condicion, respuestas)
        
        assert result is False
    
    def test_operador_diferente_true(self):
        """Test: Operador != evalúa correctamente True"""
        condicion = {"campo": "respuesta", "operador": "!=", "valor": "NO"}
        respuestas = {"respuesta": "SI"}
        
        result = WorkflowExecutionService._evaluar_condicion(condicion, respuestas)
        
        assert result is True
    
    def test_operador_in_true(self):
        """Test: Operador in evalúa correctamente True"""
        condicion = {"campo": "respuesta", "operador": "in", "valor": ["SI", "TALVEZ"]}
        respuestas = {"respuesta": "SI"}
        
        result = WorkflowExecutionService._evaluar_condicion(condicion, respuestas)
        
        assert result is True
    
    def test_operador_not_in_true(self):
        """Test: Operador not_in evalúa correctamente True"""
        condicion = {"campo": "respuesta", "operador": "not_in", "valor": ["NO", "NUNCA"]}
        respuestas = {"respuesta": "SI"}
        
        result = WorkflowExecutionService._evaluar_condicion(condicion, respuestas)
        
        assert result is True
    
    def test_operador_desconocido_false(self):
        """Test: Operador desconocido retorna False"""
        condicion = {"campo": "respuesta", "operador": ">=", "valor": 10}
        respuestas = {"respuesta": 20}
        
        result = WorkflowExecutionService._evaluar_condicion(condicion, respuestas)
        
        assert result is False
    
    def test_sin_campo_retorna_true(self):
        """Test: Sin campo definido retorna True"""
        condicion = {"operador": "==", "valor": "SI"}
        respuestas = {"respuesta": "SI"}
        
        result = WorkflowExecutionService._evaluar_condicion(condicion, respuestas)
        
        assert result is True
    
    def test_error_retorna_false(self):
        """Test: Error en evaluación retorna False"""
        condicion = None  # Causará error
        respuestas = {}
        
        result = WorkflowExecutionService._evaluar_condicion(condicion, respuestas)
        
        assert result is False


class TestDeterminarSiguienteEtapa:
    """Tests para _determinar_siguiente_etapa"""
    
    def test_etapa_final_retorna_none(self, db_session: Session):
        """Test: Etapa final no tiene siguiente"""
        etapa = Mock()
        etapa.es_etapa_final = True
        etapa.id = 1
        etapa.codigo = "FINAL"
        
        result = WorkflowExecutionService._determinar_siguiente_etapa(
            db=db_session,
            etapa_actual=etapa,
            respuestas={}
        )
        
        assert result is None
    
    def test_sin_conexiones_retorna_none(self, db_session: Session):
        """Test: Sin conexiones retorna None"""
        # Crear workflow y etapa
        workflow = models.Workflow(
            codigo="WF_SIN_CONEXION",
            nombre="Workflow sin conexiones",
            descripcion="Test",
            activo=True
        )
        db_session.add(workflow)
        db_session.flush()
        
        etapa = models.WorkflowEtapa(
            workflow_id=workflow.id,
            codigo="ETAPA_SIN_CONEXION",
            nombre="Etapa sin conexión",
            orden=1,
            tipo_etapa=models.TipoEtapa.ETAPA,
            es_etapa_final=False,
            activo=True
        )
        db_session.add(etapa)
        db_session.commit()
        
        result = WorkflowExecutionService._determinar_siguiente_etapa(
            db=db_session,
            etapa_actual=etapa,
            respuestas={}
        )
        
        assert result is None


class TestDetectarRechazoEnRespuestas:
    """Tests para _detectar_rechazo_en_respuestas"""
    
    def test_detecta_rechazo(self):
        """Test: Detecta rechazo en respuestas"""
        pregunta = Mock()
        pregunta.pregunta = "Resultado del dictamen"
        pregunta.codigo = "RESULTADO"
        
        etapa = Mock()
        etapa.preguntas = [pregunta]
        
        respuestas = {"RESULTADO": "RECHAZADO"}
        
        result = WorkflowExecutionService._detectar_rechazo_en_respuestas(
            etapa, respuestas
        )
        
        assert result is True
    
    def test_no_detecta_aprobado(self):
        """Test: No detecta rechazo con aprobado"""
        pregunta = Mock()
        pregunta.pregunta = "Resultado del dictamen"
        pregunta.codigo = "RESULTADO"
        
        etapa = Mock()
        etapa.preguntas = [pregunta]
        
        respuestas = {"RESULTADO": "APROBADO"}
        
        result = WorkflowExecutionService._detectar_rechazo_en_respuestas(
            etapa, respuestas
        )
        
        assert result is False
    
    def test_sin_preguntas_resultado_false(self):
        """Test: Sin preguntas de resultado retorna False"""
        pregunta = Mock()
        pregunta.pregunta = "Nombre del solicitante"
        pregunta.codigo = "NOMBRE"
        
        etapa = Mock()
        etapa.preguntas = [pregunta]
        
        respuestas = {"NOMBRE": "Juan Pérez"}
        
        result = WorkflowExecutionService._detectar_rechazo_en_respuestas(
            etapa, respuestas
        )
        
        assert result is False
    
    def test_error_retorna_false(self):
        """Test: Error retorna False"""
        etapa = None  # Causará error
        respuestas = {}
        
        result = WorkflowExecutionService._detectar_rechazo_en_respuestas(
            etapa, respuestas
        )
        
        assert result is False


class TestSincronizarEstadoSolicitudPPSH:
    """Tests para _sincronizar_estado_solicitud_ppsh"""
    
    def test_sin_respuesta_resultado_no_hace_nada(self, db_session: Session):
        """Test: Sin respuesta de resultado no sincroniza"""
        pregunta = Mock()
        pregunta.pregunta = "Nombre"
        pregunta.codigo = "NOMBRE"
        
        etapa = Mock()
        etapa.preguntas = [pregunta]
        etapa.nombre = "Etapa Test"
        
        instancia = Mock()
        instancia.metadata_adicional = {"id_solicitud": 1}
        
        respuestas = {"NOMBRE": "Test"}
        
        # No debería lanzar error
        WorkflowExecutionService._sincronizar_estado_solicitud_ppsh(
            db=db_session,
            instancia=instancia,
            etapa=etapa,
            respuestas=respuestas,
            user_id="test_user"
        )
    
    def test_sin_metadata_no_sincroniza(self, db_session: Session):
        """Test: Sin metadata no sincroniza"""
        pregunta = Mock()
        pregunta.pregunta = "Resultado dictamen"
        pregunta.codigo = "RESULTADO"
        
        etapa = Mock()
        etapa.preguntas = [pregunta]
        etapa.nombre = "Etapa Test"
        
        instancia = Mock()
        instancia.metadata_adicional = None
        
        respuestas = {"RESULTADO": "APROBADO"}
        
        WorkflowExecutionService._sincronizar_estado_solicitud_ppsh(
            db=db_session,
            instancia=instancia,
            etapa=etapa,
            respuestas=respuestas,
            user_id="test_user"
        )
    
    def test_sin_id_solicitud_no_sincroniza(self, db_session: Session):
        """Test: Sin id_solicitud no sincroniza"""
        pregunta = Mock()
        pregunta.pregunta = "Resultado dictamen"
        pregunta.codigo = "RESULTADO"
        
        etapa = Mock()
        etapa.preguntas = [pregunta]
        etapa.nombre = "Etapa Test"
        
        instancia = Mock()
        instancia.metadata_adicional = {}  # Sin id_solicitud
        
        respuestas = {"RESULTADO": "APROBADO"}
        
        WorkflowExecutionService._sincronizar_estado_solicitud_ppsh(
            db=db_session,
            instancia=instancia,
            etapa=etapa,
            respuestas=respuestas,
            user_id="test_user"
        )
    
    def test_solicitud_no_encontrada_no_sincroniza(self, db_session: Session):
        """Test: Si la solicitud no existe, no sincroniza"""
        pregunta = Mock()
        pregunta.pregunta = "Resultado del dictamen"
        pregunta.codigo = "RESULTADO"
        
        etapa = Mock()
        etapa.preguntas = [pregunta]
        etapa.nombre = "Etapa Test"
        
        instancia = Mock()
        instancia.metadata_adicional = {"id_solicitud": 99999}  # No existe
        
        respuestas = {"RESULTADO": "APROBADO"}
        
        # No debería lanzar error, solo logear warning
        WorkflowExecutionService._sincronizar_estado_solicitud_ppsh(
            db=db_session,
            instancia=instancia,
            etapa=etapa,
            respuestas=respuestas,
            user_id="test_user"
        )
    
    def test_detecta_pregunta_decision(self, db_session: Session):
        """Test: Detecta preguntas con keyword 'decisión'"""
        pregunta = Mock()
        pregunta.pregunta = "Decisión final del caso"
        pregunta.codigo = "DECISION"
        
        etapa = Mock()
        etapa.preguntas = [pregunta]
        etapa.nombre = "Etapa Test"
        
        instancia = Mock()
        instancia.metadata_adicional = {"id_solicitud": 1}
        
        respuestas = {"DECISION": "APROBADO"}
        
        # No debería lanzar error
        WorkflowExecutionService._sincronizar_estado_solicitud_ppsh(
            db=db_session,
            instancia=instancia,
            etapa=etapa,
            respuestas=respuestas,
            user_id="test_user"
        )
    
    def test_detecta_pregunta_aprobacion(self, db_session: Session):
        """Test: Detecta preguntas con keyword 'aprobación'"""
        pregunta = Mock()
        pregunta.pregunta = "Aprobación del trámite"
        pregunta.codigo = "APROBACION"
        
        etapa = Mock()
        etapa.preguntas = [pregunta]
        etapa.nombre = "Etapa Test"
        
        instancia = Mock()
        instancia.metadata_adicional = {"id_solicitud": 1}
        
        respuestas = {"APROBACION": "RECHAZADO"}
        
        # No debería lanzar error
        WorkflowExecutionService._sincronizar_estado_solicitud_ppsh(
            db=db_session,
            instancia=instancia,
            etapa=etapa,
            respuestas=respuestas,
            user_id="test_user"
        )


class TestObtenerEstadoWorkflow:
    """Tests para obtener_estado_workflow"""
    
    def test_instancia_no_encontrada_raises_404(self, db_session: Session):
        """Test: Instancia inexistente lanza 404"""
        with pytest.raises(HTTPException) as exc_info:
            WorkflowExecutionService.obtener_estado_workflow(
                db=db_session,
                instancia_id=99999
            )
        
        assert exc_info.value.status_code == 404
    
    def test_instancia_inactiva_raises_404(self, db_session: Session):
        """Test: Instancia inactiva lanza 404"""
        # Crear workflow
        workflow = models.Workflow(
            codigo="WF_INST_INACT",
            nombre="Workflow Test",
            descripcion="Test",
            activo=True
        )
        db_session.add(workflow)
        db_session.flush()
        
        # Crear etapa
        etapa = models.WorkflowEtapa(
            workflow_id=workflow.id,
            codigo="ETAPA_TEST",
            nombre="Etapa Test",
            orden=1,
            tipo_etapa=models.TipoEtapa.ETAPA,
            activo=True
        )
        db_session.add(etapa)
        db_session.flush()
        
        # Crear instancia inactiva
        instancia = models.WorkflowInstancia(
            workflow_id=workflow.id,
            etapa_actual_id=etapa.id,
            num_expediente="TEST-001",
            estado=models.EstadoInstancia.EN_PROGRESO,
            activo=False,  # Inactiva
            creado_por_user_id="test"
        )
        db_session.add(instancia)
        db_session.commit()
        
        with pytest.raises(HTTPException) as exc_info:
            WorkflowExecutionService.obtener_estado_workflow(
                db=db_session,
                instancia_id=instancia.id
            )
        
        assert exc_info.value.status_code == 404
    
    def test_obtener_estado_con_perfil_filtra_etapas(self, db_session: Session):
        """Test: Obtener estado con perfil filtra etapas visibles"""
        # Crear workflow
        workflow = models.Workflow(
            codigo="WF_ESTADO_PERFIL",
            nombre="Workflow Estado Perfil",
            descripcion="Test",
            activo=True
        )
        db_session.add(workflow)
        db_session.flush()
        
        # Crear etapa
        etapa = models.WorkflowEtapa(
            workflow_id=workflow.id,
            codigo="ETAPA_1",
            nombre="Etapa 1",
            orden=1,
            tipo_etapa=models.TipoEtapa.ETAPA,
            perfiles_permitidos=["CIUDADANO"],
            activo=True
        )
        db_session.add(etapa)
        db_session.flush()
        
        # Crear instancia activa
        instancia = models.WorkflowInstancia(
            workflow_id=workflow.id,
            etapa_actual_id=etapa.id,
            num_expediente="TEST-PERFIL",
            estado=models.EstadoInstancia.EN_PROGRESO,
            activo=True,
            creado_por_user_id="test"
        )
        db_session.add(instancia)
        db_session.commit()
        
        # Obtener estado con perfil
        estado = WorkflowExecutionService.obtener_estado_workflow(
            db=db_session,
            instancia_id=instancia.id,
            perfil="CIUDADANO"
        )
        
        assert estado["instancia_id"] == instancia.id
        assert estado["workflow_id"] == workflow.id


class TestEjecutarEtapa:
    """Tests para ejecutar_etapa"""
    
    def test_instancia_no_encontrada_raises_404(self, db_session: Session):
        """Test: Instancia inexistente lanza 404"""
        with pytest.raises(HTTPException) as exc_info:
            WorkflowExecutionService.ejecutar_etapa(
                db=db_session,
                instancia_id=99999,
                etapa_id=1,
                respuestas={},
                archivos=None,
                user_id="test",
                perfil="ADMIN"
            )
        
        assert exc_info.value.status_code == 404
    
    def test_etapa_no_es_actual_raises_400(self, db_session: Session):
        """Test: Etapa no actual lanza 400"""
        # Crear workflow
        workflow = models.Workflow(
            codigo="WF_ETAPA_NO_ACT",
            nombre="Workflow Test",
            descripcion="Test",
            activo=True
        )
        db_session.add(workflow)
        db_session.flush()
        
        # Crear etapas
        etapa1 = models.WorkflowEtapa(
            workflow_id=workflow.id,
            codigo="ETAPA_1",
            nombre="Etapa 1",
            orden=1,
            tipo_etapa=models.TipoEtapa.ETAPA,
            activo=True
        )
        etapa2 = models.WorkflowEtapa(
            workflow_id=workflow.id,
            codigo="ETAPA_2",
            nombre="Etapa 2",
            orden=2,
            tipo_etapa=models.TipoEtapa.ETAPA,
            activo=True
        )
        db_session.add_all([etapa1, etapa2])
        db_session.flush()
        
        # Crear instancia en etapa 1
        instancia = models.WorkflowInstancia(
            workflow_id=workflow.id,
            etapa_actual_id=etapa1.id,
            num_expediente="TEST-002",
            estado=models.EstadoInstancia.EN_PROGRESO,
            activo=True,
            creado_por_user_id="test"
        )
        db_session.add(instancia)
        db_session.commit()
        
        # Intentar ejecutar etapa 2 (no es la actual)
        with pytest.raises(HTTPException) as exc_info:
            WorkflowExecutionService.ejecutar_etapa(
                db=db_session,
                instancia_id=instancia.id,
                etapa_id=etapa2.id,
                respuestas={},
                archivos=None,
                user_id="test",
                perfil="ADMIN"
            )
        
        assert exc_info.value.status_code == 400
        assert "no es la etapa actual" in exc_info.value.detail
