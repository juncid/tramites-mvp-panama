# Solución: Permisos en Etapa 4 del Workflow Público

**Fecha**: 24 de noviembre de 2025  
**Problema**: Error 403 al intentar acceder a la 4ta etapa en el flujo público PPSH

---

## 🔍 Diagnóstico del Problema

### Causa Raíz
El sistema de workflows PPSH está configurado con perfiles de permisos por etapa:
- **Vistas 1-3**: Perfil `CIUDADANO` (acceso público sin autenticación)
- **Vistas 4-11**: Perfil `FUNCIONARIO` (requiere autenticación y rol de funcionario)

Cuando un ciudadano completa las primeras 3 vistas y el sistema intenta avanzar a la vista 4, el backend retorna **403 Forbidden** porque:
1. El perfil enviado es `CIUDADANO`
2. La etapa 4 requiere perfil `FUNCIONARIO`
3. El endpoint `/api/v1/workflow/instancias/{id}/vista-actual` valida permisos y rechaza la petición

### Evidencia en Logs
```
2025-11-24 01:31:47 - app.middleware.http - WARNING - ⚠️  [3bf732ca...] 
GET /api/v1/workflow/instancias/3010/vista-actual - Status: 403
```

---

## ✅ Solución Implementada

### Cambios en `SolicitudPublicaWorkflow.tsx`

#### 1. Manejo de Error 403 en `validateAndLoad()`
```typescript
} catch (err: any) {
  console.error('Error validando token:', err);
  
  // Si es error 403, la etapa actual requiere funcionario
  if (err.response?.status === 403) {
    setError('Esta etapa requiere revisión de un funcionario. Su solicitud está en proceso de evaluación.');
  } else {
    setError(err.response?.data?.detail || 'Error al cargar la solicitud.');
  }
}
```

#### 2. Manejo de Error 403 en `handleEtapaCompletada()`
```typescript
} catch (err: any) {
  console.error('Error completando etapa:', err);
  
  // Si error 403, probablemente llegamos a una etapa que requiere funcionario
  if (err.response?.status === 403) {
    setError('Las siguientes etapas requieren revisión de un funcionario. Su solicitud será procesada próximamente.');
  }
  throw err;
}
```

#### 3. Renderizado Condicional del Error
```typescript
if (error || !tokenValid) {
  // Determinar si es un error de permisos (403) o error general
  const isPermissionError = error?.includes('requiere revisión de un funcionario') || 
                            error?.includes('requiere funcionario');
  const severity = isPermissionError ? 'warning' : 'error';
  const title = isPermissionError ? 'Revisión Pendiente' : 'Enlace Inválido o Expirado';
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Alert severity={severity} sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Typography variant="body2">{error || 'El enlace no es válido.'}</Typography>
        {isPermissionError && (
          <Typography variant="body2" sx={{ mt: 2 }}>
            Ha completado las etapas disponibles para ciudadanos. Un funcionario del 
            Servicio Nacional de Migración revisará su solicitud próximamente.
          </Typography>
        )}
      </Alert>
      {!isPermissionError && (
        <Button variant="contained" onClick={() => navigate('/solicitudes/nueva')} fullWidth>
          Iniciar Nueva Solicitud
        </Button>
      )}
    </Container>
  );
}
```

#### 4. Actualización del Mensaje Informativo
```typescript
<Alert severity="info" sx={{ mb: 4, maxWidth: '1167px' }}>
  <Typography variant="body2">
    <strong>Importante:</strong> Complete las primeras 3 vistas para que un funcionario 
    pueda revisar su solicitud. Una vez completadas, su solicitud entrará en revisión.
  </Typography>
</Alert>
```

---

## 🎯 Comportamiento Esperado

### Flujo Exitoso (Vistas 1-3)
1. Ciudadano crea solicitud → obtiene JWT token
2. Accede a `/solicitudes/{token}/workflow`
3. Completa vistas 1, 2 y 3 como `CIUDADANO`
4. Cada vista se guarda correctamente

