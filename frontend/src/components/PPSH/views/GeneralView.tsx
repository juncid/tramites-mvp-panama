import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { ProcesoDetalle } from '../../../types/ppsh.types';

interface GeneralViewProps {
  procesoId?: string;
  solicitudId?: string;
}

/**
 * Vista General - Tab 1
 * Muestra información básica del proceso PPSH
 */
export const GeneralView = ({ procesoId, solicitudId }: GeneralViewProps) => {
  const [proceso, setProceso] = useState<ProcesoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // TODO: Reemplazar con llamada real a API
    const loadProceso = async () => {
      setLoading(true);
      // Mock data
      setTimeout(() => {
        setProceso({
          id: parseInt(procesoId || '1'),
          nombre: 'Permiso de Protección de Seguridad Humanitaria',
          descripcion: 'Lorem Ipsum',
          indicacionesExtra: '',
          estado: {
            id: 1,
            activo: true,
            etapa: 'EN_REVISION',
            fechaCambio: new Date().toISOString(),
          },
          fechaCreacion: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString(),
          usuarioCreador: {
            id: 1,
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan.perez@example.com',
          },
        });
        setLoading(false);
      }, 500);
    };

    loadProceso();
  }, [procesoId, solicitudId]);

  const handleCancel = () => {
    setIsEditing(false);
    // TODO: Revertir cambios
  };

  const handleSave = () => {
    // TODO: Guardar cambios en API
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!proceso) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography color="error">No se pudo cargar la información del proceso</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800 }}>
      {/* Nombre del proceso */}
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
          Nombre del proceso
        </Typography>
        <TextField
          fullWidth
          value={proceso.nombre}
          disabled={!isEditing}
          variant="outlined"
          sx={{
            '& .MuiInputBase-root': {
              backgroundColor: isEditing ? 'white' : '#f5f5f5',
            },
          }}
        />
      </Box>

      {/* Detalles del proceso */}
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
          Detalles del proceso
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={6}
          value={proceso.descripcion}
          disabled={!isEditing}
          variant="outlined"
          sx={{
            '& .MuiInputBase-root': {
              backgroundColor: isEditing ? 'white' : '#f5f5f5',
            },
          }}
        />
      </Box>

      {/* Botones de acción */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
        <Button
          variant="outlined"
          onClick={handleCancel}
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
          }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
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
          }}
        >
          Guardar cambios
        </Button>
      </Box>
    </Box>
  );
};
