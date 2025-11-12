import { describe, it, expect, vi } from 'vitest';
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

describe('PublicAccess Component', () => {
  it('renderiza el formulario correctamente', () => {
    render(
      <BrowserRouter>
        <PublicAccess />
      </BrowserRouter>
    );

    expect(screen.getByText(/Consulta de Solicitud/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número de Solicitud/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de Documento/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Consultar Solicitud/i })).toBeInTheDocument();
  });

  it('muestra error cuando se envía el formulario vacío', async () => {
    render(
      <BrowserRouter>
        <PublicAccess />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /Consultar Solicitud/i });
    
    // El botón debe estar deshabilitado si los campos están vacíos
    expect(submitButton).toBeDisabled();
  });

  it('habilita el botón cuando se llenan todos los campos', async () => {
    render(
      <BrowserRouter>
        <PublicAccess />
      </BrowserRouter>
    );

    const numeroSolicitudInput = screen.getByLabelText(/Número de Solicitud/i);
    const numeroDocumentoInput = screen.getByLabelText(/Número de Pasaporte/i);
    const submitButton = screen.getByRole('button', { name: /Consultar Solicitud/i });

    fireEvent.change(numeroSolicitudInput, { target: { value: 'PPSH-2025-00001' } });
    fireEvent.change(numeroDocumentoInput, { target: { value: 'N123456789' } });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('convierte el número de solicitud a mayúsculas', async () => {
    render(
      <BrowserRouter>
        <PublicAccess />
      </BrowserRouter>
    );

    const numeroSolicitudInput = screen.getByLabelText(/Número de Solicitud/i) as HTMLInputElement;

    fireEvent.change(numeroSolicitudInput, { target: { value: 'ppsh-2025-00001' } });

    await waitFor(() => {
      expect(numeroSolicitudInput.value).toBe('PPSH-2025-00001');
    });
  });

  it('cambia el label del documento según el tipo seleccionado', async () => {
    render(
      <BrowserRouter>
        <PublicAccess />
      </BrowserRouter>
    );

    // Por defecto debe mostrar "Pasaporte"
    expect(screen.getByLabelText(/Número de Pasaporte/i)).toBeInTheDocument();

    // Cambiar a Cédula
    const tipoDocumentoSelect = screen.getByLabelText(/Tipo de Documento/i);
    fireEvent.change(tipoDocumentoSelect, { target: { value: 'CEDULA' } });

    await waitFor(() => {
      expect(screen.getByLabelText(/Número de Cédula/i)).toBeInTheDocument();
    });
  });
});
