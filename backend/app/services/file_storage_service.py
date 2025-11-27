"""
Servicio de almacenamiento de archivos
Sistema de Trámites Migratorios de Panamá

Maneja el guardado, compresión y eliminación de archivos en disco.
Incluye compresión automática de imágenes con Pillow.

Author: Sistema de Trámites MVP Panamá
Date: 2025-11-25
"""

import os
import uuid
import logging
from typing import Optional, Tuple
from datetime import datetime
from pathlib import Path
from PIL import Image
from io import BytesIO

logger = logging.getLogger(__name__)


class FileStorageConfig:
    """Configuración del servicio de almacenamiento"""

    # Directorio base de uploads (desde variable de entorno)
    UPLOADS_DIR = os.getenv("UPLOADS_DIR", "/app/uploads")

    # Tamaño máximo de archivo en MB
    MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "100"))
    MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024

    # Dimensión máxima para imágenes (compresión)
    IMAGE_MAX_DIMENSION = int(os.getenv("IMAGE_MAX_DIMENSION", "4000"))

    # Calidad JPEG para compresión
    JPEG_QUALITY = 85

    # Extensiones permitidas (MVP: PDF, PNG y JPG)
    ALLOWED_EXTENSIONS = {'.pdf', '.png', '.jpg', '.jpeg'}

    # Extensiones de imagen (para compresión y OCR)
    IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg'}


