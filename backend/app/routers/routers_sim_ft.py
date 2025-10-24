"""
Routers para el Sistema Integrado de Migración SIM_FT_*
Endpoints API REST para gestión de trámites migratorios
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from datetime import datetime
import json

from app.infrastructure.database import get_db
from app.infrastructure.redis_client import get_redis
from app.models.models_sim_ft import (
    SimFtTramites,
    SimFtEstatus,
    SimFtConclusion,
    SimFtPrioridad,
    SimFtPasos,
    SimFtPasoXTram,
    SimFtUsuaSec,
    SimFtTramiteE,
    SimFtTramiteD,
    SimFtTramiteCierre,
    SimFtDependteCierre
)
from app.schemas.schemas_sim_ft import (
    SimFtTramitesCreate,
    SimFtTramitesUpdate,
    SimFtTramitesResponse,
    SimFtEstatusCreate,
    SimFtEstatusUpdate,
    SimFtEstatusResponse,
    SimFtConclusionCreate,
    SimFtConclusionUpdate,
    SimFtConclusionResponse,
    SimFtPrioridadCreate,
    SimFtPrioridadUpdate,
    SimFtPrioridadResponse,
    SimFtPasosCreate,
    SimFtPasosUpdate,
    SimFtPasosResponse,
    SimFtPasoXTramCreate,
    SimFtPasoXTramUpdate,
    SimFtPasoXTramResponse,
    SimFtUsuaSecCreate,
    SimFtUsuaSecUpdate,
    SimFtUsuaSecResponse,
    SimFtTramiteECreate,
    SimFtTramiteEUpdate,
    SimFtTramiteEResponse,
    SimFtTramiteDCreate,
    SimFtTramiteDUpdate,
    SimFtTramiteDResponse,
    SimFtTramiteCierreCreate,
    SimFtTramiteCierreResponse,
    SimFtDependteCierreCreate,
    SimFtDependteCierreResponse
)

router = APIRouter(prefix="/sim-ft", tags=["SIM_FT"])

# ============================================================================
# CATÁLOGOS - Tipos de Trámites
# ============================================================================

@router.get("/tramites-tipos", response_model=List[SimFtTramitesResponse])
async def get_tipos_tramites(
    skip: int = 0,
    limit: int = 100,
    activo: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Obtener catálogo de tipos de trámites"""
    query = db.query(SimFtTramites)
    
    if activo is not None:
        query = query.filter(SimFtTramites.IND_ACTIVO == ('S' if activo else 'N'))
    
    return query.order_by(SimFtTramites.COD_TRAMITE).offset(skip).limit(limit).all()


@router.get("/tramites-tipos/{cod_tramite}", response_model=SimFtTramitesResponse)
async def get_tipo_tramite(cod_tramite: str, db: Session = Depends(get_db)):
    """Obtener un tipo de trámite específico"""
    tramite = db.query(SimFtTramites).filter(
        SimFtTramites.COD_TRAMITE == cod_tramite
    ).first()
    
    if not tramite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tipo de trámite '{cod_tramite}' no encontrado"
        )
    
    return tramite


@router.post("/tramites-tipos", response_model=SimFtTramitesResponse, status_code=status.HTTP_201_CREATED)
async def create_tipo_tramite(
    tramite: SimFtTramitesCreate,
    db: Session = Depends(get_db)
):
    """Crear un nuevo tipo de trámite"""
    # Verificar si ya existe
    existing = db.query(SimFtTramites).filter(
        SimFtTramites.COD_TRAMITE == tramite.COD_TRAMITE
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un tipo de trámite con código '{tramite.COD_TRAMITE}'"
        )
    
    db_tramite = SimFtTramites(**tramite.model_dump())
    db.add(db_tramite)
    db.commit()
    db.refresh(db_tramite)
    
    return db_tramite


