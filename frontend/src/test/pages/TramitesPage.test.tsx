import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { TramitesPage } from '../../pages/TramitesPage';

// Mock del hook useTramites
vi.mock('../../hooks', () => ({
  useTramites: vi.fn(() => ({
    tramites: [],
    loading: false,
    error: null,
    createTramite: vi.fn(),
    updateTramite: vi.fn(),
    deleteTramite: vi.fn(),
  })),
}));

// Mock de los componentes
vi.mock('../../components', () => ({
  TramiteForm: () => <div data-testid="tramite-form">Tramite Form</div>,
  TramiteList: () => <div data-testid="tramite-list">Tramite List</div>,
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
  ErrorAlert: () => <div data-testid="error-alert">Error</div>,
}));

describe('TramitesPage Component', () => {
  it('renderiza el título correctamente', () => {
    render(
      <BrowserRouter>
        <TramitesPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Lista de Trámites/i)).toBeInTheDocument();
  });

  it('renderiza el formulario de trámites', () => {
    render(
      <BrowserRouter>
        <TramitesPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('tramite-form')).toBeInTheDocument();
  });

  it('renderiza la lista de trámites', () => {
    render(
      <BrowserRouter>
        <TramitesPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('tramite-list')).toBeInTheDocument();
  });
});
