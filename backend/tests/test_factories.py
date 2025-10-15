"""
Factories y helpers para tests
Sistema de Trámites Migratorios de Panamá

Proporciona:
- Factories para modelos de datos
- Helpers para creación masiva de datos
- Utilidades para tests
- Mocks y stubs comunes
"""

import pytest
from datetime import datetime, date, timedelta
from typing import Dict, List, Any, Optional
from faker import Faker
import factory
from factory.alchemy import SQLAlchemyModelFactory
from sqlalchemy.orm import Session

from app.models import Tramite
from app.models_ppsh import (
    PPSHSolicitud, PPSHSolicitante, PPSHDocumento,
    PPSHEntrevista, PPSHComentario, PPSHEstado,
    PPSHCausaHumanitaria, PPSHTipoDocumento
)

# Configurar Faker
fake = Faker(['es_ES', 'en_US'])
Faker.seed(12345)


# ==========================================
# MODEL FACTORIES
# ==========================================

class TramiteFactory(SQLAlchemyModelFactory):
    """Factory para crear instancias de Tramite"""
    
    class Meta:
        model = Tramite
        sqlalchemy_session_persistence = 'commit'

    titulo = factory.LazyAttribute(lambda obj: fake.sentence(nb_words=4))
    descripcion = factory.LazyAttribute(lambda obj: fake.text(max_nb_chars=200))
    estado = factory.Iterator(['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'])
    created_at = factory.LazyFunction(datetime.now)
    updated_at = factory.LazyFunction(datetime.now)
    activo = True


class PPSHSolicitudFactory(SQLAlchemyModelFactory):
    """Factory para crear instancias de PPSHSolicitud"""
    
    class Meta:
        model = PPSHSolicitud
        sqlalchemy_session_persistence = 'commit'

    numero_solicitud = factory.Sequence(lambda n: f"PPSH-2025-{n:03d}")
    tipo_solicitud = factory.Iterator(['INDIVIDUAL', 'FAMILIAR', 'GRUPAL'])
    cod_causa_humanitaria = factory.Iterator([1, 2, 3, 4, 5])
    descripcion_caso = factory.LazyAttribute(lambda obj: fake.text(max_nb_chars=500))
    estado_actual = factory.Iterator(['RECIBIDA', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'EN_SUSPENSION'])
    prioridad = factory.Iterator(['BAJA', 'NORMAL', 'ALTA', 'URGENTE'])
    agencia = factory.Iterator(['AGE01', 'AGE02', 'AGE03'])
    seccion = factory.Iterator(['SEC01', 'SEC02', 'SEC03'])
    created_at = factory.LazyFunction(datetime.now)
    updated_at = factory.LazyFunction(datetime.now)
    observaciones_generales = factory.LazyAttribute(lambda obj: fake.text(max_nb_chars=100))


class PPSHSolicitanteFactory(SQLAlchemyModelFactory):
    """Factory para crear instancias de PPSHSolicitante"""
    
    class Meta:
        model = PPSHSolicitante
        sqlalchemy_session_persistence = 'commit'

    es_titular = factory.Iterator([True, False])
    tipo_documento = factory.Iterator(['PASAPORTE', 'CEDULA', 'OTRO'])
    num_documento = factory.LazyAttribute(lambda obj: fake.passport_number())
    pais_emisor = factory.Iterator(['VEN', 'COL', 'NIC', 'HON', 'CUB'])
    primer_nombre = factory.LazyAttribute(lambda obj: fake.first_name())
    segundo_nombre = factory.LazyAttribute(lambda obj: fake.first_name() if fake.boolean() else None)
    primer_apellido = factory.LazyAttribute(lambda obj: fake.last_name())
    segundo_apellido = factory.LazyAttribute(lambda obj: fake.last_name() if fake.boolean() else None)
    fecha_nacimiento = factory.LazyAttribute(lambda obj: fake.date_of_birth(minimum_age=18, maximum_age=80))
    cod_sexo = factory.Iterator(['M', 'F'])
    cod_nacionalidad = factory.Iterator(['VEN', 'COL', 'NIC', 'HON', 'CUB'])
    email = factory.LazyAttribute(lambda obj: fake.email())
    telefono = factory.LazyAttribute(lambda obj: fake.phone_number()[:20])
    direccion_actual = factory.LazyAttribute(lambda obj: fake.address())


