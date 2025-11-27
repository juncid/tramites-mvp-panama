"""
Rutas API para el Sistema de Workflow Dinámico (Refactorizado)
Sistema de Trámites Migratorios de Panamá

Define los endpoints REST para gestión de workflows dinámicos,
usando capa de servicios para la lógica de negocio.

Author: Sistema de Trámites MVP Panamá
Date: 2025-10-20
"""

from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.infrastructure import get_db
from app.schemas import schemas_workflow as schemas
from app.services import (
    WorkflowService,
    EtapaService,
    PreguntaService,
    ConexionService,
    InstanciaService,
    ComentarioService,
    HistorialService,
    WorkflowCambiosService
)
from app.services.workflow_execution_service import WorkflowExecutionService
from app.services.workflow_ppsh_service import WorkflowPPSHIntegrationService
from app.schemas import schemas_ppsh

# Importar router de vista_config
from app.routes.vista_config import router as vista_config_router

# Router principal
router = APIRouter(prefix="/workflow", tags=["Workflow Dinámico"])

# Incluir sub-router de vistas dinámicas
router.include_router(vista_config_router, tags=["Vistas Dinámicas"])


# ==========================================
# ENDPOINTS DE WORKFLOW
# ==========================================

@router.post("/workflows", response_model=schemas.WorkflowResponse, status_code=status.HTTP_201_CREATED)
def crear_workflow(
    workflow: schemas.WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: str = "ADMIN"  # TODO: Integrar con sistema de autenticación
):
    """Crea un nuevo workflow (plantilla de proceso)"""
    return WorkflowService.crear_workflow(db, workflow, current_user)


@router.get("/workflows", response_model=List[schemas.WorkflowListResponse])
def listar_workflows(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    estado: Optional[schemas.EstadoWorkflowEnum] = None,
    categoria: Optional[str] = None,
    activo: bool = Query(True, description="Filtrar por workflows activos (True) o inactivos (False)"),
    db: Session = Depends(get_db)
):
    """Lista todos los workflows disponibles. Por defecto solo muestra workflows activos."""
    return WorkflowService.listar_workflows(db, skip, limit, estado, categoria, activo)


@router.get("/workflows/{workflow_id}", response_model=schemas.WorkflowResponse)
def obtener_workflow(workflow_id: int, db: Session = Depends(get_db)):
    """Obtiene los detalles completos de un workflow"""
    return WorkflowService.obtener_workflow(db, workflow_id)


@router.put("/workflows/{workflow_id}", response_model=schemas.WorkflowResponse)
def actualizar_workflow(
    workflow_id: int,
    workflow_update: schemas.WorkflowUpdate,
    db: Session = Depends(get_db),
    current_user: str = "ADMIN"
):
    """Actualiza la información de un workflow"""
    return WorkflowService.actualizar_workflow(db, workflow_id, workflow_update, current_user)


@router.delete("/workflows/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: str = "ADMIN"
):
    """Elimina (desactiva) un workflow"""
    WorkflowService.eliminar_workflow(db, workflow_id, current_user)


@router.get("/workflows/{workflow_id}/historial-cambios", response_model=List[schemas.WorkflowCambiosResponse])
def obtener_historial_cambios_workflow(
    workflow_id: int,
    limit: int = Query(50, ge=1, le=200, description="Número máximo de registros a retornar"),
    offset: int = Query(0, ge=0, description="Número de registros a saltar"),
    db: Session = Depends(get_db)
):
    """
    Obtiene el historial de cambios de un workflow (plantilla).
    
    Retorna los cambios ordenados del más reciente al más antiguo.
    Incluye: creación, edición de etapas, nuevas etapas, eliminación de etapas,
    cambios de conexiones, publicación, configuración, cambios de estado.
    """
    # Verificar que el workflow existe
    WorkflowService.obtener_workflow(db, workflow_id)
    
    # Obtener historial
    cambios = WorkflowCambiosService.obtener_historial(db, workflow_id, limit, offset)
    
    # Convertir a response con detalles estructurados
    return [schemas.WorkflowCambiosResponse.from_orm_with_detalles(c) for c in cambios]


