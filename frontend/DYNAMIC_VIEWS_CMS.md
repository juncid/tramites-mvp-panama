# 🎨 Mini CMS - Sistema de Vistas Dinámicas

## 📋 Contexto

### Estado Actual
- **WorkflowEditor**: Editor visual con 2 columnas (diagrama + configuración)
- **EtapaConfigPanel**: Panel de configuración de etapas con preguntas dinámicas
- **TipoPregunta**: 15+ tipos de componentes (TEXTO, CARGA_ARCHIVO, FIRMA_DIGITAL, etc.)
- **Views**: Vistas estáticas (GeneralView, StatusView, HistoryView, FlowView)

### Problema
Las vistas actuales son **estáticas** y **hardcodeadas**. Cada flujo necesita vistas personalizadas configurables desde el workflow editor sin necesidad de código.

---

## 🎯 Objetivo

Crear un **Mini CMS** que permita:

1. ✅ **Configurar vistas dinámicas** por etapa/actividad
2. ✅ **Reutilizar layout común** (mismo diseño, diferentes componentes)
3. ✅ **Asociar perfiles y actividades** a cada vista
4. ✅ **Renderizar componentes** según tipo de pregunta configurado
5. ✅ **Sin escribir código** para cada nuevo flujo

---

## 🏗️ Arquitectura Propuesta

### 1. Modelo de Datos

```typescript
// Extensión a WorkflowEtapa
export interface WorkflowEtapa {
  // ... campos existentes
  
  // NUEVO: Configuración de vista
  vista_config?: VistaConfig;
}

export interface VistaConfig {
  id?: number;
  etapa_id: number;
  
  // Layout
  layout_tipo: 'SIMPLE' | 'DOS_COLUMNAS' | 'TRES_COLUMNAS' | 'TABS';
  
  // Secciones de la vista
  secciones: SeccionVista[];
  
  // Metadata
  titulo_vista?: string;
  descripcion_vista?: string;
  mostrar_breadcrumbs: boolean;
  mostrar_timeline: boolean;
  
  created_at?: string;
  updated_at?: string;
}

export interface SeccionVista {
  id: string;
  orden: number;
  titulo: string;
  descripcion?: string;
  icono?: string;
  
  // Columna en layout (1, 2, 3 o 'full')
  columna: number | 'full';
  
  // Ancho relativo (1-12, estilo Bootstrap)
  ancho: number;
  
  // Componentes dentro de la sección
  componentes: ComponenteVista[];
  
  // Visibilidad condicional
  visible_para_perfiles?: string[];
  visible_en_estados?: string[];
  
  // Estilo
  color_fondo?: string;
  mostrar_borde: boolean;
  colapsable: boolean;
}

export interface ComponenteVista {
  id: string;
  orden: number;
  
  // Tipo de componente a renderizar
  tipo: TipoComponenteVista;
  
  // Configuración específica del componente
  config: ConfigComponente;
  
  // Datos
  fuente_datos: 'PREGUNTA' | 'PROCESO' | 'SOLICITUD' | 'ESTATICO' | 'API';
  pregunta_id?: number;
  campo_proceso?: string;
  
  // Validación
  es_obligatorio: boolean;
  es_editable: boolean;
  validaciones?: any;
  
  // Visibilidad
  visible: boolean;
  dependencias?: DependenciaComponente[];
}

export type TipoComponenteVista = 
  // Entrada de datos
  | 'TEXTO_INPUT'
  | 'NUMERO_INPUT'
  | 'FECHA_PICKER'
  | 'SELECT_SIMPLE'
  | 'SELECT_MULTIPLE'
  | 'CHECKBOX'
  | 'RADIO_BUTTONS'
  | 'TEXTAREA'
  
  // Archivos
  | 'CARGA_ARCHIVOS'
  | 'DESCARGA_ARCHIVO'
  | 'GALERIA_DOCUMENTOS'
  | 'VISOR_PDF'
  
  // Display
  | 'TEXTO_ESTATICO'
  | 'TITULO'
  | 'ALERTA'
  | 'CARD_INFO'
  | 'TABLA'
  | 'LISTA'
  | 'TIMELINE'
  | 'GRAFICO'
  
  // Acciones
  | 'BOTON'
  | 'BOTON_DESCARGA'
  | 'BOTON_FIRMA'
  | 'BOTON_PAGO'
  | 'BOTON_IMPRIMIR'
  | 'BOTON_NOTIFICAR'
  
  // Revisión
  | 'REVISION_DOCUMENTOS'
  | 'REVISION_OCR'
  | 'VALIDACION_DATOS'
  
  // Especiales
  | 'DATOS_CASO'
  | 'MAPA'
  | 'FIRMA_DIGITAL'
  | 'PAGO_ONLINE';

export interface ConfigComponente {
  // Labels
  label?: string;
  placeholder?: string;
  ayuda?: string;
  
  // Opciones (para selects, radios)
  opciones?: OpcionComponente[];
  
  // Validación
  min?: number;
  max?: number;
  patron?: string;
  mensaje_error?: string;
  
  // Archivos
  tipos_archivos_permitidos?: string[];
  tamaño_maximo_mb?: number;
  cantidad_maxima?: number;
  
  // Display
  color?: string;
  icono?: string;
  variant?: string;
  
  // Específico por tipo
  [key: string]: any;
}

export interface OpcionComponente {
  valor: string | number;
  etiqueta: string;
  descripcion?: string;
  icono?: string;
  deshabilitada?: boolean;
}

export interface DependenciaComponente {
  componente_id: string;
  condicion: 'IGUAL' | 'DIFERENTE' | 'MAYOR' | 'MENOR' | 'CONTIENE' | 'NO_VACIO';
  valor: any;
}
```