### Flujo al Llegar a Vista 4
1. Usuario completa vista 3 → backend intenta avanzar a vista 4
2. Backend detecta que etapa 4 requiere `FUNCIONARIO`
3. Frontend detecta error 403
4. Se muestra mensaje de **warning** (no error):
   - **Título**: "Revisión Pendiente"
   - **Mensaje**: Indica que completó las etapas disponibles
   - **Instrucción**: Debe esperar revisión de funcionario
5. **No** se muestra botón "Iniciar Nueva Solicitud" (porque no es un error)

### Flujo de Funcionario
1. Funcionario hace login con credenciales
2. Accede a bandeja de trámites
3. Ve solicitud con vistas 1-3 completadas por ciudadano
4. Continúa con vistas 4-11 como `FUNCIONARIO`
5. Completa proceso hasta vista final

---

## 📋 Testing Recomendado

### Test 1: Completar Vistas 1-3
```bash
# 1. Crear solicitud
curl -X POST http://localhost:8000/api/v1/public/solicitudes/iniciar \
  -H "Content-Type: application/json" \
  -d '{"pasaporte": "N1234567", "nombres": "Juan", "apellidos": "Pérez"}'

# 2. Completar vista 1 (con token obtenido)
# Frontend: Navegar a /solicitudes/{token}/workflow
# Llenar campos, click "Completar Etapa"

# 3. Repetir para vistas 2 y 3

# 4. Al intentar avanzar a vista 4:
# ✅ Debe mostrar mensaje "Revisión Pendiente" (warning, no error)
```

### Test 2: Verificar Estado en BD
```sql
-- Verificar instancia creada
SELECT id, num_expediente, estado, etapa_actual_id 
FROM WORKFLOW_INSTANCIA 
WHERE num_expediente LIKE 'PPSH-2025-%' 
ORDER BY created_at DESC;

-- Verificar respuestas guardadas
SELECT we.nombre as etapa, COUNT(wr.id) as respuestas
FROM WORKFLOW_RESPUESTA_ETAPA wre
JOIN WORKFLOW_RESPUESTA wr ON wre.id = wr.respuesta_etapa_id
JOIN WORKFLOW_ETAPA we ON wre.etapa_id = we.id
GROUP BY we.nombre;
```

---

## 🔐 Seguridad

### Validaciones Implementadas
- ✅ Token JWT validado en cada petición
- ✅ Perfil `CIUDADANO` no puede acceder a etapas de `FUNCIONARIO`
- ✅ Backend valida permisos en `obtener_vista_actual_para_usuario()`
- ✅ Frontend maneja gracefully el error 403

### Riesgos Mitigados
- ❌ Ciudadanos no pueden saltarse etapas
- ❌ Ciudadanos no pueden modificar respuestas de funcionarios
- ❌ Token no permite acceso a etapas restringidas

---

## 📝 Notas Adicionales

### Configuración de Perfiles por Etapa
Los perfiles permitidos se configuran en la tabla `WORKFLOW_ETAPA`:
```sql
UPDATE WORKFLOW_ETAPA 
SET perfiles_permitidos = '["CIUDADANO"]' 
WHERE orden IN (1, 2, 3);

UPDATE WORKFLOW_ETAPA 
SET perfiles_permitidos = '["FUNCIONARIO", "ADMIN"]' 
WHERE orden >= 4;
```

### Extensión Futura
Si se requiere permitir que ciudadanos completen más etapas:
1. Actualizar `perfiles_permitidos` en BD
2. No requiere cambios en código frontend/backend
3. El sistema es completamente configurable por etapa

---

## ✅ Checklist de Verificación

- [x] Error 403 detectado correctamente
- [x] Mensaje de warning amigable mostrado
- [x] No se muestra botón "Iniciar Nueva Solicitud" en caso de permisos
- [x] Mensaje explica que debe esperar revisión de funcionario
- [x] Sin errores de compilación TypeScript
- [x] Compatible con diseño de Figma (mantiene banner azul y layout)

---

**Estado**: ✅ Implementado y listo para pruebas
