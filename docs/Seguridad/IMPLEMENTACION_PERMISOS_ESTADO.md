# Implementación de Permisos para Cambio de Estado PPSH

**Fecha**: 25 de noviembre de 2025  
**Estado**: ✅ Implementado  
**Ref**: Guía Explícita para la Implementación de Cambios de Estado PPSH

---

## 📋 Resumen

Se implementó un sistema de validación de permisos por perfil para el cambio de estado de solicitudes PPSH, garantizando trazabilidad completa y cumplimiento normativo.

---

## 🔐 Matriz de Permisos por Estado

| Estado | Perfiles Autorizados | Requiere Motivo |
|--------|---------------------|-----------------|
| `RECIBIDO` | SISTEMA, ADMIN | No |
| `EN_REVISION` | FUNCIONARIO, ANALISTA, JEFE, DIRECTOR, ADMIN | No |
| `EN_EVALUACION` | ANALISTA, JEFE, DIRECTOR, ADMIN | No |
| `APROBADO` | JEFE, DIRECTOR, ADMIN | No |
| `RECHAZADO` | JEFE, DIRECTOR, ADMIN | ✅ Sí (mín. 10 caracteres) |
| `RESUELTO` | FUNCIONARIO, ANALISTA, JEFE, DIRECTOR, ADMIN | No |
| `SUBSANACION` | FUNCIONARIO, ANALISTA, JEFE, DIRECTOR, ADMIN | ✅ Sí (mín. 10 caracteres) |
| `CANCELADO` | JEFE, DIRECTOR, ADMIN | ✅ Sí (mín. 10 caracteres) |

---

## 🏗️ Archivos Modificados

### Backend

1. **`backend/app/services/services_ppsh.py`**
   - Añadida constante `PERMISOS_CAMBIO_ESTADO` con matriz de permisos
   - Añadida constante `ESTADOS_REQUIEREN_MOTIVO` 
   - Añadida función `validar_permiso_cambio_estado()`
   - Modificado método `SolicitudService.cambiar_estado()` para incluir validación

2. **`backend/app/routers/routers_ppsh.py`**
   - Actualizado endpoint `POST /solicitudes/{id}/cambiar-estado`
   - Ahora extrae `user_perfil` del `current_user`
   - Pasa el perfil al servicio para validación

3. **`backend/app/services/services_workflow.py`**
   - Añadida sincronización automática con solicitud PPSH al completar workflow
   - Cuando `es_etapa_final=true`, actualiza `PPSH_SOLICITUD.estado_actual`
   - Estado final determinado por `metadata_adicional.resultado_workflow` o `RESUELTO` por defecto

### Frontend

4. **`frontend/src/services/ppsh.service.ts`**
   - Añadido método `cambiarEstado()`
   - Añadido método `getHistorialEstados()`
   - Añadido método `getEstadosDisponibles()` con filtrado por perfil

5. **`frontend/src/types/ppsh.ts`**
   - Añadida interface `EstadoHistorial`
   - Añadida interface `CambiarEstadoRequest`
   - Añadida constante `PERMISOS_ESTADO_POR_PERFIL`
   - Añadida constante `ESTADOS_REQUIEREN_MOTIVO`
   - Añadidas funciones helper `puedeAsignarEstado()` y `requiereMotivo()`

---

## 🔄 Flujo de Validación

```
Usuario intenta cambiar estado
       ↓
┌──────────────────────────────────────┐
│ 1. Verificar permisos de asignación  │
│    (solicitud asignada al usuario)   │
└──────────────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ 2. Obtener perfil del usuario        │
│    (FUNCIONARIO, ANALISTA, etc.)     │
└──────────────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ 3. Validar permiso por perfil        │
│    (PERMISOS_CAMBIO_ESTADO)          │
└──────────────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ 4. Validar motivo si requerido       │
│    (RECHAZADO, CANCELADO, SUBSANACION)│
└──────────────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ 5. Ejecutar cambio de estado         │
│    + Registrar en historial          │
└──────────────────────────────────────┘
```

---

## 🔗 Sincronización Workflow ↔ PPSH

Cuando un workflow llega a su etapa final (`es_etapa_final=true`):

1. El sistema detecta si hay una solicitud PPSH vinculada
2. Determina el estado final:
   - Si `metadata_adicional.resultado_workflow = "APROBADO"` → `APROBADO`
   - Si `metadata_adicional.resultado_workflow = "RECHAZADO"` → `RECHAZADO`
   - Por defecto → `RESUELTO`
3. Actualiza automáticamente `PPSH_SOLICITUD.estado_actual`
4. El cambio se hace con `user_perfil = "SISTEMA"` (bypass de validación de perfil)

---

## 📝 Uso en Frontend

### Cambiar estado de una solicitud

```typescript
import { ppshService } from '../services/ppsh.service';
import { requiereMotivo } from '../types/ppsh';

// Verificar si requiere motivo
const estadoNuevo = 'RECHAZADO';
const necesitaMotivo = requiereMotivo(estadoNuevo);

// Cambiar estado
await ppshService.cambiarEstado(solicitudId, {
  estado_nuevo: estadoNuevo,
  observaciones: necesitaMotivo ? 'Motivo del rechazo...' : undefined,
  es_dictamen: true,
  tipo_dictamen: 'DESFAVORABLE',
  dictamen_detalle: 'Documentación incompleta'
});
```

### Obtener estados disponibles para un perfil

```typescript
const usuario = { perfil: 'FUNCIONARIO' };
const estadosDisponibles = await ppshService.getEstadosDisponibles(usuario.perfil);
// Retorna: [EN_REVISION, RESUELTO, SUBSANACION]
```

### Ver historial de estados

```typescript
const historial = await ppshService.getHistorialEstados(solicitudId);
// Retorna array de EstadoHistorial con fechas, usuarios, observaciones, etc.
```

---

## ⚠️ Errores Posibles

| Código | Mensaje | Causa |
|--------|---------|-------|
| 403 | "Su perfil 'X' no puede asignar el estado 'Y'" | Perfil sin permiso para ese estado |
| 403 | "El estado 'X' requiere observaciones/motivo" | Falta motivo obligatorio |
| 403 | "No tiene la solicitud asignada" | Usuario no asignado a la solicitud |
| 404 | "Estado con identificador X no encontrado" | Estado no existe en catálogo |

---

## ✅ Tests Recomendados

1. **Test de permisos por perfil**
   - FUNCIONARIO intenta asignar APROBADO → Error 403
   - DIRECTOR asigna APROBADO → OK

2. **Test de motivo obligatorio**
   - Cambiar a RECHAZADO sin observaciones → Error 403
   - Cambiar a RECHAZADO con observaciones cortas (<10 chars) → Error 403
   - Cambiar a RECHAZADO con observaciones válidas → OK

3. **Test de sincronización workflow**
   - Completar workflow vinculado → Verificar estado PPSH actualizado

---

## 📊 Impacto

- ✅ Trazabilidad completa de cambios de estado
- ✅ Cumplimiento normativo por perfil
- ✅ Motivos obligatorios para estados críticos
- ✅ Sincronización automática workflow ↔ PPSH
- ✅ Auditoría en `PPSH_ESTADO_HISTORIAL`
