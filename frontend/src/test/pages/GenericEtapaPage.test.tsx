import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';
import { GenericEtapaPage } from '../../pages/GenericEtapaPage';
import { workflowService } from '../../services/workflow.service';

// Mock del servicio de workflow
vi.mock('../../services/workflow.service', () => ({
  workflowService: {
    getInstancia: vi.fn(),
    getVistaActual: vi.fn(),
    getVistaEtapa: vi.fn(),
    completarEtapa: vi.fn(),
  },
}));

// Mock de useAuth
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    usuario: {
      id: 1,
      nombre: 'Juan Pérez',
      email: 'juan@test.com',
      perfil: 'FUNCIONARIO',
    },
    isAdmin: false,
  }),
}));

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock fetch para solicitud PPSH
global.fetch = vi.fn();

const mockInstancia = {
  id: 1,
  workflow_id: 1,
  num_expediente: 'PPSH-2025-00001',
  codigo_referencia: 'PPSH-REF-001',
  fecha_inicio: '2025-01-01T00:00:00Z',
  activo: true,
  created_at: '2025-01-01T00:00:00Z',
  workflow: {
    id: 1,
    nombre: 'Proceso PPSH',
    codigo: 'PPSH',
  },
  estado: 'EN_PROCESO',
  metadata_adicional: {
    id_solicitud: 100,
  },
} as any;

const mockVistaActual = {
  instancia: {
    id: 1,
    num_expediente: 'PPSH-2025-00001',
    nombre_instancia: 'Solicitud PPSH',
    estado: 'EN_PROCESO',
    fecha_inicio: '2025-01-01',
  },
  etapa_actual: {
    id: 1,
    codigo: 'REVISION_DOCS',
    nombre: 'Revisión de Documentos',
    descripcion: 'Revisar documentos del solicitante',
    tipo_etapa: 'TAREA',
    titulo_formulario: 'Revisión de Documentos del Solicitante',
    bajada_formulario: 'Verifique que todos los documentos estén correctos',
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
      codigo: 'aprobado',
      pregunta: 'Estado de revisión',
      tipo_pregunta: 'OPCIONES',
      orden: 2,
      es_obligatoria: true,
      puede_editar_campo: true,
      opciones: ['Aprobado', 'Rechazado', 'Pendiente'],
    },
  ],
  metadata_instancia: {},
};

