import { Box } from '@mui/material';
import { Header } from './Header';

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout para páginas públicas (ciudadano)
 * Sin padding horizontal para que el hero ocupe todo el ancho
 */
export const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: '#FFFFFF',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
