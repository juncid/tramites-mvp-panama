# Implementación de Vistas Dinámicas por Permisos y Etapas
**Fecha:** 22 de noviembre de 2024  
**Estado:** Backend Completado ✅ | Frontend Pendiente ⏳

---

## 📋 Resumen Ejecutivo

Se ha implementado el sistema de integración entre workflows dinámicos y solicitudes PPSH, junto con el sistema de control de permisos por perfil de usuario y etapa. Esto permite que diferentes usuarios vean y editen formularios distintos según su rol y la etapa actual del proceso.

### Objetivos Cumplidos

✅ **Integración Workflow-PPSH**: Vinculación liviana sin Foreign Keys  
✅ **Control de Permisos**: Verificación por perfil y etapa  
✅ **Vistas Filtradas**: Endpoints que retornan datos según permisos  
✅ **Transacciones Atómicas**: Garantía de consistencia de datos  

---

## 🏗️ Arquitectura Implementada

### Enfoque de Integración: Opción A (Liviano)

```
┌─────────────────────────────────┐
│   WORKFLOW_INSTANCIA            │
│   (Fuente de Verdad)            │
├─────────────────────────────────┤
│ - id                            │
│ - workflow_id (FK)              │
│ - num_expediente (UNIQUE)       │
│ - estado (INICIADO, etc.)       │
│ - etapa_actual_id (FK)          │
│ - metadata_adicional (JSON) ────┼──> {"ppsh_solicitud_id": 123}
│ - creado_por_user_id            │     └─> Referencia simple, NO FK
│ - asignado_a_user_id            │
└─────────────────────────────────┘
         │
         │ Referencia Unidireccional
         │ (Opcional, sin sincronización)
         ▼
┌─────────────────────────────────┐
│   PPSH_SOLICITUD                │
│   (Datos Específicos Auxiliares)│
├─────────────────────────────────┤
│ - id_solicitud (PK)             │
│ - num_expediente (UNIQUE)       │
│ - tipo_solicitud                │
│ - estado_actual                 │
│ - cod_causa_humanitaria         │
│ - descripcion_caso              │
└─────────────────────────────────┘
```

**Principios de Diseño:**
1. ✅ **Sin Foreign Keys**: Independencia total entre sistemas
2. ✅ **Referencia vía JSON**: `metadata_adicional` almacena IDs opcionales
3. ✅ **Sin sincronización automática**: WORKFLOW_INSTANCIA es la única fuente de verdad
4. ✅ **Transacciones atómicas**: Rollback automático si alguna creación falla
5. ✅ **Escalabilidad**: Fácil agregar nuevos tipos de solicitudes (VISA, RESIDENCIA)

---

## 📦 Componentes Implementados

### 1. Servicio de Integración Workflow-PPSH

**Archivo:** `backend/app/services/workflow_ppsh_service.py`

#### Clase: `WorkflowPPSHIntegrationService`

**Métodos Principales:**

```python
@staticmethod
def crear_instancia_con_solicitud_ppsh(
    db: Session,
    workflow_id: int,
    solicitud_data: SolicitudCreate,
    nombre_instancia: Optional[str],
    user_id: str
) -> Tuple[WorkflowInstancia, PPSHSolicitud]:
    """
    Crea instancia de workflow + solicitud PPSH en una transacción
    
    Flujo:
    1. Validar workflow activo
    2. Crear PPSH_SOLICITUD con solicitantes
    3. Crear WORKFLOW_INSTANCIA con metadata_adicional
    4. Commit transacción (rollback automático si falla)
    
    Returns:
        (instancia, solicitud) creadas
    """
```

```python
@staticmethod
def vincular_solicitud_existente(
    db: Session,
    workflow_id: int,
    solicitud_id: int,
    nombre_instancia: Optional[str],
    user_id: str
) -> WorkflowInstancia:
    """
    Vincula solicitud PPSH existente a nueva instancia de workflow
    
    Útil para:
    - Migración de datos legacy
    - Re-procesamiento de solicitudes
    - Solicitudes creadas externamente
    """
```

```python
@staticmethod
def obtener_solicitud_ppsh_desde_instancia(
    db: Session,
    instancia_id: int
) -> Optional[PPSHSolicitud]:
    """
    Obtiene solicitud PPSH vinculada (si existe)
    
    Returns:
        PPSHSolicitud o None si no hay vinculación
    """
```

