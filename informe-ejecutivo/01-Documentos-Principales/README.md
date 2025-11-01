# Documentación del Sistema de Workflows Dinámicos

Esta carpeta contiene la documentación técnica del sistema de workflows dinámicos de Trámites MVP Panamá.

## 📚 Índice de Documentación

### Mejoras y Cambios Recientes

- **[MEJORAS_LOGGING_Y_WORKFLOWS_2025-10-20.md](./MEJORAS_LOGGING_Y_WORKFLOWS_2025-10-20.md)**  
  Documentación completa y detallada de las mejoras implementadas el 20 de octubre de 2025.  
  **Contenido:**
  - Sistema de logging con UUID
  - Schemas anidados para workflows
  - Mapeo de códigos a IDs
  - Ejemplos completos de uso
  - Arquitectura técnica detallada

- **[RESUMEN_MEJORAS_2025-10-20.md](./RESUMEN_MEJORAS_2025-10-20.md)**  
  Resumen ejecutivo de las mejoras (versión corta para referencia rápida).  
  **Contenido:**
  - Resumen de cambios principales
  - Ejemplos básicos
  - Comandos útiles
  - Métricas de impacto

### Ejemplos de Workflows

- **[ejemplos/workflow_residencia_temporal.json](./ejemplos/workflow_residencia_temporal.json)**  
  Ejemplo completo de workflow para solicitud de residencia temporal.  
  **Incluye:**
  - 7 etapas (inicio, carga documentos, revisiones, correcciones, aprobación/rechazo)
  - 15 preguntas de diferentes tipos
  - 8 conexiones con condiciones
  - Validaciones y campos condicionales

## 🚀 Inicio Rápido

### Crear un Workflow Completo

```bash
# Usar el ejemplo de residencia temporal
curl -X POST http://localhost:8000/api/v1/workflow/workflows \
  -H "Content-Type: application/json" \
  -d @docs/ejemplos/workflow_residencia_temporal.json
```

### Ver Logs en Tiempo Real

```bash
# Logs del backend
docker-compose logs -f backend

# Logs en Dozzle (navegador)
# Abrir: http://localhost:9999
```

### Buscar Logs por UUID

```bash
# Buscar todos los logs de una petición específica
docker-compose logs backend | grep "[UUID-AQUI]"

# Ejemplo:
docker-compose logs backend | grep "[f0658942-a411-43fd-8083-c030f7308205]"
```

## 📖 Documentación de API

### Swagger/OpenAPI
```
http://localhost:8000/api/docs
```

### ReDoc
```
http://localhost:8000/api/redoc
```

## 🔑 Conceptos Clave

### Schemas Anidados

El sistema permite crear workflows completos con toda su estructura en una sola petición:

```
Workflow
  ├── Etapas (usa WorkflowEtapaCreateNested - sin workflow_id)
  │   └── Preguntas (usa WorkflowPreguntaCreateNested - sin etapa_id)
  └── Conexiones (usa WorkflowConexionCreateByCodigo - usa códigos en lugar de IDs)
```

### Mapeo de Códigos a IDs

Las conexiones usan **códigos de etapa** en lugar de IDs:

```json
{
  "conexiones": [
    {
      "etapa_origen_codigo": "INICIO",
      "etapa_destino_codigo": "DOCUMENTOS"
    }
  ]
}
```

El sistema automáticamente:
1. Crea las etapas y les asigna IDs
2. Mapea los códigos a los IDs generados
3. Crea las conexiones con los IDs correctos

### UUID para Trazabilidad

Cada petición HTTP tiene un UUID único:
```
[f0658942-a411-43fd-8083-c030f7308205]
```

Útil para:
- Buscar todos los logs de una petición
- Debugging distribuido
- Análisis de performance
- Correlación de eventos

## 🎯 Casos de Uso

### 1. Crear Workflow Simple

```json
POST /api/v1/workflow/workflows
{
  "codigo": "WORKFLOW_SIMPLE",
  "nombre": "Workflow Simple",
  "estado": "ACTIVO",
  "perfiles_creadores": ["ADMIN"],
  "etapas": [
    {
      "codigo": "INICIO",
      "nombre": "Inicio",
      "tipo_etapa": "ETAPA",
      "orden": 1,
      "es_etapa_inicial": true
    },
    {
      "codigo": "FIN",
      "nombre": "Fin",
      "tipo_etapa": "ETAPA",
      "orden": 2,
      "es_etapa_final": true
    }
  ],
  "conexiones": [
    {
      "etapa_origen_codigo": "INICIO",
      "etapa_destino_codigo": "FIN",
      "es_predeterminada": true
    }
  ]
}
```

