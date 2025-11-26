"""
Test para el endpoint de subida de documentos PPSH
Prueba la funcionalidad POST /ppsh/solicitudes/{id_solicitud}/documentos
"""

import pytest
import tempfile
import os
from datetime import datetime
from unittest.mock import Mock, patch
from io import BytesIO

from app.models import models_ppsh
from app.schemas import schemas_ppsh


class TestUploadDocumentEndpoint:
    """Tests para el endpoint de subida de documentos"""
    
    def setup_method(self):
        """Configuración antes de cada test"""
        self.base_url = "/api/v1/ppsh/solicitudes"
        self.test_solicitud_id = 123
        self.upload_url = f"{self.base_url}/{self.test_solicitud_id}/documentos"
        
        # Mock de archivo de prueba
        self.test_file_content = b"Este es un archivo PDF de prueba para PPSH"
        self.test_filename = "pasaporte_test.pdf"
    
    def create_test_file(self, content: bytes = None, filename: str = None):
        """Crea un archivo temporal para testing"""
        content = content or self.test_file_content
        filename = filename or self.test_filename
        
        return ("archivo", (filename, BytesIO(content), "application/pdf"))
    
    @patch('app.services.file_storage_service.FileStorageService.save_file')
    @patch('app.services.file_storage_service.FileStorageService.validate_file')
    @patch('app.routers.routers_ppsh.DocumentoService.registrar_documento')
    def test_upload_documento_exitoso(self, mock_registrar_doc, mock_validate_file, mock_save_file, client):
        """Test de subida exitosa de documento"""
        
        # Configurar mocks
        mock_validate_file.return_value = (True, None)
        mock_save_file.return_value = "/app/uploads/solicitudes/123/documento_456.pdf"
        
        mock_documento = models_ppsh.PPSHDocumento(
            id_documento=456,
            id_solicitud=self.test_solicitud_id,
            cod_tipo_documento=1,
            nombre_archivo=self.test_filename,
            extension="pdf",
            tamano_bytes=len(self.test_file_content),
            estado_verificacion="PENDIENTE",
            uploaded_by="TEST_USER",
            uploaded_at=datetime.now(),
            observaciones="Pasaporte vigente del solicitante"
        )
        
        mock_registrar_doc.return_value = mock_documento
        
        # Preparar datos del request
        files = {"archivo": (self.test_filename, BytesIO(self.test_file_content), "application/pdf")}
        data = {
            "cod_tipo_documento": "1",
            "observaciones": "Pasaporte vigente del solicitante"
        }
        
        # Ejecutar request
        response = client.post(
            self.upload_url,
            files=files,
            data=data
        )
        
        # Verificaciones
        assert response.status_code == 201
        response_data = response.json()
        
        assert response_data["id_documento"] == 456
        assert response_data["id_solicitud"] == self.test_solicitud_id
        assert response_data["nombre_archivo"] == self.test_filename
        assert response_data["extension"] == "pdf"
        assert response_data["tamano_bytes"] == len(self.test_file_content)
        assert response_data["estado_verificacion"] == "PENDIENTE"
        assert response_data["uploaded_by"] == "TEST_USER"
        assert response_data["observaciones"] == "Pasaporte vigente del solicitante"
        
        # Verificar que se llamó el servicio correctamente
        mock_registrar_doc.assert_called_once()
    
    @patch('app.routers.routers_ppsh.get_current_user')
    def test_upload_documento_sin_archivo(self, mock_current_user, client):
        """Test de error cuando no se envía archivo"""
        
        mock_current_user.return_value = {
            "user_id": "USR001",
            "username": "admin_test"
        }
        
        # Request sin archivo
        response = client.post(
            self.upload_url,
            data={"observaciones": "Test sin archivo"}
        )
        
        # Debe retornar error 422 (Unprocessable Entity)
        assert response.status_code == 422
        error_detail = response.json()
        assert "archivo" in str(error_detail["detail"])
    
    @patch('app.services.file_storage_service.FileStorageService.save_file')
    @patch('app.services.file_storage_service.FileStorageService.validate_file')
    def test_upload_documento_tipo_texto(self, mock_validate_file, mock_save_file, client):
        """Test de subida con tipo de documento como texto libre"""
        
        mock_validate_file.return_value = (True, None)
        mock_save_file.return_value = "/app/uploads/solicitudes/123/documento_789.jpg"
        
        with patch('app.routers.routers_ppsh.DocumentoService.registrar_documento') as mock_registrar:
            mock_documento = models_ppsh.PPSHDocumento(
                id_documento=789,
                id_solicitud=self.test_solicitud_id,
                cod_tipo_documento=None,  # Cuando no se especifica código
                tipo_documento_texto="Certificado Médico Especializado",
                nombre_archivo="certificado_medico.jpg",
                extension="jpg",
                tamano_bytes=2048,
                estado_verificacion="PENDIENTE",
                verificado_por=None,
                fecha_verificacion=None,
                uploaded_by="TEST_USER",
                uploaded_at=datetime.now(),
                observaciones="Certificado emitido por cardiólogo"
            )
            mock_registrar.return_value = mock_documento
            
            files = {"archivo": ("certificado_medico.jpg", BytesIO(b"imagen_jpg_test"), "image/jpeg")}
            data = {
                "tipo_documento_texto": "Certificado Médico Especializado",
                "observaciones": "Certificado emitido por cardiólogo"
            }
            
            response = client.post(self.upload_url, files=files, data=data)
            
            assert response.status_code == 201
            response_data = response.json()
            assert response_data["tipo_documento_texto"] == "Certificado Médico Especializado"
            assert response_data["nombre_archivo"] == "certificado_medico.jpg"
    
    @patch('app.routers.routers_ppsh.get_current_user')
    @patch('app.routers.routers_ppsh.DocumentoService.registrar_documento')
    def test_upload_documento_solicitud_inexistente(self, mock_registrar_doc, mock_current_user, client):
        """Test de error cuando la solicitud no existe"""
        
        mock_current_user.return_value = {"user_id": "USR001"}
        
        from app.services.services_ppsh import PPSHNotFoundException
        mock_registrar_doc.side_effect = PPSHNotFoundException("Solicitud", "99999")
        
        files = {"archivo": (self.test_filename, BytesIO(self.test_file_content), "application/pdf")}
        data = {"cod_tipo_documento": "1"}
        
        response = client.post(
            "/api/v1/ppsh/solicitudes/99999/documentos",
            files=files,
            data=data
        )
        
        assert response.status_code == 404
        # El endpoint debería retornar 404 para solicitudes inexistentes
        assert response.json()["detail"] in ["Not Found", "Solicitud con identificador 99999 no encontrada", "Solicitud con identificador 99999 no encontrado"]
    
    @patch('app.services.file_storage_service.FileStorageService.save_file')
    @patch('app.services.file_storage_service.FileStorageService.validate_file')
    def test_upload_multiple_tipos_documento(self, mock_validate_file, mock_save_file, client):
        """Test con diferentes tipos de archivo y extensiones"""
        
        mock_validate_file.return_value = (True, None)
        mock_save_file.return_value = "/app/uploads/test.pdf"
        
        test_cases = [
            {
                "filename": "pasaporte.pdf",
                "content": b"PDF_CONTENT",
                "mimetype": "application/pdf",
                "expected_extension": "pdf"
            },
            {
                "filename": "foto_carnet.jpg", 
                "content": b"JPG_CONTENT",
                "mimetype": "image/jpeg",
                "expected_extension": "jpg"
            },
            {
                "filename": "documento.png",
                "content": b"PNG_CONTENT", 
                "mimetype": "image/png",
                "expected_extension": "png"
            },
            {
                "filename": "archivo_sin_extension",
                "content": b"CONTENT",
                "mimetype": "application/octet-stream",
                "expected_extension": None
            }
        ]
        
        for case in test_cases:
            with patch('app.routers.routers_ppsh.DocumentoService.registrar_documento') as mock_registrar:
                mock_documento = models_ppsh.PPSHDocumento(
                    id_documento=999,
                    id_solicitud=self.test_solicitud_id,
                    cod_tipo_documento=1,
                    tipo_documento_texto=None,
                    nombre_archivo=case["filename"],
                    extension=case["expected_extension"],
                    tamano_bytes=len(case["content"]),
                    estado_verificacion="PENDIENTE",
                    verificado_por=None,
                    fecha_verificacion=None,
                    uploaded_by="TEST_USER",
                    uploaded_at=datetime.now(),
                    observaciones=None
                )
                mock_registrar.return_value = mock_documento
                
                files = {"archivo": (case["filename"], BytesIO(case["content"]), case["mimetype"])}
                data = {"cod_tipo_documento": "1"}
                
                response = client.post(self.upload_url, files=files, data=data)
                
                # Verificar que se procesó correctamente
                assert response.status_code == 201
                
                # Verificar que el servicio fue llamado
                mock_registrar.assert_called_once()


