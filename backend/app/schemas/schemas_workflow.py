"""
Schemas Pydantic para el Sistema de Workflow Dinámico
Sistema de Trámites Migratorios de Panamá

Define las estructuras de datos para validación y serialización
de las operaciones del workflow dinámico.

Author: Sistema de Trámites MVP Panamá
Date: 2025-10-20
"""

from pydantic import BaseModel, Field, validator, ConfigDict
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum


# ==========================================
# ENUMS
# ==========================================

class TipoEtapaEnum(str, Enum):
    """Tipos de etapas en el workflow"""
    ETAPA = "ETAPA"
    COMPUERTA = "COMPUERTA"
    PRESENCIAL = "PRESENCIAL"


class TipoPreguntaEnum(str, Enum):
    """Tipos de preguntas/campos disponibles"""
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


class EstadoWorkflowEnum(str, Enum):
    """Estados de un workflow"""
    BORRADOR = "BORRADOR"
    ACTIVO = "ACTIVO"
    INACTIVO = "INACTIVO"
    ARCHIVADO = "ARCHIVADO"


class EstadoInstanciaEnum(str, Enum):
    """Estados de una instancia"""
    INICIADO = "INICIADO"
    EN_PROGRESO = "EN_PROGRESO"
    COMPLETADO = "COMPLETADO"
    CANCELADO = "CANCELADO"
    EN_REVISION = "EN_REVISION"


# ==========================================
# SCHEMAS DE PREGUNTA
# ==========================================

class WorkflowPreguntaBase(BaseModel):
    """Schema base para pregunta"""
    codigo: str = Field(..., max_length=50, description="Código único de la pregunta dentro de la etapa")
    pregunta: str = Field(..., description="Texto de la pregunta")
    tipo_pregunta: TipoPreguntaEnum
    orden: int = Field(..., ge=0, description="Orden de aparición")
    es_obligatoria: bool = False
    validacion_regex: Optional[str] = Field(None, max_length=500)
    mensaje_validacion: Optional[str] = Field(None, max_length=500)
    opciones: Optional[List[str]] = None
    opciones_datos_caso: Optional[List[str]] = None
    permite_multiple: bool = False
    extensiones_permitidas: Optional[List[str]] = None
    tamano_maximo_mb: Optional[int] = Field(None, ge=1, le=100)
    requiere_ocr: bool = False
    texto_ayuda: Optional[str] = None
    placeholder: Optional[str] = Field(None, max_length=255)
    valor_predeterminado: Optional[str] = Field(None, max_length=500)
    mostrar_si: Optional[Dict[str, Any]] = None
    activo: bool = True


class WorkflowPreguntaCreate(WorkflowPreguntaBase):
    """Schema para crear pregunta con etapa_id"""
    etapa_id: int


class WorkflowPreguntaCreateNested(WorkflowPreguntaBase):
    """Schema para crear pregunta dentro de una etapa (sin etapa_id)"""
    pass


class WorkflowPreguntaUpdate(BaseModel):
    """Schema para actualizar pregunta"""
    pregunta: Optional[str] = None
    orden: Optional[int] = Field(None, ge=0)
    es_obligatoria: Optional[bool] = None
    validacion_regex: Optional[str] = Field(None, max_length=500)
    mensaje_validacion: Optional[str] = Field(None, max_length=500)
    opciones: Optional[List[str]] = None
    opciones_datos_caso: Optional[List[str]] = None
    permite_multiple: Optional[bool] = None
    extensiones_permitidas: Optional[List[str]] = None
    tamano_maximo_mb: Optional[int] = Field(None, ge=1, le=100)
    requiere_ocr: Optional[bool] = None
    texto_ayuda: Optional[str] = None
    placeholder: Optional[str] = Field(None, max_length=255)
    valor_predeterminado: Optional[str] = Field(None, max_length=500)
    mostrar_si: Optional[Dict[str, Any]] = None
    activo: Optional[bool] = None


class WorkflowPreguntaResponse(WorkflowPreguntaBase):
    """Schema de respuesta para pregunta"""
    id: int
    etapa_id: int
    created_at: datetime
    created_by: Optional[str]
    updated_at: Optional[datetime]
    updated_by: Optional[str]

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS DE ETAPA
# ==========================================

