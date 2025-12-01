/**
 * Servicio para interactuar con la API de Workflows
 */
import { apiClient } from './api';
import type {
  Workflow,
  WorkflowCreate,
  WorkflowUpdate,
  WorkflowEtapa,
  WorkflowPregunta,
  WorkflowConexion,
  WorkflowInstancia,
  TransicionRequest,
  WorkflowRespuesta,
} from '../types/workflow';

// Tipos para historial de cambios del workflow
export interface WorkflowCambioDetalles {
  etapa_nombre?: string;
  campo_modificado?: string;
  valor_anterior?: string;
  valor_nuevo?: string;
}

export interface WorkflowCambio {
  id: number;
  workflow_id: number;
  tipo_cambio: string;
  accion: string;
  descripcion?: string;
  etapa_id?: number;
  etapa_codigo?: string;
  etapa_nombre?: string;
  campo_modificado?: string;
  valor_anterior?: string;
  valor_nuevo?: string;
  datos_adicionales?: Record<string, any>;
  created_at: string;
  created_by: string;
  created_by_nombre?: string;
  detalles?: WorkflowCambioDetalles;
}

export interface WorkflowCambioCreate {
  tipo_cambio: string;
  accion: string;
  descripcion?: string;
  etapa_id?: number;
  etapa_codigo?: string;
  etapa_nombre?: string;
  campo_modificado?: string;
  valor_anterior?: string;
  valor_nuevo?: string;
  datos_adicionales?: Record<string, any>;
}

