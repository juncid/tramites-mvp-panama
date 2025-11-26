import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock useNavigate
const mockNavigate = vi.fn();

// Mock de los componentes antes de importar
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../components/PPSH/DocumentUploadField', () => ({
  DocumentUploadField: ({ label }: any) => <div data-testid="document-upload-field">{label}</div>,
}));

vi.mock('../../components/PPSH/OCRLoadingModal', () => ({
  OCRLoadingModal: () => <div>OCR Loading Modal</div>,
}));

vi.mock('../../components/PPSH/OCRResultModal', () => ({
  OCRResultModal: () => <div>OCR Result Modal</div>,
}));

vi.mock('../../components/common/PageHero', () => ({
  PageHero: ({ title, breadcrumbs }: any) => (
    <div>
      <h1>{title}</h1>
      {breadcrumbs && breadcrumbs.map((b: any, i: number) => (
        <span key={i}>{b.label}</span>
      ))}
    </div>
  ),
}));

// Ahora importar el componente después de los mocks
import { CargaDocumentosPPSH } from '../../pages/CargaDocumentosPPSH';

describe('CargaDocumentosPPSH Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renderiza el título y breadcrumbs correctamente', () => {
    render(
      <BrowserRouter>
        <CargaDocumentosPPSH />
      </BrowserRouter>
    );

    expect(screen.getByText(/Permiso de Protección de Seguridad Humanitaria/i)).toBeInTheDocument();
    expect(screen.getByText(/Inicio/i)).toBeInTheDocument();
    expect(screen.getByText(/Procesos/i)).toBeInTheDocument();
  });

  it('muestra el título de requisitos', () => {
    render(
      <BrowserRouter>
        <CargaDocumentosPPSH />
      </BrowserRouter>
    );

    expect(screen.getByText(/Requisitos del trámite PPSH/i)).toBeInTheDocument();
  });

  it('muestra el botón de descargar requisitos', () => {
    render(
      <BrowserRouter>
        <CargaDocumentosPPSH />
      </BrowserRouter>
    );

    const downloadButton = screen.getByRole('button', { name: /Requisitos PPSH/i });
    expect(downloadButton).toBeInTheDocument();
  });

  it('muestra los botones de navegación', () => {
    render(
      <BrowserRouter>
        <CargaDocumentosPPSH />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Siguiente/i })).toBeInTheDocument();
  });

  it('el botón de siguiente está habilitado por defecto', () => {
    render(
      <BrowserRouter>
        <CargaDocumentosPPSH />
      </BrowserRouter>
    );

    const nextButton = screen.getByRole('button', { name: /Siguiente/i });
    expect(nextButton).not.toBeDisabled();
  });

  it('navega hacia atrás cuando se hace click en Cancelar', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <CargaDocumentosPPSH />
      </BrowserRouter>
    );

    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/procesos');
    });
  });
});
