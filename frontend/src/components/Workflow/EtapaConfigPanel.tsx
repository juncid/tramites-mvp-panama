import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Divider,
  OutlinedInput,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  TextFields as TextIcon,
  Numbers as NumberIcon,
  CalendarToday as DateIcon,
  RadioButtonChecked as RadioIcon,
  CheckBox as CheckBoxIcon,
  List as ListIcon,
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  Folder as FolderIcon,
  DocumentScanner as ScannerIcon,
  Print as PrintIcon,
  Draw as SignatureIcon,
  Payment as PaymentIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';
import type { WorkflowEtapa, WorkflowPregunta, TipoEtapa, TipoPregunta } from '../../types/workflow';

interface EtapaConfigPanelProps {
  etapa: Partial<WorkflowEtapa>;
  onSave: (etapa: Partial<WorkflowEtapa>) => void;
  onClose: () => void;
  onDelete?: () => void;
}

const PERFILES_DISPONIBLES = [
  'Ciudadano',
  'Abogado',
  'Funcionario',
  'Sistema',
  'Supervisor',
  'Administrador',
];

const TIPOS_PREGUNTA: { value: TipoPregunta; label: string }[] = [
  { value: 'TEXTO', label: 'Respuesta de texto' },
  { value: 'NUMERO', label: 'Número' },
  { value: 'FECHA', label: 'Selección de fecha' },
  { value: 'SELECCION_SIMPLE', label: 'Opciones (selección simple)' },
  { value: 'SELECCION_MULTIPLE', label: 'Opciones (selección múltiple)' },
  { value: 'LISTA', label: 'Lista' },
  { value: 'CARGA_ARCHIVO', label: 'Carga de archivos' },
  { value: 'DESCARGA_ARCHIVOS', label: 'Descarga de archivos' },
  { value: 'DATOS_CASO', label: 'Data del caso' },
  { value: 'REVISION_MANUAL_DOCUMENTOS', label: 'Revisión manual de documentos' },
  { value: 'REVISION_OCR', label: 'Revisión OCR' },
  { value: 'IMPRESION', label: 'Impresión' },
  { value: 'FIRMA_DIGITAL', label: 'Firma digital' },
  { value: 'PAGO', label: 'Pago' },
  { value: 'NOTIFICACION', label: 'Notificación' },
];

const getTipoPreguntaIcon = (tipo: TipoPregunta) => {
  switch (tipo) {
    case 'TEXTO':
      return <TextIcon />;
    case 'NUMERO':
      return <NumberIcon />;
    case 'FECHA':
    case 'SELECCION_FECHA':
      return <DateIcon />;
    case 'SELECCION_SIMPLE':
      return <RadioIcon />;
    case 'SELECCION_MULTIPLE':
      return <CheckBoxIcon />;
    case 'LISTA':
      return <ListIcon />;
    case 'CARGA_ARCHIVO':
      return <UploadIcon />;
    case 'DESCARGA_ARCHIVOS':
      return <DownloadIcon />;
    case 'DATOS_CASO':
      return <FolderIcon />;
    case 'REVISION_MANUAL_DOCUMENTOS':
      return <FolderIcon />;
    case 'REVISION_OCR':
      return <ScannerIcon />;
    case 'IMPRESION':
      return <PrintIcon />;
    case 'FIRMA_DIGITAL':
      return <SignatureIcon />;
    case 'PAGO':
      return <PaymentIcon />;
    case 'NOTIFICACION':
      return <NotificationIcon />;
    default:
      return <TextIcon />;
  }
};

