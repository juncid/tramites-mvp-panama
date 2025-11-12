import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  Stack,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Save as SaveIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Brightness4 as ThemeIcon,
} from '@mui/icons-material';

export const Settings: React.FC = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    solicitudes: true,
    tramites: true,
    recordatorios: true,
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    language: 'es',
    twoFactor: false,
  });

  const handlePasswordChange = () => {
    // TODO: Validar y llamar al API
    if (passwords.new === passwords.confirm && passwords.new.length >= 8) {
      setSuccess(true);
      setPasswords({ current: '', new: '', confirm: '' });
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleSaveNotifications = () => {
    // TODO: Llamar al API
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleSavePreferences = () => {
    // TODO: Llamar al API
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#333333', mb: 1 }}>
          Configuración
        </Typography>
        <Typography variant="body1" sx={{ color: '#788093' }}>
          Gestiona tus preferencias y configuración de seguridad
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Configuración guardada exitosamente
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Cambiar Contraseña */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LockIcon sx={{ color: '#0e5fa6', mr: 2, fontSize: 28 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333333' }}>
                  Cambiar Contraseña
                </Typography>
                <Typography variant="body2" sx={{ color: '#788093' }}>
                  Actualiza tu contraseña periódicamente para mayor seguridad
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type={showCurrentPassword ? 'text' : 'password'}
                  label="Contraseña Actual"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
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
                      '& fieldset': { borderColor: '#788093' },
                      '& input': { color: '#333333', fontSize: 16 },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type={showNewPassword ? 'text' : 'password'}
                  label="Nueva Contraseña"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
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
                      '& fieldset': { borderColor: '#788093' },
                      '& input': { color: '#333333', fontSize: 16 },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirmar Contraseña"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
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
                      '& fieldset': { borderColor: '#788093' },
                      '& input': { color: '#333333', fontSize: 16 },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: '#788093' }}>
                  * La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handlePasswordChange}
                  disabled={!passwords.current || !passwords.new || passwords.new !== passwords.confirm}
                  sx={{
                    bgcolor: '#0e5fa6',
                    '&:hover': { bgcolor: '#0d5494' },
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  Cambiar Contraseña
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Notificaciones */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <NotificationsIcon sx={{ color: '#0e5fa6', mr: 2, fontSize: 28 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333333' }}>
                  Notificaciones
                </Typography>
                <Typography variant="body2" sx={{ color: '#788093' }}>
                  Configura cómo deseas recibir notificaciones
                </Typography>
              </Box>
            </Box>

            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.email}
                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#0e5fa6' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0e5fa6' },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#333333' }}>
                      Notificaciones por Email
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#788093' }}>
                      Recibe actualizaciones en tu correo electrónico
                    </Typography>
                  </Box>
                }
              />

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.push}
                    onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#0e5fa6' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0e5fa6' },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#333333' }}>
                      Notificaciones Push
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#788093' }}>
                      Recibe notificaciones en el navegador
                    </Typography>
                  </Box>
                }
              />

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.solicitudes}
                    onChange={(e) => setNotifications({ ...notifications, solicitudes: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#0e5fa6' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0e5fa6' },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#333333' }}>
                      Nuevas Solicitudes
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#788093' }}>
                      Notificar cuando haya nuevas solicitudes
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.tramites}
                    onChange={(e) => setNotifications({ ...notifications, tramites: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#0e5fa6' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0e5fa6' },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#333333' }}>
                      Actualizaciones de Trámites
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#788093' }}>
                      Notificar cambios en el estado de trámites
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.recordatorios}
                    onChange={(e) => setNotifications({ ...notifications, recordatorios: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#0e5fa6' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0e5fa6' },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#333333' }}>
                      Recordatorios
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#788093' }}>
                      Recibe recordatorios de tareas pendientes
                    </Typography>
                  </Box>
                }
              />
            </Stack>

            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveNotifications}
              fullWidth
              sx={{
                mt: 3,
                bgcolor: '#0e5fa6',
                '&:hover': { bgcolor: '#0d5494' },
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Guardar Notificaciones
            </Button>
          </Paper>
        </Grid>

        {/* Preferencias */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SecurityIcon sx={{ color: '#0e5fa6', mr: 2, fontSize: 28 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333333' }}>
                  Preferencias y Seguridad
                </Typography>
                <Typography variant="body2" sx={{ color: '#788093' }}>
                  Personaliza tu experiencia en el sistema
                </Typography>
              </Box>
            </Box>

            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.darkMode}
                    onChange={(e) => setPreferences({ ...preferences, darkMode: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#0e5fa6' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0e5fa6' },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ThemeIcon sx={{ color: '#788093' }} />
                    <Box>
                      <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#333333' }}>
                        Modo Oscuro
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#788093' }}>
                        Activa el tema oscuro para reducir la fatiga visual
                      </Typography>
                    </Box>
                  </Box>
                }
              />

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.twoFactor}
                    onChange={(e) => setPreferences({ ...preferences, twoFactor: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#0e5fa6' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0e5fa6' },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon sx={{ color: '#788093' }} />
                    <Box>
                      <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#333333' }}>
                        Autenticación de Dos Factores (2FA)
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#788093' }}>
                        Agrega una capa extra de seguridad a tu cuenta
                      </Typography>
                    </Box>
                  </Box>
                }
              />

              <Divider />

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LanguageIcon sx={{ color: '#788093' }} />
                  <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#333333' }}>
                    Idioma del Sistema
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#788093', display: 'block', mb: 1 }}>
                  Selecciona el idioma de tu preferencia
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  SelectProps={{ native: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#788093' },
                      '& select': { color: '#333333', fontSize: 16 },
                    },
                  }}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </TextField>
              </Box>
            </Stack>

            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSavePreferences}
              fullWidth
              sx={{
                mt: 3,
                bgcolor: '#0e5fa6',
                '&:hover': { bgcolor: '#0d5494' },
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Guardar Preferencias
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Settings;
