"""
Tests para servicios PPSH
Sistema de Trámites Migratorios de Panamá

Prueba las clases de servicio:
- CatalogoService
- SolicitudService
- DocumentoService
- EntrevistaService
- PPSHComentarioService
- PPSHEtapaService
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models import models_ppsh
from app.services.services_ppsh import (
    PPSHNotFoundException, PPSHBusinessException, PPSHPermissionException,
    CatalogoService, SolicitudService, DocumentoService, 
    EntrevistaService, PPSHComentarioService, PPSHEtapaService,
    PERMISOS_CAMBIO_ESTADO, ESTADOS_REQUIEREN_MOTIVO,
    validar_permiso_cambio_estado
)
from app.schemas import schemas_ppsh


# ==========================================
# FIXTURES
# ==========================================

@pytest.fixture
def mock_db():
    """Mock de sesión de base de datos"""
    db = MagicMock(spec=Session)
    return db


@pytest.fixture
def sample_solicitud():
    """Solicitud de ejemplo para tests"""
    return models_ppsh.PPSHSolicitud(
        id_solicitud=1,
        num_expediente="PPSH-2025-001",
        tipo_solicitud="INDIVIDUAL",
        cod_causa_humanitaria=1,
        descripcion_caso="Caso de prueba",
        cod_agencia="AGE01",
        cod_seccion="SEC01",
        estado_actual="RECIBIDO",
        prioridad="NORMAL",
        created_by="TEST_USER",
        created_at=datetime.now()
    )


@pytest.fixture
def admin_user():
    """Usuario administrador de prueba"""
    return {
        "user_id": "ADMIN001",
        "username": "admin",
        "roles": ["ADMIN"],
        "es_admin": True,
        "agencia": "AGE01",
        "seccion": "SEC01"
    }


@pytest.fixture
def analista_user():
    """Usuario analista de prueba"""
    return {
        "user_id": "ANA001",
        "username": "analista",
        "roles": ["ANALISTA"],
        "es_admin": False,
        "agencia": "AGE01",
        "seccion": "SEC01"
    }


# ==========================================
# TESTS DE EXCEPCIONES
# ==========================================

class TestPPSHExcepciones:
    """Tests para excepciones personalizadas"""
    
    def test_not_found_exception(self):
        """Test: Excepción de recurso no encontrado"""
        exc = PPSHNotFoundException("Solicitud", "123")
        assert exc.status_code == 404
        assert "Solicitud" in str(exc.detail)
        assert "123" in str(exc.detail)
    
    def test_business_exception(self):
        """Test: Excepción de regla de negocio"""
        exc = PPSHBusinessException("Error de negocio")
        assert exc.status_code == 400
        assert exc.detail == "Error de negocio"
    
    def test_permission_exception(self):
        """Test: Excepción de permiso denegado"""
        exc = PPSHPermissionException("Sin acceso")
        assert exc.status_code == 403
        assert exc.detail == "Sin acceso"
    
    def test_permission_exception_default_message(self):
        """Test: Excepción de permiso con mensaje por defecto"""
        exc = PPSHPermissionException()
        assert exc.status_code == 403
        assert "permisos" in exc.detail.lower()


# ==========================================
# TESTS DE CONSTANTES
# ==========================================

class TestConstantes:
    """Tests para constantes de permisos"""
    
    def test_permisos_cambio_estado_estructura(self):
        """Test: Estructura de permisos de cambio de estado"""
        assert isinstance(PERMISOS_CAMBIO_ESTADO, dict)
        assert "RECIBIDO" in PERMISOS_CAMBIO_ESTADO
        assert "APROBADO" in PERMISOS_CAMBIO_ESTADO
        assert "RECHAZADO" in PERMISOS_CAMBIO_ESTADO
    
    def test_estados_requieren_motivo(self):
        """Test: Estados que requieren motivo"""
        assert "RECHAZADO" in ESTADOS_REQUIEREN_MOTIVO
        assert "CANCELADO" in ESTADOS_REQUIEREN_MOTIVO
        assert "SUBSANACION" in ESTADOS_REQUIEREN_MOTIVO
    
    def test_admin_puede_todo(self):
        """Test: Admin tiene acceso a todos los estados"""
        for estado, roles in PERMISOS_CAMBIO_ESTADO.items():
            assert "ADMIN" in roles, f"ADMIN debería poder cambiar a {estado}"


# ==========================================
# TESTS DE CATALOGO SERVICE
# ==========================================

class TestCatalogoService:
    """Tests para CatalogoService"""
    
    def test_catalogo_service_exists(self):
        """Test: CatalogoService existe"""
        assert CatalogoService is not None
        assert hasattr(CatalogoService, 'get_estados')
        assert hasattr(CatalogoService, 'get_tipos_documento')
        assert hasattr(CatalogoService, 'get_causas_humanitarias')


# ==========================================
# TESTS DE SOLICITUD SERVICE
# ==========================================

class TestSolicitudService:
    """Tests para SolicitudService"""
    
    def test_solicitud_service_exists(self):
        """Test: SolicitudService existe"""
        assert SolicitudService is not None
    
    def test_validar_permiso_estado_admin(self):
        """Test: Admin tiene permiso para todos los estados (saltando transición)"""
        # Admin debe poder cambiar a cualquier estado
        # Usamos transiciones válidas para cada estado
        transiciones_test = [
            ("RECIBIDO", "EN_REVISION"),
            ("EN_REVISION", "EN_EVALUACION"),
            ("EN_APROBACION", "APROBADO"),
            ("EN_APROBACION", "RECHAZADO"),
            ("RECIBIDO", "CANCELADO"),
        ]
        for estado_actual, estado_nuevo in transiciones_test:
            # ADMIN puede con motivo
            es_valido, _ = validar_permiso_cambio_estado(estado_actual, estado_nuevo, "ADMIN", "Motivo válido aquí")
            assert es_valido is True, f"ADMIN debería poder cambiar de {estado_actual} a {estado_nuevo}"
    
    def test_validar_permiso_estado_jefe_aprobado(self):
        """Test: Jefe puede aprobar con motivo"""
        es_valido, _ = validar_permiso_cambio_estado("EN_APROBACION", "APROBADO", "JEFE", "Aprobado por cumplir requisitos")
        assert es_valido is True


# ==========================================
# TESTS DE DOCUMENTO SERVICE
# ==========================================

class TestDocumentoService:
    """Tests para DocumentoService"""
    
    def test_documento_service_exists(self):
        """Test: DocumentoService existe"""
        assert DocumentoService is not None
        assert hasattr(DocumentoService, 'listar_documentos')
        assert hasattr(DocumentoService, 'registrar_documento')


# ==========================================
# TESTS DE ENTREVISTA SERVICE
# ==========================================

class TestEntrevistaService:
    """Tests para EntrevistaService"""
    
    def test_entrevista_service_exists(self):
        """Test: EntrevistaService existe"""
        assert EntrevistaService is not None
        assert hasattr(EntrevistaService, 'programar_entrevista')


# ==========================================
# TESTS DE COMENTARIO SERVICE
# ==========================================

class TestPPSHComentarioService:
    """Tests para PPSHComentarioService"""
    
    def test_comentario_service_exists(self):
        """Test: PPSHComentarioService existe"""
        assert PPSHComentarioService is not None


# ==========================================
# TESTS DE ETAPA SERVICE
# ==========================================

class TestPPSHEtapaService:
    """Tests para PPSHEtapaService"""
    
    def test_etapa_service_exists(self):
        """Test: PPSHEtapaService existe"""
        assert PPSHEtapaService is not None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
