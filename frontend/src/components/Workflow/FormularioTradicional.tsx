/**
 * Componente FormularioTradicional
 * Sistema de Trámites Migratorios de Panamá
 * 
 * Renderiza formularios usando el sistema legacy de preguntas
 * cuando NO existe configuración de vista dinámica.
 * 
 * @author Sistema de Trámites MVP Panamá
 * @date 2025-11-14
 */

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

import type { WorkflowPregunta } from '../../types/workflow';

interface FormularioTradicionalProps {
  preguntas: WorkflowPregunta[];
  onSubmit: (respuestas: Record<string, any>) => void;
  onCancel?: () => void;
}

export const FormularioTradicional: React.FC<FormularioTradicionalProps> = ({
  preguntas,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handler para cambios en campos
  const handleChange = (preguntaId: number | undefined, value: any) => {
    if (!preguntaId) return;
    
    setFormData((prev) => ({
      ...prev,
      [preguntaId]: value,
    }));

    // Limpiar error si existía
    if (errors[preguntaId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[preguntaId];
        return newErrors;
      });
    }
  };

  // Validar formulario
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    preguntas.forEach((pregunta) => {
      if (pregunta.es_obligatoria && !formData[pregunta.id!]) {
        newErrors[pregunta.id!] = 'Este campo es obligatorio';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit(formData);
  };

  // Renderizar pregunta según tipo
  const renderPregunta = (pregunta: WorkflowPregunta) => {
    const value = formData[pregunta.id!] || '';
    const error = errors[pregunta.id!];
    const tipoPregunta = (pregunta.tipo_pregunta || pregunta.tipo) as string;

    switch (tipoPregunta) {
      case 'TEXTO':
      case 'RESPUESTA_TEXTO':
        return (
          <TextField
            key={pregunta.id}
            fullWidth
            label={pregunta.pregunta || pregunta.texto}
            value={value}
            onChange={(e) => handleChange(pregunta.id, e.target.value)}
            error={!!error}
            helperText={error || pregunta.texto_ayuda || pregunta.ayuda}
            required={pregunta.es_obligatoria}
            placeholder={pregunta.valor_por_defecto}
          />
        );

      case 'RESPUESTA_LARGA':
        return (
          <TextField
            key={pregunta.id}
            fullWidth
            multiline
            rows={4}
            label={pregunta.pregunta || pregunta.texto}
            value={value}
            onChange={(e) => handleChange(pregunta.id, e.target.value)}
            error={!!error}
            helperText={error || pregunta.texto_ayuda || pregunta.ayuda}
            required={pregunta.es_obligatoria}
          />
        );

      case 'NUMERO':
        return (
          <TextField
            key={pregunta.id}
            fullWidth
            type="number"
            label={pregunta.pregunta || pregunta.texto}
            value={value}
            onChange={(e) => handleChange(pregunta.id, parseFloat(e.target.value))}
            error={!!error}
            helperText={error || pregunta.texto_ayuda || pregunta.ayuda}
            required={pregunta.es_obligatoria}
          />
        );

      case 'FECHA':
      case 'SELECCION_FECHA':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              key={pregunta.id}
              label={pregunta.pregunta || pregunta.texto}
              value={value ? new Date(value) : null}
              onChange={(newValue) => handleChange(pregunta.id, newValue ? new Date(newValue as any).toISOString() : null)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!error,
                  helperText: error || pregunta.texto_ayuda || pregunta.ayuda,
                  required: pregunta.es_obligatoria,
                },
              }}
            />
          </LocalizationProvider>
        );

      case 'LISTA':
      case 'SELECCION_SIMPLE':
        const opciones = pregunta.opciones_json || [];
        return (
          <FormControl key={pregunta.id} fullWidth error={!!error}>
            <InputLabel required={pregunta.es_obligatoria}>
              {pregunta.pregunta || pregunta.texto}
            </InputLabel>
            <Select
              value={value}
              onChange={(e) => handleChange(pregunta.id, e.target.value)}
              label={pregunta.pregunta || pregunta.texto}
            >
              {opciones.map((opcion: any, idx: number) => (
                <MenuItem key={idx} value={opcion.valor || opcion}>
                  {opcion.etiqueta || opcion}
                </MenuItem>
              ))}
            </Select>
            {(error || pregunta.texto_ayuda) && (
              <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>
                {error || pregunta.texto_ayuda || pregunta.ayuda}
              </Typography>
            )}
          </FormControl>
        );

      case 'OPCIONES':
        return (
          <FormControl key={pregunta.id} component="fieldset" error={!!error}>
            <FormLabel component="legend" required={pregunta.es_obligatoria}>
              {pregunta.pregunta || pregunta.texto}
            </FormLabel>
            <RadioGroup
              value={value}
              onChange={(e) => handleChange(pregunta.id, e.target.value)}
            >
              {(pregunta.opciones_json || []).map((opcion: any, idx: number) => (
                <FormControlLabel
                  key={idx}
                  value={opcion.valor || opcion}
                  control={<Radio />}
                  label={opcion.etiqueta || opcion}
                />
              ))}
            </RadioGroup>
            {(error || pregunta.texto_ayuda) && (
              <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>
                {error || pregunta.texto_ayuda || pregunta.ayuda}
              </Typography>
            )}
          </FormControl>
        );

      case 'SELECCION_MULTIPLE':
        return (
          <FormControl key={pregunta.id} component="fieldset" error={!!error}>
            <FormLabel component="legend" required={pregunta.es_obligatoria}>
              {pregunta.pregunta || pregunta.texto}
            </FormLabel>
            <FormGroup>
              {(pregunta.opciones_json || []).map((opcion: any, idx: number) => (
                <FormControlLabel
                  key={idx}
                  control={
                    <Checkbox
                      checked={Array.isArray(value) && value.includes(opcion.valor || opcion)}
                      onChange={(e) => {
                        const currentValues = Array.isArray(value) ? value : [];
                        const newValues = e.target.checked
                          ? [...currentValues, opcion.valor || opcion]
                          : currentValues.filter((v) => v !== (opcion.valor || opcion));
                        handleChange(pregunta.id, newValues);
                      }}
                    />
                  }
                  label={opcion.etiqueta || opcion}
                />
              ))}
            </FormGroup>
            {(error || pregunta.texto_ayuda) && (
              <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>
                {error || pregunta.texto_ayuda || pregunta.ayuda}
              </Typography>
            )}
          </FormControl>
        );

      case 'SI_NO':
        return (
          <FormControl key={pregunta.id} component="fieldset" error={!!error}>
            <FormLabel component="legend" required={pregunta.es_obligatoria}>
              {pregunta.pregunta || pregunta.texto}
            </FormLabel>
            <RadioGroup
              value={value}
              onChange={(e) => handleChange(pregunta.id, e.target.value === 'true')}
            >
              <FormControlLabel value="true" control={<Radio />} label="Sí" />
              <FormControlLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>
            {(error || pregunta.texto_ayuda) && (
              <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>
                {error || pregunta.texto_ayuda || pregunta.ayuda}
              </Typography>
            )}
          </FormControl>
        );

      case 'CARGA_ARCHIVO':
        return (
          <Box key={pregunta.id}>
            <FormLabel required={pregunta.es_obligatoria}>
              {pregunta.pregunta || pregunta.texto}
            </FormLabel>
            <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }}>
              Seleccionar archivo
              <input
                type="file"
                hidden
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    handleChange(pregunta.id, files[0]);
                  }
                }}
              />
            </Button>
            {value && (
              <Typography variant="caption" color="success.main" sx={{ mt: 1 }}>
                Archivo seleccionado: {value.name}
              </Typography>
            )}
            {(error || pregunta.texto_ayuda) && (
              <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>
                {error || pregunta.texto_ayuda || pregunta.ayuda}
              </Typography>
            )}
          </Box>
        );

      default:
        return (
          <Alert key={pregunta.id} severity="warning">
            Tipo de pregunta no soportado: {tipoPregunta}
          </Alert>
        );
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {preguntas
          .sort((a, b) => a.orden - b.orden)
          .map((pregunta) => (
            <Box key={pregunta.id}>{renderPregunta(pregunta)}</Box>
          ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="contained" color="primary">
          Guardar y Continuar
        </Button>
      </Box>
    </Box>
  );
};

export default FormularioTradicional;
