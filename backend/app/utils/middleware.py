"""
Middleware de logging para la aplicación FastAPI
Registra todas las peticiones HTTP con detalles completos
"""

import time
import logging
import uuid
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import json
from datetime import datetime

# Configurar logger
logger = logging.getLogger("app.middleware")


class LoggerMiddleware(BaseHTTPMiddleware):
    """
    Middleware para logging de peticiones HTTP
    Registra: método, ruta, status code, tiempo de respuesta, IP cliente
    También recolecta métricas si está disponible
    """

    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.logger = logging.getLogger("app.middleware.http")

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Información de la petición con UUID único
        request_id = str(uuid.uuid4())
        client_host = request.client.host if request.client else "unknown"
        method = request.method
        url = str(request.url)
        path = request.url.path

        # Capturar el body para logging en caso de error
        # NOTA: No capturar body para uploads de archivos (multipart)
        request_body = None
        content_type = request.headers.get("content-type", "")
        is_multipart = "multipart/form-data" in content_type

        if method in ["POST", "PUT", "PATCH"] and not is_multipart:
            try:
                body_bytes = await request.body()
                if body_bytes:
                    request_body = body_bytes.decode('utf-8')
                    # Reconstruir el request para que pueda ser leído nuevamente
                    async def receive():
                        return {"type": "http.request", "body": body_bytes}
                    request._receive = receive
            except Exception as e:
                self.logger.debug(f"No se pudo leer el body: {e}")

        # Timestamp de inicio
        start_time = time.time()

        # Log de petición entrante
        self.logger.info(
            f"➡️  [{request_id}] {method} {path} - Cliente: {client_host}"
        )

        # Procesar la petición
        try:
            response = await call_next(request)

            # Calcular tiempo de procesamiento
            process_time = time.time() - start_time
            process_time_ms = process_time * 1000

            # Agregar headers personalizados
            response.headers["X-Process-Time"] = str(process_time)
            response.headers["X-Request-ID"] = request_id

            # Determinar nivel de log según status code
            status_code = response.status_code
            if status_code >= 500:
                log_level = logging.ERROR
                emoji = "❌"
            elif status_code >= 400:
                log_level = logging.WARNING
                emoji = "⚠️ "
            else:
                log_level = logging.INFO
                emoji = "✅"

            # Log de respuesta
            self.logger.log(
                log_level,
                f"{emoji} [{request_id}] {method} {path} - "
                f"Status: {status_code} - "
                f"Tiempo: {process_time:.3f}s - "
                f"Cliente: {client_host}"
            )

            # Si hay error, loguear detalles adicionales
            if status_code >= 400:
                error_details = {
                    "request_id": request_id,
                    "method": method,
                    "path": path,
                    "status_code": status_code,
                    "client": client_host,
                    "process_time": f"{process_time:.3f}s"
                }

                # Incluir body de la request si está disponible
                if request_body and method in ["POST", "PUT", "PATCH"]:
                    try:
                        error_details["request_body"] = json.loads(request_body)
                    except:
                        error_details["request_body"] = request_body[:1000] if len(request_body) > 1000 else request_body

                # Intentar leer el body de la respuesta para ver el error
                try:
                    from starlette.responses import StreamingResponse
                    if not isinstance(response, StreamingResponse):
                        # Leer el body de la respuesta
                        response_body = b""
                        async for chunk in response.body_iterator:
                            response_body += chunk

                        # Intentar parsear como JSON
                        try:
                            error_details["response_body"] = json.loads(response_body.decode())
                        except:
                            error_details["response_body"] = response_body.decode()[:500]

                        # Reconstruir la respuesta
                        from starlette.responses import Response
                        response = Response(
                            content=response_body,
                            status_code=response.status_code,
                            headers=dict(response.headers),
                            media_type=response.media_type
                        )
                except Exception as e:
                    error_details["response_read_error"] = str(e)

                # Log detallado del error
                self.logger.log(
                    log_level,
                    f"📋 Detalles del error [{request_id}]:\n{json.dumps(error_details, indent=2, ensure_ascii=False)}"
                )

            # Recolectar métricas (si está disponible)
            try:
                from app.utils import get_metrics
                metrics = get_metrics()
                if metrics:
                    # Contador de requests
                    metrics.increment(
                        "http_requests_total",
                        tags={
                            "method": method,
                            "endpoint": path,
                            "status": str(status_code)
                        }
                    )

                    # Timing de requests
                    metrics.timing(
                        "http_request_duration_ms",
                        process_time_ms,
                        tags={
                            "method": method,
                            "endpoint": path
                        }
                    )

                    # Contador de errores si aplica
                    if status_code >= 400:
                        metrics.increment(
                            "http_errors_total",
                            tags={
                                "method": method,
                                "status": str(status_code)
                            }
                        )
            except Exception as e:
                # No fallar si hay error en métricas
                self.logger.debug(f"Error recolectando métricas: {e}")

            return response

        except Exception as e:
            # Log de error con detalles
            process_time = time.time() - start_time
            error_details = {
                "request_id": request_id,
                "method": method,
                "path": path,
                "client": client_host,
                "error_type": type(e).__name__,
                "error_message": str(e),
                "process_time": f"{process_time:.3f}s"
            }

            # Incluir body si está disponible y es relevante
            if request_body and method in ["POST", "PUT", "PATCH"]:
                try:
                    # Intentar parsear como JSON para mejor legibilidad
                    error_details["request_body"] = json.loads(request_body)
                except:
                    # Si no es JSON válido, incluir como texto (truncado si es muy largo)
                    error_details["request_body"] = request_body[:1000] if len(request_body) > 1000 else request_body

            # Log detallado del error
            self.logger.error(
                f"💥 [{request_id}] {method} {path} - "
                f"Error: {str(e)} - "
                f"Tiempo: {process_time:.3f}s - "
                f"Cliente: {client_host}"
            )
            self.logger.error(
                f"Detalles del error:\n{json.dumps(error_details, indent=2, ensure_ascii=False)}",
                exc_info=True
            )

            # Métrica de excepción
            try:
                from app.utils import get_metrics
                metrics = get_metrics()
                if metrics:
                    metrics.increment(
                        "http_exceptions_total",
                        tags={
                            "method": method,
                            "endpoint": path,
                            "exception": type(e).__name__
                        }
                    )
            except:
                pass

            raise


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware detallado para logging de peticiones
    Incluye headers, query params y body (opcional)
    """

    def __init__(self, app: ASGIApp, log_body: bool = False):
        super().__init__(app)
        self.log_body = log_body
        self.logger = logging.getLogger("app.middleware.detailed")

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generar UUID único para la petición
        request_id = str(uuid.uuid4())

        # Información detallada de la petición
        request_info = {
            "request_id": request_id,
            "timestamp": datetime.utcnow().isoformat(),
            "method": request.method,
            "path": request.url.path,
            "query_params": dict(request.query_params),
            "client": {
                "host": request.client.host if request.client else None,
                "port": request.client.port if request.client else None
            },
            "headers": dict(request.headers)
        }

        # Registrar body si está habilitado (solo para desarrollo)
        if self.log_body and request.method in ["POST", "PUT", "PATCH"]:
            try:
                body = await request.body()
                if body:
                    try:
                        request_info["body"] = json.loads(body.decode())
                    except:
                        request_info["body"] = body.decode()[:500]  # Limitar tamaño
            except:
                request_info["body"] = "<unable to read>"

        # Log de petición con request_id
        self.logger.debug(f"[{request_id}] Petición: {json.dumps(request_info, indent=2)}")

        # Procesar petición
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time

        # Información de respuesta
        response_info = {
            "request_id": request_id,
            "timestamp": datetime.utcnow().isoformat(),
            "status_code": response.status_code,
            "process_time": f"{process_time:.3f}s",
            "headers": dict(response.headers)
        }

        # Log de respuesta con request_id para correlación
        self.logger.debug(f"[{request_id}] Respuesta: {json.dumps(response_info, indent=2)}")

        return response


def setup_logging(log_level: str = "INFO", log_file: str = None):
    """
    Configurar el sistema de logging
    
    Args:
        log_level: Nivel de logging (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Ruta al archivo de log (opcional)
    """
    # Formato de log
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"

    # Configuración básica
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format=log_format,
        datefmt=date_format,
        handlers=[
            logging.StreamHandler()  # Console
        ]
    )

    # Agregar handler de archivo si se especifica
    if log_file:
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(getattr(logging, log_level.upper()))
        file_handler.setFormatter(
            logging.Formatter(log_format, datefmt=date_format)
        )
        logging.getLogger().addHandler(file_handler)

    # Configurar loggers específicos
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)

    logger.info("🔧 Sistema de logging configurado")
    logger.info(f"   Nivel: {log_level}")
    if log_file:
        logger.info(f"   Archivo: {log_file}")
