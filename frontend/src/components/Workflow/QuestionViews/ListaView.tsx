import React, { useState, useEffect } from 'react';
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
  value?: string[] | string; // Puede venir como array o string JSON
  allowSelectionInReadonly?: boolean; // Permitir selección incluso en modo readonly (ej: cotización)
}

export const ListaView: React.FC<ListaViewProps> = ({
  pregunta,
  readonly = false,
  onAnswerChange,
  value,
  allowSelectionInReadonly = false,
}) => {
  // Parsear el valor inicial
  const parseInitialValue = (): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const [seleccionados, setSeleccionados] = useState<string[]>(parseInitialValue);

  // Sincronizar con value externo
  useEffect(() => {
    setSeleccionados(parseInitialValue());
  }, [value]);

  // Soporte para lista_elementos o opciones (de la BD)
  let opciones: string[] = [];
  if (pregunta.lista_elementos && pregunta.lista_elementos.length > 0) {
    opciones = pregunta.lista_elementos;
  } else if (pregunta.opciones) {
    if (typeof pregunta.opciones === 'string') {
      try {
        opciones = JSON.parse(pregunta.opciones);
      } catch (e) {
        console.error('Error parsing opciones:', e);
      }
    } else if (Array.isArray(pregunta.opciones)) {
      opciones = pregunta.opciones;
    }
  }

  if (opciones.length === 0) {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography 
          sx={{ 
            fontWeight: 500,
            fontFamily: 'Roboto, sans-serif',
            fontSize: '16px',
            lineHeight: 1.5,
            color: '#333333',
            mb: 2,
          }}
        >
          {pregunta.pregunta}
        </Typography>
        <Typography sx={{ color: '#F59E0B', fontStyle: 'italic', fontSize: '14px' }}>
          No hay opciones configuradas para esta pregunta
        </Typography>
      </Box>
    );
  }

  const handleChange = (opcion: string) => {
    const nuevosSeleccionados = seleccionados.includes(opcion)
      ? seleccionados.filter(item => item !== opcion)
      : [...seleccionados, opcion];
    
    setSeleccionados(nuevosSeleccionados);
    onAnswerChange?.(nuevosSeleccionados);
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Título "Cotización" según Figma */}
      <Typography 
        sx={{ 
          fontWeight: 500,
          fontFamily: 'Roboto, sans-serif',
          fontSize: '16px',
          lineHeight: 1.5,
          color: '#333333',
          mb: 2,
        }}
      >
        {pregunta.pregunta}
        {pregunta.es_obligatoria && (
          <Box component="span" sx={{ color: '#DC2626', ml: 0.5 }}>*</Box>
        )}
      </Typography>

      {/* Checkboxes sin contenedor según Figma */}
      <FormControl component="fieldset">
        <FormGroup sx={{ gap: 2 }}>
          {opciones.map((opcion, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={seleccionados.includes(opcion)}
                  onChange={() => handleChange(opcion)}
                  disabled={readonly && !allowSelectionInReadonly}
                  sx={{
                    color: '#333333',
                    p: 0,
                    mr: 0.75,
                    '&.Mui-checked': {
                      color: '#0E5FA6',
                    },
                  }}
                />
              }
              label={
                <Typography 
                  sx={{ 
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '16px',
                    lineHeight: 1.5,
                    color: '#4d4d4d',
                  }}
                >
                  {opcion}
                </Typography>
              }
              sx={{ m: 0, alignItems: 'center' }}
            />
          ))}
        </FormGroup>
      </FormControl>
    </Box>
  );
};
