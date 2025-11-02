"""
Tests para el servicio OCR
Sistema de Trámites Migratorios de Panamá

Tests:
- Endpoints de API
- Tareas de Celery
- Preprocesamiento de imágenes
- Extracción de datos estructurados
"""

import pytest
import json
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
from fastapi.testclient import TestClient
import numpy as np

from app.main import app
from app.models.models_ocr import PPSHDocumentoOCR, PPSHDocumentoOCRHistorial
from app.models.models_ppsh import PPSHDocumento
from app.tasks.ocr_tasks import (
    preprocess_image,
    extract_structured_data,
    deskew_image
)

client = TestClient(app)


# ==================== FIXTURES ====================

@pytest.fixture
def mock_db():
    """Mock de sesión de base de datos"""
    return MagicMock()


@pytest.fixture
def sample_documento(mock_db):
    """Documento de ejemplo para tests"""
    doc = PPSHDocumento(
        id_documento=1,
        id_solicitud=100,
        nombre_archivo="pasaporte_test.jpg",
        tipo_archivo="image/jpeg",
        tamano_archivo=1024000,
        contenido_binario=b'\x89PNG\r\n\x1a\n...',
        ruta_archivo="/uploads/pasaporte_test.jpg",
        cod_tipo_documento=1,
        created_by="test_user"
    )
    return doc


@pytest.fixture
def sample_imagen():
    """Imagen de ejemplo (array numpy)"""
    # Crear imagen de 100x100 píxeles en blanco
    return np.ones((100, 100, 3), dtype=np.uint8) * 255


@pytest.fixture
def sample_ocr_result():
    """Resultado OCR de ejemplo"""
    return {
        'texto': 'REPÚBLICA DE PANAMÁ\nPASAPORTE\nPA1234567',
        'confianza': 92.5,
        'idioma': 'spa',
        'total_palabras': 15
    }


# ==================== TESTS DE API ====================

