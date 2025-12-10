/**
 * Pantalla de Login para Desarrollo/Testing
 * 
 * Permite seleccionar un perfil de usuario para probar diferentes roles.
 * NO usar en producción - solo para desarrollo.
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Avatar,
  Chip,
  Alert,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Badge as FuncionarioIcon,
  SupervisorAccount as SupervisorIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth, PerfilUsuario } from '../context/AuthContext';

// Usuarios de prueba predefinidos (solo funcionarios y admins - ciudadanos no se loguean)
const USUARIOS_TEST = [
  {
    id: 1,
    nombre: 'Admin Sistema',
    email: 'admin@migracion.gob.pa',
    perfil: 'ADMIN' as PerfilUsuario,
    descripcion: 'Acceso completo a todas las funcionalidades',
    icon: AdminIcon,
    color: '#d32f2f',
  },
  {
    id: 2,
    nombre: 'María García',
    email: 'maria.garcia@migracion.gob.pa',
    perfil: 'FUNCIONARIO' as PerfilUsuario,
    descripcion: 'Gestión de solicitudes y trámites',
    icon: FuncionarioIcon,
    color: '#1976d2',
  },
  {
    id: 3,
    nombre: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@migracion.gob.pa',
    perfil: 'FUNCIONARIO' as PerfilUsuario,
    descripcion: 'Analista de documentos',
    icon: SupervisorIcon,
    color: '#7b1fa2',
  },
];

export const LoginDev: React.FC = () => {
  const navigate = useNavigate();
  const { setUsuario } = useAuth();
  const [selectedUser, setSelectedUser] = useState<number | ''>('');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customPerfil, setCustomPerfil] = useState<PerfilUsuario>('FUNCIONARIO');

  const handleLogin = (userId: number) => {
    const user = USUARIOS_TEST.find(u => u.id === userId);
    if (user) {
      setUsuario({
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        perfil: user.perfil,
      });
      navigate('/dashboard');
    }
  };

  const handleCustomLogin = () => {
    if (customName && customEmail) {
      setUsuario({
        id: 999,
        nombre: customName,
        email: customEmail,
        perfil: customPerfil,
      });
      navigate('/dashboard');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0e5fa6 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 600,
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <img
              src="/logo-panama.png"
              alt="Logo Panamá"
              style={{ height: 60, marginBottom: 16 }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <Typography variant="h4" fontWeight={600} color="#1e3a5f">
              Sistema de Trámites Migratorios
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Servicio Nacional de Migración de Panamá
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              <strong>Modo Desarrollo</strong> - Seleccione un perfil para testing
            </Alert>
          </Box>

          {/* Usuarios predefinidos */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Usuarios de Prueba
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
            {USUARIOS_TEST.map((user) => {
              const IconComponent = user.icon;
              return (
                <Card
                  key={user.id}
                  variant="outlined"
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: user.color,
                      boxShadow: `0 0 0 1px ${user.color}`,
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={() => handleLogin(user.id)}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                    <Avatar sx={{ bgcolor: user.color, width: 48, height: 48 }}>
                      <IconComponent />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight={600}>{user.nombre}</Typography>
                        <Chip
                          label={user.perfil}
                          size="small"
                          sx={{
                            bgcolor: user.color,
                            color: 'white',
                            fontSize: '11px',
                            height: 20,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.descripcion}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<LoginIcon />}
                      sx={{ bgcolor: user.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogin(user.id);
                      }}
                    >
                      Entrar
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          {/* Usuario personalizado */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Usuario Personalizado
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Nombre"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                size="small"
                fullWidth
              />
              <TextField
                label="Email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                size="small"
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Perfil</InputLabel>
                <Select
                  value={customPerfil}
                  label="Perfil"
                  onChange={(e) => setCustomPerfil(e.target.value as PerfilUsuario)}
                >
                  <MenuItem value="ADMIN">ADMIN</MenuItem>
                  <MenuItem value="FUNCIONARIO">FUNCIONARIO</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<LoginIcon />}
                onClick={handleCustomLogin}
                disabled={!customName || !customEmail}
                sx={{ flex: 1 }}
              >
                Entrar como Usuario Personalizado
              </Button>
            </Box>
          </Box>

          {/* Link para ciudadanos */}
          <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
            <Typography variant="body2" color="text.secondary">
              ¿Es ciudadano solicitante?{' '}
              <a href="/inicio" style={{ color: '#0e5fa6', textDecoration: 'none' }}>
                Ir a inicio de trámites →
              </a>
            </Typography>
          </Box>

          {/* Footer */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 4 }}
          >
            © 2025 Sistema de Trámites Migratorios - Panamá
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginDev;
