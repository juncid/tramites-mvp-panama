"""
Configuración base para tests
Sistema de Trámites Migratorios de Panamá

Este módulo configura:
- Base de datos de test en memoria
- Cliente de test de FastAPI
- Fixtures comunes
- Mocks de servicios externos
"""

import os
import pytest
import tempfile
from datetime import datetime, date
from typing import Generator, Dict, Any
from unittest.mock import Mock, patch

import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, StaticPool
from sqlalchemy.orm import sessionmaker, Session
from faker import Faker

# Configurar variables de entorno para testing
os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["REDIS_URL"] = "redis://localhost:6379/15"  # BD de test
os.environ["LOG_LEVEL"] = "WARNING"

from app.main import app
from app.database import get_db, Base
from app.redis_client import get_redis

# Configurar Faker para datos de prueba
fake = Faker(['es_ES', 'en_US'])
Faker.seed(12345)  # Seed fijo para reproducibilidad


# ==========================================
# DATABASE FIXTURES
# ==========================================

@pytest.fixture(scope="session")
def test_engine():
    """
    Crea motor de BD SQLite en memoria para tests.
    Scope: session - se crea una vez por sesión de tests.
    """
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={
            "check_same_thread": False,
        },
        poolclass=StaticPool,
        echo=False  # Cambiar a True para debug SQL
    )
    
    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)
    
    return engine


@pytest.fixture(scope="function")
def db_session(test_engine) -> Generator[Session, None, None]:
    """
    Crea sesión de BD para cada test.
    Scope: function - nueva sesión para cada test.
    Se hace rollback después de cada test.
    """
    connection = test_engine.connect()
    transaction = connection.begin()
    
    SessionLocal = sessionmaker(bind=connection)
    session = SessionLocal()
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """
    Cliente de test de FastAPI con BD mockeada.
    """
    # Create a comprehensive Redis mock
    class MockRedis:
        def __init__(self):
            self.data = {}
            self.hashes = {}
            self.lists = {}
            
        def get(self, key):
            return self.data.get(key, None)
            
        def setex(self, key, timeout, value):
            self.data[key] = value
            return True
            
        def delete(self, *keys):
            """Delete one or more keys, returns number of deleted keys"""
            # Handle case where keys might be a Mock
            if len(keys) == 1 and hasattr(keys[0], '_mock_name'):
                # If a Mock is passed, just return 0 (no keys deleted)
                return 0
            deleted_count = 0
            for key in keys:
                if isinstance(key, str) and key in self.data:
                    del self.data[key]
                    deleted_count += 1
            return deleted_count
            
        def keys(self, pattern):
            """Return keys matching pattern"""
            if pattern == "tramites:*":
                return [k for k in self.data.keys() if isinstance(k, str) and k.startswith("tramites:")]
            return []
            
        # Hash operations for metrics
        def hincrby(self, name, key, amount=1):
            """Increment hash field by amount"""
            if name not in self.hashes:
                self.hashes[name] = {}
            current = int(self.hashes[name].get(key, 0))
            self.hashes[name][key] = current + amount
            return self.hashes[name][key]
            
        def hset(self, name, key=None, value=None, mapping=None):
            """Set hash field to value"""
            if name not in self.hashes:
                self.hashes[name] = {}
            if mapping:
                self.hashes[name].update(mapping)
                return len(mapping)
            elif key is not None and value is not None:
                self.hashes[name][key] = value
                return 1
            return 0
            
        def hgetall(self, name):
            """Get all fields and values in a hash"""
            return self.hashes.get(name, {})
            
        # List operations for metrics
        def lpush(self, name, *values):
            """Push one or more values to the head of a list"""
            if name not in self.lists:
                self.lists[name] = []
            for value in values:
                self.lists[name].insert(0, value)
            return len(self.lists[name])
            
        def ltrim(self, name, start, end):
            """Trim a list to the specified range"""
            if name in self.lists:
                self.lists[name] = self.lists[name][start:end+1]
            return True
            
        def expire(self, name, time):
            """Set a timeout on a key (mock - doesn't actually expire)"""
            return True
    
    mock_redis = MockRedis()
    
    def get_test_db():
        return db_session
    
    def get_test_redis():
        return mock_redis
    
    # Sobrescribir dependencias
    app.dependency_overrides[get_db] = get_test_db
    app.dependency_overrides[get_redis] = get_test_redis
    
    # También parchear la función get_redis directamente para casos donde no se usa inyección
    # Only patch modules that actually import get_redis
    with patch('app.routes.get_redis', return_value=mock_redis), \
         patch('app.redis_client.get_redis', return_value=mock_redis), \
         patch('app.main.get_redis', return_value=mock_redis):
        
        with TestClient(app) as test_client:
            yield test_client
    
    # Limpiar overrides
    app.dependency_overrides.clear()


# ==========================================
# REDIS FIXTURES
# ==========================================

@pytest.fixture
def mock_redis():
    """Mock de Redis para tests que no requieren persistencia"""
    mock = Mock()
    mock.get.return_value = None
    mock.setex.return_value = True
    mock.delete.return_value = 1  # Return number of deleted keys
    mock.keys.return_value = ["tramites:0:100", "tramites:10:100"]  # Sample cache keys
    
    # Configure delete to accept variable arguments (*args)
    def mock_delete(*args):
        """Mock delete that accepts variable number of arguments"""
        return len(args) if args else 0
    
    mock.delete = Mock(side_effect=mock_delete)
    
    return mock


# ==========================================
# USER FIXTURES
# ==========================================