---

## 🎨 Componentes del CMS

### 2. Editor de Vistas (Extensión a EtapaConfigPanel)

```typescript
// Nuevo tab en EtapaConfigPanel
<Tabs>
  <Tab label="General" />
  <Tab label="Preguntas" /> {/* Actual */}
  <Tab label="Vista Dinámica" /> {/* NUEVO */}
</Tabs>
```

**Vista Dinámica Tab:**
```tsx
<VistaEditor
  etapa={etapa}
  onSave={(vistaConfig) => handleSaveVista(vistaConfig)}
/>
```

#### VistaEditor Component

```
┌─────────────────────────────────────────┐
│ 📐 Layout                               │
├─────────────────────────────────────────┤
│ Tipo: [Simple ▼]                        │
│                                          │
│ ☐ Mostrar breadcrumbs                   │
│ ☐ Mostrar timeline                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📦 Secciones              [+ Añadir]    │
├─────────────────────────────────────────┤
│ ▼ Sección 1: Datos del Solicitante      │
│   Columna: 1  Ancho: 12                 │
│   📋 Componentes: 4                      │
│   [Editar] [Eliminar]                   │
│                                          │
│ ▼ Sección 2: Documentos Requeridos      │
│   Columna: 1  Ancho: 12                 │
│   📋 Componentes: 2                      │
│   [Editar] [Eliminar]                   │
└─────────────────────────────────────────┘
```

---

### 3. Editor de Sección

```tsx
interface SeccionEditorProps {
  seccion?: SeccionVista;
  onSave: (seccion: SeccionVista) => void;
  preguntasDisponibles: WorkflowPregunta[];
}

<SeccionEditor>
  {/* Configuración básica */}
  <TextField label="Título" />
  <TextField label="Descripción" />
  
  {/* Layout */}
  <Select label="Columna" options={[1, 2, 3, 'full']} />
  <Slider label="Ancho" min={1} max={12} />
  
  {/* Componentes */}
  <ComponentesList
    componentes={seccion.componentes}
    onAdd={handleAddComponente}
    onEdit={handleEditComponente}
    onDelete={handleDeleteComponente}
  />
  
  {/* Visibilidad */}
  <Select 
    multiple
    label="Visible para perfiles"
    options={PERFILES_DISPONIBLES}
  />
</SeccionEditor>
```

