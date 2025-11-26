import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { Workflow } from '../../pages/Workflow';

describe('Workflow Component', () => {
  it('renderiza el título correctamente', () => {
    render(
      <BrowserRouter>
        <Workflow />
      </BrowserRouter>
    );

    expect(screen.getByText(/Sistema de Workflow/i)).toBeInTheDocument();
  });

  it('muestra el mensaje de construcción', () => {
    render(
      <BrowserRouter>
        <Workflow />
      </BrowserRouter>
    );

    expect(screen.getByText(/Página de workflow en construcción/i)).toBeInTheDocument();
  });
});
