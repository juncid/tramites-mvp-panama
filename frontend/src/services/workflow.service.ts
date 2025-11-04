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
};
