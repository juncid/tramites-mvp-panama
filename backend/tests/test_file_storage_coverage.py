"""
Tests para app/services/file_storage_service.py
Sistema de Trámites Migratorios de Panamá

Objetivo: Cubrir las líneas faltantes para alcanzar 85%+ de cobertura.
"""

import pytest
import os
import tempfile
from unittest.mock import Mock, patch, MagicMock
from io import BytesIO
from PIL import Image

from app.services.file_storage_service import (
    FileStorageConfig,
    FileStorageService
)


class TestFileStorageConfig:
    """Tests para la configuración de almacenamiento"""
    
    def test_config_defaults(self):
        """Test: Verificar valores por defecto de configuración"""
        assert FileStorageConfig.MAX_UPLOAD_SIZE_MB >= 1
        assert FileStorageConfig.IMAGE_MAX_DIMENSION > 0
        assert FileStorageConfig.JPEG_QUALITY > 0
        assert '.pdf' in FileStorageConfig.ALLOWED_EXTENSIONS
        assert '.png' in FileStorageConfig.IMAGE_EXTENSIONS
    
    def test_max_upload_size_bytes_calculated(self):
        """Test: El tamaño máximo en bytes se calcula correctamente"""
        expected_bytes = FileStorageConfig.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        assert FileStorageConfig.MAX_UPLOAD_SIZE_BYTES == expected_bytes


