import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import type { WorkflowPregunta } from '../../../types/workflow';
import { apiClient } from '../../../services/api';

interface ImpresionListaCasosViewProps {
  pregunta: WorkflowPregunta;
  readonly?: boolean;
  onAnswerChange?: (valor: any) => void;
  instanciaId?: number;
  value?: number[];
}

interface SolicitudParaImpresion {
  instancia_id: number;
  id_solicitud: number;
  num_expediente?: string;
  nombre?: string;
  estado: string;
}

/**
 * ImpresionListaCasosView - Vista para seleccionar casos para impresión
 * 
 * Muestra una lista de solicitudes que están en la etapa "Impresión lista de casos"
 * con estado "En proceso". Permite seleccionar múltiples IDs y al guardar
 * cambia su estado a "Completado".
 * 
 * Configuración en pregunta.opciones:
 * - etapa_codigo: Código de la etapa a filtrar (ej: "VISTA_7_IMPRESION")
 * - workflow_id: ID del workflow (ej: 5005)
 */
export const ImpresionListaCasosView: React.FC<ImpresionListaCasosViewProps> = ({
  pregunta,
  readonly = false,
  onAnswerChange,
  value,
}) => {
  const [solicitudes, setSolicitudes] = useState<SolicitudParaImpresion[]>([]);
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set(value || []));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener configuración de las opciones de la pregunta
  const getConfig = useCallback(() => {
    const opciones = pregunta.opciones;
    if (opciones && typeof opciones === 'object' && !Array.isArray(opciones)) {
      return {
        etapaCodigo: (opciones as any).etapa_codigo || 'VISTA_7_IMPRESION',
        workflowId: (opciones as any).workflow_id || 5005,
        etapaOrden: (opciones as any).etapa_orden || 6,
      };
    }
    return {
      etapaCodigo: 'VISTA_7_IMPRESION',
      workflowId: 5005,
      etapaOrden: 6,
    };
  }, [pregunta.opciones]);

  // Cargar solicitudes disponibles
  useEffect(() => {
    const cargarSolicitudes = async () => {
      setLoading(true);
      setError(null);
      
      const config = getConfig();
      
      try {
        // Obtener instancias del workflow en estado EN_PROGRESO
        const response = await apiClient.get<any[]>('/workflow/instancias', {
          params: {
            workflow_id: config.workflowId,
            estado: 'EN_PROGRESO',
          }
        });

        const solicitudesEnEtapa: SolicitudParaImpresion[] = [];

        // Filtrar instancias que estén en la etapa de impresión
        for (const instancia of response) {
          try {
            const detalles = await apiClient.get<any>(`/workflow/instancias/${instancia.id}`);
            
            // Verificar si está en la etapa correcta (por orden o código)
            const etapaActual = detalles.etapa_actual;
            const esEtapaCorrecta = 
              etapaActual?.codigo === config.etapaCodigo ||
              etapaActual?.orden === config.etapaOrden;
            
            if (esEtapaCorrecta && detalles.estado === 'EN_PROGRESO') {
              const metadata = detalles.metadata_adicional || {};
              const idSolicitud = metadata.id_solicitud || metadata.ppsh_solicitud_id || instancia.id;
              
              solicitudesEnEtapa.push({
                instancia_id: instancia.id,
                id_solicitud: idSolicitud,
                num_expediente: metadata.ppsh_num_expediente || detalles.num_expediente,
                nombre: instancia.nombre_instancia || `Solicitud ${idSolicitud}`,
                estado: detalles.estado,
              });
            }
          } catch (err) {
            console.warn(`Error obteniendo detalles de instancia ${instancia.id}:`, err);
          }
        }

        setSolicitudes(solicitudesEnEtapa);
      } catch (err) {
        console.error('Error cargando solicitudes:', err);
        setError('Error al cargar las solicitudes disponibles');
      } finally {
        setLoading(false);
      }
    };

    cargarSolicitudes();
  }, [getConfig]);

  // Inicializar seleccionados desde value si existe
  useEffect(() => {
    if (value && Array.isArray(value)) {
      setSeleccionados(new Set(value));
    }
  }, [value]);

  const handleToggle = (idSolicitud: number) => {
    if (readonly) return;
    
    const newSeleccionados = new Set(seleccionados);
    if (newSeleccionados.has(idSolicitud)) {
      newSeleccionados.delete(idSolicitud);
    } else {
      newSeleccionados.add(idSolicitud);
    }
    setSeleccionados(newSeleccionados);
    
    // Notificar cambio al padre
    const arraySeleccionados = Array.from(newSeleccionados);
    onAnswerChange?.(arraySeleccionados);
  };

  const handleSeleccionarTodos = () => {
    if (readonly) return;
    
    const todosIds = new Set(solicitudes.map(s => s.id_solicitud));
    setSeleccionados(todosIds);
    onAnswerChange?.(Array.from(todosIds));
  };

  const handleDeseleccionarTodos = () => {
    if (readonly) return;
    
    setSeleccionados(new Set());
    onAnswerChange?.([]);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress size={32} />
        <Typography sx={{ ml: 2, color: '#666' }}>
          Cargando casos disponibles...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      {/* Título de la pregunta */}
      <Typography 
        sx={{ 
          fontWeight: 500,
          fontFamily: 'Roboto, sans-serif',
          fontSize: '16px',
          lineHeight: 1.5,
          color: '#333333',
          mb: 2,
        }}
      >
        {pregunta.pregunta}
        {pregunta.es_obligatoria && (
          <Typography component="span" sx={{ color: '#DC2626', ml: 0.5 }}>*</Typography>
        )}
      </Typography>

      {solicitudes.length === 0 ? (
        <Alert severity="info">
          No hay casos disponibles para impresión en este momento.
        </Alert>
      ) : (
        <>
          {/* Botones de selección rápida */}
          {!readonly && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button 
                size="small" 
                variant="outlined"
                onClick={handleSeleccionarTodos}
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#0e5fa6',
                  color: '#0e5fa6',
                }}
              >
                Seleccionar todos
              </Button>
              <Button 
                size="small" 
                variant="outlined"
                onClick={handleDeseleccionarTodos}
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#666',
                  color: '#666',
                }}
              >
                Deseleccionar todos
              </Button>
            </Box>
          )}

          {/* Lista de solicitudes con checkboxes */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {solicitudes.map((solicitud) => (
              <Box
                key={solicitud.id_solicitud}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={seleccionados.has(solicitud.id_solicitud)}
                      onChange={() => handleToggle(solicitud.id_solicitud)}
                      disabled={readonly}
                      sx={{
                        color: '#0e5fa6',
                        '&.Mui-checked': {
                          color: '#0e5fa6',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '16px',
                        lineHeight: 1.5,
                        color: '#4d4d4d',
                      }}
                    >
                      {solicitud.id_solicitud}
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />
              </Box>
            ))}
          </Box>

          {/* Contador de seleccionados */}
          {seleccionados.size > 0 && (
            <Typography 
              sx={{ 
                mt: 2, 
                color: '#0e5fa6', 
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {seleccionados.size} caso(s) seleccionado(s)
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};
