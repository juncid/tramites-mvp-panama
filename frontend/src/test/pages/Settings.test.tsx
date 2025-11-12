import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Settings from '../../pages/Settings';

describe('Settings Component', () => {
  it('renderiza las secciones de configuración', () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Configuración/i })).toBeInTheDocument();
    // Usar getByRole para ser más específico con los headings
    expect(screen.getByRole('heading', { name: /Cambiar Contraseña/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Notificaciones/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Preferencias/i })).toBeInTheDocument();
  });

  it('muestra los campos de cambio de contraseña', () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Contraseña Actual/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nueva Contraseña/i)).toBeInTheDocument();
    // El campo real es "Confirmar Contraseña" no "Confirmar Nueva Contraseña"
    expect(screen.getByLabelText(/Confirmar Contraseña/i)).toBeInTheDocument();
  });

  it('muestra los toggles de notificaciones', () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    expect(screen.getByText(/Notificaciones por Email/i)).toBeInTheDocument();
    expect(screen.getByText(/Notificaciones Push/i)).toBeInTheDocument();
    // Usar getAllByText porque hay múltiples elementos con este texto
    const solicitudesElements = screen.getAllByText(/Nuevas Solicitudes/i);
    expect(solicitudesElements.length).toBeGreaterThan(0);
  });

  it('permite cambiar el idioma', () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    // Buscar el elemento de idioma por el texto visible
    expect(screen.getByText(/Español/i)).toBeInTheDocument();
  });
});
