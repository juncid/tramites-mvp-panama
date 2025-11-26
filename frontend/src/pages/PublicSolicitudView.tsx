import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Chip,
  Stack,
  Grid,
  Alert,
  Button,
  Stepper,
  Step,
  StepLabel,
  Divider,
  List,
  ListItem,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Info as InfoIcon,
  ArrowBack as BackIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

interface PublicSolicitudData {
  numeroSolicitud: string;
  tipoTramite: string;
  fechaSolicitud: string;
  estadoActual: string;
  solicitante: {
    nombreCompleto: string;
    numeroDocumento: string;
  };
  workflow: {
    etapaActual: string;
    etapas: {
      nombre: string;
      estado: 'COMPLETADO' | 'EN_PROCESO' | 'PENDIENTE';
      fechaInicio?: string;
      fechaFin?: string;
    }[];
  };
  documentosRequeridos?: {
    nombre: string;
    cargado: boolean;
    fechaCarga?: string;
  }[];
  observaciones?: string;
  proximoPaso?: string;
}

export const PublicSolicitudView: React.FC = () => {
  const { numeroSolicitud } = useParams<{ numeroSolicitud: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { numeroDocumento, tipoDocumento } = location.state || {};

  const [solicitud, setSolicitud] = useState<PublicSolicitudData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        // TODO: Llamar al API para obtener datos de la solicitud
        // const response = await fetch(`/api/v1/public/solicitudes/${numeroSolicitud}`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ numeroDocumento, tipoDocumento }),
        // });

        // Simulación de datos
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setSolicitud({
          numeroSolicitud: numeroSolicitud || '',
          tipoTramite: 'Permiso Provisional de Salida Humanitaria (PPSH)',
          fechaSolicitud: '2025-01-15',
          estadoActual: 'EN_REVISION',
          solicitante: {
            nombreCompleto: 'Juan Carlos Pérez González',
            numeroDocumento: numeroDocumento || '',
          },
          workflow: {
            etapaActual: 'Revisión de Documentos',
            etapas: [
              {
                nombre: 'Recepción de Solicitud',
                estado: 'COMPLETADO',
                fechaInicio: '2025-01-15',
                fechaFin: '2025-01-15',
              },
              {
                nombre: 'Revisión de Documentos',
                estado: 'EN_PROCESO',
                fechaInicio: '2025-01-16',
              },
              {
                nombre: 'Evaluación Técnica',
                estado: 'PENDIENTE',
              },
              {
                nombre: 'Aprobación Final',
                estado: 'PENDIENTE',
              },
              {
                nombre: 'Emisión de Permiso',
                estado: 'PENDIENTE',
              },
            ],
          },
          documentosRequeridos: [
            { nombre: 'Pasaporte', cargado: true, fechaCarga: '2025-01-15' },
            { nombre: 'Fotografía', cargado: true, fechaCarga: '2025-01-15' },
            { nombre: 'Carta de Motivos', cargado: true, fechaCarga: '2025-01-15' },
            { nombre: 'Comprobante de Pago', cargado: false },
          ],
          observaciones: 'Se requiere completar la carga del comprobante de pago.',
          proximoPaso: 'Cargar el comprobante de pago de la tasa administrativa.',
        });
      } catch (err) {
        setError('Error al cargar la información de la solicitud.');
      } finally {
        setLoading(false);
      }
    };

    if (numeroSolicitud && numeroDocumento) {
      fetchSolicitud();
    } else {
      navigate('/acceso-publico');
    }
  }, [numeroSolicitud, numeroDocumento, tipoDocumento, navigate]);

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'COMPLETADO':
        return <CheckIcon sx={{ color: '#4caf50' }} />;
      case 'EN_PROCESO':
        return <PendingIcon sx={{ color: '#ff9800' }} />;
      default:
        return <InfoIcon sx={{ color: '#9e9e9e' }} />;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f9fafb',
        }}
      >
        <CircularProgress size={60} sx={{ color: '#0e5fa6' }} />
      </Box>
    );
  }

  if (error || !solicitud) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', py: 6 }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'No se pudo cargar la solicitud'}
          </Alert>
          <Button
            variant="contained"
            startIcon={<BackIcon />}
            onClick={() => navigate('/acceso-publico')}
            sx={{
              bgcolor: '#0e5fa6',
              '&:hover': { bgcolor: '#0d5494' },
            }}
          >
            Volver a Consultar
          </Button>
        </Container>
      </Box>
    );
  }

  const etapaActualIndex = solicitud.workflow.etapas.findIndex(
    (e) => e.estado === 'EN_PROCESO'
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
      {/* Header */}
      <Box sx={{ bgcolor: '#0e5fa6', color: 'white', py: 3 }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button
              startIcon={<BackIcon />}
              onClick={() => navigate('/acceso-publico')}
              sx={{
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Nueva Consulta
            </Button>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Solicitud {solicitud.numeroSolicitud}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {solicitud.tipoTramite}
              </Typography>
            </Box>
            <Chip
              label={solicitud.estadoActual}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Stack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Información del Solicitante */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#333333' }}>
                Información del Solicitante
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <PersonIcon sx={{ fontSize: 18, color: '#788093' }} />
                    <Typography variant="caption" sx={{ color: '#788093', fontWeight: 500 }}>
                      Nombre Completo
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: '#333333', fontWeight: 600 }}>
                    {solicitud.solicitante.nombreCompleto}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#788093', fontWeight: 500 }}>
                    {tipoDocumento === 'PASAPORTE' ? 'Pasaporte' : 'Cédula'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#333333', fontWeight: 600 }}>
                    {solicitud.solicitante.numeroDocumento}
                  </Typography>
                </Box>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <CalendarIcon sx={{ fontSize: 18, color: '#788093' }} />
                    <Typography variant="caption" sx={{ color: '#788093', fontWeight: 500 }}>
                      Fecha de Solicitud
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: '#333333', fontWeight: 600 }}>
                    {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-PA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Progreso del Workflow */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#333333' }}>
                Estado del Trámite
              </Typography>

              <Stepper activeStep={etapaActualIndex} orientation="vertical">
                {solicitud.workflow.etapas.map((etapa, index) => (
                  <Step key={index} completed={etapa.estado === 'COMPLETADO'}>
                    <StepLabel
                      icon={getEstadoIcon(etapa.estado)}
                      sx={{
                        '& .MuiStepLabel-label': {
                          color: etapa.estado === 'PENDIENTE' ? '#9e9e9e' : '#333333',
                          fontWeight: etapa.estado === 'EN_PROCESO' ? 600 : 400,
                        },
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {etapa.nombre}
                      </Typography>
                      {etapa.fechaInicio && (
                        <Typography variant="caption" sx={{ color: '#788093' }}>
                          Inicio:{' '}
                          {new Date(etapa.fechaInicio).toLocaleDateString('es-PA', {
                            month: 'short',
                            day: 'numeric',
                          })}
                          {etapa.fechaFin &&
                            ` - Fin: ${new Date(etapa.fechaFin).toLocaleDateString('es-PA', {
                              month: 'short',
                              day: 'numeric',
                            })}`}
                        </Typography>
                      )}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          </Grid>

          {/* Próximo Paso */}
          {solicitud.proximoPaso && (
            <Grid item xs={12}>
              <Alert severity="info" icon={<InfoIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Próximo Paso:
                </Typography>
                <Typography variant="body2">{solicitud.proximoPaso}</Typography>
              </Alert>
            </Grid>
          )}

          {/* Observaciones */}
          {solicitud.observaciones && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, bgcolor: '#fff8e1' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#f57c00' }}>
                  Observaciones
                </Typography>
                <Typography variant="body2" sx={{ color: '#333333' }}>
                  {solicitud.observaciones}
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Documentos Requeridos */}
          {solicitud.documentosRequeridos && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#333333' }}>
                  Documentos Requeridos
                </Typography>
                <List>
                  {solicitud.documentosRequeridos.map((doc, index) => (
                    <React.Fragment key={index}>
                      <ListItem
                        sx={{
                          px: 0,
                          py: 1.5,
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            {doc.cargado ? (
                              <CheckIcon sx={{ color: '#4caf50' }} />
                            ) : (
                              <PendingIcon sx={{ color: '#ff9800' }} />
                            )}
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 500, color: '#333333' }}>
                                {doc.nombre}
                              </Typography>
                              {doc.fechaCarga && (
                                <Typography variant="caption" sx={{ color: '#788093' }}>
                                  Cargado el{' '}
                                  {new Date(doc.fechaCarga).toLocaleDateString('es-PA', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </Typography>
                              )}
                            </Box>
                            <Chip
                              label={doc.cargado ? 'Cargado' : 'Pendiente'}
                              size="small"
                              sx={{
                                bgcolor: doc.cargado ? '#e8f5e9' : '#fff3e0',
                                color: doc.cargado ? '#4caf50' : '#ff9800',
                                fontWeight: 600,
                              }}
                            />
                          </Stack>
                        </Box>
                      </ListItem>
                      {index < solicitud.documentosRequeridos!.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default PublicSolicitudView;
