import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import BpmnPage from '../../pages/BpmnPage';

// Mock de componentes hijo
vi.mock('../../components/bpmn', () => ({
  BpmnEditor: ({ onDiagramChange, onSave }: any) => (
    <div data-testid="bpmn-editor">
      <button onClick={() => onDiagramChange('<xml>diagram</xml>')}>Change Diagram</button>
      <button onClick={() => onSave('<xml>diagram</xml>')}>Save Diagram</button>
    </div>
  ),
}));

vi.mock('../../components/common', () => ({
  BreadCrumbsList: ({ items }: any) => (
    <div data-testid="breadcrumbs">
      {items.map((item: any, i: number) => (
        <span key={i}>{item.label}</span>
      ))}
    </div>
  ),
}));

describe('BpmnPage Component', () => {
  it('renderiza el título correctamente', () => {
    render(
      <BrowserRouter>
        <BpmnPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Editor BPMN/i)).toBeInTheDocument();
  });

  it('renderiza los breadcrumbs correctamente', () => {
    render(
      <BrowserRouter>
        <BpmnPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Inicio/i)).toBeInTheDocument();
    expect(screen.getByText(/Procesos/i)).toBeInTheDocument();
    expect(screen.getByText(/Editor BPMN/i)).toBeInTheDocument();
  });

  it('renderiza el editor BPMN', () => {
    render(
      <BrowserRouter>
        <BpmnPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('bpmn-editor')).toBeInTheDocument();
  });

  it('muestra el botón de exportar', () => {
    render(
      <BrowserRouter>
        <BpmnPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /Exportar BPMN/i })).toBeInTheDocument();
  });
});
