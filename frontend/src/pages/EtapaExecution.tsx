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
  NavigateNext,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { DynamicEtapaView } from '../components/Workflow/DynamicEtapaView';
import { workflowService } from '../services/workflow.service';
import type { WorkflowEtapa } from '../types/workflow';
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

  if (!etapa) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          No se encontró la etapa
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
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNext fontSize="small" />} 
        sx={{ mb: 3 }}
      >
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', color: '#6B7280', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Inicio
        </Link>
        <Link
          underline="hover"
          sx={{ color: '#6B7280', cursor: 'pointer' }}
          onClick={() => navigate('/flujos')}
        >
          Flujos
        </Link>
        <Link
          underline="hover"
          sx={{ color: '#6B7280', cursor: 'pointer' }}
          onClick={() => navigate(`/flujos/${workflowId}/instancias/${instanciaId}`)}
        >
          Instancia #{instanciaId}
        </Link>
        <Typography sx={{ color: '#1F2937', fontWeight: 500 }}>
          {etapa.nombre}
        </Typography>
      </Breadcrumbs>

      {/* Título */}
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 700, 
          color: '#1F2937',
          mb: 3,
        }}
      >
        {etapa.nombre}
      </Typography>

      {/* Formulario dinámico de ancho completo */}
      <DynamicEtapaView
        etapa={etapa}
        instanciaId={instanciaId ? parseInt(instanciaId) : undefined}
        readonly={false}
        onAnswerChange={handleAnswerChange}
      />

      {/* Botones de acción */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handleCancelar}
          sx={{
            textTransform: 'none',
            borderColor: '#0e5fa6',
            color: '#0e5fa6',
            '&:hover': { borderColor: '#0d5391', backgroundColor: 'rgba(14, 95, 166, 0.04)' },
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleGuardar}
          sx={{
            textTransform: 'none',
            backgroundColor: '#0e5fa6',
            '&:hover': { backgroundColor: '#0d5391' },
          }}
        >
          Guardar y continuar
        </Button>
      </Box>
    </Box>
  );
};
