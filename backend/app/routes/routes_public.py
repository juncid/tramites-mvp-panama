"""
Endpoints públicos para solicitudes (sin autenticación requerida)
Permite a ciudadanos iniciar solicitudes PPSH sin tener cuenta

Author: Sistema de Trámites MVP Panamá
Date: 2025-11-23
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from app.infrastructure.database import get_db
from app.services.public_solicitud_service import PublicSolicitudService


router = APIRouter(prefix="/public/solicitudes", tags=["Public - Solicitudes"])


# ==========================================
# SCHEMAS
# ==========================================

class IniciarSolicitudRequest(BaseModel):
    """Request para iniciar una solicitud pública"""
    pasaporte: str = Field(..., min_length=5, max_length=20, description="Número de pasaporte del solicitante")
    nombres: str = Field(..., min_length=2, max_length=100, description="Nombres del solicitante")
    apellidos: str = Field(..., min_length=2, max_length=100, description="Apellidos del solicitante")
    email: Optional[EmailStr] = Field(None, description="Email del solicitante (opcional)")
    nacionalidad: Optional[str] = Field(None, max_length=50, description="Nacionalidad del solicitante")
    sexo: Optional[str] = Field(None, pattern="^(M|F|OTRO)$", description="Sexo del solicitante (M/F/OTRO)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "pasaporte": "N123456",
                "nombres": "María Alejandra",
                "apellidos": "González Pérez",
                "email": "maria.gonzalez@example.com",
                "nacionalidad": "VENEZUELA",
                "sexo": "F"
            }
        }


class IniciarSolicitudResponse(BaseModel):
    """Response de inicio de solicitud pública"""
    success: bool
    instancia_id: int
    solicitud_id: int
    token: str
    num_expediente: str
    link_seguimiento: str
    mensaje: str


class ValidarTokenResponse(BaseModel):
    """Response al validar un token"""
    valid: bool
    instancia_id: Optional[int] = None
    num_expediente: Optional[str] = None
    estado: Optional[str] = None
    etapa_actual: Optional[str] = None


# ==========================================
# ENDPOINTS
# ==========================================

@router.post(
    "/iniciar",
    response_model=IniciarSolicitudResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Iniciar solicitud PPSH (sin autenticación)",
    description="""
    Permite a un ciudadano iniciar una solicitud de PPSH sin necesidad de tener cuenta en el sistema.
    
    **Flujo:**
    1. Ciudadano proporciona sus datos básicos (pasaporte, nombres, apellidos)
    2. Sistema crea o busca el solicitante en la base de datos
    3. Sistema crea una solicitud PPSH y una instancia de workflow
    4. Sistema genera un token JWT temporal de acceso
    5. Sistema retorna un link único para dar seguimiento a la solicitud
    
    **El token generado es válido por 30 días** y permite al ciudadano:
    - Acceder a su solicitud sin login
    - Completar las primeras 3 etapas del proceso
    - Ver el estado de su solicitud
    
    **Nota:** Guarde el link de seguimiento, no podrá recuperarlo después.
    """
)
def iniciar_solicitud(
    request: IniciarSolicitudRequest,
    db: Session = Depends(get_db)
):
    """
    Inicia una nueva solicitud PPSH para un ciudadano
    
    **Acceso:** Público (sin autenticación)
    """
    try:
        result = PublicSolicitudService.iniciar_solicitud_ppsh(
            db=db,
            pasaporte=request.pasaporte,
            nombres=request.nombres,
            apellidos=request.apellidos,
            email=request.email,
            nacionalidad=request.nacionalidad,
            sexo=request.sexo
        )
        
        return IniciarSolicitudResponse(
            success=True,
            **result
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear solicitud: {str(e)}"
        )


@router.get(
    "/{token}/validar",
    response_model=ValidarTokenResponse,
    summary="Validar token de acceso",
    description="""
    Valida un token de acceso público y retorna información básica de la instancia.
    
    **Uso:** Llamar este endpoint antes de cargar la página de workflow para verificar que el token es válido.
    """
)
def validar_token(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Valida un token de acceso público
    
    **Acceso:** Público (sin autenticación)
    """
    instancia = PublicSolicitudService.obtener_instancia_por_token(db, token)
    
    if not instancia:
        return ValidarTokenResponse(valid=False)
    
    return ValidarTokenResponse(
        valid=True,
        instancia_id=instancia.id,
        num_expediente=instancia.num_expediente,
        estado=instancia.estado.value if instancia.estado else None,
        etapa_actual=instancia.etapa_actual.nombre if instancia.etapa_actual else None
    )


@router.get(
    "/{token}/instancia",
    summary="Obtener instancia por token",
    description="""
    Obtiene los datos completos de una instancia de workflow usando el token de acceso.
    
    **Retorna:** Los mismos datos que GET /api/v1/workflow/instancias/{id}
    pero validando acceso mediante token en lugar de autenticación.
    """
)
def obtener_instancia_por_token(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Obtiene una instancia usando token de acceso público
    
    **Acceso:** Público (con token válido)
    """
    instancia = PublicSolicitudService.obtener_instancia_por_token(db, token)
    
    if not instancia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token inválido o expirado"
        )
    
    # Retornar datos básicos de la instancia
    return {
        "id": instancia.id,
        "workflow_id": instancia.workflow_id,
        "num_expediente": instancia.num_expediente,
        "nombre_instancia": instancia.nombre_instancia,
        "estado": instancia.estado.value if instancia.estado else None,
        "etapa_actual_id": instancia.etapa_actual_id,
        "fecha_inicio": instancia.fecha_inicio.isoformat() if instancia.fecha_inicio else None,
        "metadata_adicional": instancia.metadata_adicional,
        "workflow": {
            "id": instancia.workflow.id,
            "codigo": instancia.workflow.codigo,
            "nombre": instancia.workflow.nombre
        } if instancia.workflow else None,
        "etapa_actual": {
            "id": instancia.etapa_actual.id,
            "nombre": instancia.etapa_actual.nombre,
            "orden": instancia.etapa_actual.orden
        } if instancia.etapa_actual else None
    }