---

### 4. Editor de Componente

```tsx
interface ComponenteEditorProps {
  componente?: ComponenteVista;
  preguntasDisponibles: WorkflowPregunta[];
  onSave: (componente: ComponenteVista) => void;
}

<ComponenteEditor>
  {/* Tipo de componente */}
  <Select 
    label="Tipo de Componente"
    options={TIPOS_COMPONENTE_VISTA}
    onChange={handleTipoChange}
  />
  
  {/* Fuente de datos */}
  <RadioGroup
    label="Fuente de datos"
    options={['PREGUNTA', 'PROCESO', 'ESTATICO']}
  />
  
  {/* Si es PREGUNTA */}
  {fuenteDatos === 'PREGUNTA' && (
    <Select
      label="Pregunta asociada"
      options={preguntasDisponibles}
    />
  )}
  
  {/* Configuración específica según tipo */}
  <DynamicConfigForm
    tipo={componente.tipo}
    config={componente.config}
    onChange={handleConfigChange}
  />
  
  {/* Validaciones */}
  <Checkbox label="Obligatorio" />
  <Checkbox label="Editable" />
  
  {/* Dependencias */}
  <DependenciasEditor
    componentes={componentesEnSeccion}
    dependencias={componente.dependencias}
    onChange={handleDependenciasChange}
  />
</ComponenteEditor>
```

---

### 5. Renderer de Vista Dinámica

```tsx
interface DynamicViewRendererProps {
  etapa: WorkflowEtapa;
  proceso?: any;
  onSubmit: (data: any) => void;
  readonly?: boolean;
}

export const DynamicViewRenderer: React.FC<DynamicViewRendererProps> = ({
  etapa,
  proceso,
  onSubmit,
  readonly = false,
}) => {
  const [formData, setFormData] = useState({});
  const vistaConfig = etapa.vista_config;

  if (!vistaConfig) {
    return <DefaultView etapa={etapa} />;
  }

  const renderComponente = (componente: ComponenteVista) => {
    const Component = COMPONENTE_MAP[componente.tipo];
    
    return (
      <Component
        key={componente.id}
        config={componente.config}
        value={formData[componente.id]}
        onChange={(value) => handleChange(componente.id, value)}
        readonly={readonly || !componente.es_editable}
        error={errors[componente.id]}
      />
    );
  };

  const renderSeccion = (seccion: SeccionVista) => {
    // Verificar visibilidad
    if (!isSeccionVisible(seccion, currentUser, proceso)) {
      return null;
    }

    return (
      <Card key={seccion.id}>
        <CardHeader
          title={seccion.titulo}
          subtitle={seccion.descripcion}
          icon={seccion.icono}
          collapsible={seccion.colapsable}
        />
        <CardContent>
          <Grid container spacing={2}>
            {seccion.componentes
              .filter(c => isComponenteVisible(c, formData))
              .map(componente => (
                <Grid 
                  item 
                  xs={12} 
                  sm={componente.config.ancho || 12}
                  key={componente.id}
                >
                  {renderComponente(componente)}
                </Grid>
              ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {vistaConfig.mostrar_breadcrumbs && <Breadcrumbs />}
      
      <Typography variant="h4">
        {vistaConfig.titulo_vista || etapa.nombre}
      </Typography>
      
      {vistaConfig.descripcion_vista && (
        <Typography variant="body2" color="text.secondary">
          {vistaConfig.descripcion_vista}
        </Typography>
      )}

      {vistaConfig.mostrar_timeline && (
        <ProcessTimeline proceso={proceso} />
      )}

      {/* Layout dinámico */}
      {vistaConfig.layout_tipo === 'SIMPLE' && (
        <Stack spacing={3}>
          {vistaConfig.secciones.map(renderSeccion)}
        </Stack>
      )}

      {vistaConfig.layout_tipo === 'DOS_COLUMNAS' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {vistaConfig.secciones
              .filter(s => s.columna === 1)
              .map(renderSeccion)}
          </Grid>
          <Grid item xs={12} md={6}>
            {vistaConfig.secciones
              .filter(s => s.columna === 2)
              .map(renderSeccion)}
          </Grid>
        </Grid>
      )}

      {/* Botones de acción */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          variant="contained" 
          onClick={() => onSubmit(formData)}
        >
          Guardar
        </Button>
      </Box>
    </Box>
  );
};
```

