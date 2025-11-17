# Componentes del Sistema de Workflows - Frontend

## Índice
1. [Arquitectura General](#arquitectura-general)
2. [Tipos y Estructuras de Datos](#tipos-y-estructuras-de-datos)
3. [Componentes Principales](#componentes-principales)
4. [Nodos y Tipos de Etapas](#nodos-y-tipos-de-etapas)
5. [Sistema de Configuración](#sistema-de-configuración)
6. [Tipos de Preguntas](#tipos-de-preguntas)
7. [Flujo de Datos](#flujo-de-datos)

---

## Arquitectura General

El sistema de workflows del MVP de Trámites de Panamá está construido con:
- **React 18.2** + **TypeScript**
- **Material-UI 5** para la interfaz de usuario
- **ReactFlow** para el editor visual de diagramas
- **Axios** para comunicación con el backend

### Estructura de Archivos

```
frontend/src/
├── components/
│   └── Workflow/
│       ├── CustomNode.tsx          # Nodo visual personalizado
│       ├── EtapaConfigPanel.tsx    # Panel de configuración lateral
│       └── WorkflowEditor.tsx      # Editor principal
├── pages/
│   └── WorkflowEditor.tsx          # Página contenedora
└── types/
    └── workflow.ts                 # Definiciones TypeScript
```

---

## Tipos y Estructuras de Datos

### TipoEtapa

Define los diferentes tipos de nodos/etapas en el workflow:

```typescript
export type TipoEtapa = 
  | 'ETAPA'         // Etapa normal con preguntas
  | 'COMPUERTA'     // Punto de decisión
  | 'SUBPROCESO'    // Subproceso anidado
  | 'PRESENCIAL'    // Etapa presencial/manual
  | 'FIN';          // Nodo de terminación
```

### TipoPregunta

Define los tipos de campos/preguntas disponibles:

```typescript
export type TipoPregunta = 
  | 'TEXTO'                         // Campo de texto simple
  | 'NUMERO'                        // Campo numérico
  | 'FECHA'                         // Selector de fecha con agenda
  | 'SELECCION_SIMPLE'              // Radio buttons
  | 'SELECCION_MULTIPLE'            // Checkboxes
  | 'CARGA_ARCHIVO'                 // Upload de archivos
  | 'SI_NO'                         // Pregunta Sí/No
  | 'LISTA'                         // Dropdown
  | 'OPCIONES'                      // Opciones múltiples
  | 'DESCARGA_ARCHIVOS'             // Descarga de documentos
  | 'DATOS_CASO'                    // Datos del expediente
  | 'REVISION_MANUAL_DOCUMENTOS'    // Revisión manual de docs
  | 'REVISION_OCR'                  // Revisión OCR de documentos
  | 'SELECCION_FECHA'               // Selector de fecha simple
  | 'IMPRESION'                     // Impresión de documentos
  | 'FIRMA_DIGITAL'                 // Firma digital
  | 'PAGO'                          // Procesamiento de pago
  | 'NOTIFICACION';                 // Envío de notificaciones
```

### WorkflowEtapa

Estructura completa de una etapa/nodo:

```typescript
export interface WorkflowEtapa {
  // Identificación
  id?: number;
  workflow_id?: number;
  codigo: string;                    // Código único (ej: "ETAPA_01")
  nombre: string;                    // Nombre descriptivo
  descripcion?: string;              // Descripción opcional
  
  // Tipo y posición
  tipo_etapa: TipoEtapa;            // Tipo de nodo
  orden: number;                     // Orden en el flujo
  posicion_x?: number;               // Posición X en el canvas
  posicion_y?: number;               // Posición Y en el canvas
  
  // Permisos y configuración
  perfiles_permitidos: string[];     // ["CIUDADANO", "ABOGADO", etc.]
  
  // Configuración de formulario
  titulo_formulario?: string;        // Título del formulario
  bajada_formulario?: string;        // Subtítulo/descripción
  descripcion_formulario?: string;   // Descripción adicional
  
  // Campos específicos para PRESENCIAL
  descripcion_presencial?: string;   // Descripción de etapa presencial
  documento_presencial?: string;     // Documento asociado
  
  // Flags de comportamiento
  es_etapa_inicial: boolean;         // ¿Es el inicio del workflow?
  es_etapa_final: boolean;           // ¿Es el fin del workflow?
  es_inicial?: boolean;              // Flag adicional de inicio
  requiere_validacion: boolean;      // ¿Requiere validación?
  permite_edicion_posterior: boolean; // ¿Permite editar después?
  tiempo_estimado_minutos?: number;  // Tiempo estimado
  
  // Reglas y preguntas
  reglas_transicion?: any;           // Reglas de transición
  activo: boolean;                   // Estado activo/inactivo
  preguntas?: WorkflowPregunta[];    // Lista de preguntas del formulario
}
```

### WorkflowPregunta

Estructura de una pregunta/campo del formulario:

```typescript
export interface WorkflowPregunta {
  // Identificación
  id?: number;
  etapa_id?: number;
  codigo: string;                    // Código único
  pregunta: string;                  // Texto de la pregunta
  texto: string;                     // Texto alternativo
  
  // Tipo y configuración
  tipo_pregunta: TipoPregunta;       // Tipo de campo
  tipo: TipoPregunta;                // Alias del tipo
  orden: number;                     // Orden de aparición
  
  // Opciones y valores
  opciones?: any[];                  // Opciones para select/radio/checkbox
  valor_predeterminado?: string;     // Valor por defecto
  ayuda?: string;                    // Texto de ayuda
  placeholder?: string;              // Placeholder del input
  
  // Validación
  es_obligatoria: boolean;           // Campo obligatorio
  requiere_validacion: boolean;      // Requiere validación adicional
  expresion_regular?: string;        // Regex de validación
  mensaje_validacion?: string;       // Mensaje de error
  longitud_minima?: number;          // Longitud mínima
  longitud_maxima?: number;          // Longitud máxima
  
  // Dependencias y lógica
  pregunta_padre_id?: number;        // ID de pregunta padre
  valor_activador?: string;          // Valor que activa esta pregunta
  visibilidad_condicional?: any;     // Condiciones de visibilidad
  
  // Campos específicos por tipo
  campos_caso?: string[];            // Para DATOS_CASO: campos seleccionados
  etapa_origen_id?: string;          // Para REVISION_OCR/MANUAL: etapa origen
  agenda_origen_id?: string;         // Para FECHA: tipo de agenda
  
  // Metadata
  activo: boolean;                   // Estado activo/inactivo
}
```

---

## Componentes Principales

### 1. WorkflowEditor (Página Principal)

**Ubicación:** `frontend/src/pages/WorkflowEditor.tsx`

**Responsabilidades:**
- Gestionar el estado global del workflow
- Integrar ReactFlow para el editor visual
- Manejar la creación, edición y guardado de workflows
- Coordinar la comunicación con el backend

**Estado Principal:**

```typescript
const [workflow, setWorkflow] = useState<Workflow | null>(null);
const [nodes, setNodes] = useState<Node[]>([]);
const [edges, setEdges] = useState<Edge[]>([]);
const [selectedNode, setSelectedNode] = useState<Node | null>(null);
```

**Funcionalidades Clave:**

1. **Carga de Workflow Existente:**
   ```typescript
   useEffect(() => {
     if (id) {
       axios.get(`/workflows/${id}`).then(response => {
         // Convierte etapas a nodos de ReactFlow
         // Convierte conexiones a edges de ReactFlow
       });
     }
   }, [id]);
   ```

2. **Guardado del Workflow:**
   - Limpia datos temporales (`is_placeholder`, `label`, `es_inicial`)
   - Redondea posiciones (`Math.round(posicion_x)`)
   - Mapea IDs temporales a códigos para conexiones
   - Envía al endpoint PUT `/workflows/{id}`

3. **Gestión de Nodos:**
   - Agregar nuevos nodos al canvas
   - Eliminar nodos existentes
   - Actualizar posiciones mediante drag & drop
   - Seleccionar nodos para configuración

### 2. CustomNode (Nodo Visual)

**Ubicación:** `frontend/src/components/Workflow/CustomNode.tsx`

**Responsabilidades:**
- Renderizar la representación visual de cada tipo de etapa
- Aplicar estilos específicos según el tipo
- Mostrar badges de perfiles permitidos
- Indicar características especiales (Vista Dinámica)

**Tipos de Renderizado:**

#### **Nodo FIN (Terminación)**
- **Forma:** Círculo rojo
- **Tamaño:** 80x80px (editor), 32x32px (viewer)
- **Color:** `#f44336` (Material-UI red)
- **Uso:** Marca el final del workflow

```typescript
if (data.codigo === 'FIN') {
  return (
    <Paper
      sx={{
        width: isViewer ? 32 : 80,
        height: isViewer ? 32 : 80,
        borderRadius: '50%',
        bgcolor: '#f44336',
        border: '2px solid #d32f2f'
      }}
    >
      {!isViewer && <Typography>FIN</Typography>}
    </Paper>
  );
}
```

#### **Nodos ETAPA/COMPUERTA/SUBPROCESO/PRESENCIAL**
- **Forma:** Rectángulo con bordes redondeados
- **Ancho:** 220px
- **Alto mínimo:** 110px
- **Borde:** 
  - Sólido para ETAPA/COMPUERTA/SUBPROCESO
  - **Punteado** para PRESENCIAL (`border: '2px dashed #333333'`)

**Características Visuales:**

```typescript
// Función para determinar el color del nodo
const getNodeColor = () => {
  switch (data.tipo_etapa) {
    case 'COMPUERTA':
      return '#fff3e0'; // Naranja claro
    case 'SUBPROCESO':
      return '#e8f5e9'; // Verde claro
    case 'PRESENCIAL':
      return '#fce1e1'; // Rosa claro
    default:
      return '#e3f2fd'; // Azul claro
  }
};

// Función para el estilo de borde
const getNodeBorderStyle = () => {
  return data.tipo_etapa === 'PRESENCIAL' ? 'dashed' : 'solid';
};
```

**Badges de Perfiles:**
- Se muestran en la parte superior
- Máximo 2 badges visibles
- Formato: Primera letra del perfil
- Colores según tipo:
  - PRESENCIAL: Fondo `#fce1e1`, texto `#b71c1c`
  - SUBPROCESO: Fondo `#e1fcef`, texto `#1b5e20`
  - Otros: Fondo `#e3f2fd`, texto `#1565c0`

**Indicador de Vista Dinámica:**
```typescript
{tieneVistaDinamica && (
  <Chip
    icon={<AutoAwesomeIcon />}
    label="Vista Dinámica"
    size="small"
    color="primary"
  />
)}
```

### 3. EtapaConfigPanel (Panel de Configuración)

**Ubicación:** `frontend/src/components/Workflow/EtapaConfigPanel.tsx`

**Responsabilidades:**
- Configurar propiedades de la etapa seleccionada
- Gestionar el formulario de preguntas
- Validar datos antes de guardar
- Aplicar lógica condicional según tipo de etapa/pregunta

**Estructura del Panel:**

```
┌─────────────────────────────────────┐
│  [Configuración]  [Preguntas]       │ ← Tabs
├─────────────────────────────────────┤
│  Tipo de etapa: [Dropdown]          │
│  Código: [Input]                    │
│  Nombre: [Input]                    │
│  Perfiles: [Multi-select]           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [PRESENCIAL - Solo si tipo] │   │ ← Sección condicional
│  │  Descripción: [TextArea]    │   │
│  │  Documento: [Upload]        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│  Título formulario: [Input]         │
│  Bajada formulario: [TextArea]      │
│                                     │
│  [Cancelar]  [Guardar]              │
└─────────────────────────────────────┘
```

**Tab de Preguntas:**

```
┌─────────────────────────────────────┐
│  Preguntas del Formulario  [+ Añadir]│
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 1. ¿Pregunta ejemplo?       │   │ ← Tarjeta colapsada
│  │ Tipo: Texto                 │   │
│  │ [Editar] [Eliminar]         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Formulario expandido]      │   │ ← Tarjeta expandida
│  │ Tipo: [Dropdown]            │   │
│  │ Pregunta: [Input]           │   │
│  │ [Campos específicos del tipo]│  │
│  │ [Cancelar] [Guardar]        │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Estado del Panel:**

```typescript
const [formData, setFormData] = useState<WorkflowEtapa>({...});
const [preguntas, setPreguntas] = useState<WorkflowPregunta[]>([]);
const [editingIndex, setEditingIndex] = useState<number | null>(null);
const [tempPregunta, setTempPregunta] = useState<WorkflowPregunta | null>(null);
```

**Lógica de Validación:**

```typescript
const handleSave = () => {
  // Validación de campos requeridos
  if (!formData.codigo || !formData.nombre) {
    alert('Código y nombre son obligatorios');
    return;
  }
  
  // Validación de perfiles (excepto INICIO y FIN)
  if (formData.codigo !== 'INICIO' && 
      formData.codigo !== 'FIN' && 
      formData.perfiles_permitidos.length === 0) {
    alert('Debe seleccionar al menos un perfil');
    return;
  }
  
  onSave(formData);
};
```

---

## Nodos y Tipos de Etapas

### ETAPA (Etapa Estándar)

**Características:**
- Tipo más común en workflows
- Contiene formulario con preguntas
- Requiere perfiles permitidos
- Color: Azul claro (`#e3f2fd`)
- Borde: Sólido negro 2px

**Configuración:**
- Código único
- Nombre descriptivo
- Perfiles permitidos (obligatorio)
- Título y bajada del formulario
- Lista de preguntas

**Uso Típico:**
- Recolección de información del ciudadano
- Carga de documentos
- Validación de datos
- Ingreso de información por funcionarios

### COMPUERTA (Punto de Decisión)

**Características:**
- Representa un punto de bifurcación
- Generalmente sin preguntas (solo validación)
- Color: Naranja claro (`#fff3e0`)
- Permite múltiples conexiones de salida

**Configuración:**
- Similar a ETAPA
- Reglas de transición más complejas
- Condiciones basadas en respuestas previas

**Uso Típico:**
- Validación de documentos (aprobado/rechazado)
- Verificación de requisitos
- Enrutamiento condicional del flujo

### SUBPROCESO (Proceso Anidado)

**Características:**
- Representa un subproceso completo
- Color: Verde claro (`#e8f5e9`)
- Puede referenciar otro workflow

**Configuración:**
- Similar a ETAPA
- Opcionalmente vinculado a otro workflow_id

**Uso Típico:**
- Procesos repetitivos
- Validaciones complejas que merecen su propio flujo
- Módulos reutilizables

### PRESENCIAL (Etapa Manual/Presencial)

**Características:**
- **NO usa sistema de preguntas estándar**
- Tiene campos específicos propios
- Color: Rosa claro (`#fce1e1`)
- **Borde punteado** (`dashed`) para distinguirlo
- Badges de perfil con color rojo distintivo

**Configuración Específica:**

```typescript
// Campos únicos de PRESENCIAL
interface ConfiguracionPresencial {
  descripcion_presencial?: string;   // Descripción de la actividad
  documento_presencial?: string;     // Documento asociado
}
```

**Sección en el Panel de Configuración:**

```tsx
{formData.tipo_etapa === 'PRESENCIAL' && (
  <Box sx={{ 
    p: 2, 
    border: '2px dashed #333333',
    borderRadius: '4px',
    bgcolor: 'white'
  }}>
    <Stack spacing={2}>
      {/* Descripción */}
      <TextField
        multiline
        rows={3}
        label="Descripción"
        placeholder="Lorem"
        value={formData.descripcion_presencial || ''}
      />
      
      {/* Documento con botón de carga */}
      <TextField
        label="Documento"
        value={formData.documento_presencial || ''}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <Button
              variant="contained"
              component="label"
              sx={{ bgcolor: '#0e5fa6' }}
            >
              Cargar archivo
              <input type="file" hidden />
            </Button>
          )
        }}
      />
      
      <Typography variant="caption" color="text.secondary">
        (Opcional), indicaciones para la persona que responda la pregunta
      </Typography>
    </Stack>
  </Box>
)}
```

**Uso Típico:**
- Entrega de documentos en ventanilla
- Revisión presencial de originales
- Firma de documentos físicos
- Pago en caja

**Diferencias Clave con ETAPA:**
| Característica | ETAPA | PRESENCIAL |
|----------------|-------|------------|
| Sistema de preguntas | ✅ Sí | ❌ No |
| Descripción propia | ❌ No | ✅ Sí |
| Documento asociado | ❌ No | ✅ Sí |
| Borde visual | Sólido | Punteado |
| Color distintivo | Azul | Rosa |

### FIN (Terminación)

**Características:**
- Marca el final exitoso del workflow
- **Forma circular** (único nodo no rectangular)
- Color: Rojo (`#f44336`)
- Tamaño: 80x80px en editor, 32x32px en viewer
- **No requiere perfiles permitidos** (excepción en validación)
- **No tiene preguntas ni configuración adicional**

**Código en CustomNode:**

```typescript
if (data.codigo === 'FIN') {
  const size = isViewer ? 32 : 80;
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <Paper
        elevation={0}
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: '#f44336',
          border: '2px solid #d32f2f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {!isViewer && (
          <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
            FIN
          </Typography>
        )}
      </Paper>
      {/* No tiene Handle de source - no pueden salir conexiones */}
    </>
  );
}
```

**Validación Especial en Backend:**

```python
@model_validator(mode='after')
def validar_perfiles(self):
    """INICIO y FIN no requieren perfiles permitidos"""
    if self.codigo not in ['INICIO', 'FIN'] and \
       (not self.perfiles_permitidos or len(self.perfiles_permitidos) == 0):
        raise ValueError('La etapa debe tener al menos un perfil permitido')
    return self
```

**Uso:**
- Único nodo de terminación por workflow (típicamente)
- No permite conexiones de salida
- Representa completación exitosa del proceso

---

## Sistema de Configuración

### Tipos de Preguntas y Campos Condicionales

El panel de configuración de preguntas aplica lógica condicional para mostrar/ocultar campos según el `tipo_pregunta` seleccionado.

### 1. REVISION_OCR (Revisión OCR de Documentos)

**Comportamiento Especial:**
- ✅ **Auto-poblado:** Al seleccionar el tipo, automáticamente:
  - `texto` = Nombre del tipo ("Revisión OCR")
  - `pregunta` = Nombre del tipo
  - `es_obligatoria` = `true` (siempre obligatorio)
- ❌ **Campos ocultos:**
  - Campo "Texto/Pregunta" (se usa el nombre del tipo)
  - Campo "Ayuda"
  - Checkbox "Obligatoria" (siempre es true)

**Campos Visibles:**
- **Etapa origen de documentos:** Dropdown con mockup text

```tsx
{tempPregunta.tipo === 'REVISION_OCR' && (
  <FormControl fullWidth>
    <InputLabel>Etapa origen de documentos</InputLabel>
    <Select
      value={tempPregunta.etapa_origen_id || ''}
      renderValue={(selected) => {
        if (!selected) {
          return (
            <Typography sx={{ color: 'text.secondary' }}>
              Recolectar requisitos del trámite PPSH y los anexo en el sistema
            </Typography>
          );
        }
        return pregunta?.texto || selected;
      }}
    >
      {preguntas
        .filter(p => p.tipo === 'CARGA_ARCHIVO')
        .map(p => (
          <MenuItem key={p.codigo} value={p.codigo}>
            {p.texto}
          </MenuItem>
        ))}
    </Select>
  </FormControl>
)}
```

**Código de Auto-población:**

```typescript
if (field === 'tipo') {
  const tipoLabel = TIPOS_PREGUNTA.find(t => t.value === value)?.label || value;
  setTempPregunta((prev) => prev ? { 
    ...prev, 
    tipo: value as TipoPregunta, 
    tipo_pregunta: value as TipoPregunta,
    ...(value === 'REVISION_OCR' && { 
      texto: tipoLabel, 
      pregunta: tipoLabel, 
      es_obligatoria: true 
    })
  } : null);
}
```

### 2. REVISION_MANUAL_DOCUMENTOS (Revisión Manual)

**Comportamiento:**
- ✅ **Campos visibles:**
  - **"Pregunta"** (en lugar de "Texto")
  - Etapa origen de documentos (dropdown)
  - Checkbox "Obligatoria"
- ❌ **Campos ocultos:**
  - Campo "Ayuda"

```tsx
{/* Label condicional para el campo de texto */}
<TextField
  label={
    tempPregunta.tipo === 'REVISION_MANUAL_DOCUMENTOS' || 
    tempPregunta.tipo === 'FECHA' || 
    tempPregunta.tipo === 'DATOS_CASO' 
      ? "Pregunta" 
      : "Texto"
  }
/>

{/* Campo de ayuda - Oculto para ciertos tipos */}
{(tempPregunta.tipo !== 'REVISION_MANUAL_DOCUMENTOS' && 
  tempPregunta.tipo !== 'FECHA' && 
  tempPregunta.tipo !== 'REVISION_OCR' &&
  tempPregunta.tipo !== 'DATOS_CASO') && (
  <TextField label="Ayuda" />
)}
```

### 3. FECHA (Selección de Fecha con Agenda)

**Comportamiento:**
- ✅ **Campos visibles:**
  - **"Pregunta"** (en lugar de "Texto")
  - **Origen agenda selección de fechas:** Dropdown con opciones
  - Checkbox "Obligatoria"
- ❌ **Campos ocultos:**
  - Campo "Ayuda"

```tsx
{tempPregunta.tipo === 'FECHA' && (
  <FormControl fullWidth>
    <InputLabel>Origen agenda selección de fechas</InputLabel>
    <Select
      value={tempPregunta.agenda_origen_id || ''}
      onChange={(e) => handlePreguntaChange('agenda_origen_id', e.target.value)}
    >
      <MenuItem value="AGENDA_PPSH">Agenda PPSH</MenuItem>
      <MenuItem value="AGENDA_GENERAL">Agenda General</MenuItem>
    </Select>
  </FormControl>
)}
```

### 4. DATOS_CASO (Datos del Expediente)

**Comportamiento Especial:**
- ✅ **Campos visibles:**
  - **"Pregunta"** dentro de la sección propia
  - **Checkbox "Obligatoria"** dentro de la sección propia
  - **Lista de checkboxes** para seleccionar campos del caso
- ❌ **Campos ocultos:**
  - Campo "Texto" general
  - Campo "Ayuda" general
  - Checkbox "Obligatoria" general (usa el propio dentro de la sección)

**Sección Específica:**

```tsx
{tempPregunta.tipo === 'DATOS_CASO' && (
  <Box
    sx={{
      p: 2,
      border: '2px solid #333333',
      borderRadius: '4px',
      bgcolor: 'white',
    }}
  >
    <Stack spacing={2}>
      {/* Pregunta específica */}
      <TextField
        fullWidth
        label="Pregunta"
        placeholder="Data a incluir:"
        value={tempPregunta.pregunta || ''}
        onChange={(e) => handlePreguntaChange('pregunta', e.target.value)}
      />
      
      {/* Obligatoria específica */}
      <FormControlLabel
        control={
          <Checkbox
            checked={tempPregunta.es_obligatoria || false}
            onChange={(e) => handlePreguntaChange('es_obligatoria', e.target.checked)}
          />
        }
        label="Obligatoria"
      />
      
      {/* Lista de campos del caso */}
      <Stack spacing={1}>
        {[
          { value: 'REUEX', label: 'REUEX' },
          { value: 'NOMBRE', label: 'Nombre' },
          { value: 'NACIONALIDAD', label: 'Nacionalidad' },
          { value: 'TRAMITE', label: 'Tramite' },
          { value: 'PASAPORTE', label: 'Pasaporte' },
          { value: 'SEXO', label: 'Sexo' },
          { value: 'EXPEDIENTE', label: 'Nº de Expediente' },
          { value: 'FECHA_NACIMIENTO', label: 'Fecha de nacimiento' },
        ].map((campo) => (
          <FormControlLabel
            key={campo.value}
            control={
              <Checkbox
                checked={(tempPregunta.campos_caso || []).includes(campo.value)}
                onChange={(e) => {
                  const currentCampos = tempPregunta.campos_caso || [];
                  const newCampos = e.target.checked
                    ? [...currentCampos, campo.value]
                    : currentCampos.filter(c => c !== campo.value);
                  handlePreguntaChange('campos_caso', newCampos);
                }}
              />
            }
            label={campo.label}
          />
        ))}
      </Stack>
    </Stack>
  </Box>
)}
```

### Resumen de Campos Condicionales

| Tipo de Pregunta | Campo "Texto" | Campo "Ayuda" | Obligatoria | Campos Especiales |
|------------------|---------------|---------------|-------------|-------------------|
| TEXTO | ✅ | ✅ | ✅ | - |
| SELECCION_SIMPLE | ✅ | ✅ | ✅ | Opciones |
| CARGA_ARCHIVO | ✅ | ✅ | ✅ | Tipos archivo |
| **REVISION_OCR** | ❌ Auto | ❌ | ❌ Siempre true | Etapa origen (mockup) |
| **REVISION_MANUAL** | ✅ "Pregunta" | ❌ | ✅ | Etapa origen |
| **FECHA** | ✅ "Pregunta" | ❌ | ✅ | Agenda origen |
| **DATOS_CASO** | ❌ | ❌ | ❌ | Pregunta propia + Checkboxes |

---

## Flujo de Datos

### 1. Carga de Workflow Existente

```
Usuario → WorkflowEditor
         ↓
    GET /workflows/{id}
         ↓
    Backend Response
         ↓
    Conversión a ReactFlow:
    - Etapas → Nodes
    - Conexiones → Edges
         ↓
    setNodes() + setEdges()
         ↓
    Renderizado en Canvas
```

**Código de Conversión:**

```typescript
// Convertir etapas a nodos
const convertedNodes = response.data.etapas.map((etapa: WorkflowEtapa) => ({
  id: etapa.codigo,
  type: 'custom',
  position: { 
    x: etapa.posicion_x || 0, 
    y: etapa.posicion_y || 0 
  },
  data: {
    ...etapa,
    label: etapa.nombre
  }
}));

// Convertir conexiones a edges
const convertedEdges = response.data.conexiones.map((conn: WorkflowConexion) => ({
  id: `${conn.etapa_origen_codigo}-${conn.etapa_destino_codigo}`,
  source: conn.etapa_origen_codigo,
  target: conn.etapa_destino_codigo,
  label: conn.nombre,
  type: conn.tipo_conexion || 'default'
}));
```

### 2. Edición de Etapa

```
Usuario selecciona nodo
         ↓
    onNodeClick(node)
         ↓
    setSelectedNode(node)
         ↓
    EtapaConfigPanel recibe node
         ↓
    setFormData(node.data)
         ↓
    Usuario edita campos
         ↓
    handleChange(field, value)
         ↓
    setFormData({ ...formData, [field]: value })
         ↓
    Usuario guarda
         ↓
    onSave(formData)
         ↓
    Actualiza node.data en nodes[]
         ↓
    setNodes([...])
```

### 3. Gestión de Preguntas

```
Usuario en Tab "Preguntas"
         ↓
    Click [+ Añadir]
         ↓
    setEditingIndex(-1)
    setTempPregunta(nuevaPregunta)
         ↓
    Usuario selecciona tipo
         ↓
    handlePreguntaChange('tipo', valor)
         ↓
    ¿Es REVISION_OCR?
    ├─ Sí → Auto-poblar campos
    └─ No → Campos normales
         ↓
    Usuario completa campos
         ↓
    Click [Guardar]
         ↓
    Validación de campos
         ↓
    ¿Editando o Nueva?
    ├─ Editando → preguntas[index] = tempPregunta
    └─ Nueva → preguntas.push(tempPregunta)
         ↓
    setPreguntas([...])
    setEditingIndex(null)
    setTempPregunta(null)
```

### 4. Guardado de Workflow Completo

```
Usuario click [Guardar Workflow]
         ↓
    handleSaveWorkflow()
         ↓
    Para cada node:
    ├─ Limpiar datos temporales
    │  ├─ delete is_placeholder
    │  ├─ delete label
    │  └─ delete es_inicial
    ├─ Redondear posiciones
    │  ├─ posicion_x = Math.round(x)
    │  └─ posicion_y = Math.round(y)
    └─ Convertir a WorkflowEtapa
         ↓
    Para cada edge:
    ├─ Mapear source/target
    │  ├─ Si es código → usar directo
    │  └─ Si es ID temp → buscar código
    └─ Convertir a WorkflowConexion
         ↓
    PUT /workflows/{id}
    Body: {
      etapas: [...],
      conexiones: [...]
    }
         ↓
    Backend Response
         ↓
    ¿Éxito?
    ├─ Sí → Mostrar success
    └─ No → Mostrar error
```

**Código de Limpieza:**

```typescript
const cleanedEtapas = nodes.map(node => {
  const { is_placeholder, label, es_inicial, ...cleanData } = node.data;
  return {
    ...cleanData,
    posicion_x: Math.round(node.position.x),
    posicion_y: Math.round(node.position.y),
    codigo: node.id
  };
});
```

### 5. Validación Backend

```
Request → FastAPI Router
         ↓
    Pydantic Schema Validation
         ↓
    WorkflowEtapaBase.validar_perfiles()
         ↓
    ¿Es INICIO o FIN?
    ├─ Sí → Skip perfiles validation
    └─ No → Require perfiles_permitidos
         ↓
    ¿Validación exitosa?
    ├─ Sí → Guardar en BD
    │         ↓
    │    Response 200 OK
    └─ No → Response 422 Validation Error
```

---

## Mejores Prácticas

### 1. Creación de Nuevos Tipos de Etapa

Si necesitas agregar un nuevo tipo de etapa:

1. **Actualizar el enum TypeScript:**
   ```typescript
   // frontend/src/types/workflow.ts
   export type TipoEtapa = 
     | 'ETAPA' 
     | 'COMPUERTA' 
     | 'SUBPROCESO' 
     | 'PRESENCIAL' 
     | 'FIN'
     | 'NUEVO_TIPO'; // ← Agregar aquí
   ```

2. **Actualizar el enum Backend:**
   ```python
   # backend/app/models/models_workflow.py
   class TipoEtapa(str, enum.Enum):
       ETAPA = "ETAPA"
       COMPUERTA = "COMPUERTA"
       PRESENCIAL = "PRESENCIAL"
       FIN = "FIN"
       NUEVO_TIPO = "NUEVO_TIPO"  # ← Agregar aquí
   ```

3. **Agregar al dropdown:**
   ```tsx
   // EtapaConfigPanel.tsx
   <Select value={formData.tipo_etapa}>
     <MenuItem value="ETAPA">Etapa</MenuItem>
     <MenuItem value="COMPUERTA">Compuerta</MenuItem>
     <MenuItem value="SUBPROCESO">Subproceso</MenuItem>
     <MenuItem value="PRESENCIAL">Presencial</MenuItem>
     <MenuItem value="NUEVO_TIPO">Nuevo Tipo</MenuItem>
   </Select>
   ```

4. **Definir estilos en CustomNode:**
   ```typescript
   const getNodeColor = () => {
     switch (data.tipo_etapa) {
       case 'NUEVO_TIPO':
         return '#color_hex';
       // ... otros casos
     }
   };
   ```

5. **Agregar lógica condicional si requiere campos especiales:**
   ```tsx
   {formData.tipo_etapa === 'NUEVO_TIPO' && (
     <Box>
       {/* Campos específicos */}
     </Box>
   )}
   ```

### 2. Creación de Nuevos Tipos de Pregunta

1. **Agregar al enum TypeScript:**
   ```typescript
   export type TipoPregunta = 
     | 'TEXTO' 
     | 'NUEVO_TIPO_PREGUNTA';
   ```

2. **Agregar a la lista de opciones:**
   ```typescript
   const TIPOS_PREGUNTA = [
     { value: 'TEXTO', label: 'Campo de texto' },
     { value: 'NUEVO_TIPO_PREGUNTA', label: 'Nuevo Tipo' }
   ];
   ```

3. **Implementar lógica condicional:**
   ```tsx
   {tempPregunta.tipo === 'NUEVO_TIPO_PREGUNTA' && (
     <Box>
       {/* Campos específicos del nuevo tipo */}
     </Box>
   )}
   ```

4. **Actualizar validación de campos:**
   ```tsx
   {/* Ocultar campos según sea necesario */}
   {(tempPregunta.tipo !== 'NUEVO_TIPO_PREGUNTA') && (
     <TextField label="Campo a ocultar" />
   )}
   ```

### 3. Manejo de Estados

- **Siempre usar funciones de actualización inmutables:**
  ```typescript
  // ✅ Correcto
  setNodes(nodes => nodes.map(n => 
    n.id === nodeId ? { ...n, data: newData } : n
  ));
  
  // ❌ Incorrecto
  nodes[index].data = newData;
  setNodes(nodes);
  ```

- **Limpiar estado temporal después de guardar:**
  ```typescript
  const handleSavePregunta = () => {
    // Guardar...
    setEditingIndex(null);
    setTempPregunta(null); // ← Importante
  };
  ```

### 4. Validación de Datos

- **Validar en el frontend antes de enviar:**
  ```typescript
  if (!formData.codigo || !formData.nombre) {
    alert('Campos obligatorios faltantes');
    return;
  }
  ```

- **Manejar errores del backend:**
  ```typescript
  try {
    await axios.put(`/workflows/${id}`, data);
  } catch (error) {
    if (error.response?.status === 422) {
      // Mostrar errores de validación
      console.error(error.response.data.detail);
    }
  }
  ```

### 5. Optimización de Rendimiento

- **Usar React.memo para componentes pesados:**
  ```typescript
  export default React.memo(CustomNode);
  ```

- **Evitar re-renders innecesarios:**
  ```typescript
  const memoizedValue = useMemo(() => 
    expensiveCalculation(data), 
    [data]
  );
  ```

---

## Arquitectura de Componentes

```
WorkflowEditor (Página)
├── ReactFlow (Canvas)
│   ├── CustomNode (x N nodos)
│   │   ├── Handles (conexiones)
│   │   ├── Paper (contenedor visual)
│   │   └── Badges (perfiles, vistas)
│   └── Edges (conexiones)
│       └── Labels (nombres)
└── EtapaConfigPanel (Lateral)
    ├── Tabs
    │   ├── Tab "Configuración"
    │   │   ├── Tipo de etapa
    │   │   ├── Datos básicos
    │   │   ├── [Sección PRESENCIAL] (condicional)
    │   │   └── Formulario
    │   └── Tab "Preguntas"
    │       ├── Lista de preguntas
    │       ├── Tarjetas colapsadas
    │       └── Formulario de edición
    │           ├── Tipo de pregunta
    │           ├── Campos comunes
    │           └── [Campos específicos] (condicional)
    └── Botones Acción
```

---

## Troubleshooting Común

### Problema: Nodos no guardan posición

**Causa:** Posiciones no están siendo redondeadas

**Solución:**
```typescript
posicion_x: Math.round(node.position.x),
posicion_y: Math.round(node.position.y)
```

### Problema: Error 422 al guardar FIN

**Causa:** Validación requiere perfiles_permitidos

**Solución:** Backend debe excluir 'FIN' de validación:
```python
if self.codigo not in ['INICIO', 'FIN'] and (not self.perfiles_permitidos...):
```

### Problema: Campos temporales en request

**Causa:** `is_placeholder`, `label`, `es_inicial` no se eliminan

**Solución:** Limpiar antes de enviar:
```typescript
const { is_placeholder, label, es_inicial, ...cleanData } = node.data;
```

### Problema: REVISION_OCR muestra campos incorrectos

**Causa:** Lógica condicional no excluye el tipo

**Solución:** Agregar a todas las condiciones:
```tsx
{(tipo !== 'REVISION_OCR' && tipo !== 'DATOS_CASO') && (
  <TextField label="Texto" />
)}
```

### Problema: Tipos nuevos no se guardan

**Causa:** Enum no sincronizado entre frontend y backend

**Solución:** 
1. Verificar `TipoEtapa` en ambos lados
2. Reiniciar backend después de cambios en enums
3. Limpiar caché del frontend

---

## Conclusión

El sistema de workflows es altamente configurable y extensible. Los componentes están diseñados para:

- ✅ Soportar múltiples tipos de etapas con comportamientos únicos
- ✅ Permitir configuración granular de formularios por etapa
- ✅ Aplicar lógica condicional compleja en la UI
- ✅ Mantener sincronización entre frontend y backend
- ✅ Proporcionar validación robusta en ambos lados

Para agregar nuevas funcionalidades, seguir los patrones establecidos y mantener la coherencia entre tipos, validaciones y renderizado condicional.

---

**Última actualización:** 17 de Noviembre de 2025  
**Versión del documento:** 1.0  
**Autor:** Sistema de Documentación Automática