@router.post("/workflows/{workflow_id}/historial-cambios", response_model=schemas.WorkflowCambiosResponse, status_code=status.HTTP_201_CREATED)
def registrar_cambio_workflow(
    workflow_id: int,
    cambio: schemas.WorkflowCambiosCreate,
    db: Session = Depends(get_db),
    current_user: str = "ADMIN"
):
    """
    Registra un cambio en el historial del workflow.
    
    Tipos de cambio válidos:
    - CREACION: Workflow creado
    - EDICION_ETAPA: Etapa modificada
    - NUEVA_ETAPA: Nueva etapa agregada
    - ELIMINAR_ETAPA: Etapa eliminada
    - CAMBIO_CONEXION: Conexión modificada
    - PUBLICACION: Workflow publicado
    - CONFIGURACION: Configuración actualizada
    - CAMBIO_ESTADO: Estado del workflow cambiado
    """
    # Verificar que el workflow existe
    WorkflowService.obtener_workflow(db, workflow_id)
    
    db_cambio = WorkflowCambiosService.registrar_cambio(
        db=db,
        workflow_id=workflow_id,
        tipo_cambio=cambio.tipo_cambio,
        accion=cambio.accion,
        descripcion=cambio.descripcion,
        etapa_id=cambio.etapa_id,
        etapa_codigo=cambio.etapa_codigo,
        etapa_nombre=cambio.etapa_nombre,
        campo_modificado=cambio.campo_modificado,
        valor_anterior=cambio.valor_anterior,
        valor_nuevo=cambio.valor_nuevo,
        datos_adicionales=cambio.datos_adicionales,
        created_by=current_user,
        created_by_nombre=current_user  # TODO: Obtener nombre real del usuario
    )
    db.commit()
    db.refresh(db_cambio)
    
    return schemas.WorkflowCambiosResponse.from_orm_with_detalles(db_cambio)


# ==========================================
# ENDPOINTS DE ETAPAS
# ==========================================

@router.post("/etapas", response_model=schemas.WorkflowEtapaResponse, status_code=status.HTTP_201_CREATED)
def crear_etapa(
    etapa: schemas.WorkflowEtapaCreate,
    db: Session = Depends(get_db),
    current_user: str = "ADMIN"
):
    """Crea una nueva etapa en un workflow"""
    db_etapa = EtapaService.crear_etapa_con_preguntas(db, etapa, etapa.workflow_id, current_user)
    db.commit()
    db.refresh(db_etapa)
    return db_etapa


@router.get("/etapas/{etapa_id}", response_model=schemas.WorkflowEtapaResponse)
def obtener_etapa(etapa_id: int, db: Session = Depends(get_db)):
    """Obtiene los detalles de una etapa"""
    return EtapaService.obtener_etapa(db, etapa_id)


@router.put("/etapas/{etapa_id}", response_model=schemas.WorkflowEtapaResponse)
def actualizar_etapa(
    etapa_id: int,
    etapa_update: schemas.WorkflowEtapaUpdate,
    db: Session = Depends(get_db),
    current_user: str = "ADMIN"
):
    """Actualiza una etapa"""
    return EtapaService.actualizar_etapa(db, etapa_id, etapa_update, current_user)


@router.delete("/etapas/{etapa_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_etapa(
    etapa_id: int,
    db: Session = Depends(get_db),
    current_user: str = "ADMIN"
):
    """Elimina (desactiva) una etapa"""
    EtapaService.eliminar_etapa(db, etapa_id, current_user)


# ==========================================
# ENDPOINTS DE PREGUNTAS
# ==========================================

@router.post("/preguntas", response_model=schemas.WorkflowPreguntaResponse, status_code=status.HTTP_201_CREATED)
def crear_pregunta(
    pregunta: schemas.WorkflowPreguntaCreate,
    db: Session = Depends(get_db),
    current_user: str = "ADMIN"
):
    """Crea una nueva pregunta en una etapa"""
    db_pregunta = PreguntaService.crear_pregunta(db, pregunta, pregunta.etapa_id, current_user)
    db.commit()
    db.refresh(db_pregunta)
    return db_pregunta


@router.get("/preguntas/{pregunta_id}", response_model=schemas.WorkflowPreguntaResponse)
def obtener_pregunta(pregunta_id: int, db: Session = Depends(get_db)):
    """Obtiene los detalles de una pregunta"""
    return PreguntaService.obtener_pregunta(db, pregunta_id)


