import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { Solicitudes } from '../../pages/Solicitudes';
import { ppshService } from '../../services/ppsh.service';

// Mock del servicio
vi.mock('../../services/ppsh.service', () => ({
  ppshService: {
    listarSolicitudes: vi.fn(),
  },
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

const mockSolicitudes = [
  {
    id_solicitud: 1,
    num_expediente: 'EXP-001',
    nombre_titular: 'Juan Pérez',
    tipo_solicitud: 'INDIVIDUAL' as const,
    fecha_solicitud: '2025-01-01',
    estado_actual: 'En proceso',
    prioridad: 'NORMAL' as const,
    total_personas: 1,
    dias_transcurridos: 5,
    created_at: '2025-01-01T00:00:00',
  },
  {
    id_solicitud: 2,
    num_expediente: 'EXP-002',
    nombre_titular: 'María García',
    tipo_solicitud: 'GRUPAL' as const,
    fecha_solicitud: '2025-01-02',
    estado_actual: 'Completado',
    prioridad: 'ALTA' as const,
    total_personas: 2,
    dias_transcurridos: 3,
    created_at: '2025-01-02T00:00:00',
  },
];

describe('Solicitudes Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el título correctamente', async () => {
    vi.mocked(ppshService.listarSolicitudes).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
      total_pages: 0,
    });

    render(
      <BrowserRouter>
        <Solicitudes />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Solicitudes/i })).toBeInTheDocument();
    });
  });

  it('renderiza los breadcrumbs correctamente', async () => {
    vi.mocked(ppshService.listarSolicitudes).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
      total_pages: 0,
    });

    render(
      <BrowserRouter>
        <Solicitudes />
      </BrowserRouter>
    );

    const inicioLinks = screen.getAllByText(/Inicio/i);
    expect(inicioLinks.length).toBeGreaterThan(0);
  });

  it('muestra loading mientras carga los datos', () => {
    vi.mocked(ppshService.listarSolicitudes).mockImplementation(
      () => new Promise(() => {}) // Promise que nunca se resuelve
    );

    render(
      <BrowserRouter>
        <Solicitudes />
      </BrowserRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('carga y muestra las solicitudes', async () => {
    vi.mocked(ppshService.listarSolicitudes).mockResolvedValue({
      items: mockSolicitudes,
      total: 2,
      page: 1,
      page_size: 20,
      total_pages: 1,
    });

    render(
      <BrowserRouter>
        <Solicitudes />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('EXP-001')).toBeInTheDocument();
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('EXP-002')).toBeInTheDocument();
      expect(screen.getByText('María García')).toBeInTheDocument();
    });
  });

  it('permite filtrar solicitudes por búsqueda', async () => {
    vi.mocked(ppshService.listarSolicitudes).mockResolvedValue({
      items: mockSolicitudes,
      total: 2,
      page: 1,
      page_size: 20,
      total_pages: 1,
    });

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Solicitudes />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('EXP-001')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Buscar por expediente o nombre/i);
    await user.type(searchInput, 'Juan');

    expect(searchInput).toHaveValue('Juan');
  });

  it('muestra mensaje de error cuando falla la carga', async () => {
    vi.mocked(ppshService.listarSolicitudes).mockRejectedValue(
      new Error('Error de red')
    );

    render(
      <BrowserRouter>
        <Solicitudes />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error de red/i)).toBeInTheDocument();
    });
  });

  it('muestra botones de acción para cada solicitud', async () => {
    vi.mocked(ppshService.listarSolicitudes).mockResolvedValue({
      items: mockSolicitudes,
      total: 2,
      page: 1,
      page_size: 20,
      total_pages: 1,
    });

    render(
      <BrowserRouter>
        <Solicitudes />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('EXP-001')).toBeInTheDocument();
      expect(screen.getByText('EXP-002')).toBeInTheDocument();
    });
  });
});