@router.put("/tramites-tipos/{cod_tramite}", response_model=SimFtTramitesResponse)
async def update_tipo_tramite(
    cod_tramite: str,
    tramite_update: SimFtTramitesUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un tipo de trámite"""
    db_tramite = db.query(SimFtTramites).filter(
        SimFtTramites.COD_TRAMITE == cod_tramite
    ).first()
    
    if not db_tramite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tipo de trámite '{cod_tramite}' no encontrado"
        )
    
    update_data = tramite_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_tramite, field, value)
    
    db_tramite.FEC_MODIF_REG = datetime.now()
    db.commit()
    db.refresh(db_tramite)
    
    return db_tramite


@router.delete("/tramites-tipos/{cod_tramite}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tipo_tramite(cod_tramite: str, db: Session = Depends(get_db)):
    """Desactivar un tipo de trámite (soft delete)"""
    db_tramite = db.query(SimFtTramites).filter(
        SimFtTramites.COD_TRAMITE == cod_tramite
    ).first()
    
    if not db_tramite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tipo de trámite '{cod_tramite}' no encontrado"
        )
    
    db_tramite.IND_ACTIVO = 'N'
    db_tramite.FEC_MODIF_REG = datetime.now()
    db.commit()


# ============================================================================
# CATÁLOGOS - Estados
# ============================================================================

@router.get("/estatus", response_model=List[SimFtEstatusResponse])
async def get_estatus(
    skip: int = 0,
    limit: int = 100,
    activo: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Obtener catálogo de estados"""
    query = db.query(SimFtEstatus)
    
    if activo is not None:
        query = query.filter(SimFtEstatus.IND_ACTIVO == ('S' if activo else 'N'))
    
    return query.order_by(SimFtEstatus.COD_ESTATUS).offset(skip).limit(limit).all()


@router.get("/estatus/{cod_estatus}", response_model=SimFtEstatusResponse)
async def get_estatus_by_id(cod_estatus: str, db: Session = Depends(get_db)):
    """Obtener un estado específico"""
    estatus = db.query(SimFtEstatus).filter(
        SimFtEstatus.COD_ESTATUS == cod_estatus
    ).first()
    
    if not estatus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Estado '{cod_estatus}' no encontrado"
        )
    
    return estatus


@router.post("/estatus", response_model=SimFtEstatusResponse, status_code=status.HTTP_201_CREATED)
async def create_estatus(estatus: SimFtEstatusCreate, db: Session = Depends(get_db)):
    """Crear un nuevo estado"""
    try:
        db_estatus = SimFtEstatus(**estatus.model_dump())
        db.add(db_estatus)
        db.commit()
        db.refresh(db_estatus)
        return db_estatus
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"El estatus con código '{estatus.COD_ESTATUS}' ya existe"
        )


@router.put("/estatus/{cod_estatus}", response_model=SimFtEstatusResponse)
async def update_estatus(
    cod_estatus: str,
    estatus_update: SimFtEstatusUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un estado"""
    db_estatus = db.query(SimFtEstatus).filter(
        SimFtEstatus.COD_ESTATUS == cod_estatus
    ).first()
    
    if not db_estatus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Estado '{cod_estatus}' no encontrado"
        )
    
    update_data = estatus_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_estatus, field, value)
    
    db_estatus.FEC_MODIF_REG = datetime.now()
    db.commit()
    db.refresh(db_estatus)
    return db_estatus


# ============================================================================
# CATÁLOGOS - Conclusiones
# ============================================================================

@router.get("/conclusiones", response_model=List[SimFtConclusionResponse])
async def get_conclusiones(
    skip: int = 0,
    limit: int = 100,
    activo: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Obtener catálogo de conclusiones"""
    query = db.query(SimFtConclusion)
    
    if activo is not None:
        query = query.filter(SimFtConclusion.IND_ACTIVO == ('S' if activo else 'N'))
    
    return query.order_by(SimFtConclusion.COD_CONCLUSION).offset(skip).limit(limit).all()


@router.post("/conclusiones", response_model=SimFtConclusionResponse, status_code=status.HTTP_201_CREATED)
async def create_conclusion(conclusion: SimFtConclusionCreate, db: Session = Depends(get_db)):
    """Crear una nueva conclusión"""
    try:
        db_conclusion = SimFtConclusion(**conclusion.model_dump())
        db.add(db_conclusion)
        db.commit()
        db.refresh(db_conclusion)
        return db_conclusion
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"La conclusión con código '{conclusion.COD_CONCLUSION}' ya existe"
        )


# ============================================================================
# CATÁLOGOS - Prioridades
# ============================================================================

