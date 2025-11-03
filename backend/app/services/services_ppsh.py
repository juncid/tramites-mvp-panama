"""
Servicios de Lógica de Negocio para el Sistema PPSH
Sistema de Trámites Migratorios de Panamá

Siguiendo principios SOLID:
- Single Responsibility: Cada servicio maneja una entidad específica
- Open/Closed: Extensible sin modificar código existente
- Liskov Substitution: Servicios pueden ser sustituidos por sus interfaces
- Interface Segregation: Métodos específicos y no sobrecargados
- Dependency Inversion: Depende de abstracciones (db session) no implementaciones
"""

from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import func, and_, or_, desc, extract, text
from typing import List, Optional, Dict, Tuple
from datetime import datetime, date, timedelta
from fastapi import HTTPException, status
import logging

from app.models import models_ppsh
from app.schemas import (
    SolicitudCreate, SolicitudUpdate, SolicitudResponse,
    SolicitanteCreate, SolicitanteUpdate, SolicitanteResponse,
    DocumentoCreate, DocumentoUpdate, DocumentoResponse,
    EntrevistaCreate, EntrevistaUpdate, EntrevistaResponse,
    ComentarioCreate, ComentarioResponse,
    CambiarEstadoRequest, EstadoHistorialResponse,
    SolicitudFiltros, EstadisticasGenerales, EstadisticasPorEstado,
    PaginatedResponse, SolicitudListResponse
)

logger = logging.getLogger(__name__)


# ==========================================
# EXCEPCIONES PERSONALIZADAS
# ==========================================

class PPSHNotFoundException(HTTPException):
    """Recurso no encontrado"""
    def __init__(self, recurso: str, identificador: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{recurso} con identificador {identificador} no encontrado"
        )


class PPSHBusinessException(HTTPException):
    """Excepción de regla de negocio"""
    def __init__(self, mensaje: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=mensaje
        )


class PPSHPermissionException(HTTPException):
    """Excepción de permiso denegado"""
    def __init__(self, mensaje: str = "No tiene permisos para realizar esta operación"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=mensaje
        )


# ==========================================
# SERVICIO DE CATÁLOGOS
# ==========================================

class CatalogoService:
    """Servicio para manejar catálogos del sistema PPSH"""
    
    @staticmethod
    def get_causas_humanitarias(db: Session, activos_solo: bool = True) -> List[models_ppsh.PPSHCausaHumanitaria]:
        """Obtiene todas las causas humanitarias"""
        query = db.query(models_ppsh.PPSHCausaHumanitaria)
        if activos_solo:
            query = query.filter(models_ppsh.PPSHCausaHumanitaria.activo == True)
        return query.order_by(models_ppsh.PPSHCausaHumanitaria.nombre_causa).all()
    
    @staticmethod
    def get_tipos_documento(db: Session, activos_solo: bool = True) -> List[models_ppsh.PPSHTipoDocumento]:
        """Obtiene todos los tipos de documento"""
        query = db.query(models_ppsh.PPSHTipoDocumento)
        if activos_solo:
            query = query.filter(models_ppsh.PPSHTipoDocumento.activo == True)
        return query.order_by(models_ppsh.PPSHTipoDocumento.orden).all()
    
    @staticmethod
    def get_estados(db: Session, activos_solo: bool = True) -> List[models_ppsh.PPSHEstado]:
        """Obtiene todos los estados posibles"""
        query = db.query(models_ppsh.PPSHEstado)
        if activos_solo:
            query = query.filter(models_ppsh.PPSHEstado.activo == True)
        return query.order_by(models_ppsh.PPSHEstado.orden).all()
    
    @staticmethod
    def get_estado_by_codigo(db: Session, codigo: str) -> models_ppsh.PPSHEstado:
        """Obtiene un estado por código"""
        estado = db.query(models_ppsh.PPSHEstado).filter(models_ppsh.PPSHEstado.cod_estado == codigo).first()
        if not estado:
            raise PPSHNotFoundException("Estado", codigo)
        return estado


# ==========================================
# SERVICIO DE SOLICITUDES
# ==========================================

