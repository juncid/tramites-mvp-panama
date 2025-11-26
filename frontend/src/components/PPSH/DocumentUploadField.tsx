import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import {
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

export interface DocumentUploadFieldProps {
  titulo: string;
  indicaciones?: string;
  archivo?: File | null;
  nombreArchivo?: string;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

/**
 * Componente reutilizable para carga de documentos
 * Basado en wireframes Figma: Wireframe 101, 104, 105
 */
export const DocumentUploadField = ({
  titulo,
  indicaciones,
  archivo,
  nombreArchivo,
  onFileSelect,
  disabled = false,
}: DocumentUploadFieldProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>(nombreArchivo || '');

  // Sincronizar estado local cuando cambian las props
  useEffect(() => {
    if (archivo) {
      setFileName(archivo.name);
    } else if (nombreArchivo) {
      setFileName(nombreArchivo);
    } else {
      setFileName('');
    }
  }, [archivo, nombreArchivo]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = () => {
    setFileName('');
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayName = fileName || (archivo ? archivo.name : '');

  return (
    <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
      {/* Título del documento */}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 500,
          mb: { xs: 0.75, sm: 1 },
          color: '#333',
          fontSize: { xs: '14px', sm: '0.95rem', md: '1rem' },
        }}
      >
        {titulo}
      </Typography>

      {/* Campo de texto con nombre del archivo */}
      <TextField
        fullWidth
        value={displayName}
        placeholder="Ningún archivo seleccionado"
        disabled
        sx={{
          mb: 1,
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'white',
            fontSize: { xs: '14px', sm: '0.95rem', md: '1rem' },
          },
          '& .MuiOutlinedInput-input': {
            py: { xs: 1, sm: 1.5 },
          },
        }}
        InputProps={{
          endAdornment: displayName && (
            <IconButton
              size="small"
              onClick={handleDelete}
              disabled={disabled}
              sx={{ mr: -1 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          ),
        }}
      />

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {/* Botón de cargar archivo */}
      <Button
        variant="contained"
        startIcon={<AttachFileIcon sx={{ fontSize: { xs: 16, sm: 20, md: 22 } }} />}
        onClick={handleButtonClick}
        disabled={disabled}
        sx={{
          backgroundColor: '#0e5fa6',
          color: 'white',
          textTransform: 'none',
          height: { xs: 36, sm: 38, md: 40 },
          px: { xs: 1.5, sm: 2 },
          fontSize: { xs: '14px', sm: '0.95rem', md: '1rem' },
          mb: indicaciones ? 0.5 : 0,
          '&:hover': {
            backgroundColor: '#0d5494',
          },
        }}
      >
        Cargar archivo
      </Button>

      {/* Indicaciones extra (texto gris claro) */}
      {indicaciones && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            fontSize: { xs: '12px', sm: '0.8rem', md: '0.875rem' },
            color: '#666',
            lineHeight: 1.4,
          }}
        >
          {indicaciones}
        </Typography>
      )}
    </Box>
  );
};