class WorkflowEtapaBase(BaseModel):
    """Schema base para etapa"""
    codigo: str = Field(..., max_length=50, description="Código único de la etapa dentro del workflow")
    nombre: str = Field(..., max_length=255)
    descripcion: Optional[str] = None
    tipo_etapa: TipoEtapaEnum = TipoEtapaEnum.ETAPA
    orden: int = Field(..., ge=0)
    posicion_x: Optional[int] = None
    posicion_y: Optional[int] = None
    perfiles_permitidos: List[str] = Field(default_factory=list, description="Lista de perfiles que pueden ejecutar esta etapa")
    titulo_formulario: Optional[str] = Field(None, max_length=500)
    bajada_formulario: Optional[str] = None
    es_etapa_inicial: bool = False
    es_etapa_final: bool = False
    requiere_validacion: bool = False
    permite_edicion_posterior: bool = False
    tiempo_estimado_minutos: Optional[int] = Field(None, ge=0)
    reglas_transicion: Optional[Dict[str, Any]] = None
    activo: bool = True


class WorkflowEtapaCreate(WorkflowEtapaBase):
    """Schema para crear etapa con workflow_id"""
    workflow_id: int
    preguntas: Optional[List[WorkflowPreguntaCreate]] = Field(default_factory=list)


class WorkflowEtapaCreateNested(WorkflowEtapaBase):
    """Schema para crear etapa dentro de un workflow (sin workflow_id)"""
    preguntas: Optional[List[WorkflowPreguntaCreateNested]] = Field(default_factory=list)


class WorkflowEtapaUpdate(BaseModel):
    """Schema para actualizar etapa"""
    nombre: Optional[str] = Field(None, max_length=255)
    descripcion: Optional[str] = None
    tipo_etapa: Optional[TipoEtapaEnum] = None
    orden: Optional[int] = Field(None, ge=0)
    posicion_x: Optional[int] = None
    posicion_y: Optional[int] = None
    perfiles_permitidos: Optional[List[str]] = None
    titulo_formulario: Optional[str] = Field(None, max_length=500)
    bajada_formulario: Optional[str] = None
    es_etapa_inicial: Optional[bool] = None
    es_etapa_final: Optional[bool] = None
    requiere_validacion: Optional[bool] = None
    permite_edicion_posterior: Optional[bool] = None
    tiempo_estimado_minutos: Optional[int] = Field(None, ge=0)
    reglas_transicion: Optional[Dict[str, Any]] = None
    activo: Optional[bool] = None


class WorkflowEtapaResponse(WorkflowEtapaBase):
    """Schema de respuesta para etapa"""
    id: int
    workflow_id: int
    preguntas: List[WorkflowPreguntaResponse] = []
    created_at: datetime
    created_by: Optional[str]
    updated_at: Optional[datetime]
    updated_by: Optional[str]

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS DE CONEXIÓN
# ==========================================

class WorkflowConexionBase(BaseModel):
    """Schema base para conexión"""
    nombre: Optional[str] = Field(None, max_length=255)
    condicion: Optional[Dict[str, Any]] = None
    es_predeterminada: bool = False
    activo: bool = True


class WorkflowConexionCreate(WorkflowConexionBase):
    """Schema para crear conexión con IDs"""
    workflow_id: int
    etapa_origen_id: int
    etapa_destino_id: int


class WorkflowConexionCreateByCodigo(WorkflowConexionBase):
    """Schema para crear conexión usando códigos de etapa (para creación completa de workflow)"""
    etapa_origen_codigo: str = Field(..., max_length=100)
    etapa_destino_codigo: str = Field(..., max_length=100)


class WorkflowConexionUpdate(BaseModel):
    """Schema para actualizar conexión"""
    nombre: Optional[str] = Field(None, max_length=255)
    condicion: Optional[Dict[str, Any]] = None
    es_predeterminada: Optional[bool] = None
    activo: Optional[bool] = None


class WorkflowConexionResponse(WorkflowConexionBase):
    """Schema de respuesta para conexión"""
    id: int
    workflow_id: int
    etapa_origen_id: int
    etapa_destino_id: int
    created_at: datetime
    created_by: Optional[str]

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS DE WORKFLOW
# ==========================================

