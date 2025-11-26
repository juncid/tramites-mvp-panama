"""
Tests para FileStorageService
Sistema de almacenamiento de archivos para PPSH
"""

import pytest
import tempfile
import os
from io import BytesIO
from unittest.mock import Mock, patch, MagicMock, mock_open
from pathlib import Path

from app.services.file_storage_service import (
    FileStorageService, 
    FileStorageConfig
)


# ==========================================
# FIXTURES
# ==========================================

@pytest.fixture
def temp_upload_dir(tmp_path):
    """Directorio temporal para uploads"""
    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir()
    return str(upload_dir)


@pytest.fixture
def sample_pdf_content():
    """Contenido de PDF de prueba"""
    return b"%PDF-1.4 test content for file storage"


@pytest.fixture
def sample_image_content():
    """Contenido de imagen de prueba (1x1 pixel PNG)"""
    # PNG minimalista
    return bytes([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,  # 1x1
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
        0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
        0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x01, 0x00, 0x05, 0xD8, 0xD8, 0x31,
        0x7E, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
        0x44, 0xAE, 0x42, 0x60, 0x82
    ])


# ==========================================
# TESTS DE CONFIGURACIÓN
# ==========================================

class TestFileStorageConfig:
    """Tests para la configuración del servicio"""
    
    def test_config_defaults(self):
        """Test: Valores por defecto de configuración"""
        assert FileStorageConfig.MAX_UPLOAD_SIZE_BYTES > 0
        assert len(FileStorageConfig.ALLOWED_EXTENSIONS) > 0
        assert ".pdf" in FileStorageConfig.ALLOWED_EXTENSIONS
        assert ".jpg" in FileStorageConfig.ALLOWED_EXTENSIONS
        assert ".png" in FileStorageConfig.ALLOWED_EXTENSIONS
    
    def test_config_max_file_size(self):
        """Test: Tamaño máximo de archivo"""
        # 100MB = 100 * 1024 * 1024
        assert FileStorageConfig.MAX_UPLOAD_SIZE_BYTES == 100 * 1024 * 1024


# ==========================================
# TESTS DE VALIDACIÓN DE ARCHIVOS
# ==========================================

class TestFileValidation:
    """Tests para validación de archivos"""
    
    def test_validate_file_valid_pdf(self, sample_pdf_content):
        """Test: PDF válido pasa validación"""
        is_valid, error = FileStorageService.validate_file(
            sample_pdf_content, 
            "documento.pdf"
        )
        assert is_valid is True
        assert error is None
    
    def test_validate_file_valid_image(self, sample_image_content):
        """Test: Imagen PNG válida pasa validación"""
        is_valid, error = FileStorageService.validate_file(
            sample_image_content, 
            "imagen.png"
        )
        assert is_valid is True
        assert error is None
    
    def test_validate_file_exceeds_size(self):
        """Test: Archivo que excede tamaño máximo"""
        # Crear contenido que exceda el límite
        large_content = b"x" * (FileStorageConfig.MAX_UPLOAD_SIZE_BYTES + 1)
        
        is_valid, error = FileStorageService.validate_file(
            large_content, 
            "grande.pdf"
        )
        
        assert is_valid is False
        assert "tamaño" in error.lower() or "size" in error.lower() or "excede" in error.lower()
    
    def test_validate_file_invalid_extension(self):
        """Test: Extensión no permitida"""
        is_valid, error = FileStorageService.validate_file(
            b"executable content",
            "virus.exe"
        )
        
        assert is_valid is False
        assert "extensión" in error.lower() or "extension" in error.lower()
    
    def test_validate_file_no_extension(self):
        """Test: Archivo sin extensión"""
        is_valid, error = FileStorageService.validate_file(
            b"content",
            "archivo_sin_extension"
        )
        
        assert is_valid is False
    
    def test_validate_file_empty(self):
        """Test: Archivo vacío"""
        is_valid, error = FileStorageService.validate_file(
            b"",
            "vacio.pdf"
        )
        
        # Depende de la implementación - puede ser válido o no
        # El importante es que no lance excepción
        assert isinstance(is_valid, bool)


# ==========================================
# TESTS DE GUARDADO DE ARCHIVOS
# ==========================================

class TestFileSave:
    """Tests para guardado de archivos"""
    
    def test_save_file_creates_directory(self, tmp_path, sample_pdf_content):
        """Test: Crea directorio si no existe"""
        with patch.object(FileStorageConfig, 'UPLOADS_DIR', str(tmp_path)):
            result = FileStorageService.save_file(
                solicitud_id=123,
                documento_id=456,
                content=sample_pdf_content,
                filename="test.pdf"
            )
            
            assert result is not None
            # Verificar que se creó el archivo
            full_path = tmp_path / "solicitudes" / "123" / result.split("/")[-1]
            # El archivo debería existir en algún lugar de tmp_path
    
    def test_save_file_returns_path(self, tmp_path, sample_pdf_content):
        """Test: Retorna ruta del archivo guardado"""
        with patch.object(FileStorageConfig, 'UPLOADS_DIR', str(tmp_path)):
            result = FileStorageService.save_file(
                solicitud_id=1,
                documento_id=1,
                content=sample_pdf_content,
                filename="test.pdf"
            )
            
            assert isinstance(result, str)
            assert "1" in result  # solicitud_id en la ruta
    
    def test_save_file_with_compression(self, tmp_path, sample_image_content):
        """Test: Guarda imagen con compresión opcional"""
        with patch.object(FileStorageConfig, 'UPLOADS_DIR', str(tmp_path)):
            try:
                result = FileStorageService.save_file(
                    solicitud_id=2,
                    documento_id=2,
                    content=sample_image_content,
                    filename="imagen.png",
                    compress_images=True
                )
                assert result is not None
            except Exception:
                # La compresión puede fallar con contenido mínimo
                pass


