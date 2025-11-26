# Arquitectura de Servicio OCR

## Descripción General

Sistema de procesamiento OCR (Optical Character Recognition) desacoplado para el sistema de trámites migratorios de Panamá. Permite extraer texto de documentos de forma asíncrona sin bloquear los endpoints principales de la API.

## Arquitectura

### Patrón: Queue-Based Microservices

```
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │ HTTP POST /api/v1/ocr/procesar/{id}
       ▼
┌──────────────────────────────────────────┐
│         FastAPI Backend (main.py)        │
│  - routers_ocr.py                        │
│  - schemas_ocr.py                        │
│  - models_ocr.py                         │
└──────────────┬───────────────────────────┘
               │ Encola tarea
               ▼
┌──────────────────────────────────────────┐
│          Redis (Message Broker)          │
│  - DB 1: Broker de mensajes              │
│  - DB 2: Resultados de tareas            │
│  Colas:                                  │
│    • ocr_high_priority (prioridad 9)     │
│    • ocr_default (prioridad 5)           │
│    • ocr_low_priority (prioridad 1)      │
└──────────────┬───────────────────────────┘
               │ Consume tareas
               ▼
┌──────────────────────────────────────────┐
│      Celery Workers (celery_app.py)      │
│  - 4 workers concurrentes                │
│  - Prefetch: 1 tarea por worker          │
│  - Max 100 tareas por proceso            │
│  - Timeout: 1 hora (hard), 50 min (soft) │
│  - Reintentos: 3 intentos automáticos    │
└──────────────┬───────────────────────────┘
               │ Ejecuta OCR
               ▼
┌──────────────────────────────────────────┐
│         Servicio OCR (ocr_tasks.py)      │
│  1. Cargar imagen (binario o archivo)    │
│  2. Preprocesamiento:                    │
│     - Escala de grises                   │
│     - Binarización (Otsu)                │
│     - Reducción de ruido                 │
│     - Corrección de inclinación          │
│     - Mejora de contraste (CLAHE)        │
│  3. Tesseract OCR (español + inglés)     │
│  4. Extracción de datos estructurados    │
│  5. Cálculo de confianza                 │
└──────────────┬───────────────────────────┘
               │ Guarda resultados
               ▼
┌──────────────────────────────────────────┐
│      SQL Server (Base de Datos)          │
│  Tablas:                                 │
│    • PPSH_DOCUMENTO_OCR                  │
│    • PPSH_DOCUMENTO_OCR_HISTORIAL        │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│      Flower (Monitor Web - :5555)        │
│  - Dashboard de tareas                   │
│  - Estadísticas en tiempo real           │
│  - Control de workers                    │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│     Celery Beat (Tareas Programadas)     │
│  - Limpieza diaria (2 AM)                │
│  - Estadísticas cada hora                │
└──────────────────────────────────────────┘
```

## Componentes

### 1. FastAPI Router (`routers_ocr.py`)

**Endpoints:**

- **POST /api/v1/ocr/procesar/{id_documento}**
  - Inicia procesamiento OCR
  - Retorna `task_id` inmediatamente
  - Soporta configuración personalizada (idioma, preprocesamiento, prioridad)
  
- **GET /api/v1/ocr/status/{task_id}**
  - Consulta estado de tarea
  - Progreso en tiempo real (porcentaje, paso actual)
  - Estados: PENDIENTE, PROCESANDO, COMPLETADO, ERROR, CANCELADO
  
- **GET /api/v1/ocr/resultado/{id_documento}**
  - Obtiene resultado completo
  - Texto extraído, confianza, datos estructurados
  
- **POST /api/v1/ocr/reprocesar/{id_documento}**
  - Reprocesa documento con nuevas configuraciones
  - Guarda versión anterior en historial
  
- **GET /api/v1/ocr/estadisticas**
  - Estadísticas del sistema
  - Totales por estado, confianza promedio, tiempo promedio
  
