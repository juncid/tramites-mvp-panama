# TODO: Integración Workflow-Solicitudes en UI

**Fecha creación**: 24 de noviembre de 2025  
**Prioridad**: Media  
**Estado**: Pendiente

---

## 📋 Contexto

Actualmente existen **2 sistemas de gestión de etapas** operando en paralelo:

### Sistema 1: Etapas PPSH Legacy
- **Ruta**: `/solicitudes/:id/etapas`
- **Backend**: `/api/v1/ppsh/solicitudes/{id}/etapas`
- **Tabla**: `PPSH_TB_ETAPA_SOLICITUD`
- **Características**:
  - Solo lectura desde UI
  - Etapas fijas hardcodeadas
  - Botones Ver/Editar solo funcionan para etapa 1.7
  - No integrado con workflows dinámicos

### Sistema 2: Workflows Dinámicos (Nuevo)
- **Ruta**: `/workflows/{instancia_id}/execution`
- **Backend**: `/api/v1/workflow/instancias/{id}/vista-actual`
- **Tabla**: `WORKFLOW_INSTANCIA`
- **Características**:
  - Vistas dinámicas configurables
  - Permisos por perfil (CIUDADANO, FUNCIONARIO, ADMIN)
  - Formularios editables con validaciones
  - Sistema de respuestas flexible

---

## 🎯 Tareas Pendientes

### Tarea 1: Actualizar Vista de Solicitudes
**Archivo**: `frontend/src/pages/Solicitudes.tsx`

Modificar el botón "Ver etapas" para detectar si la solicitud tiene workflow vinculado:

```typescript
// Agregar columna workflow_instancia_id en la respuesta del backend
const hasWorkflow = solicitud.workflow_instancia_id !== null;

// Renderizado condicional del botón
{hasWorkflow ? (
  <Button
    variant="outlined"
    size="small"
    startIcon={<AccountTreeIcon />}
    onClick={() => navigate(`/workflows/${solicitud.workflow_instancia_id}/execution`)}
  >
    Ver Workflow
  </Button>
) : (
  <Button
    variant="outlined"
    size="small"
    startIcon={<VisibilityIcon />}
    onClick={() => navigate(`/solicitudes/${solicitud.id_solicitud}/etapas`)}
  >
    Ver Etapas (Legacy)
  </Button>
)}
```

**Criterios de aceptación**:
- [x] Solicitud 2064 (vinculada) debe mostrar "Ver Workflow"
- [ ] Solicitudes sin workflow deben mostrar "Ver Etapas (Legacy)"
- [ ] Click en "Ver Workflow" navega a `/workflows/{instancia_id}/execution`
- [ ] Click en "Ver Etapas" navega a `/solicitudes/{id}/etapas`

---

### Tarea 2: Migrar Página de Etapas
**Archivo**: `frontend/src/pages/Etapas.tsx`

Actualizar para detectar automáticamente si hay workflow vinculado:

```typescript
const [solicitud, setSolicitud] = useState<any>(null);

useEffect(() => {
  const loadSolicitud = async () => {
    const data = await ppshService.getSolicitud(parseInt(id!));
    setSolicitud(data);
    
    // Si tiene workflow, redirigir
    if (data.workflow_instancia_id) {
      navigate(`/workflows/${data.workflow_instancia_id}/execution`);
      return;
    }
    
    // Si no tiene workflow, cargar etapas legacy
    await loadEtapas();
  };
  
  loadSolicitud();
}, [id]);
```

**Criterios de aceptación**:
- [ ] Al acceder a `/solicitudes/2064/etapas` se redirecciona a workflow
- [ ] Solicitudes sin workflow muestran vista legacy actual
- [ ] Mensaje informativo indica que es sistema legacy

---

### Tarea 3: Agregar Botón de Vinculación
**Archivo**: `frontend/src/pages/Solicitudes.tsx`

Para solicitudes sin workflow, agregar opción de vinculación manual:

```typescript
// Solo para ADMIN o FUNCIONARIO
{!hasWorkflow && userRole === 'ADMIN' && (
  <Tooltip title="Vincular a Workflow Dinámico">
    <IconButton
      size="small"
      onClick={() => handleVincularWorkflow(solicitud.id_solicitud)}
    >
      <LinkIcon />
    </IconButton>
  </Tooltip>
)}
```

