"""
Modelos SQLAlchemy para el Sistema de Workflow Dinámico
Sistema de Trámites Migratorios de Panamá

Este módulo define el sistema de workflow dinámico que permite crear
procesos configurables con etapas, formularios y preguntas personalizadas.

Author: Sistema de Trámites MVP Panamá
Date: 2025-10-20
"""

from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, 
    Text, ForeignKey, JSON, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.infrastructure import Base


# ==========================================
# ENUMS
# ==========================================

class TipoEtapa(str, enum.Enum):
    """Tipos de etapas en el workflow"""
    ETAPA = "ETAPA"
    COMPUERTA = "COMPUERTA"
    PRESENCIAL = "PRESENCIAL"


class TipoPregunta(str, enum.Enum):
    """Tipos de preguntas/campos disponibles en formularios"""
    RESPUESTA_TEXTO = "RESPUESTA_TEXTO"
    RESPUESTA_LARGA = "RESPUESTA_LARGA"
    LISTA = "LISTA"
    OPCIONES = "OPCIONES"
    DOCUMENTOS = "DOCUMENTOS"
    CARGA_ARCHIVO = "CARGA_ARCHIVO"
    DESCARGA_ARCHIVO = "DESCARGA_ARCHIVO"
    DATOS_CASO = "DATOS_CASO"
    REVISION_MANUAL_DOCUMENTOS = "REVISION_MANUAL_DOCUMENTOS"
    REVISION_OCR = "REVISION_OCR"
    IMPRESION = "IMPRESION"
    SELECCION_FECHA = "SELECCION_FECHA"


class EstadoWorkflow(str, enum.Enum):
    """Estados de un workflow"""
    BORRADOR = "BORRADOR"
    ACTIVO = "ACTIVO"
    INACTIVO = "INACTIVO"
    ARCHIVADO = "ARCHIVADO"


class EstadoInstancia(str, enum.Enum):
    """Estados de una instancia de proceso"""
    INICIADO = "INICIADO"
    EN_PROGRESO = "EN_PROGRESO"
    COMPLETADO = "COMPLETADO"
    CANCELADO = "CANCELADO"
    EN_REVISION = "EN_REVISION"


# ==========================================
# MODELOS DE WORKFLOW (PLANTILLAS)
# ==========================================

class Workflow(Base):
    """
    Workflow/Proceso principal configurable
    Ej: "Permiso de Protección de Seguridad Humanitaria"
    """
    __tablename__ = "workflow"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(50), unique=True, nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)
    version = Column(String(20), nullable=False, default="1.0")
    estado = Column(SQLEnum(EstadoWorkflow), nullable=False, default=EstadoWorkflow.BORRADOR, index=True)
    
    # Configuración visual
    color_hex = Column(String(7))  # Para UI: #0066CC
    icono = Column(String(50))
    
    # Metadatos
    categoria = Column(String(100), index=True)  # Ej: "Migración", "Residencia"
    requiere_autenticacion = Column(Boolean, nullable=False, default=True)
    es_publico = Column(Boolean, nullable=False, default=False)
    
    # Configuración de permisos
    perfiles_creadores = Column(JSON)  # Lista de perfiles que pueden crear instancias
    
    # Auditoría
    activo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    created_by = Column(String(17), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(String(17))
    
    # Relaciones
    etapas = relationship("WorkflowEtapa", back_populates="workflow", cascade="all, delete-orphan", order_by="WorkflowEtapa.orden")
    conexiones = relationship("WorkflowConexion", back_populates="workflow", cascade="all, delete-orphan")
    instancias = relationship("WorkflowInstancia", back_populates="workflow")


class WorkflowEtapa(Base):
    """
    Etapa/Nodo individual dentro de un workflow
    Cada etapa puede tener un formulario con múltiples preguntas
    """
    __tablename__ = "workflow_etapa"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey('workflow.id'), nullable=False, index=True)
    
    # Identificación
    codigo = Column(String(50), nullable=False, index=True)  # Único dentro del workflow
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)
    tipo_etapa = Column(SQLEnum(TipoEtapa), nullable=False, default=TipoEtapa.ETAPA)
    
    # Orden y posición visual
    orden = Column(Integer, nullable=False)
    posicion_x = Column(Integer)  # Para diagrama visual
    posicion_y = Column(Integer)
    
    # Configuración de permisos
    perfiles_permitidos = Column(JSON)  # ["CIUDADANO", "ABOGADO", "SISTEMA", "RECEPCIONISTA"]
    
    # Configuración de formulario
    titulo_formulario = Column(String(500))
    bajada_formulario = Column(Text)
    
    # Configuración de comportamiento
    es_etapa_inicial = Column(Boolean, nullable=False, default=False)
    es_etapa_final = Column(Boolean, nullable=False, default=False)
    requiere_validacion = Column(Boolean, nullable=False, default=False)
    permite_edicion_posterior = Column(Boolean, nullable=False, default=False)
    tiempo_estimado_minutos = Column(Integer)
    
    # Reglas de transición (opcional, JSON con condiciones)
    reglas_transicion = Column(JSON)
    
    # Auditoría
    activo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    created_by = Column(String(17))
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(String(17))
    
    # Relaciones
    workflow = relationship("Workflow", back_populates="etapas")
    preguntas = relationship("WorkflowPregunta", back_populates="etapa", cascade="all, delete-orphan", order_by="WorkflowPregunta.orden")
    conexiones_origen = relationship("WorkflowConexion", foreign_keys="WorkflowConexion.etapa_origen_id", back_populates="etapa_origen")
    conexiones_destino = relationship("WorkflowConexion", foreign_keys="WorkflowConexion.etapa_destino_id", back_populates="etapa_destino")
    respuestas_etapa = relationship("WorkflowRespuestaEtapa", back_populates="etapa")


