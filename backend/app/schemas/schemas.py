from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TramiteBase(BaseModel):
    titulo: str = Field(alias="NOM_TITULO")
    descripcion: Optional[str] = Field(default=None, alias="DESCRIPCION")
    estado: str = Field(default="pendiente", alias="COD_ESTADO")

class TramiteCreate(TramiteBase):
    pass

class TramiteUpdate(BaseModel):
    titulo: Optional[str] = Field(default=None, alias="NOM_TITULO")
    descripcion: Optional[str] = Field(default=None, alias="DESCRIPCION")
    estado: Optional[str] = Field(default=None, alias="COD_ESTADO")
    activo: Optional[bool] = Field(default=None, alias="IND_ACTIVO")

class TramiteResponse(TramiteBase):
    id: int
    activo: bool = Field(alias="IND_ACTIVO")
    created_at: datetime = Field(alias="FEC_CREA_REG")
    updated_at: Optional[datetime] = Field(default=None, alias="FEC_MODIF_REG")
    
    class Config:
        from_attributes = True
        allow_population_by_field_name = True