class PPSHDocumentoFactory(SQLAlchemyModelFactory):
    """Factory para crear instancias de PPSHDocumento"""
    
    class Meta:
        model = PPSHDocumento
        sqlalchemy_session_persistence = 'commit'

    cod_tipo_documento = factory.Iterator([1, 2, 3, 4, 5])
    nombre_archivo = factory.LazyAttribute(lambda obj: f"{fake.word()}.pdf")
    extension = factory.Iterator(['pdf', 'jpg', 'png', 'doc', 'docx'])
    ruta_archivo = factory.LazyAttribute(lambda obj: f"/uploads/{fake.random_int(1, 1000)}/{obj.nombre_archivo}")
    observaciones = factory.LazyAttribute(lambda obj: fake.sentence())
    fecha_subida = factory.LazyFunction(datetime.now)


class PPSHEntrevistaFactory(SQLAlchemyModelFactory):
    """Factory para crear instancias de PPSHEntrevista"""
    
    class Meta:
        model = PPSHEntrevista
        sqlalchemy_session_persistence = 'commit'

    fecha_programada = factory.LazyAttribute(lambda obj: fake.future_datetime(end_date='+30d'))
    tipo_entrevista = factory.Iterator(['INICIAL', 'SEGUIMIENTO', 'FINAL'])
    modalidad = factory.Iterator(['PRESENCIAL', 'VIRTUAL', 'TELEFONICA'])
    estado = factory.Iterator(['PROGRAMADA', 'REALIZADA', 'CANCELADA', 'REPROGRAMADA'])
    resultado = factory.Iterator(['FAVORABLE', 'DESFAVORABLE', 'PENDIENTE'])
    observaciones = factory.LazyAttribute(lambda obj: fake.text(max_nb_chars=200))
    observaciones_resultado = factory.LazyAttribute(lambda obj: fake.text(max_nb_chars=300))
    recomendaciones = factory.LazyAttribute(lambda obj: fake.text(max_nb_chars=150))
    created_at = factory.LazyFunction(datetime.now)


class PPSHComentarioFactory(SQLAlchemyModelFactory):
    """Factory para crear instancias de PPSHComentario"""
    
    class Meta:
        model = PPSHComentario
        sqlalchemy_session_persistence = 'commit'

    contenido = factory.LazyAttribute(lambda obj: fake.text(max_nb_chars=500))
    es_interno = factory.Iterator([True, False])
    tipo_comentario = factory.Iterator(['SEGUIMIENTO', 'EVALUACION', 'DECISION', 'OBSERVACION'])
    usuario_creacion = factory.Iterator(['ADMIN001', 'ANA001', 'SUP001', 'READ001'])
    created_at = factory.LazyFunction(datetime.now)


# ==========================================
# DATA BUILDERS
# ==========================================

