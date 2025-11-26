/**
 * WorkflowDateTimePicker
 * 
 * Campo de fecha/hora estilizado para formularios de workflow
 */
import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { fieldLabelStyles, infoBoxStyles } from '../../../theme/workflowTheme';

export interface WorkflowDateTimePickerProps {
  /**
   * Etiqueta del campo
   */
  label?: string;
  /**
   * Valor seleccionado (formato ISO)
   */
  value: string;
  /**
   * Callback cuando cambia el valor
   */
  onChange: (value: string) => void;
  /**
   * Tipo de input ('date', 'time', 'datetime-local')
   */
  type?: 'date' | 'time' | 'datetime-local';
  /**
   * Si el campo está deshabilitado
   */
  disabled?: boolean;
  /**
   * Si es true, muestra la fecha seleccionada formateada
   */
  showFormattedDate?: boolean;
  /**
   * Ancho completo
   */
  fullWidth?: boolean;
}

/**
 * Campo de fecha/hora reutilizable con estilos del workflow
 */
export const WorkflowDateTimePicker: React.FC<WorkflowDateTimePickerProps> = ({
  label,
  value,
  onChange,
  type = 'datetime-local',
  disabled = false,
  showFormattedDate = true,
  fullWidth = true,
}) => {
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleString('es-PA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };
  
  return (
    <Box>
      {label && (
        <Typography sx={fieldLabelStyles}>
          {label}
        </Typography>
      )}
      <TextField
        fullWidth={fullWidth}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        InputLabelProps={{
          shrink: true,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: 56,
            borderRadius: '4px',
            fontFamily: 'Roboto',
            fontSize: 16,
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#d0d0d0',
              borderWidth: '1px',
              borderRadius: '4px',
            },
            '&:hover fieldset': {
              borderColor: '#333333',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0e5fa6',
              borderWidth: '2px',
            },
          },
        }}
      />
      
      {showFormattedDate && value && (
        <Box sx={{ ...infoBoxStyles, mt: 2 }}>
          <Typography sx={{ fontSize: '14px', color: '#1976d2', fontWeight: 500 }}>
            Fecha seleccionada
          </Typography>
          <Typography sx={{ fontSize: '16px', color: '#1976d2', mt: 0.5 }}>
            {formatDate(value)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default WorkflowDateTimePicker;
