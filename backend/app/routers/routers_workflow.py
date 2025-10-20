"""
Rutas API para el Sistema de Workflow Dinámico (Refactorizado)
Sistema de Trámites Migratorios de Panamá

Define los endpoints REST para gestión de workflows dinámicos,
usando capa de servicios para la lógica de negocio.

Author: Sistema de Trámites MVP Panamá
Date: 2025-10-20
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.infrastructure import get_db
from app.schemas import schemas_workflow as schemas
from app.services import (
    WorkflowService,
    EtapaService,
    PreguntaService,
    ConexionService,
    InstanciaService,
    ComentarioService,
    HistorialService
)

# Router principal
router = APIRouter(prefix="/workflow", tags=["Workflow Dinámico"])


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
    activo: bool = True,
    db: Session = Depends(get_db)
):
    """Lista todos los workflows disponibles"""
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
