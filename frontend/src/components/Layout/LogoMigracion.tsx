import { Box } from '@mui/material';

/**
 * Logo del Servicio Nacional de Migración de Panamá
 * "Gobierno Nacional - Con Paso Firme" | "Migración Panamá"
 * Basado en el diseño oficial del gobierno
 */
export const LogoMigracion = () => {
  return (
    <Box
      component="img"
      src="/assets/logos/logo-migracion-panama.svg"
      alt="Gobierno Nacional - Con Paso Firme | Migración Panamá"
      sx={{
        height: 30,
        width: 'auto',
        objectFit: 'contain',
      }}
    />
  );
};
