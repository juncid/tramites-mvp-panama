"""
Servicio de Ejecución de Workflows para Usuarios
Sistema de Trámites Migratorios de Panamá

Gestiona la ejecución de workflows desde la perspectiva del usuario:
- Filtrado de etapas por perfil
- Estado del workflow para una instancia
- Ejecución de etapas con validaciones
- Transiciones entre etapas

Author: Sistema de Trámites MVP Panamá
Date: 2025-11-18
"""

from sqlalchemy.orm import Session, joinedload
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from datetime import datetime
import logging

from app.models import models_workflow as models

logger = logging.getLogger(__name__)


class WorkflowExecutionService:
    """Servicio para ejecución de workflows por usuarios"""

    @staticmethod
    def obtener_etapas_por_perfil(
        db: Session,
        workflow_id: int,
        perfil: str
    ) -> List[models.WorkflowEtapa]:
        """
        Obtiene las etapas de un workflow filtradas por perfil de usuario.
        Solo retorna etapas donde el perfil está en perfiles_permitidos.
        
        Args:
            db: Sesión de base de datos
            workflow_id: ID del workflow
            perfil: Perfil del usuario (ej: "CIUDADANO", "FUNCIONARIO")
            
        Returns:
            Lista de etapas accesibles para el perfil
        """
        logger.info(f"Obteniendo etapas del workflow {workflow_id} para perfil {perfil}")

        # Verificar que el workflow existe
        workflow = db.query(models.Workflow).filter(
            models.Workflow.id == workflow_id,
            models.Workflow.activo == True
        ).first()

        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow con id {workflow_id} no encontrado"
            )

        # Obtener todas las etapas activas del workflow
        etapas = db.query(models.WorkflowEtapa).options(
            joinedload(models.WorkflowEtapa.preguntas)
        ).filter(
            models.WorkflowEtapa.workflow_id == workflow_id,
            models.WorkflowEtapa.activo == True
        ).order_by(models.WorkflowEtapa.orden).all()

        # Filtrar etapas por perfil
        etapas_filtradas = []
        for etapa in etapas:
            # Si perfiles_permitidos es None o vacío, la etapa es accesible para todos
            if not etapa.perfiles_permitidos:
                etapas_filtradas.append(etapa)
            # Si el perfil está en la lista de perfiles permitidos
            elif isinstance(etapa.perfiles_permitidos, list) and perfil in etapa.perfiles_permitidos:
                etapas_filtradas.append(etapa)

        logger.info(f"Encontradas {len(etapas_filtradas)} etapas de {len(etapas)} totales para perfil {perfil}")
        return etapas_filtradas

    @staticmethod
    def obtener_estado_workflow(
        db: Session,
        instancia_id: int,
        perfil: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Obtiene el estado completo del workflow para una instancia.
        
        Args:
            db: Sesión de base de datos
            instancia_id: ID de la instancia de workflow
            perfil: Perfil del usuario (opcional, para filtrar etapas)
            
        Returns:
            Diccionario con estado del workflow, etapa actual, etapas completadas, progreso
        """
        logger.info(f"Obteniendo estado del workflow para instancia {instancia_id}")

        # Obtener la instancia con sus relaciones
        instancia = db.query(models.WorkflowInstancia).options(
            joinedload(models.WorkflowInstancia.workflow).joinedload(models.Workflow.etapas),
            joinedload(models.WorkflowInstancia.etapa_actual),
            joinedload(models.WorkflowInstancia.respuestas_etapa).joinedload(models.WorkflowRespuestaEtapa.respuestas)
        ).filter(
            models.WorkflowInstancia.id == instancia_id,
            models.WorkflowInstancia.activo == True
        ).first()

        if not instancia:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Instancia con id {instancia_id} no encontrada"
            )

        # Obtener etapas completadas
        etapas_completadas_ids = [
            resp_etapa.etapa_id
            for resp_etapa in instancia.respuestas_etapa
            if resp_etapa.completada
        ]

        # Obtener todas las etapas del workflow
        todas_etapas = instancia.workflow.etapas

        # Filtrar por perfil si se proporciona
        if perfil:
            etapas_visibles = [
                etapa for etapa in todas_etapas
                if not etapa.perfiles_permitidos or perfil in etapa.perfiles_permitidos
            ]
        else:
            etapas_visibles = todas_etapas

        # Calcular progreso
        total_etapas = len(todas_etapas)
        completadas = len(etapas_completadas_ids)
        porcentaje = (completadas / total_etapas * 100) if total_etapas > 0 else 0

        # Construir respuestas por etapa
        respuestas_dict = {}
        for resp_etapa in instancia.respuestas_etapa:
            respuestas_etapa = {}
            for respuesta in resp_etapa.respuestas:
                pregunta_codigo = respuesta.pregunta.codigo if respuesta.pregunta else str(respuesta.pregunta_id)
                # Determinar el valor según el tipo
                if respuesta.valor_json is not None:
                    valor = respuesta.valor_json
                elif respuesta.valor_fecha is not None:
                    valor = respuesta.valor_fecha.isoformat()
                elif respuesta.valor_booleano is not None:
                    valor = respuesta.valor_booleano
                else:
                    valor = respuesta.valor_texto

                respuestas_etapa[pregunta_codigo] = valor

            respuestas_dict[str(resp_etapa.etapa_id)] = respuestas_etapa

        estado = {
            "instancia_id": instancia.id,
            "workflow_id": instancia.workflow_id,
            "num_expediente": instancia.num_expediente,
            "estado": instancia.estado.value,
            "etapa_actual": {
                "id": instancia.etapa_actual.id,
                "codigo": instancia.etapa_actual.codigo,
                "nombre": instancia.etapa_actual.nombre,
                "tipo_etapa": instancia.etapa_actual.tipo_etapa.value
            } if instancia.etapa_actual else None,
            "etapas_completadas": etapas_completadas_ids,
            "etapas_visibles": [
                {
                    "id": etapa.id,
                    "codigo": etapa.codigo,
                    "nombre": etapa.nombre,
                    "orden": etapa.orden,
                    "tipo_etapa": etapa.tipo_etapa.value,
                    "completada": etapa.id in etapas_completadas_ids,
                    "es_actual": etapa.id == instancia.etapa_actual_id
                }
                for etapa in etapas_visibles
            ],
            "progreso": {
                "total_etapas": total_etapas,
                "completadas": completadas,
                "porcentaje": round(porcentaje, 2)
            },
            "respuestas": respuestas_dict,
            "fecha_inicio": instancia.fecha_inicio.isoformat(),
            "fecha_estimada_fin": instancia.fecha_estimada_fin.isoformat() if instancia.fecha_estimada_fin else None,
            "fecha_fin": instancia.fecha_fin.isoformat() if instancia.fecha_fin else None,
            "creado_por": instancia.creado_por_user_id,
            "asignado_a": instancia.asignado_a_user_id
        }

        logger.info(f"Estado del workflow calculado: {completadas}/{total_etapas} etapas completadas")
        return estado

    @staticmethod
    def validar_permiso_etapa(
        etapa: models.WorkflowEtapa,
        perfil: str
    ) -> bool:
        """
        Valida si un perfil tiene permiso para ejecutar una etapa.
        
        Args:
            etapa: Etapa a validar
            perfil: Perfil del usuario
            
        Returns:
            True si tiene permiso, False si no
        """
        # Si no hay perfiles definidos, todos tienen acceso
        if not etapa.perfiles_permitidos:
            return True

        # Validar si el perfil está en la lista
        return perfil in etapa.perfiles_permitidos

    @staticmethod
    def ejecutar_etapa(
        db: Session,
        instancia_id: int,
        etapa_id: int,
        respuestas: Dict[str, Any],
        archivos: Optional[Dict[str, Any]],
        user_id: str,
        perfil: str
    ) -> Dict[str, Any]:
        """
        Ejecuta una etapa del workflow: guarda respuestas y transiciona a siguiente etapa.
        
        Args:
            db: Sesión de base de datos
            instancia_id: ID de la instancia
            etapa_id: ID de la etapa a ejecutar
            respuestas: Diccionario con respuestas {codigo_pregunta: valor}
            archivos: Diccionario con archivos subidos {codigo_pregunta: file_id}
            user_id: ID del usuario ejecutando
            perfil: Perfil del usuario
            
        Returns:
            Estado actualizado del workflow
        """
        logger.info(f"Ejecutando etapa {etapa_id} de instancia {instancia_id} por usuario {user_id}")

        # Obtener instancia
        instancia = db.query(models.WorkflowInstancia).options(
            joinedload(models.WorkflowInstancia.etapa_actual),
            joinedload(models.WorkflowInstancia.workflow)
        ).filter(
            models.WorkflowInstancia.id == instancia_id,
            models.WorkflowInstancia.activo == True
        ).first()

        if not instancia:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Instancia {instancia_id} no encontrada"
            )

        # Validar que la etapa es la actual
        if instancia.etapa_actual_id != etapa_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"La etapa {etapa_id} no es la etapa actual. Etapa actual: {instancia.etapa_actual_id}"
            )

        # Obtener la etapa
        etapa = db.query(models.WorkflowEtapa).options(
            joinedload(models.WorkflowEtapa.preguntas),
            joinedload(models.WorkflowEtapa.conexiones_origen)
        ).filter(
            models.WorkflowEtapa.id == etapa_id,
            models.WorkflowEtapa.activo == True
        ).first()

        if not etapa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Etapa {etapa_id} no encontrada"
            )

        # Validar permisos
        if not WorkflowExecutionService.validar_permiso_etapa(etapa, perfil):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"El perfil {perfil} no tiene permiso para ejecutar esta etapa"
            )

        # Validar respuestas obligatorias
        for pregunta in etapa.preguntas:
            if pregunta.es_obligatoria:
                if pregunta.codigo not in respuestas and pregunta.codigo not in (archivos or {}):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"La pregunta '{pregunta.pregunta}' ({pregunta.codigo}) es obligatoria"
                    )

        # Crear o actualizar RespuestaEtapa
        respuesta_etapa = db.query(models.WorkflowRespuestaEtapa).filter(
            models.WorkflowRespuestaEtapa.instancia_id == instancia_id,
            models.WorkflowRespuestaEtapa.etapa_id == etapa_id
        ).first()

        if not respuesta_etapa:
            respuesta_etapa = models.WorkflowRespuestaEtapa(
                instancia_id=instancia_id,
                etapa_id=etapa_id,
                fecha_inicio=datetime.utcnow(),
                completado_por_user_id=user_id
            )
            db.add(respuesta_etapa)
            db.flush()

        # Guardar respuestas individuales
        for pregunta in etapa.preguntas:
            valor_respuesta = respuestas.get(pregunta.codigo)
            archivos_respuesta = (archivos or {}).get(pregunta.codigo)

            # Crear respuesta
            respuesta_obj = models.WorkflowRespuesta(
                respuesta_etapa_id=respuesta_etapa.id,
                pregunta_id=pregunta.id,
                created_by=user_id,
                updated_by=user_id
            )

            # Asignar valor según tipo de pregunta
            if pregunta.tipo_pregunta in [
                models.TipoPregunta.LISTA,
                models.TipoPregunta.OPCIONES,
                models.TipoPregunta.DATOS_CASO
            ]:
                respuesta_obj.valor_json = valor_respuesta
            elif pregunta.tipo_pregunta == models.TipoPregunta.SELECCION_FECHA:
                if valor_respuesta:
                    respuesta_obj.valor_fecha = datetime.fromisoformat(valor_respuesta.replace('Z', '+00:00'))
            elif pregunta.tipo_pregunta in [
                models.TipoPregunta.CARGA_ARCHIVO,
                models.TipoPregunta.DOCUMENTOS
            ]:
                respuesta_obj.archivos = archivos_respuesta or []
            else:
                respuesta_obj.valor_texto = valor_respuesta

            db.add(respuesta_obj)

        # Marcar etapa como completada
        respuesta_etapa.completada = True
        respuesta_etapa.fecha_completado = datetime.utcnow()
        respuesta_etapa.updated_by = user_id

        # Determinar siguiente etapa
        siguiente_etapa = WorkflowExecutionService._determinar_siguiente_etapa(
            db, etapa, respuestas
        )

        # Actualizar instancia
        etapa_anterior_id = instancia.etapa_actual_id
        if siguiente_etapa:
            instancia.etapa_actual_id = siguiente_etapa.id
            instancia.estado = models.EstadoInstancia.EN_PROGRESO
        else:
            # No hay más etapas, marcar como completado
            instancia.etapa_actual_id = None
            instancia.estado = models.EstadoInstancia.COMPLETADO
            instancia.fecha_fin = datetime.utcnow()

        instancia.updated_by = user_id

        # Registrar en historial
        historial = models.WorkflowInstanciaHistorial(
            instancia_id=instancia_id,
            tipo_cambio="TRANSICION",
            etapa_origen_id=etapa_anterior_id,
            etapa_destino_id=siguiente_etapa.id if siguiente_etapa else None,
            estado_anterior=models.EstadoInstancia.EN_PROGRESO.value,
            estado_nuevo=instancia.estado.value,
            descripcion=f"Etapa '{etapa.nombre}' completada por {perfil}",
            created_by=user_id
        )
        db.add(historial)

        db.commit()
        db.refresh(instancia)

        logger.info(f"✅ Etapa {etapa_id} ejecutada exitosamente. Nueva etapa: {instancia.etapa_actual_id}")

        # Retornar estado actualizado
        return {
            "success": True,
            "mensaje": "Etapa completada exitosamente",
            "workflow_state": WorkflowExecutionService.obtener_estado_workflow(db, instancia_id, perfil)
        }

    @staticmethod
    def _determinar_siguiente_etapa(
        db: Session,
        etapa_actual: models.WorkflowEtapa,
        respuestas: Dict[str, Any]
    ) -> Optional[models.WorkflowEtapa]:
        """
        Determina la siguiente etapa basándose en las conexiones y condiciones.
        
        Args:
            db: Sesión de base de datos
            etapa_actual: Etapa que se acaba de completar
            respuestas: Respuestas dadas en la etapa
            
        Returns:
            Siguiente etapa o None si es la última
        """
        logger.debug(f"Determinando siguiente etapa desde {etapa_actual.codigo}")

        # Si es etapa final, no hay siguiente
        if etapa_actual.es_etapa_final:
            logger.info("Etapa actual es final, no hay siguiente")
            return None

        # Obtener conexiones desde esta etapa
        conexiones = db.query(models.WorkflowConexion).filter(
            models.WorkflowConexion.etapa_origen_id == etapa_actual.id,
            models.WorkflowConexion.activo == True
        ).order_by(models.WorkflowConexion.es_predeterminada.desc()).all()

        if not conexiones:
            logger.warning(f"No hay conexiones desde etapa {etapa_actual.codigo}")
            return None

        # Evaluar condiciones de cada conexión
        for conexion in conexiones:
            # Si tiene condición, evaluarla
            if conexion.condicion:
                if WorkflowExecutionService._evaluar_condicion(conexion.condicion, respuestas):
                    logger.info(f"Condición cumplida para conexión {conexion.id}, siguiente: {conexion.etapa_destino_id}")
                    return conexion.etapa_destino
            # Si es predeterminada y no tiene condición, usarla
            elif conexion.es_predeterminada:
                logger.info(f"Usando conexión predeterminada, siguiente: {conexion.etapa_destino_id}")
                return conexion.etapa_destino

        # Si no se cumplió ninguna condición, usar la primera conexión
        logger.info(f"Usando primera conexión disponible, siguiente: {conexiones[0].etapa_destino_id}")
        return conexiones[0].etapa_destino

    @staticmethod
    def _evaluar_condicion(condicion: Dict[str, Any], respuestas: Dict[str, Any]) -> bool:
        """
        Evalúa una condición de transición.
        
        Formato de condición:
        {
            "campo": "codigo_pregunta",
            "operador": "==",
            "valor": "SI"
        }
        
        Args:
            condicion: Diccionario con la condición
            respuestas: Respuestas dadas en la etapa
            
        Returns:
            True si se cumple la condición, False si no
        """
        try:
            campo = condicion.get("campo")
            operador = condicion.get("operador", "==")
            valor_esperado = condicion.get("valor")

            if not campo:
                return True

            valor_actual = respuestas.get(campo)

            if operador == "==":
                return valor_actual == valor_esperado
            elif operador == "!=":
                return valor_actual != valor_esperado
            elif operador == "in":
                return valor_actual in valor_esperado
            elif operador == "not_in":
                return valor_actual not in valor_esperado
            else:
                logger.warning(f"Operador desconocido: {operador}")
                return False
        except Exception as e:
            logger.error(f"Error evaluando condición: {e}")
            return False
