import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { DynamicEtapaView } from '../components/Workflow/DynamicEtapaView';
import { workflowService } from '../services/workflow.service';
import type { WorkflowEtapa, Workflow } from '../types/workflow';
import { logger } from '../utils/logger';

/**
 * Página para ejecutar una etapa de workflow
 * Renderiza dinámicamente el formulario según las configuraciones de la etapa
 */
export const EtapaExecution = () => {
  const navigate = useNavigate();
  const { workflowId, instanciaId, etapaId } = useParams<{
    workflowId: string;
    instanciaId: string;
    etapaId: string;
  }>();

  const [etapa, setEtapa] = useState<WorkflowEtapa | null>(null);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respuestas, setRespuestas] = useState<Record<number, any>>({});

  useEffect(() => {
    const fetchEtapa = async () => {
      if (!etapaId) {
        setError('ID de etapa no proporcionado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        logger.workflow('Cargando etapa para ejecución', { 
          etapaId, 
          workflowId, 
          instanciaId 
        });

        // Cargar el workflow completo y extraer la etapa
        const workflowData = await workflowService.getWorkflow(parseInt(workflowId!));
        const etapaData = workflowData.etapas?.find(e => e.id === parseInt(etapaId));
        
        if (!etapaData) {
          throw new Error('Etapa no encontrada en el workflow');
        }
        
        logger.workflow('Etapa cargada exitosamente', { 
          etapa: etapaData.nombre,
          cantidadPreguntas: etapaData.preguntas?.length || 0
        });

        setWorkflow(workflowData);
        setEtapa(etapaData);
      } catch (err) {
        logger.error('Error cargando etapa', { error: err });
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchEtapa();
  }, [etapaId, workflowId, instanciaId]);

  const handleAnswerChange = (preguntaId: number, valor: any) => {
    logger.component('EtapaExecution', `Respuesta actualizada - Pregunta ${preguntaId}`);
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: valor,
    }));
  };

  const handleGuardar = async () => {
    if (!instanciaId || !etapaId) return;

    try {
      logger.workflow('Guardando respuestas de etapa', { 
        instanciaId, 
        etapaId,
        cantidadRespuestas: Object.keys(respuestas).length
      });

      // TODO: Implementar guardado de respuestas
      console.log('Respuestas a guardar:', respuestas);
      
      alert('Respuestas guardadas exitosamente');
      navigate(`/flujos/${workflowId}/instancias/${instanciaId}`);
    } catch (err) {
      logger.error('Error guardando respuestas', { error: err });
      alert('Error al guardar las respuestas');
    }
  };

  const handleCancelar = () => {
    navigate(`/flujos/${workflowId}/instancias/${instanciaId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error cargando la etapa: {error}
        </Alert>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/flujos')}
          sx={{ mt: 2 }}
        >
          Volver a Flujos
        </Button>
      </Box>
    );
  }

  if (!etapa || !workflow) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          No se encontró la etapa o el workflow
        </Alert>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/flujos')}
          sx={{ mt: 2 }}
        >
          Volver a Flujos
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mx: -3, mt: -3 }}>
      {/* Hero Header - Diseño Figma */}
      <Box 
        sx={{ 
          backgroundColor: '#0e5fa6',
          px: { xs: 2, sm: 3, md: '7.69rem' },
          pt: '40px',
          pb: '40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Título del Proceso */}
        <Typography 
          sx={{
            fontFamily: '"Roboto Flex", sans-serif',
            fontWeight: 700,
            fontSize: { xs: '32px', sm: '48px', md: '64px' },
            lineHeight: 1.1,
            color: 'white',
            mb: '56px',
          }}
        >
          {workflow.nombre}
        </Typography>

        {/* Breadcrumb - Diseño Figma */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HomeIcon sx={{ width: 20, height: 20, color: 'white' }} />
            <Typography 
              onClick={() => navigate('/')}
              sx={{ 
                fontSize: '14px', 
                color: 'white', 
                fontFamily: 'Roboto, sans-serif',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Inicio
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '14px', color: 'white', fontFamily: 'Roboto, sans-serif' }}>
            /
          </Typography>
          <Typography 
            onClick={() => navigate('/flujos')}
            sx={{ 
              fontSize: '14px', 
              color: 'white', 
              fontFamily: 'Roboto, sans-serif',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Procesos
          </Typography>
          <Typography sx={{ fontSize: '14px', color: 'white', fontFamily: 'Roboto, sans-serif' }}>
            /
          </Typography>
          <Typography 
            onClick={() => navigate(`/flujos/${workflowId}/instancias/${instanciaId}`)}
            sx={{ 
              fontSize: '14px', 
              color: 'white', 
              fontFamily: 'Roboto, sans-serif',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            {workflow.nombre}
          </Typography>
          <Typography sx={{ fontSize: '14px', color: 'white', fontFamily: 'Roboto, sans-serif' }}>
            /
          </Typography>
          <Typography sx={{ fontSize: '14px', color: 'white', fontFamily: 'Roboto, sans-serif' }}>
            {etapa.nombre}
          </Typography>
        </Box>
      </Box>

      {/* Contenido del formulario */}
      <Box sx={{ px: { xs: 2, sm: 3, md: '7.69rem' }, py: '40px', backgroundColor: 'white' }}>
        {/* Título de la Etapa */}
        <Typography 
          sx={{
            fontFamily: '"Roboto Flex", sans-serif',
            fontWeight: 700,
            fontSize: { xs: '32px', md: '48px' },
            lineHeight: 1.5,
            color: '#333333',
            mb: '25px',
          }}
        >
          {etapa.titulo_formulario || etapa.nombre}
        </Typography>

        {/* Bajada del formulario */}
        {etapa.bajada_formulario && (
          <Typography 
            sx={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: '16px',
              lineHeight: 1.5,
              color: '#333333',
              mb: '48px',
              maxWidth: '1167px',
            }}
          >
            {etapa.bajada_formulario}
          </Typography>
        )}

        {/* Formulario dinámico - ancho completo */}
        <DynamicEtapaView
          etapa={etapa}
          instanciaId={instanciaId ? parseInt(instanciaId) : undefined}
          readonly={false}
          onAnswerChange={handleAnswerChange}
        />

        {/* Botones de acción - Diseño Figma */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, maxWidth: '1194px' }}>
          <Button
            variant="outlined"
            onClick={handleCancelar}
            sx={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: '16px',
              textTransform: 'none',
              borderColor: '#0e5fa6',
              color: '#0e5fa6',
              px: 2,
              py: 1,
              minWidth: '124px',
              borderRadius: '4px',
              '&:hover': { 
                borderColor: '#0d5391', 
                backgroundColor: 'rgba(14, 95, 166, 0.04)' 
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardar}
            sx={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: '16px',
              textTransform: 'none',
              backgroundColor: '#0e5fa6',
              color: 'white',
              px: 2,
              py: 1,
              minWidth: '124px',
              borderRadius: '4px',
              '&:hover': { backgroundColor: '#0d5391' },
            }}
          >
            Siguiente
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
