import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
 * 
 * FUNCIONALIDAD:
 * - Si el ciudadano tiene una etapa donde puede interactuar (CIUDADANO en perfiles), muestra el formulario
 * - Si la etapa actual requiere otro perfil (FUNCIONARIO), redirige a la vista de etapas (/solicitudes/:token/etapas)
 * - Soporta modo readonly para ver etapas completadas
 */
export const SolicitudPublicaWorkflow: React.FC = () => {
  const { token, etapaOrden } = useParams<{ token: string; etapaOrden?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Detectar si estamos en modo readonly
  const isReadonly = searchParams.get('readonly') === 'true';
  const targetEtapaOrden = etapaOrden ? parseInt(etapaOrden, 10) : null;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState(false);
  const [instancia, setInstancia] = useState<any>(null);
  const [etapaActual, setEtapaActual] = useState<any>(null);
  const [etapaAMostrar, setEtapaAMostrar] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (token) {
      validateAndLoad();
    } else {
      setError('Token no proporcionado');
      setLoading(false);
    }
  }, [token, refreshKey, targetEtapaOrden, isReadonly]);

  const validateAndLoad = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Validar token
      const validacion = await publicService.validarToken(token);
      
      if (!validacion.valid) {
        setError('El enlace de seguimiento ha expirado o no es válido.');
        setLoading(false);
        return;
      }

      setTokenValid(true);

      // 2. Obtener instancia
      const instanciaData = await publicService.getInstanciaPorToken(token);
      setInstancia(instanciaData);
      
      // 3. Determinar qué etapa mostrar
      const etapaActualData = instanciaData.etapa_actual;
      setEtapaActual(etapaActualData);
      
      // Si estamos en modo readonly y hay un etapaOrden específico, buscar esa etapa
      if (isReadonly && targetEtapaOrden !== null && instanciaData.workflow?.etapas) {
        const etapaTarget = instanciaData.workflow.etapas.find(
          (e: any) => e.orden === targetEtapaOrden
        );
        
        if (etapaTarget) {
          // Verificar que el ciudadano tenga permiso para ver esta etapa
          const perfilesPermitidos = etapaTarget.perfiles_permitidos || [];
          const ciudadanoPuedeVer = perfilesPermitidos.includes('CIUDADANO') || 
                                    perfilesPermitidos.includes('ABOGADO') ||
                                    perfilesPermitidos.length === 0;
          
          if (ciudadanoPuedeVer) {
            setEtapaAMostrar(etapaTarget);
            return;
          } else {
            // No tiene permiso para ver esta etapa
            navigate(`/solicitudes/${token}/etapas`, { replace: true });
            return;
          }
        }
      }
      
      // Modo normal (no readonly) - mostrar etapa actual
      if (etapaActualData) {
        const perfilesPermitidos = etapaActualData.perfiles_permitidos || [];
        const ciudadanoPuedeEditar = perfilesPermitidos.includes('CIUDADANO') || 
                                     perfilesPermitidos.includes('ABOGADO') ||
                                     perfilesPermitidos.length === 0; // Si no hay perfiles, asumir que todos pueden
        
        // Si el ciudadano NO puede editar la etapa actual, redirigir a la vista de etapas
        if (!ciudadanoPuedeEditar) {
          navigate(`/solicitudes/${token}/etapas`, { replace: true });
          return;
        }
        
        setEtapaAMostrar(etapaActualData);
      } else {
        // No hay etapa actual (workflow completado o error)
        // Redirigir a la vista de etapas para mostrar el estado
        navigate(`/solicitudes/${token}/etapas`, { replace: true });
        return;
      }

    } catch (err: any) {
      console.error('Error validando token:', err);
      
      // Si es error 403, la etapa actual requiere funcionario - redirigir a vista de etapas
      if (err.response?.status === 403) {
        navigate(`/solicitudes/${token}/etapas`, { replace: true });
        return;
      }
      
      setError(err.response?.data?.detail || 'Error al cargar la solicitud.');
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
      
      // Si error 403, llegamos a una etapa que requiere funcionario - redirigir
      if (err.response?.status === 403) {
        navigate(`/solicitudes/${token}/etapas`, { replace: true });
        return;
      }
      throw err;
    }
  };

  /**
   * Handler para botón Volver
   */
  const handleVolver = () => {
    const ordenActual = etapaActual?.orden || 1;
    
    if (ordenActual <= 1) {
      navigate('/inicio');
    } else {
      // Ir a la vista de etapas
      navigate(`/solicitudes/${token}/etapas`);
    }
  };

  // ============================================================================
  // RENDER: LOADING
  // ============================================================================

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

  // ============================================================================
  // RENDER: ERROR (token inválido)
  // ============================================================================

  if (error && !tokenValid) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Enlace Inválido o Expirado</Typography>
          <Typography variant="body2">{error || 'El enlace no es válido.'}</Typography>
        </Alert>
        <Button variant="contained" onClick={() => navigate('/solicitudes/nueva')} fullWidth size="large">
          Iniciar Nueva Solicitud
        </Button>
      </Container>
    );
  }

  // ============================================================================
  // RENDER: WORKFLOW COMPLETADO (solo si NO estamos en modo readonly viendo una etapa)
  // ============================================================================

  if (instancia?.estado === 'COMPLETADO' && !isReadonly) {
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

  // ============================================================================
  // RENDER: VISTA DE FORMULARIO (interacción)
  // ============================================================================

  return (
    <>
      {/* Header */}
      <Box sx={{ 
        backgroundColor: '#0e5fa6', 
        py: 5, 
        px: { xs: 2, sm: 3, md: '7.69rem' }, 
        minHeight: '220px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between' 
      }}>
        <Box>
          <Typography variant="h2" sx={{ 
            color: 'white', 
            fontWeight: 700, 
            fontSize: { xs: '32px', md: '64px' }, 
            lineHeight: 1.1, 
            mb: 2, 
            maxWidth: '896px' 
          }}>
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
          <Typography sx={{ color: 'white', fontSize: '14px' }}>{etapaAMostrar?.nombre || 'Cargando...'}</Typography>
        </Breadcrumbs>
      </Box>

      {/* Content */}
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: '7.69rem' }, py: 4, backgroundColor: 'white' }}>
        <Typography variant="h3" sx={{ fontSize: '48px', fontWeight: 700, color: '#333333', mb: 3, lineHeight: 1.5 }}>
          {etapaAMostrar?.titulo_formulario || etapaAMostrar?.nombre || 'Etapa actual'}
        </Typography>

        {etapaAMostrar && (
          <Box sx={{ mb: 4 }}>
            <DynamicEtapaView 
              instanciaId={instancia.id} 
              etapaId={isReadonly ? etapaAMostrar.id : undefined}
              onComplete={isReadonly ? undefined : handleEtapaCompletada}
              onBack={handleVolver}
              userPerfil="CIUDADANO" 
              accessToken={token}
              hideHeader={true}
              readonly={isReadonly}
              buttonLabels={{ back: 'Volver', next: isReadonly ? undefined : 'Siguiente' }}
            />
          </Box>
        )}

        {!etapaAMostrar && instancia?.estado !== 'COMPLETADO' && (
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
