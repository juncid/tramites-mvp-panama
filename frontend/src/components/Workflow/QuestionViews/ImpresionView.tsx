import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Print as PrintIcon,
} from '@mui/icons-material';
import type { WorkflowPregunta } from '../../../types/workflow';
import { apiClient } from '../../../services/api';

interface ImpresionViewProps {
  pregunta: WorkflowPregunta;
  readonly?: boolean;
  onAnswerChange?: (valor: any) => void;
  instanciaId?: number;
  value?: number[] | boolean;
}

interface SolicitudParaImpresion {
  instancia_id: number;
  id_solicitud: number;
  num_expediente?: string;
  nombre?: string;
  estado: string;
}

/**
 * ImpresionView - Vista para impresión y selección de casos
 * 
 * Si la pregunta tiene opciones.mostrar_lista_casos = true:
 *   - Muestra una lista de solicitudes en estado "En proceso" 
 *   - Permite seleccionar múltiples IDs de solicitud
 *   - Al completar la etapa, las solicitudes seleccionadas pasan a "Completado"
 * 
 * Si no:
 *   - Muestra solo un botón de impresión simple
 */
export const ImpresionView: React.FC<ImpresionViewProps> = ({
  pregunta,
  readonly = false,
  onAnswerChange,
  value,
}) => {
  // Determinar si debe mostrar la lista de casos
  const mostrarListaCasos = React.useMemo(() => {
    const opciones = pregunta.opciones;
    if (opciones && typeof opciones === 'object' && !Array.isArray(opciones)) {
      return (opciones as any).mostrar_lista_casos === true;
    }
    // Por defecto, si la pregunta se llama algo relacionado con "lista de casos", mostrar lista
    const nombrePregunta = (pregunta.pregunta || '').toLowerCase();
    return nombrePregunta.includes('lista de casos') || nombrePregunta.includes('imprimir lista');
  }, [pregunta.opciones, pregunta.pregunta]);

  const [solicitudes, setSolicitudes] = useState<SolicitudParaImpresion[]>([]);
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(mostrarListaCasos);
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
    if (!mostrarListaCasos) return;

    const cargarSolicitudes = async () => {
      setLoading(true);
      setError(null);
      
      const config = getConfig();
      
      try {
        // Obtener instancias del workflow en estado EN_PROGRESO
        const response = await apiClient.get<any[]>('/workflow/instancias', {
          workflow_id: config.workflowId,
          estado: 'EN_PROGRESO',
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
  }, [mostrarListaCasos, getConfig]);

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

  // Si NO debe mostrar lista de casos, mostrar solo botón de impresión simple
  if (!mostrarListaCasos) {
    const handleImprimir = () => {
      window.print();
      onAnswerChange?.(true);
    };

    return (
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon sx={{ fontSize: '16px' }} />}
          onClick={handleImprimir}
          sx={{
            textTransform: 'none',
            backgroundColor: '#0E5FA6',
            borderRadius: '4px',
            height: '40px',
            px: 2,
            py: 1,
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: 1,
            boxShadow: 'none',
            gap: 1,
            '&:hover': { 
              backgroundColor: '#0d5391',
              boxShadow: 'none',
            },
          }}
        >
          {pregunta.pregunta || 'Imprimir'}
        </Button>
      </Box>
    );
  }

  // Mostrar lista de casos para impresión
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
      {/* Título de la sección - según Figma */}
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
        {pregunta.pregunta || 'Casos para generar impresión'}
      </Typography>

      {solicitudes.length === 0 ? (
        <Alert severity="info">
          No hay casos disponibles para impresión en este momento.
        </Alert>
      ) : (
        <>
          {/* Lista de solicitudes con checkboxes - según Figma */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {solicitudes.map((solicitud) => (
              <Box
                key={solicitud.id_solicitud}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
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
        </>
      )}
    </Box>
  );
};