class SolicitudService:
    """Servicio para manejar solicitudes PPSH"""
    
    @staticmethod
    def _generar_numero_expediente(db: Session) -> str:
        """
        Genera número de expediente único para solicitud
        Formato: PPSH-YYYY-NNNNNN
        """
        año_actual = datetime.now().year
        prefijo = f"PPSH-{año_actual}-"
        
        # Obtener el último número del año
        ultima_solicitud = (
            db.query(models_ppsh.PPSHSolicitud)
            .filter(models_ppsh.PPSHSolicitud.num_expediente.like(f"{prefijo}%"))
            .order_by(desc(models_ppsh.PPSHSolicitud.num_expediente))
            .first()
        )
        
        if ultima_solicitud:
            ultimo_numero = int(ultima_solicitud.num_expediente.split('-')[-1])
            nuevo_numero = ultimo_numero + 1
        else:
            nuevo_numero = 1
        
        return f"{prefijo}{nuevo_numero:06d}"
    
    @staticmethod
    def crear_solicitud(
        db: Session,
        solicitud_data: SolicitudCreate,
        user_id: str
    ) -> models_ppsh.PPSHSolicitud:
        """Crea una nueva solicitud PPSH con sus solicitantes"""
        logger.info(f"Creando solicitud PPSH por usuario {user_id}")
        
        # Validar que existe la causa humanitaria
        causa = db.query(models_ppsh.PPSHCausaHumanitaria).filter(
            models_ppsh.PPSHCausaHumanitaria.cod_causa == solicitud_data.cod_causa_humanitaria,
            models_ppsh.PPSHCausaHumanitaria.activo == True
        ).first()
        
        if not causa:
            raise PPSHBusinessException(
                f"Causa humanitaria {solicitud_data.cod_causa_humanitaria} no existe o está inactiva"
            )
        
        try:
            # Crear solicitud principal
            solicitud = models_ppsh.PPSHSolicitud(
                num_expediente=SolicitudService._generar_numero_expediente(db),
                fecha_solicitud=date.today(),
                tipo_solicitud=solicitud_data.tipo_solicitud.value,
                cod_causa_humanitaria=solicitud_data.cod_causa_humanitaria,
                descripcion_caso=solicitud_data.descripcion_caso,
                prioridad=solicitud_data.prioridad.value,
                estado_actual="RECIBIDO",
                cod_agencia=solicitud_data.cod_agencia,
                cod_seccion=solicitud_data.cod_seccion,
                observaciones_generales=solicitud_data.observaciones_generales,
                activo=True
            )
            
            db.add(solicitud)
            db.flush()  # Obtener ID sin hacer commit
            
            # Crear solicitantes
            for idx, sol_data in enumerate(solicitud_data.solicitantes):
                solicitante = models_ppsh.PPSHSolicitante(
                    id_solicitud=solicitud.id_solicitud,
                    es_titular=sol_data.es_titular,
                    tipo_documento=sol_data.tipo_documento.value,
                    num_documento=sol_data.num_documento,
                    pais_emisor=sol_data.pais_emisor,
                    fecha_emision_doc=sol_data.fecha_emision_doc,
                    fecha_vencimiento_doc=sol_data.fecha_vencimiento_doc,
                    primer_nombre=sol_data.primer_nombre,
                    segundo_nombre=sol_data.segundo_nombre,
                    primer_apellido=sol_data.primer_apellido,
                    segundo_apellido=sol_data.segundo_apellido,
                    fecha_nacimiento=sol_data.fecha_nacimiento,
                    cod_sexo=sol_data.cod_sexo,
                    cod_nacionalidad=sol_data.cod_nacionalidad,
                    cod_estado_civil=sol_data.cod_estado_civil,
                    parentesco_titular=sol_data.parentesco_titular.value if sol_data.parentesco_titular else None,
                    email=sol_data.email,
                    telefono=sol_data.telefono,
                    direccion_pais_origen=sol_data.direccion_pais_origen,
                    direccion_panama=sol_data.direccion_panama,
                    ocupacion=sol_data.ocupacion,
                    observaciones=sol_data.observaciones,
                    activo=True
                )
                db.add(solicitante)
            
            # Crear registro inicial en historial de estados
            historial = models_ppsh.PPSHEstadoHistorial(
                id_solicitud=solicitud.id_solicitud,
                estado_anterior=None,
                estado_nuevo="RECIBIDO",
                fecha_cambio=datetime.now(),
                user_id=user_id,
                observaciones="Solicitud creada",
                es_dictamen=False,
                dias_en_estado_anterior=None
            )
            db.add(historial)
            
            db.commit()
            db.refresh(solicitud)
            
            logger.info(f"Solicitud {solicitud.num_expediente} creada exitosamente")
            return solicitud
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creando solicitud: {str(e)}")
            raise PPSHBusinessException(f"Error creando solicitud: {str(e)}")
    
    @staticmethod
    def get_solicitud(
        db: Session,
        id_solicitud: int,
        incluir_relaciones: bool = True
    ) -> models_ppsh.PPSHSolicitud:
        """Obtiene una solicitud por ID con sus relaciones"""
        query = db.query(models_ppsh.PPSHSolicitud).filter(models_ppsh.PPSHSolicitud.id_solicitud == id_solicitud)
        
        if incluir_relaciones:
            query = query.options(
                joinedload(models_ppsh.PPSHSolicitud.causa_humanitaria),
                joinedload(models_ppsh.PPSHSolicitud.estado),
                selectinload(models_ppsh.PPSHSolicitud.solicitantes),
                selectinload(models_ppsh.PPSHSolicitud.documentos),
                selectinload(models_ppsh.PPSHSolicitud.historial),
                selectinload(models_ppsh.PPSHSolicitud.entrevistas),
                selectinload(models_ppsh.PPSHSolicitud.comentarios)
            )
        
        solicitud = query.first()
        
        if not solicitud:
            raise PPSHNotFoundException("Solicitud", str(id_solicitud))
        
        return solicitud
    
    @staticmethod
    def listar_solicitudes(
        db: Session,
        filtros: Optional[SolicitudFiltros] = None,
        page: int = 1,
        page_size: int = 20,
        user_id: Optional[str] = None,
        es_admin: bool = False
    ) -> Tuple[List[models_ppsh.PPSHSolicitud], int]:
        """Lista solicitudes con filtros y paginación"""
        query = db.query(models_ppsh.PPSHSolicitud).filter(models_ppsh.PPSHSolicitud.activo == True)
        
        # Si no es admin, solo ve sus solicitudes asignadas
        if not es_admin and user_id:
            query = query.filter(models_ppsh.PPSHSolicitud.user_id_asignado == user_id)
        
        # Aplicar filtros
        if filtros:
            if filtros.estado:
                query = query.filter(models_ppsh.PPSHSolicitud.estado_actual == filtros.estado)
            
            if filtros.prioridad:
                query = query.filter(models_ppsh.PPSHSolicitud.prioridad == filtros.prioridad.value)
            
            if filtros.causa_humanitaria:
                query = query.filter(models_ppsh.PPSHSolicitud.cod_causa_humanitaria == filtros.causa_humanitaria)
            
            if filtros.fecha_desde:
                query = query.filter(models_ppsh.PPSHSolicitud.fecha_solicitud >= filtros.fecha_desde)
            
            if filtros.fecha_hasta:
                query = query.filter(models_ppsh.PPSHSolicitud.fecha_solicitud <= filtros.fecha_hasta)
            
            if filtros.agencia:
                query = query.filter(models_ppsh.PPSHSolicitud.cod_agencia == filtros.agencia)
            
            if filtros.asignado_a:
                query = query.filter(models_ppsh.PPSHSolicitud.user_id_asignado == filtros.asignado_a)
            
            if filtros.buscar:
                # Búsqueda en múltiples campos
                buscar_like = f"%{filtros.buscar}%"
                query = query.join(models_ppsh.PPSHSolicitud.solicitantes).filter(
                    or_(
                        models_ppsh.PPSHSolicitud.num_expediente.like(buscar_like),
                        models_ppsh.PPSHSolicitante.primer_nombre.like(buscar_like),
                        models_ppsh.PPSHSolicitante.primer_apellido.like(buscar_like),
                        models_ppsh.PPSHSolicitante.num_documento.like(buscar_like)
                    )
                )
        
        # Contar total
        total = query.count()
        
        # Aplicar paginación y ordenar
        query = query.order_by(desc(models_ppsh.PPSHSolicitud.fecha_solicitud))
        query = query.offset((page - 1) * page_size).limit(page_size)
        
        # Cargar relaciones necesarias para listado
        query = query.options(
            joinedload(models_ppsh.PPSHSolicitud.causa_humanitaria),
            joinedload(models_ppsh.PPSHSolicitud.estado),
            selectinload(models_ppsh.PPSHSolicitud.solicitantes)
        )
        
        solicitudes = query.all()
        
        return solicitudes, total
    
    @staticmethod
    def actualizar_solicitud(
        db: Session,
        id_solicitud: int,
        solicitud_data: SolicitudUpdate,
        user_id: str
    ) -> models_ppsh.PPSHSolicitud:
        """Actualiza una solicitud existente"""
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        
        logger.info(f"Actualizando solicitud {solicitud.num_expediente} por usuario {user_id}")
        
        try:
            # Actualizar campos si están presentes
            update_data = solicitud_data.model_dump(exclude_unset=True)
            
            for campo, valor in update_data.items():
                if hasattr(solicitud, campo):
                    setattr(solicitud, campo, valor)
            
            solicitud.updated_at = datetime.now()
            
            db.commit()
            db.refresh(solicitud)
            
            logger.info(f"Solicitud {solicitud.num_expediente} actualizada")
            return solicitud
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error actualizando solicitud: {str(e)}")
            raise PPSHBusinessException(f"Error actualizando solicitud: {str(e)}")
    
    @staticmethod
    def asignar_solicitud(
        db: Session,
        id_solicitud: int,
        user_id_asignado: str,
        asignado_por: str
    ) -> models_ppsh.PPSHSolicitud:
        """Asigna una solicitud a un funcionario"""
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        
        logger.info(f"Asignando solicitud {solicitud.num_expediente} a {user_id_asignado}")
        
        solicitud.user_id_asignado = user_id_asignado
        solicitud.fecha_asignacion = datetime.now()
        solicitud.updated_at = datetime.now()
        
        # Registrar en comentarios
        comentario = models_ppsh.PPSHComentario(
            id_solicitud=id_solicitud,
            user_id=asignado_por,
            comentario=f"Solicitud asignada a {user_id_asignado}",
            es_interno=True
        )
        db.add(comentario)
        
        db.commit()
        db.refresh(solicitud)
        
        return solicitud
    
    @staticmethod
    def cambiar_estado(
        db: Session,
        id_solicitud: int,
        cambio: CambiarEstadoRequest,
        user_id: str
    ) -> models_ppsh.PPSHSolicitud:
        """Cambia el estado de una solicitud"""
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        
        # Validar que existe el nuevo estado
        nuevo_estado = CatalogoService.get_estado_by_codigo(db, cambio.estado_nuevo)
        
        logger.info(
            f"Cambiando estado de solicitud {solicitud.num_expediente} "
            f"de {solicitud.estado_actual} a {cambio.estado_nuevo}"
        )
        
        try:
            # Calcular días en estado anterior
            ultimo_cambio = (
                db.query(models_ppsh.PPSHEstadoHistorial)
                .filter(models_ppsh.PPSHEstadoHistorial.id_solicitud == id_solicitud)
                .order_by(desc(models_ppsh.PPSHEstadoHistorial.fecha_cambio))
                .first()
            )
            
            dias_en_estado = None
            if ultimo_cambio:
                dias_en_estado = (datetime.now() - ultimo_cambio.fecha_cambio).days
            
            # Crear registro en historial
            historial = models_ppsh.PPSHEstadoHistorial(
                id_solicitud=id_solicitud,
                estado_anterior=solicitud.estado_actual,
                estado_nuevo=cambio.estado_nuevo,
                fecha_cambio=datetime.now(),
                user_id=user_id,
                observaciones=cambio.observaciones,
                es_dictamen=cambio.es_dictamen,
                tipo_dictamen=cambio.tipo_dictamen.value if cambio.tipo_dictamen else None,
                dictamen_detalle=cambio.dictamen_detalle,
                dias_en_estado_anterior=dias_en_estado
            )
            db.add(historial)
            
            # Actualizar estado actual
            solicitud.estado_actual = cambio.estado_nuevo
            solicitud.updated_at = datetime.now()
            
            # Si es estado final con resolución, actualizar fecha
            if nuevo_estado.es_final:
                solicitud.fecha_resolucion = date.today()
            
            db.commit()
            db.refresh(solicitud)
            
            logger.info(f"Estado actualizado exitosamente")
            return solicitud
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error cambiando estado: {str(e)}")
            raise PPSHBusinessException(f"Error cambiando estado: {str(e)}")
    
    @staticmethod
    def get_estadisticas(db: Session) -> EstadisticasGenerales:
        """Obtiene estadísticas generales del sistema PPSH"""
        
        # Totales básicos
        total_solicitudes = db.query(func.count(models_ppsh.PPSHSolicitud.id_solicitud)).scalar()
        solicitudes_activas = db.query(func.count(models_ppsh.PPSHSolicitud.id_solicitud)).filter(
            models_ppsh.PPSHSolicitud.activo == True
        ).scalar()
        
        # Estados finales
        estados_finales = db.query(models_ppsh.PPSHEstado.cod_estado).filter(
            models_ppsh.PPSHEstado.es_final == True
        ).all()
        codigos_finales = [e[0] for e in estados_finales]
        
        solicitudes_aprobadas = db.query(func.count(models_ppsh.PPSHSolicitud.id_solicitud)).filter(
            models_ppsh.PPSHSolicitud.estado_actual == "APROBADO"
        ).scalar()
        
        solicitudes_rechazadas = db.query(func.count(models_ppsh.PPSHSolicitud.id_solicitud)).filter(
            models_ppsh.PPSHSolicitud.estado_actual == "RECHAZADO"
        ).scalar()
        
        solicitudes_en_proceso = db.query(func.count(models_ppsh.PPSHSolicitud.id_solicitud)).filter(
            and_(
                models_ppsh.PPSHSolicitud.activo == True,
                ~models_ppsh.PPSHSolicitud.estado_actual.in_(codigos_finales)
            )
        ).scalar()
        
        # Promedio de días de procesamiento (solicitudes finalizadas)
        promedio_dias_result = db.execute(
            text("""
                SELECT AVG(DATEDIFF(day, fecha_solicitud, fecha_resolucion))
                FROM PPSH_SOLICITUD
                WHERE fecha_resolucion IS NOT NULL
            """)
        ).scalar()
        promedio_dias = float(promedio_dias_result) if promedio_dias_result else None
        
        # Estadísticas por estado
        stats_result = db.execute(
            text("""
                SELECT 
                    e.cod_estado,
                    e.nombre_estado,
                    e.color_hex,
                    COUNT(s.id_solicitud) as total,
                    AVG(DATEDIFF(day, s.fecha_solicitud, GETDATE())) as promedio_dias
                FROM PPSH_ESTADO e
                LEFT JOIN PPSH_SOLICITUD s ON e.cod_estado = s.estado_actual AND s.activo = 1
                GROUP BY e.cod_estado, e.nombre_estado, e.color_hex, e.orden
                ORDER BY e.orden
            """)
        ).fetchall()
        
        stats_por_estado = [
            EstadisticasPorEstado(
                cod_estado=row[0],
                nombre_estado=row[1],
                color_hex=row[2],
                total_solicitudes=row[3] or 0,
                promedio_dias=float(row[4]) if row[4] else None
            )
            for row in stats_result
        ]
        
        return EstadisticasGenerales(
            total_solicitudes=total_solicitudes or 0,
            solicitudes_activas=solicitudes_activas or 0,
            solicitudes_aprobadas=solicitudes_aprobadas or 0,
            solicitudes_rechazadas=solicitudes_rechazadas or 0,
            solicitudes_en_proceso=solicitudes_en_proceso or 0,
            promedio_dias_procesamiento=float(promedio_dias) if promedio_dias else None,
            por_estado=stats_por_estado
        )


