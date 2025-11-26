"""
Tests para routers SIM-FT
Sistema de Trámites Migratorios de Panamá
"""

import pytest
from fastapi.testclient import TestClient


# ==========================================
# TESTS DE ENDPOINTS DE TIPOS DE TRÁMITE
# ==========================================

class TestTiposTramiteEndpoints:
    """Tests para endpoints de tipos de trámite SIM-FT"""
    
    def test_listar_tramites_tipos(self, client):
        """Test: GET /api/v1/sim-ft/tramites-tipos"""
        response = client.get("/api/v1/sim-ft/tramites-tipos")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_obtener_tramite_tipo_inexistente(self, client):
        """Test: GET /api/v1/sim-ft/tramites-tipos/{cod}"""
        response = client.get("/api/v1/sim-ft/tramites-tipos/INEXISTENTE")
        assert response.status_code == 404


# ==========================================
# TESTS DE ENDPOINTS DE ESTATUS
# ==========================================

class TestEstatusEndpoints:
    """Tests para endpoints de estatus SIM-FT"""
    
    def test_listar_estatus(self, client):
        """Test: GET /api/v1/sim-ft/estatus"""
        response = client.get("/api/v1/sim-ft/estatus")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_obtener_estatus_inexistente(self, client):
        """Test: GET /api/v1/sim-ft/estatus/{cod}"""
        response = client.get("/api/v1/sim-ft/estatus/INEXISTENTE")
        assert response.status_code == 404


# ==========================================
# TESTS DE ENDPOINTS DE CONCLUSIONES
# ==========================================

class TestConclusionesEndpoints:
    """Tests para endpoints de conclusiones SIM-FT"""
    
    def test_listar_conclusiones(self, client):
        """Test: GET /api/v1/sim-ft/conclusiones"""
        response = client.get("/api/v1/sim-ft/conclusiones")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


# ==========================================
# TESTS DE ENDPOINTS DE PRIORIDADES
# ==========================================

class TestPrioridadesEndpoints:
    """Tests para endpoints de prioridades SIM-FT"""
    
    def test_listar_prioridades(self, client):
        """Test: GET /api/v1/sim-ft/prioridades"""
        response = client.get("/api/v1/sim-ft/prioridades")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


# ==========================================
# TESTS DE ENDPOINTS DE PASOS
# ==========================================

class TestPasosEndpoints:
    """Tests para endpoints de pasos SIM-FT"""
    
    def test_listar_pasos(self, client):
        """Test: GET /api/v1/sim-ft/pasos"""
        response = client.get("/api/v1/sim-ft/pasos")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


# ==========================================
# TESTS DE ENDPOINTS DE TRÁMITES
# ==========================================

class TestTramitesEndpoints:
    """Tests para endpoints de trámites SIM-FT"""
    
    def test_listar_tramites(self, client):
        """Test: GET /api/v1/sim-ft/tramites"""
        response = client.get("/api/v1/sim-ft/tramites")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


# ==========================================
# TESTS DE ESTADÍSTICAS SIM-FT
# ==========================================

class TestEstadisticasSimFTEndpoints:
    """Tests para endpoints de estadísticas SIM-FT"""
    
    def test_estadisticas_por_estado(self, client):
        """Test: GET /api/v1/sim-ft/estadisticas/tramites-por-estado"""
        response = client.get("/api/v1/sim-ft/estadisticas/tramites-por-estado")
        assert response.status_code == 200
    
    def test_estadisticas_por_tipo(self, client):
        """Test: GET /api/v1/sim-ft/estadisticas/tramites-por-tipo"""
        response = client.get("/api/v1/sim-ft/estadisticas/tramites-por-tipo")
        assert response.status_code == 200
    
    def test_estadisticas_tiempo_promedio(self, client):
        """Test: GET /api/v1/sim-ft/estadisticas/tiempo-promedio"""
        response = client.get("/api/v1/sim-ft/estadisticas/tiempo-promedio")
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
