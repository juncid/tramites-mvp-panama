import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Paper,
} from '@mui/material';
import { FlowStep } from '../../../types/ppsh.types';
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';

interface FlowViewProps {
  procesoId?: string;
  solicitudId?: string;
}

/**
 * Vista de Flujo - Tab 2
 * Muestra el flujo de pasos del proceso PPSH
 */
export const FlowView = ({ procesoId, solicitudId }: FlowViewProps) => {
  const [steps, setSteps] = useState<FlowStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Reemplazar con llamada real a API
    const loadSteps = async () => {
      setLoading(true);
      // Mock data
      setTimeout(() => {
        setSteps([
          {
            id: 1,
            nombre: 'Inicio del proceso',
            descripcion: 'El solicitante inicia el proceso de PPSH y proporciona información básica',
            orden: 1,
            completado: true,
            actual: false,
            fechaCompletado: '2025-11-11T10:00:00',
          },
          {
            id: 2,
            nombre: 'Carga de documentos',
            descripcion: 'El solicitante carga todos los documentos requeridos según el Decreto N° 6',
            orden: 2,
            completado: true,
            actual: false,
            fechaCompletado: '2025-11-11T14:30:00',
          },
          {
            id: 3,
            nombre: 'Revisión de documentos',
            descripcion: 'El sistema OCR y los funcionarios revisan la validez y completitud de los documentos',
            orden: 3,
            completado: false,
            actual: true,
          },
          {
            id: 4,
            nombre: 'Aprobación final',
            descripcion: 'El Servicio Nacional de Migración realiza la aprobación final del trámite',
            orden: 4,
            completado: false,
            actual: false,
          },
          {
            id: 5,
            nombre: 'Emisión de permiso',
            descripcion: 'Se emite el Permiso de Protección de Seguridad Humanitaria',
            orden: 5,
            completado: false,
            actual: false,
          },
        ]);
        setLoading(false);
      }, 500);
    };

    loadSteps();
  }, [procesoId, solicitudId]);

  const getActiveStep = (): number => {
    const activeIndex = steps.findIndex((step) => step.actual);
    return activeIndex >= 0 ? activeIndex : steps.filter((s) => s.completado).length;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (steps.length === 0) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography color="text.secondary">No hay pasos definidos para este proceso</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography
        variant="h5"
        sx={{
          fontSize: { xs: '20px', sm: '24px' },
          fontWeight: 600,
          color: '#333',
          mb: 3,
        }}
      >
        Flujo del proceso PPSH
      </Typography>

      <Stepper
        activeStep={getActiveStep()}
        orientation="vertical"
        sx={{
          '& .MuiStepLabel-root .Mui-completed': {
            color: '#0e5fa6',
          },
          '& .MuiStepLabel-root .Mui-active': {
            color: '#0e5fa6',
          },
          '& .MuiStepConnector-line': {
            borderColor: '#e0e0e0',
          },
        }}
      >
        {steps.map((step) => (
          <Step key={step.id} completed={step.completado} active={step.actual}>
            <StepLabel
              StepIconComponent={() => (
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {step.completado ? (
                    <CheckCircle sx={{ fontSize: 28, color: '#0e5fa6' }} />
                  ) : step.actual ? (
                    <RadioButtonUnchecked sx={{ fontSize: 28, color: '#0e5fa6' }} />
                  ) : (
                    <RadioButtonUnchecked sx={{ fontSize: 28, color: '#ccc' }} />
                  )}
                </Box>
              )}
              sx={{
                '& .MuiStepLabel-label': {
                  fontSize: '16px',
                  fontWeight: step.actual || step.completado ? 600 : 400,
                  color: step.actual || step.completado ? '#333' : '#999',
                },
              }}
            >
              {step.nombre}
            </StepLabel>
            <StepContent>
              <Typography
                sx={{
                  fontSize: '14px',
                  color: '#666',
                  mb: 2,
                }}
              >
                {step.descripcion}
              </Typography>
              {step.completado && step.fechaCompletado && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    backgroundColor: '#f5f5f5',
                    display: 'inline-block',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '12px',
                      color: '#666',
                    }}
                  >
                    Completado el {new Date(step.fechaCompletado).toLocaleString('es-PA', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </Typography>
                </Paper>
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};
