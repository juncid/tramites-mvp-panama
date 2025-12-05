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
 * Basado en wireframes Figma: Mobile - 13 (éxito node 2465:2048), Mobile - 14 (error node 2465:2285)
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
            mb: 3,
            mt: 3,
            textAlign: 'center',
            lineHeight: 1.5,
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          {titulo}
        </Typography>

        {/* Icono (check verde o warning rojo) */}
        <Box 
          sx={{ 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isSuccess ? (
            <CheckIcon
              sx={{
                fontSize: 100,
                color: '#2e7d32', // verde
              }}
            />
          ) : (
            <ErrorIcon
              sx={{
                fontSize: 100,
                color: '#d32f2f', // rojo
              }}
            />
          )}
        </Box>

        {/* Mensaje */}
        <Typography
          sx={{
            fontSize: '16px',
            fontWeight: 300,
            color: '#333',
            textAlign: 'center',
            mb: 3,
            lineHeight: 1.5,
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          {mensaje || defaultMensaje}
        </Typography>

        {/* Botón */}
        <Button
          variant="contained"
          fullWidth
          onClick={onClose}
          sx={{
            backgroundColor: '#0e5fa6',
            color: 'white',
            textTransform: 'none',
            px: 4,
            py: 1,
            fontSize: '16px',
            borderRadius: '4px',
            fontFamily: 'Roboto, sans-serif',
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
