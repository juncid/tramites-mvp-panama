"""
Schemas Pydantic para configuraciones de vistas dinámicas
Sistema de Trámites Migratorios de Panamá

Define los modelos de datos para request/response de la API REST
de configuraciones de vistas dinámicas.

Author: Sistema de Trámites MVP Panamá
Date: 2025-11-14
"""

from pydantic import BaseModel, Field
from typing import Optional, Any, Dict
from datetime import datetime


class VistaConfigBase(BaseModel):
    """Base para configuración de vista dinámica"""
    etapa_id: int = Field(..., description="ID de la etapa asociada")
    config_json: Dict[str, Any] = Field(..., description="Configuración JSON de la vista")
    activo: bool = Field(default=True, description="Si la configuración está activa")


class VistaConfigCreate(VistaConfigBase):
    """Schema para crear nueva configuración de vista"""
    pass


class VistaConfigUpdate(BaseModel):
    """Schema para actualizar configuración existente"""
    config_json: Optional[Dict[str, Any]] = Field(None, description="Nueva configuración JSON")
    activo: Optional[bool] = Field(None, description="Cambiar estado activo/inactivo")


class VistaConfig(VistaConfigBase):
    """Schema completo de configuración de vista (response)"""
    id: int = Field(..., description="ID único de la configuración")
    created_at: datetime = Field(..., description="Fecha de creación")
    updated_at: Optional[datetime] = Field(None, description="Fecha de última actualización")
    created_by: Optional[str] = Field(None, description="Usuario creador")
    updated_by: Optional[str] = Field(None, description="Usuario que actualizó")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "etapa_id": 5,
                "config_json": {
                    "titulo": "Datos Personales",
                    "descripcion": "Complete su información personal",
                    "campos": [
                        {
                            "id": "nombre",
                            "tipo": "TEXTO",
                            "etiqueta": "Nombre completo",
                            "requerido": True
                        }
                    ]
                },
                "activo": True,
                "created_at": "2025-11-14T12:00:00",
                "updated_at": "2025-11-14T12:30:00",
                "created_by": "admin",
                "updated_by": "admin"
            }
        }