---

### 6. Mapa de Componentes

```tsx
// components/DynamicView/ComponenteMap.tsx

import { TextInput } from './components/TextInput';
import { NumberInput } from './components/NumberInput';
import { DatePicker } from './components/DatePicker';
import { FileUpload } from './components/FileUpload';
import { SelectSimple } from './components/SelectSimple';
// ... más componentes

export const COMPONENTE_MAP: Record<TipoComponenteVista, React.FC<any>> = {
  TEXTO_INPUT: TextInput,
  NUMERO_INPUT: NumberInput,
  FECHA_PICKER: DatePicker,
  SELECT_SIMPLE: SelectSimple,
  SELECT_MULTIPLE: SelectMultiple,
  CARGA_ARCHIVOS: FileUpload,
  DESCARGA_ARCHIVO: FileDownload,
  TEXTO_ESTATICO: StaticText,
  TITULO: Title,
  ALERTA: Alert,
  CARD_INFO: InfoCard,
  TABLA: Table,
  TIMELINE: Timeline,
  BOTON: Button,
  REVISION_DOCUMENTOS: DocumentReview,
  REVISION_OCR: OCRReview,
  FIRMA_DIGITAL: DigitalSignature,
  PAGO_ONLINE: OnlinePayment,
  // ... resto de componentes
};

export const COMPONENTE_CONFIG_SCHEMAS: Record<TipoComponenteVista, any> = {
  CARGA_ARCHIVOS: {
    tipos_archivos_permitidos: { type: 'array', default: ['pdf', 'jpg', 'png'] },
    tamaño_maximo_mb: { type: 'number', default: 10 },
    cantidad_maxima: { type: 'number', default: 5 },
  },
  SELECT_SIMPLE: {
    opciones: { type: 'array', required: true },
    placeholder: { type: 'string' },
  },
  // ... esquemas para cada tipo
};
```

---

## 📊 Flujo de Uso

### Para el Administrador (Configuración)

```
1. Crear Workflow
   ↓
2. Agregar Etapas
   ↓
3. Para cada etapa:
   ├─ Tab "Preguntas": Definir preguntas (fuente de datos)
   │  ├─ Pregunta 1: Nombre (TEXTO)
   │  ├─ Pregunta 2: Cédula (NUMERO)
   │  └─ Pregunta 3: Foto Cédula (CARGA_ARCHIVO)
   │
   └─ Tab "Vista Dinámica": Diseñar interfaz
      ├─ Layout: Simple
      ├─ Sección 1: "Datos Personales"
      │  ├─ Componente: TEXTO_INPUT (enlazado a Pregunta 1)
      │  └─ Componente: NUMERO_INPUT (enlazado a Pregunta 2)
      └─ Sección 2: "Documentación"
         └─ Componente: CARGA_ARCHIVOS (enlazado a Pregunta 3)
   ↓
4. Guardar Workflow
```

### Para el Usuario Final (Ejecución)

```
1. Inicia proceso
   ↓
2. Sistema renderiza vista dinámica según configuración
   ├─ Muestra secciones configuradas
   ├─ Renderiza componentes según tipo
   └─ Aplica validaciones y dependencias
   ↓
3. Usuario llena formulario
   ↓
4. Sistema valida y guarda datos
   ↓
5. Transición a siguiente etapa
```

---

## 🗂️ Estructura de Archivos