class TestUploadDocumentIntegration:
    """Tests de integración más completos"""
    
    @pytest.mark.integration
    @patch('app.services.file_storage_service.FileStorageService.save_file')
    @patch('app.services.file_storage_service.FileStorageService.validate_file')
    def test_workflow_completo_documento(self, mock_validate_file, mock_save_file, client):
        """Test del workflow completo: subir -> verificar documento"""
        
        mock_validate_file.return_value = (True, None)
        mock_save_file.return_value = "/app/uploads/solicitudes/123/documento_100.pdf"
        
        # 1. Subir documento
        with patch('app.routers.routers_ppsh.DocumentoService.registrar_documento') as mock_upload:
            mock_documento_uploaded = models_ppsh.PPSHDocumento(
                id_documento=100,
                id_solicitud=123,
                cod_tipo_documento=1,
                tipo_documento_texto=None,
                nombre_archivo="test.pdf",
                extension="pdf",
                tamano_bytes=7,  # len(b"content")
                estado_verificacion="PENDIENTE",
                verificado_por=None,
                fecha_verificacion=None,
                uploaded_by="TEST_USER",
                uploaded_at=datetime.now(),
                observaciones=None
            )
            mock_upload.return_value = mock_documento_uploaded
            
            files = {"archivo": ("test.pdf", BytesIO(b"content"), "application/pdf")}
            upload_response = client.post(
                "/api/v1/ppsh/solicitudes/123/documentos",
                files=files,
                data={"cod_tipo_documento": "1"}
            )
            
            assert upload_response.status_code == 201
            doc_id = upload_response.json()["id_documento"]
        
        # 2. Verificar documento
        with patch('app.routers.routers_ppsh.DocumentoService.verificar_documento') as mock_verify:
            mock_documento_verified = models_ppsh.PPSHDocumento(
                id_documento=doc_id,
                id_solicitud=123,
                cod_tipo_documento=1,
                tipo_documento_texto=None,
                nombre_archivo="test.pdf",
                extension="pdf",
                tamano_bytes=7,
                estado_verificacion="VERIFICADO",
                verificado_por="TEST_USER",
                fecha_verificacion=datetime.now(),
                uploaded_by="TEST_USER",
                uploaded_at=datetime.now(),
                observaciones="Documento válido y completo"
            )
            mock_verify.return_value = mock_documento_verified
            
            verify_response = client.patch(
                f"/api/v1/ppsh/documentos/{doc_id}/verificar",
                params={
                    "estado": "VERIFICADO",
                    "observaciones": "Documento válido y completo"
                }
            )
            
            assert verify_response.status_code == 200
            assert verify_response.json()["estado_verificacion"] == "VERIFICADO"


if __name__ == "__main__":
    # Ejecutar tests
    pytest.main([__file__, "-v", "--tb=short"])