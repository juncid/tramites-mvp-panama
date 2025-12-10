import {
  Dialog,
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
} from '@mui/material';

export interface OCRLoadingModalProps {
  open: boolean;
  progress?: {
    porcentaje: number;
    status: string;
  };
}

/**
 * Modal de loading para procesamiento OCR
 * Basado en wireframe Figma: Mobile - 12 (node 2465:1813)
 */
export const OCRLoadingModal = ({ open, progress }: OCRLoadingModalProps) => {
  return (
    <Dialog
      open={open}
      PaperProps={{
        sx: {
          width: { xs: '330px', sm: 440, md: 480 },
          maxWidth: { xs: '330px', sm: 440, md: 480 },
          minHeight: { xs: '352px', sm: 440, md: 480 },
          borderRadius: '4px',
          p: 2,
          m: { xs: 2, sm: 3 },
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(33, 33, 33, 0.45)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          px: 2,
          py: 3,
          position: 'relative',
        }}
      >
        {/* Label superior */}
        <Typography
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            color: '#ccc',
            fontSize: '14px',
            fontWeight: 200,
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          Revisión OCR
        </Typography>

        {/* Título principal */}
        <Typography
          sx={{
            fontSize: '24px',
            fontWeight: 400,
            color: '#333',
            mb: 4,
            mt: 3,
            textAlign: 'center',
            lineHeight: 1.5,
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          Estamos revisando su documento
        </Typography>

        {/* Spinner o Progress Bar */}
        {progress ? (
          <Box sx={{ width: '100%', mb: 4, px: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress.porcentaje} 
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#0e5fa6',
                  borderRadius: 5,
                },
              }}
            />
            <Typography
              sx={{
                textAlign: 'center',
                mt: 2,
                color: '#666',
                fontSize: '14px',
                fontFamily: 'Roboto, sans-serif',
              }}
            >
              {progress.status} ({progress.porcentaje}%)
            </Typography>
          </Box>
        ) : (
          <CircularProgress
            size={120}
            thickness={3}
            sx={{
              color: '#0e5fa6',
              mb: 4,
            }}
          />
        )}

        {/* Mensaje inferior */}
        <Typography
          sx={{
            fontSize: '16px',
            fontWeight: 300,
            color: '#333',
            textAlign: 'center',
            lineHeight: 1.5,
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          Este proceso puede tardar unos minutos
        </Typography>
      </Box>
    </Dialog>
  );
};
