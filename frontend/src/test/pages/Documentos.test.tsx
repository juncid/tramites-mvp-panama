import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { Documentos } from '../../pages/Documentos';

describe('Documentos Component', () => {
  it('renderiza el título correctamente', () => {
    render(
      <BrowserRouter>
        <Documentos />
      </BrowserRouter>
    );

    expect(screen.getByText(/Gestión de Documentos/i)).toBeInTheDocument();
  });

  it('muestra el mensaje de construcción', () => {
    render(
      <BrowserRouter>
        <Documentos />
      </BrowserRouter>
    );

    expect(screen.getByText(/Página de documentos en construcción/i)).toBeInTheDocument();
  });
});