@router.get("/prioridades", response_model=List[SimFtPrioridadResponse])
async def get_prioridades(
    skip: int = 0,
    limit: int = 100,
    activo: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Obtener catálogo de prioridades"""
    query = db.query(SimFtPrioridad)
    
    if activo is not None:
        query = query.filter(SimFtPrioridad.IND_ACTIVO == ('S' if activo else 'N'))
    
    return query.order_by(SimFtPrioridad.COD_PRIORIDAD).offset(skip).limit(limit).all()


@router.post("/prioridades", response_model=SimFtPrioridadResponse, status_code=status.HTTP_201_CREATED)
async def create_prioridad(prioridad: SimFtPrioridadCreate, db: Session = Depends(get_db)):
    """Crear una nueva prioridad"""
    try:
        db_prioridad = SimFtPrioridad(**prioridad.model_dump())
        db.add(db_prioridad)
        db.commit()
        db.refresh(db_prioridad)
        return db_prioridad
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"La prioridad con código '{prioridad.COD_PRIORIDAD}' ya existe"
        )


# ============================================================================
# CONFIGURACIÓN - Pasos
# ============================================================================

@router.get("/pasos", response_model=List[SimFtPasosResponse])
async def get_pasos(
    cod_tramite: Optional[str] = None,
    activo: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Obtener definición de pasos"""
    query = db.query(SimFtPasos)
    
    if cod_tramite:
        query = query.filter(SimFtPasos.COD_TRAMITE == cod_tramite)
    
    if activo is not None:
        query = query.filter(SimFtPasos.IND_ACTIVO == ('S' if activo else 'N'))
    
    return query.order_by(
        SimFtPasos.COD_TRAMITE,
        SimFtPasos.NUM_PASO
    ).offset(skip).limit(limit).all()


@router.get("/pasos/{cod_tramite}/{num_paso}", response_model=SimFtPasosResponse)
async def get_paso(
    cod_tramite: str,
    num_paso: int,
    db: Session = Depends(get_db)
):
    """Obtener un paso específico"""
    paso = db.query(SimFtPasos).filter(
        and_(
            SimFtPasos.COD_TRAMITE == cod_tramite,
            SimFtPasos.NUM_PASO == num_paso
        )
    ).first()
    
    if not paso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Paso {num_paso} del trámite '{cod_tramite}' no encontrado"
        )
    
    return paso


