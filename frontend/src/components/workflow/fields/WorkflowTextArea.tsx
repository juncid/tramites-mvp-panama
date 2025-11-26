/**
 * WorkflowTextArea
 * 
 * Campo de texto multilínea estilizado para formularios de workflow
 */
import React from 'react';
import { Box, TextField, Typography, TextFieldProps, SxProps, Theme } from '@mui/material';
import { textAreaStyles, charCounterStyles } from '../../../theme/workflowTheme';

export interface WorkflowTextAreaProps extends Omit<TextFieldProps, 'label' | 'multiline'> {
  /**
   * Etiqueta del campo
   */
  label?: string;
  /**
   * Indica si el label tiene etiqueta de "(Opcional)"
   */
  optional?: boolean;
  /**
   * Número de filas
   */
  rows?: number;
  /**
   * Si es true, muestra contador de caracteres
   */
  showCharCount?: boolean;
  /**
   * Valor actual (necesario para el contador)
   */
  value?: string;
}

/**
 * Campo de texto multilínea reutilizable con estilos del workflow
 */
export const WorkflowTextArea: React.FC<WorkflowTextAreaProps> = ({
  label,
  optional = false,
  rows = 6,
  showCharCount = false,
  value = '',
  sx,
  ...props
}) => {
  return (
    <Box>
      {label && (
        <Typography sx={{ fontWeight: 500, fontSize: '16px', mb: 0.5, color: '#333' }}>
          {label}
          {optional && (
            <Typography component="span" sx={{ fontSize: '14px', fontWeight: 300, color: '#333', ml: 0.5 }}>
              (Opcional)
            </Typography>
          )}
        </Typography>
      )}
      <TextField
        {...props}
        value={value}
        multiline
        rows={rows}
        fullWidth
        sx={[
          textAreaStyles,
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ] as SxProps<Theme>}
      />
      {showCharCount && (
        <Typography sx={charCounterStyles(value.length > 0)}>
          {value.length} caracteres
        </Typography>
      )}
    </Box>
  );
};

export default WorkflowTextArea;
