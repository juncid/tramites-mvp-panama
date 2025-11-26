import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  FormControlLabel,
  Checkbox,
  IconButton,
  Stack,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import type { WorkflowPregunta } from '../../types/workflow';

interface PreguntaFieldsProps {
  pregunta: WorkflowPregunta;
  onChange: (field: keyof WorkflowPregunta, value: any) => void;
  uploadedFileName?: string;
  onFileUpload?: (fileName: string) => void;
}

// Campo de Indicaciones con texto de ayuda (NO se usa solo, solo en componentes compuestos)
export const IndicacionesField: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => (
  <Box sx={{ mb: 2 }}>
    <TextField
      fullWidth
      size="small"
      label="Indicaciones"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Documento apostillado lorem ipsum"
    />
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: 'block', px: 2, mt: 0.5, fontSize: '14px', fontWeight: 300 }}
    >
      (Opcional), indicaciones para la persona que responda la pregunta
    </Typography>
  </Box>
);

// Campos para CARGA_ARCHIVO sin pregunta (caso inicial)
export const CargaArchivoFields: React.FC<PreguntaFieldsProps> = ({
  pregunta,
  onChange,
  uploadedFileName = '',
  onFileUpload,
}) => (
  <>
    <TextField
      fullWidth
      label="Pregunta"
      value={pregunta.pregunta || pregunta.texto || ''}
      onChange={(e) => {
        onChange('pregunta', e.target.value);
        onChange('texto', e.target.value);
      }}
      placeholder="Documento antecedentes ..."
      InputLabelProps={{ shrink: true }}
      sx={{
        '& .MuiInputLabel-root': {
          bgcolor: 'white',
          px: 0.5,
          fontSize: 14,
          fontWeight: 500,
          color: '#333333',
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: '#333333',
          },
          '& input': {
            color: '#4d4d4d',
            fontSize: 16,
          },
        },
      }}
    />

    <TextField
      fullWidth
      label="Descripción"
      multiline
      rows={3}
      value={pregunta.descripcion || ''}
      onChange={(e) => onChange('descripcion', e.target.value)}
      placeholder="Lorem"
      InputLabelProps={{ shrink: true }}
      sx={{
        '& .MuiInputLabel-root': {
          bgcolor: 'white',
          px: 0.5,
          fontSize: 14,
          fontWeight: 500,
          color: '#333333',
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: '#333333',
          },
          '& textarea': {
            color: '#4d4d4d',
            fontSize: 14,
          },
        },
      }}
    />

    <Typography sx={{ fontSize: 14, color: '#4d4d4d', fontWeight: 300 }}>
      Información adicional opcional
    </Typography>

    <TextField
      fullWidth
      label="Documento"
      InputLabelProps={{ shrink: true }}
      sx={{
        '& .MuiInputLabel-root': {
          bgcolor: 'white',
          px: 0.5,
          fontSize: 14,
          fontWeight: 500,
          color: '#333333',
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: '#333333',
          },
        },
      }}
    />

    <Button
      variant="contained"
      startIcon={<UploadIcon />}
      sx={{
        bgcolor: '#0e5fa6',
        color: 'white',
        textTransform: 'none',
        fontSize: 14,
        alignSelf: 'flex-start',
        '&:hover': {
          bgcolor: '#0d5494',
        },
      }}
    >
      Cargar archivo
    </Button>

    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: 'block', px: 2, mt: 0.5, fontSize: '14px', fontWeight: 300 }}
    >
      (Opcional), indicaciones para la persona que responda la pregunta
    </Typography>
  </>
);

