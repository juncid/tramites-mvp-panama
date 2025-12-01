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
import { Warning as WarningIcon } from '@mui/icons-material';

interface OCRValidationErrorModalProps {
  open: boolean;
  onClose: () => void;
  onEnviarDeTodosModos: () => void;
}

/**
 * Modal que se muestra cuando la validación OCR detecta discrepancias
 * entre los datos ingresados por el usuario y los datos extraídos del documento.
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
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2, 
          p: 2,
          maxWidth: '480px',
        }
      }}
    >
      <DialogContent sx={{ textAlign: 'center', py: 3, px: 4 }}>
        {/* Título pequeño */}
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            mb: 2, 
            display: 'block',
            fontSize: '12px',
          }}
        >
          Revisión OCR
        </Typography>
        
        {/* Título principal */}
        <Typography 
          variant="h5" 
          fontWeight="bold" 
          sx={{ 
            mb: 3,
            color: '#333',
            fontSize: '24px',
          }}
        >
          No pudimos validar el documento
        </Typography>

        {/* Ícono de advertencia */}
        <Box sx={{ my: 3 }}>
          <WarningIcon 
            sx={{ 
              fontSize: 80, 
              color: '#f5a623',
            }} 
          />
        </Box>

        {/* Mensaje explicativo */}
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            mb: 4, 
            px: 2,
            fontSize: '14px',
            lineHeight: 1.6,
          }}
        >
          La información del archivo no concuerda con los datos ingresados. 
          Asegúrate de estar subiendo el documento correcto y que el texto sea legible.
        </Typography>

        {/* Botón Entendido (primario) */}
        <Button
          variant="contained"
          onClick={handleClose}
          sx={{
            bgcolor: '#0e5fa6',
            px: 4,
            py: 1,
            mb: 3,
            textTransform: 'none',
            fontSize: '16px',
            borderRadius: '4px',
            '&:hover': { bgcolor: '#0d5391' },
          }}
        >
          Entendido
        </Button>

        {/* Checkbox para aceptar riesgo */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={aceptaRiesgo}
                onChange={(e) => setAceptaRiesgo(e.target.checked)}
                size="small"
                sx={{
                  color: '#666',
                  '&.Mui-checked': {
                    color: '#0e5fa6',
                  },
                }}
              />
            }
            label={
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
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
          sx={{
            borderColor: '#0e5fa6',
            color: '#0e5fa6',
            px: 4,
            py: 1,
            textTransform: 'none',
            fontSize: '16px',
            borderRadius: '4px',
            '&:hover': {
              borderColor: '#0d5391',
              backgroundColor: 'rgba(14, 95, 166, 0.04)',
            },
            '&.Mui-disabled': {
              borderColor: '#ccc',
              color: '#ccc',
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
