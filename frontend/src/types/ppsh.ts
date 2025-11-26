/**
 * Types para el sistema PPSH
 */

export type TipoSolicitud = 'INDIVIDUAL' | 'GRUPAL';
export type Prioridad = 'ALTA' | 'NORMAL' | 'BAJA';
export type TipoDocumentoIdentidad = 'PASAPORTE' | 'CEDULA' | 'OTRO';
export type EstadoVerificacion = 'PENDIENTE' | 'VERIFICADO' | 'RECHAZADO';

export interface CausaHumanitaria {
  cod_causa: number;
  nombre_causa: string;
  descripcion?: string;
  requiere_evidencia: boolean;
  activo: boolean;
  created_at: string;
}

export interface TipoDocumento {
  cod_tipo_doc: number;
  nombre_tipo: string;
  es_obligatorio: boolean;
  descripcion?: string;
  orden?: number;
  activo: boolean;
  created_at: string;
}

export interface Estado {
  cod_estado: number;
  nombre_estado: string;
  descripcion?: string;
  es_final: boolean;
  orden?: number;
  activo: boolean;
  created_at: string;
}

export interface Solicitante {
  id_solicitante: number;
  id_solicitud: number;
  nombre_completo: string;
  fecha_nacimiento?: string;
  nacionalidad?: string;
  sexo?: string;
  tipo_documento?: TipoDocumentoIdentidad;
  numero_documento?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  es_titular?: boolean;
  parentesco?: string;
  foto_url?: string;
  activo: boolean;
  created_at: string;
}

export interface OCRResultado {
  id_ocr: number;
  estado_ocr: 'PENDIENTE' | 'PROCESANDO' | 'COMPLETADO' | 'ERROR' | 'CANCELADO';
  texto_confianza?: number;
  idioma_detectado?: string;
  num_paginas?: number;
  datos_estructurados?: Record<string, any>;
  codigo_error?: string;
  mensaje_error?: string;
  fecha_procesamiento?: string;
}

export interface Documento {
  id_documento: number;
  id_solicitud: number;
  cod_tipo_documento: number;
  tipo_documento_texto?: string;
  nombre_archivo: string;
  extension?: string;
  tamano_bytes?: number;
  estado_verificacion: 'PENDIENTE' | 'VERIFICADO' | 'RECHAZADO';
  verificado_por?: string;
  fecha_verificacion?: string;
  uploaded_by: string;
  uploaded_at: string;
  created_at?: string;
  observaciones?: string;
  ocr_resultado?: OCRResultado | null;
  ocr_exitoso: boolean;
}

export interface Solicitud {
  id_solicitud: number;
  num_expediente?: string;
  tipo_solicitud: TipoSolicitud;
  cod_causa?: number;
  causa_humanitaria?: CausaHumanitaria;
  fecha_solicitud: string;
  estado_actual: string;
  prioridad: Prioridad;
  observaciones?: string;
  agencia?: string;
  user_id_asignado?: string;
  solicitantes: Solicitante[];
  documentos?: Documento[];
  created_at: string;
  updated_at?: string;
  
  // Integración con sistema de workflows
  workflow_instancia_id?: number;
}

export interface SolicitudListItem {
  id_solicitud: number;
  num_expediente?: string;
  tipo_solicitud: TipoSolicitud;
  fecha_solicitud: string;
  estado_actual: string;
  prioridad: Prioridad;
  nombre_titular?: string;
  total_personas: number;
  dias_transcurridos: number;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ==========================================
// HISTORIAL DE ESTADOS
// ==========================================

export interface EstadoHistorial {
  id_historial: number;
  id_solicitud: number;
  estado_anterior: string;
  estado_nuevo: string;
  fecha_cambio: string;
  user_id: string;
  observaciones?: string;
  es_dictamen: boolean;
  tipo_dictamen?: 'FAVORABLE' | 'DESFAVORABLE';
  dictamen_detalle?: string;
  dias_en_estado_anterior?: number;
  created_at: string;
}

export interface CambiarEstadoRequest {
  estado_nuevo: string;
  observaciones?: string;
  es_dictamen?: boolean;
  tipo_dictamen?: 'FAVORABLE' | 'DESFAVORABLE';
  dictamen_detalle?: string;
}

// ==========================================
// PERMISOS DE CAMBIO DE ESTADO
// ==========================================

/**
 * Permisos de cambio de estado por perfil (referencia cliente)
 * Debe mantenerse sincronizado con backend/app/services/services_ppsh.py
 */
export const PERMISOS_ESTADO_POR_PERFIL: Record<string, string[]> = {
  FUNCIONARIO: ['EN_REVISION', 'RESUELTO', 'SUBSANACION'],
  ANALISTA: ['EN_REVISION', 'EN_EVALUACION', 'RESUELTO', 'SUBSANACION'],
  JEFE: ['EN_REVISION', 'EN_EVALUACION', 'APROBADO', 'RECHAZADO', 'RESUELTO', 'SUBSANACION', 'CANCELADO'],
  DIRECTOR: ['EN_REVISION', 'EN_EVALUACION', 'APROBADO', 'RECHAZADO', 'RESUELTO', 'SUBSANACION', 'CANCELADO'],
  ADMIN: ['RECIBIDO', 'EN_REVISION', 'EN_EVALUACION', 'APROBADO', 'RECHAZADO', 'RESUELTO', 'SUBSANACION', 'CANCELADO'],
};

/**
 * Estados que requieren observaciones/motivo obligatorio (mínimo 10 caracteres)
 */
export const ESTADOS_REQUIEREN_MOTIVO: string[] = ['RECHAZADO', 'CANCELADO', 'SUBSANACION'];

/**
 * Verifica si un perfil puede asignar un estado específico
 */
export function puedeAsignarEstado(perfil: string, estadoNuevo: string): boolean {
  const estadosPermitidos = PERMISOS_ESTADO_POR_PERFIL[perfil] || [];
  return estadosPermitidos.includes(estadoNuevo);
}

/**
 * Verifica si un estado requiere motivo obligatorio
 */
export function requiereMotivo(estadoNuevo: string): boolean {
  return ESTADOS_REQUIEREN_MOTIVO.includes(estadoNuevo);
}
