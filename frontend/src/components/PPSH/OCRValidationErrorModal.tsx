import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

interface OCRValidationErrorModalProps {
  open: boolean;
  onClose: () => void;
  onEnviarDeTodosModos: () => void;
}

/**
 * Modal que se muestra cuando la validación OCR detecta discrepancias
 * entre los datos ingresados por el usuario y los datos extraídos del documento.
 * Basado en wireframe Figma: Mobile - 15 (node 2465:2522)
 * 
 * Permite al usuario:
 * - Cerrar el modal y subir otro documento
 * - Enviar de todos modos asumiendo el riesgo de rechazo
 */
export const OCRValidationErrorModal: React.FC<OCRValidationErrorModalProps> = ({
  open,
  onClose,
  onEnviarDeTodosModos,
}) => {
  const [aceptaRiesgo, setAceptaRiesgo] = useState(false);

  const handleEnviar = () => {
    if (aceptaRiesgo) {
      onEnviarDeTodosModos();
      setAceptaRiesgo(false); // Reset para próximo uso
    }
  };

  const handleClose = () => {
    setAceptaRiesgo(false); // Reset al cerrar
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        </Typography>        {/* Título principal */}
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
          No pudimos validar el documento
        </Typography>

        {/* Ícono de advertencia triangular */}
        <Box sx={{ my: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'center' }}>
          <WarningAmberRoundedIcon
            sx={{
              fontSize: { xs: 80, sm: 100, md: 120 },
              color: 'warning.main',
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
          La información del archivo no concuerda con los datos ingresados. 
          Asegúrate de estar subiendo el documento correcto y que el texto sea legible.
        </Typography>

        {/* Botón Entendido (primario) */}
        <Button
          variant="contained"
          onClick={handleClose}
          fullWidth
          sx={{
            bgcolor: 'primary.main',
            maxWidth: { xs: '100%', sm: 200 },
            px: { xs: 2, sm: 4 },
            py: 1,
            mb: { xs: 2, sm: 3 },
            textTransform: 'none',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            borderRadius: 1,
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          Entendido
        </Button>

        {/* Checkbox para aceptar riesgo */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: { xs: 1.5, sm: 2 } }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={aceptaRiesgo}
                onChange={(e) => setAceptaRiesgo(e.target.checked)}
                size="small"
                sx={{
                  color: 'text.secondary',
                  '&.Mui-checked': {
                    color: 'primary.main',
                  },
                }}
              />
            }
            label={
              <Typography 
                variant="body2"
                sx={{ 
                  color: 'text.primary',
                  fontWeight: 300,
                  textAlign: 'left',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                Enviar de todos modos, asumiendo el riesgo de rechazo.
              </Typography>
            }
          />
        </Box>

        {/* Botón Enviar (secundario) */}
        <Button
          variant="outlined"
          onClick={handleEnviar}
          disabled={!aceptaRiesgo}
          fullWidth
          sx={{
            borderColor: 'primary.main',
            color: 'primary.main',
            maxWidth: { xs: '100%', sm: 200 },
            px: { xs: 2, sm: 4 },
            py: 1,
            textTransform: 'none',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            borderRadius: 1,
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'action.hover',
            },
            '&.Mui-disabled': {
              borderColor: 'action.disabled',
              color: 'action.disabled',
            },
          }}
        >
          Enviar
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default OCRValidationErrorModal;
