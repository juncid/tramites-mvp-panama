"""
Servicio de Integración Workflow-PPSH
Sistema de Trámites Migratorios de Panamá

Este servicio gestiona la integración entre el sistema de workflows dinámicos
y el sistema específico de solicitudes PPSH, siguiendo el enfoque liviano
(Opción A) recomendado para MVP.

Principios:
- Referencia simple vía metadata_adicional (sin Foreign Keys)
- Sin sincronización automática de estados
- WORKFLOW_INSTANCIA es la fuente de verdad
- Transacciones atómicas para garantizar consistencia

Author: Sistema de Trámites MVP Panamá
Date: 2024-11-22
"""

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional, Dict, Any, Tuple
from datetime import datetime
from fastapi import HTTPException, status
import logging

from app.models import models_workflow, models_ppsh
from app.schemas import schemas_workflow, schemas_ppsh
from app.services.services_workflow import WorkflowService, InstanciaService
from app.services.services_ppsh import SolicitudService

logger = logging.getLogger(__name__)


class WorkflowPPSHIntegrationService:
    """
    Servicio de integración entre Workflows y Solicitudes PPSH
    
    Gestiona la creación y vinculación de instancias de workflow con
    solicitudes PPSH específicas, manteniendo ambos sistemas independientes
    pero referenciados.
    """
    
    @staticmethod
    def crear_instancia_con_solicitud_ppsh(
        db: Session,
        workflow_id: int,
        solicitud_data: schemas_ppsh.SolicitudCreate,
        nombre_instancia: Optional[str],
        user_id: str
    ) -> Tuple[models_workflow.WorkflowInstancia, models_ppsh.PPSHSolicitud]:
        """
        Crea una instancia de workflow vinculada a una nueva solicitud PPSH
        
        Esta operación crea ambas entidades en una sola transacción atómica:
        1. Crea la solicitud PPSH con sus solicitantes
        2. Crea la instancia de workflow con referencia a la solicitud
        
        Args:
            db: Sesión de base de datos
            workflow_id: ID del workflow a instanciar
            solicitud_data: Datos para crear la solicitud PPSH
            nombre_instancia: Nombre descriptivo de la instancia (opcional)
            user_id: Usuario que crea la instancia
            
        Returns:
            Tupla (WorkflowInstancia, PPSHSolicitud) con ambas entidades creadas
            
        Raises:
            HTTPException: Si el workflow no existe o no está activo
            HTTPException: Si hay errores de validación o de base de datos
        """
        logger.info(
            f"Iniciando creación de instancia de workflow {workflow_id} "
            f"con solicitud PPSH por usuario {user_id}"
        )
        
        try:
            # 1. Validar que el workflow existe y está activo
            workflow = WorkflowService.obtener_workflow(db, workflow_id)
            
            if not workflow.activo:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El workflow {workflow.codigo} no está activo"
                )
            
            # 2. Validar que el workflow es compatible con PPSH (opcional)
            # TODO: Agregar campo tipo_solicitud_asociado a WORKFLOW para validación estricta
            if workflow.categoria and workflow.categoria != "PPSH":
                logger.warning(
                    f"Workflow {workflow.codigo} tiene categoría '{workflow.categoria}' "
                    f"diferente a PPSH. Continuando sin validación estricta."
                )
            
            # 3. Crear solicitud PPSH primero (para obtener su ID)
            logger.debug("Creando solicitud PPSH...")
            solicitud = SolicitudService.crear_solicitud(
                db=db,
                solicitud_data=solicitud_data,
                user_id=user_id
            )
            logger.info(
                f"✅ Solicitud PPSH creada: ID={solicitud.id_solicitud}, "
                f"Expediente={solicitud.num_expediente}"
            )
            
            # 4. Crear instancia de workflow con referencia a solicitud PPSH
            logger.debug("Creando instancia de workflow...")
            
            # Construir metadata_adicional con referencia a solicitud
            metadata_adicional = {
                "ppsh_solicitud_id": solicitud.id_solicitud,
                "ppsh_num_expediente": solicitud.num_expediente,
                "ppsh_tipo_solicitud": solicitud.tipo_solicitud,
                "ppsh_causa_humanitaria": solicitud.cod_causa_humanitaria,
                "fecha_vinculacion": datetime.now().isoformat(),
                "vinculado_por": user_id
            }
            
            # Construir nombre de instancia si no se proporcionó
            if not nombre_instancia:
                causa = solicitud.causa_humanitaria
                nombre_instancia = (
                    f"Solicitud PPSH - {causa.nombre_causa if causa else 'Sin causa'} - "
                    f"{solicitud.num_expediente}"
                )
            
            # Crear datos de instancia
            instancia_create = schemas_workflow.WorkflowInstanciaCreate(
                workflow_id=workflow_id,
                nombre_instancia=nombre_instancia,
                metadata_adicional=metadata_adicional,
                prioridad=solicitud.prioridad  # Sincronizar prioridad inicial
            )
            
            instancia = InstanciaService.crear_instancia(
                db=db,
                instancia_data=instancia_create,
                created_by=user_id
            )
            
            logger.info(
                f"✅ Instancia de workflow creada: ID={instancia.id}, "
                f"Expediente={instancia.num_expediente}"
            )
            
            # 5. Commit de la transacción
            db.commit()
            
            logger.info(
                f"🎉 Integración completada exitosamente: "
                f"Workflow Instancia {instancia.id} ↔ Solicitud PPSH {solicitud.id_solicitud}"
            )
            
            return instancia, solicitud
            
        except HTTPException:
            # Re-lanzar excepciones HTTP (ya tienen el formato correcto)
            db.rollback()
            raise
            
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error de base de datos al crear instancia con solicitud PPSH: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al crear la instancia de workflow con solicitud PPSH"
            )
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error inesperado al crear instancia con solicitud PPSH: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error inesperado: {str(e)}"
            )
    
    @staticmethod
    def vincular_solicitud_existente(
        db: Session,
        workflow_id: int,
        solicitud_id: int,
        nombre_instancia: Optional[str],
        user_id: str
    ) -> models_workflow.WorkflowInstancia:
        """
        Crea una instancia de workflow vinculada a una solicitud PPSH existente
        
        Útil para:
        - Migración de solicitudes legacy al sistema de workflows
        - Re-procesamiento de solicitudes existentes
        - Solicitudes creadas externamente que necesitan seguir un workflow
        
        Args:
            db: Sesión de base de datos
            workflow_id: ID del workflow a instanciar
            solicitud_id: ID de solicitud PPSH existente
            nombre_instancia: Nombre descriptivo de la instancia (opcional)
            user_id: Usuario que crea la instancia
            
        Returns:
            WorkflowInstancia creada y vinculada
            
        Raises:
            HTTPException: Si el workflow o solicitud no existen
        """
        logger.info(
            f"Vinculando solicitud PPSH existente {solicitud_id} "
            f"a workflow {workflow_id} por usuario {user_id}"
        )
        
        try:
            # 1. Validar que el workflow existe y está activo
            workflow = WorkflowService.obtener_workflow(db, workflow_id)
            
            if not workflow.activo:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El workflow {workflow.codigo} no está activo"
                )
            
            # 2. Validar que la solicitud existe
            solicitud = SolicitudService.get_solicitud(db, solicitud_id)
            
            if not solicitud.activo:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"La solicitud {solicitud.num_expediente} no está activa"
                )
            
            # 3. Verificar que la solicitud no esté ya vinculada a otra instancia
            instancia_existente = db.query(models_workflow.WorkflowInstancia).filter(
                models_workflow.WorkflowInstancia.metadata_adicional.contains(
                    {"ppsh_solicitud_id": solicitud_id}
                ),
                models_workflow.WorkflowInstancia.activo == True
            ).first()
            
            if instancia_existente:
                logger.warning(
                    f"Solicitud {solicitud.num_expediente} ya está vinculada "
                    f"a instancia {instancia_existente.id}"
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"La solicitud {solicitud.num_expediente} ya está vinculada "
                        f"a la instancia de workflow {instancia_existente.num_expediente}"
                    )
                )
            
            # 4. Crear metadata_adicional con referencia a solicitud
            metadata_adicional = {
                "ppsh_solicitud_id": solicitud.id_solicitud,
                "ppsh_num_expediente": solicitud.num_expediente,
                "ppsh_tipo_solicitud": solicitud.tipo_solicitud,
                "ppsh_causa_humanitaria": solicitud.cod_causa_humanitaria,
                "fecha_vinculacion": datetime.now().isoformat(),
                "vinculado_por": user_id,
                "es_vinculacion_posterior": True  # Marca que fue vinculada después
            }
            
            # 5. Construir nombre de instancia si no se proporcionó
            if not nombre_instancia:
                causa = solicitud.causa_humanitaria
                nombre_instancia = (
                    f"Solicitud PPSH - {causa.nombre_causa if causa else 'Sin causa'} - "
                    f"{solicitud.num_expediente}"
                )
            
            # 6. Crear instancia
            instancia_create = schemas_workflow.WorkflowInstanciaCreate(
                workflow_id=workflow_id,
                nombre_instancia=nombre_instancia,
                metadata_adicional=metadata_adicional,
                prioridad=solicitud.prioridad
            )
            
            instancia = InstanciaService.crear_instancia(
                db=db,
                instancia_data=instancia_create,
                created_by=user_id
            )
            
            db.commit()
            
            logger.info(
                f"✅ Solicitud existente vinculada: "
                f"Instancia {instancia.id} ↔ Solicitud {solicitud.id_solicitud}"
            )
            
            return instancia
            
        except HTTPException:
            db.rollback()
            raise
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error al vincular solicitud existente: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al vincular solicitud existente: {str(e)}"
            )
    
    @staticmethod
    def obtener_solicitud_ppsh_desde_instancia(
        db: Session,
        instancia_id: int
    ) -> Optional[models_ppsh.PPSHSolicitud]:
        """
        Obtiene la solicitud PPSH vinculada a una instancia de workflow
        
        Args:
            db: Sesión de base de datos
            instancia_id: ID de la instancia de workflow
            
        Returns:
            PPSHSolicitud si existe vinculación, None si no hay vinculación
            
        Raises:
            HTTPException: Si la instancia no existe
        """
        # Obtener instancia
        instancia = InstanciaService.obtener_instancia(db, instancia_id)
        
        # Extraer solicitud_id de metadata_adicional
        if not instancia.metadata_adicional:
            return None
        
        solicitud_id = instancia.metadata_adicional.get("ppsh_solicitud_id")
        
        if not solicitud_id:
            return None
        
        # Obtener solicitud
        try:
            solicitud = SolicitudService.get_solicitud(db, solicitud_id)
            return solicitud
        except HTTPException as e:
            if e.status_code == status.HTTP_404_NOT_FOUND:
                logger.warning(
                    f"Referencia rota: Instancia {instancia_id} referencia "
                    f"solicitud {solicitud_id} que no existe"
                )
                return None
            raise
    
    @staticmethod
    def obtener_datos_vinculacion(
        db: Session,
        instancia_id: int
    ) -> Optional[Dict[str, Any]]:
        """
        Obtiene información completa de vinculación PPSH de una instancia
        
        Args:
            db: Sesión de base de datos
            instancia_id: ID de la instancia de workflow
            
        Returns:
            Diccionario con datos de vinculación o None si no hay vinculación
        """
        instancia = InstanciaService.obtener_instancia(db, instancia_id)
        
        if not instancia.metadata_adicional:
            return None
        
        # Extraer datos de vinculación
        vinculacion = {
            "ppsh_solicitud_id": instancia.metadata_adicional.get("ppsh_solicitud_id"),
            "ppsh_num_expediente": instancia.metadata_adicional.get("ppsh_num_expediente"),
            "ppsh_tipo_solicitud": instancia.metadata_adicional.get("ppsh_tipo_solicitud"),
            "ppsh_causa_humanitaria": instancia.metadata_adicional.get("ppsh_causa_humanitaria"),
            "fecha_vinculacion": instancia.metadata_adicional.get("fecha_vinculacion"),
            "vinculado_por": instancia.metadata_adicional.get("vinculado_por"),
            "es_vinculacion_posterior": instancia.metadata_adicional.get("es_vinculacion_posterior", False)
        }
        
        # Validar que al menos tenga solicitud_id
        if not vinculacion["ppsh_solicitud_id"]:
            return None
        
        return vinculacion
