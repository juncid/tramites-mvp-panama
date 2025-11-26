/**
 * Hook principal para manejo de etapas de workflow PPSH
 * 
 * Centraliza toda la lógica repetida en las vistas:
 * - Carga de instancia de workflow
 * - Obtención de etapa actual
 * - Navegación
 * - Guardado de respuestas
 * - Manejo de estados (loading, error, readonly)
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { workflowService } from '../services/workflow.service';
import { ppshService } from '../services/ppsh.service';
import { useAuth } from '../context/AuthContext';

export interface UseWorkflowEtapaOptions {
  /**
   * Callback ejecutado después de guardar exitosamente
   */
  onSuccess?: () => void;
  /**
   * Función de validación antes de guardar
   * Retorna null si es válido, o mensaje de error
   */
  validationFn?: (respuestas: Record<string, any>) => string | null;
  /**
   * Si true, no redirige automáticamente después de guardar
   */
  skipRedirectOnSave?: boolean;
}

export interface UseWorkflowEtapaResult {
  // Estados principales
  loading: boolean;
  saving: boolean;
  error: string | null;
  
  // IDs del workflow
  workflowInstanciaId: number | null;
  etapaId: number | null;
  solicitudId: string | undefined;
  instanciaId: string | undefined;
  
  // Instancia completa del workflow
  instancia: any;
  
  // Estado de solo lectura
  readonly: boolean;
  
  // Rutas base para navegación
  basePath: string;
  
  // Usuario actual
  usuario: any;
  userPerfil: string;
  
  // Acciones
  handleCancelar: () => void;
  handleGuardar: (respuestas: Record<string, any>) => Promise<boolean>;
  setError: (error: string | null) => void;
  reload: () => Promise<void>;
}

/**
 * Hook que encapsula toda la lógica común de las etapas del workflow
 */
export function useWorkflowEtapa(options: UseWorkflowEtapaOptions = {}): UseWorkflowEtapaResult {
  const { onSuccess, validationFn, skipRedirectOnSave = false } = options;
  
  // Parámetros de URL
  const { id: solicitudId, instanciaId } = useParams<{ id?: string; instanciaId?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { usuario } = useAuth();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workflowInstanciaId, setWorkflowInstanciaId] = useState<number | null>(null);
  const [etapaId, setEtapaId] = useState<number | null>(null);
  const [instancia, setInstancia] = useState<any>(null);
  
  // Derivados
  const readonly = searchParams.get('readonly') === 'true';
  const userPerfil = usuario?.perfil || 'FUNCIONARIO';
  
  // Calcular basePath
  const basePath = useMemo(() => {
    const baseParam = solicitudId || instanciaId || workflowInstanciaId;
    return solicitudId ? `/solicitudes/${solicitudId}` : `/workflows/${baseParam}`;
  }, [solicitudId, instanciaId, workflowInstanciaId]);
  
  /**
   * Carga la instancia del workflow y obtiene la etapa actual
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let wInstanciaId: number | null = null;
      
      if (instanciaId) {
        wInstanciaId = parseInt(instanciaId);
      } else if (solicitudId) {
        const solicitud = await ppshService.getSolicitud(parseInt(solicitudId));
        if (!solicitud.workflow_instancia_id) {
          throw new Error('La solicitud no tiene workflow asociado');
        }
        wInstanciaId = solicitud.workflow_instancia_id;
      }
      
      setWorkflowInstanciaId(wInstanciaId);
      
      if (wInstanciaId) {
        const instanciaData = await workflowService.getInstancia(wInstanciaId);
        setInstancia(instanciaData);
        if (instanciaData.etapa_actual_id) {
          setEtapaId(instanciaData.etapa_actual_id);
        }
      }
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError(err.message || 'Error al cargar la información');
    } finally {
      setLoading(false);
    }
  }, [instanciaId, solicitudId]);
  
  // Cargar datos al montar o cuando cambian los parámetros
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  /**
   * Navega de vuelta a la lista de etapas
   */
  const handleCancelar = useCallback(() => {
    navigate(`${basePath}/etapas`);
  }, [navigate, basePath]);
  
  /**
   * Guarda las respuestas de la etapa actual
   * @param respuestas - Objeto con las respuestas a guardar
   * @returns true si se guardó exitosamente, false si hubo error
   */
  const handleGuardar = useCallback(async (respuestas: Record<string, any>): Promise<boolean> => {
    if (!workflowInstanciaId || !etapaId) {
      setError('Error: No se pudo identificar la instancia del workflow');
      return false;
    }
    
    // Validación personalizada
    if (validationFn) {
      const validationError = validationFn(respuestas);
      if (validationError) {
        setError(validationError);
        return false;
      }
    }
    
    setSaving(true);
    setError(null);
    
    try {
      await workflowService.completarEtapa(
        workflowInstanciaId,
        etapaId,
        respuestas,
        userPerfil
      );
      
      // Callback de éxito
      onSuccess?.();
      
      // Redirigir a etapas si no se especifica lo contrario
      if (!skipRedirectOnSave) {
        navigate(`${basePath}/etapas`);
      }
      
      return true;
    } catch (err: any) {
      console.error('Error al guardar:', err);
      setError(err.response?.data?.detail || err.message || 'Error al guardar');
      return false;
    } finally {
      setSaving(false);
    }
  }, [workflowInstanciaId, etapaId, userPerfil, validationFn, onSuccess, skipRedirectOnSave, navigate, basePath]);
  
  return {
    // Estados
    loading,
    saving,
    error,
    
    // IDs
    workflowInstanciaId,
    etapaId,
    solicitudId,
    instanciaId,
    
    // Instancia completa
    instancia,
    
    // Readonly
    readonly,
    
    // Rutas
    basePath,
    
    // Usuario
    usuario,
    userPerfil,
    
    // Acciones
    handleCancelar,
    handleGuardar,
    setError,
    reload: loadData,
  };
}

export default useWorkflowEtapa;
