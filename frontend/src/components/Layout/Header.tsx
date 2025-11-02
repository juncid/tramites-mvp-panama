import {
  AppBar,
  Box,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

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

  const currentTab = tabs.findIndex(tab => tab.path === location.pathname);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    navigate(tabs[newValue].path);
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
          px: 3,
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Logo y título */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Placeholder para logos del gobierno */}
            <Box
              sx={{
                height: 32,
                width: 100,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontSize: '0.6rem', color: 'white' }}>LOGO</Typography>
            </Box>
          </Box>
          <Typography sx={{ color: 'white', fontSize: '0.875rem', fontWeight: 400 }}>
            Servicio Nacional de Migración
          </Typography>
        </Box>

        {/* Usuario y logout */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>
            Nombre Apellido (apellido)
          </Typography>
          <Typography sx={{ color: '#999', fontSize: '0.875rem' }}>
            |
          </Typography>
          <Typography 
            sx={{ 
              color: '#999', 
              fontSize: '0.875rem',
              cursor: 'pointer',
              '&:hover': { color: 'white' }
            }}
          >
            Cerrar sesión
          </Typography>
        </Box>
      </Box>

      {/* Barra azul con tabs de navegación */}
      <Box
        sx={{
          backgroundColor: '#2563EB',
          px: 3,
        }}
      >
        <Tabs
          value={currentTab >= 0 ? currentTab : 0}
          onChange={handleTabChange}
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              color: 'rgba(255,255,255,0.8)',
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 400,
              minHeight: 48,
              px: 3,
              '&.Mui-selected': {
                color: 'white',
                fontWeight: 500,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'white',
              height: 3,
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.path} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {/* Fecha (barra gris clara) */}
      <Box
        sx={{
          backgroundColor: '#F3F4F6',
          px: 3,
          py: 0.75,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
        }}
      >
        <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
          {today.toLocaleDateString('es-PA', { day: '2-digit', month: '2-digit', year: '2-digit' })}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
          {formattedDate}
        </Typography>
      </Box>
    </AppBar>
  );
};
