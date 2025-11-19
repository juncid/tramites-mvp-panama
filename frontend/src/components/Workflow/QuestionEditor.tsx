import React, { useState } from 'react';
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
  IconButton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
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
import type { WorkflowPregunta, TipoPregunta } from '../../types/workflow';

// ============================================================================
// TIPOS DE PREGUNTA CON ICONOS
// ============================================================================
const TIPOS_PREGUNTA: { value: TipoPregunta; label: string }[] = [
  { value: 'RESPUESTA_TEXTO', label: 'Respuesta de texto' },
  { value: 'LISTA', label: 'Lista' },
  { value: 'OPCIONES', label: 'Opciones' },
  { value: 'CARGA_ARCHIVO', label: 'Carga de archivos' },
  { value: 'DESCARGA_ARCHIVO', label: 'Descarga de archivos' },
  { value: 'DATOS_CASO', label: 'Data del caso' },
  { value: 'REVISION_MANUAL_DOCUMENTOS', label: 'Revisión manual de documentos' },
  { value: 'REVISION_OCR', label: 'Revisión OCR por parte del sistema' },
  { value: 'SELECCION_FECHA', label: 'Selección de fecha' },
  { value: 'IMPRESION', label: 'Impresión' },
];

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
// PROPS
// ============================================================================
interface QuestionEditorProps {
  tempPregunta: WorkflowPregunta;
  error: string | null;
  editingIndex: number | null;
  preguntasExistentes: WorkflowPregunta[];
  onFieldChange: (field: keyof WorkflowPregunta, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================
export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  tempPregunta,
  error,
  editingIndex,
  preguntasExistentes,
  onFieldChange,
  onSave,
  onCancel,
}) => {
  const [newListItem, setNewListItem] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const handleFieldChange = (field: keyof WorkflowPregunta, value: any) => {
    onFieldChange(field, value);
  };

  return (
    <Box
      sx={{
        p: 2,
        pb: 7.5,
        pt: 2,
        border: '2px dashed #333333',
        borderRadius: 1,
        bgcolor: 'transparent',
      }}
    >
      <Stack spacing={2.5}>
        {/* Tipo de Pregunta Selector */}
        <FormControl fullWidth size="small" error={!!error}>
          <InputLabel>Tipo de pregunta</InputLabel>
          <Select
            value={tempPregunta.tipo === ('SELECCIONAR' as any) ? 'SELECCIONAR' : (tempPregunta.tipo || 'SELECCIONAR')}
            label="Tipo de pregunta"
            onChange={(e) => handleFieldChange('tipo', e.target.value as TipoPregunta)}
            renderValue={(selected) => {
              if (selected === 'SELECCIONAR') {
                return <Box sx={{ color: '#4d4d4d' }}>Seleccionar</Box>;
              }
              const tipo = TIPOS_PREGUNTA.find(t => t.value === selected);
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #333333',
                      borderRadius: '4px',
                      p: 0.5,
                    }}
                  >
                    {getTipoPreguntaIcon(selected as TipoPregunta)}
                  </Box>
                  {tipo?.label || selected}
                </Box>
              );
            }}
          >
            <MenuItem value="SELECCIONAR" disabled>
              <Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>Seleccionar</Box>
            </MenuItem>
            {TIPOS_PREGUNTA.map((tipo) => (
              <MenuItem key={tipo.value} value={tipo.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #333333',
                      borderRadius: '4px',
                      p: 0.5,
                    }}
                  >
                    {getTipoPreguntaIcon(tipo.value)}
                  </Box>
                  {tipo.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
          {error && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
              {error}
            </Typography>
          )}
        </FormControl>

        {/* Conditional Fields Based on Tipo */}
        {tempPregunta.tipo && (tempPregunta.tipo as any) !== 'SELECCIONAR' && (
          <>
            {/* Common Fields - Pregunta TextField (hidden for specific types) */}
            {(tempPregunta.tipo !== 'REVISION_OCR' &&
              tempPregunta.tipo !== 'DATOS_CASO' &&
              tempPregunta.tipo !== 'DESCARGA_ARCHIVO' &&
              tempPregunta.tipo !== 'CARGA_ARCHIVO') && (
              <TextField
                fullWidth
                size="small"
                label="Pregunta"
                value={tempPregunta.texto}
                onChange={(e) => handleFieldChange('texto', e.target.value)}
              />
            )}

            {/* Common Fields - Obligatoria Checkbox (hidden for specific types) */}
            {(tempPregunta.tipo !== 'REVISION_OCR' &&
              tempPregunta.tipo !== 'DATOS_CASO' &&
              tempPregunta.tipo !== 'DESCARGA_ARCHIVO' &&
              tempPregunta.tipo !== 'CARGA_ARCHIVO') && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tempPregunta.es_obligatoria || false}
                    onChange={(e) => handleFieldChange('es_obligatoria', e.target.checked)}
                    size="small"
                  />
                }
                label="Obligatoria"
              />
            )}

            {/* Type-Specific Fields */}
            {(tempPregunta.tipo === 'RESPUESTA_TEXTO' || tempPregunta.tipo === 'RESPUESTA_LARGA') && (
              <FormControl fullWidth size="small">
                <InputLabel>Número máximo de caracteres</InputLabel>
                <Select
                  value={tempPregunta.max_caracteres || ''}
                  onChange={(e) =>
                    handleFieldChange('max_caracteres', e.target.value ? parseInt(e.target.value as string) : undefined)
                  }
                  label="Número máximo de caracteres"
                >
                  <MenuItem value="">Sin límite</MenuItem>
                  <MenuItem value={500}>500</MenuItem>
                  <MenuItem value={1000}>1000</MenuItem>
                  <MenuItem value={2000}>2000</MenuItem>
                  <MenuItem value={5000}>5000</MenuItem>
                </Select>
              </FormControl>
            )}

            {/* LISTA Type */}
            {tempPregunta.tipo === 'LISTA' && (
              <ListEditor
                lista={tempPregunta.lista_elementos || []}
                newListItem={newListItem}
                setNewListItem={setNewListItem}
                onListChange={(newLista) => handleFieldChange('lista_elementos', newLista)}
              />
            )}

            {/* OPCIONES Type */}
            {tempPregunta.tipo === 'OPCIONES' && (
              <OpcionesEditor
                opciones={tempPregunta.lista_elementos || []}
                permiteMultiple={tempPregunta.permite_multiple || false}
                onOpcionesChange={(newOpciones) => handleFieldChange('lista_elementos', newOpciones)}
                onPermiteMultipleChange={(value) => handleFieldChange('permite_multiple', value)}
              />
            )}

            {/* CARGA_ARCHIVO Type */}
            {tempPregunta.tipo === 'CARGA_ARCHIVO' && (
              <CargaArchivoEditor
                pregunta={tempPregunta}
                uploadedFileName={uploadedFileName}
                setUploadedFileName={setUploadedFileName}
                onFieldChange={handleFieldChange}
              />
            )}

            {/* DESCARGA_ARCHIVO Type */}
            {tempPregunta.tipo === 'DESCARGA_ARCHIVO' && (
              <DescargaArchivoEditor
                pregunta={tempPregunta}
                uploadedFileName={uploadedFileName}
                setUploadedFileName={setUploadedFileName}
                onFieldChange={handleFieldChange}
              />
            )}

            {/* DATOS_CASO Type */}
            {tempPregunta.tipo === 'DATOS_CASO' && (
              <DatosCasoEditor pregunta={tempPregunta} onFieldChange={handleFieldChange} />
            )}

            {/* REVISION_OCR Type */}
            {tempPregunta.tipo === 'REVISION_OCR' && (
              <RevisionOCREditor
                pregunta={tempPregunta}
                preguntasExistentes={preguntasExistentes}
                onFieldChange={handleFieldChange}
              />
            )}

            {/* REVISION_MANUAL_DOCUMENTOS Type */}
            {tempPregunta.tipo === 'REVISION_MANUAL_DOCUMENTOS' && (
              <RevisionManualEditor
                pregunta={tempPregunta}
                preguntasExistentes={preguntasExistentes}
                onFieldChange={handleFieldChange}
              />
            )}

            {/* SELECCION_FECHA Type */}
            {tempPregunta.tipo === 'SELECCION_FECHA' && (
              <SeleccionFechaEditor pregunta={tempPregunta} onFieldChange={handleFieldChange} />
            )}
          </>
        )}

        {/* Action Buttons */}
        <Stack direction="row" spacing={3} justifyContent="flex-start">
          <Button
            variant="outlined"
            size="small"
            onClick={onCancel}
            sx={{
              color: '#0e5fa6',
              borderColor: '#0e5fa6',
              textTransform: 'none',
              width: '124px',
              px: 2,
              py: 1,
              fontSize: '16px',
              lineHeight: '24px',
              fontFamily: 'Roboto',
              fontWeight: 400,
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={onSave}
            sx={{
              bgcolor: '#0e5fa6',
              textTransform: 'none',
              width: '124px',
              px: 2,
              py: 1,
              fontSize: '16px',
              lineHeight: '24px',
              fontFamily: 'Roboto',
              fontWeight: 400,
              '&:hover': {
                bgcolor: '#0d5494',
              },
            }}
          >
            {editingIndex === -1 ? 'Añadir' : 'Guardar'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

// ============================================================================
// SUB-EDITORS (Type-specific components)
// ============================================================================

const ListEditor: React.FC<{
  lista: string[];
  newListItem: string;
  setNewListItem: (value: string) => void;
  onListChange: (lista: string[]) => void;
}> = ({ lista, newListItem, setNewListItem, onListChange }) => (
  <Box>
    <Stack spacing={1.25}>
      {lista.map((item, idx) => (
        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox size="small" disabled />
          <TextField
            fullWidth
            size="small"
            value={item}
            onChange={(e) => {
              const newItems = [...lista];
              newItems[idx] = e.target.value;
              onListChange(newItems);
            }}
            placeholder="Elemento de la lista"
            InputProps={{
              endAdornment: (
                <IconButton
                  size="small"
                  onClick={() => onListChange(lista.filter((_, i) => i !== idx))}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              ),
            }}
          />
        </Box>
      ))}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Checkbox size="small" disabled />
        <TextField
          fullWidth
          size="small"
          placeholder="Agregar elemento"
          value={newListItem}
          onChange={(e) => setNewListItem(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && newListItem.trim()) {
              onListChange([...lista, newListItem.trim()]);
              setNewListItem('');
            }
          }}
          InputProps={{
            endAdornment: (
              <IconButton
                size="small"
                onClick={() => {
                  if (newListItem.trim()) {
                    onListChange([...lista, newListItem.trim()]);
                    setNewListItem('');
                  }
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            ),
          }}
        />
      </Box>
    </Stack>
  </Box>
);

const OpcionesEditor: React.FC<{
  opciones: string[];
  permiteMultiple: boolean;
  onOpcionesChange: (opciones: string[]) => void;
  onPermiteMultipleChange: (value: boolean) => void;
}> = ({ opciones, permiteMultiple, onOpcionesChange, onPermiteMultipleChange }) => (
  <Box>
    <FormControlLabel
      control={
        <Checkbox
          checked={permiteMultiple}
          onChange={(e) => onPermiteMultipleChange(e.target.checked)}
          size="small"
        />
      }
      label="Permitir selección múltiple"
      sx={{ mb: 2 }}
    />

    {opciones.map((opcion, index) => (
      <TextField
        key={index}
        fullWidth
        size="small"
        label={`Opción ${index + 1}`}
        value={opcion}
        onChange={(e) => {
          const newOpciones = [...opciones];
          newOpciones[index] = e.target.value;
          onOpcionesChange(newOpciones);
        }}
        sx={{ mb: 1 }}
        InputProps={{
          endAdornment: (
            <IconButton
              size="small"
              onClick={() => onOpcionesChange(opciones.filter((_, i) => i !== index))}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          ),
        }}
      />
    ))}

    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        bgcolor: '#0e5fa6',
        color: 'white',
        px: 0.5,
        py: 0.25,
        borderRadius: '2px',
        width: 'fit-content',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: '#0d5494',
        },
      }}
      onClick={() => onOpcionesChange([...opciones, ''])}
    >
      <AddIcon sx={{ fontSize: 16 }} />
      <Typography variant="body2">Añadir opción</Typography>
    </Box>
  </Box>
);

const CargaArchivoEditor: React.FC<{
  pregunta: WorkflowPregunta;
  uploadedFileName: string;
  setUploadedFileName: (name: string) => void;
  onFieldChange: (field: keyof WorkflowPregunta, value: any) => void;
}> = ({ pregunta, uploadedFileName, setUploadedFileName, onFieldChange }) => (
  <Box>
    <TextField
      fullWidth
      size="small"
      label="Pregunta"
      value={pregunta.texto}
      onChange={(e) => onFieldChange('texto', e.target.value)}
      placeholder="Documento antecedentes ..."
      sx={{ mb: 1 }}
    />

    <FormControlLabel
      control={
        <Checkbox
          checked={pregunta.es_obligatoria || false}
          onChange={(e) => onFieldChange('es_obligatoria', e.target.checked)}
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
        onChange={(e) => onFieldChange('ayuda', e.target.value)}
        placeholder="Documento apostillado lorem ipsum"
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2, mt: 0.5, fontSize: '14px', fontWeight: 300 }}>
        (Opcional), indicaciones para la persona que responda la pregunta
      </Typography>
    </Box>

    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
      <InputLabel>Número máximo de archivos</InputLabel>
      <Select
        value={pregunta.max_archivos || 1}
        label="Número máximo de archivos"
        onChange={(e) => onFieldChange('max_archivos', e.target.value as number)}
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
        onChange={(e) => onFieldChange('max_size_mb', e.target.value as number)}
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
              if (file) {
                setUploadedFileName(file.name);
              }
            }}
          />
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2, mt: 0.5, fontSize: '14px', fontWeight: 300 }}>
        (Opcional), indicaciones para la persona que responda la pregunta
      </Typography>
    </Box>
  </Box>
);

