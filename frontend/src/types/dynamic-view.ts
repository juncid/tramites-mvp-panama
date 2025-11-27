/**
 * Tipos TypeScript para sistema de vistas dinámicas (MVP)
 * Sistema de Trámites Migratorios de Panamá
 * 
 * Define la estructura de configuraciones JSON para formularios
 * dinámicos en el sistema de workflow.
 * 
 * @author Sistema de Trámites MVP Panamá
 * @date 2025-11-13
 */

// Tipos de componentes soportados en MVP
export type TipoComponente = 
  | 'TEXTO'
  | 'NUMERO'
  | 'FECHA'
  | 'SELECT'
  | 'ARCHIVO'
  | 'RADIO'
  | 'CHECKBOX_LIST';

// Configuración de un componente individual
export interface Componente {
  tipo: TipoComponente;
  label: string;
  pregunta_id?: number;
  obligatorio?: boolean;
  config?: ConfigComponente;
}

// Configuración específica por tipo de componente
export interface ConfigComponente {
  // Para TEXTO
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  
  // Para NUMERO
  min?: number;
  max?: number;
  step?: number;
  
  // Para SELECT y RADIO
  opciones?: { valor: string | number; etiqueta: string }[];
  
  // Para ARCHIVO
  tipos_permitidos?: string[];
  max_size_mb?: number;
  max_archivos?: number;
  requiere_ocr?: boolean;
  
  // Para CHECKBOX_LIST
  items?: {
    id: string;
    label: string;
    disabled?: boolean;
    showIcon?: boolean;
    iconType?: 'download' | 'info';
  }[];
  showOcrColumn?: boolean;
}

// Sección que agrupa componentes
export interface Seccion {
  titulo: string;
  descripcion?: string;
  componentes: Componente[];
}

// Configuración completa de la vista
export interface ConfigJson {
  titulo?: string;
  descripcion?: string;
  secciones: Seccion[];
}

// Modelo completo de VistaConfig (coincide con backend)
export interface VistaConfig {
  id: number;
  etapa_id: number;
  config_json: ConfigJson;
  activo: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// DTOs para crear/actualizar
export interface VistaConfigCreate {
  etapa_id: number;
  config_json: ConfigJson;
}

export interface VistaConfigUpdate {
  config_json: ConfigJson;
}

// Estado del formulario renderizado
export interface FormData {
  [preguntaId: number]: any;
}

// Errores de validación
export interface FormErrors {
  [preguntaId: number]: string;
}
