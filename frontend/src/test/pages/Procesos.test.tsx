import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { Procesos } from '../../pages/Procesos';
import { workflowService } from '../../services/workflow.service';

// Mock del servicio
vi.mock('../../services/workflow.service', () => ({
  workflowService: {
    getWorkflows: vi.fn(),
    deleteWorkflow: vi.fn(),
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

const mockWorkflows = [
  {
    id: 1,
    codigo: 'WF-001',
    nombre: 'Proceso de Ejemplo',
    descripcion: 'Descripción de ejemplo',
    estado: 'ACTIVO' as const,
    version: 1,
    perfiles_creadores: [],
    activo: true,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  },
  {
    id: 2,
    codigo: 'WF-002',
    nombre: 'Proceso Inactivo',
    descripcion: 'Otro proceso',
    estado: 'INACTIVO' as const,
    version: 1,
    perfiles_creadores: [],
    activo: false,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  },
];

describe('Procesos Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el título correctamente', async () => {
    vi.mocked(workflowService.getWorkflows).mockResolvedValue([]);
    
    render(
      <BrowserRouter>
        <Procesos />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Procesos/i })).toBeInTheDocument();
  });

  it('muestra el botón de nuevo proceso', async () => {
    vi.mocked(workflowService.getWorkflows).mockResolvedValue([]);
    
    render(
      <BrowserRouter>
        <Procesos />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /Nuevo Proceso/i })).toBeInTheDocument();
  });

  it('carga y muestra los workflows', async () => {
    vi.mocked(workflowService.getWorkflows).mockResolvedValue(mockWorkflows);
    
    render(
      <BrowserRouter>
        <Procesos />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Proceso de Ejemplo/i)).toBeInTheDocument();
      expect(screen.getByText(/Proceso Inactivo/i)).toBeInTheDocument();
    });
  });

  it('navega al crear nuevo proceso', async () => {
    vi.mocked(workflowService.getWorkflows).mockResolvedValue([]);
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <Procesos />
      </BrowserRouter>
    );

    const newButton = screen.getByRole('button', { name: /Nuevo Proceso/i });
    await user.click(newButton);

    expect(mockNavigate).toHaveBeenCalledWith('/flujos/nuevo');
  });
});
