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
  Home as HomeIcon,
} from '@mui/icons-material';
import { LogoMigracion } from '../components/Layout/LogoMigracion';
import { Header } from '../components/Layout/Header';

interface TramiteCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

const TramiteCard: React.FC<TramiteCardProps> = ({ title, description, onClick }) => (
  <Card
    sx={{
      width: { xs: '100%', md: 378 },
      maxWidth: { xs: '328px', md: 378 },
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
    <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          px: 3,
          py: 1.5,
          textAlign: 'center',
          minHeight: 180,
        }}
      >
        <Typography
          sx={{
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 500,
            fontSize: '24px',
            lineHeight: 1.5,
            color: '#333333',
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: 1.5,
            color: '#333333',
            width: '330px',
            maxWidth: '100%',
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </CardActionArea>
  </Card>
);

/**
 * Página de inicio para ciudadanos
 * Muestra las opciones de trámites disponibles según el diseño de Figma
 */
export const InicioCiudadano: React.FC = () => {
  const navigate = useNavigate();

  const tramites = [
    {
      title: 'País Amigo',
      description: 'Acuerdo bilateral que permite a los ciudadanos de ciertas naciones solicitar una residencia temporal',
      route: null,
    },
    {
      title: 'Permiso de Protección de Seguridad Humanitaria',
      description: 'Permiso al que podrá optar toda persona extranjera que se encuentre irregular dentro del territorio nacional y haya permanecido por un periodo no menor de un año en el país',
      route: '/inicio-tramite',
    },
    {
      title: 'Regularización Migratoria General',
      description: 'Permiso al que podrá optar toda persona que ha permanecido de forma irregular dentro del territorio de la República de Panamá por 1 año o más y no a legalizado su estadía en el país.',
      route: null,
    },
    {
      title: 'Visa Doméstica',
      description: 'Permiso de residencia temporal al que puede optar toda persona extranjera contratada por un nacional o residente panameño para realizar labores exclusivas del hogar, bajo la responsabilidad económica y legal de dicho empleador.',
      route: null,
    },
  ];

  const handleTramiteClick = (route: string | null) => {
    if (route) {
      navigate(route);
    }
  };

  const handleVolverClick = () => {
    navigate('/');
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
          Trámites
        </Typography>

        {/* Breadcrumb navigation */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
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
          <Typography
            sx={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '24px',
              color: 'white',
            }}
          >
            Trámites
          </Typography>
        </Box>
      </Box>

      {/* Contenido principal con las tarjetas */}
      <Box
        sx={{
          flex: 1,
          py: { xs: 4, md: 5 },
          px: { xs: '16px', sm: 3, md: '7.69rem' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: { xs: 'center', md: 'flex-start' },
        }}
      >
        {/* Grid de tarjetas de trámites */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '30px',
            maxWidth: '1194px',
            width: '100%',
          }}
        >
          {/* En móvil todas apiladas y centradas, en desktop 3 + 1 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              flexWrap: 'wrap',
              gap: '30px',
              justifyContent: { xs: 'center', md: 'flex-start' },
              alignItems: { xs: 'center', md: 'flex-start' },
              width: '100%',
            }}
          >
            {tramites.map((tramite, index) => (
              <TramiteCard
                key={index}
                title={tramite.title}
                description={tramite.description}
                onClick={() => handleTramiteClick(tramite.route)}
              />
            ))}
          </Box>
        </Box>

        {/* Botón Volver - oculto en móvil, visible en desktop */}
        <Box sx={{ mt: 6, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-start' }}>
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

export default InicioCiudadano;
