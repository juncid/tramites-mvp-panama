# Sistema de Vistas Dinámicas para Workflows

## Descripción General

El sistema de vistas dinámicas permite renderizar automáticamente formularios de etapas de workflow según las configuraciones definidas en cada pregunta. Cada tipo de pregunta tiene su propia vista especializada.

## Arquitectura

### Componente Principal

**`DynamicEtapaView`**: Componente orquestador que:
- Recibe una etapa completa con sus preguntas
- Ordena las preguntas por su campo `orden`
- Renderiza dinámicamente el componente apropiado según `tipo_pregunta`
- Gestiona las respuestas de forma centralizada

### Componentes de Vista por Tipo de Pregunta

Ubicación: `frontend/src/components/Workflow/QuestionViews/`

#### 1. RespuestaTextoView
- **Tipos**: `RESPUESTA_TEXTO`, `RESPUESTA_LARGA`
- **Descripción**: Campo de texto simple o área de texto (multiline)
- **Props específicas**: 
  - `texto_ayuda`: Texto de ayuda mostrado debajo del título
  - Multiline automático para `RESPUESTA_LARGA`

#### 2. ListaView
- **Tipo**: `LISTA`
- **Descripción**: Lista de checkboxes con selección múltiple
- **Props específicas**:
  - `lista_elementos`: Array de strings con las opciones

#### 3. OpcionesView
- **Tipo**: `OPCIONES`
- **Descripción**: Radio buttons (selección simple) o Checkboxes (selección múltiple)
- **Props específicas**:
  - `lista_elementos`: Array de strings con las opciones
  - `permite_multiple`: Boolean que determina si permite selección múltiple

#### 4. CargaArchivoView
- **Tipo**: `CARGA_ARCHIVO`
- **Descripción**: Carga de archivos con validación
- **Props específicas**:
  - `max_archivos`: Número máximo de archivos permitidos (default: 5)
  - `max_size_mb`: Tamaño máximo en MB por archivo (default: 10)
- **Funcionalidades**:
  - Validación de tamaño
  - Lista de archivos seleccionados
  - Eliminación de archivos

#### 5. RevisionManualDocumentosView
- **Tipo**: `REVISION_MANUAL_DOCUMENTOS`
- **Descripción**: Tabla de revisión de documentos (similar a la vista de revisión existente)
- **Props específicas**:
  - `instanciaId`: ID de la instancia para cargar documentos
- **Componentes**:
  - Usa `DocumentChecklistTable` para mostrar la lista de documentos
  - Permite marcar documentos como válidos/inválidos

#### 6. RevisionOCRView
- **Tipo**: `REVISION_OCR`
- **Descripción**: Botón para iniciar revisión OCR automática
- **Props específicas**:
  - `instanciaId`: ID de la instancia
- **Funcionalidad**: Trigger para proceso OCR del backend

#### 7. DatosCasoView
- **Tipo**: `DATOS_CASO`
- **Descripción**: Muestra datos del caso en formato read-only
- **Props específicas**:
  - `campos_caso`: Array de strings con los campos a mostrar
  - `instanciaId`: ID de la instancia para cargar datos
- **Visualización**: Grid de 2 columnas con etiqueta y valor

#### 8. SeleccionFechaView
- **Tipo**: `SELECCION_FECHA`
- **Descripción**: Selector de fecha HTML5
- **Props específicas**: 
  - `texto_ayuda`: Texto de ayuda
- **Retorna**: Fecha en formato YYYY-MM-DD

#### 9. DescargaArchivoView
- **Tipo**: `DESCARGA_ARCHIVO`
- **Descripción**: Botón para descargar archivo
- **Funcionalidad**: Permite descargar archivos generados por el sistema

#### 10. ImpresionView
- **Tipo**: `IMPRESION`
- **Descripción**: Botón para imprimir documento
- **Funcionalidad**: Trigger de window.print()

## Uso

### Página de Ejecución de Etapa

**Ruta**: `/flujos/:workflowId/instancias/:instanciaId/etapa/:etapaId`

**Componente**: `EtapaExecution`

```tsx
<DynamicEtapaView
  etapa={etapa}
  instanciaId={instanciaId}
  readonly={false}
  onAnswerChange={handleAnswerChange}
/>
```

### Props del DynamicEtapaView

```typescript
interface DynamicEtapaViewProps {
  etapa: WorkflowEtapa;           // Etapa completa con preguntas
  instanciaId?: number;            // ID de instancia (opcional)
  readonly?: boolean;              // Vista de solo lectura
  onAnswerChange?: (               // Callback cuando cambia respuesta
    preguntaId: number, 
    valor: any
  ) => void;
}
```