@router.post("/pasos", response_model=SimFtPasosResponse, status_code=status.HTTP_201_CREATED)
async def create_paso(paso: SimFtPasosCreate, db: Session = Depends(get_db)):
    """Crear un nuevo paso"""
    # Verificar que existe el tipo de trámite
    tramite_exists = db.query(SimFtTramites).filter(
        SimFtTramites.COD_TRAMITE == paso.COD_TRAMITE
    ).first()
    
    if not tramite_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No existe el tipo de trámite '{paso.COD_TRAMITE}'"
        )
    
    # Verificar que no existe ya el paso
    existing = db.query(SimFtPasos).filter(
        and_(
            SimFtPasos.COD_TRAMITE == paso.COD_TRAMITE,
            SimFtPasos.NUM_PASO == paso.NUM_PASO
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe el paso {paso.NUM_PASO} para el trámite '{paso.COD_TRAMITE}'"
        )
    
    db_paso = SimFtPasos(**paso.model_dump())
    db.add(db_paso)
    db.commit()
    db.refresh(db_paso)
    return db_paso


@router.put("/pasos/{cod_tramite}/{num_paso}", response_model=SimFtPasosResponse)
async def update_paso(
    cod_tramite: str,
    num_paso: int,
    paso_update: SimFtPasosUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un paso"""
    db_paso = db.query(SimFtPasos).filter(
        and_(
            SimFtPasos.COD_TRAMITE == cod_tramite,
            SimFtPasos.NUM_PASO == num_paso
        )
    ).first()
    
    if not db_paso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Paso {num_paso} del trámite '{cod_tramite}' no encontrado"
        )
    
    update_data = paso_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_paso, field, value)
    
    db_paso.FEC_MODIF_REG = datetime.now()
    db.commit()
    db.refresh(db_paso)
    return db_paso


# ============================================================================
# CONFIGURACIÓN - Flujo de Pasos (PasoXTram)
# ============================================================================

@router.get("/flujo-pasos", response_model=List[SimFtPasoXTramResponse])
async def get_flujo_pasos(
    cod_tramite: Optional[str] = None,
    activo: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Obtener configuración de flujo de pasos"""
    query = db.query(SimFtPasoXTram)
    
    if cod_tramite:
        query = query.filter(SimFtPasoXTram.COD_TRAMITE == cod_tramite)
    
    if activo is not None:
        query = query.filter(SimFtPasoXTram.IND_ACTIVO == ('S' if activo else 'N'))
    
    return query.order_by(
        SimFtPasoXTram.COD_TRAMITE,
        SimFtPasoXTram.NUM_PASO
    ).offset(skip).limit(limit).all()


@router.post("/flujo-pasos", response_model=SimFtPasoXTramResponse, status_code=status.HTTP_201_CREATED)
async def create_flujo_paso(
    flujo: SimFtPasoXTramCreate,
    db: Session = Depends(get_db)
):
    """Crear configuración de flujo de un paso"""
    # Verificar que existe el paso
    paso_exists = db.query(SimFtPasos).filter(
        and_(
            SimFtPasos.COD_TRAMITE == flujo.COD_TRAMITE,
            SimFtPasos.NUM_PASO == flujo.NUM_PASO
        )
    ).first()
    
    if not paso_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No existe el paso {flujo.NUM_PASO} para el trámite '{flujo.COD_TRAMITE}'"
        )
    
    db_flujo = SimFtPasoXTram(**flujo.model_dump())
    db.add(db_flujo)
    db.commit()
    db.refresh(db_flujo)
    return db_flujo


# ============================================================================
# USUARIOS Y SECCIONES
# ============================================================================

@router.get("/usuarios-secciones", response_model=List[SimFtUsuaSecResponse])
async def get_usuarios_secciones(
    id_usuario: Optional[str] = None,
    cod_seccion: Optional[str] = None,
    activo: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Obtener asignaciones de usuarios a secciones"""
    query = db.query(SimFtUsuaSec)
    
    if id_usuario:
        query = query.filter(SimFtUsuaSec.ID_USUARIO == id_usuario)
    
    if cod_seccion:
        query = query.filter(SimFtUsuaSec.COD_SECCION == cod_seccion)
    
    if activo is not None:
        query = query.filter(SimFtUsuaSec.IND_ACTIVO == ('S' if activo else 'N'))
    
    return query.order_by(
        SimFtUsuaSec.ID_USUARIO,
        SimFtUsuaSec.COD_SECCION
    ).offset(skip).limit(limit).all()


@router.post("/usuarios-secciones", response_model=SimFtUsuaSecResponse, status_code=status.HTTP_201_CREATED)
async def create_usuario_seccion(
    usuario_sec: SimFtUsuaSecCreate,
    db: Session = Depends(get_db)
):
    """Asignar usuario a una sección"""
    db_usua_sec = SimFtUsuaSec(**usuario_sec.model_dump())
    db.add(db_usua_sec)
    db.commit()
    db.refresh(db_usua_sec)
    return db_usua_sec


# ============================================================================
# TRÁMITES - Encabezado (Transaccional)
# ============================================================================

@router.get("/tramites", response_model=List[SimFtTramiteEResponse])
async def get_tramites(
    num_annio: Optional[int] = None,
    cod_tramite: Optional[str] = None,
    ind_estatus: Optional[str] = None,
    ind_prioridad: Optional[str] = None,
    fecha_desde: Optional[datetime] = None,
    fecha_hasta: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Obtener trámites (encabezados) con cache de Redis"""
    redis = get_redis()
    
    # Generar cache key basado en todos los parámetros
    cache_key = f"sim_ft:tramites:{num_annio}:{cod_tramite}:{ind_estatus}:{ind_prioridad}:{skip}:{limit}"
    if fecha_desde:
        cache_key += f":{fecha_desde.isoformat()}"
    if fecha_hasta:
        cache_key += f":{fecha_hasta.isoformat()}"
    
    # Intentar obtener del cache
    cached_data = redis.get(cache_key)
    if cached_data:
        return json.loads(cached_data)
    
    # Si no está en cache, consultar BD
    query = db.query(SimFtTramiteE)
    
    if num_annio:
        query = query.filter(SimFtTramiteE.NUM_ANNIO == num_annio)
    
    if cod_tramite:
        query = query.filter(SimFtTramiteE.COD_TRAMITE == cod_tramite)
    
    if ind_estatus:
        query = query.filter(SimFtTramiteE.IND_ESTATUS == ind_estatus)
    
    if ind_prioridad:
        query = query.filter(SimFtTramiteE.IND_PRIORIDAD == ind_prioridad)
    
    if fecha_desde:
        query = query.filter(SimFtTramiteE.FEC_INI_TRAMITE >= fecha_desde)
    
    if fecha_hasta:
        query = query.filter(SimFtTramiteE.FEC_INI_TRAMITE <= fecha_hasta)
    
    tramites = query.order_by(
        desc(SimFtTramiteE.NUM_ANNIO),
        desc(SimFtTramiteE.NUM_TRAMITE)
    ).offset(skip).limit(limit).all()
    
    # Cachear resultado (5 minutos)
    redis.setex(cache_key, 300, json.dumps([
        {
            "NUM_ANNIO": t.NUM_ANNIO,
            "NUM_TRAMITE": t.NUM_TRAMITE,
            "COD_TRAMITE": t.COD_TRAMITE,
            "NUM_REGISTRO": t.NUM_REGISTRO,
            "FEC_INI_TRAMITE": t.FEC_INI_TRAMITE.isoformat() if t.FEC_INI_TRAMITE else None,
            "FEC_FIN_TRAMITE": t.FEC_FIN_TRAMITE.isoformat() if t.FEC_FIN_TRAMITE else None,
            "IND_ESTATUS": t.IND_ESTATUS,
            "IND_PRIORIDAD": t.IND_PRIORIDAD,
            "HITS_TRAMITE": t.HITS_TRAMITE,
            "OBS_OBSERVA": t.OBS_OBSERVA,
            "FEC_ACTUALIZA": t.FEC_ACTUALIZA.isoformat() if t.FEC_ACTUALIZA else None,
            "IND_CONCLUSION": t.IND_CONCLUSION,
            "ID_USUARIO_CREA": t.ID_USUARIO_CREA
        } for t in tramites
    ]))
    
    return tramites



@router.post("/tramites", response_model=SimFtTramiteEResponse, status_code=status.HTTP_201_CREATED)
async def create_tramite(
    tramite: SimFtTramiteECreate,
    db: Session = Depends(get_db)
):
    """Crear un nuevo trámite e invalidar cache"""
    redis = get_redis()
    
    # Verificar que existe el tipo de trámite
    tipo_exists = db.query(SimFtTramites).filter(
        SimFtTramites.COD_TRAMITE == tramite.COD_TRAMITE
    ).first()
    
    if not tipo_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No existe el tipo de trámite '{tramite.COD_TRAMITE}'"
        )
    
    # Generar NUM_TRAMITE automáticamente
    max_tramite = db.query(func.max(SimFtTramiteE.NUM_TRAMITE)).filter(
        SimFtTramiteE.NUM_ANNIO == tramite.NUM_ANNIO
    ).scalar()
    
    tramite_data = tramite.model_dump()
    tramite_data['NUM_TRAMITE'] = (max_tramite or 0) + 1
    tramite_data['HITS_TRAMITE'] = 0
    
    db_tramite = SimFtTramiteE(**tramite_data)
    db.add(db_tramite)
    db.commit()
    db.refresh(db_tramite)
    
    # Invalidar cache de trámites
    keys = redis.keys("sim_ft:tramites:*")
    if keys:
        redis.delete(*keys)
    
    return db_tramite


@router.put("/tramites/{num_annio}/{num_tramite}/{num_registro}", response_model=SimFtTramiteEResponse)
async def update_tramite(
    num_annio: int,
    num_tramite: int,
    num_registro: int,
    tramite_update: SimFtTramiteEUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un trámite e invalidar cache"""
    redis = get_redis()
    
    db_tramite = db.query(SimFtTramiteE).filter(
        and_(
            SimFtTramiteE.NUM_ANNIO == num_annio,
            SimFtTramiteE.NUM_TRAMITE == num_tramite,
            SimFtTramiteE.NUM_REGISTRO == num_registro
        )
    ).first()
    
    if not db_tramite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trámite {num_annio}-{num_tramite}-{num_registro} no encontrado"
        )
    
    update_data = tramite_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_tramite, field, value)
    
    db.commit()
    db.refresh(db_tramite)
    
    # Invalidar cache de trámites
    keys = redis.keys("sim_ft:tramites:*")
    if keys:
        redis.delete(*keys)
    
    return db_tramite
    
    db_tramite.FEC_ACTUALIZA = datetime.now()
    db.commit()
    db.refresh(db_tramite)
    
    return db_tramite


# ============================================================================
# TRÁMITES - Detalle de Pasos
# ============================================================================

@router.get("/tramites/{num_annio}/{num_tramite}/pasos", response_model=List[SimFtTramiteDResponse])
async def get_tramite_pasos(
    num_annio: int,
    num_tramite: int,
    num_registro: Optional[int] = Query(None, description="Número de registro del trámite"),
    db: Session = Depends(get_db)
):
    """Obtener los pasos de un trámite"""
    query = db.query(SimFtTramiteD).filter(
        and_(
            SimFtTramiteD.NUM_ANNIO == num_annio,
            SimFtTramiteD.NUM_TRAMITE == num_tramite
        )
    )
    
    if num_registro is not None:
        query = query.filter(SimFtTramiteD.NUM_REGISTRO == num_registro)
    
    return query.order_by(SimFtTramiteD.NUM_PASO).all()


@router.get("/tramites/{num_annio}/{num_tramite}/{num_paso}/{num_registro}", response_model=SimFtTramiteDResponse)
async def get_tramite_paso(
    num_annio: int,
    num_tramite: int,
    num_paso: int,
    num_registro: int,
    db: Session = Depends(get_db)
):
    """Obtener un paso específico de un trámite"""
    paso = db.query(SimFtTramiteD).filter(
        and_(
            SimFtTramiteD.NUM_ANNIO == num_annio,
            SimFtTramiteD.NUM_TRAMITE == num_tramite,
            SimFtTramiteD.NUM_PASO == num_paso,
            SimFtTramiteD.NUM_REGISTRO == num_registro
        )
    ).first()
    
    if not paso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Paso {num_paso} del trámite {num_annio}-{num_tramite}-{num_registro} no encontrado"
        )
    
    return paso


@router.post("/tramites/{num_annio}/{num_tramite}/pasos", response_model=SimFtTramiteDResponse, status_code=status.HTTP_201_CREATED)
async def create_tramite_paso(
    num_annio: int,
    num_tramite: int,
    paso: SimFtTramiteDCreate,
    db: Session = Depends(get_db)
):
    """Registrar un nuevo paso en un trámite"""
    # Verificar que existe el trámite
    tramite_exists = db.query(SimFtTramiteE).filter(
        and_(
            SimFtTramiteE.NUM_ANNIO == num_annio,
            SimFtTramiteE.NUM_TRAMITE == num_tramite,
            SimFtTramiteE.NUM_REGISTRO == paso.NUM_REGISTRO
        )
    ).first()
    
    if not tramite_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No existe el trámite {num_annio}-{num_tramite}-{paso.NUM_REGISTRO}"
        )
    
    # Generar NUM_ACTIVIDAD automáticamente
    max_actividad = db.query(func.max(SimFtTramiteD.NUM_ACTIVIDAD)).filter(
        and_(
            SimFtTramiteD.NUM_ANNIO == num_annio,
            SimFtTramiteD.NUM_TRAMITE == num_tramite,
            SimFtTramiteD.NUM_PASO == paso.NUM_PASO,
            SimFtTramiteD.NUM_REGISTRO == paso.NUM_REGISTRO
        )
    ).scalar()
    
    paso_data = paso.model_dump()
    paso_data['NUM_ANNIO'] = num_annio
    paso_data['NUM_TRAMITE'] = num_tramite
    paso_data['NUM_ACTIVIDAD'] = (max_actividad or 0) + 1
    
    db_paso = SimFtTramiteD(**paso_data)
    db.add(db_paso)
    db.commit()
    db.refresh(db_paso)
    
    # Actualizar el trámite
    tramite_exists.FEC_ACTUALIZA = datetime.now()
    tramite_exists.HITS_TRAMITE += 1
    db.commit()
    
    return db_paso


@router.put("/tramites/{num_annio}/{num_tramite}/{num_paso}/{num_registro}", response_model=SimFtTramiteDResponse)
async def update_tramite_paso(
    num_annio: int,
    num_tramite: int,
    num_paso: int,
    num_registro: int,
    paso_update: SimFtTramiteDUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un paso de un trámite"""
    db_paso = db.query(SimFtTramiteD).filter(
        and_(
            SimFtTramiteD.NUM_ANNIO == num_annio,
            SimFtTramiteD.NUM_TRAMITE == num_tramite,
            SimFtTramiteD.NUM_PASO == num_paso,
            SimFtTramiteD.NUM_REGISTRO == num_registro
        )
    ).first()
    
    if not db_paso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Paso {num_paso} del trámite {num_annio}-{num_tramite}-{num_registro} no encontrado"
        )
    
    update_data = paso_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_paso, field, value)
    
    db_paso.FEC_ACTUALIZA = datetime.now()
    db.commit()
    db.refresh(db_paso)
    
    return db_paso


