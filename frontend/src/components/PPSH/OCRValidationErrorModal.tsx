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
      PaperProps={{
        sx: { 
          width: { xs: '330px', sm: 440, md: 480 },
          maxWidth: { xs: '330px', sm: 440, md: 480 },
          borderRadius: '4px',
          p: 2,
          m: { xs: 2, sm: 3 },
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(33, 33, 33, 0.45)',
        },
      }}
    >
      <DialogContent sx={{ textAlign: 'center', py: 3, px: 2, position: 'relative' }}>
        {/* Título pequeño */}
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
            mt: 3,
            mb: 3,
            color: '#333',
            fontSize: '24px',
            fontWeight: 400,
            lineHeight: 1.5,
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          No pudimos validar el documento
        </Typography>

        {/* Ícono de advertencia triangular */}
        <Box sx={{ my: 3, display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              width: 0,
              height: 0,
              borderLeft: '50px solid transparent',
              borderRight: '50px solid transparent',
              borderBottom: '86px solid #f5a623',
              position: 'relative',
            }}
          >
            <Typography
              sx={{
                position: 'absolute',
                top: '35px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '40px',
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              !
            </Typography>
          </Box>
        </Box>

        {/* Mensaje explicativo */}
        <Typography 
          sx={{ 
            mb: 3, 
            px: 1,
            fontSize: '16px',
            lineHeight: 1.5,
            color: '#333',
            fontWeight: 300,
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          La información del archivo no concuerda con los datos ingresados. 
          Asegúrate de estar subiendo el documento correcto y que el texto sea legible.
        </Typography>

        {/* Botón Entendido (primario) */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleClose}
          sx={{
            bgcolor: '#0e5fa6',
            px: 4,
            py: 1,
            mb: 3,
            textTransform: 'none',
            fontSize: '16px',
            borderRadius: '4px',
            fontFamily: 'Roboto, sans-serif',
            '&:hover': { bgcolor: '#0d5391' },
          }}
        >
          Entendido
        </Button>

        {/* Checkbox para aceptar riesgo */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
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
              <Typography 
                sx={{ 
                  fontSize: '14px',
                  color: '#333',
                  fontWeight: 300,
                  fontFamily: 'Roboto, sans-serif',
                  textAlign: 'left',
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
          fullWidth
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
            fontFamily: 'Roboto, sans-serif',
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
