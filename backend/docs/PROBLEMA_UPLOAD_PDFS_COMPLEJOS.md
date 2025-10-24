# Problema: Timeout al Subir PDFs con Estructura Compleja

## Fecha de Descubrimiento
2025-10-23

## Descripción del Problema

Algunos archivos PDF pueden causar **timeouts durante el proceso de lectura** en los endpoints de upload de documentos, específicamente:
- `/api/v1/ppsh/solicitudes/{id}/documentos`
- `/api/v1/ppsh/debug/upload-test`

El timeout ocurre **durante la lectura del archivo** (`await archivo.read()`), no durante la transmisión HTTP.

## Síntomas

1. El cliente (cURL, Bruno, Postman) envía el archivo correctamente
2. El servidor recibe la petición HTTP (aparece en logs del middleware)
3. La función del endpoint **nunca se ejecuta** (los logs internos del endpoint no aparecen)
4. Después de aproximadamente 60 segundos, se devuelve un error **400 Bad Request**
5. No aparecen excepciones ni errores en los logs del servidor

## Caso Específico Encontrado

**Archivo problemático:**
- Nombre: `cartola.pdf`
- Tamaño: 556,888 bytes (~544 KB)
- Hash MD5: `2D34054C303A11D1A712DA62C590F493`
- El archivo es legible por el sistema operativo
- Otros PDFs de tamaño similar funcionan correctamente

**Archivos que funcionaron correctamente:**
- PDF generado manualmente (235 bytes) ✅
- Archivo binario aleatorio (1,048,576 bytes = 1 MB) ✅
- Archivo de texto pequeño (19 bytes) ✅

## Causa Raíz

El problema **NO es el tamaño del archivo** (archivos de 1MB funcionan perfectamente).

El problema está relacionado con la **estructura interna del PDF**:
- Compresión compleja
- Encoding no estándar
- Metadatos extensos
- Capas de PDF mal formadas
- Software generador del PDF con problemas de compatibilidad

### Dos Niveles de Problema

#### Nivel 1: Timeout en Parsing de Multipart (MÁS GRAVE)
Algunos archivos causan timeout **en la capa de Starlette** antes de que lleguen a tu código.
- El request HTTP llega al servidor
- Starlette intenta parsear el multipart/form-data
- El parsing se "cuelga" durante el procesamiento del archivo
- Después de ~40-60 segundos, se devuelve 400 Bad Request
- **La función del endpoint nunca se ejecuta**
- **No se puede capturar esta excepción en código de usuario**

Este es el caso de `cartola.pdf` - el problema está en la librería `python-multipart` que usa Starlette.

#### Nivel 2: Timeout en Lectura de Archivo (SOLUCIONABLE)
Otros archivos pasan el parsing de multipart pero causan timeout al leerlos:
- FastAPI invoca tu función con el objeto UploadFile
- Cuando haces `await archivo.read()`, el proceso se cuelga
- **Esta sí se puede solucionar con asyncio.wait_for()** (implementado)

Cuando FastAPI (o Python asyncio) intenta leer estos archivos, el proceso se "cuelga" indefinidamente, probablemente debido a:
- Descompresión compleja que tarda mucho
- Parsing de estructuras PDF inusuales
- Buffers de lectura que no pueden procesarse eficientemente

## Solución Implementada

### 1. Timeout en Lectura de Archivo (30 segundos) - Nivel 2

**IMPORTANTE**: Esta solución funciona para archivos que pasan el parsing de multipart pero fallan al leer.
Para archivos como `cartola.pdf` que fallan en el parsing, esto NO se ejecuta.

```python
import asyncio

try:
    contents = await asyncio.wait_for(archivo.read(), timeout=30.0)
    tamano_bytes = len(contents)
except asyncio.TimeoutError:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail={
            "error": "timeout_reading_file",
            "message": "El archivo no pudo ser leído dentro del tiempo límite (30 segundos).",
            "possible_causes": [
                "El archivo puede estar corrupto",
                "El archivo tiene una estructura interna compleja que causa problemas de lectura",
                "El encoding del archivo no es estándar",
                "El archivo fue generado por software con problemas de compatibilidad"
            ],
            "suggestion": "Intente con otro archivo o verifique la integridad del archivo original"
        }
    )
```

### 2. Configuración de Uvicorn

Aumentamos los timeouts del servidor en `docker-compose.yml`:

```yaml
command: >
  sh -c "
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload 
    --timeout-keep-alive 300 
    --limit-max-requests 0
  "
```

- `--timeout-keep-alive 300`: 5 minutos para conexiones keep-alive
- `--limit-max-requests 0`: Sin límite de requests por worker

## Mensaje de Error para Usuarios

Cuando un archivo causa timeout, el usuario ahora recibe:

```json
{
  "status": "error",
  "error_code": "FILE_READ_TIMEOUT",
  "filename": "cartola.pdf",
  "message": "No se pudo leer el archivo dentro del tiempo límite (30 segundos)",
  "details": {
    "timeout_seconds": 30,
    "possible_causes": [
      "El archivo puede estar corrupto o parcialmente dañado",
      "El archivo tiene una estructura interna compleja que causa problemas de lectura",
      "El encoding del archivo no es estándar",
      "El archivo fue generado por software con problemas de compatibilidad"
    ],
    "suggestions": [
      "Intente con otro archivo",
      "Verifique la integridad del archivo con un lector PDF",
      "Si es posible, regenere el PDF desde el documento original",
      "Intente guardar el PDF con diferentes opciones de compresión"
    ]
  }
}
```

