import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import {
  CloudDownload as DownloadIcon,
} from '@mui/icons-material';
import type { WorkflowPregunta } from '../../../types/workflow';

interface DescargaArchivoViewProps {
  pregunta: WorkflowPregunta;
  readonly?: boolean;
  onAnswerChange?: (descargado: boolean) => void;
}

export const DescargaArchivoView: React.FC<DescargaArchivoViewProps> = ({
  pregunta,
  onAnswerChange,
}) => {
  const handleDescargar = () => {
    // TODO: Implementar lógica de descarga de archivo
    console.log('Descargando archivo...');
    onAnswerChange?.(true);
  };

  return (
    <Box>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          fontWeight: 500, 
          mb: 2, 
          color: '#333',
        }}
      >
        {pregunta.pregunta}
        {pregunta.es_obligatoria && (
          <Typography component="span" sx={{ color: '#DC2626', ml: 0.5 }}>
            *
          </Typography>
        )}
      </Typography>

      {pregunta.texto_ayuda && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {pregunta.texto_ayuda}
        </Alert>
      )}

      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={handleDescargar}
        sx={{
          textTransform: 'none',
          backgroundColor: '#0e5fa6',
          '&:hover': { backgroundColor: '#0d5391' },
        }}
      >
        Descargar archivo
      </Button>
    </Box>
  );
};
