"""
Schemas Pydantic para el Sistema PPSH
Sistema de Trámites Migratorios de Panamá

Siguiendo principios SOLID:
- Single Responsibility: Cada schema valida una entidad específica
- Open/Closed: Extensible mediante herencia
- Liskov Substitution: Los schemas pueden ser sustituidos por sus tipos base
- Interface Segregation: Schemas separados para crear, actualizar y leer
- Dependency Inversion: Depende de abstracciones (BaseModel)
"""

from pydantic import BaseModel, Field, EmailStr, field_validator, model_validator
from datetime import date, datetime
from typing import Optional, List
from enum import Enum


# ==========================================
# ENUMS
# ==========================================

class TipoSolicitudEnum(str, Enum):
    """Tipos de solicitud PPSH"""
    INDIVIDUAL = "INDIVIDUAL"
    GRUPAL = "GRUPAL"


class PrioridadEnum(str, Enum):
    """Niveles de prioridad"""
    ALTA = "ALTA"
    NORMAL = "NORMAL"
    BAJA = "BAJA"


class TipoDocumentoEnum(str, Enum):
    """Tipos de documento de identidad"""
    PASAPORTE = "PASAPORTE"
    CEDULA = "CEDULA"
    OTRO = "OTRO"


class ParentescoEnum(str, Enum):
    """Tipos de parentesco con titular"""
    CONYUGE = "CONYUGE"
    HIJO = "HIJO"
    PADRE = "PADRE"
    MADRE = "MADRE"
    HERMANO = "HERMANO"


class EstadoVerificacionEnum(str, Enum):
    """Estados de verificación de documentos"""
    PENDIENTE = "PENDIENTE"
    VERIFICADO = "VERIFICADO"
    RECHAZADO = "RECHAZADO"


class ResultadoEntrevistaEnum(str, Enum):
    """Resultados de entrevista"""
    PENDIENTE = "PENDIENTE"
    FAVORABLE = "FAVORABLE"
    DESFAVORABLE = "DESFAVORABLE"


class TipoDictamenEnum(str, Enum):
    """Tipos de dictamen"""
    FAVORABLE = "FAVORABLE"
    DESFAVORABLE = "DESFAVORABLE"


# ==========================================
# SCHEMAS DE CATÁLOGOS
# ==========================================

class CausaHumanitariaBase(BaseModel):
    """Base para causa humanitaria"""
    nombre_causa: str = Field(..., max_length=100)
    descripcion: Optional[str] = Field(None, max_length=500)
    requiere_evidencia: bool = True


class CausaHumanitariaResponse(CausaHumanitariaBase):
    """Response de causa humanitaria"""
    cod_causa: int
    activo: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TipoDocumentoResponse(BaseModel):
    """Response de tipo de documento"""
    cod_tipo_doc: int
    nombre_tipo: str
    es_obligatorio: bool
    descripcion: Optional[str]
    orden: Optional[int]
    categoria: Optional[str]
    activo: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class EstadoResponse(BaseModel):
    """Response de estado PPSH"""
    cod_estado: str
    nombre_estado: str
    descripcion: Optional[str]
    orden: int
    color_hex: Optional[str]
    es_final: bool
    activo: bool

    class Config:
        from_attributes = True


# ==========================================
# SCHEMAS DE SOLICITANTE
# ==========================================

