"""
Tests para el Servicio de Ejecución de Workflows
Sistema de Trámites Migratorios de Panamá

Pruebas unitarias e integración para WorkflowExecutionService

Author: Sistema de Trámites MVP Panamá
Date: 2025-11-18
"""

import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import models_workflow as models
from app.services.workflow_execution_service import WorkflowExecutionService


# ==========================================
# FIXTURES
# ==========================================

@pytest.fixture
def workflow_simple(db_session: Session):
    """Crea un workflow simple de prueba"""
    workflow = models.Workflow(
        codigo="TEST_WF",
        nombre="Workflow de Prueba",
        version="1.0",
        estado=models.EstadoWorkflow.ACTIVO,
        activo=True,
        created_by="TEST"
    )
    db_session.add(workflow)
    db_session.flush()
    return workflow


@pytest.fixture
def etapas_prueba(db_session: Session, workflow_simple):
    """Crea etapas de prueba con diferentes perfiles"""
    etapa1 = models.WorkflowEtapa(
        workflow_id=workflow_simple.id,
        codigo="ETAPA_1",
        nombre="Etapa Ciudadano",
        tipo_etapa=models.TipoEtapa.ETAPA,
        orden=1,
        perfiles_permitidos=["CIUDADANO", "ABOGADO"],
        es_etapa_inicial=True,
        activo=True,
        created_by="TEST"
    )
    
    etapa2 = models.WorkflowEtapa(
        workflow_id=workflow_simple.id,
        codigo="ETAPA_2",
        nombre="Etapa Funcionario",
        tipo_etapa=models.TipoEtapa.ETAPA,
        orden=2,
        perfiles_permitidos=["FUNCIONARIO", "SUPERVISOR"],
        activo=True,
        created_by="TEST"
    )
    
    etapa3 = models.WorkflowEtapa(
        workflow_id=workflow_simple.id,
        codigo="ETAPA_3",
        nombre="Etapa Final",
        tipo_etapa=models.TipoEtapa.FIN,
        orden=3,
        perfiles_permitidos=["JEFATURA"],
        es_etapa_final=True,
        activo=True,
        created_by="TEST"
    )
    
    db_session.add_all([etapa1, etapa2, etapa3])
    db_session.flush()
    
    return {"etapa1": etapa1, "etapa2": etapa2, "etapa3": etapa3}


@pytest.fixture
def preguntas_prueba(db_session: Session, etapas_prueba):
    """Crea preguntas de prueba"""
    pregunta1 = models.WorkflowPregunta(
        etapa_id=etapas_prueba["etapa1"].id,
        codigo="NOMBRE",
        pregunta="¿Cuál es su nombre?",
        tipo_pregunta=models.TipoPregunta.RESPUESTA_TEXTO,
        orden=1,
        es_obligatoria=True,
        activo=True,
        created_by="TEST"
    )
    
    pregunta2 = models.WorkflowPregunta(
        etapa_id=etapas_prueba["etapa1"].id,
        codigo="DOCUMENTO",
        pregunta="Subir documento de identidad",
        tipo_pregunta=models.TipoPregunta.CARGA_ARCHIVO,
        orden=2,
        es_obligatoria=True,
        activo=True,
        created_by="TEST"
    )
    
    db_session.add_all([pregunta1, pregunta2])
    db_session.flush()
    
    return {"pregunta1": pregunta1, "pregunta2": pregunta2}


@pytest.fixture
def conexiones_prueba(db_session: Session, workflow_simple, etapas_prueba):
    """Crea conexiones entre etapas"""
    conexion1 = models.WorkflowConexion(
        workflow_id=workflow_simple.id,
        etapa_origen_id=etapas_prueba["etapa1"].id,
        etapa_destino_id=etapas_prueba["etapa2"].id,
        nombre="A Revisión",
        es_predeterminada=True,
        activo=True,
        created_by="TEST"
    )
    
    conexion2 = models.WorkflowConexion(
        workflow_id=workflow_simple.id,
        etapa_origen_id=etapas_prueba["etapa2"].id,
        etapa_destino_id=etapas_prueba["etapa3"].id,
        nombre="A Aprobación",
        es_predeterminada=True,
        activo=True,
        created_by="TEST"
    )
    
    db_session.add_all([conexion1, conexion2])
    db_session.flush()
    
    return {"conexion1": conexion1, "conexion2": conexion2}


