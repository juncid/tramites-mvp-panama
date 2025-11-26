/**
 * WorkflowFileUpload
 * 
 * Componente de carga de archivos estilizado para formularios de workflow
 */
import React, { useRef } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { AttachFile as AttachFileIcon } from '@mui/icons-material';
import {
  primaryButtonStyles,
  fieldLabelStyles,
  helperTextStyles,
  infoBoxStyles,
  workflowSizes
} from '../../../theme/workflowTheme';export interface WorkflowFileUploadProps {
  /**
   * Etiqueta del campo
   */
  label?: string;
  /**
   * Texto de ayuda/indicaciones debajo del botón
   */
  helperText?: string;
  /**
   * Archivo seleccionado actualmente
   */
  file: File | null;
  /**
   * Callback cuando se selecciona un archivo
   */
  onFileChange: (file: File | null) => void;
  /**
   * Tipos de archivo aceptados (ej: "image/*,.pdf")
   */
  accept?: string;
  /**
   * Texto del botón
   */
  buttonText?: string;
  /**
   * Si el campo está deshabilitado
   */
  disabled?: boolean;
  /**
   * Si es true, muestra el nombre del archivo en un TextField
   */
  showTextField?: boolean;
  /**
   * Ancho del TextField (si se muestra)
   */
  fieldWidth?: number | string;
}

/**
 * Componente de carga de archivos reutilizable con estilos del workflow
 */
export const WorkflowFileUpload: React.FC<WorkflowFileUploadProps> = ({
  label,
  helperText = 'Indicaciones extra',
  file,
  onFileChange,
  accept = 'image/*,.pdf',
  buttonText = 'Cargar archivo',
  disabled = false,
  showTextField = true,
  fieldWidth,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    onFileChange(selectedFile);
  };
  
  const width = fieldWidth ?? workflowSizes.fieldWidth;
  
  return (
    <Box>
      {label && (
        <Typography sx={fieldLabelStyles}>
          {label}
        </Typography>
      )}
      
      {showTextField && (
        <TextField
          value={file?.name || ''}
          placeholder=""
          disabled
          sx={{
            width,
            mb: 2,
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              height: '56px',
              '& fieldset': {
                borderColor: '#333333',
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: '#333333',
              },
              '&.Mui-disabled fieldset': {
                borderColor: '#333333',
              },
            },
            '& .MuiOutlinedInput-input': {
              padding: '16px 14px',
              color: '#333333',
              fontSize: '16px',
            },
          }}
        />
      )}
      
      <Box sx={{ mb: 1 }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          accept={accept}
          style={{ display: 'none' }}
          disabled={disabled}
        />
        <Button
          variant="contained"
          onClick={handleClick}
          disabled={disabled}
          startIcon={<AttachFileIcon />}
          sx={primaryButtonStyles}
        >
          {buttonText}
        </Button>
      </Box>
      
      {helperText && (
        <Typography sx={helperTextStyles}>
          {helperText}
        </Typography>
      )}
      
      {file && (
        <Box sx={{ ...infoBoxStyles, mt: 2 }}>
          <Typography sx={{ fontSize: '14px', color: '#1976d2', fontWeight: 500 }}>
            Archivo seleccionado
          </Typography>
          <Typography sx={{ fontSize: '16px', color: '#1976d2', mt: 0.5 }}>
            {file.name}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default WorkflowFileUpload;