class WorkflowBase(BaseModel):
    """Schema base para workflow"""
    codigo: str = Field(..., max_length=50, description="Código único del workflow")
    nombre: str = Field(..., max_length=255)
    descripcion: Optional[str] = None
    version: str = Field(default="1.0", max_length=20)
    estado: EstadoWorkflowEnum = EstadoWorkflowEnum.BORRADOR
    color_hex: Optional[str] = Field(None, max_length=7, pattern=r'^#[0-9A-Fa-f]{6}$')
    icono: Optional[str] = Field(None, max_length=50)
    categoria: Optional[str] = Field(None, max_length=100)
    requiere_autenticacion: bool = True
    es_publico: bool = False
    perfiles_creadores: List[str] = Field(default_factory=list)
    activo: bool = True


class WorkflowCreate(WorkflowBase):
    """Schema para crear workflow completo con etapas y conexiones anidadas"""
    etapas: Optional[List[WorkflowEtapaCreateNested]] = Field(default_factory=list)
    conexiones: Optional[List[WorkflowConexionCreateByCodigo]] = Field(default_factory=list)


class WorkflowUpdate(BaseModel):
    """Schema para actualizar workflow"""
    nombre: Optional[str] = Field(None, max_length=255)
    descripcion: Optional[str] = None
    version: Optional[str] = Field(None, max_length=20)
    estado: Optional[EstadoWorkflowEnum] = None
    color_hex: Optional[str] = Field(None, max_length=7, pattern=r'^#[0-9A-Fa-f]{6}$')
    icono: Optional[str] = Field(None, max_length=50)
    categoria: Optional[str] = Field(None, max_length=100)
    requiere_autenticacion: Optional[bool] = None
    es_publico: Optional[bool] = None
    perfiles_creadores: Optional[List[str]] = None
    activo: Optional[bool] = None


class WorkflowResponse(WorkflowBase):
    """Schema de respuesta para workflow"""
    id: int
    etapas: List[WorkflowEtapaResponse] = []
    conexiones: List[WorkflowConexionResponse] = []
    created_at: datetime
    created_by: Optional[str]
    updated_at: Optional[datetime]
    updated_by: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class WorkflowListResponse(BaseModel):
    """Schema de respuesta para lista de workflows"""
    id: int
    codigo: str
    nombre: str
    descripcion: Optional[str]
    version: str
    estado: EstadoWorkflowEnum
    categoria: Optional[str]
    activo: bool
    created_at: datetime
    total_etapas: int = 0
    total_instancias: int = 0

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS DE RESPUESTA
# ==========================================

class WorkflowRespuestaBase(BaseModel):
    """Schema base para respuesta"""
    pregunta_id: int
    valor_texto: Optional[str] = None
    valor_json: Optional[Dict[str, Any]] = None
    valor_fecha: Optional[datetime] = None
    valor_booleano: Optional[bool] = None
    archivos: Optional[List[Dict[str, Any]]] = None


class WorkflowRespuestaCreate(WorkflowRespuestaBase):
    """Schema para crear respuesta"""
    pass


class WorkflowRespuestaUpdate(BaseModel):
    """Schema para actualizar respuesta"""
    valor_texto: Optional[str] = None
    valor_json: Optional[Dict[str, Any]] = None
    valor_fecha: Optional[datetime] = None
    valor_booleano: Optional[bool] = None
    archivos: Optional[List[Dict[str, Any]]] = None


class WorkflowRespuestaResponse(WorkflowRespuestaBase):
    """Schema de respuesta para respuesta"""
    id: int
    respuesta_etapa_id: int
    created_at: datetime
    created_by: Optional[str]
    updated_at: Optional[datetime]
    updated_by: Optional[str]

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS DE RESPUESTA DE ETAPA
# ==========================================

class WorkflowRespuestaEtapaBase(BaseModel):
    """Schema base para respuesta de etapa"""
    etapa_id: int
    completada: bool = False


class WorkflowRespuestaEtapaCreate(WorkflowRespuestaEtapaBase):
    """Schema para crear respuesta de etapa"""
    instancia_id: int
    respuestas: List[WorkflowRespuestaCreate] = Field(default_factory=list)


class WorkflowRespuestaEtapaUpdate(BaseModel):
    """Schema para actualizar respuesta de etapa"""
    completada: Optional[bool] = None
    respuestas: Optional[List[WorkflowRespuestaCreate]] = None


