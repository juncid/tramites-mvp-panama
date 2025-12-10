import React from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
} from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

interface OCRSuccessModalProps {
  open: boolean;
  onClose: () => void;
  onNext?: () => void;
}

/**
 * Modal de éxito de validación OCR
 * Se muestra cuando el OCR encuentra entre 4 y 6 coincidencias.
 * Basado en wireframe Figma: node 453-651
 * 
 * @author Sistema de Trámites MVP Panamá
 */
export const OCRSuccessModal: React.FC<OCRSuccessModalProps> = ({
  open,
  onClose,
  onNext,
}) => {
  const handleNext = () => {
    if (onNext) {
      onNext();
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: { 
          width: '100%',
          maxWidth: { xs: '100%', sm: 440, md: 480 },
          borderRadius: 1,
          p: { xs: 1.5, sm: 2 },
          m: { xs: 1, sm: 2, md: 3 },
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(33, 33, 33, 0.45)',
        },
      }}
    >
      <DialogContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 2 }, position: 'relative' }}>
        {/* Título pequeño */}
        <Typography 
          variant="caption"
          sx={{ 
            position: 'absolute',
            top: { xs: 8, sm: 16 },
            left: { xs: 8, sm: 16 },
            color: 'text.secondary',
            fontWeight: 200,
          }}
        >
          Revisión del Sistema
        </Typography>
        
        {/* Título principal */}
        <Typography 
          variant="h5"
          component="h2"
          sx={{ 
            mt: { xs: 2, sm: 3 },
            mb: { xs: 2, sm: 3 },
            color: 'text.primary',
            fontWeight: 400,
            lineHeight: 1.5,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
          }}
        >
          Documento procesado con éxito
        </Typography>

        {/* Ícono de check verde */}
        <Box sx={{ my: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'center' }}>
          <CheckCircleOutlineRoundedIcon
            sx={{
              fontSize: { xs: 80, sm: 100, md: 120 },
              color: 'success.main',
            }}
          />
        </Box>

        {/* Mensaje explicativo */}
        <Typography 
          variant="body1"
          sx={{ 
            mb: { xs: 2, sm: 3 }, 
            px: { xs: 0, sm: 1 },
            lineHeight: 1.5,
            color: 'text.primary',
            fontWeight: 300,
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          Puede cerrar este mensaje de manera segura
        </Typography>

        {/* Botón Siguiente */}
        <Button
          variant="contained"
          onClick={handleNext}
          fullWidth
          sx={{
            bgcolor: 'primary.main',
            maxWidth: { xs: '100%', sm: 200 },
            px: { xs: 2, sm: 4 },
            py: 1,
            textTransform: 'none',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            borderRadius: 1,
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          Siguiente
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default OCRSuccessModal;
