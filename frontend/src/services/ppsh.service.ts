/**
 * PPSH Service
 * Servicio para interactuar con endpoints de solicitudes PPSH
 */

import { apiClient } from './api';
import type {
  Solicitud,
  SolicitudListItem,
  PaginatedResponse,
  CausaHumanitaria,
  TipoDocumento,
  Estado,
  Documento,
  EstadoHistorial,
} from '../types/ppsh';

export const ppshService = {
  // ==========================================
  // CATÁLOGOS
  // ==========================================

  /**
   * Obtener causas humanitarias
   */
  async getCausasHumanitarias(activosSolo: boolean = true): Promise<CausaHumanitaria[]> {
    return apiClient.get<CausaHumanitaria[]>('/ppsh/catalogos/causas-humanitarias', {
      activos_solo: activosSolo,
    });
  },

  /**
   * Obtener tipos de documento
   */
  async getTiposDocumento(activosSolo: boolean = true): Promise<TipoDocumento[]> {
    return apiClient.get<TipoDocumento[]>('/ppsh/catalogos/tipos-documento', {
      activos_solo: activosSolo,
    });
  },

  /**
   * Obtener estados del proceso
   */
  async getEstados(activosSolo: boolean = true): Promise<Estado[]> {
    return apiClient.get<Estado[]>('/ppsh/catalogos/estados', {
      activos_solo: activosSolo,
    });
  },

  // ==========================================
  // SOLICITUDES
  // ==========================================

  /**
   * Listar solicitudes con paginación
   */
  async listarSolicitudes(params?: {
    page?: number;
    page_size?: number;
    estado?: string;
    prioridad?: string;
    buscar?: string;
  }): Promise<PaginatedResponse<SolicitudListItem>> {
    return apiClient.get<PaginatedResponse<SolicitudListItem>>('/ppsh/solicitudes', params);
  },

  /**
   * Obtener detalle de una solicitud
   */
  async getSolicitud(idSolicitud: number): Promise<Solicitud> {
    return apiClient.get<Solicitud>(`/ppsh/solicitudes/${idSolicitud}`);
  },

  /**
   * Crear nueva solicitud
   */
  async crearSolicitud(data: any): Promise<Solicitud> {
    return apiClient.post<Solicitud>('/ppsh/solicitudes', data);
  },

  /**
   * Actualizar solicitud
   */
  async actualizarSolicitud(idSolicitud: number, data: any): Promise<Solicitud> {
    return apiClient.put<Solicitud>(`/ppsh/solicitudes/${idSolicitud}`, data);
  },

  // ==========================================
  // DOCUMENTOS
  // ==========================================

  /**
   * Subir documento a una solicitud
   */
  async subirDocumento(
    idSolicitud: number,
    file: File,
    data?: {
      cod_tipo_documento?: number;
      tipo_documento_texto?: string;
      observaciones?: string;
    }
  ): Promise<Documento> {
    return apiClient.uploadFile<Documento>(
      `/ppsh/solicitudes/${idSolicitud}/documentos`,
      file,
      data
    );
  },

  /**
   * Listar documentos de una solicitud
   */
  async getDocumentos(idSolicitud: number): Promise<Documento[]> {
    return apiClient.get<Documento[]>(`/ppsh/solicitudes/${idSolicitud}/documentos`);
  },

  /**
   * Actualizar estado OCR de múltiples documentos
   */
  async actualizarOCRDocumentos(
    idSolicitud: number,
    documentos: Array<{ id_documento: number; ocr_exitoso: boolean }>
  ): Promise<{ 
    message: string; 
    documentos_actualizados: number;
    revision_ocr_completada: boolean;
    total_documentos: number;
    documentos_con_ocr: number;
  }> {
    return apiClient.patch<{ 
      message: string; 
      documentos_actualizados: number;
      revision_ocr_completada: boolean;
      total_documentos: number;
      documentos_con_ocr: number;
    }>(
      `/ppsh/solicitudes/${idSolicitud}/documentos/ocr`,
      { documentos }
    );
  },

  /**
   * Obtener etapas de una solicitud
   */
  async getEtapasSolicitud(idSolicitud: number): Promise<Array<{
    id_etapa_solicitud: number;
    id_solicitud: number;
    codigo_etapa: string;
    nombre_etapa: string;
    descripcion: string | null;
    estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO';
    orden: number;
    fecha_inicio: string | null;
    fecha_completado: string | null;
    completado_por: string | null;
    observaciones: string | null;
    created_at: string;
    updated_at: string | null;
  }>> {
    return apiClient.get<Array<any>>(`/ppsh/solicitudes/${idSolicitud}/etapas`);
  },

  async actualizarVerificacionDocumento(
    idDocumento: number,
    data: {
      estado_verificacion: 'VERIFICADO' | 'RECHAZADO';
      observaciones?: string;
    }
  ): Promise<Documento> {
    return apiClient.patch<Documento>(
      `/ppsh/documentos/${idDocumento}/verificacion`,
      data
    );
  },

  // ==========================================
  // CAMBIO DE ESTADO
  // ==========================================

  /**
   * Cambiar estado de una solicitud
   * Requiere permisos según perfil del usuario:
   * - FUNCIONARIO/ANALISTA: EN_REVISION, RESUELTO, SUBSANACION
   * - JEFE/DIRECTOR: APROBADO, RECHAZADO, CANCELADO
   * - ADMIN: Cualquier estado
   */
  async cambiarEstado(
    idSolicitud: number,
    data: {
      estado_nuevo: string;
      observaciones?: string;
      es_dictamen?: boolean;
      tipo_dictamen?: 'FAVORABLE' | 'DESFAVORABLE';
      dictamen_detalle?: string;
    }
  ): Promise<Solicitud> {
    return apiClient.post<Solicitud>(
      `/ppsh/solicitudes/${idSolicitud}/cambiar-estado`,
      data
    );
  },

  /**
   * Obtener historial de estados de una solicitud
   */
  async getHistorialEstados(idSolicitud: number): Promise<EstadoHistorial[]> {
    return apiClient.get<EstadoHistorial[]>(
      `/ppsh/solicitudes/${idSolicitud}/historial`
    );
  },

  /**
   * Obtener estados disponibles para cambio según perfil
   * Filtra estados según permisos del perfil (validación cliente-side)
   */
  async getEstadosDisponibles(perfil: string): Promise<Estado[]> {
    const estados = await this.getEstados(true);
    
    // Permisos por perfil (debe coincidir con backend)
    const permisosCliente: Record<string, string[]> = {
      FUNCIONARIO: ['EN_REVISION', 'RESUELTO', 'SUBSANACION'],
      ANALISTA: ['EN_REVISION', 'EN_EVALUACION', 'RESUELTO', 'SUBSANACION'],
      JEFE: ['EN_REVISION', 'EN_EVALUACION', 'APROBADO', 'RECHAZADO', 'RESUELTO', 'SUBSANACION', 'CANCELADO'],
      DIRECTOR: ['EN_REVISION', 'EN_EVALUACION', 'APROBADO', 'RECHAZADO', 'RESUELTO', 'SUBSANACION', 'CANCELADO'],
      ADMIN: ['RECIBIDO', 'EN_REVISION', 'EN_EVALUACION', 'APROBADO', 'RECHAZADO', 'RESUELTO', 'SUBSANACION', 'CANCELADO'],
    };
    
    const estadosPermitidos = permisosCliente[perfil] || [];
    
    // Si es ADMIN, retornar todos los estados
    if (perfil === 'ADMIN') {
      return estados;
    }
    
    return estados.filter(e => 
      estadosPermitidos.includes(e.nombre_estado)
    );
  },
};
