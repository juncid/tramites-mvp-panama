"""
Modelos SQLAlchemy para el Sistema PPSH
Sistema de Trámites Migratorios de Panamá

Siguiendo principios SOLID:
- Single Responsibility: Cada modelo representa una entidad única
- Open/Closed: Extensible mediante herencia
- Liskov Substitution: Los modelos pueden ser sustituidos por sus tipos base
- Interface Segregation: Interfaces claras y específicas
- Dependency Inversion: Depende de abstracciones (Base)
"""

from sqlalchemy import (
    Column, Integer, String, Date, DateTime, Boolean, 
    Text, ForeignKey, BigInteger, LargeBinary
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.infrastructure import Base


# ==========================================
# MODELOS DE CATÁLOGOS
# ==========================================

class PPSHCausaHumanitaria(Base):
    """Catálogo de causas humanitarias válidas para solicitud PPSH"""
    __tablename__ = "PPSH_CAUSA_HUMANITARIA"

    cod_causa = Column(Integer, primary_key=True, index=True)
    nombre_causa = Column(String(100), nullable=False)
    descripcion = Column(String(500))
    requiere_evidencia = Column(Boolean, nullable=False, default=True)
    activo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=func.now())
    created_by = Column(String(17))

    # Relaciones
    solicitudes = relationship("PPSHSolicitud", back_populates="causa_humanitaria")


class PPSHTipoDocumento(Base):
    """Catálogo de tipos de documentos requeridos en proceso PPSH"""
    __tablename__ = "PPSH_TIPO_DOCUMENTO"

    cod_tipo_doc = Column(Integer, primary_key=True, index=True)
    nombre_tipo = Column(String(100), nullable=False)
    es_obligatorio = Column(Boolean, nullable=False, default=False)
    descripcion = Column(String(300))
    orden = Column(Integer)
    activo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=func.now())

    # Relaciones
    documentos = relationship("PPSHDocumento", back_populates="tipo_documento")


class PPSHEstado(Base):
    """Catálogo de estados del proceso PPSH"""
    __tablename__ = "PPSH_ESTADO"

    cod_estado = Column(String(30), primary_key=True, index=True)
    nombre_estado = Column(String(100), nullable=False)
    descripcion = Column(String(300))
    orden = Column(Integer, nullable=False)
    color_hex = Column(String(7))  # Para UI: #FF0000
    es_final = Column(Boolean, nullable=False, default=False)
    activo = Column(Boolean, nullable=False, default=True)

    # Relaciones
    solicitudes_actual = relationship(
        "PPSHSolicitud", 
        foreign_keys="PPSHSolicitud.estado_actual",
        back_populates="estado"
    )
    historial_nuevo = relationship(
        "PPSHEstadoHistorial",
        foreign_keys="PPSHEstadoHistorial.estado_nuevo",
        back_populates="estado_nuevo_obj"
    )
    historial_anterior = relationship(
        "PPSHEstadoHistorial",
        foreign_keys="PPSHEstadoHistorial.estado_anterior",
        back_populates="estado_anterior_obj"
    )


# ==========================================
# MODELOS PRINCIPALES
# ==========================================