class PPSHDataBuilder:
    """Builder para crear estructuras completas de datos PPSH"""
    
    def __init__(self, db_session: Session):
        self.db_session = db_session

    def create_complete_solicitud(self, 
                                solicitud_data: Optional[Dict] = None,
                                num_solicitantes: int = 1,
                                num_documentos: int = 2,
                                num_entrevistas: int = 1,
                                num_comentarios: int = 1) -> Dict[str, Any]:
        """
        Crea una solicitud completa con todos sus componentes
        
        Returns:
            Dict con todas las entidades creadas
        """
        # 1. Crear solicitud
        solicitud_defaults = {
            'tipo_solicitud': 'INDIVIDUAL',
            'estado_actual': 'RECIBIDA',
            'agencia': 'AGE01',
            'seccion': 'SEC01'
        }
        if solicitud_data:
            solicitud_defaults.update(solicitud_data)
        
        solicitud = PPSHSolicitudFactory.create(**solicitud_defaults)
        self.db_session.flush()

        # 2. Crear solicitantes
        solicitantes = []
        for i in range(num_solicitantes):
            es_titular = i == 0  # El primero es titular
            solicitante = PPSHSolicitanteFactory.create(
                solicitud_id=solicitud.id,
                es_titular=es_titular
            )
            solicitantes.append(solicitante)

        # 3. Crear documentos
        documentos = []
        for i in range(num_documentos):
            documento = PPSHDocumentoFactory.create(
                solicitud_id=solicitud.id
            )
            documentos.append(documento)

        # 4. Crear entrevistas
        entrevistas = []
        for i in range(num_entrevistas):
            entrevista = PPSHEntrevistaFactory.create(
                solicitud_id=solicitud.id
            )
            entrevistas.append(entrevista)

        # 5. Crear comentarios
        comentarios = []
        for i in range(num_comentarios):
            comentario = PPSHComentarioFactory.create(
                solicitud_id=solicitud.id
            )
            comentarios.append(comentario)

        self.db_session.commit()

        return {
            'solicitud': solicitud,
            'solicitantes': solicitantes,
            'documentos': documentos,
            'entrevistas': entrevistas,
            'comentarios': comentarios
        }

    def create_solicitudes_by_estado(self, estados_count: Dict[str, int]) -> List[PPSHSolicitud]:
        """
        Crea solicitudes agrupadas por estado
        
        Args:
            estados_count: Dict con estado -> cantidad
            
        Returns:
            Lista de solicitudes creadas
        """
        solicitudes = []
        for estado, count in estados_count.items():
            for _ in range(count):
                solicitud = PPSHSolicitudFactory.create(estado_actual=estado)
                solicitudes.append(solicitud)
        
        self.db_session.commit()
        return solicitudes

    def create_solicitudes_by_agencia(self, agencias_count: Dict[str, int]) -> List[PPSHSolicitud]:
        """
        Crea solicitudes agrupadas por agencia
        
        Args:
            agencias_count: Dict con agencia -> cantidad
            
        Returns:
            Lista de solicitudes creadas
        """
        solicitudes = []
        for agencia, count in agencias_count.items():
            for _ in range(count):
                solicitud = PPSHSolicitudFactory.create(agencia=agencia)
                solicitudes.append(solicitud)
        
        self.db_session.commit()
        return solicitudes


class TramiteDataBuilder:
    """Builder para crear estructuras de datos de trámites"""
    
    def __init__(self, db_session: Session):
        self.db_session = db_session

    def create_tramites_by_estado(self, estados_count: Dict[str, int]) -> List[Tramite]:
        """
        Crea trámites agrupados por estado
        
        Args:
            estados_count: Dict con estado -> cantidad
            
        Returns:
            Lista de trámites creados
        """
        tramites = []
        for estado, count in estados_count.items():
            for _ in range(count):
                tramite = TramiteFactory.create(estado=estado)
                tramites.append(tramite)
        
        self.db_session.commit()
        return tramites

    def create_tramites_with_dates(self, 
                                 start_date: datetime,
                                 end_date: datetime,
                                 count: int) -> List[Tramite]:
        """
        Crea trámites con fechas en un rango específico
        
        Args:
            start_date: Fecha inicio
            end_date: Fecha fin
            count: Cantidad de trámites
            
        Returns:
            Lista de trámites creados
        """
        tramites = []
        for _ in range(count):
            fecha_random = fake.date_time_between(start_date=start_date, end_date=end_date)
            tramite = TramiteFactory.create(
                created_at=fecha_random,
                updated_at=fecha_random
            )
            tramites.append(tramite)
        
        self.db_session.commit()
        return tramites


# ==========================================
# TEST HELPERS
# ==========================================

