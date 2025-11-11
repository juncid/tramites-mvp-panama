import { useState, useEffect } from 'react';
import { Box, Typography, Switch, Button, CircularProgress, FormControlLabel } from '@mui/material';
import { EstadoProceso } from '../../../types/ppsh.types';

interface StatusViewProps {
  procesoId?: string;
  solicitudId?: string;
}

/**
 * Vista de Estado - Tab 3
 * Permite activar/desactivar el estado del proceso
 */
export const StatusView = ({ procesoId, solicitudId }: StatusViewProps) => {
  const [estado, setEstado] = useState<EstadoProceso | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActivado, setIsActivado] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // TODO: Reemplazar con llamada real a API
    const loadEstado = async () => {
      setLoading(true);
      // Mock data
      setTimeout(() => {
        const mockEstado = {
          id: 1,
          activo: true,
          etapa: 'EN_REVISION' as const,
          fechaCambio: new Date().toISOString(),
        };
        setEstado(mockEstado);
        setIsActivado(mockEstado.activo);
        setLoading(false);
      }, 500);
    };

    loadEstado();
  }, [procesoId, solicitudId]);

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsActivado(event.target.checked);
    setHasChanges(true);
  };

  const handleCancel = () => {
    if (estado) {
      setIsActivado(estado.activo);
      setHasChanges(false);
    }
  };

  const handleSave = async () => {
    // TODO: Guardar cambios en API
    console.log('Guardando nuevo estado:', isActivado);
    if (estado) {
      setEstado({
        ...estado,
        activo: isActivado,
        fechaCambio: new Date().toISOString(),
      });
    }
    setHasChanges(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!estado) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography color="error">No se pudo cargar el estado del proceso</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800 }}>
      {/* Indicaciones extra (primera sección) */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontSize: '14px',
            color: '#666',
            mb: 1,
            fontWeight: 500,
          }}
        >
          Indicaciones extra
        </Typography>
        <Box sx={{ height: 8 }} />
      </Box>

      {/* Estado del proceso */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontSize: '14px',
            color: '#666',
            mb: 2,
            fontWeight: 500,
          }}
        >
          Estado del proceso
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={isActivado}
              onChange={handleToggleChange}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#0e5fa6',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#0e5fa6',
                },
              }}
            />
          }
          label={
            <Typography
              sx={{
                fontSize: '16px',
                color: '#333',
                ml: 1,
              }}
            >
              {isActivado ? 'Activado' : 'Desactivado'}
            </Typography>
          }
        />
      </Box>

      {/* Indicaciones extra (segunda sección) */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontSize: '14px',
            color: '#666',
            mb: 1,
            fontWeight: 500,
          }}
        >
          Indicaciones extra
        </Typography>
        <Box sx={{ height: 8 }} />
      </Box>

      {/* Botones de acción */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
        <Button
          variant="outlined"
          onClick={handleCancel}
          disabled={!hasChanges}
          sx={{
            borderColor: '#0e5fa6',
            color: '#0e5fa6',
            textTransform: 'none',
            minWidth: 120,
            height: 40,
            fontSize: '16px',
            '&:hover': {
              borderColor: '#0d5494',
              backgroundColor: 'rgba(14, 95, 166, 0.04)',
            },
            '&:disabled': {
              borderColor: '#ccc',
              color: '#999',
            },
          }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!hasChanges}
          sx={{
            backgroundColor: '#0e5fa6',
            color: 'white',
            textTransform: 'none',
            minWidth: 120,
            height: 40,
            fontSize: '16px',
            '&:hover': {
              backgroundColor: '#0d5494',
            },
            '&:disabled': {
              backgroundColor: '#ccc',
              color: '#666',
            },
          }}
        >
          Guardar cambios
        </Button>
      </Box>
    </Box>
  );
};
