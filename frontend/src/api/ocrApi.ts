/**
 * API Client para el servicio OCR
 * Sistema de Trámites Migratorios de Panamá
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface OCRRequest {
  idioma?: string;
  prioridad?: 'alta' | 'normal' | 'baja';
  binarizar?: boolean;
  denoise?: boolean;
  mejorar_contraste?: boolean;
  deskew?: boolean;
  resize_factor?: number;
  extraer_datos_estructurados?: boolean;
  motivo_reprocesamiento?: string;
}

export interface OCRResponse {
  task_id: string;
  estado: string;
  mensaje: string;
  id_documento: number;
  tiempo_estimado_segundos?: number;
}

export interface OCRStatus {
  task_id: string;
  estado: 'PENDIENTE' | 'PROCESANDO' | 'COMPLETADO' | 'ERROR' | 'CANCELADO';
  porcentaje_completado: number;
  paso_actual?: number;
  total_pasos?: number;
  mensaje: string;
  id_documento?: number;
  id_ocr?: number;
  confianza_promedio?: number;
  tiempo_procesamiento_ms?: number;
  codigo_error?: string;
}

export interface OCRResultado {
  id_ocr: number;
  id_documento: number;
  estado_ocr: string;
  texto_extraido: string;
  texto_confianza: string | number; // Puede venir como string "83.53" o número
  idioma_detectado: string;
  num_caracteres: number;
  num_palabras: number;
  num_paginas: number;
  tiempo_procesamiento_ms: number;
  celery_task_id: string;
  intentos_procesamiento: number;
  fecha_inicio_proceso?: string;
  fecha_fin_proceso?: string;
  codigo_error?: string;
  mensaje_error?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  datos_estructurados?: string | Record<string, any>; // Puede venir como JSON string
}

export interface OCREstadisticas {
  total_procesados: number;
  total_completados: number;
  total_errores: number;
  total_procesando: number;
  total_pendientes: number;
  confianza_promedio?: number;
  tiempo_promedio_ms?: number;
  ultima_actualizacion?: string;
}

export interface HistorialItem {
  id_historial: number;
  fecha_proceso: string;
  texto_extraido: string;
  confianza: number;
  motivo_reprocesamiento: string;
  fecha_guardado_historial: string;
}

/**
 * Cliente API para el servicio OCR
 */
export const ocrApi = {
  /**
   * Procesa un documento con OCR
   */
  async procesarDocumento(
    idDocumento: number,
    userId: string,
    config?: OCRRequest
  ): Promise<OCRResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/ocr/procesar/${idDocumento}`,
      config || {},
      { params: { user_id: userId } }
    );
    return response.data;
  },

  /**
   * Consulta el estado de una tarea OCR
   */
  async consultarEstado(taskId: string): Promise<OCRStatus> {
    const response = await axios.get(`${API_BASE_URL}/ocr/status/${taskId}`);
    return response.data;
  },

  /**
   * Obtiene el resultado completo de un documento
   */
  async obtenerResultado(idDocumento: number): Promise<OCRResultado> {
    const response = await axios.get(`${API_BASE_URL}/ocr/resultado/${idDocumento}`);
    return response.data;
  },

  /**
   * Reprocesa un documento
   */
  async reprocesarDocumento(
    idDocumento: number,
    userId: string,
    config: OCRRequest,
    guardarHistorial: boolean = true
  ): Promise<OCRResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/ocr/reprocesar/${idDocumento}`,
      config,
      { params: { user_id: userId, guardar_historial: guardarHistorial } }
    );
    return response.data;
  },

  /**
   * Cancela una tarea en ejecución
   */
  async cancelarTarea(taskId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/ocr/cancelar/${taskId}`);
  },

  /**
   * Obtiene estadísticas del sistema
   */
  async obtenerEstadisticas(desdeCache: boolean = true): Promise<OCREstadisticas> {
    const response = await axios.get(`${API_BASE_URL}/ocr/estadisticas`, {
      params: { desde_cache: desdeCache }
    });
    return response.data;
  },

  /**
   * Obtiene el historial de reprocesamiento
   */
  async obtenerHistorial(idDocumento: number, limit: number = 10): Promise<HistorialItem[]> {
    const response = await axios.get(`${API_BASE_URL}/ocr/historial/${idDocumento}`, {
      params: { limit }
    });
    return response.data.historial || [];
  }
};