@router.get("/tramites/{num_annio}/{num_tramite}/{num_registro}", response_model=SimFtTramiteEResponse)
async def get_tramite(
    num_annio: int,
    num_tramite: int,
    num_registro: int,
    db: Session = Depends(get_db)
):
    """Obtener un trámite específico con cache"""
    redis = get_redis()
    
    # Build cache key
    cache_key = f"sim_ft:tramite:{num_annio}:{num_tramite}:{num_registro}"
    
    # Try to get from cache
    cached_data = redis.get(cache_key)
    if cached_data:
        return json.loads(cached_data)
    
    # Query database
    tramite = db.query(SimFtTramiteE).filter(
        and_(
            SimFtTramiteE.NUM_ANNIO == num_annio,
            SimFtTramiteE.NUM_TRAMITE == num_tramite,
            SimFtTramiteE.NUM_REGISTRO == num_registro
        )
    ).first()
    
    if not tramite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trámite {num_annio}-{num_tramite}-{num_registro} no encontrado"
        )
    
    # Cache result
    redis.setex(
        cache_key,
        300,  # 5 minutes
        json.dumps({
            "NUM_ANNIO": tramite.NUM_ANNIO,
            "NUM_TRAMITE": tramite.NUM_TRAMITE,
            "COD_TRAMITE": tramite.COD_TRAMITE,
            "NUM_REGISTRO": tramite.NUM_REGISTRO,
            "FEC_INI_TRAMITE": tramite.FEC_INI_TRAMITE.isoformat() if tramite.FEC_INI_TRAMITE else None,
            "FEC_FIN_TRAMITE": tramite.FEC_FIN_TRAMITE.isoformat() if tramite.FEC_FIN_TRAMITE else None,
            "IND_ESTATUS": tramite.IND_ESTATUS,
            "IND_PRIORIDAD": tramite.IND_PRIORIDAD,
            "HITS_TRAMITE": tramite.HITS_TRAMITE,
            "OBS_OBSERVA": tramite.OBS_OBSERVA,
            "FEC_ACTUALIZA": tramite.FEC_ACTUALIZA.isoformat() if tramite.FEC_ACTUALIZA else None,
            "IND_CONCLUSION": tramite.IND_CONCLUSION,
            "ID_USUARIO_CREA": tramite.ID_USUARIO_CREA
        })
    )
    
    return tramite