class PPSHSolicitud(Base):
    """Solicitud principal de Permiso Por razones Humanitarias"""
    __tablename__ = "PPSH_SOLICITUD"

    id_solicitud = Column(Integer, primary_key=True, index=True)
    num_expediente = Column(String(20), nullable=False, unique=True, index=True)
    tipo_solicitud = Column(String(20), nullable=False, default='INDIVIDUAL')
    cod_causa_humanitaria = Column(Integer, ForeignKey('PPSH_CAUSA_HUMANITARIA.cod_causa'), nullable=False, index=True)
    descripcion_caso = Column(String(2000))
    fecha_solicitud = Column(Date, nullable=False, default=func.current_date())
    estado_actual = Column(String(30), ForeignKey('PPSH_ESTADO.cod_estado'), nullable=False, default='RECIBIDO', index=True)
    # Foreign keys opcionales a tablas externas (sin restricciones para permitir funcionamiento independiente)
    cod_agencia = Column(String(2), index=True)
    cod_seccion = Column(String(2), index=True)
    user_id_asignado = Column(String(17), index=True)
    fecha_asignacion = Column(DateTime)
    prioridad = Column(String(10), default='NORMAL')
    observaciones_generales = Column(String(2000))
    num_resolucion = Column(String(50))
    fecha_resolucion = Column(Date)
    fecha_vencimiento_permiso = Column(Date)
    activo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=func.now())
    created_by = Column(String(17))

    # Relaciones
    causa_humanitaria = relationship("PPSHCausaHumanitaria", back_populates="solicitudes")
    estado = relationship(
        "PPSHEstado", 
        foreign_keys=[estado_actual],
        back_populates="solicitudes_actual"
    )
    solicitantes = relationship("PPSHSolicitante", back_populates="solicitud", cascade="all, delete-orphan")
    documentos = relationship("PPSHDocumento", back_populates="solicitud", cascade="all, delete-orphan")
    historial = relationship("PPSHEstadoHistorial", back_populates="solicitud", cascade="all, delete-orphan")
    entrevistas = relationship("PPSHEntrevista", back_populates="solicitud", cascade="all, delete-orphan")
    comentarios = relationship("PPSHComentario", back_populates="solicitud", cascade="all, delete-orphan")
    pagos = relationship("PPSHPago", back_populates="solicitud", cascade="all, delete-orphan")
    etapas = relationship("PPSHEtapaSolicitud", back_populates="solicitud", cascade="all, delete-orphan", order_by="PPSHEtapaSolicitud.orden")


class PPSHSolicitante(Base):
    """Datos de personas en una solicitud PPSH (titular y dependientes)"""
    __tablename__ = "PPSH_SOLICITANTE"

    id_solicitante = Column(Integer, primary_key=True, index=True)
    id_solicitud = Column(Integer, ForeignKey('PPSH_SOLICITUD.id_solicitud'), nullable=False, index=True)
    es_titular = Column(Boolean, nullable=False, default=False, index=True)
    tipo_documento = Column(String(20), nullable=False, default='PASAPORTE')
    num_documento = Column(String(50), nullable=False, index=True)
    # Foreign key opcional a tabla externa
    pais_emisor = Column(String(3), nullable=False, index=True)
    fecha_emision_doc = Column(Date)
    fecha_vencimiento_doc = Column(Date)
    primer_nombre = Column(String(50), nullable=False)
    segundo_nombre = Column(String(50))
    primer_apellido = Column(String(50), nullable=False, index=True)
    segundo_apellido = Column(String(50))
    fecha_nacimiento = Column(Date, nullable=False)
    # Campos sin foreign key a tablas externas (uso directo de códigos)
    cod_sexo = Column(String(1), nullable=False, index=True)
    cod_nacionalidad = Column(String(3), nullable=False, index=True)
    cod_estado_civil = Column(String(1), index=True)
    parentesco_titular = Column(String(20))
    email = Column(String(100))
    telefono = Column(String(20))
    direccion_pais_origen = Column(String(200))
    direccion_panama = Column(String(200))
    ocupacion = Column(String(100))
    foto = Column(LargeBinary)
    observaciones = Column(String(500))
    activo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=func.now())
    created_by = Column(String(17))

    # Relaciones
    solicitud = relationship("PPSHSolicitud", back_populates="solicitantes")
    
    @property
    def nombre_completo(self) -> str:
        """Genera el nombre completo del solicitante"""
        nombres = [self.primer_nombre]
        if self.segundo_nombre:
            nombres.append(self.segundo_nombre)
        nombres.append(self.primer_apellido)
        if self.segundo_apellido:
            nombres.append(self.segundo_apellido)
        return " ".join(nombres)


