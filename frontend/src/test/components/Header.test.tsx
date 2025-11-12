import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../../components/Layout/Header';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

describe('Header Component', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      nombres: 'Juan',
      apellidos: 'Pérez',
      email: 'juan.perez@example.com',
    }));
  });

  it('renderiza el logo correctamente', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const logo = screen.getByAltText(/Gobierno Nacional/i);
    expect(logo).toBeInTheDocument();
  });

  it('muestra el nombre del usuario', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
  });

  it('muestra el avatar del usuario', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // El avatar con las iniciales JP debe estar presente
    const avatar = screen.getByText('JP');
    expect(avatar).toBeInTheDocument();
  });

  it('muestra las opciones de navegación', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText(/Inicio/i)).toBeInTheDocument();
    expect(screen.getByText(/Solicitudes/i)).toBeInTheDocument();
    expect(screen.getByText(/Procesos/i)).toBeInTheDocument();
  });

  it('muestra el menú desplegable', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText(/Menú/i)).toBeInTheDocument();
  });
});
