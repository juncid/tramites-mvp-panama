import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { Reportes } from '../../pages/Reportes';

describe('Reportes Component', () => {
  it('renderiza el título correctamente', () => {
    render(
      <BrowserRouter>
        <Reportes />
      </BrowserRouter>
    );

    expect(screen.getByText(/Reportes y Estadísticas/i)).toBeInTheDocument();
  });

  it('muestra el mensaje de construcción', () => {
    render(
      <BrowserRouter>
        <Reportes />
      </BrowserRouter>
    );

    expect(screen.getByText(/Página de reportes en construcción/i)).toBeInTheDocument();
  });
});