class PPSHDocumento(Base):
    """Documentos adjuntos a una solicitud PPSH"""
    __tablename__ = "PPSH_DOCUMENTO"

    id_documento = Column(Integer, primary_key=True, index=True)
    id_solicitud = Column(Integer, ForeignKey('PPSH_SOLICITUD.id_solicitud'), nullable=False, index=True)
    cod_tipo_documento = Column(Integer, ForeignKey('PPSH_TIPO_DOCUMENTO.cod_tipo_doc'), index=True)
    tipo_documento_texto = Column(String(100))
    nombre_archivo = Column(String(255), nullable=False)
    ruta_archivo = Column(String(500))
    contenido_binario = Column(LargeBinary)
    extension = Column(String(10))
    tamano_bytes = Column(BigInteger)
    hash_md5 = Column(String(32))
    observaciones = Column(String(500))
    es_obligatorio = Column(Boolean, nullable=False, default=False)
    estado_verificacion = Column(String(20), default='PENDIENTE', index=True)
    # User IDs sin foreign key a tabla externa
    verificado_por = Column(String(17), index=True)
    fecha_verificacion = Column(DateTime)
    uploaded_by = Column(String(17), index=True)
    uploaded_at = Column(DateTime, nullable=False, default=func.now())

    # Relaciones
    solicitud = relationship("PPSHSolicitud", back_populates="documentos")
    tipo_documento = relationship("PPSHTipoDocumento", back_populates="documentos")
    ocr_results = relationship("PPSHDocumentoOCR", back_populates="documento", cascade="all, delete-orphan")


class PPSHEstadoHistorial(Base):
    """Historial de cambios de estado de una solicitud PPSH"""
    __tablename__ = "PPSH_ESTADO_HISTORIAL"

    id_historial = Column(Integer, primary_key=True, index=True)
    id_solicitud = Column(Integer, ForeignKey('PPSH_SOLICITUD.id_solicitud'), nullable=False, index=True)
    estado_anterior = Column(String(30), ForeignKey('PPSH_ESTADO.cod_estado'))
    estado_nuevo = Column(String(30), ForeignKey('PPSH_ESTADO.cod_estado'), nullable=False, index=True)
    fecha_cambio = Column(DateTime, nullable=False, default=func.now(), index=True)
    # User ID sin foreign key a tabla externa
    user_id = Column(String(17), nullable=False, index=True)
    observaciones = Column(String(1000))
    es_dictamen = Column(Boolean, nullable=False, default=False, index=True)
    tipo_dictamen = Column(String(20))
    dictamen_detalle = Column(String(2000))
    dias_en_estado_anterior = Column(Integer)

    # Relaciones
    solicitud = relationship("PPSHSolicitud", back_populates="historial")
    estado_anterior_obj = relationship(
        "PPSHEstado",
        foreign_keys=[estado_anterior],
        back_populates="historial_anterior"
    )
    estado_nuevo_obj = relationship(
        "PPSHEstado",
        foreign_keys=[estado_nuevo],
        back_populates="historial_nuevo"
    )


class PPSHEntrevista(Base):
    """Entrevistas programadas o realizadas para solicitudes PPSH"""
    __tablename__ = "PPSH_ENTREVISTA"

    id_entrevista = Column(Integer, primary_key=True, index=True)
    id_solicitud = Column(Integer, ForeignKey('PPSH_SOLICITUD.id_solicitud'), nullable=False, index=True)
    fecha_programada = Column(DateTime, nullable=False, index=True)
    fecha_realizada = Column(DateTime)
    lugar = Column(String(100))
    # Campos sin foreign key a tablas externas
    cod_agencia = Column(String(2), index=True)
    entrevistador_user_id = Column(String(17), nullable=False, index=True)
    asistio = Column(Boolean)
    motivo_inasistencia = Column(String(300))
    resultado = Column(String(20), default='PENDIENTE', index=True)
    observaciones = Column(String(2000))
    acta_entrevista = Column(Text)
    requiere_segunda_entrevista = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=func.now())
    created_by = Column(String(17))

    # Relaciones
    solicitud = relationship("PPSHSolicitud", back_populates="entrevistas")


