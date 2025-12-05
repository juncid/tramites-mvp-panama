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
    fecha_nacimiento: Optional[str] = Field(None, description="Fecha de nacimiento en formato YYYY-MM-DD")

    class Config:
        json_schema_extra = {
            "example": {
                "pasaporte": "N123456",
                "nombres": "María Alejandra",
                "apellidos": "González Pérez",
                "email": "maria.gonzalez@example.com",
                "nacionalidad": "VENEZUELA",
                "sexo": "F",
                "fecha_nacimiento": "1990-05-15"
            }
        }


class IniciarSolicitudResponse(BaseModel):
    """Response de inicio de solicitud pública"""
    success: bool
    instancia_id: int
    solicitud_id: int
    token: str
    codigo_acceso: str  # Código corto para acceso fácil (ej: PPSH-A7X9)
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


class ValidarCodigoRequest(BaseModel):
    """Request para validar acceso por código y pasaporte"""
    codigo_acceso: str = Field(..., min_length=8, max_length=12, description="Código de acceso (ej: PPSH-A7X9)")
    pasaporte: str = Field(..., min_length=5, max_length=20, description="Número de pasaporte del solicitante")

    class Config:
        json_schema_extra = {
            "example": {
                "codigo_acceso": "PPSH-A7X9",
                "pasaporte": "N123456"
            }
        }


class ValidarCodigoResponse(BaseModel):
    """Response de validación por código de acceso"""
    success: bool
    instancia_id: Optional[int] = None
    token: Optional[str] = None
    codigo_acceso: Optional[str] = None
    num_expediente: Optional[str] = None
    estado: Optional[str] = None
    link_seguimiento: Optional[str] = None
    mensaje: str


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
            sexo=request.sexo,
            fecha_nacimiento=request.fecha_nacimiento
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

    # Retornar datos básicos de la instancia con etapas del workflow
    etapas_data = []
    if instancia.workflow and instancia.workflow.etapas:
        for etapa in sorted(instancia.workflow.etapas, key=lambda x: x.orden or 0):
            if etapa.activo:
                # Obtener perfiles permitidos de la etapa
                perfiles_permitidos = []
                if hasattr(etapa, 'perfiles_permitidos') and etapa.perfiles_permitidos:
                    perfiles_permitidos = etapa.perfiles_permitidos
                
                etapas_data.append({
                    "id": etapa.id,
                    "codigo": etapa.codigo,
                    "nombre": etapa.nombre,
                    "orden": etapa.orden,
                    "descripcion": etapa.descripcion,
                    "es_etapa_inicial": etapa.es_etapa_inicial,
                    "es_etapa_final": etapa.es_etapa_final,
                    "perfiles_permitidos": perfiles_permitidos,
                })

    # Construir datos de etapa_actual con perfiles
    etapa_actual_data = None
    if instancia.etapa_actual:
        perfiles_etapa_actual = []
        if hasattr(instancia.etapa_actual, 'perfiles_permitidos') and instancia.etapa_actual.perfiles_permitidos:
            perfiles_etapa_actual = instancia.etapa_actual.perfiles_permitidos
        
        etapa_actual_data = {
            "id": instancia.etapa_actual.id,
            "nombre": instancia.etapa_actual.nombre,
            "codigo": instancia.etapa_actual.codigo,
            "orden": instancia.etapa_actual.orden,
            "perfiles_permitidos": perfiles_etapa_actual,
            "titulo_formulario": getattr(instancia.etapa_actual, 'titulo_formulario', None),
            "bajada_formulario": getattr(instancia.etapa_actual, 'bajada_formulario', None),
        }

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
            "nombre": instancia.workflow.nombre,
            "etapas": etapas_data
        } if instancia.workflow else None,
        "etapa_actual": etapa_actual_data
    }


@router.post(
    "/validar-codigo",
    response_model=ValidarCodigoResponse,
    summary="Validar acceso por código y pasaporte",
    description="""
    Valida el acceso a una solicitud usando el código de acceso corto y el número de pasaporte.
    
    **Flujo:**
    1. Ciudadano ingresa su código de acceso (ej: PPSH-A7X9) y pasaporte
    2. Sistema valida que el código exista y el pasaporte coincida
    3. Sistema genera un token JWT nuevo para continuar el proceso
    4. Sistema retorna el link de seguimiento
    
    **Este endpoint es ideal para usuarios que:**
    - Olvidaron guardar el link completo
    - Quieren acceder desde un nuevo dispositivo
    - Prefieren usar el código corto en lugar del link largo
    """
)
def validar_codigo_acceso(
    request: ValidarCodigoRequest,
    db: Session = Depends(get_db)
):
    """
    Valida acceso usando código corto y pasaporte
    
    **Acceso:** Público (sin autenticación)
    """
    result = PublicSolicitudService.validar_acceso_por_codigo(
        db=db,
        codigo_acceso=request.codigo_acceso,
        pasaporte=request.pasaporte
    )

    if not result:
        return ValidarCodigoResponse(
            success=False,
            mensaje="Código de acceso o pasaporte inválido. Verifique sus datos e intente nuevamente."
        )

    return ValidarCodigoResponse(
        success=True,
        **result
    )


@router.get(
    "/codigo/{codigo_acceso}/existe",
    summary="Verificar si existe un código de acceso",
    description="Verifica si un código de acceso es válido (sin requerir pasaporte)"
)
def verificar_codigo_existe(
    codigo_acceso: str,
    db: Session = Depends(get_db)
):
    """
    Verifica si un código de acceso existe
    
    **Acceso:** Público (sin autenticación)
    """
    instancia = PublicSolicitudService.obtener_instancia_por_codigo(db, codigo_acceso)

    return {
        "existe": instancia is not None,
        "codigo_acceso": codigo_acceso.strip().upper()
    }


@router.get(
    "/expediente/{num_expediente}/datos-acceso",
    summary="Obtener datos de acceso por número de expediente",
    description="Obtiene el código de acceso y pasaporte asociados a un número de expediente. Útil para soporte técnico."
)
def obtener_datos_acceso_por_expediente(
    num_expediente: str,
    db: Session = Depends(get_db)
):
    """
    Obtiene los datos de acceso de una solicitud por su número de expediente
    
    **Acceso:** Público (para soporte técnico)
    
    Retorna:
    - codigo_acceso: Código corto para acceso (ej: PPSH-A7X9)
    - pasaporte: Número de pasaporte del solicitante
    - nombre_titular: Nombre del solicitante
    - estado: Estado actual del trámite
    """
    from app.models.models_workflow import WorkflowInstancia
    
    # Buscar instancia por número de expediente
    instancia = db.query(WorkflowInstancia).filter(
        WorkflowInstancia.num_expediente == num_expediente.strip().upper()
    ).first()
    
    if not instancia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró solicitud con expediente: {num_expediente}"
        )
    
    # Extraer pasaporte del metadata
    pasaporte = None
    nombre_titular = None
    if instancia.metadata_adicional:
        metadata = instancia.metadata_adicional if isinstance(instancia.metadata_adicional, dict) else {}
        pasaporte = metadata.get('pasaporte')
        nombre_titular = metadata.get('nombres_completos')
    
    return {
        "success": True,
        "num_expediente": instancia.num_expediente,
        "codigo_acceso": instancia.codigo_acceso,
        "pasaporte": pasaporte,
        "nombre_titular": nombre_titular,
        "estado": instancia.estado.value if hasattr(instancia.estado, 'value') else str(instancia.estado),
        "instancia_id": instancia.id,
        "link_seguimiento": f"/workflows/{instancia.id}/etapas"
    }
