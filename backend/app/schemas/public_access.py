"""
Schemas para el sistema de acceso público
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator


class ValidarAccesoRequest(BaseModel):
    """Request para validar acceso público"""
    numero_solicitud: str = Field(..., min_length=5, max_length=50)
    tipo_documento: str = Field(..., regex="^(PASAPORTE|CEDULA)$")
    numero_documento: str = Field(..., min_length=5, max_length=50)
    
    @validator('numero_solicitud', 'numero_documento')
    def to_uppercase(cls, v):
        return v.upper().strip()


class ValidarAccesoResponse(BaseModel):
    """Response de validación exitosa"""
    access_token: str
    expires_in: int
    solicitud: dict


class EtapaPublica(BaseModel):
    """Etapa visible públicamente"""
    nombre: str
    estado: str  # COMPLETADO, EN_PROCESO, PENDIENTE
    fecha_inicio: Optional[datetime]
    fecha_fin: Optional[datetime]
    orden: int


class DocumentoPublico(BaseModel):
    """Documento visible públicamente"""
    nombre: str
    cargado: bool
    fecha_carga: Optional[datetime]
    requerido: bool


class SolicitantePublico(BaseModel):
    """Información pública del solicitante"""
    nombre_completo: str
    numero_documento: str


class WorkflowPublico(BaseModel):
    """Workflow visible públicamente"""
    etapa_actual: Optional[str]
    etapas: List[EtapaPublica]


class SolicitudPublicaResponse(BaseModel):
    """Respuesta completa de una solicitud pública"""
    numero_solicitud: str
    tipo_tramite: str
    fecha_solicitud: datetime
    estado_actual: str
    solicitante: SolicitantePublico
    workflow: WorkflowPublico
    documentos_requeridos: List[DocumentoPublico]
    observaciones: Optional[str]
    proximo_paso: Optional[str]
    
    class Config:
        from_attributes = True


class AccesoPublicoCreate(BaseModel):
    """Modelo para registrar un acceso público"""
    solicitud_id: int
    numero_documento: str
    tipo_documento: str
    ip_address: Optional[str]
    user_agent: Optional[str]
    token_temporal: Optional[str]
    token_expiracion: Optional[datetime]


class AccesoPublicoInDB(BaseModel):
    """Modelo de acceso público en la BD"""
    acceso_publico_id: int
    solicitud_id: int
    numero_documento: str
    tipo_documento: str
    fecha_acceso: datetime
    ip_address: Optional[str]
    user_agent: Optional[str]
    intentos_fallidos: int
    bloqueado_hasta: Optional[datetime]
    fecha_creacion: datetime
    
    class Config:
        from_attributes = True