```python
@staticmethod
def obtener_datos_vinculacion(
    db: Session,
    instancia_id: int
) -> Optional[Dict[str, Any]]:
    """
    Obtiene información completa de vinculación
    
    Returns:
        {
            "ppsh_solicitud_id": 123,
            "ppsh_num_expediente": "PPSH-2024-000123",
            "ppsh_tipo_solicitud": "INDIVIDUAL",
            "fecha_vinculacion": "2024-11-22T10:30:00",
            "vinculado_por": "USER001"
        }
    """
```

**Características:**
- ✅ Transacciones atómicas con rollback automático
- ✅ Validación de workflows activos
- ✅ Detección de solicitudes ya vinculadas
- ✅ Logging detallado de operaciones
- ✅ Manejo robusto de excepciones

---

### 2. Schemas de Integración

**Archivo:** `backend/app/schemas/schemas_workflow.py`

#### Schemas Agregados:

**`WorkflowInstanciaConPPSHCreate`**
```python
class WorkflowInstanciaConPPSHCreate(BaseModel):
    """
    Schema para crear instancia + solicitud PPSH en una operación
    """
    workflow_id: int
    nombre_instancia: Optional[str] = None
    solicitud_ppsh: Dict[str, Any]  # Datos completos de SolicitudCreate
    
    @field_validator('solicitud_ppsh')
    @classmethod
    def validar_solicitud_ppsh(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        # Valida campos requeridos
        # Valida al menos 1 solicitante
```

**`WorkflowInstanciaConPPSHExistenteCreate`**
```python
class WorkflowInstanciaConPPSHExistenteCreate(BaseModel):
    """
    Schema para vincular solicitud PPSH existente
    """
    workflow_id: int
    solicitud_id: int
    nombre_instancia: Optional[str] = None
```

**`WorkflowInstanciaPPSHResponse`**
```python
class WorkflowInstanciaPPSHResponse(BaseModel):
    """
    Response con datos de ambas entidades
    """
    # Datos de instancia
    instancia_id: int
    instancia_num_expediente: str
    instancia_nombre: str
    instancia_estado: EstadoInstanciaEnum
    instancia_etapa_actual_id: Optional[int]
    instancia_fecha_inicio: datetime
    
    # Datos de solicitud vinculada
    solicitud_id: int
    solicitud_num_expediente: str
    solicitud_tipo: str
    solicitud_estado: str
    solicitud_causa_humanitaria: int
    solicitud_fecha_solicitud: str
    
    # Metadata de vinculación
    fecha_vinculacion: datetime
    vinculado_por: str
    es_vinculacion_posterior: bool = False
```

**`DatosVinculacionPPSHResponse`**
```python
class DatosVinculacionPPSHResponse(BaseModel):
    """
    Información de vinculación PPSH
    """
    tiene_vinculacion: bool
    ppsh_solicitud_id: Optional[int] = None
    ppsh_num_expediente: Optional[str] = None
    ppsh_tipo_solicitud: Optional[str] = None
    fecha_vinculacion: Optional[str] = None
    vinculado_por: Optional[str] = None
    solicitud: Optional[Dict[str, Any]] = None  # Datos completos si expanded=True
```

---

### 3. Endpoints de Integración

**Archivo:** `backend/app/routers/routers_workflow.py`

#### Endpoints Implementados:

**1. Crear Instancia con Solicitud PPSH**
```http
POST /api/v1/workflow/instancias/crear-con-ppsh
Content-Type: application/json

{
  "workflow_id": 2,
  "nombre_instancia": "Solicitud PPSH - Conflicto Armado",
  "solicitud_ppsh": {
    "tipo_solicitud": "INDIVIDUAL",
    "cod_causa_humanitaria": 1,
    "descripcion_caso": "Familia desplazada...",
    "prioridad": "ALTA",
    "solicitantes": [
      {
        "es_titular": true,
        "tipo_documento": "PASAPORTE",
        "num_documento": "ABC123456",
        "primer_nombre": "Juan",
        "primer_apellido": "Pérez",
        "fecha_nacimiento": "1990-01-15",
        "cod_sexo": "M",
        "cod_nacionalidad": "VEN",
        "pais_emisor": "VEN"
      }
    ]
  }
}
```

