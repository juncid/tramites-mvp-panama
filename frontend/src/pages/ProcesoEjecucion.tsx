/**
 * Página de Ejecución de Proceso de Workflow
 * Sistema de Trámites Migratorios de Panamá
 * 
 * Permite a los usuarios finales completar etapas de workflows
 * usando vistas dinámicas o formularios tradicionales.
 * 
 * @author Sistema de Trámites MVP Panamá
 * @date 2025-11-14
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  LinearProgress,
  Alert,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

import { workflowService } from '../services/workflow.service';
import { vistaConfigService } from '../services/vista-config.service';
import { DynamicRenderer } from '../components/DynamicView/DynamicRenderer';
import { FormularioTradicional } from '../components/Workflow/FormularioTradicional';
import type {
  WorkflowInstancia,
  WorkflowEtapa,
  RespuestaFormulario,
} from '../types/workflow';
import type { ConfigJson } from '../types/dynamic-view';

export const ProcesoEjecucion: React.FC = () => {
  const { instanciaId } = useParams<{ instanciaId: string }>();
  const navigate = useNavigate();

  // Estados
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instancia, setInstancia] = useState<WorkflowInstancia | null>(null);
  const [etapaActual, setEtapaActual] = useState<WorkflowEtapa | null>(null);
  const [vistaConfig, setVistaConfig] = useState<ConfigJson | null>(null);
  const [todasEtapas, setTodasEtapas] = useState<WorkflowEtapa[]>([]);

  // Cargar datos de la instancia
  useEffect(() => {
    const loadData = async () => {
      if (!instanciaId) {
        setError('ID de instancia no proporcionado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1. Cargar instancia
        const inst = await workflowService.getInstancia(parseInt(instanciaId));
        setInstancia(inst);

        // 2. Cargar workflow completo para obtener todas las etapas
        if (inst.workflow_id) {
          const workflow = await workflowService.getWorkflow(inst.workflow_id);
          setTodasEtapas(workflow.etapas || []);
        }

        // 3. Cargar etapa actual
        if (inst.etapa_actual_id) {
          const etapa = await workflowService.getEtapa(inst.etapa_actual_id);
          setEtapaActual(etapa);

          // 4. Intentar cargar vista dinámica
          try {
            const config = await vistaConfigService.getByEtapaId(inst.etapa_actual_id);
            if (config && config.config_json) {
              setVistaConfig(config.config_json as ConfigJson);
            }
          } catch (err) {
            // No hay vista dinámica, se usará formulario tradicional
            console.log('No hay vista dinámica para esta etapa, usar formulario tradicional');
          }
        }
      } catch (err: any) {
        console.error('Error cargando datos:', err);
        setError(err.message || 'Error al cargar los datos del proceso');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [instanciaId]);

  // Calcular progreso
  const calcularProgreso = (): number => {
    if (!todasEtapas.length || !etapaActual) return 0;
    const etapasOrdenadas = [...todasEtapas].sort((a, b) => a.orden - b.orden);
    const indiceActual = etapasOrdenadas.findIndex((e) => e.id === etapaActual.id);
    return ((indiceActual + 1) / etapasOrdenadas.length) * 100;
  };

  // Encontrar siguiente etapa
  const encontrarSiguienteEtapa = (): number | null => {
    if (!todasEtapas.length || !etapaActual) return null;

    // Buscar conexiones desde workflow completo
    if (instancia?.workflow?.conexiones) {
      const conexion = instancia.workflow.conexiones.find(
        (c) => c.etapa_origen_id === etapaActual.id && c.es_predeterminada
      );
      if (conexion) return conexion.etapa_destino_id;
    }

    // Fallback: siguiente etapa por orden
    const etapasOrdenadas = [...todasEtapas].sort((a, b) => a.orden - b.orden);
    const indiceActual = etapasOrdenadas.findIndex((e) => e.id === etapaActual.id);
    if (indiceActual >= 0 && indiceActual < etapasOrdenadas.length - 1) {
      return etapasOrdenadas[indiceActual + 1].id!;
    }

    return null;
  };

  // Manejar envío del formulario
  const handleSubmit = async (valores: Record<string, any>) => {
    if (!instancia || !etapaActual) return;

    try {
      setSubmitting(true);
      setError(null);

      // Convertir valores a formato RespuestaFormulario
      const respuestas: RespuestaFormulario[] = Object.entries(valores).map(
        ([campoId, valor]) => ({
          campo_id: campoId,
          valor_json: valor,
        })
      );

      // Encontrar siguiente etapa
      const siguienteEtapaId = encontrarSiguienteEtapa();

      if (!siguienteEtapaId) {
        // Es la última etapa
        setError('Esta es la última etapa del proceso. Completando...');
        // TODO: Implementar lógica de finalización
        return;
      }

      // Transicionar a siguiente etapa
      await workflowService.transicionarInstancia(instancia.id, {
        etapa_destino_id: siguienteEtapaId,
        respuestas,
      });

      // Recargar datos
      window.location.reload();
    } catch (err: any) {
      console.error('Error al guardar respuestas:', err);
      setError(err.message || 'Error al guardar las respuestas');
    } finally {
      setSubmitting(false);
    }
  };

  // Renderizado con loading
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando proceso...</Typography>
      </Container>
    );
  }

  // Renderizado con error
  if (error && !instancia) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Volver
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header con información de instancia */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Proceso de Trámite
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {instancia?.workflow?.nombre || 'Cargando...'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Referencia: {instancia?.codigo_referencia}
            </Typography>
          </Box>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
            Volver
          </Button>
        </Box>

        {/* Stepper de progreso */}
        {todasEtapas.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Progreso del proceso
            </Typography>
            <LinearProgress
              variant="determinate"
              value={calcularProgreso()}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary" mt={1}>
              {Math.round(calcularProgreso())}% completado
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Etapa actual */}
      {etapaActual && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              {etapaActual.nombre}
            </Typography>
            {etapaActual.descripcion && (
              <Typography variant="body2" color="text.secondary">
                {etapaActual.descripcion}
              </Typography>
            )}
          </Box>

          {/* Renderizado condicional: Vista Dinámica o Tradicional */}
          {vistaConfig ? (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Formulario con vista dinámica configurada
              </Alert>
              <DynamicRenderer config={vistaConfig} onSubmit={handleSubmit} />
            </Box>
          ) : etapaActual.preguntas && etapaActual.preguntas.length > 0 ? (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Formulario tradicional ({etapaActual.preguntas.length} preguntas)
              </Alert>
              <FormularioTradicional
                preguntas={etapaActual.preguntas}
                onSubmit={handleSubmit}
              />
            </Box>
          ) : (
            <Alert severity="warning">
              Esta etapa no tiene formulario configurado (ni vista dinámica ni preguntas
              tradicionales).
            </Alert>
          )}

          {/* Mostrar errores */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Estado de envío */}
          {submitting && (
            <Box display="flex" justifyContent="center" mt={2}>
              <CircularProgress size={24} />
              <Typography sx={{ ml: 2 }}>Guardando respuestas...</Typography>
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default ProcesoEjecucion;
