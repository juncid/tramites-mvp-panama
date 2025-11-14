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
  Tabs,
  Tab,
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
import { VistaConfiguratorPanel } from './VistaConfiguratorPanel';

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
  { value: 'LISTA', label: 'Lista' },
  { value: 'SELECCION_SIMPLE', label: 'Opciones' },
  { value: 'CARGA_ARCHIVO', label: 'Carga de archivos' },
  { value: 'DESCARGA_ARCHIVOS', label: 'Descarga de archivos' },
  { value: 'DATOS_CASO', label: 'Data del caso' },
  { value: 'REVISION_MANUAL_DOCUMENTOS', label: 'Revisión manual de documentos' },
  { value: 'REVISION_OCR', label: 'Revisión OCR por parte del sistema' },
  { value: 'FECHA', label: 'Selección de fecha' },
  { value: 'IMPRESION', label: 'Impresión' },
];

const getTipoPreguntaIcon = (tipo: TipoPregunta) => {
  switch (tipo) {
    case 'TEXTO':
      return <TextIcon />;
    case 'LISTA':
      return <CheckBoxIcon />;
    case 'SELECCION_SIMPLE':
      return <RadioIcon />;
    case 'CARGA_ARCHIVO':
      return <UploadIcon />;
    case 'DESCARGA_ARCHIVOS':
      return <DownloadIcon />;
    case 'DATOS_CASO':
      return <DataTableIcon />;
    case 'REVISION_MANUAL_DOCUMENTOS':
      return <DocumentSearchIcon />;
    case 'REVISION_OCR':
      return <ScannerIcon />;
    case 'FECHA':
    case 'SELECCION_FECHA':
      return <DateIcon />;
    case 'IMPRESION':
      return <PrintIcon />;
    // Tipos legacy que pueden estar en BD
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      style={{ height: value === index ? '100%' : '0' }}
    >
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </div>
  );
};