@router.put("/preguntas/{pregunta_id}", response_model=schemas.WorkflowPreguntaResponse)
def actualizar_pregunta(
    pregunta_id: int,
    pregunta_update: schemas.WorkflowPreguntaUpdate,
    db: Session = Depends(get_db),
    current_user: str = "ADMIN"
):
    """Actualiza una pregunta"""
    return PreguntaService.actualizar_pregunta(db, pregunta_id, pregunta_update, current_user)


@router.delete("/preguntas/{pregunta_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_pregunta(
    pregunta_id: int,
    db: Session = Depends(get_db),
    current_user: str = "ADMIN"
):
    """Elimina (desactiva) una pregunta"""
    PreguntaService.eliminar_pregunta(db, pregunta_id, current_user)


# ==========================================
# ENDPOINTS DE CONEXIONES
# ==========================================

@router.post("/conexiones", response_model=schemas.WorkflowConexionResponse, status_code=status.HTTP_201_CREATED)
def crear_conexion(
    conexion: schemas.WorkflowConexionCreate,
    db: Session = Depends(get_db),
    current_user: str = "ADMIN"
):
    """Crea una nueva conexión entre etapas"""
    db_conexion = ConexionService.crear_conexion(db, conexion, conexion.workflow_id, current_user)
    db.commit()
    db.refresh(db_conexion)
    return db_conexion


@router.get("/conexiones/{conexion_id}", response_model=schemas.WorkflowConexionResponse)
def obtener_conexion(conexion_id: int, db: Session = Depends(get_db)):
    """Obtiene los detalles de una conexión"""
    return ConexionService.obtener_conexion(db, conexion_id)


@router.put("/conexiones/{conexion_id}", response_model=schemas.WorkflowConexionResponse)
def actualizar_conexion(
    conexion_id: int,
    conexion_update: schemas.WorkflowConexionUpdate,
    db: Session = Depends(get_db)
):
    """Actualiza una conexión"""
    return ConexionService.actualizar_conexion(db, conexion_id, conexion_update)


@router.delete("/conexiones/{conexion_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_conexion(conexion_id: int, db: Session = Depends(get_db)):
    """Elimina una conexión"""
    ConexionService.eliminar_conexion(db, conexion_id)


# ==========================================
# ENDPOINTS DE INSTANCIAS
# ==========================================

@router.post("/instancias", response_model=schemas.WorkflowInstanciaResponse, status_code=status.HTTP_201_CREATED)
def crear_instancia(
    instancia: schemas.WorkflowInstanciaCreate,
    db: Session = Depends(get_db),
    current_user: str = "USER001"  # TODO: Obtener del sistema de autenticación
):
    """Inicia una nueva instancia de un workflow"""
    return InstanciaService.crear_instancia(db, instancia, current_user)


@router.post("/instancias/crear-con-ppsh", response_model=schemas.WorkflowInstanciaPPSHResponse, status_code=status.HTTP_201_CREATED)
def crear_instancia_con_ppsh(
    datos: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: str = "USER001"  # TODO: Obtener del sistema de autenticación
):
    """
    Crea una instancia de workflow con solicitud PPSH integrada
    
    Esta operación crea ambas entidades en una sola transacción:
    1. Solicitud PPSH con sus solicitantes
    2. Instancia de workflow vinculada a la solicitud
    
    Args:
        datos: Diccionario con:
            - workflow_id: ID del workflow a instanciar
            - nombre_instancia: Nombre descriptivo (opcional)
            - solicitud_ppsh: Datos completos de la solicitud PPSH
    
    Returns:
        WorkflowInstanciaPPSHResponse con datos de ambas entidades
    """
    # Validar estructura básica
    if "workflow_id" not in datos or "solicitud_ppsh" not in datos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Se requieren campos 'workflow_id' y 'solicitud_ppsh'"
        )

    # Parsear solicitud_ppsh con schema Pydantic
    try:
        solicitud_data = schemas_ppsh.SolicitudCreate(**datos["solicitud_ppsh"])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al validar datos de solicitud PPSH: {str(e)}"
        )

    # Crear instancia con solicitud
    instancia, solicitud = WorkflowPPSHIntegrationService.crear_instancia_con_solicitud_ppsh(
        db=db,
        workflow_id=datos["workflow_id"],
        solicitud_data=solicitud_data,
        nombre_instancia=datos.get("nombre_instancia"),
        user_id=current_user
    )

    # Construir respuesta
    vinculacion = WorkflowPPSHIntegrationService.obtener_datos_vinculacion(db, instancia.id)

    return schemas.WorkflowInstanciaPPSHResponse(
        instancia_id=instancia.id,
        instancia_num_expediente=instancia.num_expediente,
        instancia_nombre=instancia.nombre_instancia,
        instancia_estado=instancia.estado,
        instancia_etapa_actual_id=instancia.etapa_actual_id,
        instancia_fecha_inicio=instancia.fecha_inicio,
        solicitud_id=solicitud.id_solicitud,
        solicitud_num_expediente=solicitud.num_expediente,
        solicitud_tipo=solicitud.tipo_solicitud,
        solicitud_estado=solicitud.estado_actual,
        solicitud_causa_humanitaria=solicitud.cod_causa_humanitaria,
        solicitud_fecha_solicitud=solicitud.fecha_solicitud.isoformat(),
        fecha_vinculacion=instancia.created_at,
        vinculado_por=current_user,
        es_vinculacion_posterior=False
    )


