import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Link,
  Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import {
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { publicService } from '../services/public.service';
import { Header } from '../components/Layout/Header';
import { LogoMigracion } from '../components/Layout/LogoMigracion';

interface FormData {
  pasaporte: string;
  nombres: string;
  apellidos: string;
  email: string;
  nacionalidad: string;
  sexo: string;
  fechaNacimiento: Dayjs | null;
  ruex: string;
}

interface SolicitudResponse {
  success: boolean;
  instancia_id: number;
  solicitud_id: number;
  token: string;
  codigo_acceso?: string;  // Código corto para acceso fácil (ej: PPSH-A7X9)
  num_expediente: string;
  link_seguimiento: string;
  mensaje: string;
}

/**
 * Página pública para iniciar una solicitud PPSH sin autenticación
 * 
 * Permite a ciudadanos:
 * - Ingresar datos básicos (pasaporte, nombre, email)
 * - Crear solicitud PPSH con workflow
 * - Obtener token de acceso temporal (30 días)
 * - Acceder directamente al workflow para completar vistas 1-3
 */
export const NuevaSolicitud: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    pasaporte: '',
    nombres: '',
    apellidos: '',
    email: '',
    nacionalidad: 'PAN',
    sexo: 'M',
    fechaNacimiento: null,
    ruex: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SolicitudResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    setError(null);
  };

  const handleDateChange = (date: any) => {
    setFormData({
      ...formData,
      fechaNacimiento: date,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.pasaporte.trim()) {
      setError('El número de pasaporte es requerido');
      return;
    }
    if (!formData.nombres.trim()) {
      setError('Los nombres son requeridos');
      return;
    }
    if (!formData.apellidos.trim()) {
      setError('Los apellidos son requeridos');
      return;
    }
    if (!formData.fechaNacimiento) {
      setError('La fecha de nacimiento es requerida');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await publicService.iniciarSolicitud({
        pasaporte: formData.pasaporte.trim(),
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        email: formData.email.trim() || undefined,
        nacionalidad: formData.nacionalidad,
        sexo: formData.sexo,
        fecha_nacimiento: formData.fechaNacimiento!.format('YYYY-MM-DD'),
      });

      setSuccess(response);
      setDialogOpen(true);
    } catch (err: any) {
      console.error('Error creando solicitud:', err);
      setError(err.response?.data?.detail || 'Error al crear la solicitud. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (success) {
      navigator.clipboard.writeText(success.link_seguimiento);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCode = () => {
    if (success?.codigo_acceso) {
      navigator.clipboard.writeText(success.codigo_acceso);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleContinuar = () => {
    if (success) {
      // Extraer token del link
      const token = success.link_seguimiento.split('/solicitudes/')[1].split('/workflow')[0];
      navigate(`/solicitudes/${token}/workflow`);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header con logo */}
        <Header />

        {/* Hero section azul - full width */}
        <Box
          sx={{
            bgcolor: '#0e5fa6',
            pt: { xs: 3, md: 5 },
            pb: { xs: 3, md: 5 },
            px: { xs: 2, sm: 3, md: '7.69rem' },
            width: '100%',
          }}
        >
          {/* Título principal */}
          <Typography
            sx={{
              fontFamily: 'Roboto Flex, Roboto, sans-serif',
              fontWeight: 700,
              fontSize: { xs: '32px', md: '64px' },
              lineHeight: 1.1,
              color: 'white',
              mb: { xs: 2, md: 4 },
              maxWidth: '896px',
            }}
          >
            Solicitud de Permiso por Razones Humanitarias
          </Typography>

          {/* Breadcrumb navigation */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HomeIcon sx={{ color: 'white', fontSize: 20 }} />
              <Link
                component="button"
                onClick={() => navigate('/inicio')}
                sx={{
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '24px',
                  color: 'white',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Inicio
              </Link>
            </Box>
            <Typography sx={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '24px', color: 'white' }}>/</Typography>
            <Link
              component="button"
              onClick={() => navigate('/inicio')}
              sx={{
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '24px',
                color: 'white',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Trámites
            </Link>
            <Typography sx={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '24px', color: 'white' }}>/</Typography>
            <Link
              component="button"
              onClick={() => navigate('/inicio-tramite')}
              sx={{
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '24px',
                color: 'white',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Permiso de Protección de Seguridad Humanitaria
            </Link>
            <Typography sx={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '24px', color: 'white' }}>/</Typography>
            <Typography sx={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '24px', color: 'white' }}>
              Carga de requisitos del trámite PPSH
            </Typography>
          </Box>
        </Box>

        {/* Contenido principal */}
        <Box
          sx={{
            flex: 1,
            py: { xs: 4, md: 5 },
            px: { xs: 2, sm: 3, md: '7.69rem' },
          }}
        >
          <Box sx={{ maxWidth: 786, mx: 'auto' }}>
            {/* Subtítulo del formulario */}
            <Typography
              sx={{
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                lineHeight: 1.5,
                color: '#333333',
                mb: 3,
              }}
            >
              Complete el formulario para iniciar su solicitud PPSH
            </Typography>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Fila 1: Pasaporte | Nacionalidad */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Nº de Pasaporte"
                    value={formData.pasaporte}
                    onChange={handleChange('pasaporte')}
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel shrink>Nacionalidad</InputLabel>
                    <Select
                      value={formData.nacionalidad}
                      onChange={handleChange('nacionalidad') as any}
                      disabled={loading}
                      label="Nacionalidad"
                      notched
                    >
                      <MenuItem value="PAN">Panamá</MenuItem>
                      <MenuItem value="VEN">Venezuela</MenuItem>
                      <MenuItem value="COL">Colombia</MenuItem>
                      <MenuItem value="CUB">Cuba</MenuItem>
                      <MenuItem value="NIC">Nicaragua</MenuItem>
                      <MenuItem value="HON">Honduras</MenuItem>
                      <MenuItem value="SLV">El Salvador</MenuItem>
                      <MenuItem value="GTM">Guatemala</MenuItem>
                      <MenuItem value="DOM">República Dominicana</MenuItem>
                      <MenuItem value="HTI">Haití</MenuItem>
                      <MenuItem value="OTHER">Otra</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Fila 2: Nombres | Apellidos */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Nombres"
                    value={formData.nombres}
                    onChange={handleChange('nombres')}
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Apellidos"
                    value={formData.apellidos}
                    onChange={handleChange('apellidos')}
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Fila 3: Fecha de Nacimiento | Nº de RUEX */}
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Fecha de Nacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleDateChange}
                    disabled={loading}
                    maxDate={dayjs().subtract(18, 'year')}
                    minDate={dayjs().subtract(120, 'year')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        InputLabelProps: { shrink: true },
                      },
                      popper: {
                        placement: 'bottom-start',
                        modifiers: [
                          {
                            name: 'flip',
                            enabled: true,
                            options: {
                              fallbackPlacements: ['top-start', 'bottom-end'],
                            },
                          },
                          {
                            name: 'preventOverflow',
                            enabled: true,
                            options: {
                              boundary: 'viewport',
                            },
                          },
                        ],
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nº de RUEX"
                    value={formData.ruex}
                    onChange={handleChange('ruex')}
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Fila 4: Correo Electrónico | Sexo */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Correo Electrónico (Opcional)"
                    value={formData.email}
                    onChange={handleChange('email')}
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel shrink>Sexo</InputLabel>
                    <Select
                      value={formData.sexo}
                      onChange={handleChange('sexo') as any}
                      disabled={loading}
                      label="Sexo"
                      notched
                    >
                      <MenuItem value="M">Masculino</MenuItem>
                      <MenuItem value="F">Femenino</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Info Alert 1 - Mensaje sobre pasaporte */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      bgcolor: '#e5f6fd',
                      borderRadius: '8px',
                      p: 2,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                    }}
                  >
                    <InfoIcon sx={{ color: '#18587b', fontSize: 20, mt: 0.25 }} />
                    <Typography
                      sx={{
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '16px',
                        lineHeight: 1.5,
                        color: '#18587b',
                      }}
                    >
                      <Box component="span" sx={{ fontWeight: 700 }}>Importante:</Box>
                      {' '}Por favor, ingrese sus nombres y apellidos exactamente como aparecen en su pasaporte. Esto es necesario para la verificación automática de sus documentos.
                    </Typography>
                  </Box>
                </Grid>

                {/* Info Alert 2 - Mensaje sobre enlace de seguimiento */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      bgcolor: '#e5f6fd',
                      borderRadius: '8px',
                      p: 2,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                    }}
                  >
                    <InfoIcon sx={{ color: '#18587b', fontSize: 20, mt: 0.25 }} />
                    <Typography
                      sx={{
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '16px',
                        lineHeight: 1.5,
                        color: '#18587b',
                      }}
                    >
                      <Box component="span" sx={{ fontWeight: 700 }}>Importante:</Box>
                      {' '}Al enviar este formulario se creará su solicitud PPSH y recibirá un enlace de seguimiento que podrá usar para completar el proceso en cualquier momento durante los próximos 30 días.
                    </Typography>
                  </Box>
                </Grid>

                {/* Botones: Cancelar | Siguiente */}
                <Grid item xs={12}>
                  <Grid 
                    container 
                    spacing={2} 
                    sx={{ 
                      mt: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                    }}
                  >
                    <Grid item xs={12} sm="auto">
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/inicio-tramite')}
                        disabled={loading}
                        fullWidth
                        sx={{
                          borderColor: '#0e5fa6',
                          color: '#0e5fa6',
                          borderRadius: '4px',
                          px: 2,
                          py: 1,
                          fontFamily: 'Roboto, sans-serif',
                          fontWeight: 400,
                          fontSize: '16px',
                          lineHeight: '24px',
                          textTransform: 'none',
                          minWidth: { xs: '100%', sm: '142px' },
                          '&:hover': {
                            borderColor: '#0e5fa6',
                            backgroundColor: 'rgba(14, 95, 166, 0.04)',
                          },
                        }}
                      >
                        Cancelar
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm="auto" sx={{ ml: { sm: 'auto' } }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        fullWidth
                        sx={{
                          bgcolor: '#0e5fa6',
                          borderRadius: '4px',
                          px: 2,
                          py: 1,
                          fontFamily: 'Roboto, sans-serif',
                          fontWeight: 400,
                          fontSize: '16px',
                          lineHeight: '24px',
                          textTransform: 'none',
                          minWidth: { xs: '100%', sm: 'auto' },
                          '&:hover': {
                            bgcolor: '#0a4a82',
                          },
                        }}
                      >
                        {loading ? (
                          <>
                            <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                            Creando solicitud...
                          </>
                        ) : (
                          'Siguiente'
                        )}
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Box>

        {/* Success Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => {}}
          maxWidth="sm"
          fullWidth
          disableEscapeKeyDown
        >
          <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" fontWeight="bold">
              ¡Solicitud Creada Exitosamente!
            </Typography>
          </DialogTitle>
          
          <DialogContent>
            {/* Código de Acceso - PROMINENTE */}
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                mb: 3,
                bgcolor: '#e3f2fd',
                border: '2px solid #1976d2',
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                SU CÓDIGO DE ACCESO
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  color="primary"
                  sx={{
                    letterSpacing: '3px',
                    fontFamily: 'monospace',
                  }}
                >
                  {success?.codigo_acceso}
                </Typography>
                <Tooltip title={copiedCode ? '¡Copiado!' : 'Copiar código'}>
                  <IconButton onClick={handleCopyCode} color="primary">
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Guarde este código junto con su número de pasaporte
              </Typography>
            </Paper>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Número de Expediente:</strong> {success?.num_expediente}
              </Typography>
            </Box>

            {/* Link de seguimiento (alternativo) */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              También puede usar este enlace para dar seguimiento:
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                position: 'relative',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  wordBreak: 'break-all',
                  mb: 1,
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}
              >
                {success?.link_seguimiento}
              </Typography>
              <Tooltip title={copied ? '¡Copiado!' : 'Copiar enlace'}>
                <IconButton
                  size="small"
                  onClick={handleCopyLink}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Paper>

            <Alert severity="success" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Para continuar después:</strong> Ingrese a la página de "Continuar Proceso" 
                con su código <strong>{success?.codigo_acceso}</strong> y su número de pasaporte.
              </Typography>
            </Alert>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Importante:</strong> Su acceso es válido por 30 días. 
                Guarde el código en un lugar seguro.
              </Typography>
            </Alert>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 2 }}>
            <Button
              onClick={handleCopyCode}
              variant="outlined"
              startIcon={<ContentCopyIcon />}
            >
              {copiedCode ? '¡Código Copiado!' : 'Copiar Código'}
            </Button>
            <Button
              onClick={handleContinuar}
              variant="contained"
              size="large"
            >
              Continuar con la Solicitud
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default NuevaSolicitud;