**Response 201:**
```json
{
  "instancia_id": 15,
  "instancia_num_expediente": "WF-PPSH-2024-000015",
  "instancia_nombre": "Solicitud PPSH - Conflicto Armado",
  "instancia_estado": "INICIADO",
  "instancia_etapa_actual_id": 23,
  "instancia_fecha_inicio": "2024-11-22T10:30:00",
  "solicitud_id": 45,
  "solicitud_num_expediente": "PPSH-2024-000045",
  "solicitud_tipo": "INDIVIDUAL",
  "solicitud_estado": "RECIBIDO",
  "solicitud_causa_humanitaria": 1,
  "solicitud_fecha_solicitud": "2024-11-22",
  "fecha_vinculacion": "2024-11-22T10:30:00",
  "vinculado_por": "USER001",
  "es_vinculacion_posterior": false
}
```

**2. Vincular Solicitud Existente**
```http
POST /api/v1/workflow/instancias/vincular-ppsh-existente
Content-Type: application/json

{
  "workflow_id": 2,
  "solicitud_id": 45,
  "nombre_instancia": "Re-procesamiento PPSH-2024-000045"
}
```

**Response 201:** (Mismo formato que anterior con `es_vinculacion_posterior: true`)

**3. Obtener Datos de Vinculación**
```http
GET /api/v1/workflow/instancias/15/vinculacion-ppsh?expanded=true
```

**Response 200:**
```json
{
  "tiene_vinculacion": true,
  "ppsh_solicitud_id": 45,
  "ppsh_num_expediente": "PPSH-2024-000045",
  "ppsh_tipo_solicitud": "INDIVIDUAL",
  "ppsh_causa_humanitaria": 1,
  "fecha_vinculacion": "2024-11-22T10:30:00",
  "vinculado_por": "USER001",
  "es_vinculacion_posterior": false,
  "solicitud": {
    "id_solicitud": 45,
    "num_expediente": "PPSH-2024-000045",
    "tipo_solicitud": "INDIVIDUAL",
    "estado_actual": "RECIBIDO",
    "fecha_solicitud": "2024-11-22",
    "descripcion_caso": "Familia desplazada...",
    "prioridad": "ALTA"
  }
}
```

---

### 4. Sistema de Control de Permisos

**Archivo:** `backend/app/services/services_workflow.py`  
**Clase:** `InstanciaService`

#### Métodos de Permisos:

**1. Verificar Permiso de Visualización**
```python
@staticmethod
def puede_usuario_ver_etapa(
    db: Session,
    user_id: str,
    user_perfil: str,
    etapa_id: int
) -> bool:
    """
    Verifica si usuario puede VER una etapa
    
    Lógica:
    - Si etapa sin perfiles_permitidos → permite acceso
    - Si user_perfil en perfiles_permitidos → permite acceso
    - Si user_perfil == "ADMIN" → permite acceso siempre
    - Caso contrario → deniega acceso
    
    Returns:
        True si puede ver, False si no
    """
```

**2. Verificar Permiso de Edición**
```python
@staticmethod
def puede_usuario_editar_etapa(
    db: Session,
    user_id: str,
    user_perfil: str,
    instancia_id: int,
    etapa_id: int
) -> bool:
    """
    Verifica si usuario puede EDITAR una etapa
    
    Validaciones adicionales:
    - Primero verifica puede_usuario_ver_etapa()
    - Instancia debe estar activa
    - Instancia NO debe estar en estado COMPLETADO o CANCELADO
    - Etapa debe ser la etapa ACTUAL de la instancia
    - Si hay usuario asignado, debe ser el mismo (o ADMIN)
    
    Returns:
        True si puede editar, False si no
    """
```

**3. Obtener Vista Filtrada**
```python
@staticmethod
def obtener_vista_actual_para_usuario(
    db: Session,
    user_id: str,
    user_perfil: str,
    instancia_id: int
) -> Dict[str, Any]:
    """
    Obtiene vista de etapa actual filtrada por permisos
    
    Returns:
        {
            "instancia": {...},
            "etapa_actual": {...},
            "puede_ver": true,
            "puede_editar": false,
            "campos": [
                {
                    "id": 101,
                    "codigo": "nombre_solicitante",
                    "pregunta": "Nombre completo del solicitante",
                    "tipo_pregunta": "RESPUESTA_TEXTO",
                    "es_obligatoria": true,
                    "puede_editar_campo": false,
                    "valor_actual": {"valor_texto": "Juan Pérez"}
                }
            ],
            "metadata_instancia": {"ppsh_solicitud_id": 45}
        }
    
    Raises:
        403: Si usuario no tiene permiso para ver la etapa
        404: Si instancia no existe
    """
```

**Características:**
- ✅ Verificación granular por campo
- ✅ Respuestas previas incluidas
- ✅ Metadata de instancia expuesta
- ✅ Información de permisos clara
- ✅ Manejo de visibilidad condicional preparado