class SolicitanteBase(BaseModel):
    """Base para solicitante"""
    es_titular: bool = False
    tipo_documento: TipoDocumentoEnum = TipoDocumentoEnum.PASAPORTE
    num_documento: str = Field(..., min_length=1, max_length=50)
    pais_emisor: str = Field(..., min_length=3, max_length=3)
    fecha_emision_doc: Optional[date] = None
    fecha_vencimiento_doc: Optional[date] = None
    primer_nombre: str = Field(..., min_length=1, max_length=50)
    segundo_nombre: Optional[str] = Field(None, max_length=50)
    primer_apellido: str = Field(..., min_length=1, max_length=50)
    segundo_apellido: Optional[str] = Field(None, max_length=50)
    fecha_nacimiento: date
    cod_sexo: str = Field(..., min_length=1, max_length=1)
    cod_nacionalidad: str = Field(..., min_length=3, max_length=3)
    cod_estado_civil: Optional[str] = Field(None, min_length=1, max_length=1)
    parentesco_titular: Optional[ParentescoEnum] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = Field(None, max_length=20)
    direccion_pais_origen: Optional[str] = Field(None, max_length=200)
    direccion_panama: Optional[str] = Field(None, max_length=200)
    ocupacion: Optional[str] = Field(None, max_length=100)
    observaciones: Optional[str] = Field(None, max_length=500)

    @field_validator('fecha_nacimiento')
    @classmethod
    def validar_fecha_nacimiento(cls, v: date) -> date:
        """Valida que la fecha de nacimiento sea válida"""
        if v > date.today():
            raise ValueError('La fecha de nacimiento no puede ser futura')
        if v.year < 1900:
            raise ValueError('La fecha de nacimiento debe ser posterior a 1900')
        return v

    @model_validator(mode='after')
    def validar_parentesco(self):
        """Valida que el parentesco se especifique solo para no titulares"""
        if not self.es_titular and not self.parentesco_titular:
            raise ValueError('Los dependientes deben especificar el parentesco con el titular')
        if self.es_titular and self.parentesco_titular:
            raise ValueError('El titular no debe tener parentesco')
        return self


class SolicitanteCreate(SolicitanteBase):
    """Schema para crear solicitante"""
    pass


class SolicitanteUpdate(BaseModel):
    """Schema para actualizar solicitante"""
    tipo_documento: Optional[TipoDocumentoEnum] = None
    num_documento: Optional[str] = Field(None, max_length=50)
    pais_emisor: Optional[str] = Field(None, min_length=3, max_length=3)
    fecha_emision_doc: Optional[date] = None
    fecha_vencimiento_doc: Optional[date] = None
    primer_nombre: Optional[str] = Field(None, max_length=50)
    segundo_nombre: Optional[str] = Field(None, max_length=50)
    primer_apellido: Optional[str] = Field(None, max_length=50)
    segundo_apellido: Optional[str] = Field(None, max_length=50)
    fecha_nacimiento: Optional[date] = None
    cod_sexo: Optional[str] = Field(None, min_length=1, max_length=1)
    cod_nacionalidad: Optional[str] = Field(None, min_length=3, max_length=3)
    cod_estado_civil: Optional[str] = Field(None, min_length=1, max_length=1)
    parentesco_titular: Optional[ParentescoEnum] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = Field(None, max_length=20)
    direccion_pais_origen: Optional[str] = Field(None, max_length=200)
    direccion_panama: Optional[str] = Field(None, max_length=200)
    ocupacion: Optional[str] = Field(None, max_length=100)
    observaciones: Optional[str] = Field(None, max_length=500)


class SolicitanteResponse(SolicitanteBase):
    """Response de solicitante"""
    id_solicitante: int
    id_solicitud: int
    nombre_completo: str
    activo: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ==========================================
# SCHEMAS DE SOLICITUD
# ==========================================

class SolicitudBase(BaseModel):
    """Base para solicitud PPSH"""
    tipo_solicitud: TipoSolicitudEnum = TipoSolicitudEnum.INDIVIDUAL
    cod_causa_humanitaria: int = Field(..., gt=0)
    descripcion_caso: Optional[str] = Field(None, max_length=2000)
    prioridad: PrioridadEnum = PrioridadEnum.NORMAL
    cod_agencia: Optional[str] = Field(None, max_length=2)
    cod_seccion: Optional[str] = Field(None, max_length=2)
    observaciones_generales: Optional[str] = Field(None, max_length=2000)


class SolicitudCreate(SolicitudBase):
    """Schema para crear solicitud"""
    solicitantes: List[SolicitanteCreate] = Field(..., min_length=1)

    @model_validator(mode='after')
    def validar_solicitantes(self):
        """Valida que haya al menos un titular"""
        titulares = sum(1 for s in self.solicitantes if s.es_titular)
        if titulares == 0:
            raise ValueError('Debe haber al menos un solicitante titular')
        if titulares > 1:
            raise ValueError('Solo puede haber un solicitante titular')
        
        # Validar tipo de solicitud
        if self.tipo_solicitud == TipoSolicitudEnum.INDIVIDUAL and len(self.solicitantes) > 1:
            raise ValueError('Una solicitud individual solo puede tener un solicitante')
        
        return self