export const EtapaConfigPanel: React.FC<EtapaConfigPanelProps> = ({
  etapa,
  onSave,
  onClose,
  onDelete,
}) => {
  const [formData, setFormData] = useState<Partial<WorkflowEtapa>>(etapa);
  const [preguntas, setPreguntas] = useState<WorkflowPregunta[]>(etapa.preguntas || []);

  useEffect(() => {
    setFormData(etapa);
    setPreguntas(etapa.preguntas || []);
  }, [etapa]);

  const handleChange = (field: keyof WorkflowEtapa, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePerfilesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    handleChange('perfiles_permitidos', typeof value === 'string' ? value.split(',') : value);
  };

  const handleAddPregunta = () => {
    const newPregunta: WorkflowPregunta = {
      codigo: `PREGUNTA_${preguntas.length + 1}`,
      texto: '',
      pregunta: '',
      tipo: 'TEXTO',
      tipo_pregunta: 'TEXTO',
      orden: preguntas.length,
      es_obligatoria: false,
      es_visible: true,
      activo: true,
    };
    setPreguntas([...preguntas, newPregunta]);
  };

  const handleDeletePregunta = (index: number) => {
    setPreguntas(preguntas.filter((_, i) => i !== index));
  };

  const handlePreguntaChange = (index: number, field: keyof WorkflowPregunta, value: any) => {
    const updated = [...preguntas];
    updated[index] = { ...updated[index], [field]: value };
    setPreguntas(updated);
  };

  const handleSave = () => {
    console.log('📝 EtapaConfigPanel - Guardando:', {
      formData,
      preguntas,
      datosCompletos: { ...formData, preguntas },
      cantidadPreguntas: preguntas.length
    });
    onSave({ ...formData, preguntas });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Configuración de Etapa</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <Stack spacing={3}>
          {/* Tipo de Etapa */}
          <FormControl fullWidth>
            <InputLabel>Tipo de etapa</InputLabel>
            <Select
              value={formData.tipo_etapa || 'ETAPA'}
              label="Tipo de etapa"
              onChange={(e) => handleChange('tipo_etapa', e.target.value as TipoEtapa)}
            >
              <MenuItem value="ETAPA">Etapa</MenuItem>
              <MenuItem value="COMPUERTA">Compuerta</MenuItem>
              <MenuItem value="SUBPROCESO">Subproceso</MenuItem>
            </Select>
          </FormControl>

          {/* Código */}
          <TextField
            fullWidth
            label="Código"
            value={formData.codigo || ''}
            onChange={(e) => handleChange('codigo', e.target.value)}
          />

          {/* Nombre */}
          <TextField
            fullWidth
            label="Nombre de la etapa/actividad"
            value={formData.nombre || ''}
            onChange={(e) => handleChange('nombre', e.target.value)}
          />

          {/* Perfiles Permitidos */}
          <FormControl fullWidth>
            <InputLabel>Perfil(es) permitidos</InputLabel>
            <Select
              multiple
              value={formData.perfiles_permitidos || []}
              onChange={handlePerfilesChange}
              input={<OutlinedInput label="Perfil(es) permitidos" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {PERFILES_DISPONIBLES.map((perfil) => (
                <MenuItem key={perfil} value={perfil}>
                  {perfil}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider />

          {/* Título del formulario */}
          <TextField
            fullWidth
            label="Título del formulario"
            value={formData.titulo_formulario || ''}
            onChange={(e) => handleChange('titulo_formulario', e.target.value)}
          />

          {/* Bajada del formulario */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Bajada del formulario"
            value={formData.descripcion_formulario || ''}
            onChange={(e) => handleChange('descripcion_formulario', e.target.value)}
          />

          <Divider />

          {/* Preguntas */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                Preguntas del Formulario
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddPregunta}
                variant="outlined"
              >
                Añadir
              </Button>
            </Stack>

            <Stack spacing={2}>
              {preguntas.map((pregunta, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                          }}
                        >
                          {getTipoPreguntaIcon(pregunta.tipo)}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Pregunta {index + 1}
                        </Typography>
                      </Stack>
                      <IconButton size="small" onClick={() => handleDeletePregunta(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>

                    <FormControl fullWidth size="small">
                      <InputLabel>Tipo de pregunta</InputLabel>
                      <Select
                        value={pregunta.tipo}
                        label="Tipo de pregunta"
                        onChange={(e) =>
                          handlePreguntaChange(index, 'tipo', e.target.value as TipoPregunta)
                        }
                      >
                        {TIPOS_PREGUNTA.map((tipo) => (
                          <MenuItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      size="small"
                      label="Texto de la pregunta"
                      value={pregunta.texto}
                      onChange={(e) => handlePreguntaChange(index, 'texto', e.target.value)}
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={pregunta.es_obligatoria}
                          onChange={(e) => handlePreguntaChange(index, 'es_obligatoria', e.target.checked)}
                          size="small"
                        />
                      }
                      label="Obligatoria"
                    />

                    <TextField
                      fullWidth
                      size="small"
                      label="Ayuda"
                      value={pregunta.ayuda || ''}
                      onChange={(e) => handlePreguntaChange(index, 'ayuda', e.target.value)}
                      placeholder="Texto de ayuda opcional"
                    />

                    {/* Campos específicos para CARGA_ARCHIVO */}
                    {pregunta.tipo === 'CARGA_ARCHIVO' && (
                      <>
                        <TextField
                          fullWidth
                          size="small"
                          label="Número máximo de archivos"
                          type="number"
                          defaultValue={1}
                          InputProps={{ inputProps: { min: 1, max: 10 } }}
                        />
                        <FormControl fullWidth size="small">
                          <InputLabel>Tamaño máximo</InputLabel>
                          <Select defaultValue="100MB" label="Tamaño máximo">
                            <MenuItem value="10MB">10MB</MenuItem>
                            <MenuItem value="50MB">50MB</MenuItem>
                            <MenuItem value="100MB">100MB</MenuItem>
                            <MenuItem value="500MB">500MB</MenuItem>
                          </Select>
                        </FormControl>
                      </>
                    )}
                  </Stack>
                </Box>
              ))}

              {preguntas.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                  No hay preguntas configuradas
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Box>
            {onDelete && !etapa.es_inicial && !etapa.es_etapa_inicial && (
              <Button 
                variant="outlined" 
                color="error"
                startIcon={<DeleteIcon />}
                onClick={onDelete}
              >
                Eliminar
              </Button>
            )}
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Guardar
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default EtapaConfigPanel;