@router.post("/instancias/vincular-ppsh-existente", response_model=schemas.WorkflowInstanciaPPSHResponse, status_code=status.HTTP_201_CREATED)
def vincular_ppsh_existente(
    datos: schemas.WorkflowInstanciaConPPSHExistenteCreate,
    db: Session = Depends(get_db),
    current_user: str = "USER001"
):
    """
    Crea instancia de workflow vinculando solicitud PPSH existente
    
    Útil para:
    - Migración de solicitudes legacy
    - Re-procesamiento de solicitudes existentes
    - Solicitudes creadas externamente
    
    Args:
        datos: WorkflowInstanciaConPPSHExistenteCreate con workflow_id y solicitud_id
    
    Returns:
        WorkflowInstanciaPPSHResponse con datos de vinculación
    """
    # Vincular solicitud existente
    instancia = WorkflowPPSHIntegrationService.vincular_solicitud_existente(
        db=db,
        workflow_id=datos.workflow_id,
        solicitud_id=datos.solicitud_id,
        nombre_instancia=datos.nombre_instancia,
        user_id=current_user
    )

    # Obtener solicitud para respuesta
    solicitud = WorkflowPPSHIntegrationService.obtener_solicitud_ppsh_desde_instancia(db, instancia.id)

    if not solicitud:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener solicitud vinculada"
        )

    vinculacion = WorkflowPPSHIntegrationService.obtener_datos_vinculacion(db, instancia.id)

    return schemas.WorkflowInstanciaPPSHResponse(
        instancia_id=instancia.id,
        instancia_num_expediente=instancia.num_expediente,
        instancia_nombre=instancia.nombre_instancia,
        instancia_estado=instancia.estado,
        instancia_etapa_actual_id=instancia.etapa_actual_id,
        instancia_fecha_inicio=instancia.fecha_inicio,
        solicitud_id=solicitud.id_solicitud,
        solicitud_num_expediente=solicitud.num_expediente,
        solicitud_tipo=solicitud.tipo_solicitud,
        solicitud_estado=solicitud.estado_actual,
        solicitud_causa_humanitaria=solicitud.cod_causa_humanitaria,
        solicitud_fecha_solicitud=solicitud.fecha_solicitud.isoformat(),
        fecha_vinculacion=instancia.created_at,
        vinculado_por=vinculacion["vinculado_por"] if vinculacion else current_user,
        es_vinculacion_posterior=vinculacion.get("es_vinculacion_posterior", True) if vinculacion else True
    )