# ==========================================
# SERVICIO DE DOCUMENTOS
# ==========================================

class DocumentoService:
    """Servicio para manejar documentos de solicitudes"""
    
    @staticmethod
    def listar_documentos(
        db: Session,
        id_solicitud: int
    ) -> List[models_ppsh.PPSHDocumento]:
        """Lista todos los documentos de una solicitud con información de OCR"""
        
        # Validar que existe la solicitud
        SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        
        logger.info(f"Listando documentos para solicitud {id_solicitud}")
        
        # Eager load de la relación ocr_results para evitar N+1 queries
        from sqlalchemy.orm import joinedload
        
        documentos = db.query(models_ppsh.PPSHDocumento).options(
            joinedload(models_ppsh.PPSHDocumento.ocr_results)
        ).filter(
            models_ppsh.PPSHDocumento.id_solicitud == id_solicitud
        ).order_by(models_ppsh.PPSHDocumento.uploaded_at.desc()).all()
        
        return documentos
    
    @staticmethod
    def actualizar_estado_ocr_documentos(
        db: Session,
        documentos_update: List[dict],
        id_solicitud: int = None
    ) -> dict:
        """
        Actualiza el estado OCR de múltiples documentos.
        Si se proporciona id_solicitud, verifica si todos los documentos tienen OCR exitoso
        para marcar la etapa de revisión OCR como completada.
        
        Args:
            db: Sesión de base de datos
            documentos_update: Lista de dicts con {id_documento, ocr_exitoso}
            id_solicitud: ID de la solicitud (opcional, para verificar completitud)
            
        Returns:
            Dict con: {
                'documentos_actualizados': int,
                'revision_ocr_completada': bool,
                'total_documentos': int,
                'documentos_con_ocr': int
            }
        """
        from app.models.models_ocr import PPSHDocumentoOCR
        
        logger.info(f"Actualizando estado OCR de {len(documentos_update)} documentos")
        
        count = 0
        for doc_data in documentos_update:
            id_documento = doc_data['id_documento']
            ocr_exitoso = doc_data['ocr_exitoso']
            
            # Verificar que el documento existe
            documento = db.query(models_ppsh.PPSHDocumento).filter(
                models_ppsh.PPSHDocumento.id_documento == id_documento
            ).first()
            
            if not documento:
                logger.warning(f"Documento {id_documento} no encontrado")
                continue
            
            # Buscar o crear registro OCR
            ocr_record = db.query(PPSHDocumentoOCR).filter(
                PPSHDocumentoOCR.id_documento == id_documento
            ).order_by(PPSHDocumentoOCR.created_at.desc()).first()
            
            if ocr_record:
                # Actualizar registro existente
                if ocr_exitoso:
                    ocr_record.estado_ocr = 'COMPLETADO'
                    # Siempre actualizar confianza a 100.0 por revisión manual
                    ocr_record.texto_confianza = 100.0
                else:
                    ocr_record.estado_ocr = 'PENDIENTE'
                    ocr_record.texto_confianza = None
            else:
                # Crear nuevo registro OCR si no existe
                if ocr_exitoso:
                    nuevo_ocr = PPSHDocumentoOCR(
                        id_documento=id_documento,
                        estado_ocr='COMPLETADO',
                        texto_confianza=100.0,  # Revisión manual = máxima confianza
                        created_by='MANUAL_REVIEW',
                        created_at=datetime.now()
                    )
                    db.add(nuevo_ocr)
            
            count += 1
        
        db.commit()
        logger.info(f"Se actualizaron {count} documentos correctamente")
        
        # Verificar si todos los documentos de la solicitud tienen OCR exitoso
        resultado = {
            'documentos_actualizados': count,
            'revision_ocr_completada': False,
            'total_documentos': 0,
            'documentos_con_ocr': 0
        }
        
        if id_solicitud:
            # Obtener todos los documentos de la solicitud
            todos_documentos = db.query(models_ppsh.PPSHDocumento).filter(
                models_ppsh.PPSHDocumento.id_solicitud == id_solicitud
            ).all()
            
            resultado['total_documentos'] = len(todos_documentos)
            
            # Contar documentos con OCR exitoso
            documentos_con_ocr_exitoso = 0
            for doc in todos_documentos:
                ocr_record = db.query(PPSHDocumentoOCR).filter(
                    PPSHDocumentoOCR.id_documento == doc.id_documento
                ).order_by(PPSHDocumentoOCR.created_at.desc()).first()
                
                if ocr_record and ocr_record.estado_ocr == 'COMPLETADO' and ocr_record.texto_confianza and ocr_record.texto_confianza >= 70.0:
                    documentos_con_ocr_exitoso += 1
            
            resultado['documentos_con_ocr'] = documentos_con_ocr_exitoso
            
            # Todos los documentos tienen OCR exitoso?
            if resultado['total_documentos'] > 0 and documentos_con_ocr_exitoso == resultado['total_documentos']:
                resultado['revision_ocr_completada'] = True
                logger.info(f"✅ Todos los documentos de la solicitud {id_solicitud} tienen OCR exitoso - Etapa 1.7 COMPLETADA")
                
                # Actualizar etapa 1.7 a COMPLETADO
                try:
                    PPSHEtapaService.actualizar_estado_etapa(
                        db=db,
                        id_solicitud=id_solicitud,
                        codigo_etapa='1.7',
                        nuevo_estado='COMPLETADO',
                        completado_por='SISTEMA_OCR',
                        observaciones='Todos los documentos procesados exitosamente por OCR'
                    )
                except Exception as e:
                    logger.warning(f"No se pudo actualizar etapa 1.7: {str(e)}")
        
        return resultado
    
    @staticmethod
    def registrar_documento(
        db: Session,
        id_solicitud: int,
        documento_data: DocumentoCreate,
        tamano_bytes: int,
        uploaded_by: str
    ) -> models_ppsh.PPSHDocumento:
        """Registra un documento en una solicitud"""
        
        # Validar que existe la solicitud
        SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        
        logger.info(f"Registrando documento {documento_data.nombre_archivo} para solicitud {id_solicitud}")
        
        documento = models_ppsh.PPSHDocumento(
            id_solicitud=id_solicitud,
            cod_tipo_documento=documento_data.cod_tipo_documento,
            tipo_documento_texto=documento_data.tipo_documento_texto,
            nombre_archivo=documento_data.nombre_archivo,
            extension=documento_data.extension,
            tamano_bytes=tamano_bytes,
            estado_verificacion="PENDIENTE",
            uploaded_by=uploaded_by,
            uploaded_at=datetime.now(),
            observaciones=documento_data.observaciones
        )
        
        db.add(documento)
        db.commit()
        db.refresh(documento)
        
        return documento
    
    @staticmethod
    def verificar_documento(
        db: Session,
        id_documento: int,
        estado: str,
        verificado_por: str,
        observaciones: Optional[str] = None
    ) -> models_ppsh.PPSHDocumento:
        """Verifica un documento"""
        documento = db.query(models_ppsh.PPSHDocumento).filter(
            models_ppsh.PPSHDocumento.id_documento == id_documento
        ).first()
        
        if not documento:
            raise PPSHNotFoundException("Documento", str(id_documento))
        
        logger.info(f"Verificando documento {id_documento} con estado {estado}")
        
        documento.estado_verificacion = estado
        documento.verificado_por = verificado_por
        documento.fecha_verificacion = datetime.now()
        if observaciones:
            documento.observaciones = observaciones
        
        db.commit()
        db.refresh(documento)
        
        return documento


