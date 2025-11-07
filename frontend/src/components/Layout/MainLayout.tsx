import { Box } from '@mui/material';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: '#F9FAFB',
          px: '7.69rem',
          py: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
