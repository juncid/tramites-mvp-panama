"""
Tests de integración para el Sistema de Trámites Migratorios de Panamá
Pruebas end-to-end que validan flujos completos de trabajo

Cubre:
- Flujos completos de trámites (crear → actualizar → eliminar)
- Flujos PPSH completos (solicitud → documentos → entrevista → decisión)
- Integración entre módulos
- Validación de permisos y roles
- Manejo de archivos y documentos
- Transiciones de estado
- Cache y performance
"""

import pytest
from unittest.mock import Mock, patch
from datetime import datetime, date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import json
import tempfile
import os

from app.models import Tramite
from app.models_ppsh import (
    PPSHSolicitud, PPSHSolicitante, PPSHDocumento,
    PPSHEntrevista, PPSHComentario, PPSHEstado,
    PPSHCausaHumanitaria, PPSHTipoDocumento
)


@pytest.mark.integration
class TestTramitesIntegrationWorkflow:
    """Tests de integración para flujos completos de trámites"""

    def test_complete_tramite_lifecycle(self, client: TestClient, db_session: Session):
        """
        Test: Ciclo de vida completo de un trámite
        Flujo: Crear → Listar → Obtener → Actualizar → Eliminar
        """
        # 1. CREAR TRÁMITE
        tramite_data = {
            "titulo": "Trámite Integración Test",
            "descripcion": "Descripción detallada para test de integración",
            "estado": "PENDIENTE"
        }
        
        create_response = client.post("/api/v1/tramites/", json=tramite_data)
        assert create_response.status_code == 201
        
        created_tramite = create_response.json()
        tramite_id = created_tramite["id"]
        
        # Verificar datos creados correctamente
        assert created_tramite["titulo"] == tramite_data["titulo"]
        assert created_tramite["estado"] == "PENDIENTE"
        assert "created_at" in created_tramite

        # 2. VERIFICAR EN LISTADO
        list_response = client.get("/api/v1/tramites/")
        assert list_response.status_code == 200
        
        list_data = list_response.json()
        assert list_data["total"] >= 1
        
        # Verificar que el trámite está en el listado
        tramite_in_list = next(
            (t for t in list_data["items"] if t["id"] == tramite_id), 
            None
        )
        assert tramite_in_list is not None
        assert tramite_in_list["titulo"] == tramite_data["titulo"]

        # 3. OBTENER TRÁMITE INDIVIDUAL
        get_response = client.get(f"/api/v1/tramites/{tramite_id}")
        assert get_response.status_code == 200
        
        retrieved_tramite = get_response.json()
        assert retrieved_tramite["id"] == tramite_id
        assert retrieved_tramite["titulo"] == tramite_data["titulo"]

        # 4. ACTUALIZAR TRÁMITE
        update_data = {
            "titulo": "Trámite Actualizado - Integración",
            "estado": "EN_PROCESO",
            "descripcion": "Descripción actualizada durante el test"
        }
        
        update_response = client.put(f"/api/v1/tramites/{tramite_id}", json=update_data)
        assert update_response.status_code == 200
        
        updated_tramite = update_response.json()
        assert updated_tramite["titulo"] == update_data["titulo"]
        assert updated_tramite["estado"] == "EN_PROCESO"
        assert updated_tramite["descripcion"] == update_data["descripcion"]

        # 5. VERIFICAR ACTUALIZACIÓN EN BD
        get_updated_response = client.get(f"/api/v1/tramites/{tramite_id}")
        assert get_updated_response.status_code == 200
        
        final_tramite = get_updated_response.json()
        assert final_tramite["titulo"] == update_data["titulo"]
        assert final_tramite["estado"] == "EN_PROCESO"

        # 6. ELIMINAR TRÁMITE (SOFT DELETE)
        delete_response = client.delete(f"/api/v1/tramites/{tramite_id}")
        assert delete_response.status_code == 204

        # 7. VERIFICAR QUE NO APARECE EN LISTADO
        list_after_delete = client.get("/api/v1/tramites/")
        assert list_after_delete.status_code == 200
        
        final_list = list_after_delete.json()
        tramite_after_delete = next(
            (t for t in final_list["items"] if t["id"] == tramite_id), 
            None
        )
        assert tramite_after_delete is None  # No debe aparecer

        # 8. VERIFICAR QUE NO SE PUEDE OBTENER INDIVIDUALMENTE
        get_deleted_response = client.get(f"/api/v1/tramites/{tramite_id}")
        assert get_deleted_response.status_code == 404

    def test_tramites_pagination_and_filtering_integration(self, client: TestClient, db_session: Session):
        """
        Test: Integración de paginación y filtros
        """
        # 1. CREAR MÚLTIPLES TRÁMITES CON DIFERENTES ESTADOS
        tramites_data = [
            {"titulo": f"Trámite PENDIENTE {i}", "estado": "PENDIENTE", "descripcion": f"Desc {i}"}
            for i in range(5)
        ] + [
            {"titulo": f"Trámite COMPLETADO {i}", "estado": "COMPLETADO", "descripcion": f"Desc {i}"}
            for i in range(3)
        ] + [
            {"titulo": f"Trámite EN_PROCESO {i}", "estado": "EN_PROCESO", "descripcion": f"Desc {i}"}
            for i in range(4)
        ]

        created_ids = []
        for tramite_data in tramites_data:
            response = client.post("/api/v1/tramites/", json=tramite_data)
            assert response.status_code == 201
            created_ids.append(response.json()["id"])

        # 2. PROBAR PAGINACIÓN
        # Primera página
        page1_response = client.get("/api/v1/tramites/?page=1&size=5")
        assert page1_response.status_code == 200
        page1_data = page1_response.json()
        
        assert page1_data["page"] == 1
        assert page1_data["size"] == 5
        assert page1_data["total"] == 12  # 5 + 3 + 4
        assert len(page1_data["items"]) == 5

        # Segunda página
        page2_response = client.get("/api/v1/tramites/?page=2&size=5")
        assert page2_response.status_code == 200
        page2_data = page2_response.json()
        
        assert page2_data["page"] == 2
        assert len(page2_data["items"]) == 5

        # 3. PROBAR FILTROS
        # Filtrar por estado PENDIENTE
        pendientes_response = client.get("/api/v1/tramites/?estado=PENDIENTE")
        assert pendientes_response.status_code == 200
        pendientes_data = pendientes_response.json()
        
        assert pendientes_data["total"] == 5
        for tramite in pendientes_data["items"]:
            assert tramite["estado"] == "PENDIENTE"

        # Filtrar por estado COMPLETADO
        completados_response = client.get("/api/v1/tramites/?estado=COMPLETADO")
        assert completados_response.status_code == 200
        completados_data = completados_response.json()
        
        assert completados_data["total"] == 3
        for tramite in completados_data["items"]:
            assert tramite["estado"] == "COMPLETADO"

        # 4. COMBINAR FILTROS Y PAGINACIÓN
        pendientes_page1 = client.get("/api/v1/tramites/?estado=PENDIENTE&page=1&size=3")
        assert pendientes_page1.status_code == 200
        data = pendientes_page1.json()
        
        assert data["total"] == 5
        assert data["page"] == 1
        assert data["size"] == 3
        assert len(data["items"]) == 3
        for tramite in data["items"]:
            assert tramite["estado"] == "PENDIENTE"

    @patch('app.routes.get_redis')
    def test_tramites_cache_integration(self, mock_get_redis, client: TestClient, db_session: Session):
        """
        Test: Integración del sistema de cache Redis
        """
        # Setup mock Redis
        mock_redis = Mock()
        mock_get_redis.return_value = mock_redis
        
        # Cache miss scenario
        mock_redis.get.return_value = None

        # 1. CREAR TRÁMITE
        tramite_data = {
            "titulo": "Trámite Cache Test",
            "descripcion": "Test de cache",
            "estado": "PENDIENTE"
        }
        
        create_response = client.post("/api/v1/tramites/", json=tramite_data)
        assert create_response.status_code == 201
        tramite_id = create_response.json()["id"]

        # Verificar que se invalidó el cache al crear
        mock_redis.delete.assert_called()

        # 2. PRIMERA CONSULTA - CACHE MISS
        mock_redis.reset_mock()
        mock_redis.get.return_value = None  # Cache miss
        
        list_response1 = client.get("/api/v1/tramites/")
        assert list_response1.status_code == 200
        
        # Verificar que se consultó y luego se guardó en cache
        mock_redis.get.assert_called()
        mock_redis.setex.assert_called()

        # 3. SEGUNDA CONSULTA - CACHE HIT
        mock_redis.reset_mock()
        cached_data = json.dumps({
            "items": [{"id": tramite_id, "titulo": "Cached Data"}],
            "total": 1,
            "page": 1,
            "size": 50,
            "pages": 1
        })
        mock_redis.get.return_value = cached_data.encode()
        
        list_response2 = client.get("/api/v1/tramites/")
        assert list_response2.status_code == 200
        
        # Verificar cache hit (no debe llamar setex)
        mock_redis.get.assert_called()
        mock_redis.setex.assert_not_called()

        # 4. ACTUALIZAR TRÁMITE - DEBE INVALIDAR CACHE
        mock_redis.reset_mock()
        
        update_response = client.put(f"/api/v1/tramites/{tramite_id}", json={
            "titulo": "Trámite Actualizado"
        })
        assert update_response.status_code == 200
        
        # Verificar que se invalidó el cache
        mock_redis.delete.assert_called()