// Campos para CARGA_ARCHIVO cuando hay pregunta configurada
export const CargaArchivoConPreguntaFields: React.FC<PreguntaFieldsProps> = ({
  pregunta,
  onChange,
  uploadedFileName = '',
  onFileUpload,
}) => (
  <>
    <TextField
      fullWidth
      size="small"
      label="Pregunta"
      value={pregunta.pregunta || pregunta.texto || ''}
      onChange={(e) => {
        onChange('pregunta', e.target.value);
        onChange('texto', e.target.value);
      }}
      placeholder="Documento antecedentes ..."
      sx={{ mb: 1 }}
    />

    <FormControlLabel
      control={
        <Checkbox
          checked={pregunta.es_obligatoria || false}
          onChange={(e) => onChange('es_obligatoria', e.target.checked)}
          size="small"
        />
      }
      label="Obligatoria"
      sx={{ mb: 2, ml: 0 }}
    />

    <Box sx={{ mb: 2 }}>
      <TextField
        fullWidth
        size="small"
        label="Indicaciones"
        value={pregunta.ayuda || ''}
        onChange={(e) => onChange('ayuda', e.target.value)}
        placeholder="Documento apostillado lorem ipsum"
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', px: 2, mt: 0.5, fontSize: '14px', fontWeight: 300 }}
      >
        (Opcional), indicaciones para la persona que responda la pregunta
      </Typography>
    </Box>

    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
      <InputLabel>Número máximo de archivos</InputLabel>
      <Select
        value={pregunta.max_archivos || 1}
        label="Número máximo de archivos"
        onChange={(e) => onChange('max_archivos', e.target.value as number)}
      >
        <MenuItem value={1}>1</MenuItem>
        <MenuItem value={2}>2</MenuItem>
        <MenuItem value={3}>3</MenuItem>
        <MenuItem value={5}>5</MenuItem>
        <MenuItem value={10}>10</MenuItem>
      </Select>
    </FormControl>

    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
      <InputLabel>Tamaño máximo</InputLabel>
      <Select
        value={pregunta.max_size_mb || 100}
        label="Tamaño máximo"
        onChange={(e) => onChange('max_size_mb', e.target.value as number)}
      >
        <MenuItem value={10}>10MB</MenuItem>
        <MenuItem value={25}>25MB</MenuItem>
        <MenuItem value={50}>50MB</MenuItem>
        <MenuItem value={100}>100MB</MenuItem>
        <MenuItem value={200}>200MB</MenuItem>
      </Select>
    </FormControl>

    <Box sx={{ mb: 2 }}>
      <TextField
        fullWidth
        size="small"
        label="Documento"
        value={uploadedFileName}
        placeholder=""
        disabled
      />
      <Box sx={{ mt: 1 }}>
        <Box
          component="label"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: '#0e5fa6',
            color: 'white',
            px: 1.5,
            py: 1,
            borderRadius: '2px',
            cursor: 'pointer',
            fontSize: '16px',
            lineHeight: '24px',
            '&:hover': {
              bgcolor: '#0d5494',
            },
          }}
        >
          <AttachFileIcon sx={{ fontSize: 16 }} />
          <Typography variant="body2" sx={{ fontFamily: 'Roboto', fontWeight: 400 }}>
            Cargar archivo
          </Typography>
          <input
            type="file"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onFileUpload) {
                onFileUpload(file.name);
              }
            }}
          />
        </Box>
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', px: 2, mt: 0.5, fontSize: '14px', fontWeight: 300 }}
      >
        (Opcional), indicaciones para la persona que responda la pregunta
      </Typography>
    </Box>
  </>
);

// Campos para OPCIONES (copia exacta de EtapaConfigPanel líneas 815-881)
export const OpcionesFields: React.FC<PreguntaFieldsProps> = ({ pregunta, onChange }) => {
  const listaElementos = pregunta.lista_elementos || [];

  return (
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={pregunta.permite_multiple || false}
            onChange={(e) => onChange('permite_multiple', e.target.checked)}
            size="small"
          />
        }
        label="Permitir selección múltiple"
        sx={{ mb: 2, ml: 0 }}
      />

      <Stack spacing={2}>
        {listaElementos.map((opcion, index) => (
          <TextField
            key={index}
            fullWidth
            size="small"
            label={`Opción ${index + 1}`}
            value={opcion}
            onChange={(e) => {
              const nuevasOpciones = [...listaElementos];
              nuevasOpciones[index] = e.target.value;
              onChange('lista_elementos', nuevasOpciones);
            }}
            InputProps={{
              endAdornment: (
                <IconButton
                  size="small"
                  onClick={() => {
                    const nuevasOpciones = listaElementos.filter((_, i) => i !== index);
                    onChange('lista_elementos', nuevasOpciones);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              ),
            }}
          />
        ))}
      </Stack>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mt: 2,
          p: 1.5,
          bgcolor: '#0e5fa6',
          color: 'white',
          borderRadius: 1,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: '#0d5494',
          },
        }}
        onClick={() => {
          const nuevasOpciones = [...listaElementos, ''];
          onChange('lista_elementos', nuevasOpciones);
        }}
      >
        <AddIcon />
        <Typography>Añadir opción</Typography>
      </Box>
    </>
  );
};

// Campos para RESPUESTA_TEXTO (copia exacta de EtapaConfigPanel líneas 722-738)
export const RespuestaTextoFields: React.FC<PreguntaFieldsProps> = ({ pregunta, onChange }) => (
  <>
    <FormControl fullWidth size="small">
      <InputLabel>Número máximo de caracteres</InputLabel>
      <Select
        value={pregunta.max_caracteres || ''}
        label="Número máximo de caracteres"
        onChange={(e) => onChange('max_caracteres', e.target.value)}
      >
        <MenuItem value="">Sin límite</MenuItem>
        <MenuItem value={500}>500</MenuItem>
        <MenuItem value={1000}>1000</MenuItem>
        <MenuItem value={2000}>2000</MenuItem>
        <MenuItem value={5000}>5000</MenuItem>
      </Select>
    </FormControl>
  </>
);
