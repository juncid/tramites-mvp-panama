# 🔍 Sistema OCR - Documentación

> Reconocimiento óptico de caracteres para documentos de identidad

---

## 📋 Índice

| Documento | Descripción |
|-----------|-------------|
| [SISTEMA_UPLOAD_OCR_IMPLEMENTADO.md](SISTEMA_UPLOAD_OCR_IMPLEMENTADO.md) | Sistema completo de upload + OCR |
| [OCR_ENDPOINT_IMPLEMENTATION.md](OCR_ENDPOINT_IMPLEMENTATION.md) | Implementación del endpoint de documentos |
| [PRUEBA_OCR_E2E.md](PRUEBA_OCR_E2E.md) | Guía de prueba end-to-end |
| [SISTEMA_OCR_LISTO.md](SISTEMA_OCR_LISTO.md) | Estado actual del sistema |
| [OCR_SISTEMA_FUNCIONANDO.md](OCR_SISTEMA_FUNCIONANDO.md) | Correcciones aplicadas |

---

## 🚀 Inicio Rápido

### 1. Verificar que los servicios estén corriendo

```bash
docker-compose ps
```

Servicios requeridos:
- ✅ `backend` - API FastAPI
- ✅ `celery-worker` - Procesamiento OCR asíncrono
- ✅ `redis` - Message broker

### 2. Subir un documento

```bash
curl -X POST "http://localhost:8000/api/v1/ppsh/documentos/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@pasaporte.pdf" \
  -F "id_solicitud=1" \
  -F "tipo_documento=PASAPORTE"
```

### 3. Verificar resultado OCR

```bash
curl "http://localhost:8000/api/v1/ppsh/solicitudes/1/documentos" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔧 Arquitectura

```
Frontend (Upload)
    ↓
FastAPI (Endpoint)
    ↓
Redis (Queue)
    ↓
Celery Worker
    ↓
Tesseract OCR
    ↓
SQL Server (Resultados)
```

---

## 📊 Formatos Soportados

| Formato | Soporte | Notas |
|---------|---------|-------|
| PDF | ✅ | Convertido a imagen |
| PNG | ✅ | Directo |
| JPG/JPEG | ✅ | Directo |
| TIFF | ✅ | Multi-página |

---

## ⚠️ Troubleshooting

### OCR no procesa documentos

1. Verificar que Celery esté corriendo:
   ```bash
   docker-compose logs celery-worker
   ```

2. Verificar Redis:
   ```bash
   docker exec -it redis redis-cli ping
   ```

3. Ver errores específicos:
   ```bash
   docker-compose logs -f celery-worker | grep -i error
   ```

### Resultados de baja calidad

- Verificar que la imagen tenga al menos 300 DPI
- Usar documentos escaneados, no fotos
- El documento debe estar bien iluminado y sin reflejos
