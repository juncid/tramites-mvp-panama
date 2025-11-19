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
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import type { WorkflowEtapa, WorkflowPregunta, TipoEtapa, TipoPregunta } from '../../types/workflow';

interface EtapaConfigPanelProps {
  etapa: Partial<WorkflowEtapa>;
  onSave: (etapa: Partial<WorkflowEtapa>) => void;
  onClose: () => void;
  onDelete?: () => void;
  hideCloseButton?: boolean; // Nueva prop para ocultar el botón de cerrar
}

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

const getTipoPreguntaIcon = (tipo: TipoPregunta) => {
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

export const EtapaConfigPanel: React.FC<EtapaConfigPanelProps> = ({
  etapa,
  onSave,
  onClose,
  onDelete,
  hideCloseButton = false, // Por defecto se muestra el botón
}) => {
  const [formData, setFormData] = useState<Partial<WorkflowEtapa>>(etapa);
  const [preguntas, setPreguntas] = useState<WorkflowPregunta[]>(etapa.preguntas || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // null = no editing, -1 = new question, >= 0 = editing existing
  const [tempPregunta, setTempPregunta] = useState<WorkflowPregunta | null>(null);
  const [newListItem, setNewListItem] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [preguntaError, setPreguntaError] = useState<string>('');

  useEffect(() => {
    setFormData(etapa);
    // Normalizar preguntas para asegurar que tipo, tipo_pregunta, texto y pregunta estén sincronizados
    const preguntasNormalizadas = (etapa.preguntas || []).map(p => ({
      ...p,
      tipo: p.tipo_pregunta || p.tipo,
      tipo_pregunta: p.tipo_pregunta || p.tipo,
      texto: p.pregunta || p.texto || '',
      pregunta: p.pregunta || p.texto || '',
    }));
    setPreguntas(preguntasNormalizadas);
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
      tipo: 'SELECCIONAR' as any, // Valor inicial para mostrar "Seleccionar"
      tipo_pregunta: 'SELECCIONAR' as any,
      orden: preguntas.length,
      es_obligatoria: false,
      es_visible: true,
      activo: true,
    };
    setTempPregunta(newPregunta);
    setEditingIndex(-1); // -1 indicates new question
    setPreguntaError('');
  };

  const handleEditPregunta = (index: number) => {
    const pregunta = preguntas[index];
    // Normalizar para asegurar que tipo, tipo_pregunta, texto y pregunta estén sincronizados
    const preguntaNormalizada = {
      ...pregunta,
      tipo: pregunta.tipo_pregunta || pregunta.tipo,
      tipo_pregunta: pregunta.tipo_pregunta || pregunta.tipo,
      texto: pregunta.pregunta || pregunta.texto || '',
      pregunta: pregunta.pregunta || pregunta.texto || '',
    };
    setTempPregunta(preguntaNormalizada);
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setTempPregunta(null);
    setEditingIndex(null);
    setUploadedFileName('');
    setPreguntaError('');
  };

  const handleConfirmPregunta = () => {
    if (!tempPregunta) return;

    // Validar que se haya seleccionado un tipo de pregunta
    if (!tempPregunta.tipo || tempPregunta.tipo === 'SELECCIONAR') {
      setPreguntaError('Debe seleccionar un tipo de pregunta');
      return;
    }

    setPreguntaError('');

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
    setUploadedFileName('');
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
      const tipoLabel = TIPOS_PREGUNTA.find(t => t.value === value)?.label || value;
      setTempPregunta((prev) => prev ? { 
        ...prev, 
        tipo: value as TipoPregunta, 
        tipo_pregunta: value as TipoPregunta,
        // Para REVISION_OCR, establecer automáticamente el texto como el nombre del tipo y marcar como obligatoria
        ...(value === 'REVISION_OCR' && { texto: tipoLabel, pregunta: tipoLabel, es_obligatoria: true })
      } : null);
    } else if (field === 'tipo_pregunta') {
      const tipoLabel = TIPOS_PREGUNTA.find(t => t.value === value)?.label || value;
      setTempPregunta((prev) => prev ? { 
        ...prev, 
        tipo_pregunta: value as TipoPregunta, 
        tipo: value as TipoPregunta,
        // Para REVISION_OCR, establecer automáticamente el texto como el nombre del tipo y marcar como obligatoria
        ...(value === 'REVISION_OCR' && { texto: tipoLabel, pregunta: tipoLabel, es_obligatoria: true })
      } : null);
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
          {!hideCloseButton && (
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Stack>
      </Box>

      {/* Content - Single column layout */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* Configuración Básica y Preguntas en una columna */}
        <Box sx={{ p: 2 }}>
          <Stack spacing={4}>
            {/* Configuración Básica */}
            <Box>
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
              <MenuItem value="PRESENCIAL">Presencial</MenuItem>
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

          {/* Sección PRESENCIAL - Mostrar solo cuando tipo_etapa es PRESENCIAL */}
          {formData.tipo_etapa === 'PRESENCIAL' && (
            <Box
              sx={{
                p: 2,
                border: '2px dashed #333333',
                borderRadius: '4px',
                bgcolor: 'white',
              }}
            >
              <Stack spacing={2}>
                {/* Descripción */}
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Descripción"
                  placeholder="Lorem"
                  value={formData.descripcion_presencial || ''}
                  onChange={(e) => handleChange('descripcion_presencial', e.target.value)}
                />

                {/* Documento con botón de carga */}
                <Box>
                  <TextField
                    fullWidth
                    label="Documento"
                    value={formData.documento_presencial || ''}
                    onChange={(e) => handleChange('documento_presencial', e.target.value)}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <Button
                          variant="contained"
                          component="label"
                          sx={{
                            bgcolor: '#0e5fa6',
                            '&:hover': { bgcolor: '#0a4a85' },
                            textTransform: 'none',
                            ml: 1,
                          }}
                        >
                          Cargar archivo
                          <input
                            type="file"
                            hidden
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleChange('documento_presencial', file.name);
                              }
                            }}
                          />
                        </Button>
                      ),
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    (Opcional), indicaciones para la persona que responda la pregunta
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

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

            {/* Preguntas Tradicionales */}
            <Box>
          <Box sx={{ p: 2 }}>
            <Stack spacing={3}>
              {/* Preguntas */}
              <Box>
            <Stack spacing={2}>
              {/* Fase 1: Tarjetas para preguntas guardadas - Diseño Figma */}
              {preguntas.filter((_, idx) => editingIndex !== idx).map((pregunta, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    border: '2px solid #333333',
                    borderRadius: '4px',
                    bgcolor: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  {/* Tipo de pregunta */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#333333',
                      }}
                    >
                      Tipo de pregunta
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 24,
                          height: 24,
                          border: '1px solid #333333',
                          borderRadius: '4px',
                          p: 0.5,
                        }}
                      >
                        {getTipoPreguntaIcon(pregunta.tipo)}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '16px',
                          color: '#333333',
                        }}
                      >
                        {TIPOS_PREGUNTA.find(t => t.value === pregunta.tipo)?.label || pregunta.tipo}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Pregunta */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#333333',
                      }}
                    >
                      Pregunta
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '16px',
                        color: '#4d4d4d',
                      }}
                    >
                      {pregunta.texto}
                    </Typography>
                  </Box>

                  {/* Obligatoria */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Checkbox
                      checked={pregunta.es_obligatoria}
                      disabled
                      size="small"
                      sx={{ 
                        p: 0,
                        color: '#333333',
                        '&.Mui-checked': {
                          color: '#333333',
                        },
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: '16px',
                        color: '#4d4d4d',
                      }}
                    >
                      Obligatoria
                    </Typography>
                  </Box>

                  {/* Botones de acción */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.7 },
                      }}
                      onClick={() => handleDuplicatePregunta(index)}
                    >
                      <Box sx={{ width: 16, height: 16, display: 'flex', alignItems: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '14px',
                          color: '#333333',
                        }}
                      >
                        Duplicar
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.7 },
                      }}
                      onClick={() => handleEditPregunta(index)}
                    >
                      <EditIcon sx={{ fontSize: 16, color: '#333333' }} />
                      <Typography
                        sx={{
                          fontSize: '14px',
                          color: '#333333',
                        }}
                      >
                        Editar
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.7 },
                      }}
                      onClick={() => handleDeletePregunta(index)}
                    >
                      <DeleteIcon sx={{ fontSize: 16, color: '#cc3333' }} />
                      <Typography
                        sx={{
                          fontSize: '14px',
                          color: '#cc3333',
                        }}
                      >
                        Borrar
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}

              {/* Fase 2: Formulario de edición (cuando editingIndex !== null) */}
              {editingIndex !== null && tempPregunta && (
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
                    <FormControl fullWidth size="small" error={!!preguntaError}>
                      <InputLabel>Tipo de pregunta</InputLabel>
                      <Select
                        value={tempPregunta.tipo === 'SELECCIONAR' ? 'SELECCIONAR' : (tempPregunta.tipo || 'SELECCIONAR')}
                        label="Tipo de pregunta"
                        onChange={(e) => {
                          handlePreguntaChange('tipo', e.target.value as TipoPregunta);
                          setPreguntaError('');
                        }}
                        renderValue={(selected) => {
                          if (selected === 'SELECCIONAR') {
                            return (
                              <Box sx={{ color: '#4d4d4d' }}>
                                Seleccionar
                              </Box>
                            );
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
                          <Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                            Seleccionar
                          </Box>
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
                      {preguntaError && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {preguntaError}
                        </Typography>
                      )}
                    </FormControl>

                    {/* Mostrar campos solo si hay un tipo válido seleccionado */}
                    {tempPregunta.tipo && tempPregunta.tipo !== 'SELECCIONAR' && (
                      <>
                        {/* Campo de texto - Oculto para REVISION_OCR, DATOS_CASO, DESCARGA_ARCHIVO y CARGA_ARCHIVO */}
                        {(tempPregunta.tipo !== 'REVISION_OCR' && 
                          tempPregunta.tipo !== 'DATOS_CASO' && 
                          tempPregunta.tipo !== 'DESCARGA_ARCHIVO' &&
                          tempPregunta.tipo !== 'CARGA_ARCHIVO') && (
                          <TextField
                            fullWidth
                            size="small"
                            label="Pregunta"
                            value={tempPregunta.texto}
                            onChange={(e) => handlePreguntaChange('texto', e.target.value)}
                          />
                        )}

                        {/* Checkbox Obligatoria - Oculto para REVISION_OCR, DATOS_CASO, DESCARGA_ARCHIVO y CARGA_ARCHIVO (tienen su propio checkbox) */}
                        {(tempPregunta.tipo !== 'REVISION_OCR' && 
                          tempPregunta.tipo !== 'DATOS_CASO' &&
                          tempPregunta.tipo !== 'DESCARGA_ARCHIVO' &&
                          tempPregunta.tipo !== 'CARGA_ARCHIVO') && (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={tempPregunta.es_obligatoria || false}
                                onChange={(e) => handlePreguntaChange('es_obligatoria', e.target.checked)}
                                size="small"
                              />
                            }
                            label="Obligatoria"
                          />
                        )}
                      </>
                    )}

                    {/* Campos específicos según tipo de pregunta - También solo si hay tipo seleccionado */}
                    {tempPregunta.tipo && (
                      <>
                        {/* RESPUESTA_TEXTO */}
                        {(tempPregunta.tipo === 'RESPUESTA_TEXTO' || tempPregunta.tipo === 'RESPUESTA_LARGA') && (
                      <FormControl fullWidth size="small">
                        <InputLabel>Número máximo de caracteres</InputLabel>
                        <Select
                          value={tempPregunta.max_caracteres || ''}
                          onChange={(e) => handlePreguntaChange('max_caracteres', e.target.value ? parseInt(e.target.value as string) : undefined)}
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

                    {/* LISTA */}
                    {tempPregunta.tipo === 'LISTA' && (
                      <Box>
                        <Stack spacing={1.25}>
                          {(tempPregunta.lista_elementos || []).map((item, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Checkbox size="small" disabled />
                              <TextField
                                fullWidth
                                size="small"
                                value={item}
                                onChange={(e) => {
                                  const currentItems = tempPregunta.lista_elementos || [];
                                  const newItems = [...currentItems];
                                  newItems[idx] = e.target.value;
                                  handlePreguntaChange('lista_elementos', newItems);
                                }}
                                placeholder="Elemento de la lista"
                                InputProps={{
                                  endAdornment: (
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        const currentItems = tempPregunta.lista_elementos || [];
                                        handlePreguntaChange(
                                          'lista_elementos',
                                          currentItems.filter((_, i) => i !== idx)
                                        );
                                      }}
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
                                  const currentItems = tempPregunta.lista_elementos || [];
                                  handlePreguntaChange('lista_elementos', [...currentItems, newListItem.trim()]);
                                  setNewListItem('');
                                }
                              }}
                              InputProps={{
                                endAdornment: (
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      if (newListItem.trim()) {
                                        const currentItems = tempPregunta.lista_elementos || [];
                                        handlePreguntaChange('lista_elementos', [...currentItems, newListItem.trim()]);
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
                    )}

                    {/* OPCIONES (Seleccion Simple) */}
                    {tempPregunta.tipo === 'OPCIONES' && (
                      <Box>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={tempPregunta.permite_multiple || false}
                              onChange={(e) => handlePreguntaChange('permite_multiple', e.target.checked)}
                              size="small"
                            />
                          }
                          label="Permitir selección múltiple"
                          sx={{ mb: 2 }}
                        />
                        
                        {(tempPregunta.lista_elementos || []).map((opcion, index) => (
                          <TextField
                            key={index}
                            fullWidth
                            size="small"
                            label={`Opción ${index + 1}`}
                            value={opcion}
                            onChange={(e) => {
                              const currentItems = tempPregunta.lista_elementos || [];
                              const newItems = [...currentItems];
                              newItems[index] = e.target.value;
                              handlePreguntaChange('lista_elementos', newItems);
                            }}
                            sx={{ mb: 1 }}
                            InputProps={{
                              endAdornment: (
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    const currentItems = tempPregunta.lista_elementos || [];
                                    handlePreguntaChange(
                                      'lista_elementos',
                                      currentItems.filter((_, i) => i !== index)
                                    );
                                  }}
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
                          onClick={() => {
                            const currentItems = tempPregunta.lista_elementos || [];
                            handlePreguntaChange('lista_elementos', [...currentItems, '']);
                          }}
                        >
                          <AddIcon sx={{ fontSize: 16 }} />
                          <Typography variant="body2">Añadir opción</Typography>
                        </Box>
                      </Box>
                    )}

                    {/* CARGA_ARCHIVO */}
                    {tempPregunta.tipo === 'CARGA_ARCHIVO' && (
                      <Box>
                        <TextField
                          fullWidth
                          size="small"
                          label="Pregunta"
                          value={tempPregunta.texto}
                          onChange={(e) => handlePreguntaChange('texto', e.target.value)}
                          placeholder="Documento antecedentes ..."
                          sx={{ mb: 1 }}
                        />

                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={tempPregunta.es_obligatoria || false}
                              onChange={(e) => handlePreguntaChange('es_obligatoria', e.target.checked)}
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
                            value={tempPregunta.ayuda || ''}
                            onChange={(e) => handlePreguntaChange('ayuda', e.target.value)}
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
                            value={tempPregunta.max_archivos || 1}
                            label="Número máximo de archivos"
                            onChange={(e) => handlePreguntaChange('max_archivos', e.target.value as number)}
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
                            value={tempPregunta.max_size_mb || 100}
                            label="Tamaño máximo"
                            onChange={(e) => handlePreguntaChange('max_size_mb', e.target.value as number)}
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
                                    console.log('Archivo seleccionado:', file.name);
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
                      </Box>
                    )}

                    {/* DESCARGA_ARCHIVO */}
                    {tempPregunta.tipo === 'DESCARGA_ARCHIVO' && (
                      <Box>
                        <TextField
                          fullWidth
                          size="small"
                          label="Pregunta"
                          value={tempPregunta.texto}
                          onChange={(e) => handlePreguntaChange('texto', e.target.value)}
                          placeholder="Lorem ipsum"
                          sx={{ mb: 2 }}
                        />

                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={tempPregunta.es_obligatoria || false}
                              onChange={(e) => handlePreguntaChange('es_obligatoria', e.target.checked)}
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
                                  console.log('Archivo seleccionado:', file.name);
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
                    )}

                    {/* DATOS_CASO */}
                    {tempPregunta.tipo === 'DATOS_CASO' && (
                      <Box>
                        <TextField
                          fullWidth
                          size="small"
                          label="Pregunta"
                          value={tempPregunta.texto}
                          onChange={(e) => handlePreguntaChange('texto', e.target.value)}
                          placeholder="Data a incluir:"
                          sx={{ mb: 2 }}
                        />

                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={tempPregunta.es_obligatoria || false}
                              onChange={(e) => handlePreguntaChange('es_obligatoria', e.target.checked)}
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
                                  checked={(tempPregunta.campos_caso || []).includes(campo.value)}
                                  onChange={(e) => {
                                    const currentCampos = tempPregunta.campos_caso || [];
                                    const newCampos = e.target.checked
                                      ? [...currentCampos, campo.value]
                                      : currentCampos.filter(c => c !== campo.value);
                                    handlePreguntaChange('campos_caso', newCampos);
                                  }}
                                />
                              }
                              label={campo.label}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* REVISION_OCR */}
                    {tempPregunta.tipo === 'REVISION_OCR' && (
                      <Box>
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                          <InputLabel>Etapa origen de documentos</InputLabel>
                          <Select
                            value={tempPregunta.etapa_origen_id || ''}
                            label="Etapa origen de documentos"
                            onChange={(e) => handlePreguntaChange('etapa_origen_id', e.target.value)}
                            displayEmpty
                            renderValue={(selected) => {
                              if (!selected) {
                                return (
                                  <Typography sx={{ color: '#4d4d4d', fontSize: '16px' }}>
                                    Recolectar requisitos del trámite PPSH y los anexo en el sistema
                                  </Typography>
                                );
                              }
                              const pregunta = preguntas.find(p => p.codigo === selected);
                              return pregunta?.texto || selected;
                            }}
                          >
                            {preguntas
                              .filter(p => p.tipo === 'CARGA_ARCHIVO')
                              .map((p, idx) => (
                                <MenuItem key={idx} value={p.codigo}>
                                  {p.texto}
                                </MenuItem>
                              ))}
                            {preguntas.filter(p => p.tipo === 'CARGA_ARCHIVO').length === 0 && (
                              <MenuItem value="" disabled>
                                <em>No hay etapas de carga de archivos disponibles</em>
                              </MenuItem>
                            )}
                          </Select>
                        </FormControl>
                      </Box>
                    )}

                    {/* REVISION_MANUAL_DOCUMENTOS */}
                    {tempPregunta.tipo === 'REVISION_MANUAL_DOCUMENTOS' && (
                      <Box>
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                          <InputLabel>Etapa origen de documentos</InputLabel>
                          <Select
                            value={tempPregunta.etapa_origen_id || ''}
                            label="Etapa origen de documentos"
                            onChange={(e) => handlePreguntaChange('etapa_origen_id', e.target.value)}
                          >
                            {preguntas
                              .filter(p => p.tipo === 'CARGA_ARCHIVO' || p.tipo === 'REVISION_OCR')
                              .map((p, idx) => (
                                <MenuItem key={idx} value={p.codigo}>
                                  {p.texto}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </Box>
                    )}

                    {/* SELECCION_FECHA */}
                    {tempPregunta.tipo === 'SELECCION_FECHA' && (
                      <Box>
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                          <InputLabel>Origen agenda selección de fechas</InputLabel>
                          <Select
                            value={tempPregunta.agenda_origen_id || ''}
                            label="Origen agenda selección de fechas"
                            onChange={(e) => handlePreguntaChange('agenda_origen_id', e.target.value)}
                          >
                            <MenuItem value="AGENDA_PPSH">Agenda PPSH</MenuItem>
                            <MenuItem value="AGENDA_GENERAL">Agenda General</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    )}
                      </>
                    )}

                    {/* Botones Cancelar / Añadir o Guardar */}
                    <Stack direction="row" spacing={3} justifyContent="flex-start">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleCancelEdit}
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
                        onClick={handleConfirmPregunta}
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
            </Box>
          </Stack>
        </Box>
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
