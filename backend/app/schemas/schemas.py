from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TramiteBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    estado: str = "pendiente"

class TramiteCreate(TramiteBase):
    pass

class TramiteUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[str] = None
    activo: Optional[bool] = None

class TramiteResponse(TramiteBase):
    id: int
    activo: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
