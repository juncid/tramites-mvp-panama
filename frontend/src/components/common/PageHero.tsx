import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface PageHeroProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  /** Si es true, el hero se extiende fuera del padding del MainLayout */
  fullWidth?: boolean;
}

/**
 * Componente Hero reutilizable para páginas
 * Incluye título y breadcrumbs con diseño responsive
 * Basado en diseño de Figma Mobile
 */
export const PageHero = ({ title, breadcrumbs, fullWidth = false }: PageHeroProps) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        backgroundColor: '#0e5fa6',
        // Si fullWidth, compensar el padding del MainLayout
        mx: fullWidth ? { xs: -2, sm: -3, md: '-7.69rem' } : 0,
        px: fullWidth ? { xs: 2, sm: 4, md: '7.69rem' } : { xs: 2, sm: 3, md: 0 },
        pt: { xs: 3, sm: 3, md: 3 },
        pb: { xs: 7, sm: 4, md: 5 },
        minHeight: { xs: 'auto', sm: 'auto' },
        position: 'relative',
        mb: { xs: 0, sm: 0, md: 0 },
        mt: { xs: 0, sm: 0, md: 0 },
      }}
    >
      {/* Título */}
      <Typography
        variant="h3"
        sx={{
          color: 'white',
          fontWeight: 700,
          fontSize: { xs: '28px', sm: '2.5rem', md: '4rem' },
          lineHeight: { xs: 1.2, sm: 1.2, md: 1.1 },
          mb: { xs: 2, sm: 2.5, md: 3 },
          width: '100%',
          maxWidth: { xs: 'calc(100% - 32px)', sm: '100%', md: 896 },
          mx: { xs: 'auto', sm: 0 },
        }}
      >
        {title}
      </Typography>

      {/* Breadcrumbs - centrado con márgenes simétricos en mobile */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          mt: { xs: 0, sm: 0 },
          width: '100%',
          maxWidth: { xs: 'calc(100% - 32px)', sm: '100%' },
          mx: { xs: 'auto', sm: 0 },
        }}
      >
        <Breadcrumbs
          separator="/"
          sx={{
            color: 'white',
            fontSize: { xs: '14px', sm: '0.875rem', md: '1rem' },
            '& .MuiBreadcrumbs-separator': {
              color: 'white',
              mx: { xs: 1, sm: 1 },
            },
            '& .MuiBreadcrumbs-ol': {
              alignItems: 'center',
            },
          }}
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const isHome = index === 0;

            if (isLast) {
              return (
                <Typography
                  key={index}
                  sx={{
                    color: 'white',
                    fontSize: { xs: '14px', sm: '0.875rem', md: '1rem' },
                  }}
                >
                  {item.label}
                </Typography>
              );
            }

            return (
              <Link
                key={index}
                underline="hover"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: { xs: '14px', sm: '0.875rem', md: '1rem' },
                  gap: isHome ? '8px' : 0,
                }}
                onClick={() => item.path && navigate(item.path)}
              >
                {isHome && <HomeIcon sx={{ fontSize: { xs: 20, sm: 18, md: 20 } }} />}
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      </Box>
    </Box>
  );
};
