/**
 * Hook para ejecutar etapas de un workflow
 */
import { useState, useCallback } from 'react';
import { workflowService } from '../services/workflow.service';

interface UseEtapaExecutionReturn {
  ejecutar: (
    instanciaId: number,
    etapaId: number,
    respuestas: Record<string, any>,
    archivos?: Record<string, any>
  ) => Promise<any>;
  loading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Hook para ejecutar una etapa del workflow
 */
export function useEtapaExecution(perfil?: string): UseEtapaExecutionReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const ejecutar = useCallback(
    async (
      instanciaId: number,
      etapaId: number,
      respuestas: Record<string, any>,
      archivos?: Record<string, any>
    ) => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const result = await workflowService.ejecutarEtapa(
          instanciaId,
          etapaId,
          respuestas,
          archivos,
          perfil
        );

        setSuccess(true);
        return result;
      } catch (err: any) {
        console.error('Error al ejecutar etapa:', err);
        const errorMsg = err.response?.data?.detail || err.message || 'Error al ejecutar la etapa';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [perfil]
  );

  return {
    ejecutar,
    loading,
    error,
    success,
  };
}
