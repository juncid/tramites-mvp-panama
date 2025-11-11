import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
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
import { HistoryEvent } from '../../../types/ppsh.types';

interface HistoryViewProps {
  procesoId?: string;
  solicitudId?: string;
}

/**
 * Vista de Historial - Tab 4
 * Muestra el historial de eventos del proceso PPSH
 */
export const HistoryView = ({ procesoId, solicitudId }: HistoryViewProps) => {
  const [historial, setHistorial] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Reemplazar con llamada real a API
    const loadHistorial = async () => {
      setLoading(true);
      // Mock data
      setTimeout(() => {
        setHistorial([
          {
            id: 1,
            fecha: '2025-11-11',
            hora: '14:30:00',
            accion: 'Proceso creado',
            descripcion: 'Se inició el proceso de PPSH',
            usuario: {
              id: 1,
              nombre: 'Juan',
              apellido: 'Pérez',
              email: 'juan.perez@example.com',
            },
            estadoResultante: 'INICIADO',
            tipo: 'CREACION',
          },
          {
            id: 2,
            fecha: '2025-11-11',
            hora: '15:45:00',
            accion: 'Documento cargado',
            descripcion: 'Se cargó el pasaporte del solicitante',
            usuario: {
              id: 1,
              nombre: 'Juan',
              apellido: 'Pérez',
              email: 'juan.perez@example.com',
            },
            estadoResultante: 'EN_REVISION',
            tipo: 'CARGA_DOCUMENTO',
          },
          {
            id: 3,
            fecha: '2025-11-11',
            hora: '16:20:00',
            accion: 'Documento revisado',
            descripcion: 'El documento fue revisado y aprobado por el sistema OCR',
            usuario: {
              id: 2,
              nombre: 'Sistema',
              apellido: 'OCR',
              email: 'sistema@example.com',
            },
            estadoResultante: 'EN_REVISION',
            tipo: 'REVISION_DOCUMENTO',
          },
          {
            id: 4,
            fecha: '2025-11-11',
            hora: '17:00:00',
            accion: 'Cambio de estado',
            descripcion: 'El proceso fue activado',
            usuario: {
              id: 3,
              nombre: 'María',
              apellido: 'González',
              email: 'maria.gonzalez@example.com',
            },
            estadoResultante: 'EN_REVISION',
            tipo: 'CAMBIO_ESTADO',
          },
        ]);
        setLoading(false);
      }, 500);
    };

    loadHistorial();
  }, [procesoId, solicitudId]);

  const getEventColor = (tipo: HistoryEvent['tipo']): 'primary' | 'success' | 'info' | 'warning' | 'error' => {
    switch (tipo) {
      case 'CREACION':
        return 'info';
      case 'CARGA_DOCUMENTO':
        return 'primary';
      case 'REVISION_DOCUMENTO':
        return 'success';
      case 'CAMBIO_ESTADO':
        return 'warning';
      case 'APROBACION':
        return 'success';
      case 'RECHAZO':
        return 'error';
      default:
        return 'primary';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (historial.length === 0) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography color="text.secondary">No hay eventos en el historial</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Timeline
        position="right"
        sx={{
          '& .MuiTimelineItem-root:before': {
            flex: 0,
            padding: 0,
          },
        }}
      >
        {historial.map((evento, index) => (
          <TimelineItem key={evento.id}>
            <TimelineOppositeContent
              sx={{
                flex: 0.2,
                px: 2,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: '14px',
                  color: '#666',
                  fontWeight: 500,
                }}
              >
                {evento.fecha}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '12px',
                  color: '#999',
                }}
              >
                {evento.hora}
              </Typography>
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot color={getEventColor(evento.tipo)} />
              {index < historial.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent sx={{ py: 2, px: 2 }}>
              <Box>
                {/* Fecha y hora en mobile */}
                <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '12px',
                      color: '#999',
                    }}
                  >
                    {evento.fecha} {evento.hora}
                  </Typography>
                </Box>

                {/* Acción */}
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#333',
                    mb: 0.5,
                  }}
                >
                  {evento.accion}
                </Typography>

                {/* Descripción */}
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '14px',
                    color: '#666',
                    mb: 1,
                  }}
                >
                  {evento.descripcion}
                </Typography>

                {/* Usuario y estado */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '12px',
                      color: '#999',
                    }}
                  >
                    <strong>Usuario:</strong> {evento.usuario.nombre} {evento.usuario.apellido}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '12px',
                      color: '#999',
                    }}
                  >
                    <strong>Estado:</strong> {evento.estadoResultante}
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
