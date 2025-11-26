# Sistema de Vistas Dinámicas por Permisos - Implementación Completa

**Fecha**: 22 de Noviembre 2024  
**Branch**: `implementar-vistas`  
**Estado**: ✅ **IMPLEMENTACIÓN BACKEND Y FRONTEND COMPLETA**

---

## 📋 Resumen Ejecutivo

Se ha implementado un sistema completo de **vistas dinámicas por permisos y etapas** que permite:

1. ✅ Crear solicitudes PPSH vinculadas a workflows en una sola operación
2. ✅ Control granular de permisos por perfil de usuario y etapa
3. ✅ Vistas de formulario filtradas según permisos del usuario
4. ✅ Interfaz de ejecución de workflows con layout profesional de 3 columnas
5. ✅ Visibilidad condicional de campos basada en respuestas previas

---

## 🎯 Objetivos Alcanzados

### Backend (Python/FastAPI)

- [x] Servicio de integración Workflow-PPSH
- [x] Schemas de integración y permisos
- [x] 5 nuevos endpoints REST
- [x] Sistema de control de permisos granular
- [x] Vista actual filtrada por usuario

### Frontend (React/TypeScript)

- [x] Componente DynamicEtapaView mejorado
- [x] Página WorkflowExecution completa
- [x] Servicio de API extendido
- [x] Gestión de estados y respuestas
- [x] UI responsive con Material-UI

---

## 📂 Archivos Creados/Modificados

### Backend

#### **Nuevos Archivos**

1. **`backend/app/services/workflow_ppsh_service.py`** (Nuevo - 458 líneas)
   - Clase `WorkflowPPSHIntegrationService` con 4 métodos principales
   - Manejo transaccional de creación integrada
   - Helpers para obtener datos de vinculación

#### **Archivos Modificados**

2. **`backend/app/schemas/schemas_workflow.py`** (+95 líneas)
   - `WorkflowInstanciaConPPSHCreate`: Schema para creación integrada
   - `WorkflowInstanciaConPPSHExistenteCreate`: Schema para vinculación existente
   - `WorkflowInstanciaPPSHResponse`: Response con ambos IDs
   - `DatosVinculacionPPSHResponse`: Información de vinculación

3. **`backend/app/routers/routers_workflow.py`** (+188 líneas)
   - 3 nuevos endpoints de integración PPSH
   - 2 nuevos endpoints de permisos
   - Validación y manejo de errores robusto

4. **`backend/app/services/services_workflow.py`** (+230 líneas)
   - `puede_usuario_ver_etapa()`: Verificación por perfil
   - `puede_usuario_editar_etapa()`: Validación granular
   - `obtener_vista_actual_para_usuario()`: Vista filtrada completa

### Frontend

#### **Nuevos Archivos**

5. **`frontend/src/pages/WorkflowExecution.tsx`** (Nuevo - 480 líneas)
   - Página principal de ejecución de workflows
   - Layout de 3 columnas: Progreso | Formulario | Info
   - Breadcrumbs, chips de estado, stepper vertical
   - Integración completa con API de permisos

#### **Archivos Modificados**

6. **`frontend/src/components/Workflow/DynamicEtapaView.tsx`** (+420 líneas, refactor completo)
   - Modo dinámico con carga desde API
   - Modo legacy con props directo (retrocompatibilidad)
   - Gestión de estados de respuestas
   - Evaluación de visibilidad condicional
   - Botones de guardar/completar etapa
   - Indicadores de permisos (solo lectura, sin acceso)

7. **`frontend/src/services/workflow.service.ts`** (+110 líneas)
   - 7 nuevos métodos de API
   - Endpoints de integración PPSH
   - Endpoints de permisos y vistas
   - Métodos de gestión de respuestas

---

## 🔌 API Endpoints Implementados

### 1. Integración Workflow-PPSH

```typescript
POST /api/v1/workflow/instancias/crear-con-ppsh
Body: {
  workflow_id: number;
  nombre_instancia?: string;
  solicitud_ppsh: {
    tipo_solicitud: 'INDIVIDUAL' | 'GRUPAL';
    cod_causa_humanitaria: number;
    solicitantes: [...];
    // ... más campos
  }
}
Response: WorkflowInstanciaPPSHResponse
```

```typescript
POST /api/v1/workflow/instancias/vincular-ppsh-existente
Body: {
  workflow_id: number;
  solicitud_id: number;
  nombre_instancia?: string;
}
Response: WorkflowInstanciaPPSHResponse
```