class FileStorageService:
    """Servicio para gestión de archivos en disco"""

    @staticmethod
    def _ensure_directory(path: str) -> None:
        """Crea el directorio si no existe"""
        Path(path).mkdir(parents=True, exist_ok=True)

    @staticmethod
    def _get_extension(filename: str) -> str:
        """Obtiene la extensión del archivo en minúsculas"""
        return Path(filename).suffix.lower()

    @staticmethod
    def _generate_unique_filename(original_filename: str, documento_id: int) -> str:
        """Genera un nombre único para el archivo"""
        extension = FileStorageService._get_extension(original_filename)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        # Limpiar nombre original de caracteres especiales
        safe_name = "".join(c for c in original_filename if c.isalnum() or c in "._-")[:50]
        return f"{documento_id}_{timestamp}_{unique_id}_{safe_name}"

    @staticmethod
    def validate_file(
        content: bytes,
        filename: str,
        max_size_bytes: Optional[int] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Valida un archivo antes de guardarlo.
        
        Returns:
            Tuple[bool, Optional[str]]: (es_válido, mensaje_error)
        """
        max_size = max_size_bytes or FileStorageConfig.MAX_UPLOAD_SIZE_BYTES

        # Validar tamaño
        if len(content) > max_size:
            max_mb = max_size / (1024 * 1024)
            actual_mb = len(content) / (1024 * 1024)
            return False, f"El archivo excede el tamaño máximo permitido ({max_mb:.0f}MB). Tamaño actual: {actual_mb:.1f}MB"

        # Validar extensión
        extension = FileStorageService._get_extension(filename)
        if extension not in FileStorageConfig.ALLOWED_EXTENSIONS:
            allowed = ", ".join(FileStorageConfig.ALLOWED_EXTENSIONS)
            return False, f"Extensión '{extension}' no permitida. Extensiones válidas: {allowed}"

        return True, None

    @staticmethod
    def compress_image(
        content: bytes,
        filename: str,
        max_dimension: Optional[int] = None,
        quality: int = FileStorageConfig.JPEG_QUALITY
    ) -> Tuple[bytes, str]:
        """
        Comprime una imagen si excede las dimensiones máximas.
        
        Args:
            content: Bytes del archivo original
            filename: Nombre del archivo
            max_dimension: Dimensión máxima (ancho o alto)
            quality: Calidad JPEG (1-100)
            
        Returns:
            Tuple[bytes, str]: (contenido_comprimido, nuevo_nombre)
        """
        extension = FileStorageService._get_extension(filename)

        # Solo comprimir imágenes
        if extension not in FileStorageConfig.IMAGE_EXTENSIONS:
            return content, filename

        max_dim = max_dimension or FileStorageConfig.IMAGE_MAX_DIMENSION

        try:
            # Abrir imagen
            img = Image.open(BytesIO(content))
            original_size = len(content)
            original_dimensions = img.size

            # Verificar si necesita redimensionar
            width, height = img.size
            needs_resize = width > max_dim or height > max_dim

            if needs_resize:
                # Calcular nuevas dimensiones manteniendo proporción
                if width > height:
                    new_width = max_dim
                    new_height = int(height * (max_dim / width))
                else:
                    new_height = max_dim
                    new_width = int(width * (max_dim / height))

                # Redimensionar con alta calidad
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                logger.info(f"Imagen redimensionada: {original_dimensions} -> {img.size}")

            # Convertir a RGB si es necesario (para JPEG)
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')

            # Guardar en buffer con compresión
            buffer = BytesIO()

            # Usar JPEG para mejor compresión
            img.save(buffer, format='JPEG', quality=quality, optimize=True)
            compressed_content = buffer.getvalue()

            # Cambiar extensión a .jpg si se convirtió
            new_filename = Path(filename).stem + '.jpg'

            compressed_size = len(compressed_content)
            compression_ratio = (1 - compressed_size / original_size) * 100 if original_size > 0 else 0

            logger.info(
                f"Imagen comprimida: {original_size / 1024:.1f}KB -> {compressed_size / 1024:.1f}KB "
                f"(reducción: {compression_ratio:.1f}%)"
            )

            return compressed_content, new_filename

        except Exception as e:
            logger.warning(f"No se pudo comprimir la imagen {filename}: {e}. Usando original.")
            return content, filename

    @staticmethod
    def save_file(
        solicitud_id: int,
        documento_id: int,
        content: bytes,
        filename: str,
        compress_images: bool = True
    ) -> str:
        """
        Guarda un archivo en disco.
        
        Args:
            solicitud_id: ID de la solicitud
            documento_id: ID del documento
            content: Contenido del archivo en bytes
            filename: Nombre original del archivo
            compress_images: Si comprimir imágenes automáticamente
            
        Returns:
            str: Ruta relativa del archivo guardado (desde UPLOADS_DIR)
        """
        # Validar archivo
        is_valid, error = FileStorageService.validate_file(content, filename)
        if not is_valid:
            raise ValueError(error)

        # Comprimir si es imagen
        if compress_images:
            content, filename = FileStorageService.compress_image(content, filename)

        # Crear estructura de directorios
        # /uploads/solicitudes/{solicitud_id}/
        directory = os.path.join(
            FileStorageConfig.UPLOADS_DIR,
            "solicitudes",
            str(solicitud_id)
        )
        FileStorageService._ensure_directory(directory)

        # Generar nombre único
        unique_filename = FileStorageService._generate_unique_filename(filename, documento_id)

        # Ruta completa
        full_path = os.path.join(directory, unique_filename)

        # Guardar archivo
        with open(full_path, 'wb') as f:
            f.write(content)

        # Retornar ruta relativa desde UPLOADS_DIR
        relative_path = os.path.join("solicitudes", str(solicitud_id), unique_filename)

        logger.info(f"Archivo guardado: {relative_path} ({len(content) / 1024:.1f}KB)")

        return relative_path

    @staticmethod
    def get_file(relative_path: str) -> Optional[bytes]:
        """
        Lee un archivo desde disco.
        
        Args:
            relative_path: Ruta relativa desde UPLOADS_DIR
            
        Returns:
            bytes o None si no existe
        """
        full_path = os.path.join(FileStorageConfig.UPLOADS_DIR, relative_path)

        if not os.path.exists(full_path):
            logger.warning(f"Archivo no encontrado: {full_path}")
            return None

        with open(full_path, 'rb') as f:
            return f.read()

    @staticmethod
    def get_full_path(relative_path: str) -> str:
        """
        Obtiene la ruta completa de un archivo.
        
        Args:
            relative_path: Ruta relativa desde UPLOADS_DIR
            
        Returns:
            str: Ruta completa en el sistema de archivos
        """
        return os.path.join(FileStorageConfig.UPLOADS_DIR, relative_path)

    @staticmethod
    def delete_file(relative_path: str) -> bool:
        """
        Elimina un archivo del disco.
        
        Args:
            relative_path: Ruta relativa desde UPLOADS_DIR
            
        Returns:
            bool: True si se eliminó, False si no existía
        """
        full_path = os.path.join(FileStorageConfig.UPLOADS_DIR, relative_path)

        if not os.path.exists(full_path):
            logger.warning(f"Archivo a eliminar no encontrado: {full_path}")
            return False

        try:
            os.remove(full_path)
            logger.info(f"Archivo eliminado: {relative_path}")
            return True
        except Exception as e:
            logger.error(f"Error eliminando archivo {relative_path}: {e}")
            return False

    @staticmethod
    def file_exists(relative_path: str) -> bool:
        """Verifica si un archivo existe"""
        full_path = os.path.join(FileStorageConfig.UPLOADS_DIR, relative_path)
        return os.path.exists(full_path)

    @staticmethod
    def get_file_size(relative_path: str) -> Optional[int]:
        """Obtiene el tamaño de un archivo en bytes"""
        full_path = os.path.join(FileStorageConfig.UPLOADS_DIR, relative_path)
        if os.path.exists(full_path):
            return os.path.getsize(full_path)
        return None

    @staticmethod
    def get_file_info(relative_path: str) -> Optional[dict]:
        """
        Obtiene información de un archivo.
        
        Returns:
            dict con: size_bytes, size_mb, extension, filename, full_path
        """
        full_path = os.path.join(FileStorageConfig.UPLOADS_DIR, relative_path)

        if not os.path.exists(full_path):
            return None

        size_bytes = os.path.getsize(full_path)
        filename = os.path.basename(relative_path)

        return {
            "size_bytes": size_bytes,
            "size_mb": round(size_bytes / (1024 * 1024), 2),
            "extension": FileStorageService._get_extension(filename),
            "filename": filename,
            "full_path": full_path,
            "relative_path": relative_path
        }
