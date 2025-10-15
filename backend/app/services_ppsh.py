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
from sqlalchemy import func, and_, or_, desc, extract
from typing import List, Optional, Dict, Tuple
from datetime import datetime, date, timedelta
from fastapi import HTTPException, status
import logging

from app.models_ppsh import (
    PPSHSolicitud, PPSHSolicitante, PPSHDocumento, PPSHEstadoHistorial,
    PPSHEntrevista, PPSHComentario, PPSHCausaHumanitaria, PPSHTipoDocumento,
    PPSHEstado
)
from app.schemas_ppsh import (
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
    def get_causas_humanitarias(db: Session, activos_solo: bool = True) -> List[PPSHCausaHumanitaria]:
        """Obtiene todas las causas humanitarias"""
        query = db.query(PPSHCausaHumanitaria)
        if activos_solo:
            query = query.filter(PPSHCausaHumanitaria.activo == True)
        return query.order_by(PPSHCausaHumanitaria.nombre_causa).all()
    
    @staticmethod
    def get_tipos_documento(db: Session, activos_solo: bool = True) -> List[PPSHTipoDocumento]:
        """Obtiene todos los tipos de documento"""
        query = db.query(PPSHTipoDocumento)
        if activos_solo:
            query = query.filter(PPSHTipoDocumento.activo == True)
        return query.order_by(PPSHTipoDocumento.orden).all()
    
    @staticmethod
    def get_estados(db: Session, activos_solo: bool = True) -> List[PPSHEstado]:
        """Obtiene todos los estados posibles"""
        query = db.query(PPSHEstado)
        if activos_solo:
            query = query.filter(PPSHEstado.activo == True)
        return query.order_by(PPSHEstado.orden).all()
    
    @staticmethod
    def get_estado_by_codigo(db: Session, codigo: str) -> PPSHEstado:
        """Obtiene un estado por código"""
        estado = db.query(PPSHEstado).filter(PPSHEstado.cod_estado == codigo).first()
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
            db.query(PPSHSolicitud)
            .filter(PPSHSolicitud.num_expediente.like(f"{prefijo}%"))
            .order_by(desc(PPSHSolicitud.num_expediente))
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
    ) -> PPSHSolicitud:
        """Crea una nueva solicitud PPSH con sus solicitantes"""
        logger.info(f"Creando solicitud PPSH por usuario {user_id}")
        
        # Validar que existe la causa humanitaria
        causa = db.query(PPSHCausaHumanitaria).filter(
            PPSHCausaHumanitaria.cod_causa == solicitud_data.cod_causa_humanitaria,
            PPSHCausaHumanitaria.activo == True
        ).first()
        
        if not causa:
            raise PPSHBusinessException(
                f"Causa humanitaria {solicitud_data.cod_causa_humanitaria} no existe o está inactiva"
            )
        
        try:
            # Crear solicitud principal
            solicitud = PPSHSolicitud(
                num_expediente=SolicitudService._generar_numero_expediente(db),
                fecha_solicitud=date.today(),
                tipo_solicitud=solicitud_data.tipo_solicitud.value,
                cod_causa_humanitaria=solicitud_data.cod_causa_humanitaria,
                descripcion_caso=solicitud_data.descripcion_caso,
                prioridad=solicitud_data.prioridad.value,
                estado_actual="RECEPCION",
                cod_agencia=solicitud_data.cod_agencia,
                cod_seccion=solicitud_data.cod_seccion,
                observaciones_generales=solicitud_data.observaciones_generales,
                activo=True
            )
            
            db.add(solicitud)
            db.flush()  # Obtener ID sin hacer commit
            
            # Crear solicitantes
            for idx, sol_data in enumerate(solicitud_data.solicitantes):
                solicitante = PPSHSolicitante(
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
            historial = PPSHEstadoHistorial(
                id_solicitud=solicitud.id_solicitud,
                estado_anterior=None,
                estado_nuevo="RECEPCION",
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
    ) -> PPSHSolicitud:
        """Obtiene una solicitud por ID con sus relaciones"""
        query = db.query(PPSHSolicitud).filter(PPSHSolicitud.id_solicitud == id_solicitud)
        
        if incluir_relaciones:
            query = query.options(
                joinedload(PPSHSolicitud.causa_humanitaria),
                joinedload(PPSHSolicitud.estado),
                selectinload(PPSHSolicitud.solicitantes),
                selectinload(PPSHSolicitud.documentos),
                selectinload(PPSHSolicitud.historial_estados),
                selectinload(PPSHSolicitud.entrevistas),
                selectinload(PPSHSolicitud.comentarios)
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
    ) -> Tuple[List[PPSHSolicitud], int]:
        """Lista solicitudes con filtros y paginación"""
        query = db.query(PPSHSolicitud).filter(PPSHSolicitud.activo == True)
        
        # Si no es admin, solo ve sus solicitudes asignadas
        if not es_admin and user_id:
            query = query.filter(PPSHSolicitud.user_id_asignado == user_id)
        
        # Aplicar filtros
        if filtros:
            if filtros.estado:
                query = query.filter(PPSHSolicitud.estado_actual == filtros.estado)
            
            if filtros.prioridad:
                query = query.filter(PPSHSolicitud.prioridad == filtros.prioridad.value)
            
            if filtros.causa_humanitaria:
                query = query.filter(PPSHSolicitud.cod_causa_humanitaria == filtros.causa_humanitaria)
            
            if filtros.fecha_desde:
                query = query.filter(PPSHSolicitud.fecha_solicitud >= filtros.fecha_desde)
            
            if filtros.fecha_hasta:
                query = query.filter(PPSHSolicitud.fecha_solicitud <= filtros.fecha_hasta)
            
            if filtros.agencia:
                query = query.filter(PPSHSolicitud.cod_agencia == filtros.agencia)
            
            if filtros.asignado_a:
                query = query.filter(PPSHSolicitud.user_id_asignado == filtros.asignado_a)
            
            if filtros.buscar:
                # Búsqueda en múltiples campos
                buscar_like = f"%{filtros.buscar}%"
                query = query.join(PPSHSolicitud.solicitantes).filter(
                    or_(
                        PPSHSolicitud.num_expediente.like(buscar_like),
                        PPSHSolicitante.primer_nombre.like(buscar_like),
                        PPSHSolicitante.primer_apellido.like(buscar_like),
                        PPSHSolicitante.num_documento.like(buscar_like)
                    )
                )
        
        # Contar total
        total = query.count()
        
        # Aplicar paginación y ordenar
        query = query.order_by(desc(PPSHSolicitud.fecha_solicitud))
        query = query.offset((page - 1) * page_size).limit(page_size)
        
        # Cargar relaciones necesarias para listado
        query = query.options(
            joinedload(PPSHSolicitud.causa_humanitaria),
            joinedload(PPSHSolicitud.estado),
            selectinload(PPSHSolicitud.solicitantes).filter(PPSHSolicitante.es_titular == True)
        )
        
        solicitudes = query.all()
        
        return solicitudes, total
    
    @staticmethod
    def actualizar_solicitud(
        db: Session,
        id_solicitud: int,
        solicitud_data: SolicitudUpdate,
        user_id: str
    ) -> PPSHSolicitud:
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
    ) -> PPSHSolicitud:
        """Asigna una solicitud a un funcionario"""
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        
        logger.info(f"Asignando solicitud {solicitud.num_expediente} a {user_id_asignado}")
        
        solicitud.user_id_asignado = user_id_asignado
        solicitud.fecha_asignacion = datetime.now()
        solicitud.updated_at = datetime.now()
        
        # Registrar en comentarios
        comentario = PPSHComentario(
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
    ) -> PPSHSolicitud:
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
                db.query(PPSHEstadoHistorial)
                .filter(PPSHEstadoHistorial.id_solicitud == id_solicitud)
                .order_by(desc(PPSHEstadoHistorial.fecha_cambio))
                .first()
            )
            
            dias_en_estado = None
            if ultimo_cambio:
                dias_en_estado = (datetime.now() - ultimo_cambio.fecha_cambio).days
            
            # Crear registro en historial
            historial = PPSHEstadoHistorial(
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
        total_solicitudes = db.query(func.count(PPSHSolicitud.id_solicitud)).scalar()
        solicitudes_activas = db.query(func.count(PPSHSolicitud.id_solicitud)).filter(
            PPSHSolicitud.activo == True
        ).scalar()
        
        # Estados finales
        estados_finales = db.query(PPSHEstado.cod_estado).filter(
            PPSHEstado.es_final == True
        ).all()
        codigos_finales = [e[0] for e in estados_finales]
        
        solicitudes_aprobadas = db.query(func.count(PPSHSolicitud.id_solicitud)).filter(
            PPSHSolicitud.estado_actual == "APROBADO"
        ).scalar()
        
        solicitudes_rechazadas = db.query(func.count(PPSHSolicitud.id_solicitud)).filter(
            PPSHSolicitud.estado_actual == "RECHAZADO"
        ).scalar()
        
        solicitudes_en_proceso = db.query(func.count(PPSHSolicitud.id_solicitud)).filter(
            and_(
                PPSHSolicitud.activo == True,
                ~PPSHSolicitud.estado_actual.in_(codigos_finales)
            )
        ).scalar()
        
        # Promedio de días de procesamiento (solicitudes finalizadas)
        promedio_dias = db.query(
            func.avg(
                func.datediff(
                    'day',
                    PPSHSolicitud.fecha_solicitud,
                    PPSHSolicitud.fecha_resolucion
                )
            )
        ).filter(
            PPSHSolicitud.fecha_resolucion.isnot(None)
        ).scalar()
        
        # Estadísticas por estado
        stats_por_estado = (
            db.query(
                PPSHEstado.cod_estado,
                PPSHEstado.nombre_estado,
                PPSHEstado.color_hex,
                func.count(PPSHSolicitud.id_solicitud).label('total'),
                func.avg(
                    func.datediff(
                        'day',
                        PPSHSolicitud.fecha_solicitud,
                        func.current_date()
                    )
                ).label('promedio_dias')
            )
            .join(PPSHSolicitud, PPSHEstado.cod_estado == PPSHSolicitud.estado_actual)
            .filter(PPSHSolicitud.activo == True)
            .group_by(PPSHEstado.cod_estado, PPSHEstado.nombre_estado, PPSHEstado.color_hex)
            .order_by(PPSHEstado.orden)
            .all()
        )
        
        return EstadisticasGenerales(
            total_solicitudes=total_solicitudes or 0,
            solicitudes_activas=solicitudes_activas or 0,
            solicitudes_aprobadas=solicitudes_aprobadas or 0,
            solicitudes_rechazadas=solicitudes_rechazadas or 0,
            solicitudes_en_proceso=solicitudes_en_proceso or 0,
            promedio_dias_procesamiento=float(promedio_dias) if promedio_dias else None,
            por_estado=[
                EstadisticasPorEstado(
                    cod_estado=stat.cod_estado,
                    nombre_estado=stat.nombre_estado,
                    color_hex=stat.color_hex,
                    total_solicitudes=stat.total,
                    promedio_dias=float(stat.promedio_dias) if stat.promedio_dias else None
                )
                for stat in stats_por_estado
            ]
        )


# ==========================================
# SERVICIO DE DOCUMENTOS
# ==========================================

class DocumentoService:
    """Servicio para manejar documentos de solicitudes"""
    
    @staticmethod
    def registrar_documento(
        db: Session,
        id_solicitud: int,
        documento_data: DocumentoCreate,
        tamano_bytes: int,
        uploaded_by: str
    ) -> PPSHDocumento:
        """Registra un documento en una solicitud"""
        
        # Validar que existe la solicitud
        SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        
        logger.info(f"Registrando documento {documento_data.nombre_archivo} para solicitud {id_solicitud}")
        
        documento = PPSHDocumento(
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
    ) -> PPSHDocumento:
        """Verifica un documento"""
        documento = db.query(PPSHDocumento).filter(
            PPSHDocumento.id_documento == id_documento
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
    ) -> PPSHEntrevista:
        """Programa una entrevista para una solicitud"""
        
        # Validar que existe la solicitud
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        
        logger.info(f"Programando entrevista para solicitud {solicitud.num_expediente}")
        
        entrevista = PPSHEntrevista(
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
        comentario = PPSHComentario(
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
    ) -> PPSHEntrevista:
        """Registra el resultado de una entrevista"""
        entrevista = db.query(PPSHEntrevista).filter(
            PPSHEntrevista.id_entrevista == id_entrevista
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
            comentario = PPSHComentario(
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

class ComentarioService:
    """Servicio para manejar comentarios"""
    
    @staticmethod
    def crear_comentario(
        db: Session,
        id_solicitud: int,
        comentario_data: ComentarioCreate,
        user_id: str
    ) -> PPSHComentario:
        """Crea un nuevo comentario en una solicitud"""
        
        # Validar que existe la solicitud
        SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        
        logger.info(f"Agregando comentario a solicitud {id_solicitud}")
        
        comentario = PPSHComentario(
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
    ) -> List[PPSHComentario]:
        """Lista comentarios de una solicitud"""
        query = db.query(PPSHComentario).filter(
            PPSHComentario.id_solicitud == id_solicitud
        )
        
        if not incluir_internos:
            query = query.filter(PPSHComentario.es_interno == False)
        
        return query.order_by(PPSHComentario.created_at).all()