@pytest.mark.integration
class TestPPSHIntegrationWorkflow:
    """Tests de integración para flujos completos PPSH"""

    def test_complete_ppsh_solicitud_workflow(self, client: TestClient, db_session: Session, analista_user, admin_user):
        """
        Test: Flujo completo de solicitud PPSH
        Flujo: Crear solicitud → Subir documentos → Programar entrevista → Evaluar → Decidir
        """
        # 1. CREAR SOLICITUD PPSH
        solicitud_data = {
            "tipo_solicitud": "INDIVIDUAL",
            "cod_causa_humanitaria": 1,
            "descripcion_caso": "Caso de persecución política en país de origen",
            "prioridad": "ALTA",
            "observaciones_generales": "Solicitud urgente por amenazas documentadas",
            "solicitantes": [
                {
                    "es_titular": True,
                    "tipo_documento": "PASAPORTE",
                    "num_documento": "AB123456789",
                    "pais_emisor": "VEN",
                    "primer_nombre": "Carlos",
                    "segundo_nombre": "José",
                    "primer_apellido": "Rodríguez",
                    "segundo_apellido": "García",
                    "fecha_nacimiento": "1985-03-15",
                    "cod_sexo": "M",
                    "cod_nacionalidad": "VEN",
                    "email": "carlos.rodriguez@email.com",
                    "telefono": "+507-6000-1234",
                    "direccion_actual": "Calle 50, Ciudad de Panamá"
                }
            ]
        }

        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            create_response = client.post("/api/v1/ppsh/solicitudes/", json=solicitud_data)
        
        assert create_response.status_code == 201
        solicitud = create_response.json()
        solicitud_id = solicitud["id"]
        
        # Verificar datos de la solicitud
        assert solicitud["tipo_solicitud"] == "INDIVIDUAL"
        assert solicitud["estado_actual"] == "RECIBIDA"
        assert solicitud["agencia"] == analista_user["agencia"]
        assert len(solicitud["solicitantes"]) == 1
        assert solicitud["solicitantes"][0]["primer_nombre"] == "Carlos"

        # 2. AGREGAR SOLICITANTE ADICIONAL (FAMILIAR)
        familiar_data = {
            "es_titular": False,
            "tipo_documento": "CEDULA",
            "num_documento": "PE-123-456",
            "primer_nombre": "María",
            "primer_apellido": "Rodríguez",
            "fecha_nacimiento": "1987-08-20",
            "cod_sexo": "F",
            "cod_nacionalidad": "VEN",
            "email": "maria.rodriguez@email.com",
            "telefono": "+507-6000-5678"
        }

        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            add_familiar_response = client.post(
                f"/api/v1/ppsh/solicitudes/{solicitud_id}/solicitantes",
                json=familiar_data
            )
        
        assert add_familiar_response.status_code == 201
        familiar = add_familiar_response.json()
        assert familiar["primer_nombre"] == "María"
        assert familiar["es_titular"] is False

        # 3. SUBIR DOCUMENTOS
        # Simular archivos PDF
        documento_identidad = {
            "filename": "pasaporte_carlos.pdf",
            "content": b"%PDF-1.4 mock content",
            "content_type": "application/pdf"
        }
        
        documento_persecucion = {
            "filename": "evidencia_persecucion.pdf", 
            "content": b"%PDF-1.4 mock evidence",
            "content_type": "application/pdf"
        }

        # Subir documento de identidad
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            upload_response1 = client.post(
                f"/api/v1/ppsh/solicitudes/{solicitud_id}/documentos",
                files={
                    "archivo": (
                        documento_identidad["filename"],
                        documento_identidad["content"],
                        documento_identidad["content_type"]
                    )
                },
                data={
                    "cod_tipo_documento": "1",  # Documento de identidad
                    "observaciones": "Pasaporte del solicitante principal"
                }
            )
        
        assert upload_response1.status_code == 201
        doc1 = upload_response1.json()
        assert doc1["nombre_archivo"] == "pasaporte_carlos.pdf"

        # Subir evidencia de persecución
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            upload_response2 = client.post(
                f"/api/v1/ppsh/solicitudes/{solicitud_id}/documentos",
                files={
                    "archivo": (
                        documento_persecucion["filename"],
                        documento_persecucion["content"],
                        documento_persecucion["content_type"]
                    )
                },
                data={
                    "cod_tipo_documento": "5",  # Evidencia de persecución
                    "observaciones": "Documentos que prueban la persecución política"
                }
            )
        
        assert upload_response2.status_code == 201
        doc2 = upload_response2.json()
        assert doc2["nombre_archivo"] == "evidencia_persecucion.pdf"

        # 4. VERIFICAR DOCUMENTOS SUBIDOS
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            docs_response = client.get(f"/api/v1/ppsh/solicitudes/{solicitud_id}/documentos")
        
        assert docs_response.status_code == 200
        documentos = docs_response.json()
        assert len(documentos) == 2

        # 5. CAMBIAR ESTADO A "EN_REVISION"
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            estado_response = client.put(
                f"/api/v1/ppsh/solicitudes/{solicitud_id}/estado",
                json={
                    "nuevo_estado": "EN_REVISION",
                    "observaciones": "Iniciando revisión de documentación"
                }
            )
        
        assert estado_response.status_code == 200
        solicitud_actualizada = estado_response.json()
        assert solicitud_actualizada["estado_actual"] == "EN_REVISION"

        # 6. PROGRAMAR ENTREVISTA
        entrevista_data = {
            "fecha_programada": "2025-10-25T14:00:00",
            "tipo_entrevista": "INICIAL",
            "modalidad": "PRESENCIAL",
            "observaciones": "Primera entrevista para evaluación del caso"
        }

        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            entrevista_response = client.post(
                f"/api/v1/ppsh/solicitudes/{solicitud_id}/entrevistas",
                json=entrevista_data
            )
        
        assert entrevista_response.status_code == 201
        entrevista = entrevista_response.json()
        entrevista_id = entrevista["id"]
        assert entrevista["tipo_entrevista"] == "INICIAL"
        assert entrevista["estado"] == "PROGRAMADA"

        # 7. AGREGAR COMENTARIO DE SEGUIMIENTO
        comentario_data = {
            "contenido": "Documentación completa. Caso presenta evidencia sólida de persecución.",
            "es_interno": True,
            "tipo_comentario": "EVALUACION"
        }

        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            comentario_response = client.post(
                f"/api/v1/ppsh/solicitudes/{solicitud_id}/comentarios",
                json=comentario_data
            )
        
        assert comentario_response.status_code == 201
        comentario = comentario_response.json()
        assert comentario["contenido"] == comentario_data["contenido"]
        assert comentario["usuario_creacion"] == analista_user["user_id"]

        # 8. REALIZAR ENTREVISTA Y REGISTRAR RESULTADO
        resultado_entrevista = {
            "resultado": "FAVORABLE",
            "observaciones_resultado": "El solicitante presentó evidencia convincente de persecución. Testimonio coherente y documentación verificable.",
            "recomendaciones": "Recomiendo aprobación de la protección humanitaria."
        }

        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            resultado_response = client.put(
                f"/api/v1/ppsh/entrevistas/{entrevista_id}/resultado",
                json=resultado_entrevista
            )
        
        assert resultado_response.status_code == 200
        entrevista_actualizada = resultado_response.json()
        assert entrevista_actualizada["resultado"] == "FAVORABLE"
        assert entrevista_actualizada["estado"] == "REALIZADA"

        # 9. DECISIÓN FINAL (COMO SUPERVISOR/ADMIN)
        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            decision_response = client.put(
                f"/api/v1/ppsh/solicitudes/{solicitud_id}/estado",
                json={
                    "nuevo_estado": "APROBADA",
                    "observaciones": "Aprobada basada en evidencia presentada y resultado favorable de entrevista."
                }
            )
        
        assert decision_response.status_code == 200
        solicitud_final = decision_response.json()
        assert solicitud_final["estado_actual"] == "APROBADA"

        # 10. VERIFICAR ESTADO FINAL COMPLETO
        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            final_response = client.get(f"/api/v1/ppsh/solicitudes/{solicitud_id}")
        
        assert final_response.status_code == 200
        solicitud_completa = final_response.json()
        
        # Verificar todos los componentes
        assert solicitud_completa["estado_actual"] == "APROBADA"
        assert len(solicitud_completa["solicitantes"]) == 2  # Titular + familiar
        
        # Verificar documentos
        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            docs_final = client.get(f"/api/v1/ppsh/solicitudes/{solicitud_id}/documentos")
        assert len(docs_final.json()) == 2

        # Verificar entrevistas
        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            entrevistas_final = client.get(f"/api/v1/ppsh/solicitudes/{solicitud_id}/entrevistas")
        entrevistas = entrevistas_final.json()
        assert len(entrevistas) == 1
        assert entrevistas[0]["resultado"] == "FAVORABLE"

        # Verificar comentarios
        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            comentarios_final = client.get(f"/api/v1/ppsh/solicitudes/{solicitud_id}/comentarios")
        comentarios = comentarios_final.json()
        assert len(comentarios) >= 1  # Al menos el comentario de evaluación

    def test_ppsh_permissions_and_access_control(self, client: TestClient, db_session: Session, 
                                                analista_user, readonly_user, admin_user):
        """
        Test: Control de acceso y permisos en flujo PPSH
        """
        # 1. CREAR SOLICITUD COMO ANALISTA
        solicitud_data = {
            "tipo_solicitud": "INDIVIDUAL",
            "cod_causa_humanitaria": 1,
            "descripcion_caso": "Test de permisos",
            "solicitantes": [
                {
                    "es_titular": True,
                    "primer_nombre": "Test",
                    "primer_apellido": "Permisos",
                    "fecha_nacimiento": "1990-01-01",
                    "cod_sexo": "M",
                    "cod_nacionalidad": "VEN"
                }
            ]
        }

        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            create_response = client.post("/api/v1/ppsh/solicitudes/", json=solicitud_data)
        
        assert create_response.status_code == 201
        solicitud_id = create_response.json()["id"]

        # 2. USUARIO READONLY NO PUEDE CREAR
        with patch('app.routes_ppsh.get_current_user', return_value=readonly_user):
            readonly_create = client.post("/api/v1/ppsh/solicitudes/", json=solicitud_data)
        assert readonly_create.status_code == 403

        # 3. USUARIO READONLY NO PUEDE ACTUALIZAR
        with patch('app.routes_ppsh.get_current_user', return_value=readonly_user):
            readonly_update = client.put(
                f"/api/v1/ppsh/solicitudes/{solicitud_id}",
                json={"descripcion_caso": "Intento de actualización"}
            )
        assert readonly_update.status_code == 403

        # 4. USUARIO READONLY PUEDE CONSULTAR (SI ES DE SU AGENCIA)
        # Nota: En este caso readonly_user tiene agencia diferente, por lo que no puede ver
        with patch('app.routes_ppsh.get_current_user', return_value=readonly_user):
            readonly_get = client.get(f"/api/v1/ppsh/solicitudes/{solicitud_id}")
        assert readonly_get.status_code == 403

        # 5. ADMIN PUEDE VER TODA LA INFORMACIÓN
        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            admin_get = client.get(f"/api/v1/ppsh/solicitudes/{solicitud_id}")
        assert admin_get.status_code == 200

        # 6. ADMIN PUEDE ACTUALIZAR CUALQUIER SOLICITUD
        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            admin_update = client.put(
                f"/api/v1/ppsh/solicitudes/{solicitud_id}",
                json={"prioridad": "BAJA"}
            )
        assert admin_update.status_code == 200

    def test_ppsh_estadisticas_integration(self, client: TestClient, db_session: Session, admin_user, analista_user):
        """
        Test: Integración del sistema de estadísticas
        """
        # 1. CREAR MÚLTIPLES SOLICITUDES EN DIFERENTES ESTADOS Y AGENCIAS
        solicitudes_data = [
            # Agencia AGE01 (analista_user)
            {
                "numero_solicitud": "PPSH-2025-001",
                "tipo_solicitud": "INDIVIDUAL",
                "estado_actual": "RECIBIDA",
                "agencia": "AGE01",
                "created_at": datetime.now()
            },
            {
                "numero_solicitud": "PPSH-2025-002", 
                "tipo_solicitud": "FAMILIAR",
                "estado_actual": "EN_REVISION",
                "agencia": "AGE01",
                "created_at": datetime.now()
            },
            {
                "numero_solicitud": "PPSH-2025-003",
                "tipo_solicitud": "INDIVIDUAL", 
                "estado_actual": "APROBADA",
                "agencia": "AGE01",
                "created_at": datetime.now()
            },
            # Agencia AGE02
            {
                "numero_solicitud": "PPSH-2025-004",
                "tipo_solicitud": "INDIVIDUAL",
                "estado_actual": "RECIBIDA", 
                "agencia": "AGE02",
                "created_at": datetime.now()
            },
            {
                "numero_solicitud": "PPSH-2025-005",
                "tipo_solicitud": "FAMILIAR",
                "estado_actual": "RECHAZADA",
                "agencia": "AGE02", 
                "created_at": datetime.now()
            }
        ]

        for solicitud_data in solicitudes_data:
            solicitud = PPSHSolicitud(**solicitud_data)
            db_session.add(solicitud)
        db_session.commit()

        # 2. ESTADÍSTICAS COMO ADMIN (VE TODO)
        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            admin_stats = client.get("/api/v1/ppsh/estadisticas/dashboard")
        
        assert admin_stats.status_code == 200
        admin_data = admin_stats.json()
        
        assert admin_data["total_solicitudes"] == 5
        assert "por_estado" in admin_data
        assert "por_agencia" in admin_data
        
        # Verificar distribución por estado
        por_estado = admin_data["por_estado"]
        assert por_estado["RECIBIDA"] == 2
        assert por_estado["EN_REVISION"] == 1
        assert por_estado["APROBADA"] == 1
        assert por_estado["RECHAZADA"] == 1

        # Verificar distribución por agencia
        por_agencia = admin_data["por_agencia"]
        assert por_agencia["AGE01"] == 3
        assert por_agencia["AGE02"] == 2

        # 3. ESTADÍSTICAS COMO ANALISTA (SOLO SU AGENCIA)
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            analista_stats = client.get("/api/v1/ppsh/estadisticas/dashboard")
        
        assert analista_stats.status_code == 200
        analista_data = analista_stats.json()
        
        # Solo debe ver solicitudes de AGE01
        assert analista_data["total_solicitudes"] == 3
        
        por_estado_analista = analista_data["por_estado"]
        assert por_estado_analista["RECIBIDA"] == 1
        assert por_estado_analista["EN_REVISION"] == 1
        assert por_estado_analista["APROBADA"] == 1
        assert "RECHAZADA" not in por_estado_analista or por_estado_analista["RECHAZADA"] == 0


