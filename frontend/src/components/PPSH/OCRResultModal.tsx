import {
  Dialog,
  Box,
  Typography,
  Button,
} from '@mui/material';
import {
  CheckCircleOutline as CheckIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';

export interface OCRResultModalProps {
  open: boolean;
  tipo: 'success' | 'error';
  mensaje?: string;
  onClose: () => void;
}

/**
 * Modal de resultado OCR (éxito o error)
 * Basado en wireframes Figma: Wireframe 103 (éxito), Wireframe 104 (error)
 */
export const OCRResultModal = ({
  open,
  tipo,
  mensaje,
  onClose,
}: OCRResultModalProps) => {
  const isSuccess = tipo === 'success';

  const defaultMensaje = isSuccess
    ? 'Puede cerrar este mensaje de manera segura'
    : 'La imagen parece estar borrosa o tener poca luz. Asegúrese de que el texto se vea nítido y vuelva a subir el archivo.';

  const titulo = isSuccess
    ? 'Documento procesado con éxito'
    : 'No pudimos leer la información';

  const buttonText = isSuccess ? 'Siguiente' : 'Entendido';

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            px: { xs: 1, sm: 0 },
            lineHeight: 1.3,
          }}
        >
          {titulo}
        </Typography>

        {/* Icono (check verde o warning rojo) */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          {isSuccess ? (
            <CheckIcon
              sx={{
                fontSize: { xs: 100, sm: 110, md: 120 },
                color: '#2e7d32', // verde
              }}
            />
          ) : (
            <ErrorIcon
              sx={{
                fontSize: { xs: 100, sm: 110, md: 120 },
                color: '#d32f2f', // rojo
              }}
            />
          )}
        </Box>

        {/* Mensaje */}
        <Typography
          variant="body2"
          sx={{
            fontSize: { xs: '14px', sm: '0.95rem', md: '1rem' },
            fontWeight: 300,
            color: '#333',
            textAlign: 'center',
            mb: { xs: 3, sm: 4 },
            px: { xs: 1, sm: 0 },
            lineHeight: 1.4,
          }}
        >
          {mensaje || defaultMensaje}
        </Typography>

        {/* Botón */}
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            backgroundColor: '#0e5fa6',
            color: 'white',
            textTransform: 'none',
            px: { xs: 2.5, sm: 3 },
            py: { xs: 0.875, sm: 1 },
            fontSize: { xs: '14px', sm: '0.95rem', md: '1rem' },
            width: { xs: '100%', sm: 'auto' },
            '&:hover': {
              backgroundColor: '#0d5494',
            },
          }}
        >
          {buttonText}
        </Button>
      </Box>
    </Dialog>
  );
};
