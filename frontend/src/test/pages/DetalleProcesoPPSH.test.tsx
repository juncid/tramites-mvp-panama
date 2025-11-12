import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DetalleProcesoPPSH } from '../../pages/DetalleProcesoPPSH';

// Mock de los componentes de vistas
vi.mock('../../components/PPSH/views', () => ({
  GeneralView: ({ procesoId, solicitudId }: any) => (
    <div data-testid="general-view">General View - {procesoId} - {solicitudId}</div>
  ),
  FlowView: ({ procesoId, solicitudId }: any) => (
    <div data-testid="flow-view">Flow View - {procesoId} - {solicitudId}</div>
  ),
  StatusView: ({ procesoId, solicitudId }: any) => (
    <div data-testid="status-view">Status View - {procesoId} - {solicitudId}</div>
  ),
  HistoryView: ({ procesoId, solicitudId }: any) => (
    <div data-testid="history-view">History View - {procesoId} - {solicitudId}</div>
  ),
}));

// Helper para renderizar con route params
const renderWithRouter = (procesoId = '123', solicitudId = '456') => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/proceso/:procesoId/solicitud/:solicitudId" element={<DetalleProcesoPPSH />} />
      </Routes>
    </BrowserRouter>,
    {
      wrapper: ({ children }) => (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={children} />
            <Route path="/proceso/:procesoId/solicitud/:solicitudId" element={<DetalleProcesoPPSH />} />
          </Routes>
        </BrowserRouter>
      ),
    }
  );
};

describe('DetalleProcesoPPSH Component', () => {
  it('renderiza el título correctamente', () => {
    render(
      <BrowserRouter>
        <DetalleProcesoPPSH />
      </BrowserRouter>
    );

    // Usar getByRole para ser más específico con el heading
    expect(screen.getByRole('heading', { name: /Permiso de Protección de Seguridad Humanitaria/i })).toBeInTheDocument();
  });

  it('renderiza los 4 tabs correctamente', () => {
    render(
      <BrowserRouter>
        <DetalleProcesoPPSH />
      </BrowserRouter>
    );

    expect(screen.getByRole('tab', { name: /General/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Flujo/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Estado/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Historial/i })).toBeInTheDocument();
  });

  it('muestra el tab General por defecto', () => {
    render(
      <BrowserRouter>
        <DetalleProcesoPPSH />
      </BrowserRouter>
    );

    const generalTab = screen.getByRole('tab', { name: /General/i });
    expect(generalTab).toHaveClass('Mui-selected');
  });

  it('cambia de tab cuando se hace click', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <DetalleProcesoPPSH />
      </BrowserRouter>
    );

    // Click en el tab de Flujo
    const flowTab = screen.getByRole('tab', { name: /Flujo/i });
    await user.click(flowTab);

    expect(flowTab).toHaveClass('Mui-selected');
  });

  it('muestra el contenido del tab General inicialmente', () => {
    render(
      <BrowserRouter>
        <DetalleProcesoPPSH />
      </BrowserRouter>
    );

    expect(screen.getByTestId('general-view')).toBeInTheDocument();
  });

  it('cambia el contenido al cambiar de tab', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <DetalleProcesoPPSH />
      </BrowserRouter>
    );

    // Inicialmente muestra General
    expect(screen.getByTestId('general-view')).toBeInTheDocument();

    // Cambiar a Estado
    const statusTab = screen.getByRole('tab', { name: /Estado/i });
    await user.click(statusTab);

    expect(screen.getByTestId('status-view')).toBeInTheDocument();
  });

  it('todos los tabs son accesibles', () => {
    render(
      <BrowserRouter>
        <DetalleProcesoPPSH />
      </BrowserRouter>
    );

    const generalTab = screen.getByRole('tab', { name: /General/i });
    const flowTab = screen.getByRole('tab', { name: /Flujo/i });
    const statusTab = screen.getByRole('tab', { name: /Estado/i });
    const historyTab = screen.getByRole('tab', { name: /Historial/i });

    expect(generalTab).toHaveAttribute('aria-controls', 'proceso-tabpanel-0');
    expect(flowTab).toHaveAttribute('aria-controls', 'proceso-tabpanel-1');
    expect(statusTab).toHaveAttribute('aria-controls', 'proceso-tabpanel-2');
    expect(historyTab).toHaveAttribute('aria-controls', 'proceso-tabpanel-3');
  });
});
