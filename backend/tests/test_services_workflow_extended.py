"""
Tests extendidos para services_workflow.py
Para aumentar cobertura de 61% a 75%
"""

import pytest
from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from unittest.mock import MagicMock, patch

from app.services.services_workflow import (
    WorkflowService,
    EtapaService,
    PreguntaService,
    ConexionService,
    InstanciaService,
    ComentarioService,
    HistorialService,
    WorkflowCambiosService
)
from app.models import models_workflow as models
from app.schemas import schemas_workflow as schemas


from app.models.models_workflow import TipoEtapa


class TestWorkflowServiceCreation:
    """Tests para creación de workflows"""

    def test_verificar_codigo_unico_no_existe(self, db_session: Session):
        """Test que verifica código único cuando no existe"""
        # No debe lanzar excepción
        WorkflowService.verificar_codigo_unico(db_session, "CODIGO_NUEVO_UNICO")

    def test_verificar_codigo_unico_existe(self, db_session: Session):
        """Test que verifica código único cuando ya existe"""
        # Crear workflow con código
        workflow = models.Workflow(
            codigo="CODIGO_EXISTENTE",
            nombre="Test",
            descripcion="Test workflow",
            version="1.0.0",
            estado=schemas.EstadoWorkflowEnum.BORRADOR,
            created_by="TEST"
        )
        db_session.add(workflow)
        db_session.commit()

        # Debe lanzar excepción
        with pytest.raises(HTTPException) as exc_info:
            WorkflowService.verificar_codigo_unico(db_session, "CODIGO_EXISTENTE")
        assert exc_info.value.status_code == 400

    def test_verificar_codigo_unico_mismo_workflow(self, db_session: Session):
        """Test que permite el mismo código si es el mismo workflow"""
        # Crear workflow
        workflow = models.Workflow(
            codigo="CODIGO_MISMO",
            nombre="Test",
            descripcion="Test",
            version="1.0.0",
            estado=schemas.EstadoWorkflowEnum.BORRADOR,
            created_by="TEST"
        )
        db_session.add(workflow)
        db_session.commit()

        # No debe lanzar excepción si es el mismo workflow
        WorkflowService.verificar_codigo_unico(db_session, "CODIGO_MISMO", workflow.id)

    def test_crear_workflow_basico(self, db_session: Session):
        """Test crear workflow básico sin etapas"""
        workflow_data = schemas.WorkflowCreate(
            codigo="WF_TEST_001",
            nombre="Workflow Test",
            descripcion="Descripción de prueba",
            version="1.0.0"
        )
        result = WorkflowService.crear_workflow(db_session, workflow_data, "TEST_USER")
        assert result.codigo == "WF_TEST_001"
        assert result.nombre == "Workflow Test"
        assert result.created_by == "TEST_USER"

    def test_listar_workflows_con_filtros(self, db_session: Session):
        """Test listar workflows con diferentes filtros"""
        # Crear workflows
        for i in range(3):
            workflow = models.Workflow(
                codigo=f"WF_LIST_{i}",
                nombre=f"Workflow {i}",
                descripcion="Test",
                version="1.0.0",
                estado=schemas.EstadoWorkflowEnum.BORRADOR,
                categoria="TEST",
                activo=(i != 2),  # El tercero está inactivo
                created_by="TEST"
            )
            db_session.add(workflow)
        db_session.commit()

        # Listar todos activos
        result = WorkflowService.listar_workflows(db_session, 0, 100, activo=True)
        assert len(result) >= 2

        # Listar por categoría
        result = WorkflowService.listar_workflows(db_session, 0, 100, categoria="TEST")
        assert len(result) >= 2

    def test_obtener_workflow_existente(self, db_session: Session):
        """Test obtener workflow existente"""
        workflow = models.Workflow(
            codigo="WF_OBTENER",
            nombre="Workflow Obtener",
            descripcion="Test",
            version="1.0.0",
            estado=schemas.EstadoWorkflowEnum.BORRADOR,
            created_by="TEST"
        )
        db_session.add(workflow)
        db_session.commit()

        result = WorkflowService.obtener_workflow(db_session, workflow.id)
        assert result.codigo == "WF_OBTENER"

    def test_obtener_workflow_no_existe(self, db_session: Session):
        """Test obtener workflow que no existe"""
        with pytest.raises(HTTPException) as exc_info:
            WorkflowService.obtener_workflow(db_session, 99999)
        assert exc_info.value.status_code == 404

    def test_actualizar_workflow(self, db_session: Session):
        """Test actualizar workflow"""
        workflow = models.Workflow(
            codigo="WF_ACTUALIZAR",
            nombre="Original",
            descripcion="Test",
            version="1.0.0",
            estado=schemas.EstadoWorkflowEnum.BORRADOR,
            created_by="TEST"
        )
        db_session.add(workflow)
        db_session.commit()

        update_data = schemas.WorkflowUpdate(nombre="Actualizado")
        result = WorkflowService.actualizar_workflow(
            db_session, workflow.id, update_data, "TEST_USER"
        )
        assert result.nombre == "Actualizado"

    def test_eliminar_workflow(self, db_session: Session):
        """Test eliminar (desactivar) workflow"""
        workflow = models.Workflow(
            codigo="WF_ELIMINAR",
            nombre="Test",
            descripcion="Test",
            version="1.0.0",
            estado=schemas.EstadoWorkflowEnum.BORRADOR,
            activo=True,
            created_by="TEST"
        )
        db_session.add(workflow)
        db_session.commit()

        WorkflowService.eliminar_workflow(db_session, workflow.id, "TEST_USER")
        db_session.refresh(workflow)
        assert workflow.activo is False


