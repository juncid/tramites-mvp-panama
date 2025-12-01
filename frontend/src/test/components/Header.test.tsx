import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../../components/Layout/Header';

// Mock useAuth
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    isAdmin: true,
    isFuncionario: false,
    isCiudadano: false,
    usuario: {
      id: 1,
      nombre: 'Juan Pérez',
      email: 'juan.perez@migracion.gob.pa',
      perfil: 'ADMIN',
    },
  }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
  };
});

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el componente correctamente', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // El Header debe renderizar sin errores
    expect(document.body).toBeDefined();
  });

  it('muestra el nombre del usuario en desktop', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // El nombre "Juan Pérez" aparece en el header (puede haber múltiples instancias)
    const userNames = screen.getAllByText(/Juan Pérez/i);
    expect(userNames.length).toBeGreaterThan(0);
  });

  it('muestra el avatar del usuario con iniciales', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // El avatar con las iniciales JP debe estar presente
    const avatars = screen.getAllByText('JP');
    expect(avatars.length).toBeGreaterThan(0);
  });

  it('muestra las opciones de navegación en la barra azul', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // Tabs de navegación
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Solicitudes')).toBeInTheDocument();
    // Procesos solo visible para admin
    expect(screen.getByText('Procesos')).toBeInTheDocument();
  });

  it('muestra el botón Menú para mobile', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // El texto "Menú" aparece para mobile (oculto en desktop)
    expect(screen.getByText('Menú')).toBeInTheDocument();
  });
});