- **DELETE /api/v1/ocr/cancelar/{task_id}**
  - Cancela tarea en ejecución
  
- **GET /api/v1/ocr/historial/{id_documento}**
  - Historial de reprocesamiento

### 2. Celery Application (`celery_app.py`)

**Configuración:**

```python
broker_url = "redis://redis:6379/1"
result_backend = "redis://redis:6379/2"

# Colas con prioridad
task_queues = [
    Queue('ocr_high_priority', routing_key='ocr.high'),
    Queue('ocr_default', routing_key='ocr.default'),
    Queue('ocr_low_priority', routing_key='ocr.low'),
]

# Optimizaciones
worker_prefetch_multiplier = 1  # Una tarea a la vez
worker_max_tasks_per_child = 100  # Reiniciar worker cada 100 tareas
task_time_limit = 3600  # 1 hora máximo
task_soft_time_limit = 3000  # 50 minutos advertencia
```

**Tareas Programadas (Beat):**

```python
beat_schedule = {
    'cleanup-old-ocr': {
        'task': 'ocr.cleanup_old_results',
        'schedule': crontab(hour=2, minute=0),  # 2 AM diario
        'args': (30,)  # 30 días de antigüedad
    },
    'generate-ocr-stats': {
        'task': 'ocr.generate_statistics',
        'schedule': crontab(minute=0),  # Cada hora
    }
}
```

### 3. OCR Tasks (`ocr_tasks.py`)

**Tareas principales:**

- **`process_document_ocr(id_documento, user_id, opciones)`**
  - Tarea principal de procesamiento
  - 6 pasos con progreso reportado
  - Retry automático (3 intentos, backoff exponencial)

- **`process_urgent_document(...)`**
  - Wrapper para alta prioridad
  - Misma lógica, cola diferente

- **`cleanup_old_results(dias_antiguedad)`**
  - Limpia resultados antiguos
  - Tarea programada diaria

- **`generate_ocr_statistics()`**
  - Genera estadísticas del sistema
  - Tarea programada cada hora

**Funciones auxiliares:**

- **`load_image_from_document(documento)`**
  - Carga desde contenido_binario o ruta_archivo
  - Retorna array numpy

- **`preprocess_image(imagen, opciones)`**
  - Escala de grises
  - Binarización (Otsu)
  - Reducción de ruido (fastNlMeansDenoising)
  - Corrección inclinación (deskew)
  - Mejora contraste (CLAHE)

- **`execute_ocr(imagen, idioma)`**
  - Ejecuta Tesseract OCR
  - Calcula confianza promedio
  - Retorna texto y metadatos

- **`extract_structured_data(texto, tipo_documento)`**
  - Extrae campos estructurados por regex
  - Pasaportes: número, fechas, nacionalidad
  - Cédulas: número, fecha nacimiento
  - Retorna JSON

### 4. Database Models (`models_ocr.py`)

**PPSHDocumentoOCR:**

```python
- id_ocr: PK
- id_documento: FK a PPSH_DOCUMENTO
- estado_ocr: PENDIENTE | PROCESANDO | COMPLETADO | ERROR | CANCELADO
- celery_task_id: ID de tarea Celery
- texto_extraido: TEXT
- texto_confianza: Decimal(5,2)  # 0.00 - 100.00
- idioma_detectado: VARCHAR(10)
- num_caracteres, num_palabras, num_paginas: INT
- datos_estructurados: TEXT (JSON)
- fecha_inicio_proceso, fecha_fin_proceso: DATETIME
- tiempo_procesamiento_ms: INT
- intentos_procesamiento: INT
- codigo_error, mensaje_error: VARCHAR
- created_at, updated_at: DATETIME
- created_by, updated_by: VARCHAR
```

**PPSHDocumentoOCRHistorial:**

