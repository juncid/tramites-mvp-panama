# Sistema de Upload y OCR - Implementación Completa

**Fecha:** 25 de Noviembre 2025  
**Estado:** ✅ FUNCIONANDO  

## Resumen

Se implementó un sistema completo de carga y descarga de archivos con procesamiento OCR automático para el proceso PPSH.

## Características Implementadas

### 1. Upload de Documentos
- **Formatos soportados:** PDF, PNG, JPG/JPEG
- **Tamaño máximo:** 100MB
- **Compresión automática:** Imágenes > 4000px se redimensionan y comprimen a JPEG 85%
- **Almacenamiento:** Disco local en volumen Docker (`/app/uploads`)

### 2. OCR Automático
- **Motor:** Tesseract OCR con soporte español + inglés
- **Procesamiento:** Asíncrono via Celery
- **Timeout:** 60 segundos
- **Preprocesamiento:** CLAHE, binarización adaptativa, deskew

### 3. Notificaciones en Tiempo Real
- **WebSocket:** `/api/v1/ws/ocr/{task_id}` para progreso en tiempo real
- **REST alternativo:** `/api/v1/ocr/status/{task_id}` para polling

### 4. Descarga de Documentos
- **Endpoint:** `GET /api/v1/ppsh/documentos/{id}/descargar`
- **Headers:** Content-Disposition para descarga directa

## Endpoints API

### Upload
```
POST /api/v1/ppsh/solicitudes/{id_solicitud}/documentos
Content-Type: multipart/form-data

Form Data:
- archivo: File (requerido)
- tipo_documento_texto: string (opcional)
- ejecutar_ocr: boolean (default: true)

Response:
{
  "id_documento": 4012,
  "ruta_archivo": "solicitudes/3049/4012_..._archivo.jpg",
  "ocr_task_id": "uuid-de-tarea",
  "ocr_websocket_url": "/ws/ocr/uuid-de-tarea"
}
```

### Estado OCR
```
GET /api/v1/ocr/status/{task_id}

Response:
{
  "task_id": "uuid",
  "estado": "COMPLETADO",
  "porcentaje_completado": 100,
  "confianza_promedio": 85.5,
  "tiempo_procesamiento_ms": 744
}
```

### Descarga
```
GET /api/v1/ppsh/documentos/{id_documento}/descargar

Response: Binary file with Content-Disposition header
```

### WebSocket OCR
```
WS /api/v1/ws/ocr/{task_id}

Mensajes:
- type: "connected" - Conexión establecida
- type: "pending" - Tarea en cola
- type: "progress" - Actualización de progreso
- type: "complete" - Tarea completada
- type: "error" - Error en procesamiento
```

## Archivos Creados/Modificados

### Backend

| Archivo | Descripción |
|---------|-------------|
| `app/services/file_storage_service.py` | Servicio de almacenamiento con compresión |
| `app/routers/websocket_ocr.py` | WebSocket para progreso OCR |
| `app/routers/routers_ppsh.py` | Endpoints de upload/download actualizados |
| `app/tasks/ocr_tasks.py` | Tarea Celery `procesar_documento_ocr` |
| `app/schemas/schemas_ppsh.py` | Schema `DocumentoUploadResponse` |
| `app/utils/middleware.py` | Fix para excluir multipart del body logging |

### Frontend

| Archivo | Descripción |
|---------|-------------|
| `components/Workflow/QuestionViews/CargaArchivoView.tsx` | Componente con WebSocket |
| `components/PPSH/OCRLoadingModal.tsx` | Modal con barra de progreso |

### Docker

| Archivo | Cambio |
|---------|--------|
| `docker-compose.yml` | Volumen `uploads-data` compartido entre backend y celery-worker |

## Configuración

### Variables de Entorno
```yaml
UPLOADS_DIR: /app/uploads
MAX_UPLOAD_SIZE_MB: 100
IMAGE_MAX_DIMENSION: 4000
OCR_TIMEOUT_SECONDS: 60
```

### Volumen Docker
```yaml
volumes:
  uploads-data:
    name: tramites-uploads-data

services:
  backend:
    volumes:
      - uploads-data:/app/uploads
  
  celery-worker:
    volumes:
      - uploads-data:/app/uploads
```

## Flujo de Trabajo

```
┌─────────────────┐
│  Usuario sube   │
│    archivo      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Validación    │
│ (tamaño, ext)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Compresión    │
│  (si imagen)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Guardar disco   │
│ + Registro BD   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Encolar OCR    │
│   (Celery)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Frontend recibe │
│   task_id       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Conecta WS para │
│    progreso     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Worker procesa  │
│      OCR        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Resultado via   │
│    WebSocket    │
└─────────────────┘
```

## Pruebas Realizadas

### Upload PDF ✅
```bash
curl -X POST ".../documentos" -F "archivo=@test.pdf"
# Status: 201, archivo guardado
```

### Upload PNG con OCR ✅
```bash
curl -X POST ".../documentos" -F "archivo=@test.png" -F "ejecutar_ocr=true"
# Status: 201, OCR encolado, task_id retornado
```

### Estado OCR ✅
```bash
curl ".../ocr/status/{task_id}"
# Estado: COMPLETADO, confianza: 19.5%, tiempo: 744ms
```

### Descarga ✅
```bash
curl -o descarga.jpg ".../documentos/{id}/descargar"
# Archivo descargado correctamente
```

## Problemas Resueltos

1. **Middleware consumía body:** El middleware de logging consumía el body de requests multipart. Se solucionó excluyendo rutas de documentos del body logging.

2. **Volumen no compartido:** El celery-worker no tenía el volumen de uploads montado. Se recreó el contenedor con el volumen correcto.

3. **response_model filtraba campos:** El `response_model=DocumentoResponse` filtraba `ocr_task_id`. Se creó `DocumentoUploadResponse` con los campos adicionales.

## Próximos Pasos Sugeridos

1. [ ] Agregar autenticación al endpoint de upload
2. [ ] Implementar límite de rate para uploads
3. [ ] Agregar validación de contenido (magic bytes)
4. [ ] Implementar limpieza automática de archivos antiguos
5. [ ] Añadir métricas de uso de almacenamiento
