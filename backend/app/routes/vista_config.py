"""
Rutas REST API para configuraciones de vistas dinámicas
Sistema de Trámites Migratorios de Panamá

Este módulo define los endpoints REST para gestionar
configuraciones de vistas dinámicas de formularios de workflow.

Author: Sistema de Trámites MVP Panamá
Date: 2025-11-13
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import json

from app.infrastructure.database import get_db
from app.schemas.vista_config import VistaConfig, VistaConfigCreate, VistaConfigUpdate
from app.services.vista_config_service import vista_config_service

router = APIRouter()


@router.get("/etapas/{etapa_id}/vista-config/existe")
def check_vista_config_exists(
    etapa_id: int,
    db: Session = Depends(get_db)
):
    """
    Verificar si existe configuración de vista para una etapa (optimizado).
    
    Este endpoint es más ligero que obtener la config completa,
    útil solo para mostrar indicadores en la UI.
    
    Args:
        etapa_id: ID de la etapa de workflow
        db: Sesión de base de datos
        
    Returns:
        dict: {"existe": bool, "config_id": int | None}
    """
    config = vista_config_service.get_by_etapa_id(db, etapa_id)

    return {
        "existe": config is not None and config.activo,
        "config_id": config.id if config else None
    }


@router.get("/etapas/{etapa_id}/vista-config", response_model=Optional[VistaConfig])
def get_vista_config_by_etapa(
    etapa_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtener configuración de vista para una etapa específica.
    
    Si no existe configuración, retorna null (el frontend usará vista por defecto).
    
    Args:
        etapa_id: ID de la etapa de workflow
        db: Sesión de base de datos
        
    Returns:
        VistaConfig si existe, None si no hay configuración
    """
    config = vista_config_service.get_by_etapa_id(db, etapa_id)

    if not config:
        return None

    # Parse JSON para retornar como objeto
    config_dict = {
        "id": config.id,
        "etapa_id": config.etapa_id,
        "config_json": json.loads(config.config_json),
        "activo": config.activo,
        "created_at": config.created_at,
        "updated_at": config.updated_at,
        "created_by": config.created_by,
        "updated_by": config.updated_by
    }

    return config_dict


@router.post("/vistas-config", response_model=VistaConfig, status_code=status.HTTP_201_CREATED)
def create_vista_config(
    data: VistaConfigCreate,
    db: Session = Depends(get_db)
):
    """
    Crear nueva configuración de vista para una etapa.
    
    Lanza error si ya existe una configuración activa para esa etapa.
    
    Args:
        data: Datos de la nueva configuración
        db: Sesión de base de datos
        
    Returns:
        VistaConfig creado
        
    Raises:
        HTTPException 400: Si ya existe configuración para la etapa
    """
    try:
        config = vista_config_service.create(db, data)

        return {
            "id": config.id,
            "etapa_id": config.etapa_id,
            "config_json": json.loads(config.config_json),
            "activo": config.activo,
            "created_at": config.created_at,
            "updated_at": config.updated_at,
            "created_by": config.created_by,
            "updated_by": config.updated_by
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/vistas-config/{config_id}", response_model=VistaConfig)
def update_vista_config(
    config_id: int,
    data: VistaConfigUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualizar configuración de vista existente.
    
    Args:
        config_id: ID de la configuración a actualizar
        data: Nuevos datos de la configuración
        db: Sesión de base de datos
        
    Returns:
        VistaConfig actualizado
        
    Raises:
        HTTPException 404: Si la configuración no existe
    """
    try:
        config = vista_config_service.update(db, config_id, data)

        return {
            "id": config.id,
            "etapa_id": config.etapa_id,
            "config_json": json.loads(config.config_json),
            "activo": config.activo,
            "created_at": config.created_at,
            "updated_at": config.updated_at,
            "created_by": config.created_by,
            "updated_by": config.updated_by
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/vistas-config/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vista_config(
    config_id: int,
    db: Session = Depends(get_db)
):
    """
    Eliminar (soft delete) configuración de vista.
    
    Args:
        config_id: ID de la configuración a eliminar
        db: Sesión de base de datos
        
    Raises:
        HTTPException 404: Si la configuración no existe
    """
    success = vista_config_service.delete(db, config_id)

    if not success:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")

    return None
