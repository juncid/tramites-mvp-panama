"""
Rutas para el acceso público (sin autenticación)
"""
from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.services.public_access_service import PublicAccessService
from app.schemas.public_access import (
    ValidarAccesoRequest,
    ValidarAccesoResponse,
    SolicitudPublicaResponse
)


router = APIRouter(
    prefix="/api/v1/public",
    tags=["Acceso Público"]
)


def get_client_info(request: Request) -> tuple:
    """Obtiene información del cliente (IP, User Agent)"""
    # Obtener IP real considerando proxies
    ip_address = request.headers.get("X-Real-IP") or \
                 request.headers.get("X-Forwarded-For", "").split(",")[0].strip() or \
                 request.client.host if request.client else None
    
    user_agent = request.headers.get("User-Agent")
    
    return ip_address, user_agent


@router.post("/validar-acceso", response_model=ValidarAccesoResponse)
async def validar_acceso(
    data: ValidarAccesoRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Valida el acceso público a una solicitud.
    
    Requiere:
    - Número de solicitud
    - Tipo de documento (PASAPORTE o CEDULA)
    - Número de documento
    
    Retorna:
    - Token temporal (válido por 15 minutos)
    - Datos públicos de la solicitud
    """
    service = PublicAccessService(db)
    ip_address, user_agent = get_client_info(request)
    
    try:
        result = service.validar_acceso(
            data=data,
            ip_address=ip_address,
            user_agent=user_agent
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al validar acceso: {str(e)}"
        )


@router.get("/solicitudes/{numero_solicitud}", response_model=SolicitudPublicaResponse)
async def obtener_solicitud_publica(
    numero_solicitud: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Obtiene los datos públicos de una solicitud.
    
    Requiere:
    - Token de acceso en el header Authorization
    - Número de solicitud en la URL
    
    El token debe haber sido generado previamente mediante /validar-acceso
    """
    # Extraer token del header Authorization
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de acceso requerido"
        )
    
    token = auth_header.replace("Bearer ", "")
    
    service = PublicAccessService(db)
    
    try:
        result = service.obtener_solicitud_publica(
            numero_solicitud=numero_solicitud.upper(),
            token=token
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener solicitud: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """
    Endpoint para verificar que el servicio público está funcionando
    """
    return {
        "status": "ok",
        "service": "public_access",
        "message": "Portal de acceso público operativo"
    }
