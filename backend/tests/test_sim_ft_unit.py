"""
Tests unitarios para endpoints SIM_FT
Sistema de Trámites Migratorios de Panamá - Sistema Integrado de Migración

Cubre:
- Gestión de trámites SIM_FT (encabezado y detalle)
- Catálogos (estados, conclusiones, prioridades, tipos de trámites)
- Configuración de pasos y flujo
- Validaciones y permisos
- CRUD completo de entidades SIM_FT
"""

import pytest
from unittest.mock import Mock, patch
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.models_sim_ft import (
    SimFtTramites, SimFtTramiteE, SimFtTramiteD,
    SimFtEstatus, SimFtConclusion, SimFtPrioridad,
    SimFtPasos, SimFtPasoXTram
)
from app.schemas.schemas_sim_ft import (
    SimFtTramitesCreate, SimFtTramiteECreate, SimFtTramiteDCreate,
    SimFtEstatusResponse, SimFtConclusionResponse, SimFtPrioridadResponse
)


# ==========================================
# FIXTURES
# ==========================================

@pytest.fixture
def setup_sim_ft_catalogos(db_session):
    """Crear datos de catálogo SIM_FT necesarios para tests"""
    
    # Crear tipos de trámites
    tramites = [
        SimFtTramites(
            COD_TRAMITE="PPSH",
            DESC_TRAMITE="Proceso de Protección de Personas en Situación Humanitaria",
            PAG_TRAMITE="http://migracion.gob.pa/ppsh",
            IND_ACTIVO="S"
        ),
        SimFtTramites(
            COD_TRAMITE="VISA",
            DESC_TRAMITE="Solicitud de Visa",
            PAG_TRAMITE="http://migracion.gob.pa/visa",
            IND_ACTIVO="S"
        ),
    ]
    
    # Crear estados
    estados = [
        SimFtEstatus(COD_ESTATUS="01", NOM_ESTATUS="Iniciado", IND_ACTIVO="S"),
        SimFtEstatus(COD_ESTATUS="02", NOM_ESTATUS="En Proceso", IND_ACTIVO="S"),
        SimFtEstatus(COD_ESTATUS="03", NOM_ESTATUS="Finalizado", IND_ACTIVO="S"),
        SimFtEstatus(COD_ESTATUS="04", NOM_ESTATUS="Suspendido", IND_ACTIVO="S"),
    ]
    
    # Crear conclusiones
    conclusiones = [
        SimFtConclusion(COD_CONCLUSION="AP", NOM_CONCLUSION="Aprobado", IND_ACTIVO="S"),
        SimFtConclusion(COD_CONCLUSION="RE", NOM_CONCLUSION="Rechazado", IND_ACTIVO="S"),
        SimFtConclusion(COD_CONCLUSION="AN", NOM_CONCLUSION="Anulado", IND_ACTIVO="S"),
    ]
    
    # Crear prioridades
    prioridades = [
        SimFtPrioridad(COD_PRIORIDAD="A", NOM_PRIORIDAD="Alta", IND_ACTIVO="S"),
        SimFtPrioridad(COD_PRIORIDAD="N", NOM_PRIORIDAD="Normal", IND_ACTIVO="S"),
        SimFtPrioridad(COD_PRIORIDAD="B", NOM_PRIORIDAD="Baja", IND_ACTIVO="S"),
    ]
    
    # Crear pasos para PPSH
    pasos = [
        SimFtPasos(
            COD_TRAMITE="PPSH",
            NUM_PASO=1,
            NOM_DESCRIPCION="Recepción de Solicitud",
            IND_ACTIVO="S"
        ),
        SimFtPasos(
            COD_TRAMITE="PPSH",
            NUM_PASO=2,
            NOM_DESCRIPCION="Evaluación de Documentos",
            IND_ACTIVO="S"
        ),
        SimFtPasos(
            COD_TRAMITE="PPSH",
            NUM_PASO=3,
            NOM_DESCRIPCION="Entrevista",
            IND_ACTIVO="S"
        ),
        SimFtPasos(
            COD_TRAMITE="PPSH",
            NUM_PASO=4,
            NOM_DESCRIPCION="Decisión Final",
            IND_ACTIVO="S"
        ),
    ]
    
    # Crear configuración de flujo
    flujo = [
        SimFtPasoXTram(
            COD_TRAMITE="PPSH",
            NUM_PASO=1,
            COD_SECCION="ATEN",
            ID_PASO_SGTE=2,
            IND_ACTIVO="S"
        ),
        SimFtPasoXTram(
            COD_TRAMITE="PPSH",
            NUM_PASO=2,
            COD_SECCION="EVAL",
            ID_PASO_SGTE=3,
            IND_ACTIVO="S"
        ),
        SimFtPasoXTram(
            COD_TRAMITE="PPSH",
            NUM_PASO=3,
            COD_SECCION="ENTR",
            ID_PASO_SGTE=4,
            IND_ACTIVO="S"
        ),
        SimFtPasoXTram(
            COD_TRAMITE="PPSH",
            NUM_PASO=4,
            COD_SECCION="DECI",
            ID_PASO_SGTE=None,
            IND_ACTIVO="S"
        ),
    ]
    
    db_session.add_all(tramites + estados + conclusiones + prioridades + pasos + flujo)
    db_session.commit()
    
    return {
        "tramites": tramites,
        "estados": estados,
        "conclusiones": conclusiones,
        "prioridades": prioridades,
        "pasos": pasos,
        "flujo": flujo
    }


