import { Box } from '@mui/material';

/**
 * Logo del Servicio Nacional de Migración de Panamá
 * "Gobierno Nacional - Con Paso Firme" | "Migración Panamá"
 * Basado en el diseño oficial del gobierno
 * Responsive: más pequeño en mobile (max 165px width)
 */
export const LogoMigracion = () => {
  return (
    <Box
      component="img"
      src="/assets/logos/logo-migracion-panama.svg"
      alt="Gobierno Nacional - Con Paso Firme | Migración Panamá"
      sx={{
        height: { xs: 30, sm: 30 },
        width: { xs: 'auto', sm: 'auto' },
        maxWidth: { xs: 165, sm: 'none' },
        objectFit: 'contain',
      }}
    />
  );
};