@pytest.fixture
def instancia_prueba(db_session: Session, workflow_simple, etapas_prueba):
    """Crea una instancia de workflow para pruebas"""
    instancia = models.WorkflowInstancia(
        workflow_id=workflow_simple.id,
        num_expediente="TEST-2025-001",
        nombre_instancia="Instancia de Prueba",
        estado=models.EstadoInstancia.EN_PROGRESO,
        etapa_actual_id=etapas_prueba["etapa1"].id,
        creado_por_user_id="USER_TEST",
        activo=True
    )
    db_session.add(instancia)
    db_session.flush()
    
    return instancia


# ==========================================
# TESTS: OBTENER ETAPAS POR PERFIL
# ==========================================

def test_obtener_etapas_por_perfil_ciudadano(db_session, workflow_simple, etapas_prueba):
    """Test: Ciudadano solo ve su etapa"""
    etapas = WorkflowExecutionService.obtener_etapas_por_perfil(
        db_session, workflow_simple.id, "CIUDADANO"
    )
    
    assert len(etapas) == 1
    assert etapas[0].codigo == "ETAPA_1"
    assert "CIUDADANO" in etapas[0].perfiles_permitidos


def test_obtener_etapas_por_perfil_funcionario(db_session, workflow_simple, etapas_prueba):
    """Test: Funcionario solo ve su etapa"""
    etapas = WorkflowExecutionService.obtener_etapas_por_perfil(
        db_session, workflow_simple.id, "FUNCIONARIO"
    )
    
    assert len(etapas) == 1
    assert etapas[0].codigo == "ETAPA_2"
    assert "FUNCIONARIO" in etapas[0].perfiles_permitidos


def test_obtener_etapas_por_perfil_sin_permiso(db_session, workflow_simple, etapas_prueba):
    """Test: Perfil sin permisos no ve ninguna etapa"""
    etapas = WorkflowExecutionService.obtener_etapas_por_perfil(
        db_session, workflow_simple.id, "PERFIL_INEXISTENTE"
    )
    
    assert len(etapas) == 0


def test_obtener_etapas_workflow_inexistente(db_session):
    """Test: Error al buscar workflow inexistente"""
    with pytest.raises(HTTPException) as exc_info:
        WorkflowExecutionService.obtener_etapas_por_perfil(
            db_session, 99999, "CIUDADANO"
        )
    
    assert exc_info.value.status_code == 404


# ==========================================
# TESTS: OBTENER ESTADO WORKFLOW
# ==========================================

def test_obtener_estado_workflow_inicial(db_session, instancia_prueba, etapas_prueba):
    """Test: Estado inicial del workflow"""
    estado = WorkflowExecutionService.obtener_estado_workflow(
        db_session, instancia_prueba.id
    )
    
    assert estado["instancia_id"] == instancia_prueba.id
    assert estado["num_expediente"] == "TEST-2025-001"
    assert estado["estado"] == "EN_PROGRESO"
    assert estado["etapa_actual"]["id"] == etapas_prueba["etapa1"].id
    assert len(estado["etapas_completadas"]) == 0
    assert estado["progreso"]["porcentaje"] == 0.0


def test_obtener_estado_workflow_con_perfil(db_session, instancia_prueba, etapas_prueba):
    """Test: Estado filtrado por perfil"""
    estado = WorkflowExecutionService.obtener_estado_workflow(
        db_session, instancia_prueba.id, "CIUDADANO"
    )
    
    # Solo debe ver etapa 1
    assert len(estado["etapas_visibles"]) == 1
    assert estado["etapas_visibles"][0]["codigo"] == "ETAPA_1"


