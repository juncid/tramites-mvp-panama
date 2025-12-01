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
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from pydantic import BaseModel
import logging
from datetime import date

from app.infrastructure import get_db
from app.services import (
    SolicitudService, DocumentoService, EntrevistaService,
    PPSHComentarioService, CatalogoService, PPSHEtapaService,
    PPSHNotFoundException, PPSHBusinessException, PPSHPermissionException
)
from app.schemas import (
    # Solicitudes
    SolicitudCreate, SolicitudUpdate, SolicitudResponse,
    SolicitudListResponse, PaginatedResponse, SolicitudFiltros,
    # Solicitantes
    CambiarEstadoRequest, EstadoHistorialResponse, EstadoResponse,
    # Documentos
    DocumentoCreate, DocumentoResponse,
    ActualizarOCRDocumentosRequest,
    # Entrevistas
    EntrevistaCreate, EntrevistaUpdate, EntrevistaResponse,
    # Comentarios
    ComentarioCreate, ComentarioResponse,
    # Catálogos
    CausaHumanitariaResponse, TipoDocumentoResponse,
    # Estadísticas
    EstadisticasGenerales,
    # Etapas
    EtapaSolicitudResponse, ActualizarEstadoEtapaRequest,
    # Enums
    PrioridadEnum, EstadoVerificacionEnum
)
from app.models.models_ppsh import PPSHDocumento, PPSHSolicitud, PPSHSolicitante

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
    description="Cambia el estado de una solicitud en el flujo PPSH con validación de permisos por perfil"
)
async def cambiar_estado_solicitud(
    id_solicitud: int,
    cambio: CambiarEstadoRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Cambia el estado de una solicitud con validación de permisos por perfil.
    
    Validaciones por perfil:
    - FUNCIONARIO/ANALISTA: Pueden asignar EN_REVISION, RESUELTO, SUBSANACION
    - JEFE/DIRECTOR: Pueden asignar APROBADO, RECHAZADO, CANCELADO
    - ADMIN: Puede asignar cualquier estado
    
    Estados que requieren motivo obligatorio (mínimo 10 caracteres):
    - RECHAZADO, CANCELADO, SUBSANACION
    
    Registra el cambio en el historial con:
    - Estado anterior y nuevo
    - Usuario que realizó el cambio
    - Observaciones
    - Si es dictamen, incluye tipo y detalle
    - Días transcurridos en estado anterior
    """
    try:
        # Verificar permisos básicos (asignación)
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        if not current_user.get("es_admin") and solicitud.user_id_asignado != current_user["user_id"]:
            raise PPSHPermissionException("No tiene la solicitud asignada")

        # Obtener perfil del usuario
        user_perfil = current_user.get("perfil", "FUNCIONARIO")
        if current_user.get("es_admin"):
            user_perfil = "ADMIN"

        return SolicitudService.cambiar_estado(
            db=db,
            id_solicitud=id_solicitud,
            cambio=cambio,
            user_id=current_user["user_id"],
            user_perfil=user_perfil
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

@router.get(
    "/solicitudes/{id_solicitud}/documentos",
    response_model=List[DocumentoResponse],
    summary="Listar documentos",
    description="Obtiene todos los documentos de una solicitud con información de OCR"
)
async def listar_documentos(
    id_solicitud: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Lista todos los documentos asociados a una solicitud.
    
    Retorna metadata de documentos incluyendo:
    - Estado de verificación
    - Tipo de documento
    - Información de OCR (si fue procesado)
    - Porcentaje de confianza del OCR
    - Datos estructurados extraídos
    """
    try:
        # Verificar que la solicitud existe y el usuario tiene permisos
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)

        # Verificar permisos (admin o asignado)
        if not current_user.get("es_admin") and solicitud.user_id_asignado != current_user["user_id"]:
            raise PPSHPermissionException()

        documentos = DocumentoService.listar_documentos(db, id_solicitud)

        # Convertir a response incluyendo información de OCR
        response_list = []
        for doc in documentos:
            # Obtener el resultado OCR más reciente si existe
            ocr_resultado = None
            ocr_exitoso = False

            if doc.ocr_results:
                # Ordenar por fecha de creación y tomar el más reciente
                ultimo_ocr = sorted(doc.ocr_results, key=lambda x: x.created_at, reverse=True)[0]

                # Determinar si el OCR fue exitoso
                # Criterios: estado_ocr = 'COMPLETADO' y confianza >= 70%
                ocr_exitoso = (
                    ultimo_ocr.estado_ocr == 'COMPLETADO' and
                    ultimo_ocr.texto_confianza is not None and
                    float(ultimo_ocr.texto_confianza) >= 70.0
                )

                # Parsear datos estructurados si existen
                import json
                datos_estructurados = None
                if ultimo_ocr.datos_estructurados:
                    try:
                        datos_estructurados = json.loads(ultimo_ocr.datos_estructurados)
                    except:
                        datos_estructurados = None

                ocr_resultado = {
                    "id_ocr": ultimo_ocr.id_ocr,
                    "estado_ocr": ultimo_ocr.estado_ocr,
                    "texto_confianza": float(ultimo_ocr.texto_confianza) if ultimo_ocr.texto_confianza else None,
                    "idioma_detectado": ultimo_ocr.idioma_detectado,
                    "num_paginas": ultimo_ocr.num_paginas,
                    "datos_estructurados": datos_estructurados,
                    "codigo_error": ultimo_ocr.codigo_error,
                    "mensaje_error": ultimo_ocr.mensaje_error,
                    "fecha_procesamiento": ultimo_ocr.fecha_fin_proceso
                }

            response_list.append(
                DocumentoResponse(
                    id_documento=doc.id_documento,
                    id_solicitud=doc.id_solicitud,
                    cod_tipo_documento=doc.cod_tipo_documento,
                    tipo_documento_texto=doc.tipo_documento_texto,
                    nombre_archivo=doc.nombre_archivo,
                    extension=doc.extension,
                    tamano_bytes=doc.tamano_bytes,
                    estado_verificacion=doc.estado_verificacion,
                    verificado_por=doc.verificado_por,
                    fecha_verificacion=doc.fecha_verificacion,
                    uploaded_by=doc.uploaded_by,
                    uploaded_at=doc.uploaded_at,
                    observaciones=doc.observaciones,
                    ocr_resultado=ocr_resultado,
                    ocr_exitoso=ocr_exitoso
                )
            )

        return response_list
    except (PPSHNotFoundException, PPSHPermissionException) as e:
        raise e


