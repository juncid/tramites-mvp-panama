# Servicio OCR - Guía de Implementación

## 🎯 Resumen

Servicio de OCR (Optical Character Recognition) desacoplado para extracción de texto de documentos en el sistema de trámites migratorios de Panamá.

**Estado**: ✅ Implementación completa  
**Versión**: 1.0.0  
**Última actualización**: Enero 2025

## 📦 Componentes Implementados

### ✅ Backend (Python/FastAPI)

- [x] **Modelos de Base de Datos** (`backend/app/models/models_ocr.py`)
  - PPSHDocumentoOCR
  - PPSHDocumentoOCRHistorial
  
- [x] **Schemas Pydantic** (`backend/app/schemas/schemas_ocr.py`)
  - OCRRequest, OCRResponse, OCRStatus
  - OCRResultado, DatosEstructurados
  - OCREstadisticas, EstadoOCREnum
  
- [x] **Router FastAPI** (`backend/app/routers/routers_ocr.py`)
  - 7 endpoints completos con documentación
  
- [x] **Tareas Celery** (`backend/app/tasks/ocr_tasks.py`)
  - Procesamiento OCR principal
  - Preprocesamiento de imágenes (OpenCV)
  - Extracción de datos estructurados
  - Tareas de mantenimiento
  
- [x] **Configuración Celery** (`backend/celery_app.py`)
  - 3 colas de prioridad
  - Beat scheduler
  - Retry automático
  
- [x] **Migración de BD** (`backend/alembic/versions/aad2d51d6f6c_add_ocr_tables.py`)
  - Tablas OCR con índices
  
- [x] **Tests** (`backend/tests/test_ocr.py`)
  - 20+ tests unitarios y de integración
  
- [x] **Documentación** (`backend/docs/ARQUITECTURA_OCR.md`)
  - Arquitectura completa
  - Guías de troubleshooting
  - Ejemplos de uso

### ✅ Infraestructura (Docker)

- [x] **Dockerfile** actualizado con Tesseract y OpenCV
- [x] **docker-compose.yml** con 4 servicios nuevos:
  - `celery-worker`: Workers de procesamiento
  - `celery-beat`: Tareas programadas
  - `celery-flower`: Monitor web (puerto 5555)
  - Configuración de Redis optimizada
  
- [x] **Requirements.txt** actualizado con:
  - celery==5.3.4
  - pytesseract==0.3.10
  - opencv-python-headless==4.8.1.78
  - Pillow==10.1.0
  - flower==2.0.1

### ✅ Integración

- [x] **main.py** actualizado para registrar router OCR
- [x] Router OCR disponible en `/api/v1/ocr/*`
- [x] Módulo OCR aparece en endpoint raíz `/`

## 🚀 Quick Start

### 1. Aplicar Migración

```bash
cd backend
alembic upgrade head
```

### 2. Iniciar Servicios

```bash
# Desde raíz del proyecto
docker-compose up -d

# Verificar servicios OCR
docker-compose ps | grep celery
```

### 3. Verificar Instalación

```bash
# Ver logs de worker
docker-compose logs -f celery-worker

# Acceder a Flower (monitor)
open http://localhost:5555

# Verificar endpoint OCR
curl http://localhost:8000/api/v1/ocr/estadisticas
```

### 4. Procesar Primer Documento

```bash
# POST /api/v1/ocr/procesar/{id_documento}
curl -X POST "http://localhost:8000/api/v1/ocr/procesar/1?user_id=admin" \
  -H "Content-Type: application/json" \
  -d '{
    "idioma": "spa+eng",
    "prioridad": "normal",
    "binarizar": true,
    "denoise": true,
    "extraer_datos_estructurados": true
  }'

# Respuesta:
# {
#   "task_id": "abc123...",
#   "estado": "PENDIENTE",
#   "id_documento": 1,
#   "tiempo_estimado_segundos": 30
# }

# Consultar estado
curl http://localhost:8000/api/v1/ocr/status/abc123...

# Obtener resultado
curl http://localhost:8000/api/v1/ocr/resultado/1
```

## 📋 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/ocr/procesar/{id_documento}` | Iniciar procesamiento OCR |
| GET | `/api/v1/ocr/status/{task_id}` | Consultar estado de tarea |
| GET | `/api/v1/ocr/resultado/{id_documento}` | Obtener resultado completo |
| POST | `/api/v1/ocr/reprocesar/{id_documento}` | Reprocesar documento |
| GET | `/api/v1/ocr/estadisticas` | Estadísticas del sistema |
| DELETE | `/api/v1/ocr/cancelar/{task_id}` | Cancelar tarea |
| GET | `/api/v1/ocr/historial/{id_documento}` | Historial de reprocesos |

Ver documentación interactiva en: http://localhost:8000/api/docs

## 🧪 Ejecutar Tests

