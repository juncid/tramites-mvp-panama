"""
Tests unitarios para endpoints de Trámites
Sistema de Trámites Migratorios de Panamá

Cubre:
- CRUD de trámites (GET, POST, PUT, DELETE)
- Validaciones de entrada
- Paginación y filtros
- Cache Redis
- Soft delete
- Manejo de errores
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import Tramite
from app.schemas import TramiteCreate, TramiteUpdate, TramiteResponse


class TestTramitesEndpoints:
    """Suite de tests para endpoints de trámites"""

    # ==========================================
    # TESTS GET /api/v1/tramites/ (Listar trámites)
    # ==========================================

    def test_get_tramites_success(self, client: TestClient, db_session: Session):
        """Test: Listar trámites exitosamente"""
        # Arrange: Crear trámites de prueba
        tramite1 = Tramite(
            id=1,
            NOM_TITULO="Trámite Test 1",
            DESCRIPCION="Descripción test 1",
            COD_ESTADO="PENDIENTE",
            created_at=datetime.now(),
            activo=True
        )
        tramite2 = Tramite(
            id=2,
            NOM_TITULO="Trámite Test 2", 
            DESCRIPCION="Descripción test 2",
            COD_ESTADO="COMPLETADO",
            created_at=datetime.now(),
            activo=True
        )
        db_session.add_all([tramite1, tramite2])
        db_session.commit()

        # Act: Hacer petición
        response = client.get("/api/v1/tramites/")

        # Assert: Verificar respuesta
        assert response.status_code == 200
        data = response.json()
        
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "size" in data
        assert "pages" in data
        
        assert data["total"] == 2
        assert len(data["items"]) == 2
        
        # Verificar estructura de trámites
        tramite_response = data["items"][0]
        assert "id" in tramite_response
        assert "titulo" in tramite_response
        assert "descripcion" in tramite_response
        assert "estado" in tramite_response
        assert "created_at" in tramite_response

    def test_get_tramites_with_pagination(self, client: TestClient, db_session: Session):
        """Test: Paginación de trámites"""
        # Arrange: Crear 15 trámites
        tramites = []
        for i in range(15):
            tramite = Tramite(
                titulo=f"Trámite {i+1}",
                descripcion=f"Descripción {i+1}",
                COD_ESTADO="PENDIENTE",
                created_at=datetime.now(),
                activo=True
            )
            tramites.append(tramite)
        
        db_session.add_all(tramites)
        db_session.commit()

        # Act: Hacer petición con paginación
        response = client.get("/api/v1/tramites/?page=2&size=5")

        # Assert: Verificar paginación
        assert response.status_code == 200
        data = response.json()
        
        assert data["total"] == 15
        assert data["page"] == 2
        assert data["size"] == 5
        assert data["pages"] == 3
        assert len(data["items"]) == 5

    def test_get_tramites_with_filters(self, client: TestClient, db_session: Session):
        """Test: Filtros en listado de trámites"""
        # Arrange: Crear trámites con diferentes estados
        tramite1 = Tramite(
            NOM_TITULO="Trámite Pendiente",
            DESCRIPCION="Descripción",
            COD_ESTADO="PENDIENTE",
            created_at=datetime.now(),
            activo=True
        )
        tramite2 = Tramite(
            NOM_TITULO="Trámite Completado",
            DESCRIPCION="Descripción",
            COD_ESTADO="COMPLETADO",
            created_at=datetime.now(),
            activo=True
        )
        db_session.add_all([tramite1, tramite2])
        db_session.commit()

        # Act: Filtrar por estado
        response = client.get("/api/v1/tramites/?estado=PENDIENTE")

        # Assert: Verificar filtro
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["estado"] == "PENDIENTE"

    def test_get_tramites_excludes_soft_deleted(self, client: TestClient, db_session: Session):
        """Test: No incluir trámites eliminados (soft delete)"""
        # Arrange: Crear trámite activo y eliminado
        tramite_activo = Tramite(
            NOM_TITULO="Trámite Activo",
            DESCRIPCION="Descripción",
            COD_ESTADO="PENDIENTE",
            created_at=datetime.now(),
            activo=True
        )
        tramite_eliminado = Tramite(
            NOM_TITULO="Trámite Eliminado",
            DESCRIPCION="Descripción",
            COD_ESTADO="PENDIENTE",
            created_at=datetime.now(),
            activo=False
        )
        db_session.add_all([tramite_activo, tramite_eliminado])
        db_session.commit()

        # Act: Listar trámites
        response = client.get("/api/v1/tramites/")

        # Assert: Solo debe aparecer el activo
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["titulo"] == "Trámite Activo"

    @patch('app.routes.get_redis')
    def test_get_tramites_with_cache_hit(self, mock_get_redis, client: TestClient):
        """Test: Cache hit en Redis"""
        # Arrange: Mock Redis con datos en cache
        mock_redis = Mock()
        mock_cached_data = '{"items": [{"id": 1, "titulo": "Cached"}], "total": 1}'
        mock_redis.get.return_value = mock_cached_data.encode()
        mock_get_redis.return_value = mock_redis

        # Act: Hacer petición
        response = client.get("/api/v1/tramites/")

        # Assert: Verificar cache hit
        assert response.status_code == 200
        mock_redis.get.assert_called_once()
        
        # Verificar que no se hizo query a BD (porque usó cache)
        data = response.json()
        assert "items" in data

    @patch('app.routes.get_redis')
    def test_get_tramites_cache_miss_and_set(self, mock_get_redis, client: TestClient, db_session: Session):
        """Test: Cache miss y set en Redis"""
        # Arrange: Mock Redis sin datos en cache
        mock_redis = Mock()
        mock_redis.get.return_value = None  # Cache miss
        mock_get_redis.return_value = mock_redis
        
        # Crear datos en BD
        tramite = Tramite(
            NOM_TITULO="Trámite Test",
            DESCRIPCION="Descripción",
            COD_ESTADO="PENDIENTE",
            created_at=datetime.now(),
            activo=True
        )
        db_session.add(tramite)
        db_session.commit()

        # Act: Hacer petición
        response = client.get("/api/v1/tramites/")

        # Assert: Verificar cache miss y set
        assert response.status_code == 200
        mock_redis.get.assert_called_once()
        mock_redis.setex.assert_called_once()

    # ==========================================
    # TESTS GET /api/v1/tramites/{tramite_id} (Obtener trámite)
    # ==========================================

    def test_get_tramite_by_id_success(self, client: TestClient, db_session: Session):
        """Test: Obtener trámite por ID exitosamente"""
        # Arrange: Crear trámite
        tramite = Tramite(
            id=1,
            NOM_TITULO="Trámite Test",
            DESCRIPCION="Descripción detallada",
            COD_ESTADO="PENDIENTE",
            created_at=datetime.now(),
            activo=True
        )
        db_session.add(tramite)
        db_session.commit()

        # Act: Hacer petición
        response = client.get("/api/v1/tramites/1")

        # Assert: Verificar respuesta
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == 1
        assert data["titulo"] == "Trámite Test"
        assert data["descripcion"] == "Descripción detallada"
        assert data["estado"] == "PENDIENTE"

    def test_get_tramite_by_id_not_found(self, client: TestClient):
        """Test: Trámite no encontrado"""
        # Act: Buscar trámite inexistente
        response = client.get("/api/v1/tramites/999")

        # Assert: Verificar error 404
        assert response.status_code == 404
        assert "Trámite no encontrado" in response.json()["detail"]

    def test_get_tramite_by_id_soft_deleted(self, client: TestClient, db_session: Session):
        """Test: Trámite eliminado (soft delete) no debe encontrarse"""
        # Arrange: Crear trámite eliminado
        tramite = Tramite(
            id=1,
            NOM_TITULO="Trámite Eliminado",
            DESCRIPCION="Descripción",
            COD_ESTADO="PENDIENTE",
            created_at=datetime.now(),
            activo=False  # Soft deleted
        )
        db_session.add(tramite)
        db_session.commit()

        # Act: Buscar trámite eliminado
        response = client.get("/api/v1/tramites/1")

        # Assert: Debe retornar 404
        assert response.status_code == 404

    @patch('app.routes.get_redis')
    def test_get_tramite_with_cache(self, mock_get_redis, client: TestClient):
        """Test: Cache en obtener trámite individual"""
        # Arrange: Mock Redis con datos
        mock_redis = Mock()
        mock_cached_data = '{"id": 1, "titulo": "Cached Tramite"}'
        mock_redis.get.return_value = mock_cached_data.encode()
        mock_get_redis.return_value = mock_redis

        # Act: Hacer petición
        response = client.get("/api/v1/tramites/1")

        # Assert: Verificar cache
        assert response.status_code == 200
        mock_redis.get.assert_called_once_with("tramite:1")

    # ==========================================
    # TESTS POST /api/v1/tramites/ (Crear trámite)
    # ==========================================

    def test_create_tramite_success(self, client: TestClient, db_session: Session):
        """Test: Crear trámite exitosamente"""
        # Arrange: Datos de trámite válidos
        tramite_data = {
            "titulo": "Nuevo Trámite",
            "descripcion": "Descripción del nuevo trámite",
            "estado": "PENDIENTE"
        }

        # Act: Crear trámite
        response = client.post("/api/v1/tramites/", json=tramite_data)

        # Assert: Verificar creación
        assert response.status_code == 201
        data = response.json()
        
        assert data["titulo"] == tramite_data["titulo"]
        assert data["descripcion"] == tramite_data["descripcion"]
        assert data["estado"] == tramite_data["estado"]
        assert "id" in data
        assert "created_at" in data
        
        # Verificar en BD
        tramite_db = db_session.query(Tramite).filter(Tramite.id == data["id"]).first()
        assert tramite_db is not None
        assert tramite_db.titulo == tramite_data["titulo"]
        assert tramite_db.activo is True

    def test_create_tramite_validation_errors(self, client: TestClient):
        """Test: Validaciones en creación de trámite"""
        # Test: Título requerido
        response = client.post("/api/v1/tramites/", json={
            "descripcion": "Sin título"
        })
        assert response.status_code == 422

        # Test: Título muy corto
        response = client.post("/api/v1/tramites/", json={
            "titulo": "AB",  # Muy corto
            "descripcion": "Descripción válida"
        })
        assert response.status_code == 422

        # Test: Estado inválido
        response = client.post("/api/v1/tramites/", json={
            "titulo": "Título válido",
            "descripcion": "Descripción válida",
            "estado": "ESTADO_INVALIDO"
        })
        assert response.status_code == 422

    @patch('app.routes.get_redis')
    def test_create_tramite_invalidates_cache(self, mock_get_redis, client: TestClient, db_session: Session):
        """Test: Creación invalida cache de listado"""
        # Arrange: Mock Redis
        mock_redis = Mock()
        mock_get_redis.return_value = mock_redis
        
        tramite_data = {
            "titulo": "Nuevo Trámite",
            "descripcion": "Descripción",
            "estado": "PENDIENTE"
        }

        # Act: Crear trámite
        response = client.post("/api/v1/tramites/", json=tramite_data)

        # Assert: Cache debe invalidarse
        assert response.status_code == 201
        mock_redis.delete.assert_called()  # Verificar que se eliminó cache

    # ==========================================
    # TESTS PUT /api/v1/tramites/{tramite_id} (Actualizar trámite)
    # ==========================================

    def test_update_tramite_success(self, client: TestClient, db_session: Session):
        """Test: Actualizar trámite exitosamente"""
        # Arrange: Crear trámite existente
        tramite = Tramite(
            id=1,
            NOM_TITULO="Trámite Original",
            DESCRIPCION="Descripción original",
            COD_ESTADO="PENDIENTE",
            created_at=datetime.now(),
            activo=True
        )
        db_session.add(tramite)
        db_session.commit()

        # Datos de actualización
        update_data = {
            "titulo": "Trámite Actualizado",
            "descripcion": "Descripción actualizada",
            "estado": "EN_PROCESO"
        }

        # Act: Actualizar trámite
        response = client.put("/api/v1/tramites/1", json=update_data)

        # Assert: Verificar actualización
        assert response.status_code == 200
        data = response.json()
        
        assert data["titulo"] == update_data["titulo"]
        assert data["descripcion"] == update_data["descripcion"]
        assert data["estado"] == update_data["estado"]
        
        # Verificar en BD
        tramite_db = db_session.query(Tramite).filter(Tramite.id == 1).first()
        assert tramite_db.titulo == update_data["titulo"]

    def test_update_tramite_not_found(self, client: TestClient):
        """Test: Actualizar trámite inexistente"""
        # Act: Intentar actualizar trámite que no existe
        response = client.put("/api/v1/tramites/999", json={
            "titulo": "Nuevo título"
        })

        # Assert: Verificar error 404
        assert response.status_code == 404

    def test_update_tramite_partial_update(self, client: TestClient, db_session: Session):
        """Test: Actualización parcial de trámite"""
        # Arrange: Crear trámite
        tramite = Tramite(
            id=1,
            NOM_TITULO="Título Original",
            DESCRIPCION="Descripción Original",
            COD_ESTADO="PENDIENTE",
            created_at=datetime.now(),
            activo=True
        )
        db_session.add(tramite)
        db_session.commit()

        # Act: Actualizar solo el título
        response = client.put("/api/v1/tramites/1", json={
            "titulo": "Solo Título Actualizado"
        })

        # Assert: Solo título debe cambiar
        assert response.status_code == 200
        data = response.json()
        
        assert data["titulo"] == "Solo Título Actualizado"
        assert data["descripcion"] == "Descripción Original"  # No cambió
        assert data["estado"] == "PENDIENTE"  # No cambió

    @patch('app.routes.get_redis')
    def test_update_tramite_invalidates_cache(self, mock_get_redis, client: TestClient, db_session: Session):
        """Test: Actualización invalida cache"""
        # Arrange
        mock_redis = Mock()
        mock_get_redis.return_value = mock_redis
        
        tramite = Tramite(
            id=1,
            NOM_TITULO="Título Original",
            DESCRIPCION="Descripción",
            COD_ESTADO="PENDIENTE",
            created_at=datetime.now(),
            activo=True
        )
        db_session.add(tramite)
        db_session.commit()

        # Act: Actualizar
        response = client.put("/api/v1/tramites/1", json={"titulo": "Nuevo Título"})

        # Assert: Cache debe invalidarse
        assert response.status_code == 200
        mock_redis.delete.assert_called()

    # ==========================================
    # TESTS DELETE /api/v1/tramites/{tramite_id} (Eliminar trámite)
    # ==========================================

    def test_delete_tramite_success(self, client: TestClient, db_session: Session):
        """Test: Eliminar trámite exitosamente (soft delete)"""
        # Arrange: Crear trámite
        tramite = Tramite(
            id=1,
            NOM_TITULO="Trámite a Eliminar",
            DESCRIPCION="Descripción",
            COD_ESTADO="PENDIENTE",
            created_at=datetime.now(),
            activo=True
        )
        db_session.add(tramite)
        db_session.commit()

        # Act: Eliminar trámite
        response = client.delete("/api/v1/tramites/1")

        # Assert: Verificar eliminación soft
        assert response.status_code == 204
        
        # Verificar que está marcado como inactivo (soft delete)
        tramite_db = db_session.query(Tramite).filter(Tramite.id == 1).first()
        assert tramite_db is not None  # Sigue existiendo en BD
        assert tramite_db.activo is False  # Pero marcado como inactivo

    def test_delete_tramite_not_found(self, client: TestClient):
        """Test: Eliminar trámite inexistente"""
        # Act: Intentar eliminar trámite que no existe
        response = client.delete("/api/v1/tramites/999")

        # Assert: Verificar error 404
        assert response.status_code == 404

    def test_delete_tramite_already_deleted(self, client: TestClient, db_session: Session):
        """Test: Eliminar trámite ya eliminado"""
        # Arrange: Crear trámite ya eliminado
        tramite = Tramite(
            id=1,
            NOM_TITULO="Trámite Ya Eliminado",
            DESCRIPCION="Descripción",
            COD_ESTADO="PENDIENTE",
            created_at=datetime.now(),
            activo=False  # Ya eliminado
        )
        db_session.add(tramite)
        db_session.commit()

        # Act: Intentar eliminar nuevamente
        response = client.delete("/api/v1/tramites/1")

        # Assert: Debe retornar 404
        assert response.status_code == 404

    @patch('app.routes.get_redis')
    def test_delete_tramite_invalidates_cache(self, mock_get_redis, client: TestClient, db_session: Session):
        """Test: Eliminación invalida cache"""
        # Arrange
        mock_redis = Mock()
        mock_get_redis.return_value = mock_redis
        
        tramite = Tramite(
            id=1,
            NOM_TITULO="Trámite",
            DESCRIPCION="Descripción",
            COD_ESTADO="PENDIENTE",
            created_at=datetime.now(),
            activo=True
        )
        db_session.add(tramite)
        db_session.commit()

        # Act: Eliminar
        response = client.delete("/api/v1/tramites/1")

        # Assert: Cache debe invalidarse
        assert response.status_code == 204
        mock_redis.delete.assert_called()

    # ==========================================
    # TESTS DE INTEGRACIÓN Y EDGE CASES
    # ==========================================

    def test_tramites_workflow_integration(self, client: TestClient, db_session: Session):
        """Test de integración: Flujo completo CRUD"""
        # 1. Crear trámite
        tramite_data = {
            "titulo": "Trámite Flujo Completo",
            "descripcion": "Descripción inicial",
            "estado": "PENDIENTE"
        }
        
        response = client.post("/api/v1/tramites/", json=tramite_data)
        assert response.status_code == 201
        tramite_id = response.json()["id"]

        # 2. Obtener trámite
        response = client.get(f"/api/v1/tramites/{tramite_id}")
        assert response.status_code == 200
        assert response.json()["titulo"] == tramite_data["titulo"]

        # 3. Actualizar trámite
        update_data = {"estado": "EN_PROCESO"}
        response = client.put(f"/api/v1/tramites/{tramite_id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["estado"] == "EN_PROCESO"

        # 4. Verificar en listado
        response = client.get("/api/v1/tramites/")
        assert response.status_code == 200
        tramites = response.json()["items"]
        assert any(t["id"] == tramite_id for t in tramites)

        # 5. Eliminar trámite
        response = client.delete(f"/api/v1/tramites/{tramite_id}")
        assert response.status_code == 204

        # 6. Verificar que no aparece en listado
        response = client.get("/api/v1/tramites/")
        assert response.status_code == 200
        tramites = response.json()["items"]
        assert not any(t["id"] == tramite_id for t in tramites)

    def test_invalid_pagination_parameters(self, client: TestClient):
        """Test: Parámetros de paginación inválidos"""
        # Page negativo
        response = client.get("/api/v1/tramites/?page=-1")
        assert response.status_code == 422

        # Size muy grande
        response = client.get("/api/v1/tramites/?size=1000")
        assert response.status_code == 422

        # Size cero
        response = client.get("/api/v1/tramites/?size=0")
        assert response.status_code == 422

    def test_database_error_handling(self, client: TestClient, db_session: Session):
        """Test: Manejo de errores de base de datos"""
        # Simular error de BD cerrando la conexión
        db_session.close()
        
        response = client.get("/api/v1/tramites/")
        # Debe manejar gracefully el error de BD
        assert response.status_code in [500, 503]  # Error de servidor o servicio no disponible

    @patch('app.routes.get_redis')
    def test_redis_error_fallback(self, mock_get_redis, client: TestClient, db_session: Session):
        """Test: Fallback cuando Redis falla"""
        # Arrange: Mock Redis que falla
        mock_redis = Mock()
        mock_redis.get.side_effect = Exception("Redis error")
        mock_get_redis.return_value = mock_redis
        
        # Crear datos en BD
        tramite = Tramite(
            NOM_TITULO="Trámite Test",
            DESCRIPCION="Descripción",
            COD_ESTADO="PENDIENTE",
            created_at=datetime.now(),
            activo=True
        )
        db_session.add(tramite)
        db_session.commit()

        # Act: Hacer petición (Redis falla, debe usar BD)
        response = client.get("/api/v1/tramites/")

        # Assert: Debe funcionar sin Redis
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1