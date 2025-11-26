/**
 * WorkflowRadioGroup
 * 
 * Grupo de radio buttons estilizado para formularios de workflow
 */
import React from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { radioStyles, radioLabelStyles, fieldLabelStyles } from '../../../theme/workflowTheme';

export interface RadioOption {
  value: string;
  label: string;
}

export interface WorkflowRadioGroupProps {
  /**
   * Etiqueta/pregunta del grupo
   */
  label?: string;
  /**
   * Valor seleccionado actualmente
   */
  value: string;
  /**
   * Callback cuando cambia la selección
   */
  onChange: (value: string) => void;
  /**
   * Opciones disponibles
   */
  options: RadioOption[];
  /**
   * Si es true, los radios se muestran en fila
   */
  row?: boolean;
  /**
   * Si el campo está deshabilitado
   */
  disabled?: boolean;
}

/**
 * Grupo de radio buttons reutilizable con estilos del workflow
 */
export const WorkflowRadioGroup: React.FC<WorkflowRadioGroupProps> = ({
  label,
  value,
  onChange,
  options,
  row = false,
  disabled = false,
}) => {
  return (
    <FormControl component="fieldset" disabled={disabled}>
      {label && (
        <FormLabel
          component="legend"
          sx={{
            ...fieldLabelStyles,
            '&.Mui-focused': {
              color: '#0e5fa6',
            },
          }}
        >
          {label}
        </FormLabel>
      )}
      <RadioGroup
        value={value}
        onChange={(e) => onChange(e.target.value)}
        row={row}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio sx={radioStyles} />}
            label={option.label}
            sx={radioLabelStyles}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default WorkflowRadioGroup;
