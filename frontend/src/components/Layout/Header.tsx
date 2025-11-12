import {
  AppBar,
  Box,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  KeyboardArrowDown as MenuIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogoMigracion } from './LogoMigracion';

interface TabItem {
  label: string;
  path: string;
}

const tabs: TabItem[] = [
  { label: 'Inicio', path: '/' },
  { label: 'Solicitudes', path: '/solicitudes' },
  { label: 'Procesos', path: '/procesos' },
];

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const handleMobileMenuClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNavigateProfile = () => {
    navigate('/perfil');
    handleUserMenuClose();
  };

  const handleNavigateSettings = () => {
    navigate('/configuracion');
    handleUserMenuClose();
  };

  const handleLogout = () => {
    // TODO: Implementar lógica de logout
    handleUserMenuClose();
    navigate('/login');
  };

  // Fecha actual
  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-PA', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }).split('/').reverse().join('-');

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: 'white',
        boxShadow: 'none',
      }}
    >
      {/* Header superior negro con logo y usuario */}
      <Box
        sx={{
          backgroundColor: '#131414',
          px: { xs: 2, sm: 3, md: '7.69rem' },
          py: { xs: 0.5, sm: 1.5 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: { xs: 34, sm: 'auto' },
          position: 'relative',
        }}
      >
        {/* Logo - a la izquierda en mobile y desktop */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 3,
            flex: 1,
            justifyContent: 'flex-start',
          }}
        >
          <LogoMigracion />
        </Box>

        {/* Menú hamburguesa - solo mobile */}
        <Box 
          sx={{ 
            display: { xs: 'flex', sm: 'none' },
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
          }}
          onClick={() => setMobileMenuOpen(true)}
        >
          <MenuIcon sx={{ color: 'white', fontSize: 20 }} />
          <Typography sx={{ color: 'white', fontSize: '14px' }}>
            Menú
          </Typography>
        </Box>

        {/* Usuario y logout - solo desktop */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
          <Box
            onClick={handleUserMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: '#0e5fa6',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              JP
            </Avatar>
            <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>
              Juan Pérez
            </Typography>
            <ArrowDownIcon sx={{ color: 'white', fontSize: 18 }} />
          </Box>
        </Box>

        {/* Menú desplegable de usuario */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#333333' }}>
              Juan Pérez
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#788093' }}>
              juan.perez@migracion.gob.pa
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleNavigateProfile} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <PersonIcon fontSize="small" sx={{ color: '#788093' }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: '0.875rem', color: '#333333' }}>Mi Perfil</Typography>
          </MenuItem>
          <MenuItem onClick={handleNavigateSettings} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" sx={{ color: '#788093' }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: '0.875rem', color: '#333333' }}>Configuración</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: '#d32f2f' }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: '0.875rem', color: '#d32f2f' }}>Cerrar sesión</Typography>
          </MenuItem>
        </Menu>
      </Box>

      {/* Barra azul con tabs de navegación - solo desktop */}
      <Box
        sx={{
          backgroundColor: '#0e5fa6',
          px: { xs: 2, sm: 3, md: '7.69rem' },
          display: { xs: 'none', sm: 'flex' },
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 40,
        }}
      >
        <Box sx={{ display: 'flex', gap: 5 }}>
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <Box
                key={tab.path}
                onClick={() => navigate(tab.path)}
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  py: 1.5,
                }}
              >
                <Typography
                  sx={{
                    color: isActive ? 'white' : '#f1f3f4',
                    fontSize: '16px',
                    fontWeight: isActive ? 700 : 400,
                    lineHeight: '24px',
                  }}
                >
                  {tab.label}
                </Typography>
                {isActive && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '68px',
                      height: '5px',
                      backgroundColor: 'white',
                      borderTopLeftRadius: '4px',
                      borderTopRightRadius: '4px',
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>

        {/* Fecha y hora - columna a la derecha */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 0,
            lineHeight: 1,
          }}
        >
          <Typography sx={{ fontSize: '14px', color: 'white', fontWeight: 400, lineHeight: 1 }}>
            {today.toLocaleTimeString('es-PA', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </Typography>
          <Typography sx={{ fontSize: '14px', color: 'white', fontWeight: 400, lineHeight: 1 }}>
            {formattedDate}
          </Typography>
        </Box>
      </Box>

      {/* Drawer de navegación mobile */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: '80%',
            maxWidth: 300,
            backgroundColor: '#131414',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header del drawer */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Typography sx={{ color: 'white', fontSize: '16px', fontWeight: 500 }}>
              Menú
            </Typography>
            <IconButton 
              onClick={() => setMobileMenuOpen(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Lista de navegación */}
          <List sx={{ flex: 1 }}>
            {tabs.map((tab) => (
              <ListItem key={tab.path} disablePadding>
                <ListItemButton
                  selected={location.pathname === tab.path}
                  onClick={() => handleMobileMenuClick(tab.path)}
                  sx={{
                    py: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(37, 99, 235, 0.2)',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                    },
                  }}
                >
                  <ListItemText 
                    primary={tab.label}
                    sx={{
                      '& .MuiTypography-root': {
                        color: location.pathname === tab.path ? '#2563EB' : 'white',
                        fontSize: '14px',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {/* Footer del drawer con info de usuario */}
          <Box 
            sx={{ 
              p: 2, 
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Typography sx={{ color: 'white', fontSize: '12px', mb: 1 }}>
              Nombre Apellido (apellido)
            </Typography>
            <Typography 
              sx={{ 
                color: '#999', 
                fontSize: '12px',
                cursor: 'pointer',
                '&:hover': { color: 'white' }
              }}
            >
              Cerrar sesión
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
};
