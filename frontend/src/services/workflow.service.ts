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
      { params: { perfil } }
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
    perfil?: string
  ): Promise<any> {
    const params = perfil ? { perfil } : {};
    return apiClient.post<any>(
      `/workflow/instancias/${instanciaId}/etapas/${etapaId}/ejecutar`,
      { respuestas, archivos },
      { params }
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
    return apiClient.get<WorkflowInstancia[]>('/workflow/instancias', { params });
  },
};
