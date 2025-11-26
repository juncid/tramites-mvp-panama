import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

/**
 * Página de inicio de trámite
 * Permite al usuario elegir entre iniciar un nuevo proceso o continuar uno existente
 */
export const InicioTramite: React.FC = () => {
  const navigate = useNavigate();

  const handleIniciarProceso = () => {
    navigate('/solicitudes/nueva');
  };

  const handleContinuarProceso = () => {
    navigate('/acceso-publico');
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
      {/* Header azul */}
      <Box
        sx={{
          bgcolor: '#0e5fa6',
          color: 'white',
          py: 6,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              fontFamily: 'Roboto, sans-serif',
              fontSize: { xs: '24px', md: '32px' },
            }}
          >
            Permiso de Protección de Seguridad Humanitaria
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              opacity: 0.9,
              fontFamily: 'Roboto, sans-serif',
              fontSize: '16px',
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Sistema de Trámites Migratorios de Panamá
          </Typography>
        </Container>
      </Box>

      {/* Contenido principal */}
      <Container 
        maxWidth="md" 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          py: 6,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              color: '#333333',
              fontFamily: 'Roboto, sans-serif',
              fontSize: '24px',
              mb: 2,
            }}
          >
            ¿Qué desea realizar?
          </Typography>
          <Typography 
            sx={{ 
              color: '#666666',
              fontFamily: 'Roboto, sans-serif',
              fontSize: '16px',
            }}
          >
            Seleccione una de las siguientes opciones para continuar
          </Typography>
        </Box>

        {/* Cards de opciones */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            justifyContent: 'center',
            alignItems: 'stretch',
          }}
        >
          {/* Card: Iniciar Proceso */}
          <Card 
            elevation={2}
            sx={{ 
              flex: 1,
              maxWidth: { xs: '100%', md: 360 },
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(14, 95, 166, 0.15)',
                borderColor: '#0e5fa6',
              },
            }}
          >
            <CardActionArea 
              onClick={handleIniciarProceso}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'rgba(14, 95, 166, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <PlayArrowIcon 
                    sx={{ 
                      fontSize: 40, 
                      color: '#0e5fa6',
                    }} 
                  />
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#333333',
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '20px',
                    mb: 1.5,
                  }}
                >
                  Iniciar Proceso
                </Typography>
                <Typography 
                  sx={{ 
                    color: '#666666',
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '14px',
                    lineHeight: 1.6,
                  }}
                >
                  Comience una nueva solicitud de Permiso de Protección de Seguridad Humanitaria
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          {/* Card: Continuar Proceso */}
          <Card 
            elevation={2}
            sx={{ 
              flex: 1,
              maxWidth: { xs: '100%', md: 360 },
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(14, 95, 166, 0.15)',
                borderColor: '#0e5fa6',
              },
            }}
          >
            <CardActionArea 
              onClick={handleContinuarProceso}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <RefreshIcon 
                    sx={{ 
                      fontSize: 40, 
                      color: '#4caf50',
                    }} 
                  />
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#333333',
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '20px',
                    mb: 1.5,
                  }}
                >
                  Continuar Proceso
                </Typography>
                <Typography 
                  sx={{ 
                    color: '#666666',
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '14px',
                    lineHeight: 1.6,
                  }}
                >
                  Retome un proceso ya iniciado ingresando su número de solicitud
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>

        {/* Información adicional */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography 
            sx={{ 
              color: '#999999',
              fontFamily: 'Roboto, sans-serif',
              fontSize: '14px',
            }}
          >
            Si tiene dudas sobre el proceso, consulte la{' '}
            <Box 
              component="span" 
              sx={{ 
                color: '#0e5fa6', 
                cursor: 'pointer',
                textDecoration: 'underline',
                '&:hover': {
                  textDecoration: 'none',
                },
              }}
            >
              guía de requisitos
            </Box>
          </Typography>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: '#f0f0f0',
          py: 3,
          textAlign: 'center',
          borderTop: '1px solid #e0e0e0',
        }}
      >
        <Container maxWidth="md">
          <Typography 
            sx={{ 
              color: '#666666',
              fontFamily: 'Roboto, sans-serif',
              fontSize: '12px',
            }}
          >
            © 2025 Servicio Nacional de Migración de Panamá. Todos los derechos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default InicioTramite;
