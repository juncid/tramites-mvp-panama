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
 * Basado en wireframe Figma: Wireframe 102
 */
export const OCRLoadingModal = ({ open, progress }: OCRLoadingModalProps) => {
  return (
    <Dialog
      open={open}
      PaperProps={{
        sx: {
          width: { xs: '90%', sm: 440, md: 480 },
          maxWidth: { xs: '340px', sm: 440, md: 480 },
          height: { xs: 'auto', sm: 440, md: 480 },
          borderRadius: 1,
          p: { xs: 1.5, sm: 2 },
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
          px: { xs: 2, sm: 3 },
          py: { xs: 3, sm: 0 },
        }}
      >
        {/* Label superior */}
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            top: { xs: 12, sm: 16 },
            left: { xs: 12, sm: 16 },
            color: '#ccc',
            fontSize: { xs: '12px', sm: '0.875rem' },
            fontWeight: 300,
          }}
        >
          Revisión OCR
        </Typography>

        {/* Título principal */}
        <Typography
          variant="h6"
          sx={{
            fontSize: { xs: '16px', sm: '1.375rem', md: '1.5rem' },
            fontWeight: 400,
            color: '#333',
            mb: { xs: 3, sm: 4 },
            textAlign: 'center',
            lineHeight: 1.3,
          }}
        >
          Estamos revisando su documento
        </Typography>

        {/* Spinner o Progress Bar */}
        {progress ? (
          <Box sx={{ width: '100%', mb: { xs: 3, sm: 4 }, px: 2 }}>
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
              variant="body2"
              sx={{
                textAlign: 'center',
                mt: 2,
                color: '#666',
                fontSize: '0.875rem',
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
              mb: { xs: 3, sm: 4 },
            }}
          />
        )}

        {/* Mensaje inferior */}
        <Typography
          variant="body2"
          sx={{
            fontSize: { xs: '14px', sm: '0.95rem', md: '1rem' },
            fontWeight: 300,
            color: '#333',
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          Este proceso puede tardar unos minutos
        </Typography>
      </Box>
    </Dialog>
  );
};
