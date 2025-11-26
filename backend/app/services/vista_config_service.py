"""
Servicio de negocio para configuraciones de vistas dinámicas
Sistema de Trámites Migratorios de Panamá

Maneja la lógica de negocio para CRUD de configuraciones
de vistas dinámicas de formularios de workflow.

Author: Sistema de Trámites MVP Panamá
Date: 2025-11-14
"""

from sqlalchemy.orm import Session
from typing import Optional
import json

from app.models.models_workflow import WorkflowVistaConfig
from app.schemas.vista_config import VistaConfigCreate, VistaConfigUpdate


class VistaConfigService:
    """Servicio para gestión de configuraciones de vistas dinámicas"""
    
    @staticmethod
    def get_by_id(db: Session, config_id: int) -> Optional[WorkflowVistaConfig]:
        """Obtener configuración por ID"""
        return db.query(WorkflowVistaConfig).filter(
            WorkflowVistaConfig.id == config_id,
            WorkflowVistaConfig.activo == True
        ).first()
    
    @staticmethod
    def get_by_etapa_id(db: Session, etapa_id: int) -> Optional[WorkflowVistaConfig]:
        """Obtener configuración por ID de etapa"""
        return db.query(WorkflowVistaConfig).filter(
            WorkflowVistaConfig.etapa_id == etapa_id,
            WorkflowVistaConfig.activo == True
        ).first()
    
    @staticmethod
    def create(db: Session, data: VistaConfigCreate, created_by: str = "SYSTEM") -> WorkflowVistaConfig:
        """
        Crear nueva configuración de vista.
        
        Args:
            db: Sesión de base de datos
            data: Datos de la configuración
            created_by: Usuario creador
            
        Returns:
            WorkflowVistaConfig creado
            
        Raises:
            ValueError: Si ya existe configuración para la etapa
        """
        # Verificar que no exista ya una configuración para esta etapa
        existing = VistaConfigService.get_by_etapa_id(db, data.etapa_id)
        if existing:
            raise ValueError(f"Ya existe una configuración activa para la etapa {data.etapa_id}")
        
        # Convertir config_json a string JSON
        config_json_str = json.dumps(data.config_json, ensure_ascii=False)
        
        # Crear nueva configuración
        config = WorkflowVistaConfig(
            etapa_id=data.etapa_id,
            config_json=config_json_str,
            activo=data.activo,
            created_by=created_by
        )
        
        db.add(config)
        db.commit()
        db.refresh(config)
        
        return config
    
    @staticmethod
    def update(db: Session, config_id: int, data: VistaConfigUpdate, updated_by: str = "SYSTEM") -> WorkflowVistaConfig:
        """
        Actualizar configuración existente.
        
        Args:
            db: Sesión de base de datos
            config_id: ID de la configuración a actualizar
            data: Nuevos datos
            updated_by: Usuario que actualiza
            
        Returns:
            WorkflowVistaConfig actualizado
            
        Raises:
            ValueError: Si la configuración no existe
        """
        config = VistaConfigService.get_by_id(db, config_id)
        if not config:
            raise ValueError(f"Configuración {config_id} no encontrada")
        
        # Actualizar campos
        if data.config_json is not None:
            config.config_json = json.dumps(data.config_json, ensure_ascii=False)
        
        if data.activo is not None:
            config.activo = data.activo
        
        config.updated_by = updated_by
        
        db.commit()
        db.refresh(config)
        
        return config
    
    @staticmethod
    def delete(db: Session, config_id: int) -> bool:
        """
        Eliminar (soft delete) configuración.
        
        Args:
            db: Sesión de base de datos
            config_id: ID de la configuración
            
        Returns:
            True si se eliminó, False si no existía
        """
        config = VistaConfigService.get_by_id(db, config_id)
        if not config:
            return False
        
        config.activo = False
        db.commit()
        
        return True


# Instancia singleton
vista_config_service = VistaConfigService()
