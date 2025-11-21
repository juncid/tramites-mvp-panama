import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import {
  Print as PrintIcon,
} from '@mui/icons-material';
import type { WorkflowPregunta } from '../../../types/workflow';

interface ImpresionViewProps {
  pregunta: WorkflowPregunta;
  readonly?: boolean;
  onAnswerChange?: (impreso: boolean) => void;
}

export const ImpresionView: React.FC<ImpresionViewProps> = ({
  pregunta,
  onAnswerChange,
}) => {
  const handleImprimir = () => {
    window.print();
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
        startIcon={<PrintIcon />}
        onClick={handleImprimir}
        sx={{
          textTransform: 'none',
          backgroundColor: '#0e5fa6',
          '&:hover': { backgroundColor: '#0d5391' },
        }}
      >
        Imprimir documento
      </Button>
    </Box>
  );
};
