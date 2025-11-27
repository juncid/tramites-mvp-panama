"""
WebSocket endpoint para notificaciones de progreso OCR en tiempo real.

Este módulo proporciona comunicación bidireccional para:
- Notificar progreso de tareas OCR
- Enviar resultados cuando la tarea completa
- Manejar errores y timeouts

Uso:
    1. Cliente conecta a /ws/ocr/{task_id}
    2. Servidor envía mensajes de progreso cada ~1 segundo
    3. Al completar, envía resultado final y cierra conexión
"""

import asyncio
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from celery.result import AsyncResult

from celery_app import celery_app

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSocket OCR"])


class OCRProgressTracker:
    """
    Clase para rastrear y transmitir progreso de tareas OCR via WebSocket.
    """

    def __init__(self, task_id: str, websocket: WebSocket):
        self.task_id = task_id
        self.websocket = websocket
        self.last_state = None
        self.last_progress = None

    async def send_message(self, message: dict):
        """Envía mensaje JSON al cliente WebSocket."""
        try:
            await self.websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error enviando mensaje WebSocket: {e}")
            raise

    def get_task_status(self) -> dict:
        """Obtiene el estado actual de la tarea Celery."""
        result = AsyncResult(self.task_id, app=celery_app)

        status_data = {
            "task_id": self.task_id,
            "state": result.state,
            "ready": result.ready(),
            "successful": result.successful() if result.ready() else None,
            "failed": result.failed() if result.ready() else None,
        }

        # Agregar información de progreso si está disponible
        if result.state == 'PROGRESS':
            info = result.info
            if isinstance(info, dict):
                status_data.update({
                    "current": info.get("current", 0),
                    "total": info.get("total", 6),
                    "status": info.get("status", "Procesando..."),
                    "porcentaje": info.get("porcentaje", 0)
                })
        elif result.state == 'SUCCESS':
            status_data["result"] = result.result
        elif result.state == 'FAILURE':
            status_data["error"] = str(result.result)
            status_data["traceback"] = result.traceback

        return status_data

    async def track_progress(self, timeout: int = 120, poll_interval: float = 0.5):
        """
        Monitorea el progreso de la tarea y envía actualizaciones.
        
        Args:
            timeout: Tiempo máximo de espera en segundos
            poll_interval: Intervalo de polling en segundos
        """
        start_time = asyncio.get_event_loop().time()

        try:
            while True:
                # Verificar timeout
                elapsed = asyncio.get_event_loop().time() - start_time
                if elapsed > timeout:
                    await self.send_message({
                        "type": "timeout",
                        "task_id": self.task_id,
                        "message": f"Timeout después de {timeout} segundos",
                        "elapsed_seconds": int(elapsed)
                    })
                    break

                # Obtener estado actual
                status = self.get_task_status()

                # Solo enviar si hay cambios
                state_key = f"{status['state']}_{status.get('porcentaje', 0)}"
                if state_key != self.last_state:
                    self.last_state = state_key

                    if status['state'] == 'PROGRESS':
                        await self.send_message({
                            "type": "progress",
                            **status
                        })
                    elif status['state'] == 'SUCCESS':
                        await self.send_message({
                            "type": "complete",
                            **status
                        })
                        return  # Tarea completada exitosamente
                    elif status['state'] == 'FAILURE':
                        await self.send_message({
                            "type": "error",
                            **status
                        })
                        return  # Tarea falló
                    elif status['state'] == 'PENDING':
                        await self.send_message({
                            "type": "pending",
                            "task_id": self.task_id,
                            "message": "Tarea en cola, esperando worker..."
                        })

                # Esperar antes del siguiente poll
                await asyncio.sleep(poll_interval)

        except WebSocketDisconnect:
            logger.info(f"Cliente desconectado del WebSocket para tarea {self.task_id}")
            raise
        except Exception as e:
            logger.error(f"Error en tracking de progreso: {e}")
            try:
                await self.send_message({
                    "type": "error",
                    "task_id": self.task_id,
                    "error": str(e)
                })
            except Exception:
                pass
            raise


@router.websocket("/ws/ocr/{task_id}")
async def websocket_ocr_progress(
    websocket: WebSocket,
    task_id: str,
    timeout: int = Query(default=120, ge=10, le=300)
):
    """
    WebSocket endpoint para monitorear progreso de tarea OCR.
    
    Args:
        task_id: ID de la tarea Celery a monitorear
        timeout: Timeout máximo en segundos (default 120, max 300)
    
    Mensajes enviados:
        - type: "pending" - Tarea en cola
        - type: "progress" - Actualización de progreso con porcentaje
        - type: "complete" - Tarea completada con resultado
        - type: "error" - Error en el procesamiento
        - type: "timeout" - Timeout alcanzado
    """
    await websocket.accept()
    logger.info(f"WebSocket conectado para tarea OCR: {task_id}")

    # Enviar mensaje de conexión
    await websocket.send_json({
        "type": "connected",
        "task_id": task_id,
        "message": "Conexión establecida, monitoreando tarea..."
    })

    tracker = OCRProgressTracker(task_id, websocket)

    try:
        await tracker.track_progress(timeout=timeout)
    except WebSocketDisconnect:
        logger.info(f"Cliente desconectado: {task_id}")
    except Exception as e:
        logger.error(f"Error en WebSocket OCR: {e}")
    finally:
        try:
            await websocket.close()
        except:
            pass


@router.get("/ocr/status/{task_id}")
async def get_ocr_task_status(task_id: str):
    """
    Endpoint REST alternativo para obtener estado de tarea OCR.
    Útil para clientes que no pueden usar WebSocket.
    
    Args:
        task_id: ID de la tarea Celery
    
    Returns:
        Estado actual de la tarea con información de progreso
    """
    result = AsyncResult(task_id, app=celery_app)

    response = {
        "task_id": task_id,
        "state": result.state,
        "ready": result.ready()
    }

    if result.state == 'PROGRESS':
        info = result.info
        if isinstance(info, dict):
            response.update({
                "current": info.get("current", 0),
                "total": info.get("total", 6),
                "status": info.get("status", "Procesando..."),
                "porcentaje": info.get("porcentaje", 0)
            })
    elif result.state == 'SUCCESS':
        response["result"] = result.result
        response["successful"] = True
    elif result.state == 'FAILURE':
        response["error"] = str(result.result)
        response["successful"] = False

    return response


@router.post("/ocr/cancel/{task_id}")
async def cancel_ocr_task(task_id: str):
    """
    Cancela una tarea OCR en progreso.
    
    Args:
        task_id: ID de la tarea Celery a cancelar
    
    Returns:
        Confirmación de cancelación
    """
    result = AsyncResult(task_id, app=celery_app)

    if result.ready():
        return {
            "success": False,
            "message": "La tarea ya ha finalizado",
            "state": result.state
        }

    # Revocar tarea
    result.revoke(terminate=True, signal='SIGTERM')

    return {
        "success": True,
        "message": "Tarea cancelada",
        "task_id": task_id
    }