class PPSHComentario(Base):
    """Comentarios internos sobre solicitudes PPSH"""
    __tablename__ = "PPSH_COMENTARIO"

    id_comentario = Column(Integer, primary_key=True, index=True)
    id_solicitud = Column(Integer, ForeignKey('PPSH_SOLICITUD.id_solicitud'), nullable=False, index=True)
    # User ID sin foreign key a tabla externa
    user_id = Column(String(17), nullable=False, index=True)
    comentario = Column(String(2000), nullable=False)
    es_interno = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=func.now(), index=True)

    # Relaciones
    solicitud = relationship("PPSHSolicitud", back_populates="comentarios")


# ==========================================
# NUEVOS MODELOS PARA SISTEMA DE PAGOS
# ==========================================

class PPSHConceptoPago(Base):
    """Catálogo de conceptos de pago para trámites PPSH"""
    __tablename__ = "PPSH_CONCEPTO_PAGO"

    cod_concepto = Column(String(20), primary_key=True, index=True)
    nom_concepto = Column(String(50), nullable=False)
    monto_usd = Column(String(10))  # Decimal como string: "800.00"
    descripcion = Column(String(200))
    activo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=func.now())
    created_by = Column(String(17))

    # Relaciones
    pagos = relationship("PPSHPago", back_populates="concepto")


class PPSHPago(Base):
    """Registro de pagos asociados a solicitudes PPSH"""
    __tablename__ = "PPSH_PAGO"

    id_pago = Column(Integer, primary_key=True, index=True)
    id_solicitud = Column(Integer, ForeignKey('PPSH_SOLICITUD.id_solicitud'), nullable=False, index=True)
    monto_usd = Column(String(10), nullable=False)  # Decimal como string: "800.00"
    # Debe coincidir con la longitud de PPSH_CONCEPTO_PAGO.cod_concepto (String(20))
    tipo_concepto = Column(String(20), ForeignKey('PPSH_CONCEPTO_PAGO.cod_concepto'), nullable=False, index=True)
    estado_tesoreria = Column(String(20), nullable=False, default='PENDIENTE', index=True)
    num_recibo = Column(String(50), index=True)
    fecha_pago = Column(DateTime, index=True)
    metodo_pago = Column(String(20), index=True)  # 'EFECTIVO', 'CHEQUE', 'TRANSFERENCIA'
    banco_emisor = Column(String(50))
    num_cheque = Column(String(20))
    num_transferencia = Column(String(50))
    observaciones = Column(String(500))
    created_at = Column(DateTime, nullable=False, default=func.now())
    created_by = Column(String(17))

    # Relaciones
    solicitud = relationship("PPSHSolicitud", back_populates="pagos")
    concepto = relationship("PPSHConceptoPago", back_populates="pagos")


class PPSHEtapaSolicitud(Base):
    """Tracking de etapas del proceso PPSH por solicitud"""
    __tablename__ = "PPSH_ETAPA_SOLICITUD"

    id_etapa_solicitud = Column(Integer, primary_key=True, index=True)
    id_solicitud = Column(Integer, ForeignKey('PPSH_SOLICITUD.id_solicitud'), nullable=False, index=True)
    codigo_etapa = Column(String(20), nullable=False, index=True)  # "1.2", "1.7", etc.
    nombre_etapa = Column(String(500), nullable=False)
    descripcion = Column(String(2000))
    estado = Column(String(20), nullable=False, default='PENDIENTE', index=True)  # PENDIENTE, EN_PROCESO, COMPLETADO
    orden = Column(Integer, nullable=False)
    fecha_inicio = Column(DateTime)
    fecha_completado = Column(DateTime)
    completado_por = Column(String(17))
    observaciones = Column(String(1000))
    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relaciones
    solicitud = relationship("PPSHSolicitud", back_populates="etapas")
