import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
} from '@mui/material';
import type { WorkflowPregunta } from '../../../types/workflow';

interface OpcionesViewProps {
  pregunta: WorkflowPregunta;
  readonly?: boolean;
  onAnswerChange?: (valor: string | string[]) => void;
}

export const OpcionesView: React.FC<OpcionesViewProps> = ({
  pregunta,
  readonly = false,
  onAnswerChange,
}) => {
  const [valorSimple, setValorSimple] = useState('');
  const [valoresMultiples, setValoresMultiples] = useState<string[]>([]);

  const opciones = pregunta.lista_elementos || [];
  const permiteMultiple = pregunta.permite_multiple || false;

  const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValorSimple(e.target.value);
    onAnswerChange?.(e.target.value);
  };

  const handleMultipleChange = (opcion: string) => {
    const nuevosValores = valoresMultiples.includes(opcion)
      ? valoresMultiples.filter(item => item !== opcion)
      : [...valoresMultiples, opcion];
    
    setValoresMultiples(nuevosValores);
    onAnswerChange?.(nuevosValores);
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

      {permiteMultiple ? (
        <FormControl component="fieldset">
          <FormGroup>
            {opciones.map((opcion, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={valoresMultiples.includes(opcion)}
                    onChange={() => handleMultipleChange(opcion)}
                    disabled={readonly}
                  />
                }
                label={opcion}
              />
            ))}
          </FormGroup>
        </FormControl>
      ) : (
        <FormControl component="fieldset">
          <RadioGroup value={valorSimple} onChange={handleSimpleChange}>
            {opciones.map((opcion, index) => (
              <FormControlLabel
                key={index}
                value={opcion}
                control={<Radio disabled={readonly} />}
                label={opcion}
              />
            ))}
          </RadioGroup>
        </FormControl>
      )}
    </Box>
  );
};