```typescript
GET /api/v1/workflow/instancias/{instancia_id}/vinculacion-ppsh?expanded=true
Response: DatosVinculacionPPSHResponse
```

### 2. Control de Permisos

```typescript
GET /api/v1/workflow/instancias/{instancia_id}/vista-actual?user_perfil=FUNCIONARIO
Response: {
  instancia: {...},
  etapa_actual: {...},
  puede_ver: boolean,
  puede_editar: boolean,
  campos: CampoVista[],
  metadata_instancia: {...}
}
```

```typescript
GET /api/v1/workflow/instancias/{instancia_id}/verificar-permisos?user_perfil=FUNCIONARIO&etapa_id=5
Response: {
  puede_ver: boolean,
  puede_editar: boolean,
  etapa_id: number,
  etapa_nombre: string,
  perfil_usuario: string,
  perfiles_permitidos: string[],
  razon: string
}
```

---

## 🏗️ Arquitectura del Sistema

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│  WorkflowExecution                                          │
│   ├── Header (Breadcrumbs, Chips)                          │
│   ├── Sidebar (Stepper de progreso)                        │
│   ├── Main (DynamicEtapaView)                              │
│   └── Info (Historial, Comentarios)                        │
│                          │                                   │
│                          ▼                                   │
│  DynamicEtapaView                                           │
│   ├── Carga vista desde API (getVistaActual)              │
│   ├── Renderiza campos según tipo_pregunta                 │
│   ├── Evalúa visibilidad condicional                       │
│   ├── Gestiona respuestas en estado local                  │
│   └── Botones: Guardar / Completar                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP Requests
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                        │
├─────────────────────────────────────────────────────────────┤
│  Router: routers_workflow.py                               │
│   ├── POST /instancias/crear-con-ppsh                      │
│   ├── GET /instancias/{id}/vista-actual                    │
│   └── GET /instancias/{id}/verificar-permisos              │
│                          │                                   │
│                          ▼                                   │
│  Services                                                    │
│   ├── WorkflowPPSHIntegrationService                       │
│   │   ├── crear_instancia_con_solicitud_ppsh()            │
│   │   ├── vincular_solicitud_existente()                  │
│   │   └── obtener_solicitud_ppsh_desde_instancia()        │
│   │                                                          │
│   └── InstanciaService                                      │
│       ├── puede_usuario_ver_etapa()                        │
│       ├── puede_usuario_editar_etapa()                     │
│       └── obtener_vista_actual_para_usuario()             │
│                          │                                   │
│                          ▼                                   │
│  Database (PostgreSQL/MSSQL)                                │
│   ├── WORKFLOW_INSTANCIA                                   │
│   │   └── metadata_adicional: {ppsh_solicitud_id: X}      │
│   └── PPSH_SOLICITUD                                       │
│       └── (referencia opcional, no FK)                     │
└─────────────────────────────────────────────────────────────┘
```

### Modelo de Permisos

```python
# 1. Verificación de Perfil
def puede_usuario_ver_etapa(user_id, user_perfil, etapa_id):
    etapa = get_etapa(etapa_id)
    
    # Si no hay perfiles, permitir (INICIO/FIN)
    if not etapa.perfiles_permitidos:
        return True
    
    # Si perfil está en lista
    if user_perfil in etapa.perfiles_permitidos:
        return True
    
    # ADMIN siempre puede
    if user_perfil == "ADMIN":
        return True
    
    return False

# 2. Verificación de Edición
def puede_usuario_editar_etapa(user_id, user_perfil, instancia_id, etapa_id):
    # 1. Debe poder ver
    if not puede_usuario_ver_etapa(...):
        return False
    
    instancia = get_instancia(instancia_id)
    
    # 2. Instancia activa
    if not instancia.activo:
        return False
    
    # 3. No está completada o cancelada
    if instancia.estado in ["COMPLETADO", "CANCELADO"]:
        return False
    
    # 4. Es la etapa actual
    if instancia.etapa_actual_id != etapa_id:
        return False
    
    # 5. Si está asignado, solo ese usuario
    if instancia.asignado_a_user_id:
        if instancia.asignado_a_user_id != user_id:
            if user_perfil != "ADMIN":
                return False
    
    return True
