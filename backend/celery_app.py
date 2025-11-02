"""
Configuración de Celery para procesamiento asíncrono
Sistema de Trámites Migratorios de Panamá - Servicio OCR
"""

from celery import Celery
from kombu import Queue, Exchange
import os

# Configuración de Redis
REDIS_HOST = os.getenv('REDIS_HOST', 'redis')
REDIS_PORT = os.getenv('REDIS_PORT', '6379')
REDIS_DB_BROKER = os.getenv('REDIS_DB_BROKER', '1')
REDIS_DB_BACKEND = os.getenv('REDIS_DB_BACKEND', '2')

# Crear instancia de Celery
celery_app = Celery(
    'tramites_ocr',
    broker=f'redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB_BROKER}',
    backend=f'redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB_BACKEND}',
    include=['app.tasks.ocr_tasks']
)

# Configuración de Celery
celery_app.conf.update(
    # Serialización
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    
    # Zona horaria
    timezone='America/Panama',
    enable_utc=True,
    
    # Configuración de tareas
    task_track_started=True,  # Trackear cuando inicia una tarea
    task_time_limit=3600,  # 1 hora máximo por tarea
    task_soft_time_limit=3000,  # 50 minutos warning
    task_acks_late=True,  # Confirmar tarea después de completarla
    task_reject_on_worker_lost=True,  # Reintentar si worker muere
    
    # Configuración de worker
    worker_prefetch_multiplier=1,  # Procesar una tarea a la vez por worker
    worker_max_tasks_per_child=100,  # Reiniciar worker cada 100 tareas (prevenir memory leaks)
    worker_disable_rate_limits=False,
    
    # Resultados
    result_expires=3600,  # Mantener resultados por 1 hora
    result_extended=True,  # Guardar metadata adicional
    
    # Configuración de colas con prioridades
    task_queues=(
        Queue(
            'ocr_high_priority',
            Exchange('ocr'),
            routing_key='ocr.high',
            queue_arguments={'x-max-priority': 10}
        ),
        Queue(
            'ocr_default',
            Exchange('ocr'),
            routing_key='ocr.default',
            queue_arguments={'x-max-priority': 10}
        ),
        Queue(
            'ocr_low_priority',
            Exchange('ocr'),
            routing_key='ocr.low',
            queue_arguments={'x-max-priority': 10}
        ),
    ),
    task_default_queue='ocr_default',
    task_default_exchange='ocr',
    task_default_routing_key='ocr.default',
    
    # Configuración de broker
    broker_connection_retry=True,
    broker_connection_retry_on_startup=True,
    broker_connection_max_retries=10,
    
    # Eventos y monitoreo
    worker_send_task_events=True,
    task_send_sent_event=True,
)

# Rutas de tareas por prioridad
celery_app.conf.task_routes = {
    'app.tasks.ocr_tasks.process_document_ocr': {
        'queue': 'ocr_default'
    },
    'app.tasks.ocr_tasks.process_urgent_document': {
        'queue': 'ocr_high_priority'
    },
}

# Configuración de beats (tareas programadas) - opcional
from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    # Limpiar tareas antiguas cada día a las 2 AM
    'cleanup-old-tasks': {
        'task': 'app.tasks.ocr_tasks.cleanup_old_results',
        'schedule': crontab(hour=2, minute=0),
    },
    # Generar estadísticas cada hora
    'generate-stats': {
        'task': 'app.tasks.ocr_tasks.generate_ocr_statistics',
        'schedule': crontab(minute=0),
    },
}

if __name__ == '__main__':
    celery_app.start()
