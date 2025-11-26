/**
 * Sistema de temas centralizado para componentes de workflow
 * 
 * Define estilos consistentes para todos los componentes de campo
 * utilizados en las vistas del workflow PPSH
 */
import { SxProps, Theme } from '@mui/material';

/**
 * Colores del tema del workflow
 */
export const workflowColors = {
  primary: '#0e5fa6',
  primaryDark: '#0a4a80',
  primaryLight: '#e3f2fd',
  
  text: {
    primary: '#333333',
    secondary: '#4d4d4d',
    disabled: '#666666',
    hint: '#999999',
  },
  
  border: {
    default: '#333333',
    light: '#d0d0d0',
    focus: '#0e5fa6',
  },
  
  background: {
    default: '#ffffff',
    paper: '#f8f8f8',
    disabled: '#cccccc',
  },
  
  status: {
    success: '#4caf50',
    successLight: '#e8f5e9',
    successDark: '#2e7d32',
    error: '#f44336',
    errorLight: '#ffebee',
    errorDark: '#c62828',
    info: '#1976d2',
    infoLight: '#e3f2fd',
  },
} as const;

/**
 * Tamaños estándar
 */
export const workflowSizes = {
  inputHeight: 56,
  buttonHeight: 32,
  borderRadius: 4,
  fieldWidth: 520,
} as const;

/**
 * Estilos para TextField estándar
 */
export const textFieldStyles: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    height: workflowSizes.inputHeight,
    borderRadius: `${workflowSizes.borderRadius}px`,
    fontFamily: 'Roboto',
    fontSize: 16,
    backgroundColor: workflowColors.background.default,
    '& fieldset': {
      borderColor: workflowColors.border.default,
      borderWidth: '1px',
      borderRadius: `${workflowSizes.borderRadius}px`,
    },
    '&:hover fieldset': {
      borderColor: workflowColors.border.default,
    },
    '&.Mui-focused fieldset': {
      borderColor: workflowColors.border.focus,
      borderWidth: '2px',
    },
    '&.Mui-disabled fieldset': {
      borderColor: workflowColors.border.light,
    },
  },
};

/**
 * Estilos para TextField multilínea (TextArea)
 */
export const textAreaStyles: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    borderRadius: `${workflowSizes.borderRadius}px`,
    fontFamily: 'Roboto',
    fontSize: 16,
    backgroundColor: workflowColors.background.default,
    '& fieldset': {
      borderColor: workflowColors.border.default,
      borderWidth: '1px',
      borderRadius: `${workflowSizes.borderRadius}px`,
    },
    '&:hover fieldset': {
      borderColor: workflowColors.border.default,
    },
    '&.Mui-focused fieldset': {
      borderColor: workflowColors.border.focus,
      borderWidth: '2px',
    },
    '&.Mui-disabled fieldset': {
      borderColor: workflowColors.border.light,
    },
  },
};

/**
 * Estilos para TextField con borde light
 */
export const textFieldLightStyles: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    height: workflowSizes.inputHeight,
    borderRadius: `${workflowSizes.borderRadius}px`,
    fontFamily: 'Roboto',
    fontSize: 16,
    backgroundColor: workflowColors.background.default,
    '& fieldset': {
      borderColor: workflowColors.border.light,
      borderWidth: '1px',
      borderRadius: `${workflowSizes.borderRadius}px`,
    },
    '&:hover fieldset': {
      borderColor: workflowColors.border.default,
    },
    '&.Mui-focused fieldset': {
      borderColor: workflowColors.border.focus,
      borderWidth: '2px',
    },
  },
};

/**
 * Estilos para botones primarios
 */
export const primaryButtonStyles: SxProps<Theme> = {
  bgcolor: workflowColors.primary,
  color: 'white',
  textTransform: 'none',
  fontFamily: 'Roboto',
  fontSize: '16px',
  fontWeight: 400,
  borderRadius: '2px',
  height: `${workflowSizes.buttonHeight}px`,
  px: 2,
  boxShadow: 'none',
  '&:hover': {
    bgcolor: workflowColors.primaryDark,
    boxShadow: 'none',
  },
  '&.Mui-disabled': {
    bgcolor: workflowColors.background.disabled,
    color: workflowColors.text.disabled,
  },
};

/**
 * Estilos para Radio buttons
 */
export const radioStyles: SxProps<Theme> = {
  color: workflowColors.border.default,
  '&.Mui-checked': {
    color: workflowColors.primary,
  },
};

/**
 * Estilos para Checkbox
 */
export const checkboxStyles: SxProps<Theme> = {
  color: workflowColors.primary,
  '&.Mui-checked': {
    color: workflowColors.primary,
  },
};

/**
 * Estilos para etiquetas de campo
 */
export const fieldLabelStyles: SxProps<Theme> = {
  fontWeight: 500,
  fontSize: '16px',
  color: workflowColors.text.primary,
  mb: 1,
};

/**
 * Estilos para texto de ayuda
 */
export const helperTextStyles: SxProps<Theme> = {
  fontSize: '14px',
  fontWeight: 300,
  color: workflowColors.text.primary,
};

/**
 * Estilos para cajas de información
 */
export const infoBoxStyles: SxProps<Theme> = {
  p: 2,
  bgcolor: workflowColors.status.infoLight,
  borderRadius: `${workflowSizes.borderRadius}px`,
  border: `1px solid ${workflowColors.status.info}`,
};

/**
 * Estilos para cajas de éxito
 */
export const successBoxStyles: SxProps<Theme> = {
  p: 2,
  bgcolor: workflowColors.status.successLight,
  borderRadius: `${workflowSizes.borderRadius}px`,
  border: `1px solid ${workflowColors.status.success}`,
};

/**
 * Estilos para cajas de error
 */
export const errorBoxStyles: SxProps<Theme> = {
  p: 2,
  bgcolor: workflowColors.status.errorLight,
  borderRadius: `${workflowSizes.borderRadius}px`,
  border: `1px solid ${workflowColors.status.error}`,
};

/**
 * Estilos para FormControlLabel en RadioGroup
 */
export const radioLabelStyles: SxProps<Theme> = {
  '& .MuiFormControlLabel-label': {
    fontSize: '16px',
    fontWeight: 500,
    color: workflowColors.text.primary,
  },
};

/**
 * Estilos para contador de caracteres
 */
export const charCounterStyles = (hasContent: boolean): SxProps<Theme> => ({
  mt: 1,
  fontSize: '14px',
  color: hasContent ? workflowColors.text.secondary : workflowColors.text.hint,
  textAlign: 'right',
});

export default {
  colors: workflowColors,
  sizes: workflowSizes,
  textField: textFieldStyles,
  textFieldLight: textFieldLightStyles,
  textArea: textAreaStyles,
  primaryButton: primaryButtonStyles,
  radio: radioStyles,
  checkbox: checkboxStyles,
  fieldLabel: fieldLabelStyles,
  helperText: helperTextStyles,
  infoBox: infoBoxStyles,
  successBox: successBoxStyles,
  errorBox: errorBoxStyles,
  radioLabel: radioLabelStyles,
  charCounter: charCounterStyles,
};
