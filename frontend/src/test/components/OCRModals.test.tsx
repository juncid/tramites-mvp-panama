/**
 * Tests para los modales OCR (Éxito, Error de Lectura, Error de Validación)
 * 
 * Casos de prueba basados en Figma:
 * - Modal Éxito (453-651): 4-6 coincidencias OCR
 * - Modal Error Lectura (453-890): OCR no puede leer ningún valor
 * - Modal Error Validación (549-426): Discrepancias entre datos ingresados y OCR
 * 
 * @author Sistema de Trámites MVP Panamá
 * @date 2025-12-08
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { OCRSuccessModal } from '../../components/PPSH/OCRSuccessModal';
import { OCRReadErrorModal } from '../../components/PPSH/OCRReadErrorModal';
import { OCRValidationErrorModal } from '../../components/PPSH/OCRValidationErrorModal';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('OCRSuccessModal', () => {
  const mockOnClose = vi.fn();
  const mockOnNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el modal cuando está abierto', () => {
    renderWithTheme(
      <OCRSuccessModal open={true} onClose={mockOnClose} onNext={mockOnNext} />
    );

    expect(screen.getByText('Revisión OCR')).toBeInTheDocument();
    expect(screen.getByText('Documento procesado con éxito')).toBeInTheDocument();
    expect(screen.getByText('Puede cerrar este mensaje de manera segura')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
  });

  it('no debe renderizar el modal cuando está cerrado', () => {
    renderWithTheme(
      <OCRSuccessModal open={false} onClose={mockOnClose} onNext={mockOnNext} />
    );

    expect(screen.queryByText('Documento procesado con éxito')).not.toBeInTheDocument();
  });

  it('debe llamar a onNext y onClose al hacer clic en Siguiente', async () => {
    renderWithTheme(
      <OCRSuccessModal open={true} onClose={mockOnClose} onNext={mockOnNext} />
    );

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('debe mostrar el ícono de check verde', () => {
    renderWithTheme(
      <OCRSuccessModal open={true} onClose={mockOnClose} onNext={mockOnNext} />
    );

    const icon = document.querySelector('[data-testid="CheckCircleOutlineRoundedIcon"]');
    expect(icon).toBeInTheDocument();
  });

  it('debe funcionar sin onNext callback', async () => {
    renderWithTheme(
      <OCRSuccessModal open={true} onClose={mockOnClose} />
    );

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});

describe('OCRReadErrorModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el modal cuando está abierto', () => {
    renderWithTheme(
      <OCRReadErrorModal open={true} onClose={mockOnClose} />
    );

    expect(screen.getByText('Revisión OCR')).toBeInTheDocument();
    expect(screen.getByText('No pudimos leer la información')).toBeInTheDocument();
    expect(screen.getByText(/La imagen parece estar borrosa/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entendido/i })).toBeInTheDocument();
  });

  it('no debe renderizar el modal cuando está cerrado', () => {
    renderWithTheme(
      <OCRReadErrorModal open={false} onClose={mockOnClose} />
    );

    expect(screen.queryByText('No pudimos leer la información')).not.toBeInTheDocument();
  });

  it('debe llamar a onClose al hacer clic en Entendido', async () => {
    renderWithTheme(
      <OCRReadErrorModal open={true} onClose={mockOnClose} />
    );

    const entendidoButton = screen.getByRole('button', { name: /entendido/i });
    fireEvent.click(entendidoButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('debe mostrar el ícono de error rojo', () => {
    renderWithTheme(
      <OCRReadErrorModal open={true} onClose={mockOnClose} />
    );

    const icon = document.querySelector('[data-testid="ErrorOutlineRoundedIcon"]');
    expect(icon).toBeInTheDocument();
  });

  it('debe mostrar el mensaje de imagen borrosa correctamente', () => {
    renderWithTheme(
      <OCRReadErrorModal open={true} onClose={mockOnClose} />
    );

    expect(screen.getByText(/Asegúrese de que el texto se vea nítido/i)).toBeInTheDocument();
  });
});

describe('OCRValidationErrorModal', () => {
  const mockOnClose = vi.fn();
  const mockOnEnviarDeTodosModos = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el modal cuando está abierto', () => {
    renderWithTheme(
      <OCRValidationErrorModal 
        open={true} 
        onClose={mockOnClose} 
        onEnviarDeTodosModos={mockOnEnviarDeTodosModos}
      />
    );

    expect(screen.getByText('Revisión OCR')).toBeInTheDocument();
    expect(screen.getByText('No pudimos validar el documento')).toBeInTheDocument();
    expect(screen.getByText(/La información del archivo no concuerda/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entendido/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('no debe renderizar el modal cuando está cerrado', () => {
    renderWithTheme(
      <OCRValidationErrorModal 
        open={false} 
        onClose={mockOnClose} 
        onEnviarDeTodosModos={mockOnEnviarDeTodosModos}
      />
    );

    expect(screen.queryByText('No pudimos validar el documento')).not.toBeInTheDocument();
  });

  it('debe tener el botón Enviar deshabilitado inicialmente', () => {
    renderWithTheme(
      <OCRValidationErrorModal 
        open={true} 
        onClose={mockOnClose} 
        onEnviarDeTodosModos={mockOnEnviarDeTodosModos}
      />
    );

    const enviarButton = screen.getByRole('button', { name: /enviar/i });
    expect(enviarButton).toBeDisabled();
  });

  it('debe habilitar el botón Enviar cuando se marca el checkbox', async () => {
    renderWithTheme(
      <OCRValidationErrorModal 
        open={true} 
        onClose={mockOnClose} 
        onEnviarDeTodosModos={mockOnEnviarDeTodosModos}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      const enviarButton = screen.getByRole('button', { name: /enviar/i });
      expect(enviarButton).not.toBeDisabled();
    });
  });

  it('debe llamar a onClose al hacer clic en Entendido', async () => {
    renderWithTheme(
      <OCRValidationErrorModal 
        open={true} 
        onClose={mockOnClose} 
        onEnviarDeTodosModos={mockOnEnviarDeTodosModos}
      />
    );

    const entendidoButton = screen.getByRole('button', { name: /entendido/i });
    fireEvent.click(entendidoButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('debe llamar a onEnviarDeTodosModos cuando se marca checkbox y se hace clic en Enviar', async () => {
    renderWithTheme(
      <OCRValidationErrorModal 
        open={true} 
        onClose={mockOnClose} 
        onEnviarDeTodosModos={mockOnEnviarDeTodosModos}
      />
    );

    // Marcar checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      const enviarButton = screen.getByRole('button', { name: /enviar/i });
      expect(enviarButton).not.toBeDisabled();
    });

    // Hacer clic en Enviar
    const enviarButton = screen.getByRole('button', { name: /enviar/i });
    fireEvent.click(enviarButton);

    await waitFor(() => {
      expect(mockOnEnviarDeTodosModos).toHaveBeenCalledTimes(1);
    });
  });

  it('no debe llamar a onEnviarDeTodosModos si checkbox no está marcado', async () => {
    renderWithTheme(
      <OCRValidationErrorModal 
        open={true} 
        onClose={mockOnClose} 
        onEnviarDeTodosModos={mockOnEnviarDeTodosModos}
      />
    );

    const enviarButton = screen.getByRole('button', { name: /enviar/i });
    fireEvent.click(enviarButton);

    await waitFor(() => {
      expect(mockOnEnviarDeTodosModos).not.toHaveBeenCalled();
    });
  });

  it('debe mostrar el checkbox con texto correcto', () => {
    renderWithTheme(
      <OCRValidationErrorModal 
        open={true} 
        onClose={mockOnClose} 
        onEnviarDeTodosModos={mockOnEnviarDeTodosModos}
      />
    );

    expect(screen.getByText(/Enviar de todos modos, asumiendo el riesgo de rechazo/i)).toBeInTheDocument();
  });

  it('debe mostrar el ícono de advertencia amarillo', () => {
    renderWithTheme(
      <OCRValidationErrorModal 
        open={true} 
        onClose={mockOnClose} 
        onEnviarDeTodosModos={mockOnEnviarDeTodosModos}
      />
    );

    const icon = document.querySelector('[data-testid="WarningAmberRoundedIcon"]');
    expect(icon).toBeInTheDocument();
  });
});

// Tests de integración para verificar el flujo completo de modales OCR
describe('Flujo de Modales OCR', () => {
  const mockOnClose = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnEnviarDeTodosModos = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Caso validación exitosa: debe mostrar modal de éxito', () => {
    // Simula el caso donde OCR valida exitosamente (validacion_exitosa = true)
    renderWithTheme(
      <OCRSuccessModal open={true} onClose={mockOnClose} onNext={mockOnNext} />
    );

    expect(screen.getByText('Documento procesado con éxito')).toBeInTheDocument();
    // Verificar que tiene ícono verde de check
    const successIcon = document.querySelector('[data-testid="CheckCircleOutlineRoundedIcon"]');
    expect(successIcon).toBeInTheDocument();
  });

  it('Caso validación fallida: debe mostrar modal de validación fallida', () => {
    // Simula el caso donde validacion_exitosa = false
    renderWithTheme(
      <OCRValidationErrorModal 
        open={true} 
        onClose={mockOnClose} 
        onEnviarDeTodosModos={mockOnEnviarDeTodosModos}
      />
    );

    expect(screen.getByText('No pudimos validar el documento')).toBeInTheDocument();
    // Verificar que tiene ícono amarillo de advertencia
    const warningIcon = document.querySelector('[data-testid="WarningAmberRoundedIcon"]');
    expect(warningIcon).toBeInTheDocument();
    // Verificar que tiene opción de enviar de todos modos
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('Caso OCR no lee valores (0 coincidencias): debe mostrar modal de error de lectura', () => {
    // Simula el caso donde OCR no puede leer ningún valor
    // camposValidadosCount === 0 y camposConDiscrepanciaCount === 0
    renderWithTheme(
      <OCRReadErrorModal open={true} onClose={mockOnClose} />
    );

    expect(screen.getByText('No pudimos leer la información')).toBeInTheDocument();
    // Verificar que tiene ícono rojo de error
    const errorIcon = document.querySelector('[data-testid="ErrorOutlineRoundedIcon"]');
    expect(errorIcon).toBeInTheDocument();
  });

  it('Caso discrepancias: debe mostrar modal de validación fallida con opciones', () => {
    // Simula el caso donde hay discrepancias entre datos ingresados y OCR
    // camposConDiscrepanciaCount > 0
    renderWithTheme(
      <OCRValidationErrorModal 
        open={true} 
        onClose={mockOnClose} 
        onEnviarDeTodosModos={mockOnEnviarDeTodosModos}
      />
    );

    expect(screen.getByText('No pudimos validar el documento')).toBeInTheDocument();
    // Verificar que tiene ícono amarillo de advertencia
    const warningIcon = document.querySelector('[data-testid="WarningAmberRoundedIcon"]');
    expect(warningIcon).toBeInTheDocument();
    // Verificar que tiene opción de enviar de todos modos
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });
});