describe('GenericEtapaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra loading mientras carga datos', () => {
    vi.mocked(workflowService.getInstancia).mockImplementation(
      () => new Promise(() => {})
    );
    vi.mocked(workflowService.getVistaActual).mockImplementation(
      () => new Promise(() => {})
    );

    render(
      <MemoryRouter initialEntries={['/workflows/1/etapa']}>
        <Routes>
          <Route path="/workflows/:instanciaId/etapa" element={<GenericEtapaPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('muestra error cuando falla la carga', async () => {
    vi.mocked(workflowService.getInstancia).mockRejectedValue(
      new Error('Error de conexión')
    );

    render(
      <MemoryRouter initialEntries={['/workflows/1/etapa']}>
        <Routes>
          <Route path="/workflows/:instanciaId/etapa" element={<GenericEtapaPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error de conexión/i)).toBeInTheDocument();
    });
  });

  it('renderiza la etapa correctamente con sus campos', async () => {
    vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);
    vi.mocked(workflowService.getVistaActual).mockResolvedValue(mockVistaActual);

    render(
      <MemoryRouter initialEntries={['/workflows/1/etapa']}>
        <Routes>
          <Route path="/workflows/:instanciaId/etapa" element={<GenericEtapaPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      // Título del workflow (aparece en título y breadcrumbs)
      const procesoPPSH = screen.getAllByText('Proceso PPSH');
      expect(procesoPPSH.length).toBeGreaterThanOrEqual(1);
    });

    // Título del formulario
    expect(screen.getByText('Revisión de Documentos del Solicitante')).toBeInTheDocument();
    // Bajada del formulario
    expect(screen.getByText(/Verifique que todos los documentos/i)).toBeInTheDocument();
  });

  it('muestra los breadcrumbs correctamente', async () => {
    vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);
    vi.mocked(workflowService.getVistaActual).mockResolvedValue(mockVistaActual);

    render(
      <MemoryRouter initialEntries={['/workflows/1/etapa']}>
        <Routes>
          <Route path="/workflows/:instanciaId/etapa" element={<GenericEtapaPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Inicio')).toBeInTheDocument();
      expect(screen.getByText('Procesos')).toBeInTheDocument();
      // El nombre de la etapa en breadcrumbs
      expect(screen.getByText('Revisión de Documentos')).toBeInTheDocument();
    });
  });

  it('muestra botón Siguiente cuando no es etapa final', async () => {
    vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);
    vi.mocked(workflowService.getVistaActual).mockResolvedValue(mockVistaActual);

    render(
      <MemoryRouter initialEntries={['/workflows/1/etapa']}>
        <Routes>
          <Route path="/workflows/:instanciaId/etapa" element={<GenericEtapaPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Siguiente/i })).toBeInTheDocument();
    });
  });

  it('muestra botón Finalizar cuando es etapa final', async () => {
    const vistaEtapaFinal = {
      ...mockVistaActual,
      etapa_actual: {
        ...mockVistaActual.etapa_actual,
        es_etapa_final: true,
      },
    };

    vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);
    vi.mocked(workflowService.getVistaActual).mockResolvedValue(vistaEtapaFinal);

    render(
      <MemoryRouter initialEntries={['/workflows/1/etapa']}>
        <Routes>
          <Route path="/workflows/:instanciaId/etapa" element={<GenericEtapaPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Finalizar/i })).toBeInTheDocument();
    });
  });

  it('muestra solo botón Volver en modo readonly', async () => {
    vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);
    vi.mocked(workflowService.getVistaActual).mockResolvedValue(mockVistaActual);

    render(
      <MemoryRouter initialEntries={['/workflows/1/etapa?readonly=true']}>
        <Routes>
          <Route path="/workflows/:instanciaId/etapa" element={<GenericEtapaPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Volver/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Siguiente/i })).not.toBeInTheDocument();
    });
  });

  it('navega de vuelta a etapas cuando se hace click en Volver', async () => {
    vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);
    vi.mocked(workflowService.getVistaActual).mockResolvedValue(mockVistaActual);

    render(
      <MemoryRouter initialEntries={['/workflows/1/etapa']}>
        <Routes>
          <Route path="/workflows/:instanciaId/etapa" element={<GenericEtapaPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Volver/i })).toBeInTheDocument();
    });

    screen.getByRole('button', { name: /Volver/i }).click();
    expect(mockNavigate).toHaveBeenCalledWith('/workflows/1/etapas');
  });

  it('renderiza tipos de pregunta no soportados con mensaje apropiado', async () => {
    const vistaConTipoNoSoportado = {
      ...mockVistaActual,
      campos: [
        {
          id: 99,
          codigo: 'campo_raro',
          pregunta: 'Campo raro',
          tipo_pregunta: 'TIPO_NO_EXISTENTE',
          orden: 1,
          es_obligatoria: false,
          puede_editar_campo: true,
        },
      ],
    };

    vi.mocked(workflowService.getInstancia).mockResolvedValue(mockInstancia);
    vi.mocked(workflowService.getVistaActual).mockResolvedValue(vistaConTipoNoSoportado);

    render(
      <MemoryRouter initialEntries={['/workflows/1/etapa']}>
        <Routes>
          <Route path="/workflows/:instanciaId/etapa" element={<GenericEtapaPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Tipo de pregunta no soportado: TIPO_NO_EXISTENTE/i)).toBeInTheDocument();
    });
  });
});
