/**
 * Hook para manejar el estado del workflow de una instancia
 */
import { useState, useEffect, useCallback } from 'react';
import { workflowService } from '../services/workflow.service';

export interface WorkflowState {
  instancia_id: number;
  workflow_id: number;
  num_expediente: string;
  estado: string;
  etapa_actual: {
    id: number;
    codigo: string;
    nombre: string;
    tipo_etapa: string;
  } | null;
  etapas_completadas: number[];
  etapas_visibles: Array<{
    id: number;
    codigo: string;
    nombre: string;
    orden: number;
    tipo_etapa: string;
    completada: boolean;
    es_actual: boolean;
  }>;
  progreso: {
    total_etapas: number;
    completadas: number;
    porcentaje: number;
  };
  respuestas: Record<string, Record<string, any>>;
  fecha_inicio: string;
  fecha_estimada_fin: string | null;
  fecha_fin: string | null;
  creado_por: string;
  asignado_a: string | null;
}

interface UseWorkflowStateReturn {
  workflowState: WorkflowState | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener y gestionar el estado de un workflow
 */
export function useWorkflowState(
  instanciaId: number | null,
  perfil?: string
): UseWorkflowStateReturn {
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflowState = useCallback(async () => {
    if (!instanciaId) {
      setWorkflowState(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const state = await workflowService.getWorkflowState(instanciaId, perfil);
      setWorkflowState(state);
    } catch (err: any) {
      console.error('Error al obtener estado del workflow:', err);
      setError(err.message || 'Error al cargar el estado del workflow');
    } finally {
      setLoading(false);
    }
  }, [instanciaId, perfil]);

  useEffect(() => {
    fetchWorkflowState();
  }, [fetchWorkflowState]);

  return {
    workflowState,
    loading,
    error,
    refetch: fetchWorkflowState,
  };
}