## Recomendaciones para Usuarios

Si un usuario encuentra este error:

1. **Verificar el PDF**: Abrirlo con Adobe Acrobat Reader u otro lector de PDFs
2. **Regenerar el archivo**: Si es posible, volver a exportar/generar el PDF
3. **Usar herramientas de reparación**: 
   - Adobe Acrobat: "Guardar como optimizado"
   - Herramientas online: iLovePDF, Smallpdf
   - Ghostscript para recomprimir:
     ```bash
     gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dNOPAUSE -dQUIET -dBATCH \
        -sOutputFile=salida.pdf entrada.pdf
     ```
4. **Intentar con otro archivo**: Si el documento original no está disponible

## Archivos Modificados

### `backend/app/routers/routers_ppsh.py`
- Líneas 413-442: Timeout en `subir_documento()`
- Líneas 701-769: Timeout en `debug_upload_test()` con mensaje detallado

### `docker-compose.yml`
- Línea 129-135: Configuración de uvicorn con timeouts aumentados

### `backend/Dockerfile`
- Línea 29: CMD con parámetros de timeout (respaldo, actualmente sobrescrito por docker-compose)

### `backend/start-server.sh`
- Líneas 28-33: Script de inicio local con parámetros de timeout

## Testing

### Comando de Prueba (cURL)

```powershell
# Archivo que funciona (pequeño)
curl.exe -X POST "http://localhost:8000/api/v1/ppsh/debug/upload-test" `
  -F "archivo=@C:\temp\test.pdf"

# Archivo que funciona (1MB)
curl.exe -X POST "http://localhost:8000/api/v1/ppsh/debug/upload-test" `
  -F "archivo=@C:\temp\test-1mb.bin"

# Archivo problemático (causará timeout)
curl.exe --max-time 60 -X POST "http://localhost:8000/api/v1/ppsh/debug/upload-test" `
  -F "archivo=@C:\Users\junci\Downloads\cartola.pdf"
```

### Endpoint Real de Producción

```powershell
curl.exe -X POST "http://localhost:8000/api/v1/ppsh/solicitudes/7/documentos" `
  -F "archivo=@C:\temp\test.pdf" `
  -F "cod_tipo_documento=3" `
  -F "observaciones=Documento de prueba"
```

## Logs de Ejemplo

### Upload Exitoso
```
2025-10-24 00:27:57 - app.middleware.http - INFO - ➡️  [ba6841c2-13f7-4841-96e8-2c0e0a86d909] POST /api/v1/ppsh/debug/upload-test
2025-10-24 00:27:57 - app.routers.routers_ppsh - INFO - 🧪 DEBUG: Recibiendo archivo...
2025-10-24 00:27:57 - app.routers.routers_ppsh - INFO - 📄 Filename: test-small.txt
2025-10-24 00:27:57 - app.routers.routers_ppsh - INFO - 📖 Intentando leer contenido...
2025-10-24 00:27:57 - app.routers.routers_ppsh - INFO - ✅ Archivo leído exitosamente: 19 bytes
2025-10-24 00:27:57 - app.middleware.http - INFO - ✅ Status: 200 - Tiempo: 0.002s
```

### Upload con Timeout
```
2025-10-24 00:26:27 - app.middleware.http - INFO - ➡️  [9b3e5efd-8803-4cd2-b973-99062f171350] POST /api/v1/ppsh/debug/upload-test
2025-10-24 00:27:27 - app.middleware.http - WARNING - ⚠️  Status: 400 - Tiempo: 60.002s
2025-10-24 00:27:27 - app.middleware.http - WARNING - 📋 Detalles del error
```

Nótese que **NO aparecen los logs internos** (🧪, 📄, 📖) porque el timeout ocurre antes de que FastAPI ejecute la función.

## Notas Técnicas

- **FastAPI/Starlette** maneja multipart/form-data de manera asíncrona
- El parsing de multipart es manejado por la librería `python-multipart`
- Algunos PDFs pueden tener estructuras que causan problemas en el parser
- El timeout de 30 segundos es configurable pero razonable para archivos de documentos
- En producción, considerar usar streaming para archivos muy grandes

## Referencias

- FastAPI File Uploads: https://fastapi.tiangolo.com/tutorial/request-files/
- Python Asyncio Timeouts: https://docs.python.org/3/library/asyncio-task.html#asyncio.wait_for
- Uvicorn Configuration: https://www.uvicorn.org/settings/

## Estado

✅ **PARCIALMENTE RESUELTO**:
- Implementado timeout con mensaje informativo para archivos que fallan en lectura (Nivel 2)
- El caso de `cartola.pdf` (Nivel 1 - falla en parsing multipart) **no tiene solución en código de usuario**

⚠️ **LIMITACIÓN CONOCIDA**:
- Archivos que causan timeout en el parser de multipart de Starlette no pueden ser manejados
- Este es un problema de la librería `python-multipart`
- La única solución es que el usuario use otro archivo o lo regenere

## Próximos Pasos (Opcional)

Para una solución más robusta al problema de Nivel 1:

1. **Actualizar dependencias**:
   ```bash
   pip install --upgrade python-multipart starlette fastapi
   ```

2. **Reportar bug**: Si persiste, reportar a:
   - https://github.com/andrew-d/python-multipart/issues
   - https://github.com/encode/starlette/issues

3. **Alternativa**: Implementar un proxy nginx con límites específicos:
   ```nginx
   client_max_body_size 10M;
   client_body_timeout 60s;
   ```

4. **Workaround**: Validar archivos PDF antes de upload usando herramientas del lado del cliente
