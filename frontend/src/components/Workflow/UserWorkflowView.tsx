/**
 * Vista principal del workflow para usuarios
 * Muestra el workflow filtrado por perfil del usuario con indicador de progreso
 * y permite la ejecución de etapas
 */
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import {
  RefreshOutlined as RefreshIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { WorkflowProgressIndicator } from './WorkflowProgressIndicator';
import { useWorkflowState } from '../../hooks/useWorkflowState';

interface UserWorkflowViewProps {
  instanciaId: number;
  perfil: string;
  onEtapaClick?: (etapaId: number) => void;
}

/**
 * Componente principal que muestra el workflow desde la perspectiva del usuario
 * con filtrado por perfil y progreso visual
 */
export const UserWorkflowView: React.FC<UserWorkflowViewProps> = ({
  instanciaId,
  perfil,
  onEtapaClick,
}) => {
  const { workflowState, loading, error, refetch } = useWorkflowState(instanciaId, perfil);

  // Estado de carga
  if (loading && !workflowState) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Estado de error
  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={refetch}>
            Reintentar
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  // No hay datos
  if (!workflowState) {
    return (
      <Alert severity="info">
        No se encontró información del trámite
      </Alert>
    );
  }

  // Datos del workflow
  const { etapa_actual, etapas_visibles, progreso, num_expediente, estado, fecha_inicio } = workflowState;

  return (
    <Box>
      {/* Encabezado con información del trámite */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h5" component="h1" gutterBottom>
                Trámite: {num_expediente}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip 
                  label={estado} 
                  color={
                    estado === 'COMPLETADO' ? 'success' :
                    estado === 'EN_PROCESO' ? 'primary' :
                    estado === 'CANCELADO' ? 'error' :
                    'default'
                  }
                  size="small"
                />
                <Chip 
                  label={`Perfil: ${perfil}`} 
                  variant="outlined"
                  size="small"
                />
              </Stack>
            </Box>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={refetch}
              disabled={loading}
            >
              Actualizar
            </Button>
          </Box>

          <Divider />

          {/* Información adicional */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Fecha de inicio
              </Typography>
              <Typography variant="body2">
                {new Date(fecha_inicio).toLocaleDateString('es-PA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            </Box>
            
            {workflowState.fecha_estimada_fin && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Fecha estimada de finalización
                </Typography>
                <Typography variant="body2">
                  {new Date(workflowState.fecha_estimada_fin).toLocaleDateString('es-PA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
            )}

            {workflowState.fecha_fin && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Fecha de finalización
                </Typography>
                <Typography variant="body2">
                  {new Date(workflowState.fecha_fin).toLocaleDateString('es-PA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
            )}

            {workflowState.asignado_a && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Asignado a
                </Typography>
                <Typography variant="body2">
                  {workflowState.asignado_a}
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </Paper>

      {/* Indicador de progreso del workflow */}
      <WorkflowProgressIndicator
        etapas={etapas_visibles}
        etapaActualId={etapa_actual?.id}
        progreso={progreso}
        orientation="horizontal"
      />

      {/* Información de la etapa actual */}
      {etapa_actual && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="primary" />
              <Typography variant="h6">
                Etapa actual: {etapa_actual.nombre}
              </Typography>
            </Box>

            <Alert severity="info">
              {etapa_actual.tipo_etapa === 'PRESENCIAL' ? (
                <>
                  Esta es una etapa <strong>presencial</strong>. Deberás acudir a nuestras oficinas para completarla.
                </>
              ) : etapa_actual.tipo_etapa === 'COMPUERTA' ? (
                <>
                  Esta etapa es de <strong>validación automática</strong>. El sistema determinará automáticamente los siguientes pasos.
                </>
              ) : (
                <>
                  Completa el formulario a continuación para avanzar al siguiente paso del trámite.
                </>
              )}
            </Alert>

            {/* Botón para ejecutar la etapa */}
            {etapa_actual.tipo_etapa === 'ETAPA' && onEtapaClick && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => onEtapaClick(etapa_actual.id)}
                >
                  Completar etapa
                </Button>
              </Box>
            )}
          </Stack>
        </Paper>
      )}

      {/* Mensaje de workflow completado */}
      {estado === 'COMPLETADO' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="bold" gutterBottom>
            ¡Trámite completado exitosamente!
          </Typography>
          <Typography variant="body2">
            Tu trámite ha sido procesado y finalizado. Puedes descargar los documentos resultantes desde la sección de documentos.
          </Typography>
        </Alert>
      )}

      {/* Mensaje si no hay etapa actual y no está completado */}
      {!etapa_actual && estado !== 'COMPLETADO' && (
        <Alert severity="warning">
          No hay etapas disponibles para tu perfil en este momento. El trámite puede estar siendo procesado por otro departamento.
        </Alert>
      )}
    </Box>
  );
};
