from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class TramiteBase(BaseModel):
    NOM_TITULO: str = Field(..., description="Título del trámite")
    DESCRIPCION: Optional[str] = Field(default=None, description="Descripción del trámite")
    COD_ESTADO: str = Field(default="pendiente", description="Estado del trámite")

class TramiteCreate(TramiteBase):
    pass

class TramiteUpdate(BaseModel):
    NOM_TITULO: Optional[str] = Field(default=None, description="Título del trámite")
    DESCRIPCION: Optional[str] = Field(default=None, description="Descripción del trámite")
    COD_ESTADO: Optional[str] = Field(default=None, description="Estado del trámite")
    IND_ACTIVO: Optional[bool] = Field(default=None, description="Indica si el trámite está activo")

class TramiteResponse(TramiteBase):
    id: int
    IND_ACTIVO: bool = Field(default=True, description="Indica si el trámite está activo")
    FEC_CREA_REG: datetime = Field(..., description="Fecha de creación")
    FEC_MODIF_REG: Optional[datetime] = Field(default=None, description="Fecha de modificación")
    
    model_config = ConfigDict(from_attributes=True)
