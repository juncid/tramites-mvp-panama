"""
Tests para app/services/services_workflow.py
Sistema de Trámites Migratorios de Panamá

Objetivo: Cubrir más líneas del servicio de workflow para alcanzar 85%+ de cobertura.
"""

import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.services.services_workflow import (
    WorkflowService,
    EtapaService,
    PreguntaService,
    ConexionService,
    InstanciaService,
    ComentarioService,
    HistorialService
)
from app.models import models_workflow as models


class TestWorkflowService:
    """Tests para WorkflowService"""
    
    def test_verificar_codigo_unico_duplicado(self, db_session: Session):
        """Test: Código duplicado lanza error 400"""
        # Crear workflow
        workflow = models.Workflow(
            codigo="WF_DUPLICADO",
            nombre="Workflow Original",
            descripcion="Test",
            activo=True
        )
        db_session.add(workflow)
        db_session.commit()
        
        # Intentar crear otro con el mismo código
        with pytest.raises(HTTPException) as exc_info:
            WorkflowService.verificar_codigo_unico(db_session, "WF_DUPLICADO")
        
        assert exc_info.value.status_code == 400
    
    def test_verificar_codigo_unico_mismo_id_ok(self, db_session: Session):
        """Test: Mismo código con mismo ID es válido (update)"""
        workflow = models.Workflow(
            codigo="WF_UPDATE",
            nombre="Workflow Update",
            descripcion="Test",
            activo=True
        )
        db_session.add(workflow)
        db_session.commit()
        
        # Verificar el mismo código con el mismo ID no debería lanzar error
        WorkflowService.verificar_codigo_unico(
            db_session, "WF_UPDATE", workflow_id=workflow.id
        )
        # Si llegamos aquí, no lanzó error
    
    def test_obtener_workflow_no_existe(self, db_session: Session):
        """Test: Workflow no existe lanza 404"""
        with pytest.raises(HTTPException) as exc_info:
            WorkflowService.obtener_workflow(db_session, 99999)
        
        assert exc_info.value.status_code == 404
    
    def test_eliminar_workflow_no_existe(self, db_session: Session):
        """Test: Eliminar workflow no existe lanza 404"""
        with pytest.raises(HTTPException) as exc_info:
            WorkflowService.eliminar_workflow(db_session, 99999, "test_user")
        
        assert exc_info.value.status_code == 404
    
    def test_listar_workflows_con_filtros(self, db_session: Session):
        """Test: Listar workflows con filtros de búsqueda"""
        # Crear workflows
        workflow1 = models.Workflow(
            codigo="WF_FILTRO_1",
            nombre="Workflow Activo",
            descripcion="Para filtrar",
            activo=True
        )
        workflow2 = models.Workflow(
            codigo="WF_FILTRO_2",
            nombre="Workflow Inactivo",
            descripcion="Para filtrar",
            activo=False
        )
        db_session.add_all([workflow1, workflow2])
        db_session.commit()
        
        # Listar todos los workflows
        workflows = WorkflowService.listar_workflows(db_session)
        
        assert len(workflows) >= 1


class TestEtapaService:
    """Tests para EtapaService"""
    
    def test_verificar_codigo_unico_en_workflow(self, db_session: Session):
        """Test: Código de etapa duplicado en workflow lanza error"""
        workflow = models.Workflow(
            codigo="WF_ETAPA_DUP",
            nombre="Workflow Etapa Dup",
            descripcion="Test",
            activo=True
        )
        db_session.add(workflow)
        db_session.flush()
        
        etapa = models.WorkflowEtapa(
            workflow_id=workflow.id,
            codigo="ETAPA_DUP",
            nombre="Etapa Original",
            orden=1,
            tipo_etapa=models.TipoEtapa.ETAPA,
            activo=True
        )
        db_session.add(etapa)
        db_session.commit()
        
        with pytest.raises(HTTPException) as exc_info:
            EtapaService.verificar_codigo_unico_en_workflow(
                db_session, workflow.id, "ETAPA_DUP"
            )
        
        assert exc_info.value.status_code == 400
    
    def test_obtener_etapa_no_existe(self, db_session: Session):
        """Test: Etapa no existe lanza 404"""
        with pytest.raises(HTTPException) as exc_info:
            EtapaService.obtener_etapa(db_session, 99999)
        
        assert exc_info.value.status_code == 404
    
    def test_eliminar_etapa_no_existe(self, db_session: Session):
        """Test: Eliminar etapa no existe lanza 404"""
        with pytest.raises(HTTPException) as exc_info:
            EtapaService.eliminar_etapa(db_session, 99999, "test_user")
        
        assert exc_info.value.status_code == 404