def create_test_user(role: str = "ANALISTA", agencia: str = "AGE01") -> Dict[str, Any]:
    """
    Crea datos de usuario para tests
    
    Args:
        role: Rol del usuario (ADMIN, ANALISTA, CONSULTA)
        agencia: Agencia del usuario
        
    Returns:
        Dict con datos del usuario
    """
    user_mapping = {
        "ADMIN": {
            "user_id": "ADMIN001",
            "username": "admin_test",
            "roles": ["ADMIN", "PPSH_ANALISTA", "PPSH_SUPERVISOR"],
            "es_admin": True,
            "agencia": agencia,
            "seccion": "SEC01"
        },
        "ANALISTA": {
            "user_id": "ANA001",
            "username": "analista_test",
            "roles": ["PPSH_ANALISTA"],
            "es_admin": False,
            "agencia": agencia,
            "seccion": "SEC01"
        },
        "SUPERVISOR": {
            "user_id": "SUP001",
            "username": "supervisor_test",
            "roles": ["PPSH_SUPERVISOR", "PPSH_ANALISTA"],
            "es_admin": False,
            "agencia": agencia,
            "seccion": "SEC01"
        },
        "CONSULTA": {
            "user_id": "READ001",
            "username": "readonly_test",
            "roles": ["PPSH_CONSULTA"],
            "es_admin": False,
            "agencia": agencia,
            "seccion": "SEC01"
        }
    }
    
    return user_mapping.get(role, user_mapping["ANALISTA"])


def create_mock_file(filename: str = "test.pdf", 
                    content_type: str = "application/pdf",
                    size: int = 1024) -> Dict[str, Any]:
    """
    Crea mock de archivo para tests de upload
    
    Args:
        filename: Nombre del archivo
        content_type: Tipo MIME
        size: Tamaño en bytes
        
    Returns:
        Dict con datos del archivo mock
    """
    if content_type == "application/pdf":
        content = b"%PDF-1.4\n" + b"x" * (size - 10) + b"\n%%EOF"
    elif content_type.startswith("image/"):
        # PNG básico 1x1 pixel
        content = (
            b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
            b'\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01'
            b'\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82'
        ) + b"x" * max(0, size - 67)
    else:
        content = b"x" * size

    return {
        "filename": filename,
        "content": content,
        "content_type": content_type,
        "size": len(content)
    }


def assert_solicitud_structure(solicitud_data: Dict[str, Any], 
                             expected_fields: Optional[List[str]] = None) -> None:
    """
    Valida la estructura de datos de una solicitud PPSH
    
    Args:
        solicitud_data: Datos de la solicitud a validar
        expected_fields: Campos esperados (opcional)
    """
    default_fields = [
        'id', 'numero_solicitud', 'tipo_solicitud', 
        'estado_actual', 'agencia', 'created_at'
    ]
    
    fields_to_check = expected_fields or default_fields
    
    for field in fields_to_check:
        assert field in solicitud_data, f"Campo '{field}' faltante en solicitud"
    
    # Validaciones específicas
    if 'numero_solicitud' in solicitud_data:
        assert solicitud_data['numero_solicitud'].startswith('PPSH-'), \
            "Número de solicitud debe empezar con 'PPSH-'"
    
    if 'tipo_solicitud' in solicitud_data:
        assert solicitud_data['tipo_solicitud'] in ['INDIVIDUAL', 'FAMILIAR', 'GRUPAL'], \
            "Tipo de solicitud inválido"
    
    if 'estado_actual' in solicitud_data:
        estados_validos = ['RECIBIDA', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'EN_SUSPENSION']
        assert solicitud_data['estado_actual'] in estados_validos, \
            "Estado de solicitud inválido"


def assert_tramite_structure(tramite_data: Dict[str, Any],
                           expected_fields: Optional[List[str]] = None) -> None:
    """
    Valida la estructura de datos de un trámite
    
    Args:
        tramite_data: Datos del trámite a validar
        expected_fields: Campos esperados (opcional)
    """
    default_fields = [
        'id', 'titulo', 'descripcion', 'estado', 'created_at'
    ]
    
    fields_to_check = expected_fields or default_fields
    
    for field in fields_to_check:
        assert field in tramite_data, f"Campo '{field}' faltante en trámite"
    
    # Validaciones específicas
    if 'estado' in tramite_data:
        estados_validos = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO']
        assert tramite_data['estado'] in estados_validos, \
            "Estado de trámite inválido"
    
    if 'titulo' in tramite_data:
        assert len(tramite_data['titulo']) >= 3, \
            "Título debe tener al menos 3 caracteres"


def cleanup_test_files(base_path: str = "/tmp/test_uploads") -> None:
    """
    Limpia archivos de prueba creados durante tests
    
    Args:
        base_path: Ruta base donde se crearon archivos
    """
    import os
    import shutil
    
    if os.path.exists(base_path):
        shutil.rmtree(base_path)