def test_obtener_estado_instancia_inexistente(db_session):
    """Test: Error al buscar instancia inexistente"""
    with pytest.raises(HTTPException) as exc_info:
        WorkflowExecutionService.obtener_estado_workflow(db_session, 99999)
    
    assert exc_info.value.status_code == 404


# ==========================================
# TESTS: VALIDAR PERMISO ETAPA
# ==========================================

def test_validar_permiso_etapa_con_permiso(etapas_prueba):
    """Test: Validación exitosa de permiso"""
    tiene_permiso = WorkflowExecutionService.validar_permiso_etapa(
        etapas_prueba["etapa1"], "CIUDADANO"
    )
    
    assert tiene_permiso is True


def test_validar_permiso_etapa_sin_permiso(etapas_prueba):
    """Test: Validación fallida de permiso"""
    tiene_permiso = WorkflowExecutionService.validar_permiso_etapa(
        etapas_prueba["etapa1"], "FUNCIONARIO"
    )
    
    assert tiene_permiso is False


# ==========================================
# TESTS: EJECUTAR ETAPA
# ==========================================

def test_ejecutar_etapa_exitosa(
    db_session, 
    instancia_prueba, 
    etapas_prueba, 
    preguntas_prueba,
    conexiones_prueba
):
    """Test: Ejecución exitosa de una etapa"""
    respuestas = {
        "NOMBRE": "Juan Pérez",
        "DOCUMENTO": "doc123.pdf"
    }
    
    resultado = WorkflowExecutionService.ejecutar_etapa(
        db_session,
        instancia_prueba.id,
        etapas_prueba["etapa1"].id,
        respuestas,
        None,
        "USER_TEST",
        "CIUDADANO"
    )
    
    assert resultado["success"] is True
    assert resultado["mensaje"] == "Etapa completada exitosamente"
    assert resultado["workflow_state"]["etapa_actual"]["id"] == etapas_prueba["etapa2"].id


def test_ejecutar_etapa_sin_permiso(
    db_session, 
    instancia_prueba, 
    etapas_prueba, 
    preguntas_prueba
):
    """Test: Error al ejecutar etapa sin permiso"""
    respuestas = {"NOMBRE": "Juan Pérez"}
    
    with pytest.raises(HTTPException) as exc_info:
        WorkflowExecutionService.ejecutar_etapa(
            db_session,
            instancia_prueba.id,
            etapas_prueba["etapa1"].id,
            respuestas,
            None,
            "USER_TEST",
            "FUNCIONARIO"  # No tiene permiso en etapa 1
        )
    
    assert exc_info.value.status_code == 403


def test_ejecutar_etapa_no_actual(
    db_session, 
    instancia_prueba, 
    etapas_prueba
):
    """Test: Error al ejecutar etapa que no es la actual"""
    respuestas = {"NOMBRE": "Juan Pérez"}
    
    with pytest.raises(HTTPException) as exc_info:
        WorkflowExecutionService.ejecutar_etapa(
            db_session,
            instancia_prueba.id,
            etapas_prueba["etapa2"].id,  # No es la etapa actual
            respuestas,
            None,
            "USER_TEST",
            "FUNCIONARIO"
        )
    
    assert exc_info.value.status_code == 400


def test_ejecutar_etapa_sin_respuesta_obligatoria(
    db_session, 
    instancia_prueba, 
    etapas_prueba, 
    preguntas_prueba
):
    """Test: Error al omitir respuesta obligatoria"""
    respuestas = {}  # Falta respuesta obligatoria
    
    with pytest.raises(HTTPException) as exc_info:
        WorkflowExecutionService.ejecutar_etapa(
            db_session,
            instancia_prueba.id,
            etapas_prueba["etapa1"].id,
            respuestas,
            None,
            "USER_TEST",
            "CIUDADANO"
        )
    
    assert exc_info.value.status_code == 400
    assert "obligatoria" in str(exc_info.value.detail).lower()


# ==========================================
# TESTS: DETERMINAR SIGUIENTE ETAPA
# ==========================================