---

### 5. Endpoints de Permisos

**Archivo:** `backend/app/routers/routers_workflow.py`

**1. Obtener Vista Actual**
```http
GET /api/v1/workflow/instancias/15/vista-actual?user_perfil=FUNCIONARIO
```

**Response 200:**
```json
{
  "instancia": {
    "id": 15,
    "num_expediente": "WF-PPSH-2024-000015",
    "nombre_instancia": "Solicitud PPSH - Conflicto Armado",
    "estado": "INICIADO",
    "fecha_inicio": "2024-11-22T10:30:00",
    "asignado_a": "USER001",
    "prioridad": "ALTA"
  },
  "etapa_actual": {
    "id": 23,
    "codigo": "RECEPCION_DOCUMENTOS",
    "nombre": "Recepción de Documentos",
    "descripcion": "Recibir y validar documentación del solicitante",
    "tipo_etapa": "ETAPA",
    "titulo_formulario": "Documentos Requeridos",
    "bajada_formulario": "Por favor adjunte los siguientes documentos...",
    "es_etapa_final": false,
    "tiempo_estimado_minutos": 30
  },
  "puede_ver": true,
  "puede_editar": true,
  "campos": [
    {
      "id": 101,
      "codigo": "pasaporte",
      "pregunta": "Pasaporte vigente",
      "tipo_pregunta": "CARGA_ARCHIVO",
      "orden": 1,
      "es_obligatoria": true,
      "texto_ayuda": "Debe estar vigente por al menos 6 meses",
      "extensiones_permitidas": ["pdf", "jpg", "png"],
      "tamano_maximo_mb": 10,
      "puede_editar_campo": true,
      "valor_actual": null
    },
    {
      "id": 102,
      "codigo": "certificado_nacimiento",
      "pregunta": "Certificado de nacimiento",
      "tipo_pregunta": "CARGA_ARCHIVO",
      "orden": 2,
      "es_obligatoria": true,
      "extensiones_permitidas": ["pdf"],
      "tamano_maximo_mb": 5,
      "puede_editar_campo": true,
      "valor_actual": {
        "valor_archivo": "/uploads/cert_123.pdf",
        "metadata": {"nombre_original": "certificado.pdf", "size": 245760}
      }
    }
  ],
  "metadata_instancia": {
    "ppsh_solicitud_id": 45,
    "ppsh_num_expediente": "PPSH-2024-000045"
  }
}
```

**2. Verificar Permisos**
```http
GET /api/v1/workflow/instancias/15/verificar-permisos?user_perfil=SOLICITANTE&etapa_id=23
```

**Response 200:**
```json
{
  "puede_ver": true,
  "puede_editar": false,
  "etapa_id": 23,
  "etapa_codigo": "RECEPCION_DOCUMENTOS",
  "etapa_nombre": "Recepción de Documentos",
  "es_etapa_actual": true,
  "perfil_usuario": "SOLICITANTE",
  "perfiles_permitidos": ["FUNCIONARIO", "ADMIN"],
  "razon": "El perfil 'SOLICITANTE' no está en la lista de perfiles permitidos para esta etapa"
}
```

---

## 🔐 Flujos de Permisos por Perfil

### Escenario 1: Usuario ADMIN

```
Usuario: ADMIN
Permisos: VER TODAS LAS ETAPAS + EDITAR TODAS LAS ETAPAS

Flujo:
1. GET /instancias/15/vista-actual?user_perfil=ADMIN
   → puede_ver: true
   → puede_editar: true
   → campos: [TODOS visibles y editables]

2. POST /instancias/15/completar-etapa
   → ✅ Permitido: ADMIN tiene acceso total
```

### Escenario 2: Usuario FUNCIONARIO (etapa actual asignada)

```
Usuario: USER001 (FUNCIONARIO)
Instancia: asignado_a_user_id = "USER001"
Etapa Actual: perfiles_permitidos = ["FUNCIONARIO", "ADMIN"]

Flujo:
1. GET /instancias/15/vista-actual?user_perfil=FUNCIONARIO
   → puede_ver: true (perfil en lista)
   → puede_editar: true (es el asignado + etapa actual)
   → campos: [visibles y editables]

2. POST /instancias/15/completar-etapa
   → ✅ Permitido: es el usuario asignado
```

### Escenario 3: Usuario FUNCIONARIO (etapa actual NO asignada)