@router.get("/instancias/{instancia_id}/vinculacion-ppsh", response_model=schemas.DatosVinculacionPPSHResponse)
def obtener_vinculacion_ppsh(
    instancia_id: int,
    expanded: bool = Query(False, description="Incluir datos completos de la solicitud PPSH"),
    db: Session = Depends(get_db)
):
    """
    Obtiene información de vinculación PPSH de una instancia
    
    Args:
        instancia_id: ID de la instancia de workflow
        expanded: Si es True, incluye datos completos de la solicitud
    
    Returns:
        DatosVinculacionPPSHResponse con información de vinculación
    """
    vinculacion = WorkflowPPSHIntegrationService.obtener_datos_vinculacion(db, instancia_id)

    if not vinculacion:
        return schemas.DatosVinculacionPPSHResponse(tiene_vinculacion=False)

    response = schemas.DatosVinculacionPPSHResponse(
        tiene_vinculacion=True,
        **vinculacion
    )

    # Si se solicita expanded, incluir datos completos de solicitud
    if expanded:
        solicitud = WorkflowPPSHIntegrationService.obtener_solicitud_ppsh_desde_instancia(db, instancia_id)
        if solicitud:
            # Convertir solicitud a dict (simplificado)
            response.solicitud = {
                "id_solicitud": solicitud.id_solicitud,
                "num_expediente": solicitud.num_expediente,
                "tipo_solicitud": solicitud.tipo_solicitud,
                "estado_actual": solicitud.estado_actual,
                "fecha_solicitud": solicitud.fecha_solicitud.isoformat(),
                "descripcion_caso": solicitud.descripcion_caso,
                "prioridad": solicitud.prioridad
            }

    return response


