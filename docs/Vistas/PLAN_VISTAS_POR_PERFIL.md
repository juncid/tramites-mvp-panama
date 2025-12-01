# Plan de Implementación: Vistas por Perfil de Usuario

## Fecha: 18 de noviembre, 2025
## Objetivo: Permitir que los usuarios vean solo las etapas/vistas asociadas a su perfil

---

## 1. ANÁLISIS DEL ESTADO ACTUAL

### ✅ Lo que ya tenemos:
- **Perfiles definidos**: Ciudadano, Abogado, Funcionario, Recepcionista, Folio, Jefatura, Sistema, Supervisor, Administrador
- **Configuración de workflows**: Sistema de etapas con asignación de perfiles
- **Tipos de etapas**: Etapa, Presencial, Decision, Vista
- **Tipos de preguntas**: TEXTO, LISTA, SELECCION_SIMPLE, CARGA_ARCHIVO, DESCARGA_ARCHIVO, DATOS_CASO, REVISION_MANUAL_DOCUMENTOS, REVISION_OCR, FECHA, IMPRESION
- **Componentes existentes**:
  - `WorkflowEditor.tsx`: Editor de workflows con ReactFlow
  - `EtapaConfigPanel.tsx`: Panel de configuración de etapas
  - `VistaConfiguratorPanel.tsx`: Configurador de vistas

### 🔍 Lo que necesitamos investigar:
1. ¿Cómo se autentica el usuario y se obtiene su perfil?
2. ¿Dónde se almacenan los workflows en la BD?
3. ¿Cómo se relacionan los casos/trámites con los workflows?
4. ¿Existe una API para obtener las etapas por perfil?

---

## 2. ARQUITECTURA PROPUESTA

### 2.1. Backend (API)

#### Endpoints necesarios:

```
GET /api/workflows/:workflow_id/etapas/by-perfil
  - Query params: perfil (string)
  - Response: Lista de etapas visibles para ese perfil
  - Filtrado: etapas donde el perfil está incluido en perfiles_asignados

GET /api/casos/:caso_id/workflow-state
  - Response: Estado actual del workflow del caso
  - Incluye: etapa_actual, etapas_completadas, etapas_disponibles

GET /api/casos/:caso_id/etapas-disponibles
  - Query params: perfil (string)
  - Response: Etapas que el usuario puede ver/ejecutar
  - Lógica: filtrar por perfil + estado del workflow

POST /api/casos/:caso_id/etapas/:etapa_id/ejecutar
  - Body: respuestas del formulario
  - Response: nueva etapa_actual, estado actualizado
```

#### Modelos de datos a revisar:

```python
# backend/app/models/workflow.py
class WorkflowEtapa:
    - perfiles: List[str]  # Ya existe
    - tipo: TipoEtapa
    - preguntas: List[WorkflowPregunta]
    
class CasoWorkflowState:
    - caso_id
    - workflow_id
    - etapa_actual_id
    - etapas_completadas: List[str]
    - respuestas: JSON
```

---

### 2.2. Frontend (Vistas del Usuario)

#### Componentes nuevos a crear:

```typescript
// frontend/src/components/Workflow/UserWorkflowView.tsx
// Vista principal para el usuario: muestra su workflow personal
interface UserWorkflowViewProps {
  casoId: string;
  perfilUsuario: string;
}

// frontend/src/components/Workflow/EtapaExecutionForm.tsx
// Formulario dinámico para ejecutar una etapa
interface EtapaExecutionFormProps {
  etapa: WorkflowEtapa;
  onSubmit: (respuestas: any) => Promise<void>;
  onCancel: () => void;
}

// frontend/src/components/Workflow/WorkflowProgressIndicator.tsx
// Indicador de progreso del workflow
interface WorkflowProgressIndicatorProps {
  etapas: WorkflowEtapa[];
  etapaActual: string;
  etapasCompletadas: string[];
}
```

---

## 3. PLAN DE IMPLEMENTACIÓN (Día por día)

### 📅 DÍA 1: Backend - APIs y Lógica de Filtrado

**Tareas:**
1. ✅ Revisar modelos existentes en `backend/app/models/workflow.py`
2. ✅ Crear/actualizar endpoints en `backend/app/routes/workflow.py`:
   - GET `/workflows/:id/etapas/by-perfil`
   - GET `/casos/:id/workflow-state`