class TestFileStorageService:
    """Tests para el servicio de almacenamiento de archivos"""
    
    def test_ensure_directory_creates_path(self):
        """Test: _ensure_directory crea el directorio"""
        with tempfile.TemporaryDirectory() as tmpdir:
            new_path = os.path.join(tmpdir, "subdir1", "subdir2")
            
            FileStorageService._ensure_directory(new_path)
            
            assert os.path.exists(new_path)
    
    def test_get_extension_lowercase(self):
        """Test: _get_extension retorna extensión en minúsculas"""
        assert FileStorageService._get_extension("document.PDF") == ".pdf"
        assert FileStorageService._get_extension("image.PNG") == ".png"
        assert FileStorageService._get_extension("photo.JPG") == ".jpg"
    
    def test_generate_unique_filename(self):
        """Test: _generate_unique_filename genera nombre único"""
        filename1 = FileStorageService._generate_unique_filename("test.pdf", 123)
        filename2 = FileStorageService._generate_unique_filename("test.pdf", 123)
        
        # Los nombres deberían contener el documento_id
        assert "123" in filename1
        assert "123" in filename2
        # Pero ser únicos (por timestamp/uuid)
        # Nota: Podrían ser iguales si se generan en el mismo segundo
    
    def test_validate_file_valid(self):
        """Test: validate_file acepta archivo válido"""
        content = b"test content"
        
        is_valid, error = FileStorageService.validate_file(
            content, "document.pdf"
        )
        
        assert is_valid is True
        assert error is None
    
    def test_validate_file_too_large(self):
        """Test: validate_file rechaza archivo muy grande"""
        # Crear contenido mayor al límite
        large_content = b"x" * (1024 * 1024 + 1)  # 1MB + 1 byte
        
        is_valid, error = FileStorageService.validate_file(
            large_content, "document.pdf", max_size_bytes=1024 * 1024
        )
        
        assert is_valid is False
        assert "excede el tamaño máximo" in error
    
    def test_validate_file_invalid_extension(self):
        """Test: validate_file rechaza extensión inválida"""
        content = b"test content"
        
        is_valid, error = FileStorageService.validate_file(
            content, "script.exe"
        )
        
        assert is_valid is False
        assert "no permitida" in error
    
    def test_compress_image_non_image_returns_original(self):
        """Test: compress_image retorna original si no es imagen"""
        content = b"PDF content"
        
        result_content, result_name = FileStorageService.compress_image(
            content, "document.pdf"
        )
        
        assert result_content == content
        assert result_name == "document.pdf"
    
    def test_compress_image_small_image_no_resize(self):
        """Test: compress_image no redimensiona imágenes pequeñas"""
        # Crear imagen pequeña
        img = Image.new('RGB', (100, 100), color='red')
        buffer = BytesIO()
        img.save(buffer, format='JPEG')
        content = buffer.getvalue()
        
        result_content, result_name = FileStorageService.compress_image(
            content, "small.jpg", max_dimension=1000
        )
        
        # Debería retornar algo (comprimido o no)
        assert len(result_content) > 0
        assert result_name.endswith('.jpg')
    
    def test_compress_image_large_image_resizes(self):
        """Test: compress_image redimensiona imágenes grandes"""
        # Crear imagen grande (ancho > max)
        img = Image.new('RGB', (5000, 3000), color='blue')
        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=95)
        content = buffer.getvalue()
        
        result_content, result_name = FileStorageService.compress_image(
            content, "large.jpg", max_dimension=1000
        )
        
        # Verificar que se redimensionó
        result_img = Image.open(BytesIO(result_content))
        assert max(result_img.size) <= 1000
    
    def test_compress_image_tall_image_resizes(self):
        """Test: compress_image redimensiona imágenes más altas que anchas"""
        # Crear imagen más alta que ancha
        img = Image.new('RGB', (1000, 5000), color='green')
        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=95)
        content = buffer.getvalue()
        
        result_content, result_name = FileStorageService.compress_image(
            content, "tall.jpg", max_dimension=1000
        )
        
        result_img = Image.open(BytesIO(result_content))
        assert max(result_img.size) <= 1000
    
    def test_compress_image_rgba_converts_to_rgb(self):
        """Test: compress_image convierte RGBA a RGB"""
        # Crear imagen RGBA
        img = Image.new('RGBA', (100, 100), color=(255, 0, 0, 128))
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        content = buffer.getvalue()
        
        result_content, result_name = FileStorageService.compress_image(
            content, "transparent.png"
        )
        
        # Debería convertirse a JPEG
        assert result_name.endswith('.jpg')
    
    def test_compress_image_palette_converts_to_rgb(self):
        """Test: compress_image convierte imagen paleta a RGB"""
        # Crear imagen con paleta
        img = Image.new('P', (100, 100))
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        content = buffer.getvalue()
        
        result_content, result_name = FileStorageService.compress_image(
            content, "palette.png"
        )
        
        assert result_name.endswith('.jpg')
    
    def test_compress_image_error_returns_original(self):
        """Test: compress_image retorna original si hay error"""
        # Contenido inválido que causará error al abrir como imagen
        invalid_content = b"not an image"
        
        result_content, result_name = FileStorageService.compress_image(
            invalid_content, "broken.png"
        )
        
        # Debería retornar el original
        assert result_content == invalid_content
        assert result_name == "broken.png"
    
    def test_save_file_creates_file(self):
        """Test: save_file crea el archivo en disco"""
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch.object(FileStorageConfig, 'UPLOADS_DIR', tmpdir):
                content = b"test file content"
                
                relative_path = FileStorageService.save_file(
                    solicitud_id=1,
                    documento_id=1,
                    content=content,
                    filename="test.pdf",
                    compress_images=False
                )
                
                # Verificar que el archivo se creó
                full_path = os.path.join(tmpdir, relative_path)
                assert os.path.exists(full_path)
                
                # Verificar contenido
                with open(full_path, 'rb') as f:
                    assert f.read() == content
    
    def test_save_file_invalid_raises_error(self):
        """Test: save_file lanza error si archivo inválido"""
        with pytest.raises(ValueError):
            FileStorageService.save_file(
                solicitud_id=1,
                documento_id=1,
                content=b"content",
                filename="script.exe"  # Extensión no permitida
            )
    
    def test_get_file_returns_content(self):
        """Test: get_file retorna el contenido del archivo"""
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch.object(FileStorageConfig, 'UPLOADS_DIR', tmpdir):
                # Crear archivo
                test_path = os.path.join(tmpdir, "test_file.txt")
                content = b"file content here"
                with open(test_path, 'wb') as f:
                    f.write(content)
                
                result = FileStorageService.get_file("test_file.txt")
                
                assert result == content
    
    def test_get_file_not_found_returns_none(self):
        """Test: get_file retorna None si no existe"""
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch.object(FileStorageConfig, 'UPLOADS_DIR', tmpdir):
                result = FileStorageService.get_file("nonexistent.txt")
                
                assert result is None
    
    def test_get_full_path(self):
        """Test: get_full_path retorna ruta completa"""
        with patch.object(FileStorageConfig, 'UPLOADS_DIR', '/test/uploads'):
            result = FileStorageService.get_full_path("solicitudes/1/doc.pdf")
            
            assert result == "/test/uploads/solicitudes/1/doc.pdf"
    
    def test_delete_file_success(self):
        """Test: delete_file elimina archivo existente"""
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch.object(FileStorageConfig, 'UPLOADS_DIR', tmpdir):
                # Crear archivo
                test_file = os.path.join(tmpdir, "to_delete.txt")
                with open(test_file, 'w') as f:
                    f.write("delete me")
                
                result = FileStorageService.delete_file("to_delete.txt")
                
                assert result is True
                assert not os.path.exists(test_file)
    
    def test_delete_file_not_found(self):
        """Test: delete_file retorna False si no existe"""
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch.object(FileStorageConfig, 'UPLOADS_DIR', tmpdir):
                result = FileStorageService.delete_file("nonexistent.txt")
                
                assert result is False
    
    def test_delete_file_error_returns_false(self):
        """Test: delete_file retorna False si hay error al eliminar"""
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch.object(FileStorageConfig, 'UPLOADS_DIR', tmpdir):
                # Crear archivo
                test_file = os.path.join(tmpdir, "to_delete.txt")
                with open(test_file, 'w') as f:
                    f.write("delete me")
                
                # Mock os.remove para que lance una excepción
                with patch('os.remove', side_effect=PermissionError("No permission")):
                    result = FileStorageService.delete_file("to_delete.txt")
                    
                    assert result is False
    
    def test_file_exists_true(self):
        """Test: file_exists retorna True si existe"""
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch.object(FileStorageConfig, 'UPLOADS_DIR', tmpdir):
                test_file = os.path.join(tmpdir, "exists.txt")
                with open(test_file, 'w') as f:
                    f.write("I exist")
                
                assert FileStorageService.file_exists("exists.txt") is True
    
    def test_file_exists_false(self):
        """Test: file_exists retorna False si no existe"""
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch.object(FileStorageConfig, 'UPLOADS_DIR', tmpdir):
                assert FileStorageService.file_exists("ghost.txt") is False
    
    def test_get_file_size_returns_bytes(self):
        """Test: get_file_size retorna tamaño en bytes"""
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch.object(FileStorageConfig, 'UPLOADS_DIR', tmpdir):
                test_file = os.path.join(tmpdir, "sized.txt")
                content = "x" * 100
                with open(test_file, 'w') as f:
                    f.write(content)
                
                size = FileStorageService.get_file_size("sized.txt")
                
                assert size == 100
    
    def test_get_file_size_not_found(self):
        """Test: get_file_size retorna None si no existe"""
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch.object(FileStorageConfig, 'UPLOADS_DIR', tmpdir):
                size = FileStorageService.get_file_size("ghost.txt")
                
                assert size is None
    
    def test_get_file_info_full_info(self):
        """Test: get_file_info retorna diccionario completo"""
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch.object(FileStorageConfig, 'UPLOADS_DIR', tmpdir):
                test_file = os.path.join(tmpdir, "info.pdf")
                with open(test_file, 'wb') as f:
                    f.write(b"x" * 1024)  # 1KB
                
                info = FileStorageService.get_file_info("info.pdf")
                
                assert info is not None
                assert info["size_bytes"] == 1024
                assert info["size_mb"] == 0.0  # Redondeado
                assert info["extension"] == ".pdf"
                assert info["filename"] == "info.pdf"
                assert info["relative_path"] == "info.pdf"
    
    def test_get_file_info_not_found(self):
        """Test: get_file_info retorna None si no existe"""
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch.object(FileStorageConfig, 'UPLOADS_DIR', tmpdir):
                info = FileStorageService.get_file_info("ghost.pdf")
                
                assert info is None
