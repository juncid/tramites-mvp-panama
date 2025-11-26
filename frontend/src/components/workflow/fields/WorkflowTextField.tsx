/**
 * WorkflowTextField
 * 
 * Campo de texto estilizado para formularios de workflow
 */
import React from 'react';
import { Box, TextField, Typography, TextFieldProps, SxProps, Theme } from '@mui/material';
import { textFieldStyles, fieldLabelStyles, helperTextStyles, workflowSizes } from '../../../theme/workflowTheme';

export interface WorkflowTextFieldProps extends Omit<TextFieldProps, 'label'> {
  /**
   * Etiqueta del campo
   */
  label?: string;
  /**
   * Texto de ayuda debajo del campo
   */
  helperLabel?: string;
  /**
   * Ancho del campo (por defecto usa el estándar del tema)
   */
  fieldWidth?: number | string;
  /**
   * Si es true, el campo ocupa todo el ancho disponible
   */
  fullFieldWidth?: boolean;
}

/**
 * Campo de texto reutilizable con estilos del workflow
 */
export const WorkflowTextField: React.FC<WorkflowTextFieldProps> = ({
  label,
  helperLabel,
  fieldWidth,
  fullFieldWidth = false,
  sx,
  ...props
}) => {
  const width = fullFieldWidth ? '100%' : (fieldWidth ?? workflowSizes.fieldWidth);
  
  return (
    <Box>
      {label && (
        <Typography sx={fieldLabelStyles}>
          {label}
        </Typography>
      )}
      <TextField
        {...props}
        sx={[
          { width },
          textFieldStyles,
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ] as SxProps<Theme>}
      />
      {helperLabel && (
        <Typography sx={{ ...helperTextStyles, mt: 1 }}>
          {helperLabel}
        </Typography>
      )}
    </Box>
  );
};

export default WorkflowTextField;