# ==========================================
# SERVICIO DE ENTREVISTAS
# ==========================================

class EntrevistaService:
    """Servicio para manejar entrevistas"""
    
    @staticmethod
    def programar_entrevista(
        db: Session,
        id_solicitud: int,
        entrevista_data: EntrevistaCreate,
        user_id: str
    ) -> models_ppsh.PPSHEntrevista:
        """Programa una entrevista para una solicitud"""
        
        # Validar que existe la solicitud
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        
        logger.info(f"Programando entrevista para solicitud {solicitud.num_expediente}")
        
        entrevista = models_ppsh.PPSHEntrevista(
            id_solicitud=id_solicitud,
            fecha_programada=entrevista_data.fecha_programada,
            lugar=entrevista_data.lugar,
            cod_agencia=entrevista_data.cod_agencia,
            entrevistador_user_id=entrevista_data.entrevistador_user_id,
            resultado="PENDIENTE",
            observaciones=entrevista_data.observaciones,
            requiere_segunda_entrevista=False
        )
        
        db.add(entrevista)
        
        # Registrar comentario
        comentario = models_ppsh.PPSHComentario(
            id_solicitud=id_solicitud,
            user_id=user_id,
            comentario=f"Entrevista programada para {entrevista_data.fecha_programada}",
            es_interno=True
        )
        db.add(comentario)
        
        db.commit()
        db.refresh(entrevista)
        
        return entrevista
    
    @staticmethod
    def registrar_resultado(
        db: Session,
        id_entrevista: int,
        entrevista_data: EntrevistaUpdate,
        user_id: str
    ) -> models_ppsh.PPSHEntrevista:
        """Registra el resultado de una entrevista"""
        entrevista = db.query(models_ppsh.PPSHEntrevista).filter(
            models_ppsh.PPSHEntrevista.id_entrevista == id_entrevista
        ).first()
        
        if not entrevista:
            raise PPSHNotFoundException("Entrevista", str(id_entrevista))
        
        logger.info(f"Registrando resultado de entrevista {id_entrevista}")
        
        # Actualizar campos
        update_data = entrevista_data.model_dump(exclude_unset=True)
        for campo, valor in update_data.items():
            if hasattr(entrevista, campo):
                setattr(entrevista, campo, valor)
        
        entrevista.updated_at = datetime.now()
        
        # Registrar comentario si cambió resultado
        if entrevista_data.resultado:
            comentario = models_ppsh.PPSHComentario(
                id_solicitud=entrevista.id_solicitud,
                user_id=user_id,
                comentario=f"Resultado de entrevista: {entrevista_data.resultado}",
                es_interno=True
            )
            db.add(comentario)
        
        db.commit()
        db.refresh(entrevista)
        
        return entrevista


