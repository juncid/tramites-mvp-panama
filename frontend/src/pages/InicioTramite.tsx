import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Link,
} from '@mui/material';
import {
  PlayCircleOutline as PlayCircleOutlineIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { LogoMigracion } from '../components/Layout/LogoMigracion';
import { Header } from '../components/Layout/Header';

/**
 * Página de inicio de trámite PPSH
 * Permite al usuario elegir entre iniciar un nuevo proceso o continuar uno existente
 * Diseño basado en Figma node 2439-1293
 */
export const InicioTramite: React.FC = () => {
  const navigate = useNavigate();

  const handleIniciarProceso = () => {
    navigate('/solicitudes/nueva');
  };

  const handleContinuarProceso = () => {
    navigate('/acceso-publico');
  };

  const handleVolverClick = () => {
    navigate('/inicio');
  };

  return (
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

      {/* Hero section azul */}
      <Box
        sx={{
          bgcolor: '#0e5fa6',
          pt: { xs: 3, md: 5 },
          pb: { xs: 3, md: 5 },
          px: { xs: 2, sm: 3, md: '7.69rem' },
        }}
      >
        {/* Título principal */}
        <Typography
          sx={{
            fontFamily: 'Roboto Flex, Roboto, sans-serif',
            fontWeight: 700,
            fontSize: { xs: '40px', md: '64px' },
            lineHeight: 1.1,
            color: 'white',
            mb: { xs: 2, md: 4 },
            maxWidth: '896px',
          }}
        >
          Permiso de Protección de Seguridad Humanitaria
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
          <Typography
            sx={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '24px',
              color: 'white',
            }}
          >
            /
          </Typography>
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
          <Typography
            sx={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '24px',
              color: 'white',
              display: { xs: 'none', md: 'block' },
            }}
          >
            /
          </Typography>
          <Typography
            sx={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '24px',
              color: 'white',
              display: { xs: 'none', md: 'block' },
            }}
          >
            Permiso de Protección de Seguridad Humanitaria
          </Typography>
        </Box>
      </Box>

      {/* Contenido principal con las tarjetas */}
      <Box
        sx={{
          flex: 1,
          py: { xs: 4, md: 7 },
          px: { xs: '16px', sm: 3, md: '7.69rem' },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Cards de opciones */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: '30px',
            justifyContent: { xs: 'flex-start', md: 'center' },
            alignItems: { xs: 'center', md: 'stretch' },
            mb: 6,
          }}
        >
          {/* Card: Iniciar Proceso */}
          <Card 
            sx={{ 
              width: '100%',
              maxWidth: { xs: '100%', sm: 378 },
              minHeight: { xs: 'auto', md: 297 },
              borderRadius: '8px',
              backgroundColor: '#f1f3f4',
              boxShadow: '0px 3px 3px 0px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0px 6px 12px 0px rgba(0,0,0,0.25), 0px 6px 8px 0px rgba(0,0,0,0.18), 0px 2px 16px 0px rgba(0,0,0,0.15)',
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
              }}
            >
              <CardContent 
                sx={{ 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: { xs: 4, md: 6 },
                  px: { xs: 2, sm: 3 },
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <PlayCircleOutlineIcon 
                  sx={{ 
                    fontSize: { xs: 48, md: 64 }, 
                    color: '#0e5fa6',
                    mb: { xs: 2, md: 3 },
                  }} 
                />
                <Typography 
                  sx={{ 
                    fontFamily: 'Roboto, sans-serif',
                    fontWeight: 500,
                    fontSize: { xs: '28px', sm: '32px', md: '36px' },
                    lineHeight: 1.3,
                    color: '#333333',
                    mb: 1,
                  }}
                >
                  Iniciar Proceso
                </Typography>
                <Typography 
                  sx={{ 
                    fontFamily: 'Roboto, sans-serif',
                    fontWeight: 400,
                    fontSize: { xs: '14px', sm: '16px' },
                    lineHeight: 1.5,
                    color: '#333333',
                    width: '100%',
                    maxWidth: 330,
                    px: 1,
                  }}
                >
                  Comience una nueva solicitud de Permiso de Protección de Seguridad Humanitaria
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          {/* Card: Continuar Proceso */}
          <Card 
            sx={{ 
              width: '100%',
              maxWidth: { xs: '100%', sm: 378 },
              minHeight: { xs: 'auto', md: 297 },
              borderRadius: '8px',
              backgroundColor: '#f1f3f4',
              boxShadow: '0px 3px 3px 0px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0px 6px 12px 0px rgba(0,0,0,0.25), 0px 6px 8px 0px rgba(0,0,0,0.18), 0px 2px 16px 0px rgba(0,0,0,0.15)',
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
              }}
            >
              <CardContent 
                sx={{ 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: { xs: 4, md: 6 },
                  px: { xs: 2, sm: 3 },
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <RefreshIcon 
                  sx={{ 
                    fontSize: { xs: 48, md: 64 }, 
                    color: '#4caf50',
                    mb: { xs: 2, md: 3 },
                  }} 
                />
                <Typography 
                  sx={{ 
                    fontFamily: 'Roboto, sans-serif',
                    fontWeight: 500,
                    fontSize: { xs: '28px', sm: '32px', md: '36px' },
                    lineHeight: 1.3,
                    color: '#333333',
                    mb: 1,
                  }}
                >
                  Continuar Proceso
                </Typography>
                <Typography 
                  sx={{ 
                    fontFamily: 'Roboto, sans-serif',
                    fontWeight: 400,
                    fontSize: { xs: '14px', sm: '16px' },
                    lineHeight: 1.5,
                    color: '#333333',
                    width: '100%',
                    maxWidth: 330,
                    px: 1,
                  }}
                >
                  Retome un proceso ya iniciado ingresando su número de solicitud
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>

        {/* Botón Volver */}
        <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
          <Button
            variant="outlined"
            onClick={handleVolverClick}
            sx={{
              width: { xs: '100%', md: 'auto' },
              maxWidth: { xs: '328px', md: 'none' },
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
              minWidth: '124px',
              '&:hover': {
                borderColor: '#0e5fa6',
                backgroundColor: 'rgba(14, 95, 166, 0.04)',
              },
            }}
          >
            Volver
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default InicioTramite;
