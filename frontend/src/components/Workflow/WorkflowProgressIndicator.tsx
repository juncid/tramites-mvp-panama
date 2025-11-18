/**
 * Componente para mostrar el progreso del workflow
 * Visualización tipo stepper/timeline con estados
 */
import React from 'react';
import {
  Box,
  Step,
  StepLabel,
  Stepper,
  StepConnector,
  Typography,
  Chip,
  Paper,
  styled,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Lock as LockIcon,
  PlayCircle as PlayCircleIcon,
} from '@mui/icons-material';

interface EtapaVisible {
  id: number;
  codigo: string;
  nombre: string;
  orden: number;
  tipo_etapa: string;
  completada: boolean;
  es_actual: boolean;
}

interface WorkflowProgressIndicatorProps {
  etapas: EtapaVisible[];
  etapaActualId?: number | null;
  progreso: {
    total_etapas: number;
    completadas: number;
    porcentaje: number;
  };
  orientation?: 'horizontal' | 'vertical';
}

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  '&.MuiStepConnector-root': {
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  '& .MuiStepConnector-line': {
    borderColor: theme.palette.grey[300],
    borderTopWidth: 3,
    borderRadius: 1,
  },
  '&.Mui-active .MuiStepConnector-line': {
    borderColor: theme.palette.primary.main,
  },
  '&.Mui-completed .MuiStepConnector-line': {
    borderColor: theme.palette.success.main,
  },
}));

const StepIconWrapper = styled('div')<{ ownerState: { completed?: boolean; active?: boolean } }>(
  ({ theme, ownerState }) => ({
    color: theme.palette.grey[400],
    display: 'flex',
    alignItems: 'center',
    ...(ownerState.active && {
      color: theme.palette.primary.main,
    }),
    ...(ownerState.completed && {
      color: theme.palette.success.main,
    }),
    '& .StepIcon-root': {
      width: 32,
      height: 32,
    },
  })
);

function CustomStepIcon(props: {
  active?: boolean;
  completed?: boolean;
  icon: React.ReactNode;
}) {
  const { active, completed } = props;

  const icons: { [index: string]: React.ReactElement } = {
    completed: <CheckCircleIcon className="StepIcon-root" />,
    active: <PlayCircleIcon className="StepIcon-root" />,
    pending: <RadioButtonUncheckedIcon className="StepIcon-root" />,
    locked: <LockIcon className="StepIcon-root" />,
  };

  let icon = icons.pending;
  if (completed) {
    icon = icons.completed;
  } else if (active) {
    icon = icons.active;
  }

  return (
    <StepIconWrapper ownerState={{ completed, active }}>
      {icon}
    </StepIconWrapper>
  );
}

/**
 * Componente principal que muestra el progreso del workflow
 */
export const WorkflowProgressIndicator: React.FC<WorkflowProgressIndicatorProps> = ({
  etapas,
  etapaActualId,
  progreso,
  orientation = 'horizontal',
}) => {
  // Ordenar etapas por orden
  const etapasOrdenadas = [...etapas].sort((a, b) => a.orden - b.orden);

  // Determinar el índice activo
  const activeStep = etapasOrdenadas.findIndex((e) => e.es_actual);

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      {/* Header con progreso */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="h2">
            Progreso del Trámite
          </Typography>
          <Chip
            label={`${progreso.completadas} de ${progreso.total_etapas} etapas`}
            color="primary"
            variant="outlined"
          />
        </Box>
        
        {/* Barra de progreso */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              flex: 1,
              height: 8,
              backgroundColor: (theme) => theme.palette.grey[200],
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${progreso.porcentaje}%`,
                backgroundColor: (theme) => theme.palette.success.main,
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
          <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 50 }}>
            {Math.round(progreso.porcentaje)}%
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Stepper
        activeStep={activeStep}
        connector={<CustomConnector />}
        orientation={orientation}
        sx={{
          ...(orientation === 'vertical' && {
            '& .MuiStep-root': {
              mb: 2,
            },
          }),
        }}
      >
        {etapasOrdenadas.map((etapa) => {
          const isCompleted = etapa.completada;
          const isActive = etapa.es_actual;
          const isPending = !isCompleted && !isActive;

          return (
            <Step key={etapa.id} completed={isCompleted}>
              <StepLabel
                StepIconComponent={CustomStepIcon}
                optional={
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                    {isCompleted && (
                      <Chip label="Completada" size="small" color="success" />
                    )}
                    {isActive && (
                      <Chip label="En progreso" size="small" color="primary" />
                    )}
                    {isPending && (
                      <Chip label="Pendiente" size="small" variant="outlined" />
                    )}
                    {etapa.tipo_etapa === 'PRESENCIAL' && (
                      <Chip label="Presencial" size="small" color="info" variant="outlined" />
                    )}
                  </Box>
                }
              >
                <Typography
                  variant="body1"
                  fontWeight={isActive ? 'bold' : 'normal'}
                  color={isCompleted ? 'success.main' : isActive ? 'primary.main' : 'text.secondary'}
                >
                  {etapa.nombre}
                </Typography>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>

      {/* Leyenda */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CheckCircleIcon color="success" fontSize="small" />
          <Typography variant="caption">Completada</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PlayCircleIcon color="primary" fontSize="small" />
          <Typography variant="caption">En progreso</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
          <Typography variant="caption">Pendiente</Typography>
        </Box>
      </Box>
    </Paper>
  );
};