# ============================================================================
# CIERRE DE TRÁMITES
# ============================================================================

@router.post("/tramites/{num_annio}/{num_tramite}/{num_registro}/cierre", 
             response_model=SimFtTramiteCierreResponse, 
             status_code=status.HTTP_201_CREATED)
async def cerrar_tramite(
    num_annio: int,
    num_tramite: int,
    num_registro: int,
    cierre: SimFtTramiteCierreCreate,
    db: Session = Depends(get_db)
):
    """Cerrar un trámite"""
    # Verificar que existe el trámite y no está cerrado
    tramite = db.query(SimFtTramiteE).filter(
        and_(
            SimFtTramiteE.NUM_ANNIO == num_annio,
            SimFtTramiteE.NUM_TRAMITE == num_tramite,
            SimFtTramiteE.NUM_REGISTRO == num_registro
        )
    ).first()
    
    if not tramite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trámite {num_annio}-{num_tramite}-{num_registro} no encontrado"
        )
    
    # Verificar si ya está cerrado
    cierre_existente = db.query(SimFtTramiteCierre).filter(
        and_(
            SimFtTramiteCierre.NUM_ANNIO == num_annio,
            SimFtTramiteCierre.NUM_TRAMITE == num_tramite,
            SimFtTramiteCierre.NUM_REGISTRO == num_registro
        )
    ).first()
    
    if cierre_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El trámite {num_annio}-{num_tramite}-{num_registro} ya está cerrado"
        )
    
    # Crear el cierre
    cierre_data = cierre.model_dump()
    cierre_data['NUM_ANNIO'] = num_annio
    cierre_data['NUM_TRAMITE'] = num_tramite
    cierre_data['NUM_REGISTRO'] = num_registro
    
    db_cierre = SimFtTramiteCierre(**cierre_data)
    db.add(db_cierre)
    
    # Actualizar el trámite
    tramite.FEC_FIN_TRAMITE = cierre.FEC_CIERRE
    tramite.IND_CONCLUSION = cierre.COD_CONCLUSION
    tramite.IND_ESTATUS = '07'  # Completado
    tramite.FEC_ACTUALIZA = datetime.now()
    
    db.commit()
    db.refresh(db_cierre)
    
    return db_cierre


