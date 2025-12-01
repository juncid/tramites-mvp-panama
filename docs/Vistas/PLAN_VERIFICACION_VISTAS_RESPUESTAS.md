# Plan de Verificación - Vistas Dinámicas y Guardado de Respuestas
**Fecha**: 22 de noviembre de 2025  
**Objetivo**: Verificar que las preguntas configuradas se muestran correctamente según permisos y que las respuestas se guardan en base de datos

---

## 📋 Tabla de Contenidos

1. [Prerequisitos](#prerequisitos)
2. [Fase 1: Verificación de Configuración de Vistas](#fase-1-verificación-de-configuración-de-vistas)
3. [Fase 2: Verificación de Permisos por Perfil](#fase-2-verificación-de-permisos-por-perfil)
4. [Fase 3: Testing de Guardado de Respuestas](#fase-3-testing-de-guardado-de-respuestas)
5. [Fase 4: Verificación en Base de Datos](#fase-4-verificación-en-base-de-datos)
6. [Fase 5: Testing de Completar Etapa](#fase-5-testing-de-completar-etapa)
7. [Checklist Final](#checklist-final)

---

## Prerequisitos

### Servicios Necesarios
```bash
# 1. Backend FastAPI corriendo en puerto 8000
cd /home/junci/Source/tramites-mvp-panama/backend
docker-compose up -d

# Verificar que está corriendo
curl http://localhost:8000/api/v1/health

# 2. Frontend React corriendo en puerto 3001
cd /home/junci/Source/tramites-mvp-panama/frontend
npm run dev

# 3. Base de datos MSSQL accesible
docker ps | grep mssql
```

### Datos de Prueba
- **Instancia de Workflow**: ID `2002` (ya creada en testing E2E)
- **Workflow**: ID `2` ("Nombre Actualizado del Workflow")
- **Solicitud PPSH**: ID `12` (expediente PPSH-2025-000006)
- **Usuario de Prueba**: `USER001`

---

## Fase 1: Verificación de Configuración de Vistas

### 1.1 Verificar Workflow y Etapas

```bash
# Listar workflows disponibles
curl -s "http://localhost:8000/api/v1/workflow/workflows?limit=10" | jq '.'

# Obtener detalles del workflow específico
curl -s "http://localhost:8000/api/v1/workflow/workflows/2" | jq '.'

# Listar etapas del workflow
curl -s "http://localhost:8000/api/v1/workflow/workflows/2/etapas" | jq '.'
```

**Resultado Esperado**:
```json
{
  "workflow_id": 2,
  "nombre_workflow": "Nombre Actualizado del Workflow",
  "descripcion": "...",
  "etapas": [
    {
      "etapa_id": 3,
      "nombre_etapa": "Inicio del Proceso",
      "codigo_etapa": "INICIO",
      "orden": 1,
      "es_inicial": true
    },
    {
      "etapa_id": 4,
      "nombre_etapa": "Carga de Documentos",
      "codigo_etapa": "CARGA_DOCS",
      "orden": 2
    }
    // ... más etapas
  ]
}
```

### 1.2 Verificar Configuración de Vista de Etapa

```bash
# Obtener configuración de vista para etapa INICIO
curl -s "http://localhost:8000/api/v1/workflow/workflows/2/etapas/3/vista-config" | jq '.'
```

**Resultado Esperado**:
```json
{
  "etapa_id": 3,
  "seccion": "Datos Personales",
  "descripcion": "Por favor complete sus datos personales",
  "preguntas": [
    {
      "pregunta_id": 3001,
      "texto_pregunta": "¿Cuál es su nombre completo?",
      "tipo_respuesta": "TEXTO",
      "es_requerida": true,
      "orden": 1
    },
    {
      "pregunta_id": 3002,
      "texto_pregunta": "¿Cuál es su correo electrónico?",
      "tipo_respuesta": "TEXTO",
      "es_requerida": true,
      "orden": 2
    },
    {
      "pregunta_id": 3003,
      "texto_pregunta": "¿Cuál es su nacionalidad?",
      "tipo_respuesta": "LISTA_CHEQUEO",
      "es_requerida": true,
      "opciones": ["Panamá", "Colombia", "Venezuela", ...],
      "orden": 3
    }
  ]
}
```

✅ **Checkpoint 1.2**: Confirmar que las 3 preguntas están configuradas correctamente

### 1.3 Verificar Permisos de Vista

```bash
# Obtener permisos configurados para la etapa
curl -s "http://localhost:8000/api/v1/workflow/etapas/3/permisos" | jq '.'
```

**Resultado Esperado**:
```json
{
  "etapa_id": 3,
  "permisos": [
    {
      "perfil_usuario": "ADMIN",
      "puede_ver": true,
      "puede_editar": true
    },
    {
      "perfil_usuario": "FUNCIONARIO",
      "puede_ver": false,
      "puede_editar": false
    },
    {
      "perfil_usuario": "CIUDADANO",
      "puede_ver": false,
      "puede_editar": false
    }
  ]
}
```

✅ **Checkpoint 1.3**: Confirmar que solo ADMIN tiene permisos para la etapa INICIO

---

## Fase 2: Verificación de Permisos por Perfil

### 2.1 Probar Acceso con Perfil ADMIN

```bash
# Verificar permisos de ADMIN
curl -s "http://localhost:8000/api/v1/workflow/instancias/2002/verificar-permisos?user_perfil=ADMIN" | jq '.'
```

**Resultado Esperado**:
```json
{
  "puede_ver": true,
  "puede_editar": true,
  "etapa_id": 3,
  "etapa_codigo": "INICIO",
  "etapa_nombre": "Inicio del Proceso",
  "es_etapa_actual": true,
  "perfil_usuario": "ADMIN",
  "perfiles_permitidos": ["ADMIN"],
  "razon": "El perfil ADMIN tiene acceso a la etapa INICIO"
}
```

```bash
# Obtener vista actual con permisos ADMIN
curl -s "http://localhost:8000/api/v1/workflow/instancias/2002/vista-actual?user_perfil=ADMIN" | jq '.'
```

**Resultado Esperado**: Vista con 3 preguntas completas + permisos de edición

✅ **Checkpoint 2.1**: ADMIN puede ver y editar todas las preguntas

### 2.2 Probar Acceso con Perfil FUNCIONARIO

```bash
# Verificar permisos de FUNCIONARIO
curl -s "http://localhost:8000/api/v1/workflow/instancias/2002/verificar-permisos?user_perfil=FUNCIONARIO" | jq '.'
```

**Resultado Esperado**:
```json
{
  "puede_ver": false,
  "puede_editar": false,
  "etapa_id": 3,
  "etapa_codigo": "INICIO",
  "etapa_nombre": "Inicio del Proceso",
  "es_etapa_actual": true,
  "perfil_usuario": "FUNCIONARIO",
  "perfiles_permitidos": ["ADMIN"],
  "razon": "El perfil FUNCIONARIO no está en la lista de perfiles permitidos para la etapa INICIO"
}
```

```bash
# Intentar obtener vista con perfil FUNCIONARIO (debe fallar)
curl -s "http://localhost:8000/api/v1/workflow/instancias/2002/vista-actual?user_perfil=FUNCIONARIO" 
```

**Resultado Esperado**: HTTP 403 Forbidden
```json
{
  "detail": "El usuario no tiene permiso para ver la etapa 'Inicio del Proceso'"
}
```

✅ **Checkpoint 2.2**: FUNCIONARIO correctamente bloqueado

### 2.3 Probar Acceso con Perfil CIUDADANO

```bash
# Verificar permisos de CIUDADANO
curl -s "http://localhost:8000/api/v1/workflow/instancias/2002/verificar-permisos?user_perfil=CIUDADANO" | jq '.'

# Intentar obtener vista con perfil CIUDADANO (debe fallar)
curl -s "http://localhost:8000/api/v1/workflow/instancias/2002/vista-actual?user_perfil=CIUDADANO"
```

**Resultado Esperado**: HTTP 403 Forbidden similar a FUNCIONARIO

✅ **Checkpoint 2.3**: CIUDADANO correctamente bloqueado

---

## Fase 3: Testing de Guardado de Respuestas

### 3.1 Verificar Estado Inicial de Respuestas

```bash
# Consultar respuestas actuales de la instancia
curl -s "http://localhost:8000/api/v1/workflow/instancias/2002/respuestas" | jq '.'
```

**Resultado Esperado**: Lista vacía o respuestas previas
```json
{
  "instancia_id": 2002,
  "respuestas": []
}
```

### 3.2 Guardar Respuestas (Borrador)

**Opción A: Via Frontend** (Recomendado para validación E2E)

1. Abrir navegador en: `http://localhost:3001/workflows/2002/execution`
2. Llenar los campos del formulario:
   - Nombre: "Juan Pérez González"
   - Email: "juan.perez@example.com"
   - Nacionalidad: Seleccionar "Panamá"
3. Click en botón "Guardar Borrador"
4. Verificar notificación de éxito

**Opción B: Via API REST** (Testing directo)

```bash
# Guardar respuestas via API
curl -X POST "http://localhost:8000/api/v1/workflow/instancias/2002/respuestas" \
  -H "Content-Type: application/json" \
  -d '{
    "respuestas": {
      "3001": {
        "pregunta_id": 3001,
        "tipo_respuesta": "TEXTO",
        "respuesta_texto": "Juan Pérez González"
      },
      "3002": {
        "pregunta_id": 3002,
        "tipo_respuesta": "TEXTO",
        "respuesta_texto": "juan.perez@example.com"
      },
      "3003": {
        "pregunta_id": 3003,
        "tipo_respuesta": "LISTA_CHEQUEO",
        "respuesta_opciones": ["Panamá"]
      }
    },
    "user_id": "USER001"
  }' | jq '.'
```

**Resultado Esperado**:
```json
{
  "success": true,
  "message": "Respuestas guardadas correctamente",
  "respuestas_guardadas": 3,
  "instancia_id": 2002,
  "etapa_id": 3
}
```

✅ **Checkpoint 3.2**: Respuestas guardadas exitosamente

### 3.3 Verificar Respuestas Guardadas

```bash
# Consultar respuestas guardadas
curl -s "http://localhost:8000/api/v1/workflow/instancias/2002/respuestas" | jq '.'
```

**Resultado Esperado**:
```json
{
  "instancia_id": 2002,
  "respuestas": [
    {
      "respuesta_id": 5001,
      "pregunta_id": 3001,
      "instancia_id": 2002,
      "tipo_respuesta": "TEXTO",
      "respuesta_texto": "Juan Pérez González",
      "respuesta_opciones": null,
      "respuesta_numero": null,
      "respuesta_fecha": null,
      "respuesta_archivo": null,
      "fecha_respuesta": "2025-11-22T20:35:00",
      "respondido_por": "USER001"
    },
    {
      "respuesta_id": 5002,
      "pregunta_id": 3002,
      "instancia_id": 2002,
      "tipo_respuesta": "TEXTO",
      "respuesta_texto": "juan.perez@example.com",
      "respuesta_opciones": null,
      "respuesta_numero": null,
      "respuesta_fecha": null,
      "respuesta_archivo": null,
      "fecha_respuesta": "2025-11-22T20:35:00",
      "respondido_por": "USER001"
    },
    {
      "respuesta_id": 5003,
      "pregunta_id": 3003,
      "instancia_id": 2002,
      "tipo_respuesta": "LISTA_CHEQUEO",
      "respuesta_texto": null,
      "respuesta_opciones": ["Panamá"],
      "respuesta_numero": null,
      "respuesta_fecha": null,
      "respuesta_archivo": null,
      "fecha_respuesta": "2025-11-22T20:35:00",
      "respondido_por": "USER001"
    }
  ]
}
```

✅ **Checkpoint 3.3**: Las 3 respuestas se recuperan correctamente de la API

---

## Fase 4: Verificación en Base de Datos

### 4.1 Conectar a Base de Datos MSSQL

```bash
# Opción A: Usando Docker exec
docker exec -it tramites-db /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong!Passw0rd' \
  -d tramites_mvp_panama

# Opción B: Usando cliente SQL local
sqlcmd -S localhost,1433 -U sa -P 'YourStrong!Passw0rd' -d tramites_mvp_panama
```

### 4.2 Consultar Tabla de Respuestas

```sql
-- Ver estructura de la tabla
SELECT TOP 1 * 
FROM workflow.respuestas_etapa;

-- Contar respuestas para la instancia 2002
SELECT COUNT(*) as total_respuestas
FROM workflow.respuestas_etapa
WHERE instancia_id = 2002;

-- Consultar respuestas completas
SELECT 
    respuesta_id,
    pregunta_id,
    instancia_id,
    tipo_respuesta,
    respuesta_texto,
    respuesta_opciones,
    fecha_respuesta,
    respondido_por
FROM workflow.respuestas_etapa
WHERE instancia_id = 2002
ORDER BY pregunta_id;
```

**Resultado Esperado**:
```
respuesta_id | pregunta_id | instancia_id | tipo_respuesta | respuesta_texto            | respuesta_opciones | fecha_respuesta      | respondido_por
-------------|-------------|--------------|----------------|----------------------------|-------------------|---------------------|---------------
5001         | 3001        | 2002         | TEXTO          | Juan Pérez González        | NULL              | 2025-11-22 20:35:00 | USER001
5002         | 3002        | 2002         | TEXTO          | juan.perez@example.com     | NULL              | 2025-11-22 20:35:00 | USER001
5003         | 3003        | 2002         | LISTA_CHEQUEO  | NULL                       | ["Panamá"]        | 2025-11-22 20:35:00 | USER001
```

✅ **Checkpoint 4.2**: Las 3 respuestas están persistidas en base de datos

### 4.3 Verificar Relaciones con Preguntas

```sql
-- Consultar preguntas con sus respuestas
SELECT 
    p.pregunta_id,
    p.texto_pregunta,
    p.tipo_respuesta,
    p.es_requerida,
    r.respuesta_texto,
    r.respuesta_opciones,
    r.fecha_respuesta
FROM workflow.vista_config_preguntas p
LEFT JOIN workflow.respuestas_etapa r ON p.pregunta_id = r.pregunta_id
WHERE p.etapa_id = 3  -- Etapa INICIO
  AND (r.instancia_id = 2002 OR r.instancia_id IS NULL)
ORDER BY p.orden;
```

**Resultado Esperado**: Join exitoso mostrando preguntas con sus respuestas

✅ **Checkpoint 4.3**: Relaciones entre tablas correctas

### 4.4 Verificar Auditoría de Cambios

```sql
-- Si existe tabla de auditoría
SELECT 
    instancia_id,
    etapa_id,
    accion,
    usuario,
    fecha_cambio,
    cambios_realizados
FROM workflow.auditoria_instancias
WHERE instancia_id = 2002
ORDER BY fecha_cambio DESC;
```

✅ **Checkpoint 4.4**: Registro de auditoría de guardado de respuestas

---

## Fase 5: Testing de Completar Etapa

### 5.1 Validar Campos Requeridos

```bash
# Intentar completar sin llenar todos los campos (debe fallar)
curl -X POST "http://localhost:8000/api/v1/workflow/instancias/2002/completar-etapa" \
  -H "Content-Type: application/json" \
  -d '{
    "respuestas": {
      "3001": {
        "pregunta_id": 3001,
        "tipo_respuesta": "TEXTO",
        "respuesta_texto": "Juan Pérez"
      }
    },
    "user_id": "USER001"
  }'
```

**Resultado Esperado**: HTTP 400 Bad Request
```json
{
  "detail": "Faltan respuestas para preguntas requeridas: 3002, 3003"
}
```

✅ **Checkpoint 5.1**: Validación de campos requeridos funcionando

### 5.2 Completar Etapa con Todas las Respuestas

```bash
# Completar etapa con todos los campos
curl -X POST "http://localhost:8000/api/v1/workflow/instancias/2002/completar-etapa" \
  -H "Content-Type: application/json" \
  -d '{
    "respuestas": {
      "3001": {
        "pregunta_id": 3001,
        "tipo_respuesta": "TEXTO",
        "respuesta_texto": "Juan Pérez González"
      },
      "3002": {
        "pregunta_id": 3002,
        "tipo_respuesta": "TEXTO",
        "respuesta_texto": "juan.perez@example.com"
      },
      "3003": {
        "pregunta_id": 3003,
        "tipo_respuesta": "LISTA_CHEQUEO",
        "respuesta_opciones": ["Panamá"]
      }
    },
    "user_id": "USER001"
  }' | jq '.'
```

**Resultado Esperado**:
```json
{
  "success": true,
  "message": "Etapa completada exitosamente",
  "instancia_id": 2002,
  "etapa_anterior": {
    "etapa_id": 3,
    "nombre": "Inicio del Proceso",
    "estado": "COMPLETADA"
  },
  "etapa_actual": {
    "etapa_id": 4,
    "nombre": "Carga de Documentos",
    "estado": "ACTIVA"
  }
}
```

✅ **Checkpoint 5.2**: Etapa completada y transición a siguiente etapa exitosa

### 5.3 Verificar Estado de Instancia Post-Completar

```bash
# Consultar estado actualizado de la instancia
curl -s "http://localhost:8000/api/v1/workflow/instancias/2002" | jq '.'
```

**Resultado Esperado**:
```json
{
  "instancia_id": 2002,
  "workflow_id": 2,
  "num_expediente": "WF-FLUJO_COMPLETO-2025-000003",
  "titulo": "Test E2E - Solicitud Existente Vinculada",
  "estado": "EN_PROCESO",
  "etapa_actual_id": 4,  // ← Cambió de 3 a 4
  "etapa_actual_nombre": "Carga de Documentos",
  "fecha_inicio": "2025-11-22T17:10:00",
  "fecha_actualizacion": "2025-11-22T20:40:00",  // ← Actualizada
  "usuario_creador": "USER001"
}
```

✅ **Checkpoint 5.3**: Estado de instancia actualizado correctamente

### 5.4 Verificar en Base de Datos - Estado de Etapa

```sql
-- Consultar historial de etapas
SELECT 
    etapa_id,
    instancia_id,
    nombre_etapa,
    estado,
    fecha_inicio,
    fecha_fin,
    completado_por
FROM workflow.historial_etapas
WHERE instancia_id = 2002
ORDER BY fecha_inicio DESC;
```

**Resultado Esperado**:
```
etapa_id | instancia_id | nombre_etapa           | estado      | fecha_inicio        | fecha_fin           | completado_por
---------|--------------|------------------------|-------------|---------------------|---------------------|---------------
4        | 2002         | Carga de Documentos    | ACTIVA      | 2025-11-22 20:40:00 | NULL                | NULL
3        | 2002         | Inicio del Proceso     | COMPLETADA  | 2025-11-22 17:10:00 | 2025-11-22 20:40:00 | USER001
```

✅ **Checkpoint 5.4**: Historial de etapas registrado correctamente

---

## Checklist Final

### ✅ Configuración de Vistas
- [ ] Workflow cargado con todas las etapas
- [ ] Vista de etapa INICIO configurada con 3 preguntas
- [ ] Permisos configurados correctamente (solo ADMIN tiene acceso)

### ✅ Sistema de Permisos
- [ ] ADMIN puede ver todas las preguntas
- [ ] ADMIN puede editar todas las preguntas
- [ ] FUNCIONARIO bloqueado con 403 Forbidden
- [ ] CIUDADANO bloqueado con 403 Forbidden

### ✅ Guardado de Respuestas
- [ ] Respuesta 1 (TEXTO - Nombre) guardada correctamente
- [ ] Respuesta 2 (TEXTO - Email) guardada correctamente
- [ ] Respuesta 3 (LISTA_CHEQUEO - Nacionalidad) guardada correctamente
- [ ] API retorna respuestas guardadas
- [ ] Respuestas visibles en base de datos

### ✅ Base de Datos
- [ ] Tabla `workflow.respuestas_etapa` contiene los 3 registros
- [ ] Campos `respuesta_texto` poblados para preguntas tipo TEXTO
- [ ] Campo `respuesta_opciones` (JSON) poblado para LISTA_CHEQUEO
- [ ] Campos de auditoría (`fecha_respuesta`, `respondido_por`) completados
- [ ] Relaciones con tabla `vista_config_preguntas` correctas

### ✅ Completar Etapa
- [ ] Validación de campos requeridos funciona (rechaza si faltan)
- [ ] Completar etapa con todos los campos funciona
- [ ] Transición a siguiente etapa (INICIO → CARGA_DOCS)
- [ ] Estado de instancia actualizado en base de datos
- [ ] Historial de etapas registrado

### ✅ Frontend (Opcional - E2E Completo)
- [ ] Página WorkflowExecution renderiza correctamente
- [ ] Formulario muestra las 3 preguntas configuradas
- [ ] Botón "Guardar Borrador" funciona
- [ ] Botón "Completar Etapa" funciona
- [ ] Notificaciones de éxito/error se muestran

---

## Troubleshooting

### Problema: API retorna 403 Forbidden para ADMIN
**Solución**:
```bash
# Verificar que el parámetro user_perfil se envía correctamente
curl -v "http://localhost:8000/api/v1/workflow/instancias/2002/vista-actual?user_perfil=ADMIN"

# Verificar que los permisos están configurados en base de datos
sqlcmd -S localhost,1433 -U sa -P 'YourStrong!Passw0rd' -d tramites_mvp_panama -Q "
SELECT * FROM workflow.permisos_vista_etapa WHERE etapa_id = 3
"
```

### Problema: Respuestas no se guardan en base de datos
**Solución**:
```bash
# Verificar que la tabla existe
sqlcmd -Q "SELECT COUNT(*) FROM workflow.respuestas_etapa"

# Verificar logs del backend
docker logs tramites-backend --tail 50

# Verificar permisos de escritura del usuario de base de datos
sqlcmd -Q "SELECT has_perms_by_name('workflow.respuestas_etapa', 'OBJECT', 'INSERT')"
```

### Problema: Frontend no muestra las preguntas
**Solución**:
```bash
# Verificar llamadas API en consola del navegador (F12)
# Verificar que el componente DynamicEtapaView está recibiendo props correctamente

# Verificar que el endpoint retorna datos
curl -s "http://localhost:8000/api/v1/workflow/instancias/2002/vista-actual?user_perfil=ADMIN" | jq '.preguntas'
```

### Problema: Completar etapa no transiciona
**Solución**:
```sql
-- Verificar que existe la siguiente etapa
SELECT * FROM workflow.etapas 
WHERE workflow_id = 2 
  AND orden = (SELECT orden + 1 FROM workflow.etapas WHERE etapa_id = 3);

-- Verificar que el estado de la instancia permite completar etapa
SELECT estado, etapa_actual_id 
FROM workflow.instancias 
WHERE instancia_id = 2002;
```

---

## Comandos Útiles de Referencia Rápida

```bash
# Ver todas las instancias
curl -s "http://localhost:8000/api/v1/workflow/instancias" | jq '.[] | {instancia_id, titulo, estado, etapa_actual_nombre}'

# Ver respuestas de una instancia
curl -s "http://localhost:8000/api/v1/workflow/instancias/2002/respuestas" | jq '.respuestas[] | {pregunta_id, tipo_respuesta, respuesta_texto, respuesta_opciones}'

# Ver permisos de una etapa
curl -s "http://localhost:8000/api/v1/workflow/etapas/3/permisos" | jq '.'

# Ver vista actual con permisos
curl -s "http://localhost:8000/api/v1/workflow/instancias/2002/vista-actual?user_perfil=ADMIN" | jq '{seccion, descripcion, preguntas: .preguntas | length, permisos}'

# Verificar estado de instancia
curl -s "http://localhost:8000/api/v1/workflow/instancias/2002" | jq '{instancia_id, estado, etapa_actual_id, etapa_actual_nombre, fecha_actualizacion}'
```

---

## Próximos Pasos Después de la Verificación

1. **Documentar Resultados**: Crear documento con screenshots y logs de cada checkpoint
2. **Testing con Otros Perfiles**: Crear usuarios de prueba para FUNCIONARIO y CIUDADANO
3. **Testing de Edición**: Modificar respuestas guardadas y verificar actualización
4. **Testing de Múltiples Etapas**: Completar todo el workflow de principio a fin
5. **Performance Testing**: Medir tiempos de respuesta con múltiples respuestas
6. **Error Handling**: Probar casos extremos (datos inválidos, etapas inexistentes, etc.)

---

**Preparado por**: GitHub Copilot (Claude Sonnet 4.5)  
**Fecha**: 22 de noviembre de 2025  
**Versión**: 1.0