def test_determinar_siguiente_etapa_predeterminada(
    db_session,
    etapas_prueba,
    conexiones_prueba
):
    """Test: Determinar siguiente etapa usando conexión predeterminada"""
    siguiente = WorkflowExecutionService._determinar_siguiente_etapa(
        db_session,
        etapas_prueba["etapa1"],
        {}
    )
    
    assert siguiente is not None
    assert siguiente.id == etapas_prueba["etapa2"].id


def test_determinar_siguiente_etapa_final(db_session, etapas_prueba):
    """Test: No hay siguiente etapa cuando es final"""
    siguiente = WorkflowExecutionService._determinar_siguiente_etapa(
        db_session,
        etapas_prueba["etapa3"],
        {}
    )
    
    assert siguiente is None


# ==========================================
# TESTS: EVALUAR CONDICIÓN
# ==========================================

def test_evaluar_condicion_igualdad():
    """Test: Evaluar condición de igualdad"""
    condicion = {"campo": "respuesta", "operador": "==", "valor": "SI"}
    respuestas = {"respuesta": "SI"}
    
    resultado = WorkflowExecutionService._evaluar_condicion(condicion, respuestas)
    assert resultado is True


def test_evaluar_condicion_diferencia():
    """Test: Evaluar condición de diferencia"""
    condicion = {"campo": "respuesta", "operador": "!=", "valor": "NO"}
    respuestas = {"respuesta": "SI"}
    
    resultado = WorkflowExecutionService._evaluar_condicion(condicion, respuestas)
    assert resultado is True


def test_evaluar_condicion_in():
    """Test: Evaluar condición 'in'"""
    condicion = {"campo": "tipo", "operador": "in", "valor": ["A", "B", "C"]}
    respuestas = {"tipo": "B"}
    
    resultado = WorkflowExecutionService._evaluar_condicion(condicion, respuestas)
    assert resultado is True


def test_evaluar_condicion_sin_campo():
    """Test: Condición sin campo especificado retorna True"""
    condicion = {"operador": "==", "valor": "SI"}
    respuestas = {}
    
    resultado = WorkflowExecutionService._evaluar_condicion(condicion, respuestas)
    assert resultado is True


# ==========================================
# TESTS DE INTEGRACIÓN
# ==========================================

def test_flujo_completo_ciudadano(
    db_session,
    workflow_simple,
    instancia_prueba,
    etapas_prueba,
    preguntas_prueba,
    conexiones_prueba
):
    """Test de integración: Flujo completo de ciudadano"""
    
    # 1. Ver etapas disponibles para ciudadano
    etapas_ciudadano = WorkflowExecutionService.obtener_etapas_por_perfil(
        db_session, workflow_simple.id, "CIUDADANO"
    )
    assert len(etapas_ciudadano) == 1
    
    # 2. Ver estado inicial
    estado_inicial = WorkflowExecutionService.obtener_estado_workflow(
        db_session, instancia_prueba.id, "CIUDADANO"
    )
    assert estado_inicial["progreso"]["completadas"] == 0
    
    # 3. Ejecutar primera etapa
    respuestas = {
        "NOMBRE": "Juan Pérez",
        "DOCUMENTO": "doc123.pdf"
    }
    
    resultado = WorkflowExecutionService.ejecutar_etapa(
        db_session,
        instancia_prueba.id,
        etapas_prueba["etapa1"].id,
        respuestas,
        None,
        "USER_TEST",
        "CIUDADANO"
    )
    
    assert resultado["success"] is True
    
    # 4. Verificar estado actualizado
    estado_final = WorkflowExecutionService.obtener_estado_workflow(
        db_session, instancia_prueba.id, "CIUDADANO"
    )
    
    assert len(estado_final["etapas_completadas"]) == 1
    assert etapas_prueba["etapa1"].id in estado_final["etapas_completadas"]
    assert estado_final["etapa_actual"]["id"] == etapas_prueba["etapa2"].id
    assert estado_final["progreso"]["porcentaje"] > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
