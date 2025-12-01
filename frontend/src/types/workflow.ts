/**
 * Tipos para el sistema de Workflows/Procesos dinámicos
 */

export type TipoEtapa = 'ETAPA' | 'COMPUERTA' | 'SUBPROCESO' | 'PRESENCIAL' | 'FIN' | 'TERMINO' | 'FORMULARIO';
// Tipos de pregunta - deben coincidir exactamente con TipoPregunta enum del backend
export type TipoPregunta = 
  | 'RESPUESTA_TEXTO'      // Respuesta de texto corta
  | 'RESPUESTA_LARGA'      // Respuesta de texto larga (textarea)
  | 'LISTA'                // Lista de opciones
  | 'OPCIONES'             // Selección de opciones (radio/checkbox)
  | 'DOCUMENTOS'           // Carga de múltiples documentos
  | 'CARGA_ARCHIVO'        // Carga de archivo
  | 'DESCARGA_ARCHIVO'     // Descarga de archivo
  | 'DATOS_CASO'           // Datos del caso (read-only)
  | 'REVISION_MANUAL_DOCUMENTOS'  // Revisión manual de documentos
  | 'REVISION_OCR'         // Revisión OCR
  | 'IMPRESION'            // Impresión
  | 'IMPRESION_LISTA_CASOS' // Impresión lista de casos (selección de solicitudes)
  | 'SELECCION_FECHA'      // Selección de fecha
  // Additional types used in editor
  | 'NUMERO'               // Número
  | 'SELECCION_MULTIPLE'   // Selección múltiple
  | 'FIRMA_DIGITAL'        // Firma digital
  | 'PAGO'                 // Pago
  | 'NOTIFICACION'         // Notificación
  | 'SELECCIONAR';         // Placeholder type for editor

export type EstadoWorkflow = 'BORRADOR' | 'ACTIVO' | 'INACTIVO' | 'ARCHIVADO';

export interface Workflow {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  estado: EstadoWorkflow;
  categoria?: string;
  color_hex?: string;
  version: number;
  perfiles_creadores: string[];
  activo: boolean;
  created_at: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  etapas?: WorkflowEtapa[];
  conexiones?: WorkflowConexion[];
}

export interface WorkflowEtapa {
  id?: number;
  workflow_id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo_etapa: TipoEtapa;
  orden: number;
  posicion_x?: number;
  posicion_y?: number;
  perfiles_permitidos: string[];
  titulo_formulario?: string;
  bajada_formulario?: string;
  descripcion_formulario?: string;
  es_etapa_inicial: boolean;
  es_etapa_final: boolean;
  es_inicial?: boolean;
  requiere_validacion: boolean;
  permite_edicion_posterior: boolean;
  tiempo_estimado_minutos?: number;
  reglas_transicion?: any;
  activo: boolean;
  preguntas?: WorkflowPregunta[];
  // Campos específicos para tipo PRESENCIAL
  descripcion_presencial?: string;
  documento_presencial?: string;
}

export interface WorkflowPregunta {
  id?: number;
  etapa_id?: number;
  codigo: string;
  pregunta: string;
  texto: string;
  texto_pregunta?: string;  // Alias for backward compatibility
  tipo_pregunta: TipoPregunta;
  tipo: TipoPregunta;
  orden: number;
  es_obligatoria: boolean;
  requerido?: boolean;  // Alias for backward compatibility
  texto_ayuda?: string;
  ayuda?: string;
  valor_por_defecto?: string;
  opciones_json?: any;
  validaciones_json?: any;
  dependencias_json?: any;
  activo: boolean;
  es_visible: boolean;
  // Campos específicos para TEXTO
  min_caracteres?: number;
  max_caracteres?: number;
  // Campos específicos para LISTA
  opciones?: string;
  lista_elementos?: string[];
  // Campos específicos para SELECCION_SIMPLE
  permite_multiple?: boolean;
  // Campos específicos para CARGA_ARCHIVO
  max_archivos?: number;
  max_size_mb?: number;
  requiere_ocr?: boolean;  // Si requiere procesamiento OCR automático
  // Campos específicos para DATOS_CASO
  campos_caso?: string[];
  opciones_datos_caso?: string[];  // Opciones de datos del caso para mostrar
  // Campos específicos para REVISION_OCR y REVISION_MANUAL_DOCUMENTOS
  etapa_origen_id?: string;
  // Campos específicos para FECHA
  agenda_origen_id?: string;
  // Campos adicionales usados en editor
  placeholder?: string;
  descripcion?: string;
  extensiones_permitidas?: string[];
  tamano_maximo_mb?: number;
}

export interface WorkflowConexion {
  id?: number;
  workflow_id?: number;
  etapa_origen_id: number;
  etapa_destino_id: number;
  nombre?: string;
  tipo_conexion?: string;
  condicion?: any;
  es_predeterminada: boolean;
  activo: boolean;
}

export interface WorkflowCreate {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  color_hex?: string;
  perfiles_creadores: string[];
  etapas?: WorkflowEtapa[];
  conexiones?: Omit<WorkflowConexion, 'workflow_id'>[];
}

export interface WorkflowUpdate {
  nombre?: string;
  descripcion?: string;
  estado?: EstadoWorkflow;
  categoria?: string;
  color_hex?: string;
  perfiles_creadores?: string[];
}

// Para el editor visual
export interface NodePosition {
  x: number;
  y: number;
}

export interface WorkflowNode extends WorkflowEtapa {
  position: NodePosition;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

// Tipos para instancias de workflow (ejecución)
export type EstadoInstancia = 
  | 'PENDIENTE' 
  | 'EN_PROGRESO' 
  | 'COMPLETADA' 
  | 'RECHAZADA' 
  | 'CANCELADA';

export interface WorkflowInstancia {
  id: number;
  workflow_id: number;
  workflow?: Workflow;
  codigo_referencia: string;
  estado: EstadoInstancia;
  etapa_actual_id?: number;
  etapa_actual?: WorkflowEtapa;
  datos_contexto?: any;
  fecha_inicio: string;
  fecha_finalizacion?: string;
  usuario_id?: string;
  activo: boolean;
  created_at: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface WorkflowRespuesta {
  id: number;
  instancia_id: number;
  etapa_id: number;
  pregunta_id?: number;
  campo_id?: string; // Para vistas dinámicas
  valor_texto?: string;
  valor_numero?: number;
  valor_fecha?: string;
  valor_booleano?: boolean;
  valor_json?: any;
  archivos?: any[];
  created_at: string;
  created_by?: string;
}

export interface TransicionRequest {
  etapa_destino_id: number;
  respuestas: RespuestaFormulario[];
  comentario?: string;
}

export interface RespuestaFormulario {
  pregunta_id?: number;
  campo_id?: string;
  valor_texto?: string;
  valor_numero?: number;
  valor_fecha?: string;
  valor_booleano?: boolean;
  valor_json?: any;
  archivos?: any[];
}
