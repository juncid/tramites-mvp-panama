import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { PageHero, BreadcrumbItem } from '../../components/common/PageHero';

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('PageHero Component', () => {
  const mockBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', path: '/' },
    { label: 'Procesos', path: '/procesos' },
    { label: 'Detalles' },
  ];

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renderiza el título correctamente', () => {
    render(
      <BrowserRouter>
        <PageHero title="Título de Prueba" breadcrumbs={mockBreadcrumbs} />
      </BrowserRouter>
    );

    expect(screen.getByText('Título de Prueba')).toBeInTheDocument();
  });

  it('renderiza todos los breadcrumbs', () => {
    render(
      <BrowserRouter>
        <PageHero title="Test" breadcrumbs={mockBreadcrumbs} />
      </BrowserRouter>
    );

    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Procesos')).toBeInTheDocument();
    expect(screen.getByText('Detalles')).toBeInTheDocument();
  });

  it('renderiza el icono Home en el primer breadcrumb', () => {
    render(
      <BrowserRouter>
        <PageHero title="Test" breadcrumbs={mockBreadcrumbs} />
      </BrowserRouter>
    );

    const homeLink = screen.getByText('Inicio');
    expect(homeLink.parentElement).toContainHTML('svg');
  });

  it('navega cuando se hace click en un breadcrumb con path', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <PageHero title="Test" breadcrumbs={mockBreadcrumbs} />
      </BrowserRouter>
    );

    const inicioLink = screen.getByText('Inicio');
    await user.click(inicioLink);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('no navega cuando se hace click en el último breadcrumb', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <PageHero title="Test" breadcrumbs={mockBreadcrumbs} />
      </BrowserRouter>
    );

    const detallesText = screen.getByText('Detalles');
    await user.click(detallesText);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('aplica estilos de fondo azul', () => {
    const { container } = render(
      <BrowserRouter>
        <PageHero title="Test" breadcrumbs={mockBreadcrumbs} />
      </BrowserRouter>
    );

    const hero = container.firstChild;
    expect(hero).toHaveStyle({ backgroundColor: '#0e5fa6' });
  });
});
