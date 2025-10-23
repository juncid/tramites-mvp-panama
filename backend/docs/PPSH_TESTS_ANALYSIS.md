# Análisis de Tests PPSH - 5/27 Pasando

## Resumen
- **Tests Pasando**: 5/27 (18.5%)
- **Tests Fallando**: 22/27 (81.5%)

## Categorías de Errores

### 1. Errores de Nombres de Modelos (6 tests) ❌
```
NameError: name 'SolicitantePPSH' is not defined
NameError: name 'DocumentoPPSH' is not defined
NameError: name 'EntrevistaPPSH' is not defined
NameError: name 'ComentarioPPSH' is not defined
```
**Tests Afectados**:
- test_get_solicitantes_by_solicitud
- test_add_solicitante_to_solicitud
- test_get_documentos_by_solicitud
- test_delete_documento
- test_get_entrevistas_by_solicitud
- test_update_entrevista_resultado
- test_get_comentarios_by_solicitud

**Causa**: Los tests usan nombres incorrectos. Deberían ser:
- `PPSHSolicitante` (no `SolicitantePPSH`)
- `PPSHDocumento` (no `DocumentoPPSH`)
- `PPSHEntrevista` (no `EntrevistaPPSH`)
- `PPSHComentario` (no `ComentarioPPSH`)

### 2. Errores de Atributos Faltantes (3 tests) ❌
```
AttributeError: type object 'PPSHSolicitud' has no attribute 'historial_estados'
```
**Tests Afectados**:
- test_get_solicitud_by_id_success
- test_get_solicitud_not_found
- test_get_solicitud_different_agencia_forbidden

**Causa**: Los tests esperan un atributo `historial_estados` en `PPSHSolicitud` que no existe en el modelo.

### 3. Errores de IntegrityError - Falta Fixture (4 tests) ❌
```
IntegrityError: NOT NULL constraint failed: PPSH_SOLICITUD.cod_causa_humanitaria
IntegrityError: NOT NULL constraint failed: PPSH_SOLICITUD.num_expediente
```
**Tests Afectados**:
- test_create_entrevista_success
- test_add_comentario_success
- test_get_dashboard_stats_admin
- test_get_dashboard_stats_filtered_by_agencia

**Causa**: Los tests crean PPSHSolicitud pero no están usando el fixture `setup_ppsh_catalogos` y no están proporcionando todos los datos requeridos.

### 4. Errores de Lógica/Validación (7 tests) ❌
```
assert 2 == 1  # Esperaba 1 resultado, obtuvo 2
assert 0 == 1  # Esperaba 1 resultado, obtuvo 0
assert 200 == 403  # Esperaba 403 forbidden, obtuvo 200 OK
assert 400 == 201  # Esperaba 201 created, obtuvo 400 bad request
assert 404 == 200  # Esperaba 200 OK, obtuvo 404 not found
```
**Tests Afectados**:
- test_get_solicitudes_filtered_by_agencia
- test_get_solicitudes_with_filters
- test_get_solicitudes_permission_denied
- test_create_solicitud_success
- test_create_solicitud_generates_unique_number
- test_update_solicitud_state_transition
- test_add_solicitante_to_solicitud
- test_get_paises

### 5. Errores de Validación de Respuesta (1 test) ❌
```
ResponseValidationError: 1 validation errors
```
**Tests Afectados**:
- test_update_solicitud_success

## Plan de Acción

### Fase 1: Corrección de Nombres de Modelos (FÁCIL - 5 min)
Crear script para corregir:
- `SolicitantePPSH` → `PPSHSolicitante`
- `DocumentoPPSH` → `PPSHDocumento`
- `EntrevistaPPSH` → `PPSHEntrevista`
- `ComentarioPPSH` → `PPSHComentario`

### Fase 2: Corrección de Atributos (MEDIO - 10 min)
Eliminar o reemplazar referencias a `historial_estados`:
- Opción 1: Eliminar del assert
- Opción 2: Crear relación en modelo si es necesario

### Fase 3: Agregar Fixture a Tests (FÁCIL - 5 min)
Agregar `setup_ppsh_catalogos` a los 4 tests que lo necesitan.

### Fase 4: Corrección de Lógica de Tests (DIFÍCIL - 20-30 min)
Revisar cada test individualmente para entender por qué falla la lógica.

### Fase 5: Verificación Final
Ejecutar suite completa y generar reporte.