```
Usuario: USER002 (FUNCIONARIO)
Instancia: asignado_a_user_id = "USER001"
Etapa Actual: perfiles_permitidos = ["FUNCIONARIO", "ADMIN"]

Flujo:
1. GET /instancias/15/vista-actual?user_perfil=FUNCIONARIO
   → puede_ver: true (perfil en lista)
   → puede_editar: false (asignado a otro usuario)
   → campos: [visibles pero SOLO LECTURA]

2. POST /instancias/15/completar-etapa
   → ❌ Denegado: instancia asignada a USER001
```

### Escenario 4: Usuario SOLICITANTE (sin permisos)

```
Usuario: EXTERNO001 (SOLICITANTE)
Etapa Actual: perfiles_permitidos = ["FUNCIONARIO", "ADMIN"]

Flujo:
1. GET /instancias/15/vista-actual?user_perfil=SOLICITANTE
   → 403 Forbidden: perfil no autorizado para esta etapa

2. GET /instancias/15/verificar-permisos?user_perfil=SOLICITANTE
   → puede_ver: false
   → puede_editar: false
   → razon: "El perfil 'SOLICITANTE' no está en la lista..."
```

### Escenario 5: Usuario SOLICITANTE (etapa pública)

```
Usuario: EXTERNO001 (SOLICITANTE)
Etapa Actual: perfiles_permitidos = ["SOLICITANTE", "FUNCIONARIO"]

Flujo:
1. GET /instancias/15/vista-actual?user_perfil=SOLICITANTE
   → puede_ver: true
   → puede_editar: true (si es etapa actual y no asignada)
   → campos: [campos configurados para SOLICITANTE]

2. Campos filtrados según perfil:
   - "datos_personales" → visible y editable
   - "dictamen_interno" → NO visible (mostrar_si condicional)
   - "aprobacion_director" → NO visible
```

---

## 📊 Diagrama de Flujo de Permisos

```
┌─────────────────────────────────────────────┐
│  Usuario intenta acceder a etapa           │
└────────────────┬────────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ ¿Existe etapa?     │
        └────┬───────────────┘
             │ NO
             ├──────> 404 NOT FOUND
             │
             │ SI
             ▼
        ┌────────────────────┐
        │ ¿Perfil en         │
        │  perfiles_         │
        │  permitidos?       │
        └────┬───────────────┘
             │ NO
             ├──> ¿Es ADMIN? ─NO─> puede_ver = FALSE
             │         │                   │
             │        SI                   │
             │         │                   ▼
             │         └────────────> 403 FORBIDDEN
             │ SI
             ▼
    ┌──────────────────────┐
    │ puede_ver = TRUE     │
    └─────────┬────────────┘
              │
              ▼
    ┌───────────────────────────┐
    │ ¿Instancia activa?        │
    │ ¿Estado != COMPLETADO/    │
    │  CANCELADO?               │
    └────┬──────────────────────┘
         │ NO
         ├──────> puede_editar = FALSE (solo lectura)
         │
         │ SI
         ▼
    ┌───────────────────────────┐
    │ ¿Etapa es etapa_actual?  │
    └────┬──────────────────────┘
         │ NO
         ├──────> puede_editar = FALSE (solo etapa actual)
         │
         │ SI
         ▼
    ┌───────────────────────────┐
    │ ¿Hay usuario asignado?    │
    └────┬──────────────────────┘
         │ NO
         ├──────> puede_editar = TRUE
         │
         │ SI
         ▼
    ┌───────────────────────────┐
    │ ¿user_id == asignado_a    │
    │  O es ADMIN?              │
    └────┬──────────────────────┘
         │ NO
         ├──────> puede_editar = FALSE (asignado a otro)
         │
         │ SI
         ▼
    ┌───────────────────────────┐
    │ puede_editar = TRUE       │
    └───────────────────────────┘
```

---

## 🧪 Casos de Prueba Recomendados

### Test 1: Crear Instancia con Solicitud PPSH
```bash
curl -X POST http://localhost:8000/api/v1/workflow/instancias/crear-con-ppsh \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id": 2,
    "solicitud_ppsh": {
      "tipo_solicitud": "INDIVIDUAL",
      "cod_causa_humanitaria": 1,
      "prioridad": "ALTA",
      "descripcion_caso": "Test de integración",
      "solicitantes": [{
        "es_titular": true,
        "tipo_documento": "PASAPORTE",
        "num_documento": "TEST123",
        "primer_nombre": "Test",
        "primer_apellido": "Usuario",
        "fecha_nacimiento": "1990-01-01",
        "cod_sexo": "M",
        "cod_nacionalidad": "VEN",
        "pais_emisor": "VEN"
      }]
    }
  }'
```