## Estructura de Datos

### WorkflowEtapa
```typescript
interface WorkflowEtapa {
  id?: number;
  codigo: string;
  nombre: string;
  tipo_etapa: TipoEtapa;
  titulo_formulario?: string;      // Título mostrado en la vista
  bajada_formulario?: string;      // Descripción del formulario
  perfiles_permitidos: string[];
  preguntas?: WorkflowPregunta[];
  // ... otros campos
}
```

### WorkflowPregunta
```typescript
interface WorkflowPregunta {
  id?: number;
  codigo: string;
  pregunta: string;                // Texto de la pregunta
  tipo_pregunta: TipoPregunta;
  orden: number;
  es_obligatoria: boolean;
  texto_ayuda?: string;
  // Campos específicos por tipo
  lista_elementos?: string[];      // Para LISTA, OPCIONES
  permite_multiple?: boolean;      // Para OPCIONES
  max_archivos?: number;           // Para CARGA_ARCHIVO
  max_size_mb?: number;            // Para CARGA_ARCHIVO
  campos_caso?: string[];          // Para DATOS_CASO
  // ... otros campos
}
```

## Extensión del Sistema

### Agregar un Nuevo Tipo de Pregunta

1. **Definir el tipo en types/workflow.ts**:
```typescript
export type TipoPregunta = 
  | 'RESPUESTA_TEXTO'
  | 'NUEVO_TIPO';  // Agregar aquí
```

2. **Crear el componente de vista**:
```typescript
// QuestionViews/NuevoTipoView.tsx
export const NuevoTipoView: React.FC<NuevoTipoViewProps> = ({
  pregunta,
  readonly,
  onAnswerChange,
}) => {
  // Implementación
};
```

3. **Agregar al DynamicEtapaView**:
```typescript
import { NuevoTipoView } from './QuestionViews/NuevoTipoView';

// En el switch del renderPregunta:
case 'NUEVO_TIPO':
  return <NuevoTipoView key={pregunta.id} {...commonProps} />;
```

4. **Actualizar el backend** (models_workflow.py):
```python
class TipoPregunta(str, Enum):
    RESPUESTA_TEXTO = "RESPUESTA_TEXTO"
    NUEVO_TIPO = "NUEVO_TIPO"  # Agregar aquí
```

## Flujo de Datos

1. Usuario navega a `/flujos/{workflowId}/instancias/{instanciaId}/etapa/{etapaId}`
2. `EtapaExecution` carga la etapa desde el backend
3. `DynamicEtapaView` recibe la etapa y renderiza las preguntas
4. Cada componente de vista maneja su estado local
5. Al cambiar una respuesta, se llama a `onAnswerChange(preguntaId, valor)`
6. `EtapaExecution` recopila todas las respuestas en un objeto
7. Al guardar, se envían las respuestas al backend

## Integración con Backend

### Endpoints Necesarios

- `GET /api/v1/workflows/{workflow_id}` - Obtener workflow con etapas
- `GET /api/v1/instancias/{instancia_id}` - Obtener instancia
- `POST /api/v1/instancias/{instancia_id}/respuestas` - Guardar respuestas
- `GET /api/v1/instancias/{instancia_id}/respuestas/{etapa_id}` - Obtener respuestas guardadas

## Estilos y Diseño

Todos los componentes siguen el diseño base:

- **Título de pregunta**: subtitle2, fontWeight 500, color #333
- **Asterisco obligatorio**: color #DC2626
- **Texto de ayuda**: caption, color #6B7280
- **Campos readonly**: backgroundColor #F9FAFB
- **Espaciado**: gap de 3 (24px) entre preguntas

## Testing

Para probar las vistas dinámicas:

1. Crear un workflow con diferentes tipos de preguntas
2. Navegar a `/flujos/{workflowId}/editar-figma`
3. Configurar las preguntas con diferentes tipos
4. Crear una instancia del workflow
5. Navegar a `/flujos/{workflowId}/instancias/{instanciaId}/etapa/{etapaId}`
6. Verificar que cada tipo de pregunta se renderiza correctamente

## Próximos Pasos

- [ ] Implementar guardado real de respuestas en backend
- [ ] Cargar respuestas previas al entrar a una etapa
- [ ] Validación de campos obligatorios antes de guardar
- [ ] Implementar lógica de mostrar_si (condicionales entre preguntas)
- [ ] Integrar con sistema de archivos para CARGA_ARCHIVO
- [ ] Conectar REVISION_OCR con servicio OCR del backend
- [ ] Cargar datos reales del caso para DATOS_CASO
