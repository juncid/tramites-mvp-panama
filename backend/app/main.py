from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import engine, Base, SessionLocal
from app.routes import router
from app.middleware import LoggerMiddleware, setup_logging
from app.config import settings
from sqlalchemy import text
from datetime import datetime
import logging
import os

# Importar Redis para métricas
try:
    from app.redis_client import get_redis
    from app.metrics import init_metrics, get_metrics
    METRICS_AVAILABLE = True
except ImportError:
    METRICS_AVAILABLE = False

# Importar routers adicionales
try:
    from app.routes_ppsh import router as ppsh_router
    PPSH_AVAILABLE = True
except ImportError:
    PPSH_AVAILABLE = False
    ppsh_router = None

# Configurar logging
log_file = os.path.join("logs", "app.log") if os.path.exists("logs") else None
setup_logging(
    log_level=os.getenv("LOG_LEVEL", "INFO"),
    log_file=log_file
)

logger = logging.getLogger(__name__)

# Crear tablas (si no existen)
try:
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Tablas de base de datos verificadas/creadas")
except Exception as e:
    logger.error(f"❌ Error creando tablas: {e}")

# Crear aplicación FastAPI
app = FastAPI(
    title="Sistema de Trámites Migratorios de Panamá",
    description="API para gestión de trámites del Servicio Nacional de Migración",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar orígenes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Agregar middleware de logging
app.add_middleware(LoggerMiddleware)

# Incluir routers
app.include_router(router, prefix="/api/v1")

# Incluir router de PPSH si está disponible
if PPSH_AVAILABLE and ppsh_router:
    app.include_router(ppsh_router, prefix="/api/v1")
    logger.info("✅ Módulo PPSH registrado en /api/v1/ppsh")
else:
    logger.warning("⚠️  Módulo PPSH no disponible")

logger.info("🚀 Aplicación FastAPI inicializada")

@app.get("/", tags=["Root"])
async def root():
    """Endpoint raíz de la API"""
    response = {
        "message": "Sistema de Trámites Migratorios de Panamá",
        "version": "1.0.0",
        "status": "running",
        "docs": "/api/docs",
        "health": "/health",
        "database_status": "/health/database",
        "modules": {
            "tramites": "✅ Disponible en /api/v1/tramites"
        }
    }
    
    # Agregar módulo PPSH si está disponible
    if PPSH_AVAILABLE:
        response["modules"]["ppsh"] = "✅ Disponible en /api/v1/ppsh"
    else:
        response["modules"]["ppsh"] = "❌ No disponible"
    
    return response

@app.get("/health", tags=["Health"], status_code=status.HTTP_200_OK)
async def health_check():
    """
    Health check básico de la aplicación
    Retorna el estado general del servicio
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "tramites-api",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.get("/health/database", tags=["Health"], status_code=status.HTTP_200_OK)
async def database_health_check():
    """
    Health check de la base de datos
    Verifica conectividad y estado de la BD
    """
    db_status = {
        "status": "unknown",
        "database": settings.database_name,
        "host": settings.database_host,
        "timestamp": datetime.utcnow().isoformat(),
        "details": {}
    }
    
    try:
        # Crear sesión
        db = SessionLocal()
        
        try:
            # Test 1: Conexión básica
            result = db.execute(text("SELECT 1"))
            result.fetchone()
            db_status["details"]["connection"] = "✅ OK"
            
            # Test 2: Verificar base de datos
            result = db.execute(text("SELECT DB_NAME()"))
            db_name = result.fetchone()[0]
            db_status["details"]["database_name"] = db_name
            
            # Test 3: Contar tablas
            result = db.execute(text(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES "
                "WHERE TABLE_TYPE = 'BASE TABLE'"
            ))
            table_count = result.fetchone()[0]
            db_status["details"]["tables"] = table_count
            
            # Test 4: Verificar tabla de trámites
            result = db.execute(text("SELECT COUNT(*) FROM tramites"))
            tramite_count = result.fetchone()[0]
            db_status["details"]["tramites_count"] = tramite_count
            
            # Test 5: Verificar usuarios
            result = db.execute(text("SELECT COUNT(*) FROM SEG_TB_USUARIOS WHERE ACTIVO = 1"))
            user_count = result.fetchone()[0]
            db_status["details"]["active_users"] = user_count
            
            # Test 6: Verificar versión de SQL Server
            result = db.execute(text("SELECT @@VERSION"))
            version = result.fetchone()[0]
            db_status["details"]["sql_server_version"] = version[:100] + "..."
            
            # Todo OK
            db_status["status"] = "healthy"
            db_status["message"] = "Base de datos operando correctamente"
            
            logger.info("✅ Health check de base de datos exitoso")
            
        except Exception as e:
            db_status["status"] = "unhealthy"
            db_status["error"] = str(e)
            db_status["message"] = "Error ejecutando queries de verificación"
            logger.error(f"❌ Error en health check de BD: {e}")
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content=db_status
            )
        finally:
            db.close()
            
    except Exception as e:
        db_status["status"] = "unhealthy"
        db_status["error"] = str(e)
        db_status["message"] = "No se pudo conectar a la base de datos"
        logger.error(f"❌ Error conectando a BD en health check: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=db_status
        )
    
    return db_status

@app.on_event("startup")
async def startup_event():
    """Evento de inicio de la aplicación"""
    logger.info("="*60)
    logger.info("  🚀 INICIANDO APLICACIÓN")
    logger.info("="*60)
    logger.info(f"  Ambiente: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"  Base de datos: {settings.database_name}")
    logger.info(f"  Host BD: {settings.database_host}:{settings.database_port}")
    logger.info(f"  Redis: {settings.redis_host}:{settings.redis_port}")
    
    # Inicializar métricas si está disponible
    if METRICS_AVAILABLE:
        try:
            redis_client = get_redis()
            init_metrics(redis_client)
            logger.info("  ✅ Sistema de métricas inicializado")
        except Exception as e:
            logger.warning(f"  ⚠️  No se pudo inicializar métricas: {e}")
    
    logger.info("="*60)

@app.on_event("shutdown")
async def shutdown_event():
    """Evento de cierre de la aplicación"""
    logger.info("="*60)
    logger.info("  🛑 CERRANDO APLICACIÓN")
    logger.info("="*60)


@app.get("/metrics", tags=["Observability"])
async def metrics_endpoint():
    """
    Endpoint de métricas de la aplicación
    Retorna contadores, gauges y timings recolectados
    """
    if not METRICS_AVAILABLE:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unavailable",
                "message": "Sistema de métricas no disponible"
            }
        )
    
    try:
        metrics_collector = get_metrics()
        if not metrics_collector:
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={
                    "status": "unavailable",
                    "message": "Colector de métricas no inicializado"
                }
            )
        
        all_metrics = metrics_collector.get_all_metrics()
        
        # Agregar metadatos
        response = {
            "timestamp": datetime.utcnow().isoformat(),
            "service": "tramites-api",
            "version": "1.0.0",
            "metrics": all_metrics
        }
        
        return response
        
    except Exception as e:
        logger.error(f"Error obteniendo métricas: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status": "error",
                "message": str(e)
            }
        )


@app.get("/metrics/{metric_name}", tags=["Observability"])
async def metric_detail(metric_name: str):
    """
    Endpoint para obtener detalles de una métrica específica
    """
    if not METRICS_AVAILABLE:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"message": "Sistema de métricas no disponible"}
        )
    
    try:
        metrics_collector = get_metrics()
        if not metrics_collector:
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={"message": "Colector de métricas no inicializado"}
            )
        
        # Intentar obtener como contador
        counter_value = metrics_collector.get_counter(metric_name)
        if counter_value > 0:
            return {
                "metric": metric_name,
                "type": "counter",
                "value": counter_value,
                "timestamp": datetime.utcnow().isoformat()
            }
        
        # Intentar obtener como gauge
        gauge_data = metrics_collector.get_gauge(metric_name)
        if gauge_data:
            return {
                "metric": metric_name,
                "type": "gauge",
                "data": gauge_data
            }
        
        # Intentar obtener stats de timing
        timing_stats = metrics_collector.get_timing_stats(metric_name)
        if timing_stats:
            return {
                "metric": metric_name,
                "type": "timing",
                "stats": timing_stats
            }
        
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": f"Métrica '{metric_name}' no encontrada"}
        )
        
    except Exception as e:
        logger.error(f"Error obteniendo métrica {metric_name}: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": str(e)}
        )
