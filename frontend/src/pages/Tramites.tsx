import { useState } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  IconButton,
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext,
  Remove as RemoveIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

export const Tramites = () => {
  const [activeTab, setActiveTab] = useState(1); // 1 = Flujo tab

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNext fontSize="small" />} 
        sx={{ mb: 3 }}
      >
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', color: '#6B7280' }}
          href="/"
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Inicio
        </Link>
        <Link
          underline="hover"
          sx={{ color: '#6B7280' }}
          href="/procesos"
        >
          Procesos
        </Link>
        <Typography sx={{ color: '#1F2937', fontWeight: 500 }}>
          Permiso de Protección de Seguridad Humanitaria
        </Typography>
      </Breadcrumbs>

      {/* Título principal */}
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 700, 
          mb: 3,
          color: '#1F2937',
        }}
      >
        Permiso de Protección de Seguridad Humanitaria
      </Typography>

      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ 
          borderBottom: 1, 
          borderColor: '#E5E7EB',
          mb: 3,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
          }
        }}
      >
        <Tab label="General" />
        <Tab label="Flujo" />
        <Tab label="Estado" />
        <Tab label="Historial" />
      </Tabs>

      {/* Contenido del tab Flujo */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          {/* Controles superiores */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                defaultValue="todos"
                sx={{ backgroundColor: 'white' }}
              >
                <MenuItem value="todos">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" />
                    Todos
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <IconButton size="small" sx={{ border: '1px solid #E5E7EB' }}>
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography sx={{ px: 2, fontSize: '0.875rem', color: '#6B7280' }}>
                100%
              </Typography>
              <IconButton size="small" sx={{ border: '1px solid #E5E7EB' }}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>

            <IconButton 
              size="small" 
              sx={{ 
                border: '1px solid #E5E7EB',
                ml: 'auto',
              }}
            >
              <SaveIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Canvas del diagrama de flujo */}
          <Box 
            sx={{ 
              border: '1px solid #E5E7EB',
              borderRadius: 1,
              p: 4,
              backgroundColor: '#FAFAFA',
              minHeight: 500,
              position: 'relative',
              overflow: 'auto',
            }}
          >
            {/* Diagrama de flujo horizontal */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 3,
              justifyContent: 'flex-start',
              width: 'max-content',
              mx: 'auto',
            }}>
              {/* Nodo Inicio */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  backgroundColor: '#22C55E',
                  borderRadius: '50%',
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #16A34A',
                }}>
                  <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>
                    Inicio
                  </Typography>
                </Box>
              </Box>

              {/* Flecha */}
              <Box sx={{ 
                width: 40,
                height: 2,
                backgroundColor: '#6B7280',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: -6,
                  top: -4,
                  width: 0,
                  height: 0,
                  borderTop: '5px solid transparent',
                  borderBottom: '5px solid transparent',
                  borderLeft: '6px solid #6B7280',
                }
              }} />

              {/* Nodo 1 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  backgroundColor: 'white',
                  border: '1px solid #D1D5DB',
                  borderRadius: 1,
                  p: 2,
                  width: 180,
                  minHeight: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <PersonIcon fontSize="small" sx={{ color: '#6B7280' }} />
                    <DescriptionIcon fontSize="small" sx={{ color: '#6B7280' }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.8rem', color: '#1F2937' }}>
                    Asesorar al ciudadano sobre el trámite ppsh
                  </Typography>
                </Box>
              </Box>

              {/* Flecha */}
              <Box sx={{ 
                width: 40,
                height: 2,
                backgroundColor: '#6B7280',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: -6,
                  top: -4,
                  width: 0,
                  height: 0,
                  borderTop: '5px solid transparent',
                  borderBottom: '5px solid transparent',
                  borderLeft: '6px solid #6B7280',
                }
              }} />

              {/* Nodo 2 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  backgroundColor: 'white',
                  border: '1px solid #D1D5DB',
                  borderRadius: 1,
                  p: 2,
                  width: 180,
                  minHeight: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <PersonIcon fontSize="small" sx={{ color: '#6B7280' }} />
                    <DescriptionIcon fontSize="small" sx={{ color: '#6B7280' }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.8rem', color: '#1F2937' }}>
                    Recolectar requisitos del trámite PPSH y crear RUEX (en caso que no lo tenga)
                  </Typography>
                </Box>
              </Box>

              {/* Flecha */}
              <Box sx={{ 
                width: 40,
                height: 2,
                backgroundColor: '#6B7280',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: -6,
                  top: -4,
                  width: 0,
                  height: 0,
                  borderTop: '5px solid transparent',
                  borderBottom: '5px solid transparent',
                  borderLeft: '6px solid #6B7280',
                }
              }} />

              {/* Nodo 3 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  backgroundColor: 'white',
                  border: '1px solid #D1D5DB',
                  borderRadius: 1,
                  p: 2,
                  width: 180,
                  minHeight: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <PersonIcon fontSize="small" sx={{ color: '#6B7280' }} />
                    <DescriptionIcon fontSize="small" sx={{ color: '#6B7280' }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.8rem', color: '#1F2937' }}>
                    Solicitar cita por medio de la página web de Migración
                  </Typography>
                </Box>
              </Box>

              {/* Flecha */}
              <Box sx={{ 
                width: 40,
                height: 2,
                backgroundColor: '#6B7280',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: -6,
                  top: -4,
                  width: 0,
                  height: 0,
                  borderTop: '5px solid transparent',
                  borderBottom: '5px solid transparent',
                  borderLeft: '6px solid #6B7280',
                }
              }} />

              {/* Nodo 4 - Resaltado (seleccionado) */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  backgroundColor: '#FEF3C7',
                  border: '2px solid #F59E0B',
                  borderRadius: 1,
                  p: 2,
                  width: 180,
                  minHeight: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <PersonIcon fontSize="small" sx={{ color: '#92400E' }} />
                    <DescriptionIcon fontSize="small" sx={{ color: '#92400E' }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.8rem', color: '#92400E', fontWeight: 600 }}>
                    ¿Mayor de 18 años?
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Placeholder para otros tabs */}
      {activeTab !== 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">
            Contenido de {activeTab === 0 ? 'General' : activeTab === 2 ? 'Estado' : 'Historial'}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};