**Esperado:**
- ✅ Status 201
- ✅ Response con instancia_id y solicitud_id
- ✅ WORKFLOW_INSTANCIA creada con estado INICIADO
- ✅ PPSH_SOLICITUD creada con estado RECIBIDO
- ✅ metadata_adicional contiene ppsh_solicitud_id

### Test 2: Verificar Permisos ADMIN
```bash
curl http://localhost:8000/api/v1/workflow/instancias/15/verificar-permisos?user_perfil=ADMIN
```

**Esperado:**
- ✅ puede_ver: true
- ✅ puede_editar: true
- ✅ razon: "Permisos válidos"

### Test 3: Verificar Permisos SOLICITANTE (sin acceso)
```bash
curl http://localhost:8000/api/v1/workflow/instancias/15/verificar-permisos?user_perfil=SOLICITANTE&etapa_id=23
```

**Esperado:**
- ✅ puede_ver: false
- ✅ puede_editar: false
- ✅ razon: "El perfil 'SOLICITANTE' no está en la lista..."

### Test 4: Obtener Vista Actual
```bash
curl http://localhost:8000/api/v1/workflow/instancias/15/vista-actual?user_perfil=FUNCIONARIO
```

**Esperado:**
- ✅ Status 200
- ✅ instancia: {...}
- ✅ etapa_actual: {...}
- ✅ campos: [array de campos con puede_editar_campo]
- ✅ metadata_instancia: con ppsh_solicitud_id

### Test 5: Vinculación con Solicitud Existente
```bash
curl -X POST http://localhost:8000/api/v1/workflow/instancias/vincular-ppsh-existente \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id": 2,
    "solicitud_id": 45
  }'
```

**Esperado:**
- ✅ Status 201 si solicitud NO está ya vinculada
- ❌ Status 400 si solicitud YA está vinculada a otra instancia
- ✅ es_vinculacion_posterior: true

---

## ⏳ Pendiente: Implementación Frontend

### Componentes a Desarrollar

#### 1. `DynamicEtapaView.tsx` (Mejorado)
**Ubicación:** `frontend/src/components/Workflow/DynamicEtapaView.tsx`

**Features:**
- ✅ Consumir API `/vista-actual`
- ✅ Renderizar campos según `tipo_pregunta`
- ✅ Aplicar `puede_editar_campo` (readonly cuando false)
- ✅ Implementar validaciones (regex, obligatorios)
- ✅ Aplicar `mostrar_si` (visibilidad condicional)
- ✅ Prellenar con `valor_actual` si existe
- ✅ Subida de archivos con validación de extensiones/tamaño

**Estructura:**
```typescript
interface VistaActualResponse {
  instancia: {...};
  etapa_actual: {...};
  puede_ver: boolean;
  puede_editar: boolean;
  campos: CampoConfig[];
  metadata_instancia: any;
}

interface CampoConfig {
  id: number;
  codigo: string;
  pregunta: string;
  tipo_pregunta: TipoPregunta;
  es_obligatoria: boolean;
  puede_editar_campo: boolean;
  valor_actual: any;
  opciones?: string[];
  validacion_regex?: string;
  mensaje_validacion?: string;
  // ... más campos
}
```

#### 2. `WorkflowExecution.tsx`
**Ubicación:** `frontend/src/pages/WorkflowExecution.tsx`

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│  Header: Workflow Nombre → Expediente → Etapa Actual    │
├─────────┬────────────────────────────────────┬──────────┤
│         │                                    │          │
│ SIDEBAR │           MAIN CONTENT             │   INFO   │
│ (Prog)  │      <DynamicEtapaView />         │  (Meta)  │
│         │                                    │          │
│ Etapas: │  Formulario dinámico con campos   │ Histor.  │
│ ✅ 1.2  │  según permisos del usuario       │ Coment.  │
│ ➡️ 1.7  │                                    │ Docs     │
│ ⬜ 2.1  │  Botones:                         │ Vinc.    │
│         │  - Guardar Borrador               │ PPSH     │
│         │  - Completar Etapa                │          │
│         │  - Regresar a Etapa Anterior      │          │
│         │                                    │          │
└─────────┴────────────────────────────────────┴──────────┘
```

**Features:**
- ✅ Layout responsivo 3 columnas
- ✅ Sidebar: lista de etapas con estado visual
- ✅ Main: `DynamicEtapaView` con formulario
- ✅ Info: historial, comentarios, datos de vinculación PPSH
- ✅ Navegación entre etapas (si tiene permisos)
- ✅ Botones dinámicos según `puede_editar`
- ✅ Breadcrumb de navegación
- ✅ Auto-save de borradores (opcional)

#### 3. Integración con Sistema de Autenticación
**Pendiente:** Reemplazar `current_user` y `user_perfil` hardcodeados

**Solución:**
```typescript
// frontend/src/contexts/AuthContext.tsx
interface AuthUser {
  user_id: string;
  perfil: 'ADMIN' | 'FUNCIONARIO' | 'SOLICITANTE' | ...;
  nombre: string;
  email: string;
}