class WorkflowRespuestaEtapaResponse(WorkflowRespuestaEtapaBase):
    """Schema de respuesta para respuesta de etapa"""
    id: int
    instancia_id: int
    fecha_inicio: datetime
    fecha_completado: Optional[datetime]
    completado_por_user_id: Optional[str]
    respuestas: List[WorkflowRespuestaResponse] = []
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS DE INSTANCIA
# ==========================================

class WorkflowInstanciaBase(BaseModel):
    """Schema base para instancia"""
    nombre_instancia: Optional[str] = Field(None, max_length=255)
    metadata_adicional: Optional[Dict[str, Any]] = None
    prioridad: str = Field(default="NORMAL", max_length=10)


class WorkflowInstanciaCreate(WorkflowInstanciaBase):
    """Schema para crear instancia"""
    workflow_id: int
    datos_iniciales: Optional[Dict[str, Any]] = Field(None, description="Datos iniciales de la primera etapa")


class WorkflowInstanciaUpdate(BaseModel):
    """Schema para actualizar instancia"""
    nombre_instancia: Optional[str] = Field(None, max_length=255)
    estado: Optional[EstadoInstanciaEnum] = None
    asignado_a_user_id: Optional[str] = None
    metadata_adicional: Optional[Dict[str, Any]] = None
    prioridad: Optional[str] = Field(None, max_length=10)


class WorkflowInstanciaResponse(WorkflowInstanciaBase):
    """Schema de respuesta para instancia"""
    id: int
    workflow_id: int
    num_expediente: str
    estado: EstadoInstanciaEnum
    etapa_actual_id: Optional[int]
    creado_por_user_id: str
    asignado_a_user_id: Optional[str]
    fecha_inicio: datetime
    fecha_estimada_fin: Optional[datetime]
    fecha_fin: Optional[datetime]
    activo: bool
    created_at: datetime
    updated_at: Optional[datetime]
    updated_by: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class WorkflowInstanciaDetalleResponse(WorkflowInstanciaResponse):
    """Schema detallado de instancia con respuestas"""
    workflow: WorkflowResponse
    etapa_actual: Optional[WorkflowEtapaResponse]
    respuestas_etapa: List[WorkflowRespuestaEtapaResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS DE HISTORIAL
# ==========================================

class WorkflowHistorialCreate(BaseModel):
    """Schema para crear entrada de historial"""
    tipo_cambio: str = Field(..., max_length=50)
    etapa_origen_id: Optional[int] = None
    etapa_destino_id: Optional[int] = None
    estado_anterior: Optional[str] = None
    estado_nuevo: Optional[str] = None
    descripcion: Optional[str] = None
    datos_adicionales: Optional[Dict[str, Any]] = None


class WorkflowHistorialResponse(BaseModel):
    """Schema de respuesta para historial"""
    id: int
    instancia_id: int
    tipo_cambio: str
    etapa_origen_id: Optional[int]
    etapa_destino_id: Optional[int]
    estado_anterior: Optional[str]
    estado_nuevo: Optional[str]
    descripcion: Optional[str]
    datos_adicionales: Optional[Dict[str, Any]]
    created_at: datetime
    created_by: str

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS DE COMENTARIO
# ==========================================

class WorkflowComentarioCreate(BaseModel):
    """Schema para crear comentario"""
    comentario: str
    es_interno: bool = True
    es_notificacion: bool = False
    archivos: Optional[List[Dict[str, Any]]] = None


class WorkflowComentarioResponse(BaseModel):
    """Schema de respuesta para comentario"""
    id: int
    instancia_id: int
    comentario: str
    es_interno: bool
    es_notificacion: bool
    archivos: Optional[List[Dict[str, Any]]]
    created_at: datetime
    created_by: str

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS DE TRANSICIÓN
# ==========================================

class WorkflowTransicionRequest(BaseModel):
    """Schema para solicitud de transición entre etapas"""
    etapa_destino_id: int
    respuestas: List[WorkflowRespuestaCreate] = Field(default_factory=list, description="Respuestas de la etapa actual antes de transicionar")
    comentario: Optional[str] = None


class WorkflowTransicionResponse(BaseModel):
    """Schema de respuesta para transición"""
    success: bool
    instancia: WorkflowInstanciaResponse
    etapa_anterior: WorkflowEtapaResponse
    etapa_nueva: WorkflowEtapaResponse
    mensaje: str
