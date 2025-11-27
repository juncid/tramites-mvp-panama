import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
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

// Tipos para el historial del workflow
interface WorkflowHistoryEvent {
  id: number;
  fecha: string;
  hora: string;
  tipo: 'CREACION' | 'EDICION_ETAPA' | 'NUEVA_ETAPA' | 'ELIMINAR_ETAPA' | 'CAMBIO_CONEXION' | 'PUBLICACION' | 'CONFIGURACION' | 'CAMBIO_ESTADO';
  accion: string;
  descripcion: string;
  usuario: {
    id: number;
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
 * Vista de Historial de Cambios del Workflow
 * Muestra una timeline con los cambios realizados al workflow (del más reciente al más antiguo)
 */
export const WorkflowHistoryView = ({ workflowId, workflowData }: WorkflowHistoryViewProps) => {
  const [historial, setHistorial] = useState<WorkflowHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistorial = async () => {
      setLoading(true);
      
      // TODO: Reemplazar con llamada real a API cuando exista el endpoint
      // const data = await workflowService.getWorkflowHistory(workflowId);
      
      // Mock data - ordenado del más reciente al más antiguo
      setTimeout(() => {
        setHistorial([
          {
            id: 8,
            fecha: '2025-11-27',
            hora: '16:45:00',
            tipo: 'EDICION_ETAPA',
            accion: 'Etapa modificada',
            descripcion: 'Se actualizó la configuración de la etapa "Revisión de documentos"',
            usuario: {
              id: 1,
              nombre: 'Admin',
              apellido: 'Sistema',
            },
            detalles: {
              etapa_nombre: 'Revisión de documentos',
              campo_modificado: 'perfiles_permitidos',
              valor_anterior: 'Funcionario',
              valor_nuevo: 'Funcionario, Supervisor',
            },
          },
          {
            id: 7,
            fecha: '2025-11-27',
            hora: '15:30:00',
            tipo: 'NUEVA_ETAPA',
            accion: 'Nueva etapa agregada',
            descripcion: 'Se agregó la etapa "Validación OCR" al flujo',
            usuario: {
              id: 1,
              nombre: 'Admin',
              apellido: 'Sistema',
            },
            detalles: {
              etapa_nombre: 'Validación OCR',
            },
          },
          {
            id: 6,
            fecha: '2025-11-26',
            hora: '14:20:00',
            tipo: 'CAMBIO_CONEXION',
            accion: 'Conexión modificada',
            descripcion: 'Se actualizó la conexión entre "Carga de documentos" y "Revisión"',
            usuario: {
              id: 2,
              nombre: 'María',
              apellido: 'González',
            },
            detalles: {
              valor_anterior: 'Conexión directa',
              valor_nuevo: 'Conexión condicional',
            },
          },
          {
            id: 5,
            fecha: '2025-11-25',
            hora: '11:15:00',
            tipo: 'CONFIGURACION',
            accion: 'Configuración actualizada',
            descripcion: 'Se modificaron los perfiles creadores del workflow',
            usuario: {
              id: 1,
              nombre: 'Admin',
              apellido: 'Sistema',
            },
            detalles: {
              campo_modificado: 'perfiles_creadores',
              valor_nuevo: 'Ciudadano, Abogado',
            },
          },
          {
            id: 4,
            fecha: '2025-11-24',
            hora: '10:00:00',
            tipo: 'ELIMINAR_ETAPA',
            accion: 'Etapa eliminada',
            descripcion: 'Se eliminó la etapa "Paso temporal" del flujo',
            usuario: {
              id: 2,
              nombre: 'María',
              apellido: 'González',
            },
            detalles: {
              etapa_nombre: 'Paso temporal',
            },
          },
          {
            id: 3,
            fecha: '2025-11-23',
            hora: '16:30:00',
            tipo: 'EDICION_ETAPA',
            accion: 'Etapa modificada',
            descripcion: 'Se actualizó el nombre y descripción de la etapa inicial',
            usuario: {
              id: 1,
              nombre: 'Admin',
              apellido: 'Sistema',
            },
            detalles: {
              etapa_nombre: 'Recolectar requisitos',
              campo_modificado: 'nombre',
            },
          },
          {
            id: 2,
            fecha: '2025-11-22',
            hora: '09:45:00',
            tipo: 'CAMBIO_ESTADO',
            accion: 'Estado cambiado',
            descripcion: 'El workflow pasó de BORRADOR a EN_REVISION',
            usuario: {
              id: 1,
              nombre: 'Admin',
              apellido: 'Sistema',
            },
            detalles: {
              valor_anterior: 'BORRADOR',
              valor_nuevo: 'EN_REVISION',
            },
          },
          {
            id: 1,
            fecha: '2025-11-20',
            hora: '08:00:00',
            tipo: 'CREACION',
            accion: 'Workflow creado',
            descripcion: `Se creó el workflow "${workflowData?.nombre || 'Nuevo Workflow'}"`,
            usuario: {
              id: 1,
              nombre: 'Admin',
              apellido: 'Sistema',
            },
          },
        ]);
        setLoading(false);
      }, 500);
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