# ==========================================
# TESTS DE CATÁLOGOS
# ==========================================

class TestSimFtCatalogosEndpoints:
    """Suite de tests para endpoints de catálogos SIM_FT"""
    
    def test_get_tipos_tramites_success(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Obtener tipos de trámites"""
        response = client.get("/api/v1/sim-ft/tramites-tipos")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2
        assert any(t["COD_TRAMITE"] == "PPSH" for t in data)
        assert any(t["COD_TRAMITE"] == "VISA" for t in data)
    
    def test_get_tipo_tramite_by_codigo(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Obtener tipo de trámite específico por código"""
        response = client.get("/api/v1/sim-ft/tramites-tipos/PPSH")
        
        assert response.status_code == 200
        data = response.json()
        assert data["COD_TRAMITE"] == "PPSH"
        assert "PPSH" in data["DESC_TRAMITE"] or "Protección" in data["DESC_TRAMITE"]
    
    def test_get_tipo_tramite_not_found(self, client: TestClient):
        """Test: Tipo de trámite no encontrado"""
        response = client.get("/api/v1/sim-ft/tramites-tipos/INEXISTENTE")
        assert response.status_code == 404
    
    def test_get_estados_success(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Obtener estados"""
        response = client.get("/api/v1/sim-ft/estatus")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 4
        assert any(e["COD_ESTATUS"] == "01" for e in data)
        assert any(e["COD_ESTATUS"] == "02" for e in data)
    
    def test_get_estado_by_codigo(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Obtener estado específico"""
        response = client.get("/api/v1/sim-ft/estatus/01")
        
        assert response.status_code == 200
        data = response.json()
        assert data["COD_ESTATUS"] == "01"
        assert data["NOM_ESTATUS"] == "Iniciado"
    
    def test_get_estados_only_active(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Filtrar solo estados activos"""
        # Crear estado inactivo
        estado_inactivo = SimFtEstatus(
            COD_ESTATUS="99",
            NOM_ESTATUS="Obsoleto",
            IND_ACTIVO="N"
        )
        db_session.add(estado_inactivo)
        db_session.commit()
        
        response = client.get("/api/v1/sim-ft/estatus?activo=true")
        
        assert response.status_code == 200
        data = response.json()
        assert not any(e["COD_ESTATUS"] == "99" for e in data)
    
    def test_get_conclusiones_success(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Obtener conclusiones"""
        response = client.get("/api/v1/sim-ft/conclusiones")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 3
        assert any(c["COD_CONCLUSION"] == "AP" for c in data)
        assert any(c["COD_CONCLUSION"] == "RE" for c in data)
    
    def test_get_prioridades_success(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Obtener prioridades"""
        response = client.get("/api/v1/sim-ft/prioridades")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 3
        assert any(p["COD_PRIORIDAD"] == "A" for p in data)
        assert any(p["COD_PRIORIDAD"] == "N" for p in data)


# ==========================================
# TESTS DE CONFIGURACIÓN DE PASOS
# ==========================================

class TestSimFtPasosEndpoints:
    """Suite de tests para configuración de pasos"""
    
    def test_get_pasos_by_tramite(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Obtener pasos de un tipo de trámite"""
        response = client.get("/api/v1/sim-ft/pasos?cod_tramite=PPSH")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 4
        assert any(p["NUM_PASO"] == 1 for p in data)
        assert any(p["NOM_DESCRIPCION"] == "Recepción de Solicitud" for p in data)
    
    def test_get_paso_especifico(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Obtener paso específico"""
        response = client.get("/api/v1/sim-ft/pasos/PPSH/1")
        
        assert response.status_code == 200
        data = response.json()
        assert data["NUM_PASO"] == 1
        assert data["COD_TRAMITE"] == "PPSH"
    
    def test_get_flujo_pasos(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Obtener configuración de flujo"""
        response = client.get("/api/v1/sim-ft/flujo-pasos?cod_tramite=PPSH")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 4
        
        # Verificar secuencia lógica
        paso1 = next(p for p in data if p["NUM_PASO"] == 1)
        assert paso1["ID_PASO_SGTE"] == 2
        assert paso1["COD_SECCION"] == "ATEN"


# ==========================================
# TESTS DE TRÁMITES (ENCABEZADO)
# ==========================================

class TestSimFtTramitesEndpoints:
    """Suite de tests para trámites SIM_FT"""
    
    def test_create_tramite_success(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Crear trámite exitosamente"""
        tramite_data = {
            "NUM_ANNIO": 2025,
            "NUM_TRAMITE": 1,
            "NUM_REGISTRO": 1,
            "COD_TRAMITE": "PPSH",
            "FEC_INI_TRAMITE": datetime.now().isoformat(),
            "IND_ESTATUS": "01",
            "IND_PRIORIDAD": "N",
            "OBS_OBSERVA": "Trámite de prueba",
            "ID_USUARIO_CREA": "ADMIN_TEST"
        }
        
        response = client.post("/api/v1/sim-ft/tramites", json=tramite_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["NUM_ANNIO"] == 2025
        assert data["COD_TRAMITE"] == "PPSH"
        assert data["IND_ESTATUS"] == "01"
    
    def test_create_tramite_validation_errors(self, client: TestClient):
        """Test: Validaciones en creación de trámite"""
        # Trámite sin año
        response = client.post("/api/v1/sim-ft/tramites", json={
            "NUM_TRAMITE": 1,
            "NUM_REGISTRO": 1,
            "COD_TRAMITE": "PPSH"
        })
        assert response.status_code == 422
        
        # Código de trámite inválido
        response = client.post("/api/v1/sim-ft/tramites", json={
            "NUM_ANNIO": 2025,
            "NUM_TRAMITE": 1,
            "NUM_REGISTRO": 1,
            "COD_TRAMITE": "CODIGO_MUY_LARGO_INVALIDO"
        })
        assert response.status_code == 422
    
    def test_get_tramite_by_id(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Obtener trámite por ID compuesto"""
        # Crear trámite
        tramite = SimFtTramiteE(
            NUM_ANNIO=2025,
            NUM_TRAMITE=1,
            NUM_REGISTRO=1,
            COD_TRAMITE="PPSH",
            FEC_INI_TRAMITE=datetime.now(),
            IND_ESTATUS="01",
            IND_PRIORIDAD="N"
        )
        db_session.add(tramite)
        db_session.commit()
        
        response = client.get("/api/v1/sim-ft/tramites/2025/1/1")
        
        assert response.status_code == 200
        data = response.json()
        assert data["NUM_ANNIO"] == 2025
        assert data["NUM_TRAMITE"] == 1
        assert data["NUM_REGISTRO"] == 1
    
    def test_get_tramite_not_found(self, client: TestClient):
        """Test: Trámite no encontrado"""
        response = client.get("/api/v1/sim-ft/tramites/2099/9999/9999")
        assert response.status_code == 404
    
    def test_update_tramite_success(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Actualizar trámite"""
        # Crear trámite
        tramite = SimFtTramiteE(
            NUM_ANNIO=2025,
            NUM_TRAMITE=1,
            NUM_REGISTRO=1,
            COD_TRAMITE="PPSH",
            FEC_INI_TRAMITE=datetime.now(),
            IND_ESTATUS="01",
            IND_PRIORIDAD="N"
        )
        db_session.add(tramite)
        db_session.commit()
        
        # Actualizar estado
        update_data = {
            "IND_ESTATUS": "02",
            "OBS_OBSERVA": "Trámite actualizado a En Proceso"
        }
        
        response = client.put("/api/v1/sim-ft/tramites/2025/1/1", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["IND_ESTATUS"] == "02"
        assert "actualizado" in data["OBS_OBSERVA"].lower()
    
    def test_list_tramites_with_filters(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Listar trámites con filtros"""
        # Crear varios trámites
        tramites = [
            SimFtTramiteE(
                NUM_ANNIO=2025, NUM_TRAMITE=i, NUM_REGISTRO=1,
                COD_TRAMITE="PPSH", FEC_INI_TRAMITE=datetime.now(),
                IND_ESTATUS="01" if i % 2 == 0 else "02",
                IND_PRIORIDAD="N"
            )
            for i in range(1, 6)
        ]
        db_session.add_all(tramites)
        db_session.commit()
        
        # Filtrar por año
        response = client.get("/api/v1/sim-ft/tramites?num_annio=2025")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5
        
        # Filtrar por tipo
        response = client.get("/api/v1/sim-ft/tramites?cod_tramite=PPSH")
        assert response.status_code == 200
        data = response.json()
        assert all(t["COD_TRAMITE"] == "PPSH" for t in data)
        
        # Filtrar por estado
        response = client.get("/api/v1/sim-ft/tramites?ind_estatus=01")
        assert response.status_code == 200
        data = response.json()
        assert all(t["IND_ESTATUS"] == "01" for t in data)


# ==========================================
# TESTS DE PASOS DE TRÁMITE (DETALLE)
# ==========================================

class TestSimFtTramiteDetalle:
    """Suite de tests para detalle de pasos de trámite"""
    
    def test_create_paso_tramite(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Registrar paso de trámite"""
        # Crear trámite encabezado primero
        tramite = SimFtTramiteE(
            NUM_ANNIO=2025, NUM_TRAMITE=1, NUM_REGISTRO=1,
            COD_TRAMITE="PPSH", FEC_INI_TRAMITE=datetime.now(),
            IND_ESTATUS="01", IND_PRIORIDAD="N"
        )
        db_session.add(tramite)
        db_session.commit()
        
        # Crear paso
        paso_data = {
            "NUM_ANNIO": 2025,
            "NUM_TRAMITE": 1,
            "NUM_PASO": 1,
            "NUM_REGISTRO": 1,
            "COD_TRAMITE": "PPSH",
            "COD_SECCION": "ATEN",
            "COD_AGENCIA": "0001",
            "ID_USUAR_RESP": "ADMIN_TEST",
            "OBS_OBSERVACION": "Paso 1 iniciado",
            "NUM_PASO_SGTE": 2,
            "IND_ESTATUS": "02",
            "ID_USUARIO_CREA": "ADMIN_TEST"
        }
        
        response = client.post("/api/v1/sim-ft/tramites/2025/1/pasos", json=paso_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["NUM_PASO"] == 1
        assert data["COD_SECCION"] == "ATEN"
        assert data["NUM_PASO_SGTE"] == 2
    
    def test_get_pasos_tramite(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Obtener todos los pasos de un trámite"""
        # Crear trámite
        tramite = SimFtTramiteE(
            NUM_ANNIO=2025, NUM_TRAMITE=1, NUM_REGISTRO=1,
            COD_TRAMITE="PPSH", FEC_INI_TRAMITE=datetime.now(),
            IND_ESTATUS="02", IND_PRIORIDAD="N"
        )
        db_session.add(tramite)
        
        # Crear pasos
        pasos = [
            SimFtTramiteD(
                NUM_ANNIO=2025, NUM_TRAMITE=1, NUM_PASO=i, NUM_REGISTRO=1,
                COD_TRAMITE="PPSH", COD_SECCION="ATEN",
                IND_ESTATUS="02", NUM_PASO_SGTE=i+1 if i < 4 else None
            )
            for i in range(1, 5)
        ]
        db_session.add_all(pasos)
        db_session.commit()
        
        response = client.get("/api/v1/sim-ft/tramites/2025/1/pasos")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 4
        assert data[0]["NUM_PASO"] == 1
        assert data[3]["NUM_PASO_SGTE"] is None  # Último paso
    
    def test_get_paso_especifico_tramite(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Obtener paso específico de un trámite"""
        # Crear trámite y paso
        tramite = SimFtTramiteE(
            NUM_ANNIO=2025, NUM_TRAMITE=1, NUM_REGISTRO=1,
            COD_TRAMITE="PPSH", FEC_INI_TRAMITE=datetime.now(),
            IND_ESTATUS="02", IND_PRIORIDAD="N"
        )
        paso = SimFtTramiteD(
            NUM_ANNIO=2025, NUM_TRAMITE=1, NUM_PASO=1, NUM_REGISTRO=1,
            COD_TRAMITE="PPSH", COD_SECCION="ATEN",
            IND_ESTATUS="02", OBS_OBSERVACION="Paso de prueba"
        )
        db_session.add_all([tramite, paso])
        db_session.commit()
        
        response = client.get("/api/v1/sim-ft/tramites/2025/1/1/1")
        
        assert response.status_code == 200
        data = response.json()
        assert data["NUM_PASO"] == 1
        assert data["OBS_OBSERVACION"] == "Paso de prueba"
    
    def test_update_paso_tramite(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Actualizar paso de trámite"""
        # Crear trámite y paso
        tramite = SimFtTramiteE(
            NUM_ANNIO=2025, NUM_TRAMITE=1, NUM_REGISTRO=1,
            COD_TRAMITE="PPSH", FEC_INI_TRAMITE=datetime.now(),
            IND_ESTATUS="02", IND_PRIORIDAD="N"
        )
        paso = SimFtTramiteD(
            NUM_ANNIO=2025, NUM_TRAMITE=1, NUM_PASO=1, NUM_REGISTRO=1,
            COD_TRAMITE="PPSH", COD_SECCION="ATEN",
            IND_ESTATUS="02"
        )
        db_session.add_all([tramite, paso])
        db_session.commit()
        
        # Actualizar paso
        update_data = {
            "IND_ESTATUS": "03",
            "IND_CONCLUSION": "AP",
            "OBS_OBSERVACION": "Paso completado exitosamente"
        }
        
        response = client.put("/api/v1/sim-ft/tramites/2025/1/1/1", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["IND_ESTATUS"] == "03"
        assert data["IND_CONCLUSION"] == "AP"


# ==========================================
# TESTS DE FLUJO COMPLETO
# ==========================================

class TestSimFtFlujoCompleto:
    """Tests de integración para flujo completo de trámite"""
    
    def test_flujo_completo_tramite(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Flujo completo desde creación hasta cierre"""
        
        # 1. Crear trámite directamente en BD para que esté disponible en la transacción del test
        tramite = SimFtTramiteE(
            NUM_ANNIO=2025,
            NUM_TRAMITE=100,
            NUM_REGISTRO=1,
            COD_TRAMITE="PPSH",
            FEC_INI_TRAMITE=datetime.now(),
            IND_ESTATUS="01",
            IND_PRIORIDAD="A",
            OBS_OBSERVA="Caso urgente",
            ID_USUARIO_CREA="ADMIN"
        )
        db_session.add(tramite)
        db_session.commit()
        
        # 2. Registrar paso 1 (Recepción)
        paso1_data = {
            "NUM_ANNIO": 2025,
            "NUM_TRAMITE": 100,
            "NUM_PASO": 1,
            "NUM_REGISTRO": 1,
            "COD_TRAMITE": "PPSH",
            "COD_SECCION": "ATEN",
            "COD_AGENCIA": "0001",
            "ID_USUAR_RESP": "ATEN_USER",
            "OBS_OBSERVACION": "Solicitud recibida",
            "NUM_PASO_SGTE": 2,
            "IND_ESTATUS": "03",
            "ID_USUARIO_CREA": "ATEN_USER"
        }
        
        response = client.post("/api/v1/sim-ft/tramites/2025/100/pasos", json=paso1_data)
        assert response.status_code == 201
        
        # 3. Actualizar estado del trámite
        response = client.put(
            "/api/v1/sim-ft/tramites/2025/100/1",
            json={"IND_ESTATUS": "02", "OBS_OBSERVA": "En proceso de evaluación"}
        )
        assert response.status_code == 200
        
        # 4. Registrar paso 2 (Evaluación)
        paso2_data = {
            "NUM_ANNIO": 2025,
            "NUM_TRAMITE": 100,
            "NUM_PASO": 2,
            "NUM_REGISTRO": 1,
            "COD_TRAMITE": "PPSH",
            "COD_SECCION": "EVAL",
            "COD_AGENCIA": "0001",
            "ID_USUAR_RESP": "EVAL_USER",
            "OBS_OBSERVACION": "Documentos evaluados",
            "NUM_PASO_SGTE": 3,
            "IND_ESTATUS": "03",
            "ID_USUARIO_CREA": "EVAL_USER"
        }
        
        response = client.post("/api/v1/sim-ft/tramites/2025/100/pasos", json=paso2_data)
        assert response.status_code == 201
        
        # 5. Verificar historial completo
        response = client.get("/api/v1/sim-ft/tramites/2025/100/pasos")
        assert response.status_code == 200
        pasos = response.json()
        assert len(pasos) == 2
        
        # 6. Verificar estado final del trámite
        response = client.get("/api/v1/sim-ft/tramites/2025/100/1")
        assert response.status_code == 200
        tramite = response.json()
        assert tramite["IND_ESTATUS"] == "02"
        assert "evaluación" in tramite["OBS_OBSERVA"].lower()


# ==========================================
# TESTS DE ESTADÍSTICAS
# ==========================================

class TestSimFtEstadisticas:
    """Tests para endpoints de estadísticas"""
    
    def test_estadisticas_por_estado(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Obtener estadísticas por estado"""
        # Crear varios trámites con diferentes estados
        tramites = [
            SimFtTramiteE(
                NUM_ANNIO=2025, NUM_TRAMITE=i, NUM_REGISTRO=1,
                COD_TRAMITE="PPSH", FEC_INI_TRAMITE=datetime.now(),
                IND_ESTATUS="01" if i <= 3 else "02",
                IND_PRIORIDAD="N"
            )
            for i in range(1, 11)
        ]
        db_session.add_all(tramites)
        db_session.commit()
        
        response = client.get("/api/v1/sim-ft/estadisticas/tramites-por-estado")
        
        assert response.status_code == 200
        result = response.json()
        data = result["estadisticas"]
        assert len(data) > 0
        assert any(e["estado"] == "01" for e in data)
    
    def test_estadisticas_por_tipo(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Obtener estadísticas por tipo de trámite"""
        # Crear trámites de diferentes tipos
        tramites = [
            SimFtTramiteE(
                NUM_ANNIO=2025, NUM_TRAMITE=i, NUM_REGISTRO=1,
                COD_TRAMITE="PPSH" if i <= 5 else "VISA",
                FEC_INI_TRAMITE=datetime.now(),
                IND_ESTATUS="01", IND_PRIORIDAD="N"
            )
            for i in range(1, 11)
        ]
        db_session.add_all(tramites)
        db_session.commit()
        
        response = client.get("/api/v1/sim-ft/estadisticas/tramites-por-tipo")
        
        assert response.status_code == 200
        result = response.json()
        data = result["estadisticas"]
        assert len(data) > 0
        assert any(e["tipo_tramite"] == "PPSH" for e in data)
        assert any(e["tipo_tramite"] == "VISA" for e in data)
    
    def test_tiempo_promedio_procesamiento(self, client: TestClient, db_session: Session, setup_sim_ft_catalogos):
        """Test: Calcular tiempo promedio de procesamiento"""
        # Crear trámites con fechas de inicio y fin
        tramites = [
            SimFtTramiteE(
                NUM_ANNIO=2025, NUM_TRAMITE=i, NUM_REGISTRO=1,
                COD_TRAMITE="PPSH",
                FEC_INI_TRAMITE=datetime(2025, 1, 1),
                FEC_FIN_TRAMITE=datetime(2025, 1, 10),
                IND_ESTATUS="03", IND_PRIORIDAD="N"
            )
            for i in range(1, 6)
        ]
        db_session.add_all(tramites)
        db_session.commit()
        
        response = client.get("/api/v1/sim-ft/estadisticas/tiempo-promedio")
        
        assert response.status_code == 200
        data = response.json()
        assert "tiempo_promedio_dias" in data
        assert data["tiempo_promedio_dias"] > 0
        assert "tiempo_minimo_dias" in data
        assert "tiempo_maximo_dias" in data
        assert "total_tramites" in data
        assert data["total_tramites"] == 5


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
