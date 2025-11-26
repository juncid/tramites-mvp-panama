import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { Tramites } from '../../pages/Tramites';

describe('Tramites Component', () => {
  it('renderiza el título del proceso', () => {
    render(
      <BrowserRouter>
        <Tramites />
      </BrowserRouter>
    );

    const titles = screen.getAllByText(/Permiso de Protección de Seguridad Humanitaria/i);
    expect(titles.length).toBeGreaterThan(0);
  });

  it('renderiza los breadcrumbs correctamente', () => {
    render(
      <BrowserRouter>
        <Tramites />
      </BrowserRouter>
    );

    const inicioLinks = screen.getAllByText(/Inicio/i);
    expect(inicioLinks.length).toBeGreaterThan(0);
    
    const procesosLinks = screen.getAllByText(/Procesos/i);
    expect(procesosLinks.length).toBeGreaterThan(0);
  });

  it('muestra las pestañas de navegación', () => {
    render(
      <BrowserRouter>
        <Tramites />
      </BrowserRouter>
    );

    expect(screen.getByRole('tab', { name: /General/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Flujo/i })).toBeInTheDocument();
  });

  it('permite cambiar entre tabs', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Tramites />
      </BrowserRouter>
    );

    const generalTab = screen.getByRole('tab', { name: /General/i });
    await user.click(generalTab);

    expect(generalTab).toHaveAttribute('aria-selected', 'true');
  });
});