@router.patch(
    "/solicitudes/{id_solicitud}/documentos/ocr",
    status_code=status.HTTP_200_OK,
    summary="Actualizar estado OCR de documentos",
    description="Actualiza el estado OCR de múltiples documentos de una solicitud y verifica si la etapa de revisión OCR está completa"
)
async def actualizar_ocr_documentos(
    id_solicitud: int,
    request: ActualizarOCRDocumentosRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Actualiza el estado OCR de documentos.
    
    Permite marcar documentos como procesados o pendientes de OCR.
    Se usa para revisión manual y corrección de estados OCR.
    
    Verifica automáticamente si todos los documentos de la solicitud tienen OCR exitoso
    para marcar la etapa 1.7 (Revisión OCR) como completada.
    """
    try:
        # Verificar que la solicitud existe y el usuario tiene permisos
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)

        # Verificar permisos (admin o asignado)
        if not current_user.get("es_admin") and solicitud.user_id_asignado != current_user["user_id"]:
            raise PPSHPermissionException()

        # Preparar datos para actualización
        documentos_update = [
            {
                'id_documento': doc.id_documento,
                'ocr_exitoso': doc.ocr_exitoso
            }
            for doc in request.documentos
        ]

        # Actualizar documentos y verificar completitud
        resultado = DocumentoService.actualizar_estado_ocr_documentos(
            db,
            documentos_update,
            id_solicitud=id_solicitud
        )

        # Construir mensaje de respuesta
        mensaje = f"Se actualizaron {resultado['documentos_actualizados']} documentos correctamente"

        if resultado['revision_ocr_completada']:
            mensaje += f". ✅ Etapa 1.7 completada: todos los documentos ({resultado['total_documentos']}) tienen OCR exitoso"
        elif resultado['total_documentos'] > 0:
            mensaje += f". Progreso: {resultado['documentos_con_ocr']}/{resultado['total_documentos']} documentos con OCR exitoso"

        return {
            "message": mensaje,
            "documentos_actualizados": resultado['documentos_actualizados'],
            "revision_ocr_completada": resultado['revision_ocr_completada'],
            "total_documentos": resultado['total_documentos'],
            "documentos_con_ocr": resultado['documentos_con_ocr']
        }
    except (PPSHNotFoundException, PPSHPermissionException) as e:
        raise e


@router.post(
    "/solicitudes/{id_solicitud}/documentos",
    status_code=status.HTTP_201_CREATED,
    summary="Subir documento",
    description="Sube un documento a una solicitud, lo guarda en disco y encola OCR automático"
)
async def subir_documento(
    id_solicitud: int,
    archivo: UploadFile = File(...),
    cod_tipo_documento: Optional[int] = Form(None),
    tipo_documento_texto: Optional[str] = Form(None),
    observaciones: Optional[str] = Form(None),
    ejecutar_ocr: bool = Form(True, description="Si ejecutar OCR automáticamente"),
    db: Session = Depends(get_db)
    # current_user: dict = Depends(get_current_user)  # Temporalmente deshabilitado para debugging
):
    """
    Sube un documento a una solicitud.
    
    - Valida tamaño máximo (100MB) y extensiones permitidas
    - Comprime imágenes automáticamente (max 4000px, JPEG 85%)
    - Guarda archivo en disco (/app/uploads/solicitudes/{id}/)
    - Encola tarea Celery para OCR automático
    - Retorna documento_id y task_id para tracking via WebSocket
    
    NOTA: Autenticación temporalmente deshabilitada para debugging.
    """
    # Log inmediato al entrar al endpoint
    logger.info(f"🚀 ENDPOINT ALCANZADO - subir_documento para solicitud {id_solicitud}")
    logger.info(f"📄 Archivo recibido: {archivo.filename if archivo else 'None'}")

    from app.services.file_storage_service import FileStorageService

    # Usuario temporal para testing
    current_user = {"user_id": "TEST_USER"}

    try:
        logger.info(f"📤 Iniciando subida de documento para solicitud {id_solicitud}")
        logger.info(f"📄 Archivo: {archivo.filename}, Content-Type: {archivo.content_type}")

        # Leer archivo para obtener tamaño
        logger.info("📖 Leyendo contenido del archivo...")

        # Leer archivo directamente (sin timeout complejo que puede bloquear)
        contents = await archivo.read()
        tamano_bytes = len(contents)
        logger.info(f"✅ Archivo leído: {tamano_bytes} bytes ({tamano_bytes / (1024*1024):.2f} MB)")

        # Validar archivo (tamaño y extensión)
        is_valid, error_msg = FileStorageService.validate_file(contents, archivo.filename)
        if not is_valid:
            logger.warning(f"❌ Archivo inválido: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "invalid_file", "message": error_msg}
            )

        # Extraer extensión
        extension = archivo.filename.split('.')[-1].lower() if '.' in archivo.filename else None

        # Crear registro en BD primero para obtener ID
        documento_data = DocumentoCreate(
            cod_tipo_documento=cod_tipo_documento,
            tipo_documento_texto=tipo_documento_texto,
            nombre_archivo=archivo.filename,
            extension=extension,
            observaciones=observaciones
        )

        logger.info("💾 Registrando documento en base de datos...")
        documento = DocumentoService.registrar_documento(
            db=db,
            id_solicitud=id_solicitud,
            documento_data=documento_data,
            tamano_bytes=tamano_bytes,
            uploaded_by=current_user["user_id"]
        )

        logger.info(f"✅ Documento registrado con ID: {documento.id_documento}")

        # Guardar archivo en disco con compresión automática de imágenes
        try:
            logger.info("💾 Guardando archivo en disco...")
            ruta_archivo = FileStorageService.save_file(
                solicitud_id=id_solicitud,
                documento_id=documento.id_documento,
                content=contents,
                filename=archivo.filename,
                compress_images=True
            )

            # Actualizar ruta en BD
            documento.ruta_archivo = ruta_archivo
            db.commit()

            logger.info(f"✅ Archivo guardado en: {ruta_archivo}")

        except ValueError as e:
            # Error de validación (tamaño, extensión)
            logger.error(f"❌ Error guardando archivo: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "file_storage_error", "message": str(e)}
            )
        except Exception as e:
            logger.error(f"❌ Error inesperado guardando archivo: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"error": "file_storage_error", "message": f"Error al guardar archivo: {str(e)}"}
            )

        # Encolar OCR automático si está habilitado y es imagen (PNG o JPG)
        task_id = None
        if ejecutar_ocr and extension in ['png', 'jpg', 'jpeg']:
            try:
                logger.info(f"🔍 Encolando tarea OCR para documento {documento.id_documento}...")

                # Importar y encolar tarea Celery
                from app.tasks.ocr_tasks import procesar_documento_ocr

                task = procesar_documento_ocr.apply_async(
                    args=[documento.id_documento],
                    queue='ocr_default',
                    soft_time_limit=60,  # 60 segundos timeout
                    time_limit=70        # 70 segundos hard limit
                )
                task_id = task.id

                logger.info(f"✅ Tarea OCR encolada: {task_id}")

            except Exception as e:
                logger.warning(f"⚠️ No se pudo encolar OCR (continuando sin OCR): {e}")
                # No fallar el upload si OCR no está disponible

        # Construir respuesta con información adicional
        response = DocumentoResponse(
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
            observaciones=documento.observaciones,
            ruta_archivo=ruta_archivo
        )

        # Agregar task_id a la respuesta si hay OCR
        response_dict = response.model_dump()
        if task_id:
            response_dict["ocr_task_id"] = task_id
            response_dict["ocr_websocket_url"] = f"/ws/ocr/{task_id}"

        return response_dict

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


@router.get(
    "/documentos/{id_documento}/descargar",
    summary="Descargar documento",
    description="Descarga un documento almacenado"
)
async def descargar_documento(
    id_documento: int,
    db: Session = Depends(get_db)
):
    """
    Descarga un documento por su ID.
    
    - Busca el documento en la base de datos
    - Lee el archivo desde disco
    - Retorna el archivo con headers de descarga correctos
    
    Returns:
        StreamingResponse con el archivo
    """
    from fastapi.responses import StreamingResponse
    from app.services.file_storage_service import FileStorageService
    import mimetypes
    import io

    try:
        # Buscar documento en BD
        documento = db.query(PPSHDocumento).filter(
            PPSHDocumento.id_documento == id_documento
        ).first()

        if not documento:
            raise PPSHNotFoundException(
                detail=f"Documento {id_documento} no encontrado"
            )

        if not documento.ruta_archivo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "file_not_found", "message": "El documento no tiene archivo asociado"}
            )

        # Leer archivo desde disco
        try:
            file_content = FileStorageService.get_file(documento.ruta_archivo)
        except FileNotFoundError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "file_not_found", "message": "Archivo no encontrado en disco"}
            )
        except Exception as e:
            logger.error(f"Error leyendo archivo: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"error": "read_error", "message": "Error leyendo archivo"}
            )

        # Determinar content-type
        content_type, _ = mimetypes.guess_type(documento.nombre_archivo)
        if not content_type:
            content_type = "application/octet-stream"

        # Preparar headers
        headers = {
            "Content-Disposition": f'attachment; filename="{documento.nombre_archivo}"',
            "Content-Length": str(len(file_content))
        }

        logger.info(f"📥 Descargando documento {id_documento}: {documento.nombre_archivo}")

        return StreamingResponse(
            io.BytesIO(file_content),
            media_type=content_type,
            headers=headers
        )

    except PPSHNotFoundException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error descargando documento: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "download_error", "message": str(e)}
        )


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
        return PPSHComentarioService.crear_comentario(
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

    return PPSHComentarioService.listar_comentarios(
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


# ==========================================
# ENDPOINT DE DEBUG PARA UPLOAD
# ==========================================

@router.post(
    "/debug/upload-test",
    summary="Test upload endpoint",
    description="Endpoint simple para probar upload de archivos"
)
async def debug_upload_test(
    archivo: UploadFile = File(...)
):
    """
    Endpoint de prueba simple para debugging de upload.
    
    NOTA IMPORTANTE: 
    Algunos archivos PDF con estructura interna compleja o corrupta pueden causar
    timeouts durante la lectura. Este endpoint implementa un timeout de 30 segundos
    para detectar estos casos y devolver un error informativo.
    
    Casos conocidos que pueden causar problemas:
    - PDFs con muchas capas de compresión
    - PDFs parcialmente corruptos pero aún válidos estructuralmente
    - PDFs generados por software antiguo con encoding no estándar
    """
    try:
        logger.info("🧪 DEBUG: Recibiendo archivo...")
        logger.info(f"📄 Filename: {archivo.filename}")
        logger.info(f"📦 Content-Type: {archivo.content_type}")
        logger.info(f"📏 Size (from header): {archivo.size if hasattr(archivo, 'size') else 'N/A'}")

        # Intentar leer el archivo con timeout
        logger.info("📖 Intentando leer contenido...")

        import asyncio
        try:
            contents = await asyncio.wait_for(archivo.read(), timeout=30.0)
            tamano = len(contents)
            logger.info(f"✅ Archivo leído exitosamente: {tamano} bytes")

            return {
                "status": "success",
                "filename": archivo.filename,
                "content_type": archivo.content_type,
                "size_bytes": tamano,
                "message": "Archivo recibido correctamente"
            }
        except asyncio.TimeoutError:
            logger.error(f"❌ Timeout al leer archivo {archivo.filename}")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "status": "error",
                    "error_code": "FILE_READ_TIMEOUT",
                    "filename": archivo.filename,
                    "message": "No se pudo leer el archivo dentro del tiempo límite (30 segundos)",
                    "details": {
                        "timeout_seconds": 30,
                        "possible_causes": [
                            "El archivo puede estar corrupto o parcialmente dañado",
                            "El archivo tiene una estructura interna compleja que causa problemas de lectura",
                            "El encoding del archivo no es estándar",
                            "El archivo fue generado por software con problemas de compatibilidad"
                        ],
                        "suggestions": [
                            "Intente con otro archivo",
                            "Verifique la integridad del archivo con un lector PDF",
                            "Si es posible, regenere el PDF desde el documento original",
                            "Intente guardar el PDF con diferentes opciones de compresión"
                        ]
                    }
                }
            )
    except Exception as e:
        logger.error(f"❌ Error en debug upload: {str(e)}")
        logger.exception(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error procesando archivo: {str(e)}"
        )


# ==========================================
# ENDPOINTS DE ETAPAS
# ==========================================

@router.get(
    "/solicitudes/{id_solicitud}/etapas",
    response_model=List[EtapaSolicitudResponse],
    status_code=status.HTTP_200_OK,
    summary="Obtener etapas de una solicitud",
    description="Retorna todas las etapas de una solicitud PPSH con su estado actual"
)
async def obtener_etapas_solicitud(
    id_solicitud: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Obtiene todas las etapas de una solicitud ordenadas por número.
    
    Si la solicitud no tiene etapas registradas, las crea automáticamente
    con los valores por defecto (etapa 1.2 COMPLETADO, etapa 1.7 PENDIENTE).
    """
    try:
        # Verificar permisos
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)

        # Solo admin o asignado puede ver las etapas
        if not current_user.get("es_admin") and solicitud.user_id_asignado != current_user["user_id"]:
            raise PPSHPermissionException()

        # Obtener etapas
        etapas = PPSHEtapaService.obtener_etapas_solicitud(db, id_solicitud)

        return etapas
    except (PPSHNotFoundException, PPSHPermissionException) as e:
        raise e
    except Exception as e:
        logger.error(f"Error obteniendo etapas de solicitud {id_solicitud}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo etapas: {str(e)}"
        )