# ==========================================
# SERVICIO DE COMENTARIOS
# ==========================================

class PPSHComentarioService:
    """Servicio para manejar comentarios de PPSH"""
    
    @staticmethod
    def crear_comentario(
        db: Session,
        id_solicitud: int,
        comentario_data: ComentarioCreate,
        user_id: str
    ) -> models_ppsh.PPSHComentario:
        """Crea un nuevo comentario en una solicitud"""
        
        # Validar que existe la solicitud
        SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        
        logger.info(f"Agregando comentario a solicitud {id_solicitud}")
        
        comentario = models_ppsh.PPSHComentario(
            id_solicitud=id_solicitud,
            user_id=user_id,
            comentario=comentario_data.comentario,
            es_interno=comentario_data.es_interno
        )
        
        db.add(comentario)
        db.commit()
        db.refresh(comentario)
        
        return comentario
    
    @staticmethod
    def listar_comentarios(
        db: Session,
        id_solicitud: int,
        incluir_internos: bool = True
    ) -> List[models_ppsh.PPSHComentario]:
        """Lista comentarios de una solicitud"""
        query = db.query(models_ppsh.PPSHComentario).filter(
            models_ppsh.PPSHComentario.id_solicitud == id_solicitud
        )
        
        if not incluir_internos:
            query = query.filter(models_ppsh.PPSHComentario.es_interno == False)
        
        return query.order_by(models_ppsh.PPSHComentario.created_at).all()


