import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
} from '@mui/material';
import type { WorkflowPregunta } from '../../../types/workflow';

interface RespuestaTextoViewProps {
  pregunta: WorkflowPregunta;
  readonly?: boolean;
  onAnswerChange?: (valor: string) => void;
}

export const RespuestaTextoView: React.FC<RespuestaTextoViewProps> = ({
  pregunta,
  readonly = false,
  onAnswerChange,
}) => {
  const [valor, setValor] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValor(e.target.value);
    onAnswerChange?.(e.target.value);
  };

  const isMultiline = pregunta.tipo_pregunta === 'RESPUESTA_LARGA';

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
        fullWidth
        multiline={isMultiline}
        rows={isMultiline ? 4 : 1}
        value={valor}
        onChange={handleChange}
        placeholder={pregunta.texto_ayuda || 'Escribe tu respuesta aquí'}
        disabled={readonly}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: readonly ? '#F9FAFB' : 'white',
          },
        }}
      />
    </Box>
  );
};