@router.patch(
    "/solicitudes/{id_solicitud}/etapas/{codigo_etapa}",
    response_model=EtapaSolicitudResponse,
    status_code=status.HTTP_200_OK,
    summary="Actualizar estado de una etapa",
    description="Actualiza el estado de una etapa específica de una solicitud"
)
async def actualizar_estado_etapa(
    id_solicitud: int,
    codigo_etapa: str,
    request: ActualizarEstadoEtapaRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Actualiza el estado de una etapa.
    
    Estados permitidos: PENDIENTE, EN_PROCESO, COMPLETADO
    """
    try:
        # Verificar permisos
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)

        if not current_user.get("es_admin") and solicitud.user_id_asignado != current_user["user_id"]:
            raise PPSHPermissionException()

        # Actualizar etapa
        etapa = PPSHEtapaService.actualizar_estado_etapa(
            db=db,
            id_solicitud=id_solicitud,
            codigo_etapa=codigo_etapa,
            nuevo_estado=request.estado,
            completado_por=current_user.get("user_id"),
            observaciones=request.observaciones
        )

        return etapa
    except (PPSHNotFoundException, PPSHPermissionException) as e:
        raise e
    except Exception as e:
        logger.error(f"Error actualizando etapa {codigo_etapa} de solicitud {id_solicitud}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error actualizando etapa: {str(e)}"
        )


# ==========================================
# VALIDACIÓN OCR
# ==========================================

class ValidarOCRRequest(BaseModel):
    """Request para validar OCR contra datos del solicitante"""
    id_documento: int


class ValidarOCRResponse(BaseModel):
    """Response de validación OCR"""
    validacion_exitosa: bool
    campos_validados: dict
    campos_no_encontrados: List[str]
    campos_con_discrepancia: List[dict]
    mensaje: str
    puede_continuar: bool
    datos_ocr_raw: Optional[dict] = None  # Datos estructurados del JSON OCR
    texto_ocr_completo: Optional[str] = None  # Texto completo extraído por OCR


@router.post(
    "/solicitudes/{id_solicitud}/validar-ocr",
    response_model=ValidarOCRResponse,
    summary="Validar OCR contra datos del solicitante",
    description="Compara los datos extraídos por OCR del documento con los datos ingresados por el solicitante"
)
async def validar_ocr_documento(
    id_solicitud: int,
    request: ValidarOCRRequest,
    db: Session = Depends(get_db)
):
    """
    Valida que los datos extraídos por OCR coincidan con los datos del solicitante.
    
    Campos a validar:
    - Número de pasaporte
    - Nacionalidad
    - Nombres
    - Apellidos
    - Fecha de nacimiento
    
    Returns:
        - validacion_exitosa: True si todos los campos coinciden
        - campos_validados: Campos que coincidieron
        - campos_no_encontrados: Campos que OCR no pudo extraer
        - campos_con_discrepancia: Campos que no coinciden (incluye valor esperado y valor OCR)
        - puede_continuar: True si puede continuar (aunque haya discrepancias)
    """
    from app.models.models_ocr import PPSHDocumentoOCR
    import json
    
    try:
        # 1. Obtener solicitud y solicitante titular
        solicitud = db.query(PPSHSolicitud).filter(
            PPSHSolicitud.id_solicitud == id_solicitud
        ).first()
        
        if not solicitud:
            raise PPSHNotFoundException(detail=f"Solicitud {id_solicitud} no encontrada")
        
        # Obtener solicitante titular
        solicitante = db.query(PPSHSolicitante).filter(
            PPSHSolicitante.id_solicitud == id_solicitud,
            PPSHSolicitante.es_titular == True
        ).first()
        
        if not solicitante:
            raise PPSHNotFoundException(detail="No se encontró el solicitante titular")
        
        # 2. Obtener resultado OCR del documento
        ocr_result = db.query(PPSHDocumentoOCR).filter(
            PPSHDocumentoOCR.id_documento == request.id_documento,
            PPSHDocumentoOCR.estado_ocr == 'COMPLETADO'
        ).first()
        
        if not ocr_result:
            # OCR no completado o no existe
            return ValidarOCRResponse(
                validacion_exitosa=False,
                campos_validados={},
                campos_no_encontrados=["pasaporte", "nacionalidad", "nombres", "apellidos", "fecha_nacimiento"],
                campos_con_discrepancia=[],
                mensaje="El OCR aún no ha procesado el documento o falló",
                puede_continuar=True,  # Permitir continuar aunque OCR falle
                datos_ocr_raw=None,
                texto_ocr_completo=None
            )
        
        # 3. Parsear datos estructurados del OCR
        datos_ocr = {}
        if ocr_result.datos_estructurados:
            try:
                datos_ocr = json.loads(ocr_result.datos_estructurados)
            except json.JSONDecodeError:
                pass
        
        # También buscar en el texto extraído si no hay datos estructurados
        texto_ocr = (ocr_result.texto_extraido or "").upper()
        
        # 4. Preparar datos del solicitante para comparación
        datos_solicitante = {
            "pasaporte": (solicitante.num_documento or "").upper().strip(),
            "nacionalidad": (solicitante.cod_nacionalidad or "").upper().strip(),
            "nombres": f"{solicitante.primer_nombre or ''} {solicitante.segundo_nombre or ''}".upper().strip(),
            "apellidos": f"{solicitante.primer_apellido or ''} {solicitante.segundo_apellido or ''}".upper().strip(),
            "fecha_nacimiento": solicitante.fecha_nacimiento.strftime("%d/%m/%Y") if solicitante.fecha_nacimiento else ""
        }
        
        # 5. Extraer datos del OCR para comparación
        datos_extraidos = {
            "pasaporte": (
                datos_ocr.get("numero_pasaporte") or 
                datos_ocr.get("pasaporte_detectado") or 
                ""
            ).upper().strip(),
            "nacionalidad": (
                datos_ocr.get("nacionalidad") or 
                datos_ocr.get("nacionalidad_detectada") or 
                ""
            ).upper().strip(),
            "nombres": "",  # Difícil extraer sin MRZ
            "apellidos": "",  # Difícil extraer sin MRZ
            "fecha_nacimiento": ""
        }
        
        # Intentar extraer fecha de nacimiento
        fechas = datos_ocr.get("fechas_encontradas", [])
        if fechas:
            datos_extraidos["fecha_nacimiento"] = fechas[0] if fechas else ""
        if datos_ocr.get("posible_fecha_nacimiento"):
            datos_extraidos["fecha_nacimiento"] = datos_ocr["posible_fecha_nacimiento"]
        if datos_ocr.get("fecha_nacimiento"):
            datos_extraidos["fecha_nacimiento"] = datos_ocr["fecha_nacimiento"]
        
        # 6. Comparar campos
        campos_validados = {}
        campos_no_encontrados = []
        campos_con_discrepancia = []
        
        def normalizar_texto(texto):
            """Normaliza texto para comparación"""
            import unicodedata
            if not texto:
                return ""
            # Remover acentos y convertir a mayúsculas
            texto = unicodedata.normalize('NFD', texto)
            texto = ''.join(c for c in texto if unicodedata.category(c) != 'Mn')
            return texto.upper().strip()
        
        def comparar_fechas(fecha1, fecha2):
            """Compara dos fechas en diferentes formatos"""
            import re
            # Extraer solo números
            nums1 = re.findall(r'\d+', fecha1)
            nums2 = re.findall(r'\d+', fecha2)
            if len(nums1) >= 3 and len(nums2) >= 3:
                # Comparar día, mes, año
                return nums1[:3] == nums2[:3]
            return False
        
        for campo in ["pasaporte", "nacionalidad", "nombres", "apellidos", "fecha_nacimiento"]:
            valor_solicitante = datos_solicitante.get(campo, "")
            valor_ocr = datos_extraidos.get(campo, "")
            
            if not valor_ocr:
                campos_no_encontrados.append(campo)
            elif campo == "fecha_nacimiento":
                if comparar_fechas(valor_solicitante, valor_ocr):
                    campos_validados[campo] = valor_ocr
                else:
                    campos_con_discrepancia.append({
                        "campo": campo,
                        "valor_ingresado": valor_solicitante,
                        "valor_ocr": valor_ocr
                    })
            elif campo == "pasaporte":
                # Comparación exacta para pasaporte
                if normalizar_texto(valor_solicitante) == normalizar_texto(valor_ocr):
                    campos_validados[campo] = valor_ocr
                elif normalizar_texto(valor_solicitante) in normalizar_texto(texto_ocr):
                    # El número de pasaporte está en algún lugar del texto
                    campos_validados[campo] = valor_solicitante
                else:
                    campos_con_discrepancia.append({
                        "campo": campo,
                        "valor_ingresado": valor_solicitante,
                        "valor_ocr": valor_ocr
                    })
            elif campo == "nacionalidad":
                # Comparación flexible para nacionalidad (puede ser código de 3 letras o nombre completo)
                if normalizar_texto(valor_solicitante) == normalizar_texto(valor_ocr):
                    campos_validados[campo] = valor_ocr
                elif valor_solicitante in texto_ocr:
                    campos_validados[campo] = valor_solicitante
                else:
                    campos_con_discrepancia.append({
                        "campo": campo,
                        "valor_ingresado": valor_solicitante,
                        "valor_ocr": valor_ocr
                    })
            else:
                # Para nombres y apellidos, verificar si están contenidos en el texto
                if normalizar_texto(valor_solicitante) in normalizar_texto(texto_ocr):
                    campos_validados[campo] = valor_solicitante
                elif valor_ocr and normalizar_texto(valor_ocr) == normalizar_texto(valor_solicitante):
                    campos_validados[campo] = valor_ocr
                else:
                    # Si no encontramos los nombres/apellidos, marcar como no encontrado
                    campos_no_encontrados.append(campo)
        
        # 7. Determinar resultado
        validacion_exitosa = len(campos_con_discrepancia) == 0 and len(campos_no_encontrados) <= 2
        
        # Generar mensaje
        if validacion_exitosa:
            mensaje = "Validación exitosa. Los datos del documento coinciden con los datos ingresados."
        elif campos_con_discrepancia:
            campos_str = ", ".join([d["campo"] for d in campos_con_discrepancia])
            mensaje = f"Se encontraron discrepancias en: {campos_str}. Verifique que el documento sea correcto."
        else:
            mensaje = "No se pudieron extraer suficientes datos del documento para validar."
        
        return ValidarOCRResponse(
            validacion_exitosa=validacion_exitosa,
            campos_validados=campos_validados,
            campos_no_encontrados=campos_no_encontrados,
            campos_con_discrepancia=campos_con_discrepancia,
            mensaje=mensaje,
            puede_continuar=True,  # Siempre permitir continuar, el usuario decide
            datos_ocr_raw=datos_ocr,  # Datos estructurados del JSON OCR
            texto_ocr_completo=ocr_result.texto_extraido  # Texto completo sin filtrar
        )
        
    except PPSHNotFoundException as e:
        raise e
    except Exception as e:
        logger.error(f"Error validando OCR para solicitud {id_solicitud}: {str(e)}")
        # En caso de error, permitir continuar
        return ValidarOCRResponse(
            validacion_exitosa=False,
            campos_validados={},
            campos_no_encontrados=["pasaporte", "nacionalidad", "nombres", "apellidos", "fecha_nacimiento"],
            campos_con_discrepancia=[],
            mensaje=f"Error durante la validación OCR: {str(e)}",
            puede_continuar=True,
            datos_ocr_raw=None,
            texto_ocr_completo=None
        )