```bash
cd backend

# Tests unitarios de OCR
pytest tests/test_ocr.py -v

# Solo tests rápidos (sin mocks de Tesseract)
pytest tests/test_ocr.py -v -m "not slow"

# Con cobertura
pytest tests/test_ocr.py --cov=app.tasks.ocr_tasks --cov-report=html
```

## 🔧 Configuración Avanzada

### Ajustar Número de Workers

```yaml
# docker-compose.yml
celery-worker:
  command: >
    celery -A celery_app worker 
    --loglevel=info 
    --concurrency=8  # <-- Cambiar aquí (default: 4)
```

### Cambiar Límites de Tiempo

```python
# backend/celery_app.py
task_time_limit = 7200  # 2 horas (default: 1 hora)
task_soft_time_limit = 6600  # 1h 50min
```

### Configurar Idiomas Adicionales

```bash
# Dockerfile
RUN apt-get install -y \
    tesseract-ocr-fra \  # Francés
    tesseract-ocr-por    # Portugués
```

### Tareas Programadas

```python
# backend/celery_app.py - beat_schedule
beat_schedule = {
    'cleanup-old-ocr': {
        'task': 'ocr.cleanup_old_results',
        'schedule': crontab(hour=2, minute=0),  # 2 AM
        'args': (30,)  # Días de antigüedad
    },
    # ...
}
```

## 📊 Monitoreo

### Flower Dashboard

```bash
# Acceder a http://localhost:5555
# - Ver tareas activas/completadas/fallidas
# - Monitorear workers
# - Estadísticas en tiempo real
# - Revocar tareas
```

### Logs

```bash
# Worker logs
docker-compose logs -f celery-worker

# Beat logs (tareas programadas)
docker-compose logs -f celery-beat

# Flower logs
docker-compose logs -f celery-flower

# Todos los servicios OCR
docker-compose logs -f celery-worker celery-beat celery-flower
```

### Métricas

```bash
# Estadísticas OCR
curl http://localhost:8000/api/v1/ocr/estadisticas | jq

# Métricas generales
curl http://localhost:8000/metrics | jq
```

## 🐛 Troubleshooting

### Problema: "Tesseract not found"

**Solución:**

```bash
# Verificar instalación
docker-compose exec celery-worker which tesseract
docker-compose exec celery-worker tesseract --version

# Reinstalar si falta
docker-compose exec celery-worker apt-get update
docker-compose exec celery-worker apt-get install -y \
  tesseract-ocr tesseract-ocr-spa tesseract-ocr-eng
```

### Problema: Worker no procesa tareas

**Diagnóstico:**

```bash
# Ver estado de workers
docker-compose exec celery-worker celery -A celery_app inspect active

# Ver tareas en cola
docker-compose exec celery-worker celery -A celery_app inspect scheduled

# Estadísticas de workers
docker-compose exec celery-worker celery -A celery_app inspect stats
```

**Solución:**

```bash
# Reiniciar workers
docker-compose restart celery-worker

# Limpiar cola
docker-compose exec celery-worker celery -A celery_app purge
```

### Problema: Alto uso de memoria

**Solución:**

```python
# Reducir max_tasks_per_child en celery_app.py
worker_max_tasks_per_child = 50  # Default: 100

# Reducir concurrencia
# docker-compose.yml
--concurrency=2  # Default: 4
```

### Problema: Tarea atascada

**Solución:**

```bash
# Revocar tarea específica
docker-compose exec celery-worker \
  celery -A celery_app revoke <task_id> --terminate

# En Flower: http://localhost:5555 -> Tasks -> Revoke
```

## 📚 Recursos

- **Documentación Técnica**: `backend/docs/ARQUITECTURA_OCR.md`
- **API Docs (Swagger)**: http://localhost:8000/api/docs
- **Flower Monitor**: http://localhost:5555
- **Celery Docs**: https://docs.celeryq.dev/
- **Tesseract OCR**: https://github.com/tesseract-ocr/tesseract
- **OpenCV**: https://docs.opencv.org/

## 🔮 Próximas Mejoras

- [ ] Soporte para PDF multi-página
- [ ] OCR en tiempo real con WebSockets
- [ ] Clasificación automática de documentos (ML)
- [ ] Validación inteligente de datos extraídos
- [ ] Detección y extracción de firmas
- [ ] Procesamiento batch de múltiples documentos
- [ ] Cache de resultados para documentos duplicados
- [ ] Aceleración GPU (CUDA) para preprocesamiento

## 🤝 Contribución

Para agregar mejoras al servicio OCR:

1. Crear feature branch: `git checkout -b feature/ocr-mejora`
2. Actualizar código y tests
3. Ejecutar suite de tests: `pytest tests/test_ocr.py`
4. Actualizar documentación si es necesario
5. Commit y push: `git commit -m "feat(ocr): descripción"`
6. Crear Pull Request

## 📄 Licencia

Parte del Sistema de Trámites Migratorios de Panamá.

---

**✅ Implementación completada**: Enero 2025  
**👨‍💻 Desarrollado para**: Servicio Nacional de Migración de Panamá
