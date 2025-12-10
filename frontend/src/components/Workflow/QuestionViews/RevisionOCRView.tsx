import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import {
  DocumentScanner as ScannerIcon,
} from '@mui/icons-material';
import type { WorkflowPregunta } from '../../../types/workflow';

interface RevisionOCRViewProps {
  pregunta: WorkflowPregunta;
  readonly?: boolean;
  onAnswerChange?: (resultado: any) => void;
  instanciaId?: number;
}

export const RevisionOCRView: React.FC<RevisionOCRViewProps> = ({
  pregunta,
  readonly = false,
  onAnswerChange,
  instanciaId,
}) => {
  const handleIniciarOCR = () => {
    // TODO: Implementar lógica de inicio de OCR
    onAnswerChange?.({ iniciado: true, timestamp: new Date().toISOString() });
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

      {!readonly && (
        <Button
          variant="contained"
          startIcon={<ScannerIcon />}
          onClick={handleIniciarOCR}
          sx={{
            textTransform: 'none',
            backgroundColor: '#0e5fa6',
            color: 'white',
            height: 52,
            px: 2,
            '&:hover': { backgroundColor: '#0d5391' },
          }}
        >
          Iniciar revisión OCR
        </Button>
      )}
    </Box>
  );
};
