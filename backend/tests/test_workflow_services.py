"""
Tests Unitarios para los Servicios de Workflow
Sistema de Trámites Migratorios de Panamá

Tests enfocados en la capa de servicios (lógica de negocio).

Author: Sistema de Trámites MVP Panamá
Date: 2025-10-20
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi import HTTPException

from app.database import Base
from app import models_workflow as models
from app import schemas_workflow as schemas
from app.services_workflow import (
    WorkflowService,
    EtapaService,
    PreguntaService,
    ConexionService,
    InstanciaService,
    RespuestaService,
    HistorialService,
    ComentarioService
)

# ==========================================
# CONFIGURACIÓN DE TEST DATABASE
# ==========================================

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Crea una base de datos de prueba para cada test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


# ==========================================
# TESTS DE WORKFLOW SERVICE
# ==========================================

class TestWorkflowService:
    """Tests para WorkflowService"""
    
    def test_verificar_codigo_unico_ok(self, db):
        """Test: Código único válido"""
        # No debe lanzar excepción
        WorkflowService.verificar_codigo_unico(db, "NUEVO_CODIGO")
    
    def test_verificar_codigo_unico_duplicado(self, db):
        """Test: Código duplicado lanza excepción"""
        # Crear workflow
        workflow_data = schemas.WorkflowCreate(
            codigo="TEST_WF",
            nombre="Test Workflow"
        )
        WorkflowService.crear_workflow(db, workflow_data, "ADMIN")
        
        # Intentar verificar mismo código
        with pytest.raises(HTTPException) as exc_info:
            WorkflowService.verificar_codigo_unico(db, "TEST_WF")
        
        assert exc_info.value.status_code == 400
        assert "ya existe" in str(exc_info.value.detail).lower()
    
    def test_crear_workflow_simple(self, db):
        """Test: Crear workflow sin etapas"""
        workflow_data = schemas.WorkflowCreate(
            codigo="SIMPLE",
            nombre="Workflow Simple",
            descripcion="Test",
            estado=schemas.EstadoWorkflowEnum.BORRADOR
        )
        
        result = WorkflowService.crear_workflow(db, workflow_data, "ADMIN")
        
        assert result.id is not None
        assert result.codigo == "SIMPLE"
        assert result.nombre == "Workflow Simple"
        assert result.created_by == "ADMIN"
    
    def test_crear_workflow_completo(self, db):
        """Test: Crear workflow con etapas y preguntas"""
        workflow_data = schemas.WorkflowCreate(
            codigo="COMPLETO",
            nombre="Workflow Completo",
            estado=schemas.EstadoWorkflowEnum.ACTIVO,
            etapas=[
                schemas.WorkflowEtapaCreate(
                    workflow_id=1,  # Se ignorará
                    codigo="E1",
                    nombre="Etapa 1",
                    tipo_etapa=schemas.TipoEtapaEnum.ETAPA,
                    orden=1,
                    es_etapa_inicial=True,
                    perfiles_permitidos=["USER"],
                    preguntas=[
                        schemas.WorkflowPreguntaCreate(
                            etapa_id=1,  # Se ignorará
                            codigo="P1",
                            pregunta="Pregunta 1",
                            tipo_pregunta=schemas.TipoPreguntaEnum.RESPUESTA_TEXTO,
                            orden=1
                        )
                    ]
                )
            ]
        )
        
        result = WorkflowService.crear_workflow(db, workflow_data, "ADMIN")
        
        assert result.id is not None
        assert len(result.etapas) == 1
        assert result.etapas[0].codigo == "E1"
        assert len(result.etapas[0].preguntas) == 1
    
    def test_obtener_workflow_existente(self, db):
        """Test: Obtener workflow que existe"""
        # Crear workflow
        workflow_data = schemas.WorkflowCreate(codigo="TEST", nombre="Test")
        created = WorkflowService.crear_workflow(db, workflow_data, "ADMIN")
        
        # Obtener
        result = WorkflowService.obtener_workflow(db, created.id)
        assert result.id == created.id
        assert result.codigo == "TEST"
    
    def test_obtener_workflow_no_existe(self, db):
        """Test: Obtener workflow que no existe lanza excepción"""
        with pytest.raises(HTTPException) as exc_info:
            WorkflowService.obtener_workflow(db, 9999)
        
        assert exc_info.value.status_code == 404
    
    def test_actualizar_workflow(self, db):
        """Test: Actualizar workflow"""
        # Crear
        workflow_data = schemas.WorkflowCreate(codigo="TEST", nombre="Original")
        created = WorkflowService.crear_workflow(db, workflow_data, "ADMIN")
        
        # Actualizar
        update_data = schemas.WorkflowUpdate(
            nombre="Actualizado",
            estado=schemas.EstadoWorkflowEnum.ACTIVO
        )
        result = WorkflowService.actualizar_workflow(db, created.id, update_data, "USER")
        
        assert result.nombre == "Actualizado"
        assert result.estado == "ACTIVO"
        assert result.updated_by == "USER"
    
    def test_eliminar_workflow(self, db):
        """Test: Eliminar workflow (soft delete)"""
        # Crear
        workflow_data = schemas.WorkflowCreate(codigo="TEST", nombre="Test")
        created = WorkflowService.crear_workflow(db, workflow_data, "ADMIN")
        
        # Eliminar
        WorkflowService.eliminar_workflow(db, created.id, "ADMIN")
        
        # Verificar que está inactivo
        result = db.query(models.Workflow).filter(models.Workflow.id == created.id).first()
        assert result.activo is False
    
    def test_listar_workflows(self, db):
        """Test: Listar workflows con filtros"""
        # Crear varios workflows
        for i in range(3):
            workflow_data = schemas.WorkflowCreate(
                codigo=f"WF_{i}",
                nombre=f"Workflow {i}",
                estado=schemas.EstadoWorkflowEnum.ACTIVO if i % 2 == 0 else schemas.EstadoWorkflowEnum.BORRADOR
            )
            WorkflowService.crear_workflow(db, workflow_data, "ADMIN")
        
        # Listar todos
        results = WorkflowService.listar_workflows(db)
        assert len(results) == 3
        
        # Listar solo activos
        results_activos = WorkflowService.listar_workflows(
            db, estado=schemas.EstadoWorkflowEnum.ACTIVO
        )
        assert len(results_activos) == 2


# ==========================================
# TESTS DE ETAPA SERVICE
# ==========================================

class TestEtapaService:
    """Tests para EtapaService"""
    
    def test_crear_etapa_con_preguntas(self, db):
        """Test: Crear etapa con preguntas"""
        # Crear workflow primero
        workflow_data = schemas.WorkflowCreate(codigo="WF", nombre="Test")
        workflow = WorkflowService.crear_workflow(db, workflow_data, "ADMIN")
        
        # Crear etapa
        etapa_data = schemas.WorkflowEtapaCreate(
            workflow_id=workflow.id,
            codigo="ETAPA_1",
            nombre="Primera Etapa",
            tipo_etapa=schemas.TipoEtapaEnum.ETAPA,
            orden=1,
            perfiles_permitidos=["USER"],
            preguntas=[
                schemas.WorkflowPreguntaCreate(
                    etapa_id=1,  # Se ignorará
                    codigo="P1",
                    pregunta="¿Pregunta 1?",
                    tipo_pregunta=schemas.TipoPreguntaEnum.RESPUESTA_TEXTO,
                    orden=1,
                    es_obligatoria=True
                )
            ]
        )
        
        result = EtapaService.crear_etapa_con_preguntas(db, etapa_data, workflow.id, "ADMIN")
        
        assert result.id is not None
        assert result.codigo == "ETAPA_1"
        assert result.workflow_id == workflow.id
        assert len(result.preguntas) == 1
        assert result.preguntas[0].codigo == "P1"
    
    def test_verificar_codigo_unico_en_workflow(self, db):
        """Test: Código de etapa debe ser único dentro del workflow"""
        # Crear workflow
        workflow_data = schemas.WorkflowCreate(codigo="WF", nombre="Test")
        workflow = WorkflowService.crear_workflow(db, workflow_data, "ADMIN")
        
        # Crear primera etapa
        etapa_data = schemas.WorkflowEtapaCreate(
            workflow_id=workflow.id,
            codigo="DUPLICADO",
            nombre="Etapa 1",
            tipo_etapa=schemas.TipoEtapaEnum.ETAPA,
            orden=1,
            perfiles_permitidos=[]
        )
        EtapaService.crear_etapa_con_preguntas(db, etapa_data, workflow.id, "ADMIN")
        
        # Intentar crear con mismo código
        with pytest.raises(HTTPException) as exc_info:
            EtapaService.verificar_codigo_unico_en_workflow(db, workflow.id, "DUPLICADO")
        
        assert exc_info.value.status_code == 400


# ==========================================
# TESTS DE INSTANCIA SERVICE
# ==========================================

class TestInstanciaService:
    """Tests para InstanciaService"""
    
    def test_generar_numero_expediente(self, db):
        """Test: Generar número de expediente único"""
        # Crear workflow
        workflow_data = schemas.WorkflowCreate(codigo="TEST", nombre="Test")
        workflow = WorkflowService.crear_workflow(db, workflow_data, "ADMIN")
        
        # Generar número
        num_expediente = InstanciaService.generar_numero_expediente(db, workflow)
        
        assert "WF-TEST-" in num_expediente
        assert num_expediente.endswith("-000001")
    
    def test_obtener_etapa_inicial(self, db):
        """Test: Obtener etapa inicial de un workflow"""
        # Crear workflow con etapa inicial
        workflow_data = schemas.WorkflowCreate(
            codigo="WF",
            nombre="Test",
            estado=schemas.EstadoWorkflowEnum.ACTIVO,
            etapas=[
                schemas.WorkflowEtapaCreate(
                    workflow_id=1,
                    codigo="INICIO",
                    nombre="Inicio",
                    tipo_etapa=schemas.TipoEtapaEnum.ETAPA,
                    orden=1,
                    es_etapa_inicial=True,
                    perfiles_permitidos=[]
                )
            ]
        )
        workflow = WorkflowService.crear_workflow(db, workflow_data, "ADMIN")
        
        # Obtener etapa inicial
        etapa_inicial = InstanciaService.obtener_etapa_inicial(db, workflow.id)
        
        assert etapa_inicial.codigo == "INICIO"
        assert etapa_inicial.es_etapa_inicial is True
    
    def test_obtener_etapa_inicial_no_existe(self, db):
        """Test: Error si no hay etapa inicial"""
        # Crear workflow sin etapa inicial
        workflow_data = schemas.WorkflowCreate(codigo="WF", nombre="Test")
        workflow = WorkflowService.crear_workflow(db, workflow_data, "ADMIN")
        
        # Intentar obtener etapa inicial
        with pytest.raises(HTTPException) as exc_info:
            InstanciaService.obtener_etapa_inicial(db, workflow.id)
        
        assert exc_info.value.status_code == 400
    
    def test_crear_instancia(self, db):
        """Test: Crear instancia de workflow"""
        # Crear workflow activo con etapa inicial
        workflow_data = schemas.WorkflowCreate(
            codigo="WF",
            nombre="Test",
            estado=schemas.EstadoWorkflowEnum.ACTIVO,
            etapas=[
                schemas.WorkflowEtapaCreate(
                    workflow_id=1,
                    codigo="INICIO",
                    nombre="Inicio",
                    tipo_etapa=schemas.TipoEtapaEnum.ETAPA,
                    orden=1,
                    es_etapa_inicial=True,
                    perfiles_permitidos=[]
                )
            ]
        )
        workflow = WorkflowService.crear_workflow(db, workflow_data, "ADMIN")
        
        # Crear instancia
        instancia_data = schemas.WorkflowInstanciaCreate(
            workflow_id=workflow.id,
            nombre_instancia="Test Instance"
        )
        
        result = InstanciaService.crear_instancia(db, instancia_data, "USER001")
        
        assert result.id is not None
        assert result.workflow_id == workflow.id
        assert result.estado == "INICIADO"
        assert result.creado_por_user_id == "USER001"
        assert "WF-WF-" in result.num_expediente
    
    def test_crear_instancia_workflow_inactivo(self, db):
        """Test: No permitir instancias de workflows inactivos"""
        # Crear workflow en BORRADOR
        workflow_data = schemas.WorkflowCreate(
            codigo="WF",
            nombre="Test",
            estado=schemas.EstadoWorkflowEnum.BORRADOR
        )
        workflow = WorkflowService.crear_workflow(db, workflow_data, "ADMIN")
        
        # Intentar crear instancia
        instancia_data = schemas.WorkflowInstanciaCreate(workflow_id=workflow.id)
        
        with pytest.raises(HTTPException) as exc_info:
            InstanciaService.crear_instancia(db, instancia_data, "USER")
        
        assert exc_info.value.status_code == 400
        assert "ACTIVO" in str(exc_info.value.detail)


# ==========================================
# TESTS DE HISTORIAL SERVICE
# ==========================================

class TestHistorialService:
    """Tests para HistorialService"""
    
    def test_registrar_cambio(self, db):
        """Test: Registrar un cambio en el historial"""
        # Crear workflow e instancia
        workflow_data = schemas.WorkflowCreate(
            codigo="WF",
            nombre="Test",
            estado=schemas.EstadoWorkflowEnum.ACTIVO,
            etapas=[
                schemas.WorkflowEtapaCreate(
                    workflow_id=1,
                    codigo="INICIO",
                    nombre="Inicio",
                    tipo_etapa=schemas.TipoEtapaEnum.ETAPA,
                    orden=1,
                    es_etapa_inicial=True,
                    perfiles_permitidos=[]
                )
            ]
        )
        workflow = WorkflowService.crear_workflow(db, workflow_data, "ADMIN")
        
        instancia_data = schemas.WorkflowInstanciaCreate(workflow_id=workflow.id)
        instancia = InstanciaService.crear_instancia(db, instancia_data, "USER")
        
        # Registrar cambio
        cambio = HistorialService.registrar_cambio(
            db=db,
            instancia_id=instancia.id,
            tipo_cambio="PRUEBA",
            created_by="ADMIN",
            descripcion="Cambio de prueba"
        )
        db.commit()
        
        assert cambio.id is not None
        assert cambio.tipo_cambio == "PRUEBA"
        assert cambio.descripcion == "Cambio de prueba"
    
    def test_obtener_historial(self, db):
        """Test: Obtener historial de una instancia"""
        # Crear instancia (esto genera entrada de historial automática)
        workflow_data = schemas.WorkflowCreate(
            codigo="WF",
            nombre="Test",
            estado=schemas.EstadoWorkflowEnum.ACTIVO,
            etapas=[
                schemas.WorkflowEtapaCreate(
                    workflow_id=1,
                    codigo="INICIO",
                    nombre="Inicio",
                    tipo_etapa=schemas.TipoEtapaEnum.ETAPA,
                    orden=1,
                    es_etapa_inicial=True,
                    perfiles_permitidos=[]
                )
            ]
        )
        workflow = WorkflowService.crear_workflow(db, workflow_data, "ADMIN")
        
        instancia_data = schemas.WorkflowInstanciaCreate(workflow_id=workflow.id)
        instancia = InstanciaService.crear_instancia(db, instancia_data, "USER")
        
        # Obtener historial
        historial = HistorialService.obtener_historial(db, instancia.id)
        
        assert len(historial) >= 1
        assert historial[0].tipo_cambio == "INICIO"


# ==========================================
# TESTS DE COMENTARIO SERVICE
# ==========================================

class TestComentarioService:
    """Tests para ComentarioService"""
    
    def test_crear_comentario(self, db):
        """Test: Crear comentario en una instancia"""
        # Crear instancia
        workflow_data = schemas.WorkflowCreate(
            codigo="WF",
            nombre="Test",
            estado=schemas.EstadoWorkflowEnum.ACTIVO,
            etapas=[
                schemas.WorkflowEtapaCreate(
                    workflow_id=1,
                    codigo="INICIO",
                    nombre="Inicio",
                    tipo_etapa=schemas.TipoEtapaEnum.ETAPA,
                    orden=1,
                    es_etapa_inicial=True,
                    perfiles_permitidos=[]
                )
            ]
        )
        workflow = WorkflowService.crear_workflow(db, workflow_data, "ADMIN")
        
        instancia_data = schemas.WorkflowInstanciaCreate(workflow_id=workflow.id)
        instancia = InstanciaService.crear_instancia(db, instancia_data, "USER")
        
        # Crear comentario
        comentario_data = schemas.WorkflowComentarioCreate(
            comentario="Este es un comentario de prueba",
            es_interno=True
        )
        
        result = ComentarioService.crear_comentario(
            db, instancia.id, comentario_data, "USER"
        )
        
        assert result.id is not None
        assert result.comentario == "Este es un comentario de prueba"
        assert result.es_interno is True
        assert result.created_by == "USER"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
