"""
Servicios de Lógica de Negocio para el Sistema de Workflow Dinámico
Sistema de Trámites Migratorios de Panamá

Capa de servicios que encapsula la lógica de negocio y operaciones
de base de datos para workflows dinámicos.

Author: Sistema de Trámites MVP Panamá
Date: 2025-10-20
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime
from fastapi import HTTPException, status
import logging

from app.models import models_workflow as models
from app.schemas import schemas_workflow as schemas

# Configurar logger
logger = logging.getLogger(__name__)


# ==========================================
# SERVICIOS DE WORKFLOW
# ==========================================

class WorkflowService:
    """Servicio para operaciones de Workflow"""
    
    @staticmethod
    def verificar_codigo_unico(db: Session, codigo: str, workflow_id: Optional[int] = None) -> None:
        """Verifica que un código de workflow sea único"""
        query = db.query(models.Workflow).filter(models.Workflow.codigo == codigo)
        if workflow_id:
            query = query.filter(models.Workflow.id != workflow_id)
        
        if query.first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe un workflow con el código '{codigo}'"
            )
    
    @staticmethod
    def crear_workflow(
        db: Session,
        workflow_data: schemas.WorkflowCreate,
        created_by: str
    ) -> models.Workflow:
        """Crea un nuevo workflow con sus etapas y conexiones"""
        logger.info(f"Creando workflow: {workflow_data.codigo} por usuario: {created_by}")
        
        # Verificar código único
        WorkflowService.verificar_codigo_unico(db, workflow_data.codigo)
        
        # Crear workflow
        db_workflow = models.Workflow(
            **workflow_data.model_dump(exclude={"etapas", "conexiones"}),
            created_by=created_by
        )
        db.add(db_workflow)
        db.flush()
        
        logger.debug(f"Workflow creado con ID: {db_workflow.id}")
        
        # Crear etapas
        etapas_map = {}  # Para mapear códigos a IDs
        if workflow_data.etapas:
            for etapa_data in workflow_data.etapas:
                db_etapa = EtapaService.crear_etapa_con_preguntas(
                    db, etapa_data, db_workflow.id, created_by
                )
                etapas_map[etapa_data.codigo] = db_etapa.id
            logger.info(f"Creadas {len(workflow_data.etapas)} etapas para workflow {workflow_data.codigo}")
        
        # Crear conexiones usando los códigos de etapa
        if workflow_data.conexiones:
            for conexion_data in workflow_data.conexiones:
                # Convertir códigos a IDs usando el mapeo
                etapa_origen_id = etapas_map.get(conexion_data.etapa_origen_codigo)
                etapa_destino_id = etapas_map.get(conexion_data.etapa_destino_codigo)
                
                if not etapa_origen_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Etapa origen con código '{conexion_data.etapa_origen_codigo}' no encontrada"
                    )
                if not etapa_destino_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Etapa destino con código '{conexion_data.etapa_destino_codigo}' no encontrada"
                    )
                
                # Crear la conexión con los IDs reales
                conexion_create = schemas.WorkflowConexionCreate(
                    workflow_id=db_workflow.id,
                    etapa_origen_id=etapa_origen_id,
                    etapa_destino_id=etapa_destino_id,
                    nombre=conexion_data.nombre,
                    condicion=conexion_data.condicion,
                    es_predeterminada=conexion_data.es_predeterminada,
                    activo=conexion_data.activo
                )
                ConexionService.crear_conexion(
                    db, conexion_create, db_workflow.id, created_by
                )
            logger.info(f"Creadas {len(workflow_data.conexiones)} conexiones para workflow {workflow_data.codigo}")
        
        db.commit()
        db.refresh(db_workflow)
        logger.info(f"✅ Workflow {workflow_data.codigo} creado exitosamente con ID: {db_workflow.id}")
        return db_workflow
    
    @staticmethod
    def obtener_workflow(db: Session, workflow_id: int) -> models.Workflow:
        """Obtiene un workflow por ID con todas sus relaciones"""
        workflow = db.query(models.Workflow).options(
            joinedload(models.Workflow.etapas).joinedload(models.WorkflowEtapa.preguntas),
            joinedload(models.Workflow.conexiones)
        ).filter(
            models.Workflow.id == workflow_id
        ).first()
        
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow con id {workflow_id} no encontrado"
            )
        return workflow
    
    @staticmethod
    def listar_workflows(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        estado: Optional[str] = None,
        categoria: Optional[str] = None,
        activo: bool = True
    ) -> List[Dict[str, Any]]:
        """Lista workflows con filtros"""
        query = db.query(models.Workflow).filter(models.Workflow.activo == activo)
        
        if estado:
            query = query.filter(models.Workflow.estado == estado)
        if categoria:
            query = query.filter(models.Workflow.categoria == categoria)

        # MSSQL requiere un ORDER BY cuando se usa OFFSET/LIMIT. Aseguramos
        # un orden determinista por id (puede cambiarse a fecha si se prefiere).
        workflows = query.order_by(models.Workflow.id).offset(skip).limit(limit).all()

        # Agregar contadores
        result = []
        for wf in workflows:
            wf_dict = {
                "id": wf.id,
                "codigo": wf.codigo,
                "nombre": wf.nombre,
                "descripcion": wf.descripcion,
                "version": wf.version,
                "estado": wf.estado,
                "categoria": wf.categoria,
                "activo": wf.activo,
                "created_at": wf.created_at,
                "total_etapas": len(wf.etapas) if wf.etapas else 0,
                "total_instancias": len(wf.instancias) if wf.instancias else 0
            }
            result.append(wf_dict)
        
        return result
    
    @staticmethod
    def actualizar_workflow(
        db: Session,
        workflow_id: int,
        workflow_update: schemas.WorkflowUpdate,
        updated_by: str
    ) -> models.Workflow:
        """Actualiza un workflow"""
        db_workflow = WorkflowService.obtener_workflow(db, workflow_id)
        
        # Si se actualiza el código, verificar unicidad
        update_data = workflow_update.model_dump(exclude_unset=True)
        if "codigo" in update_data:
            WorkflowService.verificar_codigo_unico(db, update_data["codigo"], workflow_id)
        
        # Actualizar campos
        for field, value in update_data.items():
            setattr(db_workflow, field, value)
        
        db_workflow.updated_by = updated_by
        db.commit()
        db.refresh(db_workflow)
        return db_workflow
    
    @staticmethod
    def eliminar_workflow(db: Session, workflow_id: int, updated_by: str) -> None:
        """Desactiva un workflow (soft delete)"""
        db_workflow = WorkflowService.obtener_workflow(db, workflow_id)
        db_workflow.activo = False
        db_workflow.updated_by = updated_by
        db.commit()


# ==========================================
# SERVICIOS DE ETAPA
# ==========================================

class EtapaService:
    """Servicio para operaciones de Etapa"""
    
    @staticmethod
    def verificar_codigo_unico_en_workflow(
        db: Session,
        workflow_id: int,
        codigo: str,
        etapa_id: Optional[int] = None
    ) -> None:
        """Verifica que un código de etapa sea único dentro del workflow"""
        query = db.query(models.WorkflowEtapa).filter(
            and_(
                models.WorkflowEtapa.workflow_id == workflow_id,
                models.WorkflowEtapa.codigo == codigo
            )
        )
        if etapa_id:
            query = query.filter(models.WorkflowEtapa.id != etapa_id)
        
        if query.first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe una etapa con el código '{codigo}' en este workflow"
            )
    
    @staticmethod
    def crear_etapa_con_preguntas(
        db: Session,
        etapa_data,  # Acepta tanto WorkflowEtapaCreate como WorkflowEtapaCreateNested
        workflow_id: int,
        created_by: str
    ) -> models.WorkflowEtapa:
        """Crea una etapa con sus preguntas"""
        # Verificar que el workflow existe
        WorkflowService.obtener_workflow(db, workflow_id)
        
        # Verificar código único
        EtapaService.verificar_codigo_unico_en_workflow(db, workflow_id, etapa_data.codigo)
        
        # Crear etapa (excluir workflow_id si existe en el data)
        exclude_fields = {"preguntas"}
        if hasattr(etapa_data, 'workflow_id'):
            exclude_fields.add("workflow_id")
        
        etapa_dict = etapa_data.model_dump(exclude=exclude_fields)
        db_etapa = models.WorkflowEtapa(
            **etapa_dict,
            workflow_id=workflow_id,
            created_by=created_by
        )
        db.add(db_etapa)
        db.flush()
        
        # Crear preguntas
        if etapa_data.preguntas:
            for pregunta_data in etapa_data.preguntas:
                # Crear schema de pregunta con etapa_id si no lo tiene
                if hasattr(pregunta_data, 'etapa_id'):
                    PreguntaService.crear_pregunta(db, pregunta_data, db_etapa.id, created_by)
                else:
                    # Convertir a WorkflowPreguntaCreate añadiendo etapa_id
                    pregunta_dict = pregunta_data.model_dump()
                    pregunta_create = schemas.WorkflowPreguntaCreate(**pregunta_dict, etapa_id=db_etapa.id)
                    PreguntaService.crear_pregunta(db, pregunta_create, db_etapa.id, created_by)
        
        return db_etapa
    
    @staticmethod
    def obtener_etapa(db: Session, etapa_id: int) -> models.WorkflowEtapa:
        """Obtiene una etapa por ID con sus preguntas"""
        etapa = db.query(models.WorkflowEtapa).options(
            joinedload(models.WorkflowEtapa.preguntas)
        ).filter(
            models.WorkflowEtapa.id == etapa_id
        ).first()
        
        if not etapa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Etapa con id {etapa_id} no encontrada"
            )
        return etapa
    
    @staticmethod
    def actualizar_etapa(
        db: Session,
        etapa_id: int,
        etapa_update: schemas.WorkflowEtapaUpdate,
        updated_by: str
    ) -> models.WorkflowEtapa:
        """Actualiza una etapa"""
        db_etapa = EtapaService.obtener_etapa(db, etapa_id)
        
        update_data = etapa_update.model_dump(exclude_unset=True)
        
        # Si se actualiza el código, verificar unicidad
        if "codigo" in update_data:
            EtapaService.verificar_codigo_unico_en_workflow(
                db, db_etapa.workflow_id, update_data["codigo"], etapa_id
            )
        
        for field, value in update_data.items():
            setattr(db_etapa, field, value)
        
        db_etapa.updated_by = updated_by
        db.commit()
        db.refresh(db_etapa)
        return db_etapa
    
    @staticmethod
    def eliminar_etapa(db: Session, etapa_id: int, updated_by: str) -> None:
        """Desactiva una etapa"""
        db_etapa = EtapaService.obtener_etapa(db, etapa_id)
        db_etapa.activo = False
        db_etapa.updated_by = updated_by
        db.commit()


# ==========================================
# SERVICIOS DE PREGUNTA
# ==========================================

class PreguntaService:
    """Servicio para operaciones de Pregunta"""
    
    @staticmethod
    def verificar_codigo_unico_en_etapa(
        db: Session,
        etapa_id: int,
        codigo: str,
        pregunta_id: Optional[int] = None
    ) -> None:
        """Verifica que un código de pregunta sea único dentro de la etapa"""
        query = db.query(models.WorkflowPregunta).filter(
            and_(
                models.WorkflowPregunta.etapa_id == etapa_id,
                models.WorkflowPregunta.codigo == codigo
            )
        )
        if pregunta_id:
            query = query.filter(models.WorkflowPregunta.id != pregunta_id)
        
        if query.first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe una pregunta con el código '{codigo}' en esta etapa"
            )
    
    @staticmethod
    def crear_pregunta(
        db: Session,
        pregunta_data: schemas.WorkflowPreguntaCreate,
        etapa_id: int,
        created_by: str
    ) -> models.WorkflowPregunta:
        """Crea una pregunta"""
        # Verificar que la etapa existe
        EtapaService.obtener_etapa(db, etapa_id)
        
        # Verificar código único
        PreguntaService.verificar_codigo_unico_en_etapa(db, etapa_id, pregunta_data.codigo)
        
        pregunta_dict = pregunta_data.model_dump(exclude={"etapa_id"})
        db_pregunta = models.WorkflowPregunta(
            **pregunta_dict,
            etapa_id=etapa_id,
            created_by=created_by
        )
        db.add(db_pregunta)
        return db_pregunta
    
    @staticmethod
    def obtener_pregunta(db: Session, pregunta_id: int) -> models.WorkflowPregunta:
        """Obtiene una pregunta por ID con su etapa"""
        pregunta = db.query(models.WorkflowPregunta).options(
            joinedload(models.WorkflowPregunta.etapa)
        ).filter(
            models.WorkflowPregunta.id == pregunta_id
        ).first()
        
        if not pregunta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pregunta con id {pregunta_id} no encontrada"
            )
        return pregunta
    
    @staticmethod
    def actualizar_pregunta(
        db: Session,
        pregunta_id: int,
        pregunta_update: schemas.WorkflowPreguntaUpdate,
        updated_by: str
    ) -> models.WorkflowPregunta:
        """Actualiza una pregunta"""
        db_pregunta = PreguntaService.obtener_pregunta(db, pregunta_id)
        
        update_data = pregunta_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_pregunta, field, value)
        
        db_pregunta.updated_by = updated_by
        db.commit()
        db.refresh(db_pregunta)
        return db_pregunta
    
    @staticmethod
    def eliminar_pregunta(db: Session, pregunta_id: int, updated_by: str) -> None:
        """Desactiva una pregunta"""
        db_pregunta = PreguntaService.obtener_pregunta(db, pregunta_id)
        db_pregunta.activo = False
        db_pregunta.updated_by = updated_by
        db.commit()


# ==========================================
# SERVICIOS DE CONEXIÓN
# ==========================================

class ConexionService:
    """Servicio para operaciones de Conexión"""
    
    @staticmethod
    def validar_conexion(
        db: Session,
        etapa_origen_id: int,
        etapa_destino_id: int
    ) -> Tuple[models.WorkflowEtapa, models.WorkflowEtapa]:
        """Valida que las etapas existan y pertenezcan al mismo workflow"""
        etapa_origen = EtapaService.obtener_etapa(db, etapa_origen_id)
        etapa_destino = EtapaService.obtener_etapa(db, etapa_destino_id)
        
        if etapa_origen.workflow_id != etapa_destino.workflow_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Las etapas deben pertenecer al mismo workflow"
            )
        
        return etapa_origen, etapa_destino
    
    @staticmethod
    def crear_conexion(
        db: Session,
        conexion_data: schemas.WorkflowConexionCreate,
        workflow_id: int,
        created_by: str
    ) -> models.WorkflowConexion:
        """Crea una conexión entre etapas"""
        # Validar conexión
        ConexionService.validar_conexion(
            db, conexion_data.etapa_origen_id, conexion_data.etapa_destino_id
        )
        
        conexion_dict = conexion_data.model_dump(exclude={"workflow_id"})
        db_conexion = models.WorkflowConexion(
            **conexion_dict,
            workflow_id=workflow_id,
            created_by=created_by
        )
        db.add(db_conexion)
        return db_conexion
    
    @staticmethod
    def obtener_conexion(db: Session, conexion_id: int) -> models.WorkflowConexion:
        """Obtiene una conexión por ID con sus etapas"""
        conexion = db.query(models.WorkflowConexion).options(
            joinedload(models.WorkflowConexion.etapa_origen),
            joinedload(models.WorkflowConexion.etapa_destino)
        ).filter(
            models.WorkflowConexion.id == conexion_id
        ).first()
        
        if not conexion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conexión con id {conexion_id} no encontrada"
            )
        return conexion
    
    @staticmethod
    def actualizar_conexion(
        db: Session,
        conexion_id: int,
        conexion_update: schemas.WorkflowConexionUpdate
    ) -> models.WorkflowConexion:
        """Actualiza una conexión"""
        db_conexion = ConexionService.obtener_conexion(db, conexion_id)
        
        update_data = conexion_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_conexion, field, value)
        
        db.commit()
        db.refresh(db_conexion)
        return db_conexion
    
    @staticmethod
    def eliminar_conexion(db: Session, conexion_id: int) -> None:
        """Elimina una conexión"""
        db_conexion = ConexionService.obtener_conexion(db, conexion_id)
        db.delete(db_conexion)
        db.commit()


# ==========================================
# SERVICIOS DE INSTANCIA
# ==========================================

class InstanciaService:
    """Servicio para operaciones de Instancia"""
    
    @staticmethod
    def generar_numero_expediente(db: Session, workflow: models.Workflow) -> str:
        """Genera un número de expediente único"""
        year = datetime.now().year
        count = db.query(func.count(models.WorkflowInstancia.id)).filter(
            models.WorkflowInstancia.workflow_id == workflow.id,
            func.extract('year', models.WorkflowInstancia.created_at) == year
        ).scalar()
        
        return f"WF-{workflow.codigo}-{year}-{str(count + 1).zfill(6)}"
    
    @staticmethod
    def obtener_etapa_inicial(db: Session, workflow_id: int) -> models.WorkflowEtapa:
        """Obtiene la etapa inicial de un workflow"""
        etapa_inicial = db.query(models.WorkflowEtapa).filter(
            and_(
                models.WorkflowEtapa.workflow_id == workflow_id,
                models.WorkflowEtapa.es_etapa_inicial == True,
                models.WorkflowEtapa.activo == True
            )
        ).first()
        
        if not etapa_inicial:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El workflow no tiene una etapa inicial definida"
            )
        
        return etapa_inicial
    
    @staticmethod
    def crear_instancia(
        db: Session,
        instancia_data: schemas.WorkflowInstanciaCreate,
        created_by: str
    ) -> models.WorkflowInstancia:
        """Crea una nueva instancia de workflow"""
        # Verificar workflow activo
        workflow = db.query(models.Workflow).filter(
            and_(
                models.Workflow.id == instancia_data.workflow_id,
                models.Workflow.activo == True
            )
        ).first()
        
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow con id {instancia_data.workflow_id} no encontrado o inactivo"
            )
        
        if workflow.estado != "ACTIVO":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El workflow debe estar en estado ACTIVO. Estado actual: {workflow.estado}"
            )
        
        # Obtener etapa inicial
        etapa_inicial = InstanciaService.obtener_etapa_inicial(db, workflow.id)
        
        # Generar número de expediente
        num_expediente = InstanciaService.generar_numero_expediente(db, workflow)
        
        # Crear instancia
        db_instancia = models.WorkflowInstancia(
            workflow_id=workflow.id,
            num_expediente=num_expediente,
            nombre_instancia=instancia_data.nombre_instancia,
            estado="INICIADO",
            etapa_actual_id=etapa_inicial.id,
            creado_por_user_id=created_by,
            metadata_adicional=instancia_data.metadata_adicional,
            prioridad=instancia_data.prioridad
        )
        db.add(db_instancia)
        db.flush()
        
        # Crear entrada en historial
        HistorialService.registrar_cambio(
            db=db,
            instancia_id=db_instancia.id,
            tipo_cambio="INICIO",
            etapa_destino_id=etapa_inicial.id,
            estado_nuevo="INICIADO",
            descripcion=f"Instancia iniciada en etapa '{etapa_inicial.nombre}'",
            created_by=created_by
        )
        
        db.commit()
        db.refresh(db_instancia)
        return db_instancia
    
    @staticmethod
    def obtener_instancia(db: Session, instancia_id: int) -> models.WorkflowInstancia:
        """Obtiene una instancia por ID con workflow, etapa actual e historial"""
        instancia = db.query(models.WorkflowInstancia).options(
            joinedload(models.WorkflowInstancia.workflow).joinedload(models.Workflow.etapas),
            joinedload(models.WorkflowInstancia.etapa_actual),
            joinedload(models.WorkflowInstancia.historial),
            joinedload(models.WorkflowInstancia.comentarios)
        ).filter(
            models.WorkflowInstancia.id == instancia_id
        ).first()
        
        if not instancia:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Instancia con id {instancia_id} no encontrada"
            )
        return instancia
    
    @staticmethod
    def listar_instancias(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        workflow_id: Optional[int] = None,
        estado: Optional[str] = None,
        creado_por: Optional[str] = None,
        asignado_a: Optional[str] = None
    ) -> List[models.WorkflowInstancia]:
        """Lista instancias con filtros"""
        query = db.query(models.WorkflowInstancia).filter(
            models.WorkflowInstancia.activo == True
        )
        
        if workflow_id:
            query = query.filter(models.WorkflowInstancia.workflow_id == workflow_id)
        if estado:
            query = query.filter(models.WorkflowInstancia.estado == estado)
        if creado_por:
            query = query.filter(models.WorkflowInstancia.creado_por_user_id == creado_por)
        if asignado_a:
            query = query.filter(models.WorkflowInstancia.asignado_a_user_id == asignado_a)
        
        return query.order_by(
            models.WorkflowInstancia.created_at.desc()
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def actualizar_instancia(
        db: Session,
        instancia_id: int,
        instancia_update: schemas.WorkflowInstanciaUpdate,
        updated_by: str
    ) -> models.WorkflowInstancia:
        """Actualiza una instancia"""
        db_instancia = InstanciaService.obtener_instancia(db, instancia_id)
        
        update_data = instancia_update.model_dump(exclude_unset=True)
        
        # Registrar cambios importantes
        if "estado" in update_data and update_data["estado"] != db_instancia.estado:
            HistorialService.registrar_cambio(
                db=db,
                instancia_id=db_instancia.id,
                tipo_cambio="CAMBIO_ESTADO",
                estado_anterior=db_instancia.estado,
                estado_nuevo=update_data["estado"],
                descripcion=f"Estado cambiado de {db_instancia.estado} a {update_data['estado']}",
                created_by=updated_by
            )
        
        if "asignado_a_user_id" in update_data and update_data["asignado_a_user_id"] != db_instancia.asignado_a_user_id:
            HistorialService.registrar_cambio(
                db=db,
                instancia_id=db_instancia.id,
                tipo_cambio="ASIGNACION",
                descripcion=f"Asignado a usuario {update_data['asignado_a_user_id']}",
                datos_adicionales={"usuario_anterior": db_instancia.asignado_a_user_id},
                created_by=updated_by
            )
        
        # Actualizar campos
        for field, value in update_data.items():
            setattr(db_instancia, field, value)
        
        db_instancia.updated_by = updated_by
        db.commit()
        db.refresh(db_instancia)
        return db_instancia
    
    @staticmethod
    def transicionar_instancia(
        db: Session,
        instancia_id: int,
        transicion: schemas.WorkflowTransicionRequest,
        current_user: str
    ) -> Dict[str, Any]:
        """Realiza una transición entre etapas"""
        db_instancia = InstanciaService.obtener_instancia(db, instancia_id)
        
        # Obtener etapas
        etapa_actual = EtapaService.obtener_etapa(db, db_instancia.etapa_actual_id)
        etapa_destino = EtapaService.obtener_etapa(db, transicion.etapa_destino_id)
        
        # Verificar conexión válida
        conexion = db.query(models.WorkflowConexion).filter(
            and_(
                models.WorkflowConexion.etapa_origen_id == db_instancia.etapa_actual_id,
                models.WorkflowConexion.etapa_destino_id == transicion.etapa_destino_id,
                models.WorkflowConexion.activo == True
            )
        ).first()
        
        if not conexion:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No existe una conexión válida desde '{etapa_actual.nombre}' hacia '{etapa_destino.nombre}'"
            )
        
        # Guardar respuestas
        if transicion.respuestas:
            RespuestaService.guardar_respuestas_etapa(
                db, instancia_id, etapa_actual.id, transicion.respuestas, current_user
            )
        
        # Actualizar etapa actual
        db_instancia.etapa_actual_id = transicion.etapa_destino_id
        db_instancia.estado = "EN_PROGRESO"
        db_instancia.updated_by = current_user
        
        # Si es etapa final
        if etapa_destino.es_etapa_final:
            db_instancia.estado = "COMPLETADO"
            db_instancia.fecha_fin = datetime.now()
        
        # Registrar en historial
        HistorialService.registrar_cambio(
            db=db,
            instancia_id=instancia_id,
            tipo_cambio="TRANSICION",
            etapa_origen_id=etapa_actual.id,
            etapa_destino_id=transicion.etapa_destino_id,
            estado_anterior=db_instancia.estado,
            estado_nuevo="EN_PROGRESO" if not etapa_destino.es_etapa_final else "COMPLETADO",
            descripcion=transicion.comentario or f"Transición de '{etapa_actual.nombre}' a '{etapa_destino.nombre}'",
            created_by=current_user
        )
        
        db.commit()
        db.refresh(db_instancia)
        
        return {
            "success": True,
            "instancia": db_instancia,
            "etapa_anterior": etapa_actual,
            "etapa_nueva": etapa_destino,
            "mensaje": f"Transición exitosa a la etapa '{etapa_destino.nombre}'"
        }


# ==========================================
# SERVICIOS DE RESPUESTA
# ==========================================

class RespuestaService:
    """Servicio para operaciones de Respuesta"""
    
    @staticmethod
    def guardar_respuestas_etapa(
        db: Session,
        instancia_id: int,
        etapa_id: int,
        respuestas: List[schemas.WorkflowRespuestaCreate],
        created_by: str
    ) -> models.WorkflowRespuestaEtapa:
        """Guarda las respuestas de una etapa"""
        # Buscar o crear WorkflowRespuestaEtapa
        respuesta_etapa = db.query(models.WorkflowRespuestaEtapa).filter(
            and_(
                models.WorkflowRespuestaEtapa.instancia_id == instancia_id,
                models.WorkflowRespuestaEtapa.etapa_id == etapa_id
            )
        ).first()
        
        if not respuesta_etapa:
            respuesta_etapa = models.WorkflowRespuestaEtapa(
                instancia_id=instancia_id,
                etapa_id=etapa_id,
                completada=True,
                fecha_completado=datetime.now(),
                completado_por_user_id=created_by
            )
            db.add(respuesta_etapa)
            db.flush()
        else:
            respuesta_etapa.completada = True
            respuesta_etapa.fecha_completado = datetime.now()
            respuesta_etapa.completado_por_user_id = created_by
        
        # Guardar respuestas individuales
        for resp_data in respuestas:
            db_respuesta = models.WorkflowRespuesta(
                **resp_data.model_dump(),
                respuesta_etapa_id=respuesta_etapa.id,
                created_by=created_by
            )
            db.add(db_respuesta)
        
        return respuesta_etapa


# ==========================================
# SERVICIOS DE HISTORIAL
# ==========================================

class HistorialService:
    """Servicio para operaciones de Historial"""
    
    @staticmethod
    def registrar_cambio(
        db: Session,
        instancia_id: int,
        tipo_cambio: str,
        created_by: str,
        etapa_origen_id: Optional[int] = None,
        etapa_destino_id: Optional[int] = None,
        estado_anterior: Optional[str] = None,
        estado_nuevo: Optional[str] = None,
        descripcion: Optional[str] = None,
        datos_adicionales: Optional[Dict[str, Any]] = None
    ) -> models.WorkflowInstanciaHistorial:
        """Registra un cambio en el historial"""
        db_historial = models.WorkflowInstanciaHistorial(
            instancia_id=instancia_id,
            tipo_cambio=tipo_cambio,
            etapa_origen_id=etapa_origen_id,
            etapa_destino_id=etapa_destino_id,
            estado_anterior=estado_anterior,
            estado_nuevo=estado_nuevo,
            descripcion=descripcion,
            datos_adicionales=datos_adicionales,
            created_by=created_by
        )
        db.add(db_historial)
        return db_historial
    
    @staticmethod
    def obtener_historial(
        db: Session,
        instancia_id: int
    ) -> List[models.WorkflowInstanciaHistorial]:
        """Obtiene el historial de una instancia"""
        return db.query(models.WorkflowInstanciaHistorial).filter(
            models.WorkflowInstanciaHistorial.instancia_id == instancia_id
        ).order_by(models.WorkflowInstanciaHistorial.created_at.desc()).all()


# ==========================================
# SERVICIOS DE COMENTARIO
# ==========================================

class ComentarioService:
    """Servicio para operaciones de Comentario"""
    
    @staticmethod
    def crear_comentario(
        db: Session,
        instancia_id: int,
        comentario_data: schemas.WorkflowComentarioCreate,
        created_by: str
    ) -> models.WorkflowComentario:
        """Crea un comentario en una instancia"""
        # Verificar que la instancia existe
        InstanciaService.obtener_instancia(db, instancia_id)
        
        db_comentario = models.WorkflowComentario(
            **comentario_data.model_dump(),
            instancia_id=instancia_id,
            created_by=created_by
        )
        db.add(db_comentario)
        db.commit()
        db.refresh(db_comentario)
        return db_comentario
    
    @staticmethod
    def listar_comentarios(
        db: Session,
        instancia_id: int,
        incluir_internos: bool = True
    ) -> List[models.WorkflowComentario]:
        """Lista los comentarios de una instancia"""
        query = db.query(models.WorkflowComentario).filter(
            models.WorkflowComentario.instancia_id == instancia_id
        )
        
        if not incluir_internos:
            query = query.filter(models.WorkflowComentario.es_interno == False)
        
        return query.order_by(
            models.WorkflowComentario.created_at.desc()
        ).all()