const DescargaArchivoEditor: React.FC<{
  pregunta: WorkflowPregunta;
  uploadedFileName: string;
  setUploadedFileName: (name: string) => void;
  onFieldChange: (field: keyof WorkflowPregunta, value: any) => void;
}> = ({ pregunta, uploadedFileName, setUploadedFileName, onFieldChange }) => (
  <Box>
    <TextField
      fullWidth
      size="small"
      label="Pregunta"
      value={pregunta.texto}
      onChange={(e) => onFieldChange('texto', e.target.value)}
      placeholder="Lorem ipsum"
      sx={{ mb: 2 }}
    />

    <FormControlLabel
      control={
        <Checkbox
          checked={pregunta.es_obligatoria || false}
          onChange={(e) => onFieldChange('es_obligatoria', e.target.checked)}
          size="small"
        />
      }
      label="Obligatoria"
      sx={{ mb: 2 }}
    />

    <Box sx={{ mb: 2 }}>
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
            if (file) {
              setUploadedFileName(file.name);
            }
          }}
        />
      </Box>
    </Box>

    <TextField
      fullWidth
      size="small"
      label="Documento"
      value={uploadedFileName}
      placeholder=""
      disabled
    />
  </Box>
);

const DatosCasoEditor: React.FC<{
  pregunta: WorkflowPregunta;
  onFieldChange: (field: keyof WorkflowPregunta, value: any) => void;
}> = ({ pregunta, onFieldChange }) => (
  <Box>
    <TextField
      fullWidth
      size="small"
      label="Pregunta"
      value={pregunta.texto}
      onChange={(e) => onFieldChange('texto', e.target.value)}
      placeholder="Data a incluir:"
      sx={{ mb: 2 }}
    />

    <FormControlLabel
      control={
        <Checkbox
          checked={pregunta.es_obligatoria || false}
          onChange={(e) => onFieldChange('es_obligatoria', e.target.checked)}
          size="small"
        />
      }
      label="Obligatoria"
      sx={{ mb: 2 }}
    />

    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
      Seleccione los datos del caso a incluir:
    </Typography>

    <Stack spacing={1}>
      {[
        { value: 'REUEX', label: 'REUEX' },
        { value: 'NOMBRE', label: 'Nombre' },
        { value: 'NACIONALIDAD', label: 'Nacionalidad' },
        { value: 'TRAMITE', label: 'Tramite' },
        { value: 'PASAPORTE', label: 'Pasaporte' },
        { value: 'SEXO', label: 'Sexo' },
        { value: 'EXPEDIENTE', label: 'Nº de Expediente' },
        { value: 'FECHA_NACIMIENTO', label: 'Fecha de nacimiento' },
      ].map((campo) => (
        <FormControlLabel
          key={campo.value}
          control={
            <Checkbox
              size="small"
              checked={(pregunta.campos_caso || []).includes(campo.value)}
              onChange={(e) => {
                const currentCampos = pregunta.campos_caso || [];
                const newCampos = e.target.checked
                  ? [...currentCampos, campo.value]
                  : currentCampos.filter((c) => c !== campo.value);
                onFieldChange('campos_caso', newCampos);
              }}
            />
          }
          label={campo.label}
        />
      ))}
    </Stack>
  </Box>
);

