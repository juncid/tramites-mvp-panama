"""
Tests para routers de workflow
Sistema de Trámites Migratorios de Panamá
"""

import pytest
from fastapi.testclient import TestClient


# ==========================================
# TESTS DE ENDPOINTS DE WORKFLOWS
# ==========================================

class TestWorkflowEndpoints:
    """Tests para endpoints de workflows"""
    
    def test_listar_workflows(self, client):
        """Test: GET /api/v1/workflow/workflows"""
        response = client.get("/api/v1/workflow/workflows")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_listar_workflows_solo_activos(self, client):
        """Test: GET /api/v1/workflow/workflows?activo=true"""
        response = client.get("/api/v1/workflow/workflows?activo=true")
        assert response.status_code == 200
    
    def test_obtener_workflow_inexistente(self, client):
        """Test: GET /api/v1/workflow/workflows/{id} inexistente"""
        response = client.get("/api/v1/workflow/workflows/99999")
        assert response.status_code == 404


# ==========================================
# TESTS DE ENDPOINTS DE ETAPAS DE WORKFLOW
# ==========================================

class TestEtapasWorkflowEndpoints:
    """Tests para endpoints de etapas de workflow"""
    
    def test_listar_etapas_workflow_inexistente(self, client):
        """Test: GET /api/v1/workflow/workflows/{id}/etapas"""
        response = client.get("/api/v1/workflow/workflows/99999/etapas")
        # Puede retornar 404 (workflow no existe) o 200 (lista vacía)
        assert response.status_code in [200, 404]


# ==========================================
# TESTS DE ENDPOINTS DE INSTANCIAS
# ==========================================

class TestInstanciasWorkflowEndpoints:
    """Tests para endpoints de instancias de workflow"""
    
    def test_listar_instancias(self, client):
        """Test: GET /api/v1/workflow/instancias"""
        response = client.get("/api/v1/workflow/instancias")
        assert response.status_code == 200
    
    def test_obtener_instancia_inexistente(self, client):
        """Test: GET /api/v1/workflow/instancias/{id}"""
        response = client.get("/api/v1/workflow/instancias/99999")
        assert response.status_code == 404


# ==========================================
# TESTS DE VISTAS DE WORKFLOW
# ==========================================

class TestVistasWorkflowEndpoints:
    """Tests para endpoints de vistas de workflow"""
    
    def test_obtener_vista_config_workflow_inexistente(self, client):
        """Test: GET /api/v1/workflow/workflows/{id}/vista-config"""
        response = client.get("/api/v1/workflow/workflows/99999/vista-config")
        # Puede ser 404 o 200 con defaults
        assert response.status_code in [200, 404]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