```

---

## 🎨 Componentes UI Implementados

### WorkflowExecution

**Layout Responsivo:**
- **Grid MD=3**: Sidebar con Stepper vertical de progreso
- **Grid MD=6**: Main con formulario dinámico (DynamicEtapaView)
- **Grid MD=3**: Info con tabs (Info, Historial, Notas)

**Características:**
- Breadcrumbs navegables
- Chips de estado (INICIADO, EN_PROGRESO, COMPLETADO)
- Chips de prioridad (ALTA, NORMAL, BAJA)
- Refresh button con key-based reloading
- Integración con metadata PPSH

**Estados:**
- ✅ Loading con CircularProgress
- ✅ Error con Alert + botón volver
- ✅ Success con datos completos

### DynamicEtapaView Mejorado

**Modos de Operación:**
1. **Modo Dinámico** (con `instanciaId`):
   - Carga vista desde API
   - Filtra por permisos de usuario
   - Gestiona respuestas localmente
   - Botones guardar/completar integrados

2. **Modo Legacy** (con `etapa` prop):
   - Renderizado directo sin API
   - Retrocompatibilidad total
   - Sin validación de permisos

**Características Avanzadas:**
- Evaluación de visibilidad condicional (`mostrar_si`)
- Indicadores visuales de permisos (Alert con icono Lock/Visibility)
- Validación de campos obligatorios antes de completar
- Gestión de valores actuales desde respuestas previas
- Error boundaries para cada campo

---

## 🔐 Sistema de Seguridad

### Niveles de Permiso

1. **PERFIL**: Define qué etapas puede ver un usuario
   ```python
   etapa.perfiles_permitidos = ["ADMIN", "FUNCIONARIO", "ANALISTA"]
   ```

2. **ESTADO DE INSTANCIA**: Solo se edita si está activa y no terminal
   ```python
   if instancia.estado in ["COMPLETADO", "CANCELADO"]:
       return False
   ```

3. **ETAPA ACTUAL**: Solo se edita la etapa donde está el proceso
   ```python
   if instancia.etapa_actual_id != etapa_id:
       return False
   ```

4. **ASIGNACIÓN**: Si está asignado, solo ese usuario puede editar
   ```python
   if instancia.asignado_a_user_id != user_id:
       if user_perfil != "ADMIN":
           return False
   ```

### Rol Especial: ADMIN

El perfil `ADMIN` tiene privilegios especiales:
- ✅ Puede ver todas las etapas
- ✅ Puede editar instancias asignadas a otros
- ✅ Bypass de restricciones de perfil

---

## 📊 Estructura de Datos

### WorkflowInstancia con PPSH

```json
{
  "id": 123,
  "workflow_id": 2,
  "num_expediente": "WF-PPSH-2024-000001",
  "estado": "EN_PROGRESO",
  "etapa_actual_id": 5,
  "metadata_adicional": {
    "ppsh_solicitud_id": 456,
    "ppsh_num_expediente": "PPSH-2024-000789",
    "ppsh_tipo_solicitud": "INDIVIDUAL",
    "ppsh_causa_humanitaria": 1,
    "fecha_vinculacion": "2024-11-22T10:30:00",
    "vinculado_por": "USER001"
  }
}
```

### VistaActual Response

```json
{
  "instancia": {
    "id": 123,
    "num_expediente": "WF-PPSH-2024-000001",
    "estado": "EN_PROGRESO",
    "prioridad": "NORMAL"
  },
  "etapa_actual": {
    "id": 5,
    "nombre": "Revisión de Documentos",
    "tipo_etapa": "ETAPA",
    "titulo_formulario": "Revisión de Documentación",
    "es_etapa_final": false
  },
  "puede_ver": true,
  "puede_editar": true,
  "campos": [
    {
      "id": 10,
      "codigo": "CAMPO_001",
      "pregunta": "Documento de identidad válido",
      "tipo_pregunta": "OPCIONES",
      "orden": 1,
      "es_obligatoria": true,
      "opciones": ["Sí", "No", "Requiere revisión"],
      "puede_editar_campo": true,
      "valor_actual": {
        "valor_opcion": "Sí"
      }
    }
  ]
}
```

---

## 🧪 Testing Pendiente

### Backend

- [ ] Unit tests para `WorkflowPPSHIntegrationService`
- [ ] Unit tests para métodos de permisos
- [ ] Integration tests para endpoints
- [ ] Tests de rollback transaccional

### Frontend

- [ ] Unit tests para `DynamicEtapaView`
- [ ] Unit tests para `WorkflowExecution`
- [ ] Integration tests con mock API
- [ ] E2E tests con Cypress/Playwright

### E2E Flow

1. Crear workflow con etapas y permisos
2. Crear instancia con solicitud PPSH
3. Iniciar sesión con diferentes perfiles
4. Verificar permisos de visualización
5. Completar etapas secuencialmente
6. Validar progreso y cambios de estado
7. Verificar vinculación PPSH

---

## 📈 Métricas de Implementación

- **Backend**: 971 líneas de código nuevo
  - Servicios: 458 líneas
  - Schemas: 95 líneas
  - Routers: 188 líneas
  - Lógica de permisos: 230 líneas

- **Frontend**: 1010 líneas de código nuevo
  - WorkflowExecution: 480 líneas
  - DynamicEtapaView: 420 líneas (refactor completo)
  - Services: 110 líneas

- **Total**: 1981 líneas de código implementadas

---

## 🚀 Próximos Pasos

### Corto Plazo (1-2 semanas)

1. **Testing E2E**
   - Crear test suite completo
   - Validar flujos de permisos
   - Probar edge cases

2. **Documentación de Usuario**
   - Manual de uso para funcionarios
   - Guía de configuración de workflows
   - FAQs y troubleshooting

3. **Optimizaciones**
   - Caché de vistas frecuentes
   - Lazy loading de campos
   - Paginación de historial

### Medio Plazo (1 mes)

4. **Historial y Auditoría**
   - Componente de historial completo
   - Tracking de cambios por usuario
   - Exportación de auditoría

5. **Sistema de Comentarios**
   - Comentarios internos y externos
   - Menciones a usuarios
   - Notificaciones en tiempo real

6. **Mejoras de UX**
   - Guardado automático de borradores
   - Validación en tiempo real
   - Tooltips y ayuda contextual

### Largo Plazo (3 meses)

7. **Notificaciones**
   - Email/SMS cuando se asigna tarea
   - Alertas de vencimiento de plazo
   - Dashboard de tareas pendientes

8. **Analytics**
   - Métricas de tiempo por etapa
   - Cuellos de botella en procesos
   - Reportes de productividad

9. **Móvil**
   - App móvil React Native
   - Notificaciones push
   - Ejecución offline

---

## 📝 Notas de Implementación

### Decisiones Técnicas

1. **Enfoque Liviano de Integración**
   - Sin Foreign Keys entre WORKFLOW_INSTANCIA y PPSH_SOLICITUD
   - Referencia vía `metadata_adicional` (JSON)
   - Flexibilidad para futura extensión

2. **Permisos en Backend**
   - Validación server-side obligatoria
   - Frontend solo muestra/oculta UI
   - Nunca confiar solo en cliente

3. **Estado de Respuestas**
   - Gestión local en componente
   - Guardado explícito por usuario
   - Autoguardado futuro opcional

4. **Visibilidad Condicional**
   - Evaluación en frontend
   - Formato simple: `{campo_id: valor}`
   - Extensible a expresiones complejas

### Limitaciones Conocidas

1. **Autenticación**
   - Actualmente usa valores hardcoded
   - TODO: Integrar con sistema real de auth
   - Perfil de usuario debe venir del token JWT

2. **Historial**
   - Estructura de BD lista pero UI pendiente
   - Tracking de cambios implementado parcialmente

3. **Validaciones**
   - Regex validations implementadas en schema
   - Ejecución de validaciones en frontend pendiente

4. **Performance**
   - Sin caché implementado aún
   - Queries N+1 en algunas vistas
   - Optimización con índices pendiente

---

## 🎓 Conocimientos Necesarios para Mantenimiento

### Backend
- Python 3.11+
- FastAPI y Pydantic
- SQLAlchemy ORM
- Transacciones de BD
- Principios SOLID

### Frontend
- React 18+ con Hooks
- TypeScript 5+
- Material-UI v5
- Gestión de estado con useState
- Async/await patterns

### DevOps
- Docker para desarrollo
- PostgreSQL/MSSQL
- Nginx para reverse proxy
- Git flow con feature branches

---

## ✅ Checklist de Deployment

- [ ] Ejecutar migraciones de BD (ya existen)
- [ ] Configurar variables de entorno
- [ ] Verificar permisos de perfiles en workflows
- [ ] Probar endpoints en ambiente staging
- [ ] Validar integración con sistema de auth
- [ ] Ejecutar test suite completo
- [ ] Backup de BD antes de deploy
- [ ] Deploy a producción
- [ ] Monitoreo de logs y errores
- [ ] Capacitación a usuarios finales

---

**Documento generado**: 22 de Noviembre 2024  
**Autor**: Sistema de Trámites MVP Panamá  
**Versión**: 1.0.0  
**Branch**: `implementar-vistas`
