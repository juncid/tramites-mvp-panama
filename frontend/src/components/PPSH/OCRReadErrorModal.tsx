import React from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
} from '@mui/material';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

interface OCRReadErrorModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal de error de lectura OCR
 * Se muestra cuando el OCR no puede leer ningún valor del documento.
 * Basado en wireframe Figma: node 453-890
 * 
 * @author Sistema de Trámites MVP Panamá
 */
export const OCRReadErrorModal: React.FC<OCRReadErrorModalProps> = ({
  open,
  onClose,
}) => {
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
          No pudimos leer la información
        </Typography>

        {/* Ícono de error rojo */}
        <Box sx={{ my: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'center' }}>
          <ErrorOutlineRoundedIcon
            sx={{
              fontSize: { xs: 80, sm: 100, md: 120 },
              color: 'error.main',
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
          La imagen parece estar borrosa o tener poca luz. 
          Asegúrese de que el texto se vea nítido y vuelva a subir el archivo.
        </Typography>

        {/* Botón Entendido */}
        <Button
          variant="contained"
          onClick={onClose}
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
          Entendido
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default OCRReadErrorModal;
