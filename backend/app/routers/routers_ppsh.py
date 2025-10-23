"""
API Routes para el Sistema PPSH
Sistema de Trámites Migratorios de Panamá

Siguiendo principios SOLID y best practices de FastAPI:
- Single Responsibility: Cada endpoint maneja una operación específica
- Open/Closed: Extensible mediante dependency injection
- Dependency Inversion: Usa servicios abstractos
- RESTful design: Verbos HTTP apropiados, códigos de estado correctos
- Documentación automática: Responses, descriptions, tags
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
import logging
from datetime import date

from app.infrastructure import get_db
from app.services import (
    SolicitudService, DocumentoService, EntrevistaService,
    ComentarioService, CatalogoService,
    PPSHNotFoundException, PPSHBusinessException, PPSHPermissionException
)
from app.schemas import (
    # Solicitudes
    SolicitudCreate, SolicitudUpdate, SolicitudResponse,
    SolicitudListResponse, PaginatedResponse, SolicitudFiltros,
    # Solicitantes
    SolicitanteUpdate, SolicitanteResponse,
    # Estados
    CambiarEstadoRequest, EstadoHistorialResponse, EstadoResponse,
    # Documentos
    DocumentoCreate, DocumentoUpdate, DocumentoResponse,
    # Entrevistas
    EntrevistaCreate, EntrevistaUpdate, EntrevistaResponse,
    # Comentarios
    ComentarioCreate, ComentarioResponse,
    # Catálogos
    CausaHumanitariaResponse, TipoDocumentoResponse,
    # Estadísticas
    EstadisticasGenerales,
    # Enums
    PrioridadEnum, TipoSolicitudEnum, EstadoVerificacionEnum
)

logger = logging.getLogger(__name__)

# Router con prefix y tags para documentación
router = APIRouter(
    prefix="/ppsh",
    tags=["PPSH - Permisos Por razones Humanitarias"]
)


# ==========================================
# DEPENDENCY: Usuario Actual
# ==========================================
# TODO: Integrar con sistema de autenticación real
async def get_current_user(
    # Authorization: str = Header(...) cuando se implemente JWT
) -> dict:
    """
    Obtiene el usuario actual desde el token de autenticación.
    Por ahora retorna usuario mock para desarrollo.
    """
    # TODO: Decodificar JWT token y validar
    # TODO: Obtener usuario desde base de datos
    return {
        "user_id": "USR001",
        "username": "admin",
        "roles": ["ADMIN", "PPSH_ANALISTA"],
        "es_admin": True
    }


# ==========================================
# ENDPOINTS DE CATÁLOGOS
# ==========================================

@router.get(
    "/catalogos/causas-humanitarias",
    response_model=List[CausaHumanitariaResponse],
    summary="Lista causas humanitarias",
    description="Obtiene todas las causas humanitarias activas disponibles para solicitudes PPSH"
)
async def listar_causas_humanitarias(
    activos_solo: bool = Query(True, description="Solo causas activas"),
    db: Session = Depends(get_db)
):
    """Lista todas las causas humanitarias disponibles"""
    return CatalogoService.get_causas_humanitarias(db, activos_solo)


@router.get(
    "/catalogos/tipos-documento",
    response_model=List[TipoDocumentoResponse],
    summary="Lista tipos de documento",
    description="Obtiene todos los tipos de documento requeridos para solicitudes PPSH"
)
async def listar_tipos_documento(
    activos_solo: bool = Query(True, description="Solo tipos activos"),
    db: Session = Depends(get_db)
):
    """Lista todos los tipos de documento"""
    return CatalogoService.get_tipos_documento(db, activos_solo)


@router.get(
    "/catalogos/estados",
    response_model=List[EstadoResponse],
    summary="Lista estados del proceso",
    description="Obtiene todos los estados posibles del proceso PPSH"
)
async def listar_estados(
    activos_solo: bool = Query(True, description="Solo estados activos"),
    db: Session = Depends(get_db)
):
    """Lista todos los estados del proceso PPSH"""
    return CatalogoService.get_estados(db, activos_solo)


# ==========================================
# ENDPOINTS DE SOLICITUDES
# ==========================================

@router.post(
    "/solicitudes",
    response_model=SolicitudResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear solicitud PPSH",
    description="Crea una nueva solicitud de Permiso Por razones Humanitarias con sus solicitantes"
)
async def crear_solicitud(
    solicitud: SolicitudCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Crea una nueva solicitud PPSH.
    
    Validaciones:
    - Debe existir la causa humanitaria
    - Debe tener al menos un solicitante titular
    - Solicitud individual solo puede tener 1 solicitante
    - Dependientes deben especificar parentesco
    """
    try:
        solicitud_db = SolicitudService.crear_solicitud(
            db=db,
            solicitud_data=solicitud,
            user_id=current_user["user_id"]
        )
        return solicitud_db
    except (PPSHNotFoundException, PPSHBusinessException) as e:
        raise e
    except Exception as e:
        logger.error(f"Error inesperado creando solicitud: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.get(
    "/solicitudes",
    response_model=PaginatedResponse,
    summary="Listar solicitudes",
    description="Lista solicitudes PPSH con filtros y paginación"
)
async def listar_solicitudes(
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(20, ge=1, le=100, description="Tamaño de página"),
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    prioridad: Optional[PrioridadEnum] = Query(None, description="Filtrar por prioridad"),
    causa_humanitaria: Optional[int] = Query(None, description="Filtrar por causa"),
    fecha_desde: Optional[date] = Query(None, description="Fecha desde"),
    fecha_hasta: Optional[date] = Query(None, description="Fecha hasta"),
    agencia: Optional[str] = Query(None, description="Filtrar por agencia"),
    asignado_a: Optional[str] = Query(None, description="Filtrar por asignado"),
    buscar: Optional[str] = Query(None, description="Buscar en nombre, expediente, documento"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Lista solicitudes con filtros opcionales y paginación.
    
    Si el usuario no es admin, solo ve sus solicitudes asignadas.
    """
    filtros = SolicitudFiltros(
        estado=estado,
        prioridad=prioridad,
        causa_humanitaria=causa_humanitaria,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        agencia=agencia,
        asignado_a=asignado_a,
        buscar=buscar
    )
    
    solicitudes, total = SolicitudService.listar_solicitudes(
        db=db,
        filtros=filtros,
        page=page,
        page_size=page_size,
        user_id=current_user["user_id"],
        es_admin=current_user.get("es_admin", False)
    )
    
    # Convertir a response simplificado para listados
    items = []
    for sol in solicitudes:
        titular = next((s for s in sol.solicitantes if s.es_titular), None)
        dias_transcurridos = (date.today() - sol.fecha_solicitud).days
        
        items.append(SolicitudListResponse(
            id_solicitud=sol.id_solicitud,
            num_expediente=sol.num_expediente,
            tipo_solicitud=sol.tipo_solicitud,
            fecha_solicitud=sol.fecha_solicitud,
            estado_actual=sol.estado_actual,
            prioridad=sol.prioridad,
            nombre_titular=titular.nombre_completo if titular else None,
            total_personas=len(sol.solicitantes),
            dias_transcurridos=dias_transcurridos,
            created_at=sol.created_at
        ))
    
    total_pages = (total + page_size - 1) // page_size
    
    return PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        items=items
    )


@router.get(
    "/solicitudes/{id_solicitud}",
    response_model=SolicitudResponse,
    summary="Obtener solicitud",
    description="Obtiene el detalle completo de una solicitud PPSH"
)
async def obtener_solicitud(
    id_solicitud: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obtiene una solicitud con todas sus relaciones"""
    try:
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=True)
        
        # Verificar permisos (admin o asignado)
        if not current_user.get("es_admin") and solicitud.user_id_asignado != current_user["user_id"]:
            raise PPSHPermissionException()
        
        return solicitud
    except PPSHNotFoundException as e:
        raise e


@router.put(
    "/solicitudes/{id_solicitud}",
    response_model=SolicitudResponse,
    summary="Actualizar solicitud",
    description="Actualiza los datos de una solicitud PPSH"
)
async def actualizar_solicitud(
    id_solicitud: int,
    solicitud: SolicitudUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Actualiza una solicitud existente"""
    try:
        # Verificar permisos
        solicitud_db = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        if not current_user.get("es_admin") and solicitud_db.user_id_asignado != current_user["user_id"]:
            raise PPSHPermissionException()
        
        return SolicitudService.actualizar_solicitud(
            db=db,
            id_solicitud=id_solicitud,
            solicitud_data=solicitud,
            user_id=current_user["user_id"]
        )
    except (PPSHNotFoundException, PPSHBusinessException, PPSHPermissionException) as e:
        raise e


@router.post(
    "/solicitudes/{id_solicitud}/asignar",
    response_model=SolicitudResponse,
    summary="Asignar solicitud",
    description="Asigna una solicitud a un funcionario"
)
async def asignar_solicitud(
    id_solicitud: int,
    user_id_asignado: str = Query(..., description="User ID del funcionario"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Asigna una solicitud a un funcionario. Requiere rol admin."""
    if not current_user.get("es_admin"):
        raise PPSHPermissionException("Solo administradores pueden asignar solicitudes")
    
    try:
        return SolicitudService.asignar_solicitud(
            db=db,
            id_solicitud=id_solicitud,
            user_id_asignado=user_id_asignado,
            asignado_por=current_user["user_id"]
        )
    except PPSHNotFoundException as e:
        raise e


@router.post(
    "/solicitudes/{id_solicitud}/cambiar-estado",
    response_model=SolicitudResponse,
    summary="Cambiar estado",
    description="Cambia el estado de una solicitud en el flujo PPSH"
)
async def cambiar_estado_solicitud(
    id_solicitud: int,
    cambio: CambiarEstadoRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Cambia el estado de una solicitud.
    
    Registra el cambio en el historial con:
    - Estado anterior y nuevo
    - Usuario que realizó el cambio
    - Observaciones
    - Si es dictamen, incluye tipo y detalle
    - Días transcurridos en estado anterior
    """
    try:
        # Verificar permisos
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        if not current_user.get("es_admin") and solicitud.user_id_asignado != current_user["user_id"]:
            raise PPSHPermissionException()
        
        return SolicitudService.cambiar_estado(
            db=db,
            id_solicitud=id_solicitud,
            cambio=cambio,
            user_id=current_user["user_id"]
        )
    except (PPSHNotFoundException, PPSHBusinessException, PPSHPermissionException) as e:
        raise e


@router.get(
    "/solicitudes/{id_solicitud}/historial",
    response_model=List[EstadoHistorialResponse],
    summary="Historial de estados",
    description="Obtiene el historial completo de cambios de estado"
)
async def obtener_historial_estados(
    id_solicitud: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obtiene el historial de estados de una solicitud"""
    try:
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=True)
        
        # Verificar permisos
        if not current_user.get("es_admin") and solicitud.user_id_asignado != current_user["user_id"]:
            raise PPSHPermissionException()
        
        return solicitud.historial
    except PPSHNotFoundException as e:
        raise e


# ==========================================
# ENDPOINTS DE DOCUMENTOS
# ==========================================

@router.post(
    "/solicitudes/{id_solicitud}/documentos",
    response_model=DocumentoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Subir documento",
    description="Sube un documento a una solicitud"
)
async def subir_documento(
    id_solicitud: int,
    archivo: UploadFile = File(...),
    cod_tipo_documento: Optional[int] = Form(None),
    tipo_documento_texto: Optional[str] = Form(None),
    observaciones: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Sube un documento a una solicitud.
    
    TODO: Implementar almacenamiento real (S3, Azure Blob, etc.)
    Por ahora solo registra metadata en BD.
    """
    try:
        # Leer archivo para obtener tamaño
        contents = await archivo.read()
        tamano_bytes = len(contents)
        
        # Extraer extensión
        extension = archivo.filename.split('.')[-1] if '.' in archivo.filename else None
        
        documento_data = DocumentoCreate(
            cod_tipo_documento=cod_tipo_documento,
            tipo_documento_texto=tipo_documento_texto,
            nombre_archivo=archivo.filename,
            extension=extension,
            observaciones=observaciones
        )
        
        # TODO: Guardar archivo en storage
        # storage_path = await save_to_storage(contents, archivo.filename, id_solicitud)
        
        documento = DocumentoService.registrar_documento(
            db=db,
            id_solicitud=id_solicitud,
            documento_data=documento_data,
            tamano_bytes=tamano_bytes,
            uploaded_by=current_user["user_id"]
        )
        
        # Convertir modelo a schema response para asegurar campos correctos
        return DocumentoResponse(
            id_documento=documento.id_documento,
            id_solicitud=documento.id_solicitud,
            cod_tipo_documento=documento.cod_tipo_documento,
            tipo_documento_texto=documento.tipo_documento_texto,
            nombre_archivo=documento.nombre_archivo,
            extension=documento.extension,
            tamano_bytes=documento.tamano_bytes,
            estado_verificacion=documento.estado_verificacion,
            verificado_por=documento.verificado_por,
            fecha_verificacion=documento.fecha_verificacion,
            uploaded_by=documento.uploaded_by,
            uploaded_at=documento.uploaded_at,
            observaciones=documento.observaciones
        )
    except PPSHNotFoundException as e:
        raise e


@router.patch(
    "/documentos/{id_documento}/verificar",
    response_model=DocumentoResponse,
    summary="Verificar documento",
    description="Marca un documento como verificado o rechazado"
)
async def verificar_documento(
    id_documento: int,
    estado: EstadoVerificacionEnum = Query(..., description="Estado de verificación"),
    observaciones: Optional[str] = Query(None, description="Observaciones"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Verifica o rechaza un documento. Requiere permisos de analista."""
    try:
        documento = DocumentoService.verificar_documento(
            db=db,
            id_documento=id_documento,
            estado=estado.value,
            verificado_por=current_user["user_id"],
            observaciones=observaciones
        )
        
        # Convertir modelo a schema response para asegurar campos correctos
        return DocumentoResponse(
            id_documento=documento.id_documento,
            id_solicitud=documento.id_solicitud,
            cod_tipo_documento=documento.cod_tipo_documento,
            tipo_documento_texto=documento.tipo_documento_texto,
            nombre_archivo=documento.nombre_archivo,
            extension=documento.extension,
            tamano_bytes=documento.tamano_bytes,
            estado_verificacion=documento.estado_verificacion,
            verificado_por=documento.verificado_por,
            fecha_verificacion=documento.fecha_verificacion,
            uploaded_by=documento.uploaded_by,
            uploaded_at=documento.uploaded_at,
            observaciones=documento.observaciones
        )
    except PPSHNotFoundException as e:
        raise e


# ==========================================
# ENDPOINTS DE ENTREVISTAS
# ==========================================

@router.post(
    "/solicitudes/{id_solicitud}/entrevistas",
    response_model=EntrevistaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Programar entrevista",
    description="Programa una entrevista para una solicitud"
)
async def programar_entrevista(
    id_solicitud: int,
    entrevista: EntrevistaCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Programa una nueva entrevista. Requiere permisos de analista."""
    try:
        return EntrevistaService.programar_entrevista(
            db=db,
            id_solicitud=id_solicitud,
            entrevista_data=entrevista,
            user_id=current_user["user_id"]
        )
    except PPSHNotFoundException as e:
        raise e


@router.put(
    "/entrevistas/{id_entrevista}",
    response_model=EntrevistaResponse,
    summary="Registrar resultado entrevista",
    description="Registra el resultado de una entrevista realizada"
)
async def registrar_resultado_entrevista(
    id_entrevista: int,
    entrevista: EntrevistaUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Actualiza una entrevista con sus resultados"""
    try:
        return EntrevistaService.registrar_resultado(
            db=db,
            id_entrevista=id_entrevista,
            entrevista_data=entrevista,
            user_id=current_user["user_id"]
        )
    except PPSHNotFoundException as e:
        raise e


# ==========================================
# ENDPOINTS DE COMENTARIOS
# ==========================================

@router.post(
    "/solicitudes/{id_solicitud}/comentarios",
    response_model=ComentarioResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Agregar comentario",
    description="Agrega un comentario a una solicitud"
)
async def crear_comentario(
    id_solicitud: int,
    comentario: ComentarioCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Agrega un comentario (interno o público) a una solicitud"""
    try:
        return ComentarioService.crear_comentario(
            db=db,
            id_solicitud=id_solicitud,
            comentario_data=comentario,
            user_id=current_user["user_id"]
        )
    except PPSHNotFoundException as e:
        raise e


@router.get(
    "/solicitudes/{id_solicitud}/comentarios",
    response_model=List[ComentarioResponse],
    summary="Listar comentarios",
    description="Lista los comentarios de una solicitud"
)
async def listar_comentarios(
    id_solicitud: int,
    incluir_internos: bool = Query(True, description="Incluir comentarios internos"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Lista comentarios de una solicitud"""
    # Verificar permisos para ver internos
    if incluir_internos and not current_user.get("es_admin"):
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        if solicitud.user_id_asignado != current_user["user_id"]:
            incluir_internos = False
    
    return ComentarioService.listar_comentarios(
        db=db,
        id_solicitud=id_solicitud,
        incluir_internos=incluir_internos
    )


# ==========================================
# ENDPOINTS DE ESTADÍSTICAS
# ==========================================

@router.get(
    "/estadisticas",
    response_model=EstadisticasGenerales,
    summary="Estadísticas generales",
    description="Obtiene estadísticas generales del sistema PPSH"
)
async def obtener_estadisticas(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Obtiene estadísticas generales del sistema:
    - Total de solicitudes
    - Solicitudes por estado
    - Tiempos promedio de procesamiento
    - Distribución por prioridad
    """
    return SolicitudService.get_estadisticas(db)


# ==========================================
# ENDPOINTS DE SALUD
# ==========================================

@router.get(
    "/health",
    summary="Health check",
    description="Verifica el estado del módulo PPSH",
    include_in_schema=False
)
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint"""
    try:
        # Verificar conexión a BD
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "module": "PPSH",
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service unhealthy"
        )