export const EtapaConfigPanel: React.FC<EtapaConfigPanelProps> = ({
  etapa,
  onSave,
  onClose,
  onDelete,
}) => {
  const [formData, setFormData] = useState<Partial<WorkflowEtapa>>(etapa);
  const [preguntas, setPreguntas] = useState<WorkflowPregunta[]>(etapa.preguntas || []);
  const [tabIndex, setTabIndex] = useState(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // null = no editing, -1 = new question, >= 0 = editing existing
  const [tempPregunta, setTempPregunta] = useState<WorkflowPregunta | null>(null);
  const [newListItem, setNewListItem] = useState<string>('');

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
    setTempPregunta(newPregunta);
    setEditingIndex(-1); // -1 indicates new question
  };

  const handleEditPregunta = (index: number) => {
    setTempPregunta({ ...preguntas[index] });
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setTempPregunta(null);
    setEditingIndex(null);
  };

  const handleConfirmPregunta = () => {
    if (!tempPregunta) return;

    if (editingIndex === -1) {
      // Adding new question
      setPreguntas([...preguntas, tempPregunta]);
    } else if (editingIndex !== null) {
      // Editing existing question
      const updated = [...preguntas];
      updated[editingIndex] = tempPregunta;
      setPreguntas(updated);
    }

    setTempPregunta(null);
    setEditingIndex(null);
  };

  const handleDuplicatePregunta = (index: number) => {
    const duplicated = { ...preguntas[index], codigo: `PREGUNTA_${preguntas.length + 1}`, orden: preguntas.length };
    setPreguntas([...preguntas, duplicated]);
  };

  const handleDeletePregunta = (index: number) => {
    setPreguntas(preguntas.filter((_, i) => i !== index));
  };

  const handlePreguntaChange = (field: string, value: any) => {
    if (!tempPregunta) return;
    setTempPregunta({ ...tempPregunta, [field]: value });
    
    // Sync 'texto' with 'pregunta' field
    if (field === 'texto') {
      setTempPregunta((prev) => prev ? { ...prev, texto: value, pregunta: value } : null);
    } else if (field === 'pregunta') {
      setTempPregunta((prev) => prev ? { ...prev, pregunta: value, texto: value } : null);
    }
    
    // Sync 'tipo' with 'tipo_pregunta' field
    if (field === 'tipo') {
      setTempPregunta((prev) => prev ? { ...prev, tipo: value as TipoPregunta, tipo_pregunta: value as TipoPregunta } : null);
    } else if (field === 'tipo_pregunta') {
      setTempPregunta((prev) => prev ? { ...prev, tipo_pregunta: value as TipoPregunta, tipo: value as TipoPregunta } : null);
    }
  };

  const handleSave = () => {
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

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={(_, newValue) => setTabIndex(newValue)}>
          <Tab label="Configuración Básica" />
          <Tab label="Preguntas Tradicionales" />
          <Tab label="Vista Dinámica" />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* TAB 0: Configuración Básica */}
        <TabPanel value={tabIndex} index={0}>
          <Box sx={{ p: 2 }}>
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
            </Stack>
          </Box>
        </TabPanel>

        {/* TAB 1: Preguntas Tradicionales */}
        <TabPanel value={tabIndex} index={1}>
          <Box sx={{ p: 2 }}>
            <Stack spacing={3}>
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
              {/* Fase 1: Tarjetas compactas para preguntas guardadas */}
              {preguntas.filter((_, idx) => editingIndex !== idx).map((pregunta, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    border: '2px solid #333333',
                    borderRadius: 1,
                    bgcolor: 'white',
                  }}
                >
                  {/* Icono del tipo */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 32,
                      height: 32,
                      color: '#333333',
                    }}
                  >
                    {getTipoPreguntaIcon(pregunta.tipo)}
                  </Box>

                  {/* Texto de la pregunta */}
                  <Typography
                    sx={{
                      flex: 1,
                      fontSize: '14px',
                      color: '#333333',
                    }}
                  >
                    {pregunta.texto}
                  </Typography>

                  {/* Checkbox obligatoria */}
                  <Checkbox
                    checked={pregunta.es_obligatoria}
                    disabled
                    size="small"
                    sx={{ color: '#333333' }}
                  />

                  {/* Botones de acción */}
                  <Button
                    size="small"
                    onClick={() => handleDuplicatePregunta(index)}
                    sx={{
                      minWidth: 'auto',
                      px: 1,
                      color: '#333333',
                      textTransform: 'none',
                      fontSize: '13px',
                    }}
                  >
                    Duplicar
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditPregunta(index)}
                    sx={{
                      minWidth: 'auto',
                      px: 1,
                      color: '#333333',
                      textTransform: 'none',
                      fontSize: '13px',
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    size="small"
                    onClick={() => handleDeletePregunta(index)}
                    sx={{
                      minWidth: 'auto',
                      px: 1,
                      color: '#cc3333',
                      textTransform: 'none',
                      fontSize: '13px',
                    }}
                  >
                    Borrar
                  </Button>
                </Box>
              ))}

              {/* Fase 2: Formulario de edición (cuando editingIndex !== null) */}
              {editingIndex !== null && tempPregunta && (
                <Box
                  sx={{
                    p: 2,
                    border: '2px dashed #333333',
                    borderRadius: 1,
                    bgcolor: '#fafafa',
                  }}
                >
                  <Stack spacing={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tipo de pregunta</InputLabel>
                      <Select
                        value={tempPregunta.tipo}
                        label="Tipo de pregunta"
                        onChange={(e) => handlePreguntaChange('tipo', e.target.value as TipoPregunta)}
                      >
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
                    </FormControl>

                    <TextField
                      fullWidth
                      size="small"
                      label="Texto de la pregunta"
                      value={tempPregunta.texto}
                      onChange={(e) => handlePreguntaChange('texto', e.target.value)}
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={tempPregunta.es_obligatoria}
                          onChange={(e) => handlePreguntaChange('es_obligatoria', e.target.checked)}
                          size="small"
                        />
                      }
                      label="Obligatoria"
                    />

                    <TextField
                      fullWidth
                      size="small"
                      label="Ayuda"
                      value={tempPregunta.ayuda || ''}
                      onChange={(e) => handlePreguntaChange('ayuda', e.target.value)}
                      placeholder="Texto de ayuda opcional"
                    />

                    {/* Campos específicos según tipo de pregunta */}
                    
                    {/* TEXTO */}
                    {tempPregunta.tipo === 'TEXTO' && (
                      <>
                        <TextField
                          fullWidth
                          size="small"
                          label="Número mínimo de caracteres"
                          type="number"
                          value={tempPregunta.min_caracteres || ''}
                          onChange={(e) => handlePreguntaChange('min_caracteres', e.target.value ? parseInt(e.target.value) : undefined)}
                          InputProps={{ inputProps: { min: 0 } }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Número máximo de caracteres"
                          type="number"
                          value={tempPregunta.max_caracteres || ''}
                          onChange={(e) => handlePreguntaChange('max_caracteres', e.target.value ? parseInt(e.target.value) : undefined)}
                          InputProps={{ inputProps: { min: 1 } }}
                        />
                      </>
                    )}

                    {/* LISTA */}
                    {tempPregunta.tipo === 'LISTA' && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Elementos de la lista
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Agregar elemento"
                            value={newListItem}
                            onChange={(e) => setNewListItem(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && newListItem.trim()) {
                                const currentItems = tempPregunta.lista_elementos || [];
                                handlePreguntaChange('lista_elementos', [...currentItems, newListItem.trim()]);
                                setNewListItem('');
                              }
                            }}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              if (newListItem.trim()) {
                                const currentItems = tempPregunta.lista_elementos || [];
                                handlePreguntaChange('lista_elementos', [...currentItems, newListItem.trim()]);
                                setNewListItem('');
                              }
                            }}
                            sx={{ minWidth: 'auto', px: 2 }}
                          >
                            <AddIcon />
                          </Button>
                        </Stack>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(tempPregunta.lista_elementos || []).map((item, idx) => (
                            <Chip
                              key={idx}
                              label={item}
                              onDelete={() => {
                                const currentItems = tempPregunta.lista_elementos || [];
                                handlePreguntaChange(
                                  'lista_elementos',
                                  currentItems.filter((_, i) => i !== idx)
                                );
                              }}
                              size="small"
                              sx={{ bgcolor: '#f5f5f5' }}
                            />
                          ))}
                        </Box>
                        {(tempPregunta.lista_elementos || []).length === 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            No hay elementos en la lista
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* CARGA_ARCHIVO */}
                    {tempPregunta.tipo === 'CARGA_ARCHIVO' && (
                      <>
                        <TextField
                          fullWidth
                          size="small"
                          label="Número máximo de archivos"
                          type="number"
                          value={tempPregunta.max_archivos || 1}
                          onChange={(e) => handlePreguntaChange('max_archivos', parseInt(e.target.value))}
                          InputProps={{ inputProps: { min: 1, max: 10 } }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Tamaño máximo (MB)"
                          type="number"
                          value={tempPregunta.max_size_mb || 100}
                          onChange={(e) => handlePreguntaChange('max_size_mb', parseInt(e.target.value))}
                          InputProps={{ inputProps: { min: 1 } }}
                        />
                      </>
                    )}

                    {/* Botones Cancelar / Añadir o Guardar */}
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleCancelEdit}
                        sx={{
                          color: '#333333',
                          borderColor: '#333333',
                          textTransform: 'none',
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleConfirmPregunta}
                        sx={{
                          bgcolor: '#0e5fa6',
                          textTransform: 'none',
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
              )}

              {/* Fase 3: Botón para agregar nueva pregunta (solo cuando no se está editando) */}
              {editingIndex === null && (
                <Box
                  onClick={handleAddPregunta}
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
        </TabPanel>

        {/* TAB 2: Vista Dinámica */}
        <TabPanel value={tabIndex} index={2}>
          <VistaConfiguratorPanel 
            etapaId={etapa.id}
            onSave={() => {
                          }}
          />
        </TabPanel>
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
