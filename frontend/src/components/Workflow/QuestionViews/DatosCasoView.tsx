import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import type { WorkflowPregunta } from '../../../types/workflow';

interface DatosCasoViewProps {
  pregunta: WorkflowPregunta;
  readonly?: boolean;
  onAnswerChange?: (datos: any) => void;
  instanciaId?: number;
}

export const DatosCasoView: React.FC<DatosCasoViewProps> = ({
  pregunta,
}) => {
  // TODO: Cargar datos del caso desde el backend basado en instanciaId
  const datosCaso = {
    'BESEX': 'Masculino',
    'Nombre': 'Juan Pérez González',
    'Nacionalidad': 'Panamá',
    'Pasaporte': 'N/A',
    'Sexo': 'Masculino',
    'N° de expediente': 'PPSH-2025-0004',
    'Fecha de nacimiento': '1985-03-15',
  };

  const campos = pregunta.campos_caso || Object.keys(datosCaso);

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
      </Typography>

      <Paper 
        variant="outlined" 
        sx={{ 
          p: 2, 
          backgroundColor: '#F9FAFB',
        }}
      >
        <Grid container spacing={2}>
          {campos.map((campo, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#6B7280',
                  display: 'block',
                  mb: 0.5,
                }}
              >
                {campo}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#1F2937',
                  fontWeight: 500,
                }}
              >
                {datosCaso[campo as keyof typeof datosCaso] || '-'}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};
