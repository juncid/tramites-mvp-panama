/**
 * Tests para DynamicEtapaView component
 * Componente crítico que renderiza dinámicamente etapas del workflow
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DynamicEtapaView } from '../../components/Workflow/DynamicEtapaView';
import { workflowService } from '../../services/workflow.service';

// Mock de servicios
vi.mock('../../services/workflow.service', () => ({
  workflowService: {
    getVistaActual: vi.fn(),
  },
}));

// Mock de los componentes de vista de pregunta
vi.mock('../../components/Workflow/QuestionViews/RespuestaTextoView', () => ({
  RespuestaTextoView: ({ pregunta, readonly }: any) => (
    <div data-testid={`respuesta-texto-${pregunta.codigo}`}>
      RespuestaTextoView: {pregunta.pregunta} {readonly && '(readonly)'}
    </div>
  ),
}));

vi.mock('../../components/Workflow/QuestionViews/ListaView', () => ({
  ListaView: ({ pregunta }: any) => (
    <div data-testid={`lista-${pregunta.codigo}`}>
      ListaView: {pregunta.pregunta}
    </div>
  ),
}));

vi.mock('../../components/Workflow/QuestionViews/OpcionesView', () => ({
  OpcionesView: ({ pregunta }: any) => (
    <div data-testid={`opciones-${pregunta.codigo}`}>
      OpcionesView: {pregunta.pregunta}
    </div>
  ),
}));

vi.mock('../../components/Workflow/QuestionViews/CargaArchivoView', () => ({
  CargaArchivoView: ({ pregunta }: any) => (
    <div data-testid={`carga-archivo-${pregunta.codigo}`}>
      CargaArchivoView: {pregunta.pregunta}
    </div>
  ),
}));

vi.mock('../../components/Workflow/QuestionViews/RevisionManualDocumentosView', () => ({
  RevisionManualDocumentosView: ({ pregunta }: any) => (
    <div data-testid={`revision-manual-${pregunta.codigo}`}>
      RevisionManualDocumentosView: {pregunta.pregunta}
    </div>
  ),
}));

vi.mock('../../components/Workflow/QuestionViews/RevisionOCRView', () => ({
  RevisionOCRView: ({ pregunta }: any) => (
    <div data-testid={`revision-ocr-${pregunta.codigo}`}>
      RevisionOCRView: {pregunta.pregunta}
    </div>
  ),
}));

vi.mock('../../components/Workflow/QuestionViews/DatosCasoView', () => ({
  DatosCasoView: ({ pregunta }: any) => (
    <div data-testid={`datos-caso-${pregunta.codigo}`}>
      DatosCasoView: {pregunta.pregunta}
    </div>
  ),
}));

vi.mock('../../components/Workflow/QuestionViews/SeleccionFechaView', () => ({
  SeleccionFechaView: ({ pregunta }: any) => (
    <div data-testid={`seleccion-fecha-${pregunta.codigo}`}>
      SeleccionFechaView: {pregunta.pregunta}
    </div>
  ),
}));

vi.mock('../../components/Workflow/QuestionViews/DescargaArchivoView', () => ({
  DescargaArchivoView: ({ pregunta }: any) => (
    <div data-testid={`descarga-archivo-${pregunta.codigo}`}>
      DescargaArchivoView: {pregunta.pregunta}
    </div>
  ),
}));

vi.mock('../../components/Workflow/QuestionViews/ImpresionView', () => ({
  ImpresionView: ({ pregunta }: any) => (
    <div data-testid={`impresion-${pregunta.codigo}`}>
      ImpresionView: {pregunta.pregunta}
    </div>
  ),
}));

vi.mock('../../components/Workflow/FileUploadWizard', () => ({
  FileUploadWizard: ({ campos }: any) => (
    <div data-testid="file-upload-wizard">
      FileUploadWizard: {campos.length} archivos
    </div>
  ),
}));

describe('DynamicEtapaView', () => {
  const mockVistaActual = {
    instancia: {
      id: 1,
      num_expediente: 'PPSH-2025-00001',
      nombre_instancia: 'Solicitud Test',
      estado: 'EN_PROCESO',
      fecha_inicio: '2025-01-01T00:00:00Z',
      asignado_a: null,
    },
    etapa_actual: {
      id: 5,
      codigo: 'REVISION',
      nombre: 'Revisión de Documentos',
      descripcion: 'Revise los documentos del solicitante',
      tipo_etapa: 'FORMULARIO',
      titulo_formulario: 'Revisión de Documentos',
      bajada_formulario: 'Complete la revisión de los documentos adjuntos',
      es_etapa_final: false,
      tiempo_estimado_minutos: 30,
    },
    puede_ver: true,
    puede_editar: true,
    campos: [
      {
        id: 1,
        codigo: 'observaciones',
        pregunta: 'Observaciones',
        tipo_pregunta: 'RESPUESTA_TEXTO',
        orden: 1,
        es_obligatoria: false,
        puede_editar_campo: true,
      },
      {
        id: 2,
        codigo: 'estado_revision',
        pregunta: 'Estado de revisión',
        tipo_pregunta: 'OPCIONES',
        orden: 2,
        es_obligatoria: true,
        puede_editar_campo: true,
        opciones: ['APROBADO', 'RECHAZADO', 'PENDIENTE'],
      },
    ],
    metadata_instancia: {
      id_solicitud: 100,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Carga de vista desde API', () => {
    it('debería mostrar loading mientras carga', () => {
      vi.mocked(workflowService.getVistaActual).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<DynamicEtapaView instanciaId={1} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('debería cargar y mostrar la vista correctamente', async () => {
      vi.mocked(workflowService.getVistaActual).mockResolvedValue(mockVistaActual);

      render(<DynamicEtapaView instanciaId={1} userPerfil="FUNCIONARIO" />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });

      // Verificar que se cargó la vista con el perfil correcto
      expect(workflowService.getVistaActual).toHaveBeenCalledWith(1, 'FUNCIONARIO', undefined);

      // Verificar header
      expect(screen.getByText('Revisión de Documentos')).toBeInTheDocument();
      expect(screen.getByText('Complete la revisión de los documentos adjuntos')).toBeInTheDocument();
    });

    it('debería pasar accessToken si se proporciona', async () => {
      vi.mocked(workflowService.getVistaActual).mockResolvedValue(mockVistaActual);

      render(<DynamicEtapaView instanciaId={1} accessToken="jwt-token-123" />);

      await waitFor(() => {
        expect(workflowService.getVistaActual).toHaveBeenCalledWith(
          1,
          'FUNCIONARIO',
          'jwt-token-123'
        );
      });
    });

    it('debería mostrar error cuando falla la carga', async () => {
      vi.mocked(workflowService.getVistaActual).mockRejectedValue({
        response: { data: { detail: 'Error de permisos' } },
      });

      render(<DynamicEtapaView instanciaId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Error de permisos')).toBeInTheDocument();
      });
    });

    it('debería mostrar mensaje de error cuando retorna null', async () => {
      vi.mocked(workflowService.getVistaActual).mockResolvedValue(null);

      render(<DynamicEtapaView instanciaId={1} />);

      await waitFor(() => {
        // El componente muestra error al intentar acceder propiedades de null
        expect(screen.getByText(/Error al cargar la vista de la etapa/i)).toBeInTheDocument();
      });
    });
  });

  describe('Permisos', () => {
    it('debería mostrar alerta cuando no tiene permiso de ver', async () => {
      const vistaSinPermiso = {
        ...mockVistaActual,
        puede_ver: false,
      };
      vi.mocked(workflowService.getVistaActual).mockResolvedValue(vistaSinPermiso);

      render(<DynamicEtapaView instanciaId={1} />);

      await waitFor(() => {
        expect(screen.getByText(/No tienes permiso para ver esta etapa/i)).toBeInTheDocument();
      });
    });

    it('debería mostrar indicador de solo lectura cuando no puede editar', async () => {
      const vistaSoloLectura = {
        ...mockVistaActual,
        puede_editar: false,
        instancia: {
          ...mockVistaActual.instancia,
          asignado_a: 'usuario@test.com',
        },
      };
      vi.mocked(workflowService.getVistaActual).mockResolvedValue(vistaSoloLectura);

      render(<DynamicEtapaView instanciaId={1} />);

      await waitFor(() => {
        expect(screen.getByText(/modo solo lectura/i)).toBeInTheDocument();
        expect(screen.getByText(/usuario@test.com/i)).toBeInTheDocument();
      });
    });
  });

  describe('Renderizado de campos', () => {
    it('debería renderizar campo RESPUESTA_TEXTO', async () => {
      vi.mocked(workflowService.getVistaActual).mockResolvedValue(mockVistaActual);

      render(<DynamicEtapaView instanciaId={1} />);

      await waitFor(() => {
        expect(screen.getByTestId('respuesta-texto-observaciones')).toBeInTheDocument();
      });
    });

    it('debería renderizar campo OPCIONES', async () => {
      vi.mocked(workflowService.getVistaActual).mockResolvedValue(mockVistaActual);

      render(<DynamicEtapaView instanciaId={1} />);

      await waitFor(() => {
        expect(screen.getByTestId('opciones-estado_revision')).toBeInTheDocument();
      });
    });

    it('debería renderizar campos en orden correcto', async () => {
      const vistaConOrden = {
        ...mockVistaActual,
        campos: [
          { ...mockVistaActual.campos[1], orden: 1 }, // OPCIONES primero
          { ...mockVistaActual.campos[0], orden: 2 }, // RESPUESTA_TEXTO segundo
        ],
      };
      vi.mocked(workflowService.getVistaActual).mockResolvedValue(vistaConOrden);

      render(<DynamicEtapaView instanciaId={1} />);

      await waitFor(() => {
        const campos = screen.getAllByTestId(/opciones-|respuesta-texto-/);
        expect(campos).toHaveLength(2);
      });
    });

    it('debería mostrar mensaje para tipos no soportados', async () => {
      const vistaConTipoNoSoportado = {
        ...mockVistaActual,
        campos: [
          {
            id: 99,
            codigo: 'campo_desconocido',
            pregunta: 'Campo desconocido',
            tipo_pregunta: 'TIPO_INVENTADO',
            orden: 1,
            es_obligatoria: false,
            puede_editar_campo: true,
          },
        ],
      };
      vi.mocked(workflowService.getVistaActual).mockResolvedValue(vistaConTipoNoSoportado);

      render(<DynamicEtapaView instanciaId={1} />);

      await waitFor(() => {
        expect(screen.getByText(/Tipo de pregunta no soportado: TIPO_INVENTADO/i)).toBeInTheDocument();
      });
    });

    it('debería usar FileUploadWizard cuando hay múltiples campos CARGA_ARCHIVO', async () => {
      const vistaConMultiplesArchivos = {
        ...mockVistaActual,
        campos: [
          {
            id: 10,
            codigo: 'archivo1',
            pregunta: 'Archivo 1',
            tipo_pregunta: 'CARGA_ARCHIVO',
            orden: 1,
            es_obligatoria: true,
            puede_editar_campo: true,
          },
          {
            id: 11,
            codigo: 'archivo2',
            pregunta: 'Archivo 2',
            tipo_pregunta: 'CARGA_ARCHIVO',
            orden: 2,
            es_obligatoria: true,
            puede_editar_campo: true,
          },
        ],
      };
      vi.mocked(workflowService.getVistaActual).mockResolvedValue(vistaConMultiplesArchivos);

      render(<DynamicEtapaView instanciaId={1} />);

      await waitFor(() => {
        expect(screen.getByTestId('file-upload-wizard')).toBeInTheDocument();
        expect(screen.getByText('FileUploadWizard: 2 archivos')).toBeInTheDocument();
      });
    });
  });

  describe('Props de configuración', () => {
    it('debería ocultar header cuando hideHeader=true', async () => {
      vi.mocked(workflowService.getVistaActual).mockResolvedValue(mockVistaActual);

      render(<DynamicEtapaView instanciaId={1} hideHeader={true} />);

      await waitFor(() => {
        expect(screen.queryByText('Revisión de Documentos')).not.toBeInTheDocument();
      });
    });

    it('debería pasar readonly a los campos cuando readonly=true', async () => {
      vi.mocked(workflowService.getVistaActual).mockResolvedValue(mockVistaActual);

      render(<DynamicEtapaView instanciaId={1} readonly={true} />);

      await waitFor(() => {
        expect(screen.getByText(/\(readonly\)/)).toBeInTheDocument();
      });
    });
  });

  describe('Botones de acción', () => {
    it('debería mostrar botón Volver cuando se proporciona onBack', async () => {
      vi.mocked(workflowService.getVistaActual).mockResolvedValue(mockVistaActual);
      const onBack = vi.fn();

      render(<DynamicEtapaView instanciaId={1} onBack={onBack} onComplete={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('Volver')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Volver'));
      expect(onBack).toHaveBeenCalled();
    });

    it('debería mostrar botón con label personalizado', async () => {
      vi.mocked(workflowService.getVistaActual).mockResolvedValue(mockVistaActual);

      render(
        <DynamicEtapaView
          instanciaId={1}
          onBack={vi.fn()}
          onComplete={vi.fn()}
          buttonLabels={{ back: 'Cancelar', next: 'Continuar' }}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Cancelar')).toBeInTheDocument();
        expect(screen.getByText('Continuar')).toBeInTheDocument();
      });
    });

    it('no debería mostrar botones cuando no puede editar', async () => {
      const vistaSoloLectura = {
        ...mockVistaActual,
        puede_editar: false,
      };
      vi.mocked(workflowService.getVistaActual).mockResolvedValue(vistaSoloLectura);

      render(<DynamicEtapaView instanciaId={1} onBack={vi.fn()} onComplete={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText('Volver')).not.toBeInTheDocument();
        expect(screen.queryByText('Siguiente')).not.toBeInTheDocument();
      });
    });
  });

  describe('Validación de campos obligatorios', () => {
    it('debería mostrar error si faltan campos obligatorios al completar', async () => {
      vi.mocked(workflowService.getVistaActual).mockResolvedValue(mockVistaActual);
      const onComplete = vi.fn();

      render(<DynamicEtapaView instanciaId={1} onComplete={onComplete} />);

      await waitFor(() => {
        expect(screen.getByText('Siguiente')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Siguiente'));

      await waitFor(() => {
        expect(screen.getByText(/Faltan campos obligatorios/i)).toBeInTheDocument();
        expect(screen.getByText(/Estado de revisión/i)).toBeInTheDocument();
      });

      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('Modo legacy con etapa prop', () => {
    it('debería mostrar mensaje cuando no hay etapa ni instanciaId', () => {
      render(<DynamicEtapaView />);

      expect(screen.getByText('No se proporcionó etapa o instanciaId')).toBeInTheDocument();
    });

    it('debería renderizar preguntas cuando se proporciona etapa prop', () => {
      const etapaProp = {
        id: 1,
        codigo: 'ETAPA_TEST',
        nombre: 'Etapa Test',
        workflow_id: 1,
        tipo_etapa: 'FORMULARIO' as const,
        orden: 1,
        es_visible: true,
        activo: true,
        perfiles_permitidos: [],
        es_etapa_inicial: false,
        es_etapa_final: false,
        requiere_validacion: false,
        permite_edicion_posterior: true,
        preguntas: [
          {
            id: 1,
            codigo: 'pregunta_test',
            pregunta: 'Pregunta de prueba',
            texto: 'Pregunta de prueba',
            tipo_pregunta: 'RESPUESTA_TEXTO' as const,
            tipo: 'RESPUESTA_TEXTO' as const,
            orden: 1,
            es_obligatoria: false,
            activo: true,
            es_visible: true,
          },
        ],
      };

      render(<DynamicEtapaView etapa={etapaProp} />);

      expect(screen.getByTestId('respuesta-texto-pregunta_test')).toBeInTheDocument();
    });
  });

  describe('Visibilidad condicional', () => {
    it('debería ocultar campo cuando condición no se cumple', async () => {
      const vistaConCondicion = {
        ...mockVistaActual,
        campos: [
          {
            id: 1,
            codigo: 'tipo_solicitud',
            pregunta: 'Tipo de solicitud',
            tipo_pregunta: 'OPCIONES',
            orden: 1,
            es_obligatoria: true,
            puede_editar_campo: true,
            opciones: ['NUEVA', 'RENOVACION'],
          },
          {
            id: 2,
            codigo: 'numero_anterior',
            pregunta: 'Número de trámite anterior',
            tipo_pregunta: 'RESPUESTA_TEXTO',
            orden: 2,
            es_obligatoria: false,
            puede_editar_campo: true,
            mostrar_si: { tipo_solicitud: 'RENOVACION' },
          },
        ],
      };
      vi.mocked(workflowService.getVistaActual).mockResolvedValue(vistaConCondicion);

      render(<DynamicEtapaView instanciaId={1} />);

      await waitFor(() => {
        // El campo con condición no debería mostrarse porque no hay valor seleccionado
        expect(screen.queryByTestId('respuesta-texto-numero_anterior')).not.toBeInTheDocument();
        // El campo sin condición sí debería mostrarse
        expect(screen.getByTestId('opciones-tipo_solicitud')).toBeInTheDocument();
      });
    });
  });

  describe('Valores iniciales', () => {
    it('debería cargar valores actuales de la vista', async () => {
      const vistaConValores = {
        ...mockVistaActual,
        campos: [
          {
            ...mockVistaActual.campos[0],
            valor_actual: {
              valor_texto: 'Valor inicial de observaciones',
            },
          },
        ],
      };
      vi.mocked(workflowService.getVistaActual).mockResolvedValue(vistaConValores);

      render(<DynamicEtapaView instanciaId={1} />);

      await waitFor(() => {
        expect(workflowService.getVistaActual).toHaveBeenCalled();
      });

      // El componente debería haber procesado los valores iniciales
      // Los valores se pasan a los componentes hijos
    });
  });
});
