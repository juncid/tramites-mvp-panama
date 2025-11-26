import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { publicService } from '../services/public.service';
import { workflowService } from '../services/workflow.service';
import { DynamicEtapaView } from '../components/Workflow/DynamicEtapaView';

/**
 * Página para ejecutar workflow con acceso público (token JWT)
 * Diseño basado en Figma: https://www.figma.com/design/yX0REVjuXYg13XO0ZgD1GQ/
 */
export const SolicitudPublicaWorkflow: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState(false);
  const [instancia, setInstancia] = useState<any>(null);
  const [etapaActual, setEtapaActual] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (token) {
      validateAndLoad();
    } else {
      setError('Token no proporcionado');
      setLoading(false);
    }
  }, [token, refreshKey]);

  const validateAndLoad = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const validacion = await publicService.validarToken(token);
      
      if (!validacion.valid) {
        setError('El enlace de seguimiento ha expirado o no es válido.');
        setLoading(false);
        return;
      }

      setTokenValid(true);
      const instanciaData = await publicService.getInstanciaPorToken(token);
      setInstancia(instanciaData);
      
      if (instanciaData.etapa_actual) {
        setEtapaActual(instanciaData.etapa_actual);
      }

    } catch (err: any) {
      console.error('Error validando token:', err);
      
      // Si es error 403, la etapa actual requiere funcionario
      if (err.response?.status === 403) {
        setError('Esta etapa requiere revisión de un funcionario. Su solicitud está en proceso de evaluación.');
      } else {
        setError(err.response?.data?.detail || 'Error al cargar la solicitud.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEtapaCompletada = async (respuestas: Record<string, any>) => {
    if (!instancia?.etapa_actual_id) return;

    try {
      await workflowService.completarEtapa(
        instancia.id,
        instancia.etapa_actual_id,
        respuestas,
        'CIUDADANO',
        undefined,
        token
      );
      
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      console.error('Error completando etapa:', err);
      
      // Si error 403, probablemente llegamos a una etapa que requiere funcionario
      if (err.response?.status === 403) {
        setError('Las siguientes etapas requieren revisión de un funcionario. Su solicitud será procesada próximamente.');
      }
      throw err;
    }
  };

  /**
   * Handler para botón Volver
   * - Primera etapa (orden 1): navegar a /inicio
   * - Otras etapas: navegar a la etapa anterior (sin cambiar estado)
   */
  const handleVolver = () => {
    // Determinar si es la primera etapa
    const ordenActual = etapaActual?.orden || 1;
    
    if (ordenActual <= 1) {
      // Primera etapa: ir a inicio
      navigate('/inicio');
    } else {
      // Otras etapas: retroceder a la etapa anterior
      // Navegamos a la ruta de etapa anterior (solo visualización, sin modificar estado)
      const etapaAnteriorOrden = ordenActual - 1;
      navigate(`/solicitudes/${token}/etapa/${etapaAnteriorOrden}`);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Validando enlace de seguimiento...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !tokenValid) {
    // Determinar si es un error de permisos (403) o error general
    const isPermissionError = error?.includes('requiere revisión de un funcionario') || error?.includes('requiere funcionario');
    const severity = isPermissionError ? 'warning' : 'error';
    const title = isPermissionError ? 'Revisión Pendiente' : 'Enlace Inválido o Expirado';
    
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity={severity} sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          <Typography variant="body2">{error || 'El enlace no es válido.'}</Typography>
          {isPermissionError && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Ha completado las etapas disponibles para ciudadanos. Un funcionario del Servicio Nacional de Migración revisará su solicitud próximamente.
            </Typography>
          )}
        </Alert>
        {!isPermissionError && (
          <Button variant="contained" onClick={() => navigate('/solicitudes/nueva')} fullWidth size="large">
            Iniciar Nueva Solicitud
          </Button>
        )}
      </Container>
    );
  }

  if (instancia?.estado === 'COMPLETADO') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="success" icon={<CheckCircleIcon fontSize="large" />}>
          <Typography variant="h5" gutterBottom>¡Solicitud Completada!</Typography>
          <Typography variant="body1">
            Su solicitud <strong>{instancia.num_expediente}</strong> ha sido completada exitosamente.
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Box sx={{ backgroundColor: '#0e5fa6', py: 5, px: { xs: 2, sm: 3, md: '7.69rem' }, minHeight: '276px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h2" sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '32px', md: '64px' }, lineHeight: 1.1, mb: 2, maxWidth: '896px' }}>
            Permiso de Protección de Seguridad Humanitaria
          </Typography>
          {instancia?.num_expediente && (
            <Typography sx={{ color: 'white', fontSize: '18px', fontWeight: 400, mb: 4, opacity: 0.9 }}>
              Expediente: <strong>{instancia.num_expediente}</strong>
            </Typography>
          )}
        </Box>
        <Breadcrumbs separator={<Typography sx={{ color: 'white', mx: 0.5 }}>/</Typography>} sx={{ color: 'white' }}>
          <MuiLink href="/" sx={{ display: 'flex', alignItems: 'center', color: 'white', textDecoration: 'none', fontSize: '14px', gap: 0.5, '&:hover': { textDecoration: 'underline' } }}>
            <HomeIcon sx={{ fontSize: 20 }} />
            Inicio
          </MuiLink>
          <Typography sx={{ color: 'white', fontSize: '14px' }}>Procesos</Typography>
          <Typography sx={{ color: 'white', fontSize: '14px' }}>Permiso de Protección de Seguridad Humanitaria</Typography>
          <Typography sx={{ color: 'white', fontSize: '14px' }}>{etapaActual?.nombre || 'Cargando...'}</Typography>
        </Breadcrumbs>
      </Box>

      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: '7.69rem' }, py: 4, backgroundColor: 'white' }}>
        <Typography variant="h3" sx={{ fontSize: '48px', fontWeight: 700, color: '#333333', mb: 3, lineHeight: 1.5 }}>
          {etapaActual?.titulo_formulario || etapaActual?.nombre || 'Etapa actual'}
        </Typography>

        {etapaActual?.bajada_formulario && (
          <Typography variant="body1" sx={{ fontSize: '16px', color: '#333333', mb: 4, lineHeight: 1.5, maxWidth: '1167px' }}>
            {etapaActual.bajada_formulario}
          </Typography>
        )}

        {etapaActual && (
          <Box sx={{ mb: 4 }}>
            <DynamicEtapaView 
              instanciaId={instancia.id} 
              onComplete={handleEtapaCompletada}
              onBack={handleVolver}
              userPerfil="CIUDADANO" 
              accessToken={token}
              hideHeader={true}
              buttonLabels={{ back: 'Volver', next: 'Siguiente' }}
            />
          </Box>
        )}

        {!etapaActual && instancia?.estado !== 'COMPLETADO' && (
          <Alert severity="warning">
            <Typography variant="h6" gutterBottom>No hay etapas disponibles</Typography>
            <Typography variant="body2">Su solicitud está siendo procesada.</Typography>
          </Alert>
        )}
      </Container>
    </>
  );
};

export default SolicitudPublicaWorkflow;
