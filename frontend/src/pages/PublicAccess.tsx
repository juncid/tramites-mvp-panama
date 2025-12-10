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
  Tabs,
  Tab,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Key as KeyIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getApiBaseUrl } from '../utils/apiUrl';

// URL del API
const API_URL = getApiBaseUrl();

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface AccessFormData {
  codigoAcceso: string;
  pasaporte: string;
}

interface TokenFormData {
  token: string;
}

export const PublicAccess: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<AccessFormData>({
    codigoAcceso: '',
    pasaporte: '',
  });
  const [tokenData, setTokenData] = useState<TokenFormData>({
    token: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleChange = (field: keyof AccessFormData, value: string) => {
    // Formatear código de acceso (mayúsculas, limpiar caracteres no válidos)
    if (field === 'codigoAcceso') {
      let formatted = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
      // Evitar doble guión
      formatted = formatted.replace(/--+/g, '-');
      // Limitar a 9 caracteres (PPSH-XXXX)
      formatted = formatted.slice(0, 9);
      setFormData({ ...formData, [field]: formatted });
    } else {
      setFormData({ ...formData, [field]: value.toUpperCase() });
    }
    setError('');
    setSuccess('');
  };

  const handleTokenChange = (value: string) => {
    setTokenData({ token: value });
    setError('');
    setSuccess('');
  };

  // Validar con código de acceso corto
  const handleSubmitCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/public/solicitudes/validar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo_acceso: formData.codigoAcceso,
          pasaporte: formData.pasaporte,
        }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        setSuccess('¡Acceso validado! Redirigiendo...');
        // Redirigir a la vista de etapas con el token
        setTimeout(() => {
          navigate(`/solicitudes/${data.token}/etapas`);
        }, 1000);
      } else {
        setError(data.mensaje || 'Código de acceso o pasaporte inválido. Verifique sus datos.');
      }
    } catch (err) {
      setError('Error al validar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Validar con token completo
  const handleSubmitToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Extraer el token del link si se pegó completo
      let token = tokenData.token.trim();
      if (token.includes('/solicitudes/') && token.includes('/workflow')) {
        const match = token.match(/\/solicitudes\/([^\/]+)\/workflow/);
        if (match) {
          token = match[1];
        }
      }

      const response = await fetch(`${API_URL}/public/solicitudes/${token}/validar`);
      const data = await response.json();

      if (data.valid) {
        setSuccess('¡Token válido! Redirigiendo...');
        setTimeout(() => {
          navigate(`/solicitudes/${token}/etapas`);
        }, 1000);
      } else {
        setError('Token inválido o expirado. Verifique que el link sea correcto.');
      }
    } catch (err) {
      setError('Error al validar el token. Por favor, intente nuevamente.');
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
            Continuar Solicitud
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Ingrese su código de acceso para continuar con su trámite
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
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <KeyIcon sx={{ fontSize: 64, color: '#0e5fa6', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#333333', mb: 1 }}>
              Acceso a su Solicitud
            </Typography>
            <Typography variant="body2" sx={{ color: '#788093' }}>
              Use el código de acceso proporcionado al iniciar su trámite
            </Typography>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              centered
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                },
              }}
            >
              <Tab icon={<KeyIcon />} iconPosition="start" label="Código de Acceso" />
              <Tab icon={<LinkIcon />} iconPosition="start" label="Link Completo" />
            </Tabs>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* Tab: Código de Acceso */}
          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleSubmitCodigo}>
              <Stack spacing={3}>
                {/* Código de Acceso */}
                <TextField
                  fullWidth
                  label="Código de Acceso"
                  placeholder="Ej: PPSH-A7X9"
                  value={formData.codigoAcceso}
                  onChange={(e) => handleChange('codigoAcceso', e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    maxLength: 12,
                    style: { 
                      letterSpacing: '2px', 
                      fontWeight: 'bold',
                      fontSize: '18px',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyIcon sx={{ color: '#788093' }} />
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
                      },
                    },
                  }}
                />

                <Divider>
                  <Typography variant="caption" sx={{ color: '#788093' }}>
                    +
                  </Typography>
                </Divider>

                {/* Número de Pasaporte */}
                <TextField
                  fullWidth
                  label="Número de Pasaporte"
                  placeholder="Ej: N123456789"
                  value={formData.pasaporte}
                  onChange={(e) => handleChange('pasaporte', e.target.value)}
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
                  disabled={loading || !formData.codigoAcceso || !formData.pasaporte}
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
                  {loading ? 'Verificando...' : 'Continuar Trámite'}
                </Button>
              </Stack>
            </form>

            {/* Información adicional */}
            <Box sx={{ mt: 4, p: 2, bgcolor: '#e8f4e8', borderRadius: 1, border: '1px solid #4caf50' }}>
              <Typography variant="caption" sx={{ color: '#2e7d32', display: 'block', fontWeight: 500 }}>
                💡 El código de acceso tiene formato: <strong>PPSH-XXXX</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: '#2e7d32', display: 'block', mt: 0.5 }}>
                Este código le fue proporcionado al iniciar su solicitud.
              </Typography>
            </Box>
          </TabPanel>

          {/* Tab: Link Completo */}
          <TabPanel value={tabValue} index={1}>
            <form onSubmit={handleSubmitToken}>
              <Stack spacing={3}>
                {/* Link o Token */}
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Link de Seguimiento"
                  placeholder="Pegue aquí el link completo o token que recibió"
                  value={tokenData.token}
                  onChange={(e) => handleTokenChange(e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon sx={{ color: '#788093' }} />
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
                      '& textarea': {
                        color: '#333333',
                        fontSize: 12,
                        fontFamily: 'monospace',
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
                  disabled={loading || !tokenData.token}
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
                  {loading ? 'Verificando...' : 'Acceder con Link'}
                </Button>
              </Stack>
            </form>

            {/* Información adicional */}
            <Box sx={{ mt: 4, p: 2, bgcolor: '#f1f3f4', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ color: '#788093', display: 'block' }}>
                El link de seguimiento tiene un formato similar a:
              </Typography>
              <Typography variant="caption" sx={{ color: '#0e5fa6', display: 'block', mt: 0.5, fontFamily: 'monospace' }}>
                http://...  /solicitudes/eyJhbG.../workflow
              </Typography>
            </Box>
          </TabPanel>

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

        {/* Botón para volver */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/inicio')}
            sx={{
              color: '#0e5fa6',
              borderColor: '#0e5fa6',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#0d5494',
                bgcolor: 'rgba(14, 95, 166, 0.05)',
              },
            }}
          >
            ← Volver al Inicio
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default PublicAccess;
