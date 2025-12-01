import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  Alert,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Publish as PublishIcon,
  Settings as SettingsIcon,
  SwapHoriz as SwapIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { workflowService, WorkflowCambio } from '../../services/workflow.service';

// Tipos para el historial del workflow (interno del componente)
interface WorkflowHistoryEvent {
  id: number;
  fecha: string;
  hora: string;
  tipo: 'CREACION' | 'EDICION_ETAPA' | 'NUEVA_ETAPA' | 'ELIMINAR_ETAPA' | 'CAMBIO_CONEXION' | 'PUBLICACION' | 'CONFIGURACION' | 'CAMBIO_ESTADO';
  accion: string;
  descripcion: string;
  usuario: {
    nombre: string;
    apellido: string;
  };
  detalles?: {
    etapa_nombre?: string;
    campo_modificado?: string;
    valor_anterior?: string;
    valor_nuevo?: string;
  };
}

interface WorkflowHistoryViewProps {
  workflowId?: number;
  workflowData?: {
    codigo?: string;
    nombre?: string;
    created_at?: string;
    updated_at?: string;
  };
}

/**
 * Convierte los datos del API al formato interno del componente
 */
const convertApiToHistoryEvent = (cambio: WorkflowCambio): WorkflowHistoryEvent => {
  const fecha = new Date(cambio.created_at);
  const nombreParts = (cambio.created_by_nombre || cambio.created_by || 'Sistema').split(' ');
  
  return {
    id: cambio.id,
    fecha: fecha.toISOString().split('T')[0],
    hora: fecha.toTimeString().split(' ')[0],
    tipo: cambio.tipo_cambio as WorkflowHistoryEvent['tipo'],
    accion: cambio.accion,
    descripcion: cambio.descripcion || '',
    usuario: {
      nombre: nombreParts[0] || 'Sistema',
      apellido: nombreParts.slice(1).join(' ') || '',
    },
    detalles: cambio.detalles || (
      (cambio.etapa_nombre || cambio.campo_modificado || cambio.valor_anterior || cambio.valor_nuevo)
        ? {
            etapa_nombre: cambio.etapa_nombre,
            campo_modificado: cambio.campo_modificado,
            valor_anterior: cambio.valor_anterior,
            valor_nuevo: cambio.valor_nuevo,
          }
        : undefined
    ),
  };
};

/**
 * Vista de Historial de Cambios del Workflow
 * Muestra una timeline con los cambios realizados al workflow (del más reciente al más antiguo)
 */
