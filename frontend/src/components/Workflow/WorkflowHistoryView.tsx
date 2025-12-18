import { useState, useEffect, useRef, useCallback } from 'react';
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

// Constantes para paginación
const PAGE_SIZE = 15;

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
 * Implementa scroll infinito para cargar más elementos a medida que el usuario hace scroll
 */
export const WorkflowHistoryView = ({ workflowId, workflowData }: WorkflowHistoryViewProps) => {
  const [historial, setHistorial] = useState<WorkflowHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Refs para el manejo del scroll infinito
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const loadingMoreRef = useRef(false);

  // Función para cargar historial (inicial o más elementos)
  const loadHistorial = useCallback(async (isInitialLoad: boolean = false) => {
    if (!workflowId) {
      setHistorial([]);
      setLoading(false);
      return;
    }

    // Evitar cargas duplicadas
    if (!isInitialLoad && loadingMoreRef.current) {
      return;
    }

    if (isInitialLoad) {
      setLoading(true);
      offsetRef.current = 0;
      setHasMore(true);
    } else {
      loadingMoreRef.current = true;
      setLoadingMore(true);
    }
    
    setError(null);
    setUsingMockData(false);
    
    try {
      const currentOffset = isInitialLoad ? 0 : offsetRef.current;
      const data = await workflowService.getWorkflowHistorialCambios(workflowId, PAGE_SIZE, currentOffset);
      
      if (data && data.length > 0) {
        const newEvents = data.map(convertApiToHistoryEvent);
        
        if (isInitialLoad) {
          setHistorial(newEvents);
        } else {
          setHistorial(prev => [...prev, ...newEvents]);
        }
        
        // Si recibimos menos elementos que PAGE_SIZE, no hay más datos
        if (data.length < PAGE_SIZE) {
          setHasMore(false);
        }
        
        offsetRef.current = currentOffset + data.length;
      } else {
        if (isInitialLoad) {
          setHistorial([]);
        }
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error al cargar historial:', err);
      if (isInitialLoad) {
        setError('No se pudo cargar el historial de cambios');
        setHistorial([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [workflowId]);

  // Carga inicial cuando cambia el workflowId
  useEffect(() => {
    loadHistorial(true);
  }, [workflowId, workflowData?.nombre, loadHistorial]);

  // Configurar el Intersection Observer para scroll infinito
  useEffect(() => {
    // Limpiar observador anterior
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Crear nuevo observador - usar el contenedor de scroll como root
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loadingMoreRef.current && !loading) {
          loadHistorial(false);
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '100px',
        threshold: 0,
      }
    );

    // Observar el elemento sentinel
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadHistorial]);

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
        Mostrando {historial.length} cambios{hasMore ? ' (desplaza para ver más)' : ''} ordenados del más reciente al más antiguo
      </Typography>

      {/* Contenedor con scroll para el historial */}
      <Box 
        ref={scrollContainerRef}
        sx={{ 
          maxHeight: 'calc(100vh - 350px)', 
          minHeight: 400,
          overflowY: 'auto',
          overflowX: 'hidden',
          pr: 1,
          // Estilo para scrollbar
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#c1c1c1',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: '#a8a8a8',
            },
          },
        }}
      >
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
      
      {/* Sentinel element para scroll infinito */}
      <Box 
        ref={loadMoreRef}
        sx={{ 
          py: 2, 
          display: 'flex', 
          justifyContent: 'center',
          minHeight: 60,
        }}
      >
        {loadingMore && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Cargando más cambios...
            </Typography>
          </Box>
        )}
        {!loadingMore && !hasMore && historial.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            — Fin del historial —
          </Typography>
        )}
      </Box>
      </Box>
    </Box>
  );
};

export default WorkflowHistoryView;