class TestOCREndpoints:
    """Tests para endpoints de OCR"""
    
    @patch('app.routers.routers_ocr.SessionLocal')
    @patch('app.routers.routers_ocr.process_document_ocr')
    def test_procesar_documento_success(self, mock_task, mock_session):
        """Test: Procesar documento exitosamente"""
        # Configurar mocks
        mock_db = MagicMock()
        mock_session.return_value = mock_db
        
        # Mock del documento
        mock_doc = Mock(spec=PPSHDocumento)
        mock_doc.id_documento = 1
        mock_doc.contenido_binario = b'test_content'
        mock_db.query.return_value.filter.return_value.first.return_value = mock_doc
        
        # Mock de la tarea Celery
        mock_task_result = Mock()
        mock_task_result.id = "test-task-id-123"
        mock_task.apply_async.return_value = mock_task_result
        
        # Request
        response = client.post(
            "/api/v1/ocr/procesar/1?user_id=test_user",
            json={
                "idioma": "spa+eng",
                "prioridad": "normal",
                "binarizar": True,
                "denoise": True
            }
        )
        
        # Assertions
        assert response.status_code == 202
        data = response.json()
        assert "task_id" in data
        assert data["estado"] == "PENDIENTE"
        assert data["id_documento"] == 1
    
    @patch('app.routers.routers_ocr.SessionLocal')
    def test_procesar_documento_not_found(self, mock_session):
        """Test: Documento no encontrado"""
        mock_db = MagicMock()
        mock_session.return_value = mock_db
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        response = client.post(
            "/api/v1/ocr/procesar/999?user_id=test_user",
            json={"idioma": "spa"}
        )
        
        assert response.status_code == 404
        assert "no encontrado" in response.json()["detail"].lower()
    
    @patch('app.routers.routers_ocr.SessionLocal')
    def test_procesar_documento_sin_contenido(self, mock_session):
        """Test: Documento sin contenido"""
        mock_db = MagicMock()
        mock_session.return_value = mock_db
        
        # Documento sin contenido
        mock_doc = Mock(spec=PPSHDocumento)
        mock_doc.contenido_binario = None
        mock_doc.ruta_archivo = None
        mock_db.query.return_value.filter.return_value.first.return_value = mock_doc
        
        response = client.post(
            "/api/v1/ocr/procesar/1?user_id=test_user",
            json={"idioma": "spa"}
        )
        
        assert response.status_code == 400
        assert "contenido" in response.json()["detail"].lower()
    
    @patch('app.routers.routers_ocr.AsyncResult')
    def test_obtener_estado_pending(self, mock_async_result):
        """Test: Obtener estado PENDING"""
        mock_result = Mock()
        mock_result.state = 'PENDING'
        mock_async_result.return_value = mock_result
        
        response = client.get("/api/v1/ocr/status/test-task-id")
        
        assert response.status_code == 200
        data = response.json()
        assert data["estado"] == "PENDIENTE"
        assert data["porcentaje_completado"] == 0
    
    @patch('app.routers.routers_ocr.AsyncResult')
    def test_obtener_estado_success(self, mock_async_result):
        """Test: Obtener estado SUCCESS"""
        mock_result = Mock()
        mock_result.state = 'SUCCESS'
        mock_result.result = {
            'id_documento': 1,
            'id_ocr': 10,
            'confianza': 95.0,
            'tiempo_ms': 5000
        }
        mock_async_result.return_value = mock_result
        
        response = client.get("/api/v1/ocr/status/test-task-id")
        
        assert response.status_code == 200
        data = response.json()
        assert data["estado"] == "COMPLETADO"
        assert data["porcentaje_completado"] == 100
        assert data["confianza_promedio"] == 95.0
    
    @patch('app.routers.routers_ocr.SessionLocal')
    def test_obtener_resultado_success(self, mock_session):
        """Test: Obtener resultado OCR completado"""
        mock_db = MagicMock()
        mock_session.return_value = mock_db
        
        # Mock del resultado OCR
        mock_ocr = Mock(spec=PPSHDocumentoOCR)
        mock_ocr.id_ocr = 10
        mock_ocr.id_documento = 1
        mock_ocr.estado_ocr = 'COMPLETADO'
        mock_ocr.texto_extraido = 'Texto extraído de prueba'
        mock_ocr.texto_confianza = 92.5
        mock_ocr.idioma_detectado = 'spa'
        mock_ocr.num_caracteres = 100
        mock_ocr.num_palabras = 20
        mock_ocr.num_paginas = 1
        mock_ocr.tiempo_procesamiento_ms = 5000
        mock_ocr.created_at = datetime.now()
        mock_ocr.celery_task_id = 'task-123'
        mock_ocr.datos_estructurados = '{"numero_pasaporte": "PA123"}'
        
        mock_db.query.return_value.filter.return_value.order_by.return_value.first.return_value = mock_ocr
        
        response = client.get("/api/v1/ocr/resultado/1")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id_ocr"] == 10
        assert data["estado"] == "COMPLETADO"
        assert data["texto_extraido"] == 'Texto extraído de prueba'
        assert data["confianza_promedio"] == 92.5
    
    @patch('app.routers.routers_ocr.SessionLocal')
    def test_obtener_resultado_not_found(self, mock_session):
        """Test: Resultado no encontrado"""
        mock_db = MagicMock()
        mock_session.return_value = mock_db
        mock_db.query.return_value.filter.return_value.order_by.return_value.first.return_value = None
        
        response = client.get("/api/v1/ocr/resultado/999")
        
        assert response.status_code == 404
    
    @patch('app.routers.routers_ocr.SessionLocal')
    @patch('app.routers.routers_ocr.generate_ocr_statistics')
    def test_obtener_estadisticas(self, mock_stats_task, mock_session):
        """Test: Obtener estadísticas"""
        # Mock de la tarea de estadísticas
        mock_task_result = Mock()
        mock_task_result.get.return_value = {
            'total': 100,
            'por_estado': {
                'COMPLETADO': 80,
                'ERROR': 10,
                'PROCESANDO': 5,
                'PENDIENTE': 5
            },
            'confianza_promedio': 90.5,
            'tiempo_promedio_ms': 8000,
            'timestamp': '2024-01-15T10:00:00'
        }
        mock_stats_task.apply.return_value = mock_task_result
        
        response = client.get("/api/v1/ocr/estadisticas?desde_cache=true")
        
        assert response.status_code == 200
        data = response.json()
        assert data["total_procesados"] == 100
        assert data["total_completados"] == 80
        assert data["confianza_promedio"] == 90.5


# ==================== TESTS DE PREPROCESAMIENTO ====================

