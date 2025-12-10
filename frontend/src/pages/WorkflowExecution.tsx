import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Button,
  Stack,
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  PlayArrow as PlayArrowIcon,
  History as HistoryIcon,
  Comment as CommentIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { DynamicEtapaView } from '../components/Workflow/DynamicEtapaView';
import { workflowService } from '../services/workflow.service';
import { getApiBaseUrl } from '../utils/apiUrl';

interface RouteParams {
  instanciaId: string;
}

/**
 * Página principal de ejecución de workflows
 * 
 * Características:
 * - Layout de 3 columnas: Sidebar (progreso), Main (formulario), Info (historial/comentarios)
 * - Navegación entre etapas con validación de permisos
 * - Visualización del progreso del workflow
 * - Gestión de respuestas y avance de etapas
 * - Vista dinámica filtrada por permisos de usuario
 */
export const WorkflowExecution: React.FC = () => {
  const { instanciaId, id: solicitudId } = useParams<{ instanciaId?: string; id?: string }>();
  const navigate = useNavigate();
  
  // Estado
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instancia, setInstancia] = useState<any>(null);
  const [workflow, setWorkflow] = useState<any>(null);
  const [vistaActual, setVistaActual] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'formulario' | 'historial' | 'comentarios'>('formulario');
  const [userPerfil] = useState<string>('ADMIN'); // TODO: Obtener del contexto de autenticación (usando ADMIN para testing)
  const [refreshKey, setRefreshKey] = useState(0);
  const [workflowInstanciaId, setWorkflowInstanciaId] = useState<number | null>(null);

  useEffect(() => {
    loadWorkflowInstance();
  }, [instanciaId, solicitudId, refreshKey]);

  const loadWorkflowInstance = async () => {
    setLoading(true);
    setError(null);

    try {
      let numericId: number;

      if (instanciaId) {
        numericId = parseInt(instanciaId);
      } else if (solicitudId) {
        const apiBaseUrl = getApiBaseUrl();
        const response = await fetch(`${apiBaseUrl}/ppsh/solicitudes/${solicitudId}`);
        if (!response.ok) {
          throw new Error('No se pudo obtener la información de la solicitud');
        }
        const data = await response.json();
        numericId = data.workflow_instancia_id;
      } else {
        throw new Error('No se proporcionó instanciaId ni solicitudId');
      }

      setWorkflowInstanciaId(numericId);
      await loadInstancia(numericId);
    } catch (err: any) {
      console.error('Error cargando workflow instance:', err);
      setError(err.message || 'Error al cargar la información');
      setLoading(false);
    }
  };

  const loadInstancia = async (numericId: number) => {
    try {
      // Cargar instancia completa
      const instanciaData = await workflowService.getInstancia(numericId);
      setInstancia(instanciaData);

      // Cargar workflow
      if (instanciaData.workflow_id) {
        const workflowData = await workflowService.getWorkflow(instanciaData.workflow_id);
        setWorkflow(workflowData);
      }

      // Solo cargar vista actual si la instancia NO está completada
      if (instanciaData.estado !== 'COMPLETADA' && instanciaData.etapa_actual_id) {
        const vista = await workflowService.getVistaActual(numericId, userPerfil);
        setVistaActual(vista);
      } else {
        // Instancia completada, no hay vista actual
        setVistaActual(null);
      }
    } catch (err: any) {
      console.error('Error cargando instancia:', err);
      throw new Error(err.response?.data?.detail || 'Error al cargar la instancia');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (respuestas: Record<string, any>) => {
    if (!workflowInstanciaId) return;

    try {
      await workflowService.guardarRespuestasEtapa(workflowInstanciaId, respuestas);
      // Mostrar notificación de éxito
      alert('Respuestas guardadas correctamente');
    } catch (err: any) {
      console.error('Error guardando respuestas:', err);
      throw err;
    }
  };

  const handleComplete = async (respuestas: Record<string, any>) => {
    if (!workflowInstanciaId || !instancia?.etapa_actual_id) return;

    try {
      await workflowService.completarEtapa(
        workflowInstanciaId,
        instancia.etapa_actual_id,
        respuestas,
        userPerfil
      );
      // Recargar instancia después de completar etapa
      setRefreshKey(prev => prev + 1);
      alert('Etapa completada exitosamente');
    } catch (err: any) {
      console.error('Error completando etapa:', err);
      throw err;
    }
  };

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      'INICIADO': 'info',
      'EN_PROGRESO': 'primary',
      'COMPLETADO': 'success',
      'CANCELADO': 'error',
      'EN_REVISION': 'warning',
    };
    return colors[estado] || 'default';
  };

  const getPrioridadColor = (prioridad: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      'ALTA': 'error',
      'NORMAL': 'primary',
      'BAJA': 'default',
    };
    return colors[prioridad] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !instancia) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error || 'No se pudo cargar la instancia'}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/workflows')}
          sx={{ mt: 2 }}
        >
          Volver a Workflows
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          underline="hover"
          color="inherit"
          href="/"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Inicio
        </Link>
        <Link
          underline="hover"
          color="inherit"
          onClick={() => navigate('/workflows')}
          sx={{ cursor: 'pointer' }}
        >
          Workflows
        </Link>
        <Typography color="text.primary">
          {workflow?.nombre || 'Workflow'}
        </Typography>
        <Typography color="text.primary">
          {instancia.num_expediente || `Instancia ${instanciaId}`}
        </Typography>
      </Breadcrumbs>

      {/* Header de Instancia */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom>
              {instancia.nombre_instancia || workflow?.nombre}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={instancia.num_expediente}
                icon={<AssignmentIcon />}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={instancia.estado || 'EN_PROGRESO'}
                size="small"
                color={getEstadoColor(instancia.estado)}
              />
              {instancia.prioridad && (
                <Chip
                  label={instancia.prioridad}
                  size="small"
                  color={getPrioridadColor(instancia.prioridad)}
                />
              )}
              {vistaActual?.etapa_actual && (
                <Chip
                  label={vistaActual.etapa_actual.nombre}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
          <Tooltip title="Recargar">
            <IconButton onClick={() => setRefreshKey(prev => prev + 1)}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Layout de 3 Columnas */}
      <Grid container spacing={3}>
        {/* Columna 1: Sidebar - Progreso del Workflow */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Progreso del Workflow
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {workflow?.etapas && workflow.etapas.length > 0 ? (
              <Stepper activeStep={-1} orientation="vertical">
                {workflow.etapas
                  .sort((a: any, b: any) => a.orden - b.orden)
                  .map((etapa: any, index: number) => {
                    const isActual = vistaActual?.etapa_actual?.id === etapa.id;
                    const isCompleted = false; // TODO: Implementar lógica de completadas
                    
                    return (
                      <Step key={etapa.id} completed={isCompleted}>
                        <StepButton
                          icon={
                            isCompleted ? (
                              <CheckCircleIcon color="success" />
                            ) : isActual ? (
                              <PlayArrowIcon color="primary" />
                            ) : (
                              <RadioButtonUncheckedIcon />
                            )
                          }
                        >
                          <StepLabel>
                            <Typography
                              variant="body2"
                              fontWeight={isActual ? 'bold' : 'normal'}
                              color={isActual ? 'primary' : 'text.secondary'}
                            >
                              {etapa.nombre}
                            </Typography>
                            {etapa.tiempo_estimado_minutos && (
                              <Typography variant="caption" color="text.secondary">
                                ~{etapa.tiempo_estimado_minutos} min
                              </Typography>
                            )}
                          </StepLabel>
                        </StepButton>
                      </Step>
                    );
                  })}
              </Stepper>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                No hay etapas definidas en este workflow
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Columna 2: Main - Formulario de Etapa Actual */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            {instancia?.estado === 'COMPLETADO' ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom color="success.main">
                  ¡Workflow Completado!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Este workflow ha sido completado exitosamente.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Expediente: <strong>{instancia.num_expediente}</strong>
                </Typography>
                {instancia.fecha_fin && (
                  <Typography variant="body2" color="text.secondary">
                    Fecha de finalización: {new Date(instancia.fecha_fin).toLocaleString('es-ES')}
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  onClick={() => navigate('/workflows')}
                  sx={{ mt: 3 }}
                >
                  Volver a Workflows
                </Button>
              </Box>
            ) : vistaActual ? (
              <DynamicEtapaView
                instanciaId={parseInt(instanciaId!)}
                userPerfil={userPerfil}
                onSave={handleSave}
                onComplete={handleComplete}
              />
            ) : (
              <Alert severity="info">
                No hay etapa actual para mostrar
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Columna 3: Info - Historial y Comentarios */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            {/* Tabs */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Button
                size="small"
                variant={activeTab === 'formulario' ? 'contained' : 'outlined'}
                startIcon={<AssignmentIcon />}
                onClick={() => setActiveTab('formulario')}
                fullWidth
              >
                Info
              </Button>
              <Button
                size="small"
                variant={activeTab === 'historial' ? 'contained' : 'outlined'}
                startIcon={<HistoryIcon />}
                onClick={() => setActiveTab('historial')}
                fullWidth
              >
                Historial
              </Button>
              <Button
                size="small"
                variant={activeTab === 'comentarios' ? 'contained' : 'outlined'}
                startIcon={<CommentIcon />}
                onClick={() => setActiveTab('comentarios')}
                fullWidth
              >
                Notas
              </Button>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {/* Contenido de tabs */}
            {activeTab === 'formulario' && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Información General
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Expediente"
                      secondary={instancia.num_expediente}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Fecha de Inicio"
                      secondary={new Date(instancia.fecha_inicio).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    />
                  </ListItem>
                  {instancia.asignado_a && (
                    <ListItem>
                      <ListItemText
                        primary="Asignado a"
                        secondary={instancia.asignado_a}
                      />
                    </ListItem>
                  )}
                  {vistaActual?.metadata_instancia?.ppsh_num_expediente && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <ListItem>
                        <ListItemText
                          primary="Solicitud PPSH"
                          secondary={vistaActual.metadata_instancia.ppsh_num_expediente}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Tipo Solicitud"
                          secondary={vistaActual.metadata_instancia.ppsh_tipo_solicitud}
                        />
                      </ListItem>
                    </>
                  )}
                </List>
              </Box>
            )}

            {activeTab === 'historial' && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Historial de cambios próximamente
                </Typography>
                {/* TODO: Implementar componente de historial */}
              </Box>
            )}

            {activeTab === 'comentarios' && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Sistema de comentarios próximamente
                </Typography>
                {/* TODO: Implementar componente de comentarios */}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkflowExecution;