class SolicitudUpdate(BaseModel):
    """Schema para actualizar solicitud"""
    tipo_solicitud: Optional[TipoSolicitudEnum] = None
    cod_causa_humanitaria: Optional[int] = Field(None, gt=0)
    descripcion_caso: Optional[str] = Field(None, max_length=2000)
    prioridad: Optional[PrioridadEnum] = None
    cod_agencia: Optional[str] = Field(None, max_length=2)
    cod_seccion: Optional[str] = Field(None, max_length=2)
    user_id_asignado: Optional[str] = Field(None, max_length=17)
    observaciones_generales: Optional[str] = Field(None, max_length=2000)
    num_resolucion: Optional[str] = Field(None, max_length=50)
    fecha_resolucion: Optional[date] = None
    fecha_vencimiento_permiso: Optional[date] = None


class SolicitudResponse(SolicitudBase):
    """Response de solicitud"""
    id_solicitud: int
    num_expediente: str
    fecha_solicitud: date
    estado_actual: str
    user_id_asignado: Optional[str]
    fecha_asignacion: Optional[datetime]
    num_resolucion: Optional[str]
    fecha_resolucion: Optional[date]
    fecha_vencimiento_permiso: Optional[date]
    activo: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    # Relaciones
    causa_humanitaria: Optional[CausaHumanitariaResponse] = None
    estado: Optional[EstadoResponse] = None
    solicitantes: List[SolicitanteResponse] = []

    class Config:
        from_attributes = True


class SolicitudListResponse(BaseModel):
    """Response simplificado para listados"""
    id_solicitud: int
    num_expediente: str
    tipo_solicitud: str
    fecha_solicitud: date
    estado_actual: str
    prioridad: str
    nombre_titular: Optional[str] = None
    total_personas: int = 0
    dias_transcurridos: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# SCHEMAS DE CAMBIO DE ESTADO
# ==========================================

class CambiarEstadoRequest(BaseModel):
    """Request para cambiar estado de solicitud"""
    estado_nuevo: str = Field(..., max_length=30)
    observaciones: Optional[str] = Field(None, max_length=1000)
    es_dictamen: bool = False
    tipo_dictamen: Optional[TipoDictamenEnum] = None
    dictamen_detalle: Optional[str] = Field(None, max_length=2000)

    @model_validator(mode='after')
    def validar_dictamen(self):
        """Valida que si es dictamen, tenga tipo y detalle"""
        if self.es_dictamen:
            if not self.tipo_dictamen:
                raise ValueError('Si es dictamen, debe especificar el tipo')
            if not self.dictamen_detalle:
                raise ValueError('Si es dictamen, debe incluir el detalle')
        return self


class EstadoHistorialResponse(BaseModel):
    """Response de historial de estado"""
    id_historial: int
    id_solicitud: int
    estado_anterior: Optional[str]
    estado_nuevo: str
    fecha_cambio: datetime
    user_id: str
    observaciones: Optional[str]
    es_dictamen: bool
    tipo_dictamen: Optional[str]
    dictamen_detalle: Optional[str]
    dias_en_estado_anterior: Optional[int]

    class Config:
        from_attributes = True


# ==========================================
# SCHEMAS DE DOCUMENTO
# ==========================================

class DocumentoCreate(BaseModel):
    """Schema para crear documento"""
    cod_tipo_documento: Optional[int] = None
    tipo_documento_texto: Optional[str] = Field(None, max_length=100)
    nombre_archivo: str = Field(..., max_length=255)
    extension: Optional[str] = Field(None, max_length=10)
    observaciones: Optional[str] = Field(None, max_length=500)


class DocumentoUpdate(BaseModel):
    """Schema para actualizar documento"""
    observaciones: Optional[str] = Field(None, max_length=500)
    estado_verificacion: Optional[EstadoVerificacionEnum] = None


