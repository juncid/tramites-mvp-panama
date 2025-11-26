import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Home as HomeIcon,
  Description as TramitesIcon,
  PersonAdd as SolicitudesIcon,
  Folder as DocumentosIcon,
  Scanner as OCRIcon,
  Gavel as WorkflowIcon,
  Assessment as ReportesIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 280;

interface MenuItem {
  text: string;
  icon: JSX.Element;
  path: string;
}

const menuItems: MenuItem[] = [
  { text: 'Inicio', icon: <HomeIcon />, path: '/' },
  { text: 'Trámites', icon: <TramitesIcon />, path: '/tramites' },
  { text: 'Solicitudes', icon: <SolicitudesIcon />, path: '/solicitudes' },
  { text: 'Documentos', icon: <DocumentosIcon />, path: '/documentos' },
  { text: 'OCR', icon: <OCRIcon />, path: '/ocr' },
  { text: 'Workflow', icon: <WorkflowIcon />, path: '/workflow' },
  { text: 'Reportes', icon: <ReportesIcon />, path: '/reportes' },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#1E293B', // Slate-800 según diseño
          color: 'white',
          borderRight: 'none',
        },
      }}
    >
      {/* Logo y título */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1,
            backgroundColor: '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            color: 'white',
          }}
        >
          MP
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            Migración
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            Panamá
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#334155' }} />

      {/* Perfil de usuario */}
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: '#334155',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#475569',
            },
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              backgroundColor: '#3B82F6',
            }}
          >
            <PersonIcon />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Administrador
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              admin@migracion.gob.pa
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#334155' }} />

      {/* Menu Items */}
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  backgroundColor: isActive ? '#3B82F6' : 'transparent',
                  color: isActive ? 'white' : '#CBD5E1',
                  '&:hover': {
                    backgroundColor: isActive ? '#3B82F6' : '#334155',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};
