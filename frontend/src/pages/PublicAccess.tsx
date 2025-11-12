import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  InputAdornment,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface AccessFormData {
  numeroSolicitud: string;
  numeroDocumento: string;
  tipoDocumento: 'PASAPORTE' | 'CEDULA';
}

export const PublicAccess: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AccessFormData>({
    numeroSolicitud: '',
    numeroDocumento: '',
    tipoDocumento: 'PASAPORTE',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof AccessFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Llamar al API para validar acceso
      // const response = await fetch('/api/v1/public/validar-acceso', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // Simulación de validación
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Si la validación es exitosa, redirigir a la vista de solicitud
      if (formData.numeroSolicitud && formData.numeroDocumento) {
        navigate(`/consulta-publica/${formData.numeroSolicitud}`, {
          state: {
            numeroDocumento: formData.numeroDocumento,
            tipoDocumento: formData.tipoDocumento,
          },
        });
      } else {
        setError('Los datos ingresados no coinciden con ninguna solicitud activa.');
      }
    } catch (err) {
      setError('Error al validar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f9fafb',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: '#0e5fa6',
          color: 'white',
          py: 4,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Consulta de Solicitud
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Ingrese los datos de su solicitud para consultar el estado
          </Typography>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ flex: 1, py: 6 }}>
        <Paper
          elevation={2}
          sx={{
            p: 4,
            borderRadius: 2,
          }}
        >
          {/* Título */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <DocumentIcon sx={{ fontSize: 64, color: '#0e5fa6', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#333333', mb: 1 }}>
              Acceso a su Solicitud
            </Typography>
            <Typography variant="body2" sx={{ color: '#788093' }}>
              Para acceder al estado de su trámite, necesitamos verificar su identidad
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Número de Solicitud */}
              <TextField
                fullWidth
                label="Número de Solicitud"
                placeholder="Ej: PPSH-2025-00001"
                value={formData.numeroSolicitud}
                onChange={(e) => handleChange('numeroSolicitud', e.target.value.toUpperCase())}
                required
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DocumentIcon sx={{ color: '#788093' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputLabel-root': {
                    bgcolor: 'white',
                    px: 0.5,
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#333333',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#788093',
                    },
                    '& input': {
                      color: '#333333',
                      fontSize: 16,
                    },
                  },
                }}
              />

              <Divider>
                <Typography variant="caption" sx={{ color: '#788093' }}>
                  Y
                </Typography>
              </Divider>

              {/* Tipo de Documento */}
              <TextField
                select
                fullWidth
                label="Tipo de Documento"
                value={formData.tipoDocumento}
                onChange={(e) =>
                  handleChange('tipoDocumento', e.target.value as 'PASAPORTE' | 'CEDULA')
                }
                SelectProps={{ native: true }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiInputLabel-root': {
                    bgcolor: 'white',
                    px: 0.5,
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#333333',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#788093',
                    },
                    '& select': {
                      color: '#333333',
                      fontSize: 16,
                    },
                  },
                }}
              >
                <option value="PASAPORTE">Pasaporte</option>
                <option value="CEDULA">Cédula de Identidad</option>
              </TextField>

              {/* Número de Documento */}
              <TextField
                fullWidth
                label={
                  formData.tipoDocumento === 'PASAPORTE'
                    ? 'Número de Pasaporte'
                    : 'Número de Cédula'
                }
                placeholder={
                  formData.tipoDocumento === 'PASAPORTE' ? 'Ej: N123456789' : 'Ej: 8-123-4567'
                }
                value={formData.numeroDocumento}
                onChange={(e) => handleChange('numeroDocumento', e.target.value.toUpperCase())}
                required
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#788093' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputLabel-root': {
                    bgcolor: 'white',
                    px: 0.5,
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#333333',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#788093',
                    },
                    '& input': {
                      color: '#333333',
                      fontSize: 16,
                    },
                  },
                }}
              />

              {/* Botón de Acceso */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || !formData.numeroSolicitud || !formData.numeroDocumento}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <VisibilityIcon />}
                sx={{
                  bgcolor: '#0e5fa6',
                  color: 'white',
                  py: 1.5,
                  fontSize: 16,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#0d5494',
                  },
                  '&:disabled': {
                    bgcolor: '#e0e0e0',
                    color: '#999999',
                  },
                }}
              >
                {loading ? 'Verificando...' : 'Consultar Solicitud'}
              </Button>
            </Stack>
          </form>

          {/* Información adicional */}
          <Box sx={{ mt: 4, p: 2, bgcolor: '#f1f3f4', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ color: '#788093', display: 'block', mb: 1 }}>
              <strong>Nota:</strong> El número de solicitud le fue proporcionado al momento de registrar
              su trámite.
            </Typography>
            <Typography variant="caption" sx={{ color: '#788093', display: 'block' }}>
              Si no recuerda su número de solicitud o tiene problemas para acceder, comuníquese con
              el Servicio Nacional de Migración.
            </Typography>
          </Box>

          {/* Ayuda */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#788093' }}>
              ¿Necesita ayuda?{' '}
              <Typography
                component="span"
                sx={{
                  color: '#0e5fa6',
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Contactar soporte
              </Typography>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PublicAccess;