class WorkflowConexion(Base):
    """
    Conexiones entre etapas (flechas en el diagrama)
    Define el flujo del proceso
    """
    __tablename__ = "workflow_conexion"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey('workflow.id'), nullable=False, index=True)
    etapa_origen_id = Column(Integer, ForeignKey('workflow_etapa.id'), nullable=False, index=True)
    etapa_destino_id = Column(Integer, ForeignKey('workflow_etapa.id'), nullable=False, index=True)
    
    # Configuración
    nombre = Column(String(255))  # Etiqueta de la conexión
    condicion = Column(JSON)  # Condiciones para seguir esta ruta (ej: si respuesta == "SI")
    es_predeterminada = Column(Boolean, nullable=False, default=False)
    
    # Auditoría
    activo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    created_by = Column(String(17))
    
    # Relaciones
    workflow = relationship("Workflow", back_populates="conexiones")
    etapa_origen = relationship("WorkflowEtapa", foreign_keys=[etapa_origen_id], back_populates="conexiones_origen")
    etapa_destino = relationship("WorkflowEtapa", foreign_keys=[etapa_destino_id], back_populates="conexiones_destino")


class WorkflowPregunta(Base):
    """
    Preguntas/Campos dentro de una etapa
    Define los campos del formulario de cada etapa
    """
    __tablename__ = "workflow_pregunta"

    id = Column(Integer, primary_key=True, index=True)
    etapa_id = Column(Integer, ForeignKey('workflow_etapa.id'), nullable=False, index=True)
    
    # Identificación
    codigo = Column(String(50), nullable=False, index=True)  # Único dentro de la etapa
    pregunta = Column(Text, nullable=False)
    tipo_pregunta = Column(SQLEnum(TipoPregunta), nullable=False)
    
    # Orden
    orden = Column(Integer, nullable=False)
    
    # Configuración de validación
    es_obligatoria = Column(Boolean, nullable=False, default=False)
    validacion_regex = Column(String(500))
    mensaje_validacion = Column(String(500))
    
    # Configuración específica por tipo
    opciones = Column(JSON)  # Para LISTA, OPCIONES: ["Opción 1", "Opción 2"]
    opciones_datos_caso = Column(JSON)  # Para DATOS_CASO: ["BESEX", "Nombre", "Nacionalidad", etc.]
    permite_multiple = Column(Boolean, nullable=False, default=False)  # Para OPCIONES, DOCUMENTOS
    
    # Configuración de archivos (para tipos de carga)
    extensiones_permitidas = Column(JSON)  # [".pdf", ".jpg", ".png"]
    tamano_maximo_mb = Column(Integer)
    requiere_ocr = Column(Boolean, nullable=False, default=False)
    
    # Ayuda y placeholder
    texto_ayuda = Column(Text)
    placeholder = Column(String(255))
    valor_predeterminado = Column(String(500))
    
    # Condicionales (mostrar/ocultar según otras respuestas)
    mostrar_si = Column(JSON)  # Condiciones para mostrar esta pregunta
    
    # Auditoría
    activo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    created_by = Column(String(17))
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(String(17))
    
    # Relaciones
    etapa = relationship("WorkflowEtapa", back_populates="preguntas")
    respuestas = relationship("WorkflowRespuesta", back_populates="pregunta")


# ==========================================
# MODELOS DE INSTANCIAS (EJECUCIÓN)
# ==========================================

class WorkflowInstancia(Base):
    """
    Instancia de ejecución de un workflow
    Representa un caso específico en proceso
    """
    __tablename__ = "workflow_instancia"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey('workflow.id'), nullable=False, index=True)
    
    # Identificación
    num_expediente = Column(String(50), unique=True, nullable=False, index=True)
    nombre_instancia = Column(String(255))
    
    # Estado
    estado = Column(SQLEnum(EstadoInstancia), nullable=False, default=EstadoInstancia.INICIADO, index=True)
    etapa_actual_id = Column(Integer, ForeignKey('workflow_etapa.id'), index=True)
    
    # Datos del solicitante/creador
    creado_por_user_id = Column(String(17), nullable=False, index=True)
    asignado_a_user_id = Column(String(17), index=True)
    
    # Seguimiento temporal
    fecha_inicio = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    fecha_estimada_fin = Column(DateTime(timezone=True))
    fecha_fin = Column(DateTime(timezone=True))
    
    # Metadatos adicionales
    metadata_adicional = Column(JSON)  # Datos extras del caso
    prioridad = Column(String(10), default='NORMAL')
    
    # Auditoría
    activo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(String(17))
    
    # Relaciones
    workflow = relationship("Workflow", back_populates="instancias")
    etapa_actual = relationship("WorkflowEtapa", foreign_keys=[etapa_actual_id])
    respuestas_etapa = relationship("WorkflowRespuestaEtapa", back_populates="instancia", cascade="all, delete-orphan")
    historial = relationship("WorkflowInstanciaHistorial", back_populates="instancia", cascade="all, delete-orphan", order_by="WorkflowInstanciaHistorial.created_at.desc()")
    comentarios = relationship("WorkflowComentario", back_populates="instancia", cascade="all, delete-orphan")