class TestEtapaServiceExtended:
    """Tests extendidos para EtapaService"""

    def test_crear_etapa_basica(self, db_session: Session):
        """Test crear etapa básica"""
        # Crear workflow primero
        workflow = models.Workflow(
            codigo="WF_ETAPA_TEST",
            nombre="Test",
            descripcion="Test",
            version="1.0.0",
            estado=schemas.EstadoWorkflowEnum.BORRADOR,
            created_by="TEST"
        )
        db_session.add(workflow)
        db_session.commit()

        etapa_data = schemas.WorkflowEtapaCreate(
            workflow_id=workflow.id,
            codigo="ETQ_001",
            nombre="Etapa Test",
            tipo=TipoEtapa.ETAPA,
            orden=1,
            perfiles_permitidos=["ADMIN"]
        )
        result = EtapaService.crear_etapa_con_preguntas(
            db_session, etapa_data, workflow.id, "TEST_USER"
        )
        assert result.codigo == "ETQ_001"

    def test_obtener_etapa_no_existe(self, db_session: Session):
        """Test obtener etapa que no existe"""
        with pytest.raises(HTTPException) as exc_info:
            EtapaService.obtener_etapa(db_session, 99999)
        assert exc_info.value.status_code == 404


class TestInstanciaServiceExtended:
    """Tests extendidos para InstanciaService"""

    def test_crear_instancia_workflow_no_existe(self, db_session: Session):
        """Test crear instancia de workflow que no existe"""
        instancia_data = schemas.WorkflowInstanciaCreate(workflow_id=99999)
        with pytest.raises(HTTPException) as exc_info:
            InstanciaService.crear_instancia(db_session, instancia_data, "TEST_USER")
        assert exc_info.value.status_code == 404

    def test_listar_instancias_vacio(self, db_session: Session):
        """Test listar instancias cuando no hay ninguna"""
        result = InstanciaService.listar_instancias(db_session, 0, 100)
        assert result == []

    def test_obtener_instancia_no_existe(self, db_session: Session):
        """Test obtener instancia que no existe"""
        with pytest.raises(HTTPException) as exc_info:
            InstanciaService.obtener_instancia(db_session, 99999)
        assert exc_info.value.status_code == 404


class TestComentarioServiceExtended:
    """Tests extendidos para ComentarioService"""

    def test_listar_comentarios_sin_instancia(self, db_session: Session):
        """Test listar comentarios de instancia que no existe"""
        result = ComentarioService.listar_comentarios(db_session, 99999)
        assert result == []


class TestHistorialServiceExtended:
    """Tests extendidos para HistorialService"""

    def test_obtener_historial_sin_instancia(self, db_session: Session):
        """Test obtener historial de instancia que no existe"""
        result = HistorialService.obtener_historial(db_session, 99999)
        assert result == []


class TestWorkflowCambiosService:
    """Tests para WorkflowCambiosService"""

    def test_obtener_historial_workflow_no_existe(self, db_session: Session):
        """Test obtener historial de workflow que no existe"""
        result = WorkflowCambiosService.obtener_historial(db_session, 99999)
        assert result == []

    def test_registrar_cambio(self, db_session: Session):
        """Test registrar cambio en workflow"""
        # Crear workflow
        workflow = models.Workflow(
            codigo="WF_CAMBIOS",
            nombre="Test",
            descripcion="Test",
            version="1.0.0",
            estado=schemas.EstadoWorkflowEnum.BORRADOR,
            created_by="TEST"
        )
        db_session.add(workflow)
        db_session.commit()

        # Registrar cambio
        cambio = WorkflowCambiosService.registrar_cambio(
            db=db_session,
            workflow_id=workflow.id,
            tipo_cambio="EDICION_ETAPA",
            accion="Test acción",
            descripcion="Test descripción",
            created_by="TEST_USER"
        )
        assert cambio.workflow_id == workflow.id
        assert cambio.tipo_cambio == "EDICION_ETAPA"
