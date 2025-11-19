/**
 * Formulario dinámico para ejecutar una etapa del workflow
 * Renderiza preguntas según su tipo con validaciones
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Select,
  MenuItem,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import {
  Send as SendIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import type { WorkflowEtapa, WorkflowPregunta } from '../../types/workflow';
import { useEtapaExecution } from '../../hooks/useEtapaExecution';

interface EtapaExecutionFormProps {
  instanciaId: number;
  etapa: WorkflowEtapa;
  perfil: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Renderiza una pregunta individual según su tipo
 */
const RenderPregunta: React.FC<{
  pregunta: WorkflowPregunta;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}> = ({ pregunta, value, onChange, error }) => {
  const tipo = pregunta.tipo_pregunta || pregunta.tipo;

  switch (tipo) {
    case 'RESPUESTA_TEXTO':
      return (
        <TextField
          fullWidth
          label={pregunta.pregunta || pregunta.texto}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={pregunta.es_obligatoria}
          error={!!error}
          helperText={error || pregunta.texto_ayuda || pregunta.ayuda}
          placeholder={pregunta.valor_por_defecto}
          inputProps={{
            maxLength: pregunta.max_caracteres,
          }}
        />
      );

    case 'RESPUESTA_LARGA':
      return (
        <TextField
          fullWidth
          multiline
          rows={4}
          label={pregunta.pregunta || pregunta.texto}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={pregunta.es_obligatoria}
          error={!!error}
          helperText={error || pregunta.texto_ayuda || pregunta.ayuda}
          placeholder={pregunta.valor_por_defecto}
          inputProps={{
            maxLength: pregunta.max_caracteres,
          }}
        />
      );

    case 'LISTA':
      return (
        <FormControl fullWidth error={!!error} required={pregunta.es_obligatoria}>
          <InputLabel>{pregunta.pregunta || pregunta.texto}</InputLabel>
          <Select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            label={pregunta.pregunta || pregunta.texto}
          >
            {(pregunta.lista_elementos || []).map((opcion, idx) => (
              <MenuItem key={idx} value={opcion}>
                {opcion}
              </MenuItem>
            ))}
          </Select>
          {(error || pregunta.texto_ayuda) && (
            <FormHelperText>{error || pregunta.texto_ayuda || pregunta.ayuda}</FormHelperText>
          )}
        </FormControl>
      );

    case 'OPCIONES':
      if (pregunta.permite_multiple) {
        // Checkbox múltiple
        return (
          <FormControl component="fieldset" error={!!error} required={pregunta.es_obligatoria}>
            <FormLabel component="legend">{pregunta.pregunta || pregunta.texto}</FormLabel>
            <FormGroup>
              {(pregunta.lista_elementos || []).map((opcion, idx) => (
                <FormControlLabel
                  key={idx}
                  control={
                    <Checkbox
                      checked={(value || []).includes(opcion)}
                      onChange={(e) => {
                        const currentValues = value || [];
                        if (e.target.checked) {
                          onChange([...currentValues, opcion]);
                        } else {
                          onChange(currentValues.filter((v: string) => v !== opcion));
                        }
                      }}
                    />
                  }
                  label={opcion}
                />
              ))}
            </FormGroup>
            {(error || pregunta.texto_ayuda) && (
              <FormHelperText>{error || pregunta.texto_ayuda || pregunta.ayuda}</FormHelperText>
            )}
          </FormControl>
        );
      } else {
        // Radio button simple
        return (
          <FormControl component="fieldset" error={!!error} required={pregunta.es_obligatoria}>
            <FormLabel component="legend">{pregunta.pregunta || pregunta.texto}</FormLabel>
            <RadioGroup
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            >
              {(pregunta.lista_elementos || []).map((opcion, idx) => (
                <FormControlLabel
                  key={idx}
                  value={opcion}
                  control={<Radio />}
                  label={opcion}
                />
              ))}
            </RadioGroup>
            {(error || pregunta.texto_ayuda) && (
              <FormHelperText>{error || pregunta.texto_ayuda || pregunta.ayuda}</FormHelperText>
            )}
          </FormControl>
        );
      }

    case 'SELECCION_FECHA':
      return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <DatePicker
            label={pregunta.pregunta || pregunta.texto}
            value={value ? new Date(value) : null}
            onChange={(newValue) => onChange(newValue?.toISOString())}
            slotProps={{
              textField: {
                fullWidth: true,
                required: pregunta.es_obligatoria,
                error: !!error,
                helperText: error || pregunta.texto_ayuda || pregunta.ayuda,
              },
            }}
          />
        </LocalizationProvider>
      );

    case 'CARGA_ARCHIVO':
      return (
        <Box>
          <FormLabel required={pregunta.es_obligatoria}>
            {pregunta.pregunta || pregunta.texto}
          </FormLabel>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mt: 1, mb: 1 }}
          >
            Seleccionar archivo
            <input
              type="file"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onChange(file);
                }
              }}
            />
          </Button>
          {value && (
            <Typography variant="caption" display="block">
              Archivo seleccionado: {value.name}
            </Typography>
          )}
          {(error || pregunta.texto_ayuda) && (
            <FormHelperText error={!!error}>
              {error || pregunta.texto_ayuda || pregunta.ayuda}
            </FormHelperText>
          )}
        </Box>
      );

    case 'DATOS_CASO':
      return (
        <Alert severity="info">
          <Typography variant="body2" fontWeight="bold">
            {pregunta.pregunta || pregunta.texto}
          </Typography>
          <Typography variant="caption">
            Esta información se mostrará automáticamente desde los datos del caso.
          </Typography>
        </Alert>
      );

    case 'REVISION_MANUAL_DOCUMENTOS':
    case 'REVISION_OCR':
      return (
        <Alert severity="warning">
          <Typography variant="body2" fontWeight="bold">
            {pregunta.pregunta || pregunta.texto}
          </Typography>
          <Typography variant="caption">
            Esta sección requiere revisión {tipo === 'REVISION_OCR' ? 'automática' : 'manual'} de documentos.
          </Typography>
        </Alert>
      );

    default:
      return (
        <TextField
          fullWidth
          label={pregunta.pregunta || pregunta.texto}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={pregunta.es_obligatoria}
          error={!!error}
          helperText={error || pregunta.texto_ayuda || pregunta.ayuda}
        />
      );
  }
};

