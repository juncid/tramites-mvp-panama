"""
Schemas Pydantic para el Sistema Integrado de Migración (SIM)
Módulo de Flujo de Trámites (SIM_FT_*)

Define los esquemas de validación y serialización para las operaciones
CRUD del sistema de trámites.

Author: Sistema de Trámites MVP Panamá
Date: 2025-10-22
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


# ==========================================
# SCHEMAS DE CATÁLOGO
# ==========================================

class SimFtTramitesBase(BaseModel):
    """Schema base para tipos de trámites"""
    COD_TRAMITE: str = Field(..., max_length=10, description="Código del tipo de trámite")
    DESC_TRAMITE: str = Field(..., max_length=500, description="Descripción del trámite")
    PAG_TRAMITE: Optional[str] = Field(None, max_length=255, description="Página web asociada")
    IND_ACTIVO: str = Field("S", max_length=1, description="Indicador de activo (S/N)")


class SimFtTramitesCreate(SimFtTramitesBase):
    """Schema para crear un tipo de trámite"""
    ID_USUARIO_CREA: Optional[str] = Field(None, max_length=17)


class SimFtTramitesUpdate(BaseModel):
    """Schema para actualizar un tipo de trámite"""
    DESC_TRAMITE: Optional[str] = Field(None, max_length=500)
    PAG_TRAMITE: Optional[str] = Field(None, max_length=255)
    IND_ACTIVO: Optional[str] = Field(None, max_length=1)
    ID_USUARIO_MODIF: Optional[str] = Field(None, max_length=17)


class SimFtTramitesResponse(SimFtTramitesBase):
    """Schema de respuesta para tipos de trámites"""
    FEC_CREA_REG: Optional[datetime] = None
    FEC_MODIF_REG: Optional[datetime] = None
    ID_USUARIO_CREA: Optional[str] = None
    ID_USUARIO_MODIF: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS DE PASOS
# ==========================================

class SimFtPasosBase(BaseModel):
    """Schema base para pasos de trámites"""
    COD_TRAMITE: str = Field(..., max_length=10)
    NUM_PASO: int = Field(..., ge=1, description="Número del paso")
    NOM_DESCRIPCION: str = Field(..., max_length=255, description="Descripción del paso")
    IND_ACTIVO: str = Field("S", max_length=1)


class SimFtPasosCreate(SimFtPasosBase):
    """Schema para crear un paso"""
    ID_USUARIO_CREA: Optional[str] = Field(None, max_length=17)


class SimFtPasosUpdate(BaseModel):
    """Schema para actualizar un paso"""
    NOM_DESCRIPCION: Optional[str] = Field(None, max_length=255)
    IND_ACTIVO: Optional[str] = Field(None, max_length=1)
    ID_USUARIO_MODIF: Optional[str] = Field(None, max_length=17)


class SimFtPasosResponse(SimFtPasosBase):
    """Schema de respuesta para pasos"""
    FEC_CREA_REG: Optional[datetime] = None
    FEC_MODIF_REG: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS DE CONFIGURACIÓN DE PASOS
# ==========================================

class SimFtPasoXTramBase(BaseModel):
    """Schema base para configuración de pasos"""
    COD_TRAMITE: str = Field(..., max_length=10)
    NUM_PASO: int = Field(..., ge=1)
    COD_SECCION: str = Field(..., max_length=4, description="Sección responsable")
    ID_PASO_SGTE: Optional[int] = Field(None, ge=1, description="Paso siguiente")
    IND_ACTIVO: str = Field("S", max_length=1)


class SimFtPasoXTramCreate(SimFtPasoXTramBase):
    """Schema para crear configuración de paso"""
    ID_USUARIO_CREA: Optional[str] = Field(None, max_length=17)


class SimFtPasoXTramUpdate(BaseModel):
    """Schema para actualizar configuración de paso"""
    COD_SECCION: Optional[str] = Field(None, max_length=4)
    ID_PASO_SGTE: Optional[int] = Field(None, ge=1)
    IND_ACTIVO: Optional[str] = Field(None, max_length=1)
    ID_USUARIO_MODIF: Optional[str] = Field(None, max_length=17)


class SimFtPasoXTramResponse(SimFtPasoXTramBase):
    """Schema de respuesta para configuración de pasos"""
    FEC_CREA_REG: Optional[datetime] = None
    FEC_MODIF_REG: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS DE USUARIOS Y SECCIONES
# ==========================================

class SimFtUsuaSecBase(BaseModel):
    """Schema base para asignación usuario-sección-agencia"""
    ID_USUARIO: str = Field(..., max_length=17, description="Identificador del usuario")
    COD_SECCION: str = Field(..., max_length=4, description="Código de sección")
    COD_AGENCIA: str = Field(..., max_length=4, description="Código de agencia")
    IND_ACTIVO: str = Field("S", max_length=1, description="Indicador activo (S/N)")


class SimFtUsuaSecCreate(SimFtUsuaSecBase):
    """Schema para crear asignación usuario-sección"""
    ID_USUARIO_CREA: Optional[str] = Field(None, max_length=17)


class SimFtUsuaSecUpdate(BaseModel):
    """Schema para actualizar asignación usuario-sección"""
    IND_ACTIVO: Optional[str] = Field(None, max_length=1)
    ID_USUARIO_MODIF: Optional[str] = Field(None, max_length=17)


class SimFtUsuaSecResponse(SimFtUsuaSecBase):
    """Schema de respuesta para asignación usuario-sección"""
    FEC_CREA_REG: Optional[datetime] = None
    FEC_MODIF_REG: Optional[datetime] = None
    ID_USUARIO_CREA: Optional[str] = None
    ID_USUARIO_MODIF: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS DE CATÁLOGOS SIMPLES
# ==========================================

class SimFtEstatusBase(BaseModel):
    """Schema base para estados"""
    COD_ESTATUS: str = Field(..., max_length=2)
    NOM_ESTATUS: str = Field(..., max_length=100)
    IND_ACTIVO: str = Field("S", max_length=1)


class SimFtEstatusCreate(SimFtEstatusBase):
    """Schema para crear un estado"""
    ID_USUARIO_CREA: Optional[str] = Field(None, max_length=17)


class SimFtEstatusUpdate(BaseModel):
    """Schema para actualizar un estado"""
    NOM_ESTATUS: Optional[str] = Field(None, max_length=100)
    IND_ACTIVO: Optional[str] = Field(None, max_length=1)
    ID_USUARIO_MODIF: Optional[str] = Field(None, max_length=17)


class SimFtEstatusResponse(SimFtEstatusBase):
    """Schema de respuesta para estados"""
    FEC_CREA_REG: Optional[datetime] = None
    FEC_MODIF_REG: Optional[datetime] = None
    ID_USUARIO_CREA: Optional[str] = None
    ID_USUARIO_MODIF: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SimFtConclusionBase(BaseModel):
    """Schema base para conclusiones"""
    COD_CONCLUSION: str = Field(..., max_length=2)
    NOM_CONCLUSION: str = Field(..., max_length=100)
    IND_ACTIVO: str = Field("S", max_length=1)


class SimFtConclusionCreate(SimFtConclusionBase):
    """Schema para crear una conclusión"""
    ID_USUARIO_CREA: Optional[str] = Field(None, max_length=17)


class SimFtConclusionUpdate(BaseModel):
    """Schema para actualizar una conclusión"""
    NOM_CONCLUSION: Optional[str] = Field(None, max_length=100)
    IND_ACTIVO: Optional[str] = Field(None, max_length=1)
    ID_USUARIO_MODIF: Optional[str] = Field(None, max_length=17)


class SimFtConclusionResponse(SimFtConclusionBase):
    """Schema de respuesta para conclusiones"""
    FEC_CREA_REG: Optional[datetime] = None
    FEC_MODIF_REG: Optional[datetime] = None
    ID_USUARIO_CREA: Optional[str] = None
    ID_USUARIO_MODIF: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SimFtPrioridadBase(BaseModel):
    """Schema base para prioridades"""
    COD_PRIORIDAD: str = Field(..., max_length=1)
    NOM_PRIORIDAD: str = Field(..., max_length=50)
    IND_ACTIVO: str = Field("S", max_length=1)


class SimFtPrioridadCreate(SimFtPrioridadBase):
    """Schema para crear una prioridad"""
    ID_USUARIO_CREA: Optional[str] = Field(None, max_length=17)


class SimFtPrioridadUpdate(BaseModel):
    """Schema para actualizar una prioridad"""
    NOM_PRIORIDAD: Optional[str] = Field(None, max_length=50)
    IND_ACTIVO: Optional[str] = Field(None, max_length=1)
    ID_USUARIO_MODIF: Optional[str] = Field(None, max_length=17)


class SimFtPrioridadResponse(SimFtPrioridadBase):
    """Schema de respuesta para prioridades"""
    FEC_CREA_REG: Optional[datetime] = None
    FEC_MODIF_REG: Optional[datetime] = None
    ID_USUARIO_CREA: Optional[str] = None
    ID_USUARIO_MODIF: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS TRANSACCIONALES - ENCABEZADO
# ==========================================

class SimFtTramiteEBase(BaseModel):
    """Schema base para encabezado de trámite"""
    NUM_ANNIO: int = Field(..., ge=2000, le=2100, description="Año del registro")
    NUM_TRAMITE: int = Field(..., ge=1, description="Número consecutivo del trámite")
    NUM_REGISTRO: int = Field(..., ge=1, description="Número de registro de filiación")
    COD_TRAMITE: str = Field(..., max_length=10, description="Código del tipo de trámite")


class SimFtTramiteECreate(SimFtTramiteEBase):
    """Schema para crear un encabezado de trámite"""
    FEC_INI_TRAMITE: Optional[datetime] = None
    IND_ESTATUS: Optional[str] = Field(None, max_length=2)
    IND_PRIORIDAD: Optional[str] = Field(None, max_length=1)
    OBS_OBSERVA: Optional[str] = None
    ID_USUARIO_CREA: Optional[str] = Field(None, max_length=17)


class SimFtTramiteEUpdate(BaseModel):
    """Schema para actualizar un encabezado de trámite"""
    FEC_FIN_TRAMITE: Optional[datetime] = None
    IND_ESTATUS: Optional[str] = Field(None, max_length=2)
    IND_CONCLUSION: Optional[str] = Field(None, max_length=2)
    IND_PRIORIDAD: Optional[str] = Field(None, max_length=1)
    OBS_OBSERVA: Optional[str] = None
    HITS_TRAMITE: Optional[int] = None


class SimFtTramiteEResponse(SimFtTramiteEBase):
    """Schema de respuesta para encabezado de trámite"""
    FEC_INI_TRAMITE: Optional[datetime] = None
    FEC_FIN_TRAMITE: Optional[datetime] = None
    IND_ESTATUS: Optional[str] = None
    IND_CONCLUSION: Optional[str] = None
    IND_PRIORIDAD: Optional[str] = None
    OBS_OBSERVA: Optional[str] = None
    HITS_TRAMITE: Optional[int] = None
    FEC_ACTUALIZA: Optional[datetime] = None
    ID_USUARIO_CREA: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS TRANSACCIONALES - DETALLE DE PASOS
# ==========================================

class SimFtTramiteDBase(BaseModel):
    """Schema base para detalle de pasos"""
    NUM_ANNIO: int = Field(..., ge=2000, le=2100)
    NUM_TRAMITE: int = Field(..., ge=1)
    NUM_PASO: int = Field(..., ge=1)
    NUM_REGISTRO: int = Field(..., ge=1)
    COD_TRAMITE: str = Field(..., max_length=10)


class SimFtTramiteDCreate(BaseModel):
    """Schema para crear un detalle de paso (campos desde URL no requeridos en body)"""
    NUM_PASO: int = Field(..., ge=1)
    NUM_REGISTRO: int = Field(..., ge=1)
    COD_TRAMITE: str = Field(..., max_length=10)
    NUM_ACTIVIDAD: Optional[int] = None
    COD_SECCION: Optional[str] = Field(None, max_length=4)
    COD_AGENCIA: Optional[str] = Field(None, max_length=4)
    ID_USUAR_RESP: Optional[str] = Field(None, max_length=17)
    OBS_OBSERVACION: Optional[str] = None
    NUM_PASO_SGTE: Optional[int] = None
    IND_ESTATUS: Optional[str] = Field(None, max_length=2)
    IND_CONCLUSION: Optional[str] = Field(None, max_length=2)
    ID_USUARIO_CREA: Optional[str] = Field(None, max_length=17)


class SimFtTramiteDUpdate(BaseModel):
    """Schema para actualizar un detalle de paso"""
    COD_SECCION: Optional[str] = Field(None, max_length=4)
    COD_AGENCIA: Optional[str] = Field(None, max_length=4)
    ID_USUAR_RESP: Optional[str] = Field(None, max_length=17)
    OBS_OBSERVACION: Optional[str] = None
    NUM_PASO_SGTE: Optional[int] = None
    IND_ESTATUS: Optional[str] = Field(None, max_length=2)
    IND_CONCLUSION: Optional[str] = Field(None, max_length=2)


class SimFtTramiteDResponse(SimFtTramiteDBase):
    """Schema de respuesta para detalle de pasos"""
    NUM_ACTIVIDAD: Optional[int] = None
    COD_SECCION: Optional[str] = None
    COD_AGENCIA: Optional[str] = None
    ID_USUAR_RESP: Optional[str] = None
    OBS_OBSERVACION: Optional[str] = None
    NUM_PASO_SGTE: Optional[int] = None
    IND_ESTATUS: Optional[str] = None
    IND_CONCLUSION: Optional[str] = None
    FEC_ACTUALIZA: Optional[datetime] = None
    ID_USUARIO_CREA: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS DE CIERRE
# ==========================================

class SimFtTramiteCierreBase(BaseModel):
    """Schema base para cierre de trámite"""
    NUM_ANNIO: int = Field(..., ge=2000, le=2100)
    NUM_TRAMITE: int = Field(..., ge=1)
    NUM_REGISTRO: int = Field(..., ge=1)
    FEC_CIERRE: datetime
    ID_USUARIO_CIERRE: str = Field(..., max_length=17)


class SimFtTramiteCierreCreate(BaseModel):
    """Schema para crear un cierre de trámite"""
    OBS_CIERRE: Optional[str] = None
    COD_CONCLUSION: Optional[str] = Field(None, max_length=2)
    ID_USUARIO_CREA: Optional[str] = Field(None, max_length=17)


class SimFtTramiteCierreUpdate(BaseModel):
    """Schema para actualizar un cierre de trámite"""
    FEC_CIERRE: Optional[datetime] = None
    ID_USUARIO_CIERRE: Optional[str] = Field(None, max_length=17)
    OBS_CIERRE: Optional[str] = None
    COD_CONCLUSION: Optional[str] = Field(None, max_length=2)


class SimFtTramiteCierreResponse(SimFtTramiteCierreBase):
    """Schema de respuesta para cierre de trámite"""
    OBS_CIERRE: Optional[str] = None
    COD_CONCLUSION: Optional[str] = None
    FEC_CREA_REG: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SimFtDependteCierreBase(BaseModel):
    """Schema base para dependientes en cierre"""
    NUM_ANNIO: int = Field(..., ge=2000, le=2100)
    NUM_TRAMITE: int = Field(..., ge=1)
    NUM_REGISTRO: int = Field(..., ge=1)
    NUM_REGISTRO_DEP: int = Field(..., ge=1, description="Registro del dependiente")


class SimFtDependteCierreCreate(SimFtDependteCierreBase):
    """Schema para crear dependiente en cierre"""
    TIP_DEPENDENCIA: Optional[str] = Field(None, max_length=2)
    FEC_INCLUSION: Optional[datetime] = None
    ID_USUARIO_CREA: Optional[str] = Field(None, max_length=17)


class SimFtDependteCierreUpdate(BaseModel):
    """Schema para actualizar dependiente en cierre"""
    TIP_DEPENDENCIA: Optional[str] = Field(None, max_length=2)
    FEC_INCLUSION: Optional[datetime] = None


class SimFtDependteCierreResponse(SimFtDependteCierreBase):
    """Schema de respuesta para dependientes en cierre"""
    TIP_DEPENDENCIA: Optional[str] = None
    FEC_INCLUSION: Optional[datetime] = None
    FEC_CREA_REG: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS COMPUESTOS
# ==========================================

class SimFtTramiteEConDetalles(SimFtTramiteEResponse):
    """Schema de trámite con sus detalles de pasos"""
    detalles: List[SimFtTramiteDResponse] = []

    model_config = ConfigDict(from_attributes=True)


class SimFtTramiteCierreConDependientes(SimFtTramiteCierreResponse):
    """Schema de cierre con dependientes"""
    dependientes: List[SimFtDependteCierreResponse] = []

    model_config = ConfigDict(from_attributes=True)
