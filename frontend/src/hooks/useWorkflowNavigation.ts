/**
 * Hook para navegación en workflows PPSH
 * 
 * Proporciona funciones de navegación consistentes
 * entre las diferentes vistas del workflow
 */
import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export interface UseWorkflowNavigationResult {
  /**
   * Ruta base calculada (/solicitudes/:id o /workflows/:id)
   */
  basePath: string;
  
  /**
   * Navega a una etapa específica
   * @param etapaPath - Ruta de la etapa (ej: 'descarga-requisitos')
   * @param readonly - Si debe abrirse en modo solo lectura
   */
  navigateToEtapa: (etapaPath: string, readonly?: boolean) => void;
  
  /**
   * Navega a la lista de etapas
   */
  navigateToEtapas: () => void;
  
  /**
   * Navega a la vista de ejecución dinámica
   * @param etapaId - ID de la etapa
   * @param readonly - Si debe abrirse en modo solo lectura
   */
  navigateToExecution: (etapaId: number, readonly?: boolean) => void;
  
  /**
   * Navega hacia atrás en el historial
   */
  goBack: () => void;
}

/**
 * Hook que centraliza la lógica de navegación del workflow
 */
export function useWorkflowNavigation(workflowInstanciaId?: number | null): UseWorkflowNavigationResult {
  const navigate = useNavigate();
  const { id: solicitudId, instanciaId } = useParams<{ id?: string; instanciaId?: string }>();
  
  // Calcular basePath
  const basePath = useMemo(() => {
    const baseParam = solicitudId || instanciaId || workflowInstanciaId;
    return solicitudId ? `/solicitudes/${solicitudId}` : `/workflows/${baseParam}`;
  }, [solicitudId, instanciaId, workflowInstanciaId]);
  
  /**
   * Navega a una etapa específica
   */
  const navigateToEtapa = useCallback((etapaPath: string, readonly = false) => {
    const queryParam = readonly ? '?readonly=true' : '';
    navigate(`${basePath}/${etapaPath}${queryParam}`);
  }, [navigate, basePath]);
  
  /**
   * Navega a la lista de etapas
   */
  const navigateToEtapas = useCallback(() => {
    navigate(`${basePath}/etapas`);
  }, [navigate, basePath]);
  
  /**
   * Navega a la vista de ejecución dinámica
   */
  const navigateToExecution = useCallback((etapaId: number, readonly = false) => {
    const queryParam = readonly ? '&readonly=true' : '';
    navigate(`${basePath}/execution?etapa=${etapaId}${queryParam}`);
  }, [navigate, basePath]);
  
  /**
   * Navega hacia atrás
   */
  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  
  return {
    basePath,
    navigateToEtapa,
    navigateToEtapas,
    navigateToExecution,
    goBack,
  };
}

export default useWorkflowNavigation;
