/**
 * WorkflowCheckboxList
 * 
 * Lista de checkboxes estilizada para formularios de workflow
 */
import React from 'react';
import { Box, Checkbox, FormControlLabel, Typography, IconButton } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { checkboxStyles, fieldLabelStyles } from '../../../theme/workflowTheme';

export interface CheckboxItem {
  id: number;
  texto: string;
  tieneMasInfo?: boolean;
}

export interface WorkflowCheckboxListProps {
  /**
   * Etiqueta/título del grupo
   */
  label?: string;
  /**
   * Lista de items para mostrar
   */
  items: CheckboxItem[];
  /**
   * IDs de items seleccionados
   */
  selectedIds: Set<number>;
  /**
   * Callback cuando cambia la selección
   */
  onToggle: (id: number) => void;
  /**
   * Callback cuando se hace clic en el botón de info
   */
  onInfoClick?: (item: CheckboxItem) => void;
  /**
   * Si el campo está deshabilitado
   */
  disabled?: boolean;
}

/**
 * Lista de checkboxes reutilizable con estilos del workflow
 */
export const WorkflowCheckboxList: React.FC<WorkflowCheckboxListProps> = ({
  label,
  items,
  selectedIds,
  onToggle,
  onInfoClick,
  disabled = false,
}) => {
  return (
    <Box>
      {label && (
        <Typography sx={{ ...fieldLabelStyles, mb: 2 }}>
          {label}
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((item) => (
          <Box key={item.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedIds.has(item.id)}
                  onChange={() => !disabled && onToggle(item.id)}
                  disabled={disabled}
                  sx={checkboxStyles}
                />
              }
              label={
                <Typography sx={{ fontSize: '16px', color: '#4d4d4d', lineHeight: 1.5 }}>
                  {item.texto}
                </Typography>
              }
              sx={{ m: 0, alignItems: 'flex-start' }}
            />
            {item.tieneMasInfo && onInfoClick && (
              <IconButton 
                size="small" 
                sx={{ mt: -0.5, ml: 1 }}
                onClick={() => onInfoClick(item)}
              >
                <InfoIcon sx={{ fontSize: '16px', color: '#757575' }} />
              </IconButton>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default WorkflowCheckboxList;