### 2. Workflow con Preguntas y Validaciones

Ver: [ejemplos/workflow_residencia_temporal.json](./ejemplos/workflow_residencia_temporal.json)

### 3. Workflow con Condiciones

```json
{
  "conexiones": [
    {
      "etapa_origen_codigo": "REVISION",
      "etapa_destino_codigo": "APROBADO",
      "nombre": "Aprobar",
      "condicion": {
        "pregunta": "DECISION",
        "valor": "APROBAR"
      }
    },
    {
      "etapa_origen_codigo": "REVISION",
      "etapa_destino_codigo": "RECHAZADO",
      "nombre": "Rechazar",
      "condicion": {
        "pregunta": "DECISION",
        "valor": "RECHAZAR"
      }
    }
  ]
}
```

## 🔧 Tipos de Preguntas Soportados

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `RESPUESTA_TEXTO` | Campo de texto corto | Nombre, Email |
| `RESPUESTA_PARRAFO` | Campo de texto largo | Comentarios, Observaciones |
| `LISTA` | Lista desplegable | Nacionalidad, País |
| `OPCIONES` | Radio buttons o checkboxes | SI/NO, Múltiple selección |
| `CARGA_ARCHIVO` | Upload de archivos | Pasaporte, Documentos |

## 🛠️ Herramientas

### Dozzle (Logs en Tiempo Real)
```
URL: http://localhost:9999
Características:
- Búsqueda en tiempo real
- Filtros por contenedor
- Búsqueda por texto/regex
- Export de logs
```

### Docker Commands

```bash
# Reiniciar backend
docker-compose restart backend

# Ver logs
docker-compose logs backend
docker-compose logs -f backend  # En tiempo real
docker-compose logs --tail=100 backend  # Últimas 100 líneas

# Ejecutar comando en contenedor
docker exec tramites-backend bash -c "comando"

# Copiar archivo al contenedor
docker cp archivo.json tramites-backend:/tmp/
```

## 📊 Métricas y Monitoreo

### Endpoints de Métricas

```bash
# Health check
curl http://localhost:8000/health

# Métricas (si están habilitadas)
curl http://localhost:8000/metrics
```

### Logs Estructurados

Los logs incluyen:
- ✅ UUID de request
- ✅ Método HTTP
- ✅ Path
- ✅ Status code
- ✅ Tiempo de procesamiento
- ✅ Request body (en errores)
- ✅ Response body (en errores)
- ✅ IP del cliente

## ⚠️ Troubleshooting

### Error: "Etapa origen con código 'XXX' no encontrada"

**Causa:** El código de etapa en las conexiones no coincide con los códigos de las etapas definidas.

**Solución:** Verificar que los códigos en `etapa_origen_codigo` y `etapa_destino_codigo` existan en el array de `etapas`.

### Error: "Field required" en etapa o pregunta

**Causa:** Estás usando el schema antiguo que requiere `workflow_id` o `etapa_id`.

**Solución:** Usar el endpoint correcto:
- Para workflow completo: `POST /api/v1/workflow/workflows` (sin IDs)
- Para etapa individual: `POST /api/v1/workflow/workflows/{workflow_id}/etapas` (con workflow_id)

### No veo el body en los logs de error

**Causa:** El middleware solo captura body en errores 4xx/5xx.

**Solución:** Verificar que el error sea realmente 400+ y que el método sea POST/PUT/PATCH.

## 📝 Changelog

### [2025-10-20]
- ✨ UUID único para peticiones
- ✨ Schemas anidados para workflows completos
- ✨ Uso de códigos en conexiones
- ✨ Logging mejorado con captura de body
- 🐛 Fix MSSQL ORDER BY
- 🐛 Fix FK length en PPSH

## 🔗 Enlaces Útiles

- [Repositorio GitHub](https://github.com/juncid/tramites-mvp-panama)
- [Documentación API](http://localhost:8000/api/docs)
- [Dozzle](http://localhost:9999)

## 📞 Soporte

Para preguntas técnicas:
1. Revisar la documentación completa en `MEJORAS_LOGGING_Y_WORKFLOWS_2025-10-20.md`
2. Revisar los ejemplos en `ejemplos/`
3. Consultar los logs en Dozzle

---

**Última actualización:** 20 de Octubre de 2025
