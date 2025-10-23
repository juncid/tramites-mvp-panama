# 📝 Ejemplos de Actualización (PUT) para PPSH

## 🎯 Endpoint

```
PUT /api/v1/ppsh/solicitudes/{id_solicitud}
```

---

## ⚠️ Campos Incorrectos vs Correctos

### ❌ TU REQUEST (INCORRECTO)
```json
{
  "prioridad": "ALTA",
  "descripcion_situacion": "...",  // ❌ NO EXISTE
  "observaciones": "..."           // ❌ NO EXISTE
}
```

### ✅ REQUEST CORRECTO
```json
{
  "prioridad": "ALTA",
  "descripcion_caso": "...",          // ✅ Campo correcto
  "observaciones_generales": "..."   // ✅ Campo correcto
}
```

---

## 📋 Campos Disponibles para Actualización

Todos los campos son **opcionales** (solo envía los que quieres modificar):

| Campo | Tipo | Valores | Ejemplo |
|-------|------|---------|---------|
| `tipo_solicitud` | string | "INDIVIDUAL", "GRUPAL" | `"GRUPAL"` |
| `cod_causa_humanitaria` | integer | 1-5 | `2` |
| `descripcion_caso` | string | Max 2000 chars | `"Descripción actualizada"` |
| `prioridad` | string | "ALTA", "NORMAL", "BAJA" | `"ALTA"` |
| `cod_agencia` | string | 2 chars | `"01"` |
| `cod_seccion` | string | 2 chars | `"03"` |
| `user_id_asignado` | string | Max 17 chars | `"USR001"` |
| `observaciones_generales` | string | Max 2000 chars | `"Observaciones..."` |
| `num_resolucion` | string | Max 50 chars | `"RES-2025-001"` |
| `fecha_resolucion` | date | YYYY-MM-DD | `"2025-10-23"` |
| `fecha_vencimiento_permiso` | date | YYYY-MM-DD | `"2026-10-23"` |

---

## 📝 Ejemplos de Uso

### 1️⃣ Actualizar Prioridad y Descripción
```json
{
  "prioridad": "ALTA",
  "descripcion_caso": "ACTUALIZADO: Situación de riesgo inminente. Requiere atención inmediata.",
  "observaciones_generales": "Caso escalado por recomendación de ACNUR"
}
```

**Resultado:** 200 OK con solicitud actualizada

---

### 2️⃣ Asignar a Usuario
```json
{
  "user_id_asignado": "USR001",
  "cod_agencia": "02",
  "cod_seccion": "01"
}
```

**Resultado:** Solicitud asignada a usuario USR001

---

### 3️⃣ Actualizar Causa Humanitaria
```json
{
  "cod_causa_humanitaria": 3,
  "descripcion_caso": "Cambio de causa: Ahora incluye necesidad médica urgente además de persecución política."
}
```

**Nota:** Verifica que la nueva causa existe y está activa

---

### 4️⃣ Registrar Resolución
```json
{
  "num_resolucion": "RES-PPSH-2025-001234",
  "fecha_resolucion": "2025-10-23",
  "fecha_vencimiento_permiso": "2026-10-23",
  "observaciones_generales": "Resolución favorable. Permiso emitido por 1 año."
}
```

**Resultado:** Solicitud con resolución registrada

---

### 5️⃣ Actualizar Solo Observaciones
```json
{
  "observaciones_generales": "Actualización: Solicitante presentó documentación adicional el 23/10/2025"
}
```

**Resultado:** Solo observaciones actualizadas, resto sin cambios

---

### 6️⃣ Cambiar Tipo de Solicitud (cuidado)
```json
{
  "tipo_solicitud": "INDIVIDUAL"
}
```

**⚠️ Advertencia:** Esto podría causar inconsistencias si hay múltiples solicitantes. Usar con precaución.

---

## 🧪 Probar con cURL

