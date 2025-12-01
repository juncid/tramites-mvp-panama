import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PublicAccess from '../../pages/PublicAccess';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock fetch
global.fetch = vi.fn();

describe('PublicAccess Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el formulario correctamente', () => {
    render(
      <BrowserRouter>
        <PublicAccess />
      </BrowserRouter>
    );

    // El título ahora es "Continuar Solicitud"
    expect(screen.getByText(/Continuar Solicitud/i)).toBeInTheDocument();
    // Campos principales
    expect(screen.getByLabelText(/Código de Acceso/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número de Pasaporte/i)).toBeInTheDocument();
  });

  it('muestra el botón deshabilitado cuando los campos están vacíos', async () => {
    render(
      <BrowserRouter>
        <PublicAccess />
      </BrowserRouter>
    );

    // El botón debe estar deshabilitado si los campos están vacíos
    const submitButton = screen.getByRole('button', { name: /Continuar Trámite/i });
    expect(submitButton).toBeDisabled();
  });

  it('habilita el botón cuando se llenan todos los campos', async () => {
    render(
      <BrowserRouter>
        <PublicAccess />
      </BrowserRouter>
    );

    const codigoInput = screen.getByLabelText(/Código de Acceso/i);
    const pasaporteInput = screen.getByLabelText(/Número de Pasaporte/i);
    const submitButton = screen.getByRole('button', { name: /Continuar Trámite/i });

    fireEvent.change(codigoInput, { target: { value: 'PPSH-A7X9' } });
    fireEvent.change(pasaporteInput, { target: { value: 'N123456789' } });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('convierte el código de acceso a mayúsculas', async () => {
    render(
      <BrowserRouter>
        <PublicAccess />
      </BrowserRouter>
    );

    const codigoInput = screen.getByLabelText(/Código de Acceso/i) as HTMLInputElement;

    fireEvent.change(codigoInput, { target: { value: 'ppsh-a7x9' } });

    await waitFor(() => {
      expect(codigoInput.value).toBe('PPSH-A7X9');
    });
  });

  it('tiene tabs para cambiar entre código de acceso y link completo', async () => {
    render(
      <BrowserRouter>
        <PublicAccess />
      </BrowserRouter>
    );

    // Debe haber tabs
    expect(screen.getByRole('tab', { name: /Código de Acceso/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Link Completo/i })).toBeInTheDocument();
  });
});
