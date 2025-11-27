import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
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
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { publicService } from '../services/public.service';

interface FormData {
  pasaporte: string;
  nombres: string;
  apellidos: string;
  email: string;
  nacionalidad: string;
  sexo: string;
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
            Solicitud de Permiso Por Razones Humanitarias
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete el formulario para iniciar su solicitud PPSH
          </Typography>
        </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Pasaporte */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Número de Pasaporte"
                  placeholder="Ej: N-55-12345"
                  value={formData.pasaporte}
                  onChange={handleChange('pasaporte')}
                  disabled={loading}
                  helperText="Ingrese su número de pasaporte"
                />
              </Grid>

              {/* Nacionalidad */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Nacionalidad</InputLabel>
                  <Select
                    value={formData.nacionalidad}
                    onChange={handleChange('nacionalidad') as any}
                    disabled={loading}
                    label="Nacionalidad"
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

              {/* Nombres */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Nombres"
                  placeholder="Ej: María Elena"
                  value={formData.nombres}
                  onChange={handleChange('nombres')}
                  disabled={loading}
                />
              </Grid>

              {/* Apellidos */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Apellidos"
                  placeholder="Ej: González Pérez"
                  value={formData.apellidos}
                  onChange={handleChange('apellidos')}
                  disabled={loading}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="email"
                  label="Correo Electrónico (Opcional)"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={handleChange('email')}
                  disabled={loading}
                  helperText="Recibirá notificaciones sobre su solicitud"
                />
              </Grid>

              {/* Sexo */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Sexo</InputLabel>
                  <Select
                    value={formData.sexo}
                    onChange={handleChange('sexo') as any}
                    disabled={loading}
                    label="Sexo"
                  >
                    <MenuItem value="M">Masculino</MenuItem>
                    <MenuItem value="F">Femenino</MenuItem>
                    <MenuItem value="O">Otro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 2, py: 1.5 }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Creando solicitud...
                    </>
                  ) : (
                    'Iniciar Solicitud'
                  )}
                </Button>
              </Grid>

              {/* Info Text */}
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Importante:</strong> Al enviar este formulario se creará su solicitud PPSH 
                    y recibirá un enlace de seguimiento que podrá usar para completar el proceso en cualquier momento 
                    durante los próximos 30 días.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </form>

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
      </Paper>
    </Container>
  );
};

export default NuevaSolicitud;