# ==========================================
# PERFORMANCE HELPERS
# ==========================================

def measure_response_time(client, method: str, url: str, **kwargs) -> tuple:
    """
    Mide el tiempo de respuesta de una petición HTTP
    
    Args:
        client: Cliente de test
        method: Método HTTP (get, post, put, delete)
        url: URL del endpoint
        **kwargs: Argumentos adicionales para la petición
        
    Returns:
        Tuple (response, tiempo_en_ms)
    """
    import time
    
    start_time = time.time()
    
    method_func = getattr(client, method.lower())
    response = method_func(url, **kwargs)
    
    end_time = time.time()
    response_time_ms = (end_time - start_time) * 1000
    
    return response, response_time_ms


def create_load_test_data(db_session: Session, 
                        tramites_count: int = 100,
                        solicitudes_count: int = 50) -> Dict[str, Any]:
    """
    Crea datos masivos para tests de carga
    
    Args:
        db_session: Sesión de BD
        tramites_count: Cantidad de trámites a crear
        solicitudes_count: Cantidad de solicitudes PPSH a crear
        
    Returns:
        Dict con estadísticas de datos creados
    """
    # Crear trámites
    tramite_builder = TramiteDataBuilder(db_session)
    tramites_por_estado = {
        'PENDIENTE': tramites_count // 4,
        'EN_PROCESO': tramites_count // 4,
        'COMPLETADO': tramites_count // 4,
        'CANCELADO': tramites_count // 4
    }
    tramites = tramite_builder.create_tramites_by_estado(tramites_por_estado)
    
    # Crear solicitudes PPSH
    ppsh_builder = PPSHDataBuilder(db_session)
    solicitudes_por_estado = {
        'RECIBIDA': solicitudes_count // 5,
        'EN_REVISION': solicitudes_count // 5,
        'APROBADA': solicitudes_count // 5,
        'RECHAZADA': solicitudes_count // 5,
        'EN_SUSPENSION': solicitudes_count // 5
    }
    solicitudes = ppsh_builder.create_solicitudes_by_estado(solicitudes_por_estado)
    
    return {
        'tramites_created': len(tramites),
        'solicitudes_created': len(solicitudes),
        'total_records': len(tramites) + len(solicitudes)
    }


# ==========================================
# CUSTOM ASSERTIONS
# ==========================================

def assert_paginated_response(response_data: Dict[str, Any],
                            expected_page: int = 1,
                            expected_size: int = 50,
                            min_total: int = 0) -> None:
    """
    Valida estructura de respuesta paginada
    
    Args:
        response_data: Datos de respuesta
        expected_page: Página esperada
        expected_size: Tamaño de página esperado
        min_total: Total mínimo esperado
    """
    assert 'items' in response_data, "Falta campo 'items' en respuesta paginada"
    assert 'total' in response_data, "Falta campo 'total' en respuesta paginada"
    assert 'page' in response_data, "Falta campo 'page' en respuesta paginada"
    assert 'size' in response_data, "Falta campo 'size' en respuesta paginada"
    assert 'pages' in response_data, "Falta campo 'pages' en respuesta paginada"
    
    assert response_data['page'] == expected_page, f"Página incorrecta: {response_data['page']}"
    assert response_data['size'] == expected_size, f"Tamaño incorrecto: {response_data['size']}"
    assert response_data['total'] >= min_total, f"Total insuficiente: {response_data['total']}"
    
    assert isinstance(response_data['items'], list), "Items debe ser una lista"
    assert len(response_data['items']) <= expected_size, "Demasiados items en página"


def assert_error_response(response_data: Dict[str, Any],
                        expected_status: int,
                        expected_detail_contains: Optional[str] = None) -> None:
    """
    Valida estructura de respuesta de error
    
    Args:
        response_data: Datos de respuesta
        expected_status: Código de estado esperado
        expected_detail_contains: Texto esperado en detalle del error
    """
    assert 'detail' in response_data, "Falta campo 'detail' en respuesta de error"
    
    if expected_detail_contains:
        assert expected_detail_contains in str(response_data['detail']), \
            f"Detalle del error no contiene '{expected_detail_contains}'"