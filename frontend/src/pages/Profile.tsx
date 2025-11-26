import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Grid,
  TextField,
  Button,
  Divider,
  Chip,
  Stack,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

interface UserProfile {
  userId: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  cargo: string;
  departamento: string;
  agencia: string;
  roles: string[];
  fechaCreacion: string;
  ultimoAcceso: string;
}

export const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    userId: 'USR001',
    nombres: 'Juan Carlos',
    apellidos: 'Pérez González',
    email: 'juan.perez@migracion.gob.pa',
    telefono: '+507 6000-0000',
    cargo: 'Analista de Trámites',
    departamento: 'Migración',
    agencia: 'Oficina Central',
    roles: ['PPSH_ANALISTA', 'USUARIO'],
    fechaCreacion: '2024-01-15',
    ultimoAcceso: '2025-11-12 09:30:00',
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
  };

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    // TODO: Llamar al API para guardar cambios
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile({ ...editedProfile, [field]: value });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#333333', mb: 1 }}>
          Mi Perfil
        </Typography>
        <Typography variant="body1" sx={{ color: '#788093' }}>
          Gestiona tu información personal y configuración de cuenta
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Columna Izquierda - Avatar y Acciones */}
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                margin: '0 auto',
                bgcolor: '#0e5fa6',
                fontSize: '3rem',
                fontWeight: 700,
              }}
            >
              {profile.nombres.charAt(0)}
              {profile.apellidos.charAt(0)}
            </Avatar>

            <Typography variant="h5" sx={{ mt: 2, fontWeight: 600, color: '#333333' }}>
              {profile.nombres} {profile.apellidos}
            </Typography>

            <Typography variant="body2" sx={{ color: '#788093', mb: 2 }}>
              {profile.cargo}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              {profile.roles.map((role) => (
                <Chip
                  key={role}
                  label={role}
                  size="small"
                  sx={{
                    bgcolor: '#e3f2fd',
                    color: '#0e5fa6',
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            {!isEditing ? (
              <Button
                variant="contained"
                fullWidth
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{
                  bgcolor: '#0e5fa6',
                  '&:hover': { bgcolor: '#0d5494' },
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Editar Perfil
              </Button>
            ) : (
              <Stack spacing={1}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{
                    bgcolor: '#0e5fa6',
                    '&:hover': { bgcolor: '#0d5494' },
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  Guardar Cambios
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  sx={{
                    borderColor: '#788093',
                    color: '#788093',
                    '&:hover': { borderColor: '#333333', bgcolor: 'transparent' },
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  Cancelar
                </Button>
              </Stack>
            )}
          </Paper>

          {/* Información del Sistema */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#333333', mb: 2 }}>
                Información del Sistema
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon sx={{ color: '#0e5fa6' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="ID de Usuario"
                    secondary={profile.userId}
                    primaryTypographyProps={{ fontSize: '0.875rem', color: '#788093' }}
                    secondaryTypographyProps={{ fontSize: '0.875rem', color: '#333333', fontWeight: 500 }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon sx={{ color: '#0e5fa6' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Fecha de Creación"
                    secondary={new Date(profile.fechaCreacion).toLocaleDateString('es-PA')}
                    primaryTypographyProps={{ fontSize: '0.875rem', color: '#788093' }}
                    secondaryTypographyProps={{ fontSize: '0.875rem', color: '#333333', fontWeight: 500 }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon sx={{ color: '#0e5fa6' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Último Acceso"
                    secondary={new Date(profile.ultimoAcceso).toLocaleString('es-PA')}
                    primaryTypographyProps={{ fontSize: '0.875rem', color: '#788093' }}
                    secondaryTypographyProps={{ fontSize: '0.875rem', color: '#333333', fontWeight: 500 }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Columna Derecha - Formulario */}
        <Grid item xs={12} md={8}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333333', mb: 3 }}>
              Información Personal
            </Typography>

            <Grid container spacing={3}>
              {/* Nombres */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombres"
                  value={isEditing ? editedProfile.nombres : profile.nombres}
                  onChange={(e) => handleChange('nombres', e.target.value)}
                  disabled={!isEditing}
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
                      '& input': {
                        color: '#333333',
                        fontSize: 16,
                      },
                      '&.Mui-disabled': {
                        bgcolor: '#f1f3f4',
                      },
                    },
                  }}
                />
              </Grid>

              {/* Apellidos */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellidos"
                  value={isEditing ? editedProfile.apellidos : profile.apellidos}
                  onChange={(e) => handleChange('apellidos', e.target.value)}
                  disabled={!isEditing}
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
                      '& input': {
                        color: '#333333',
                        fontSize: 16,
                      },
                      '&.Mui-disabled': {
                        bgcolor: '#f1f3f4',
                      },
                    },
                  }}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  value={isEditing ? editedProfile.email : profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ color: '#788093', mr: 1 }} />,
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
                      '&.Mui-disabled': {
                        bgcolor: '#f1f3f4',
                      },
                    },
                  }}
                />
              </Grid>

              {/* Teléfono */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={isEditing ? editedProfile.telefono : profile.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ color: '#788093', mr: 1 }} />,
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
                      '&.Mui-disabled': {
                        bgcolor: '#f1f3f4',
                      },
                    },
                  }}
                />
              </Grid>

              {/* Cargo */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cargo"
                  value={isEditing ? editedProfile.cargo : profile.cargo}
                  onChange={(e) => handleChange('cargo', e.target.value)}
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <WorkIcon sx={{ color: '#788093', mr: 1 }} />,
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
                      '&.Mui-disabled': {
                        bgcolor: '#f1f3f4',
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333333', mb: 2 }}>
                  Información Laboral
                </Typography>
              </Grid>

              {/* Departamento */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Departamento"
                  value={profile.departamento}
                  disabled
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
                      '& input': {
                        color: '#333333',
                        fontSize: 16,
                      },
                      '&.Mui-disabled': {
                        bgcolor: '#f1f3f4',
                      },
                    },
                  }}
                />
              </Grid>

              {/* Agencia */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Agencia"
                  value={profile.agencia}
                  disabled
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <LocationIcon sx={{ color: '#788093', mr: 1 }} />,
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
                      '&.Mui-disabled': {
                        bgcolor: '#f1f3f4',
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: '#788093', fontStyle: 'italic' }}>
                  * Los campos Departamento y Agencia son gestionados por el administrador del sistema
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