class DocumentoResponse(BaseModel):
    """Response de documento"""
    id_documento: int
    id_solicitud: int
    cod_tipo_documento: Optional[int]
    tipo_documento_texto: Optional[str]
    nombre_archivo: str
    extension: Optional[str]
    tamano_bytes: Optional[int]
    estado_verificacion: str
    verificado_por: Optional[str]
    fecha_verificacion: Optional[datetime]
    uploaded_by: Optional[str]
    uploaded_at: datetime
    observaciones: Optional[str]

    class Config:
        from_attributes = True


# ==========================================
# SCHEMAS DE ENTREVISTA
# ==========================================

class EntrevistaCreate(BaseModel):
    """Schema para crear entrevista"""
    fecha_programada: datetime
    lugar: Optional[str] = Field(None, max_length=100)
    cod_agencia: Optional[str] = Field(None, max_length=2)
    entrevistador_user_id: str = Field(..., max_length=17)
    observaciones: Optional[str] = Field(None, max_length=2000)


class EntrevistaUpdate(BaseModel):
    """Schema para actualizar entrevista"""
    fecha_programada: Optional[datetime] = None
    fecha_realizada: Optional[datetime] = None
    lugar: Optional[str] = Field(None, max_length=100)
    asistio: Optional[bool] = None
    motivo_inasistencia: Optional[str] = Field(None, max_length=300)
    resultado: Optional[ResultadoEntrevistaEnum] = None
    observaciones: Optional[str] = Field(None, max_length=2000)
    acta_entrevista: Optional[str] = None
    requiere_segunda_entrevista: Optional[bool] = None


class EntrevistaResponse(BaseModel):
    """Response de entrevista"""
    id_entrevista: int
    id_solicitud: int
    fecha_programada: datetime
    fecha_realizada: Optional[datetime]
    lugar: Optional[str]
    cod_agencia: Optional[str]
    entrevistador_user_id: str
    asistio: Optional[bool]
    motivo_inasistencia: Optional[str]
    resultado: str
    observaciones: Optional[str]
    requiere_segunda_entrevista: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ==========================================
# SCHEMAS DE COMENTARIO
# ==========================================

class ComentarioCreate(BaseModel):
    """Schema para crear comentario"""
    comentario: str = Field(..., min_length=1, max_length=2000)
    es_interno: bool = True


class ComentarioResponse(BaseModel):
    """Response de comentario"""
    id_comentario: int
    id_solicitud: int
    user_id: str
    comentario: str
    es_interno: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# SCHEMAS DE BÚSQUEDA Y FILTROS
# ==========================================

class SolicitudFiltros(BaseModel):
    """Filtros para búsqueda de solicitudes"""
    estado: Optional[str] = None
    prioridad: Optional[PrioridadEnum] = None
    causa_humanitaria: Optional[int] = None
    fecha_desde: Optional[date] = None
    fecha_hasta: Optional[date] = None
    agencia: Optional[str] = None
    asignado_a: Optional[str] = None
    buscar: Optional[str] = Field(None, max_length=100)  # Búsqueda en nombre, expediente, documento


# ==========================================
# SCHEMAS DE ESTADÍSTICAS
# ==========================================

class EstadisticasPorEstado(BaseModel):
    """Estadísticas agrupadas por estado"""
    cod_estado: str
    nombre_estado: str
    color_hex: Optional[str]
    total_solicitudes: int
    promedio_dias: Optional[float]

    class Config:
        from_attributes = True


class EstadisticasGenerales(BaseModel):
    """Estadísticas generales del sistema PPSH"""
    total_solicitudes: int
    solicitudes_activas: int
    solicitudes_aprobadas: int
    solicitudes_rechazadas: int
    solicitudes_en_proceso: int
    promedio_dias_procesamiento: Optional[float]
    por_estado: List[EstadisticasPorEstado]


# ==========================================
# SCHEMAS DE RESPUESTA PAGINADA
# ==========================================

class PaginatedResponse(BaseModel):
    """Response paginado genérico"""
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[SolicitudListResponse]