class WorkflowRespuestaEtapa(Base):
    """
    Conjunto de respuestas de una etapa completada
    Agrupa todas las respuestas de un formulario de etapa
    """
    __tablename__ = "workflow_respuesta_etapa"

    id = Column(Integer, primary_key=True, index=True)
    instancia_id = Column(Integer, ForeignKey('workflow_instancia.id'), nullable=False, index=True)
    etapa_id = Column(Integer, ForeignKey('workflow_etapa.id'), nullable=False, index=True)
    
    # Estado de la respuesta de la etapa
    completada = Column(Boolean, nullable=False, default=False)
    fecha_inicio = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    fecha_completado = Column(DateTime(timezone=True))
    
    # Usuario que completó
    completado_por_user_id = Column(String(17), index=True)
    
    # Auditoría
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(String(17))
    
    # Relaciones
    instancia = relationship("WorkflowInstancia", back_populates="respuestas_etapa")
    etapa = relationship("WorkflowEtapa", back_populates="respuestas_etapa")
    respuestas = relationship("WorkflowRespuesta", back_populates="respuesta_etapa", cascade="all, delete-orphan")


class WorkflowRespuesta(Base):
    """
    Respuesta individual a una pregunta en una instancia
    """
    __tablename__ = "workflow_respuesta"

    id = Column(Integer, primary_key=True, index=True)
    respuesta_etapa_id = Column(Integer, ForeignKey('workflow_respuesta_etapa.id'), nullable=False, index=True)
    pregunta_id = Column(Integer, ForeignKey('workflow_pregunta.id'), nullable=False, index=True)
    
    # Valores de respuesta (usar el apropiado según tipo de pregunta)
    valor_texto = Column(Text)
    valor_json = Column(JSON)  # Para respuestas complejas (listas, múltiples valores, datos caso)
    valor_fecha = Column(DateTime(timezone=True))
    valor_booleano = Column(Boolean)
    
    # Para archivos
    archivos = Column(JSON)  # Lista de referencias a archivos subidos
    
    # Auditoría
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    created_by = Column(String(17))
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(String(17))
    
    # Relaciones
    respuesta_etapa = relationship("WorkflowRespuestaEtapa", back_populates="respuestas")
    pregunta = relationship("WorkflowPregunta", back_populates="respuestas")


class WorkflowInstanciaHistorial(Base):
    """
    Historial de cambios y transiciones de una instancia
    """
    __tablename__ = "workflow_instancia_historial"

    id = Column(Integer, primary_key=True, index=True)
    instancia_id = Column(Integer, ForeignKey('workflow_instancia.id'), nullable=False, index=True)
    
    # Información del cambio
    tipo_cambio = Column(String(50), nullable=False, index=True)  # TRANSICION, ASIGNACION, CAMBIO_ESTADO
    etapa_origen_id = Column(Integer, ForeignKey('workflow_etapa.id'))
    etapa_destino_id = Column(Integer, ForeignKey('workflow_etapa.id'))
    estado_anterior = Column(String(50))
    estado_nuevo = Column(String(50))
    
    # Descripción
    descripcion = Column(Text)
    datos_adicionales = Column(JSON)
    
    # Auditoría
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    created_by = Column(String(17), nullable=False, index=True)
    
    # Relaciones
    instancia = relationship("WorkflowInstancia", back_populates="historial")
    etapa_origen = relationship("WorkflowEtapa", foreign_keys=[etapa_origen_id])
    etapa_destino = relationship("WorkflowEtapa", foreign_keys=[etapa_destino_id])


class WorkflowComentario(Base):
    """
    Comentarios en una instancia de workflow
    """
    __tablename__ = "workflow_comentario"

    id = Column(Integer, primary_key=True, index=True)
    instancia_id = Column(Integer, ForeignKey('workflow_instancia.id'), nullable=False, index=True)
    
    # Contenido
    comentario = Column(Text, nullable=False)
    es_interno = Column(Boolean, nullable=False, default=True)
    es_notificacion = Column(Boolean, nullable=False, default=False)
    
    # Archivos adjuntos
    archivos = Column(JSON)
    
    # Auditoría
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    created_by = Column(String(17), nullable=False, index=True)
    
    # Relaciones
    instancia = relationship("WorkflowInstancia", back_populates="comentarios")