export const workflowService = {
  /**
   * Listar todos los workflows
   */
  async getWorkflows(): Promise<Workflow[]> {
    return apiClient.get<Workflow[]>('/workflow/workflows');
  },

  /**
   * Obtener un workflow por ID
   */
  async getWorkflow(id: number): Promise<Workflow> {
    return apiClient.get<Workflow>(`/workflow/workflows/${id}`);
  },

  /**
   * Crear un nuevo workflow
   */
  async createWorkflow(data: WorkflowCreate): Promise<Workflow> {
    return apiClient.post<Workflow>('/workflow/workflows', data);
  },

  /**
   * Actualizar un workflow existente
   */
  async updateWorkflow(id: number, data: WorkflowUpdate): Promise<Workflow> {
    return apiClient.put<Workflow>(`/workflow/workflows/${id}`, data);
  },

  /**
   * Eliminar un workflow
   */
  async deleteWorkflow(id: number): Promise<void> {
    return apiClient.delete(`/workflow/workflows/${id}`);
  },

  /**
   * Crear una etapa
   */
  async createEtapa(data: Partial<WorkflowEtapa>): Promise<WorkflowEtapa> {
    return apiClient.post<WorkflowEtapa>('/workflow/etapas', data);
  },

  /**
   * Actualizar una etapa
   */
  async updateEtapa(id: number, data: Partial<WorkflowEtapa>): Promise<WorkflowEtapa> {
    return apiClient.put<WorkflowEtapa>(`/workflow/etapas/${id}`, data);
  },

  /**
   * Eliminar una etapa
   */
  async deleteEtapa(id: number): Promise<void> {
    return apiClient.delete(`/workflow/etapas/${id}`);
  },

  /**
   * Crear una pregunta
   */
  async createPregunta(data: Partial<WorkflowPregunta>): Promise<WorkflowPregunta> {
    return apiClient.post<WorkflowPregunta>('/workflow/preguntas', data);
  },

  /**
   * Actualizar una pregunta
   */
  async updatePregunta(id: number, data: Partial<WorkflowPregunta>): Promise<WorkflowPregunta> {
    return apiClient.put<WorkflowPregunta>(`/workflow/preguntas/${id}`, data);
  },

  /**
   * Eliminar una pregunta
   */
  async deletePregunta(id: number): Promise<void> {
    return apiClient.delete(`/workflow/preguntas/${id}`);
  },

  /**
   * Crear una conexión entre etapas
   */
  async createConexion(data: Partial<WorkflowConexion>): Promise<WorkflowConexion> {
    return apiClient.post<WorkflowConexion>('/workflow/conexiones', data);
  },

  /**
   * Actualizar una conexión
   */
  async updateConexion(id: number, data: Partial<WorkflowConexion>): Promise<WorkflowConexion> {
    return apiClient.put<WorkflowConexion>(`/workflow/conexiones/${id}`, data);
  },

  /**
   * Eliminar una conexión
   */
  async deleteConexion(id: number): Promise<void> {
    return apiClient.delete(`/workflow/conexiones/${id}`);
  },

  // ==========================================
  // MÉTODOS DE INSTANCIAS (EJECUCIÓN)
  // ==========================================

  /**
   * Obtener una instancia por ID
   */
  async getInstancia(id: number): Promise<WorkflowInstancia> {
    return apiClient.get<WorkflowInstancia>(`/workflow/instancias/${id}`);
  },

  /**
   * Crear una nueva instancia de workflow
   */
  async createInstancia(workflowId: number, data?: any): Promise<WorkflowInstancia> {
    return apiClient.post<WorkflowInstancia>('/workflow/instancias', {
      workflow_id: workflowId,
      datos_contexto: data,
    });
  },

  /**
   * Transicionar instancia a siguiente etapa
   */
  async transicionarInstancia(
    instanciaId: number,
    data: TransicionRequest
  ): Promise<WorkflowInstancia> {
    return apiClient.post<WorkflowInstancia>(
      `/workflow/instancias/${instanciaId}/transicionar`,
      data
    );
  },

  /**
   * Obtener respuestas de una etapa
   */
  async getRespuestas(
    instanciaId: number,
    etapaId?: number
  ): Promise<WorkflowRespuesta[]> {
    const params = etapaId ? { etapa_id: etapaId } : {};
    return apiClient.get<WorkflowRespuesta[]>(
      `/workflow/instancias/${instanciaId}/respuestas`,
      { params }
    );
  },

  /**
   * Obtener una etapa por ID
   */
  async getEtapa(id: number): Promise<WorkflowEtapa> {
    return apiClient.get<WorkflowEtapa>(`/workflow/etapas/${id}`);
  },

  // ==========================================
  // MÉTODOS PARA EJECUCIÓN POR USUARIO
  // ==========================================

  /**
   * Obtener etapas de un workflow filtradas por perfil de usuario
   */
  async getEtapasByPerfil(workflowId: number, perfil: string): Promise<WorkflowEtapa[]> {
    return apiClient.get<WorkflowEtapa[]>(
      `/workflow/workflows/${workflowId}/etapas/by-perfil`,
      { perfil }
    );
  },

  /**
   * Obtener estado completo del workflow para una instancia
   */
  async getWorkflowState(instanciaId: number, perfil?: string): Promise<any> {
    const params = perfil ? { perfil } : {};
    return apiClient.get<any>(
      `/workflow/instancias/${instanciaId}/workflow-state`,
      { params }
    );
  },

  /**
   * Ejecutar una etapa del workflow
   */
  async ejecutarEtapa(
    instanciaId: number,
    etapaId: number,
    respuestas: Record<string, any>,
    archivos?: Record<string, any>,
    perfil?: string,
    accessToken?: string
  ): Promise<any> {
    const params = perfil ? { perfil } : {};
    const headers = accessToken ? { 'X-Access-Token': accessToken } : undefined;
    return apiClient.post<any>(
      `/workflow/instancias/${instanciaId}/etapas/${etapaId}/ejecutar`,
      { respuestas, archivos },
      { params, headers }
    );
  },

  /**
   * Listar instancias de workflows (mis trámites)
   */
  async getInstancias(params?: {
    workflow_id?: number;
    estado?: string;
    creado_por?: string;
    asignado_a?: string;
    skip?: number;
    limit?: number;
  }): Promise<WorkflowInstancia[]> {
    return apiClient.get<WorkflowInstancia[]>('/workflow/instancias', params);
  },

  // ==========================================
  // MÉTODOS DE INTEGRACIÓN WORKFLOW-PPSH
  // ==========================================

  /**
   * Crear instancia de workflow con solicitud PPSH integrada
   */
  async createInstanciaConPPSH(data: {
    workflow_id: number;
    nombre_instancia?: string;
    solicitud_ppsh: any;
  }): Promise<any> {
    return apiClient.post<any>('/workflow/instancias/crear-con-ppsh', data);
  },

  /**
   * Vincular solicitud PPSH existente a workflow
   */
  async vincularPPSHExistente(data: {
    workflow_id: number;
    solicitud_id: number;
    nombre_instancia?: string;
  }): Promise<any> {
    return apiClient.post<any>('/workflow/instancias/vincular-ppsh-existente', data);
  },

  /**
   * Obtener datos de vinculación PPSH de una instancia
   */
  async getVinculacionPPSH(instanciaId: number, expanded: boolean = false): Promise<any> {
    return apiClient.get<any>(`/workflow/instancias/${instanciaId}/vinculacion-ppsh`, {
      expanded
    });
  },

  // ==========================================
  // MÉTODOS DE HISTORIAL DE CAMBIOS DEL WORKFLOW
  // ==========================================

  /**
   * Obtener historial de cambios de un workflow (plantilla)
   * Retorna los cambios ordenados del más reciente al más antiguo
   */
  async getWorkflowHistorialCambios(
    workflowId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<WorkflowCambio[]> {
    return apiClient.get<WorkflowCambio[]>(
      `/workflow/workflows/${workflowId}/historial-cambios`,
      { limit, offset }
    );
  },

  /**
   * Registrar un cambio en el historial del workflow
   */
  async registrarCambioWorkflow(
    workflowId: number,
    cambio: WorkflowCambioCreate
  ): Promise<WorkflowCambio> {
    return apiClient.post<WorkflowCambio>(
      `/workflow/workflows/${workflowId}/historial-cambios`,
      cambio
    );
  },

  // ==========================================
  // MÉTODOS DE PERMISOS Y VISTAS DINÁMICAS
  // ==========================================

  /**
   * Obtener historial de una instancia
   */
  async getHistorial(instanciaId: number): Promise<any[]> {
    return apiClient.get<any[]>(`/workflow/instancias/${instanciaId}/historial`);
  },

  /**
   * Obtener vista de etapa actual filtrada por permisos del usuario
   */
  async getVistaActual(
    instanciaId: number,
    userPerfil: string = 'FUNCIONARIO',
    accessToken?: string
  ): Promise<any> {
    const headers = accessToken ? { 'X-Access-Token': accessToken } : undefined;
    return apiClient.get<any>(
      `/workflow/instancias/${instanciaId}/vista-actual`,
      { user_perfil: userPerfil },
      headers
    );
  },

  /**
   * Obtener vista de una etapa específica (para modo readonly/historial)
   */
  async getVistaEtapa(
    instanciaId: number,
    etapaId: number,
    userPerfil: string = 'FUNCIONARIO',
    accessToken?: string
  ): Promise<any> {
    const headers = accessToken ? { 'X-Access-Token': accessToken } : undefined;
    return apiClient.get<any>(
      `/workflow/instancias/${instanciaId}/vista-etapa/${etapaId}`,
      { user_perfil: userPerfil },
      headers
    );
  },

  /**
   * Verificar permisos de usuario para una etapa
   */
  async verificarPermisos(
    instanciaId: number,
    userPerfil: string = 'FUNCIONARIO',
    etapaId?: number
  ): Promise<{
    puede_ver: boolean;
    puede_editar: boolean;
    etapa_id: number;
    etapa_codigo: string;
    etapa_nombre: string;
    es_etapa_actual: boolean;
    perfil_usuario: string;
    perfiles_permitidos: string[];
    razon: string;
  }> {
    const params: any = { user_perfil: userPerfil };
    if (etapaId) {
      params.etapa_id = etapaId;
    }
    return apiClient.get<any>(`/workflow/instancias/${instanciaId}/verificar-permisos`, params);
  },

  /**
   * Guardar respuestas de etapa actual (sin completar)
   * Nota: El backend no tiene endpoint de guardar borrador, 
   * por ahora retornamos una promesa resuelta
   */
  async guardarRespuestasEtapa(
    instanciaId: number,
    respuestas: Record<string, any>
  ): Promise<any> {
    // TODO: Implementar endpoint de guardar borrador en backend
    console.warn('guardarRespuestasEtapa: No hay endpoint de guardar borrador implementado');
    return Promise.resolve({ success: true, message: 'Función de guardar borrador no implementada aún' });
  },

  /**
   * Completar etapa actual y avanzar
   */
  async completarEtapa(
    instanciaId: number,
    etapaId: number,
    respuestas: Record<string, any>,
    userPerfil: string = 'ADMIN',
    archivos?: Record<string, any>,
    accessToken?: string
  ): Promise<any> {
    const headers = accessToken ? { 'X-Access-Token': accessToken } : undefined;
    return apiClient.post<any>(
      `/workflow/instancias/${instanciaId}/etapas/${etapaId}/ejecutar?perfil=${userPerfil}`,
      {
        respuestas,
        archivos: archivos || {}
      },
      { headers }
    );
  },

  /**
   * Subir documento relacionado con una etapa de workflow
   * Usa el endpoint de PPSH para almacenar el archivo y vincularlo con la solicitud
   */
  async subirDocumentoEtapa(
    solicitudId: number,
    file: File,
    data?: {
      cod_tipo_documento?: number;
      tipo_documento_texto?: string;
      observaciones?: string;
    }
  ): Promise<any> {
    return apiClient.uploadFile<any>(
      `/ppsh/solicitudes/${solicitudId}/documentos`,
      file,
      data,
      'archivo'
    );
  },

  /**
   * Validar datos OCR contra los datos del solicitante
   * Compara los datos extraídos del documento con los datos ingresados en el formulario
   */
  async validarOCR(
    solicitudId: number,
    idDocumento: number
  ): Promise<{
    validacion_exitosa: boolean;
    campos_validados: Record<string, string>;
    campos_no_encontrados: string[];
    campos_con_discrepancia: Array<{
      campo: string;
      valor_ingresado: string;
      valor_ocr: string;
    }>;
    mensaje: string;
    puede_continuar: boolean;
    datos_ocr_raw?: Record<string, any>;
    texto_ocr_completo?: string;
  }> {
    return apiClient.post<any>(
      `/ppsh/solicitudes/${solicitudId}/validar-ocr`,
      { id_documento: idDocumento }
    );
  },
};
