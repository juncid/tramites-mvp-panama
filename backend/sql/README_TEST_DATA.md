# Scripts de Datos de Prueba para APIs

Este directorio contiene scripts SQL para cargar datos de prueba que permiten validar las colecciones de Postman del proyecto.

## 📁 Archivos Disponibles

### 1. `seed_tramites_base_test_data.sql`
**Propósito:** Carga datos de prueba para la API de Trámites Base

**Colección Postman asociada:** `Tramites_Base_API.postman_collection.json`

**Datos que inserta:**
- ✅ 40+ trámites migratorios de diferentes categorías:
  - Visas (turista, negocios, estudiante, etc.)
  - Residencias (temporal, permanente)
  - Permisos de trabajo
  - Trámites especiales (PPSH, naturalización, refugio)
  - Certificaciones administrativas
  - Casos especiales (inversionistas, pensionados, diplomáticos)
- ✅ Trámites en diferentes estados (ACTIVO, EN_MANTENIMIENTO, SUSPENDIDO)
- ✅ Trámites activos e inactivos para probar soft delete

**Casos de uso cubiertos:**
- Listado con paginación
- Filtrado por estado
- Búsqueda por ID
- Creación de nuevos trámites
- Actualización (completa y parcial)
- Soft delete
- Validaciones y errores

### 2. `seed_workflow_test_data.sql`
**Propósito:** Carga datos de prueba para la API de Workflow Dinámico

**Colección Postman asociada:** `Workflow_API_Tests.postman_collection.json`

**Datos que inserta:**
- ✅ 4 Workflows completos:
  - **PPSH_COMPLETO**: Proceso completo con 6 etapas y múltiples preguntas
  - **VISA_TURISTA_SIMPLE**: Proceso simplificado de visa
  - **RESIDENCIA_TEMPORAL**: Solicitud de residencia
  - **PROCESO_PRUEBA_BORRADOR**: Workflow en borrador para testing
  
- ✅ Etapas configuradas con:
  - Diferentes tipos (ETAPA, PRESENCIAL, COMPUERTA)
  - Perfiles de usuario permitidos
  - Formularios con títulos y descripciones
  - Configuración de validación
  
- ✅ Preguntas de diferentes tipos:
  - RESPUESTA_TEXTO (con validación regex)
  - RESPUESTA_LARGA
  - LISTA (dropdown)
  - OPCIONES (radio/checkbox)
  - CARGA_ARCHIVO (con restricciones)
  - SELECCION_FECHA
  
- ✅ Conexiones entre etapas:
  - Flujos predeterminados
  - Conexiones condicionales
  
- ✅ 3 Instancias de workflow:
  - En progreso
  - Completadas
  - Iniciadas
  
- ✅ Comentarios e historial de cambios

**Casos de uso cubiertos:**
- CRUD de workflows, etapas, preguntas y conexiones
- Ejecución de instancias
- Transiciones entre etapas
- Gestión de comentarios
- Consulta de historial

## 🚀 Cómo Usar

### Opción 1: SQL Server Management Studio (SSMS)

1. Abrir SSMS y conectarse a la base de datos
2. Abrir el script deseado
3. Verificar que esté seleccionada la base de datos correcta (`TramitesMVP`)
4. Ejecutar el script (F5)
5. Revisar los mensajes de salida para confirmar la inserción

### Opción 2: Desde línea de comandos (sqlcmd)

```bash
# Para Trámites Base
sqlcmd -S localhost -d TramitesMVP -i seed_tramites_base_test_data.sql

# Para Workflow
sqlcmd -S localhost -d TramitesMVP -i seed_workflow_test_data.sql
```

### Opción 3: Azure Data Studio

1. Conectarse a la base de datos
2. Abrir el archivo .sql
3. Ejecutar el script

### Opción 4: Desde el proyecto (Docker)

```bash
# Copiar el script al contenedor
docker cp seed_tramites_base_test_data.sql <container_name>:/tmp/

# Ejecutar dentro del contenedor
docker exec -it <container_name> /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P <password> -d TramitesMVP \
  -i /tmp/seed_tramites_base_test_data.sql
```

