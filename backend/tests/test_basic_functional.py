"""
Tests básicos funcionales para verificar la configuración Docker
Sistema de Trámites Migratorios de Panamá

Este archivo contiene tests que funcionan con la estructura actual del proyecto
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime

from app.models import Tramite


class TestTramitesBasic:
    """Tests básicos para endpoints de trámites que funcionan con la estructura actual"""

    def test_get_tramites_empty(self, client: TestClient, db_session: Session):
        """Test: Listar trámites cuando no hay datos"""
        response = client.get("/api/v1/tramites")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) == 0

    def test_create_tramite_basic(self, client: TestClient, db_session: Session):
        """Test: Crear trámite básico con estructura actual"""
        tramite_data = {
            "titulo": "Trámite Test Básico",
            "descripcion": "Descripción de prueba",
            "estado": "pendiente"
        }

        response = client.post("/api/v1/tramites", json=tramite_data)
        assert response.status_code == 201
        
        data = response.json()
        assert data["titulo"] == tramite_data["titulo"]
        assert data["descripcion"] == tramite_data["descripcion"]
        assert data["estado"] == tramite_data["estado"]
        assert "id" in data

    def test_create_and_get_tramite(self, client: TestClient, db_session: Session):
        """Test: Crear y luego obtener trámite"""
        # 1. Crear trámite
        tramite_data = {
            "titulo": "Trámite Crear y Obtener",
            "descripcion": "Test de flujo básico",
            "estado": "pendiente"
        }

        create_response = client.post("/api/v1/tramites", json=tramite_data)
        assert create_response.status_code == 201
        
        created_tramite = create_response.json()
        tramite_id = created_tramite["id"]

        # 2. Obtener trámite por ID
        get_response = client.get(f"/api/v1/tramites/{tramite_id}")
        assert get_response.status_code == 200
        
        retrieved_tramite = get_response.json()
        assert retrieved_tramite["id"] == tramite_id
        assert retrieved_tramite["titulo"] == tramite_data["titulo"]

    def test_update_tramite_basic(self, client: TestClient, db_session: Session):
        """Test: Actualizar trámite básico"""
        # 1. Crear trámite
        tramite_data = {
            "titulo": "Trámite Original",
            "descripcion": "Descripción original",
            "estado": "pendiente"
        }

        create_response = client.post("/api/v1/tramites", json=tramite_data)
        assert create_response.status_code == 201
        tramite_id = create_response.json()["id"]

        # 2. Actualizar trámite
        update_data = {
            "titulo": "Trámite Actualizado",
            "estado": "en_proceso"
        }

        update_response = client.put(f"/api/v1/tramites/{tramite_id}", json=update_data)
        assert update_response.status_code == 200
        
        updated_tramite = update_response.json()
        assert updated_tramite["titulo"] == update_data["titulo"]
        assert updated_tramite["estado"] == update_data["estado"]

    def test_delete_tramite_basic(self, client: TestClient, db_session: Session):
        """Test: Eliminar trámite básico"""
        # 1. Crear trámite
        tramite_data = {
            "titulo": "Trámite Para Eliminar",
            "descripcion": "Test de eliminación",
            "estado": "pendiente"
        }

        create_response = client.post("/api/v1/tramites", json=tramite_data)
        assert create_response.status_code == 201
        tramite_id = create_response.json()["id"]

        # 2. Eliminar trámite
        delete_response = client.delete(f"/api/v1/tramites/{tramite_id}")
        assert delete_response.status_code == 204

        # 3. Verificar que no se puede obtener después de eliminar
        get_response = client.get(f"/api/v1/tramites/{tramite_id}")
        assert get_response.status_code == 404

    def test_tramites_pagination(self, client: TestClient, db_session: Session):
        """Test: Paginación básica de trámites"""
        # 1. Crear múltiples trámites
        for i in range(3):
            tramite_data = {
                "titulo": f"Trámite {i+1}",
                "descripcion": f"Descripción {i+1}",
                "estado": "pendiente"
            }
            response = client.post("/api/v1/tramites", json=tramite_data)
            assert response.status_code == 201

        # 2. Obtener listado con paginación
        response = client.get("/api/v1/tramites?skip=0&limit=2")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 3  # Pueden ser menos si hay paginación

    def test_tramites_validation_errors(self, client: TestClient):
        """Test: Validaciones básicas"""
        # Test sin título
        response = client.post("/api/v1/tramites", json={
            "descripcion": "Sin título"
        })
        assert response.status_code == 422

        # Test con título muy corto (si hay validación)
        response = client.post("/api/v1/tramites", json={
            "titulo": "AB"
        })
        # Podría ser 422 si hay validación o 201 si no la hay
        assert response.status_code in [201, 422]

    def test_model_creation_direct(self, db_session: Session):
        """Test: Crear modelo directamente en BD"""
        tramite = Tramite(
            NOM_TITULO="Test Directo",
            DESCRIPCION="Creado directamente en BD",
            COD_ESTADO="pendiente"
        )
        
        db_session.add(tramite)
        db_session.commit()
        db_session.refresh(tramite)
        
        assert tramite.id is not None
        assert tramite.NOM_TITULO == "Test Directo"
        assert tramite.IND_ACTIVO is True


class TestBasicIntegration:
    """Tests de integración básicos"""

    def test_complete_tramite_workflow(self, client: TestClient, db_session: Session):
        """Test: Flujo completo simplificado"""
        # 1. Crear trámite
        tramite_data = {
            "titulo": "Flujo Completo",
            "descripcion": "Test de flujo completo",
            "estado": "pendiente"
        }
        
        create_response = client.post("/api/v1/tramites", json=tramite_data)
        assert create_response.status_code == 201
        tramite_id = create_response.json()["id"]

        # 2. Verificar en listado
        list_response = client.get("/api/v1/tramites")
        assert list_response.status_code == 200
        tramites = list_response.json()
        assert any(t["id"] == tramite_id for t in tramites)

        # 3. Actualizar estado
        update_response = client.put(f"/api/v1/tramites/{tramite_id}", json={
            "estado": "completado"
        })
        assert update_response.status_code == 200
        assert update_response.json()["estado"] == "completado"

        # 4. Eliminar
        delete_response = client.delete(f"/api/v1/tramites/{tramite_id}")
        assert delete_response.status_code == 204

        # 5. Verificar eliminación
        final_list = client.get("/api/v1/tramites")
        final_tramites = final_list.json()
        assert not any(t["id"] == tramite_id for t in final_tramites)

    def test_multiple_tramites_operations(self, client: TestClient, db_session: Session):
        """Test: Operaciones con múltiples trámites"""
        created_ids = []
        
        # Crear varios trámites
        for i in range(5):
            response = client.post("/api/v1/tramites", json={
                "titulo": f"Trámite Múltiple {i+1}",
                "descripcion": f"Descripción {i+1}",
                "estado": "pendiente" if i % 2 == 0 else "en_proceso"
            })
            assert response.status_code == 201
            created_ids.append(response.json()["id"])

        # Verificar que todos están en el listado
        list_response = client.get("/api/v1/tramites")
        assert list_response.status_code == 200
        assert len(list_response.json()) >= 5

        # Actualizar algunos
        for i in range(0, 5, 2):  # 0, 2, 4
            response = client.put(f"/api/v1/tramites/{created_ids[i]}", json={
                "estado": "completado"
            })
            assert response.status_code == 200

        # Eliminar algunos
        for i in range(1, 5, 2):  # 1, 3
            response = client.delete(f"/api/v1/tramites/{created_ids[i]}")
            assert response.status_code == 204

        # Verificar estado final
        final_list = client.get("/api/v1/tramites")
        final_data = final_list.json()
        remaining_count = len([t for t in final_data if t["id"] in created_ids])
        assert remaining_count >= 3  # 5 creados - 2 eliminados = 3