@router.get("/tramites/{num_annio}/{num_tramite}/{num_registro}/cierre", 
            response_model=SimFtTramiteCierreResponse)
async def get_cierre_tramite(
    num_annio: int,
    num_tramite: int,
    num_registro: int,
    db: Session = Depends(get_db)
):
    """Obtener información de cierre de un trámite"""
    cierre = db.query(SimFtTramiteCierre).filter(
        and_(
            SimFtTramiteCierre.NUM_ANNIO == num_annio,
            SimFtTramiteCierre.NUM_TRAMITE == num_tramite,
            SimFtTramiteCierre.NUM_REGISTRO == num_registro
        )
    ).first()
    
    if not cierre:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El trámite {num_annio}-{num_tramite}-{num_registro} no está cerrado"
        )
    
    return cierre


# ============================================================================
# ESTADÍSTICAS Y REPORTES
# ============================================================================

@router.get("/estadisticas/tramites-por-estado")
async def get_estadisticas_por_estado(
    num_annio: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Obtener estadísticas de trámites por estado"""
    query = db.query(
        SimFtTramiteE.IND_ESTATUS,
        func.count(SimFtTramiteE.NUM_TRAMITE).label('total')
    )
    
    if num_annio:
        query = query.filter(SimFtTramiteE.NUM_ANNIO == num_annio)
    
    resultados = query.group_by(SimFtTramiteE.IND_ESTATUS).all()
    
    return {
        "estadisticas": [
            {
                "estado": r.IND_ESTATUS,
                "total": r.total
            } for r in resultados
        ]
    }


@router.get("/estadisticas/tramites-por-tipo")
async def get_estadisticas_por_tipo(
    num_annio: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Obtener estadísticas de trámites por tipo"""
    query = db.query(
        SimFtTramiteE.COD_TRAMITE,
        func.count(SimFtTramiteE.NUM_TRAMITE).label('total')
    )
    
    if num_annio:
        query = query.filter(SimFtTramiteE.NUM_ANNIO == num_annio)
    
    resultados = query.group_by(SimFtTramiteE.COD_TRAMITE).all()
    
    return {
        "estadisticas": [
            {
                "tipo_tramite": r.COD_TRAMITE,
                "total": r.total
            } for r in resultados
        ]
    }


@router.get("/estadisticas/tiempo-promedio")
async def get_tiempo_promedio_tramites(
    cod_tramite: Optional[str] = None,
    num_annio: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Obtener tiempo promedio de procesamiento de trámites"""
    query = db.query(SimFtTramiteE).filter(
        and_(
            SimFtTramiteE.FEC_INI_TRAMITE.isnot(None),
            SimFtTramiteE.FEC_FIN_TRAMITE.isnot(None)
        )
    )
    
    if cod_tramite:
        query = query.filter(SimFtTramiteE.COD_TRAMITE == cod_tramite)
    
    if num_annio:
        query = query.filter(SimFtTramiteE.NUM_ANNIO == num_annio)
    
    tramites = query.all()
    
    if not tramites:
        return {
            "total_tramites": 0,
            "tiempo_promedio_dias": 0
        }
    
    tiempos = [
        (t.FEC_FIN_TRAMITE - t.FEC_INI_TRAMITE).days
        for t in tramites
    ]
    
    return {
        "total_tramites": len(tramites),
        "tiempo_promedio_dias": sum(tiempos) / len(tiempos) if tiempos else 0,
        "tiempo_minimo_dias": min(tiempos) if tiempos else 0,
        "tiempo_maximo_dias": max(tiempos) if tiempos else 0
    }