3. ✅ Implementar lógica de filtrado de etapas por perfil
4. ✅ Crear servicio `WorkflowExecutionService` en `backend/app/services/workflow_execution.py`
5. ✅ Agregar tests para los endpoints

**Archivos a modificar/crear:**
- `backend/app/routes/workflow.py`
- `backend/app/services/workflow_execution.py` (nuevo)
- `backend/app/models/workflow.py` (revisar/actualizar)
- `backend/tests/test_workflow_execution.py` (nuevo)

---

### 📅 DÍA 2: Frontend - Vista del Usuario

**Tareas:**
1. ✅ Crear `UserWorkflowView.tsx`:
   - Mostrar etapas disponibles para el perfil
   - Indicar etapa actual
   - Mostrar progreso del workflow
2. ✅ Crear `WorkflowProgressIndicator.tsx`:
   - Visualización tipo stepper/timeline
   - Estados: completado, actual, pendiente, bloqueado
3. ✅ Integrar con API de backend
4. ✅ Manejo de estados y errores

**Archivos a crear:**
- `frontend/src/components/Workflow/UserWorkflowView.tsx`
- `frontend/src/components/Workflow/WorkflowProgressIndicator.tsx`
- `frontend/src/hooks/useWorkflowState.ts`
- `frontend/src/services/workflowApi.ts` (actualizar)

---

### 📅 DÍA 3: Formulario de Ejecución

**Tareas:**
1. ✅ Crear `EtapaExecutionForm.tsx`:
   - Renderizado dinámico según tipo de pregunta
   - Validaciones
   - Carga de archivos
2. ✅ Implementar renderizado para cada tipo de pregunta:
   - TEXTO → TextField
   - LISTA → Checkboxes múltiples
   - SELECCION_SIMPLE → Radio/Checkboxes
   - CARGA_ARCHIVO → Upload component
   - DESCARGA_ARCHIVO → Download button
   - DATOS_CASO → Display only
   - FECHA → DatePicker
   - etc.
3. ✅ Conectar con API de ejecución

**Archivos a crear:**
- `frontend/src/components/Workflow/EtapaExecutionForm.tsx`
- `frontend/src/components/Workflow/QuestionRenderers/` (carpeta nueva)
  - `TextQuestionRenderer.tsx`
  - `ListQuestionRenderer.tsx`
  - `FileUploadRenderer.tsx`
  - `DateQuestionRenderer.tsx`
  - etc.

---

### 📅 DÍA 4: Integración y Navegación

**Tareas:**
1. ✅ Integrar vista de usuario en rutas principales
2. ✅ Crear página de "Mis Trámites" con lista de casos
3. ✅ Navegación entre etapas
4. ✅ Breadcrumbs y navegación contextual
5. ✅ Permisos y autorización

**Archivos a modificar/crear:**
- `frontend/src/pages/MisTramites.tsx` (nuevo)
- `frontend/src/pages/CasoWorkflow.tsx` (nuevo)
- `frontend/src/App.tsx` (agregar rutas)
- `frontend/src/components/Navigation/` (actualizar)

---

### 📅 DÍA 5: Testing y Refinamiento

**Tareas:**
1. ✅ Tests unitarios de componentes
2. ✅ Tests de integración
3. ✅ Validación de flujos completos
4. ✅ Manejo de casos edge:
   - Etapa sin permisos
   - Workflow completado
   - Errores de red
5. ✅ Optimización de performance
6. ✅ Documentación

---

## 4. CONSIDERACIONES TÉCNICAS

### 4.1. Estado del Workflow

**Estrategia de almacenamiento:**
```typescript
interface WorkflowState {
  caso_id: string;
  workflow_id: string;
  etapa_actual_id: string;
  etapas_completadas: string[];
  respuestas: {
    [etapa_id: string]: {
      [pregunta_codigo: string]: any;
    };
  };
  fecha_inicio: Date;
  fecha_ultima_actualizacion: Date;
}
```

### 4.2. Lógica de Transiciones

**Reglas:**
1. Usuario solo puede ver etapas donde su perfil está asignado
2. Solo puede ejecutar la etapa actual
3. Etapas completadas son solo lectura
4. Etapas futuras están bloqueadas hasta que se complete la actual
5. Etapas de tipo "Decision" pueden cambiar el flujo