```python
- id_historial: PK
- id_ocr: Referencia al OCR original
- id_documento: FK a PPSH_DOCUMENTO
- [mismos campos de resultado...]
- fecha_proceso_original: DATETIME
- motivo_reprocesamiento: VARCHAR(500)
- created_at, created_by
```

### 5. Pydantic Schemas (`schemas_ocr.py`)

- **OCRRequest**: Configuración de procesamiento
- **OCRResponse**: Respuesta inmediata con task_id
- **OCRStatus**: Estado y progreso de tarea
- **OCRResultado**: Resultado completo
- **DatosEstructurados**: Campos extraídos
- **OCREstadisticas**: Métricas del sistema
- **EstadoOCREnum**: Enum de estados

## Flujo de Procesamiento

### 1. Solicitud de Procesamiento

```http
POST /api/v1/ocr/procesar/123?user_id=admin
Content-Type: application/json

{
  "idioma": "spa+eng",
  "prioridad": "alta",
  "binarizar": true,
  "denoise": true,
  "mejorar_contraste": true,
  "deskew": true,
  "extraer_datos_estructurados": true
}
```

**Respuesta inmediata:**

```json
{
  "task_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "estado": "PENDIENTE",
  "mensaje": "Documento encolado para procesamiento OCR",
  "id_documento": 123,
  "tiempo_estimado_segundos": 30
}
```

### 2. Consulta de Estado

```http
GET /api/v1/ocr/status/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Durante procesamiento:**

```json
{
  "task_id": "a1b2c3d4-...",
  "estado": "PROCESANDO",
  "porcentaje_completado": 66,
  "paso_actual": 4,
  "total_pasos": 6,
  "mensaje": "Extrayendo texto con OCR...",
  "id_documento": 123
}
```

**Al completar:**

```json
{
  "task_id": "a1b2c3d4-...",
  "estado": "COMPLETADO",
  "porcentaje_completado": 100,
  "mensaje": "Procesamiento completado exitosamente",
  "id_documento": 123,
  "id_ocr": 456,
  "confianza_promedio": 92.5,
  "tiempo_procesamiento_ms": 12450
}
```

### 3. Obtención de Resultados

```http
GET /api/v1/ocr/resultado/123
```

**Respuesta:**

```json
{
  "id_ocr": 456,
  "id_documento": 123,
  "estado": "COMPLETADO",
  "texto_extraido": "REPÚBLICA DE PANAMÁ\nPASAPORTE...",
  "confianza_promedio": 92.5,
  "idioma_detectado": "spa",
  "num_caracteres": 1542,
  "num_palabras": 287,
  "num_paginas": 1,
  "tiempo_procesamiento_ms": 12450,
  "fecha_procesamiento": "2024-01-15T10:30:00",
  "datos_estructurados": {
    "numero_pasaporte": "PA1234567",
    "fechas_encontradas": ["15/01/1990", "10/01/2020", "10/01/2030"],
    "posible_fecha_nacimiento": "15/01/1990",
    "posible_fecha_emision": "10/01/2020",
    "posible_fecha_vencimiento": "10/01/2030",
    "nacionalidad": "PAN"
  },
  "celery_task_id": "a1b2c3d4-..."
}
```

## Despliegue

### Requisitos del Sistema

**Paquetes Linux (Debian/Ubuntu):**
```bash
apt-get install tesseract-ocr tesseract-ocr-spa tesseract-ocr-eng
apt-get install libgl1-mesa-glx libglib2.0-0
```

**Python:**
```
celery==5.3.4
pytesseract==0.3.10
opencv-python-headless==4.8.1.78
Pillow==10.1.0
numpy==1.26.2
flower==2.0.1
```

### Docker Compose

**Servicios nuevos:**

1. **celery-worker**: Procesa tareas OCR (4 workers concurrentes)
2. **celery-beat**: Ejecuta tareas programadas
3. **celery-flower**: Monitor web (puerto 5555)

**Iniciar servicios:**

```bash
# Construcción inicial
docker-compose build

