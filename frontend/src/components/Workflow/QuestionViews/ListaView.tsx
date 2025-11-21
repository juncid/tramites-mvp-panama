import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import type { WorkflowPregunta } from '../../../types/workflow';

interface ListaViewProps {
  pregunta: WorkflowPregunta;
  readonly?: boolean;
  onAnswerChange?: (valor: string[]) => void;
}

export const ListaView: React.FC<ListaViewProps> = ({
  pregunta,
  readonly = false,
  onAnswerChange,
}) => {
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  const opciones = pregunta.lista_elementos || [];

  const handleChange = (opcion: string) => {
    const nuevosSeleccionados = seleccionados.includes(opcion)
      ? seleccionados.filter(item => item !== opcion)
      : [...seleccionados, opcion];
    
    setSeleccionados(nuevosSeleccionados);
    onAnswerChange?.(nuevosSeleccionados);
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

      <FormControl component="fieldset">
        <FormGroup>
          {opciones.map((opcion, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={seleccionados.includes(opcion)}
                  onChange={() => handleChange(opcion)}
                  disabled={readonly}
                />
              }
              label={opcion}
            />
          ))}
        </FormGroup>
      </FormControl>
    </Box>
  );
};
