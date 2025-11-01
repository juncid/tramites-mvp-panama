# API REST - Sistema SIM_FT_*

Documentación de los endpoints API REST para el Sistema Integrado de Migración (SIM_FT_*).

## 📋 Tabla de Contenidos

- [Introducción](#introducción)
- [URL Base](#url-base)
- [Catálogos](#catálogos)
- [Configuración](#configuración)
- [Trámites](#trámites)
- [Estadísticas](#estadísticas)
- [Ejemplos de Uso](#ejemplos-de-uso)

## Introducción

El sistema SIM_FT_* proporciona una API RESTful completa para la gestión de trámites migratorios en Panamá. Incluye:

- **11 Tablas**: Catálogos, configuración, transaccionales y cierre
- **Nomenclatura Estándar**: Prefijos SIM_FT_*, COD_*, NUM_*, IND_*, FEC_*
- **Claves Compuestas**: Particionamiento por año, número de trámite y registro
- **Flujo de Pasos**: Configuración dinámica de workflows
- **Auditoría**: Campos automáticos de creación y modificación

## URL Base

```
http://localhost:8000/api/v1/sim-ft
```

## Catálogos

### Estados

Gestión de estados del sistema.

#### Listar Estados

```http
GET /estatus
```

**Query Parameters:**
- `skip` (int): Offset para paginación (default: 0)
- `limit` (int): Límite de resultados (default: 100)
- `activo` (bool): Filtrar por estado activo

**Ejemplo de Respuesta:**
```json
[
  {
    "COD_ESTATUS": "01",
    "NOM_ESTATUS": "Iniciado",
    "IND_ACTIVO": "S",
    "ID_USUARIO_CREA": "SYSTEM",
    "FEC_CREA_REG": "2025-10-23T01:02:14.844692"
  }
]
```

#### Obtener Estado por Código

```http
GET /estatus/{cod_estatus}
```

#### Crear Estado

```http
POST /estatus
Content-Type: application/json

{
  "COD_ESTATUS": "11",
  "NOM_ESTATUS": "Nuevo Estado",
  "IND_ACTIVO": "S",
  "ID_USUARIO_CREA": "ADMIN"
}
```

#### Actualizar Estado

```http
PUT /estatus/{cod_estatus}
Content-Type: application/json

{
  "NOM_ESTATUS": "Estado Modificado",
  "ID_USUARIO_MODIF": "ADMIN"
}
```

### Conclusiones

Gestión de tipos de conclusión.

```http
GET /conclusiones
POST /conclusiones
```

Misma estructura que Estados.

### Prioridades

Gestión de niveles de prioridad (U=Urgente, A=Alta, N=Normal, B=Baja).

```http
GET /prioridades
POST /prioridades
```

### Tipos de Trámites

Catálogo de tipos de trámites disponibles.

#### Listar Tipos de Trámites

```http
GET /tramites-tipos
```

**Ejemplo de Respuesta:**
```json
[
  {
    "COD_TRAMITE": "PPSH",
    "DESC_TRAMITE": "Permiso de Protección de Seguridad Humanitaria",
    "PAG_TRAMITE": "https://www.migracion.gob.pa/ppsh",
    "IND_ACTIVO": "S",
    "ID_USUARIO_CREA": "SYSTEM",
    "FEC_CREA_REG": "2025-10-23T01:02:14.844692"
  }
]
```

#### Obtener Tipo Específico

```http
GET /tramites-tipos/{cod_tramite}
```

#### Crear Tipo de Trámite

```http
POST /tramites-tipos
Content-Type: application/json

{
  "COD_TRAMITE": "NUEVA",
  "DESC_TRAMITE": "Nuevo Tipo de Trámite",
  "PAG_TRAMITE": "https://ejemplo.com",
  "IND_ACTIVO": "S",
  "ID_USUARIO_CREA": "ADMIN"
}
```

#### Actualizar Tipo de Trámite

```http
PUT /tramites-tipos/{cod_tramite}
Content-Type: application/json

{
  "DESC_TRAMITE": "Descripción Actualizada",
  "ID_USUARIO_MODIF": "ADMIN"
}
```

#### Desactivar Tipo de Trámite

```http
DELETE /tramites-tipos/{cod_tramite}
```

## Configuración

### Pasos

Definición de pasos para cada tipo de trámite.

#### Listar Pasos

```http
GET /pasos?cod_tramite=PPSH
```

**Query Parameters:**
- `cod_tramite` (string): Filtrar por tipo de trámite
- `activo` (bool): Filtrar por estado activo
- `skip`, `limit`: Paginación

**Ejemplo de Respuesta:**
```json
[
  {
    "COD_TRAMITE": "PPSH",
    "NUM_PASO": 1,
    "NOM_DESCRIPCION": "Recepción de Documentos",
    "IND_ACTIVO": "S",
    "ID_USUARIO_CREA": "SYSTEM",
    "FEC_CREA_REG": "2025-10-23T01:02:14.844692"
  }
]
```

#### Obtener Paso Específico

```http
GET /pasos/{cod_tramite}/{num_paso}
```

#### Crear Paso

```http
POST /pasos
Content-Type: application/json

{
  "COD_TRAMITE": "PPSH",
  "NUM_PASO": 6,
  "NOM_DESCRIPCION": "Nuevo Paso del Flujo",
  "IND_ACTIVO": "S",
  "ID_USUARIO_CREA": "ADMIN"
}
```

#### Actualizar Paso

```http
PUT /pasos/{cod_tramite}/{num_paso}
Content-Type: application/json

{
  "NOM_DESCRIPCION": "Descripción Actualizada",
  "ID_USUARIO_MODIF": "ADMIN"
}
```

### Flujo de Pasos (PasoXTram)

Configuración del flujo entre pasos.

#### Listar Flujo de Pasos

```http
GET /flujo-pasos?cod_tramite=PPSH
```

**Ejemplo de Respuesta:**
```json
[
  {
    "COD_TRAMITE": "PPSH",
    "NUM_PASO": 1,
    "COD_SECCION": "ATEN",
    "ID_PASO_SGTE": 2,
    "IND_ACTIVO": "S",
    "ID_USUARIO_CREA": "SYSTEM",
    "FEC_CREA_REG": "2025-10-23T01:02:14.844692"
  }
]
```

#### Crear Configuración de Flujo

```http
POST /flujo-pasos
Content-Type: application/json

{
  "COD_TRAMITE": "PPSH",
  "NUM_PASO": 6,
  "COD_SECCION": "REVI",
  "ID_PASO_SGTE": 7,
  "IND_ACTIVO": "S",
  "ID_USUARIO_CREA": "ADMIN"
}
```

### Usuarios y Secciones

Asignación de usuarios a secciones.

```http
GET /usuarios-secciones?id_usuario=USER123
POST /usuarios-secciones
```

## Trámites

### Encabezados de Trámites

#### Listar Trámites

```http
GET /tramites
```

**Query Parameters:**
- `num_annio` (int): Filtrar por año
- `cod_tramite` (string): Filtrar por tipo
- `ind_estatus` (string): Filtrar por estado
- `ind_prioridad` (string): Filtrar por prioridad
- `fecha_desde` (datetime): Fecha inicio
- `fecha_hasta` (datetime): Fecha fin
- `skip`, `limit`: Paginación

**Ejemplo de Respuesta:**
```json
[
  {
    "NUM_ANNIO": 2025,
    "NUM_TRAMITE": 1,
    "NUM_REGISTRO": 1,
    "COD_TRAMITE": "PPSH",
    "FEC_INI_TRAMITE": "2025-10-23T10:00:00",
    "FEC_FIN_TRAMITE": null,
    "IND_ESTATUS": "02",
    "IND_CONCLUSION": null,
    "IND_PRIORIDAD": "N",
    "OBS_OBSERVA": "Trámite en proceso",
    "HITS_TRAMITE": 1,
    "ID_USUARIO_CREA": "ADMIN",
    "FEC_ACTUALIZA": "2025-10-23T10:00:00"
  }
]
```

#### Obtener Trámite Específico

```http
GET /tramites/{num_annio}/{num_tramite}/{num_registro}
```

#### Crear Trámite

```http
POST /tramites
Content-Type: application/json

{
  "NUM_ANNIO": 2025,
  "NUM_REGISTRO": 1,
  "COD_TRAMITE": "PPSH",
  "FEC_INI_TRAMITE": "2025-10-23T10:00:00",
  "IND_ESTATUS": "01",
  "IND_PRIORIDAD": "N",
  "OBS_OBSERVA": "Nuevo trámite PPSH",
  "ID_USUARIO_CREA": "ADMIN"
}
```

**Nota:** `NUM_TRAMITE` se genera automáticamente.

#### Actualizar Trámite

```http
PUT /tramites/{num_annio}/{num_tramite}/{num_registro}
Content-Type: application/json

{
  "IND_ESTATUS": "03",
  "OBS_OBSERVA": "Trámite en revisión"
}
```

### Detalle de Pasos

#### Listar Pasos de un Trámite

```http
GET /tramites/{num_annio}/{num_tramite}/pasos?num_registro=1
```

#### Obtener Paso Específico

```http
GET /tramites/{num_annio}/{num_tramite}/{num_paso}/{num_registro}
```

#### Registrar Nuevo Paso

```http
POST /tramites/{num_annio}/{num_tramite}/pasos
Content-Type: application/json

{
  "NUM_PASO": 1,
  "NUM_REGISTRO": 1,
  "COD_TRAMITE": "PPSH",
  "COD_SECCION": "ATEN",
  "COD_AGENCIA": "0001",
  "ID_USUAR_RESP": "USER123",
  "OBS_OBSERVACION": "Documentos recibidos y verificados",
  "NUM_PASO_SGTE": 2,
  "IND_ESTATUS": "02",
  "ID_USUARIO_CREA": "USER123"
}
```

**Nota:** `NUM_ACTIVIDAD` se genera automáticamente. El trámite se actualiza automáticamente (HITS_TRAMITE++, FEC_ACTUALIZA).

#### Actualizar Paso

```http
PUT /tramites/{num_annio}/{num_tramite}/{num_paso}/{num_registro}
Content-Type: application/json

{
  "OBS_OBSERVACION": "Observación actualizada",
  "IND_ESTATUS": "04"
}
```

### Cierre de Trámites

#### Cerrar Trámite

```http
POST /tramites/{num_annio}/{num_tramite}/{num_registro}/cierre
Content-Type: application/json

{
  "FEC_CIERRE": "2025-10-23T15:00:00",
  "ID_USUARIO_CIERRE": "ADMIN",
  "OBS_CIERRE": "Trámite completado exitosamente",
  "COD_CONCLUSION": "01",
  "ID_USUARIO_CREA": "ADMIN"
}
```

**Nota:** Actualiza automáticamente el trámite: `FEC_FIN_TRAMITE`, `IND_CONCLUSION`, `IND_ESTATUS=07`.

#### Consultar Cierre

```http
GET /tramites/{num_annio}/{num_tramite}/{num_registro}/cierre
```

## Estadísticas

### Trámites por Estado

```http
GET /estadisticas/tramites-por-estado?num_annio=2025
```

**Ejemplo de Respuesta:**
```json
{
  "estadisticas": [
    {
      "estado": "01",
      "total": 15
    },
    {
      "estado": "02",
      "total": 32
    }
  ]
}
```

### Trámites por Tipo

```http
GET /estadisticas/tramites-por-tipo?num_annio=2025
```

**Ejemplo de Respuesta:**
```json
{
  "estadisticas": [
    {
      "tipo_tramite": "PPSH",
      "total": 120
    },
    {
      "tipo_tramite": "VISA_TEMP",
      "total": 85
    }
  ]
}
```

### Tiempo Promedio de Procesamiento

```http
GET /estadisticas/tiempo-promedio?cod_tramite=PPSH&num_annio=2025
```

**Ejemplo de Respuesta:**
```json
{
  "total_tramites": 45,
  "tiempo_promedio_dias": 12.5,
  "tiempo_minimo_dias": 5,
  "tiempo_maximo_dias": 30
}
```

## Ejemplos de Uso

### Crear un Trámite Completo

```bash
# 1. Crear encabezado de trámite
curl -X POST http://localhost:8000/api/v1/sim-ft/tramites \
  -H "Content-Type: application/json" \
  -d '{
    "NUM_ANNIO": 2025,
    "NUM_REGISTRO": 1,
    "COD_TRAMITE": "PPSH",
    "FEC_INI_TRAMITE": "2025-10-23T10:00:00",
    "IND_ESTATUS": "01",
    "IND_PRIORIDAD": "N",
    "OBS_OBSERVA": "Solicitud inicial",
    "ID_USUARIO_CREA": "ADMIN"
  }'

# 2. Registrar primer paso
curl -X POST http://localhost:8000/api/v1/sim-ft/tramites/2025/1/pasos \
  -H "Content-Type: application/json" \
  -d '{
    "NUM_PASO": 1,
    "NUM_REGISTRO": 1,
    "COD_TRAMITE": "PPSH",
    "COD_SECCION": "ATEN",
    "COD_AGENCIA": "0001",
    "ID_USUAR_RESP": "USER123",
    "OBS_OBSERVACION": "Documentos recibidos",
    "NUM_PASO_SGTE": 2,
    "IND_ESTATUS": "02",
    "ID_USUARIO_CREA": "USER123"
  }'

# 3. Actualizar estado del trámite
curl -X PUT http://localhost:8000/api/v1/sim-ft/tramites/2025/1/1 \
  -H "Content-Type: application/json" \
  -d '{
    "IND_ESTATUS": "02"
  }'
```

### Consultar Flujo PPSH

```bash
# Obtener configuración de pasos
curl http://localhost:8000/api/v1/sim-ft/pasos?cod_tramite=PPSH

# Obtener configuración de flujo
curl http://localhost:8000/api/v1/sim-ft/flujo-pasos?cod_tramite=PPSH
```

### Generar Reportes

```bash
# Estadísticas por estado
curl http://localhost:8000/api/v1/sim-ft/estadisticas/tramites-por-estado?num_annio=2025

# Tiempo promedio de procesamiento
curl http://localhost:8000/api/v1/sim-ft/estadisticas/tiempo-promedio?cod_tramite=PPSH
```

## Códigos de Estado HTTP

- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado exitosamente
- `204 No Content`: Recurso eliminado/desactivado
- `400 Bad Request`: Error en los datos enviados
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

## Paginación

Todos los endpoints de listado soportan paginación:

```
GET /endpoint?skip=0&limit=50
```

- `skip`: Número de registros a saltar (default: 0)
- `limit`: Máximo de registros a retornar (default: 100)

## Filtros

Los endpoints de listado soportan filtros mediante query parameters. Ver sección específica de cada endpoint.

## Documentación Interactiva

La API cuenta con documentación Swagger interactiva:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI Schema**: http://localhost:8000/api/openapi.json

## Testing

Para ejecutar las pruebas automatizadas de los endpoints:

```bash
# Desde el directorio backend
python test_sim_ft_endpoints.py
```

## Notas Técnicas

### Claves Compuestas

El sistema utiliza claves primarias compuestas para permitir particionamiento:

- **Trámite**: `(NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO)`
- **Paso**: `(COD_TRAMITE, NUM_PASO)`
- **Detalle Paso**: `(NUM_ANNIO, NUM_TRAMITE, NUM_PASO, NUM_REGISTRO)`

### Auditoría

Todos los registros incluyen campos de auditoría:
- `ID_USUARIO_CREA`: Usuario que creó el registro
- `FEC_CREA_REG`: Fecha de creación
- `ID_USUARIO_MODIF`: Usuario que modificó (opcional)
- `FEC_MODIF_REG`: Fecha de modificación (opcional)

### Soft Delete

Los catálogos usan soft delete mediante el campo `IND_ACTIVO` ('S'/'N').

### Generación Automática

Algunos campos se generan automáticamente:
- `NUM_TRAMITE`: Secuencial por año
- `NUM_ACTIVIDAD`: Secuencial por paso de trámite
- `HITS_TRAMITE`: Contador de actualizaciones
- `FEC_ACTUALIZA`: Timestamp de última actualización
