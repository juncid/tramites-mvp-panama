/**
 * Tests para useWorkflowEtapa hook
 * Hook crítico que centraliza la lógica de las etapas del workflow
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useWorkflowEtapa } from '../../hooks/useWorkflowEtapa';
import { workflowService } from '../../services/workflow.service';
import { ppshService } from '../../services/ppsh.service';

// Mock de react-router-dom
const mockNavigate = vi.fn();
const mockSearchParams = new URLSearchParams();
let mockParams: Record<string, string> = {};

vi.mock('react-router-dom', () => ({
  useParams: () => mockParams,
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams, vi.fn()],
}));

// Mock de AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    usuario: {
      id: 1,
      nombre: 'Test User',
      perfil: 'FUNCIONARIO',
    },
  }),
}));

// Mock de servicios
vi.mock('../../services/workflow.service', () => ({
  workflowService: {
    getInstancia: vi.fn(),
    completarEtapa: vi.fn(),
  },
}));

vi.mock('../../services/ppsh.service', () => ({
  ppshService: {
    getSolicitud: vi.fn(),
  },
}));

describe('useWorkflowEtapa', () => {
  const mockInstancia = {
    id: 1,
    workflow_id: 1,
    etapa_actual_id: 5,
    estado: 'EN_PROCESO',
    workflow: {
      id: 1,
      nombre: 'Proceso PPSH',
    },
  };

  const mockSolicitud = {
    id: 100,
    workflow_instancia_id: 1,
    estado: 'EN_PROCESO',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = {};
    mockSearchParams.delete('readonly');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Carga inicial', () => {
    it('debería iniciar con loading=true', () => {
      mockParams = { instanciaId: '1' };
      vi.mocked(workflowService.getInstancia).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => useWorkflowEtapa());

      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('debería cargar instancia por instanciaId', async () => {
      mockParams = { instanciaId: '1' };
      vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);

      const { result } = renderHook(() => useWorkflowEtapa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(workflowService.getInstancia).toHaveBeenCalledWith(1);
      expect(result.current.workflowInstanciaId).toBe(1);
      expect(result.current.etapaId).toBe(5);
      expect(result.current.instancia).toEqual(mockInstancia);
    });

    it('debería cargar instancia a través de solicitudId', async () => {
      mockParams = { id: '100' };
      vi.mocked(ppshService.getSolicitud).mockResolvedValue(mockSolicitud);
      vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);

      const { result } = renderHook(() => useWorkflowEtapa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(ppshService.getSolicitud).toHaveBeenCalledWith(100);
      expect(workflowService.getInstancia).toHaveBeenCalledWith(1);
      expect(result.current.solicitudId).toBe('100');
    });

    it('debería manejar error cuando solicitud no tiene workflow', async () => {
      mockParams = { id: '100' };
      vi.mocked(ppshService.getSolicitud).mockResolvedValue({
        id: 100,
        workflow_instancia_id: null,
      });

      const { result } = renderHook(() => useWorkflowEtapa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('La solicitud no tiene workflow asociado');
    });

    it('debería manejar error de carga', async () => {
      mockParams = { instanciaId: '1' };
      vi.mocked(workflowService.getInstancia).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useWorkflowEtapa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });
  });

  describe('Estados derivados', () => {
    it('debería detectar modo readonly desde searchParams', async () => {
      mockParams = { instanciaId: '1' };
      mockSearchParams.set('readonly', 'true');
      vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);

      const { result } = renderHook(() => useWorkflowEtapa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.readonly).toBe(true);
    });

    it('debería calcular basePath correctamente con solicitudId', async () => {
      mockParams = { id: '100' };
      vi.mocked(ppshService.getSolicitud).mockResolvedValue(mockSolicitud);
      vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);

      const { result } = renderHook(() => useWorkflowEtapa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.basePath).toBe('/solicitudes/100');
    });

    it('debería calcular basePath correctamente con instanciaId', async () => {
      mockParams = { instanciaId: '5' };
      vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);

      const { result } = renderHook(() => useWorkflowEtapa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.basePath).toBe('/workflows/5');
    });

    it('debería exponer datos del usuario', async () => {
      mockParams = { instanciaId: '1' };
      vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);

      const { result } = renderHook(() => useWorkflowEtapa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.usuario).toEqual({
        id: 1,
        nombre: 'Test User',
        perfil: 'FUNCIONARIO',
      });
      expect(result.current.userPerfil).toBe('FUNCIONARIO');
    });
  });

  describe('handleCancelar', () => {
    it('debería navegar a lista de etapas', async () => {
      mockParams = { instanciaId: '1' };
      vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);

      const { result } = renderHook(() => useWorkflowEtapa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleCancelar();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/workflows/1/etapas');
    });
  });

  describe('handleGuardar', () => {
    it('debería guardar respuestas exitosamente', async () => {
      mockParams = { instanciaId: '1' };
      vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);
      vi.mocked(workflowService.completarEtapa).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useWorkflowEtapa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let success: boolean = false;
      await act(async () => {
        success = await result.current.handleGuardar({ campo1: 'valor1' });
      });

      expect(success).toBe(true);
      expect(workflowService.completarEtapa).toHaveBeenCalledWith(
        1,
        5,
        { campo1: 'valor1' },
        'FUNCIONARIO'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/workflows/1/etapas');
    });

    it('debería retornar false si no hay workflowInstanciaId', async () => {
      mockParams = {};
      // No mocked - will leave instanciaId null

      const { result } = renderHook(() => useWorkflowEtapa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let success: boolean = true;
      await act(async () => {
        success = await result.current.handleGuardar({ campo1: 'valor1' });
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe('Error: No se pudo identificar la instancia del workflow');
    });

    it('debería ejecutar validationFn antes de guardar', async () => {
      mockParams = { instanciaId: '1' };
      vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);

      const validationFn = vi.fn().mockReturnValue('Campo requerido');

      const { result } = renderHook(() =>
        useWorkflowEtapa({ validationFn })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let success: boolean = true;
      await act(async () => {
        success = await result.current.handleGuardar({ campo1: '' });
      });

      expect(success).toBe(false);
      expect(validationFn).toHaveBeenCalledWith({ campo1: '' });
      expect(result.current.error).toBe('Campo requerido');
      expect(workflowService.completarEtapa).not.toHaveBeenCalled();
    });

    it('debería permitir guardar si validationFn retorna null', async () => {
      mockParams = { instanciaId: '1' };
      vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);
      vi.mocked(workflowService.completarEtapa).mockResolvedValue({ success: true });

      const validationFn = vi.fn().mockReturnValue(null);

      const { result } = renderHook(() =>
        useWorkflowEtapa({ validationFn })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let success: boolean = false;
      await act(async () => {
        success = await result.current.handleGuardar({ campo1: 'valor' });
      });

      expect(success).toBe(true);
      expect(workflowService.completarEtapa).toHaveBeenCalled();
    });

    it('debería ejecutar onSuccess callback', async () => {
      mockParams = { instanciaId: '1' };
      vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);
      vi.mocked(workflowService.completarEtapa).mockResolvedValue({ success: true });

      const onSuccess = vi.fn();

      const { result } = renderHook(() =>
        useWorkflowEtapa({ onSuccess })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.handleGuardar({ campo1: 'valor' });
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('debería no redirigir si skipRedirectOnSave es true', async () => {
      mockParams = { instanciaId: '1' };
      vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);
      vi.mocked(workflowService.completarEtapa).mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useWorkflowEtapa({ skipRedirectOnSave: true })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      mockNavigate.mockClear();

      await act(async () => {
        await result.current.handleGuardar({ campo1: 'valor' });
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('debería manejar error al guardar', async () => {
      mockParams = { instanciaId: '1' };
      vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);
      vi.mocked(workflowService.completarEtapa).mockRejectedValue({
        response: { data: { detail: 'Error de validación del servidor' } },
      });

      const { result } = renderHook(() => useWorkflowEtapa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let success: boolean = true;
      await act(async () => {
        success = await result.current.handleGuardar({ campo1: 'valor' });
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe('Error de validación del servidor');
    });

    it('debería mostrar saving=true mientras guarda', async () => {
      mockParams = { instanciaId: '1' };
      vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);

      let resolveCompletarEtapa: (value: any) => void;
      vi.mocked(workflowService.completarEtapa).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveCompletarEtapa = resolve;
          })
      );

      const { result } = renderHook(() => useWorkflowEtapa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.saving).toBe(false);

      let promise: Promise<boolean>;
      act(() => {
        promise = result.current.handleGuardar({ campo1: 'valor' });
      });

      await waitFor(() => {
        expect(result.current.saving).toBe(true);
      });

      await act(async () => {
        resolveCompletarEtapa!({ success: true });
        await promise;
      });

      expect(result.current.saving).toBe(false);
    });
  });

  describe('reload', () => {
    it('debería recargar los datos', async () => {
      mockParams = { instanciaId: '1' };
      vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);

      const { result } = renderHook(() => useWorkflowEtapa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(workflowService.getInstancia).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.reload();
      });

      expect(workflowService.getInstancia).toHaveBeenCalledTimes(2);
    });
  });

  describe('setError', () => {
    it('debería permitir establecer error manualmente', async () => {
      mockParams = { instanciaId: '1' };
      vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);

      const { result } = renderHook(() => useWorkflowEtapa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeNull();

      act(() => {
        result.current.setError('Error personalizado');
      });

      expect(result.current.error).toBe('Error personalizado');

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Backward compatibility aliases', () => {
    it('debería exponer completing como alias de saving', async () => {
      mockParams = { instanciaId: '1' };
      vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);

      const { result } = renderHook(() => useWorkflowEtapa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.completing).toBe(result.current.saving);
    });

    it('debería exponer setCompleting como alias de setSaving', async () => {
      mockParams = { instanciaId: '1' };
      vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);

      const { result } = renderHook(() => useWorkflowEtapa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.setCompleting).toBeDefined();
      expect(typeof result.current.setCompleting).toBe('function');
    });

    it('debería exponer navigate function', async () => {
      mockParams = { instanciaId: '1' };
      vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);

      const { result } = renderHook(() => useWorkflowEtapa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.navigate('/custom/path');
      });

      expect(mockNavigate).toHaveBeenCalledWith('/custom/path');
    });
  });
});