# Aplicar migración OCR
docker-compose run --rm backend alembic upgrade head

# Iniciar todos los servicios
docker-compose up -d

# Ver logs de workers
docker-compose logs -f celery-worker

# Acceder a Flower
open http://localhost:5555
```

### Variables de Entorno

```env
# Celery
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2
C_FORCE_ROOT=true  # Permitir ejecución como root en Docker

# Tesseract (opcional, si no está en PATH)
TESSERACT_CMD=/usr/bin/tesseract
```

## Monitoreo

### Flower Dashboard (http://localhost:5555)

- **Tasks**: Lista de todas las tareas (activas, completadas, fallidas)
- **Workers**: Estado de cada worker (activo, memoria, CPU)
- **Monitor**: Gráficas en tiempo real
- **Broker**: Estado de Redis

### Endpoints de Métricas

```http
# Estadísticas OCR
GET /api/v1/ocr/estadisticas

# Métricas generales de la API
GET /metrics
```

### Logs

```bash
# Logs de Celery Worker
docker-compose logs -f celery-worker

# Logs de Celery Beat
docker-compose logs -f celery-beat

# Logs del Backend
docker-compose logs -f backend
```

## Optimización y Escalado

### Horizontal Scaling

```yaml
# docker-compose.yml
celery-worker:
  # ... configuración existente
  deploy:
    replicas: 4  # 4 instancias de workers
```

### Ajuste de Concurrencia

```bash
# Más workers por instancia (usar con CPU potente)
celery -A celery_app worker --concurrency=8

# Modo gevent (para I/O bound)
celery -A celery_app worker --pool=gevent --concurrency=100
```

### Caching de Resultados

- Los resultados se guardan en SQL Server (persistente)
- El estado de tareas en Redis (temporal, TTL configurable)
- Considerar CDN para imágenes procesadas frecuentemente

## Troubleshooting

### Error: "Tesseract not found"

```bash
# Verificar instalación
docker-compose exec celery-worker which tesseract
docker-compose exec celery-worker tesseract --version

# Si falta, reinstalar
docker-compose exec celery-worker apt-get update
docker-compose exec celery-worker apt-get install -y tesseract-ocr tesseract-ocr-spa
```

### Error: "Worker timeout"

Aumentar límites en `celery_app.py`:

```python
task_time_limit = 7200  # 2 horas
task_soft_time_limit = 6600  # 1h 50min
```

### Tarea atascada

```bash
# Revocar tarea
celery -A celery_app purge  # Limpiar todas las tareas pendientes

# O específica
celery -A celery_app revoke <task_id> --terminate
```

### Alto uso de memoria

```python
# Reducir max_tasks_per_child
worker_max_tasks_per_child = 50  # Reiniciar más frecuentemente
```

## Testing

Ver `backend/tests/test_ocr.py` para:

- Unit tests de preprocesamiento
- Tests de OCR con imágenes de ejemplo
- Tests de API endpoints
- Tests de tareas asíncronas
- Mocks de Tesseract

## Referencias

- [Celery Documentation](https://docs.celeryq.dev/)
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)
- [OpenCV Python](https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html)
- [Flower Monitor](https://flower.readthedocs.io/)

## Mejoras Futuras

1. **OCR Multi-página PDF**: Procesar PDFs con múltiples páginas
2. **Machine Learning**: Modelo de clasificación de documentos
3. **Validación Inteligente**: Validar datos extraídos con reglas de negocio
4. **Detección de Firmas**: Extraer y validar firmas manuscritas
5. **OCR en Tiempo Real**: WebSocket para streaming de progreso
6. **Batch Processing**: Procesar múltiples documentos en lote
7. **Cache de Resultados**: Evitar reprocesar documentos idénticos
8. **GPU Acceleration**: Usar GPU para preprocesamiento con CUDA
