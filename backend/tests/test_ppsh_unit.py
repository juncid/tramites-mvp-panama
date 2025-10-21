"""
Tests unitarios para endpoints PPSH
Sistema de Trámites Migratorios de Panamá - Proceso de Protección de Personas en Situación Humanitaria

Cubre:
- Gestión de solicitudes PPSH
- Administración de solicitantes
- Manejo de documentos
- Entrevistas y evaluaciones
- Estados y transiciones
- Comentarios y observaciones
- Catalogos y configuración
- Validaciones y permisos
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, date
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import models_ppsh
from app.schemas import (
    SolicitudCreate, SolicitanteCreate,
    DocumentoCreate, EntrevistaCreate
)


class TestPPSHSolicitudesEndpoints:
    """Suite de tests para endpoints de solicitudes PPSH"""

    # ==========================================
    # TESTS GET /api/v1/ppsh/solicitudes/ (Listar solicitudes)
    # ==========================================

    def test_get_solicitudes_success_admin(self, client: TestClient, db_session: Session, admin_user):
        """Test: Admin puede ver todas las solicitudes"""
        # Arrange: Crear solicitudes en diferentes agencias
        solicitud1 = PPSHSolicitud(
            num_expediente="PPSH-2025-001",
            tipo_solicitud="INDIVIDUAL",
            cod_causa_humanitaria=1,
            descripcion_caso="Caso test 1",
            cod_agencia="AGE01",
            cod_seccion="SEC01",
            estado_actual="RECIBIDO"
        )
        solicitud2 = PPSHSolicitud(
            num_expediente="PPSH-2025-002",
            tipo_solicitud="FAMILIAR",
            cod_causa_humanitaria=2,
            descripcion_caso="Caso test 2",
            cod_agencia="AGE02",
            cod_seccion="SEC02",
            estado_actual="RECIBIDO"
        )
        db_session.add_all([solicitud1, solicitud2])
        db_session.commit()

        # Act: Hacer petición como admin
        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            response = client.get("/api/v1/ppsh/solicitudes/")

        # Assert: Admin ve todas las solicitudes
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert len(data["items"]) == 2

    def test_get_solicitudes_filtered_by_agencia(self, client: TestClient, db_session: Session, analista_user):
        """Test: Usuario no admin solo ve solicitudes de su agencia"""
        # Arrange: Crear solicitudes en diferentes agencias
        solicitud_misma_agencia = PPSHSolicitud(
            num_expediente="PPSH-2025-001",
            tipo_solicitud="INDIVIDUAL",
            cod_causa_humanitaria=1,
            descripcion_caso="Mismo agencia",
            cod_agencia="AGE01",  # Misma agencia que analista_user
            cod_seccion="SEC01",
            estado_actual="RECIBIDO"
        )
        solicitud_otra_agencia = PPSHSolicitud(
            num_expediente="PPSH-2025-002",
            tipo_solicitud="INDIVIDUAL",
            cod_causa_humanitaria=1,
            descripcion_caso="Otra agencia",
            cod_agencia="AGE99",  # Diferente agencia
            cod_seccion="SEC99",
            estado_actual="RECIBIDO"
        )
        db_session.add_all([solicitud_misma_agencia, solicitud_otra_agencia])
        db_session.commit()

        # Act: Hacer petición como analista
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.get("/api/v1/ppsh/solicitudes/")

        # Assert: Solo ve solicitudes de su agencia
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["items"]) == 1
        assert data["items"][0]["cod_agencia"] == "AGE01"

    def test_get_solicitudes_with_filters(self, client: TestClient, db_session: Session, admin_user):
        """Test: Filtros en listado de solicitudes"""
        # Arrange: Crear solicitudes con diferentes estados
        solicitud1 = PPSHSolicitud(
            num_expediente="PPSH-2025-001",
            tipo_solicitud="INDIVIDUAL",
            estado_actual="RECIBIDO",
            cod_causa_humanitaria=1,
            descripcion_caso="Caso 1",
            cod_agencia="AGE01",        )
        solicitud2 = PPSHSolicitud(
            num_expediente="PPSH-2025-002",
            tipo_solicitud="FAMILIAR",
            estado_actual="RECIBIDO",
            cod_causa_humanitaria=2,
            descripcion_caso="Caso 2",
            cod_agencia="AGE01",        )
        db_session.add_all([solicitud1, solicitud2])
        db_session.commit()

        # Act: Filtrar por estado
        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            response = client.get("/api/v1/ppsh/solicitudes/?estado=RECIBIDA")

        # Assert: Solo solicitudes con ese estado
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["estado_actual"] == "RECIBIDA"

    def test_get_solicitudes_permission_denied(self, client: TestClient, readonly_user):
        """Test: Usuario sin permisos no puede acceder"""
        # Act: Intentar acceso sin permisos
        with patch('app.routes_ppsh.get_current_user', return_value=readonly_user):
            response = client.get("/api/v1/ppsh/solicitudes/")

        # Assert: Acceso denegado
        assert response.status_code == 403

    # ==========================================
    # TESTS POST /api/v1/ppsh/solicitudes/ (Crear solicitud)
    # ==========================================

    def test_create_solicitud_success(self, client: TestClient, db_session: Session, analista_user, setup_ppsh_catalogos):
        """Test: Crear solicitud PPSH exitosamente"""
        # Arrange: Datos de solicitud válidos
        solicitud_data = {
            "tipo_solicitud": "INDIVIDUAL",
            "cod_causa_humanitaria": 1,
            "descripcion_caso": "Caso de prueba para test unitario",
            "prioridad": "NORMAL",
            "observaciones_generales": "Observaciones de test",
            "solicitantes": [
                {
                    "es_titular": True,
                    "tipo_documento": "PASAPORTE",
                    "num_documento": "AB123456",
                    "pais_emisor": "VEN",
                    "primer_nombre": "Juan",
                    "primer_apellido": "Pérez",
                    "fecha_nacimiento": "1990-01-15",
                    "cod_sexo": "M",
                    "cod_nacionalidad": "VEN",
                    "email": "juan.perez@test.com",
                    "telefono": "+507-6000-0000"
                }
            ]
        }

        # Act: Crear solicitud
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.post("/api/v1/ppsh/solicitudes/", json=solicitud_data)

        # Assert: Verificar creación
        assert response.status_code == 201
        data = response.json()
        
        assert data["tipo_solicitud"] == "INDIVIDUAL"
        assert data["descripcion_caso"] == solicitud_data["descripcion_caso"]
        assert data["estado_actual"] == "RECIBIDO"
        assert data["cod_agencia"] == analista_user["agencia"]
        assert data["cod_seccion"] == analista_user["seccion"]
        assert "num_expediente" in data
        assert data["num_expediente"].startswith("PPSH-")
        
        # Verificar solicitante creado
        assert len(data["solicitantes"]) == 1
        solicitante = data["solicitantes"][0]
        assert solicitante["primer_nombre"] == "Juan"
        assert solicitante["es_titular"] is True

    def test_create_solicitud_validation_errors(self, client: TestClient, analista_user):
        """Test: Validaciones en creación de solicitud"""
        # Test: Tipo solicitud requerido
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.post("/api/v1/ppsh/solicitudes/", json={
                "descripcion_caso": "Sin tipo"
            })
        assert response.status_code == 422

        # Test: Solicitante titular requerido
        solicitud_sin_titular = {
            "tipo_solicitud": "INDIVIDUAL",
            "cod_causa_humanitaria": 1,
            "descripcion_caso": "Test",
            "solicitantes": [
                {
                    "es_titular": False,  # No hay titular
                    "primer_nombre": "Juan",
                    "primer_apellido": "Pérez"
                }
            ]
        }
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.post("/api/v1/ppsh/solicitudes/", json=solicitud_sin_titular)
        assert response.status_code == 422

    def test_create_solicitud_generates_unique_number(self, client: TestClient, db_session: Session, analista_user):
        """Test: Se genera número único de solicitud"""
        # Arrange: Crear solicitud existente
        solicitud_existente = PPSHSolicitud(
            num_expediente="PPSH-2025-001",
            tipo_solicitud="INDIVIDUAL",
            cod_causa_humanitaria=1,
            descripcion_caso="Existente",
            cod_agencia="AGE01",
            estado_actual="RECIBIDO",        )
        db_session.add(solicitud_existente)
        db_session.commit()

        solicitud_data = {
            "tipo_solicitud": "INDIVIDUAL",
            "cod_causa_humanitaria": 1,
            "descripcion_caso": "Nueva solicitud",
            "solicitantes": [
                {
                    "es_titular": True,
                    "primer_nombre": "María",
                    "primer_apellido": "González"
                }
            ]
        }

        # Act: Crear nueva solicitud
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.post("/api/v1/ppsh/solicitudes/", json=solicitud_data)

        # Assert: Número debe ser diferente
        assert response.status_code == 201
        data = response.json()
        assert data["num_expediente"] != "PPSH-2025-001"
        assert data["num_expediente"].startswith("PPSH-2025-")

    # ==========================================
    # TESTS GET /api/v1/ppsh/solicitudes/{solicitud_id} (Obtener solicitud)
    # ==========================================

    def test_get_solicitud_by_id_success(self, client: TestClient, db_session: Session, analista_user):
        """Test: Obtener solicitud por ID exitosamente"""
        # Arrange: Crear solicitud
        solicitud = PPSHSolicitud(            num_expediente="PPSH-2025-001",
            tipo_solicitud="INDIVIDUAL",
            cod_causa_humanitaria=1,
            descripcion_caso="Caso detallado",
            cod_agencia="AGE01",
            cod_seccion="SEC01",
            estado_actual="RECIBIDO",        )
        db_session.add(solicitud)
        db_session.commit()

        # Act: Obtener solicitud
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.get("/api/v1/ppsh/solicitudes/1")

        # Assert: Verificar respuesta
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1
        assert data["num_expediente"] == "PPSH-2025-001"
        assert data["descripcion_caso"] == "Caso detallado"

    def test_get_solicitud_not_found(self, client: TestClient, analista_user):
        """Test: Solicitud no encontrada"""
        # Act: Buscar solicitud inexistente
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.get("/api/v1/ppsh/solicitudes/999")

        # Assert: Error 404
        assert response.status_code == 404

    def test_get_solicitud_different_agencia_forbidden(self, client: TestClient, db_session: Session, analista_user):
        """Test: No puede ver solicitud de otra agencia"""
        # Arrange: Crear solicitud de otra agencia
        solicitud = PPSHSolicitud(            num_expediente="PPSH-2025-001",
            tipo_solicitud="INDIVIDUAL",
            cod_causa_humanitaria=1,
            descripcion_caso="Otra agencia",
            cod_agencia="AGE99",  # Diferente a analista_user
            estado_actual="RECIBIDO",        )
        db_session.add(solicitud)
        db_session.commit()

        # Act: Intentar obtener solicitud
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.get("/api/v1/ppsh/solicitudes/1")

        # Assert: Acceso denegado
        assert response.status_code == 403

    # ==========================================
    # TESTS PUT /api/v1/ppsh/solicitudes/{solicitud_id} (Actualizar solicitud)
    # ==========================================

    def test_update_solicitud_success(self, client: TestClient, db_session: Session, analista_user):
        """Test: Actualizar solicitud exitosamente"""
        # Arrange: Crear solicitud
        solicitud = PPSHSolicitud(            num_expediente="PPSH-2025-001",
            tipo_solicitud="INDIVIDUAL",
            cod_causa_humanitaria=1,
            descripcion_caso="Caso original",
            cod_agencia="AGE01",
            estado_actual="RECIBIDO",        )
        db_session.add(solicitud)
        db_session.commit()

        # Datos de actualización
        update_data = {
            "descripcion_caso": "Caso actualizado con más detalles",
            "prioridad": "ALTA",
            "observaciones_generales": "Actualización de prueba"
        }

        # Act: Actualizar solicitud
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.put("/api/v1/ppsh/solicitudes/1", json=update_data)

        # Assert: Verificar actualización
        assert response.status_code == 200
        data = response.json()
        assert data["descripcion_caso"] == update_data["descripcion_caso"]
        assert data["prioridad"] == "ALTA"

    def test_update_solicitud_state_transition(self, client: TestClient, db_session: Session, analista_user):
        """Test: Transición de estado de solicitud"""
        # Arrange: Crear solicitud en estado RECIBIDA
        solicitud = PPSHSolicitud(            num_expediente="PPSH-2025-001",
            tipo_solicitud="INDIVIDUAL",
            cod_causa_humanitaria=1,
            descripcion_caso="Caso",
            cod_agencia="AGE01",
            estado_actual="RECIBIDO",        )
        db_session.add(solicitud)
        db_session.commit()

        # Act: Cambiar estado a EN_REVISION
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.put("/api/v1/ppsh/solicitudes/1/estado", json={
                "nuevo_estado": "EN_REVISION",
                "observaciones": "Iniciando revisión de documentos"
            })

        # Assert: Estado cambiado
        assert response.status_code == 200
        data = response.json()
        assert data["estado_actual"] == "EN_REVISION"


class TestPPSHSolicitantesEndpoints:
    """Suite de tests para endpoints de solicitantes PPSH"""

    def test_get_solicitantes_by_solicitud(self, client: TestClient, db_session: Session, analista_user):
        """Test: Obtener solicitantes de una solicitud"""
        # Arrange: Crear solicitud con solicitantes
        solicitud = PPSHSolicitud(            num_expediente="PPSH-2025-001",
            tipo_solicitud="FAMILIAR",
            cod_causa_humanitaria=1,
            descripcion_caso="Familia",
            cod_agencia="AGE01",
            estado_actual="RECIBIDO",        )
        
        solicitante1 = PPSHSolicitante(
            solicitud_id=1,
            es_titular=True,
            tipo_documento="PASAPORTE",
            num_documento="AB123456",
            primer_nombre="Juan",
            primer_apellido="Pérez",
            fecha_nacimiento=date(1980, 1, 1),
            cod_sexo="M",
            cod_nacionalidad="VEN"
        )
        
        solicitante2 = PPSHSolicitante(
            solicitud_id=1,
            es_titular=False,
            tipo_documento="CEDULA",
            num_documento="CD789012",
            primer_nombre="María",
            primer_apellido="Pérez",
            fecha_nacimiento=date(1985, 5, 15),
            cod_sexo="F",
            cod_nacionalidad="VEN"
        )
        
        db_session.add_all([solicitud, solicitante1, solicitante2])
        db_session.commit()

        # Act: Obtener solicitantes
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.get("/api/v1/ppsh/solicitudes/1/solicitantes")

        # Assert: Verificar solicitantes
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        
        # Verificar titular
        titular = next(s for s in data if s["es_titular"])
        assert titular["primer_nombre"] == "Juan"
        assert titular["num_documento"] == "AB123456"

    def test_add_solicitante_to_solicitud(self, client: TestClient, db_session: Session, analista_user):
        """Test: Agregar solicitante a solicitud existente"""
        # Arrange: Crear solicitud
        solicitud = PPSHSolicitud(            num_expediente="PPSH-2025-001",
            tipo_solicitud="FAMILIAR",
            cod_causa_humanitaria=1,
            descripcion_caso="Familia",
            cod_agencia="AGE01",
            estado_actual="RECIBIDO",        )
        db_session.add(solicitud)
        db_session.commit()

        # Datos del nuevo solicitante
        solicitante_data = {
            "es_titular": False,
            "tipo_documento": "CEDULA",
            "num_documento": "CD789012",
            "primer_nombre": "Ana",
            "primer_apellido": "Pérez",
            "fecha_nacimiento": "2000-03-10",
            "cod_sexo": "F",
            "cod_nacionalidad": "VEN",
            "email": "ana.perez@test.com"
        }

        # Act: Agregar solicitante
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.post("/api/v1/ppsh/solicitudes/1/solicitantes", json=solicitante_data)

        # Assert: Verificar creación
        assert response.status_code == 201
        data = response.json()
        assert data["primer_nombre"] == "Ana"
        assert data["es_titular"] is False


class TestPPSHDocumentosEndpoints:
    """Suite de tests para endpoints de documentos PPSH"""

    def test_upload_documento_success(self, client: TestClient, db_session: Session, analista_user, sample_pdf_file):
        """Test: Subir documento exitosamente"""
        # Arrange: Crear solicitud
        solicitud = PPSHSolicitud(            num_expediente="PPSH-2025-001",
            tipo_solicitud="INDIVIDUAL",
            cod_causa_humanitaria=1,
            descripcion_caso="Caso",
            cod_agencia="AGE01",
            estado_actual="RECIBIDO",        )
        db_session.add(solicitud)
        db_session.commit()

        # Mock file upload
        files = {
            "archivo": (
                sample_pdf_file["filename"],
                sample_pdf_file["content"],
                sample_pdf_file["content_type"]
            )
        }
        data = {
            "cod_tipo_documento": "1",
            "observaciones": "Documento de identidad"
        }

        # Act: Subir documento
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.post(
                "/api/v1/ppsh/solicitudes/1/documentos",
                files=files,
                data=data
            )

        # Assert: Verificar subida
        assert response.status_code == 201
        response_data = response.json()
        assert response_data["nombre_archivo"] == sample_pdf_file["filename"]
        assert response_data["extension"] == "pdf"
        assert response_data["observaciones"] == "Documento de identidad"

    def test_get_documentos_by_solicitud(self, client: TestClient, db_session: Session, analista_user):
        """Test: Obtener documentos de una solicitud"""
        # Arrange: Crear solicitud con documentos
        solicitud = PPSHSolicitud(            num_expediente="PPSH-2025-001",
            tipo_solicitud="INDIVIDUAL",
            cod_agencia="AGE01",
            estado_actual="RECIBIDO",        )
        
        documento = PPSHDocumento(
            solicitud_id=1,
            cod_tipo_documento=1,
            nombre_archivo="pasaporte.pdf",
            extension="pdf",
            ruta_archivo="/uploads/1/pasaporte.pdf",
            observaciones="Pasaporte venezolano",
            fecha_subida=datetime.now()
        )
        
        db_session.add_all([solicitud, documento])
        db_session.commit()

        # Act: Obtener documentos
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.get("/api/v1/ppsh/solicitudes/1/documentos")

        # Assert: Verificar documentos
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["nombre_archivo"] == "pasaporte.pdf"
        assert data[0]["observaciones"] == "Pasaporte venezolano"

    def test_delete_documento(self, client: TestClient, db_session: Session, analista_user):
        """Test: Eliminar documento"""
        # Arrange: Crear documento
        solicitud = PPSHSolicitud(            cod_agencia="AGE01",
            estado_actual="RECIBIDO",        )
        
        documento = PPSHDocumento(            solicitud_id=1,
            cod_tipo_documento=1,
            nombre_archivo="documento.pdf",
            ruta_archivo="/uploads/1/documento.pdf",
            fecha_subida=datetime.now()
        )
        
        db_session.add_all([solicitud, documento])
        db_session.commit()

        # Act: Eliminar documento
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.delete("/api/v1/ppsh/documentos/1")

        # Assert: Verificar eliminación
        assert response.status_code == 204


class TestPPSHEntrevistasEndpoints:
    """Suite de tests para endpoints de entrevistas PPSH"""

    def test_create_entrevista_success(self, client: TestClient, db_session: Session, analista_user):
        """Test: Crear entrevista exitosamente"""
        # Arrange: Crear solicitud
        solicitud = PPSHSolicitud(            num_expediente="PPSH-2025-001",
            cod_agencia="AGE01",
            estado_actual="RECIBIDO",        )
        db_session.add(solicitud)
        db_session.commit()

        entrevista_data = {
            "fecha_programada": "2025-10-20T10:00:00",
            "tipo_entrevista": "INICIAL",
            "modalidad": "PRESENCIAL",
            "observaciones": "Primera entrevista del proceso"
        }

        # Act: Crear entrevista
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.post("/api/v1/ppsh/solicitudes/1/entrevistas", json=entrevista_data)

        # Assert: Verificar creación
        assert response.status_code == 201
        data = response.json()
        assert data["tipo_entrevista"] == "INICIAL"
        assert data["modalidad"] == "PRESENCIAL"
        assert data["estado"] == "PROGRAMADA"

    def test_get_entrevistas_by_solicitud(self, client: TestClient, db_session: Session, analista_user):
        """Test: Obtener entrevistas de una solicitud"""
        # Arrange: Crear solicitud con entrevistas
        solicitud = PPSHSolicitud(            cod_agencia="AGE01",
            estado_actual="RECIBIDO",        )
        
        entrevista = PPSHEntrevista(
            solicitud_id=1,
            fecha_programada=datetime(2025, 10, 20, 10, 0),
            tipo_entrevista="INICIAL",
            modalidad="PRESENCIAL",
            estado="PROGRAMADA",        )
        
        db_session.add_all([solicitud, entrevista])
        db_session.commit()

        # Act: Obtener entrevistas
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.get("/api/v1/ppsh/solicitudes/1/entrevistas")

        # Assert: Verificar entrevistas
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["tipo_entrevista"] == "INICIAL"
        assert data[0]["estado"] == "PROGRAMADA"

    def test_update_entrevista_resultado(self, client: TestClient, db_session: Session, analista_user):
        """Test: Actualizar resultado de entrevista"""
        # Arrange: Crear entrevista realizada
        solicitud = PPSHSolicitud(            cod_agencia="AGE01",
            estado_actual="RECIBIDO",        )
        
        entrevista = PPSHEntrevista(            solicitud_id=1,
            fecha_programada=datetime(2025, 10, 15, 10, 0),
            tipo_entrevista="INICIAL",
            estado="REALIZADA",        )
        
        db_session.add_all([solicitud, entrevista])
        db_session.commit()

        resultado_data = {
            "resultado": "FAVORABLE",
            "observaciones_resultado": "Entrevista satisfactoria, documentación completa",
            "recomendaciones": "Proceder con siguiente fase"
        }

        # Act: Actualizar resultado
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.put("/api/v1/ppsh/entrevistas/1/resultado", json=resultado_data)

        # Assert: Verificar actualización
        assert response.status_code == 200
        data = response.json()
        assert data["resultado"] == "FAVORABLE"
        assert data["observaciones_resultado"] == resultado_data["observaciones_resultado"]


class TestPPSHComentariosEndpoints:
    """Suite de tests para endpoints de comentarios PPSH"""

    def test_add_comentario_success(self, client: TestClient, db_session: Session, analista_user):
        """Test: Agregar comentario exitosamente"""
        # Arrange: Crear solicitud
        solicitud = PPSHSolicitud(            cod_agencia="AGE01",
            estado_actual="RECIBIDO",        )
        db_session.add(solicitud)
        db_session.commit()

        comentario_data = {
            "contenido": "Comentario de seguimiento del caso",
            "es_interno": True,
            "tipo_comentario": "SEGUIMIENTO"
        }

        # Act: Agregar comentario
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.post("/api/v1/ppsh/solicitudes/1/comentarios", json=comentario_data)

        # Assert: Verificar creación
        assert response.status_code == 201
        data = response.json()
        assert data["contenido"] == comentario_data["contenido"]
        assert data["es_interno"] is True
        assert data["usuario_creacion"] == analista_user["user_id"]

    def test_get_comentarios_by_solicitud(self, client: TestClient, db_session: Session, analista_user):
        """Test: Obtener comentarios de una solicitud"""
        # Arrange: Crear solicitud con comentarios
        solicitud = PPSHSolicitud(            cod_agencia="AGE01",
            estado_actual="RECIBIDO",        )
        
        comentario = PPSHComentario(
            solicitud_id=1,
            contenido="Comentario de prueba",
            es_interno=True,
            tipo_comentario="SEGUIMIENTO",
            usuario_creacion="ANA001",        )
        
        db_session.add_all([solicitud, comentario])
        db_session.commit()

        # Act: Obtener comentarios
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.get("/api/v1/ppsh/solicitudes/1/comentarios")

        # Assert: Verificar comentarios
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["contenido"] == "Comentario de prueba"
        assert data[0]["usuario_creacion"] == "ANA001"


class TestPPSHCatalogosEndpoints:
    """Suite de tests para endpoints de catálogos PPSH"""

    def test_get_tipos_documento(self, client: TestClient, admin_user):
        """Test: Obtener tipos de documento"""
        # Act: Obtener catálogo
        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            response = client.get("/api/v1/ppsh/catalogos/tipos-documento")

        # Assert: Verificar catálogo
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_causas_humanitarias(self, client: TestClient, admin_user):
        """Test: Obtener causas humanitarias"""
        # Act: Obtener catálogo
        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            response = client.get("/api/v1/ppsh/catalogos/causas-humanitarias")

        # Assert: Verificar catálogo
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_paises(self, client: TestClient, admin_user):
        """Test: Obtener países"""
        # Act: Obtener catálogo
        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            response = client.get("/api/v1/ppsh/catalogos/paises")

        # Assert: Verificar catálogo
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestPPSHEstadisticasEndpoints:
    """Suite de tests para endpoints de estadísticas PPSH"""

    def test_get_dashboard_stats_admin(self, client: TestClient, db_session: Session, admin_user):
        """Test: Estadísticas de dashboard para admin"""
        # Arrange: Crear datos de prueba
        solicitudes = [
            PPSHSolicitud(
                num_expediente=f"PPSH-2025-{i:03d}",
                tipo_solicitud="INDIVIDUAL",
                estado_actual="RECIBIDO" if i % 2 == 0 else "APROBADA",
                cod_agencia="AGE01",            )
            for i in range(1, 6)  # 5 solicitudes
        ]
        db_session.add_all(solicitudes)
        db_session.commit()

        # Act: Obtener estadísticas
        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            response = client.get("/api/v1/ppsh/estadisticas/dashboard")

        # Assert: Verificar estadísticas
        assert response.status_code == 200
        data = response.json()
        
        assert "total_solicitudes" in data
        assert "por_estado" in data
        assert "por_agencia" in data
        assert data["total_solicitudes"] == 5

    def test_get_dashboard_stats_filtered_by_agencia(self, client: TestClient, db_session: Session, analista_user):
        """Test: Estadísticas filtradas por agencia para no admin"""
        # Arrange: Crear solicitudes en diferentes agencias
        solicitudes = [
            PPSHSolicitud(
                num_expediente="PPSH-2025-001",
                cod_agencia="AGE01",  # Misma agencia que analista
                estado_actual="RECIBIDO",            ),
            PPSHSolicitud(
                num_expediente="PPSH-2025-002",
                cod_agencia="AGE02",  # Diferente agencia
                estado_actual="RECIBIDO",            )
        ]
        db_session.add_all(solicitudes)
        db_session.commit()

        # Act: Obtener estadísticas
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            response = client.get("/api/v1/ppsh/estadisticas/dashboard")

        # Assert: Solo debe ver estadísticas de su agencia
        assert response.status_code == 200
        data = response.json()
        assert data["total_solicitudes"] == 1  # Solo AGE01