class TestImagePreprocessing:
    """Tests para funciones de preprocesamiento de imágenes"""
    
    def test_preprocess_basic(self, sample_imagen):
        """Test: Preprocesamiento básico"""
        opciones = {
            'binarizar': True,
            'denoise': False,
            'mejorar_contraste': False,
            'deskew': False
        }
        
        resultado = preprocess_image(sample_imagen, opciones)
        
        assert resultado is not None
        assert isinstance(resultado, np.ndarray)
        # Después del preprocesamiento debe ser escala de grises (2D)
        assert len(resultado.shape) == 2
    
    def test_preprocess_full(self, sample_imagen):
        """Test: Preprocesamiento completo"""
        opciones = {
            'binarizar': True,
            'denoise': True,
            'mejorar_contraste': True,
            'deskew': True,
            'resize_factor': 1.5
        }
        
        resultado = preprocess_image(sample_imagen, opciones)
        
        assert resultado is not None
        # Verificar redimensionamiento
        expected_height = int(sample_imagen.shape[0] * 1.5)
        expected_width = int(sample_imagen.shape[1] * 1.5)
        assert resultado.shape[0] == expected_height
        assert resultado.shape[1] == expected_width
    
    def test_preprocess_error_handling(self):
        """Test: Manejo de errores en preprocesamiento"""
        # Imagen inválida
        imagen_invalida = np.array([])
        opciones = {'binarizar': True}
        
        # Debe retornar imagen original si falla
        resultado = preprocess_image(imagen_invalida, opciones)
        assert np.array_equal(resultado, imagen_invalida)
    
    def test_deskew_image(self, sample_imagen):
        """Test: Corrección de inclinación"""
        # Convertir a escala de grises primero
        import cv2
        gray = cv2.cvtColor(sample_imagen, cv2.COLOR_BGR2GRAY)
        
        resultado = deskew_image(gray)
        
        assert resultado is not None
        assert resultado.shape == gray.shape


# ==================== TESTS DE EXTRACCIÓN DE DATOS ====================

class TestDataExtraction:
    """Tests para extracción de datos estructurados"""
    
    def test_extract_pasaporte_data(self):
        """Test: Extraer datos de pasaporte"""
        texto = """
        REPÚBLICA DE PANAMÁ
        PASAPORTE
        PA1234567
        Nombre: JUAN PÉREZ
        Fecha Nac: 15/01/1990
        Fecha Emisión: 10/01/2020
        Fecha Venc: 10/01/2030
        Nacionalidad: PAN
        """
        
        resultado = extract_structured_data(texto, tipo_documento=1)
        
        assert resultado is not None
        datos = json.loads(resultado)
        assert 'numero_pasaporte' in datos
        assert datos['numero_pasaporte'] == 'PA1234567'
        assert 'nacionalidad' in datos
        assert datos['nacionalidad'] == 'PAN'
        assert 'fechas_encontradas' in datos
        assert len(datos['fechas_encontradas']) >= 3
    
    def test_extract_cedula_data(self):
        """Test: Extraer datos de cédula"""
        texto = """
        REPÚBLICA DE PANAMÁ
        CÉDULA DE IDENTIDAD PERSONAL
        8-123-4567
        JUAN PÉREZ GONZÁLEZ
        Fecha de Nacimiento: 15/01/1990
        """
        
        resultado = extract_structured_data(texto, tipo_documento=2)
        
        assert resultado is not None
        datos = json.loads(resultado)
        assert 'numero_cedula' in datos
        assert datos['numero_cedula'] == '8-123-4567'
        assert 'fecha_nacimiento' in datos
    
    def test_extract_no_data(self):
        """Test: Texto sin datos estructurados"""
        texto = "Texto aleatorio sin información útil"
        
        resultado = extract_structured_data(texto, tipo_documento=1)
        
        # Debe retornar None si no encuentra datos
        assert resultado is None
    
    def test_extract_multiple_formats(self):
        """Test: Diferentes formatos de fecha"""
        texto = """
        Fechas: 
        15/01/1990
        10-05-2020
        20/12/2025
        """
        
        resultado = extract_structured_data(texto, tipo_documento=1)
        
        if resultado:
            datos = json.loads(resultado)
            assert 'fechas_encontradas' in datos
            # Debe encontrar ambos formatos (/ y -)
            assert len(datos['fechas_encontradas']) >= 2


# ==================== TESTS DE INTEGRACIÓN ====================