@pytest.mark.integration
@pytest.mark.slow
class TestSystemIntegration:
    """Tests de integración del sistema completo"""

    def test_mixed_tramites_and_ppsh_workflow(self, client: TestClient, db_session: Session, admin_user):
        """
        Test: Flujo mixto usando tanto trámites regulares como PPSH
        """
        # 1. CREAR TRÁMITE REGULAR
        tramite_data = {
            "titulo": "Trámite Regular - Renovación de Permiso",
            "descripcion": "Renovación de permiso de trabajo",
            "estado": "PENDIENTE"
        }
        
        tramite_response = client.post("/api/v1/tramites/", json=tramite_data)
        assert tramite_response.status_code == 201
        tramite_id = tramite_response.json()["id"]

        # 2. CREAR SOLICITUD PPSH
        ppsh_data = {
            "tipo_solicitud": "INDIVIDUAL",
            "cod_causa_humanitaria": 1,
            "descripcion_caso": "Solicitud de protección humanitaria",
            "solicitantes": [
                {
                    "es_titular": True,
                    "primer_nombre": "Integration",
                    "primer_apellido": "Test",
                    "fecha_nacimiento": "1990-01-01",
                    "cod_sexo": "M",
                    "cod_nacionalidad": "VEN"
                }
            ]
        }

        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            ppsh_response = client.post("/api/v1/ppsh/solicitudes/", json=ppsh_data)
        
        assert ppsh_response.status_code == 201
        ppsh_id = ppsh_response.json()["id"]

        # 3. VERIFICAR QUE AMBOS SISTEMAS FUNCIONAN INDEPENDIENTEMENTE
        # Listar trámites
        tramites_list = client.get("/api/v1/tramites/")
        assert tramites_list.status_code == 200
        assert tramites_list.json()["total"] >= 1

        # Listar solicitudes PPSH
        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            ppsh_list = client.get("/api/v1/ppsh/solicitudes/")
        assert ppsh_list.status_code == 200
        assert ppsh_list.json()["total"] >= 1

        # 4. ACTUALIZAR AMBOS
        # Actualizar trámite
        tramite_update = client.put(f"/api/v1/tramites/{tramite_id}", json={
            "estado": "EN_PROCESO"
        })
        assert tramite_update.status_code == 200

        # Actualizar solicitud PPSH
        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            ppsh_update = client.put(f"/api/v1/ppsh/solicitudes/{ppsh_id}", json={
                "prioridad": "ALTA"
            })
        assert ppsh_update.status_code == 200

        # 5. VERIFICAR INTEGRIDAD DE DATOS
        # Verificar trámite
        tramite_final = client.get(f"/api/v1/tramites/{tramite_id}")
        assert tramite_final.status_code == 200
        assert tramite_final.json()["estado"] == "EN_PROCESO"

        # Verificar solicitud PPSH
        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            ppsh_final = client.get(f"/api/v1/ppsh/solicitudes/{ppsh_id}")
        assert ppsh_final.status_code == 200
        assert ppsh_final.json()["prioridad"] == "ALTA"

    def test_error_handling_and_rollback(self, client: TestClient, db_session: Session, analista_user):
        """
        Test: Manejo de errores y rollback de transacciones
        """
        # 1. INTENTAR CREAR SOLICITUD CON DATOS INVÁLIDOS
        invalid_data = {
            "tipo_solicitud": "INVALID_TYPE",  # Tipo inválido
            "cod_causa_humanitaria": 999,     # Código inexistente
            "descripcion_caso": "",            # Descripción vacía
            "solicitantes": []                 # Sin solicitantes
        }

        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            error_response = client.post("/api/v1/ppsh/solicitudes/", json=invalid_data)
        
        # Debe retornar error de validación
        assert error_response.status_code == 422

        # 2. VERIFICAR QUE NO SE CREÓ NADA EN LA BD
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            list_response = client.get("/api/v1/ppsh/solicitudes/")
        
        # No debe haber solicitudes (o las que había antes)
        initial_count = list_response.json()["total"]

        # 3. INTENTAR SUBIR ARCHIVO A SOLICITUD INEXISTENTE
        fake_file = {
            "filename": "test.pdf",
            "content": b"fake content",
            "content_type": "application/pdf"
        }

        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            upload_error = client.post(
                "/api/v1/ppsh/solicitudes/99999/documentos",  # ID inexistente
                files={
                    "archivo": (
                        fake_file["filename"],
                        fake_file["content"],
                        fake_file["content_type"]
                    )
                },
                data={"cod_tipo_documento": "1"}
            )
        
        assert upload_error.status_code == 404

        # 4. VERIFICAR QUE EL SISTEMA SIGUE FUNCIONAL
        valid_data = {
            "tipo_solicitud": "INDIVIDUAL",
            "cod_causa_humanitaria": 1,
            "descripcion_caso": "Solicitud válida después de errores",
            "solicitantes": [
                {
                    "es_titular": True,
                    "primer_nombre": "Valid",
                    "primer_apellido": "User",
                    "fecha_nacimiento": "1990-01-01",
                    "cod_sexo": "M",
                    "cod_nacionalidad": "VEN"
                }
            ]
        }

        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            valid_response = client.post("/api/v1/ppsh/solicitudes/", json=valid_data)
        
        assert valid_response.status_code == 201

        # 5. VERIFICAR QUE SOLO SE CREÓ LA SOLICITUD VÁLIDA
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            final_list = client.get("/api/v1/ppsh/solicitudes/")
        
        assert final_list.json()["total"] == initial_count + 1

    def test_concurrent_access_simulation(self, client: TestClient, db_session: Session, analista_user, admin_user):
        """
        Test: Simulación de acceso concurrente
        """
        # 1. CREAR SOLICITUD BASE
        solicitud_data = {
            "tipo_solicitud": "INDIVIDUAL",
            "cod_causa_humanitaria": 1,
            "descripcion_caso": "Test concurrencia",
            "solicitantes": [
                {
                    "es_titular": True,
                    "primer_nombre": "Concurrent",
                    "primer_apellido": "Test",
                    "fecha_nacimiento": "1990-01-01",
                    "cod_sexo": "M",
                    "cod_nacionalidad": "VEN"
                }
            ]
        }

        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            create_response = client.post("/api/v1/ppsh/solicitudes/", json=solicitud_data)
        
        assert create_response.status_code == 201
        solicitud_id = create_response.json()["id"]

        # 2. SIMULAR ACTUALIZACIONES CONCURRENTES
        # Usuario 1 (analista) actualiza descripción
        with patch('app.routes_ppsh.get_current_user', return_value=analista_user):
            update1 = client.put(f"/api/v1/ppsh/solicitudes/{solicitud_id}", json={
                "descripcion_caso": "Actualizada por analista"
            })
        assert update1.status_code == 200

        # Usuario 2 (admin) actualiza prioridad
        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            update2 = client.put(f"/api/v1/ppsh/solicitudes/{solicitud_id}", json={
                "prioridad": "URGENTE"
            })
        assert update2.status_code == 200

        # 3. VERIFICAR ESTADO FINAL CONSISTENTE
        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            final_state = client.get(f"/api/v1/ppsh/solicitudes/{solicitud_id}")
        
        assert final_state.status_code == 200
        final_data = final_state.json()
        
        # Ambas actualizaciones deben estar presentes
        assert "Actualizada por analista" in final_data["descripcion_caso"]
        assert final_data["prioridad"] == "URGENTE"

        # 4. SIMULAR MÚLTIPLES LECTURAS SIMULTÁNEAS
        # Múltiples usuarios leyendo la misma solicitud
        for _ in range(5):
            with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
                read_response = client.get(f"/api/v1/ppsh/solicitudes/{solicitud_id}")
            assert read_response.status_code == 200
            
        # Las lecturas no deben afectar los datos
        with patch('app.routes_ppsh.get_current_user', return_value=admin_user):
            consistency_check = client.get(f"/api/v1/ppsh/solicitudes/{solicitud_id}")
        
        assert consistency_check.status_code == 200
        consistency_data = consistency_check.json()
        assert consistency_data["id"] == solicitud_id
        assert consistency_data["prioridad"] == "URGENTE"