```
frontend/src/
├── types/
│   └── dynamic-views.ts          # Nuevos tipos
│
├── components/
│   └── DynamicView/
│       ├── index.ts
│       │
│       ├── Editor/               # Para administradores
│       │   ├── VistaEditor.tsx
│       │   ├── SeccionEditor.tsx
│       │   ├── ComponenteEditor.tsx
│       │   └── DependenciasEditor.tsx
│       │
│       ├── Renderer/             # Para usuarios
│       │   ├── DynamicViewRenderer.tsx
│       │   ├── SeccionRenderer.tsx
│       │   └── ComponenteRenderer.tsx
│       │
│       ├── Components/           # Componentes renderizables
│       │   ├── Input/
│       │   │   ├── TextInput.tsx
│       │   │   ├── NumberInput.tsx
│       │   │   └── DatePicker.tsx
│       │   ├── File/
│       │   │   ├── FileUpload.tsx
│       │   │   ├── FileDownload.tsx
│       │   │   └── FileGallery.tsx
│       │   ├── Display/
│       │   │   ├── StaticText.tsx
│       │   │   ├── InfoCard.tsx
│       │   │   └── Timeline.tsx
│       │   ├── Action/
│       │   │   ├── Button.tsx
│       │   │   ├── DownloadButton.tsx
│       │   │   └── SignButton.tsx
│       │   └── Review/
│       │       ├── DocumentReview.tsx
│       │       └── OCRReview.tsx
│       │
│       └── utils/
│           ├── ComponenteMap.tsx
│           ├── validation.ts
│           ├── visibility.ts
│           └── dataBinding.ts
│
├── services/
│   └── vista-config.service.ts   # API para vistas
│
└── pages/
    └── WorkflowEditor.tsx         # Extender con VistaEditor
```

---

## 🔄 Migración de Código Existente

### Antes (Hardcodeado)

```tsx
// GeneralView.tsx - Vista estática
export const GeneralView = ({ procesoId }) => {
  return (
    <Box>
      <TextField label="Nombre" />
      <TextField label="Descripción" multiline />
      <Button>Guardar</Button>
    </Box>
  );
};
```

### Después (Dinámico)

```tsx
// DynamicViewRenderer.tsx - Vista configurable
export const DynamicViewRenderer = ({ etapa, proceso }) => {
  const vistaConfig = etapa.vista_config;
  
  if (!vistaConfig) {
    return <DefaultView etapa={etapa} />; // Fallback
  }
  
  return renderDynamicView(vistaConfig, proceso);
};
```

---

## 📝 Ejemplo de Configuración JSON

```json
{
  "etapa_id": 1,
  "layout_tipo": "SIMPLE",
  "titulo_vista": "Registro de Solicitud PPSH",
  "descripcion_vista": "Complete los datos del solicitante",
  "mostrar_breadcrumbs": true,
  "mostrar_timeline": false,
  "secciones": [
    {
      "id": "seccion-1",
      "orden": 1,
      "titulo": "Datos Personales",
      "descripcion": "Información básica del solicitante",
      "columna": 1,
      "ancho": 12,
      "mostrar_borde": true,
      "componentes": [
        {
          "id": "comp-1",
          "orden": 1,
          "tipo": "TEXTO_INPUT",
          "fuente_datos": "PREGUNTA",
          "pregunta_id": 1,
          "config": {
            "label": "Nombre completo",
            "placeholder": "Ingrese su nombre",
            "ayuda": "Como aparece en su cédula"
          },
          "es_obligatorio": true,
          "es_editable": true,
          "visible": true
        },
        {
          "id": "comp-2",
          "orden": 2,
          "tipo": "NUMERO_INPUT",
          "fuente_datos": "PREGUNTA",
          "pregunta_id": 2,
          "config": {
            "label": "Número de cédula",
            "placeholder": "0-000-0000",
            "patron": "^\\d-\\d{3}-\\d{4}$"
          },
          "es_obligatorio": true,
          "es_editable": true,
          "visible": true
        }
      ]
    },
    {
      "id": "seccion-2",
      "orden": 2,
      "titulo": "Documentos",
      "columna": 1,
      "ancho": 12,
      "componentes": [
        {
          "id": "comp-3",
          "orden": 1,
          "tipo": "CARGA_ARCHIVOS",
          "fuente_datos": "PREGUNTA",
          "pregunta_id": 3,
          "config": {
            "label": "Cédula de identidad",
            "tipos_archivos_permitidos": ["pdf", "jpg", "png"],
            "tamaño_maximo_mb": 10,
            "cantidad_maxima": 2
          },
          "es_obligatorio": true,
          "es_editable": true
        }
      ]
    }
  ]
}
```