class TestOCRIntegration:
    """Tests de integración del flujo completo OCR"""
    
    @patch('app.tasks.ocr_tasks.pytesseract.image_to_string')
    @patch('app.tasks.ocr_tasks.pytesseract.image_to_data')
    @patch('app.tasks.ocr_tasks.cv2.imread')
    def test_full_ocr_flow(self, mock_imread, mock_data, mock_string):
        """Test: Flujo completo de OCR (mock de Tesseract)"""
        # Mock de lectura de imagen
        mock_imread.return_value = np.ones((100, 100, 3), dtype=np.uint8) * 255
        
        # Mock de Tesseract
        mock_string.return_value = "REPÚBLICA DE PANAMÁ\nPASAPORTE\nPA1234567"
        mock_data.return_value = {
            'conf': [95, 90, 92, 88, 94, -1, 91]
        }
        
        from app.tasks.ocr_tasks import execute_ocr
        
        imagen = np.ones((100, 100), dtype=np.uint8) * 255
        resultado = execute_ocr(imagen, idioma='spa+eng')
        
        assert resultado is not None
        assert 'texto' in resultado
        assert 'confianza' in resultado
        assert resultado['confianza'] > 0
        assert 'PASAPORTE' in resultado['texto']


# ==================== TESTS DE MODELOS ====================

class TestOCRModels:
    """Tests para modelos de base de datos OCR"""
    
    def test_ppsh_documento_ocr_creation(self):
        """Test: Crear instancia de PPSHDocumentoOCR"""
        ocr = PPSHDocumentoOCR(
            id_documento=1,
            estado_ocr='PENDIENTE',
            created_by='test_user'
        )
        
        assert ocr.id_documento == 1
        assert ocr.estado_ocr == 'PENDIENTE'
        assert ocr.created_by == 'test_user'
    
    def test_ppsh_documento_ocr_estados(self):
        """Test: Estados válidos de OCR"""
        estados_validos = ['PENDIENTE', 'PROCESANDO', 'COMPLETADO', 'ERROR', 'CANCELADO']
        
        for estado in estados_validos:
            ocr = PPSHDocumentoOCR(
                id_documento=1,
                estado_ocr=estado,
                created_by='test'
            )
            assert ocr.estado_ocr == estado
    
    def test_ppsh_documento_ocr_historial_creation(self):
        """Test: Crear instancia de PPSHDocumentoOCRHistorial"""
        historial = PPSHDocumentoOCRHistorial(
            id_ocr=10,
            id_documento=1,
            texto_extraido='Texto de prueba',
            motivo_reprocesamiento='Mejora de calidad',
            created_by='test_user'
        )
        
        assert historial.id_ocr == 10
        assert historial.motivo_reprocesamiento == 'Mejora de calidad'


# ==================== TESTS DE SCHEMAS ====================

class TestOCRSchemas:
    """Tests para schemas Pydantic de OCR"""
    
    def test_ocr_request_schema(self):
        """Test: Schema OCRRequest"""
        from app.schemas.schemas_ocr import OCRRequest
        
        request = OCRRequest(
            idioma='spa+eng',
            prioridad='alta',
            binarizar=True,
            denoise=True,
            mejorar_contraste=True
        )
        
        assert request.idioma == 'spa+eng'
        assert request.prioridad == 'alta'
        assert request.binarizar is True
    
    def test_ocr_request_defaults(self):
        """Test: Valores por defecto de OCRRequest"""
        from app.schemas.schemas_ocr import OCRRequest
        
        request = OCRRequest()
        
        assert request.idioma == 'spa+eng'
        assert request.prioridad == 'normal'
        assert request.binarizar is True
        assert request.extraer_datos_estructurados is True
    
    def test_ocr_response_schema(self):
        """Test: Schema OCRResponse"""
        from app.schemas.schemas_ocr import OCRResponse
        
        response = OCRResponse(
            task_id='test-123',
            estado='PENDIENTE',
            mensaje='Test',
            id_documento=1
        )
        
        assert response.task_id == 'test-123'
        assert response.estado == 'PENDIENTE'
    
    def test_estado_ocr_enum(self):
        """Test: Enum EstadoOCREnum"""
        from app.schemas.schemas_ocr import EstadoOCREnum
        
        assert EstadoOCREnum.PENDIENTE == 'PENDIENTE'
        assert EstadoOCREnum.PROCESANDO == 'PROCESANDO'
        assert EstadoOCREnum.COMPLETADO == 'COMPLETADO'
        assert EstadoOCREnum.ERROR == 'ERROR'
        assert EstadoOCREnum.CANCELADO == 'CANCELADO'


# ==================== MARKS Y CONFIGURACIÓN ====================

# Marcar tests que requieren Docker/Redis
pytesmark = pytest.mark.unit

# Tests que requieren servicios externos
integration_tests = pytest.mark.integration

# Tests lentos
slow_tests = pytest.mark.slow


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