@router.get("/instancias", response_model=List[schemas.WorkflowInstanciaResponse])
def listar_instancias(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    workflow_id: Optional[int] = None,
    estado: Optional[schemas.EstadoInstanciaEnum] = None,
    creado_por: Optional[str] = None,
    asignado_a: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Lista las instancias de workflows"""
    return InstanciaService.listar_instancias(
        db, skip, limit, workflow_id, estado, creado_por, asignado_a
    )


@router.get("/instancias/{instancia_id}", response_model=schemas.WorkflowInstanciaDetalleResponse)
def obtener_instancia(instancia_id: int, db: Session = Depends(get_db)):
    """Obtiene los detalles completos de una instancia"""
    return InstanciaService.obtener_instancia(db, instancia_id)


@router.put("/instancias/{instancia_id}", response_model=schemas.WorkflowInstanciaResponse)
def actualizar_instancia(
    instancia_id: int,
    instancia_update: schemas.WorkflowInstanciaUpdate,
    db: Session = Depends(get_db),
    current_user: str = "ADMIN"
):
    """Actualiza una instancia de workflow"""
    return InstanciaService.actualizar_instancia(db, instancia_id, instancia_update, current_user)


@router.post("/instancias/{instancia_id}/transicion", response_model=schemas.WorkflowTransicionResponse)
def transicionar_instancia(
    instancia_id: int,
    transicion: schemas.WorkflowTransicionRequest,
    db: Session = Depends(get_db),
    current_user: str = "USER001"
):
    """Realiza una transición de una etapa a otra en una instancia"""
    return InstanciaService.transicionar_instancia(db, instancia_id, transicion, current_user)


@router.get("/instancias/{instancia_id}/vista-actual")
def obtener_vista_actual(
    instancia_id: int,
    db: Session = Depends(get_db),
    current_user: str = "USER001",  # TODO: Obtener del sistema de autenticación
    user_perfil: str = Query("FUNCIONARIO", description="Perfil del usuario (ADMIN, FUNCIONARIO, SOLICITANTE, etc.)")
):
    """
    Obtiene la vista de la etapa actual filtrada según permisos del usuario
    
    Este endpoint retorna la configuración de campos que debe mostrar el frontend
    para la etapa actual de la instancia, teniendo en cuenta:
    - Permisos del perfil del usuario
    - Estado de la instancia
    - Campos configurados en la etapa
    - Respuestas previas (si existen)
    - Visibilidad condicional de campos
    
    Args:
        instancia_id: ID de la instancia de workflow
        current_user: ID del usuario actual (del sistema de autenticación)
        user_perfil: Perfil/rol del usuario
    
    Returns:
        Diccionario con:
        - instancia: Datos básicos de la instancia
        - etapa_actual: Información de la etapa actual
        - puede_ver: Si el usuario puede ver la etapa
        - puede_editar: Si el usuario puede editar/completar la etapa
        - campos: Lista de campos visibles con sus configuraciones
        - metadata_instancia: Metadata adicional de la instancia
    
    Raises:
        403: Si el usuario no tiene permiso para ver la etapa
        404: Si la instancia no existe
    """
    return InstanciaService.obtener_vista_actual_para_usuario(
        db=db,
        user_id=current_user,
        user_perfil=user_perfil,
        instancia_id=instancia_id
    )


@router.get("/instancias/{instancia_id}/vista-etapa/{etapa_id}")
def obtener_vista_etapa_especifica(
    instancia_id: int,
    etapa_id: int,
    db: Session = Depends(get_db),
    current_user: str = "USER001",
    user_perfil: str = Query("FUNCIONARIO", description="Perfil del usuario")
):
    """
    Obtiene la vista de una etapa específica (para modo readonly/historial)
    
    Este endpoint permite obtener la vista de cualquier etapa de la instancia,
    no solo la etapa actual. Útil para:
    - Ver etapas completadas en modo readonly
    - Revisar historial de respuestas
    - Consultar detalles de etapas pasadas
    
    Args:
        instancia_id: ID de la instancia de workflow
        etapa_id: ID de la etapa específica a obtener
        current_user: ID del usuario actual
        user_perfil: Perfil/rol del usuario
    
    Returns:
        Mismo formato que vista-actual, con información adicional:
        - es_etapa_completada: Si la etapa ya fue completada
    """
    return InstanciaService.obtener_vista_etapa_especifica(
        db=db,
        user_id=current_user,
        user_perfil=user_perfil,
        instancia_id=instancia_id,
        etapa_id=etapa_id
    )


@router.get("/instancias/{instancia_id}/verificar-permisos")
def verificar_permisos_etapa(
    instancia_id: int,
    etapa_id: Optional[int] = Query(None, description="ID de etapa a verificar (usa etapa actual si se omite)"),
    db: Session = Depends(get_db),
    current_user: str = "USER001",
    user_perfil: str = Query("FUNCIONARIO", description="Perfil del usuario")
):
    """
    Verifica permisos del usuario para una etapa específica
    
    Útil para validaciones en el frontend antes de intentar operaciones.
    
    Args:
        instancia_id: ID de la instancia de workflow
        etapa_id: ID de la etapa a verificar (opcional, usa etapa actual si se omite)
        current_user: ID del usuario actual
        user_perfil: Perfil/rol del usuario
    
    Returns:
        Diccionario con:
        - puede_ver: Si el usuario puede ver la etapa
        - puede_editar: Si el usuario puede editar la etapa
        - etapa_id: ID de la etapa verificada
        - etapa_nombre: Nombre de la etapa
        - razon: Explicación de los permisos
    """
    # Obtener instancia
    instancia = InstanciaService.obtener_instancia(db, instancia_id)

    # Si no se especifica etapa, usar etapa actual
    if not etapa_id:
        if not instancia.etapa_actual_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La instancia no tiene una etapa actual definida"
            )
        etapa_id = instancia.etapa_actual_id

    # Obtener etapa
    etapa = EtapaService.obtener_etapa(db, etapa_id)

    # Verificar permisos
    puede_ver = InstanciaService.puede_usuario_ver_etapa(
        db, current_user, user_perfil, etapa_id
    )

    puede_editar = InstanciaService.puede_usuario_editar_etapa(
        db, current_user, user_perfil, instancia_id, etapa_id
    )

    # Construir razón
    razones = []
    if not puede_ver:
        razones.append(f"El perfil '{user_perfil}' no está en la lista de perfiles permitidos para esta etapa")
    elif not puede_editar:
        if instancia.etapa_actual_id != etapa_id:
            razones.append("Solo se puede editar la etapa actual de la instancia")
        elif instancia.estado in ["COMPLETADO", "CANCELADO"]:
            razones.append(f"La instancia está en estado '{instancia.estado}' (terminal)")
        elif instancia.asignado_a_user_id and instancia.asignado_a_user_id != current_user and user_perfil != "ADMIN":
            razones.append(f"La instancia está asignada a otro usuario ({instancia.asignado_a_user_id})")
        else:
            razones.append("Sin permiso de edición")

    return {
        "puede_ver": puede_ver,
        "puede_editar": puede_editar,
        "etapa_id": etapa.id,
        "etapa_codigo": etapa.codigo,
        "etapa_nombre": etapa.nombre,
        "es_etapa_actual": instancia.etapa_actual_id == etapa_id,
        "perfil_usuario": user_perfil,
        "perfiles_permitidos": etapa.perfiles_permitidos,
        "razon": razones[0] if razones else "Permisos válidos"
    }


# ==========================================
# ENDPOINTS DE COMENTARIOS
# ==========================================

@router.post("/instancias/{instancia_id}/comentarios", response_model=schemas.WorkflowComentarioResponse, status_code=status.HTTP_201_CREATED)
def agregar_comentario(
    instancia_id: int,
    comentario: schemas.WorkflowComentarioCreate,
    db: Session = Depends(get_db),
    current_user: str = "USER001"
):
    """Agrega un comentario a una instancia"""
    return ComentarioService.crear_comentario(db, instancia_id, comentario, current_user)


@router.get("/instancias/{instancia_id}/comentarios", response_model=List[schemas.WorkflowComentarioResponse])
def listar_comentarios(
    instancia_id: int,
    incluir_internos: bool = True,
    db: Session = Depends(get_db)
):
    """Lista los comentarios de una instancia"""
    return ComentarioService.listar_comentarios(db, instancia_id, incluir_internos)


# ==========================================
# ENDPOINTS DE HISTORIAL
# ==========================================

@router.get("/instancias/{instancia_id}/historial", response_model=List[schemas.WorkflowHistorialResponse])
def obtener_historial(instancia_id: int, db: Session = Depends(get_db)):
    """Obtiene el historial completo de cambios de una instancia"""
    return HistorialService.obtener_historial(db, instancia_id)


# ==========================================
# ENDPOINTS DE EJECUCIÓN POR USUARIO
# ==========================================

@router.get("/workflows/{workflow_id}/etapas/by-perfil", response_model=List[schemas.WorkflowEtapaResponse])
def obtener_etapas_por_perfil(
    workflow_id: int,
    perfil: str = Query(..., description="Perfil del usuario (ej: CIUDADANO, FUNCIONARIO, ABOGADO)"),
    db: Session = Depends(get_db)
):
    """
    Obtiene las etapas de un workflow filtradas por perfil de usuario.
    Solo retorna etapas donde el perfil está asignado en perfiles_permitidos.
    """
    etapas = WorkflowExecutionService.obtener_etapas_por_perfil(db, workflow_id, perfil)
    return etapas


@router.get("/instancias/{instancia_id}/workflow-state")
def obtener_estado_workflow_instancia(
    instancia_id: int,
    perfil: Optional[str] = Query(None, description="Perfil del usuario para filtrar etapas visibles"),
    db: Session = Depends(get_db)
):
    """
    Obtiene el estado completo del workflow para una instancia.
    Incluye: etapa actual, etapas completadas, progreso, respuestas guardadas.
    """
    return WorkflowExecutionService.obtener_estado_workflow(db, instancia_id, perfil)


@router.post("/instancias/{instancia_id}/etapas/{etapa_id}/ejecutar", response_model=schemas.EjecutarEtapaResponse)
def ejecutar_etapa(
    instancia_id: int,
    etapa_id: int,
    request: schemas.EjecutarEtapaRequest,
    perfil: str = Query(..., description="Perfil del usuario ejecutando la etapa"),
    db: Session = Depends(get_db),
    current_user: str = "USER001"  # TODO: Obtener del sistema de autenticación
):
    """
    Ejecuta una etapa del workflow: guarda respuestas y transiciona a la siguiente etapa.
    
    Body esperado:
    {
        "respuestas": {
            "pregunta-codigo-1": "valor",
            "pregunta-codigo-2": ["opcion1", "opcion2"]
        },
        "archivos": {
            "pregunta-archivo": "file_id_123"
        }
    }
    """
    return WorkflowExecutionService.ejecutar_etapa(
        db, instancia_id, etapa_id, request.respuestas, request.archivos, current_user, perfil
    )


# ==========================================
# ENDPOINTS DE ARCHIVOS ESTÁTICOS
# ==========================================

from fastapi import UploadFile, File
import os
import uuid
from datetime import datetime

STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "documentos")

@router.post("/admin/archivos/upload", tags=["Administración"])
async def upload_archivo_estatico(
    file: UploadFile = File(...),
    nombre_personalizado: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: str = "ADMIN"
):
    """
    Sube un archivo estático para ser usado en preguntas de tipo DESCARGA_ARCHIVO.
    
    Retorna la URL del archivo que puede ser usada en el campo 'opciones' de la pregunta.
    """
    # Validar tipo de archivo
    extensiones_permitidas = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.png', '.jpg', '.jpeg']
    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in extensiones_permitidas:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de archivo no permitido. Extensiones permitidas: {', '.join(extensiones_permitidas)}"
        )

    # Crear directorio si no existe
    os.makedirs(STATIC_DIR, exist_ok=True)

    # Generar nombre único para el archivo
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    nombre_archivo = nombre_personalizado or file.filename
    nombre_seguro = f"{timestamp}_{unique_id}_{nombre_archivo.replace(' ', '_')}"

    # Guardar archivo
    file_path = os.path.join(STATIC_DIR, nombre_seguro)

    try:
        contents = await file.read()
        with open(file_path, 'wb') as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar archivo: {str(e)}")

    # Construir URL del archivo
    archivo_url = f"/static/documentos/{nombre_seguro}"

    return {
        "success": True,
        "archivo_url": archivo_url,
        "nombre_archivo": nombre_archivo,
        "tamano_bytes": len(contents),
        "tipo_archivo": file.content_type,
        "opciones_json": {
            "archivo_url": archivo_url,
            "nombre_archivo": nombre_archivo,
            "tipo_archivo": file.content_type
        },
        "mensaje": "Archivo subido correctamente. Use el campo 'opciones_json' para configurar la pregunta de tipo DESCARGA_ARCHIVO."
    }


@router.get("/admin/archivos", tags=["Administración"])
def listar_archivos_estaticos():
    """
    Lista todos los archivos estáticos disponibles para descargas.
    """
    if not os.path.exists(STATIC_DIR):
        return {"archivos": [], "directorio": STATIC_DIR}

    archivos = []
    for filename in os.listdir(STATIC_DIR):
        file_path = os.path.join(STATIC_DIR, filename)
        if os.path.isfile(file_path):
            archivos.append({
                "nombre": filename,
                "url": f"/static/documentos/{filename}",
                "tamano_bytes": os.path.getsize(file_path),
                "fecha_modificacion": datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat()
            })

    return {
        "archivos": archivos,
        "total": len(archivos),
        "directorio": "/static/documentos/"
    }


@router.patch("/preguntas/{pregunta_id}/configurar-descarga", tags=["Administración"])
def configurar_pregunta_descarga(
    pregunta_id: int,
    archivo_url: str = Query(..., description="URL del archivo (ej: /static/documentos/requisitos.pdf)"),
    nombre_archivo: str = Query(..., description="Nombre a mostrar en el botón de descarga"),
    db: Session = Depends(get_db)
):
    """
    Configura una pregunta de tipo DESCARGA_ARCHIVO con la URL del archivo a descargar.
    """
    from app.models.models_workflow import WorkflowPregunta
    import json

    pregunta = db.query(WorkflowPregunta).filter(WorkflowPregunta.id == pregunta_id).first()

    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")

    if pregunta.tipo_pregunta.value != "DESCARGA_ARCHIVO":
        raise HTTPException(
            status_code=400,
            detail=f"La pregunta no es de tipo DESCARGA_ARCHIVO (es {pregunta.tipo_pregunta.value})"
        )

    # Actualizar opciones con la URL del archivo
    opciones = {
        "archivo_url": archivo_url,
        "nombre_archivo": nombre_archivo,
        "tipo_archivo": "application/octet-stream"  # Tipo genérico
    }

    pregunta.opciones = json.dumps(opciones)
    db.commit()

    return {
        "success": True,
        "pregunta_id": pregunta_id,
        "opciones": opciones,
        "mensaje": f"Pregunta '{pregunta.pregunta}' configurada con archivo de descarga"
    }

