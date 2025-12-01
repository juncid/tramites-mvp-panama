import React, { useState, useEffect } from 'react';
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
  compact?: boolean;
  value?: string;
}

export const RespuestaTextoView: React.FC<RespuestaTextoViewProps> = ({
  pregunta,
  readonly = false,
  onAnswerChange,
  value,
}) => {
  const [valor, setValor] = useState(value || '');

  // Sincronizar con value externo
  useEffect(() => {
    if (value !== undefined) {
      setValor(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValor(e.target.value);
    onAnswerChange?.(e.target.value);
  };

  const isMultiline = pregunta.tipo_pregunta === 'RESPUESTA_LARGA';

  return (
    <Box sx={{ mb: 3, mt: isMultiline ? 5 : 0 }}>
      {/* Label según Figma: font-medium, 16px */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
        <Typography 
          sx={{ 
            fontWeight: 500,
            fontFamily: 'Roboto, sans-serif',
            fontSize: '16px',
            lineHeight: 1.5,
            color: '#333333',
          }}
        >
          {pregunta.pregunta}
          {pregunta.es_obligatoria && (
            <Box component="span" sx={{ color: '#DC2626', ml: 0.5 }}>*</Box>
          )}
        </Typography>
        {!pregunta.es_obligatoria && (
          <Typography
            sx={{
              fontWeight: 300,
              fontFamily: 'Roboto, sans-serif',
              fontSize: '14px',
              lineHeight: 1,
              color: '#333333',
              ml: 1,
            }}
          >
            (Opcional)
          </Typography>
        )}
      </Box>

      {/* Input según Figma: 520px width, 194px height para multilinea, border radius 4px */}
      <TextField
        multiline={isMultiline}
        minRows={isMultiline ? 6 : 1}
        value={valor}
        onChange={handleChange}
        placeholder={pregunta.texto_ayuda || ''}
        disabled={readonly}
        sx={{
          width: '520px',
          '& .MuiOutlinedInput-root': {
            minHeight: isMultiline ? '194px' : '56px',
            alignItems: isMultiline ? 'flex-start' : 'center',
            backgroundColor: readonly ? '#F9FAFB' : 'white',
            borderRadius: '4px',
            fontFamily: 'Roboto, sans-serif',
            fontSize: '16px',
            '& fieldset': {
              borderColor: '#333333',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: '#333333',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0E5FA6',
              borderWidth: '2px',
            },
          },
          '& .MuiOutlinedInput-input': {
            padding: isMultiline ? '12px 14px' : undefined,
          },
        }}
      />
    </Box>
  );
};
