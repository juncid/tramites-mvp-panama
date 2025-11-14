/**
 * Servicio para gestión de configuraciones de vistas dinámicas
 * Sistema de Trámites Migratorios de Panamá
 * 
 * Maneja las llamadas a la API REST para CRUD de configuraciones
 * de vistas dinámicas.
 * 
 * @author Sistema de Trámites MVP Panamá
 * @date 2025-11-13
 */

import axios from 'axios';
import type { VistaConfig, VistaConfigCreate, VistaConfigUpdate } from '../types/dynamic-view';

const API_BASE = '/api/v1/workflow';

class VistaConfigService {
  
  /**
   * Obtener configuración de vista por ID de etapa.
   * Retorna null si no existe configuración (usar vista por defecto).
   * 
   * @param etapaId - ID de la etapa de workflow
   * @returns VistaConfig o null
   */
  async getByEtapaId(etapaId: number): Promise<VistaConfig | null> {
    try {
      const response = await axios.get<VistaConfig>(`${API_BASE}/etapas/${etapaId}/vista-config`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Crear nueva configuración de vista.
   * 
   * @param data - Datos de la nueva configuración
   * @returns VistaConfig creado
   */
  async create(data: VistaConfigCreate): Promise<VistaConfig> {
    const response = await axios.post<VistaConfig>(`${API_BASE}/vistas-config`, data);
    return response.data;
  }

  /**
   * Actualizar configuración existente.
   * 
   * @param id - ID de la configuración a actualizar
   * @param data - Nuevos datos de la configuración
   * @returns VistaConfig actualizado
   */
  async update(id: number, data: VistaConfigUpdate): Promise<VistaConfig> {
    const response = await axios.put<VistaConfig>(`${API_BASE}/vistas-config/${id}`, data);
    return response.data;
  }

  /**
   * Eliminar configuración.
   * 
   * @param id - ID de la configuración a eliminar
   */
  async delete(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/vistas-config/${id}`);
  }

  /**
   * Crear o actualizar configuración para una etapa.
   * Helper que decide automáticamente si crear o actualizar.
   * 
   * @param etapaId - ID de la etapa
   * @param configJson - Configuración JSON
   * @returns VistaConfig creado o actualizado
   */
  async createOrUpdate(etapaId: number, configJson: any): Promise<VistaConfig> {
    // Primero intentar obtener config existente
    const existing = await this.getByEtapaId(etapaId);
    
    if (existing) {
      // Ya existe, actualizar
      return this.update(existing.id, { config_json: configJson });
    } else {
      // No existe, crear nueva
      return this.create({ etapa_id: etapaId, config_json: configJson });
    }
  }
}

// Exportar instancia singleton
export const vistaConfigService = new VistaConfigService();
export default vistaConfigService;