### 4.3. Renderizado Dinámico de Preguntas

**Mapping de tipos:**
```typescript
const QuestionRendererMap = {
  TEXTO: TextQuestionRenderer,
  LISTA: ListQuestionRenderer,
  SELECCION_SIMPLE: RadioQuestionRenderer,
  CARGA_ARCHIVO: FileUploadRenderer,
  DESCARGA_ARCHIVO: FileDownloadRenderer,
  DATOS_CASO: DataDisplayRenderer,
  REVISION_MANUAL_DOCUMENTOS: DocumentReviewRenderer,
  REVISION_OCR: OCRReviewRenderer,
  FECHA: DateQuestionRenderer,
  IMPRESION: PrintRenderer,
};
```

### 4.4. Validaciones

**Cliente:**
- Campos obligatorios
- Formato de archivos
- Tamaño de archivos
- Formato de fechas

**Servidor:**
- Permisos de perfil
- Estado del workflow
- Integridad de datos
- Validación de transiciones

---

## 5. ESTRUCTURA DE ARCHIVOS PROPUESTA

```
frontend/src/
├── components/
│   └── Workflow/
│       ├── UserWorkflowView.tsx (nuevo)
│       ├── WorkflowProgressIndicator.tsx (nuevo)
│       ├── EtapaExecutionForm.tsx (nuevo)
│       └── QuestionRenderers/ (nueva carpeta)
│           ├── TextQuestionRenderer.tsx
│           ├── ListQuestionRenderer.tsx
│           ├── RadioQuestionRenderer.tsx
│           ├── FileUploadRenderer.tsx
│           ├── FileDownloadRenderer.tsx
│           ├── DataDisplayRenderer.tsx
│           ├── DateQuestionRenderer.tsx
│           └── index.ts
├── hooks/
│   ├── useWorkflowState.ts (nuevo)
│   └── useEtapaExecution.ts (nuevo)
├── services/
│   └── workflowApi.ts (actualizar)
└── pages/
    ├── MisTramites.tsx (nuevo)
    └── CasoWorkflow.tsx (nuevo)

backend/app/
├── routes/
│   └── workflow.py (actualizar)
├── services/
│   └── workflow_execution.py (nuevo)
├── models/
│   └── workflow.py (revisar)
└── tests/
    └── test_workflow_execution.py (nuevo)
```

---

## 6. MOCKUP DE FLUJO DE USUARIO

### Escenario: Ciudadano completa un trámite PPSH

1. **Login** → Sistema identifica perfil: "Ciudadano"
2. **Mis Trámites** → Lista de casos activos
3. **Seleccionar caso** → Ver workflow del caso
4. **Vista de Workflow**:
   - ✅ Etapa 1: Completada (verificación de identidad)
   - ▶️ Etapa 2: Actual (carga de documentos) ← Usuario aquí
   - 🔒 Etapa 3: Bloqueada (revisión por funcionario)
   - 🔒 Etapa 4: Bloqueada (aprobación)
5. **Ejecutar Etapa 2**:
   - Formulario dinámico con preguntas de la etapa
   - Carga de archivos requeridos
   - Validaciones en tiempo real
6. **Submit** → Transición a siguiente etapa
7. **Notificación** → "Documentos enviados. Esperando revisión."

---

## 7. APIS A IMPLEMENTAR (Detalle)

### 7.1. GET `/api/workflows/:workflow_id/etapas/by-perfil`

**Request:**
```http
GET /api/workflows/123/etapas/by-perfil?perfil=Ciudadano
Authorization: Bearer {token}
```

**Response:**
```json
{
  "workflow_id": "123",
  "perfil": "Ciudadano",
  "etapas": [
    {
      "id": "etapa-1",
      "nombre": "Verificación de identidad",
      "tipo": "Etapa",
      "perfiles": ["Ciudadano"],
      "preguntas": [...]
    },
    {
      "id": "etapa-2",
      "nombre": "Carga de documentos",
      "tipo": "Etapa",
      "perfiles": ["Ciudadano"],
      "preguntas": [...]
    }
  ]
}
```

### 7.2. GET `/api/casos/:caso_id/workflow-state`

**Request:**
```http
GET /api/casos/456/workflow-state
Authorization: Bearer {token}
```