### Windows PowerShell
```powershell
$body = @'
{
  "prioridad": "ALTA",
  "descripcion_caso": "ACTUALIZADO: Situación de riesgo inminente.",
  "observaciones_generales": "Caso escalado"
}
'@

Invoke-RestMethod `
  -Uri "http://localhost:8000/api/v1/ppsh/solicitudes/8" `
  -Method PUT `
  -ContentType "application/json" `
  -Body $body | ConvertTo-Json -Depth 10
```

### Linux / Mac
```bash
curl -X PUT "http://localhost:8000/api/v1/ppsh/solicitudes/8" \
  -H "Content-Type: application/json" \
  -d '{
    "prioridad": "ALTA",
    "descripcion_caso": "ACTUALIZADO: Situación de riesgo inminente.",
    "observaciones_generales": "Caso escalado"
  }'
```

---

## 📊 Verificar Actualización

### SQL Query
```sql
SELECT 
    id_solicitud,
    num_expediente,
    prioridad,
    descripcion_caso,
    observaciones_generales,
    user_id_asignado,
    num_resolucion,
    fecha_resolucion
FROM PPSH_SOLICITUD
WHERE id_solicitud = 8;
```

### API Request
```
GET http://localhost:8000/api/v1/ppsh/solicitudes/8
```

---

## ❌ Errores Comunes

### 1. Error 422: Validation Error
```json
{
  "detail": [
    {
      "type": "extra_forbidden",
      "loc": ["body", "descripcion_situacion"],
      "msg": "Extra inputs are not permitted"
    }
  ]
}
```

**Causa:** Enviaste campo `descripcion_situacion` en lugar de `descripcion_caso`

**Solución:** Usar nombres correctos de campos

---

### 2. Error 404: Not Found
```json
{
  "detail": "Solicitud con id 999 no encontrada"
}
```

**Causa:** El ID de solicitud no existe

**Solución:** Verificar que el ID es correcto con `GET /api/v1/ppsh/solicitudes`

---

### 3. Error 422: Causa no válida
```json
{
  "detail": "Causa humanitaria 99 no existe o está inactiva"
}
```

**Causa:** Intentaste asignar una causa que no existe

**Solución:** Consultar causas disponibles: `GET /api/v1/ppsh/catalogos/causas-humanitarias`

---

## 🔄 Campos que NO se Pueden Actualizar

Estos campos están bloqueados y no se pueden modificar con PUT:

❌ `id_solicitud` - Identificador único
❌ `num_expediente` - Número generado automáticamente
❌ `fecha_solicitud` - Fecha de creación
❌ `estado_actual` - Usar endpoint de cambio de estado
❌ `created_at` - Timestamp de creación
❌ `activo` - Usar endpoint de eliminación lógica

### Para Cambiar Estado
```
POST /api/v1/ppsh/solicitudes/{id}/cambiar-estado
{
  "nuevo_estado": "EN_REVISION",
  "observaciones": "Revisión iniciada"
}
```

---

## 📋 Template Completo (Todos los Campos)

```json
{
  "tipo_solicitud": "GRUPAL",
  "cod_causa_humanitaria": 2,
  "descripcion_caso": "Descripción actualizada del caso",
  "prioridad": "ALTA",
  "cod_agencia": "01",
  "cod_seccion": "03",
  "user_id_asignado": "USR001",
  "observaciones_generales": "Observaciones actualizadas",
  "num_resolucion": "RES-2025-001",
  "fecha_resolucion": "2025-10-23",
  "fecha_vencimiento_permiso": "2026-10-23"
}
```

**Nota:** Solo envía los campos que necesitas actualizar, no todos.

---

## ✅ Request Correcto para Tu Caso

Para actualizar la solicitud 8:

```json
{
  "prioridad": "ALTA",
  "descripcion_caso": "ACTUALIZADO: Situación de riesgo inminente. Requiere atención inmediata.",
  "observaciones_generales": "Caso escalado por recomendación de ACNUR"
}
```

Copia este JSON en Postman y vuelve a hacer el PUT. Ahora sí se actualizará correctamente. ✅

---

**Última actualización:** 23 de Octubre de 2025
