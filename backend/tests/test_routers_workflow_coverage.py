"""
Tests para app/routers/routers_workflow.py
Sistema de Trámites Migratorios de Panamá

Objetivo: Cubrir más líneas del router de workflow para alcanzar 85%+ de cobertura.
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session



class TestWorkflowRouter:
    """Tests para el router de workflows"""
    
    def test_crear_workflow(self, client: TestClient, db_session: Session):
        """Test: Crear un workflow nuevo"""
        workflow_data = {
            "codigo": "WF_TEST_CREATE",
            "nombre": "Workflow de Prueba",
            "descripcion": "Workflow creado para testing",
            "version": "1.0"
        }
        
        response = client.post("/api/v1/workflow/workflows", json=workflow_data)
        
        assert response.status_code in [200, 201]
        data = response.json()
        assert data["codigo"] == "WF_TEST_CREATE"
        assert data["nombre"] == "Workflow de Prueba"
    
    def test_listar_workflows(self, client: TestClient, db_session: Session):
        """Test: Listar workflows"""
        response = client.get("/api/v1/workflow/workflows")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_obtener_workflow_no_existe(self, client: TestClient):
        """Test: Obtener workflow que no existe retorna 404"""
        response = client.get("/api/v1/workflow/workflows/99999")
        
        assert response.status_code == 404
    
    def test_obtener_workflow_codigo_no_existe(self, client: TestClient):
        """Test: Obtener workflow por código que no existe retorna 404"""
        response = client.get("/api/v1/workflow/workflows/codigo/NO_EXISTE")
        
        assert response.status_code == 404
    
    def test_actualizar_workflow_no_existe(self, client: TestClient):
        """Test: Actualizar workflow que no existe retorna 404"""
        response = client.put(
            "/api/v1/workflow/workflows/99999",
            json={"nombre": "Nuevo nombre"}
        )
        
        assert response.status_code == 404
    
    def test_eliminar_workflow_no_existe(self, client: TestClient):
        """Test: Eliminar workflow que no existe retorna 404"""
        response = client.delete("/api/v1/workflow/workflows/99999")
        
        assert response.status_code == 404


class TestEtapasRouter:
    """Tests para endpoints de etapas"""
    
    def test_obtener_etapa_no_existe(self, client: TestClient):
        """Test: Obtener etapa que no existe retorna 404"""
        response = client.get("/api/v1/workflow/etapas/99999")
        
        assert response.status_code == 404
    
    def test_actualizar_etapa_no_existe(self, client: TestClient):
        """Test: Actualizar etapa que no existe retorna 404"""
        response = client.put(
            "/api/v1/workflow/etapas/99999",
            json={"nombre": "Nuevo nombre"}
        )
        
        assert response.status_code == 404
    
    def test_eliminar_etapa_no_existe(self, client: TestClient):
        """Test: Eliminar etapa que no existe retorna 404"""
        response = client.delete("/api/v1/workflow/etapas/99999")
        
        assert response.status_code == 404


class TestInstanciasRouter:
    """Tests para endpoints de instancias de workflow"""
    
    def test_listar_instancias(self, client: TestClient, db_session: Session):
        """Test: Listar instancias de workflow"""
        response = client.get("/api/v1/workflow/instancias")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_obtener_instancia_no_existe(self, client: TestClient):
        """Test: Obtener instancia que no existe retorna 404"""
        response = client.get("/api/v1/workflow/instancias/99999")
        
        assert response.status_code == 404
    
    def test_actualizar_instancia_no_existe(self, client: TestClient):
        """Test: Actualizar instancia que no existe retorna 404"""
        response = client.put(
            "/api/v1/workflow/instancias/99999",
            json={"num_expediente": "EXP-NEW"}
        )
        
        assert response.status_code == 404


class TestConexionesRouter:
    """Tests para endpoints de conexiones entre etapas"""
    
    def test_obtener_conexion_no_existe(self, client: TestClient):
        """Test: Obtener conexión que no existe retorna 404"""
        response = client.get("/api/v1/workflow/conexiones/99999")
        
        assert response.status_code == 404
    
    def test_eliminar_conexion_no_existe(self, client: TestClient):
        """Test: Eliminar conexión que no existe retorna 404"""
        response = client.delete("/api/v1/workflow/conexiones/99999")
        
        assert response.status_code == 404


class TestPreguntasRouter:
    """Tests para endpoints de preguntas"""
    
    def test_obtener_pregunta_no_existe(self, client: TestClient):
        """Test: Obtener pregunta que no existe retorna 404"""
        response = client.get("/api/v1/workflow/preguntas/99999")
        
        assert response.status_code == 404
    
    def test_actualizar_pregunta_no_existe(self, client: TestClient):
        """Test: Actualizar pregunta que no existe retorna 404"""
        response = client.put(
            "/api/v1/workflow/preguntas/99999",
            json={"pregunta": "Nueva pregunta"}
        )
        
        assert response.status_code == 404
    
    def test_eliminar_pregunta_no_existe(self, client: TestClient):
        """Test: Eliminar pregunta que no existe retorna 404"""
        response = client.delete("/api/v1/workflow/preguntas/99999")
        
        assert response.status_code == 404


class TestComentariosRouter:
    """Tests para endpoints de comentarios"""
    
    def test_listar_comentarios_instancia_no_existe(self, client: TestClient):
        """Test: Listar comentarios de instancia que no existe"""
        response = client.get("/api/v1/workflow/instancias/99999/comentarios")
        
        # Puede retornar 200 con lista vacía o 404
        assert response.status_code in [200, 404]


class TestHistorialRouter:
    """Tests para endpoints de historial"""
    
    def test_listar_historial_instancia_no_existe(self, client: TestClient):
        """Test: Listar historial de instancia que no existe"""
        response = client.get("/api/v1/workflow/instancias/99999/historial")
        
        # Puede retornar 200 con lista vacía o 404
        assert response.status_code in [200, 404]


class TestEjecucionRouter:
    """Tests para endpoints de ejecución de workflow"""
    
    def test_obtener_estado_instancia_no_existe(self, client: TestClient):
        """Test: Obtener estado de instancia que no existe retorna 404"""
        response = client.get("/api/v1/workflow/instancias/99999/estado")
        
        assert response.status_code == 404
    
    def test_ejecutar_etapa_instancia_no_existe(self, client: TestClient):
        """Test: Ejecutar etapa de instancia que no existe retorna 404"""
        response = client.post(
            "/api/v1/workflow/instancias/99999/ejecutar-etapa",
            json={"etapa_id": 1, "respuestas": {}}
        )
        
        assert response.status_code in [404, 422]
    
    def test_obtener_etapas_por_perfil_workflow_no_existe(self, client: TestClient):
        """Test: Obtener etapas por perfil de workflow que no existe"""
        response = client.get(
            "/api/v1/workflow/workflows/99999/etapas-por-perfil",
            params={"perfil": "CIUDADANO"}
        )
        
        assert response.status_code == 404