# ==========================================
# SERVICIO DE ETAPAS
# ==========================================

class PPSHEtapaService:
    """Servicio para gestión de etapas de solicitudes PPSH"""
    
    @staticmethod
    def obtener_etapas_solicitud(
        db: Session,
        id_solicitud: int
    ) -> List[models_ppsh.PPSHEtapaSolicitud]:
        """
        Obtiene todas las etapas de una solicitud ordenadas por orden.
        Si la solicitud no tiene etapas, las crea automáticamente.
        """
        # Verificar que la solicitud existe
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        
        # Obtener etapas existentes
        etapas = db.query(models_ppsh.PPSHEtapaSolicitud).filter(
            models_ppsh.PPSHEtapaSolicitud.id_solicitud == id_solicitud
        ).order_by(models_ppsh.PPSHEtapaSolicitud.orden).all()
        
        # Si no hay etapas, crearlas
        if not etapas:
            logger.info(f"Creando etapas por defecto para solicitud {id_solicitud}")
            etapas = PPSHEtapaService._crear_etapas_por_defecto(db, id_solicitud)
        
        return etapas
    
    @staticmethod
    def _crear_etapas_por_defecto(
        db: Session,
        id_solicitud: int
    ) -> List[models_ppsh.PPSHEtapaSolicitud]:
        """Crea las etapas por defecto para una solicitud"""
        etapas_config = [
            {
                'codigo_etapa': '1.2',
                'nombre_etapa': 'Recolectar requisitos del trámite PPSH y los anexo en el sistema',
                'estado': 'COMPLETADO',  # Se asume que si llegó aquí, ya tiene documentos
                'orden': 1
            },
            {
                'codigo_etapa': '1.7',
                'nombre_etapa': 'Revisados requisitos vs checklist en Sistema, completa control de cita, valida # caso, registro',
                'estado': 'PENDIENTE',
                'orden': 2
            }
        ]
        
        etapas_creadas = []
        for config in etapas_config:
            nueva_etapa = models_ppsh.PPSHEtapaSolicitud(
                id_solicitud=id_solicitud,
                **config,
                created_at=datetime.now()
            )
            db.add(nueva_etapa)
            etapas_creadas.append(nueva_etapa)
        
        db.commit()
        
        # Refrescar para obtener IDs
        for etapa in etapas_creadas:
            db.refresh(etapa)
        
        return etapas_creadas
    
    @staticmethod
    def actualizar_estado_etapa(
        db: Session,
        id_solicitud: int,
        codigo_etapa: str,
        nuevo_estado: str,
        completado_por: Optional[str] = None,
        observaciones: Optional[str] = None
    ) -> models_ppsh.PPSHEtapaSolicitud:
        """
        Actualiza el estado de una etapa específica.
        Si el estado es COMPLETADO, marca la fecha de completado.
        """
        etapa = db.query(models_ppsh.PPSHEtapaSolicitud).filter(
            models_ppsh.PPSHEtapaSolicitud.id_solicitud == id_solicitud,
            models_ppsh.PPSHEtapaSolicitud.codigo_etapa == codigo_etapa
        ).first()
        
        if not etapa:
            # Si no existe la etapa, crearla
            logger.info(f"Etapa {codigo_etapa} no existe para solicitud {id_solicitud}, creando...")
            etapa = models_ppsh.PPSHEtapaSolicitud(
                id_solicitud=id_solicitud,
                codigo_etapa=codigo_etapa,
                nombre_etapa=f"Etapa {codigo_etapa}",
                estado=nuevo_estado,
                orden=999,  # Orden temporal
                created_at=datetime.now()
            )
            db.add(etapa)
        
        # Actualizar estado
        estado_anterior = etapa.estado
        etapa.estado = nuevo_estado
        
        if observaciones:
            etapa.observaciones = observaciones
        
        # Si cambió a COMPLETADO, marcar fecha
        if nuevo_estado == 'COMPLETADO' and estado_anterior != 'COMPLETADO':
            etapa.fecha_completado = datetime.now()
            if completado_por:
                etapa.completado_por = completado_por
            logger.info(f"✅ Etapa {codigo_etapa} de solicitud {id_solicitud} marcada como COMPLETADA")
        
        # Si cambió a EN_PROCESO por primera vez, marcar fecha de inicio
        if nuevo_estado == 'EN_PROCESO' and not etapa.fecha_inicio:
            etapa.fecha_inicio = datetime.now()
        
        etapa.updated_at = datetime.now()
        
        db.commit()
        db.refresh(etapa)
        
        return etapa