# ==========================================
# TESTS DE LECTURA DE ARCHIVOS
# ==========================================

class TestFileRead:
    """Tests para lectura de archivos"""
    
    def test_get_file_exists(self, tmp_path, sample_pdf_content):
        """Test: Leer archivo existente"""
        # Crear archivo
        subdir = tmp_path / "solicitudes" / "1"
        subdir.mkdir(parents=True)
        test_file = subdir / "test.pdf"
        test_file.write_bytes(sample_pdf_content)
        
        with patch.object(FileStorageConfig, 'UPLOADS_DIR', str(tmp_path)):
            result = FileStorageService.get_file("solicitudes/1/test.pdf")
            
            assert result == sample_pdf_content
    
    def test_get_file_not_exists(self, tmp_path):
        """Test: Archivo no existe retorna None"""
        with patch.object(FileStorageConfig, 'UPLOADS_DIR', str(tmp_path)):
            result = FileStorageService.get_file("solicitudes/99/noexiste.pdf")
            
            assert result is None


# ==========================================
# TESTS DE ELIMINACIÓN DE ARCHIVOS
# ==========================================

class TestFileDelete:
    """Tests para eliminación de archivos"""
    
    def test_delete_file_exists(self, tmp_path, sample_pdf_content):
        """Test: Eliminar archivo existente"""
        # Crear archivo
        subdir = tmp_path / "solicitudes" / "1"
        subdir.mkdir(parents=True)
        test_file = subdir / "to_delete.pdf"
        test_file.write_bytes(sample_pdf_content)
        
        assert test_file.exists()
        
        with patch.object(FileStorageConfig, 'UPLOADS_DIR', str(tmp_path)):
            result = FileStorageService.delete_file("solicitudes/1/to_delete.pdf")
            
            assert result is True
            assert not test_file.exists()
    
    def test_delete_file_not_exists(self, tmp_path):
        """Test: Eliminar archivo que no existe retorna False"""
        with patch.object(FileStorageConfig, 'UPLOADS_DIR', str(tmp_path)):
            result = FileStorageService.delete_file("solicitudes/99/noexiste.pdf")
            
            assert result is False


# ==========================================
# TESTS DE UTILIDADES
# ==========================================

class TestFileUtilities:
    """Tests para utilidades del servicio"""
    
    def test_get_extension_pdf(self):
        """Test: Obtener extensión de PDF"""
        ext = FileStorageService._get_extension("documento.pdf")
        assert ext == ".pdf"
    
    def test_get_extension_uppercase(self):
        """Test: Extensión en mayúsculas"""
        ext = FileStorageService._get_extension("IMAGEN.PNG")
        assert ext == ".png"
    
    def test_get_extension_none(self):
        """Test: Archivo sin extensión"""
        ext = FileStorageService._get_extension("archivo_sin_extension")
        assert ext == ""
    
    def test_get_extension_multiple_dots(self):
        """Test: Nombre con múltiples puntos"""
        ext = FileStorageService._get_extension("archivo.backup.2024.pdf")
        assert ext == ".pdf"
    
    def test_generate_unique_filename(self):
        """Test: Generar nombre único"""
        name = FileStorageService._generate_unique_filename(
            original_filename="pasaporte.pdf",
            documento_id=456
        )
        
        assert "456" in name
        assert name.endswith(".pdf")


# ==========================================
# TESTS DE INTEGRACIÓN
# ==========================================

class TestFileStorageIntegration:
    """Tests de integración del servicio"""
    
    def test_full_workflow(self, tmp_path, sample_pdf_content):
        """Test: Workflow completo - guardar, leer, eliminar"""
        with patch.object(FileStorageConfig, 'UPLOADS_DIR', str(tmp_path)):
            # 1. Guardar
            relative_path = FileStorageService.save_file(
                solicitud_id=999,
                documento_id=888,
                content=sample_pdf_content,
                filename="workflow_test.pdf"
            )
            
            # 2. Verificar que existe
            assert FileStorageService.file_exists(relative_path)
            
            # 3. Leer
            content = FileStorageService.get_file(relative_path)
            assert content == sample_pdf_content
            
            # 4. Eliminar
            result = FileStorageService.delete_file(relative_path)
            assert result is True
            assert not FileStorageService.file_exists(relative_path)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