@pytest.fixture
def admin_user() -> Dict[str, Any]:
    """Usuario administrador para tests"""
    return {
        "user_id": "ADMIN001",
        "username": "admin_test",
        "roles": ["ADMIN", "PPSH_ANALISTA", "PPSH_SUPERVISOR"],
        "es_admin": True,
        "agencia": "AGE01",
        "seccion": "SEC01"
    }


@pytest.fixture
def analista_user() -> Dict[str, Any]:
    """Usuario analista para tests"""
    return {
        "user_id": "ANA001",
        "username": "analista_test",
        "roles": ["PPSH_ANALISTA"],
        "es_admin": False,
        "agencia": "AGE01",
        "seccion": "SEC01"
    }


@pytest.fixture
def readonly_user() -> Dict[str, Any]:
    """Usuario solo lectura para tests"""
    return {
        "user_id": "READ001",
        "username": "readonly_test",
        "roles": ["PPSH_CONSULTA"],
        "es_admin": False,
        "agencia": "AGE02",
        "seccion": "SEC02"
    }


# ==========================================
# MOCK AUTHENTICATION
# ==========================================

def mock_get_current_user(user_data: Dict[str, Any]):
    """
    Factory para crear mock de autenticación
    
    Usage:
        with patch('app.routes_ppsh.get_current_user', 
                   side_effect=lambda: admin_user):
            # test code
    """
    return lambda: user_data


# ==========================================
# DATA FIXTURES
# ==========================================

@pytest.fixture
def sample_tramite_data() -> Dict[str, Any]:
    """Datos de ejemplo para crear trámite"""
    return {
        "titulo": fake.sentence(nb_words=4),
        "descripcion": fake.text(max_nb_chars=200),
        "estado": "PENDIENTE"
    }


@pytest.fixture
def sample_solicitud_ppsh_data() -> Dict[str, Any]:
    """Datos de ejemplo para solicitud PPSH"""
    return {
        "tipo_solicitud": "INDIVIDUAL",
        "cod_causa_humanitaria": 1,
        "descripcion_caso": fake.text(max_nb_chars=500),
        "prioridad": "NORMAL",
        "observaciones_generales": fake.text(max_nb_chars=100),
        "solicitantes": [
            {
                "es_titular": True,
                "tipo_documento": "PASAPORTE",
                "num_documento": fake.passport_number(),
                "pais_emisor": "VEN",
                "primer_nombre": fake.first_name(),
                "primer_apellido": fake.last_name(),
                "fecha_nacimiento": fake.date_of_birth(minimum_age=18, maximum_age=80),
                "cod_sexo": fake.random_element(elements=("M", "F")),
                "cod_nacionalidad": "VEN",
                "email": fake.email(),
                "telefono": fake.phone_number()[:20]
            }
        ]
    }


@pytest.fixture
def sample_documento_data() -> Dict[str, Any]:
    """Datos de ejemplo para documento"""
    return {
        "cod_tipo_documento": 1,
        "nombre_archivo": "documento_test.pdf",
        "extension": "pdf",
        "observaciones": "Documento de prueba"
    }


# ==========================================
# TIME FIXTURES
# ==========================================

@pytest.fixture
def fixed_datetime():
    """Fecha y hora fija para tests que dependan del tiempo"""
    return datetime(2025, 10, 14, 10, 30, 0)


@pytest.fixture
def fixed_date():
    """Fecha fija para tests"""
    return date(2025, 10, 14)


# ==========================================
# FILE FIXTURES
# ==========================================

@pytest.fixture
def sample_pdf_file():
    """Archivo PDF de ejemplo para tests de upload"""
    content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
    return {
        "filename": "test_document.pdf",
        "content": content,
        "content_type": "application/pdf"
    }


@pytest.fixture
def sample_image_file():
    """Archivo de imagen de ejemplo para tests"""
    # Crear un PNG básico (1x1 pixel transparente)
    content = (
        b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
        b'\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01'
        b'\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82'
    )
    return {
        "filename": "test_image.png",
        "content": content,
        "content_type": "image/png"
    }


# ==========================================
# UTILITY FUNCTIONS
# ==========================================

def create_test_data(db_session: Session, model_class, **kwargs):
    """
    Función helper para crear datos de test en BD
    
    Args:
        db_session: Sesión de BD
        model_class: Clase del modelo SQLAlchemy
        **kwargs: Campos del modelo
    
    Returns:
        Instancia del modelo creada
    """
    instance = model_class(**kwargs)
    db_session.add(instance)
    db_session.commit()
    db_session.refresh(instance)
    return instance


def assert_response_success(response, expected_status: int = 200):
    """
    Helper para validar respuestas exitosas
    """
    assert response.status_code == expected_status, f"Expected {expected_status}, got {response.status_code}. Response: {response.text}"
    return response.json()


def assert_response_error(response, expected_status: int, expected_detail: str = None):
    """
    Helper para validar respuestas de error
    """
    assert response.status_code == expected_status
    if expected_detail:
        assert expected_detail in response.json().get("detail", "")


# ==========================================
# PYTEST CONFIGURATION
# ==========================================

@pytest.fixture(autouse=True)
def setup_test_environment():
    """
    Setup automático para cada test.
    Configura logging, limpia caches, etc.
    """
    # Configurar logging para tests
    import logging
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("app").setLevel(logging.WARNING)
    
    yield
    
    # Cleanup después de cada test si es necesario
    pass


# Configuración de marcadores pytest
def pytest_configure(config):
    """Configuración de marcadores pytest"""
    config.addinivalue_line(
        "markers", "unit: marca tests como unitarios"
    )
    config.addinivalue_line(
        "markers", "integration: marca tests como de integración"
    )
    config.addinivalue_line(
        "markers", "slow: marca tests lentos"
    )
    config.addinivalue_line(
        "markers", "external: marca tests que dependen de servicios externos"
    )