## 🧪 Validación con Postman

### Para Trámites Base API

1. Importar la colección: `backend/postman/Tramites_Base_API.postman_collection.json`
2. Configurar el entorno (environment):
   - `base_url`: `http://localhost:8000`
   - `api_prefix`: `/api/v1`
3. Ejecutar la colección completa o requests individuales
4. Los tests automáticos validarán:
   - Códigos de respuesta correctos
   - Estructura de datos
   - Paginación
   - Validaciones
   - Soft delete

### Para Workflow API

1. Importar la colección: `backend/postman/Workflow_API_Tests.postman_collection.json`
2. Configurar el entorno:
   - `base_url`: `http://localhost:8000`
   - `api_prefix`: `/api/v1/workflow`
3. Ejecutar en orden las carpetas:
   - 1. Gestión de Workflows
   - 2. Gestión de Etapas
   - 3. Gestión de Preguntas
   - 4. Gestión de Conexiones
   - 5. Gestión de Instancias
   - 6. Comentarios e Historial
4. Las variables se guardan automáticamente entre requests

## 🔄 Limpieza de Datos

Si necesita limpiar los datos de prueba antes de volver a ejecutar los scripts:

```sql
-- Limpiar trámites de prueba
DELETE FROM tramites WHERE titulo LIKE '%[PRUEBA]%' OR titulo LIKE '%TEST%'

-- Limpiar workflows de prueba (descomentar sección en el script)
-- Ver comentarios en seed_workflow_test_data.sql
```

## 📊 Datos Incluidos

### Trámites Base
- Total: ~40 trámites
- Categorías: Visas, Residencias, Permisos, Certificaciones, Especiales
- Estados: ACTIVO (mayoría), EN_MANTENIMIENTO (2), SUSPENDIDO (2)
- Registros activos e inactivos para testing

### Workflow
- 4 Workflows (3 activos, 1 borrador)
- 12+ Etapas configuradas
- 30+ Preguntas de diversos tipos
- 8+ Conexiones entre etapas
- 3 Instancias en diferentes estados
- Comentarios e historial

## ⚠️ Notas Importantes

1. **Idempotencia:** Los scripts están diseñados para agregar datos. Si los ejecuta múltiples veces, creará registros duplicados.

2. **Dependencias:** Los scripts asumen que:
   - Las tablas ya existen (creadas por migraciones de Alembic)
   - La base de datos se llama `TramitesMVP`
   - El servidor está en ejecución

3. **IDs auto-generados:** Los scripts usan `SCOPE_IDENTITY()` para manejar relaciones entre registros. No use IDs hardcodeados.

4. **Validación:** Cada script incluye queries de verificación al final que muestran un resumen de los datos insertados.

## 🐛 Troubleshooting

### Error: "Invalid object name 'WORKFLOW'"
**Causa:** Las tablas no existen  
**Solución:** Ejecutar migraciones de Alembic primero
```bash
cd backend
alembic upgrade head
```

### Error: "Cannot insert duplicate key"
**Causa:** Ya existen registros con los mismos códigos únicos  
**Solución:** Limpiar datos previos o modificar los códigos en el script

### Error: "The INSERT permission was denied"
**Causa:** Permisos insuficientes  
**Solución:** Conectarse con usuario que tenga permisos de INSERT

## 📝 Mantenimiento

Para agregar más datos de prueba:

1. Editar el script correspondiente
2. Seguir el patrón de INSERT existente
3. Actualizar los comentarios y documentación
4. Ejecutar y validar con Postman

## 📚 Referencias

- Colecciones Postman: `backend/postman/`
- Modelos de datos: `backend/app/models/`
- Migraciones: `backend/alembic/versions/`
- Documentación API: `docs/`

---

**Fecha de última actualización:** 2025-10-24  
**Autor:** Sistema de Trámites MVP Panamá
