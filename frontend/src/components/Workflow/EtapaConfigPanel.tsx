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
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  TextFields as TextIcon,
  Numbers as NumberIcon,
  CalendarToday as DateIcon,
  RadioButtonChecked as RadioIcon,
  CheckBox as CheckBoxIcon,
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  TableChart as DataTableIcon,
  FindInPage as DocumentSearchIcon,
  DocumentScanner as ScannerIcon,
  Print as PrintIcon,
  Draw as SignatureIcon,
  Payment as PaymentIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';
import type { WorkflowEtapa, WorkflowPregunta, TipoEtapa, TipoPregunta } from '../../types/workflow';
import { usePreguntasManager } from '../../hooks/usePreguntasManager';
import { QuestionEditor } from './QuestionEditor';

// ============================================================================
// INTERFACES
// ============================================================================
interface EtapaConfigPanelProps {
  etapa: Partial<WorkflowEtapa>;
  onSave: (etapa: Partial<WorkflowEtapa>) => void;
  onClose: () => void;
  onDelete?: () => void;
  hideCloseButton?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================
const PERFILES_DISPONIBLES = [
  'Ciudadano',
  'Abogado',
  'Funcionario',
  'Recepcionista',
  'Folio',
  'Jefatura',
  'Sistema',
  'Supervisor',
  'Administrador',
];

// ============================================================================
// HELPER: Get icon for question type
// ============================================================================
const getTipoPreguntaIcon = (tipo: TipoPregunta | 'SELECCIONAR' | string) => {
  switch (tipo) {
    case 'RESPUESTA_TEXTO':
    case 'RESPUESTA_LARGA':
      return <TextIcon />;
    case 'LISTA':
      return <CheckBoxIcon />;
    case 'OPCIONES':
      return <RadioIcon />;
    case 'CARGA_ARCHIVO':
      return <UploadIcon />;
    case 'DESCARGA_ARCHIVO':
      return <DownloadIcon />;
    case 'DATOS_CASO':
      return <DataTableIcon />;
    case 'REVISION_MANUAL_DOCUMENTOS':
      return <DocumentSearchIcon />;
    case 'REVISION_OCR':
      return <ScannerIcon />;
    case 'SELECCION_FECHA':
      return <DateIcon />;
    case 'IMPRESION':
      return <PrintIcon />;
    case 'NUMERO':
      return <NumberIcon />;
    case 'SELECCION_MULTIPLE':
      return <CheckBoxIcon />;
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const EtapaConfigPanel: React.FC<EtapaConfigPanelProps> = ({
  etapa,
  onSave,
  onClose,
  onDelete,
  hideCloseButton = false,
}) => {
  // ===== Estado para configuración de etapa (campos de nivel superior) =====
  const [formData, setFormData] = useState<Partial<WorkflowEtapa>>(etapa);

  // ===== Estado de preguntas usando custom hook con useReducer =====
  const {
    state: { preguntas, editingIndex, tempPregunta, error: preguntaError },
    actions: { addNew, editExisting, updateTempField, saveTemp, cancelEdit, deletePregunta, duplicatePregunta, setPreguntas },
  } = usePreguntasManager(etapa.preguntas || []);

  // ===== Sync cuando cambia la etapa externa =====
  useEffect(() => {
    setFormData(etapa);
    setPreguntas(etapa.preguntas || []);
  }, [etapa, setPreguntas]);

  // ===== Handlers para campos de nivel superior =====
  const handleChange = (field: keyof WorkflowEtapa, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePerfilesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    handleChange('perfiles_permitidos', typeof value === 'string' ? value.split(',') : value);
  };

  const handleSave = () => {
    onSave({
      ...formData,
      preguntas,
    });
  };

  // ===== Render =====
  return (
    <Box
      sx={{
        width: 611,
        height: '100%',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: 1,
        borderColor: 'divider',
        position: 'relative',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">Configurar Etapa</Typography>
        {!hideCloseButton && (
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
        }}
      >
        <Stack spacing={3}>
          {/* Configuración General de Etapa */}
          <Box>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Configuración general
            </Typography>

            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Nombre"
                size="small"
                value={formData.nombre || ''}
                onChange={(e) => handleChange('nombre', e.target.value)}
              />

              <TextField
                fullWidth
                label="Código"
                size="small"
                value={formData.codigo || ''}
                onChange={(e) => handleChange('codigo', e.target.value)}
                helperText="Identificador único de la etapa"
              />

              <FormControl fullWidth size="small">
                <InputLabel>Tipo de Etapa</InputLabel>
                <Select
                  value={formData.tipo_etapa || 'FORMULARIO'}
                  label="Tipo de Etapa"
                  onChange={(e) => handleChange('tipo_etapa', e.target.value as TipoEtapa)}
                >
                  <MenuItem value="FORMULARIO">Formulario</MenuItem>
                  <MenuItem value="SISTEMA">Sistema</MenuItem>
                  <MenuItem value="DECISION">Decisión</MenuItem>
                  <MenuItem value="TERMINO">Término</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Perfiles Permitidos</InputLabel>
                <Select
                  multiple
                  value={formData.perfiles_permitidos || []}
                  onChange={handlePerfilesChange}
                  input={<OutlinedInput label="Perfiles Permitidos" />}
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

              <TextField
                fullWidth
                label="Descripción"
                size="small"
                multiline
                rows={3}
                value={formData.descripcion || ''}
                onChange={(e) => handleChange('descripcion', e.target.value)}
              />
            </Stack>
          </Box>

          <Divider />

          {/* Preguntas Section */}
          <Box>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Preguntas
            </Typography>

            <Stack spacing={2}>
              {/* Fase 1: Lista de preguntas existentes (cuando NO se está editando) */}
              {editingIndex === null && preguntas.length > 0 && (
                <Box>
                  {preguntas.map((pregunta, index) => (
                    <QuestionCard
                      key={index}
                      pregunta={pregunta}
                      index={index}
                      onEdit={() => editExisting(index, pregunta)}
                      onDelete={() => deletePregunta(index)}
                      onDuplicate={() => duplicatePregunta(index)}
                    />
                  ))}
                </Box>
              )}

              {/* Fase 2: Editor de pregunta (cuando sí se está editando) */}
              {editingIndex !== null && tempPregunta && (
                <QuestionEditor
                  tempPregunta={tempPregunta}
                  error={preguntaError}
                  editingIndex={editingIndex}
                  preguntasExistentes={preguntas}
                  onFieldChange={(field, value) => updateTempField(field, value)}
                  onSave={() => saveTemp()}
                  onCancel={() => cancelEdit()}
                />
              )}

              {/* Fase 3: Botón para agregar nueva pregunta (solo cuando no se está editando) */}
              {editingIndex === null && (
                <Box
                  onClick={() => addNew()}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    border: '2px dashed #333333',
                    borderRadius: 1,
                    cursor: 'pointer',
                    bgcolor: 'transparent',
                    '&:hover': {
                      bgcolor: '#fafafa',
                    },
                  }}
                >
                  <AddIcon sx={{ fontSize: 40, color: '#333333' }} />
                </Box>
              )}

              {/* Mensaje cuando no hay preguntas */}
              {preguntas.length === 0 && editingIndex === null && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                  No hay preguntas configuradas. Haz clic en + para agregar una.
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
              <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={onDelete}>
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

// ============================================================================
// SUB-COMPONENT: QuestionCard
// ============================================================================
interface QuestionCardProps {
  pregunta: WorkflowPregunta;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ pregunta, onEdit, onDelete, onDuplicate }) => {
  return (
    <Box
      sx={{
        p: 2,
        mb: 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.default',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #333333',
                borderRadius: '4px',
                p: 0.5,
              }}
            >
              {getTipoPreguntaIcon(pregunta.tipo)}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {pregunta.tipo}
            </Typography>
          </Stack>
          <Typography variant="body1" fontWeight="medium">
            {pregunta.texto || pregunta.pregunta || '(Sin pregunta)'}
          </Typography>
          {pregunta.es_obligatoria && (
            <Chip label="Obligatoria" size="small" color="primary" sx={{ mt: 1 }} />
          )}
        </Box>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={onEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onDuplicate}>
            <AddIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onDelete} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
};