**Response:**
```json
{
  "caso_id": "456",
  "workflow_id": "123",
  "etapa_actual": {
    "id": "etapa-2",
    "nombre": "Carga de documentos"
  },
  "etapas_completadas": ["etapa-1"],
  "progreso": {
    "total_etapas": 5,
    "completadas": 1,
    "porcentaje": 20
  },
  "respuestas": {
    "etapa-1": {
      "pregunta-1": "Respuesta...",
      "pregunta-2": "Respuesta..."
    }
  }
}
```

### 7.3. POST `/api/casos/:caso_id/etapas/:etapa_id/ejecutar`

**Request:**
```http
POST /api/casos/456/etapas/etapa-2/ejecutar
Authorization: Bearer {token}
Content-Type: application/json

{
  "respuestas": {
    "pregunta-documento": "doc123.pdf",
    "pregunta-fecha": "2025-11-18",
    "pregunta-obligatoria": true
  },
  "archivos": {
    "pregunta-carga-1": "file_id_123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "mensaje": "Etapa completada exitosamente",
  "workflow_state": {
    "etapa_actual": {
      "id": "etapa-3",
      "nombre": "Revisión por funcionario"
    },
    "etapas_completadas": ["etapa-1", "etapa-2"]
  }
}
```

---

## 8. CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [ ] Revisar modelos existentes
- [ ] Crear endpoint GET `/workflows/:id/etapas/by-perfil`
- [ ] Crear endpoint GET `/casos/:id/workflow-state`
- [ ] Crear endpoint POST `/casos/:id/etapas/:etapa_id/ejecutar`
- [ ] Implementar `WorkflowExecutionService`
- [ ] Agregar validaciones de permisos
- [ ] Tests unitarios
- [ ] Tests de integración

### Frontend
- [ ] Crear `UserWorkflowView.tsx`
- [ ] Crear `WorkflowProgressIndicator.tsx`
- [ ] Crear `EtapaExecutionForm.tsx`
- [ ] Crear renderers para cada tipo de pregunta
- [ ] Implementar hooks de estado
- [ ] Actualizar servicios de API
- [ ] Crear páginas de navegación
- [ ] Integrar en rutas principales
- [ ] Tests de componentes
- [ ] Validaciones de formularios

### Integración
- [ ] Flujo completo end-to-end
- [ ] Manejo de errores
- [ ] Estados de carga
- [ ] Notificaciones al usuario
- [ ] Documentación de usuario

---

## 9. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Complejidad del renderizado dinámico | Media | Alto | Usar componentes reutilizables, tests exhaustivos |
| Manejo de estado complejo | Media | Alto | Usar Context API o Zustand, documentar flujo |
| Validaciones inconsistentes | Alta | Medio | Validaciones compartidas backend/frontend |
| Performance con muchas etapas | Baja | Medio | Virtualización, lazy loading |
| Cambios en el workflow en runtime | Media | Alto | Versioning de workflows, migraciones |

---

## 10. MÉTRICAS DE ÉXITO

- ✅ Usuario puede ver solo sus etapas asignadas
- ✅ Usuario puede ejecutar etapas y avanzar en el workflow
- ✅ Validaciones correctas en cliente y servidor
- ✅ Performance < 2s para cargar vista de workflow
- ✅ Sin errores en producción después de 1 semana
- ✅ Cobertura de tests > 80%

---

## 11. PRÓXIMOS PASOS (Post-Implementación)

1. **Notificaciones**: Notificar usuarios cuando una etapa está disponible
2. **Historial**: Ver historial de cambios en el workflow
3. **Comentarios**: Permitir comentarios entre etapas
4. **Adjuntos**: Sistema robusto de manejo de archivos
5. **Reportes**: Dashboard de progreso para supervisores
6. **Mobile**: Versión responsive/PWA

---

## NOTAS IMPORTANTES

- Todos los cambios deben hacerse en la branch `implementar-vistas`
- No hacer commit hasta que se indique
- Mantener compatibilidad con el editor de workflows existente
- Considerar permisos y seguridad en cada endpoint
- Documentar cambios en la BD si es necesario

---

**Fecha de creación**: 17 de noviembre, 2025  
**Última actualización**: 17 de noviembre, 2025  
**Estado**: Pendiente de aprobación  
**Prioridad**: Alta