// En cada llamada API:
const headers = {
  'Authorization': `Bearer ${authToken}`,
  'X-User-Perfil': user.perfil  // Header custom
};
```

**Backend:** Extraer `current_user` y `user_perfil` de JWT token en middleware

---

## 📝 Próximos Pasos

### Inmediato (Esta Sesión)
1. ✅ ~~Crear servicio de integración Workflow-PPSH~~
2. ✅ ~~Agregar schemas de integración~~
3. ✅ ~~Implementar endpoints de inicialización integrada~~
4. ✅ ~~Agregar control de permisos por etapa~~
5. ⏳ **Desarrollar `DynamicEtapaView` mejorado**
6. ⏳ **Crear página `WorkflowExecution`**

### Corto Plazo (Próxima Sesión)
7. Testing end-to-end con Postman/curl
8. Integrar sistema de autenticación real
9. Agregar validación de archivos en backend
10. Implementar OCR para documentos

### Medio Plazo
11. Dashboard de instancias por usuario
12. Notificaciones de cambios de etapa
13. Sistema de comentarios y adjuntos
14. Reportes y métricas de workflows

---

## 🎯 Decisiones de Diseño Documentadas

### ¿Por qué NO usar Foreign Keys?

**Decisión:** Mantener sistemas independientes con referencia simple vía JSON

**Razones:**
1. ✅ **Escalabilidad**: Fácil agregar nuevos tipos de solicitudes (VISA, RESIDENCIA, etc.) sin modificar esquema de WORKFLOW_INSTANCIA
2. ✅ **Independencia**: Cambios en sistema PPSH no afectan workflows
3. ✅ **Flexibilidad**: Instancias de workflow pueden NO tener solicitud asociada (workflows internos, administrativos)
4. ✅ **Simplicidad MVP**: Menos complejidad en migraciones y sincronización
5. ✅ **Performance**: Sin necesidad de JOINs complejos en consultas frecuentes

**Trade-off:**
- ❌ NO hay integridad referencial automática (manejo manual de referencias rotas)
- ❌ Consultas que necesiten ambos datos requieren 2 queries
- ✅ Pero... la mayoría de casos solo necesita datos de workflow O datos de solicitud, no ambos

### ¿Por qué WORKFLOW_INSTANCIA es la fuente de verdad?

**Decisión:** Estado definitivo en `WORKFLOW_INSTANCIA.estado`, no en `PPSH_SOLICITUD.estado_actual`

**Razones:**
1. ✅ **Sistema genérico**: Workflow es el motor de procesos, PPSH son datos específicos
2. ✅ **Consistencia**: Un solo lugar para consultar estado real del trámite
3. ✅ **Auditoría**: `WORKFLOW_INSTANCIA_HISTORIAL` tiene trazabilidad completa
4. ✅ **Reportes**: Dashboards consultan workflows, no solicitudes individuales

**Implicación:**
- Reportes legacy que consultan `PPSH_SOLICITUD.estado_actual` deben migrar a consultar `WORKFLOW_INSTANCIA.estado`
- Vistas de base de datos pueden facilitar transición

### ¿Por qué permisos por perfil y NO por usuario individual?

**Decisión:** Permisos basados en roles (`perfiles_permitidos`) no en user_id específicos

**Razones:**
1. ✅ **Escalabilidad**: Agregar usuarios nuevos no requiere modificar workflows
2. ✅ **Mantenibilidad**: Cambios de estructura organizacional son más simples
3. ✅ **Claridad**: Fácil entender "FUNCIONARIOS pueden hacer X" vs lista de 50 user_ids
4. ✅ **RBAC estándar**: Role-Based Access Control es patrón establecido

**Complemento:**
- Asignación individual via `asignado_a_user_id` para casos específicos
- ADMIN tiene acceso total sin necesidad de estar en `perfiles_permitidos`

---

## 📖 Referencias y Documentación

### Documentos del Proyecto
- **`SESION_21_NOV_2024.md`**: Sesión anterior (tabs, bug fixes)
- **`PLAN_INTEGRACION_VISTAS_DINAMICAS.md`**: Plan original de integración
- **`SISTEMA_WORKFLOWS_IMPLEMENTADO.md`**: Documentación de workflows dinámicos

### Endpoints Relacionados
```
# Workflows
GET    /api/v1/workflow/workflows
POST   /api/v1/workflow/workflows
GET    /api/v1/workflow/workflows/{id}