export const WorkflowHistoryView = ({ workflowId, workflowData }: WorkflowHistoryViewProps) => {
  const [historial, setHistorial] = useState<WorkflowHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    const loadHistorial = async () => {
      setLoading(true);
      setError(null);
      setUsingMockData(false);
      
      // Si hay workflowId, cargar desde API
      if (workflowId) {
        try {
          const data = await workflowService.getWorkflowHistorialCambios(workflowId);
          
          if (data && data.length > 0) {
            setHistorial(data.map(convertApiToHistoryEvent));
          } else {
            // API devolvió vacío - mostrar estado vacío
            setHistorial([]);
          }
          setLoading(false);
          return;
        } catch (err) {
          console.error('Error al cargar historial:', err);
          setError('No se pudo cargar el historial de cambios');
          setHistorial([]);
          setLoading(false);
          return;
        }
      }
      
      // Sin workflowId - mostrar estado vacío
      setHistorial([]);
      setLoading(false);
    };

    loadHistorial();
  }, [workflowId, workflowData?.nombre]);

  const getEventIcon = (tipo: WorkflowHistoryEvent['tipo']) => {
    switch (tipo) {
      case 'CREACION':
        return <AddIcon sx={{ fontSize: 16 }} />;
      case 'EDICION_ETAPA':
        return <EditIcon sx={{ fontSize: 16 }} />;
      case 'NUEVA_ETAPA':
        return <AddIcon sx={{ fontSize: 16 }} />;
      case 'ELIMINAR_ETAPA':
        return <DeleteIcon sx={{ fontSize: 16 }} />;
      case 'CAMBIO_CONEXION':
        return <SwapIcon sx={{ fontSize: 16 }} />;
      case 'PUBLICACION':
        return <PublishIcon sx={{ fontSize: 16 }} />;
      case 'CONFIGURACION':
        return <SettingsIcon sx={{ fontSize: 16 }} />;
      case 'CAMBIO_ESTADO':
        return <SaveIcon sx={{ fontSize: 16 }} />;
      default:
        return <EditIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getEventColor = (tipo: WorkflowHistoryEvent['tipo']): 'primary' | 'success' | 'info' | 'warning' | 'error' | 'secondary' => {
    switch (tipo) {
      case 'CREACION':
        return 'success';
      case 'EDICION_ETAPA':
        return 'primary';
      case 'NUEVA_ETAPA':
        return 'info';
      case 'ELIMINAR_ETAPA':
        return 'error';
      case 'CAMBIO_CONEXION':
        return 'warning';
      case 'PUBLICACION':
        return 'success';
      case 'CONFIGURACION':
        return 'secondary';
      case 'CAMBIO_ESTADO':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getTipoLabel = (tipo: WorkflowHistoryEvent['tipo']): string => {
    switch (tipo) {
      case 'CREACION':
        return 'Creación';
      case 'EDICION_ETAPA':
        return 'Edición';
      case 'NUEVA_ETAPA':
        return 'Nueva etapa';
      case 'ELIMINAR_ETAPA':
        return 'Eliminación';
      case 'CAMBIO_CONEXION':
        return 'Conexión';
      case 'PUBLICACION':
        return 'Publicación';
      case 'CONFIGURACION':
        return 'Config';
      case 'CAMBIO_ESTADO':
        return 'Estado';
      default:
        return tipo;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (historial.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No hay cambios registrados en el historial
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1a1a1a' }}>
        Historial de Cambios
      </Typography>
      
      {usingMockData && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Mostrando datos de ejemplo. Los cambios reales se registrarán automáticamente al modificar el workflow.
        </Alert>
      )}
      
      <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
        Mostrando {historial.length} cambios ordenados del más reciente al más antiguo
      </Typography>

      <Timeline
        position="right"
        sx={{
          '& .MuiTimelineItem-root:before': {
            flex: 0,
            padding: 0,
          },
          pl: 0,
        }}
      >
        {historial.map((evento, index) => (
          <TimelineItem key={evento.id}>
            <TimelineOppositeContent
              sx={{
                flex: '0 0 140px',
                px: 2,
                display: { xs: 'none', md: 'block' },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: '13px',
                  color: '#444',
                  fontWeight: 500,
                }}
              >
                {evento.fecha}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '12px',
                  color: '#888',
                }}
              >
                {evento.hora}
              </Typography>
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot 
                color={getEventColor(evento.tipo)}
                sx={{ 
                  p: 1,
                  boxShadow: 'none',
                }}
              >
                {getEventIcon(evento.tipo)}
              </TimelineDot>
              {index < historial.length - 1 && (
                <TimelineConnector sx={{ bgcolor: '#e0e0e0' }} />
              )}
            </TimelineSeparator>

            <TimelineContent sx={{ py: 2, px: 2 }}>
              <Box
                sx={{
                  bgcolor: '#fafafa',
                  borderRadius: 2,
                  p: 2,
                  border: '1px solid #eee',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                    borderColor: '#ddd',
                  },
                }}
              >
                {/* Fecha y hora en mobile */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 1, gap: 1, alignItems: 'center' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '11px',
                      color: '#888',
                    }}
                  >
                    {evento.fecha} • {evento.hora}
                  </Typography>
                </Box>

                {/* Header con acción y tipo */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#1a1a1a',
                    }}
                  >
                    {evento.accion}
                  </Typography>
                  <Chip
                    label={getTipoLabel(evento.tipo)}
                    size="small"
                    color={getEventColor(evento.tipo)}
                    sx={{ 
                      height: 20, 
                      fontSize: '11px',
                      fontWeight: 500,
                    }}
                  />
                </Box>

                {/* Descripción */}
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '13px',
                    color: '#555',
                    mb: 1.5,
                    lineHeight: 1.5,
                  }}
                >
                  {evento.descripcion}
                </Typography>

                {/* Detalles adicionales */}
                {evento.detalles && (
                  <Box 
                    sx={{ 
                      bgcolor: '#fff',
                      borderRadius: 1,
                      p: 1.5,
                      mb: 1.5,
                      border: '1px solid #eee',
                    }}
                  >
                    {evento.detalles.etapa_nombre && (
                      <Typography variant="caption" sx={{ display: 'block', color: '#666', fontSize: '12px' }}>
                        <strong>Etapa:</strong> {evento.detalles.etapa_nombre}
                      </Typography>
                    )}
                    {evento.detalles.campo_modificado && (
                      <Typography variant="caption" sx={{ display: 'block', color: '#666', fontSize: '12px' }}>
                        <strong>Campo:</strong> {evento.detalles.campo_modificado}
                      </Typography>
                    )}
                    {evento.detalles.valor_anterior && (
                      <Typography variant="caption" sx={{ display: 'block', color: '#666', fontSize: '12px' }}>
                        <strong>Anterior:</strong>{' '}
                        <Box component="span" sx={{ color: '#d32f2f', textDecoration: 'line-through' }}>
                          {evento.detalles.valor_anterior}
                        </Box>
                      </Typography>
                    )}
                    {evento.detalles.valor_nuevo && (
                      <Typography variant="caption" sx={{ display: 'block', color: '#666', fontSize: '12px' }}>
                        <strong>Nuevo:</strong>{' '}
                        <Box component="span" sx={{ color: '#2e7d32', fontWeight: 500 }}>
                          {evento.detalles.valor_nuevo}
                        </Box>
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Usuario */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PersonIcon sx={{ fontSize: 14, color: '#999' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '12px',
                      color: '#888',
                    }}
                  >
                    {evento.usuario.nombre} {evento.usuario.apellido}
                  </Typography>
                </Box>
              </Box>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
};

export default WorkflowHistoryView;