---

## 🚀 Implementación por Fases

### Fase 1: Foundation (1-2 semanas)
- [ ] Definir tipos TypeScript completos
- [ ] Crear modelos de base de datos (backend)
- [ ] API endpoints para CRUD de vistas
- [ ] Componente base `DynamicViewRenderer`
- [ ] 5 componentes básicos (texto, número, fecha, select, archivo)

### Fase 2: Editor Básico (1-2 semanas)
- [ ] Tab "Vista Dinámica" en `EtapaConfigPanel`
- [ ] `VistaEditor` con layout simple
- [ ] `SeccionEditor` básico
- [ ] `ComponenteEditor` con 5 tipos
- [ ] Preview en tiempo real

### Fase 3: Componentes Avanzados (2 semanas)
- [ ] 10 componentes adicionales
- [ ] Sistema de dependencias
- [ ] Validaciones avanzadas
- [ ] Data binding completo
- [ ] Integración con preguntas existentes

### Fase 4: Features Avanzados (1-2 semanas)
- [ ] Layouts múltiples (2 columnas, 3 columnas, tabs)
- [ ] Visibilidad condicional
- [ ] Componentes especiales (FIRMA_DIGITAL, PAGO, OCR)
- [ ] Templates predefinidos
- [ ] Import/Export de configuraciones

### Fase 5: Testing & Refinamiento (1 semana)
- [ ] Tests unitarios de componentes
- [ ] Tests de integración
- [ ] Documentación de uso
- [ ] Migrar vistas existentes
- [ ] Optimización de rendimiento

---

## 🎨 Ventajas del Sistema

### Para Desarrolladores
- ✅ **DRY**: No repetir código para cada flujo
- ✅ **Mantenible**: Cambios centralizados
- ✅ **Extensible**: Fácil agregar nuevos componentes
- ✅ **Testeable**: Componentes aislados

### Para Administradores
- ✅ **Sin código**: Configurar vistas sin programar
- ✅ **Visual**: Editor intuitivo drag & drop (futuro)
- ✅ **Flexible**: Adaptar a cualquier proceso
- ✅ **Rápido**: Crear vistas en minutos

### Para Usuarios Finales
- ✅ **Consistente**: Misma UX en todos los flujos
- ✅ **Intuitivo**: Componentes familiares
- ✅ **Responsive**: Funciona en todos los dispositivos
- ✅ **Accesible**: Cumple estándares de accesibilidad

---

## 🔧 Consideraciones Técnicas

### Performance
- **Lazy loading** de componentes
- **Memoización** de renders
- **Virtual scrolling** para listas largas
- **Code splitting** por tipo de componente

### Seguridad
- **Validación en frontend y backend**
- **Sanitización de HTML** en textos estáticos
- **Permisos por perfil** en cada componente
- **Audit log** de cambios en configuración

### Accesibilidad
- **ARIA labels** en todos los componentes
- **Navegación por teclado**
- **Screen reader friendly**
- **Alto contraste** configurable

---

## 📚 Referencias

- WorkflowEditor.tsx (líneas 1-638)
- EtapaConfigPanel.tsx (líneas 1-400+)
- workflow.ts tipos (TipoPregunta, WorkflowEtapa)
- React Flow para diagramas
- Material-UI para componentes

---

**Creado:** Noviembre 12, 2025  
**Autor:** Sistema de Desarrollo  
**Estado:** 📋 Diseño - Pendiente de aprobación  
**Próximo paso:** Revisar y aprobar arquitectura antes de implementar