# Instancias
POST   /api/v1/workflow/instancias
GET    /api/v1/workflow/instancias
GET    /api/v1/workflow/instancias/{id}

# Integración PPSH (NUEVO)
POST   /api/v1/workflow/instancias/crear-con-ppsh
POST   /api/v1/workflow/instancias/vincular-ppsh-existente
GET    /api/v1/workflow/instancias/{id}/vinculacion-ppsh

# Permisos (NUEVO)
GET    /api/v1/workflow/instancias/{id}/vista-actual
GET    /api/v1/workflow/instancias/{id}/verificar-permisos

# Solicitudes PPSH
POST   /api/v1/ppsh/solicitudes
GET    /api/v1/ppsh/solicitudes
GET    /api/v1/ppsh/solicitudes/{id}
```

### Modelos de Base de Datos
- **`WORKFLOW`**: Plantilla de proceso
- **`WORKFLOW_INSTANCIA`**: Ejecución específica (fuente de verdad)
- **`WORKFLOW_ETAPA`**: Nodos del flujo
- **`WORKFLOW_PREGUNTA`**: Campos de formulario
- **`PPSH_SOLICITUD`**: Datos auxiliares específicos de PPSH
- **`PPSH_SOLICITANTE`**: Personas en solicitud

---

## ✅ Checklist de Implementación

### Backend ✅ COMPLETADO
- [x] Servicio `WorkflowPPSHIntegrationService`
  - [x] `crear_instancia_con_solicitud_ppsh()`
  - [x] `vincular_solicitud_existente()`
  - [x] `obtener_solicitud_ppsh_desde_instancia()`
  - [x] `obtener_datos_vinculacion()`
- [x] Schemas de integración
  - [x] `WorkflowInstanciaConPPSHCreate`
  - [x] `WorkflowInstanciaConPPSHExistenteCreate`
  - [x] `WorkflowInstanciaPPSHResponse`
  - [x] `DatosVinculacionPPSHResponse`
- [x] Endpoints de integración
  - [x] `POST /instancias/crear-con-ppsh`
  - [x] `POST /instancias/vincular-ppsh-existente`
  - [x] `GET /instancias/{id}/vinculacion-ppsh`
- [x] Control de permisos
  - [x] `puede_usuario_ver_etapa()`
  - [x] `puede_usuario_editar_etapa()`
  - [x] `obtener_vista_actual_para_usuario()`
- [x] Endpoints de permisos
  - [x] `GET /instancias/{id}/vista-actual`
  - [x] `GET /instancias/{id}/verificar-permisos`

### Frontend ⏳ PENDIENTE
- [ ] Componente `DynamicEtapaView` mejorado
  - [ ] Consumir API `/vista-actual`
  - [ ] Renderizar campos dinámicos
  - [ ] Aplicar permisos de edición
  - [ ] Validaciones de formulario
  - [ ] Visibilidad condicional
  - [ ] Subida de archivos
- [ ] Página `WorkflowExecution`
  - [ ] Layout 3 columnas responsivo
  - [ ] Sidebar de progreso de etapas
  - [ ] Área principal con formulario
  - [ ] Panel de información lateral
  - [ ] Navegación entre etapas
  - [ ] Botones dinámicos
- [ ] Integración con autenticación
  - [ ] Extraer `user_id` y `perfil` de token
  - [ ] Pasar a headers de API
  - [ ] Actualizar contexto de usuario

### Testing ⏳ PENDIENTE
- [ ] Unit tests de servicios
- [ ] Integration tests de endpoints
- [ ] Tests end-to-end con Postman
- [ ] Tests de permisos por perfil
- [ ] Tests de transacciones atómicas
- [ ] Tests de referencias rotas

---

**Documento generado:** 22 de noviembre de 2024  
**Estado Backend:** ✅ Completado y listo para testing  
**Estado Frontend:** ⏳ Pendiente de implementación  
**Próximo Milestone:** Desarrollo de componentes React y testing E2E