const RevisionOCREditor: React.FC<{
  pregunta: WorkflowPregunta;
  preguntasExistentes: WorkflowPregunta[];
  onFieldChange: (field: keyof WorkflowPregunta, value: any) => void;
}> = ({ pregunta, preguntasExistentes, onFieldChange }) => (
  <Box>
    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
      <InputLabel>Etapa origen de documentos</InputLabel>
      <Select
        value={pregunta.etapa_origen_id || ''}
        label="Etapa origen de documentos"
        onChange={(e) => onFieldChange('etapa_origen_id', e.target.value)}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return (
              <Typography sx={{ color: '#4d4d4d', fontSize: '16px' }}>
                Recolectar requisitos del trámite PPSH y los anexo en el sistema
              </Typography>
            );
          }
          const p = preguntasExistentes.find((pr) => pr.codigo === selected);
          return p?.texto || selected;
        }}
      >
        {preguntasExistentes
          .filter((p) => p.tipo === 'CARGA_ARCHIVO')
          .map((p, idx) => (
            <MenuItem key={idx} value={p.codigo}>
              {p.texto}
            </MenuItem>
          ))}
        {preguntasExistentes.filter((p) => p.tipo === 'CARGA_ARCHIVO').length === 0 && (
          <MenuItem value="" disabled>
            <em>No hay etapas de carga de archivos disponibles</em>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  </Box>
);

const RevisionManualEditor: React.FC<{
  pregunta: WorkflowPregunta;
  preguntasExistentes: WorkflowPregunta[];
  onFieldChange: (field: keyof WorkflowPregunta, value: any) => void;
}> = ({ pregunta, preguntasExistentes, onFieldChange }) => (
  <Box>
    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
      <InputLabel>Etapa origen de documentos</InputLabel>
      <Select
        value={pregunta.etapa_origen_id || ''}
        label="Etapa origen de documentos"
        onChange={(e) => onFieldChange('etapa_origen_id', e.target.value)}
      >
        {preguntasExistentes
          .filter((p) => p.tipo === 'CARGA_ARCHIVO' || p.tipo === 'REVISION_OCR')
          .map((p, idx) => (
            <MenuItem key={idx} value={p.codigo}>
              {p.texto}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  </Box>
);

const SeleccionFechaEditor: React.FC<{
  pregunta: WorkflowPregunta;
  onFieldChange: (field: keyof WorkflowPregunta, value: any) => void;
}> = ({ pregunta, onFieldChange }) => (
  <Box>
    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
      <InputLabel>Origen agenda selección de fechas</InputLabel>
      <Select
        value={pregunta.agenda_origen_id || ''}
        label="Origen agenda selección de fechas"
        onChange={(e) => onFieldChange('agenda_origen_id', e.target.value)}
      >
        <MenuItem value="AGENDA_PPSH">Agenda PPSH</MenuItem>
        <MenuItem value="AGENDA_GENERAL">Agenda General</MenuItem>
      </Select>
    </FormControl>
  </Box>
);
