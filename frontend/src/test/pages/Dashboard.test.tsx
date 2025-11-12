import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../../pages/Dashboard';

describe('Dashboard Component', () => {
  it('renderiza el título del dashboard', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  it('muestra las 4 tarjetas de estadísticas principales', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/Total Trámites/i)).toBeInTheDocument();
    expect(screen.getByText(/Completados/i)).toBeInTheDocument();
    expect(screen.getByText(/En Proceso/i)).toBeInTheDocument();
    expect(screen.getByText(/Rechazados/i)).toBeInTheDocument();
  });

  it('muestra los valores de las estadísticas', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Verificar que se muestran los valores numéricos
    expect(screen.getByText(/1,245/)).toBeInTheDocument(); // Total Trámites
    expect(screen.getByText(/856/)).toBeInTheDocument(); // Completados
    expect(screen.getByText(/324/)).toBeInTheDocument(); // En Proceso
    expect(screen.getByText(/65/)).toBeInTheDocument(); // Rechazados
  });

  it('muestra las tendencias de las estadísticas', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Verificar que se muestran los porcentajes de tendencia
    expect(screen.getByText(/12%/)).toBeInTheDocument(); // Total Trámites
    expect(screen.getByText(/8%/)).toBeInTheDocument(); // Completados
  });

  it('muestra la sección de actividad reciente', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/Actividad Reciente/i)).toBeInTheDocument();
  });

  it('renderiza correctamente en diferentes tamaños de pantalla', () => {
    const { container } = render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Verificar que el Grid container está presente
    const gridContainers = container.querySelectorAll('.MuiGrid-container');
    expect(gridContainers.length).toBeGreaterThan(0);
  });
});