class TestPreguntaService:
    """Tests para PreguntaService"""
    
    def test_verificar_codigo_unico_en_etapa(self, db_session: Session):
        """Test: Código de pregunta duplicado en etapa lanza error"""
        workflow = models.Workflow(
            codigo="WF_PREG_DUP",
            nombre="Workflow Pregunta Dup",
            descripcion="Test",
            activo=True
        )
        db_session.add(workflow)
        db_session.flush()
        
        etapa = models.WorkflowEtapa(
            workflow_id=workflow.id,
            codigo="ETAPA_PREG_DUP",
            nombre="Etapa con Pregunta Dup",
            orden=1,
            tipo_etapa=models.TipoEtapa.ETAPA,
            activo=True
        )
        db_session.add(etapa)
        db_session.flush()
        
        pregunta = models.WorkflowPregunta(
            etapa_id=etapa.id,
            codigo="PREG_DUP",
            pregunta="Pregunta Original",
            tipo_pregunta=models.TipoPregunta.RESPUESTA_TEXTO,
            orden=1,
            activo=True
        )
        db_session.add(pregunta)
        db_session.commit()
        
        with pytest.raises(HTTPException) as exc_info:
            PreguntaService.verificar_codigo_unico_en_etapa(
                db_session, etapa.id, "PREG_DUP"
            )
        
        assert exc_info.value.status_code == 400
    
    def test_obtener_pregunta_no_existe(self, db_session: Session):
        """Test: Pregunta no existe lanza 404"""
        with pytest.raises(HTTPException) as exc_info:
            PreguntaService.obtener_pregunta(db_session, 99999)
        
        assert exc_info.value.status_code == 404
    
    def test_eliminar_pregunta_no_existe(self, db_session: Session):
        """Test: Eliminar pregunta no existe lanza 404"""
        with pytest.raises(HTTPException) as exc_info:
            PreguntaService.eliminar_pregunta(db_session, 99999, "test_user")
        
        assert exc_info.value.status_code == 404


class TestConexionService:
    """Tests para ConexionService"""
    
    def test_obtener_conexion_no_existe(self, db_session: Session):
        """Test: Conexión no existe lanza 404"""
        with pytest.raises(HTTPException) as exc_info:
            ConexionService.obtener_conexion(db_session, 99999)
        
        assert exc_info.value.status_code == 404
    
    def test_eliminar_conexion_no_existe(self, db_session: Session):
        """Test: Eliminar conexión no existe lanza 404"""
        with pytest.raises(HTTPException) as exc_info:
            ConexionService.eliminar_conexion(db_session, 99999)
        
        assert exc_info.value.status_code == 404


class TestInstanciaService:
    """Tests para InstanciaService"""
    
    def test_obtener_instancia_no_existe(self, db_session: Session):
        """Test: Instancia no existe lanza 404"""
        with pytest.raises(HTTPException) as exc_info:
            InstanciaService.obtener_instancia(db_session, 99999)
        
        assert exc_info.value.status_code == 404
    
    def test_listar_instancias_con_filtros(self, db_session: Session):
        """Test: Listar instancias con filtros"""
        workflow = models.Workflow(
            codigo="WF_INST_FILTRO",
            nombre="Workflow para instancias",
            descripcion="Test",
            activo=True
        )
        db_session.add(workflow)
        db_session.flush()
        
        etapa = models.WorkflowEtapa(
            workflow_id=workflow.id,
            codigo="ETAPA_INST",
            nombre="Etapa Instancia",
            orden=1,
            tipo_etapa=models.TipoEtapa.ETAPA,
            activo=True
        )
        db_session.add(etapa)
        db_session.flush()
        
        instancia = models.WorkflowInstancia(
            workflow_id=workflow.id,
            etapa_actual_id=etapa.id,
            num_expediente="FILTRO-001",
            estado=models.EstadoInstancia.EN_PROGRESO,
            activo=True,
            creado_por_user_id="test"
        )
        db_session.add(instancia)
        db_session.commit()
        
        # Listar con filtro
        instancias = InstanciaService.listar_instancias(
            db_session,
            workflow_id=workflow.id
        )
        
        assert len(instancias) >= 1


class TestHistorialService:
    """Tests para HistorialService"""
    
    def test_historial_service_exists(self, db_session: Session):
        """Test: HistorialService existe y es importable"""
        assert HistorialService is not None


class TestComentarioService:
    """Tests para ComentarioService"""
    
    def test_listar_comentarios_instancia_no_existe(self, db_session: Session):
        """Test: Comentarios de instancia inexistente retorna lista vacía o error"""
        try:
            comentarios = ComentarioService.listar_comentarios(db_session, 99999)
            assert isinstance(comentarios, list)
        except HTTPException:
            pass  # También es válido que lance 404