**Función de vinculación**:
```typescript
const handleVincularWorkflow = async (solicitudId: number) => {
  try {
    const response = await workflowService.vincularPPSHExistente({
      workflow_id: 5005, // PPSH Completo
      solicitud_id: solicitudId,
      nombre_instancia: `Solicitud #${solicitudId}`
    });
    
    // Refrescar lista
    await loadSolicitudes();
    
    // Mostrar notificación
    showSuccessMessage('Solicitud vinculada al workflow exitosamente');
  } catch (error) {
    showErrorMessage('Error al vincular solicitud');
  }
};
```

**Criterios de aceptación**:
- [ ] Solo visible para usuarios ADMIN
- [ ] Dialog de confirmación antes de vincular
- [ ] Vinculación exitosa actualiza la lista automáticamente
- [ ] Muestra mensaje de éxito/error apropiado

---

### Tarea 4: Actualizar Backend Response
**Archivo**: `backend/app/routers/routers_ppsh.py`

Incluir `workflow_instancia_id` en la respuesta de listado de solicitudes:

```python
@router.get("/solicitudes", response_model=PaginatedResponse[SolicitudListResponse])
def listar_solicitudes(...):
    # Agregar join con WORKFLOW_INSTANCIA si existe vinculación
    # Incluir campo workflow_instancia_id en el response
    pass
```

**Criterios de aceptación**:
- [ ] Campo `workflow_instancia_id` en response de `/api/v1/ppsh/solicitudes`
- [ ] Campo `workflow_instancia_id` en response de `/api/v1/ppsh/solicitudes/{id}`
- [ ] Documentación de schema actualizada
- [ ] Tests unitarios actualizados

---

### Tarea 5: Migración Masiva (Opcional)
**Script**: `scripts/migrate_solicitudes_to_workflow.py`

Crear script para vincular todas las solicitudes existentes al workflow:

```python
# Script para migración masiva
# 1. Listar solicitudes sin workflow_instancia_id
# 2. Para cada solicitud:
#    - Verificar estado (solo RECIBIDO, EN_PROCESO)
#    - Vincular al workflow PPSH (ID 5005)
#    - Logging detallado
# 3. Reporte final de migración
```

**Criterios de aceptación**:
- [ ] Script con dry-run mode
- [ ] Logging detallado de cada vinculación
- [ ] Manejo de errores y rollback
- [ ] Reporte CSV con resultados

---

## 🔄 Flujo Esperado Post-Implementación

### Para Solicitudes con Workflow (Nuevo)
1. Usuario hace click en "Ver Workflow"
2. Navega a `/workflows/{instancia_id}/execution`
3. Ve formulario dinámico con vistas configurables
4. Puede editar según permisos de su perfil
5. Sistema de transiciones automáticas

### Para Solicitudes Legacy (Sin Workflow)
1. Usuario hace click en "Ver Etapas (Legacy)"
2. Navega a `/solicitudes/{id}/etapas`
3. Ve tabla de solo lectura con etapas fijas
4. Mensaje indica que es sistema legacy
5. Botón para "Migrar a Workflow" (solo ADMIN)

---

## 📊 Impacto Estimado

- **Usuarios afectados**: Todos los funcionarios
- **Tiempo de desarrollo**: 8-12 horas
- **Riesgo**: Bajo (cambios no rompen funcionalidad existente)
- **Beneficio**: Transición gradual al sistema de workflows

---

## ✅ Vinculación Manual Realizada

### Solicitud 2064 - Vinculada Exitosamente
```json
{
  "instancia_id": 3011,
  "solicitud_id": 2064,
  "workflow_id": 5005,
  "num_expediente": "PPSH-2025-007784",
  "estado": "INICIADO",
  "etapa_actual_id": 4035,
  "fecha_vinculacion": "2025-11-24T01:51:55Z"
}
```

**Acceso directo**: http://localhost:3000/workflows/3011/execution

---

## 📝 Notas Adicionales

### Consideraciones de UX
- Agregar badge "Workflow" o "Legacy" en listado de solicitudes
- Tooltip explicativo sobre la diferencia entre ambos sistemas
- Animación de transición al migrar de legacy a workflow

### Consideraciones de Performance
- Cache de consulta `workflow_instancia_id` en listado
- Índice en columna `workflow_instancia_id` de tabla PPSH_TB_SOLICITUD
- Paginación en listado de solicitudes

### Seguridad
- Solo ADMIN puede vincular/desvincular workflows
- Auditoría de cambios en tabla WORKFLOW_VINCULACION_AUDITORIA
- Validar permisos antes de mostrar opciones de vinculación

---

**Estado actual**: ✅ Solución temporal implementada (vinculación manual)  
**Próximo paso**: Implementar Tarea 1 (Actualizar Vista de Solicitudes)
