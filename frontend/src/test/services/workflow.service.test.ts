/**
 * Tests para workflow.service.ts
 * Servicio crítico para gestión de workflows, etapas, instancias y vistas
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { workflowService } from '../../services/workflow.service';
import { apiClient } from '../../services/api';

// Mock del apiClient
vi.mock('../../services/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    uploadFile: vi.fn(),
  },
}));

describe('workflowService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ==========================================
  // WORKFLOWS CRUD
  // ==========================================
  describe('Workflows CRUD', () => {
    const mockWorkflow = {
      id: 1,
      nombre: 'Test Workflow',
      descripcion: 'Descripción del workflow',
      codigo: 'TEST-WF',
      estado: 'ACTIVO',
      etapas: [],
      conexiones: [],
    };

    it('getWorkflows debería obtener lista de workflows', async () => {
      const mockWorkflows = [mockWorkflow];
      vi.mocked(apiClient.get).mockResolvedValue(mockWorkflows);

      const result = await workflowService.getWorkflows();

      expect(apiClient.get).toHaveBeenCalledWith('/workflow/workflows');
      expect(result).toEqual(mockWorkflows);
    });

    it('getWorkflow debería obtener un workflow por ID', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockWorkflow);

      const result = await workflowService.getWorkflow(1);

      expect(apiClient.get).toHaveBeenCalledWith('/workflow/workflows/1');
      expect(result).toEqual(mockWorkflow);
    });

    it('createWorkflow debería crear un nuevo workflow', async () => {
      const createData = {
        nombre: 'Nuevo Workflow',
        descripcion: 'Descripción',
        codigo: 'NEW-WF',
        perfiles_creadores: [],
      };
      vi.mocked(apiClient.post).mockResolvedValue({ id: 2, ...createData });

      const result = await workflowService.createWorkflow(createData);

      expect(apiClient.post).toHaveBeenCalledWith('/workflow/workflows', createData);
      expect(result.id).toBe(2);
    });

    it('updateWorkflow debería actualizar un workflow existente', async () => {
      const updateData = { nombre: 'Workflow Actualizado' };
      vi.mocked(apiClient.put).mockResolvedValue({ ...mockWorkflow, ...updateData });

      const result = await workflowService.updateWorkflow(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/workflow/workflows/1', updateData);
      expect(result.nombre).toBe('Workflow Actualizado');
    });

    it('deleteWorkflow debería eliminar un workflow', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      await workflowService.deleteWorkflow(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/workflow/workflows/1');
    });
  });

  // ==========================================
  // ETAPAS CRUD
  // ==========================================
  describe('Etapas CRUD', () => {
    const mockEtapa = {
      id: 1,
      workflow_id: 1,
      codigo: 'ETAPA-1',
      nombre: 'Etapa de Prueba',
      tipo: 'FORMULARIO',
      orden: 1,
      preguntas: [],
    };

    it('createEtapa debería crear una nueva etapa', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockEtapa);

      const result = await workflowService.createEtapa({
        workflow_id: 1,
        codigo: 'ETAPA-1',
        nombre: 'Etapa de Prueba',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/workflow/etapas', expect.any(Object));
      expect(result).toEqual(mockEtapa);
    });

    it('updateEtapa debería actualizar una etapa', async () => {
      const updateData = { nombre: 'Etapa Actualizada' };
      vi.mocked(apiClient.put).mockResolvedValue({ ...mockEtapa, ...updateData });

      const result = await workflowService.updateEtapa(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/workflow/etapas/1', updateData);
      expect(result.nombre).toBe('Etapa Actualizada');
    });

    it('deleteEtapa debería eliminar una etapa', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      await workflowService.deleteEtapa(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/workflow/etapas/1');
    });

    it('getEtapa debería obtener una etapa por ID', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockEtapa);

      const result = await workflowService.getEtapa(1);

      expect(apiClient.get).toHaveBeenCalledWith('/workflow/etapas/1');
      expect(result).toEqual(mockEtapa);
    });
  });

  // ==========================================
  // PREGUNTAS CRUD
  // ==========================================
  describe('Preguntas CRUD', () => {
    const mockPregunta = {
      id: 1,
      etapa_id: 1,
      codigo: 'PREG-1',
      texto: '¿Nombre completo?',
      tipo: 'RESPUESTA_TEXTO',
      orden: 1,
      requerida: true,
    };

    it('createPregunta debería crear una nueva pregunta', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockPregunta);

      const result = await workflowService.createPregunta({
        etapa_id: 1,
        codigo: 'PREG-1',
        texto: '¿Nombre completo?',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/workflow/preguntas', expect.any(Object));
      expect(result).toEqual(mockPregunta);
    });

    it('updatePregunta debería actualizar una pregunta', async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ ...mockPregunta, texto: 'Pregunta actualizada' });

      const result = await workflowService.updatePregunta(1, { texto: 'Pregunta actualizada' });

      expect(apiClient.put).toHaveBeenCalledWith('/workflow/preguntas/1', { texto: 'Pregunta actualizada' });
      expect(result.texto).toBe('Pregunta actualizada');
    });

    it('deletePregunta debería eliminar una pregunta', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      await workflowService.deletePregunta(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/workflow/preguntas/1');
    });
  });

  // ==========================================
  // CONEXIONES CRUD
  // ==========================================
  describe('Conexiones CRUD', () => {
    const mockConexion = {
      id: 1,
      workflow_id: 1,
      etapa_origen_id: 1,
      etapa_destino_id: 2,
      condicion: null,
      es_default: true,
    };

    it('createConexion debería crear una nueva conexión', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockConexion);

      const result = await workflowService.createConexion({
        workflow_id: 1,
        etapa_origen_id: 1,
        etapa_destino_id: 2,
      });

      expect(apiClient.post).toHaveBeenCalledWith('/workflow/conexiones', expect.any(Object));
      expect(result).toEqual(mockConexion);
    });

    it('updateConexion debería actualizar una conexión', async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ ...mockConexion, es_predeterminada: false });

      const result = await workflowService.updateConexion(1, { es_predeterminada: false });

      expect(apiClient.put).toHaveBeenCalledWith('/workflow/conexiones/1', { es_predeterminada: false });
      expect(result.es_predeterminada).toBe(false);
    });

    it('deleteConexion debería eliminar una conexión', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      await workflowService.deleteConexion(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/workflow/conexiones/1');
    });
  });

  // ==========================================
  // INSTANCIAS (EJECUCIÓN)
  // ==========================================
  describe('Instancias', () => {
    const mockInstancia = {
      id: 1,
      workflow_id: 1,
      workflow_nombre: 'Test Workflow',
      estado: 'EN_PROGRESO',
      etapa_actual_id: 1,
      etapa_actual_codigo: 'ETAPA-1',
      datos_contexto: {},
      created_at: '2024-01-01T00:00:00Z',
    };

    it('getInstancia debería obtener una instancia por ID', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockInstancia);

      const result = await workflowService.getInstancia(1);

      expect(apiClient.get).toHaveBeenCalledWith('/workflow/instancias/1');
      expect(result).toEqual(mockInstancia);
    });

    it('createInstancia debería crear una nueva instancia', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockInstancia);

      const result = await workflowService.createInstancia(1, { clave: 'valor' });

      expect(apiClient.post).toHaveBeenCalledWith('/workflow/instancias', {
        workflow_id: 1,
        datos_contexto: { clave: 'valor' },
      });
      expect(result).toEqual(mockInstancia);
    });

    it('createInstancia debería funcionar sin datos opcionales', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockInstancia);

      await workflowService.createInstancia(1);

      expect(apiClient.post).toHaveBeenCalledWith('/workflow/instancias', {
        workflow_id: 1,
        datos_contexto: undefined,
      });
    });

    it('transicionarInstancia debería transicionar a siguiente etapa', async () => {
      const transicionData = { etapa_destino_id: 2, respuestas: [] };
      vi.mocked(apiClient.post).mockResolvedValue({ ...mockInstancia, etapa_actual_id: 2 });

      const result = await workflowService.transicionarInstancia(1, transicionData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/workflow/instancias/1/transicionar',
        transicionData
      );
      expect(result.etapa_actual_id).toBe(2);
    });

    it('getRespuestas debería obtener respuestas de una instancia', async () => {
      const mockRespuestas = [{ id: 1, pregunta_id: 1, valor: 'Test' }];
      vi.mocked(apiClient.get).mockResolvedValue(mockRespuestas);

      const result = await workflowService.getRespuestas(1);

      expect(apiClient.get).toHaveBeenCalledWith('/workflow/instancias/1/respuestas', { params: {} });
      expect(result).toEqual(mockRespuestas);
    });

    it('getRespuestas debería filtrar por etapa si se proporciona', async () => {
      const mockRespuestas = [{ id: 1, pregunta_id: 1, valor: 'Test' }];
      vi.mocked(apiClient.get).mockResolvedValue(mockRespuestas);

      await workflowService.getRespuestas(1, 5);

      expect(apiClient.get).toHaveBeenCalledWith('/workflow/instancias/1/respuestas', {
        params: { etapa_id: 5 },
      });
    });

    it('getInstancias debería listar instancias con parámetros', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([mockInstancia]);

      const params = { workflow_id: 1, estado: 'EN_PROGRESO', skip: 0, limit: 10 };
      const result = await workflowService.getInstancias(params);

      expect(apiClient.get).toHaveBeenCalledWith('/workflow/instancias', params);
      expect(result).toHaveLength(1);
    });
  });

  // ==========================================
  // MÉTODOS DE EJECUCIÓN POR USUARIO
  // ==========================================
  describe('Ejecución por usuario', () => {
    it('getEtapasByPerfil debería obtener etapas filtradas por perfil', async () => {
      const mockEtapas = [{ id: 1, codigo: 'ETAPA-1', nombre: 'Etapa 1' }];
      vi.mocked(apiClient.get).mockResolvedValue(mockEtapas);

      const result = await workflowService.getEtapasByPerfil(1, 'FUNCIONARIO');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/workflow/workflows/1/etapas/by-perfil',
        { perfil: 'FUNCIONARIO' }
      );
      expect(result).toEqual(mockEtapas);
    });

    it('getWorkflowState debería obtener estado del workflow', async () => {
      const mockState = { etapa_actual: 'ETAPA-1', completado: false };
      vi.mocked(apiClient.get).mockResolvedValue(mockState);

      const result = await workflowService.getWorkflowState(1, 'ADMIN');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/workflow/instancias/1/workflow-state',
        { params: { perfil: 'ADMIN' } }
      );
      expect(result).toEqual(mockState);
    });

    it('getWorkflowState debería funcionar sin perfil', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({});

      await workflowService.getWorkflowState(1);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/workflow/instancias/1/workflow-state',
        { params: {} }
      );
    });

    it('ejecutarEtapa debería ejecutar una etapa con respuestas', async () => {
      const mockResult = { success: true, siguiente_etapa: 2 };
      vi.mocked(apiClient.post).mockResolvedValue(mockResult);

      const respuestas = { nombre: 'Juan', edad: 30 };
      const result = await workflowService.ejecutarEtapa(1, 5, respuestas);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/workflow/instancias/1/etapas/5/ejecutar',
        { respuestas, archivos: undefined },
        { params: {}, headers: undefined }
      );
      expect(result).toEqual(mockResult);
    });

    it('ejecutarEtapa debería incluir archivos, perfil y accessToken si se proporcionan', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ success: true });

      const respuestas = { documento: 'cargado' };
      const archivos = { documento: { id: 1 } };
      await workflowService.ejecutarEtapa(1, 5, respuestas, archivos, 'CIUDADANO', 'token123');

      expect(apiClient.post).toHaveBeenCalledWith(
        '/workflow/instancias/1/etapas/5/ejecutar',
        { respuestas, archivos },
        { params: { perfil: 'CIUDADANO' }, headers: { 'X-Access-Token': 'token123' } }
      );
    });
  });

  // ==========================================
  // INTEGRACIÓN WORKFLOW-PPSH
  // ==========================================
  describe('Integración Workflow-PPSH', () => {
    it('createInstanciaConPPSH debería crear instancia con solicitud PPSH', async () => {
      const mockResult = { instancia_id: 1, solicitud_id: 100 };
      vi.mocked(apiClient.post).mockResolvedValue(mockResult);

      const data = {
        workflow_id: 1,
        nombre_instancia: 'Mi Trámite',
        solicitud_ppsh: { tipo: 'NUEVO', datos: {} },
      };
      const result = await workflowService.createInstanciaConPPSH(data);

      expect(apiClient.post).toHaveBeenCalledWith('/workflow/instancias/crear-con-ppsh', data);
      expect(result).toEqual(mockResult);
    });

    it('vincularPPSHExistente debería vincular solicitud existente', async () => {
      const mockResult = { success: true };
      vi.mocked(apiClient.post).mockResolvedValue(mockResult);

      const data = {
        workflow_id: 1,
        solicitud_id: 100,
        nombre_instancia: 'Trámite Vinculado',
      };
      const result = await workflowService.vincularPPSHExistente(data);

      expect(apiClient.post).toHaveBeenCalledWith('/workflow/instancias/vincular-ppsh-existente', data);
      expect(result).toEqual(mockResult);
    });

    it('getVinculacionPPSH debería obtener datos de vinculación', async () => {
      const mockVinculacion = { solicitud_id: 100, estado: 'ACTIVO' };
      vi.mocked(apiClient.get).mockResolvedValue(mockVinculacion);

      const result = await workflowService.getVinculacionPPSH(1, true);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/workflow/instancias/1/vinculacion-ppsh',
        { expanded: true }
      );
      expect(result).toEqual(mockVinculacion);
    });

    it('getVinculacionPPSH debería usar expanded=false por defecto', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({});

      await workflowService.getVinculacionPPSH(1);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/workflow/instancias/1/vinculacion-ppsh',
        { expanded: false }
      );
    });
  });

  // ==========================================
  // HISTORIAL DE CAMBIOS
  // ==========================================
  describe('Historial de cambios', () => {
    const mockCambio = {
      id: 1,
      workflow_id: 1,
      tipo_cambio: 'ETAPA',
      accion: 'CREAR',
      descripcion: 'Se creó etapa',
      created_at: '2024-01-01T00:00:00Z',
      created_by: 'admin',
    };

    it('getWorkflowHistorialCambios debería obtener historial', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([mockCambio]);

      const result = await workflowService.getWorkflowHistorialCambios(1, 50, 0);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/workflow/workflows/1/historial-cambios',
        { limit: 50, offset: 0 }
      );
      expect(result).toHaveLength(1);
    });

    it('getWorkflowHistorialCambios debería usar valores por defecto', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([]);

      await workflowService.getWorkflowHistorialCambios(1);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/workflow/workflows/1/historial-cambios',
        { limit: 50, offset: 0 }
      );
    });

    it('registrarCambioWorkflow debería registrar un cambio', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockCambio);

      const cambio = {
        tipo_cambio: 'ETAPA',
        accion: 'CREAR',
        descripcion: 'Se creó etapa',
      };
      const result = await workflowService.registrarCambioWorkflow(1, cambio);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/workflow/workflows/1/historial-cambios',
        cambio
      );
      expect(result).toEqual(mockCambio);
    });
  });

  // ==========================================
  // PERMISOS Y VISTAS DINÁMICAS
  // ==========================================
  describe('Permisos y Vistas Dinámicas', () => {
    it('getHistorial debería obtener historial de instancia', async () => {
      const mockHistorial = [
        { id: 1, etapa: 'INICIO', fecha: '2024-01-01' },
        { id: 2, etapa: 'REVISION', fecha: '2024-01-02' },
      ];
      vi.mocked(apiClient.get).mockResolvedValue(mockHistorial);

      const result = await workflowService.getHistorial(1);

      expect(apiClient.get).toHaveBeenCalledWith('/workflow/instancias/1/historial');
      expect(result).toEqual(mockHistorial);
    });

    it('getVistaActual debería obtener vista de etapa actual', async () => {
      const mockVista = {
        etapa: { id: 1, codigo: 'ETAPA-1' },
        campos: [],
        puede_editar: true,
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockVista);

      const result = await workflowService.getVistaActual(1, 'FUNCIONARIO');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/workflow/instancias/1/vista-actual',
        { user_perfil: 'FUNCIONARIO' },
        undefined
      );
      expect(result).toEqual(mockVista);
    });

    it('getVistaActual debería incluir accessToken si se proporciona', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({});

      await workflowService.getVistaActual(1, 'CIUDADANO', 'token123');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/workflow/instancias/1/vista-actual',
        { user_perfil: 'CIUDADANO' },
        { 'X-Access-Token': 'token123' }
      );
    });

    it('getVistaEtapa debería obtener vista de una etapa específica', async () => {
      const mockVista = {
        etapa: { id: 5, codigo: 'REVISION' },
        campos: [],
        readonly: true,
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockVista);

      const result = await workflowService.getVistaEtapa(1, 5, 'ADMIN');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/workflow/instancias/1/vista-etapa/5',
        { user_perfil: 'ADMIN' },
        undefined
      );
      expect(result).toEqual(mockVista);
    });

    it('getVistaEtapa debería incluir accessToken', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({});

      await workflowService.getVistaEtapa(1, 5, 'CIUDADANO', 'token456');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/workflow/instancias/1/vista-etapa/5',
        { user_perfil: 'CIUDADANO' },
        { 'X-Access-Token': 'token456' }
      );
    });

    it('verificarPermisos debería verificar permisos del usuario', async () => {
      const mockPermisos = {
        puede_ver: true,
        puede_editar: false,
        etapa_id: 1,
        etapa_codigo: 'ETAPA-1',
        etapa_nombre: 'Primera Etapa',
        es_etapa_actual: true,
        perfil_usuario: 'FUNCIONARIO',
        perfiles_permitidos: ['ADMIN', 'FUNCIONARIO'],
        razon: 'Usuario tiene permisos de lectura',
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockPermisos);

      const result = await workflowService.verificarPermisos(1, 'FUNCIONARIO');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/workflow/instancias/1/verificar-permisos',
        { user_perfil: 'FUNCIONARIO' }
      );
      expect(result).toEqual(mockPermisos);
    });

    it('verificarPermisos debería incluir etapa_id si se proporciona', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({});

      await workflowService.verificarPermisos(1, 'ADMIN', 5);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/workflow/instancias/1/verificar-permisos',
        { user_perfil: 'ADMIN', etapa_id: 5 }
      );
    });

    it('guardarRespuestasEtapa debería retornar mensaje de no implementado', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await workflowService.guardarRespuestasEtapa(1, { nombre: 'Test' });

      expect(consoleSpy).toHaveBeenCalledWith(
        'guardarRespuestasEtapa: No hay endpoint de guardar borrador implementado'
      );
      expect(result.success).toBe(true);
      expect(result.message).toContain('no implementada');

      consoleSpy.mockRestore();
    });

    it('completarEtapa debería completar y avanzar etapa', async () => {
      const mockResult = { success: true, siguiente_etapa_id: 2 };
      vi.mocked(apiClient.post).mockResolvedValue(mockResult);

      const respuestas = { campo1: 'valor1' };
      const result = await workflowService.completarEtapa(1, 5, respuestas, 'FUNCIONARIO');

      expect(apiClient.post).toHaveBeenCalledWith(
        '/workflow/instancias/1/etapas/5/ejecutar?perfil=FUNCIONARIO',
        { respuestas, archivos: {} },
        { headers: undefined }
      );
      expect(result).toEqual(mockResult);
    });

    it('completarEtapa debería incluir archivos y accessToken', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ success: true });

      const respuestas = { campo: 'valor' };
      const archivos = { doc: { id: 1 } };
      await workflowService.completarEtapa(1, 5, respuestas, 'ADMIN', archivos, 'tokenXYZ');

      expect(apiClient.post).toHaveBeenCalledWith(
        '/workflow/instancias/1/etapas/5/ejecutar?perfil=ADMIN',
        { respuestas, archivos },
        { headers: { 'X-Access-Token': 'tokenXYZ' } }
      );
    });
  });

  // ==========================================
  // DOCUMENTOS Y OCR
  // ==========================================
  describe('Documentos y OCR', () => {
    it('subirDocumentoEtapa debería subir archivo usando uploadFile', async () => {
      const mockResult = { id: 1, nombre: 'documento.pdf' };
      vi.mocked(apiClient.uploadFile).mockResolvedValue(mockResult);

      const file = new File(['contenido'], 'test.pdf', { type: 'application/pdf' });
      const data = { cod_tipo_documento: 1, observaciones: 'Test' };
      const result = await workflowService.subirDocumentoEtapa(100, file, data);

      expect(apiClient.uploadFile).toHaveBeenCalledWith(
        '/ppsh/solicitudes/100/documentos',
        file,
        data,
        'archivo'
      );
      expect(result).toEqual(mockResult);
    });

    it('subirDocumentoEtapa debería funcionar sin datos opcionales', async () => {
      vi.mocked(apiClient.uploadFile).mockResolvedValue({});

      const file = new File(['contenido'], 'test.pdf');
      await workflowService.subirDocumentoEtapa(100, file);

      expect(apiClient.uploadFile).toHaveBeenCalledWith(
        '/ppsh/solicitudes/100/documentos',
        file,
        undefined,
        'archivo'
      );
    });

    it('validarOCR debería validar datos OCR contra solicitante', async () => {
      const mockValidacion = {
        validacion_exitosa: true,
        campos_validados: { nombre: 'Juan Pérez', cedula: '8-123-456' },
        campos_no_encontrados: [],
        campos_con_discrepancia: [],
        mensaje: 'Validación exitosa',
        puede_continuar: true,
      };
      vi.mocked(apiClient.post).mockResolvedValue(mockValidacion);

      const result = await workflowService.validarOCR(100, 5);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/ppsh/solicitudes/100/validar-ocr',
        { id_documento: 5 }
      );
      expect(result.validacion_exitosa).toBe(true);
      expect(result.puede_continuar).toBe(true);
    });

    it('validarOCR debería retornar discrepancias si las hay', async () => {
      const mockValidacion = {
        validacion_exitosa: false,
        campos_validados: {},
        campos_no_encontrados: ['fecha_nacimiento'],
        campos_con_discrepancia: [
          {
            campo: 'nombre',
            valor_ingresado: 'Juan Perez',
            valor_ocr: 'Juan Pérez García',
          },
        ],
        mensaje: 'Se encontraron discrepancias',
        puede_continuar: false,
      };
      vi.mocked(apiClient.post).mockResolvedValue(mockValidacion);

      const result = await workflowService.validarOCR(100, 5);

      expect(result.validacion_exitosa).toBe(false);
      expect(result.campos_con_discrepancia).toHaveLength(1);
      expect(result.puede_continuar).toBe(false);
    });
  });

  // ==========================================
  // CASOS DE ERROR
  // ==========================================
  describe('Manejo de errores', () => {
    it('debería propagar errores del apiClient', async () => {
      const mockError = new Error('Network Error');
      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      await expect(workflowService.getWorkflows()).rejects.toThrow('Network Error');
    });

    it('debería propagar errores de autenticación', async () => {
      const authError = new Error('Unauthorized');
      vi.mocked(apiClient.post).mockRejectedValue(authError);

      await expect(
        workflowService.ejecutarEtapa(1, 5, {})
      ).rejects.toThrow('Unauthorized');
    });

    it('debería propagar errores de validación', async () => {
      const validationError = new Error('Validation failed: campo requerido');
      vi.mocked(apiClient.post).mockRejectedValue(validationError);

      await expect(
        workflowService.createWorkflow({ nombre: '', descripcion: '', codigo: '', perfiles_creadores: [] })
      ).rejects.toThrow('Validation failed');
    });
  });
});
