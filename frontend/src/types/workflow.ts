/**
 * Tipos para el sistema de Workflows/Procesos dinámicos
 */

export type TipoEtapa = 'ETAPA' | 'COMPUERTA' | 'SUBPROCESO';
export type TipoPregunta = 
  | 'TEXTO' 
  | 'NUMERO' 
  | 'FECHA' 
  | 'SELECCION_SIMPLE' 
  | 'SELECCION_MULTIPLE' 
  | 'CARGA_ARCHIVO' 
  | 'SI_NO'
  | 'LISTA'
  | 'OPCIONES'
  | 'DESCARGA_ARCHIVOS'
  | 'DATOS_CASO'
  | 'REVISION_MANUAL_DOCUMENTOS'
  | 'REVISION_OCR'
  | 'SELECCION_FECHA'
  | 'IMPRESION'
  | 'FIRMA_DIGITAL'
  | 'PAGO'
  | 'NOTIFICACION';

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
}

export interface WorkflowPregunta {
  id?: number;
  etapa_id?: number;
  codigo: string;
  pregunta: string;
  texto: string;
  tipo_pregunta: TipoPregunta;
  tipo: TipoPregunta;
  orden: number;
  es_obligatoria: boolean;
  texto_ayuda?: string;
  ayuda?: string;
  valor_por_defecto?: string;
  opciones_json?: any;
  validaciones_json?: any;
  dependencias_json?: any;
  activo: boolean;
  es_visible: boolean;
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