/**
 * Componente principal del formulario de ejecución de etapa
 */
export const EtapaExecutionForm: React.FC<EtapaExecutionFormProps> = ({
  instanciaId,
  etapa,
  perfil,
  onSuccess,
  onCancel,
}) => {
  const { ejecutar, loading, error: executionError } = useEtapaExecution(perfil);
  const [respuestas, setRespuestas] = useState<Record<string, any>>({});
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Inicializar respuestas con valores por defecto
  useEffect(() => {
    const valoresIniciales: Record<string, any> = {};
    etapa.preguntas?.forEach((pregunta) => {
      if (pregunta.valor_por_defecto) {
        valoresIniciales[pregunta.codigo] = pregunta.valor_por_defecto;
      }
    });
    setRespuestas(valoresIniciales);
  }, [etapa]);

  // Validar respuestas
  const validarRespuestas = (): boolean => {
    const nuevosErrores: Record<string, string> = {};
    let valido = true;

    etapa.preguntas?.forEach((pregunta) => {
      const valor = respuestas[pregunta.codigo];

      // Validar campo obligatorio
      if (pregunta.es_obligatoria) {
        if (valor === undefined || valor === null || valor === '' || 
            (Array.isArray(valor) && valor.length === 0)) {
          nuevosErrores[pregunta.codigo] = 'Este campo es obligatorio';
          valido = false;
        }
      }

      // Validar longitud mínima/máxima para texto
      if (pregunta.tipo_pregunta === 'RESPUESTA_TEXTO' || pregunta.tipo_pregunta === 'RESPUESTA_LARGA') {
        if (valor && pregunta.min_caracteres && valor.length < pregunta.min_caracteres) {
          nuevosErrores[pregunta.codigo] = `Mínimo ${pregunta.min_caracteres} caracteres`;
          valido = false;
        }
        if (valor && pregunta.max_caracteres && valor.length > pregunta.max_caracteres) {
          nuevosErrores[pregunta.codigo] = `Máximo ${pregunta.max_caracteres} caracteres`;
          valido = false;
        }
      }
    });

    setErrores(nuevosErrores);
    return valido;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarRespuestas()) {
      return;
    }

    try {
      await ejecutar(instanciaId, etapa.id!, respuestas);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Error manejado por el hook
    }
  };

  // Manejar cambio de respuesta
  const handleRespuestaChange = (codigo: string, valor: any) => {
    setRespuestas((prev) => ({
      ...prev,
      [codigo]: valor,
    }));

    // Limpiar error del campo
    if (errores[codigo]) {
      setErrores((prev) => {
        const nuevos = { ...prev };
        delete nuevos[codigo];
        return nuevos;
      });
    }
  };

  // Ordenar preguntas por orden
  const preguntasOrdenadas = [...(etapa.preguntas || [])].sort((a, b) => a.orden - b.orden);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Encabezado */}
          <Box>
            <Typography variant="h5" gutterBottom>
              {etapa.titulo_formulario || etapa.nombre}
            </Typography>
            {etapa.bajada_formulario && (
              <Typography variant="body2" color="text.secondary" paragraph>
                {etapa.bajada_formulario}
              </Typography>
            )}
          </Box>

          <Divider />

          {/* Error de ejecución */}
          {executionError && (
            <Alert severity="error">{executionError}</Alert>
          )}

          {/* Preguntas del formulario */}
          {preguntasOrdenadas.map((pregunta) => (
            <Box key={pregunta.codigo}>
              <RenderPregunta
                pregunta={pregunta}
                value={respuestas[pregunta.codigo]}
                onChange={(valor) => handleRespuestaChange(pregunta.codigo, valor)}
                error={errores[pregunta.codigo]}
              />
            </Box>
          ))}

          {/* Botones de acción */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            {onCancel && (
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Completar etapa'}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
};
