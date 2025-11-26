import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
} from '@mui/material';
import type { WorkflowPregunta } from '../../../types/workflow';

interface SeleccionFechaViewProps {
  pregunta: WorkflowPregunta;
  readonly?: boolean;
  onAnswerChange?: (fecha: string) => void;
}

export const SeleccionFechaView: React.FC<SeleccionFechaViewProps> = ({
  pregunta,
  readonly = false,
  onAnswerChange,
}) => {
  const [fecha, setFecha] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFecha(e.target.value);
    onAnswerChange?.(e.target.value);
  };

  return (
    <Box>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          fontWeight: 500, 
          mb: 1, 
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
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#6B7280', 
            display: 'block',
            mb: 1,
          }}
        >
          {pregunta.texto_ayuda}
        </Typography>
      )}

      <TextField
        type="date"
        fullWidth
        value={fecha}
        onChange={handleChange}
        disabled={readonly}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: readonly ? '#F9FAFB' : 'white',
          },
        }}
        InputLabelProps={{
          shrink: true,
        }}
      />
    </Box>
  );
};
